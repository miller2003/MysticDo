/**
 * harvest.mjs — Real search-demand signal harvesting for the MysticDo intent library.
 *
 * Method: "alphabet soup" expansion against Google's public Suggest endpoint.
 * Suggest returns completions ordered by query popularity, so BOTH presence and
 * rank position are genuine demand signals (not invented keywords).
 *
 * Endpoint: https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=<region>&q=<q>
 * Output:   scripts/intent-research/raw/suggest-<region>.json  (raw, auditable)
 *
 * Run:  node scripts/intent-research/harvest.mjs
 */

import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = 'C:/Users/samja/Desktop/site/mysticdo/scripts/intent-research/raw';

/* ------------------------------------------------------------------ *
 * 1. Seed bank — organised by the clusters MysticDo actually targets.
 *    These are SEEDS, not the deliverable. The deliverable is whatever
 *    Google actually completes them to.
 * ------------------------------------------------------------------ */

const SEEDS = {
  love_relationships: [
    'does he love me', 'does she love me', 'does he still love me', 'does he miss me',
    'does he like me', 'does my crush like me', 'will he come back', 'will she come back',
    'is he cheating', 'is she cheating', 'is he the one', 'is he serious about me',
    'is he thinking about me', 'why is he distant', 'why did he ghost me',
    'should i text him', 'should i break up', 'is my relationship toxic',
    'why do i keep thinking about him', 'why wont he commit', 'will i ever find love',
    'am i meant to be alone', 'signs he loves you', 'how to tell if he loves you',
    'does he want a relationship with me', 'is my ex coming back',
    'twin flame vs soulmate', 'who is my soulmate', 'when will i meet my soulmate',
    'am i in love', 'is he my twin flame', 'what does it mean when he',
    'does he regret losing me', 'is he dating someone else', 'does he think about me',
  ],

  psychic_intuition: [
    'am i psychic', 'am i clairvoyant', 'am i an empath', 'am i an intuitive',
    'signs you are psychic', 'how to open third eye', 'how to develop psychic abilities',
    'how to know if im an empath', 'what is my psychic ability', 'how to strengthen intuition',
    'is my intuition telling me something', 'how to trust your intuition',
    'what is clairsentience', 'what is clairaudience', 'am i a healer',
    'how to do a psychic reading', 'is being psychic real',
  ],

  tarot: [
    'how to read tarot', 'how to do a tarot reading', 'what does the death card mean',
    'what does the tower card mean', 'what does the lovers card mean',
    'is tarot accurate', 'is tarot real', 'can tarot predict the future',
    'how to cleanse tarot cards', 'tarot yes or no', 'does he love me tarot',
    'what does the moon card mean', 'how to shuffle tarot cards',
    'what is my tarot birth card', 'how to read tarot for beginners',
    'best tarot deck for beginners', 'what does the star card mean',
  ],

  astrology: [
    'what is my rising sign', 'what is my moon sign', 'what is my sun sign',
    'what is my big three', 'how to read my birth chart', 'what does my birth chart mean',
    'what does mercury retrograde mean', 'mercury retrograde meaning',
    'zodiac compatibility', 'what sign is compatible with me', 'who should i date zodiac',
    'what is my venus sign', 'what is my north node', 'what is my saturn return',
    'when is my saturn return', 'what is a stellium', 'is astrology real',
    'what is my rising sign quiz', 'what does retrograde mean', 'what is a cusp sign',
    'what is my dominant planet', 'what is my chiron',
  ],

  numerology: [
    'what does 1111 mean', 'what does 222 mean', 'what does 333 mean', 'what does 444 mean',
    'what does 555 mean', 'what does 777 mean', 'what does 888 mean', 'what does 999 mean',
    'what does 1212 mean', 'what does 1010 mean', 'angel numbers meaning',
    'what is my life path number', 'how to calculate life path number',
    'why do i keep seeing 1111', 'what does 111 mean spiritually',
    'what does 1234 mean', 'what is my angel number',
  ],

  dreams: [
    'what does it mean when you dream about', 'why do i keep dreaming about',
    'what does it mean to dream about your ex', 'what does it mean to dream about someone',
    'what do dreams mean', 'dream about snakes meaning', 'dream about water meaning',
    'dream about falling teeth meaning', 'dream about being chased meaning',
    'dream about spiders meaning', 'dream about babies meaning', 'dream about death meaning',
    'what does it mean when you dream about someone dying',
    'lucid dreaming how to', 'are dreams messages', 'recurring dreams meaning',
    'what does it mean when you dream about someone you like',
  ],

  manifestation: [
    'how to manifest', 'how to manifest money', 'how to manifest someone',
    'does manifestation work', '369 method', 'law of attraction how to',
    'what is the law of assumption', 'scripting manifestation', 'manifestation signs',
    'how long does manifestation take', 'why is my manifestation not working',
    'what is shadow work', 'how to do shadow work', 'how to raise your vibration',
    'what is the 555 method', 'how to manifest a specific person',
  ],

  spiritual_awakening: [
    'am i spiritually awakening', 'signs of spiritual awakening', 'dark night of the soul',
    'what is a spiritual awakening', 'spiritual awakening symptoms',
    'how to become more spiritual', 'what is my spirit animal', 'how to find your spirit guide',
    'what is a kundalini awakening', 'signs of kundalini awakening',
    'what is my spiritual gift', 'what is the akashic records',
    'how to start a spiritual practice', 'what is a spiritual awakening like',
  ],

  signs_synchronicity: [
    'what does it mean when you see a', 'what are angel signs', 'why do i keep seeing',
    'what are synchronicities', 'why do i keep seeing repeating numbers',
    'what does it mean when you see a feather', 'butterfly meaning spiritual',
    'what does it mean when you see a cardinal', 'hummingbird meaning spiritual',
    'what is a sign from the universe', 'what does it mean when you see a deer',
    'what does it mean when you see a hawk',
  ],

  protection_energy: [
    'how to cleanse negative energy', 'how to protect yourself from negative energy',
    'am i cursed', 'how to break a curse', 'what is the evil eye',
    'how to get rid of negative energy', 'what is a hex', 'how to cleanse your aura',
    'signs of bad energy in house', 'what is grounding spiritually',
    'how to do a cleansing ritual', 'signs of negative energy around you',
  ],

  crystals_rituals: [
    'what crystal is for', 'crystals for protection', 'crystals for love',
    'how to cleanse crystals', 'full moon ritual', 'what to do on a full moon',
    'new moon ritual', 'what does the full moon mean', 'moon phases meaning',
    'how to use sage', 'how to do candle magic', 'what is a protection spell',
    'how to make a spell jar', 'what to do on a new moon', 'how to use a pendulum',
    'crystals for anxiety', 'how to charge crystals',
  ],

  chakras_energy: [
    'what are chakras', 'how to balance chakras', 'chakra healing how to',
    'what is a blocked chakra', 'how to unblock chakras', 'what is reiki',
    'what is an aura', 'how to see auras', 'what is the third eye chakra',
    'signs of a blocked heart chakra', 'what is energy healing',
  ],

  past_lives_karma: [
    'how to know my past life', 'past life regression', 'what is karma',
    'how to clear karma', 'what is a karmic relationship', 'karmic vs twin flame',
    'do we have past lives', 'past life signs', 'what is my past life quiz',
    'how to heal karmic ties', 'what is a soul contract',
  ],

  grief_mediumship: [
    'can mediums talk to the dead', 'signs from deceased loved ones',
    'how to contact a loved one who passed', 'do mediums work', 'are mediums real',
    'is my loved one watching over me', 'what happens after death spiritually',
    'how to talk to spirits', 'am i being haunted', 'signs of a spirit in your house',
    'what is a spirit guide', 'how to know if a medium is real',
  ],

  money_career_direction: [
    'will i get the job', 'is this job right for me', 'what is my life purpose',
    'what is my career path', 'how to manifest money fast', 'will i be rich',
    'should i quit my job', 'what does my future hold', 'will i be successful',
    'how to find my purpose', 'am i on the right path', 'what is my destiny',
    'when will i get married', 'who will i marry', 'will my relationship last',
    'what is my soul purpose', 'how to know my purpose',
  ],
};

/* ------------------------------------------------------------------ *
 * 2. Expansion strategy
 * ------------------------------------------------------------------ */

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

// Seeds deep enough to justify full alphabet expansion (the money clusters).
const DEEP_SEEDS = [
  'does he love me', 'does he still love me', 'does he miss me', 'will he come back',
  'does my crush like me', 'is he cheating', 'why is he distant', 'is he the one',
  'am i psychic', 'am i an empath', 'how to open third eye', 'how to read tarot',
  'what does the death card mean', 'is tarot accurate', 'what is my rising sign',
  'what does mercury retrograde mean', 'zodiac compatibility', 'how to read my birth chart',
  'what does 1111 mean', 'what does 222 mean', 'angel numbers meaning',
  'what is my life path number', 'what does it mean when you dream about',
  'why do i keep dreaming about', 'dream about snakes meaning', 'how to manifest',
  'how to manifest money', 'does manifestation work', 'what is shadow work',
  'signs of spiritual awakening', 'what is a spiritual awakening', 'am i spiritually awakening',
  'what is my spirit animal', 'why do i keep seeing', 'what does it mean when you see a',
  'how to cleanse negative energy', 'am i cursed', 'what is the evil eye',
  'full moon ritual', 'what crystal is for', 'what are chakras', 'how to unblock chakras',
  'how to know my past life', 'can mediums talk to the dead', 'signs from deceased loved ones',
  'what is my life purpose', 'what does my future hold', 'will i get the job',
  'what is my career path', 'how to find your spirit guide',
];

// Cross-cutting modifiers — these surface the *intent type* (quiz / meaning / reddit …).
const MODIFIERS = ['meaning', 'quiz', 'reddit', 'signs', 'how to', 'free'];

/* ------------------------------------------------------------------ *
 * 3. Fetch engine
 * ------------------------------------------------------------------ */

const REGIONS = [
  { code: 'us', hl: 'en', gl: 'us' },
  { code: 'gb', hl: 'en', gl: 'gb' },
];

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function suggest(q, region, attempt = 0) {
  const url =
    `https://suggestqueries.google.com/complete/search?client=firefox` +
    `&hl=${region.hl}&gl=${region.gl}&q=${encodeURIComponent(q)}`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    return Array.isArray(data?.[1]) ? data[1] : [];
  } catch (err) {
    if (attempt < 3) {
      await sleep(600 * (attempt + 1));
      return suggest(q, region, attempt + 1);
    }
    return [];
  }
}

async function pool(tasks, concurrency, worker) {
  const results = [];
  let i = 0;
  const runners = Array.from({ length: concurrency }, async () => {
    while (i < tasks.length) {
      const idx = i++;
      results[idx] = await worker(tasks[idx], idx);
      await sleep(90);
    }
  });
  await Promise.all(runners);
  return results;
}

/* ------------------------------------------------------------------ *
 * 4. Build the query plan
 * ------------------------------------------------------------------ */

function buildPlan() {
  const plan = [];
  for (const [cluster, seeds] of Object.entries(SEEDS)) {
    for (const s of seeds) {
      plan.push({ cluster, seed: s, query: s, kind: 'plain' });
    }
  }
  const deepSet = new Set(DEEP_SEEDS);
  for (const [cluster, seeds] of Object.entries(SEEDS)) {
    for (const s of seeds) {
      if (!deepSet.has(s)) continue;
      for (const l of ALPHABET) {
        plan.push({ cluster, seed: s, query: s + ' ' + l, kind: 'alpha' });
      }
    }
  }
  for (const [cluster, seeds] of Object.entries(SEEDS)) {
    for (const s of seeds) {
      for (const m of MODIFIERS) {
        plan.push({ cluster, seed: s, query: s + ' ' + m, kind: 'modifier' });
      }
    }
  }
  return plan;
}

/* ------------------------------------------------------------------ *
 * 5. Run
 * ------------------------------------------------------------------ */

async function runRegion(region, plan) {
  console.log(`\n=== region ${region.code}: ${plan.length} queries ===`);
  const rows = await pool(plan, 6, async (p) => {
    const suggestions = await suggest(p.query, region);
    return { ...p, region: region.code, suggestions };
  });
  const nonEmpty = rows.filter((r) => r.suggestions.length).length;
  console.log(`region ${region.code}: ${nonEmpty}/${rows.length} returned suggestions`);
  return rows;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const plan = buildPlan();
  console.log('total queries per region:', plan.length);

  for (const region of REGIONS) {
    const rows = await runRegion(region, plan);
    const file = path.join(OUT_DIR, `suggest-${region.code}.json`);
    fs.writeFileSync(file, JSON.stringify(rows, null, 1), 'utf8');
    console.log('wrote', file);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
