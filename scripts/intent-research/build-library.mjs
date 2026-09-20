/**
 * build-library.mjs — seed-anchored intent ranking + data-discovered heads.
 *
 * Two independent candidate pools, merged:
 *
 *  A) SEED-ANCHORED. Every seed in the harvest plan is a phrase Google itself
 *     returned, so none of them is invented. For each seed we measure how many
 *     distinct completions CONTAIN it (nVariants), how many distinct harvest
 *     queries produced such a completion (nQueries), how many OTHER seeds'
 *     completions contained it (nSeeds), US+GB presence, self-confirmation,
 *     and best rank. No text munging → no over-stripping artefacts.
 *
 *  B) DISCOVERED. Phrases that were never seeds but ranked high in the raw
 *     harvest, canonicalised with SAFE (tier-1) modifier stripping only.
 *     This is how intents we did not think of enter the library.
 *
 * Output:
 *   scripts/intent-research/library.json   (ranked candidate pool, ~500)
 *   scripts/intent-research/library.csv
 */

import fs from 'node:fs';
import path from 'node:path';

const DIR = 'C:/Users/samja/Desktop/site/mysticdo/scripts/intent-research';
const RAW = path.join(DIR, 'raw');

/* ---------------- noise ---------------- */

const NOISE = [
  /\blyrics?\b/, /\bsong\b/, /\bchords?\b/, /\bspotify\b/, /\bmp3\b/, /\bmovie\b/,
  /\btrailer\b/, /\bnetflix\b/, /\bimdb\b/, /\bepisode\b/, /\baudiobook\b/, /\bpdf\b/,
  /\bwiki(pedia)?\b/, /\binstagram\b/, /\btiktok\b/, /\bkindle\b/, /\bamazon\b/,
  /\bmeaning in hindi\b/, /\bmeaning in tamil\b/, /\bmeaning in urdu\b/, /\bmeaning in telugu\b/,
  /\bmeaning in bengali\b/, /\bkundli\b/, /\bhoroscope today\b/, /\brashi\b/, /\bnakshatra\b/,
  /\bpregnancy\b/, /\bpregnan/, /\bhome remedies?\b/, /\bmedical\b/, /\bsymptom of (disease|covid)\b/,
  /\bdownload\b/, /\bslideshare\b/, /\bquora\b/, /\bsign in\b/, /\blog ?in\b/,
];
const NAME_NOISE = /\b(reba|mcentire|beyonce|taylor swift|ed sheeran|justin bieber|harry styles|rihanna|adele|bts|presley|michael jackson|selena gomez|ariana grande|billie eilish|frank ocean|lana del rey)\b/i;
const isNoise = (s) => s.length < 10 || s.length > 100 || NAME_NOISE.test(s) || NOISE.some((re) => re.test(s));

/* ---------------- cluster classifier (ordered; first match wins) ---------------- */

const CLUSTERS = [
  ['dreams', /(dream|dreams|dreaming|dreamt|nightmare)/],
  ['twin_flame_soulmate', /(twin flame|twinflame|soulmate|soul mate|false twin|divine counterpart|karmic partner|karmic relationship|twin flame separation|twin flame reunion)/],
  ['angel_numbers', /(angel number|angel numbers|\b1111\b|\b2222\b|\b333\b|\b444\b|\b555\b|\b666\b|\b777\b|\b888\b|\b999\b|\b1212\b|\b1010\b|\b1234\b|\b222\b|mirror hour|repeating number|life path|numerolog|master number)/],
  ['manifestation', /(manifest|law of attraction|law of assumption|369 method|555 method|scripting|shadow work|vibration|neville goddard|abraham hicks|inner child)/],
  ['tarot', /(tarot|oracle card|major arcana|the tower|death card|the moon card|the lovers card|the star card|the sun card|the empress|the hermit|the hanged man|the high priestess|the magician|tarot spread|card reading|lenormand)/],
  ['astrology', /(zodiac|horoscope|birth chart|natal chart|rising sign|moon sign|sun sign|mercury retrograde|retrograde|saturn return|venus sign|north node|chiron|stellium|ascendant|astrolog|cusp|big three|synastry|solar return|progressed|aries|taurus|gemini|cancer|\bleo\b|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces|7th house|seventh house)/],
  ['psychic_abilities', /(psychic|clairvoyan|clairaudien|clairsentien|claircogniz|third eye|intuiti|empath|spirit guide|akashic|channell?ing|spiritual gift|spiritually gifted|psychic ability|healer)/],
  ['grief_afterlife', /(medium|afterlife|passed away|deceased|loved one (is|still|visiting)|died|haunt|ghost|talk to the dead|spirits? in my|heaven|visitation dream|signs? from (my|a) (loved|grandma|mom|dad|mother|father|husband|wife|son|daughter|friend)|communicate with the dead|spirit visit|ancestor)/],
  ['protection_energy', /(curse|hex\b|evil eye|cursed|negative energy|cleanse|cleansing|smudge|protection|ward off|bad energy|energy attachment|grounding|entity attach|psychic attack|banish|salt bath)/],
  ['crystals_rituals', /(crystal|amethyst|rose quartz|obsidian|citrine|moon ritual|full moon|new moon|moon phase|candle magic|spell|spell jar|pendulum|\britual|altar|witchcraft|wicca|\bwitch|incense|birthstone)/],
  ['chakras_energy', /(chakra|reiki|energy healing|prana|solar plexus|root chakra|heart chakra|crown chakra|sacral|throat chakra|energy center|kundalini)/],
  ['past_lives_karma', /(past life|reincarnat|\bkarma|karmic|soul contract|life between lives|regression|soul group|soul tie)/],
  ['spiritual_awakening', /(spiritual awakening|awakening|dark night of the soul|ascension|awaken|enlighten|spirit animal|starseed|indigo child|lightworker|spiritual growth|spiritual journey|spiritual meaning|spiritual gift|ego death|5d|fifth dimension)/],
  ['signs_synchronicity', /(synchronicit|sign from the universe|feather|cardinal|hummingbird|butterfly|dragonfly|see a (deer|hawk|owl|robin|blue jay|fox)|wink from|repeating signs|universe is trying to tell)/],
  ['money_career', /(money|wealth|\brich\b|\bjob\b|career|promotion|business|abundance|prosper|financ|success|salary|income|debt|purpose|destiny|future hold|life direction|quit my job|get hired|new job|get the job|millionaire)/],
  ['love_relationships', /(love me|loves me|love him|love her|in love|come back|cheat|miss me|crush|boyfriend|girlfriend|husband|wife|my ex\b|breakup|break up|relationship|marriage|marry|\bghost|commit|dating|attract|distant|hot and cold|pulling away|left me on read|no contact|limerence|situationship|does he|does she|will he|will she|is he\b|is she\b|him back|her back|still love|thinks? about me|feel the same|unrequited|one sided|loves you|like me back|text me back|breadcrumb|emotionally unavailable|avoidant|karmic partner|soul ?mate|get back together|move on|over him|over her|jealous|obsessed with me|talking stage|he likes me|she likes me|flirting)/],
  ['family_children', /(my child|have kids|children|family situation|my son|my daughter)/],
];

const classify = (s) => {
  for (const [name, re] of CLUSTERS) if (re.test(s)) return name;
  return 'unclassified';
};

/* ---------------- tier-1 SAFE canonicalisation (modifiers that never carry topic) ---------------- */

const TIER1 = new Set([
  'quiz', 'test', 'quizzes', 'free', 'reddit', 'forum', 'signs', 'sign', 'meaning',
  'mean', 'means', 'definition', 'explained', 'explanation', '2024', '2025', '2026',
  '2027', 'calculator', 'online', 'app', 'real', 'accurate', 'genuine', 'today',
  'tonight', 'now', 'actually', 'examples', 'example', 'pictures', 'images', 'video',
  'uk', 'usa', 'review', 'reviews', 'valid', 'confirmed', 'warning', 'yes', 'no',
  'or', 'the', 'a', 'for', 'me', 'my', 'is', 'it', 'to', 'in', 'and', 'of',
]);

function canonicalSafe(phrase) {
  const toks = phrase.split(/\s+/);
  while (toks.length > 2 && TIER1.has(toks[toks.length - 1])) toks.pop();
  return toks.join(' ');
}

/* ---------------- modifier typology of a variant ---------------- */

function modsOf(phrase) {
  const t = [];
  if (/\b(quiz|test|calculator)\b/.test(phrase)) t.push('quiz');
  if (/\bfree\b/.test(phrase)) t.push('free');
  if (/\breddit\b/.test(phrase)) t.push('reddit');
  if (/\b(meaning|means?|definition|explained)\b/.test(phrase)) t.push('meaning');
  if (/\bsigns?\b/.test(phrase)) t.push('signs');
  if (/\btarot\b/.test(phrase)) t.push('tarot');
  if (/\b(psychic|medium|reader|readings?|astrologer)\b/.test(phrase)) t.push('reader');
  if (/\b(astrology|horoscope|birth chart|natal chart|zodiac|chart)\b/.test(phrase)) t.push('astrology');
  if (/^(how to|how do i|how can i)\b/.test(phrase)) t.push('howto');
  return t;
}

const qshape = (s) => {
  if (/^(does|do|is|are|am i|will|would|should|can|could|has|have|did|was|were)\b/.test(s)) return 'yes_no';
  if (/^how\b/.test(s)) return 'how';
  if (/^(what|why|when|where|who|which)\b/.test(s)) return 'wh';
  if (/\b(meaning|mean)\b/.test(s)) return 'meaning';
  if (/\bsigns?\b/.test(s)) return 'signs';
  return 'noun';
};

/* ---------------- load raw ---------------- */

const rows = [];
for (const file of fs.readdirSync(RAW).filter((f) => /^suggest2?-.+\.json$/.test(f)).sort()) {
  rows.push(...JSON.parse(fs.readFileSync(path.join(RAW, file), 'utf8')));
}
const regionsLoaded = [...new Set(rows.map((r) => r.region))];
const allSeeds = new Set(rows.map((r) => r.seed.toLowerCase()));
const allQueries = new Set(rows.map((r) => r.query.toLowerCase()));

/* per-phrase index: phrase -> { regions, ranks[], queries:Set, seeds:Set } */
const index = new Map();
for (const r of rows) {
  const seed = r.seed.toLowerCase();
  r.suggestions.forEach((raw, rank) => {
    const s = String(raw).trim().toLowerCase().replace(/\s+/g, ' ');
    if (!s || isNoise(s)) return;
    let e = index.get(s);
    if (!e) { e = { regions: new Set(), ranks: [], queries: new Set(), seeds: new Set() }; index.set(s, e); }
    e.regions.add(r.region);
    e.ranks.push(rank);
    e.queries.add(r.query.toLowerCase());
    e.seeds.add(seed);
  });
}
const phrases = [...index.keys()];

/* ---------------- A) seed-anchored metrics ---------------- */

const seedRows = [];
for (const seed of allSeeds) {
  const variants = phrases.filter((p) => p !== seed && p.includes(seed));
  const selfEntry = index.get(seed);
  const queriesHit = new Set();
  let topRankHits = 0;
  let minRank = 99;
  for (const v of [...variants, ...(selfEntry ? [seed] : [])]) {
    const e = index.get(v);
    e.queries.forEach((q) => queriesHit.add(q));
    e.ranks.forEach((rk) => { if (rk <= 2) topRankHits++; if (rk < minRank) minRank = rk; });
  }
  // how many OTHER seeds' completions contained this seed
  let crossSeeds = 0;
  for (const other of allSeeds) {
    if (other === seed || other.includes(seed)) continue;
  }
  // cross-seed centrality: seeds whose own completions included this phrase
  crossSeeds = selfEntry ? selfEntry.seeds.size : 0;

  const geoUS = selfEntry ? selfEntry.regions.has('us') : false;
  const geoGB = selfEntry ? selfEntry.regions.has('gb') : false;
  const inUS = variants.some((v) => index.get(v).regions.has('us')) || geoUS;
  const inGB = variants.some((v) => index.get(v).regions.has('gb')) || geoGB;

  const nVariants = variants.length;
  const score =
    crossSeeds * 12 +
    Math.min(queriesHit.size, 120) * 1.6 +
    9 * Math.log2(1 + nVariants) +
    (inUS && inGB ? 14 : 0) +
    (selfEntry ? 8 : 0) +
    Math.max(0, 6 - minRank);

  const modCount = {};
  for (const v of variants) for (const m of modsOf(v)) modCount[m] = (modCount[m] || 0) + 1;

  seedRows.push({
    origin: 'seed',
    phrase: seed,
    cluster: classify(seed),
    shape: qshape(seed),
    score: Math.round(score * 10) / 10,
    nVariants,
    nQueries: queriesHit.size,
    crossSeeds,
    geo: inUS && inGB,
    selfConfirmed: !!selfEntry,
    minRank,
    topRankHits,
    mods: Object.entries(modCount).sort((a, b) => b[1] - a[1]).filter(([, v]) => v >= 2).map(([k]) => k),
    sampleVariants: variants.slice(0, 6),
  });
}

/* ---------------- B) discovered heads (tier-1 canonical, not a seed) ---------------- */

const famAgg = new Map();
for (const p of phrases) {
  const c = canonicalSafe(p);
  if (c === p && !allSeeds.has(p)) { /* keep as-is */ }
  let f = famAgg.get(c);
  if (!f) { f = { head: c, members: [], seeds: new Set(), queries: new Set(), regions: new Set(), topRankHits: 0, minRank: 99, bestScore: 0, best: null }; famAgg.set(c, f); }
  const e = index.get(p);
  const score = e.seeds.size * 10 + Math.min(e.queries.size, 80) * 2 + e.regions.size * 8 + Math.max(0, 5 - (e.ranks.reduce((a, b) => a + b, 0) / e.ranks.length));
  if (score > f.bestScore) { f.bestScore = score; f.best = p; }
  f.members.push(p);
  e.seeds.forEach((s) => f.seeds.add(s));
  e.queries.forEach((q) => f.queries.add(q));
  e.regions.forEach((r) => f.regions.add(r));
  e.ranks.forEach((rk) => { if (rk <= 2) f.topRankHits++; if (rk < f.minRank) f.minRank = rk; });
}

const seenSeedCanon = new Set([...allSeeds].map((s) => canonicalSafe(s)));
const discovered = [];
for (const f of famAgg.values()) {
  if (allSeeds.has(f.head)) continue;                 // already a seed
  if (seenSeedCanon.has(f.head) && f.head !== f.best) { /* still allow if best differs */ }
  const cluster = classify(f.head);
  if (cluster === 'unclassified') continue;
  const score =
    f.seeds.size * 10 +
    Math.min(f.queries.size, 100) * 1.6 +
    5 * Math.log2(1 + f.members.length) +
    (f.regions.size === regionsLoaded.length ? 10 : 0) +
    Math.max(0, 5 - f.minRank);
  discovered.push({
    origin: 'discovered',
    phrase: f.head,
    cluster,
    shape: qshape(f.head),
    score: Math.round(score * 10) / 10,
    nVariants: f.members.length,
    nQueries: f.queries.size,
    crossSeeds: f.seeds.size,
    geo: f.regions.size === regionsLoaded.length,
    selfConfirmed: allQueries.has(f.head),
    minRank: f.minRank,
    topRankHits: f.topRankHits,
    mods: [],
    sampleVariants: f.members.slice(0, 6),
  });
}

/* ---------------- merge, dedupe, sort ---------------- */

const merged = [...seedRows, ...discovered].sort((a, b) => b.score - a.score);

fs.writeFileSync(path.join(DIR, 'library.json'),
  JSON.stringify({ generated: new Date().toISOString(), regions: regionsLoaded, rawRows: rows.length, distinctPhrases: phrases.length, seeds: seedRows.length, discovered: discovered.length, pool: merged }, null, 1), 'utf8');

const csv = ['rank,origin,phrase,cluster,shape,score,nVariants,nQueries,crossSeeds,geo,selfConfirmed,minRank,mods'];
merged.forEach((r, i) => csv.push([i + 1, r.origin, `"${r.phrase}"`, r.cluster, r.shape, r.score, r.nVariants, r.nQueries, r.crossSeeds, r.geo ? 1 : 0, r.selfConfirmed ? 1 : 0, r.minRank, `"${r.mods.join('|')}"`].join(',')));
fs.writeFileSync(path.join(DIR, 'library.csv'), csv.join('\n'), 'utf8');

/* ---------------- report ---------------- */

console.log(`regions ${regionsLoaded.join('+')} | raw rows ${rows.length} | distinct phrases ${phrases.length}`);
console.log(`seeds ${seedRows.length} | discovered ${discovered.length} | pool ${merged.length}`);
console.log('\n=== cluster distribution, pool top 400 ===');
const tally = {};
for (const r of merged.slice(0, 400)) tally[r.cluster] = (tally[r.cluster] || 0) + 1;
for (const [k, v] of Object.entries(tally).sort((a, b) => b[1] - a[1])) console.log(String(v).padStart(4), k);

console.log('\n=== top 90 of pool ===');
for (const r of merged.slice(0, 90)) {
  console.log(
    String(r.score).padStart(6), r.origin === 'seed' ? 'S' : 'D',
    String(r.nVariants).padStart(4), String(r.nQueries).padStart(4), String(r.crossSeeds).padStart(3),
    r.geo ? 'G' : '-', r.cluster.padEnd(20), r.phrase
  );
}
