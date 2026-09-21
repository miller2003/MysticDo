/* Logic test for the twin-flame-separation quiz.
 * Modeled on test-is-he-cheating-quiz.mjs.
 * Run: node scripts/test-twin-flame-separation-quiz.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src = readFileSync(path.join(root, 'assets/js/quizzes.js'), 'utf8');

globalThis.window = {};
eval(src);

const QZ = window.MYSTICDO_QUIZZES['twin-flame-separation'];
if (!QZ) throw new Error('twin-flame-separation quiz not registered');

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

const fe = optValues('framework_effect');
const ck = optValues('checking');
const rc = optValues('reciprocity');
const co = optValues('course');
const seenPattern = new Set();
let comboCount = 0;
const base = { status: 'separated', trigger: 'separation', want: 'meaning', help: 'interpret' };
for (const f of fe) for (const c of ck) for (const r of rc) for (const o of co) {
  const a = { ...base, framework_effect: f, checking: c, reciprocity: r, course: o };
  const k = QZ.resolve(a);
  ok(RESULT_KEYS.includes(k), `resolve valid pattern for combo ${f}/${c}/${r}/${o} → ${k}`);
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
  { name: 'moveon → decision', a: { status:'separated', trigger:'runner', framework_effect:'trapped', checking:'constant', reciprocity:'runner-chaser', course:'cycling', want:'moveon', help:'guidance' }, expect: 'decision' },
  { name: 'return → return-waiting', a: { status:'separated', trigger:'separation', framework_effect:'waiting', checking:'frequent', reciprocity:'one-sided', course:'flat', want:'return', help:'insight' }, expect: 'return-waiting' },
  { name: 'label → label-question', a: { status:'uncertain', trigger:'framework', framework_effect:'mostly', checking:'some', reciprocity:'mostly-mutual', course:'ebbing', want:'label', help:'interpret' }, expect: 'label-question' },
  { name: 'pain + runner-chaser → pattern-question', a: { status:'separated', trigger:'pain', framework_effect:'mixed', checking:'daily', reciprocity:'runner-chaser', course:'cycling', want:'pain', help:'dynamic' }, expect: 'pattern-question' },
  { name: 'meaning + meaning-making → meaning-trap', a: { status:'separated', trigger:'framework', framework_effect:'helping', checking:'daily', reciprocity:'mutual', course:'processing', want:'meaning', help:'deeper' }, expect: 'meaning-trap' },
  { name: 'no underneath (clean)', a: { status:'nogo', trigger:'gradual', framework_effect:'mixed', checking:'daily', reciprocity:'unclear', course:'flat', want:'beneath', help:'unsure' }, expect: null }
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
  const a = { status:'separated', trigger:'separation', framework_effect:'mixed', checking:'daily', reciprocity:'unclear', course:o, want:w, help:h };
  try {
    const html = renderOnce(a);
    ok(html.includes('love-result') && html.includes('What your answers suggest') && html.includes('What to look at next') && html.includes('Your best-fit next step') && html.includes('btn-gold'), `render blocks for want=${w}/help=${h}/course=${o}`);
  } catch (e) {
    renderCrashes++; failures++;
    console.error('  RENDER CRASH for', { w, h, o }, '\n', e.stack);
  }
}
ok(renderCrashes === 0, 'customResult never throws across the sweep');

const sample = renderOnce({ status:'separated', trigger:'runner', framework_effect:'trapped', checking:'constant', reciprocity:'runner-chaser', course:'cycling', want:'moveon', help:'guidance' });
ok(!/love-email-kicker/.test(sample) && !/email-form/.test(sample), 'no email capture in result');
ok(QZ.launchSub && QZ.launchSub.length > 20, 'launchSub explicitly provided');

console.log(`twin-flame-separation quiz: ${checks} checks -> ${failures === 0 ? 'ALL GREEN' : failures + ' FAILURES'}`);
process.exit(failures === 0 ? 0 : 1);
