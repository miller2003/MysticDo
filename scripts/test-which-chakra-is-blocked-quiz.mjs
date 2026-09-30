/* Logic test for the which-chakra-is-blocked quiz.
 * Dual-base exhaustive signal-combo walk + priority assertions + intent sweep
 * + underneath scenarios + render sweep + aha library check,
 * modeled on test-past-life-regression-quiz.mjs.
 * Run: node scripts/test-which-chakra-is-blocked-quiz.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src = readFileSync(path.join(root, 'assets/js/quizzes.js'), 'utf8');

globalThis.window = {};
eval(src);

const QZ = window.MYSTICDO_QUIZZES['which-chakra-is-blocked'];
if (!QZ) throw new Error('which-chakra-is-blocked quiz not registered');

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

// 2. Dual-base exhaustive signal-combo walk (tell x reframe x bypass x range).
//    Base A: door=stuck + centre=throat — the felt-friction, expression-flavoured context.
//    Base B: door=relate + centre=heart — the relationship-pattern, heart-flavoured context.
//    (resolve reads only the four walked signals; door, centre, want, support are context-only,
//     except tell which is read for the located/unlocated split.)
const tellV = optValues('tell');
const reframeV = optValues('reframe');
const bypassV = optValues('bypass');
const rangeV = optValues('range');
const baseA = { door: 'stuck', centre: 'throat', want: 'method', support: 'insight' };
const baseB = { door: 'relate', centre: 'heart', want: 'outside', support: 'insight' };
const seenPattern = new Set();
let comboCount = 0;
for (const [name, base] of [['A', baseA], ['B', baseB]]) {
  for (const tl of tellV) for (const rf of reframeV) for (const by of bypassV) for (const rg of rangeV) {
    const a = { ...base, tell: tl, reframe: rf, bypass: by, range: rg };
    const k = QZ.resolve(a);
    ok(RESULT_KEYS.includes(k), `resolve valid pattern for base ${name} combo ${tl}/${rf}/${by}/${rg} → ${k}`);
    seenPattern.add(k);
    comboCount++;
  }
}
console.log(`  walked ${comboCount} signal combos across 2 bases; ${seenPattern.size} distinct patterns`);
ok(seenPattern.size === 5, 'all five patterns reachable across the walk — got ' + [...seenPattern].join(','));

// 3. Priority assertions — the resolution ladder in page order.
ok(QZ.resolve({ ...baseA, tell: 'life', reframe: 'literal', bypass: 'direct', range: 'flex' }) === 'blockage-diagnosis', 'blockage-diagnosis via reframe=literal outranks every positive signal');
ok(QZ.resolve({ ...baseA, tell: 'life', reframe: 'reflective', bypass: 'avoid', range: 'flex' }) === 'clearance-bypass', 'clearance-bypass via bypass=avoid outranks a fully positive pattern');
ok(QZ.resolve({ ...baseA, tell: 'life', reframe: 'reflective', bypass: 'direct', range: 'flex' }) === 'located-friction', 'located-friction via tell=life + all-positive');
ok(QZ.resolve({ ...baseA, tell: 'both', reframe: 'both', bypass: 'direct', range: 'flex' }) === 'located-friction', 'located-friction reachable via tell=both (sum=6)');
ok(QZ.resolve({ ...baseA, tell: 'express', reframe: 'reflective', bypass: 'direct', range: 'flex' }) === 'located-friction', 'located-friction reachable via tell=express');
ok(QZ.resolve({ ...baseA, tell: 'body', reframe: 'reflective', bypass: 'direct', range: 'flex' }) === 'unlocated-friction', 'unlocated-friction via tell=body (positive but body-led)');
ok(QZ.resolve({ ...baseA, tell: 'global', reframe: 'reflective', bypass: 'direct', range: 'flex' }) === 'unlocated-friction', 'unlocated-friction via tell=global');
ok(QZ.resolve({ ...baseA, tell: 'unsure', reframe: 'unsure', bypass: 'unsure', range: 'unsure' }) === 'not-enough-evidence', 'all-uncertain answers settle on not-enough-evidence');
ok(QZ.resolve({ ...baseA, tell: 'unsure', reframe: 'reflective', bypass: 'unsure', range: 'unsure' }) === 'not-enough-evidence', 'mid-neutral (sum=2, uncertain=3) settles on not-enough-evidence');
ok(QZ.resolve({ ...baseA, tell: 'unsure', reframe: 'reflective', bypass: 'direct', range: 'unsure' }) === 'unlocated-friction', 'sum=4, uncertain=2, tell=unsure → unlocated-friction (positive posture, unread site)');
ok(QZ.resolve({ ...baseA, tell: 'unsure', reframe: 'reflective', bypass: 'unsure', range: 'flex' }) === 'unlocated-friction', 'sum=4, uncertain=2, bypass+range readable but tell=unsure → unlocated-friction');
ok(QZ.resolve({ ...baseA, tell: 'life', reframe: 'reflective', bypass: 'unsure', range: 'unsure' }) === 'located-friction', 'sum=4, uncertain=2, tell=life carries the site → located-friction (uncertain does not outrank when |sum|>=3)');
// reframe=health is the health-attribution variant of the same failure mode as literal → blockage-diagnosis.
ok(QZ.resolve({ ...baseA, tell: 'life', reframe: 'health', bypass: 'direct', range: 'flex' }) === 'blockage-diagnosis', 'blockage-diagnosis via reframe=health (health attribution is the same failure mode)');

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
ok(QZ.matchPractice({ ...baseA, want: 'method', support: 'insight' }) === 'free_first', 'want=method routes to free_first');
ok(QZ.matchPractice({ ...baseA, want: 'outside', support: 'insight' }) === 'tarot_deep', 'want=outside routes to tarot_deep');
ok(QZ.matchPractice({ ...baseA, want: 'bypass', support: 'guidance' }) === 'closure', 'want=bypass routes to closure');

// 5. underneath scenarios — one per page underneath branch, in page order, plus null.
const ctxA = { door: 'stuck', centre: 'throat', want: 'method', support: 'insight', tell: 'life', reframe: 'reflective', bypass: 'direct', range: 'flex' };
const scenarios = [
  { name: 'want diagnosis → chakra-the-diagnosis', a: { ...ctxA, want: 'diagnosis' }, expect: 'chakra-the-diagnosis' },
  { name: 'pattern blockage-diagnosis → chakra-the-diagnosis', a: { ...ctxA, want: 'method', reframe: 'literal' }, expect: 'chakra-the-diagnosis' },
  { name: 'bypass avoid → chakra-the-bypass', a: { ...ctxA, want: 'method', bypass: 'avoid' }, expect: 'chakra-the-bypass' },
  { name: 'pattern clearance-bypass → chakra-the-bypass', a: { ...ctxA, want: 'method', bypass: 'avoid' }, expect: 'chakra-the-bypass' },
  { name: 'door fear → chakra-the-root-first', a: { ...ctxA, want: 'method', door: 'fear' }, expect: 'chakra-the-root-first' },
  { name: 'door health → chakra-the-clinician-first', a: { ...ctxA, want: 'method', door: 'health' }, expect: 'chakra-the-clinician-first' },
  { name: 'reframe health → chakra-the-diagnosis', a: { ...ctxA, want: 'method', reframe: 'health' }, expect: 'chakra-the-diagnosis' },
  { name: 'door told → chakra-the-outside-view', a: { ...ctxA, want: 'method', door: 'told' }, expect: 'chakra-the-outside-view' },
  { name: 'centre eye → chakra-the-outside-view', a: { ...ctxA, want: 'method', centre: 'eye' }, expect: 'chakra-the-outside-view' },
  { name: 'centre crown → chakra-the-outside-view', a: { ...ctxA, want: 'method', centre: 'crown' }, expect: 'chakra-the-outside-view' },
  { name: 'settled located-friction (no trigger) → null', a: { ...ctxA }, expect: null }
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
for (const w of wants) for (const s of supports) for (const rf of reframeV) {
  const a = { ...baseA, tell: 'life', reframe: rf, bypass: 'direct', range: 'flex', want: w, support: s };
  try {
    const html = renderOnce(a);
    ok(html.includes('love-result') && html.includes('What your answers suggest') && html.includes('What to look at next') && html.includes('Your best-fit next step') && html.includes('btn-gold'), `render blocks for want=${w}/support=${s}/reframe=${rf}`);
  } catch (e) {
    renderCrashes++; failures++;
    console.error('  RENDER CRASH for', { w, s, rf }, '\n', e.stack);
  }
}
ok(renderCrashes === 0, 'customResult never throws across the sweep');

// 7. Honesty guards: no verdict language, no email capture in results.
//    Sample routes to a booking practice (tarot_deep) so the negative-pattern tip renders:
//    negativePatternTip is intentionally suppressed on free_first/general (see mysticdoPatternResult).
const sample = renderOnce({ ...baseA, tell: 'life', reframe: 'literal', bypass: 'avoid', range: 'flex', want: 'outside', support: 'insight' });
ok(!/email-form/.test(sample), 'no email capture in result (user decision 2026-09-20)');
ok(sample.includes('love-aha') || sample.includes('The honest edge of this pattern'), 'v2 layers render');
ok(sample.includes('One thing worth naming'), 'negativePatternTip renders on its matched pattern when practice is a booking');
ok(sample.includes('illusion_fixation') === false, 'aha key name is not leaked as raw text');
ok(QZ.launchSub && QZ.launchSub.length > 20, 'launchSub explicitly provided');

// 8. Every answer set maps to exactly one aha key from the library;
//    all five mapped keys reachable across the full signal walk.
const ahaKeys = new Set();
for (const [name, base] of [['A', baseA], ['B', baseB]]) {
  for (const tl of tellV) for (const rf of reframeV) for (const by of bypassV) for (const rg of rangeV) {
    const a = { ...base, tell: tl, reframe: rf, bypass: by, range: rg };
    const k = QZ.matchAha(a, QZ.resolve(a));
    ok(!!window.MYSTICDO_AHA[k], `matchAha returns a library key for base ${name} ${tl}/${rf}/${by}/${rg} → ${k}`);
    ahaKeys.add(k);
  }
}
console.log(`  aha sweep produced ${ahaKeys.size} distinct aha keys`);
ok(ahaKeys.size === 5, 'all five mapped aha keys reachable — got ' + [...ahaKeys].join(','));

console.log(`which-chakra-is-blocked quiz: ${checks} checks -> ${failures === 0 ? 'ALL GREEN' : failures + ' FAILURES'}`);
process.exit(failures === 0 ? 0 : 1);
