/* Logic test for the past-life-regression quiz.
 * Dual-base exhaustive signal-combo walk + priority assertions + intent sweep
 * + underneath scenarios + render sweep + aha library check,
 * modeled on test-how-to-do-shadow-work-quiz.mjs.
 * Run: node scripts/test-past-life-regression-quiz.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src = readFileSync(path.join(root, 'assets/js/quizzes.js'), 'utf8');

globalThis.window = {};
eval(src);

const QZ = window.MYSTICDO_QUIZZES['past-life-regression'];
if (!QZ) throw new Error('past-life-regression quiz not registered');

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

// 2. Dual-base exhaustive signal-combo walk (seek x treat x engage x evidence).
//    Base A: phrase + proof — the definition-curious context.
//    Base B: pattern + method — the unexplained-pattern context.
//    (resolve reads only the four walked signals; door, want, support, weight are context-only.)
const seekV = optValues('seek');
const treatV = optValues('treat');
const engageV = optValues('engage');
const evidenceV = optValues('evidence');
const baseA = { door: 'phrase', want: 'proof', support: 'reflection', weight: 'accessible' };
const baseB = { door: 'pattern', want: 'method', support: 'reflection', weight: 'accessible' };
const seenPattern = new Set();
let comboCount = 0;
for (const [name, base] of [['A', baseA], ['B', baseB]]) {
  for (const sk of seekV) for (const tr of treatV) for (const en of engageV) for (const ev of evidenceV) {
    const a = { ...base, seek: sk, treat: tr, engage: en, evidence: ev };
    const k = QZ.resolve(a);
    ok(RESULT_KEYS.includes(k), `resolve valid pattern for base ${name} combo ${sk}/${tr}/${en}/${ev} → ${k}`);
    seenPattern.add(k);
    comboCount++;
  }
}
console.log(`  walked ${comboCount} signal combos across 2 bases; ${seenPattern.size} distinct patterns`);

// 3. Priority assertions — the resolution ladder in page order.
ok(QZ.resolve({ ...baseA, seek: 'narrative', treat: 'verdict', engage: 'this-life', evidence: 'open' }) === 'fact-hunting', 'fact-hunting via treat=verdict outranks every positive signal');
ok(QZ.resolve({ ...baseA, seek: 'fact', treat: 'material', engage: 'this-life', evidence: 'open' }) === 'fact-hunting', 'fact-hunting via seek=fact outranks a material+engaged+open pattern');
ok(QZ.resolve({ ...baseA, seek: 'narrative', treat: 'material', engage: 'elsewhere', evidence: 'open' }) === 'elsewhere-identity', 'elsewhere-identity via engage=elsewhere outranks a narrative+material pattern');
ok(QZ.resolve({ ...baseA, seek: 'narrative', treat: 'spectacle', engage: 'this-life', evidence: 'open' }) === 'elsewhere-identity', 'elsewhere-identity via treat=spectacle');
ok(QZ.resolve({ ...baseA, seek: 'narrative', treat: 'material', engage: 'this-life', evidence: 'dismiss' }) === 'skeptic-block', 'skeptic-block via evidence=dismiss outranks a fully positive pattern');
ok(QZ.resolve({ ...baseA, seek: 'narrative', treat: 'material', engage: 'this-life', evidence: 'open' }) === 'workable-narrative', 'workable-narrative via narrative+material+this-life');
ok(QZ.resolve({ ...baseA, seek: 'meaning', treat: 'material', engage: 'this-life', evidence: 'open' }) === 'workable-narrative', 'workable-narrative reachable via sum>=4 (meaning 1 + material 2 + this-life 2 + open 2)');
ok(QZ.resolve({ ...baseA, seek: 'unsure', treat: 'unsure', engage: 'unsure', evidence: 'unsure' }) === 'not-enough-evidence', 'all-uncertain answers settle on not-enough-evidence');
ok(QZ.resolve({ ...baseA, seek: 'meaning', treat: 'unsure', engage: 'unsure', evidence: 'unsure' }) === 'not-enough-evidence', 'mid-neutral (sum=1, uncertain=3) settles on not-enough-evidence');

// 4. Intent sweep — every matchPractice output is a real key, ≥5 reachable,
//    with the free_first fallback provably reachable.
const wants = optValues('want');
const supports = optValues('support');
const seenPractice = new Set();
for (const [name, base] of [['A', baseA], ['B', baseB]]) {
  for (const w of wants) for (const s of supports) {
    const a = { ...base, want: w, support: s };
    const k = QZ.matchPractice(a);
    ok(PRACTICE_KEYS.includes(k), `matchPractice valid key for base ${name} want=${w}/support=${s} → ${k}`);
    seenPractice.add(k);
  }
}
console.log(`  walked ${2 * wants.length * supports.length} intent combos; ${seenPractice.size} distinct practices`);
ok(seenPractice.size >= 5, 'at least 5 of 7 practices reachable');
ok(seenPractice.has('free_first') && seenPractice.has('general'), 'free_first and general both reachable');
ok(QZ.matchPractice({ ...baseA, want: 'proof', support: 'conversation' }) === 'psychic', 'support=conversation routes to psychic');
ok(QZ.matchPractice({ ...baseA, want: 'method', support: 'reflection' }) === 'tarot_deep', 'want=method routes to tarot_deep');

// 5. underneath scenarios — one per page underneath branch, in page order, plus null.
//    Note: every want value (proof/method/why/bypass) is a branch trigger on this page,
//    so ctxA carries no want key; each scenario sets the want it needs, and the
//    settled → null case is asserted with no want at all.
const ctxA = { door: 'evidence', support: 'reflection', weight: 'accessible' };
const midSignals = { door: 'evidence', support: 'reflection', weight: 'accessible', seek: 'narrative', treat: 'material', engage: 'this-life', evidence: 'open' };
const scenarios = [
  { name: 'door phrase → pastlife-the-question', a: { ...ctxA, ...midSignals, door: 'phrase' }, expect: 'pastlife-the-question' },
  { name: 'want proof → pastlife-the-question', a: { ...ctxA, ...midSignals, want: 'proof' }, expect: 'pastlife-the-question' },
  { name: 'want method → pastlife-the-seeking', a: { ...ctxA, ...midSignals, want: 'method' }, expect: 'pastlife-the-seeking' },
  { name: 'door pattern → pastlife-the-seeking', a: { ...ctxA, ...midSignals, door: 'pattern' }, expect: 'pastlife-the-seeking' },
  { name: 'want why → pastlife-the-verdict', a: { ...ctxA, ...midSignals, want: 'why' }, expect: 'pastlife-the-verdict' },
  { name: 'treat verdict → pastlife-the-verdict', a: { ...ctxA, ...midSignals, treat: 'verdict' }, expect: 'pastlife-the-verdict' },
  { name: 'seek fact → pastlife-the-verdict', a: { ...ctxA, ...midSignals, seek: 'fact' }, expect: 'pastlife-the-verdict' },
  { name: 'want bypass → pastlife-the-elsewhere', a: { ...ctxA, ...midSignals, want: 'bypass' }, expect: 'pastlife-the-elsewhere' },
  { name: 'engage elsewhere → pastlife-the-elsewhere', a: { ...ctxA, ...midSignals, engage: 'elsewhere' }, expect: 'pastlife-the-elsewhere' },
  { name: 'treat spectacle → pastlife-the-elsewhere', a: { ...ctxA, ...midSignals, treat: 'spectacle' }, expect: 'pastlife-the-elsewhere' },
  { name: 'support conversation → pastlife-the-evidence', a: { ...ctxA, ...midSignals, support: 'conversation' }, expect: 'pastlife-the-evidence' },
  { name: 'weight clinical → pastlife-the-evidence', a: { ...ctxA, ...midSignals, weight: 'clinical' }, expect: 'pastlife-the-evidence' },
  { name: 'door unfinished → pastlife-the-evidence', a: { ...ctxA, ...midSignals, door: 'unfinished' }, expect: 'pastlife-the-evidence' },
  { name: 'settled workable-narrative (no want trigger) → null', a: { ...ctxA, ...midSignals }, expect: null }
];
for (const sc of scenarios) {
  const answers = { ...sc.a };
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
for (const w of wants) for (const s of supports) for (const tr of treatV) {
  const a = { ...baseA, seek: 'narrative', treat: tr, engage: 'this-life', evidence: 'open', want: w, support: s };
  try {
    const html = renderOnce(a);
    ok(html.includes('love-result') && html.includes('What your answers suggest') && html.includes('What to look at next') && html.includes('Your best-fit next step') && html.includes('btn-gold'), `render blocks for want=${w}/support=${s}/treat=${tr}`);
  } catch (e) {
    renderCrashes++; failures++;
    console.error('  RENDER CRASH for', { w, s, tr }, '\n', e.stack);
  }
}
ok(renderCrashes === 0, 'customResult never throws across the sweep');

// 7. Honesty guards: no verdict language, no email capture in results.
const sample = renderOnce({ ...baseA, seek: 'fact', treat: 'verdict', engage: 'elsewhere', evidence: 'dismiss', want: 'why', support: 'conversation' });
ok(!/email-form/.test(sample), 'no email capture in result (user decision 2026-09-20)');
ok(sample.includes('love-aha') || sample.includes('The honest edge of this pattern'), 'v2 layers render');
ok(sample.includes('One thing worth naming'), 'negativePatternTip renders on its matched pattern');
ok(QZ.launchSub && QZ.launchSub.length > 20, 'launchSub explicitly provided');

// 8. Every answer set maps to exactly one aha key from the library;
//    all five mapped keys reachable across the full signal walk.
const ahaKeys = new Set();
for (const [name, base] of [['A', baseA], ['B', baseB]]) {
  for (const sk of seekV) for (const tr of treatV) for (const en of engageV) for (const ev of evidenceV) {
    const a = { ...base, seek: sk, treat: tr, engage: en, evidence: ev };
    const k = QZ.matchAha(a, QZ.resolve(a));
    ok(!!window.MYSTICDO_AHA[k], `matchAha returns a library key for base ${name} ${sk}/${tr}/${en}/${ev} → ${k}`);
    ahaKeys.add(k);
  }
}
console.log(`  aha sweep produced ${ahaKeys.size} distinct aha keys`);
ok(ahaKeys.size === 5, 'all five mapped aha keys reachable — got ' + [...ahaKeys].join(','));

console.log(`past-life-regression quiz: ${checks} checks -> ${failures === 0 ? 'ALL GREEN' : failures + ' FAILURES'}`);
process.exit(failures === 0 ? 0 : 1);
