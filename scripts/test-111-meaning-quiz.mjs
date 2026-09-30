/* Logic test for the 111-meaning quiz.
 * Exhaustive signal-combo walk + intent sweep + underneath scenarios
 * + render sweep, modeled on test-is-he-cheating-quiz.mjs.
 * Run: node scripts/test-111-meaning-quiz.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src = readFileSync(path.join(root, 'assets/js/quizzes.js'), 'utf8');

globalThis.window = {};
eval(src);

const QZ = window.MYSTICDO_QUIZZES['111-meaning'];
if (!QZ) throw new Error('111-meaning quiz not registered');

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
const noti = optValues('noticing');
const resp = optValues('response');
const attr = optValues('attribution');
const wait = optValues('waiting');
const seenPattern = new Set();
let comboCount = 0;
const base = { status: 'transition', trigger: 'noticing', want: 'meaning', help: 'interpret' };
const decisionBase = { status: 'decision', trigger: 'decision-moment', want: 'decision-sign', help: 'guidance' };
for (const b of [base, decisionBase]) {
  for (const n of noti) for (const r of resp) for (const t of attr) for (const w of wait) {
    const a = { ...b, noticing: n, response: r, attribution: t, waiting: w };
    const k = QZ.resolve(a);
    ok(RESULT_KEYS.includes(k), `resolve valid pattern for combo ${n}/${r}/${t}/${w} → ${k}`);
    seenPattern.add(k);
    comboCount++;
  }
}
console.log(`  walked ${comboCount} signal combos; ${seenPattern.size} distinct patterns`);
ok(seenPattern.size === 5, 'all 5 patterns reachable');

// decision-surfacing requires the decision context override.
const ds = QZ.resolve({ ...base, status: 'decision', noticing: 'decisions', response: 'pause', attribution: 'priming', waiting: 'act' });
ok(ds === 'decision-surfacing', 'decision context + high signals → decision-surfacing (got ' + ds + ')');

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

// 4. underneath scenarios.
const scenarios = [
  { name: 'loss → grief-meaning', a: { status:'loss', trigger:'noticing', noticing:'emotional', response:'charge', attribution:'undecided', waiting:'neither', want:'meaning', help:'interpret' }, expect: 'grief-meaning' },
  { name: 'relief loop → anxiety-loop', a: { status:'stable', trigger:'online', noticing:'anxious', response:'relief', attribution:'sign', waiting:'expecting', want:'frequency', help:'interpret' }, expect: 'anxiety-loop' },
  { name: 'months of waiting → waiting-question', a: { status:'transition', trigger:'felt-sense', noticing:'emotional', response:'charge', attribution:'message', waiting:'months', want:'coming', help:'insight' }, expect: 'waiting-question' },
  { name: 'reader source → source-incentive', a: { status:'stable', trigger:'reader', noticing:'random', response:'note', attribution:'undecided', waiting:'neither', want:'meaning', help:'dynamic' }, expect: 'source-incentive' },
  { name: 'person want → connection-question', a: { status:'activation', trigger:'noticing', noticing:'emotional', response:'pause', attribution:'mixed', waiting:'reflect', want:'person', help:'insight' }, expect: 'connection-question' },
  { name: 'no underneath (clean case)', a: { status:'stable', trigger:'noticing', noticing:'decisions', response:'pause', attribution:'priming', waiting:'act', want:'frequency', help:'interpret' }, expect: null }
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
for (const w of wants) for (const h of helps) for (const t of attr) {
  const a = { status:'transition', trigger:'noticing', noticing:'decisions', response:'pause', attribution:t, waiting:'reflect', want:w, help:h };
  try {
    const html = renderOnce(a);
    ok(html.includes('love-result') && html.includes('What your answers suggest') && html.includes('What to look at next') && html.includes('Your best-fit next step') && html.includes('btn-gold'), `render blocks for want=${w}/help=${h}/attr=${t}`);
  } catch (e) {
    renderCrashes++; failures++;
    console.error('  RENDER CRASH for', { w, h, t }, '\n', e.stack);
  }
}
ok(renderCrashes === 0, 'customResult never throws across the sweep');

// 6. Honesty guards: no verdict language, no email capture in results.
const sample = renderOnce({ status:'stable', trigger:'online', noticing:'anxious', response:'relief', attribution:'sign', waiting:'expecting', want:'coming', help:'insight' });
ok(!/love-email-kicker/.test(sample) && !/email-form/.test(sample), 'no email capture in result (user decision 2026-09-20)');
ok(sample.includes('love-aha') || sample.includes('love-offers') || sample.includes('What your answers suggest'), 'v2 layers render');
ok(QZ.launchSub && QZ.launchSub.length > 20, 'launchSub explicitly provided');

// 7. Every answer set maps to exactly one aha key from the library.
const ahaKeys = new Set();
for (const n of noti) for (const r of resp) {
  const a = { ...base, noticing: n, response: r, attribution: 'undecided', waiting: 'neither' };
  const k = QZ.matchAha(a, QZ.resolve(a));
  ok(!!window.MYSTICDO_AHA[k], `matchAha returns a library key for ${n}/${r} → ${k}`);
  ahaKeys.add(k);
}
console.log(`  aha sweep produced ${ahaKeys.size} distinct aha keys`);

console.log(`111-meaning quiz: ${checks} checks -> ${failures === 0 ? 'ALL GREEN' : failures + ' FAILURES'}`);
process.exit(failures === 0 ? 0 : 1);
