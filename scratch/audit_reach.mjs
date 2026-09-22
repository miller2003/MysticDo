import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(path.join(__dirname, '..', 'assets/js/quizzes.js'), 'utf8');
const Q = new Function('window', 'document', 'navigator', 'location', src + ';return window.MYSTICDO_QUIZZES;')(
  {}, { querySelectorAll: () => [], addEventListener() {}, querySelector: () => null }, { userAgent: 'n' }, { search: '', hash: '' });

const NEW = ['333-meaning','444-meaning','555-meaning','777-meaning','888-meaning',
'what-is-my-moon-sign','what-is-my-saturn-return','am-i-in-the-right-career',
'dream-about-being-chased','dream-about-someone-dying','dream-about-your-ex',
'feeling-lost-in-life','dream-about-deceased-loved-one','is-my-loved-one-watching-over-me',
'signs-from-deceased-loved-ones','why-am-i-always-broke','will-i-be-rich',
'lovers-card-meaning','tarot-yes-or-no','tower-card-meaning'];

const N = 30000;
function rnd(n) { return Math.floor(Math.random() * n); }

console.log('slug'.padEnd(34) + 'patterns reachable/total'.padEnd(28) + 'practice keys reached');
const deadPatterns = [];
for (const slug of NEW) {
  const q = Q[slug];
  const all = Object.keys(q.results);
  const seen = new Set();
  const prac = new Set();
  const ukeys = new Set();
  for (let i = 0; i < N; i++) {
    const a = {};
    for (const qq of q.questions) a[qq.id] = qq.options[rnd(qq.options.length)].score;
    try {
      const p = q.resolve(a);
      if (!(p in q.results)) { console.log('  !! ' + slug + ' resolve -> unknown key ' + p); }
      seen.add(p);
      const u = q.underneath(a, p);
      if (u) ukeys.add(u.key);
      prac.add(q.matchPractice(a));
    } catch (e) { console.log('  !! ' + slug + ' crash: ' + e.message); }
  }
  const unreachable = all.filter(k => !seen.has(k));
  if (unreachable.length) deadPatterns.push([slug, unreachable]);
  console.log(slug.padEnd(34) + (seen.size + '/' + all.length).padEnd(28)
    + [...prac].filter(Boolean).sort().join(',')
    + '   [underneath:' + [...ukeys].length + ']');
}

console.log('\n=== UNREACHABLE RESULT PATTERNS (dead content) ===');
if (!deadPatterns.length) console.log('  (none)');
for (const [s, u] of deadPatterns) console.log('  ' + s.padEnd(34) + u.join(', '));
