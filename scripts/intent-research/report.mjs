/** report.mjs — per-cluster top lists + probe for known-hot intents. */
import fs from 'node:fs';
const DIR = 'C:/Users/samja/Desktop/site/mysticdo/scripts/intent-research';
const { pool } = JSON.parse(fs.readFileSync(DIR + '/library.json', 'utf8'));

const byCluster = {};
for (const r of pool) (byCluster[r.cluster] ||= []).push(r);

const order = ['love_relationships','twin_flame_soulmate','tarot','astrology','psychic_abilities','dreams','angel_numbers','manifestation','spiritual_awakening','signs_synchronicity','protection_energy','crystals_rituals','chakras_energy','past_lives_karma','grief_afterlife','money_career','family_children','unclassified'];

for (const c of order) {
  const list = byCluster[c] || [];
  console.log(`\n########## ${c} (pool n=${list.length}) ##########`);
  for (const r of list.slice(0, 34)) {
    console.log(String(r.score).padStart(6), r.origin === 'seed' ? 'S' : 'D', String(r.nVariants).padStart(4), r.phrase);
  }
}

console.log('\n########## PROBES ##########');
const probes = ['3am','3 am','limerence','karmic','regret','soul purpose','get married','situationship','spiritual meaning of','chakra test','twin flame separation','no contact','move on','third eye','north node','big three','rising sign','angel number 1','specific person','spiritual awakening','shadow work','twin flame','past life','future husband','future wife','psychic test','what is my purpose','am i a medium','signs he'];
for (const p of probes) {
  const hits = pool.filter((r) => r.phrase.includes(p)).slice(0, 6);
  console.log(`\n-- "${p}" (${pool.filter((r) => r.phrase.includes(p)).length} hits)`);
  for (const h of hits) console.log('   ', String(h.score).padStart(6), h.cluster.padEnd(20), h.phrase);
}
