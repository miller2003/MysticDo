/**
 * MysticDo — Cloudflare Worker（静态资产 + 边缘逻辑）
 *
 * 由原 Cloudflare Pages Functions（已随转向 Workers 删除）合并而来，三段职责：
 *
 *   1) 主机名规范化 —— www → apex 301（GSC 收录口径统一）
 *   2) Markdown for Agents —— Accept: text/markdown 时在边缘把 HTML 转成 markdown
 *   3) /api/postback —— Impact (TUNE) S2S 回调 → PostHog
 *
 * 其余请求一律转交静态资产层（env.ASSETS）：
 *   · html_handling = "auto-trailing-slash" → /psychic/ ↔ /psychic/index.html
 *   · not_found_handling = "404-page"      → 缺路径返回 /404.html（404 状态码）
 *
 * ⚠️ 两条硬约束与原中间件一致：
 *   · 转换绝不能把页面弄坏 —— 任何异常都退回原始 HTML
 *   · Workers 免费版 10ms CPU/请求 —— 体积上限 + 异常兜底，超限退回 HTML
 */

import { convertPage } from './_lib/html-to-md.js';

const APEX = 'mysticdo.com';
const MD_TYPE = 'text/markdown; charset=utf-8';

/**
 * 超过这个体积就放弃转换，退回 HTML（原 _middleware.js 实测结论）：
 * 免费版 CPU 上限 10ms/请求，实测约每 1KB 0.04ms，150KB → 最差约 5.5ms，留约 45% 余量。
 */
const MAX_CONVERT_BYTES = 150 * 1024;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/* ═══════════════ 1+2. 主机名规范化 & Markdown for Agents（自 _middleware.js 迁移）═══════════════ */

/** 不该参与内容协商的路径：联盟跳转、API、带扩展名的静态资源、well-known */
function isNegotiable(pathname) {
  if (pathname.startsWith('/go/')) return false;
  if (pathname.startsWith('/api/')) return false;
  if (pathname.startsWith('/.well-known/')) return false;
  const last = pathname.split('/').pop() || '';
  if (last.includes('.')) return false;   // 例如 /sitemap.xml、/favicon.ico
  return true;
}

/**
 * 请求方是否明确想要 markdown。
 * 按 q 值比较，只有 markdown 的可接受度**不低于** html 才协商 ——
 * 普通浏览器发的是 text/html,... 自然不会命中。
 */
function wantsMarkdown(request) {
  const a = request.headers.get('Accept') || '';
  if (!/text\/markdown/i.test(a)) return false;
  const re = (type) => new RegExp(type.replace('/', '\\/'), 'i');
  const q = (type) => {
    const m = a.match(new RegExp(type.replace('/', '\\/') + '\\s*;\\s*q=([0-9.]+)', 'i'));
    if (m) return parseFloat(m[1]);
    return re(type).test(a) ? 1 : 0;
  };
  return q('text/markdown') >= q('text/html');
}

/** 保证响应带 Vary: Accept —— 内容协商的正确性前提，缺了会让缓存串味 */
function mergeVary(h) {
  const v = h.get('Vary');
  if (!v) h.set('Vary', 'Accept');
  else if (!/(^|,)\s*Accept\s*($|,)/i.test(v)) h.set('Vary', v + ', Accept');
  return h;
}

function withVary(res) {
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: mergeVary(new Headers(res.headers)) });
}

/**
 * 用已经读出来的明文重新构造 HTML 响应。
 * ⚠️ 不能复用原 res —— 它的 body 已被 res.text() 消费，
 * 再用 `new Response(res.body, …)` 会抛 "body object should not be disturbed"。
 */
function htmlResponse(res, html) {
  const h = new Headers(res.headers);
  h.delete('Content-Length');
  h.delete('Content-Encoding');
  h.delete('ETag');
  return new Response(html, { status: res.status, headers: mergeVary(h) });
}

/** 静态资产服务（含 markdown 内容协商），等价于原 _middleware 的 onRequest 主体 */
async function serveAsset(request, env) {
  const url = new URL(request.url);

  const negotiate =
    request.method === 'GET' &&
    wantsMarkdown(request) &&
    isNegotiable(url.pathname);

  if (!negotiate) return withVary(await env.ASSETS.fetch(request));

  // 去掉 Accept-Encoding 再取一次，确保拿到**未压缩**明文；
  // 否则 response.text() 会得到 gzip 字节流。取不到就退回默认请求。
  let res;
  try {
    const bare = new Request(request.url, {
      method: 'GET',
      headers: new Headers([...request.headers].filter(([k]) => k.toLowerCase() !== 'accept-encoding')),
    });
    res = await env.ASSETS.fetch(bare);
  } catch {
    res = await env.ASSETS.fetch(request);
  }

  const ctype = res.headers.get('Content-Type') || '';
  if (!res.ok || !ctype.includes('text/html') || res.headers.get('Content-Encoding')) {
    return withVary(res);
  }

  let html;
  try {
    html = await res.text();
  } catch {
    // 读不出明文（极少见）：改用原始请求再取一次，保证仍能返回 HTML
    try {
      return withVary(await env.ASSETS.fetch(request));
    } catch {
      return new Response('Upstream error', { status: 502, headers: { Vary: 'Accept' } });
    }
  }

  if (html.length > MAX_CONVERT_BYTES) return htmlResponse(res, html);

  let markdown = '';
  let words = 0;
  try {
    const out = convertPage(html, { url: request.url });
    markdown = out.markdown;
    words = out.words;
  } catch {
    // 转换失败：原样返回 HTML，绝不让协商把页面弄坏
    return htmlResponse(res, html);
  }
  if (!markdown || words < 20) return htmlResponse(res, html);

  const headers = new Headers(res.headers);
  headers.set('Content-Type', MD_TYPE);
  headers.set('Vary', 'Accept');
  headers.set('Cache-Control', 'public, max-age=3600');
  headers.set('X-Markdown-For-Agents', '1');
  headers.delete('Content-Length');
  headers.delete('Content-Encoding');
  headers.delete('ETag');

  return new Response(markdown, { status: 200, headers });
}

/* ═══════════════ 3. /api/postback —— Impact (TUNE) S2S → PostHog（自 functions/api/postback.js 迁移）═══════════════ */

/** Impact 广告单 ID → 平台名（offer_id 以联盟后台实际配置为准） */
const OFFER_TO_PLATFORM = {
  '221': 'Keen',
  '191': 'Kasamba',
  '30': 'PurpleGarden',
};

/** 从 advertiser / offer 名称里兜底识别平台 */
function platformFromName(name) {
  const s = String(name || '').toLowerCase();
  if (s.indexOf('kasamba') > -1) return 'Kasamba';
  if (s.indexOf('keen') > -1) return 'Keen';
  if (s.indexOf('purple') > -1) return 'PurpleGarden';
  return null;
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

async function collectParams(request) {
  const url = new URL(request.url);
  const out = {};
  for (const [k, v] of url.searchParams.entries()) out[k] = v;
  if (request.method === 'POST') {
    try {
      const ct = (request.headers.get('content-type') || '').toLowerCase();
      if (ct.includes('application/json')) {
        Object.assign(out, await request.json());
      } else {
        const text = await request.text();
        for (const [k, v] of new URLSearchParams(text).entries()) out[k] = v;
      }
    } catch (_) {}
  }
  return out;
}

async function handlePostback(request, env) {
  const p = await collectParams(request);

  // ── 参数解析（兼容多种命名）──────────────────────────────────────────
  const clickId =
    p.click_id || p.clickid || p.sub_id || p.aff_sub2 || p.aff_sub || '';
  const transactionId =
    p.transaction_id || p.transactionId || p.txn_id || p.order_id || p.conversion_id || 'unknown';

  // ── 金额解析：所有金额类宏都记进 amount_macros，便于 ?dry=1 对照哪个才是真实佣金
  const toNum = (v) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  };
  const amountMacros = {
    payout: toNum(p.payout),
    amount: toNum(p.amount),
    commission: toNum(p.commission),
    sale_amount: toNum(p.sale_amount),
    order_amount: toNum(p.order_amount),
    revenue: toNum(p.revenue),
    currency: p.currency || p.currency_code || null,
  };
  // commission 语义上就是"我们赚到的"，若联盟侧提供就优先用它；
  // 否则退回 payout，与改造前行为一致。
  let revenueSource = 'payout';
  let payout = amountMacros.payout;
  if (amountMacros.commission !== null) {
    payout = amountMacros.commission;
    revenueSource = 'commission';
  }
  if (payout === null) {
    payout = 0;
    revenueSource = 'none';
  }

  const status = String(p.status || p.conversion_status || '').toLowerCase();
  const approved = status === '' || status === 'approved' || status === '1' || status === 'true';
  const isDry = p.dry === '1' || p.__diag === '1';

  // 类型判定：优先联盟侧显式声明（conversion_type / ctype），否则按金额猜
  const declared = String(p.conversion_type || p.ctype || '').toLowerCase();
  let conversionType;
  if (declared === 'lead' || declared === 'registration' || declared === 'signup' || declared === 'sign_up') {
    conversionType = 'lead';
  } else if (declared === 'sale' || declared === 'paid' || declared === 'purchase') {
    conversionType = 'sale';
  } else {
    conversionType = payout > 0 ? 'sale' : 'lead';
  }

  const posthogKey = env.PUBLIC_POSTHOG_KEY;
  const posthogHost = env.PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

  // 平台识别：优先 offer_id，其次广告主/广告单名称（dry 模式也要显示，便于核对）
  const offerId = String(p.offer_id || p.offerId || p.campaign_id || p.campaignId || '');
  const advertiserName = p.advertiser_name || p.advertiserName || p.advertiser || '';
  const offerName = p.offer_name || p.offerName || '';
  const platform =
    OFFER_TO_PLATFORM[offerId] ||
    platformFromName(advertiserName) ||
    platformFromName(offerName) ||
    null;

  // ── 自检模式：不写事件，只回报链路状态 ───────────────────────────────
  if (isDry) {
    return json({
      ok: true,
      dry_run: true,
      has_posthog_key: !!posthogKey,
      posthog_host: posthogHost,
      parsed: { click_id: clickId || null, person_id: clickId ? String(clickId).split('.')[0] : null, click_token: String(clickId || '').indexOf('.') > -1 ? String(clickId).split('.').slice(1).join('.') : null, transaction_id: transactionId, payout, revenue_source: revenueSource, amount_macros: amountMacros, conversion_type: conversionType, declared_type: declared || null, platform, offer_id: offerId || null, status: status || 'unspecified' },
      hint: '把 amount_macros 的每个值跟 Impact 后台同一笔的「支出」对照，就能确定哪个宏是真实佣金；确认后可用 &commission={commission} 让它成为 revenue。',
      raw_params: p,
      note: 'dry=1 只做诊断，不写入 PostHog。去掉 dry 参数即为真实上报。',
    });
  }

  if (!posthogKey) {
    return json({ ok: false, error: 'Missing PUBLIC_POSTHOG_KEY in environment' }, 500);
  }

  // 拆 `<人ID>.<点击令牌>`：前半段挂人物档案，后半段用于定位具体那一次点击
  let personId = clickId || '';
  let clickToken = null;
  if (personId.indexOf('.') > -1) {
    const parts = personId.split('.');
    if (parts[0]) {
      personId = parts[0];
      clickToken = parts.slice(1).join('.') || null;
    }
  }

  // ── 认不出人：不再丢弃，转为可观测的孤儿事件 ─────────────────────────
  //   1) 完全没带 click_id
  //   2) 带的是前端兜底的 `anon-<随机>`（SDK 未就绪时的产物）
  const orphan = !clickId || personId.indexOf('anon-') === 0;

  const distinctId = orphan ? `orphan-${transactionId}-${conversionType}` : personId;

  const properties = {
    distinct_id: distinctId,
    revenue: payout,
    revenue_source: revenueSource,
    amount_macros: amountMacros,
    transaction_id: transactionId,
    conversion_type: conversionType,
    platform,
    offer_id: offerId || null,
    advertiser_name: advertiserName || null,
    offer_name: offerName || null,
    currency: p.currency || p.currency_code || null,
    status: status || 'unspecified',
    approved,
    orphan,
    sub_id: clickId || null,
    click_token: clickToken,
    $source: 'tune_s2s_postback',
    raw_params: p,
    received_at: new Date().toISOString(),
    $insert_id: `md-pb-${transactionId}-${conversionType}-${payout}`,
  };

  // 只在能真正认出人时写人物属性，避免孤儿事件生成垃圾用户档案。
  if (!orphan) {
    properties.$set = {
      md_converted: true,
      md_last_conversion_type: conversionType,
      md_last_conversion_platform: platform,
      md_last_conversion_payout: payout,
      md_last_transaction_id: transactionId,
      md_last_conversion_at: new Date().toISOString(),
      md_last_click_token: clickToken,
    };
    properties.$set_once = { md_first_conversion_at: new Date().toISOString() };
  }

  const eventName = orphan ? 'Postback_Orphan' : 'Order_Converted';

  const posthogEvent = {
    api_key: posthogKey,
    event: eventName,
    properties,
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch(`${posthogHost}/capture/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(posthogEvent),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error('[postback] PostHog ingest failed:', response.status, detail);
      return json({ ok: false, error: 'upstream_failed', status: response.status, detail: detail.slice(0, 300) }, 502);
    }

    return json({
      ok: true,
      recorded: true,
      event: eventName,
      conversion_type: conversionType,
      platform,
      revenue: payout,
      transaction_id: transactionId,
      click_token: clickToken,
      attributable: !orphan,
      warning: orphan ? 'click_id 缺失，已记入 Postback_Orphan 供排查' : undefined,
    });
  } catch (error) {
    console.error('[postback] network error:', error);
    return json({ ok: false, error: 'internal_error', detail: String(error).slice(0, 200) }, 500);
  }
}

/* ═══════════════ 入口 ═══════════════ */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();

    // 1) 主机名规范化：只允许 apex 与预览域（*.workers.dev / 本地调试）直连
    const isApex = host === APEX;
    const isPreview =
      host.endsWith('.workers.dev') ||
      host === 'localhost' || host === '127.0.0.1';

    if (!isApex && !isPreview) {
      url.hostname = APEX;
      url.protocol = 'https:';
      return Response.redirect(url.toString(), 301);
    }

    // 2) API 路由：S2S postback
    if (url.pathname === '/api/postback' || url.pathname === '/api/postback/') {
      if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
      if (request.method === 'GET' || request.method === 'POST') return handlePostback(request, env);
      return json({ ok: false, error: 'method_not_allowed' }, 405);
    }

    // 3) 其余请求 → 静态资产（含 Markdown for Agents 协商）
    return serveAsset(request, env);
  },
};
