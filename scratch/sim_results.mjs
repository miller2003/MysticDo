/* Runtime simulation: does customResult() throw for each new quiz? */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const src = readFileSync(path.join(ROOT, 'assets/js/quizzes.js'), 'utf8');

const win = {};
const doc = { querySelectorAll: () => [], addEventListener() {}, querySelector: () => null };
const nav = { userAgent: 'node' };
const loc = { search: '', hash: '' };
new Function('window', 'document', 'navigator', 'location', src)(win, doc, nav, loc);

const Q = win.MYSTICDO_QUIZZES;

const NEW = ['333-meaning','444-meaning','555-meaning','777-meaning','888-meaning',
'what-is-my-moon-sign','what-is-my-saturn-return','am-i-in-the-right-career',
'dream-about-being-chased','dream-about-someone-dying','dream-about-your-ex',
'feeling-lost-in-life','dream-about-deceased-loved-one','is-my-loved-one-watching-over-me',
'signs-from-deceased-loved-ones','why-am-i-always-broke','will-i-be-rich',
'lovers-card-meaning','tarot-yes-or-no','tower-card-meaning'];

function makeBody() {
  return {
    _html: '',
    set innerHTML(v) { this._html = v; },
    get innerHTML() { return this._html; },
    querySelector: () => null,
    querySelectorAll: () => [],
  };
}

let crashes = 0, ok = 0;
for (const slug of NEW) {
  const q = Q[slug];
  // build a full plausible answer set: first option of each question
  const answers = {};
  for (const qq of q.questions) answers[qq.id] = qq.options[0].score;

  const body = makeBody();
  const ctx = { answers, body, restart() {} };
  let err = null, html = '';
  try {
    q.customResult(ctx);
    html = body.innerHTML || '';
  } catch (e) {
    err = e;
  }

  const undef = (html.match(/>undefined</g) || []).length;
  const status = err ? 'CRASH' : (undef ? 'RENDERED-BUT-UNDEFINED x' + undef : 'OK');
  if (err) crashes++; else ok++;
  console.log(status.padEnd(28) + slug.padEnd(34) + (err ? err.message.slice(0, 70) : (html.length + ' chars')));
}

console.log('\n' + '='.repeat(70));
console.log('customResult(): ' + ok + ' rendered, ' + crashes + ' CRASHED');
