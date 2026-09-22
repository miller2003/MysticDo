/* Full-site quiz result-render simulation across all 71 quiz objects. */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const src = readFileSync(path.join(ROOT, 'assets/js/quizzes.js'), 'utf8');

const win = {};
new Function('window', 'document', 'navigator', 'location', src)(
  win, { querySelectorAll: () => [], addEventListener() {}, querySelector: () => null },
  { userAgent: 'node' }, { search: '', hash: '' });
const Q = win.MYSTICDO_QUIZZES;

const NEW = new Set(['333-meaning','444-meaning','555-meaning','777-meaning','888-meaning',
'what-is-my-moon-sign','what-is-my-saturn-return','am-i-in-the-right-career',
'dream-about-being-chased','dream-about-someone-dying','dream-about-your-ex',
'feeling-lost-in-life','dream-about-deceased-loved-one','is-my-loved-one-watching-over-me',
'signs-from-deceased-loved-ones','why-am-i-always-broke','will-i-be-rich',
'lovers-card-meaning','tarot-yes-or-no','tower-card-meaning']);

function makeBody() {
  return { _h: '', set innerHTML(v) { this._h = v; }, get innerHTML() { return this._h; },
    querySelector: () => null, querySelectorAll: () => [] };
}

const results = [];
for (const slug of Object.keys(Q)) {
  const q = Q[slug];
  if (typeof q.customResult !== 'function') { results.push([slug, 'DEFAULT', 0, 'no customResult -> engine default renderer']); continue; }
  const answers = {};
  for (const qq of q.questions || []) answers[qq.id] = (qq.options && qq.options[0]) ? qq.options[0].score : null;
  const body = makeBody();
  let err = null;
  try { q.customResult({ answers, body, restart() {} }); } catch (e) { err = e; }
  const html = body.innerHTML || '';
  if (err) results.push([slug, 'CRASH', 0, err.message.slice(0, 60)]);
  else if (html.length < 200) results.push([slug, 'BLANK', html.length, 'rendered almost nothing']);
  else results.push([slug, 'OK', html.length, '']);
}

const newCrash = results.filter(r => r[1] !== 'OK' && r[1] !== 'DEFAULT' && NEW.has(r[0]));
const oldBad = results.filter(r => r[1] !== 'OK' && r[1] !== 'DEFAULT' && !NEW.has(r[0]));

console.log('TOTAL quizzes: ' + results.length);
console.log('  OK:      ' + results.filter(r => r[1] === 'OK').length);
console.log('  DEFAULT: ' + results.filter(r => r[1] === 'DEFAULT').length);
console.log('  CRASH:   ' + results.filter(r => r[1] === 'CRASH').length);
console.log('  BLANK:   ' + results.filter(r => r[1] === 'BLANK').length);

console.log('\n=== BROKEN among the 20 NEW ===');
for (const r of newCrash) console.log('  ' + r[1].padEnd(7) + r[0].padEnd(34) + r[3]);
console.log('\n=== BROKEN among the 51 PRE-EXISTING ===');
if (!oldBad.length) console.log('  (none)');
for (const r of oldBad) console.log('  ' + r[1].padEnd(7) + r[0].padEnd(34) + r[3]);
