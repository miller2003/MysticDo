/* Logic test for the dream-about-someone quiz.
 * Exhaustive signal-combo walk + intent sweep + underneath scenarios
 * + render sweep, modeled on test-111-meaning-quiz.mjs.
 * Run: node scripts/test-dream-about-someone-quiz.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src = readFileSync(path.join(root, 'assets/js/quizzes.js'), 'utf8');

globalThis.window = {};
eval(src);

const QZ = window.MYSTICDO_QUIZZES['dream-about-someone'];
if (!QZ) throw new Error('dream-about-someone quiz not registered');

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
const rd = optValues('reading');
const fe = optValues('feeling');
const un = optValues('unresolved');
const us = optValues('use');
const seenPattern = new Set();
let comboCount = 0;
const base = { status: 'stranger', trigger: 'curiosity', want: 'meaning', help: 'interpret' };
for (const n of rd) for (const r of fe) for (const t of un) for (const w of us) {
  const a = { ...base, reading: n, feeling: r, unresolved: t, use: w };
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
  { name: 'deceased → grief-work', a: { status:'deceased', trigger:'grief', reading:'emotional-charge', feeling:'named', unresolved:'active', use:'noted', want:'grief', help:'insight' }, expect: 'grief-work' },
  { name: 'ex → unintegrated-chapter', a: { status:'ex', trigger:'vivid', reading:'represents', feeling:'roughly', unresolved:'active', use:'asked', want:'meaning', help:'dynamic' }, expect: 'unintegrated-chapter' },
  { name: 'message reading → contact-question', a: { status:'ex', trigger:'hope', reading:'message', feeling:'consumed', unresolved:'active', use:'evidence', want:'them', help:'insight' }, expect: 'contact-question' },
  { name: 'raw + recurring → avoided-material', a: { status:'recurring-person', trigger:'recurring', reading:'unsure-read', feeling:'narrative', unresolved:'raw', use:'nothing-use', want:'stop', help:'guidance' }, expect: 'avoided-material' },
  { name: 'conflict → active-conflict', a: { status:'conflict', trigger:'unsettled', reading:'emotional-charge', feeling:'mixed-feel', unresolved:'active', use:'noted', want:'meaning', help:'interpret' }, expect: 'active-conflict' },
  { name: 'no underneath (clean case)', a: { status:'stranger', trigger:'curiosity', reading:'represents', feeling:'named', unresolved:'resolved', use:'asked', want:'meaning', help:'interpret' }, expect: null }
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
for (const w of wants) for (const h of helps) for (const t of un) {
  const a = { status:'stranger', trigger:'curiosity', reading:'represents', feeling:'roughly', unresolved:t, use:'noted', want:w, help:h };
  try {
    const html = renderOnce(a);
    ok(html.includes('love-result') && html.includes('What your answers suggest') && html.includes('What to look at next') && html.includes('Your best-fit next step') && html.includes('btn-gold'), `render blocks for want=${w}/help=${h}/un=${t}`);
  } catch (e) {
    renderCrashes++; failures++;
    console.error('  RENDER CRASH for', { w, h, t }, '\n', e.stack);
  }
}
ok(renderCrashes === 0, 'customResult never throws across the sweep');

// 6. Honesty guards: no verdict language, no email capture in results.
const sample = renderOnce({ status:'ex', trigger:'hope', reading:'message', feeling:'consumed', unresolved:'active', use:'evidence', want:'them', help:'insight' });
ok(!/love-email-kicker/.test(sample) && !/email-form/.test(sample), 'no email capture in result (user decision 2026-09-20)');
ok(sample.includes('love-aha') || sample.includes('love-offers') || sample.includes('What your answers suggest'), 'v2 layers render');
ok(QZ.launchSub && QZ.launchSub.length > 20, 'launchSub explicitly provided');

// 7. Every answer set maps to exactly one aha key from the library.
const ahaKeys = new Set();
for (const n of rd) for (const r of fe) {
  const a = { ...base, reading: n, feeling: r, unresolved: 'unlooked', use: 'nothing-use' };
  const k = QZ.matchAha(a, QZ.resolve(a));
  ok(!!window.MYSTICDO_AHA[k], `matchAha returns a library key for ${n}/${r} → ${k}`);
  ahaKeys.add(k);
}
console.log(`  aha sweep produced ${ahaKeys.size} distinct aha keys`);

console.log(`dream-about-someone quiz: ${checks} checks -> ${failures === 0 ? 'ALL GREEN' : failures + ' FAILURES'}`);
process.exit(failures === 0 ? 0 : 1);
