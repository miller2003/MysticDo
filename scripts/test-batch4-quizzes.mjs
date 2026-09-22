/* Logic test for the 5 Batch 4 quizzes:
 * - dream-about-someone-dying
 * - what-is-my-moon-sign
 * - what-is-my-saturn-return
 * - feeling-lost-in-life
 * - am-i-in-the-right-career
 * Run: node scripts/test-batch4-quizzes.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src = readFileSync(path.join(root, 'assets/js/quizzes.js'), 'utf8');

globalThis.window = {};
eval(src);

const slugs = [
  'dream-about-someone-dying',
  'what-is-my-moon-sign',
  'what-is-my-saturn-return',
  'feeling-lost-in-life',
  'am-i-in-the-right-career'
];

let checks = 0;
let failures = 0;
function ok(cond, msg) {
  checks++;
  if (!cond) { failures++; console.error('  FAIL:', msg); }
}

for (const slug of slugs) {
  console.log(`Checking quiz: ${slug}...`);
  const QZ = window.MYSTICDO_QUIZZES[slug];
  ok(!!QZ, `${slug} registered`);
  if (!QZ) continue;

  ok(QZ.questions.length === 8, `${slug} has 8 questions (got ${QZ.questions.length})`);
  ok(typeof QZ.launchSub === 'string' && QZ.launchSub.length > 20, `${slug} has valid launchSub`);

  const RESULT_KEYS = Object.keys(QZ.results);
  ok(RESULT_KEYS.length === 5 || RESULT_KEYS.length === 6, `${slug} has 5-6 patterns (got ${RESULT_KEYS.length})`);

  const PRACTICE_KEYS = Object.keys(QZ.practice);
  ok(PRACTICE_KEYS.length === 7, `${slug} has 7 practice keys (got ${PRACTICE_KEYS.length})`);

  // Test resolution with mock answers
  const mockA = {};
  for (const q of QZ.questions) {
    mockA[q.id] = q.options[0].score;
  }
  const resolved = QZ.resolve(mockA);
  ok(RESULT_KEYS.includes(resolved), `${slug} resolves to valid pattern: ${resolved}`);

  const matched = QZ.matchPractice(mockA);
  ok(PRACTICE_KEYS.includes(matched), `${slug} matches valid practice: ${matched}`);
}

if (failures === 0) {
  console.log(`\nALL GREEN: ${checks} checks passed across 5 Batch 4 quizzes!`);
} else {
  console.error(`\nFAILED: ${failures} out of ${checks} checks failed.`);
  process.exit(1);
}
