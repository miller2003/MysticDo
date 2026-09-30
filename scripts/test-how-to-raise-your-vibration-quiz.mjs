/* Logic test for the how-to-raise-your-vibration quiz.
 * Dual-base exhaustive signal-combo walk + priority assertions + intent sweep
 * + underneath scenarios + render sweep + aha library check,
 * modeled on test-scripting-manifestation-quiz.mjs.
 * Run: node scripts/test-how-to-raise-your-vibration-quiz.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src = readFileSync(path.join(root, 'assets/js/quizzes.js'), 'utf8');

globalThis.window = {};
eval(src);

const QZ = window.MYSTICDO_QUIZZES['how-to-raise-your-vibration'];
if (!QZ) throw new Error('how-to-raise-your-vibration quiz not registered');

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

// 2. Dual-base exhaustive signal-combo walk (doing x holds x baseline x difficult).
//    Base A: phrase + tool — the meaning-curious context.
//    Base B: stalled + literal — the honest-doubt context.
//    (resolve reads only the four walked signals; door, meaning are context-only.)
const doingV = optValues('doing');
const holdsV = optValues('holds');
const baselineV = optValues('baseline');
const difficultV = optValues('difficult');
const baseA = { door: 'phrase', meaning: 'tool', want: 'difference', help: 'reflection' };
const baseB = { door: 'stalled', meaning: 'literal', want: 'difference', help: 'reflection' };
const seenPattern = new Set();
let comboCount = 0;
for (const [name, base] of [['A', baseA], ['B', baseB]]) {
  for (const dg of doingV) for (const ho of holdsV) for (const ba of baselineV) for (const di of difficultV) {
    const a = { ...base, doing: dg, holds: ho, baseline: ba, difficult: di };
    const k = QZ.resolve(a);
    ok(RESULT_KEYS.includes(k), `resolve valid pattern for base ${name} combo ${dg}/${ho}/${ba}/${di} → ${k}`);
    seenPattern.add(k);
    comboCount++;
  }
}
console.log(`  walked ${comboCount} signal combos across 2 bases; ${seenPattern.size} distinct patterns`);

// 3. Priority assertions — the resolution ladder in page order.
ok(QZ.resolve({ ...baseA, doing: 'engaged', holds: 'carries', baseline: 'open', difficult: 'avoided' }) === 'bypass-instead-of-feeling', 'bypass-instead-of-feeling via difficult=avoided outranks all positive signals');
ok(QZ.resolve({ ...baseA, doing: 'consuming', holds: 'carries', baseline: 'open', difficult: 'felt' }) === 'consumption-loop', 'consumption-loop via doing=consuming outranks named+carried+open');
ok(QZ.resolve({ ...baseA, doing: 'none', holds: 'carries', baseline: 'open', difficult: 'felt' }) === 'not-enough-evidence', 'doing=none settles on not-enough-evidence (nothing consistent done)');
ok(QZ.resolve({ ...baseA, doing: 'engaged', holds: 'carries', baseline: 'open', difficult: 'felt' }) === 'open-baseline', 'open-baseline via open+carries outranks the rest');
ok(QZ.resolve({ ...baseA, doing: 'affirming', holds: 'moment', baseline: 'contracted', difficult: 'reframed' }) === 'bypass-instead-of-feeling', 'bypass-instead-of-feeling via affirming+contracted+not-felt');
ok(QZ.resolve({ ...baseA, doing: 'affirming', holds: 'moment', baseline: 'contracted', difficult: 'felt' }) === 'contracted-baseline', 'contracted-baseline when the difficult states ARE felt (not bypass)');
ok(QZ.resolve({ ...baseA, doing: 'unsure', holds: 'unsure', baseline: 'unsure', difficult: 'unsure' }) === 'not-enough-evidence', 'all-uncertain answers settle on not-enough-evidence');
ok(QZ.resolve({ ...baseA, doing: 'affirming', holds: 'moment', baseline: 'flat', difficult: 'reframed' }) === 'not-enough-evidence', 'mid-neutral sum settles on not-enough-evidence');ok(seenPattern.size === 5, 'all 5 patterns reachable — got ' + [...seenPattern].join(','));

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
const midSignals = { door: 'season', meaning: 'tool', doing: 'engaged', holds: 'carries', baseline: 'open', difficult: 'felt' };
const scenarios = [
  { name: 'door phrase → vibration-the-metaphor', a: { ...baseA, ...midSignals, door: 'phrase' }, expect: 'vibration-the-metaphor' },
  { name: 'meaning literal → vibration-the-metaphor', a: { ...baseA, ...midSignals, meaning: 'literal' }, expect: 'vibration-the-metaphor' },
  { name: 'baseline unsure → vibration-the-baseline', a: { ...baseA, ...midSignals, baseline: 'unsure' }, expect: 'vibration-the-baseline' },
  { name: 'want method → vibration-the-baseline', a: { ...baseA, ...midSignals, want: 'method' }, expect: 'vibration-the-baseline' },
  { name: 'difficult avoided → vibration-the-bypass', a: { ...baseA, ...midSignals, difficult: 'avoided' }, expect: 'vibration-the-bypass' },
  { name: 'want bypass → vibration-the-bypass', a: { ...baseA, ...midSignals, want: 'bypass' }, expect: 'vibration-the-bypass' },
  { name: 'want proof → vibration-the-evidence', a: { ...baseA, ...midSignals, want: 'proof' }, expect: 'vibration-the-evidence' },
  { name: 'help conversation → vibration-the-reading', a: { ...baseA, ...midSignals, help: 'conversation' }, expect: 'vibration-the-reading' },
  { name: 'settled open-baseline → null', a: { ...baseA, ...midSignals }, expect: null }
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
for (const w of wants) for (const h of helps) for (const dg of doingV) {
  const a = { ...baseA, doing: dg, holds: 'carries', baseline: 'open', difficult: 'felt', want: w, help: h };
  try {
    const html = renderOnce(a);
    ok(html.includes('love-result') && html.includes('What your answers suggest') && html.includes('What to look at next') && html.includes('Your best-fit next step') && html.includes('btn-gold'), `render blocks for want=${w}/help=${h}/doing=${dg}`);
  } catch (e) {
    renderCrashes++; failures++;
    console.error('  RENDER CRASH for', { w, h, dg }, '\n', e.stack);
  }
}
ok(renderCrashes === 0, 'customResult never throws across the sweep');

// 7. Honesty guards: no verdict language, no email capture in results.
const sample = renderOnce({ ...baseA, doing: 'consuming', holds: 'reaching', baseline: 'contracted', difficult: 'avoided', want: 'bypass', help: 'conversation' });
ok(!/email-form/.test(sample), 'no email capture in result (user decision 2026-09-20)');
ok(sample.includes('love-aha') || sample.includes('The honest edge of this pattern'), 'v2 layers render');
ok(sample.includes('One thing worth naming'), 'negativePatternTip renders on its matched pattern');
ok(QZ.launchSub && QZ.launchSub.length > 20, 'launchSub explicitly provided');

// 8. Every answer set maps to exactly one aha key from the library;
//    all five mapped keys reachable across the full signal walk.
const ahaKeys = new Set();
for (const [name, base] of [['A', baseA], ['B', baseB]]) {
  for (const dg of doingV) for (const ho of holdsV) for (const ba of baselineV) for (const di of difficultV) {
    const a = { ...base, doing: dg, holds: ho, baseline: ba, difficult: di };
    const k = QZ.matchAha(a, QZ.resolve(a));
    ok(!!window.MYSTICDO_AHA[k], `matchAha returns a library key for base ${name} ${dg}/${ho}/${ba}/${di} → ${k}`);
    ahaKeys.add(k);
  }
}
console.log(`  aha sweep produced ${ahaKeys.size} distinct aha keys`);
ok(ahaKeys.size === 5, 'all five mapped aha keys reachable — got ' + [...ahaKeys].join(','));

console.log(`how-to-raise-your-vibration quiz: ${checks} checks -> ${failures === 0 ? 'ALL GREEN' : failures + ' FAILURES'}`);
process.exit(failures === 0 ? 0 : 1);
