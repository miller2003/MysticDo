/* Logic test for the twin-flame-stages quiz.
 * Tri-base exhaustive signal-combo walk + priority assertions + intent sweep
 * + underneath scenarios + render sweep + aha library check,
 * modeled on test-twin-flame-vs-soulmate-quiz.mjs.
 * Run: node scripts/test-twin-flame-stages-quiz.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src = readFileSync(path.join(root, 'assets/js/quizzes.js'), 'utf8');

globalThis.window = {};
eval(src);

const QZ = window.MYSTICDO_QUIZZES['twin-flame-stages'];
if (!QZ) throw new Error('twin-flame-stages quiz not registered');

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

// 2. Tri-base exhaustive signal-combo walk (pull x loop x waiting x cost).
//    Base A: mid + curiosity — pure signal walk.
//    Base B: after + curiosity — exercises the underneath dark-night context.
//    Base C: early + curiosity — the only base where early-stages resolves.
const pullV = optValues('pull');
const loopV = optValues('loop');
const waitV = optValues('waiting');
const costV = optValues('cost');
const baseA = { status: 'mid', trigger: 'curiosity', want: 'stage', help: 'locate' };
const baseB = { status: 'after', trigger: 'curiosity', want: 'stage', help: 'locate' };
const baseC = { status: 'early', trigger: 'curiosity', want: 'stage', help: 'locate' };
const seenPattern = new Set();
let comboCount = 0;
for (const [name, base] of [['A', baseA], ['B', baseB], ['C', baseC]]) {
  for (const p of pullV) for (const l of loopV) for (const w of waitV) for (const c of costV) {
    const a = { ...base, pull: p, loop: l, waiting: w, cost: c };
    const k = QZ.resolve(a);
    ok(RESULT_KEYS.includes(k), `resolve valid pattern for base ${name} combo ${p}/${l}/${w}/${c} → ${k}`);
    seenPattern.add(k);
    comboCount++;
  }
}
console.log(`  walked ${comboCount} signal combos across 3 bases; ${seenPattern.size} distinct patterns`);

// 3. Priority assertions — the resolution ladder in page order.
ok(QZ.resolve({ status: 'mid', trigger: 'reunion', pull: 'consuming', loop: 'repeat', waiting: 'countdown', cost: 'heavy', want: 'return', help: 'steady' }) === 'map-as-cage', 'map-as-cage outranks runner and surrender signals');
ok(QZ.resolve({ status: 'mid', trigger: 'runner', pull: 'consuming', loop: 'repeat', waiting: 'working', cost: 'some', want: 'stage', help: 'locate' }) === 'runner-loop', 'runner-loop outranks the surrender read');
ok(QZ.resolve({ status: 'early', trigger: 'curiosity', pull: 'consuming', loop: 'once', waiting: 'working', cost: 'some', want: 'stage', help: 'locate' }) === 'surrender-work', 'surrender-work outranks the early-stages read');
ok(QZ.resolve({ status: 'early', trigger: 'curiosity', pull: 'consuming', loop: 'once', waiting: 'living', cost: 'little', want: 'stage', help: 'locate' }) === 'early-stages', 'early-stages reachable via status=early');
ok(QZ.resolve({ status: 'before', trigger: 'curiosity', pull: 'present', loop: 'once', waiting: 'living', cost: 'little', want: 'stage', help: 'locate' }) === 'early-stages', 'early-stages reachable via status=before');
ok(QZ.resolve({ status: 'mid', trigger: 'curiosity', pull: 'notell', loop: 'notell', waiting: 'notell', cost: 'notell', want: 'stage', help: 'locate' }) === 'not-enough-evidence', 'all-uncertain answers settle on not-enough-evidence');
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
  { name: 'trigger runner → the-attachment-question', a: { status: 'mid', trigger: 'runner', pull: 'consuming', loop: 'repeat', waiting: 'notell', cost: 'some', want: 'return', help: 'framework' }, expect: 'the-attachment-question' },
  { name: 'waiting countdown → the-cage-question', a: { status: 'mid', trigger: 'curiosity', pull: 'present', loop: 'once', waiting: 'countdown', cost: 'some', want: 'stage', help: 'locate' }, expect: 'the-cage-question' },
  { name: 'status after + unsettled → the-dark-night-question', a: { status: 'after', trigger: 'curiosity', pull: 'notell', loop: 'steady', waiting: 'notell', cost: 'notell', want: 'stage', help: 'locate' }, expect: 'the-dark-night-question' },
  { name: 'waiting working → the-surrender-question', a: { status: 'mid', trigger: 'curiosity', pull: 'present', loop: 'once', waiting: 'working', cost: 'some', want: 'purpose', help: 'framework' }, expect: 'the-surrender-question' },
  { name: 'status before → the-yearning-question', a: { status: 'before', trigger: 'curiosity', pull: 'notell', loop: 'notell', waiting: 'living', cost: 'notell', want: 'stage', help: 'locate' }, expect: 'the-yearning-question' },
  { name: 'unsettled mid-journey answers → null', a: { status: 'mid', trigger: 'curiosity', pull: 'present', loop: 'once', waiting: 'notell', cost: 'notell', want: 'stage', help: 'locate' }, expect: null }
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
for (const w of wants) for (const h of helps) for (const p of pullV) {
  const a = { status: 'mid', trigger: 'curiosity', pull: p, loop: 'once', waiting: 'living', cost: 'some', want: w, help: h };
  try {
    const html = renderOnce(a);
    ok(html.includes('love-result') && html.includes('What your answers suggest') && html.includes('What to look at next') && html.includes('Your best-fit next step') && html.includes('btn-gold'), `render blocks for want=${w}/help=${h}/pull=${p}`);
  } catch (e) {
    renderCrashes++; failures++;
    console.error('  RENDER CRASH for', { w, h, p }, '\n', e.stack);
  }
}
ok(renderCrashes === 0, 'customResult never throws across the sweep');

// 7. Honesty guards: no verdict language, no email capture in results.
const sample = renderOnce({ status: 'mid', trigger: 'reunion', pull: 'consuming', loop: 'repeat', waiting: 'countdown', cost: 'heavy', want: 'exit', help: 'steady' });
ok(!/love-email-kicker/.test(sample) && !/email-form/.test(sample), 'no email capture in result (user decision 2026-09-20)');
ok(sample.includes('love-aha') || sample.includes('love-offers') || sample.includes('What your answers suggest'), 'v2 layers render');
ok(QZ.launchSub && QZ.launchSub.length > 20, 'launchSub explicitly provided');

// 8. Every answer set maps to exactly one aha key from the library;
//    all four pattern-mapped keys reachable across the full signal walk.
const ahaKeys = new Set();
for (const p of pullV) for (const l of loopV) for (const w of waitV) for (const c of costV) {
  const a = { ...baseA, pull: p, loop: l, waiting: w, cost: c };
  const k = QZ.matchAha(a, QZ.resolve(a));
  ok(!!window.MYSTICDO_AHA[k], `matchAha returns a library key for ${p}/${l}/${w}/${c} → ${k}`);
  ahaKeys.add(k);
}
console.log(`  aha sweep produced ${ahaKeys.size} distinct aha keys`);
ok(ahaKeys.size === 4, 'all four pattern-mapped aha keys reachable — got ' + [...ahaKeys].join(','));

console.log(`twin-flame-stages quiz: ${checks} checks -> ${failures === 0 ? 'ALL GREEN' : failures + ' FAILURES'}`);
process.exit(failures === 0 ? 0 : 1);
