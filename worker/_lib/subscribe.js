/**
 * MysticDo — /api/subscribe 与 /api/contact
 *
 * 为什么需要这一层：静态站点不能安全地直接调用第三方邮件 API ——
 * 密钥会暴露给每一个访客。Worker 是全站唯一入口，正好在这里做代理：
 *
 *   订阅表单 → POST /api/subscribe（同源，无 CORS 问题）
 *            → Worker 校验 → MailerLite API（密钥存在服务端 Secret）
 *
 *   联系表单 → POST /api/contact
 *            → Worker 校验 → Cloudflare send_email binding（发到站主邮箱）
 *
 * 两条硬约束（与 worker/index.js 一致）：
 *   · 任何异常都必须就地兜底，绝不能把静态页面弄坏。
 *   · 未配置密钥 / binding 时优雅降级（返回 not_configured），
 *     前端据此显示诚实文案，而不是假装成功。
 */

const MAILERLITE_SUBSCRIBERS = 'https://connect.mailerlite.com/api/subscribers';
const UPSTREAM_TIMEOUT_MS = 8000;

const MAX_EMAIL = 254;
const MAX_SHORT = 64;
const MAX_NAME = 120;
const MAX_MESSAGE = 5000;
const MAX_BODY_BYTES = 16 * 1024;

/* RFC 2821 意义上的宽松校验：够挡住手滑与明显垃圾，不做过度限制。 */
const EMAIL_RE = /^[^\s@,;:<>"()[\]\\]+@[^\s@.]+(?:\.[^\s@.]+)+$/;

function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extra,
    },
  });
}

/** 去掉控制字符并限长：同时挡掉邮件头注入与日志污染。 */
function clean(value, max) {
  return String(value == null ? '' : value)
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .trim()
    .slice(0, max);
}

function validEmail(s) {
  return s.length >= 6 && s.length <= MAX_EMAIL && EMAIL_RE.test(s);
}

/**
 * 蜜罐：真实表单里没有 company / website 字段，机器人会顺手填。
 * 命中就假装成功、什么也不做 —— 不给对方任何可用于探测的反馈。
 */
function isHoneypot(body) {
  return Boolean(clean(body.company, 8) || clean(body.website, 8));
}

async function readJson(request) {
  const len = Number(request.headers.get('Content-Length') || 0);
  if (len > MAX_BODY_BYTES) return { error: 'payload_too_large' };
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) return { error: 'invalid_body' };
    return { body };
  } catch {
    return { error: 'invalid_body' };
  }
}

function timeoutSignal() {
  try {
    return AbortSignal.timeout(UPSTREAM_TIMEOUT_MS);
  } catch {
    return undefined;
  }
}

/**
 * 把邮箱写进 MailerLite。
 * 注意：自定义字段（intent / format）必须先在 MailerLite 账号里创建，
 * 否则上游返回 422 —— 此时自动去掉字段重试一次：订阅本身不该因为
 * 可选的分类信息而失败。
 */
async function addSubscriber(env, { email, intent, format }) {
  const key = env.MAILERLITE_API_KEY;
  if (!key) return { ok: false, error: 'not_configured' };

  const fields = {};
  if (intent) fields.intent = intent;
  if (format) fields.format = format;

  const groups = env.MAILERLITE_GROUP_ID ? [String(env.MAILERLITE_GROUP_ID)] : undefined;

  const send = (withFields) => {
    const payload = { email };
    if (groups) payload.groups = groups;
    if (withFields && Object.keys(fields).length) payload.fields = fields;
    return fetch(MAILERLITE_SUBSCRIBERS, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + key,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      signal: timeoutSignal(),
    });
  };

  let res;
  try {
    res = await send(true);
    if (res.status === 422 && Object.keys(fields).length) {
      res = await send(false);
    }
  } catch {
    return { ok: false, error: 'upstream_unreachable' };
  }

  if (!res.ok) return { ok: false, error: 'upstream_error', status: res.status };
  return { ok: true };
}

export async function handleSubscribe(request, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { Allow: 'POST, OPTIONS' } });
  }
  if (request.method !== 'POST') {
    return json({ ok: false, error: 'method_not_allowed' }, 405, { Allow: 'POST, OPTIONS' });
  }

  const parsed = await readJson(request);
  if (parsed.error) {
    return json({ ok: false, error: parsed.error }, parsed.error === 'payload_too_large' ? 413 : 400);
  }

  const body = parsed.body;
  const email = clean(body.email, MAX_EMAIL);
  if (!validEmail(email)) return json({ ok: false, error: 'invalid_email' }, 400);

  if (isHoneypot(body)) return json({ ok: true, subscribed: false });

  const result = await addSubscriber(env, {
    email,
    intent: clean(body.intent, MAX_SHORT),
    format: clean(body.format, MAX_SHORT),
  });

  if (!result.ok) {
    const status = result.error === 'not_configured' ? 503 : 502;
    return json({ ok: false, error: result.error, upstreamStatus: result.status }, status);
  }
  return json({ ok: true, subscribed: true });
}

/**
 * 联系表单 → 站主邮箱，走 Cloudflare send_email binding。
 * 未配置时返回 ok:true / delivered:false —— 前端据此保持"暂存在本机"的诚实提示，
 * 而不是让访客以为消息已经发出去了。
 */
export async function handleContact(request, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { Allow: 'POST, OPTIONS' } });
  }
  if (request.method !== 'POST') {
    return json({ ok: false, error: 'method_not_allowed' }, 405, { Allow: 'POST, OPTIONS' });
  }

  const parsed = await readJson(request);
  if (parsed.error) {
    return json({ ok: false, error: parsed.error }, parsed.error === 'payload_too_large' ? 413 : 400);
  }

  const body = parsed.body;
  const email = clean(body.email, MAX_EMAIL);
  const message = clean(body.message, MAX_MESSAGE);
  if (!validEmail(email)) return json({ ok: false, error: 'invalid_email' }, 400);
  if (message.length < 5) return json({ ok: false, error: 'message_too_short' }, 400);

  if (isHoneypot(body)) return json({ ok: true, delivered: false });

  const binding = env.CONTACT_EMAIL;
  const to = env.CONTACT_TO;
  if (!binding || typeof binding.send !== 'function' || !to) {
    return json({ ok: true, delivered: false, reason: 'not_configured' });
  }

  const name = clean(body.name, MAX_NAME) || '(no name)';
  const type = clean(body.type, MAX_SHORT) || 'Other';
  const page = clean(body.page, 200);
  const text = [
    'New message from the MysticDo contact form',
    '',
    'Type:  ' + type,
    'Name:  ' + name,
    'Email: ' + email,
    page ? 'Page:  ' + page : '',
    'When:  ' + new Date().toISOString(),
    '',
    '---',
    '',
    message,
  ]
    .filter(Boolean)
    .join('\n');

  try {
    await binding.send({
      to,
      from: { email: env.CONTACT_FROM || 'noreply@mysticdo.com', name: 'MysticDo' },
      replyTo: email,
      subject: '[MysticDo] ' + type + ' — ' + name,
      text,
    });
  } catch {
    return json({ ok: false, error: 'send_failed' }, 502);
  }

  return json({ ok: true, delivered: true });
}
