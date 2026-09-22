import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(path.join(__dirname, '..', 'assets/js/quizzes.js'), 'utf8');
const win = {};
new Function('window', 'document', 'navigator', 'location', src)(
  win, { querySelectorAll: () => [], addEventListener() {}, querySelector: () => null },
  { userAgent: 'n' }, { search: '', hash: '' });
const Q = win.MYSTICDO_QUIZZES;

function body() { return { _h: '', set innerHTML(v) { this._h = v; }, get innerHTML() { return this._h; }, querySelector: () => null, querySelectorAll: () => [] }; }
const unesc = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"');

let bad = 0;
const HOLLOW = /<h3>[^<]*<\/h3>\s*<p>\s*<\/p>|<p>\s*<\/p>|<ul>\s*<\/ul>|>undefined<|>null<|>NaN<|>\[object|> ,<|><\/(h3|p|li)>/;
const NEW = ['333-meaning','444-meaning','555-meaning','777-meaning','888-meaning',
'what-is-my-moon-sign','what-is-my-saturn-return','am-i-in-the-right-career',
'dream-about-being-chased','dream-about-someone-dying','dream-about-your-ex',
'feeling-lost-in-life','dream-about-deceased-loved-one','is-my-loved-one-watching-over-me',
'signs-from-deceased-loved-ones','why-am-i-always-broke','will-i-be-rich',
'lovers-card-meaning','tarot-yes-or-no','tower-card-meaning'];

console.log('slug'.padEnd(34) + 'len   blocks  under  issues');
for (const slug of NEW) {
  const q = Q[slug];
  const issues = new Set();
  let minLen = Infinity, maxLen = 0;
  for (const p of Object.keys(q.results)) {
    const a = { want: undefined, help: undefined };
    for (const qq of q.questions) a[qq.id] = qq.options[0].score;
    const b = body();
    try { q.customResult({ answers: a, body: b, restart() {} }); } catch (e) { issues.add('THROW ' + e.message); continue; }
    const html = b.innerHTML || '';
    minLen = Math.min(minLen, html.length); maxLen = Math.max(maxLen, html.length);
    const plain = unesc(html);
    if (/undefined/.test(plain)) issues.add('literal undefined');
    const m = plain.match(/<h3>[^<]*<\/h3>\s*<p>\s*<\/p>/); if (m) issues.add('hollow block');
    if (/<ul>\s*<\/ul>/.test(plain)) issues.add('empty ul');
    if (/What your answers suggest<\/h3>\s*<p>\s*<\/p>/.test(plain)) issues.add('empty suggest');
    if (/What they don\u2019t tell you<\/h3>\s*<p>\s*<\/p>/.test(plain)) issues.add('empty dontTell');
    if (!/What to look at next<\/h3>\s*<p>/.test(plain)) issues.add('no watch intro');
  }
  const hasUnder = [...Array(600)].some(() => { const a = {}; for (const qq of q.questions) a[qq.id] = qq.options[0].score; return !!q.underneath(a, q.resolve(a)); });
  if (issues.size) { bad++; console.log('FAIL ' + slug.padEnd(29) + (minLen + '-' + maxLen).padEnd(12) + (hasUnder ? 'Y' : 'n').padEnd(7) + [...issues].join('; ')); }
  else console.log('ok   ' + slug.padEnd(29) + (minLen + '-' + maxLen).padEnd(12) + (hasUnder ? 'Y' : 'n'));
}
console.log('\n' + (bad === 0 ? 'RENDER QUALITY: ALL CLEAN' : 'RENDER QUALITY: ' + bad + ' pages with issues'));
