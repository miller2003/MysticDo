/* Logic test for the law-of-assumption quiz.
 * Dual-base exhaustive signal-combo walk + priority assertions + intent sweep
 * + underneath scenarios + render sweep + aha library check,
 * modeled on test-how-to-manifest-a-specific-person-quiz.mjs.
 * Run: node scripts/test-law-of-assumption-quiz.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src = readFileSync(path.join(root, 'assets/js/quizzes.js'), 'utf8');

globalThis.window = {};
eval(src);

const QZ = window.MYSTICDO_QUIZZES['law-of-assumption'];
if (!QZ) throw new Error('law-of-assumption quiz not registered');

let failures = 0;
let checks = 0;
function ok(cond, msg) {
  checks++;
  if (!cond) { failures++; console.error('  FAIL:', msg); }
}

const optValues = qid => QZ.questions.find(q => q.id === qid).options.map(o => o.score);

// 1. Five pattern results, seven practices.
const RESULT_KEYS = Object.keys(QZ.results);
ok(RESULT_KEYS.length === 5, 'exactly 5 pattern results — got ' + RESULT_KEYS.length);
ok(RESULT_KEYS.includes('not-enough-evidence'), 'not-enough-evidence present');
const PRACTICE_KEYS = Object.keys(QZ.practice);
ok(PRACTICE_KEYS.length === 7, 'exactly 7 practice outcomes — got ' + PRACTICE_KEYS.length);

// 2. Dual-base exhaustive signal-combo walk (state x felt x persist x self).
//    Base A: neville + satisfying — the source-reading context.
//    Base B: stalled + technique — the honest-doubt context.
//    (Bases deliberately avoid focus='evidence', which routes to bridge-engineering;
//     that gate is asserted separately below. resolve reads no door.)
const stateV = optValues('state');
const feltV = optValues('felt');
const persistV = optValues('persist');
const selfV = optValues('self');
const baseA = { door: 'neville', focus: 'satisfying', want: 'difference', help: 'reflection' };
const baseB = { door: 'stalled', focus: 'technique', want: 'difference', help: 'reflection' };
const seenPattern = new Set();
let comboCount = 0;
for (const [name, base] of [['A', baseA], ['B', baseB]]) {
  for (const st of stateV) for (const fe of feltV) for (const pe of persistV) for (const se of selfV) {
    const a = { ...base, state: st, felt: fe, persist: pe, self: se };
    const k = QZ.resolve(a);
    ok(RESULT_KEYS.includes(k), `resolve valid pattern for base ${name} combo ${st}/${fe}/${pe}/${se} → ${k}`);
    seenPattern.add(k);
    comboCount++;
  }
}
console.log(`  walked ${comboCount} signal combos across 2 bases; ${seenPattern.size} distinct patterns`);

// 3. Priority assertions — the resolution ladder in page order.
ok(QZ.resolve({ ...baseA, state: 'state', felt: 'contrary', persist: 'held', self: 'examined' }) === 'affirmation-gap', 'affirmation-gap via felt=contrary outranks all positive signals');
ok(QZ.resolve({ ...baseA, state: 'state', felt: 'inside', persist: 'reverts', self: 'examined' }) === 'bridge-engineering', 'bridge-engineering via persist=reverts outranks named+felt state work');
ok(QZ.resolve({ ...baseA, state: 'state', felt: 'inside', persist: 'held', self: 'examined', focus: 'evidence' }) === 'bridge-engineering', 'bridge-engineering via focus=evidence (the surveillance route)');
ok(QZ.resolve({ ...baseA, state: 'form', felt: 'performing', persist: 'held', self: 'examined' }) === 'form-fixation', 'form-fixation via form + performing');
ok(QZ.resolve({ ...baseA, state: 'form', felt: 'unsure', persist: 'held', self: 'examined' }) === 'form-fixation', 'form-fixation via form + uncertain felt');
ok(QZ.resolve({ ...baseA, state: 'state', felt: 'inside', persist: 'unsure', self: 'unsure' }) === 'state-inhabited', 'state-inhabited via named+inside outranks uncertain answers');
ok(QZ.resolve({ ...baseA, state: 'unsure', felt: 'unsure', persist: 'unsure', self: 'unsure' }) === 'not-enough-evidence', 'all-uncertain answers settle on not-enough-evidence');
ok(QZ.resolve({ ...baseA, state: 'wish', felt: 'performing', persist: 'mixed', self: 'aware' }) === 'not-enough-evidence', 'flat/negative sum settles on not-enough-evidence');
ok(QZ.resolve({ ...baseA, state: 'state', felt: 'inside', persist: 'held', self: 'examined' }) === 'state-inhabited', 'strong positive signals settle on state-inhabited');
ok(seenPattern.size === 5, 'all 5 patterns reachable — got ' + [...seenPattern].join(','));

// 4. Intent sweep — every matchPractice output is a real key, ≥5 reachable,
//    with the free_first fallback provably reachable (matchPractice lesson ×6).
const wants = optValues('want');
const helps = optValues('help');
const seenPractice = new Set();
for (const [name, base] of [['A', baseA], ['B', baseB]]) {
  for (const w of wants) for (const h of helps) {
    const a = { ...base, want: w, help: h };
    const k = QZ.matchPractice(a);
    ok(PRACTICE_KEYS.includes(k), `matchPractice valid key for base ${name} want=${w}/help=${h} → ${k}`);
    seenPractice.add(k);
  }
}
console.log(`  walked ${2 * wants.length * helps.length} intent combos; ${seenPractice.size} distinct practices`);
ok(seenPractice.size >= 5, 'at least 5 of 7 practices reachable');
ok(seenPractice.has('free_first') && seenPractice.has('general'), 'free_first and general both reachable');
ok(QZ.matchPractice({ ...baseA, want: 'difference', help: 'reflection' }) === 'free_first', 'want=difference falls through to free_first (fallback provable)');

// 5. underneath scenarios — one per page underneath branch, in page order, plus null.
const midSignals = { state: 'state', felt: 'inside', persist: 'held', self: 'examined' };
const scenarios = [
  { name: 'door contrast → the-contrast-question', a: { ...baseA, ...midSignals, door: 'contrast' }, expect: 'the-contrast-question' },
  { name: 'state wish → the-state-question', a: { ...baseA, ...midSignals, state: 'wish' }, expect: 'the-state-question' },
  { name: 'felt contrary → the-affirmation-question', a: { ...baseA, ...midSignals, felt: 'contrary' }, expect: 'the-affirmation-question' },
  { name: 'persist reverts → the-bridge-question', a: { ...baseA, ...midSignals, persist: 'reverts' }, expect: 'the-bridge-question' },
  { name: 'want proof → the-bridge-question', a: { ...baseA, ...midSignals, want: 'proof' }, expect: 'the-bridge-question' },
  { name: 'help conversation → the-reading-question', a: { ...baseA, ...midSignals, help: 'conversation' }, expect: 'the-reading-question' },
  { name: 'settled state-inhabited → null', a: { ...baseA, ...midSignals }, expect: null }
];
for (const sc of scenarios) {
  const answers = { ...sc.a };
  const u = QZ.underneath(answers, QZ.resolve(answers));
  ok((u ? u.key : null) === sc.expect, `${sc.name} → ${sc.expect} (got ${u ? u.key : null})`);
}

// 6. customResult renders all v2 blocks without throwing.
function renderOnce(a) {
  let html = '';
  const stubBody = { innerHTML: '', querySelector: () => null };
  const ctx = { answers: a, body: stubBody, emailFormHTML: () => '', bindEmailForms: () => {}, restart: () => {} };
  Object.defineProperty(stubBody, 'innerHTML', { get: () => html, set: v => { html = v; }, configurable: true });
  QZ.customResult(ctx);
  return html;
}
let renderCrashes = 0;
for (const w of wants) for (const h of helps) for (const st of stateV) {
  const a = { ...baseA, state: st, felt: 'inside', persist: 'held', self: 'examined', want: w, help: h };
  try {
    const html = renderOnce(a);
    ok(html.includes('love-result') && html.includes('What your answers suggest') && html.includes('What to look at next') && html.includes('Your best-fit next step') && html.includes('btn-gold'), `render blocks for want=${w}/help=${h}/state=${st}`);
  } catch (e) {
    renderCrashes++; failures++;
    console.error('  RENDER CRASH for', { w, h, st }, '\n', e.stack);
  }
}
ok(renderCrashes === 0, 'customResult never throws across the sweep');

// 7. Honesty guards: no verdict language, no email capture in results.
const sample = renderOnce({ ...baseA, state: 'wish', felt: 'contrary', persist: 'reverts', self: 'avoidant', want: 'why', help: 'conversation' });
ok(!/email-form/.test(sample), 'no email capture in result (user decision 2026-09-20)');
ok(sample.includes('love-aha') || sample.includes('The honest edge of this pattern'), 'v2 layers render');
ok(sample.includes('One thing worth naming'), 'negativePatternTip renders on its matched pattern');
ok(QZ.launchSub && QZ.launchSub.length > 20, 'launchSub explicitly provided');

// 8. Every answer set maps to exactly one aha key from the library;
//    all five mapped keys reachable across the full signal walk.
const ahaKeys = new Set();
for (const [name, base] of [['A', baseA], ['B', baseB]]) {
  for (const st of stateV) for (const fe of feltV) for (const pe of persistV) for (const se of selfV) {
    const a = { ...base, state: st, felt: fe, persist: pe, self: se };
    const k = QZ.matchAha(a, QZ.resolve(a));
    ok(!!window.MYSTICDO_AHA[k], `matchAha returns a library key for base ${name} ${st}/${fe}/${pe}/${se} → ${k}`);
    ahaKeys.add(k);
  }
}
console.log(`  aha sweep produced ${ahaKeys.size} distinct aha keys`);
ok(ahaKeys.size === 5, 'all five mapped aha keys reachable — got ' + [...ahaKeys].join(','));

console.log(`law-of-assumption quiz: ${checks} checks -> ${failures === 0 ? 'ALL GREEN' : failures + ' FAILURES'}`);
process.exit(failures === 0 ? 0 : 1);
