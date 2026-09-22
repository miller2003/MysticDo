import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(path.join(__dirname, '..', 'assets/js/quizzes.js'), 'utf8');
const Q = new Function('window', 'document', 'navigator', 'location', src + ';return window.MYSTICDO_QUIZZES;')(
  {}, { querySelectorAll: () => [], addEventListener() {}, querySelector: () => null }, { userAgent: 'n' }, { search: '', hash: '' });

const LEGACY = ['what-is-my-moon-sign','what-is-my-saturn-return','am-i-in-the-right-career','dream-about-someone-dying','feeling-lost-in-life'];
const ALT = ['333-meaning','444-meaning','555-meaning','777-meaning','888-meaning','dream-about-being-chased','dream-about-your-ex','lovers-card-meaning','tarot-yes-or-no','tower-card-meaning'];

console.log('=== LEGACY: field sets per quiz (union) ===');
for (const s of LEGACY) {
  const keys = new Set();
  let types = {};
  for (const p of Object.keys(Q[s].results)) {
    Object.keys(Q[s].results[p]).forEach(k => keys.add(k));
    for (const k of Object.keys(Q[s].results[p])) types[k] = typeof Q[s].results[p][k] + (Array.isArray(Q[s].results[p][k]) ? '[arr ' + Q[s].results[p][k].length + ']' : '');
  }
  console.log('  ' + s.padEnd(30) + Object.keys(types).map(k => k + ':' + types[k]).join('  '));
}

console.log('\n=== ALT: field sets per quiz ===');
for (const s of ALT) {
  let types = {};
  for (const p of Object.keys(Q[s].results)) {
    for (const k of Object.keys(Q[s].results[p])) types[k] = typeof Q[s].results[p][k] + (Array.isArray(Q[s].results[p][k]) ? '[arr ' + Q[s].results[p][k].length + ']' : '');
  }
  console.log('  ' + s.padEnd(30) + Object.keys(types).map(k => k + ':' + types[k]).join('  '));
}

console.log('\n=== reference watchIntro samples (canonical shape) ===');
for (const s of ['is-he-cheating', 'dream-about-deceased-loved-one', 'will-i-be-rich']) {
  const p = Object.keys(Q[s].results)[0];
  console.log('  ' + s + ': "' + Q[s].results[p].watchIntro + '"');
}
console.log('\n=== legacy: does underneath ever return non-null? ===');
for (const s of LEGACY) {
  let n = 0, sample = null;
  for (let i = 0; i < 20000; i++) {
    const a = {}; for (const qq of Q[s].questions) a[qq.id] = qq.options[Math.floor(Math.random() * qq.options.length)].score;
    const u = Q[s].underneath(a, Q[s].resolve(a));
    if (u) { n++; if (!sample) sample = u.key; }
  }
  console.log('  ' + s.padEnd(30) + 'hits=' + n + ' first=' + sample);
}
