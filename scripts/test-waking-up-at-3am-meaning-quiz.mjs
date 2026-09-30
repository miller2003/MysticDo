/* Logic test for the waking-up-at-3am-meaning quiz.
 * Dual-base exhaustive signal-combo walk + priority assertions + intent sweep
 * + underneath scenarios + render sweep + aha library check,
 * modeled on test-what-is-my-big-three-quiz.mjs.
 * Run: node scripts/test-waking-up-at-3am-meaning-quiz.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src = readFileSync(path.join(root, 'assets/js/quizzes.js'), 'utf8');

globalThis.window = {};
eval(src);

const QZ = window.MYSTICDO_QUIZZES['waking-up-at-3am-meaning'];
if (!QZ) throw new Error('waking-up-at-3am-meaning quiz not registered');

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

// 2. Dual-base exhaustive signal-combo walk (response x content x daytime x meaning).
//    Base A: sometimes + curiosity — pure signal walk.
//    Base B: most-nights + medical — exercises the strain context.
const responseV = optValues('response');
const contentV = optValues('content');
const daytimeV = optValues('daytime');
const meaningV = optValues('meaning');
const baseA = { status: 'new', trigger: 'curiosity', want: 'meaning', help: 'reading', frequency: 'sometimes' };
const baseB = { status: 'new', trigger: 'medical', want: 'meaning', help: 'reading', frequency: 'most-nights' };
const seenPattern = new Set();
let comboCount = 0;
for (const [name, base] of [['A', baseA], ['B', baseB]]) {
  for (const r of responseV) for (const c of contentV) for (const d of daytimeV) for (const m of meaningV) {
    const a = { ...base, response: r, content: c, daytime: d, meaning: m };
    const k = QZ.resolve(a);
    ok(RESULT_KEYS.includes(k), `resolve valid pattern for base ${name} combo ${r}/${c}/${d}/${m} → ${k}`);
    seenPattern.add(k);
    comboCount++;
  }
}
console.log(`  walked ${comboCount} signal combos across 2 bases; ${seenPattern.size} distinct patterns`);

// 3. Priority assertions — the resolution ladder in page order.
ok(QZ.resolve({ ...baseA, response: 'turn', content: 'named', daytime: 'processed', meaning: 'omen' }) === 'presence-reader', 'presence-reader via meaning=omen outranks all signals');
ok(QZ.resolve({ ...baseA, response: 'fight', content: 'named', daytime: 'processed', meaning: 'information' }) === 'fear-spiral', 'fear-spiral reachable via response=fight');
ok(QZ.resolve({ ...baseA, response: 'turn', content: 'named', daytime: 'avoided', meaning: 'information' }) === 'avoided-surfacing', 'avoided-surfacing reachable via daytime=avoided');
ok(QZ.resolve({ ...baseA, response: 'turn', content: 'varied', daytime: 'processed', meaning: 'information' }) === 'receptive-use', 'receptive-use reachable via turn + processed');
ok(QZ.resolve({ ...baseA, response: 'notell', content: 'notell', daytime: 'notell', meaning: 'notell' }) === 'not-enough-evidence', 'all-uncertain answers settle on not-enough-evidence');
ok(QZ.resolve({ ...baseA, response: 'drift', content: 'varied', daytime: 'partly', meaning: 'open' }) === 'receptive-use', 'mild-positive sum settles on receptive-use');
ok(seenPattern.size === 5, 'all 5 patterns reachable — got ' + [...seenPattern].join(','));

// 4. Intent sweep — every matchPractice output is a real key, ≥6 reachable,
//    with the free_first fallback provably reachable (matchPractice lesson ×4).
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
  { name: 'trigger hour → the-hour-question', a: { ...baseA, response: 'drift', content: 'varied', daytime: 'partly', meaning: 'open' }, trigger: 'hour', expect: 'the-hour-question' },
  { name: 'content named → the-waking-thought-question', a: { ...baseA, response: 'drift', content: 'named', daytime: 'partly', meaning: 'open' }, trigger: 'curiosity', expect: 'the-waking-thought-question' },
  { name: 'trigger medical → the-strain-question', a: { ...baseA, response: 'drift', content: 'varied', daytime: 'partly', meaning: 'open' }, trigger: 'medical', expect: 'the-strain-question' },
  { name: 'meaning omen → the-presence-question', a: { ...baseA, response: 'drift', content: 'varied', daytime: 'partly', meaning: 'omen' }, trigger: 'curiosity', expect: 'the-presence-question' },
  { name: 'want work-with → the-use-question', a: { ...baseA, response: 'drift', content: 'varied', daytime: 'partly', meaning: 'open' }, trigger: 'curiosity', want: 'work-with', expect: 'the-use-question' },
  { name: 'unsettled answers → null', a: { ...baseA, response: 'drift', content: 'varied', daytime: 'partly', meaning: 'open' }, trigger: 'curiosity', expect: null }
];
for (const sc of scenarios) {
  const answers = { ...sc.a, trigger: sc.trigger };
  if (sc.want) answers.want = sc.want;
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
for (const w of wants) for (const h of helps) for (const r of responseV) {
  const a = { ...baseA, response: r, content: 'varied', daytime: 'partly', meaning: 'open', want: w, help: h };
  try {
    const html = renderOnce(a);
    ok(html.includes('love-result') && html.includes('What your answers suggest') && html.includes('What to look at next') && html.includes('Your best-fit next step') && html.includes('btn-gold'), `render blocks for want=${w}/help=${h}/response=${r}`);
  } catch (e) {
    renderCrashes++; failures++;
    console.error('  RENDER CRASH for', { w, h, r }, '\n', e.stack);
  }
}
ok(renderCrashes === 0, 'customResult never throws across the sweep');

// 7. Honesty guards: no verdict language, no email capture in results.
const sample = renderOnce({ ...baseA, response: 'drift', content: 'vague', daytime: 'notell', meaning: 'omen', want: 'meaning', help: 'limits' });
ok(!/love-email-kicker/.test(sample) && !/email-form/.test(sample), 'no email capture in result (user decision 2026-09-20)');
ok(sample.includes('love-aha') || sample.includes('love-offers') || sample.includes('What your answers suggest'), 'v2 layers render');
ok(QZ.launchSub && QZ.launchSub.length > 20, 'launchSub explicitly provided');

// 8. Every answer set maps to exactly one aha key from the library;
//    all four mapped keys reachable across the full signal walk.
const ahaKeys = new Set();
for (const r of responseV) for (const c of contentV) for (const d of daytimeV) for (const m of meaningV) {
  const a = { ...baseA, response: r, content: c, daytime: d, meaning: m };
  const k = QZ.matchAha(a, QZ.resolve(a));
  ok(!!window.MYSTICDO_AHA[k], `matchAha returns a library key for ${r}/${c}/${d}/${m} → ${k}`);
  ahaKeys.add(k);
}
console.log(`  aha sweep produced ${ahaKeys.size} distinct aha keys`);
ok(ahaKeys.size === 4, 'all four mapped aha keys reachable — got ' + [...ahaKeys].join(','));

console.log(`waking-up-at-3am-meaning quiz: ${checks} checks -> ${failures === 0 ? 'ALL GREEN' : failures + ' FAILURES'}`);
process.exit(failures === 0 ? 0 : 1);
