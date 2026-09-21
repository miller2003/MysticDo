/* Logic test for the is-he-cheating quiz.
 * Exhaustive signal-combo walk + intent sweep + underneath scenarios
 * + render sweep, modeled on test-love-quiz.mjs.
 * Run: node scripts/test-is-he-cheating-quiz.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src = readFileSync(path.join(root, 'assets/js/quizzes.js'), 'utf8');

globalThis.window = {};
eval(src);

const QZ = window.MYSTICDO_QUIZZES['is-he-cheating'];
if (!QZ) throw new Error('is-he-cheating quiz not registered');

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
const open = optValues('openness');
const rout = optValues('routine');
const temp = optValues('temperature');
const dev  = optValues('device');
const seenPattern = new Set();
let comboCount = 0;
const base = { status: 'together', trigger: 'changed', want: 'verify', help: 'interpret' };
for (const o of open) for (const r of rout) for (const t of temp) for (const d of dev) {
  const a = { ...base, openness: o, routine: r, temperature: t, device: d };
  const k = QZ.resolve(a);
  ok(RESULT_KEYS.includes(k), `resolve valid pattern for combo ${o}/${r}/${t}/${d} → ${k}`);
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

// 4. underneath scenarios.
const scenarios = [
  { name: 'stayleave → decision', a: { status:'together', trigger:'gradual', openness:'vague', routine:'gaps', temperature:'distant', device:'private', want:'stayleave', help:'guidance' }, expect: 'decision' },
  { name: 'trust → repair', a: { status:'married', trigger:'found', openness:'hides', routine:'repeated', temperature:'oversweet', device:'locked', want:'trust', help:'dynamic' }, expect: 'repair' },
  { name: 'paranoid → selftrust', a: { status:'together', trigger:'intuition', openness:'consistent', routine:'steady', temperature:'warm', device:'unchanged', want:'paranoid', help:'interpret' }, expect: 'selftrust' },
  { name: 'history → pattern-question', a: { status:'together', trigger:'history', openness:'guarded', routine:'thinner', temperature:'warmrough', device:'attached', want:'verify', help:'insight' }, expect: 'pattern-question' },
  { name: 'intuition + certainly → verification', a: { status:'longdistance', trigger:'intuition', openness:'consistent', routine:'steady', temperature:'warm', device:'relaxed', want:'certainly', help:'unsure' }, expect: 'verification' },
  { name: 'no underneath (clean case)', a: { status:'dating', trigger:'gradual', openness:'vague', routine:'gaps', temperature:'distant', device:'private', want:'verify', help:'interpret' }, expect: null }
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
for (const w of wants) for (const h of helps) for (const t of temp) {
  const a = { status:'together', trigger:'found', openness:'vague', routine:'gaps', temperature:t, device:'private', want:w, help:h };
  try {
    const html = renderOnce(a);
    ok(html.includes('love-result') && html.includes('What your answers suggest') && html.includes('What to look at next') && html.includes('Your best-fit next step') && html.includes('btn-gold'), `render blocks for want=${w}/help=${h}/temp=${t}`);
  } catch (e) {
    renderCrashes++; failures++;
    console.error('  RENDER CRASH for', { w, h, t }, '\n', e.stack);
  }
}
ok(renderCrashes === 0, 'customResult never throws across the sweep');

// 6. Honesty guards: no verdict language, no email capture in results.
const sample = renderOnce({ status:'married', trigger:'found', openness:'hides', routine:'repeated', temperature:'oversweet', device:'locked', want:'verify', help:'insight' });
ok(!/love-email-kicker/.test(sample) && !/email-form/.test(sample), 'no email capture in result (user decision 2026-09-20)');
ok(sample.includes('love-aha') || sample.includes('love-offers') || sample.includes('What your answers suggest'), 'v2 layers render');
ok(QZ.launchSub && QZ.launchSub.length > 20, 'launchSub explicitly provided');

console.log(`is-he-cheating quiz: ${checks} checks -> ${failures === 0 ? 'ALL GREEN' : failures + ' FAILURES'}`);
process.exit(failures === 0 ? 0 : 1);
