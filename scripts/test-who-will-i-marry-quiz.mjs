/* Logic test for the who-will-i-marry quiz.
 * Dual-base exhaustive signal-combo walk + intent sweep + underneath scenarios
 * + render sweep + aha library check, modeled on test-111-meaning-quiz.mjs
 * (dual base) and test-dream-about-water-quiz.mjs.
 * Run: node scripts/test-who-will-i-marry-quiz.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src = readFileSync(path.join(root, 'assets/js/quizzes.js'), 'utf8');

globalThis.window = {};
eval(src);

const QZ = window.MYSTICDO_QUIZZES['who-will-i-marry'];
if (!QZ) throw new Error('who-will-i-marry quiz not registered');

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

// 2. Dual-base exhaustive signal-combo walk (drawn x belief x current x chapter).
const drw = optValues('drawn');
const blf = optValues('belief');
const cur = optValues('current');
const chp = optValues('chapter');
const baseA = { status: 'single', trigger: 'curiosity', want: 'pattern', help: 'interpret' };
const baseB = { status: 'single', trigger: 'name-date', want: 'pattern', help: 'interpret' };
const seenPattern = new Set();
let comboCount = 0;
for (const [name, base] of [['A', baseA], ['B', baseB]]) {
  for (const n of drw) for (const r of blf) for (const t of cur) for (const w of chp) {
    const a = { ...base, drawn: n, belief: r, current: t, chapter: w };
    const k = QZ.resolve(a);
    ok(RESULT_KEYS.includes(k), `resolve valid pattern for base ${name} combo ${n}/${r}/${t}/${w} → ${k}`);
    seenPattern.add(k);
    comboCount++;
  }
}
console.log(`  walked ${comboCount} signal combos across 2 bases; ${seenPattern.size} distinct patterns`);
ok(seenPattern.size === 5, 'all 5 patterns reachable — got ' + [...seenPattern].join(','));

// 3. Intent sweep — every matchPractice output is a real key, ≥6 reachable.
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

// 4. underneath scenarios — one per page current, in page order, plus null.
const scenarios = [
  { name: 'long-wait + quietly-no → the-alone-question', a: { status: 'long-wait', trigger: 'milestone', drawn: 'same-type', belief: 'quietly-no', current: 'no-one', chapter: 'paused', want: 'available', help: 'interpret' }, expect: 'the-alone-question' },
  { name: 'timeline trigger → the-timeline-question', a: { status: 'single', trigger: 'timeline', drawn: 'same-type', belief: 'probably-far', current: 'no-one', chapter: 'on-hold', want: 'timeline', help: 'insight' }, expect: 'the-timeline-question' },
  { name: 'partnered (clean read) → the-this-person-question', a: { status: 'partnered', trigger: 'milestone', drawn: 'same-type', belief: 'yes-in-time', current: 'yes-unspoken', chapter: 'building', want: 'this-person', help: 'dynamic' }, expect: 'the-this-person-question' },
  { name: 'back-forth belief → the-worth-question', a: { status: 'single', trigger: 'milestone', drawn: 'same-type', belief: 'back-forth', current: 'no-one', chapter: 'paused', want: 'pattern', help: 'insight' }, expect: 'the-worth-question' },
  { name: 'name-date trigger → the-name-demand', a: { status: 'single', trigger: 'name-date', drawn: 'same-type', belief: 'yes-in-time', current: 'no-one', chapter: 'actively-looking', want: 'pattern', help: 'insight' }, expect: 'the-name-demand' },
  { name: 'want beneath → meaning-question', a: { status: 'single', trigger: 'curiosity', drawn: 'notell', belief: 'probably-far', current: 'notell', chapter: 'notell', want: 'beneath', help: 'unsure' }, expect: 'meaning-question' },
  { name: 'no underneath (clean case)', a: { status: 'single', trigger: 'curiosity', drawn: 'varied', belief: 'yes-in-time', current: 'no-one', chapter: 'building', want: 'pattern', help: 'interpret' }, expect: null }
];
for (const sc of scenarios) {
  const u = QZ.underneath(sc.a, QZ.resolve(sc.a));
  ok((u ? u.key : null) === sc.expect, `${sc.name} → ${sc.expect} (got ${u ? u.key : null})`);
}

// 5. customResult renders all v2 blocks without throwing.
function renderOnce(a) {
  let html = '';
  const stubBody = { innerHTML: '', querySelector: () => null };
  const ctx = { answers: a, body: stubBody, emailFormHTML: () => '', bindEmailForms: () => {}, restart: () => {} };
  Object.defineProperty(stubBody, 'innerHTML', { get: () => html, set: v => { html = v; }, configurable: true });
  QZ.customResult(ctx);
  return html;
}
let renderCrashes = 0;
for (const w of wants) for (const h of helps) for (const t of blf) {
  const a = { status: 'single', trigger: 'curiosity', drawn: 'same-type', belief: t, current: 'no-one', chapter: 'building', want: w, help: h };
  try {
    const html = renderOnce(a);
    ok(html.includes('love-result') && html.includes('What your answers suggest') && html.includes('What to look at next') && html.includes('Your best-fit next step') && html.includes('btn-gold'), `render blocks for want=${w}/help=${h}/belief=${t}`);
  } catch (e) {
    renderCrashes++; failures++;
    console.error('  RENDER CRASH for', { w, h, t }, '\n', e.stack);
  }
}
ok(renderCrashes === 0, 'customResult never throws across the sweep');

// 6. Honesty guards: no verdict language, no email capture in results.
const sample = renderOnce({ status: 'single', trigger: 'name-date', drawn: 'unavailable', belief: 'stopped-wanting', current: 'no-one', chapter: 'on-hold', want: 'available', help: 'interpret' });
ok(!/love-email-kicker/.test(sample) && !/email-form/.test(sample), 'no email capture in result (user decision 2026-09-20)');
ok(sample.includes('love-aha') || sample.includes('love-offers') || sample.includes('What your answers suggest'), 'v2 layers render');
ok(QZ.launchSub && QZ.launchSub.length > 20, 'launchSub explicitly provided');

// 7. Every answer set maps to exactly one aha key from the library.
const ahaKeys = new Set();
for (const n of drw) for (const r of blf) {
  const a = { ...baseA, drawn: n, belief: r, current: 'no-one', chapter: 'building' };
  const k = QZ.matchAha(a, QZ.resolve(a));
  ok(!!window.MYSTICDO_AHA[k], `matchAha returns a library key for ${n}/${r} → ${k}`);
  ahaKeys.add(k);
}
console.log(`  aha sweep produced ${ahaKeys.size} distinct aha keys`);

console.log(`who-will-i-marry quiz: ${checks} checks -> ${failures === 0 ? 'ALL GREEN' : failures + ' FAILURES'}`);
process.exit(failures === 0 ? 0 : 1);
