/**
 * MysticDo — MCP server (Streamable HTTP, stateless, JSON-RPC 2.0).
 *
 * Published at POST /mcp and described at /.well-known/mcp/server-card.json.
 *
 * Design decisions, and why:
 *
 *  · STATELESS. No session id, no SSE stream, no `notifications/initialized`
 *    handshake requirement. The protocol explicitly allows a server to answer a
 *    request with a single application/json body; that keeps the whole endpoint
 *    inside the Workers free-tier CPU budget (10 ms) and removes every
 *    "session expired" failure mode an agent would otherwise hit.
 *
 *  · READ-ONLY. Every tool reads public content. There is nothing to mutate, so
 *    every tool is annotated readOnlyHint:true — which lets a host auto-approve
 *    them without a human in the loop.
 *
 *  · REAL. The tools run against the same corpus the site publishes
 *    (assets/data/content-index.json) and return real URLs that resolve. A
 *    server card that advertises a tool the endpoint cannot serve is worse than
 *    no card at all.
 */

import { convertPage } from './html-to-md.js';
import {
  ORIGIN,
  MCP_PROTOCOL_VERSION,
  SITE_NAME,
  SITE_DESCRIPTION,
} from './agent-discovery.js';
import {
  loadIndex,
  searchPages,
  listTopics,
  recommendReadingType,
  formatSearchResults,
  formatRecommendation,
} from './search.js';

const SERVER_INFO = { name: 'mysticdo', title: 'MysticDo', version: '1.0.0' };

const TOOLS = [
  {
    name: 'search_mysticdo',
    title: 'Search MysticDo',
    description:
      'Full-text search across every MysticDo page (decision guides, comparisons, practice ' +
      'hubs, quizzes, free tools). Use this first whenever you need MysticDo content but do ' +
      'not have the URL. Returns ranked pages with a matched excerpt.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'Natural-language query, e.g. "how much does a psychic reading cost" or ' +
            '"is an online tarot reader legit".',
        },
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 25,
          default: 8,
          description: 'Maximum number of results.',
        },
        kind: {
          type: 'string',
          enum: ['guide', 'comparison', 'practice', 'question', 'quiz', 'tool', 'page'],
          description: 'Restrict results to one content type.',
        },
      },
      required: ['query'],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: 'get_mysticdo_page',
    title: 'Get a MysticDo page as Markdown',
    description:
      'Retrieve the full text of one MysticDo page, converted to Markdown with navigation and ' +
      'page chrome stripped. Use after search_mysticdo when the exact wording matters.',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description:
            'Site-relative path (e.g. "/guides/psychic-vs-tarot") or a full ' +
            'https://mysticdo.com URL.',
        },
      },
      required: ['path'],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: 'list_mysticdo_topics',
    title: 'List MysticDo topics',
    description:
      'List the whole MysticDo catalogue grouped by section (decision guides, comparisons, ' +
      'practice hubs, intent hubs, quizzes, free tools), with URLs. Use when browsing rather ' +
      'than searching.',
    inputSchema: {
      type: 'object',
      properties: {
        kind: {
          type: 'string',
          enum: ['guide', 'comparison', 'practice', 'question', 'quiz', 'tool', 'page'],
          description: 'Restrict the listing to one content type.',
        },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: 'recommend_reading_type',
    title: 'Recommend a reading type',
    description:
      'Given a description of someone\'s situation in their own words, recommend which practice ' +
      'fits — psychic, tarot, astrology or medium — with the discriminator used, the runner-up ' +
      'and its winning condition, the expected cost tier, the category-specific caution, and a ' +
      'next-step URL. MysticDo\'s core decision procedure, exposed as a tool.',
    inputSchema: {
      type: 'object',
      properties: {
        situation: {
          type: 'string',
          description:
            'The situation in free text, e.g. "I keep ending up in the same relationship ' +
            'pattern and want to understand why" or "my mother passed last year and I want ' +
            'to know if she is okay".',
        },
      },
      required: ['situation'],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
];

/* ═════════════════════════════ helpers ═════════════════════════════ */

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, MCP-Protocol-Version, Mcp-Session-Id',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'MCP-Protocol-Version': MCP_PROTOCOL_VERSION,
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  });
}

function rpcResult(id, result) {
  return { jsonrpc: '2.0', id, result };
}

function rpcError(id, code, message, data) {
  const error = { code, message };
  if (data !== undefined) error.data = data;
  return { jsonrpc: '2.0', id: id === undefined ? null : id, error };
}

function textResult(id, text, structured) {
  const result = { content: [{ type: 'text', text }] };
  if (structured) result.structuredContent = structured;
  return rpcResult(id, result);
}

function errorResult(id, text) {
  return rpcResult(id, { content: [{ type: 'text', text }], isError: true });
}

/** Resolve a caller-supplied path to a same-origin site-relative path. */
function normalizePath(input) {
  const raw = String(input || '').trim();
  if (!raw) return null;

  let pathname;
  try {
    if (/^https?:\/\//i.test(raw)) {
      const url = new URL(raw);
      if (url.hostname !== 'mysticdo.com' && url.hostname !== 'www.mysticdo.com') return null;
      pathname = url.pathname;
    } else {
      pathname = raw.startsWith('/') ? raw : '/' + raw;
    }
  } catch {
    return null;
  }

  if (pathname.includes('..') || pathname.includes('//')) return null;
  // Published URLs are extension-less (Cloudflare auto-trailing-slash), but
  // a caller may still hold a legacy ".html" path — normalize it so both
  // generations of URL resolve to the same page.
  if (pathname.endsWith('.html')) pathname = pathname.slice(0, -'.html'.length);
  return pathname;
}

async function fetchPageMarkdown(env, pathname) {
  const url = new URL(pathname, ORIGIN).toString();
  const res = await env.ASSETS.fetch(
    new Request(url, { method: 'GET', headers: { Accept: 'text/html', 'Accept-Encoding': 'identity' } }),
  );
  if (!res.ok) return { ok: false, status: res.status };

  const contentType = res.headers.get('Content-Type') || '';
  if (!contentType.includes('text/html')) return { ok: false, status: res.status };

  const html = await res.text();
  const out = convertPage(html, { url });
  if (!out || !out.markdown) return { ok: false, status: 200 };
  return { ok: true, markdown: out.markdown, title: out.title, words: out.words };
}

/* ═════════════════════════════ tool dispatch ═════════════════════════════ */

async function callTool(name, args, env, requestUrl) {
  const doc = await loadIndex(env, requestUrl);
  const input = args && typeof args === 'object' ? args : {};

  switch (name) {
    case 'search_mysticdo': {
      const query = String(input.query || '').trim();
      if (!query) return { text: 'The `query` argument is required and must be a non-empty string.', isError: true };
      if (!doc) return { text: 'The MysticDo content index is temporarily unavailable. Retry, or fetch pages directly with Accept: text/markdown.', isError: true };

      const results = searchPages(doc, query, { limit: input.limit, kind: input.kind });
      return {
        text: formatSearchResults(query, results),
        structured: { query, resultCount: results.length, results },
      };
    }

    case 'list_mysticdo_topics': {
      if (!doc) return { text: 'The MysticDo content index is temporarily unavailable.', isError: true };
      const listing = listTopics(doc, { kind: input.kind });
      const lines = [SITE_NAME + ' catalogue — ' + listing.pageCount + ' pages', ''];
      for (const section of listing.sections) {
        lines.push('## ' + section.section + ' (' + section.count + ')');
        for (const item of section.items) lines.push('- ' + item.title + ' — ' + ORIGIN + item.url);
        lines.push('');
      }
      return { text: lines.join('\n').trim(), structured: listing };
    }

    case 'recommend_reading_type': {
      const situation = String(input.situation || '').trim();
      if (!situation) return { text: 'The `situation` argument is required and must be a non-empty string.', isError: true };

      const rec = recommendReadingType(doc, situation, {});
      return { text: formatRecommendation(rec), structured: rec };
    }

    case 'get_mysticdo_page': {
      const pathname = normalizePath(input.path);
      if (!pathname) {
        return { text: 'The `path` argument must be a site-relative path on mysticdo.com, e.g. "/guides/psychic-vs-tarot".', isError: true };
      }
      // Prefer short-circuiting on a known path so the markdown conversion cost
      // is only paid for pages that exist.
      if (doc && !doc.pages.some((p) => p.url === pathname)) {
        return { text: 'No MysticDo page at ' + pathname + '. Use search_mysticdo or list_mysticdo_topics to find the right URL.', isError: true };
      }
      const page = await fetchPageMarkdown(env, pathname);
      if (!page.ok) {
        return { text: 'No MysticDo page at ' + pathname + ' (HTTP ' + page.status + ').', isError: true };
      }
      return {
        text: '# ' + (page.title || pathname) + '\n\nSource: ' + ORIGIN + pathname + '\n\n' + page.markdown,
        structured: { url: ORIGIN + pathname, title: page.title, wordCount: page.words, markdown: page.markdown },
      };
    }

    default:
      return null; // signals "unknown tool" to the caller
  }
}

/* ═════════════════════════════ JSON-RPC dispatch ═════════════════════════════ */

async function handleMessage(msg, env, requestUrl) {
  if (!msg || typeof msg !== 'object' || Array.isArray(msg)) {
    return rpcError(null, -32600, 'Invalid Request: expected a JSON-RPC 2.0 object.');
  }

  const { id, method, params } = msg;
  const isNotification = id === undefined || id === null;

  if (typeof method !== 'string') return rpcError(id, -32600, 'Invalid Request: missing method.');

  switch (method) {
    case 'initialize':
      return rpcResult(id, {
        protocolVersion: MCP_PROTOCOL_VERSION,
        capabilities: { tools: { listChanged: false }, resources: {}, prompts: {}, logging: {} },
        serverInfo: SERVER_INFO,
        instructions:
          SITE_DESCRIPTION +
          ' Read-only and public — no authentication is required. Start with search_mysticdo, ' +
          'then get_mysticdo_page for full text. recommend_reading_type maps a situation to the ' +
          'practice that fits it.',
      });

    case 'notifications/initialized':
    case 'notifications/cancelled':
    case 'notifications/roots/list_changed':
      return null; // notifications never get a response

    case 'ping':
      return rpcResult(id, {});

    case 'tools/list':
      return rpcResult(id, { tools: TOOLS });

    case 'tools/call': {
      const name = params && params.name;
      if (typeof name !== 'string') return rpcError(id, -32602, 'Invalid params: `name` is required.');
      const outcome = await callTool(name, params.arguments, env, requestUrl);
      if (outcome === null) {
        return rpcError(id, -32602, 'Unknown tool: ' + name, {
          availableTools: TOOLS.map((t) => t.name),
        });
      }
      return outcome.isError ? errorResult(id, outcome.text) : textResult(id, outcome.text, outcome.structured);
    }

    case 'resources/list':
      return rpcResult(id, { resources: [] });

    case 'prompts/list':
      return rpcResult(id, { prompts: [] });

    case 'logging/setLevel':
      return rpcResult(id, {});

    default:
      if (isNotification) return null;
      return rpcError(id, -32601, 'Method not found: ' + method);
  }
}

/* ═════════════════════════════ entry point ═════════════════════════════ */

export async function handleMcp(request, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, MCP-Protocol-Version, Mcp-Session-Id',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  if (request.method === 'GET' || request.method === 'DELETE') {
    return json(
      {
        jsonrpc: '2.0',
        error: {
          code: -32600,
          message:
            'This MCP server is stateless and does not open an SSE stream. Send JSON-RPC ' +
            'requests with POST. See ' + ORIGIN + '/.well-known/mcp/server-card.json.',
        },
      },
      405,
      { Allow: 'POST, OPTIONS' },
    );
  }

  if (request.method !== 'POST') {
    return json({ jsonrpc: '2.0', error: { code: -32600, message: 'Use POST.' } }, 405, { Allow: 'POST, OPTIONS' });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json(rpcError(null, -32700, 'Parse error: body must be valid JSON.'));
  }

  // Batch requests are part of JSON-RPC 2.0. MCP does not use them, but answering
  // costs one branch and avoids a confusing failure for generic JSON-RPC clients.
  if (Array.isArray(payload)) {
    if (!payload.length) return json(rpcError(null, -32600, 'Invalid Request: empty batch.'));
    const out = [];
    for (const msg of payload) {
      const response = await handleMessage(msg, env, request.url);
      if (response) out.push(response);
    }
    if (!out.length) return new Response(null, { status: 202, headers: { 'Access-Control-Allow-Origin': '*' } });
    return json(out);
  }

  const response = await handleMessage(payload, env, request.url);
  if (!response) return new Response(null, { status: 202, headers: { 'Access-Control-Allow-Origin': '*' } });
  return json(response);
}

export { TOOLS as MCP_TOOLS };
