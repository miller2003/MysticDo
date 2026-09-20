/* Shot runner — true-width mobile capture.
   node _design-check/shot.js <path> [width] [clicks] [state] [tag] [--dsf2] [--noslice]
   2-pass: measure iframe height, then screenshot at that height, then crop+slice. */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PY = 'C:/Users/samja/.workbuddy/binaries/python/envs/default/Scripts/python.exe';
const BASE = 'http://127.0.0.1:8765/_design-check/_probe-shot.html';
const OUTDIR = path.join(__dirname, 'shots');
if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR, { recursive: true });

const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
const dsf2 = process.argv.includes('--dsf2');
const noslice = process.argv.includes('--noslice');

const page = args[0] || '/index.html';
const W = args[1] || '390';
const clicks = args[2] || '0';
const state = args[3] || 'plain';
const tag = args[4] || (page.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') + '-' + state + (clicks !== '0' ? '-c' + clicks : ''));

const url = `${BASE}?p=${encodeURIComponent(page)}&w=${W}&clicks=${clicks}&state=${encodeURIComponent(state)}`
  + (process.env.PROBE_CSS ? '&css=' + encodeURIComponent(process.env.PROBE_CSS) : '');
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
const m = dom.match(/PROBE_H:(\d+):W:(\d+):([^:]*):END_H/);
if (!m) { console.log('MEASURE FAILED ' + page); process.exit(1); }
const H = Math.min(Number(m[1]), 24000);

const shot = path.join(OUTDIR, tag + '.png');
try {
  chrome(['--window-size=' + (Number(W) + 40) + ',' + (H + 120),
          '--force-device-scale-factor=' + (dsf2 ? 2 : 1),
          '--virtual-time-budget=' + budget, '--screenshot=' + shot, url]);
} catch (e) { console.log('shot err', e.message); }

console.log(tag + ' | ' + page + ' | h=' + H + ' | ' + shot);
if (!noslice) {
  try {
    const r = execFileSync(PY, [path.join(__dirname, 'slice390.py'), shot,
      path.join(OUTDIR, tag), dsf2 ? '1900' : '1000', dsf2 ? '190' : '100',
      dsf2 ? '40' : '20', dsf2 ? '780' : '390'],
      { encoding: 'utf8' });
    console.log(r.trim());
  } catch (e) { console.log('slice err', e.message); }
}
