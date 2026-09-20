/* One-off probe for a single page: node _design-check/one.js <path> [width] */
const { execFileSync } = require('child_process');
const page = process.argv[2] || '/index.html';
const W = process.argv[3] || '390';
const url = `http://127.0.0.1:8765/_design-check/_probe-audit.html?p=${encodeURIComponent(page)}&w=${W}`;
let dom = '';
try {
  dom = execFileSync('C:/Program Files/Google/Chrome/Application/chrome.exe', [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--user-data-dir=C:/Users/samja/AppData/Local/Temp/one-' + Date.now(),
    '--window-size=900,1400', '--virtual-time-budget=12000', '--dump-dom', url
  ], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
} catch (e) { dom = (e.stdout || '') + ''; }
const m = dom.match(/PROBE_JSON:([\s\S]*?):END_PROBE_JSON/);
if (!m) { console.log('NO OUTPUT', dom.slice(0, 400)); process.exit(1); }
const r = JSON.parse(m[1]);
console.log(`${page} @${W}  scrollW=${r.docScrollWidth}/${r.innerWidth}  body=${r.bodyScrollWidth}`);
console.log('counts', JSON.stringify(r.counts));
console.log('\n-- OVERFLOW --');
r.overflow.slice(0, 30).forEach(o => console.log(`  ${o.sel}\n     left=${o.left} right=${o.right} w=${o.w}`));
console.log('\n-- CLIPPED (glyphs outside the box) --');
r.clipped.slice(0, 30).forEach(o => console.log(`  boxW=${o.boxW} cutL=${o.cutLeft} cutR=${o.cutRight}  ${o.sel}\n     "${o.text}"`));
console.log('\n-- TAP <44 --');
r.tap.slice(0, 60).forEach(o => console.log(`  ${o.w}x${o.h}  ${o.sel}  "${o.text}"`));
console.log('\n-- FONT <12px --');
r.tinyFont.slice(0, 60).forEach(o => console.log(`  ${o.px}px  ${o.sel}  "${o.text}"`));
console.log('\n-- WIDE FIXED --');
r.wideFixed.forEach(o => console.log(`  ${o.pos} w=${o.w} ${o.sel}`));
