/* Quiz result-render smoke test — the gate that was missing.
 *
 * Background (2026-09-22 pre-launch audit): three generations of intent-page
 * batches shipped three different `results[pattern]` shapes, and 15 of the 20
 * newest quizzes died at the result step — 10 threw `r.suggest is not a
 * function`, 5 kept the legacy `customResult(pKey, rKey, answers) { return
 * null; }` signature and rendered nothing. Every existing test passed anyway,
 * because `test-batch*-quizzes.mjs` only asserts static structure (8 questions
 * / 5-6 patterns / 7 practice keys / resolve + matchPractice) and never
 * invokes the renderer.
 *
 * This test walks EVERY quiz object and renders EVERY pattern through the real
 * `customResult` path that main.js uses, then fails on:
 *   - a thrown exception            (CRASH)
 *   - a renderer that writes nothing (BLANK — the user is stranded on the
 *     "Analyzing your pattern" ceremony forever)
 *   - literal "undefined"/"null"/"NaN" leaking into the result HTML
 *   - an empty suggestion / don't-tell / watch block
 *
 * Run: node scripts/test-quiz-render.mjs
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const src = readFileSync(path.join(ROOT, 'assets/js/quizzes.js'), 'utf8');

/* Scores differ per generation: numbers for the signal questions, string keys
   for context/intent. Enumerate every option of every question, plus a null
   branch, so resolve() and matchPractice() are exercised broadly. */
const answersFor = (QZ, pick) => {
  const a = {};
  for (const q of QZ.questions) {
    const os = q.options || [];
    a[q.id] = pick === 'null' ? null : (os.length ? os[Math.min(pick, os.length - 1)].score : null);
  }
  return a;
};

const win = {};
new Function('window', 'document', 'navigator', 'location', src)(
  win,
  { querySelectorAll: () => [], addEventListener() {}, querySelector: () => null },
  { userAgent: 'node' },
  { search: '', hash: '' }
);
const Q = win.MYSTICDO_QUIZZES;

const makeBody = () => ({
  _h: '',
  set innerHTML(v) { this._h = v; },
  get innerHTML() { return this._h; },
  querySelector: () => null,
  querySelectorAll: () => [],
});

const unesc = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&#39;/g, "'").replace(/&quot;/g, '"');

let checks = 0;
const fails = [];
const fail = (msg) => fails.push(msg);

const slugs = Object.keys(Q).sort();
let rendered = 0, defaults = 0;
/* The all-null answer set is only reachable when the quiz actually offers an
   "unsure" option (score === null). Quizzes without one can never produce it,
   so testing it there would report an unreachable state as a failure. */
const pickModesFor = (QZ) => {
  const hasNullOption = (QZ.questions || []).some(
    (q) => (q.options || []).some((o) => o.score === null || o.score === undefined)
  );
  return hasNullOption ? [0, 1, 'null'] : [0, 1];
};

for (const slug of slugs) {
  const QZ = Q[slug];
  checks++;
  if (!QZ || !Array.isArray(QZ.questions) || !QZ.questions.length) {
    fail(slug + ': no questions'); continue;
  }
  if (typeof QZ.resolve !== 'function') { fail(slug + ': resolve is not a function'); continue; }

  /* Quizzes without customResult use main.js's own renderer, which reads a
     different (category) shape. Out of scope here — but resolve must still
     return a known key so the engine renderer can find it. */
  if (typeof QZ.customResult !== 'function') {
    defaults++;
    for (const mode of pickModesFor(QZ)) {
      const a = answersFor(QZ, mode);
      checks++;
      try {
        const k = QZ.resolve(a);
        if (!(k in QZ.results)) fail(slug + ': resolve(' + mode + ') -> unknown key ' + k);
      } catch (e) { fail(slug + ': resolve(' + mode + ') threw ' + e.message); }
    }
    continue;
  }

  const patterns = Object.keys(QZ.results || {});
  checks++;
  if (!patterns.length) { fail(slug + ': customResult but no results'); continue; }

  for (const mode of pickModesFor(QZ)) {
    const a = answersFor(QZ, mode);
    for (const p of patterns) {
      checks++;
      /* Force each pattern through the renderer by pinning resolve(). */
      const realResolve = QZ.resolve;
      QZ.resolve = () => p;
      const body = makeBody();
      let err = null;
      try {
        QZ.customResult({ answers: a, body, restart() {} });
      } catch (e) {
        err = e;
      } finally {
        QZ.resolve = realResolve;
      }
      const html = body.innerHTML || '';
      if (err) { fail(slug + '/' + p + '/' + mode + ': THREW ' + err.message); continue; }
      if (html.length < 400) { fail(slug + '/' + p + '/' + mode + ': BLANK (' + html.length + ' chars)'); continue; }
      const plain = unesc(html);
      /* Only a value that *became* a text node counts as a leak. The words
         "undefined"/"null" also occur legitimately in editorial prose
         (e.g. the pattern "Building but undefined"), so match on the tag
         boundary, not on the bare word. */
      const leak = plain.match(/>(?:\s*)(undefined|null|NaN)(?:\s*)</);
      if (leak) fail(slug + '/' + p + '/' + mode + ': literal "' + leak[1] + '" leaked into the DOM');
      if (/<ul>\s*<\/ul>/.test(plain)) fail(slug + '/' + p + '/' + mode + ': empty list rendered');
      if (/What your answers suggest<\/h3>\s*<p>\s*<\/p>/.test(plain)) fail(slug + '/' + p + ': empty suggestion block');
      if (/don\u2019t tell you<\/h3>\s*<p>\s*<\/p>/.test(plain)) fail(slug + '/' + p + ': empty don\u2019t-tell block');
      rendered++;
    }
  }
}

console.log('QUIZ RENDER: ' + slugs.length + ' quizzes (' + defaults + ' engine-rendered), '
  + rendered + ' pattern renders, ' + checks + ' checks');
if (fails.length) {
  console.log('\n--- FAILURES (' + fails.length + ', first 40) ---');
  fails.slice(0, 40).forEach((f) => console.log('  FAIL ' + f));
  if (fails.length > 40) console.log('  … ' + (fails.length - 40) + ' more');
  console.log('\nQUIZ RENDER: ' + fails.length + ' FAILURES');
  process.exit(1);
}
console.log('QUIZ RENDER: ALL GREEN (CRASH 0, BLANK 0, no leaked undefined)');
