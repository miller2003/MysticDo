import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(path.join(__dirname, '..', 'assets/js/quizzes.js'), 'utf8');
const Q = new Function('window', 'document', 'navigator', 'location', src + ';return window.MYSTICDO_QUIZZES;')(
  {}, { querySelectorAll: () => [], addEventListener() {}, querySelector: () => null }, { userAgent: 'n' }, { search: '', hash: '' });

const LEGACY = ['what-is-my-moon-sign','what-is-my-saturn-return','am-i-in-the-right-career','dream-about-someone-dying','feeling-lost-in-life'];
for (const s of LEGACY) {
  const q = Q[s];
  const out = new Set();
  for (let i = 0; i < 3000; i++) {
    const a = {}; for (const qq of q.questions) a[qq.id] = qq.options[Math.floor(Math.random() * qq.options.length)].score;
    out.add(JSON.stringify(q.underneath(a, q.resolve(a))));
    if (out.size > 3) break;
  }
  console.log('#### ' + s + '  -> distinct underneath returns: ' + out.size);
  let n = 0;
  for (const o of out) { console.log('   ' + o.slice(0, 400)); if (++n >= 2) break; }
  console.log('   underneath source: ' + String(q.underneath).replace(/\s+/g, ' ').slice(0, 500));
  console.log('');
}
