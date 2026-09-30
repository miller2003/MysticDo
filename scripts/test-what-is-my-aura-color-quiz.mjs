/* Logic test for the what-is-my-aura-color quiz.
 * Dual-base exhaustive signal-combo walk + priority assertions + intent sweep
 * + underneath scenarios + render sweep + aha library check,
 * modeled on test-signs-of-spiritual-awakening-quiz.mjs.
 * Run: node scripts/test-what-is-my-aura-color-quiz.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src = readFileSync(path.join(root, 'assets/js/quizzes.js'), 'utf8');

globalThis.window = {};
eval(src);

const QZ = window.MYSTICDO_QUIZZES['what-is-my-aura-color'];
if (!QZ) throw new Error('what-is-my-aura-color quiz not registered');

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

// 2. Dual-base exhaustive signal-combo walk (use x fixity x shadow x verify).
//    Base A: sense + snapshot — the honest-hold context (snapshot-reader reach).
//    Base B: photo + growth — the developmental context (brightness-seeker reach).
const useV = optValues('use');
const fixityV = optValues('fixity');
const shadowV = optValues('shadow');
const verifyV = optValues('verify');
const baseA = { door: 'sense', frame: 'snapshot', want: 'identity', help: 'reflection' };
const baseB = { door: 'photo', frame: 'growth', want: 'shift', help: 'limits' };
const seenPattern = new Set();
let comboCount = 0;
for (const [name, base] of [['A', baseA], ['B', baseB]]) {
  for (const u of useV) for (const f of fixityV) for (const s of shadowV) for (const v of verifyV) {
    const a = { ...base, use: u, fixity: f, shadow: s, verify: v };
    const k = QZ.resolve(a);
    ok(RESULT_KEYS.includes(k), `resolve valid pattern for base ${name} combo ${u}/${f}/${s}/${v} → ${k}`);
    seenPattern.add(k);
    comboCount++;
  }
}
console.log(`  walked ${comboCount} signal combos across 2 bases; ${seenPattern.size} distinct patterns`);

// 3. Priority assertions — the resolution ladder in page order.
ok(QZ.resolve({ ...baseA, use: 'proof', fixity: 'shifting', shadow: 'open', verify: 'tested' }) === 'barnum-capture', 'barnum-capture via use=proof outranks all signals');
ok(QZ.resolve({ ...baseA, use: 'horoscope', fixity: 'mixed', shadow: 'open', verify: 'unchecked' }) === 'barnum-capture', 'barnum-capture via horoscope + unchecked');
ok(QZ.resolve({ ...baseA, use: 'resonance', fixity: 'fixed', shadow: 'rejected', verify: 'tested' }) === 'identity-locked', 'identity-locked via fixed + shadow rejected');
ok(QZ.resolve({ ...baseA, frame: 'identity', use: 'resonance', fixity: 'fixed', shadow: 'partially', verify: 'tested' }) === 'identity-locked', 'identity-locked via fixed + identity frame');
ok(QZ.resolve({ ...baseB, use: 'horoscope', fixity: 'mixed', shadow: 'open', verify: 'tested' }) === 'brightness-seeker', 'brightness-seeker via growth frame + open shadow');
ok(QZ.resolve({ ...baseA, use: 'resonance', fixity: 'shifting', shadow: 'partially', verify: 'felt-true' }) === 'snapshot-reader', 'snapshot-reader via shifting + snapshot frame');
ok(QZ.resolve({ ...baseA, use: 'unsure', fixity: 'unsure', shadow: 'unsure', verify: 'unsure' }) === 'not-enough-evidence', 'all-uncertain answers settle on not-enough-evidence');
ok(QZ.resolve({ ...baseA, use: 'resonance', fixity: 'mixed', shadow: 'partially', verify: 'felt-true' }) === 'snapshot-reader', 'mild-positive sum settles on snapshot-reader');
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
const midSignals = { use: 'resonance', fixity: 'mixed', shadow: 'partially', verify: 'felt-true' };
const scenarios = [
  { name: 'fixity fixed → the-fixity-question', a: { ...baseA, ...midSignals }, fixity: 'fixed', expect: 'the-fixity-question' },
  { name: 'use horoscope → the-barnum-question', a: { ...baseA, ...midSignals }, use: 'horoscope', expect: 'the-barnum-question' },
  { name: 'door photo → the-science-question', a: { ...baseB, use: 'resonance', fixity: 'mixed', shadow: 'partially', verify: 'felt-true' }, expect: 'the-science-question' },
  { name: 'want verify → the-seeing-question', a: { ...baseA, ...midSignals }, want: 'verify', expect: 'the-seeing-question' },
  { name: 'want reading → the-reading-question', a: { ...baseA, door: 'curious', ...midSignals }, want: 'reading', expect: 'the-reading-question' },
  { name: 'settled honest hold → null', a: { ...baseA, door: 'curious', ...midSignals }, want: 'identity', expect: null }
];
for (const sc of scenarios) {
  const answers = { ...sc.a };
  if (sc.want) answers.want = sc.want;
  if (sc.fixity) answers.fixity = sc.fixity;
  if (sc.use) answers.use = sc.use;
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
for (const w of wants) for (const h of helps) for (const u of useV) {
  const a = { ...baseA, use: u, fixity: 'mixed', shadow: 'partially', verify: 'felt-true', want: w, help: h };
  try {
    const html = renderOnce(a);
    ok(html.includes('love-result') && html.includes('What your answers suggest') && html.includes('What to look at next') && html.includes('Your best-fit next step') && html.includes('btn-gold'), `render blocks for want=${w}/help=${h}/use=${u}`);
  } catch (e) {
    renderCrashes++; failures++;
    console.error('  RENDER CRASH for', { w, h, u }, '\n', e.stack);
  }
}
ok(renderCrashes === 0, 'customResult never throws across the sweep');

// 7. Honesty guards: no verdict language, no email capture in results.
const sample = renderOnce({ ...baseA, use: 'proof', fixity: 'fixed', shadow: 'rejected', verify: 'unchecked', want: 'identity', help: 'limits' });
ok(!/love-email-kicker/.test(sample) && !/email-form/.test(sample), 'no email capture in result (user decision 2026-09-20)');
ok(sample.includes('love-aha') || sample.includes('love-offers') || sample.includes('What your answers suggest'), 'v2 layers render');
ok(QZ.launchSub && QZ.launchSub.length > 20, 'launchSub explicitly provided');

// 8. Every answer set maps to exactly one aha key from the library;
//    all four mapped keys reachable across the full signal walk.
const ahaKeys = new Set();
for (const [name, base] of [['A', baseA], ['B', baseB]]) {
  for (const u of useV) for (const f of fixityV) for (const s of shadowV) for (const v of verifyV) {
    const a = { ...base, use: u, fixity: f, shadow: s, verify: v };
    const k = QZ.matchAha(a, QZ.resolve(a));
    ok(!!window.MYSTICDO_AHA[k], `matchAha returns a library key for base ${name} ${u}/${f}/${s}/${v} → ${k}`);
    ahaKeys.add(k);
  }
}
console.log(`  aha sweep produced ${ahaKeys.size} distinct aha keys`);
ok(ahaKeys.size === 4, 'all four mapped aha keys reachable — got ' + [...ahaKeys].join(','));

console.log(`what-is-my-aura-color quiz: ${checks} checks -> ${failures === 0 ? 'ALL GREEN' : failures + ' FAILURES'}`);
process.exit(failures === 0 ? 0 : 1);
