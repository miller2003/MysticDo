/* One-off: build final partner logo SVGs from the assets extracted
   from kasamba.com / purplegarden.co (see _design-check/*.svg). */
const fs = require('fs');
const path = require('path');

const ROOT = 'C:\\Users\\samja\\Desktop\\site\\mysticdo';
const SRC = path.join(ROOT, '_design-check');
const OUT = path.join(ROOT, 'assets', 'partners');
fs.mkdirSync(OUT, { recursive: true });

/* 1) Kasamba knot — official two-color mark, used bare on light bg. */
let k = fs.readFileSync(path.join(SRC, '_kasamba-logo.svg'), 'utf8');
k = k.replace(/^\uFEFF/, '').trim();
k = k.replace(/ width="32" height="32"/, '');
k = k.replace(/<g id="Logo">/, '<g>');
if (!/^<svg[^>]*viewBox="0 0 131 131"/.test(k)) throw new Error('kasamba viewBox lost');
fs.writeFileSync(path.join(OUT, 'kasamba-icon.svg'), k + '\n', 'utf8');

/* 2) Purple Garden star — official mark is white + indigo→pink glow,
   designed for dark surfaces. Mount it on a brand-indigo rounded tile
   so it reads on ivory. */
let p = fs.readFileSync(path.join(SRC, 'purplegarden-icon.svg'), 'utf8');
p = p.replace(/^\uFEFF/, '').trim();
const openEnd = p.indexOf('>') + 1;
const closeStart = p.lastIndexOf('</svg>');
const inner = p.slice(openEnd, closeStart).replace(/<g id="Group 2699">/, '<g>');
const tile =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">' +
  '<rect width="48" height="48" rx="11" fill="#4C41E6"/>' +
  '<g transform="translate(7.2 7.2) scale(0.1442065494)">' +
  inner +
  '</g></svg>';
fs.writeFileSync(path.join(OUT, 'purplegarden-icon.svg'), tile + '\n', 'utf8');

console.log('written:');
for (const f of fs.readdirSync(OUT)) {
  console.log(' ', f, fs.statSync(path.join(OUT, f)).size, 'bytes');
}
