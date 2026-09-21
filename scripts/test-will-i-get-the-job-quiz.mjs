/* Logic test for the will-i-get-the-job quiz.
 * Modeled on test-is-he-cheating-quiz.mjs.
 * Run: node scripts/test-will-i-get-the-job-quiz.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src = readFileSync(path.join(root, 'assets/js/quizzes.js'), 'utf8');

globalThis.window = {};
eval(src);

const QZ = window.MYSTICDO_QUIZZES['will-i-get-the-job'];
if (!QZ) throw new Error('will-i-get-the-job quiz not registered');

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

const ww = optValues('waiting_weight');
const tl = optValues('timeline');
const fr = optValues('fit_read');
const st = optValues('stakes');
const seenPattern = new Set();
let comboCount = 0;
const base = { status: 'applied', trigger: 'applied', want: 'predict', help: 'interpret' };
for (const w of ww) for (const t of tl) for (const f of fr) for (const s of st) {
  const a = { ...base, waiting_weight: w, timeline: t, fit_read: f, stakes: s };
  const k = QZ.resolve(a);
  ok(RESULT_KEYS.includes(k), `resolve valid pattern for combo ${w}/${t}/${f}/${s} → ${k}`);
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
  { name: 'moveon → decision', a: { status:'applied', trigger:'silence', waiting_weight:'consuming', timeline:'too-slow', fit_read:'unclear', stakes:'all-on-this', want:'moveon', help:'guidance' }, expect: 'decision' },
  { name: 'how-long → timeline-question', a: { status:'interview', trigger:'interview', waiting_weight:'steady', timeline:'too-slow', fit_read:'mostly-clear', stakes:'important-but-one-of', want:'how-long', help:'interpret' }, expect: 'timeline-question' },
  { name: 'what-if → stakes-bias', a: { status:'applied', trigger:'nothing', waiting_weight:'unbearable', timeline:'lost-track', fit_read:'unclear', stakes:'banking-heavily', want:'what-if', help:'insight' }, expect: 'stakes-bias' },
  { name: 'fit → fit-question', a: { status:'final', trigger:'references', waiting_weight:'steady', timeline:'roughly-right', fit_read:'mixed', stakes:'one-of-several', want:'fit', help:'dynamic' }, expect: 'fit-question' },
  { name: 'silence + timeline-distortion → silence-pattern', a: { status:'applied', trigger:'silence', waiting_weight:'straining', timeline:'too-slow', fit_read:'mostly-clear', stakes:'this-or-bust-somewhat', want:'predict', help:'insight' }, expect: 'silence-pattern' },
  { name: 'no underneath (clean)', a: { status:'searching', trigger:'referral', waiting_weight:'manageable', timeline:'realistic', fit_read:'clear-fit', stakes:'one-of-several', want:'beneath', help:'unsure' }, expect: null }
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
for (const w of wants) for (const h of helps) for (const s of st) {
  const a = { status:'applied', trigger:'applied', waiting_weight:'steady', timeline:'roughly-right', fit_read:'mostly-clear', stakes:s, want:w, help:h };
  try {
    const html = renderOnce(a);
    ok(html.includes('love-result') && html.includes('What your answers suggest') && html.includes('What to look at next') && html.includes('Your best-fit next step') && html.includes('btn-gold'), `render blocks for want=${w}/help=${h}/stakes=${s}`);
  } catch (e) {
    renderCrashes++; failures++;
    console.error('  RENDER CRASH for', { w, h, s }, '\n', e.stack);
  }
}
ok(renderCrashes === 0, 'customResult never throws across the sweep');

const sample = renderOnce({ status:'applied', trigger:'silence', waiting_weight:'unbearable', timeline:'lost-track', fit_read:'unclear', stakes:'all-on-this', want:'what-if', help:'insight' });
ok(!/love-email-kicker/.test(sample) && !/email-form/.test(sample), 'no email capture in result');
ok(QZ.launchSub && QZ.launchSub.length > 20, 'launchSub explicitly provided');

console.log(`will-i-get-the-job quiz: ${checks} checks -> ${failures === 0 ? 'ALL GREEN' : failures + ' FAILURES'}`);
process.exit(failures === 0 ? 0 : 1);
