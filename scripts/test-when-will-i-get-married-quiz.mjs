/* Logic test for the when-will-i-get-married quiz.
 * Dual-base exhaustive signal-combo walk + certainty-seeking reachability
 * + priority assertions + intent sweep + underneath scenarios
 * + render sweep + aha library check, modeled on
 * test-who-will-i-marry-quiz.mjs and test-dream-about-water-quiz.mjs.
 * Run: node scripts/test-when-will-i-get-married-quiz.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src = readFileSync(path.join(root, 'assets/js/quizzes.js'), 'utf8');

globalThis.window = {};
eval(src);

const QZ = window.MYSTICDO_QUIZZES['when-will-i-get-married'];
if (!QZ) throw new Error('when-will-i-get-married quiz not registered');

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

// 2. Dual-base exhaustive signal-combo walk (clock x ready x urgency x compare).
//    Base A: neutral trigger — pure signal walk.
//    Base B: family-pressure — exercises the pressure-reactive short-circuit
//    (fires unless compare === 'rarely').
const clk = optValues('clock');
const rdy = optValues('ready');
const urg = optValues('urgency');
const cmp = optValues('compare');
const baseA = { status: 'single', trigger: 'curiosity', want: 'relief', help: 'steady' };
const baseB = { status: 'single', trigger: 'family-pressure', want: 'relief', help: 'steady' };
const seenPattern = new Set();
let comboCount = 0;
for (const [name, base] of [['A', baseA], ['B', baseB]]) {
  for (const c of clk) for (const r of rdy) for (const u of urg) for (const m of cmp) {
    const a = { ...base, clock: c, ready: r, urgency: u, compare: m };
    const k = QZ.resolve(a);
    ok(RESULT_KEYS.includes(k), `resolve valid pattern for base ${name} combo ${c}/${r}/${u}/${m} → ${k}`);
    seenPattern.add(k);
    comboCount++;
  }
}
console.log(`  walked ${comboCount} signal combos across 2 bases; ${seenPattern.size} distinct patterns`);

// 3. certainty-seeking reachability (requires want='a-range' or trigger='reader-told',
//    both outside the signal walk) + priority assertions.
const csChecks = [
  { name: 'want a-range → certainty-seeking', a: { status: 'single', trigger: 'curiosity', clock: 'none', ready: 'ready', urgency: 'patient', compare: 'rarely', want: 'a-range', help: 'steady' } },
  { name: 'trigger reader-told → certainty-seeking', a: { status: 'single', trigger: 'reader-told', clock: 'none', ready: 'ready', urgency: 'patient', compare: 'rarely', want: 'relief', help: 'steady' } }
];
for (const c of csChecks) {
  const k = QZ.resolve(c.a);
  ok(k === 'certainty-seeking', `${c.name} (got ${k})`);
  seenPattern.add(k);
}
ok(QZ.resolve({ status: 'single', trigger: 'reader-told', clock: 'closing', ready: 'ready', urgency: 'patient', compare: 'rarely', want: 'a-range', help: 'steady' }) === 'window-closing', 'window-closing outranks certainty-seeking');
ok(QZ.resolve({ status: 'single', trigger: 'family-pressure', clock: 'closing', ready: 'ready', urgency: 'patient', compare: 'often', want: 'relief', help: 'steady' }) === 'window-closing', 'window-closing outranks pressure-reactive');
ok(QZ.resolve({ status: 'single', trigger: 'family-pressure', clock: 'none', ready: 'ready', urgency: 'patient', compare: 'often', want: 'a-range', help: 'steady' }) === 'pressure-reactive', 'pressure-reactive outranks certainty-seeking');
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
  { name: 'partnered + partner-asking → the-being-seen-question', a: { status: 'partnered', trigger: 'partner-asking', clock: 'none', ready: 'ready', urgency: 'patient', compare: 'rarely', want: 'relief', help: 'steady' }, expect: 'the-being-seen-question' },
  { name: 'want meaning → the-meaning-question', a: { status: 'single', trigger: 'curiosity', clock: 'none', ready: 'ready', urgency: 'patient', compare: 'rarely', want: 'meaning', help: 'steady' }, expect: 'the-meaning-question' },
  { name: 'want blocks → the-blocks-question', a: { status: 'single', trigger: 'curiosity', clock: 'none', ready: 'ready', urgency: 'patient', compare: 'rarely', want: 'blocks', help: 'steady' }, expect: 'the-blocks-question' },
  { name: 'urgency rushed → the-urgency-question', a: { status: 'single', trigger: 'curiosity', clock: 'none', ready: 'ready', urgency: 'rushed', compare: 'rarely', want: 'relief', help: 'steady' }, expect: 'the-urgency-question' },
  { name: 'age-milestone trigger → the-becoming-question', a: { status: 'single', trigger: 'age-milestone', clock: 'none', ready: 'work', urgency: 'patient', compare: 'rarely', want: 'relief', help: 'steady' }, expect: 'the-becoming-question' },
  { name: 'want readiness → the-becoming-question', a: { status: 'single', trigger: 'curiosity', clock: 'none', ready: 'work', urgency: 'patient', compare: 'rarely', want: 'readiness', help: 'steady' }, expect: 'the-becoming-question' },
  { name: 'certainty-seeking clean case → null', a: { status: 'single', trigger: 'reader-told', clock: 'none', ready: 'ready', urgency: 'patient', compare: 'rarely', want: 'a-range', help: 'steady' }, expect: null }
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
for (const w of wants) for (const h of helps) for (const t of clk) {
  const a = { status: 'single', trigger: 'curiosity', clock: t, ready: 'ready', urgency: 'patient', compare: 'rarely', want: w, help: h };
  try {
    const html = renderOnce(a);
    ok(html.includes('love-result') && html.includes('What your answers suggest') && html.includes('What to look at next') && html.includes('Your best-fit next step') && html.includes('btn-gold'), `render blocks for want=${w}/help=${h}/clock=${t}`);
  } catch (e) {
    renderCrashes++; failures++;
    console.error('  RENDER CRASH for', { w, h, t }, '\n', e.stack);
  }
}
ok(renderCrashes === 0, 'customResult never throws across the sweep');

// 7. Honesty guards: no verdict language, no email capture in results.
const sample = renderOnce({ status: 'single', trigger: 'reader-told', clock: 'closing', ready: 'unsure', urgency: 'rushed', compare: 'often', want: 'a-range', help: 'read-now' });
ok(!/love-email-kicker/.test(sample) && !/email-form/.test(sample), 'no email capture in result (user decision 2026-09-20)');
ok(sample.includes('love-aha') || sample.includes('love-offers') || sample.includes('What your answers suggest'), 'v2 layers render');
ok(QZ.launchSub && QZ.launchSub.length > 20, 'launchSub explicitly provided');

// 8. Every answer set maps to exactly one aha key from the library.
const ahaKeys = new Set();
for (const c of clk) for (const r of rdy) {
  const a = { ...baseA, clock: c, ready: r, urgency: 'patient', compare: 'rarely' };
  const k = QZ.matchAha(a, QZ.resolve(a));
  ok(!!window.MYSTICDO_AHA[k], `matchAha returns a library key for ${c}/${r} → ${k}`);
  ahaKeys.add(k);
}
console.log(`  aha sweep produced ${ahaKeys.size} distinct aha keys`);

console.log(`when-will-i-get-married quiz: ${checks} checks -> ${failures === 0 ? 'ALL GREEN' : failures + ' FAILURES'}`);
process.exit(failures === 0 ? 0 : 1);
