/* Full-result shot runner.
   node _design-check/result.cjs <slug> <answers> <width> <tag>
   Renders _probe-result.html inline (no modal), measures full height,
   then captures the entire result page in one frame.
   answers: qid:val pairs separated by ';' (same syntax as the probe). */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://127.0.0.1:8765/_design-check/_probe-result.html';
const OUTDIR = path.join(__dirname, 'shots');
if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR, { recursive: true });

const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
const slug = args[0] || 'does-he-love-me';
const answers = args[1] || '';
const W = args[2] || '390';
const tag = args[3] || ('result-' + slug + '-' + W);
const dsf2 = process.argv.includes('--dsf2');

const url = `${BASE}?quiz=${encodeURIComponent(slug)}&a=${encodeURIComponent(answers)}`;

function chrome(extra) {
  return execFileSync(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--user-data-dir=C:/Users/samja/AppData/Local/Temp/s' + Math.random().toString(36).slice(2),
    ...extra
  ], { encoding: 'utf8', maxBuffer: 512 * 1024 * 1024, timeout: 300000 });
}

let dom = '';
try { dom = chrome(['--window-size=' + W + ',1000', '--virtual-time-budget=6000', '--dump-dom', url]); }
catch (e) { dom = (e.stdout || '') + ''; }
const m = dom.match(/<pre id="probe-h">([^<]*)<\/pre>/);
const status = m ? m[1] : 'MEASURE FAILED';

/* Estimate height: dump scrollHeight through a second probe pass is
   overkill — shoot tall and let the page end where it ends. */
const shot = path.join(OUTDIR, tag + '.png');
try {
  chrome(['--window-size=' + W + ',5200',
          '--force-device-scale-factor=' + (dsf2 ? 2 : 1),
          '--virtual-time-budget=6000', '--screenshot=' + shot, url]);
} catch (e) { console.log('shot err', e.message); }

console.log(tag + ' | ' + status + ' | ' + shot);
