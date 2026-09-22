import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(path.join(__dirname, '..', 'assets/js/quizzes.js'), 'utf8');
const Q = new Function('window', 'document', 'navigator', 'location', src + ';return window.MYSTICDO_QUIZZES;')(
  {}, { querySelectorAll: () => [], addEventListener() {}, querySelector: () => null }, { userAgent: 'n' }, { search: '', hash: '' });

for (const slug of ['tower-card-meaning', 'what-is-my-moon-sign']) {
  const q = Q[slug];
  const first = Object.keys(q.results)[0];
  const r = q.results[first];
  console.log('################', slug, '/ pattern:', first);
  for (const k of Object.keys(r)) {
    const v = r[k];
    console.log('  ' + k + ' : ' + (typeof v) + (typeof v === 'string' ? ' (' + v.length + ' chars)' : ''));
    if (typeof v === 'string') console.log('      "' + v.slice(0, 220) + (v.length > 220 ? ' …' : '') + '"');
    if (Array.isArray(v)) console.log('      [' + v.length + '] ' + JSON.stringify(v).slice(0, 220));
  }
  // how does resolve work + where are context/intent
  console.log('  qids:', q.questions.map(x => x.id).join(','));
  console.log('  resolve body:', String(q.resolve).replace(/\s+/g, ' ').slice(0, 320));
  console.log('  matchPractice body:', String(q.matchPractice).replace(/\s+/g, ' ').slice(0, 260));
  console.log('  underneath available keys:', (() => {
    const seen = new Set();
    for (let i = 0; i < 4000; i++) {
      const a = {}; for (const qq of q.questions) a[qq.id] = qq.options[Math.floor(Math.random() * qq.options.length)].score;
      const u = q.underneath(a, q.resolve(a)); if (u) seen.add(u.key);
    }
    return [...seen].join(',');
  })());
  console.log('');
}
