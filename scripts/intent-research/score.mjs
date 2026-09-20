/**
 * score.mjs — turn raw Google Suggest harvests into a ranked intent candidate list.
 *
 * Signal model (all derived from real Suggest responses, nothing invented):
 *
 *   breadth   = # of DISTINCT seed queries whose completions contained this phrase.
 *               This is the core demand-centrality signal: a phrase that every
 *               related query leads to is a phrase the market actually types.
 *   depth     = # of distinct full queries (incl. alphabet/modifier expansions)
 *               that returned it — captures long-tail pull.
 *   topRank   = # of times it appeared at Suggest position 0–2 (Google orders
 *               completions by popularity, so a top slot = strong relative demand).
 *   geo       = present in BOTH us and gb (the 欧美 markets MysticDo targets).
 *   exact     = the phrase came back as its own completion (self-confirming query).
 *
 * Output: scripts/intent-research/candidates.json  (+ console cluster summary)
 */

import fs from 'node:fs';
import path from 'node:path';

const DIR = 'C:/Users/samja/Desktop/site/mysticdo/scripts/intent-research';
const RAW = path.join(DIR, 'raw');

/* ---------------- noise filters: off-intent completions ---------------- */

const NOISE = [
  /\blyrics?\b/, /\bsong\b/, /\bchords?\b/, /\bspotify\b/, /\byoutube\b/, /\bmp3\b/,
  /\bmovie\b/, /\btrailer\b/, /\bnetflix\b/, /\bimdb\b/, /\bcast\b/, /\bepisode\b/,
  /\bbook\b/, /\baudiobook\b/, /\bpdf\b/, /\bdownload\b/, /\bfull movie\b/,
  /\bwiki(pedia)?\b/, /\breddit\.com\b/, /\binstagram\b/, /\btiktok\b/,
  /\bnear me\b/, /\bjobs?\b/, /\bsalary\b/,
];

// Proper-name / brand completions that are not spiritual intents.
const NAME_NOISE = /\b(reba|mcentire|beyonce|taylor swift|ed sheeran|justin bieber|harry styles|rihanna|adele|sza|bts|presley)\b/i;

function isNoise(s) {
  if (s.length < 12) return true;
  if (s.length > 90) return true;
  if (NAME_NOISE.test(s)) return true;
  return NOISE.some((re) => re.test(s));
}

/* ---------------- cluster classifier (order matters) ---------------- */

const CLUSTERS = [
  ['dreams', /\b(dream|dreams|dreaming|dreamt|lucid dream|nightmare)\b/],
  ['angel_numbers', /\b(angel number|\d{2,4}\s*(mean|meaning)|1111|222|333|444|555|666|777|888|999|1212|1010|1234|life path|numerolog|master number|mirror hour|repeating number)\b/],
  ['twin_flame_soulmate', /\b(twin flame|soulmate|soul mate|twinflame|karmic (partner|relationship)|false twin|divine counterpart)\b/],
  ['manifestation', /\b(manifest|manifestation|law of attraction|law of assumption|369|555 method|scripting|shadow work|vibration|abraham hicks|neville goddard)\b/],
  ['tarot', /\b(tarot|oracle card|card reading|the tower|the moon card|the lovers|death card|the star card|the sun card|major arcana|spread)\b/],
  ['astrology', /\b(zodiac|horoscope|birth chart|natal chart|rising sign|moon sign|sun sign|mercury retrograde|retrograde|saturn return|venus sign|north node|chiron|stellium|ascendant|cusp|big three|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces|aries|taurus|gemini|cancer|astrolog)\b/],
  ['psychic_abilities', /\b(psychic|clairvoyan|clairaudien|clairsentien|claircogniz|third eye|intuiti|empath|medium(ship)?|channel(ing)?|spirit guide|akashic)\b/],
  ['signs_synchronicity', /\b(synchronicit|sign from|feather|cardinal|hummingbird|butterfly|dragonfly|repeating|see a (deer|hawk|owl|robin|blue jay)|wink from)\b/],
  ['spiritual_awakening', /\b(spiritual awakening|awakening|dark night of the soul|kundalini|ascension|awaken|enlighten|spiritual growth|spirit animal|starseed|indigo child|lightworker)\b/],
  ['protection_energy', /\b(curse|hex|evil eye|cursed|negative energy|cleanse|cleansing|smudge|sage|protection|ward(ing)? off|bad energy|aura|grounding|entity|attachment)\b/],
  ['crystals_rituals', /\b(crystal|amethyst|quartz|obsidian|citrine|moon ritual|full moon|new moon|moon phase|candle magic|spell|spell jar|pendulum|ritual|altar|witchcraft|wicca|tarot deck)\b/],
  ['chakras_energy', /\b(chakra|reiki|energy healing|prana|chi |qi |meridian healing|heart chakra|root chakra|crown chakra|sacral|solar plexus)\b/],
  ['past_lives_karma', /\b(past life|reincarnat|karma|karmic|soul contract|life between lives|regression)\b/],
  ['grief_afterlife', /\b(medium|afterlife|passed away|deceased|loved one|died|death|haunt|ghost|spirit(s)? in|talk to (the )?dead|heaven|signs from)\b/],
  ['love_relationships', /\b(love me|loves me|love him|love her|come back|cheat|miss me|crush|boyfriend|girlfriend|husband|wife|ex\b|breakup|break up|relationship|marriage|marry|ghost(ed)?|commit|dating|soul mate|attracted|he (think|feel|want|like|care)|she (think|feel|want|like|care)|limerence|situationship|no contact)\b/],
  ['money_career', /\b(money|wealth|rich|job|career|promotion|business|salary|abundance|prosper|financ|success|purpose|life path|destiny|future hold)\b/],
];

function classify(s) {
  for (const [name, re] of CLUSTERS) {
    if (re.test(s)) return name;
  }
  return 'unclassified';
}

/* ---------------- intent-type tag ---------------- */

function intentType(s) {
  if (/\b(quiz|test|calculator)\b/.test(s)) return 'interactive_tool';
  if (/^(does|do|is|are|am i|will|would|should|can|could|has|have|did|was|were)\b/.test(s)) return 'yes_no_question';
  if (/^(what|why|how|when|where|who|which)\b/.test(s)) return 'open_question';
  if (/\b(meaning|mean)\b/.test(s)) return 'meaning_lookup';
  if (/\bsigns?\b/.test(s)) return 'signs_list';
  if (/^(how to|how do i|how can i)\b/.test(s)) return 'how_to';
  return 'topic';
}

/* ---------------- load + aggregate ---------------- */

const rows = [];
for (const region of ['us', 'gb']) {
  const f = path.join(RAW, `suggest-${region}.json`);
  if (!fs.existsSync(f)) continue;
  for (const r of JSON.parse(fs.readFileSync(f, 'utf8'))) rows.push(r);
}

const agg = new Map();

for (const r of rows) {
  const seed = r.seed.toLowerCase();
  r.suggestions.forEach((raw, rank) => {
    const s = String(raw).trim().toLowerCase();
    if (!s) return;
    let a = agg.get(s);
    if (!a) {
      a = {
        phrase: s,
        seeds: new Set(),
        queries: new Set(),
        regions: new Set(),
        kinds: new Set(),
        topRankHits: 0,
        rankSum: 0,
        rankN: 0,
        minRank: 99,
        exact: false,
      };
      agg.set(s, a);
    }
    a.seeds.add(seed);
    a.queries.add(r.query.toLowerCase());
    a.regions.add(r.region);
    a.kinds.add(r.kind);
    if (rank <= 2) a.topRankHits++;
    if (rank === 0 && r.query.toLowerCase() === s) a.exact = true;
    a.rankSum += rank;
    a.rankN++;
    if (rank < a.minRank) a.minRank = rank;
  });
}

const out = [];
for (const a of agg.values()) {
  if (isNoise(a.phrase)) continue;
  const breadth = a.seeds.size;
  const depth = a.queries.size;
  const geo = a.regions.size === 2 ? 1 : 0;
  const avgRank = a.rankSum / Math.max(a.rankN, 1);

  const score =
    breadth * 10 +
    depth * 1.5 +
    a.topRankHits * 2 +
    geo * 8 +
    (a.exact ? 6 : 0) +
    Math.max(0, 6 - avgRank);

  out.push({
    phrase: a.phrase,
    cluster: classify(a.phrase),
    intentType: intentType(a.phrase),
    score: Math.round(score * 10) / 10,
    breadth,
    depth,
    geo,
    topRankHits: a.topRankHits,
    minRank: a.minRank,
    avgRank: Math.round(avgRank * 100) / 100,
    exact: a.exact,
    regions: [...a.regions].sort().join('+'),
    kinds: [...a.kinds].sort().join(','),
    seeds: [...a.seeds].slice(0, 12),
  });
}

out.sort((x, y) => y.score - x.score);

fs.writeFileSync(
  path.join(DIR, 'candidates.json'),
  JSON.stringify({ generated: new Date().toISOString(), total: out.length, candidates: out }, null, 1),
  'utf8'
);

/* ---------------- console summary ---------------- */

console.log('raw rows:', rows.length);
console.log('distinct phrases:', agg.size);
console.log('after noise filter:', out.length);
console.log('\nby cluster (top 400 candidates):');
const tally = {};
for (const c of out.slice(0, 400)) tally[c.cluster] = (tally[c.cluster] || 0) + 1;
for (const [k, v] of Object.entries(tally).sort((a, b) => b[1] - a[1])) {
  console.log(String(v).padStart(4), k);
}
console.log('\ntop 60 overall:');
for (const c of out.slice(0, 60)) {
  console.log(
    String(c.score).padStart(6),
    String(c.breadth).padStart(3),
    String(c.depth).padStart(4),
    c.cluster.padEnd(20),
    c.phrase
  );
}
