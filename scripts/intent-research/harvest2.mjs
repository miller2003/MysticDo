/**
 * harvest2.mjs — targeted top-up round.
 * Fills gaps left by round 1: twin-flame stages/separation, 3am waking, chakra
 * testing, future-spouse questions, obsession/limerence, ex-return, ascension
 * stages, aura colour, moon-sign specifics, and "spiritual meaning of" templates.
 * Writes raw/suggest2-<region>.json (same shape as round 1, so analyze/score reuse it).
 */

import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = 'C:/Users/samja/Desktop/site/mysticdo/scripts/intent-research/raw';

const SEEDS = {
  twin_flame_soulmate: [
    'twin flame separation', 'twin flame reunion signs', 'twin flame stages',
    'twin flame runner and chaser', 'signs he is my twin flame', 'divine timing',
    'how to know if someone is your soulmate', 'soulmate vs life partner',
    'am i going to be alone forever', 'will i ever get married',
    'what does my future husband look like', 'what will my future wife be like',
    'how to know who your soulmate is', 'karmic relationship signs',
  ],
  love_relationships: [
    'why cant i stop thinking about him', 'how to get over someone',
    'how to get him back', 'signs your ex is coming back',
    'does he miss me during no contact', 'how to stop obsessing over someone',
    'limerence', 'am i obsessed with him', 'why do i still love him',
    'is he using me', 'is he playing games with me', 'does he love me or just want me',
    'he pulled away what do i do', 'why did he stop texting me',
  ],
  dreams: [
    'spiritual meaning of dreams', 'dream about my ex', 'dream about someone dying',
    'dream about being pregnant', 'dream about water', 'dream about teeth falling out',
    'dream about a deceased loved one', 'dream about snakes', 'dream about spiders',
    'dream about being chased', 'what do dreams mean spiritually',
    'recurring dream meaning', 'can dreams predict the future',
  ],
  spiritual_awakening: [
    'spiritual awakening stages', 'ascension symptoms', 'waking up at 3am spiritual meaning',
    'why do i wake up at 3am', 'spiritual awakening signs and symptoms',
    'how to know if you are spiritually awakened', 'spiritual bypassing',
    'what is my aura color', 'how to find my spirit animal',
    'what is a lightworker', 'am i a starseed', 'what is my soul mission',
    'why do i feel disconnected from reality', 'spiritual awakening and anxiety',
  ],
  chakras_energy: [
    'chakra test', 'which chakra is blocked', 'chakra quiz',
    'signs of blocked chakras', 'how to heal your chakras', 'what is aura cleansing',
    'what does an unbalanced chakra feel like', 'throat chakra blocked signs',
    'third eye chakra opening symptoms', 'how to balance your chakras daily',
  ],
  manifestation: [
    'how to manifest love', 'how to manifest your ex back', 'law of assumption',
    '5x55 method', 'whisper method manifestation', 'manifestation journal how to',
    'why manifestation is not working', 'how to detach manifestation',
    'what are the signs your manifestation is coming', 'how to manifest while sleeping',
    'what is the void state', 'how to do the 369 method',
  ],
  angel_numbers: [
    'what does 111 mean', 'what does 000 mean', 'what does 2222 mean',
    'what does 711 mean', 'what does 616 mean', 'what does 1111 mean in love',
    'what does 444 mean in love', 'what does 222 mean in love',
    'angel number 1111 twin flame', 'why do i keep seeing 222',
    'what does 333 mean in love', 'what is my personal angel number',
  ],
  astrology: [
    'what does my moon sign mean', 'what does my rising sign mean',
    'mercury retrograde 2026', 'what is a twin flame in astrology',
    'what is my dominant sign', 'what does my venus sign mean',
    'what is my seventh house', 'sun moon rising quiz', 'what is my zodiac element',
    'how to find my birth chart', 'what is a retrograde planet',
  ],
  psychic_abilities: [
    'signs you are a medium', 'am i a medium', 'how to know if you are psychic',
    'how to develop intuition', 'what is my intuition telling me',
    'signs of an empath', 'how to protect your energy', 'what is my clair gift',
    'how to read auras', 'signs of a healer',
  ],
  protection_energy: [
    'how to cleanse your home', 'how to protect your energy',
    'signs someone is sending you negative energy', 'how to remove a curse',
    'how to cleanse your space', 'signs of a psychic attack',
    'how to smudge your house', 'what does the evil eye mean in love',
  ],
  crystals_rituals: [
    'crystals for manifesting money', 'crystals for love and attraction',
    'how to use crystals', 'full moon manifestation ritual',
    'what to do on the new moon', 'moon ritual for beginners',
    'how to cleanse a crystal', 'what is the best crystal for me',
  ],
  tarot: [
    'what does the hermit card mean', 'what does the hanged man mean',
    'what does the high priestess mean', 'what does the magician card mean',
    'what does the judgement card mean', 'what does the wheel of fortune mean',
    'tarot card meanings', 'how to ask tarot questions',
    'what does the ace of cups mean', 'what does the ten of swords mean',
  ],
  grief_afterlife: [
    'does my deceased loved one see me', 'how to know if a medium is real',
    'what happens to your soul after death', 'how to connect with a passed loved one',
    'signs your loved one is still with you', 'can spirits hear us',
    'what is it like in the afterlife', 'signs your grandma is watching over you',
  ],
  money_career: [
    'will i be financially stable', 'how to manifest a job',
    'is this the right career for me', 'what is my life path',
    'will i ever be successful', 'how to find your calling',
    'should i start a business', 'what is blocking my money',
  ],
  signs_synchronicity: [
    'what does it mean when you see a rabbit', 'what does it mean when you see a turtle',
    'what does it mean when you see an owl', 'what does it mean when you see a ladybug',
    'spiritual meaning of seeing a cardinal', 'what does it mean when you see a moth',
    'what does it mean when you see a butterfly',
  ],
};

const ALPHA_SEEDS = [
  'twin flame separation', 'how to manifest love', 'chakra test',
  'waking up at 3am spiritual meaning', 'how to get over someone',
  'what does 111 mean', 'signs you are a medium', 'spiritual meaning of dreams',
];

const MODIFIERS = ['meaning', 'quiz', 'reddit', 'signs', 'spiritual', 'vs', 'in love', 'at night'];

const REGIONS = [
  { code: 'us', hl: 'en', gl: 'us' },
  { code: 'gb', hl: 'en', gl: 'gb' },
];

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function suggest(q, region, attempt = 0) {
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=${region.hl}&gl=${region.gl}&q=${encodeURIComponent(q)}`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    return Array.isArray(data?.[1]) ? data[1] : [];
  } catch {
    if (attempt < 3) { await sleep(600 * (attempt + 1)); return suggest(q, region, attempt + 1); }
    return [];
  }
}

async function pool(tasks, concurrency, worker) {
  const out = [];
  let i = 0;
  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (i < tasks.length) { const idx = i++; out[idx] = await worker(tasks[idx]); await sleep(90); }
  }));
  return out;
}

function buildPlan() {
  const plan = [];
  for (const [cluster, seeds] of Object.entries(SEEDS)) {
    for (const s of seeds) plan.push({ cluster, seed: s, query: s, kind: 'plain' });
  }
  const alphaSet = new Set(ALPHA_SEEDS);
  for (const [cluster, seeds] of Object.entries(SEEDS)) {
    for (const s of seeds) {
      if (!alphaSet.has(s)) continue;
      for (const l of 'abcdefghijklmnopqrstuvwxyz') plan.push({ cluster, seed: s, query: s + ' ' + l, kind: 'alpha' });
    }
  }
  for (const [cluster, seeds] of Object.entries(SEEDS)) {
    for (const s of seeds) for (const m of MODIFIERS) plan.push({ cluster, seed: s, query: s + ' ' + m, kind: 'modifier' });
  }
  return plan;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const plan = buildPlan();
  console.log('round-2 queries per region:', plan.length);
  for (const region of REGIONS) {
    const rows = await pool(plan, 6, async (p) => ({ ...p, region: region.code, suggestions: await suggest(p.query, region) }));
    console.log(`region ${region.code}: ${rows.filter((r) => r.suggestions.length).length}/${rows.length} non-empty`);
    fs.writeFileSync(path.join(OUT_DIR, `suggest2-${region.code}.json`), JSON.stringify(rows, null, 1), 'utf8');
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
