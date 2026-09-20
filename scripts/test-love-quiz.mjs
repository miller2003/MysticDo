/* Smoke test for the does-he-love-me quiz logic.
 * Loads quizzes.js in a minimal window/document/posthog mock, then
 * exercises resolve() / matchPractice() / underneath() / customResult()
 * across every signal-question combo plus intent sweeps. Catches
 * undefined-result keys, missing practice notes, and render crashes.
 * Run: node scripts/test-love-quiz.mjs  (ESM via .mjs, package.json type:module)
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src = readFileSync(path.join(root, 'assets/js/quizzes.js'), 'utf8');

// Mock browser globals quizzes.js depends on (only `window`).
globalThis.window = {};
// Execute the file — it assigns window.MYSTICDO_QUIZZES = {...}
// It's an IIFE-free assignment; eval in non-strict global scope.
eval(src);

const QZ = window.MYSTICDO_QUIZZES['does-he-love-me'];
if (!QZ) throw new Error('does-he-love-me quiz not registered');

let failures = 0;
let checks = 0;
function ok(cond, msg) {
  checks++;
  if (!cond) { failures++; console.error('  FAIL:', msg); }
}

// Enumerate every option value for each question (from the quiz itself).
const optValues = qid => QZ.questions.find(q => q.id === qid).options.map(o => o.score);

// 1. Every result key referenced by resolve must exist in QZ.results.
const RESULT_KEYS = Object.keys(QZ.results);
ok(RESULT_KEYS.length === 5, 'exactly 5 pattern results (no love score) — got ' + RESULT_KEYS.length);

// 2. Every practice referenced by matchPractice must exist in QZ.practice.
const PRACTICE_KEYS = Object.keys(QZ.practice);
ok(PRACTICE_KEYS.length === 7, 'exactly 7 practice outcomes — got ' + PRACTICE_KEYS.length);

// 3. Walk the four SIGNAL questions exhaustively; collect distinct outcomes.
const comms = optValues('communication');
const eff   = optValues('effort');
const space = optValues('space');
const align = optValues('alignment');
const seenPattern = new Set();
let comboCount = 0;
const base = { status: 'dating', trigger: 'inconsistent', want: 'feelings', help: 'insight' };
for (const c of comms) for (const e of eff) for (const s of space) for (const al of align) {
  const a = { ...base, communication: c, effort: e, space: s, alignment: al };
  const k = QZ.resolve(a);
  ok(RESULT_KEYS.includes(k), `resolve returns valid pattern for combo ${c}/${e}/${s}/${al} → ${k}`);
  seenPattern.add(k);
  comboCount++;
}
console.log(`  walked ${comboCount} signal combos; ${seenPattern.size} distinct patterns`);
ok(seenPattern.size === 5, 'all 5 patterns are reachable by some combo (else the model is lopsided)');

// 4. Sweep the two intent questions; every matchPractice output must be a real key.
const wants = optValues('want');
const helps = optValues('help');
const seenPractice = new Set();
for (const w of wants) for (const h of helps) {
  const a = { ...base, want: w, help: h };
  const k = QZ.matchPractice(a);
  ok(PRACTICE_KEYS.includes(k), `matchPractice returns valid key for want=${w}/help=${h} → ${k}`);
  seenPractice.add(k);
}
console.log(`  walked ${wants.length*helps.length} intent combos; ${seenPractice.size} distinct practices`);
ok(seenPractice.size >= 6, 'at least 6 of 7 practices are reachable (free_first/general included)');

// 5. underneath returns a known key or null for a few representative scenarios.
const scenarios = [
  { name: 'exes + distant → closure', a: { status:'exes', trigger:'distant', communication:'barely', effort:'me', space:'worse', alignment:'contradict', want:'still', help:'insight' }, expect: 'closure' },
  { name: 'complicated + mixed → cycle', a: { status:'complicated', trigger:'inconsistent', communication:'hotcold', effort:'variable', space:'nothing', alignment:'notvery', want:'feelings', help:'insight' }, expect: 'cycle' },
  { name: 'want=wait → decision', a: { status:'together', trigger:'clarity', communication:'consistent', effort:'equal', space:'stays', alignment:'very', want:'wait', help:'guidance' }, expect: 'decision' },
  { name: 'positive + unknown trigger → reassurance', a: { status:'together', trigger:'unknown', communication:'consistent', effort:'him', space:'notices', alignment:'very', want:'feelings', help:'insight' }, expect: 'reassurance' },
  { name: 'want=beneath → meaning', a: { status:'talking', trigger:'changed', communication:'frequent', effort:'equal', space:'stays', alignment:'usually', want:'beneath', help:'deeper' }, expect: 'meaning' },
  { name: 'no underneath (clean case)', a: { status:'dating', trigger:'inconsistent', communication:'reactive', effort:'me', space:'returns', alignment:'sometimes', want:'going', help:'heading' }, expect: null }
];
for (const sc of scenarios) {
  const u = QZ.underneath(sc.a, QZ.resolve(sc.a));
  ok((u ? u.key : null) === sc.expect, `${sc.name} → ${sc.expect} (got ${u ? u.key : null})`);
}

// 6. customResult must render without throwing and produce all three blocks.
function renderOnce(a) {
  let html = '';
  const stubBody = { innerHTML: '', querySelector: () => null };
  const ctx = {
    answers: a,
    body: stubBody,
    emailFormHTML: () => '<div class="email-form-stub"></div>',
    bindEmailForms: () => {},
    restart: () => {}
  };
  // make innerHTML assignment observable
  Object.defineProperty(stubBody, 'innerHTML', { get: () => html, set: v => { html = v; }, configurable: true });
  QZ.customResult(ctx);
  return html;
}
let renderCrashes = 0;
for (const w of wants) for (const h of helps) for (const al of align) {
  const a = { status:'talking', trigger:'distant', communication:'reactive', effort:'me', space:'returns', alignment:al, want:w, help:h };
  try {
    const html = renderOnce(a);
    ok(html.includes('love-result') && html.includes('What your answers suggest') && html.includes('What they don') && html.includes('What to look at next'), `render has 3 fixed blocks for want=${w}/help=${h}/align=${al}`);
  } catch (e) {
    renderCrashes++; failures++;
    console.error('  RENDER CRASH for', { w, h, al }, '\n', e.stack);
  }
}
ok(renderCrashes === 0, 'customResult never throws across the intent×alignment sweep');

// 7. Render one full case end-to-end and dump a snippet to eyeball.
const sample = renderOnce({ status:'complicated', trigger:'inconsistent', communication:'hotcold', effort:'me', space:'worse', alignment:'contradict', want:'still', help:'insight' });
console.log('\n--- sample render (first 600 chars) ---');
console.log(sample.slice(0, 600));

console.log('\n' + (failures === 0 ? 'ALL GREEN' : failures + ' FAILURE(S)'));
process.exit(failures === 0 ? 0 : 1);
