/* Consolidated smoke test for all six love-relationship quizzes.
 * For each slug: resolve() / matchPractice() / underneath() / customResult()
 * across every signal-question combo plus intent sweeps. Catches
 * undefined-result keys, missing practice notes, render crashes,
 * and unreachable patterns. Run: node scripts/test-love-quizzes.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src = readFileSync(path.join(root, 'assets/js/quizzes.js'), 'utf8');

globalThis.window = {};
eval(src);

const SLUGS = [
  'does-he-love-me',
  'does-he-think-about-me',
  'does-my-crush-like-me-back',
  'is-he-the-one',
  'does-he-miss-me',
  'is-he-serious-about-me'
];

/* Per-quiz underneath scenario expectations.
 * Each: { name, a (answers), expect (key string or null) } */
const BENEATH = {
  'does-he-love-me': [
    { name: 'exes + distant → closure', a: { status:'exes', trigger:'distant', communication:'barely', effort:'me', space:'worse', alignment:'contradict', want:'still', help:'insight' }, expect: 'closure' },
    { name: 'complicated + mixed → cycle', a: { status:'complicated', trigger:'inconsistent', communication:'hotcold', effort:'me', space:'nothing', alignment:'notvery', want:'feelings', help:'insight' }, expect: 'cycle' },
    { name: 'want=wait → decision', a: { status:'together', trigger:'clarity', communication:'consistent', effort:'equal', space:'stays', alignment:'very', want:'wait', help:'guidance' }, expect: 'decision' },
    { name: 'trigger=unknown + positive → reassurance', a: { status:'together', trigger:'unknown', communication:'consistent', effort:'equal', space:'stays', alignment:'very', want:'feelings', help:'insight' }, expect: 'reassurance' },
    { name: 'want=beneath → meaning', a: { status:'talking', trigger:'changed', communication:'frequent', effort:'equal', space:'stays', alignment:'usually', want:'beneath', help:'deeper' }, expect: 'meaning' },
    { name: 'no underneath (clean case)', a: { status:'dating', trigger:'inconsistent', communication:'reactive', effort:'me', space:'returns', alignment:'sometimes', want:'going', help:'heading' }, expect: null }
  ],
  'does-he-think-about-me': [
    { name: 'exes + distant → closure', a: { status:'exes', trigger:'distant', communication:'barely', effort:'me', space:'worse', alignment:'contradict', want:'still', help:'insight' }, expect: 'closure' },
    { name: 'want=wait → reach-out', a: { status:'together', trigger:'clarity', communication:'consistent', effort:'equal', space:'stays', alignment:'very', want:'wait', help:'guidance' }, expect: 'reach-out' },
    { name: 'trigger=unknown + positive → reassurance', a: { status:'together', trigger:'unknown', communication:'consistent', effort:'equal', space:'stays', alignment:'very', want:'feelings', help:'insight' }, expect: 'reassurance' },
    { name: 'want=beneath → preoccupation', a: { status:'talking', trigger:'changed', communication:'frequent', effort:'equal', space:'stays', alignment:'usually', want:'beneath', help:'deeper' }, expect: 'preoccupation' },
    { name: 'one-sided pattern → reciprocity', a: { status:'dating', trigger:'inconsistent', communication:'reactive', effort:'me', space:'returns', alignment:'sometimes', want:'feelings', help:'insight' }, expect: 'reciprocity' },
    { name: 'no underneath (clean case)', a: { status:'dating', trigger:'clarity', communication:'consistent', effort:'equal', space:'stays', alignment:'very', want:'feelings', help:'insight' }, expect: null }
  ],
  'does-my-crush-like-me-back': [
    { name: 'exes + distant → closure', a: { status:'exes', trigger:'distant', communication:'barely', effort:'me', space:'worse', alignment:'contradict', want:'still', help:'insight' }, expect: 'closure' },
    { name: 'want=wait → safety', a: { status:'talking', trigger:'clarity', communication:'consistent', effort:'equal', space:'stays', alignment:'very', want:'wait', help:'guidance' }, expect: 'safety' },
    { name: 'trigger=unknown + positive → projection', a: { status:'talking', trigger:'unknown', communication:'consistent', effort:'equal', space:'stays', alignment:'very', want:'feelings', help:'insight' }, expect: 'projection' },
    { name: 'want=beneath → pattern', a: { status:'talking', trigger:'changed', communication:'frequent', effort:'equal', space:'stays', alignment:'usually', want:'beneath', help:'deeper' }, expect: 'pattern' },
    { name: 'help=guidance + mid pattern → confession', a: { status:'dating', trigger:'inconsistent', communication:'hotcold', effort:'variable', space:'nothing', alignment:'sometimes', want:'feelings', help:'guidance' }, expect: 'confession' },
    { name: 'no underneath (clean case)', a: { status:'dating', trigger:'clarity', communication:'consistent', effort:'equal', space:'stays', alignment:'very', want:'feelings', help:'insight' }, expect: null }
  ],
  'is-he-the-one': [
    { name: 'exes + distant → closure', a: { status:'exes', trigger:'distant', communication:'barely', effort:'me', space:'worse', alignment:'contradict', want:'still', help:'insight' }, expect: 'closure' },
    { name: 'want=wait → decision', a: { status:'together', trigger:'clarity', communication:'consistent', effort:'equal', space:'stays', alignment:'very', want:'wait', help:'guidance' }, expect: 'decision' },
    { name: 'trigger=unknown + positive → doubt', a: { status:'together', trigger:'unknown', communication:'consistent', effort:'equal', space:'stays', alignment:'very', want:'feelings', help:'insight' }, expect: 'doubt' },
    { name: 'want=beneath → identity', a: { status:'talking', trigger:'changed', communication:'frequent', effort:'equal', space:'stays', alignment:'usually', want:'beneath', help:'deeper' }, expect: 'identity' },
    { name: 'want=why + mid pattern → comparison', a: { status:'dating', trigger:'inconsistent', communication:'hotcold', effort:'variable', space:'nothing', alignment:'sometimes', want:'why', help:'insight' }, expect: 'comparison' },
    { name: 'no underneath (clean case)', a: { status:'dating', trigger:'clarity', communication:'consistent', effort:'equal', space:'stays', alignment:'very', want:'feelings', help:'insight' }, expect: null }
  ],
  'does-he-miss-me': [
    { name: 'exes + distant → closure', a: { status:'exes', trigger:'distant', communication:'barely', effort:'me', space:'worse', alignment:'contradict', want:'still', help:'insight' }, expect: 'closure' },
    { name: 'want=wait → reach-out', a: { status:'together', trigger:'clarity', communication:'consistent', effort:'equal', space:'stays', alignment:'very', want:'wait', help:'guidance' }, expect: 'reach-out' },
    { name: 'trigger=unknown + positive → anxiety', a: { status:'together', trigger:'unknown', communication:'consistent', effort:'equal', space:'stays', alignment:'very', want:'feelings', help:'insight' }, expect: 'anxiety' },
    { name: 'want=beneath → preoccupation', a: { status:'talking', trigger:'changed', communication:'frequent', effort:'equal', space:'stays', alignment:'usually', want:'beneath', help:'deeper' }, expect: 'preoccupation' },
    { name: 'suppressed pattern → distance', a: { status:'dating', trigger:'inconsistent', communication:'quieter', effort:'me', space:'worse', alignment:'notvery', want:'feelings', help:'insight' }, expect: 'distance' },
    { name: 'no underneath (clean case)', a: { status:'dating', trigger:'clarity', communication:'consistent', effort:'equal', space:'stays', alignment:'very', want:'feelings', help:'insight' }, expect: null }
  ],
  'is-he-serious-about-me': [
    { name: 'exes + distant → closure', a: { status:'exes', trigger:'distant', communication:'barely', effort:'me', space:'worse', alignment:'contradict', want:'still', help:'insight' }, expect: 'closure' },
    { name: 'want=wait → commit', a: { status:'together', trigger:'clarity', communication:'consistent', effort:'equal', space:'stays', alignment:'very', want:'wait', help:'guidance' }, expect: 'commit' },
    { name: 'trigger=unknown + positive → self-worth', a: { status:'together', trigger:'unknown', communication:'consistent', effort:'equal', space:'stays', alignment:'very', want:'feelings', help:'insight' }, expect: 'self-worth' },
    { name: 'want=beneath → comfort-vs-intention', a: { status:'talking', trigger:'changed', communication:'frequent', effort:'equal', space:'stays', alignment:'usually', want:'beneath', help:'deeper' }, expect: 'comfort-vs-intention' },
    { name: 'want=why + mid pattern → timeline', a: { status:'dating', trigger:'stalled', communication:'frequent', effort:'rarely', space:'nothing', alignment:'sometimes', want:'why', help:'insight' }, expect: 'timeline' },
    { name: 'no underneath (clean case)', a: { status:'dating', trigger:'clarity', communication:'consistent', effort:'equal', space:'stays', alignment:'very', want:'feelings', help:'insight' }, expect: null }
  ]
};

/* Result-engine v2 (QUIZ_RESULT_ENGINE.md §2): per-quiz aha-matching
 * scenarios. Each: { name, a (answers), expect (aha key) } — one case
 * per rule branch, so every branch is proven reachable. */
const AHA_SCENARIOS = {
  'does-he-love-me': [
    { name: 'want=wait → choice_friction', a: { status:'together', trigger:'clarity', communication:'consistent', effort:'equal', space:'stays', alignment:'very', want:'wait', help:'guidance' }, expect: 'choice_friction' },
    { name: 'exes + fresh ending → sudden_loss', a: { status:'exes', trigger:'distant', communication:'barely', effort:'me', space:'worse', alignment:'contradict', want:'still', help:'insight' }, expect: 'sudden_loss' },
    { name: 'one-sided (uneven) → boundary_invasion', a: { status:'dating', trigger:'inconsistent', communication:'reactive', effort:'me', space:'returns', alignment:'sometimes', want:'going', help:'heading' }, expect: 'boundary_invasion' },
    { name: 'complicated + mixed → toxic_loop', a: { status:'complicated', trigger:'inconsistent', communication:'hotcold', effort:'variable', space:'nothing', alignment:'sometimes', want:'feelings', help:'insight' }, expect: 'toxic_loop' },
    { name: 'not-enough-evidence → illusion_fixation', a: { status:'talking', trigger:'clarity', communication:'frequent', effort:'hard', space:'notell', alignment:'dontknow', want:'feelings', help:'insight' }, expect: 'illusion_fixation' },
    { name: 'unknown + steady → scarcity_panic', a: { status:'together', trigger:'unknown', communication:'consistent', effort:'equal', space:'stays', alignment:'very', want:'feelings', help:'insight' }, expect: 'scarcity_panic' },
    { name: 'want=beneath + data present → illusion_fixation', a: { status:'dating', trigger:'changed', communication:'frequent', effort:'equal', space:'stays', alignment:'usually', want:'beneath', help:'deeper' }, expect: 'illusion_fixation' },
    { name: 'default → scarcity_panic', a: { status:'dating', trigger:'distant', communication:'frequent', effort:'equal', space:'stays', alignment:'usually', want:'feelings', help:'insight' }, expect: 'scarcity_panic' }
  ]
};

/* v2 quizzes render the new layers; v1 quizzes keep the classic blocks. */
const V2_SLUGS = new Set(SLUGS);

let totalFail = 0;
let totalChecks = 0;

function ok(cond, msg) {
  totalChecks++;
  if (!cond) { totalFail++; console.error('  FAIL:', msg); return false; }
  return true;
}

function renderOnce(QZ, a) {
  let html = '';
  const stubBody = { innerHTML: '', querySelector: () => null };
  const ctx = {
    answers: a,
    body: stubBody,
    emailFormHTML: () => '<div class="email-form-stub"></div>',
    bindEmailForms: () => {},
    restart: () => {}
  };
  Object.defineProperty(stubBody, 'innerHTML', { get: () => html, set: v => { html = v; }, configurable: true });
  QZ.customResult(ctx);
  return html;
}

for (const slug of SLUGS) {
  const QZ = window.MYSTICDO_QUIZZES[slug];
  if (!QZ) { console.error(`\n${slug}: quiz not registered — ABORT`); totalFail++; continue; }

  console.log(`\n=== ${slug} ===`);
  let fails = 0;
  const _ok = (c, m) => { if (!ok(c, m)) fails++; };

  const RESULT_KEYS = Object.keys(QZ.results);
  _ok(RESULT_KEYS.length === 5, `exactly 5 pattern results — got ${RESULT_KEYS.length}`);

  const PRACTICE_KEYS = Object.keys(QZ.practice);
  _ok(PRACTICE_KEYS.length === 7, `exactly 7 practice outcomes — got ${PRACTICE_KEYS.length}`);

  const optValues = qid => QZ.questions.find(q => q.id === qid).options.map(o => o.score);
  const comms = optValues('communication');
  const eff   = optValues('effort');
  const space = optValues('space');
  const align = optValues('alignment');
  const wants = optValues('want');
  const helps = optValues('help');

  // Walk all signal combos
  const seenPattern = new Set();
  let comboCount = 0;
  const base = { status: 'dating', trigger: 'inconsistent', want: 'feelings', help: 'insight' };
  for (const c of comms) for (const e of eff) for (const s of space) for (const al of align) {
    const a = { ...base, communication: c, effort: e, space: s, alignment: al };
    const k = QZ.resolve(a);
    _ok(RESULT_KEYS.includes(k), `resolve valid for ${c}/${e}/${s}/${al} -> ${k}`);
    seenPattern.add(k);
    comboCount++;
  }
  console.log(`  walked ${comboCount} signal combos; ${seenPattern.size} distinct patterns`);
  _ok(seenPattern.size === 5, 'all 5 patterns reachable');

  // Walk intent combos
  const seenPractice = new Set();
  for (const w of wants) for (const h of helps) {
    const a = { ...base, want: w, help: h };
    const k = QZ.matchPractice(a);
    _ok(PRACTICE_KEYS.includes(k), `matchPractice valid for want=${w}/help=${h} -> ${k}`);
    seenPractice.add(k);
  }
  console.log(`  walked ${wants.length*helps.length} intent combos; ${seenPractice.size} distinct practices`);
  _ok(seenPractice.size >= 6, 'at least 6 of 7 practices reachable');

  // Underneath scenarios
  for (const sc of (BENEATH[slug] || [])) {
    const u = QZ.underneath(sc.a, QZ.resolve(sc.a));
    const got = u ? u.key : null;
    _ok(got === sc.expect, `${sc.name} -> ${sc.expect} (got ${got})`);
  }

  // Aha matching (v2): validity + determinism across the full walk,
  // then one scenario per rule branch.
  if (typeof QZ.matchAha === 'function') {
    const AHA_KEYS = Object.keys(window.MYSTICDO_AHA || {});
    _ok(AHA_KEYS.length === 8, `MYSTICDO_AHA has 8 patterns — got ${AHA_KEYS.length}`);
    let ahaBad = 0;
    for (const c of comms) for (const e of eff) for (const s of space) for (const al of align) {
      for (const w of wants) {
        const a = { ...base, communication: c, effort: e, space: s, alignment: al, want: w };
        const k1 = QZ.matchAha(a, QZ.resolve(a));
        const k2 = QZ.matchAha(a, QZ.resolve(a));
        if (!AHA_KEYS.includes(k1) || k1 !== k2) {
          ahaBad++;
          if (ahaBad <= 3) _ok(false, `matchAha invalid/non-deterministic for ${c}/${e}/${s}/${al}/${w} -> ${k1}/${k2}`);
        }
      }
    }
    _ok(ahaBad === 0, `matchAha valid + deterministic across ${comboCount * wants.length} combos`);
    for (const sc of (AHA_SCENARIOS[slug] || [])) {
      const got = QZ.matchAha(sc.a, QZ.resolve(sc.a));
      _ok(got === sc.expect, `${sc.name} -> ${sc.expect} (got ${got})`);
    }
  }

  // v2 personalized CTA copy: want × practice resolves to the
  // intent-matched text, not a generic "Book Now" (§3.2).
  if (V2_SLUGS.has(slug)) {
    const ctaCases = [
      { a: { ...base, want: 'feelings', help: 'insight' }, text: 'Get personal insight into his feelings' },
      { a: { ...base, want: 'why', help: 'insight' }, text: 'Get insight into what changed' },
      { a: { ...base, want: 'wait', help: 'guidance' }, text: 'Get guidance on your next step' },
      { a: { ...base, status: 'exes', want: 'still', help: 'insight' }, text: 'Get a reading focused on closure' },
      { a: { ...base, want: 'going', help: 'heading' }, text: 'Get a reading on where this is heading' },
      { a: { ...base, want: 'beneath', help: 'deeper' }, text: 'Get a deeper read on the connection' }
    ];
    for (const c of ctaCases) {
      const html = renderOnce(QZ, c.a);
      _ok(html.includes(c.text), `v2 CTA text for want=${c.a.want} -> "${c.text}"`);
    }
  }

  // Render crash sweep
  let renderCrashes = 0;
  for (const w of wants) for (const h of helps) for (const al of align) {
    const a = { status:'talking', trigger:'distant', communication:'reactive', effort:'me', space:'returns', alignment:al, want:w, help:h };
    try {
      const html = renderOnce(QZ, a);
      if (V2_SLUGS.has(slug)) {
        _ok(html.includes('love-result')
          && html.includes('What your answers suggest')
          && html.includes('love-aha')
          && html.includes('The honest edge of this pattern')
          && html.includes('What it can tell you')
          && html.includes('What to look at next')
          && html.includes('Your best-fit next step')
          && html.includes('btn-gold')
          && html.includes('data-offer-key')
          && html.includes('quiz-result-fineprint')
          && html.includes('data-love-retake')
          && !html.includes('love-email-kicker')
          && !html.includes('email-form'),
          `v2 render has all layers for want=${w}/help=${h}/align=${al}`);
      } else {
        _ok(html.includes('love-result') && html.includes('What your answers suggest') && html.includes('What they don') && html.includes('What to look at next'), `render has 3 blocks for want=${w}/help=${h}/align=${al}`);
      }
    } catch (e) {
      renderCrashes++; _ok(false, `RENDER CRASH for ${w}/${h}/${al}: ${e.message}`);
    }
  }
  _ok(renderCrashes === 0, 'customResult never throws across intent x alignment sweep');

  console.log(`  ${fails === 0 ? 'ALL GREEN' : fails + ' FAILURE(S)'}`);
}

/* ---- Aha library data integrity (QUIZ_RESULT_ENGINE.md §5) ---- */
{
  const AHA = window.MYSTICDO_AHA || {};
  const keys = Object.keys(AHA);
  ok(keys.length === 8, `aha library: exactly 8 patterns — got ${keys.length}`);
  for (const k of keys) {
    const p = AHA[k];
    ok(p && typeof p.name === 'string' && typeof p.heading === 'string'
      && typeof p.explanation === 'string' && p.explanation.length > 120
      && p.practice && typeof p.practice.name === 'string'
      && typeof p.practice.text === 'string' && typeof p.practice.mechanism === 'string',
      `aha pattern "${k}" has name/heading/explanation/practice{name,text,mechanism}`);
  }
}

console.log(`\n${totalFail === 0 ? 'ALL QUIZZES GREEN' : totalFail + ' TOTAL FAILURE(S)'} (${totalChecks} checks across ${SLUGS.length} quizzes)`);
process.exit(totalFail === 0 ? 0 : 1);
