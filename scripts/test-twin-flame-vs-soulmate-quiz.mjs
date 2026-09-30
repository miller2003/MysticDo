/* Logic test for the twin-flame-vs-soulmate quiz.
 * Dual-base exhaustive signal-combo walk + priority assertions + intent sweep
 * + underneath scenarios + render sweep + aha library check,
 * modeled on test-will-i-ever-find-love-quiz.mjs.
 * Run: node scripts/test-twin-flame-vs-soulmate-quiz.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src = readFileSync(path.join(root, 'assets/js/quizzes.js'), 'utf8');

globalThis.window = {};
eval(src);

const QZ = window.MYSTICDO_QUIZZES['twin-flame-vs-soulmate'];
if (!QZ) throw new Error('twin-flame-vs-soulmate quiz not registered');

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

// 2. Dual-base exhaustive signal-combo walk (feel x cycle x harm x ex).
//    Base A: compatible + curiosity — pure signal walk.
//    Base B: past + cycle trigger — exercises the underneath separation context.
const feelV = optValues('feel');
const cycV = optValues('cycle');
const harmV = optValues('harm');
const exV = optValues('ex');
const baseA = { status: 'compatible', trigger: 'curiosity', want: 'which', help: 'compare' };
const baseB = { status: 'past', trigger: 'cycle', want: 'which', help: 'compare' };
const seenPattern = new Set();
let comboCount = 0;
for (const [name, base] of [['A', baseA], ['B', baseB]]) {
  for (const f of feelV) for (const c of cycV) for (const h of harmV) for (const x of exV) {
    const a = { ...base, feel: f, cycle: c, harm: h, ex: x };
    const k = QZ.resolve(a);
    ok(RESULT_KEYS.includes(k), `resolve valid pattern for base ${name} combo ${f}/${c}/${h}/${x} → ${k}`);
    seenPattern.add(k);
    comboCount++;
  }
}
console.log(`  walked ${comboCount} signal combos across 2 bases; ${seenPattern.size} distinct patterns`);

// 3. Priority assertions — the resolution ladder in page order.
ok(QZ.resolve({ status: 'compatible', trigger: 'label', feel: 'activated', cycle: 'repeat', harm: 'yes-stay', ex: 'ex-focused', want: 'which', help: 'compare' }) === 'mirror-as-excuse', 'mirror-as-excuse outranks all other signals');
ok(QZ.resolve({ status: 'compatible', trigger: 'label', feel: 'activated', cycle: 'repeat', harm: 'yes-frame', ex: 'ex-focused', want: 'which', help: 'compare' }) === 'grief-as-framework', 'grief-as-framework outranks cycle and ease');
ok(QZ.resolve({ status: 'compatible', trigger: 'label', feel: 'easy', cycle: 'repeat', harm: 'no', ex: 'present', want: 'which', help: 'compare' }) === 'mirror-loop', 'mirror-loop outranks the ease read');
ok(QZ.resolve({ status: 'compatible', trigger: 'label', feel: 'easy', cycle: 'steady', harm: 'no', ex: 'present', want: 'which', help: 'compare' }) === 'soulmate-undersold', 'soulmate-undersold reachable via feel=easy');
ok(QZ.resolve({ status: 'compatible', trigger: 'curiosity', feel: 'notell', cycle: 'notell', harm: 'notell', ex: 'notell', want: 'which', help: 'compare' }) === 'not-enough-evidence', 'all-uncertain answers settle on not-enough-evidence');
ok(seenPattern.size === 5, 'all 5 patterns reachable — got ' + [...seenPattern].join(','));

// 4. Intent sweep — every matchPractice output is a real key, ≥6 reachable,
//    with the free_first fallback provably reachable (matchPractice lesson ×2).
const wants = optValues('want');
const helps = optValues('help');
const seenPractice = new Set();
for (const w of wants) for (const h of helps) {
  const a = { ...baseA, want: w, help: h };
  const k = QZ.matchPractice(a);
  ok(PRACTICE_KEYS.includes(k), `matchPractice valid key for want=${w}/help=${h} → ${k}`);
  seenPractice.add(k);
}
console.log(`  walked ${wants.length * helps.length} intent combos; ${seenPractice.size} distinct practices`);
ok(seenPractice.size >= 6, 'at least 6 of 7 practices reachable');
ok(seenPractice.has('free_first') && seenPractice.has('general'), 'free_first and general both reachable');

// 5. underneath scenarios — one per page underneath branch, in page order, plus null.
const scenarios = [
  { name: 'harm yes-stay → the-mirror-question', a: { status: 'compatible', trigger: 'label', feel: 'activated', cycle: 'repeat', harm: 'yes-stay', ex: 'ex-focused', want: 'label-check', help: 'compare' }, expect: 'the-mirror-question' },
  { name: 'harm yes-frame → the-mirror-question (frame branch precedes ease)', a: { status: 'compatible', trigger: 'curiosity', feel: 'easy', cycle: 'steady', harm: 'yes-frame', ex: 'present', want: 'which', help: 'compare' }, expect: 'the-mirror-question' },
  { name: 'ex ex-focused → the-attachment-question', a: { status: 'compatible', trigger: 'curiosity', feel: 'mixed', cycle: 'once', harm: 'no', ex: 'ex-focused', want: 'which', help: 'compare' }, expect: 'the-attachment-question' },
  { name: 'feel easy → the-ease-question', a: { status: 'compatible', trigger: 'curiosity', feel: 'easy', cycle: 'steady', harm: 'no', ex: 'present', want: 'which', help: 'compare' }, expect: 'the-ease-question' },
  { name: 'cycle repeat → the-intensity-question', a: { status: 'compatible', trigger: 'cycle', feel: 'activated', cycle: 'repeat', harm: 'no', ex: 'present', want: 'which', help: 'compare' }, expect: 'the-intensity-question' },
  { name: 'status intense + walk-away trigger → the-separation-question', a: { status: 'intense', trigger: 'walk-away', feel: 'notell', cycle: 'notell', harm: 'notell', ex: 'notell', want: 'meaning', help: 'unsure' }, expect: 'the-separation-question' },
  { name: 'status past → the-separation-question', a: { status: 'past', trigger: 'curiosity', feel: 'notell', cycle: 'notell', harm: 'no', ex: 'notell', want: 'meaning', help: 'unsure' }, expect: 'the-separation-question' },
  { name: 'unsettled present-tense answers → null', a: { status: 'compatible', trigger: 'curiosity', feel: 'notell', cycle: 'notell', harm: 'notell', ex: 'notell', want: 'which', help: 'compare' }, expect: null }
];
for (const sc of scenarios) {
  const u = QZ.underneath(sc.a, QZ.resolve(sc.a));
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
for (const w of wants) for (const h of helps) for (const f of feelV) {
  const a = { status: 'compatible', trigger: 'curiosity', feel: f, cycle: 'once', harm: 'no', ex: 'present', want: w, help: h };
  try {
    const html = renderOnce(a);
    ok(html.includes('love-result') && html.includes('What your answers suggest') && html.includes('What to look at next') && html.includes('Your best-fit next step') && html.includes('btn-gold'), `render blocks for want=${w}/help=${h}/feel=${f}`);
  } catch (e) {
    renderCrashes++; failures++;
    console.error('  RENDER CRASH for', { w, h, f }, '\n', e.stack);
  }
}
ok(renderCrashes === 0, 'customResult never throws across the sweep');

// 7. Honesty guards: no verdict language, no email capture in results.
const sample = renderOnce({ status: 'intense', trigger: 'label', feel: 'activated', cycle: 'repeat', harm: 'yes-stay', ex: 'present', want: 'label-check', help: 'compare' });
ok(!/love-email-kicker/.test(sample) && !/email-form/.test(sample), 'no email capture in result (user decision 2026-09-20)');
ok(sample.includes('love-aha') || sample.includes('love-offers') || sample.includes('What your answers suggest'), 'v2 layers render');
ok(QZ.launchSub && QZ.launchSub.length > 20, 'launchSub explicitly provided');

// 8. Every answer set maps to exactly one aha key from the library;
//    all four pattern-mapped keys reachable across the full signal walk.
const ahaKeys = new Set();
for (const f of feelV) for (const c of cycV) for (const h of harmV) for (const x of exV) {
  const a = { ...baseA, feel: f, cycle: c, harm: h, ex: x };
  const k = QZ.matchAha(a, QZ.resolve(a));
  ok(!!window.MYSTICDO_AHA[k], `matchAha returns a library key for ${f}/${c}/${h}/${x} → ${k}`);
  ahaKeys.add(k);
}
console.log(`  aha sweep produced ${ahaKeys.size} distinct aha keys`);
ok(ahaKeys.size === 4, 'all four pattern-mapped aha keys reachable — got ' + [...ahaKeys].join(','));

console.log(`twin-flame-vs-soulmate quiz: ${checks} checks -> ${failures === 0 ? 'ALL GREEN' : failures + ' FAILURES'}`);
process.exit(failures === 0 ? 0 : 1);
