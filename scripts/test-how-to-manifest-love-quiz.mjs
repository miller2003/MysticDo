/* Logic test for the how-to-manifest-love quiz.
 * Dual-base exhaustive signal-combo walk + priority assertions + intent sweep
 * + underneath scenarios + render sweep + aha library check,
 * modeled on test-what-is-my-aura-color-quiz.mjs.
 * Run: node scripts/test-how-to-manifest-love-quiz.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src = readFileSync(path.join(root, 'assets/js/quizzes.js'), 'utf8');

globalThis.window = {};
eval(src);

const QZ = window.MYSTICDO_QUIZZES['how-to-manifest-love'];
if (!QZ) throw new Error('how-to-manifest-love quiz not registered');

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

// 2. Dual-base exhaustive signal-combo walk (practice x feeling x person x evidence).
//    Base A: trend + self — the long-run context (practice-aligned reach).
//    Base B: skeptical + them — the honest-doubt context (exhaustion-exit reach;
//    the exit branch is gated on door === 'skeptical', so B must carry that door).
const practiceV = optValues('practice');
const feelingV = optValues('feeling');
const personV = optValues('person');
const evidenceV = optValues('evidence');
const baseA = { door: 'trend', focus: 'self', want: 'stop', help: 'reflection' };
const baseB = { door: 'skeptical', focus: 'them', want: 'stop', help: 'reflection' };
const seenPattern = new Set();
let comboCount = 0;
for (const [name, base] of [['A', baseA], ['B', baseB]]) {
  for (const p of practiceV) for (const f of feelingV) for (const pe of personV) for (const e of evidenceV) {
    const a = { ...base, practice: p, feeling: f, person: pe, evidence: e };
    const k = QZ.resolve(a);
    ok(RESULT_KEYS.includes(k), `resolve valid pattern for base ${name} combo ${p}/${f}/${pe}/${e} → ${k}`);
    seenPattern.add(k);
    comboCount++;
  }
}
console.log(`  walked ${comboCount} signal combos across 2 bases; ${seenPattern.size} distinct patterns`);

// 3. Priority assertions — the resolution ladder in page order.
ok(QZ.resolve({ ...baseA, practice: 'waiting', feeling: 'empty', person: 'fusion', evidence: 'avoidant' }) === 'specific-person-capture', 'specific-person-capture via person=fusion outranks all signals');
ok(QZ.resolve({ ...baseA, practice: 'visualize', feeling: 'empty', person: 'pattern', evidence: 'avoidant' }) === 'fantasy-loop', 'fantasy-loop via avoidant + empty');
ok(QZ.resolve({ ...baseA, practice: 'waiting', feeling: 'peace', person: 'released', evidence: 'same' }) === 'fantasy-loop', 'fantasy-loop via waiting + same (the soft loop)');
ok(QZ.resolve({ ...baseB, practice: 'waiting', feeling: 'empty', person: 'pattern', evidence: 'avoidant' }) === 'fantasy-loop', 'fantasy-loop outranks exhaustion-exit when evidence=avoidant');
ok(QZ.resolve({ ...baseB, practice: 'visualize', feeling: 'empty', person: 'released', evidence: 'same' }) === 'exhaustion-exit', 'exhaustion-exit via empty + skeptical door');
ok(QZ.resolve({ ...baseA, practice: 'examine', feeling: 'varies', person: 'pattern', evidence: 'aligned' }) === 'practice-aligned', 'practice-aligned via examine + aligned');
ok(QZ.resolve({ ...baseA, practice: 'unsure', feeling: 'varies', person: 'unsure', evidence: 'unsure' }) === 'not-enough-evidence', 'all-uncertain answers settle on not-enough-evidence');
ok(QZ.resolve({ ...baseA, practice: 'visualize', feeling: 'strain', person: 'released', evidence: 'same' }) === 'not-enough-evidence', 'flat sum settles on not-enough-evidence');
ok(QZ.resolve({ ...baseA, practice: 'visualize', feeling: 'varies', person: 'released', evidence: 'aligned' }) === 'practice-aligned', 'mild-positive sum settles on practice-aligned');
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
const midSignals = { practice: 'visualize', feeling: 'peace', person: 'released', evidence: 'aligned' };
const scenarios = [
  { name: 'door skeptical → the-framework-question', a: { ...baseB, ...midSignals }, expect: 'the-framework-question' },
  { name: 'want change → the-assumption-question', a: { ...baseA, ...midSignals }, want: 'change', expect: 'the-assumption-question' },
  { name: 'person pattern → the-specific-person-question', a: { ...baseA, ...midSignals, person: 'pattern' }, want: 'stop', expect: 'the-specific-person-question' },
  { name: 'evidence same → the-effort-question', a: { ...baseA, ...midSignals, evidence: 'same' }, want: 'stop', expect: 'the-effort-question' },
  { name: 'want timing → the-reading-question', a: { ...baseA, ...midSignals }, want: 'timing', help: 'limits', expect: 'the-reading-question' },
  { name: 'settled aligned practice → null', a: { ...baseA, ...midSignals }, want: 'stop', help: 'reflection', expect: null }
];
for (const sc of scenarios) {
  const answers = { ...sc.a };
  if (sc.want) answers.want = sc.want;
  if (sc.help) answers.help = sc.help;
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
for (const w of wants) for (const h of helps) for (const p of practiceV) {
  const a = { ...baseA, practice: p, feeling: 'varies', person: 'released', evidence: 'aligned', want: w, help: h };
  try {
    const html = renderOnce(a);
    ok(html.includes('love-result') && html.includes('What your answers suggest') && html.includes('What to look at next') && html.includes('Your best-fit next step') && html.includes('btn-gold'), `render blocks for want=${w}/help=${h}/practice=${p}`);
  } catch (e) {
    renderCrashes++; failures++;
    console.error('  RENDER CRASH for', { w, h, p }, '\n', e.stack);
  }
}
ok(renderCrashes === 0, 'customResult never throws across the sweep');

// 7. Honesty guards: no verdict language, no email capture in results.
const sample = renderOnce({ ...baseA, practice: 'waiting', feeling: 'empty', person: 'fusion', evidence: 'avoidant', want: 'person', help: 'conversation' });
ok(!/email-form/.test(sample), 'no email capture in result (user decision 2026-09-20)');
ok(sample.includes('love-aha') || sample.includes('The honest edge of this pattern'), 'v2 layers render');
ok(sample.includes('One thing worth naming'), 'negativePatternTip renders on its matched pattern');
ok(QZ.launchSub && QZ.launchSub.length > 20, 'launchSub explicitly provided');

// 8. Every answer set maps to exactly one aha key from the library;
//    all four mapped keys reachable across the full signal walk.
const ahaKeys = new Set();
for (const [name, base] of [['A', baseA], ['B', baseB]]) {
  for (const p of practiceV) for (const f of feelingV) for (const pe of personV) for (const e of evidenceV) {
    const a = { ...base, practice: p, feeling: f, person: pe, evidence: e };
    const k = QZ.matchAha(a, QZ.resolve(a));
    ok(!!window.MYSTICDO_AHA[k], `matchAha returns a library key for base ${name} ${p}/${f}/${pe}/${e} → ${k}`);
    ahaKeys.add(k);
  }
}
console.log(`  aha sweep produced ${ahaKeys.size} distinct aha keys`);
ok(ahaKeys.size === 4, 'all four mapped aha keys reachable — got ' + [...ahaKeys].join(','));

console.log(`how-to-manifest-love quiz: ${checks} checks -> ${failures === 0 ? 'ALL GREEN' : failures + ' FAILURES'}`);
process.exit(failures === 0 ? 0 : 1);
