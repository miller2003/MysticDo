#!/usr/bin/env node
/**
 * MysticDo — WebMCP registration test.
 *
 * Headless Chrome has no navigator.modelContext, and the real API is behind an
 * origin trial, so this drives the site's own script against a recording stub:
 * it serves the project root, loads _design-check/webmcp-probe.html in headless
 * Chrome, and asserts that assets/js/main.js registered well-formed tools and
 * that a tool actually returns results from the real content index.
 *
 * This is the only way to verify the browser half of the agent surface without
 * a browser that implements WebMCP, and it also catches the failure that
 * matters most: a JS error in main.js silently taking down every page.
 *
 * Usage:  node scripts/test-webmcp.mjs
 * Exit:   0 pass · 1 fail · 2 environment problem (no Chrome)
 */

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8791;

const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  (process.env.LOCALAPPDATA || '') + '/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
};

const results = [];
const check = (name, ok, detail) => results.push({ name, ok: Boolean(ok), detail });

/* ══════════════════════ static server ══════════════════════ */

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://127.0.0.1');
    let rel = decodeURIComponent(url.pathname);
    if (rel.endsWith('/')) rel += 'index.html';

    const abs = path.resolve(ROOT, '.' + rel);
    if (!abs.startsWith(ROOT)) {
      res.writeHead(403).end('forbidden');
      return;
    }

    const info = await stat(abs).catch(() => null);
    if (!info || !info.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' }).end('not found');
      return;
    }

    const body = await readFile(abs);
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(abs).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store',
      Connection: 'close',
    });
    res.end(body);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' }).end(String(err && err.message));
  }
});

await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));

/* ══════════════════════ run Chrome ══════════════════════ */

const chromePath = CHROME_CANDIDATES.find((p) => p && existsSync(p));
if (!chromePath) {
  console.error('No Chrome found at any known path. Set one of:\n  ' + CHROME_CANDIDATES.join('\n  '));
  server.close();
  process.exit(2);
}

console.log('[1/4] serving ' + ROOT + ' on :' + PORT);
const probeUrl = `http://127.0.0.1:${PORT}/_design-check/webmcp-probe.html`;
console.log('[2/4] launching headless Chrome');
/**
 * ⚠️ Must be async. execFileSync would block Node's event loop, and this
 * process is also the HTTP server Chrome is talking to — the request would
 * never be answered and Chrome would hang until it timed out.
 */
function runChrome(url) {
  return new Promise((resolve, reject) => {
    execFile(
      chromePath,
      [
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        '--hide-scrollbars',
        '--disable-dev-shm-usage',
        '--no-first-run',
        '--disable-background-networking',
        '--virtual-time-budget=4000',
        '--dump-dom',
        url,
      ],
      { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 60000 },
      (err, stdout) => (err ? reject(err) : resolve(stdout)),
    );
  });
}


let dom = '';
try {
  dom = await runChrome(probeUrl);
} catch (err) {
  console.error('Chrome failed: ' + (err && err.message));
  server.close();
  process.exit(2);
}

console.log('[3/4] Chrome returned ' + dom.length + ' bytes');
server.close();

/* ══════════════════════ parse the probe report ══════════════════════ */

const match = dom.match(/<pre id="result">([\s\S]*?)<\/pre>/);
if (!match) {
  console.error('Probe marker not found — the page did not finish loading.');
  console.error(dom.slice(0, 1200));
  process.exit(1);
}

const raw = match[1]
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&amp;/g, '&');

let report;
try {
  report = JSON.parse(raw);
} catch (err) {
  console.error('Could not parse the probe report:\n' + raw.slice(0, 1500));
  process.exit(1);
}
if (!report || typeof report !== 'object') {
  console.error('Probe did not produce a report (still PENDING?). Raw:\n' + raw.slice(0, 600));
  process.exit(1);
}

/* ══════════════════════ assertions ══════════════════════ */

const tools = report.tools || [];
const names = tools.map((t) => t.name);

check('navigator.modelContext stub installed', report.stubOk === true, report.stubError || '');
check('site registered tools on page load', report.registerCallCount > 0, `registerTool calls=${report.registerCallCount}`);
check('four tools registered', report.registerCallCount === 4, `got ${report.registerCallCount}: ${names.join(', ')}`);
check('every tool has a description', tools.length > 0 && tools.every((t) => t.hasDescription));
check('every tool has a JSON-Schema inputSchema', tools.length > 0 && tools.every((t) => t.hasInputSchema));
check('every tool has an execute callback', tools.length > 0 && tools.every((t) => t.hasExecute));
check('AbortSignal passed through for unregistration', report.signalHonoured === true);
check('window.__mysticdoWebMcp introspection exposed', !!report.api2Recorded, JSON.stringify(report.api2Recorded));
check('expected tool names present',
  ['search_mysticdo', 'open_mysticdo_page', 'start_need_matcher', 'get_current_page_summary']
    .every((n) => names.includes(n)),
  names.join(', '));

const search = report.searchExercise || {};
check('search_mysticdo reaches the real content index', search.ok === true, search.reason || `count=${search.resultCount}`);
check('search result is site-relative and real', typeof search.firstPath === 'string' && search.firstPath.startsWith('/'), String(search.firstPath));
check('search returns the MCP-shaped content envelope', search.hasContentEnvelope === true);

const guard = report.navigationGuard || {};
check('open_mysticdo_page refuses an unknown path', guard.rejectedUnknownPath === true, guard.reason || guard.error || '');

/* ══════════════════════ main.js did not break the page ══════════════════════ */

check('main.js still injected the header', /id="site-header"[^>]*>\s*<header|class="site-header"/.test(dom), 'header markup missing from DOM');
check('main.js still injected the footer', /class="site-footer"|site-footer/.test(dom), 'footer markup missing from DOM');

/* ══════════════════════ report ══════════════════════ */

const failed = results.filter((r) => !r.ok);
for (const r of results) {
  console.log((r.ok ? '  PASS  ' : '  FAIL  ') + r.name + (!r.ok && r.detail ? '\n          → ' + r.detail : ''));
}
console.log('\n' + '='.repeat(60));
console.log(`  ${results.length - failed.length} passed, ${failed.length} failed, ${results.length} total`);
console.log('='.repeat(60));

process.exit(failed.length ? 1 : 0);
