import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(path.join(__dirname, '..', 'assets/js/quizzes.js'), 'utf8');
const win = {};
new Function('window', 'document', 'navigator', 'location', src)(
  win, { querySelectorAll: () => [], addEventListener() {}, querySelector: () => null }, { userAgent: 'n' }, { search: '', hash: '' });
const Q = win.MYSTICDO_QUIZZES;

const TARGETS = process.argv.slice(2);
for (const spec of TARGETS) {
  const [slug, pat] = spec.split('#');
  const QZ = Q[slug];
  if (!QZ) { console.log('no quiz ' + slug); continue; }
  const a = {}; for (const q of QZ.questions) a[q.id] = (q.options && q.options[0]) ? q.options[0].score : null;
  const real = QZ.resolve; QZ.resolve = () => pat;
  const body = { _h: '', set innerHTML(v) { this._h = v; }, get innerHTML() { return this._h; }, querySelector: () => null, querySelectorAll: () => [] };
  try { QZ.customResult({ answers: a, body, restart() {} }); } catch (e) { console.log(slug + ': THREW ' + e.message); QZ.resolve = real; continue; }
  QZ.resolve = real;
  const plain = (body.innerHTML || '').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  console.log('#### ' + slug + ' / ' + pat + '  (' + plain.length + ' chars)');
  const re = /\bundefined\b/g; let m, n = 0;
  while ((m = re.exec(plain)) && n < 4) {
    console.log('   … ' + plain.slice(Math.max(0, m.index - 130), m.index + 90).replace(/\s+/g, ' '));
    n++;
  }
  console.log('');
}
