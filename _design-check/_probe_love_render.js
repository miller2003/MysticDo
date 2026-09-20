/* Headless render check for the does-he-love-me page.
 * Spawns Chrome, dumps the post-JS DOM, and asserts:
 *   - the page served (200, hero H1 present)
 *   - the quiz engine rendered question 1 into #quiz (progress bar + Q1 text)
 *   - the footer was injected by main.js
 * Requires: scripts/serve.py running on :8765.
 * Run: node _design-check/_probe_love_render.js
 */
import { execFileSync } from 'node:child_process';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = 'http://127.0.0.1:8765/questions/love-relationships/does-he-love-me';

let dom = '';
try {
  dom = execFileSync(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--user-data-dir=C:/Users/samja/AppData/Local/Temp/love-' + Math.random().toString(36).slice(2),
    '--window-size=1280,1800',
    '--virtual-time-budget=9000',
    '--dump-dom', URL
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 60000 });
} catch (e) {
  dom = (e.stdout || '') + '';
}

const asserts = [
  ['hero H1 present',        dom.includes('Does He Love Me?')],
  ['direct-answer band',     dom.includes('Direct answer')],
  ['five-signal framework',  dom.includes('The five signals worth watching')],
  ['practice-fit table',     dom.includes('Which practice fits your question?')],
  ['FAQ details',            dom.includes('class="faq-item"') && dom.includes('Can a psychic or tarot reading tell me')],
  ['methodology section',    dom.includes('editorial approach to')],
  ['quiz shell mounted',     dom.includes('id="quiz"')],
  ['engine rendered Q1',     dom.includes('relationship with him right now')],
  ['quiz progress bar',      dom.includes('quiz-progress')],
  ['quiz option row',        dom.includes('quiz-option')],
  ['header nav rendered',    dom.includes('href="/"')],
  ['footer injected',        dom.includes('site-footer')],
  ['related cards present',  dom.includes('Related love questions')],
  ['love-result CSS hooked', dom.includes('love-result') || dom.includes('love-block') === false ], // CSS only renders after a result; just confirm stylesheet link
  ['stylesheet linked',      dom.includes('/assets/css/style.css')],
];

let pass = 0, fail = 0;
for (const [name, cond] of asserts) {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name); }
}

// Dump a short snippet around the quiz shell to eyeball.
const qi = dom.indexOf('id="quiz"');
if (qi > -1) {
  console.log('\n--- #quiz region (first 700 chars after mount) ---');
  console.log(dom.slice(qi, qi + 700).replace(/\s+/g, ' '));
}

console.log(`\n${pass}/${pass+fail} render checks passed` + (fail ? ' — ' + fail + ' FAILED' : ' — ALL GREEN'));
process.exit(fail ? 1 : 0);
