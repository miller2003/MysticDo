/* Logic test for the will-he-come-back quiz.
 * Modeled on test-is-he-cheating-quiz.mjs.
 * Run: node scripts/test-will-he-come-back-quiz.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src = readFileSync(path.join(root, 'assets/js/quizzes.js'), 'utf8');

globalThis.window = {};
eval(src);

const QZ = window.MYSTICDO_QUIZZES['will-he-come-back'];
if (!QZ) throw new Error('will-he-come-back quiz not registered');

let failures = 0;
let checks = 0;
function ok(cond, msg) {
  checks++;
  if (!cond) { failures++; console.error('  FAIL:', msg); }
}

const optValues = qid => QZ.questions.find(q => q.id === qid).options.map(o => o.score);

const RESULT_KEYS = Object.keys(QZ.results);
ok(RESULT_KEYS.length === 5, 'exactly 5 pattern results — got ' + RESULT_KEYS.length);
const PRACTICE_KEYS = Object.keys(QZ.practice);
ok(PRACTICE_KEYS.length === 7, 'exactly 7 practice outcomes — got ' + PRACTICE_KEYS.length);

const es = optValues('ending_shape');
const rh = optValues('reciprocity_history');
const ck = optValues('checking');
const co = optValues('course');
const seenPattern = new Set();
let comboCount = 0;
const base = { status: 'brokenup', trigger: 'nothing', want: 'predict', help: 'interpret' };
for (const e of es) for (const r of rh) for (const c of ck) for (const o of co) {
  const a = { ...base, ending_shape: e, reciprocity_history: r, checking: c, course: o };
  const k = QZ.resolve(a);
  ok(RESULT_KEYS.includes(k), `resolve valid pattern for combo ${e}/${r}/${c}/${o} → ${k}`);
  seenPattern.add(k);
  comboCount++;
}
console.log(`  walked ${comboCount} signal combos; ${seenPattern.size} distinct patterns`);
ok(seenPattern.size === 5, 'all 5 patterns reachable');

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

const scenarios = [
  { name: 'moveon → decision', a: { status:'brokenup', trigger:'nothing', ending_shape:'ambiguous', reciprocity_history:'never', checking:'constant', course:'cycling', want:'moveon', help:'guidance' }, expect: 'decision' },
  { name: 'bringback → control', a: { status:'brokenup', trigger:'silence', ending_shape:'pulled', reciprocity_history:'first', checking:'frequent', course:'worse', want:'bringback', help:'insight' }, expect: 'control' },
  { name: 'closure → closure-ending', a: { status:'he-ended', trigger:'he-ended', ending_shape:'one-sided', reciprocity_history:'never', checking:'rare', course:'ebbing', want:'closure', help:'dynamic' }, expect: 'closure-ending' },
  { name: 'feel + holding → reassurance-loop', a: { status:'brokenup', trigger:'feel', ending_shape:'ambiguous', reciprocity_history:'never', checking:'constant', course:'cycling', want:'cantstop', help:'insight' }, expect: 'reassurance-loop' },
  { name: 'history-return → historical-pattern', a: { status:'onoff', trigger:'history', ending_shape:'cycle', reciprocity_history:'always', checking:'daily', course:'flat', want:'predict', help:'insight' }, expect: 'historical-pattern' },
  { name: 'no underneath (clean)', a: { status:'i-ended', trigger:'nothing', ending_shape:'i-ended', reciprocity_history:'first', checking:'some', course:'processing', want:'beneath', help:'unsure' }, expect: null }
];
for (const sc of scenarios) {
  const u = QZ.underneath(sc.a, QZ.resolve(sc.a));
  ok((u ? u.key : null) === sc.expect, `${sc.name} → ${sc.expect} (got ${u ? u.key : null})`);
}

function renderOnce(a) {
  let html = '';
  const stubBody = { innerHTML: '', querySelector: () => null };
  const ctx = { answers: a, body: stubBody, emailFormHTML: () => '', bindEmailForms: () => {}, restart: () => {} };
  Object.defineProperty(stubBody, 'innerHTML', { get: () => html, set: v => { html = v; }, configurable: true });
  QZ.customResult(ctx);
  return html;
}
let renderCrashes = 0;
for (const w of wants) for (const h of helps) for (const o of co) {
  const a = { status:'brokenup', trigger:'nothing', ending_shape:'ambiguous', reciprocity_history:'never', checking:'daily', course:o, want:w, help:h };
  try {
    const html = renderOnce(a);
    ok(html.includes('love-result') && html.includes('What your answers suggest') && html.includes('What to look at next') && html.includes('Your best-fit next step') && html.includes('btn-gold'), `render blocks for want=${w}/help=${h}/course=${o}`);
  } catch (e) {
    renderCrashes++; failures++;
    console.error('  RENDER CRASH for', { w, h, o }, '\n', e.stack);
  }
}
ok(renderCrashes === 0, 'customResult never throws across the sweep');

const sample = renderOnce({ status:'brokenup', trigger:'feel', ending_shape:'ambiguous', reciprocity_history:'never', checking:'constant', course:'cycling', want:'cantstop', help:'insight' });
ok(!/love-email-kicker/.test(sample) && !/email-form/.test(sample), 'no email capture in result');
ok(QZ.launchSub && QZ.launchSub.length > 20, 'launchSub explicitly provided');

console.log(`will-he-come-back quiz: ${checks} checks -> ${failures === 0 ? 'ALL GREEN' : failures + ' FAILURES'}`);
process.exit(failures === 0 ? 0 : 1);
