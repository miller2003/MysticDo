/* Runtime proof: render EVERY intent quiz's result through the real
   shared renderer with stubbed DOM. Reports exact crash + line cause. */
import { readFileSync } from 'node:fs';
import { resolve as presolve } from 'node:path';
import vm from 'node:vm';

const ROOT = presolve(import.meta.dirname, '..');
const src = readFileSync(presolve(ROOT, 'assets/js/quizzes.js'), 'utf8');

const sandbox = { window: {}, console, setTimeout: (f) => f() };
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(src + '\n;globalThis.__Q = window.MYSTICDO_QUIZZES; globalThis.__R = window.mysticdoPatternResult; globalThis.__TPS = window.topicPracticeSet; globalThis.__TMA = window.topicMatchAha;', sandbox, { filename: 'quizzes.js' });

const Q = sandbox.__Q, R = sandbox.__R, TPS = sandbox.__TPS, TMA = sandbox.__TMA;
const slugs = Object.keys(Q);

function stubBody() {
  return {
    innerHTML: '',
    querySelector: () => null,
    querySelectorAll: () => []
  };
}
function firstAnswers(quiz) {
  const a = {};
  for (const qn of quiz.questions) a[qn.id] = qn.options[0].score;
  return a;
}
function midAnswers(quiz) {
  const a = {};
  for (const qn of quiz.questions) a[qn.id] = qn.options[Math.floor(qn.options.length / 2)].score;
  return a;
}

console.log('topicPracticeSet exists:', typeof TPS, '| topicMatchAha exists:', typeof TMA);
if (typeof TPS === 'function') {
  const sample = TPS({ topic: 'x', cluster: 'angel-numbers' });
  console.log('topicPracticeSet keys:', Object.keys(sample).join(','));
  const missing = [];
  for (const [k, v] of Object.entries(sample)) {
    if (!v.secondary) missing.push(k + ':no-secondary');
    if (!v.href) missing.push(k + ':no-href');
    if (!v.cta) missing.push(k + ':no-cta');
    if (!v.note) missing.push(k + ':no-note');
  }
  console.log('topicPracticeSet shape issues:', missing.length ? missing.join(', ') : 'none');
}

const results = [];
for (const slug of slugs) {
  const q = Q[slug];
  if (typeof q.customResult !== 'function') { results.push({ slug, ok: null, note: 'no customResult (category quiz)' }); continue; }
  for (const [label, mk] of [['first', firstAnswers], ['mid', midAnswers]]) {
    const a = mk(q);
    try {
      let pattern = q.resolve(a);
      const body = stubBody();
      R({ answers: a, body, restart() {} }, slug, { resultV2: true });
      // structural sanity on rendered html
      const html = body.innerHTML;
      const bad = [];
      if (/([^a-zA-Z]|^)undefined([^a-zA-Z]|$)/.test(html.replace(/An undefined or unavailable person/g, ''))) bad.push('renders "undefined"');
      if (/NaN/.test(html)) bad.push('renders "NaN"');
      if (html.length < 1500) bad.push('suspiciously short output (' + html.length + ' chars)');
      results.push({ slug, ok: !bad.length, note: label + ' render ' + (bad.length ? '→ ' + bad.join('; ') : 'ok'), pattern });
    } catch (e) {
      results.push({ slug, ok: false, note: label + ' CRASH: ' + e.message, pattern: '—' });
      break; // one crash is enough to condemn the quiz
    }
  }
}

const crashed = results.filter(r => r.ok === false);
const flagged = results.filter(r => r.ok === false || (r.ok === null && false));
const clean = results.filter(r => r.ok === true);
const skipped = results.filter(r => r.ok === null);

console.log(`\nTOTAL quizzes: ${slugs.length} | render-verified OK: ${clean.length} | CRASHED: ${crashed.length} | non-intent skipped: ${skipped.length}`);
if (crashed.length) {
  console.log('\n── CRASHED QUIZZES (user reaches result screen and hits this) ──');
  for (const c of crashed) console.log(`  ✗ ${c.slug} [${c.note}] (pattern at crash: ${c.pattern})`);
}
console.log('\n── "undefined" leakage / short-output checks ──');
const leaky = results.filter(r => r.ok === true && /undefined|NaN/.test('') === false && r.note.includes('undefined'));
if (!leaky.length) console.log('  none among rendered-ok quizzes');
