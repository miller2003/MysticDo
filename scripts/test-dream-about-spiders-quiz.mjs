/* Logic test for the dream-about-spiders quiz.
 * Exhaustive signal-combo walk + intent sweep + underneath scenarios
 * + render sweep + aha library check, modeled on test-dream-about-water-quiz.mjs.
 * Run: node scripts/test-dream-about-spiders-quiz.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src = readFileSync(path.join(root, 'assets/js/quizzes.js'), 'utf8');

globalThis.window = {};
eval(src);

const QZ = window.MYSTICDO_QUIZZES['dream-about-spiders'];
if (!QZ) throw new Error('dream-about-spiders quiz not registered');

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

// 2. Exhaustive signal-combo walk (charge x dimension x waking x response).
const chg = optValues('charge');
const dim = optValues('dimension');
const wak = optValues('waking');
const rsp = optValues('response');
const seenPattern = new Set();
let comboCount = 0;
const base = { behavior: 'building-web', trigger: 'curiosity', want: 'meaning', help: 'interpret' };
for (const n of chg) for (const r of dim) for (const t of wak) for (const w of rsp) {
  const a = { ...base, charge: n, dimension: r, waking: t, response: w };
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

// 4. underneath scenarios — one per page current, in page order, plus omen/beneath/null.
const scenarios = [
  { name: 'waking phobia → fear-primary', a: { behavior: 'chasing', trigger: 'phobia', charge: 'panic', dimension: 'threat', waking: 'phobia', response: 'fled', want: 'meaning', help: 'interpret' }, expect: 'fear-primary' },
  { name: 'chase + gaining → the-pursuer', a: { behavior: 'chasing', trigger: 'unsettled', charge: 'dread', dimension: 'threat', waking: 'gaining', response: 'fled', want: 'facing', help: 'guidance' }, expect: 'the-pursuer' },
  { name: 'caught + trapped → the-web', a: { behavior: 'caught', trigger: 'unsettled', charge: 'unsettled', dimension: 'entrapment', waking: 'trapped', response: 'froze', want: 'binding', help: 'deeper' }, expect: 'the-web' },
  { name: 'killed it (clean read) → the-suppression', a: { behavior: 'killed-it', trigger: 'vivid', charge: 'unsettled', dimension: 'not-sure', waking: 'none', response: 'fought', want: 'meaning', help: 'interpret' }, expect: 'the-suppression' },
  { name: 'weaver (clean read) → the-weaving', a: { behavior: 'building-web', trigger: 'vivid', charge: 'awe', dimension: 'creation', waking: 'building', response: 'watched', want: 'woven', help: 'insight' }, expect: 'the-weaving' },
  { name: 'omen trigger + thin evidence → omen-question', a: { behavior: 'not-sure', trigger: 'omen', charge: 'unsettled', dimension: 'not-sure', waking: 'notell', response: 'room', want: 'meaning', help: 'interpret' }, expect: 'omen-question' },
  { name: 'want beneath → meaning-question', a: { behavior: 'not-sure', trigger: 'unsettled', charge: 'unsettled', dimension: 'not-sure', waking: 'notell', response: 'room', want: 'beneath', help: 'unsure' }, expect: 'meaning-question' },
  { name: 'no underneath (clean case)', a: { behavior: 'not-sure', trigger: 'curiosity', charge: 'unsettled', dimension: 'not-sure', waking: 'notell', response: 'room', want: 'meaning', help: 'interpret' }, expect: null }
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
for (const w of wants) for (const h of helps) for (const t of chg) {
  const a = { behavior: 'building-web', trigger: 'curiosity', charge: t, dimension: 'creation', waking: 'none', want: w, help: h };
  try {
    const html = renderOnce(a);
    ok(html.includes('love-result') && html.includes('What your answers suggest') && html.includes('What to look at next') && html.includes('Your best-fit next step') && html.includes('btn-gold'), `render blocks for want=${w}/help=${h}/charge=${t}`);
  } catch (e) {
    renderCrashes++; failures++;
    console.error('  RENDER CRASH for', { w, h, t }, '\n', e.stack);
  }
}
ok(renderCrashes === 0, 'customResult never throws across the sweep');

// 6. Honesty guards: no verdict language, no email capture in results.
const sample = renderOnce({ behavior: 'chasing', trigger: 'phobia', charge: 'panic', dimension: 'threat', waking: 'phobia', response: 'fled', want: 'meaning', help: 'interpret' });
ok(!/love-email-kicker/.test(sample) && !/email-form/.test(sample), 'no email capture in result (user decision 2026-09-20)');
ok(sample.includes('love-aha') || sample.includes('love-offers') || sample.includes('What your answers suggest'), 'v2 layers render');
ok(QZ.launchSub && QZ.launchSub.length > 20, 'launchSub explicitly provided');

// 7. Every answer set maps to exactly one aha key from the library.
const ahaKeys = new Set();
for (const n of chg) for (const r of wak) {
  const a = { ...base, charge: n, waking: r, dimension: 'not-sure', response: 'room' };
  const k = QZ.matchAha(a, QZ.resolve(a));
  ok(!!window.MYSTICDO_AHA[k], `matchAha returns a library key for ${n}/${r} → ${k}`);
  ahaKeys.add(k);
}
console.log(`  aha sweep produced ${ahaKeys.size} distinct aha keys`);

console.log(`dream-about-spiders quiz: ${checks} checks -> ${failures === 0 ? 'ALL GREEN' : failures + ' FAILURES'}`);
process.exit(failures === 0 ? 0 : 1);
