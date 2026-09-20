/**
 * analyze.mjs — family-level aggregation + intent classification for the MysticDo intent library.
 *
 * Why families: raw Suggest output is full of modifier variants of one intent
 * ("does he love me", "does he love me quiz", "does he love me tarot", "does he
 * love me reddit"). Those are ONE intent with different funnel motivations, not
 * four intents. We collapse trailing modifiers into a canonical head, then rank
 * heads — and the modifier distribution tells us the intent TYPE (quiz-seeking,
 * meaning-seeking, community-validating, price-sensitive).
 *
 * Output: scripts/intent-research/families.json (+ console report)
 */

import fs from 'node:fs';
import path from 'node:path';

const DIR = 'C:/Users/samja/Desktop/site/mysticdo/scripts/intent-research';
const RAW = path.join(DIR, 'raw');

/* ---------------- noise filter ---------------- */

const NOISE = [
  /\blyrics?\b/, /\bsong\b/, /\bchords?\b/, /\bspotify\b/, /\bmp3\b/,
  /\bmovie\b/, /\btrailer\b/, /\bnetflix\b/, /\bimdb\b/, /\bepisode\b/,
  /\baudiobook\b/, /\bpdf\b/, /\bfull movie\b/, /\bsoundtrack\b/,
  /\bwiki(pedia)?\b/, /\binstagram\b/, /\btiktok\b/,
];
const NAME_NOISE = /\b(reba|mcentire|beyonce|taylor swift|ed sheeran|justin bieber|harry styles|rihanna|adele|bts|presley|michael jackson|selena)\b/i;

const isNoise = (s) =>
  s.length < 10 || s.length > 95 || NAME_NOISE.test(s) || NOISE.some((re) => re.test(s));

/* ---------------- cluster classifier (first match wins, order matters) ---------------- */

const CLUSTERS = [
  ['dreams', /(dream|dreams|dreaming|dreamt|lucid dream|nightmare)/],
  ['twin_flame_soulmate', /(twin flame|twinflame|soulmate|soul mate|false twin|divine counterpart|karmic partner|karmic relationship)/],
  ['angel_numbers', /(angel number|1111|2222|333|444|555|666|777|888|999|1212|1010|1234|222|mirror hour|repeating number|life path number|numerolog|master number|birth number|repeating numbers appearing)/],
  ['manifestation', /(manifest|law of attraction|law of assumption|369 method|555 method|scripting|shadow work|raise your vibration|high vibration|neville goddard|abraham hicks|moon manifestation)/],
  ['tarot', /(tarot|oracle card|major arcana|the tower|death card|the moon card|the lovers card|the star card|the sun card|the empress|the hermit|the hanged man|tarot spread|card reading)/],
  ['astrology', /(zodiac|horoscope|birth chart|natal chart|rising sign|moon sign|sun sign|mercury retrograde|retrograde|saturn return|venus sign|north node|chiron|stellium|ascendant|astrolog|cusp|big three|sign compatible|house in astrology|sun moon rising|aries|taurus|gemini|cancer|leo |virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces|12 houses|synastry)/],
  ['psychic_abilities', /(psychic|clairvoyan|clairaudien|clairsentien|claircogniz|third eye|intuiti|empath|spirit guide|akashic|channeling|channelling|spiritual gift|spiritually gifted|psychic ability|psychic medium|healer gift)/],
  ['grief_afterlife', /(medium|afterlife|passed away|deceased|loved one|died|death of|haunt|ghost|talk to the dead|spirits in|heaven|visitation|signs from my|sign from a loved|communicate with the dead|spirit visit)/],
  ['protection_energy', /(curse|hex|evil eye|cursed|negative energy|cleanse|cleansing|smudge|sage your|protection|ward off|bad energy|energy attachment|grounding|entity attach|psychic attack|banish)/],
  ['crystals_rituals', /(crystal|amethyst|rose quartz|obsidian|citrine|moon ritual|full moon|new moon|moon phase|candle magic|spell|spell jar|pendulum|ritual|altar|witchcraft|wicca|witch|saging|incense|tarot deck|candle)/],
  ['chakras_energy', /(chakra|reiki|energy healing|prana|solar plexus|root chakra|heart chakra|crown chakra|sacral|throat chakra|energy center)/],
  ['past_lives_karma', /(past life|reincarnat|karma|karmic|soul contract|life between lives|regression|soul group)/],
  ['spiritual_awakening', /(spiritual awakening|awakening|dark night of the soul|kundalini|ascension|awaken|enlighten|spirit animal|starseed|indigo child|lightworker|spiritual growth|spiritual journey|spiritual meaning|spirituality|spiritual awakening symptoms|ego death)/],
  ['signs_synchronicity', /(synchronicit|sign from|feather|cardinal|hummingbird|butterfly|dragonfly|see a (deer|hawk|owl|robin|blue jay|fox|snake)|wink from|universe is trying|repeating signs)/],
  ['family_children', /(my child|pregnan|have kids|children|family situation|my son|my daughter|get pregnant)/],
  ['death_health', /(die|dying|health|illness|sick|cancer|diagnos)/],
  ['money_career', /(money|wealth|rich|job|career|promotion|business|abundance|prosper|financ|success|salary|income|debt|purpose|destiny|future hold|life direction|get hired|new job|quit)/],
  ['love_relationships', /(love me|loves me|love him|love her|in love|come back|cheat|miss me|crush|boyfriend|girlfriend|husband|wife|my ex|breakup|break up|relationship|marriage|marry|ghost|commit|dating|attract|distant|hot and cold|pull(ing)? away|left me on read|no contact|limerence|situationship|does he|does she|will he|will she|is he|is she|him back|her back|still love|think(s)? about me|feel(s)? the same|unrequited|one sided|loves you|like me back|text(ing)? me back|breadcrumb|emotionally unavailable|avoidant|karmic partner)/],
];

function classify(s) {
  for (const [name, re] of CLUSTERS) if (re.test(s)) return name;
  return 'unclassified';
}

/* ---------------- canonicalisation: strip TRAILING modifier tokens only ---------------- */

const TRAILING = new Set([
  'quiz', 'test', 'quizzes', 'free', 'reddit', 'forum', 'quora', 'signs', 'sign',
  'meaning', 'mean', 'means', 'definition', 'explained', 'explanation',
  '2026', '2025', '2027', 'calculator', 'astro', 'astrologer', 'astrology',
  'tarot', 'reading', 'readings', 'reader', 'psychic', 'medium', 'online',
  'app', 'website', 'chart', 'yes', 'no', 'or', 'real', 'accurate', 'genuine',
  'today', 'tonight', 'now', 'spread', 'card', 'cards', 'deck', 'number',
  'numbers', 'honest', 'true', 'actually', 'examples', 'example', 'pic',
  'pictures', 'images', 'video', 'uk', 'usa', 'near', 'text', 'warning',
  'what', 'does', 'it', 'why', 'confirm', 'confirmed', 'valid', 'review',
]);

function canonical(phrase) {
  let toks = phrase.split(/\s+/);
  while (toks.length > 2 && TRAILING.has(toks[toks.length - 1])) toks.pop();
  return toks.join(' ');
}

/* ---------------- intent type from the modifier that was stripped ---------------- */

function modifierTags(phrase) {
  const t = [];
  if (/\b(quiz|test|calculator|calculator)\b/.test(phrase)) t.push('quiz');
  if (/\bfree\b/.test(phrase)) t.push('free');
  if (/\breddit\b/.test(phrase)) t.push('reddit');
  if (/\b(meaning|means?|definition|explained)\b/.test(phrase)) t.push('meaning');
  if (/\bsigns?\b/.test(phrase)) t.push('signs');
  if (/\btarot\b/.test(phrase)) t.push('tarot');
  if (/\bpsychic\b|\bmedium\b|\breader\b|\breadings?\b/.test(phrase)) t.push('reader');
  if (/\bastro(lo(gy|ger))?\b|\bhoroscope\b|\bchart\b|\bzodiac\b/.test(phrase)) t.push('astrology');
  if (/\b(sexual|sex)\b/.test(phrase)) t.push('explicit');
  return t;
}

function questionShape(s) {
  if (/^(does|do|is|are|am i|will|would|should|can|could|has|have|did|was|were|when will|will i)\b/.test(s)) return 'yes_no';
  if (/^how\b/.test(s)) return 'how';
  if (/^(what|why|when|where|who|which)\b/.test(s)) return 'wh';
  if (/\b(meaning|mean)\b/.test(s)) return 'meaning';
  if (/\bsigns?\b/.test(s)) return 'signs';
  return 'noun';
}

/* ---------------- load raw ---------------- */

const rows = [];
for (const region of ['us', 'gb']) {
  const f = path.join(RAW, `suggest-${region}.json`);
  if (fs.existsSync(f)) for (const r of JSON.parse(fs.readFileSync(f, 'utf8'))) rows.push(r);
}
const regionsLoaded = [...new Set(rows.map((r) => r.region))];

/* ---------------- aggregate phrases ---------------- */

const agg = new Map();
for (const r of rows) {
  const seed = r.seed.toLowerCase();
  r.suggestions.forEach((raw, rank) => {
    const s = String(raw).trim().toLowerCase().replace(/\s+/g, ' ');
    if (!s || isNoise(s)) return;
    let a = agg.get(s);
    if (!a) {
      a = { phrase: s, seeds: new Set(), queries: new Set(), regions: new Set(), topRankHits: 0, rankSum: 0, rankN: 0, minRank: 99, exact: false };
      agg.set(s, a);
    }
    a.seeds.add(seed);
    a.queries.add(r.query.toLowerCase());
    a.regions.add(r.region);
    if (rank <= 2) a.topRankHits++;
    if (rank === 0 && r.query.toLowerCase() === s) a.exact = true;
    a.rankSum += rank; a.rankN++;
    if (rank < a.minRank) a.minRank = rank;
  });
}

const scored = [];
for (const a of agg.values()) {
  const avgRank = a.rankSum / Math.max(a.rankN, 1);
  const score =
    a.seeds.size * 10 +
    Math.min(a.queries.size, 80) * 2 +
    a.topRankHits * 1.5 +
    (a.regions.size === regionsLoaded.length ? 10 : 0) +
    (a.exact ? 5 : 0) +
    Math.max(0, 5 - avgRank);
  scored.push({
    phrase: a.phrase,
    canonical: canonical(a.phrase),
    cluster: classify(a.phrase),
    shape: questionShape(a.phrase),
    mods: modifierTags(a.phrase),
    score: Math.round(score * 10) / 10,
    breadth: a.seeds.size,
    depth: a.queries.size,
    geo: a.regions.size === regionsLoaded.length,
    topRankHits: a.topRankHits,
    minRank: a.minRank,
    avgRank: Math.round(avgRank * 100) / 100,
    exact: a.exact,
  });
}

/* ---------------- aggregate into families ---------------- */

const fam = new Map();
for (const s of scored) {
  let f = fam.get(s.canonical);
  if (!f) {
    f = { head: s.canonical, members: [], clusters: new Map(), mods: new Set(), shapes: new Set(), seeds: new Set(), regions: new Set() };
    fam.set(s.canonical, f);
  }
  f.members.push(s);
  f.clusters.set(s.cluster, (f.clusters.get(s.cluster) || 0) + 1);
  s.mods.forEach((m) => f.mods.add(m));
  f.shapes.add(s.shape);
}

for (const f of fam.values()) {
  f.members.sort((a, b) => b.score - a.score);
  const rest = f.members.slice(1).reduce((n, m) => n + m.score, 0);
  const best = f.members[0];
  f.best = best;
  f.cluster = [...f.clusters.entries()].sort((a, b) => b[1] - a[1])[0][0];
  f.size = f.members.length;
  f.mods = [...f.mods];
  f.shapes = [...f.shapes];
  f.familyScore = Math.round((best.score + 0.35 * rest + 4 * Math.log2(1 + f.size)) * 10) / 10;
}

const families = [...fam.values()].sort((a, b) => b.familyScore - a.familyScore);

/* ---------------- output ---------------- */

const slim = families.map((f) => ({
  head: f.head,
  cluster: f.cluster,
  familyScore: f.familyScore,
  variants: f.size,
  mods: f.mods,
  shapes: f.shapes,
  bestVariant: f.best.phrase,
  bestScore: f.best.score,
  bestBreadth: f.best.breadth,
  bestDepth: f.best.depth,
  geo: f.best.geo,
  exact: f.best.exact,
  top: f.members.slice(0, 4).map((m) => m.phrase),
}));

fs.writeFileSync(
  path.join(DIR, 'families.json'),
  JSON.stringify({ generated: new Date().toISOString(), regions: regionsLoaded, rawRows: rows.length, distinctPhrases: agg.size, familyCount: families.length, families: slim }, null, 1),
  'utf8'
);
fs.writeFileSync(path.join(DIR, 'families-flat.csv'),
  'rank,head,cluster,familyScore,variants,mods,bestVariant,breadth,depth,geo\n' +
  slim.map((f, i) => [i + 1, `"${f.head}"`, f.cluster, f.familyScore, f.variants, `"${f.mods.join('|')}"`, `"${f.bestVariant}"`, f.bestBreadth, f.bestDepth, f.geo ? 1 : 0].join(',')).join('\n'),
  'utf8');

console.log('regions loaded:', regionsLoaded.join('+'), '| raw rows:', rows.length, '| distinct phrases:', agg.size, '| families:', families.length);
console.log('\n=== cluster distribution, top 500 families ===');
const tally = {};
for (const f of families.slice(0, 500)) tally[f.cluster] = (tally[f.cluster] || 0) + 1;
for (const [k, v] of Object.entries(tally).sort((a, b) => b[1] - a[1])) console.log(String(v).padStart(4), k);

console.log('\n=== top 80 families ===');
for (const f of families.slice(0, 80)) {
  console.log(
    String(f.familyScore).padStart(6),
    String(f.size).padStart(3),
    String(f.best?.breadth ?? 0).padStart(2),
    f.cluster.padEnd(21),
    f.head + '   [' + f.mods.join(',') + ']'
  );
}

console.log('\n=== top family per cluster ===');
const seen = new Set();
for (const f of families) {
  if (seen.has(f.cluster)) continue;
  seen.add(f.cluster);
  console.log(f.cluster.padEnd(22), String(f.familyScore).padStart(6), '|', f.head);
}
