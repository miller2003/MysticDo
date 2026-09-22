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

const f = (x) => (typeof x === 'function' ? 'Y' : '-');
console.log('slug'.padEnd(34) + 'res und mat aha  #res  customResult-signature');
for (const k of NEW) {
  const q = Q[k];
  const sig = String(q.customResult).split('{')[0].replace(/^function\s*/, '').trim();
  console.log(k.padEnd(34) + [f(q.resolve), f(q.underneath), f(q.matchPractice), f(q.matchAha)].map(s => s.padEnd(4)).join('')
    + String(Object.keys(q.results).length).padEnd(6) + sig);
}
