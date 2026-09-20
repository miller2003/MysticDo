/* Modal-quiz shot runner.
   node _design-check/modal.cjs <path> <width> <vh> <open hero|launcher> <clicks> <tag>
   Viewport-mode capture: the iframe is W x VH so the fixed overlay frames
   exactly like a real device viewport. No slicing (single frame). */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://127.0.0.1:8765/_design-check/_probe-modal.html';
const OUTDIR = path.join(__dirname, 'shots');
if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR, { recursive: true });

const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
const dsf2 = process.argv.includes('--dsf2');

const page   = args[0] || '/index.html';
const W      = args[1] || '390';
const VH     = args[2] || '844';
const open   = args[3] || 'hero';
const clicks = args[4] || '0';
const tag    = args[5] || ('modal-' + W + '-' + open + '-c' + clicks);

const url = `${BASE}?p=${encodeURIComponent(page)}&w=${W}&vh=${VH}&open=${open}&clicks=${clicks}&settle=1`;
const budget = String(9000 + Number(clicks) * 900);

function chrome(extra) {
  return execFileSync(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--user-data-dir=C:/Users/samja/AppData/Local/Temp/s' + Math.random().toString(36).slice(2),
    ...extra
  ], { encoding: 'utf8', maxBuffer: 512 * 1024 * 1024, timeout: 300000 });
}

let dom = '';
try { dom = chrome(['--window-size=900,1400', '--virtual-time-budget=' + budget, '--dump-dom', url]); }
catch (e) { dom = (e.stdout || '') + ''; }
const m = dom.match(/PROBE_H:(\d+):W:(\d+):VH:(\d+):([^:]*):END_H/);
if (!m) { console.log('MEASURE FAILED ' + page + ' :: ' + dom.slice(-400)); process.exit(1); }
const status = m[4];

const shot = path.join(OUTDIR, tag + '.png');
try {
  chrome(['--window-size=' + (Number(W) + 40) + ',' + (Number(VH) + 120),
          '--force-device-scale-factor=' + (dsf2 ? 2 : 1),
          '--virtual-time-budget=' + budget, '--screenshot=' + shot, url]);
} catch (e) { console.log('shot err', e.message); }

console.log(tag + ' | ' + page + ' | ' + status + ' | ' + shot);
