/**
 * MysticDo — Cloudflare Worker（静态资产 + 边缘逻辑）
 *
 * 由原 Cloudflare Pages Functions（已随转向 Workers 删除）合并而来，两段职责：
 *
 *   1) 主机名规范化 —— www → apex 301（GSC 收录口径统一）
 *   2) Markdown for Agents —— Accept: text/markdown 时在边缘把 HTML 转成 markdown
 *
 * 其余请求一律转交静态资产层（env.ASSETS）：
 *   · html_handling = "auto-trailing-slash" → /psychic/ ↔ /psychic/index.html
 *   · not_found_handling = "404-page"      → 缺路径返回 /404.html（404 状态码）
 *
 * ⚠️ 两条硬约束：
 *   · 转换绝不能把页面弄坏 —— 任何异常都退回原始 HTML
 *   · Workers 免费版 10ms CPU/请求 —— 体积上限 + 异常兜底，超限退回 HTML
 *
 * 注：原 EA 时代的 /api/postback（联盟 S2S 回调 → PostHog）已于 2026-09-19
 *     随 PostHog 整体移除；PostHog 重新接入时再实现（历史实现见 git 提交 bd80527）。
 */

import { convertPage } from './_lib/html-to-md.js';

const APEX = 'mysticdo.com';
const MD_TYPE = 'text/markdown; charset=utf-8';

/**
 * 超过这个体积就放弃转换，退回 HTML（原 _middleware.js 实测结论）：
 * 免费版 CPU 上限 10ms/请求，实测约每 1KB 0.04ms，150KB → 最差约 5.5ms，留约 45% 余量。
 */
const MAX_CONVERT_BYTES = 150 * 1024;

/* ═══════════════ 1+2. 主机名规范化 & Markdown for Agents ═══════════════ */

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

/** 静态资产服务（含 markdown 内容协商） */
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

    // 2) 其余请求 → 静态资产（含 Markdown for Agents 协商）
    return serveAsset(request, env);
  },
};
