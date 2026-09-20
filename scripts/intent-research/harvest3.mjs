/**
 * harvest3.mjs — polite gap-fill: only the curated intents still lacking
 * measured evidence. Low concurrency + delay so Google does not throttle.
 */
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'C:/Users/samja/Desktop/site/mysticdo/scripts/intent-research/raw/suggest3.json';

const GAPS = [
  'how to get over someone', 'twin flame stages', 'can dreams predict the future',
  'what does 2222 mean', 'what does the high priestess mean', 'what is my dominant sign',
  'what is my seventh house', 'what does my moon sign mean', 'spiritual awakening stages',
  'does my deceased loved one see me', 'what is blocking my money',
];

const SUFFIX = ['', ' meaning', ' signs', ' quiz', ' reddit', ' spiritual', ' a', ' b', ' s', ' c', ' how', ' what', ' does', ' in love', ' tarot', ' astrology'];

const REGIONS = [
  { code: 'us', hl: 'en', gl: 'us' },
  { code: 'gb', hl: 'en', gl: 'gb' },
];
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function suggest(q, region, attempt = 0) {
  try {
    const res = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&hl=${region.hl}&gl=${region.gl}&q=${encodeURIComponent(q)}`, { headers: { 'User-Agent': UA } });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const d = await res.json();
    return Array.isArray(d?.[1]) ? d[1] : [];
  } catch {
    if (attempt < 4) { await sleep(1500 * (attempt + 1)); return suggest(q, region, attempt + 1); }
    return [];
  }
}

const rows = [];
for (const region of REGIONS) {
  for (const seed of GAPS) {
    for (const suf of SUFFIX) {
      const q = seed + suf;
      rows.push({ cluster: 'gapfill', seed, query: q, kind: suf ? 'modifier' : 'plain', region: region.code, suggestions: await suggest(q, region) });
      await sleep(320);
    }
    console.log(`[${region.code}] ${seed}`);
  }
}

fs.writeFileSync(OUT, JSON.stringify(rows, null, 1), 'utf8');
console.log('wrote', OUT, '| rows', rows.length, '| non-empty', rows.filter((r) => r.suggestions.length).length);
