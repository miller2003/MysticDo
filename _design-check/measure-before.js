const { execFileSync } = require('child_process');
const PAGES = ['/index.html', '/404.html', '/astrology/index.html', '/psychic/index.html',
               '/medium/index.html', '/tarot/index.html'];
const W = process.argv[2] || '390';
for (const p of PAGES) {
  const url = `http://127.0.0.1:8765/_design-check/_probe-audit.html?p=${encodeURIComponent(p)}&w=${W}`;
  let dom = '';
  try {
    dom = execFileSync('C:/Program Files/Google/Chrome/Application/chrome.exe', [
      '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
      '--user-data-dir=C:/Users/samja/AppData/Local/Temp/cx' + Math.random().toString(36).slice(2),
      '--window-size=900,1400', '--virtual-time-budget=12000', '--dump-dom', url
    ], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
  } catch (e) { dom = (e.stdout || '') + ''; }
  const m = dom.match(/PROBE_JSON:([\s\S]*?):END_PROBE_JSON/);
  if (!m) { console.log(p + ' -> no output'); continue; }
  const r = JSON.parse(m[1]);
  if (!r.clipped.length) { console.log(`${p}  @${W}  clipped=0`); continue; }
  console.log(`${p}  @${W}`);
  r.clipped.forEach(c => console.log(`    boxW=${c.boxW}  cut ${c.cutLeft}px LEFT + ${c.cutRight}px RIGHT   "${c.text}"`));
}
