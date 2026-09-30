/* Logic test for the what-is-my-north-node quiz.
 * Dual-base exhaustive signal-combo walk + priority assertions + intent sweep
 * + underneath scenarios + render sweep + aha library check,
 * modeled on test-what-is-my-venus-sign-quiz.mjs.
 * Run: node scripts/test-what-is-my-north-node-quiz.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src = readFileSync(path.join(root, 'assets/js/quizzes.js'), 'utf8');

globalThis.window = {};
eval(src);

const QZ = window.MYSTICDO_QUIZZES['what-is-my-north-node'];
if (!QZ) throw new Error('what-is-my-north-node quiz not registered');

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

// 2. Dual-base exhaustive signal-combo walk (depth x use x agency x contradiction).
//    Base A: new + curiosity — pure signal walk.
//    Base B: fluent + self-knowledge — exercises the self-inquiry branch context.
const depthV = optValues('depth');
const useV = optValues('use');
const agencyV = optValues('agency');
const contraV = optValues('contradiction');
const baseA = { status: 'new', trigger: 'curiosity', want: 'meaning', help: 'reading' };
const baseB = { status: 'fluent', trigger: 'self-knowledge', want: 'meaning', help: 'reading' };
const seenPattern = new Set();
let comboCount = 0;
for (const [name, base] of [['A', baseA], ['B', baseB]]) {
  for (const d of depthV) for (const u of useV) for (const ag of agencyV) for (const co of contraV) {
    const a = { ...base, depth: d, use: u, agency: ag, contradiction: co };
    const k = QZ.resolve(a);
    ok(RESULT_KEYS.includes(k), `resolve valid pattern for base ${name} combo ${d}/${u}/${ag}/${co} → ${k}`);
    seenPattern.add(k);
    comboCount++;
  }
}
console.log(`  walked ${comboCount} signal combos across 2 bases; ${seenPattern.size} distinct patterns`);

// 3. Priority assertions — the resolution ladder in page order.
ok(QZ.resolve({ status: 'new', trigger: 'fate-check', depth: 'daily', use: 'self-view', agency: 'written', contradiction: 'recalibrate', want: 'purpose', help: 'reading' }) === 'destiny-verdict', 'destiny-verdict outranks the permission-slip branch');
ok(QZ.resolve({ status: 'new', trigger: 'curiosity', depth: 'daily', use: 'self-view', agency: 'build', contradiction: 'abandon', want: 'purpose', help: 'reading' }) === 'escape-permission', 'escape-permission reachable via contradiction=abandon');
ok(QZ.resolve({ status: 'new', trigger: 'crossroads', depth: 'daily', use: 'self-view', agency: 'build', contradiction: 'recalibrate', want: 'path', help: 'reading' }) === 'escape-permission', 'escape-permission reachable via trigger=crossroads');
ok(QZ.resolve({ status: 'new', trigger: 'curiosity', depth: 'sun-only', use: 'nothing', agency: 'notell', contradiction: 'weigh-it', want: 'meaning', help: 'reflect' }) === 'skeptical-explorer', 'skeptical-explorer reachable via negative sum');
ok(QZ.resolve({ status: 'fluent', trigger: 'self-knowledge', depth: 'notell', use: 'notell', agency: 'notell', contradiction: 'notell', want: 'meaning', help: 'reflect' }) === 'self-inquiry', 'self-inquiry reachable via trigger=self-knowledge');
ok(QZ.resolve({ status: 'new', trigger: 'curiosity', depth: 'notell', use: 'notell', agency: 'notell', contradiction: 'notell', want: 'meaning', help: 'reflect' }) === 'not-enough-evidence', 'all-uncertain answers settle on not-enough-evidence');
ok(QZ.resolve({ status: 'new', trigger: 'cosmo', depth: 'daily', use: 'self-view', agency: 'build', contradiction: 'recalibrate', want: 'meaning', help: 'reflect' }) === 'self-inquiry', 'positive sum settles on self-inquiry');
ok(seenPattern.size === 5, 'all 5 patterns reachable — got ' + [...seenPattern].join(','));

// 4. Intent sweep — every matchPractice output is a real key, ≥6 reachable,
//    with the free_first fallback provably reachable (matchPractice lesson ×3).
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
  { name: 'agency written → the-written-question', a: { status: 'new', trigger: 'curiosity', depth: 'often', use: 'language', agency: 'written', contradiction: 'recalibrate', want: 'purpose', help: 'reading' }, expect: 'the-written-question' },
  { name: 'contradiction abandon → the-permission-question', a: { status: 'new', trigger: 'curiosity', depth: 'often', use: 'language', agency: 'build', contradiction: 'abandon', want: 'path', help: 'reading' }, expect: 'the-permission-question' },
  { name: 'depth sun-only → the-sun-question', a: { status: 'new', trigger: 'curiosity', depth: 'sun-only', use: 'language', agency: 'build', contradiction: 'recalibrate', want: 'meaning', help: 'reflect' }, expect: 'the-sun-question' },
  { name: 'use self-view → the-recognition-question', a: { status: 'fluent', trigger: 'cosmo', depth: 'daily', use: 'self-view', agency: 'build', contradiction: 'recalibrate', want: 'meaning', help: 'reflect' }, expect: 'the-recognition-question' },
  { name: 'status new → the-crossroads-question', a: { status: 'new', trigger: 'cosmo', depth: 'notell', use: 'notell', agency: 'notell', contradiction: 'notell', want: 'purpose', help: 'reading' }, expect: 'the-crossroads-question' },
  { name: 'unsettled fluent answers → null', a: { status: 'fluent', trigger: 'cosmo', depth: 'notell', use: 'language', agency: 'notell', contradiction: 'weigh-it', want: 'them', help: 'reading' }, expect: null }
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
for (const w of wants) for (const h of helps) for (const d of depthV) {
  const a = { status: 'new', trigger: 'curiosity', depth: d, use: 'language', agency: 'build', contradiction: 'weigh-it', want: w, help: h };
  try {
    const html = renderOnce(a);
    ok(html.includes('love-result') && html.includes('What your answers suggest') && html.includes('What to look at next') && html.includes('Your best-fit next step') && html.includes('btn-gold'), `render blocks for want=${w}/help=${h}/depth=${d}`);
  } catch (e) {
    renderCrashes++; failures++;
    console.error('  RENDER CRASH for', { w, h, d }, '\n', e.stack);
  }
}
ok(renderCrashes === 0, 'customResult never throws across the sweep');

// 7. Honesty guards: no verdict language, no email capture in results.
const sample = renderOnce({ status: 'new', trigger: 'fate-check', depth: 'daily', use: 'self-view', agency: 'written', contradiction: 'recalibrate', want: 'purpose', help: 'limits' });
ok(!/love-email-kicker/.test(sample) && !/email-form/.test(sample), 'no email capture in result (user decision 2026-09-20)');
ok(sample.includes('love-aha') || sample.includes('love-offers') || sample.includes('What your answers suggest'), 'v2 layers render');
ok(QZ.launchSub && QZ.launchSub.length > 20, 'launchSub explicitly provided');

// 8. Every answer set maps to exactly one aha key from the library;
//    all four mapped keys reachable across the full signal walk.
const ahaKeys = new Set();
for (const d of depthV) for (const u of useV) for (const ag of agencyV) for (const co of contraV) {
  const a = { ...baseA, depth: d, use: u, agency: ag, contradiction: co };
  const k = QZ.matchAha(a, QZ.resolve(a));
  ok(!!window.MYSTICDO_AHA[k], `matchAha returns a library key for ${d}/${u}/${ag}/${co} → ${k}`);
  ahaKeys.add(k);
}
console.log(`  aha sweep produced ${ahaKeys.size} distinct aha keys`);
ok(ahaKeys.size === 4, 'all four mapped aha keys reachable — got ' + [...ahaKeys].join(','));

console.log(`what-is-my-north-node quiz: ${checks} checks -> ${failures === 0 ? 'ALL GREEN' : failures + ' FAILURES'}`);
process.exit(failures === 0 ? 0 : 1);
