/* Logic test for the how-to-manifest-a-specific-person quiz.
 * Dual-base exhaustive signal-combo walk + priority assertions + intent sweep
 * + underneath scenarios + render sweep + aha library check,
 * modeled on test-369-manifestation-method-quiz.mjs.
 * Run: node scripts/test-how-to-manifest-a-specific-person-quiz.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src = readFileSync(path.join(root, 'assets/js/quizzes.js'), 'utf8');

globalThis.window = {};
eval(src);

const QZ = window.MYSTICDO_QUIZZES['how-to-manifest-a-specific-person'];
if (!QZ) throw new Error('how-to-manifest-a-specific-person quiz not registered');

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

// 2. Dual-base exhaustive signal-combo walk (wantQuality x assumption x attention x life).
//    Base A: reunion + imagining — the classic reunion context.
//    Base B: skeptical + checking — the honest-doubt context.
//    (resolve reads no door/focus; both bases must reach all five patterns.)
const wantQualityV = optValues('wantQuality');
const assumptionV = optValues('assumption');
const attentionV = optValues('attention');
const lifeV = optValues('life');
const baseA = { door: 'reunion', focus: 'imagining', want: 'honest', help: 'reflection' };
const baseB = { door: 'skeptical', focus: 'checking', want: 'honest', help: 'reflection' };
const seenPattern = new Set();
let comboCount = 0;
for (const [name, base] of [['A', baseA], ['B', baseB]]) {
  for (const wq of wantQualityV) for (const as of assumptionV) for (const at of attentionV) for (const li of lifeV) {
    const a = { ...base, wantQuality: wq, assumption: as, attention: at, life: li };
    const k = QZ.resolve(a);
    ok(RESULT_KEYS.includes(k), `resolve valid pattern for base ${name} combo ${wq}/${as}/${at}/${li} → ${k}`);
    seenPattern.add(k);
    comboCount++;
  }
}
console.log(`  walked ${comboCount} signal combos across 2 bases; ${seenPattern.size} distinct patterns`);

// 3. Priority assertions — the resolution ladder in page order.
ok(QZ.resolve({ ...baseA, wantQuality: 'named', assumption: 'surfaced', attention: 'surveilling', life: 'full' }) === 'evidence-surveillance', 'evidence-surveillance via attention=surveilling outranks all positive signals');
ok(QZ.resolve({ ...baseA, wantQuality: 'unfinished', assumption: 'surfaced', attention: 'felt', life: 'full' }) === 'past-reenactment', 'past-reenactment via unfinished outranks felt+surfaced');
ok(QZ.resolve({ ...baseA, wantQuality: 'named', assumption: 'surfaced', attention: 'felt', life: 'paused' }) === 'parked-life', 'parked-life via paused outranks named+felt state work');
ok(QZ.resolve({ ...baseA, wantQuality: 'named', assumption: 'unsure', attention: 'felt', life: 'unsure' }) === 'state-clear', 'state-clear via named+felt outranks uncertain answers');
ok(QZ.resolve({ ...baseA, wantQuality: 'them', assumption: 'surfaced', attention: 'unsure', life: 'unsure' }) === 'not-enough-evidence', 'two uncertains with |sum|<3 settle on not-enough-evidence');
ok(QZ.resolve({ ...baseA, wantQuality: 'unsure', assumption: 'unsure', attention: 'unsure', life: 'unsure' }) === 'not-enough-evidence', 'all-uncertain answers settle on not-enough-evidence');
ok(QZ.resolve({ ...baseA, wantQuality: 'them', assumption: 'recited', attention: 'balanced', life: 'thinner' }) === 'not-enough-evidence', 'flat-neutral sum settles on not-enough-evidence');
ok(QZ.resolve({ ...baseA, wantQuality: 'named', assumption: 'surfaced', attention: 'balanced', life: 'full' }) === 'state-clear', 'strong positive signals settle on state-clear');
ok(seenPattern.size === 5, 'all 5 patterns reachable — got ' + [...seenPattern].join(','));

// 4. Intent sweep — every matchPractice output is a real key, ≥5 reachable,
//    with the free_first fallback provably reachable (matchPractice lesson ×5).
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
ok(QZ.matchPractice({ ...baseA, want: 'why', help: 'reflection' }) === 'free_first', 'want=why falls through to free_first (fallback provable)');

// 5. underneath scenarios — one per page underneath branch, in page order, plus null.
const midSignals = { wantQuality: 'named', assumption: 'surfaced', attention: 'felt', life: 'full' };
const scenarios = [
  { name: 'door framework → the-free-will-question', a: { ...baseA, ...midSignals, door: 'framework' }, expect: 'the-free-will-question' },
  { name: 'wantQuality them → the-quality-question', a: { ...baseA, ...midSignals, wantQuality: 'them' }, expect: 'the-quality-question' },
  { name: 'attention surveilling → the-evidence-question', a: { ...baseA, ...midSignals, attention: 'surveilling' }, expect: 'the-evidence-question' },
  { name: 'want why → the-waiting-question', a: { ...baseA, ...midSignals, want: 'why' }, expect: 'the-waiting-question' },
  { name: 'help conversation → the-reading-question', a: { ...baseA, ...midSignals, help: 'conversation' }, expect: 'the-reading-question' },
  { name: 'settled state-clear → null', a: { ...baseA, ...midSignals }, expect: null }
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
for (const w of wants) for (const h of helps) for (const at of attentionV) {
  const a = { ...baseA, wantQuality: 'named', assumption: 'surfaced', attention: at, life: 'full', want: w, help: h };
  try {
    const html = renderOnce(a);
    ok(html.includes('love-result') && html.includes('What your answers suggest') && html.includes('What to look at next') && html.includes('Your best-fit next step') && html.includes('btn-gold'), `render blocks for want=${w}/help=${h}/attention=${at}`);
  } catch (e) {
    renderCrashes++; failures++;
    console.error('  RENDER CRASH for', { w, h, at }, '\n', e.stack);
  }
}
ok(renderCrashes === 0, 'customResult never throws across the sweep');

// 7. Honesty guards: no verdict language, no email capture in results.
const sample = renderOnce({ ...baseA, wantQuality: 'them', assumption: 'recited', attention: 'surveilling', life: 'paused', want: 'signs', help: 'conversation' });
ok(!/email-form/.test(sample), 'no email capture in result (user decision 2026-09-20)');
ok(sample.includes('love-aha') || sample.includes('The honest edge of this pattern'), 'v2 layers render');
ok(sample.includes('One thing worth naming'), 'negativePatternTip renders on its matched pattern');
ok(QZ.launchSub && QZ.launchSub.length > 20, 'launchSub explicitly provided');

// 8. Every answer set maps to exactly one aha key from the library;
//    all five mapped keys reachable across the full signal walk.
const ahaKeys = new Set();
for (const [name, base] of [['A', baseA], ['B', baseB]]) {
  for (const wq of wantQualityV) for (const as of assumptionV) for (const at of attentionV) for (const li of lifeV) {
    const a = { ...base, wantQuality: wq, assumption: as, attention: at, life: li };
    const k = QZ.matchAha(a, QZ.resolve(a));
    ok(!!window.MYSTICDO_AHA[k], `matchAha returns a library key for base ${name} ${wq}/${as}/${at}/${li} → ${k}`);
    ahaKeys.add(k);
  }
}
console.log(`  aha sweep produced ${ahaKeys.size} distinct aha keys`);
ok(ahaKeys.size === 5, 'all five mapped aha keys reachable — got ' + [...ahaKeys].join(','));

console.log(`how-to-manifest-a-specific-person quiz: ${checks} checks -> ${failures === 0 ? 'ALL GREEN' : failures + ' FAILURES'}`);
process.exit(failures === 0 ? 0 : 1);
