/* Logic test for the scripting-manifestation quiz.
 * Dual-base exhaustive signal-combo walk + priority assertions + intent sweep
 * + underneath scenarios + render sweep + aha library check,
 * modeled on test-law-of-assumption-quiz.mjs.
 * Run: node scripts/test-scripting-manifestation-quiz.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src = readFileSync(path.join(root, 'assets/js/quizzes.js'), 'utf8');

globalThis.window = {};
eval(src);

const QZ = window.MYSTICDO_QUIZZES['scripting-manifestation'];
if (!QZ) throw new Error('scripting-manifestation quiz not registered');

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

// 2. Dual-base exhaustive signal-combo walk (shape x inside x felt x again).
//    Base A: starting + state — the fresh-start context.
//    Base B: stalled + form — the honest-doubt context.
//    (resolve reads only the four walked signals; door and target are
//     context-only, so no gate-triggering base constraint applies here.)
const shapeV = optValues('shape');
const insideV = optValues('inside');
const feltV = optValues('felt');
const againV = optValues('again');
const baseA = { door: 'starting', target: 'state', want: 'difference', help: 'reflection' };
const baseB = { door: 'stalled', target: 'form', want: 'difference', help: 'reflection' };
const seenPattern = new Set();
let comboCount = 0;
for (const [name, base] of [['A', baseA], ['B', baseB]]) {
  for (const sh of shapeV) for (const ins of insideV) for (const fe of feltV) for (const ag of againV) {
    const a = { ...base, shape: sh, inside: ins, felt: fe, again: ag };
    const k = QZ.resolve(a);
    ok(RESULT_KEYS.includes(k), `resolve valid pattern for base ${name} combo ${sh}/${ins}/${fe}/${ag} → ${k}`);
    seenPattern.add(k);
    comboCount++;
  }
}
console.log(`  walked ${comboCount} signal combos across 2 bases; ${seenPattern.size} distinct patterns`);

// 3. Priority assertions — the resolution ladder in page order.
ok(QZ.resolve({ ...baseA, shape: 'narrative', inside: 'inside', felt: 'warm', again: 'relief' }) === 'comfort-loop', 'comfort-loop via again=relief outranks all positive signals');
ok(QZ.resolve({ ...baseA, shape: 'list', inside: 'inside', felt: 'warm', again: 'carries' }) === 'wishlist-script', 'wishlist-script via shape=list outranks named+inhabited writing');
ok(QZ.resolve({ ...baseA, shape: 'none', inside: 'inside', felt: 'warm', again: 'carries' }) === 'not-enough-evidence', 'shape=none settles on not-enough-evidence (nothing written yet)');
ok(QZ.resolve({ ...baseA, shape: 'narrative', inside: 'inside', felt: 'flat', again: 'carries' }) === 'flat-pen', 'flat-pen via felt=flat outranks named+inhabited writing');
ok(QZ.resolve({ ...baseA, shape: 'narrative', inside: 'fast', felt: 'warm', again: 'carries' }) === 'flat-pen', 'flat-pen via inside=fast (the mechanical pen)');
ok(QZ.resolve({ ...baseA, shape: 'narrative', inside: 'inside', felt: 'unsure', again: 'unsure' }) === 'lived-script', 'lived-script via narrative+inside outranks uncertain answers');
ok(QZ.resolve({ ...baseA, shape: 'unsure', inside: 'unsure', felt: 'unsure', again: 'unsure' }) === 'not-enough-evidence', 'all-uncertain answers settle on not-enough-evidence');
ok(QZ.resolve({ ...baseA, shape: 'narrative', inside: 'watching', felt: 'mixed', again: 'fades' }) === 'not-enough-evidence', 'flat-neutral sum settles on not-enough-evidence');
ok(QZ.resolve({ ...baseA, shape: 'letter', inside: 'inside', felt: 'warm', again: 'carries' }) === 'lived-script', 'letter form with identification settles on lived-script');
ok(QZ.resolve({ ...baseA, shape: 'narrative', inside: 'watching', felt: 'warm', again: 'carries' }) === 'lived-script', 'strong felt+carry signals with watching sum to lived-script');
ok(seenPattern.size === 5, 'all 5 patterns reachable — got ' + [...seenPattern].join(','));

// 4. Intent sweep — every matchPractice output is a real key, ≥5 reachable,
//    with the free_first fallback provably reachable (matchPractice lesson ×6).
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
ok(QZ.matchPractice({ ...baseA, want: 'difference', help: 'reflection' }) === 'free_first', 'want=difference falls through to free_first (fallback provable)');

// 5. underneath scenarios — one per page underneath branch, in page order, plus null.
const midSignals = { shape: 'narrative', inside: 'inside', felt: 'warm', again: 'carries' };
const scenarios = [
  { name: 'door contrast → the-difference-question', a: { ...baseA, ...midSignals, door: 'contrast' }, expect: 'the-difference-question' },
  { name: 'door hype → the-difference-question', a: { ...baseA, ...midSignals, door: 'hype' }, expect: 'the-difference-question' },
  { name: 'target form → the-target-question', a: { ...baseA, ...midSignals, target: 'form' }, expect: 'the-target-question' },
  { name: 'want method → the-target-question', a: { ...baseA, ...midSignals, want: 'method' }, expect: 'the-target-question' },
  { name: 'felt flat → the-felt-question', a: { ...baseA, ...midSignals, felt: 'flat' }, expect: 'the-felt-question' },
  { name: 'want why → the-felt-question', a: { ...baseA, ...midSignals, want: 'why' }, expect: 'the-felt-question' },
  { name: 'want proof → the-evidence-question', a: { ...baseA, ...midSignals, want: 'proof' }, expect: 'the-evidence-question' },
  { name: 'help conversation → the-reading-question', a: { ...baseA, ...midSignals, help: 'conversation' }, expect: 'the-reading-question' },
  { name: 'settled lived-script → null', a: { ...baseA, ...midSignals }, expect: null }
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
for (const w of wants) for (const h of helps) for (const sh of shapeV) {
  const a = { ...baseA, shape: sh, inside: 'inside', felt: 'warm', again: 'carries', want: w, help: h };
  try {
    const html = renderOnce(a);
    ok(html.includes('love-result') && html.includes('What your answers suggest') && html.includes('What to look at next') && html.includes('Your best-fit next step') && html.includes('btn-gold'), `render blocks for want=${w}/help=${h}/shape=${sh}`);
  } catch (e) {
    renderCrashes++; failures++;
    console.error('  RENDER CRASH for', { w, h, sh }, '\n', e.stack);
  }
}
ok(renderCrashes === 0, 'customResult never throws across the sweep');

// 7. Honesty guards: no verdict language, no email capture in results.
const sample = renderOnce({ ...baseA, shape: 'narrative', inside: 'fast', felt: 'flat', again: 'fades', want: 'why', help: 'conversation' });
ok(!/email-form/.test(sample), 'no email capture in result (user decision 2026-09-20)');
ok(sample.includes('love-aha') || sample.includes('The honest edge of this pattern'), 'v2 layers render');
ok(sample.includes('One thing worth naming'), 'negativePatternTip renders on its matched pattern');
ok(QZ.launchSub && QZ.launchSub.length > 20, 'launchSub explicitly provided');

// 8. Every answer set maps to exactly one aha key from the library;
//    all five mapped keys reachable across the full signal walk.
const ahaKeys = new Set();
for (const [name, base] of [['A', baseA], ['B', baseB]]) {
  for (const sh of shapeV) for (const ins of insideV) for (const fe of feltV) for (const ag of againV) {
    const a = { ...base, shape: sh, inside: ins, felt: fe, again: ag };
    const k = QZ.matchAha(a, QZ.resolve(a));
    ok(!!window.MYSTICDO_AHA[k], `matchAha returns a library key for base ${name} ${sh}/${ins}/${fe}/${ag} → ${k}`);
    ahaKeys.add(k);
  }
}
console.log(`  aha sweep produced ${ahaKeys.size} distinct aha keys`);
ok(ahaKeys.size === 5, 'all five mapped aha keys reachable — got ' + [...ahaKeys].join(','));

console.log(`scripting-manifestation quiz: ${checks} checks -> ${failures === 0 ? 'ALL GREEN' : failures + ' FAILURES'}`);
process.exit(failures === 0 ? 0 : 1);
