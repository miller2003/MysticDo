/* Logic test for the signs-of-spiritual-awakening quiz.
 * Dual-base exhaustive signal-combo walk + priority assertions + intent sweep
 * + underneath scenarios + render sweep + aha library check,
 * modeled on test-waking-up-at-3am-meaning-quiz.mjs.
 * Run: node scripts/test-signs-of-spiritual-awakening-quiz.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src = readFileSync(path.join(root, 'assets/js/quizzes.js'), 'utf8');

globalThis.window = {};
eval(src);

const QZ = window.MYSTICDO_QUIZZES['signs-of-spiritual-awakening'];
if (!QZ) throw new Error('signs-of-spiritual-awakening quiz not registered');

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

// 2. Dual-base exhaustive signal-combo walk (meaning x solitude x certainty x clarity).
//    Base A: in-middle + months — pure signal walk.
//    Base B: a-list + days — exercises the flattering-list context (achievement-frame reach).
const meaningV = optValues('meaning');
const solitudeV = optValues('solitude');
const certaintyV = optValues('certainty');
const clarityV = optValues('clarity');
const baseA = { reason: 'in-middle', stage: 'months', want: 'naming', help: 'reflection' };
const baseB = { reason: 'a-list', stage: 'days', want: 'stop', help: 'limits' };
const seenPattern = new Set();
let comboCount = 0;
for (const [name, base] of [['A', baseA], ['B', baseB]]) {
  for (const m of meaningV) for (const s of solitudeV) for (const c of certaintyV) for (const l of clarityV) {
    const a = { ...base, meaning: m, solitude: s, certainty: c, clarity: l };
    const k = QZ.resolve(a);
    ok(RESULT_KEYS.includes(k), `resolve valid pattern for base ${name} combo ${m}/${s}/${c}/${l} → ${k}`);
    seenPattern.add(k);
    comboCount++;
  }
}
console.log(`  walked ${comboCount} signal combos across 2 bases; ${seenPattern.size} distinct patterns`);

// 3. Priority assertions — the resolution ladder in page order.
ok(QZ.resolve({ ...baseA, meaning: 'no', solitude: 'draining', certainty: 'intact', clarity: 'cycling' }) === 'overwhelmed-support', 'overwhelmed-support via draining + meaning=no outranks all signals');
ok(QZ.resolve({ ...baseA, meaning: 'true', solitude: 'draining', certainty: 'dissolving', clarity: 'worse' }) === 'overwhelmed-support', 'overwhelmed-support via draining + clarity=worse');
ok(QZ.resolve({ ...baseB, meaning: 'partly', solitude: 'preferred', certainty: 'questioning', clarity: 'clearer' }) === 'achievement-frame', 'achievement-frame via a-list + one-way glow');
ok(QZ.resolve({ ...baseA, meaning: 'true', solitude: 'restorative', certainty: 'dissolving', clarity: 'cycling' }) === 'dark-night', 'dark-night reachable via dissolving + true meaning-loss');
ok(QZ.resolve({ ...baseA, meaning: 'unsure', solitude: 'varies', certainty: 'unsure', clarity: 'varies' }) === 'not-enough-evidence', 'all-uncertain answers settle on not-enough-evidence');
ok(QZ.resolve({ ...baseA, meaning: 'partly', solitude: 'preferred', certainty: 'questioning', clarity: 'cycling' }) === 'restructuring', 'mild-positive sum settles on restructuring');
ok(seenPattern.size === 5, 'all 5 patterns reachable — got ' + [...seenPattern].join(','));

// 4. Intent sweep — every matchPractice output is a real key, ≥5 reachable,
//    with the free_first fallback provably reachable (matchPractice lesson ×4).
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

// 5. underneath scenarios — one per page underneath branch, in page order, plus null.
const midSignals = { meaning: 'partly', solitude: 'preferred', certainty: 'questioning', clarity: 'cycling' };
const scenarios = [
  { name: 'want naming → the-name-question', a: { ...baseA, ...midSignals }, want: 'naming', expect: 'the-name-question' },
  { name: 'want sanity → the-sanity-question', a: { ...baseA, ...midSignals }, want: 'sanity', expect: 'the-sanity-question' },
  { name: 'reason a-list → the-list-question', a: { ...baseB, ...midSignals }, want: 'stop', expect: 'the-list-question' },
  { name: 'solitude draining → the-support-question', a: { ...baseA, meaning: 'partly', solitude: 'draining', certainty: 'questioning', clarity: 'cycling' }, want: 'stop', expect: 'the-support-question' },
  { name: 'stage years → the-practice-question', a: { ...baseA, ...midSignals, stage: 'years' }, want: 'stop', expect: 'the-practice-question' },
  { name: 'unsettled answers → null', a: { ...baseA, ...midSignals }, want: 'stop', expect: null }
];
for (const sc of scenarios) {
  const answers = { ...sc.a, want: sc.want };
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
for (const w of wants) for (const h of helps) for (const m of meaningV) {
  const a = { ...baseA, meaning: m, solitude: 'preferred', certainty: 'questioning', clarity: 'cycling', want: w, help: h };
  try {
    const html = renderOnce(a);
    ok(html.includes('love-result') && html.includes('What your answers suggest') && html.includes('What to look at next') && html.includes('Your best-fit next step') && html.includes('btn-gold'), `render blocks for want=${w}/help=${h}/meaning=${m}`);
  } catch (e) {
    renderCrashes++; failures++;
    console.error('  RENDER CRASH for', { w, h, m }, '\n', e.stack);
  }
}
ok(renderCrashes === 0, 'customResult never throws across the sweep');

// 7. Honesty guards: no verdict language, no email capture in results.
const sample = renderOnce({ ...baseA, meaning: 'true', solitude: 'restorative', certainty: 'dissolving', clarity: 'cycling', want: 'naming', help: 'limits' });
ok(!/love-email-kicker/.test(sample) && !/email-form/.test(sample), 'no email capture in result (user decision 2026-09-20)');
ok(sample.includes('love-aha') || sample.includes('love-offers') || sample.includes('What your answers suggest'), 'v2 layers render');
ok(QZ.launchSub && QZ.launchSub.length > 20, 'launchSub explicitly provided');

// 8. Every answer set maps to exactly one aha key from the library;
//    all four mapped keys reachable across the full signal walk.
const ahaKeys = new Set();
for (const [name, base] of [['A', baseA], ['B', baseB]]) {
  for (const m of meaningV) for (const s of solitudeV) for (const c of certaintyV) for (const l of clarityV) {
    const a = { ...base, meaning: m, solitude: s, certainty: c, clarity: l };
    const k = QZ.matchAha(a, QZ.resolve(a));
    ok(!!window.MYSTICDO_AHA[k], `matchAha returns a library key for base ${name} ${m}/${s}/${c}/${l} → ${k}`);
    ahaKeys.add(k);
  }
}
console.log(`  aha sweep produced ${ahaKeys.size} distinct aha keys`);
ok(ahaKeys.size === 4, 'all four mapped aha keys reachable — got ' + [...ahaKeys].join(','));

console.log(`signs-of-spiritual-awakening quiz: ${checks} checks -> ${failures === 0 ? 'ALL GREEN' : failures + ' FAILURES'}`);
process.exit(failures === 0 ? 0 : 1);
