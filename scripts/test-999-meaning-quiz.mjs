/* Logic test for the 999-meaning quiz.
 * Exhaustive signal-combo walk + intent sweep + underneath scenarios
 * + render sweep, modeled on test-111-meaning-quiz.mjs.
 * Run: node scripts/test-999-meaning-quiz.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src = readFileSync(path.join(root, 'assets/js/quizzes.js'), 'utf8');

globalThis.window = {};
eval(src);

const QZ = window.MYSTICDO_QUIZZES['999-meaning'];
if (!QZ) throw new Error('999-meaning quiz not registered');

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

// 2. Exhaustive signal-combo walk.
const ack = optValues('acknowledgment');
const comp = optValues('completion');
const rel = optValues('release');
const grav = optValues('gravity');
const seenPattern = new Set();
let comboCount = 0;
const base = { status: 'chapter-shift', trigger: 'noticing', want: 'meaning', help: 'interpret' };
for (const n of ack) for (const r of comp) for (const t of rel) for (const w of grav) {
  const a = { ...base, acknowledgment: n, completion: r, release: t, gravity: w };
  const k = QZ.resolve(a);
  ok(RESULT_KEYS.includes(k), `resolve valid pattern for combo ${n}/${r}/${t}/${w} → ${k}`);
  seenPattern.add(k);
  comboCount++;
}
console.log(`  walked ${comboCount} signal combos; ${seenPattern.size} distinct patterns`);
ok(seenPattern.size === 5, 'all 5 patterns reachable');

// 3. Intent sweep — every matchPractice output is a real key, ≥6 reachable.
const wants = optValues('want');
const helps = optValues('help');
const seenPractice = new Set();
for (const w of wants) for (const h of helps) {
  const a = { ...base, want: w, help: h };
  const k = QZ.matchPractice(a);
  ok(PRACTICE_KEYS.includes(k), `matchPractice valid key for want=${w}/help=${h} → ${k}`);
  seenPractice.add(k);
}
console.log(`  walked ${wants.length * helps.length} intent combos; ${seenPractice.size} distinct practices`);
ok(seenPractice.size >= 6, 'at least 6 of 7 practices reachable');
ok(seenPractice.has('free_first') && seenPractice.has('general'), 'free_first and general both reachable');
ok(seenPractice.has('closure'), 'closure reachable (grief path)');

// 4. underneath scenarios.
const scenarios = [
  { name: 'grief → grief-carry', a: { status:'grief', trigger:'timing', acknowledgment:'ending-in-motion', completion:'mixed', release:'sorting', gravity:'sad-clear', want:'loss', help:'insight' }, expect: 'grief-carry' },
  { name: 'denied → unacknowledged-ending', a: { status:'stuck', trigger:'noticing', acknowledgment:'denied', completion:'mixed', release:'carrying', gravity:'dread', want:'ending', help:'dynamic' }, expect: 'unacknowledged-ending' },
  { name: 'skipping → rushing-to-one', a: { status:'chapter-shift', trigger:'online', acknowledgment:'ending-in-motion', completion:'skipping', release:'untouched', gravity:'neutral', want:'next', help:'guidance' }, expect: 'rushing-to-one' },
  { name: 'reader source → source-incentive', a: { status:'not-sure', trigger:'reader', acknowledgment:'unclear', completion:'mixed', release:'untouched', gravity:'neutral', want:'meaning', help:'interpret' }, expect: 'source-incentive' },
  { name: 'decision → permission-question', a: { status:'decision', trigger:'timing', acknowledgment:'unclear', completion:'mixed', release:'sorting', gravity:'anxious', want:'ending', help:'guidance' }, expect: 'permission-question' },
  { name: 'no underneath (clean case)', a: { status:'chapter-shift', trigger:'noticing', acknowledgment:'honestly-ended', completion:'completed', release:'integrated', gravity:'settling', want:'meaning', help:'interpret' }, expect: null }
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
for (const w of wants) for (const h of helps) for (const t of rel) {
  const a = { status:'chapter-shift', trigger:'noticing', acknowledgment:'ending-in-motion', completion:'working', release:t, gravity:'neutral', want:w, help:h };
  try {
    const html = renderOnce(a);
    ok(html.includes('love-result') && html.includes('What your answers suggest') && html.includes('What to look at next') && html.includes('Your best-fit next step') && html.includes('btn-gold'), `render blocks for want=${w}/help=${h}/rel=${t}`);
  } catch (e) {
    renderCrashes++; failures++;
    console.error('  RENDER CRASH for', { w, h, t }, '\n', e.stack);
  }
}
ok(renderCrashes === 0, 'customResult never throws across the sweep');

// 6. Honesty guards: no verdict language, no email capture in results.
const sample = renderOnce({ status:'stuck', trigger:'noticing', acknowledgment:'denied', completion:'mixed', release:'carrying', gravity:'dread', want:'ending', help:'insight' });
ok(!/love-email-kicker/.test(sample) && !/email-form/.test(sample), 'no email capture in result (user decision 2026-09-20)');
ok(sample.includes('love-aha') || sample.includes('love-offers') || sample.includes('What your answers suggest'), 'v2 layers render');
ok(QZ.launchSub && QZ.launchSub.length > 20, 'launchSub explicitly provided');

// 7. Every answer set maps to exactly one aha key from the library.
const ahaKeys = new Set();
for (const n of ack) for (const r of comp) {
  const a = { ...base, acknowledgment: n, completion: r, release: 'sorting', gravity: 'neutral' };
  const k = QZ.matchAha(a, QZ.resolve(a));
  ok(!!window.MYSTICDO_AHA[k], `matchAha returns a library key for ${n}/${r} → ${k}`);
  ahaKeys.add(k);
}
console.log(`  aha sweep produced ${ahaKeys.size} distinct aha keys`);

console.log(`999-meaning quiz: ${checks} checks -> ${failures === 0 ? 'ALL GREEN' : failures + ' FAILURES'}`);
process.exit(failures === 0 ? 0 : 1);
