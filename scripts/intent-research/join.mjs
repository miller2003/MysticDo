/**
 * join.mjs — attach MEASURED Google-Suggest evidence to the curated Top-200.
 * Any curated intent with no measured match is flagged, not silently kept.
 */
import fs from 'node:fs';
import path from 'node:path';
import { CURATED } from './curated-200.mjs';

const DIR = 'C:/Users/samja/Desktop/site/mysticdo/scripts/intent-research';
const lib = JSON.parse(fs.readFileSync(path.join(DIR, 'library.json'), 'utf8'));
const pool = lib.pool;

const out = [];
const unmatched = [];

CURATED.forEach(([q, keys, cluster, type, form, funnel, url], i) => {
  const hits = pool.filter((r) => keys.some((k) => r.phrase.includes(k)));
  if (!hits.length) {
    unmatched.push({ q, cluster, reason: 'no matching phrasing in corpus' });
    out.push({ rank: i + 1, q, cluster, type, form, funnel, url, measured: false, tier: '·' });
    return;
  }
  const best = hits.reduce((a, b) => (b.score > a.score ? b : a), hits[0]);
  const nVariants = Math.max(...hits.map((h) => h.nVariants));
  const nQueries = Math.max(...hits.map((h) => h.nQueries));
  const crossSeeds = Math.max(...hits.map((h) => h.crossSeeds));
  const geo = hits.some((h) => h.geo);
  // A pool row exists for every seed, even one Google returned nothing for.
  // Real evidence requires at least one returned completion OR one query hit.
  const measured = nVariants > 0 || nQueries > 0;
  if (!measured) unmatched.push({ q, cluster, reason: 'seed present but Google returned no completion for it' });
  const tier = nVariants >= 50 ? '★★★' : nVariants >= 15 ? '★★' : nVariants >= 5 ? '★' : '·';
  out.push({
    rank: i + 1, q, cluster, type, form, funnel, url,
    measured, tier,
    matched: hits.length,
    evidencePhrase: best.phrase,
    nVariants, nQueries, crossSeeds, geo,
    score: Math.round(best.score * 10) / 10,
    mods: best.mods || [],
  });
});

fs.writeFileSync(path.join(DIR, 'intent-library.json'),
  JSON.stringify({ generated: new Date().toISOString(), count: out.length, source: 'Google Suggest (hl=en, gl=us+gb), MysticDo first-party harvest', intents: out }, null, 1), 'utf8');

const csv = ['rank,intent,cluster,type,form,funnel,nVariants,nQueries,crossSeeds,geo,evidencePhrase,url'];
out.forEach((r) => csv.push([r.rank, `"${r.q}"`, r.cluster, r.type, r.form, r.funnel, r.nVariants ?? '', r.nQueries ?? '', r.crossSeeds ?? '', r.geo ? 1 : 0, `"${r.evidencePhrase || ''}"`, r.url].join(',')));
fs.writeFileSync(path.join(DIR, 'intent-library.csv'), csv.join('\n'), 'utf8');

/* ---- report ---- */

console.log(`curated ${out.length} | measured ${out.filter((r) => r.measured).length} | unmatched ${unmatched.length}`);
if (unmatched.length) {
  console.log('\nUNMATCHED / NO EVIDENCE (move to appendix):');
  unmatched.forEach((u) => console.log('  -', u.q, '(' + u.cluster + ') —', u.reason));
}

console.log('\n=== by cluster ===');
const t = {};
for (const r of out) { (t[r.cluster] ||= []).push(r); }
for (const [k, v] of Object.entries(t).sort((a, b) => b[1].length - a[1].length)) {
  const withEv = v.filter((x) => x.measured);
  const med = withEv.map((x) => x.nVariants).sort((a, b) => a - b)[Math.floor(withEv.length / 2)] || 0;
  console.log(`${String(v.length).padStart(3)}  ${k.padEnd(22)} median nVariants=${med}`);
}

console.log('\n=== TOP 200 ordered by measured demand (nVariants desc, then nQueries) ===');
const ranked = out.filter((r) => r.measured).sort((a, b) => b.nVariants - a.nVariants || b.nQueries - a.nQueries);
ranked.slice(0, 60).forEach((r, i) => {
  console.log(String(i + 1).padStart(3), String(r.nVariants).padStart(4), String(r.nQueries).padStart(4), String(r.crossSeeds).padStart(3), r.cluster.padEnd(22), r.q);
});
