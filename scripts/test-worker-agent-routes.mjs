#!/usr/bin/env node
/**
 * MysticDo — agent-surface test harness.
 *
 * Runs the real Worker (worker/index.js) against a filesystem-backed stand-in for
 * the Cloudflare ASSETS binding, then exercises every route the agent surface
 * publishes. No network, no wrangler, no deploy — so this can be run before
 * every push, which matters because the Worker is the single entry point for
 * the whole site: a broken branch here takes the content down with it.
 *
 * Usage:  node scripts/test-worker-agent-routes.mjs
 * Exit:   0 all pass · 1 one or more failures
 */

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://mysticdo.com';

/* ══════════════════════ assets binding stand-in ══════════════════════ */

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

async function readIfExists(relPath) {
  // Guard against escaping the project root.
  const abs = path.resolve(ROOT, '.' + relPath);
  if (!abs.startsWith(ROOT)) return null;
  try {
    const data = await readFile(abs);
    return data;
  } catch {
    return null;
  }
}

function assetResponse(data, relPath) {
  const type = TYPES[path.extname(relPath).toLowerCase()] || 'application/octet-stream';
  return new Response(data, { status: 200, headers: { 'Content-Type': type } });
}

const ASSETS = {
  async fetch(input) {
    const url = new URL(typeof input === 'string' ? input : input.url);
    let pathname = decodeURIComponent(url.pathname);

    const candidates = [];
    if (pathname.endsWith('/')) candidates.push(pathname + 'index.html');
    else candidates.push(pathname);
    if (!path.extname(pathname)) candidates.push(pathname + '/index.html', pathname + '.html');

    for (const candidate of candidates) {
      const data = await readIfExists(candidate);
      if (data) return assetResponse(data, candidate);
    }

    const notFound = await readIfExists('/404.html');
    return new Response(notFound || 'Not found', {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  },
};

const env = { ASSETS };

/* ══════════════════════ tiny test framework ══════════════════════ */

const results = [];
let currentGroup = '';

function group(name) {
  currentGroup = name;
}

function check(name, condition, detail) {
  results.push({ group: currentGroup, name, ok: Boolean(condition), detail });
}

async function call(pathname, init) {
  const { default: worker } = await import('../worker/index.js');
  return worker.fetch(new Request(ORIGIN + pathname, init), env);
}

async function getJson(pathname, init) {
  const res = await call(pathname, init);
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* leave null */
  }
  return { res, text, json };
}

function sha256Hex(text) {
  return crypto.subtle
    .digest('SHA-256', new TextEncoder().encode(text))
    .then((buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join(''));
}

function b64url(bytes) {
  return Buffer.from(bytes).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Tolerant query extraction — a failing assertion must not abort the suite. */
function safeParam(urlLike, key) {
  try {
    return new URL(urlLike).searchParams.get(key);
  } catch {
    return null;
  }
}

/* ══════════════════════ 1. discovery documents ══════════════════════ */

group('discovery documents');
{
  const home = await call('/');
  check('GET / → 200', home.status === 200, `status=${home.status}`);
  const link = home.headers.get('Link') || '';
  check('Link header present on homepage', link.length > 0, link);
  check('Link: rel="api-catalog"', /rel="api-catalog"/.test(link), link);
  check('Link: rel="service-desc"', /rel="service-desc"/.test(link), link);
  check('Link: rel="service-doc"', /rel="service-doc"/.test(link), link);
  check('Link: rel="service-meta"', /rel="service-meta"/.test(link), link);
  check('Link: rel="status"', /rel="status"/.test(link), link);

  const catalog = await getJson('/.well-known/api-catalog');
  check('api-catalog → 200', catalog.res.status === 200);
  check(
    'api-catalog Content-Type = application/linkset+json',
    (catalog.res.headers.get('Content-Type') || '').startsWith('application/linkset+json'),
    catalog.res.headers.get('Content-Type'),
  );
  check('api-catalog has linkset[]', Array.isArray(catalog.json?.linkset) && catalog.json.linkset.length > 0);
  check(
    'api-catalog entries carry anchor + service-desc + service-doc',
    (catalog.json?.linkset || []).every((e) => e.anchor && e['service-desc'] && e['service-doc']),
  );

  const ard = await getJson('/.well-known/ai-catalog.json');
  check('ai-catalog → 200', ard.res.status === 200);
  check('ai-catalog CORS = *', ard.res.headers.get('Access-Control-Allow-Origin') === '*');
  check('ai-catalog specVersion non-empty', typeof ard.json?.specVersion === 'string' && ard.json.specVersion.length > 0, ard.json?.specVersion);
  check('ai-catalog host.identifier present', Boolean(ard.json?.host?.identifier), ard.json?.host?.identifier);
  check('ai-catalog host.displayName present', Boolean(ard.json?.host?.displayName));
  check('ai-catalog entries non-empty', Array.isArray(ard.json?.entries) && ard.json.entries.length > 0, `n=${ard.json?.entries?.length}`);
  {
    const entries = ard.json?.entries || [];
    const urnOk = entries.every((e) => /^urn:air:mysticdo\.com:[^:]+:[^:]+$/.test(e.identifier || ''));
    check('every entry identifier matches urn:air:<fqdn>:<ns>:<name>', urnOk, entries.map((e) => e.identifier).join(', '));
    const exactlyOne = entries.every((e) => Boolean(e.url) !== Boolean(e.data));
    check('every entry has exactly one of url|data', exactlyOne);
    const queriesOk = entries.every((e) => Array.isArray(e.representativeQueries) && e.representativeQueries.length >= 2 && e.representativeQueries.length <= 5);
    check('every entry has 2–5 representativeQueries', queriesOk, entries.map((e) => e.representativeQueries?.length).join(','));
    const mediaOk = entries.every((e) => typeof e.type === 'string' && e.type.includes('/'));
    check('every entry type is an IANA media type', mediaOk);
  }

  const card = await getJson('/.well-known/mcp/server-card.json');
  check('mcp/server-card.json → 200', card.res.status === 200);
  check('server card serverInfo.name', Boolean(card.json?.serverInfo?.name), card.json?.serverInfo?.name);
  check('server card serverInfo.version', Boolean(card.json?.serverInfo?.version), card.json?.serverInfo?.version);
  check('server card endpoint present + points at /mcp', card.json?.endpoint === ORIGIN + '/mcp', card.json?.endpoint);
  check('server card transport.endpoint present', card.json?.transport?.endpoint === ORIGIN + '/mcp');
  check('server card capabilities.tools declared', Boolean(card.json?.capabilities?.tools));
  check('server card matches a real endpoint (no dangling advertisement)', (await call('/mcp', { method: 'POST', body: '{"jsonrpc":"2.0","id":0,"method":"ping"}' })).status === 200);

  const oas = await getJson('/.well-known/oauth-authorization-server');
  check('oauth-authorization-server → 200', oas.res.status === 200);
  for (const field of ['issuer', 'authorization_endpoint', 'token_endpoint', 'jwks_uri', 'grant_types_supported', 'response_types_supported']) {
    check(`AS metadata has ${field}`, Boolean(oas.json?.[field]));
  }
  check('AS issuer matches origin', oas.json?.issuer === ORIGIN, oas.json?.issuer);

  const prm = await getJson('/.well-known/oauth-protected-resource');
  check('oauth-protected-resource → 200', prm.res.status === 200);
  check('PRM resource present', Boolean(prm.json?.resource), prm.json?.resource);
  check('PRM authorization_servers[] present', Array.isArray(prm.json?.authorization_servers) && prm.json.authorization_servers.length > 0);
  check('PRM bearer_methods_supported includes header', (prm.json?.bearer_methods_supported || []).includes('header'));
  check('PRM authorization_servers matches AS issuer', (prm.json?.authorization_servers || []).includes(oas.json?.issuer));

  const jwks = await getJson('/.well-known/jwks.json');
  check('jwks.json → 200 and has keys[]', jwks.res.status === 200 && Array.isArray(jwks.json?.keys));

  const openapi = await getJson('/.well-known/openapi.json');
  check('openapi.json → 200', openapi.res.status === 200);
  check('openapi declares 3.1.x', String(openapi.json?.openapi || '').startsWith('3.1'), openapi.json?.openapi);
  check('openapi has paths', Boolean(openapi.json?.paths && Object.keys(openapi.json.paths).length));

  const health = await getJson('/api/health');
  check('/api/health → 200 ok', health.res.status === 200 && health.json?.status === 'ok');
}

/* ══════════════════════ 2. auth.md ══════════════════════ */

group('auth.md');
{
  const res = await call('/auth.md');
  const text = await res.text();
  check('/auth.md → 200', res.status === 200);
  check('/auth.md served as text/markdown', (res.headers.get('Content-Type') || '').startsWith('text/markdown'), res.headers.get('Content-Type'));
  check('/auth.md H1 contains "auth.md"', /^#\s+.*auth\.md/im.test(text), text.split('\n')[0]);
  check('/auth.md documents registration endpoint', text.includes('/oauth/register'));
  check('/auth.md documents the PRM endpoint', text.includes('/.well-known/oauth-protected-resource'));
}

/* ══════════════════════ 3. agent skills ══════════════════════ */

group('agent skills');
{
  const idx = await getJson('/.well-known/agent-skills/index.json');
  check('agent-skills/index.json → 200', idx.res.status === 200);
  check('$schema is the 0.2.0 schema', idx.json?.$schema === 'https://schemas.agentskills.io/discovery/0.2.0/schema.json', idx.json?.$schema);
  const skills = idx.json?.skills || [];
  check('skills[] non-empty', skills.length > 0, `n=${skills.length}`);
  const shapeOk = skills.every(
    (s) => s.name && s.type === 'skill-md' && s.description && s.url && /^sha256:[0-9a-f]{64}$/.test(s.digest || ''),
  );
  check('every skill has name/type/description/url/sha256 digest', shapeOk);
  const nameOk = skills.every((s) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s.name));
  check('skill names are lowercase alphanumeric + hyphens', nameOk, skills.map((s) => s.name).join(', '));

  // The load-bearing property: the published digest must match the bytes served.
  for (const skill of skills) {
    const art = await call(skill.url);
    const body = await art.text();
    const digest = 'sha256:' + (await sha256Hex(body));
    check(`digest matches artifact for ${skill.name}`, digest === skill.digest, `${digest} vs ${skill.digest}`);
    check(`${skill.name}/SKILL.md served as markdown`, (art.headers.get('Content-Type') || '').startsWith('text/markdown'));
  }

  const missing = await call('/.well-known/agent-skills/nope/SKILL.md');
  check('unknown skill → 404 JSON', missing.status === 404);
}

/* ══════════════════════ 4. MCP ══════════════════════ */

group('mcp');
{
  const init = await getJson('/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} }),
  });
  check('initialize → result.protocolVersion', Boolean(init.json?.result?.protocolVersion), init.json?.result?.protocolVersion);
  check('initialize → serverInfo.name', init.json?.result?.serverInfo?.name === 'mysticdo');
  check('initialize → capabilities.tools', Boolean(init.json?.result?.capabilities?.tools));

  const list = await getJson('/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list' }),
  });
  const tools = list.json?.result?.tools || [];
  check('tools/list returns tools', tools.length >= 4, `n=${tools.length}`);
  check(
    'every tool has name/description/inputSchema',
    tools.every((t) => t.name && t.description && t.inputSchema && t.inputSchema.type === 'object'),
  );
  check('every tool annotated readOnlyHint', tools.every((t) => t.annotations?.readOnlyHint === true));

  const search = await getJson('/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: { name: 'search_mysticdo', arguments: { query: 'how much does a psychic reading cost', limit: 3 } },
    }),
  });
  const searchHits = search.json?.result?.structuredContent?.results || [];
  check('search_mysticdo returns hits', searchHits.length > 0, `n=${searchHits.length}`);
  check('search hits carry site-relative urls', searchHits.every((h) => typeof h.url === 'string' && h.url.startsWith('/')));
  check('search ranks the cost guide first', (searchHits[0]?.url || '').includes('cost'), searchHits.map((h) => h.url).join(' | '));
  check('search result text is non-empty', (search.json?.result?.content?.[0]?.text || '').length > 40);

  const topics = await getJson('/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'list_mysticdo_topics', arguments: {} } }),
  });
  check('list_mysticdo_topics returns sections', (topics.json?.result?.structuredContent?.sections || []).length > 0);

  const rec = await getJson('/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: { name: 'recommend_reading_type', arguments: { situation: 'My mother passed away last year and I want to know if she is okay.' } },
    }),
  });
  check('recommend_reading_type picks Medium for a bereavement', rec.json?.result?.structuredContent?.practice === 'Medium', rec.json?.result?.structuredContent?.practice);

  const rec2 = await getJson('/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 6,
      method: 'tools/call',
      params: { name: 'recommend_reading_type', arguments: { situation: 'What does he actually think about me right now?' } },
    }),
  });
  check('recommend_reading_type picks Psychic for a read on another person', rec2.json?.result?.structuredContent?.practice === 'Psychic', rec2.json?.result?.structuredContent?.practice);

  const page = await getJson('/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 7,
      method: 'tools/call',
      params: { name: 'get_mysticdo_page', arguments: { path: '/guides/psychic-vs-tarot.html' } },
    }),
  });
  const md = page.json?.result?.structuredContent?.markdown || '';
  check('get_mysticdo_page returns markdown', md.length > 500, `len=${md.length}`);
  check('get_mysticdo_page markdown has no inline svg noise', !md.includes('<svg'));

  const badPath = await getJson('/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 8,
      method: 'tools/call',
      params: { name: 'get_mysticdo_page', arguments: { path: 'https://evil.example.com/' } },
    }),
  });
  check('get_mysticdo_page rejects a foreign origin', badPath.json?.result?.isError === true);

  const badTool = await getJson('/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 9, method: 'tools/call', params: { name: 'nope', arguments: {} } }),
  });
  check('unknown tool → JSON-RPC -32602', badTool.json?.error?.code === -32602, JSON.stringify(badTool.json?.error));

  const badMethod = await getJson('/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 10, method: 'does/not/exist' }),
  });
  check('unknown method → JSON-RPC -32601', badMethod.json?.error?.code === -32601);

  const parseErr = await getJson('/mcp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{oops' });
  check('malformed JSON → JSON-RPC -32700', parseErr.json?.error?.code === -32700);

  const notif = await call('/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }),
  });
  check('notification → 202 with no body', notif.status === 202, `status=${notif.status}`);

  const getMcp = await getJson('/mcp', { method: 'GET' });
  check('GET /mcp → 405 (stateless, no SSE)', getMcp.res.status === 405, `status=${getMcp.res.status}`);
}

/* ══════════════════════ 5. OAuth 2.0 ══════════════════════ */

group('oauth 2.0');
{
  const goodUri = 'http://127.0.0.1:8765/callback';
  const reg = await getJson('/oauth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_name: 'test-agent', redirect_uris: [goodUri], scope: 'mysticdo:read' }),
  });
  check('register → 201', reg.res.status === 201, `status=${reg.res.status}`);
  const clientId = reg.json?.client_id;
  check('register issues a client_id', typeof clientId === 'string' && clientId.startsWith('mc_'));
  check('register echoes redirect_uris', Array.isArray(reg.json?.redirect_uris) && reg.json.redirect_uris[0] === goodUri);
  check('register never issues a client secret', reg.json?.client_secret === undefined);

  const badReg = await getJson('/oauth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ redirect_uris: ['https://attacker.example/cb'] }),
  });
  check('register rejects a third-party redirect_uri', badReg.res.status === 400 && badReg.json?.error === 'invalid_redirect_uri', JSON.stringify(badReg.json));

  const cc = await getJson('/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials&scope=mysticdo:read',
  });
  check('client_credentials → access_token', typeof cc.json?.access_token === 'string' && cc.json.access_token.startsWith('mt_'));
  check('token_type is Bearer', cc.json?.token_type === 'Bearer');
  check('expires_in is a positive number', Number(cc.json?.expires_in) > 0, String(cc.json?.expires_in));

  // Authorization code + PKCE (S256)
  const verifier = b64url(crypto.getRandomValues(new Uint8Array(32)));
  const challenge = b64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)));

  const authQuery = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: goodUri,
    scope: 'mysticdo:read',
    code_challenge: challenge,
    code_challenge_method: 'S256',
    state: 'xyz123',
  });
  const authRes = await call('/oauth/authorize?' + authQuery.toString(), { redirect: 'manual' });
  check('authorize → 302', authRes.status === 302, `status=${authRes.status}`);
  const location = authRes.headers.get('Location') || '';
  check('authorize redirects to the registered redirect_uri', location.startsWith(goodUri), location);
  check('authorize preserves state', location.includes('state=xyz123'));
  const code = safeParam(location, 'code') || '';
  check('authorize returns a code', code.startsWith('mcode_'));

  const exchange = await getJson('/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      redirect_uri: goodUri,
      code_verifier: verifier,
    }).toString(),
  });
  check('authorization_code + PKCE → access_token', typeof exchange.json?.access_token === 'string', JSON.stringify(exchange.json));

  const wrongVerifier = await getJson('/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      redirect_uri: goodUri,
      code_verifier: b64url(crypto.getRandomValues(new Uint8Array(32))),
    }).toString(),
  });
  check('wrong code_verifier → invalid_grant', wrongVerifier.json?.error === 'invalid_grant', JSON.stringify(wrongVerifier.json));

  const noPkce = await call('/oauth/authorize?' + new URLSearchParams({
    response_type: 'code', client_id: clientId, redirect_uri: goodUri,
  }).toString(), { redirect: 'manual' });
  check('authorize without PKCE → redirect error=invalid_request', (noPkce.headers.get('Location') || '').includes('error=invalid_request'), noPkce.headers.get('Location'));

  const plainPkce = await call('/oauth/authorize?' + new URLSearchParams({
    response_type: 'code', client_id: clientId, redirect_uri: goodUri,
    code_challenge: 'abc', code_challenge_method: 'plain',
  }).toString(), { redirect: 'manual' });
  check('authorize with method=plain → rejected', (plainPkce.headers.get('Location') || '').includes('error=invalid_request'));

  const evilRedirect = await call('/oauth/authorize?' + new URLSearchParams({
    response_type: 'code', client_id: clientId, redirect_uri: 'https://attacker.example/cb',
    code_challenge: challenge, code_challenge_method: 'S256',
  }).toString(), { redirect: 'manual' });
  check('authorize with unregistered redirect_uri → 400, no redirect', evilRedirect.status === 400, `status=${evilRedirect.status}`);

  const badClient = await call('/oauth/authorize?response_type=code&client_id=mc_forged.sig', { redirect: 'manual' });
  check('authorize with a forged client_id → 400', badClient.status === 400);

  const badGrant = await getJson('/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=password',
  });
  check('unsupported grant → unsupported_grant_type', badGrant.json?.error === 'unsupported_grant_type', JSON.stringify(badGrant.json));

  const revoke = await call('/oauth/revoke', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'token=x' });
  check('revoke → 200', revoke.status === 200);
}

/* ══════════════════════ 6. content layer regressions ══════════════════════ */

group('content layer (regressions)');
{
  const html = await call('/guides/psychic-vs-tarot.html');
  const htmlText = await html.text();
  check('page → 200 html', html.status === 200 && (html.headers.get('Content-Type') || '').includes('text/html'));
  check('page still contains its H1 (site not broken)', htmlText.includes('Psychic vs Tarot'));
  check('page carries the Link header', (html.headers.get('Link') || '').includes('api-catalog'));

  const md = await call('/guides/psychic-vs-tarot.html', { headers: { Accept: 'text/markdown' } });
  const mdText = await md.text();
  check('Accept: text/markdown → text/markdown', (md.headers.get('Content-Type') || '').startsWith('text/markdown'), md.headers.get('Content-Type'));
  check('markdown body is substantial', mdText.length > 800, `len=${mdText.length}`);
  check('markdown has no <html> shell', !mdText.includes('<html'));
  check('markdown response carries the Link header', (md.headers.get('Link') || '').includes('api-catalog'));
  check('markdown response sets Vary: Accept', (md.headers.get('Vary') || '').includes('Accept'));

  const browserish = await call('/', { headers: { Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' } });
  check('browser Accept header → HTML (no accidental negotiation)', (browserish.headers.get('Content-Type') || '').includes('text/html'));

  const missing = await call('/this-page-does-not-exist-at-all');
  check('unknown path → 404', missing.status === 404, `status=${missing.status}`);

  const { default: worker } = await import('../worker/index.js');
  const www = await worker.fetch(new Request('https://www.mysticdo.com/psychic/', { redirect: 'manual' }), env);
  check('www → apex 301', www.status === 301, `status=${www.status}`);
  check('www 301 Location keeps the path', (www.headers.get('Location') || '').includes('/psychic/'), www.headers.get('Location'));

  const preview = await worker.fetch(new Request('https://mysticdo.example.workers.dev/'), env);
  check('preview host is served, not redirected', preview.status === 200, `status=${preview.status}`);
}

/* ══════════════════════ 7. cross-document consistency ══════════════════════ */

group('cross-document consistency');
{
  const card = (await getJson('/.well-known/mcp/server-card.json')).json;
  const prm = (await getJson('/.well-known/oauth-protected-resource')).json;
  const oas = (await getJson('/.well-known/oauth-authorization-server')).json;
  const ard = (await getJson('/.well-known/ai-catalog.json')).json;
  const idx = (await getJson('/.well-known/agent-skills/index.json')).json;
  const openapi = (await getJson('/.well-known/openapi.json')).json;

  check('PRM resource === server card endpoint', prm.resource === card.endpoint, `${prm.resource} vs ${card.endpoint}`);
  check('PRM authorization_servers[0] === AS issuer', prm.authorization_servers[0] === oas.issuer);
  check('AS issuer === origin', oas.issuer === ORIGIN);
  check('AS token_endpoint is advertised in openapi paths', Boolean(openapi.paths['/oauth/token']));
  check('AS scopes match PRM scopes', JSON.stringify(oas.scopes_supported) === JSON.stringify(prm.scopes_supported));

  const ardUrls = (ard.entries || []).map((e) => e.url);
  check('ARD references the skills index', ardUrls.some((u) => u.endsWith('/agent-skills/index.json')), ardUrls.join(' | '));
  check('ARD references the content index', ardUrls.some((u) => u.endsWith('/assets/data/content-index.json')));

  const skillUrls = (idx.skills || []).map((s) => s.url);
  check('ARD does not promise a skill URL that is missing', skillUrls.every((u) => u.startsWith('/.well-known/agent-skills/')));
}

/* ══════════════════════ report ══════════════════════ */

const failed = results.filter((r) => !r.ok);
let lastGroup = '';
for (const r of results) {
  if (r.group !== lastGroup) {
    console.log('\n── ' + r.group + ' ' + '─'.repeat(Math.max(0, 58 - r.group.length)));
    lastGroup = r.group;
  }
  console.log((r.ok ? '  PASS  ' : '  FAIL  ') + r.name + (!r.ok && r.detail ? '\n          → ' + r.detail : ''));
}

console.log('\n' + '='.repeat(66));
console.log(`  ${results.length - failed.length} passed, ${failed.length} failed, ${results.length} total`);
console.log('='.repeat(66));

process.exit(failed.length ? 1 : 0);
