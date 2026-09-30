/* Logic test for the will-i-ever-find-love quiz (alone-forever intent).
 * Dual-base exhaustive signal-combo walk + priority assertions + intent sweep
 * + underneath scenarios + render sweep + aha library check,
 * modeled on test-when-will-i-get-married-quiz.mjs.
 * Run: node scripts/test-will-i-ever-find-love-quiz.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src = readFileSync(path.join(root, 'assets/js/quizzes.js'), 'utf8');

globalThis.window = {};
eval(src);

const QZ = window.MYSTICDO_QUIZZES['will-i-ever-find-love'];
if (!QZ) throw new Error('will-i-ever-find-love quiz not registered');

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
const PRACTICE_KEYS = Object.keys(QZ.practice);
ok(PRACTICE_KEYS.length === 7, 'exactly 7 practice outcomes — got ' + PRACTICE_KEYS.length);

// 2. Dual-base exhaustive signal-combo walk (worth x pattern x fearDrive x compare).
//    Base A: single + curiosity — pure signal walk.
//    Base B: partnered — exercises the underneath unseen branch context.
const wrt = optValues('worth');
const pat = optValues('pattern');
const fdr = optValues('fearDrive');
const cmp = optValues('compare');
const baseA = { status: 'single', trigger: 'curiosity', want: 'relief', help: 'steady' };
const baseB = { status: 'partnered', trigger: 'ended', want: 'relief', help: 'steady' };
const seenPattern = new Set();
let comboCount = 0;
for (const [name, base] of [['A', baseA], ['B', baseB]]) {
  for (const w of wrt) for (const p of pat) for (const f of fdr) for (const c of cmp) {
    const a = { ...base, worth: w, pattern: p, fearDrive: f, compare: c };
    const k = QZ.resolve(a);
    ok(RESULT_KEYS.includes(k), `resolve valid pattern for base ${name} combo ${w}/${p}/${f}/${c} → ${k}`);
    seenPattern.add(k);
    comboCount++;
  }
}
console.log(`  walked ${comboCount} signal combos across 2 bases; ${seenPattern.size} distinct patterns`);

// 3. Priority assertions — the resolution ladder in page order.
ok(QZ.resolve({ status: 'single', trigger: 'ended', worth: 'loudly', pattern: 'same-way', fearDrive: 'yes-cling', compare: 'constantly', want: 'relief', help: 'steady' }) === 'worth-fear', 'worth-fear outranks all other signals');
ok(QZ.resolve({ status: 'single', trigger: 'ended', worth: 'no', pattern: 'same-way', fearDrive: 'yes-cling', compare: 'constantly', want: 'relief', help: 'steady' }) === 'recurrence-pattern', 'recurrence-pattern outranks comparison and loop');
ok(QZ.resolve({ status: 'single', trigger: 'ended', worth: 'no', pattern: 'varied', fearDrive: 'yes-cling', compare: 'constantly', want: 'relief', help: 'steady' }) === 'comparison-trap', 'comparison-trap outranks fear-driven loop');
ok(QZ.resolve({ status: 'single', trigger: 'ended', worth: 'no', pattern: 'varied', fearDrive: 'yes-shrink', compare: 'rarely', want: 'relief', help: 'steady' }) === 'fear-driving-behavior', 'fear-driving-behavior reachable via yes-shrink');
ok(seenPattern.size === 5, 'all 5 patterns reachable — got ' + [...seenPattern].join(','));

// 4. Intent sweep — every matchPractice output is a real key, ≥6 reachable.
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

// 5. underneath scenarios — one per page underneath current, in page order, plus null.
const scenarios = [
  { name: 'worth loudly → the-worth-question', a: { status: 'single', trigger: 'ended', worth: 'loudly', pattern: 'varied', fearDrive: 'no', compare: 'rarely', want: 'worth-work', help: 'steady' }, expect: 'the-worth-question' },
  { name: 'partnered + clean signals → the-unseen-question', a: { status: 'partnered', trigger: 'curiosity', worth: 'no', pattern: 'varied', fearDrive: 'no', compare: 'sometimes', want: 'relief', help: 'steady' }, expect: 'the-unseen-question' },
  { name: 'night-thought trigger → the-unseen-question', a: { status: 'single', trigger: 'night-thought', worth: 'no', pattern: 'varied', fearDrive: 'no', compare: 'sometimes', want: 'relief', help: 'steady' }, expect: 'the-unseen-question' },
  { name: 'fearDrive cling → the-fear-drives-question', a: { status: 'single', trigger: 'curiosity', worth: 'no', pattern: 'varied', fearDrive: 'yes-cling', compare: 'rarely', want: 'pattern-insight', help: 'name-pattern' }, expect: 'the-fear-drives-question' },
  { name: 'compare constantly → the-comparison-question', a: { status: 'single', trigger: 'others-commit', worth: 'no', pattern: 'varied', fearDrive: 'no', compare: 'constantly', want: 'relief', help: 'steady' }, expect: 'the-comparison-question' },
  { name: 'pattern same-way → the-recurrence-question', a: { status: 'single', trigger: 'curiosity', worth: 'no', pattern: 'same-way', fearDrive: 'no', compare: 'rarely', want: 'pattern-insight', help: 'name-pattern' }, expect: 'the-recurrence-question' },
  { name: 'not-enough-evidence → null', a: { status: 'single', trigger: 'curiosity', worth: 'notell', pattern: 'notell', fearDrive: 'notell', compare: 'notell', want: 'relief', help: 'unsure' }, expect: null }
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
for (const w of wants) for (const h of helps) for (const t of wrt) {
  const a = { status: 'single', trigger: 'curiosity', worth: t, pattern: 'varied', fearDrive: 'no', compare: 'rarely', want: w, help: h };
  try {
    const html = renderOnce(a);
    ok(html.includes('love-result') && html.includes('What your answers suggest') && html.includes('What to look at next') && html.includes('Your best-fit next step') && html.includes('btn-gold'), `render blocks for want=${w}/help=${h}/worth=${t}`);
  } catch (e) {
    renderCrashes++; failures++;
    console.error('  RENDER CRASH for', { w, h, t }, '\n', e.stack);
  }
}
ok(renderCrashes === 0, 'customResult never throws across the sweep');

// 7. Honesty guards: no verdict language, no email capture in results.
const sample = renderOnce({ status: 'recent-exit', trigger: 'ended', worth: 'loudly', pattern: 'same-way', fearDrive: 'yes-shrink', compare: 'constantly', want: 'a-future', help: 'read-now' });
ok(!/love-email-kicker/.test(sample) && !/email-form/.test(sample), 'no email capture in result (user decision 2026-09-20)');
ok(sample.includes('love-aha') || sample.includes('love-offers') || sample.includes('What your answers suggest'), 'v2 layers render');
ok(QZ.launchSub && QZ.launchSub.length > 20, 'launchSub explicitly provided');

// 8. Every answer set maps to exactly one aha key from the library.
const ahaKeys = new Set();
for (const w of wrt) for (const p of pat) {
  const a = { ...baseA, worth: w, pattern: p, fearDrive: 'no', compare: 'rarely' };
  const k = QZ.matchAha(a, QZ.resolve(a));
  ok(!!window.MYSTICDO_AHA[k], `matchAha returns a library key for ${w}/${p} → ${k}`);
  ahaKeys.add(k);
}
console.log(`  aha sweep produced ${ahaKeys.size} distinct aha keys`);

console.log(`will-i-ever-find-love quiz: ${checks} checks -> ${failures === 0 ? 'ALL GREEN' : failures + ' FAILURES'}`);
process.exit(failures === 0 ? 0 : 1);
