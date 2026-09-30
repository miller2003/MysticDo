/* Logic test for the how-to-do-shadow-work quiz.
 * Dual-base exhaustive signal-combo walk + priority assertions + intent sweep
 * + underneath scenarios + render sweep + aha library check,
 * modeled on test-how-to-raise-your-vibration-quiz.mjs.
 * Run: node scripts/test-how-to-do-shadow-work-quiz.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src = readFileSync(path.join(root, 'assets/js/quizzes.js'), 'utf8');

globalThis.window = {};
eval(src);

const QZ = window.MYSTICDO_QUIZZES['how-to-do-shadow-work'];
if (!QZ) throw new Error('how-to-do-shadow-work quiz not registered');

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

// 2. Dual-base exhaustive signal-combo walk (made x aim x golden x difficult).
//    Base A: phrase + valid — the definition-curious context.
//    Base B: manifest + method — the stuck-goal context.
//    (resolve reads only the four walked signals; door, want, support, weight are context-only.)
const madeV = optValues('made');
const aimV = optValues('aim');
const goldenV = optValues('golden');
const difficultV = optValues('difficult');
const baseA = { door: 'phrase', want: 'valid', support: 'reflection', weight: 'accessible' };
const baseB = { door: 'manifest', want: 'method', support: 'reflection', weight: 'accessible' };
const seenPattern = new Set();
let comboCount = 0;
for (const [name, base] of [['A', baseA], ['B', baseB]]) {
  for (const md of madeV) for (const am of aimV) for (const go of goldenV) for (const di of difficultV) {
    const a = { ...base, made: md, aim: am, golden: go, difficult: di };
    const k = QZ.resolve(a);
    ok(RESULT_KEYS.includes(k), `resolve valid pattern for base ${name} combo ${md}/${am}/${go}/${di} → ${k}`);
    seenPattern.add(k);
    comboCount++;
  }
}
console.log(`  walked ${comboCount} signal combos across 2 bases; ${seenPattern.size} distinct patterns`);

// 3. Priority assertions — the resolution ladder in page order.
ok(QZ.resolve({ ...baseA, made: 'inventory', aim: 'retrieve', golden: 'included', difficult: 'held' }) === 'shame-catalogue', 'shame-catalogue via made=inventory outranks every positive signal');
ok(QZ.resolve({ ...baseA, made: 'traced', aim: 'retrieve', golden: 'included', difficult: 'shamed' }) === 'shame-catalogue', 'shame-catalogue via difficult=shamed outranks a strong retrieval pattern');
ok(QZ.resolve({ ...baseA, made: 'none', aim: 'retrieve', golden: 'included', difficult: 'held' }) === 'not-enough-evidence', 'made=none settles on not-enough-evidence (nothing consistent done)');
ok(QZ.resolve({ ...baseA, made: 'traced', aim: 'eliminate', golden: 'included', difficult: 'held' }) === 'projection-unread', 'projection-unread via aim=eliminate outranks traced+held+included');
ok(QZ.resolve({ ...baseA, made: 'traced', aim: 'retrieve', golden: 'included', difficult: 'bypassed' }) === 'projection-unread', 'projection-unread via difficult=bypassed');
ok(QZ.resolve({ ...baseA, made: 'golden', aim: 'eliminate', golden: 'included', difficult: 'held' }) === 'golden-exile', 'golden-exile via made=golden (eliminate does not steal it — made===golden guard)');
ok(QZ.resolve({ ...baseA, made: 'golden', aim: 'retrieve', golden: 'included', difficult: 'held' }) === 'golden-exile', 'golden-exile outranks its own positive sum');
ok(QZ.resolve({ ...baseA, made: 'traced', aim: 'retrieve', golden: 'dark-only', difficult: 'held' }) === 'golden-exile', 'golden-exile when the dark is held but the golden half is out of view');
ok(QZ.resolve({ ...baseA, made: 'traced', aim: 'retrieve', golden: 'unaware', difficult: 'held' }) === 'golden-exile', 'golden-exile when the golden half is unknown');
ok(QZ.resolve({ ...baseA, made: 'traced', aim: 'retrieve', golden: 'included', difficult: 'held' }) === 'retrieval-practice', 'retrieval-practice via traced+retrieve+included+held outranks the rest');
ok(QZ.resolve({ ...baseA, made: 'unsure', aim: 'unsure', golden: 'unsure', difficult: 'unsure' }) === 'not-enough-evidence', 'all-uncertain answers settle on not-enough-evidence');
ok(QZ.resolve({ ...baseA, made: 'traced', aim: 'explain', golden: 'unsure', difficult: 'unsure' }) === 'not-enough-evidence', 'mid-neutral sum settles on not-enough-evidence');

// 4. Intent sweep — every matchPractice output is a real key, ≥5 reachable,
//    with the free_first fallback provably reachable.
const wants = optValues('want');
const supports = optValues('support');
const seenPractice = new Set();
for (const [name, base] of [['A', baseA], ['B', baseB]]) {
  for (const w of wants) for (const s of supports) {
    const a = { ...base, want: w, support: s };
    const k = QZ.matchPractice(a);
    ok(PRACTICE_KEYS.includes(k), `matchPractice valid key for base ${name} want=${w}/support=${s} → ${k}`);
    seenPractice.add(k);
  }
}
console.log(`  walked ${2 * wants.length * supports.length} intent combos; ${seenPractice.size} distinct practices`);
ok(seenPractice.size >= 5, 'at least 5 of 7 practices reachable');
ok(seenPractice.has('free_first') && seenPractice.has('general'), 'free_first and general both reachable');
ok(QZ.matchPractice({ ...baseA, want: 'manifest', support: 'conversation' }) === 'psychic', 'support=conversation routes to psychic');
ok(QZ.matchPractice({ ...baseA, want: 'method', support: 'reflection' }) === 'tarot_deep', 'want=method routes to tarot_deep');

// 5. underneath scenarios — one per page underneath branch, in page order, plus null.
const midSignals = { door: 'stalled', want: 'manifest', support: 'reflection', weight: 'accessible', made: 'traced', aim: 'retrieve', golden: 'included', difficult: 'held' };
const scenarios = [
  { name: 'door phrase → shadow-the-shadow', a: { ...baseA, ...midSignals, door: 'phrase' }, expect: 'shadow-the-shadow' },
  { name: 'want valid → shadow-the-shadow', a: { ...baseA, ...midSignals, want: 'valid' }, expect: 'shadow-the-shadow' },
  { name: 'want method → shadow-the-method', a: { ...baseA, ...midSignals, want: 'method' }, expect: 'shadow-the-method' },
  { name: 'door reaction → shadow-the-method', a: { ...baseA, ...midSignals, door: 'reaction' }, expect: 'shadow-the-method' },
  { name: 'aim eliminate → shadow-the-reversal', a: { ...baseA, ...midSignals, aim: 'eliminate' }, expect: 'shadow-the-reversal' },
  { name: 'want why → shadow-the-reversal', a: { ...baseA, ...midSignals, want: 'why' }, expect: 'shadow-the-reversal' },
  { name: 'made inventory → shadow-the-reversal', a: { ...baseA, ...midSignals, made: 'inventory' }, expect: 'shadow-the-reversal' },
  { name: 'golden unaware → shadow-the-golden', a: { ...baseA, ...midSignals, golden: 'unaware' }, expect: 'shadow-the-golden' },
  { name: 'golden dark-only → shadow-the-golden', a: { ...baseA, ...midSignals, golden: 'dark-only' }, expect: 'shadow-the-golden' },
  { name: 'made golden → shadow-the-golden', a: { ...baseA, ...midSignals, made: 'golden' }, expect: 'shadow-the-golden' },
  { name: 'support conversation → shadow-the-support', a: { ...baseA, ...midSignals, support: 'conversation' }, expect: 'shadow-the-support' },
  { name: 'weight heavy → shadow-the-support', a: { ...baseA, ...midSignals, weight: 'heavy' }, expect: 'shadow-the-support' },
  { name: 'settled retrieval-practice → null', a: { ...baseA, ...midSignals }, expect: null }
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
for (const w of wants) for (const s of supports) for (const md of madeV) {
  const a = { ...baseA, made: md, aim: 'retrieve', golden: 'included', difficult: 'held', want: w, support: s };
  try {
    const html = renderOnce(a);
    ok(html.includes('love-result') && html.includes('What your answers suggest') && html.includes('What to look at next') && html.includes('Your best-fit next step') && html.includes('btn-gold'), `render blocks for want=${w}/support=${s}/made=${md}`);
  } catch (e) {
    renderCrashes++; failures++;
    console.error('  RENDER CRASH for', { w, s, md }, '\n', e.stack);
  }
}
ok(renderCrashes === 0, 'customResult never throws across the sweep');

// 7. Honesty guards: no verdict language, no email capture in results.
const sample = renderOnce({ ...baseA, made: 'inventory', aim: 'eliminate', golden: 'unaware', difficult: 'shamed', want: 'why', support: 'conversation' });
ok(!/email-form/.test(sample), 'no email capture in result (user decision 2026-09-20)');
ok(sample.includes('love-aha') || sample.includes('The honest edge of this pattern'), 'v2 layers render');
ok(sample.includes('One thing worth naming'), 'negativePatternTip renders on its matched pattern');
ok(QZ.launchSub && QZ.launchSub.length > 20, 'launchSub explicitly provided');

// 8. Every answer set maps to exactly one aha key from the library;
//    all five mapped keys reachable across the full signal walk.
const ahaKeys = new Set();
for (const [name, base] of [['A', baseA], ['B', baseB]]) {
  for (const md of madeV) for (const am of aimV) for (const go of goldenV) for (const di of difficultV) {
    const a = { ...base, made: md, aim: am, golden: go, difficult: di };
    const k = QZ.matchAha(a, QZ.resolve(a));
    ok(!!window.MYSTICDO_AHA[k], `matchAha returns a library key for base ${name} ${md}/${am}/${go}/${di} → ${k}`);
    ahaKeys.add(k);
  }
}
console.log(`  aha sweep produced ${ahaKeys.size} distinct aha keys`);
ok(ahaKeys.size === 5, 'all five mapped aha keys reachable — got ' + [...ahaKeys].join(','));

console.log(`how-to-do-shadow-work quiz: ${checks} checks -> ${failures === 0 ? 'ALL GREEN' : failures + ' FAILURES'}`);
process.exit(failures === 0 ? 0 : 1);
