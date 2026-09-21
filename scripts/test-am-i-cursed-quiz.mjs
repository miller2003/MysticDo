/* Logic test for the am-i-cursed quiz.
 * Modeled on test-is-he-cheating-quiz.mjs.
 * Run: node scripts/test-am-i-cursed-quiz.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src = readFileSync(path.join(root, 'assets/js/quizzes.js'), 'utf8');

globalThis.window = {};
eval(src);

const QZ = window.MYSTICDO_QUIZZES['am-i-cursed'];
if (!QZ) throw new Error('am-i-cursed quiz not registered');

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

const ss = optValues('streak_shape');
const ct = optValues('control');
const cs = optValues('claim_source');
const co = optValues('course');
const seenPattern = new Set();
let comboCount = 0;
const base = { status: 'streak', trigger: 'streak', want: 'why', help: 'interpret' };
for (const s of ss) for (const c of ct) for (const u of cs) for (const o of co) {
  const a = { ...base, streak_shape: s, control: c, claim_source: u, course: o };
  const k = QZ.resolve(a);
  ok(RESULT_KEYS.includes(k), `resolve valid pattern for combo ${s}/${c}/${u}/${o} → ${k}`);
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
  { name: 'remove → intervention-question', a: { status:'streak', trigger:'streak', streak_shape:'focused', control:'manageable', claim_source:'own-observation', course:'flat', want:'remove', help:'interpret' }, expect: 'intervention-question' },
  { name: 'a-reader → source-incentive', a: { status:'reader-told', trigger:'reader', streak_shape:'widespread', control:'overwhelmed', claim_source:'a-reader', course:'worsening', want:'who', help:'insight' }, expect: 'source-incentive' },
  { name: 'overwhelmed → control-loss-pattern', a: { status:'chaos', trigger:'nothing', streak_shape:'everything', control:'out-of-control', claim_source:'intuition', course:'cycling', want:'why', help:'dynamic' }, expect: 'control-loss-pattern' },
  { name: 'who → agent-attribution', a: { status:'streak', trigger:'breakage', streak_shape:'scattered', control:'mostly', claim_source:'a-friend', course:'ebbing', want:'who', help:'insight' }, expect: 'agent-attribution' },
  { name: 'loss + why → grief-closure', a: { status:'loss', trigger:'dreams', streak_shape:'scattered', control:'mostly', claim_source:'intuition', course:'ebbing', want:'why', help:'deeper' }, expect: 'grief-closure' },
  { name: 'no underneath (clean)', a: { status:'health', trigger:'health', streak_shape:'focused', control:'manageable', claim_source:'own-observation', course:'resolving', want:'what-do', help:'guidance' }, expect: null }
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
  const a = { status:'streak', trigger:'streak', streak_shape:'scattered', control:'slipping', claim_source:'intuition', course:o, want:w, help:h };
  try {
    const html = renderOnce(a);
    ok(html.includes('love-result') && html.includes('What your answers suggest') && html.includes('What to look at next') && html.includes('Your best-fit next step') && html.includes('btn-gold'), `render blocks for want=${w}/help=${h}/course=${o}`);
  } catch (e) {
    renderCrashes++; failures++;
    console.error('  RENDER CRASH for', { w, h, o }, '\n', e.stack);
  }
}
ok(renderCrashes === 0, 'customResult never throws across the sweep');

const sample = renderOnce({ status:'reader-told', trigger:'reader', streak_shape:'widespread', control:'overwhelmed', claim_source:'a-reader', course:'worsening', want:'remove', help:'interpret' });
ok(!/love-email-kicker/.test(sample) && !/email-form/.test(sample), 'no email capture in result');
ok(QZ.launchSub && QZ.launchSub.length > 20, 'launchSub explicitly provided');

console.log(`am-i-cursed quiz: ${checks} checks -> ${failures === 0 ? 'ALL GREEN' : failures + ' FAILURES'}`);
process.exit(failures === 0 ? 0 : 1);
