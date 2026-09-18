/* Mobile visual audit runner — headless Chrome + same-origin iframe probe.
   Usage: node _design-check/audit.js [width]
   Writes _design-check/audit-<width>.json and prints a summary. */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT   = path.resolve(__dirname, '..');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE   = 'http://127.0.0.1:8765';
const WIDTH  = process.argv[2] || '390';
const PROBE  = '/_design-check/_probe-audit.html';

const SKIP_DIRS = new Set(['_design-check', 'assets', 'scripts', 'functions', 'worker', 'node_modules', '.git', '.workbuddy', 'logo-drafts', 'guides-tmp']);

function walk(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name) || e.name.startsWith('.')) continue;
      walk(path.join(dir, e.name), acc);
    } else if (e.name.endsWith('.html')) {
      acc.push('/' + path.relative(ROOT, path.join(dir, e.name)).split(path.sep).join('/'));
    }
  }
  return acc;
}

const pages = walk(ROOT, []).sort();
const results = [];

pages.forEach((p, i) => {
  const url = `${BASE}${PROBE}?p=${encodeURIComponent(p)}&w=${WIDTH}`;
  const profile = `C:/Users/samja/AppData/Local/Temp/probe-${WIDTH}-${i}`;
  let dom = '';
  try {
    dom = execFileSync(CHROME, [
      '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
      '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
      `--user-data-dir=${profile}`,
      '--window-size=900,1200',
      '--virtual-time-budget=12000',
      '--dump-dom', url
    ], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, timeout: 120000 });
  } catch (err) {
    dom = (err.stdout || '') + '';
  }
  const m = dom.match(/PROBE_JSON:([\s\S]*?):END_PROBE_JSON/);
  if (!m) { results.push({ page: p, width: Number(WIDTH), error: 'no probe output' }); return; }
  results.push(JSON.parse(m[1]));
  process.stdout.write(`${i + 1}/${pages.length} ${p}\n`);
  try { fs.rmSync(profile, { recursive: true, force: true }); } catch (e) {}
});

const outFile = path.join(__dirname, `audit-${WIDTH}.json`);
fs.writeFileSync(outFile, JSON.stringify(results, null, 1));

console.log('\n===== SUMMARY @' + WIDTH + 'px =====');
results.forEach(r => {
  if (r.error) { console.log(`\n!! ${r.page} -> ${r.error}`); return; }
  const c = r.counts;
  const bad = c.overflow || c.clipped || c.wideFixed;
  console.log(`\n${bad ? '>>>' : '   '} ${r.page}  scrollW=${r.docScrollWidth}/${r.innerWidth}  overflow=${c.overflow} clipped=${c.clipped} tap<44=${c.tap} font<12px=${c.tinyFont} wideFixed=${c.wideFixed}`);
  r.overflow.slice(0, 6).forEach(o => console.log(`      OVERFLOW ${o.sel} [${o.left}..${o.right}] w=${o.w}`));
  r.clipped.slice(0, 6).forEach(o => console.log(`      CLIPPED  boxW=${o.boxW} cutL=${o.cutLeft} cutR=${o.cutRight} ${o.sel} "${o.text}"`));
  r.wideFixed.slice(0, 4).forEach(o => console.log(`      FIXED    ${o.sel} w=${o.w} ${o.pos}`));
});
console.log('\nWrote ' + outFile);
