/**
 * MysticDo — Cloudflare Worker（静态资产 + 边缘逻辑）
 *
 * 职责分四层，全部在一个入口里按顺序判定：
 *
 *   1) 主机名规范化 —— www → apex 301（GSC 收录口径统一）
 *   2) 智能体发现层 —— /.well-known/*、/auth.md、/api/health
 *   3) 智能体接口层 —— /mcp（MCP）、/oauth/*（OAuth 2.0）
 *   4) 内容层 —— Markdown for Agents 内容协商 + Link 响应头（RFC 8288）
 *
 * 其余请求一律转交静态资产层（env.ASSETS）：
 *   · html_handling = "auto-trailing-slash" → /psychic/ ↔ /psychic/index.html
 *   · not_found_handling = "404-page"      → 缺路径返回 /404.html（404 状态码）
 *
 * ⚠️ 三条硬约束：
 *   · Worker 是整个站点的唯一入口，任何新增分支都必须异常安全 ——
 *     发现层与接口层的异常一律就地兜底，**绝不把静态页面弄坏**。
 *   · Markdown 转换绝不能把页面弄坏 —— 任何异常都退回原始 HTML。
 *   · Workers 免费版 10ms CPU/请求 —— 体积上限 + 异常兜底，超限退回 HTML。
 *
 * 发现层文档的唯一事实源是 worker/_lib/agent-discovery.js；
 * 这里只做路由与响应头，不内联任何文档内容。
 */

import { convertPage } from './_lib/html-to-md.js';
import {
  ORIGIN,
  AUTH_MD,
  openapiDocument,
  apiCatalog,
  aiCatalog,
  mcpServerCard,
  oauthAuthorizationServerMetadata,
  oauthProtectedResourceMetadata,
  jwks,
} from './_lib/agent-discovery.js';
import { skillsIndex, findSkill } from './_lib/agent-skills.js';
import { handleMcp } from './_lib/mcp.js';
import { handleSubscribe, handleContact } from './_lib/subscribe.js';
import { handleRegister, handleAuthorize, handleToken, handleRevoke } from './_lib/oauth.js';

const APEX = 'mysticdo.com';
const MD_TYPE = 'text/markdown; charset=utf-8';

/**
 * 超过这个体积就放弃转换，退回 HTML（原 _middleware.js 实测结论）：
 * 免费版 CPU 上限 10ms/请求，实测约每 1KB 0.04ms，150KB → 最差约 5.5ms，留约 45% 余量。
 */
const MAX_CONVERT_BYTES = 150 * 1024;

/**
 * RFC 8288 Link 头：把本站的机器可读资源通告给智能体。
 * 关系类型全部取自已注册集合（RFC 8631 定义 service-desc / service-doc /
 * service-meta / status；api-catalog 由 RFC 9727 §3 定义；
 * describedby 由 RFC 8288 §2.1.2 定义，是 llms.txt v2 提案指定的 llms.txt 关系）。
 * 只在 HTML 响应上发 —— 静态资源（图片、字体、CSS）不需要。
 *
 * ⚠️ `/llms.txt` 故意挂两条 rel：service-doc 是既有的机器发现口径
 * （scripts/test-worker-agent-routes.mjs 与 scripts/verify-agent-surface.py
 * 都按字面量断言它），describedby 是 llms.txt v2 提案要求的口径。删任一条都会掉测试。
 */
const LINK_HEADER = [
  '</.well-known/api-catalog>; rel="api-catalog"',
  '</.well-known/openapi.json>; rel="service-desc"',
  '</llms.txt>; rel="service-doc"',
  '</llms.txt>; rel="describedby"',
  '</.well-known/ai-catalog.json>; rel="service-meta"',
  '</api/health>; rel="status"',
].join(', ');

const CORS_ANY = { 'Access-Control-Allow-Origin': '*' };

/* ═══════════════ 1b. 安全头 + 资产缓存策略（2026-09-21 审计新增） ═══════════════ */

/**
 * 安全响应头 — 对站点所有响应统一生效（静态页、JSON 文档、OAuth、跳转）。
 * 只追加、不覆盖：若上游（如 markdown 孪生体的 X-Robots-Tag）已有同名头则保留。
 * 不设 CSP：站点有内联脚本（gtag 配置、 speculation rules），上线 CSP 需要
 * Report-Only 观察期，避免一刀切弄坏分析 —— 留待后续单独评审。
 */
const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'SAMEORIGIN',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

/** 在响应离开 Worker 前补齐安全头（幂等：已有则不覆盖）。 */
function harden(res) {
  const h = new Headers(res.headers);
  for (const k of Object.keys(SECURITY_HEADERS)) {
    if (!h.has(k)) h.set(k, SECURITY_HEADERS[k]);
  }
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
}

/**
 * 静态资产缓存策略。资产层默认 max-age=0（每次回访都条件请求），
 * 对不变式资源是纯浪费：
 *   · 字体：文件名自带版本（selfhost-fonts.py 产物）→ 一年 immutable
 *   · 图片：内容基本不变 → 7 天
 *   · CSS/JS：未做内容指纹 → 1 天（改版最多滞后一天，安全窗口）
 * HTML 保持 must-revalidate 不动（内容页必须即时更新）。
 */
const ASSET_TTL_RULES = [
  [/^font\//, 'public, max-age=31536000, immutable'],
  [/^image\//, 'public, max-age=604800'],
  [/^text\/css/, 'public, max-age=86400'],
  [/javascript/, 'public, max-age=86400'],
];

/* ═══════════════ 1. 通用响应工具 ═══════════════ */

/** 保证响应带 Vary: Accept —— 内容协商的正确性前提，缺了会让缓存串味 */
function mergeVary(h) {
  const v = h.get('Vary');
  if (!v) h.set('Vary', 'Accept');
  else if (!/(^|,)\s*Accept\s*($|,)/i.test(v)) h.set('Vary', v + ', Accept');
  return h;
}

/**
 * 复制响应头，补 Vary，并在 HTML 上补 Link（RFC 8288）。
 *
 * 传入 url 时，HTML 正文页会额外通告自己的 markdown 孪生体
 * （llms.txt v2 提案的发现机制：rel="alternate"; type="text/markdown"）——
 * 智能体不必猜测约定，读响应头即知 markdown 版本在哪。
 */
function decorate(res, url) {
  const h = mergeVary(new Headers(res.headers));
  const ctype = h.get('Content-Type') || '';
  // 静态资产缓存策略（HTML 不匹配任何规则，保持原 must-revalidate）
  for (const [re, cc] of ASSET_TTL_RULES) {
    if (re.test(ctype)) { h.set('Cache-Control', cc); break; }
  }
  if (!h.has('Link') && (ctype.includes('text/html') || ctype.includes('text/markdown'))) {
    h.set('Link', LINK_HEADER);
  }
  if (url && ctype.includes('text/html')) {
    const twin = markdownTwinHref(url.pathname);
    const current = h.get('Link') || '';
    if (twin && !current.includes('<' + twin + '>')) {
      h.set('Link', [current, '<' + twin + '>; rel="alternate"; type="text/markdown"'].filter(Boolean).join(', '));
    }
  }
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
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

function jsonDoc(body, status = 200, contentType = 'application/json; charset=utf-8', extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
      ...CORS_ANY,
      ...extra,
    },
  });
}

function textDoc(body, contentType = MD_TYPE) {
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
      ...CORS_ANY,
    },
  });
}

/* ═══════════════ 2. 智能体发现层 + 接口层 ═══════════════ */

/**
 * 返回 Response 表示已处理；返回 null 表示该路径不归这里管。
 * 调用方负责异常兜底。
 */
async function routeAgentSurface(request, env, pathname) {
  const method = request.method;

  /* ---- 2.1 发现文档 ---- */
  switch (pathname) {
    case '/.well-known/api-catalog':
      return jsonDoc(apiCatalog(), 200, 'application/linkset+json; charset=utf-8');

    case '/.well-known/ai-catalog.json':
      return jsonDoc(aiCatalog());

    case '/.well-known/openapi.json':
      return jsonDoc(openapiDocument());

    case '/.well-known/mcp/server-card.json':
      return jsonDoc(mcpServerCard());

    case '/.well-known/oauth-authorization-server':
      return jsonDoc(oauthAuthorizationServerMetadata());

    case '/.well-known/oauth-protected-resource':
      return jsonDoc(oauthProtectedResourceMetadata());

    case '/.well-known/jwks.json':
      return jsonDoc(jwks(), 200, 'application/json; charset=utf-8', { 'Cache-Control': 'public, max-age=86400' });

    case '/.well-known/agent-skills/index.json':
      // digest 由服务端在请求时按实际字节计算，索引与制品不可能不一致。
      return jsonDoc(await skillsIndex());

    case '/auth.md':
      return textDoc(AUTH_MD);

    case '/api/health':
      return jsonDoc(
        {
          status: 'ok',
          service: 'mysticdo',
          origin: ORIGIN,
          time: new Date().toISOString(),
          checks: {
            content: 'ok',
            markdownNegotiation: 'ok',
            mcp: 'ok',
            // 邮件配置状态：站主配好 Secret 后，这里会从 not_configured 变成 configured。
            subscribe: env.MAILERLITE_API_KEY ? 'configured' : 'not_configured',
            contact: env.CONTACT_EMAIL && env.CONTACT_TO ? 'configured' : 'not_configured',
          },
        },
        200,
        'application/json; charset=utf-8',
        { 'Cache-Control': 'no-store' },
      );

    default:
      break;
  }

  /* ---- 2.2 邮件接口：订阅（→ MailerLite）+ 联系表单（→ send_email binding） ---- */
  if (pathname === '/api/subscribe') return handleSubscribe(request, env);
  if (pathname === '/api/contact') return handleContact(request, env);

  /* ---- 2.3 Agent Skills 制品 / SKILL.md ---- */
  const skillsPrefix = '/.well-known/agent-skills/';
  if (pathname.startsWith(skillsPrefix) && pathname.endsWith('/SKILL.md')) {
    const name = pathname.slice(skillsPrefix.length, -'/SKILL.md'.length);
    if (name && !name.includes('/')) {
      const skill = findSkill(name);
      if (skill) return textDoc(skill.body);
      return jsonDoc({ error: 'not_found', message: 'No skill named "' + name + '".', index: skillsPrefix + 'index.json' }, 404);
    }
    return jsonDoc({ error: 'not_found', index: skillsPrefix + 'index.json' }, 404);
  }

  /* ---- 2.3 MCP ---- */
  if (pathname === '/mcp' || pathname === '/mcp/') {
    return handleMcp(request, env);
  }

  /* ---- 2.4 OAuth 2.0 ---- */
  if (pathname === '/oauth/register') {
    if (method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...CORS_ANY, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
    if (method !== 'POST') return jsonDoc({ error: 'invalid_request', error_description: 'Use POST.' }, 405, undefined, { Allow: 'POST, OPTIONS' });
    return handleRegister(request, env);
  }

  if (pathname === '/oauth/token') {
    if (method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...CORS_ANY, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' } });
    if (method !== 'POST') return jsonDoc({ error: 'invalid_request', error_description: 'Use POST.' }, 405, undefined, { Allow: 'POST, OPTIONS' });
    return handleToken(request, env);
  }

  if (pathname === '/oauth/authorize') {
    if (method !== 'GET') return jsonDoc({ error: 'invalid_request', error_description: 'Use GET.' }, 405, undefined, { Allow: 'GET, OPTIONS' });
    return handleAuthorize(request, env);
  }

  if (pathname === '/oauth/revoke') {
    if (method !== 'POST') return jsonDoc({ error: 'invalid_request', error_description: 'Use POST.' }, 405, undefined, { Allow: 'POST, OPTIONS' });
    return handleRevoke(request, env);
  }

  /* ---- 2.5 Markdown 孪生体：/path.md → 该页的干净 markdown（llms.txt v2 提案） ---- */
  // 放在最后：/.well-known/<name>/SKILL.md 与 /auth.md 已在上面各自处理完，
  // 不会走到这里。命中就返回 markdown，未命中返回 null 交给静态资产层。
  const twin = await markdownTwin(request, env);
  if (twin) return twin;

  return null;
}

/* ═══════════════ 3. 内容层（内容协商 + Link） ═══════════════ */

/**
 * 不该参与内容协商的路径。
 *
 * `.html` 是**要**协商的 —— 全站正文页都是 .html（/guides/xxx.html、
 * /about.html…），把它们排除掉等于对最有价值的内容关闭 Markdown for Agents。
 * 排除的只有真正的静态资源后缀（图片/字体/CSS/JS/XML/TXT/JSON）。
 */
function isNegotiable(pathname) {
  if (pathname.startsWith('/go/')) return false;
  if (pathname.startsWith('/api/')) return false;
  if (pathname.startsWith('/.well-known/')) return false;
  if (pathname.startsWith('/oauth/')) return false;
  const last = pathname.split('/').pop() || '';
  const dot = last.lastIndexOf('.');
  if (dot > 0) {
    const ext = last.slice(dot).toLowerCase();
    return ext === '.html' || ext === '.htm';
  }
  return true;   // 目录式 URL（/psychic/）与根路径
}

/* ═══════════════ 3b. Markdown 孪生体（llms.txt v2 提案） ═══════════════ */

/**
 * 由页面路径推出它的 markdown 孪生体路径。
 * 目录式路径按提案用 index.md（/psychic/ → /psychic/index.md）；
 * 无扩展名的正文页直接追加（/about → /about.md）。
 * `.html` 形式先归一化掉，保证从 /about 与 /about.html 通告出来的是同一个孪生体。
 * 返回 null 表示该路径没有孪生体（/go/、/api/、静态资源等）。
 */
function markdownTwinHref(pathname) {
  if (!pathname || !pathname.startsWith('/')) return null;
  const page = /\.html?$/i.test(pathname) ? pathname.replace(/\.html?$/i, '') : pathname;
  if (!isNegotiable(page)) return null;
  return (page.endsWith('/') ? page + 'index' : page) + '.md';
}

/**
 * markdownTwinHref 的逆运算：孪生体路径 → 它对应的页面路径。
 * 返回 null 表示这不是一个合法的孪生体请求。
 */
function markdownTwinTarget(pathname) {
  if (!pathname || !pathname.endsWith('.md')) return null;
  if (pathname.startsWith('/.well-known/')) return null;   // SKILL.md 等归发现层
  if (pathname === '/auth.md') return null;                // 发现层文档，非页面孪生体
  let target = pathname.slice(0, -3);
  if (target.endsWith('/index')) target = target.slice(0, -'index'.length);
  if (target === '') target = '/';
  return isNegotiable(target) ? target : null;
}

/**
 * 取目标页的 HTML 明文。
 *
 * 有意的取舍：**完全不转发调用方的请求头**。这样既天然避开了
 * Accept-Encoding（否则 res.text() 会拿到 gzip 字节流），也不需要
 * 判断正文页路径到底是 `/about` 还是 `/about.html` —— 两种都试一遍。
 * 站点正文全部公开，转发头没有任何收益。
 */
async function fetchPageHtml(env, url, target) {
  const candidates = target.endsWith('/') ? [target] : [target, target + '.html'];
  for (const candidate of candidates) {
    const pageUrl = new URL(url.toString());
    pageUrl.pathname = candidate;
    pageUrl.search = '';
    let res;
    try {
      res = await env.ASSETS.fetch(
        new Request(pageUrl.toString(), { method: 'GET', headers: { Accept: 'text/html' } }),
      );
    } catch {
      continue;
    }
    if (!res || !res.ok) continue;
    if (res.headers.get('Content-Encoding')) continue;
    if (!(res.headers.get('Content-Type') || '').includes('text/html')) continue;
    try {
      const html = await res.text();
      if (html) return html;
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * 提供 `/path.md` —— 页面的干净 markdown 孪生体。
 *
 * llms.txt v2 提案建议每个页面在同路径提供 markdown 版本：智能体取一次即得正文，
 * 省去 HTML 解析与 token 浪费。这里复用与内容协商**完全相同**的转换器，
 * 因此两条入口产出的 markdown 必然一致。
 *
 * 硬约束：**绝不抛错**。任何异常一律返回 null，由调用方退回静态资产层按 404
 * 处理 —— 一个可选的呈现形式，不允许影响站点其它部分。
 */
async function markdownTwin(request, env) {
  try {
    if (request.method !== 'GET' && request.method !== 'HEAD') return null;

    const url = new URL(request.url);
    const target = markdownTwinTarget(url.pathname);
    if (!target) return null;

    const html = await fetchPageHtml(env, url, target);
    if (!html || html.length > MAX_CONVERT_BYTES) return null;

    let out;
    try {
      out = convertPage(html, { url: new URL(target, ORIGIN).toString() });
    } catch {
      return null;
    }
    if (!out || !out.markdown || out.words < 20) return null;

    const canonical = new URL(target, ORIGIN).toString();
    return new Response(out.markdown, {
      status: 200,
      headers: {
        'Content-Type': MD_TYPE,
        'Cache-Control': 'public, max-age=3600',
        // 孪生体是同一资源的另一种呈现，不是第二个资源：不让搜索引擎把它当独立
        // 页面收录，正本仍由 canonical 收录与被引用。noindex 只影响"是否收录"，
        // 不影响抓取，AI 读取这条 URL 不受任何影响。
        'X-Robots-Tag': 'noindex, follow',
        'X-Markdown-For-Agents': '1',
        Vary: 'Accept',
        Link: [
          '<' + canonical + '>; rel="canonical"',
          '<' + markdownTwinHref(target) + '>; rel="alternate"; type="text/markdown"',
          LINK_HEADER,
        ].join(', '),
      },
    });
  } catch {
    return null;
  }
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

/** 静态资产服务（含 markdown 内容协商与 Link 头） */
async function serveAsset(request, env) {
  const url = new URL(request.url);

  const negotiate =
    request.method === 'GET' &&
    wantsMarkdown(request) &&
    isNegotiable(url.pathname);

  if (!negotiate) return decorate(await env.ASSETS.fetch(request), url);

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
    return decorate(res, url);
  }

  let html;
  try {
    html = await res.text();
  } catch {
    // 读不出明文（极少见）：改用原始请求再取一次，保证仍能返回 HTML
    try {
      return decorate(await env.ASSETS.fetch(request), url);
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
  headers.set('Link', LINK_HEADER);
  headers.delete('Content-Length');
  headers.delete('Content-Encoding');
  headers.delete('ETag');

  return new Response(markdown, { status: 200, headers });
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
      return harden(Response.redirect(url.toString(), 301));
    }

    // 2) 智能体发现层与接口层。
    //    任何异常都就地兜底：这一层坏掉可以，但绝不能让整个站点跟着坏。
    try {
      const handled = await routeAgentSurface(request, env, url.pathname);
      if (handled) return harden(handled);
    } catch (err) {
      return harden(jsonDoc(
        {
          error: 'internal_error',
          message: 'The agent surface is temporarily unavailable. Static content is unaffected.',
          detail: err && err.message ? String(err.message) : undefined,
        },
        500,
        'application/json; charset=utf-8',
        { 'Cache-Control': 'no-store' },
      ));
    }

    // 3) 其余请求 → 静态资产（含 Markdown for Agents 协商与 Link 头）
    return harden(await serveAsset(request, env));
  },
};
