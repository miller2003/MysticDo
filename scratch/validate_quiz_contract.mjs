/* ============================================================
   Pre-launch quiz contract validator (2026-09-22)
   Validates every quiz object in assets/js/quizzes.js against
   the intent-page production contract:
     - 8 questions, unique ids, options have text+score
     - results <= 5 patterns incl. not-enough-evidence
     - resolve/matchPractice/matchAha return literals resolve
       to real keys in results / practice / MYSTICDO_AHA
     - every practice href/secondary/choose target exists on disk
     - launcher title = user-directed canonical; banned framings
     - no HTML entities inside quiz data strings
     - runtime walkthrough: resolve->result->underneath->match*
       across sampled + exhaustive-ish answer sets, 0 crashes
   ============================================================ */
import { readFileSync, existsSync } from 'node:fs';
import { resolve as presolve } from 'node:path';
import vm from 'node:vm';

const ROOT = presolve(import.meta.dirname, '..');
const src = readFileSync(presolve(ROOT, 'assets/js/quizzes.js'), 'utf8');

const sandbox = { window: {}, console };
sandbox.window = sandbox; // window.MYSTICDO_QUIZZES = window.MYSTICDO_QUIZZES || {} pattern safe
vm.createContext(sandbox);
vm.runInContext(src + '\n;globalThis.__Q = window.MYSTICDO_QUIZZES; globalThis.__AHA = window.MYSTICDO_AHA;', sandbox, { filename: 'quizzes.js' });

const Q = sandbox.__Q;
const AHA = sandbox.__AHA;
const slugs = Object.keys(Q);
const intent = slugs.filter(s => typeof Q[s].matchPractice === 'function');
const category = slugs.filter(s => typeof Q[s].matchPractice !== 'function');

const problems = [];
const warn = [];
let checks = 0;

const push = (slug, msg) => problems.push(`[${slug}] ${msg}`);
const soft = (slug, msg) => warn.push(`[${slug}] ${msg}`);

/* ---- href existence ---- */
function hrefExists(href) {
  if (!href) return false;
  if (/^https?:\/\//.test(href)) return true;
  if (href.startsWith('mailto:')) return true;
  const clean = href.split('#')[0].split('?')[0];
  if (!clean || !clean.startsWith('/')) return false;
  const rel = clean.replace(/^\//, '');
  const candidates = rel.endsWith('/')
    ? [rel + 'index.html']
    : [rel + '.html', rel + '/index.html', rel];
  return candidates.some(c => existsSync(presolve(ROOT, c)));
}

/* ---- HTML entity scan for data strings ---- */
const ENTITY = /&(amp|lt|gt|quot|#39|rsquo|lsquo|rdquo|ldquo|mdash|ndash|hellip|nbsp);/;
function scanEntity(slug, label, s) {
  if (typeof s === 'string' && ENTITY.test(s)) push(slug, `HTML entity in data string (${label}): "${s.slice(0, 80)}"`);
}

function optionScoreKeys(q) {
  const m = {};
  for (const qn of q.questions) {
    m[qn.id] = qn.options.map(o => o.score);
  }
  return m;
}

/* extract string literals returned by a function's source */
function returnLiterals(fn) {
  const body = Function.prototype.toString.call(fn);
  const out = new Set();
  const re = /return\s+'([a-z0-9_-]+)'/g;
  let m;
  while ((m = re.exec(body))) out.add(m[1]);
  return [...out];
}
function keyLiterals(fn) {
  const body = Function.prototype.toString.call(fn);
  const out = new Set();
  const re = /key:\s*'([a-z0-9_-]+)'/g;
  let m;
  while ((m = re.exec(body))) out.add(m[1]);
  return [...out];
}

/* build answer sets: exhaustive over small quizzes is too big; sample:
   - all-first-options, all-last-options
   - 60 random combos
   - targeted: for each option score of each question, one combo where
     that question takes that option (others = first option) */
function answerSets(quiz) {
  const sets = [];
  const first = {}, last = {};
  for (const qn of quiz.questions) { first[qn.id] = qn.options[0].score; last[qn.id] = qn.options[qn.options.length - 1].score; }
  sets.push({ ...first }, { ...last });
  for (const qn of quiz.questions) {
    for (const o of qn.options) {
      const a = { ...first };
      a[qn.id] = o.score;
      sets.push(a);
    }
  }
  // pseudo-random combos (deterministic seed)
  let seed = 42;
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  for (let i = 0; i < 80; i++) {
    const a = {};
    for (const qn of quiz.questions) a[qn.id] = qn.options[Math.floor(rnd() * qn.options.length)].score;
    sets.push(a);
  }
  return sets;
}

/* ================= category quizzes (original schema) ================= */
for (const slug of category) {
  const q = Q[slug];
  checks++;
  if (!Array.isArray(q.questions) || q.questions.length < 3) push(slug, `category quiz has ${q.questions?.length} questions`);
  for (const qn of q.questions) {
    if (!qn.q || !Array.isArray(qn.options) || qn.options.length < 2) push(slug, `question ${qn.id} malformed`);
  }
  if (!q.results || Object.keys(q.results).length < 2) push(slug, 'category quiz results missing');
}

/* ================= intent quizzes (full contract) ================= */
for (const slug of intent) {
  const q = Q[slug];

  /* structure */
  checks++;
  if (typeof q.id !== 'string') soft(slug, 'id field missing (pre-contract original quiz)');
  else if (q.id !== slug) push(slug, `id mismatch: ${q.id}`);
  if (!Array.isArray(q.questions) || q.questions.length !== 8) push(slug, `questions = ${q.questions?.length}, contract = 8`);
  const ids = (q.questions || []).map(x => x.id);
  if (new Set(ids).size !== ids.length) push(slug, `duplicate question ids: ${ids.join(',')}`);
  for (const qn of q.questions || []) {
    if (!qn.q) push(slug, `question ${qn.id}: missing q`);
    if (!Array.isArray(qn.options) || qn.options.length < 2) push(slug, `question ${qn.id}: options < 2`);
    for (const o of qn.options || []) {
      const badScore = o.score === undefined || o.score === null || o.score === '' ||
        (typeof o.score === 'number' && (o.score < -2 || o.score > 2)) ||
        (typeof o.score === 'string' && !o.score);
      if (badScore) push(slug, `question ${qn.id}: option without valid score (${JSON.stringify(o.score)})`);
      scanEntity(slug, `option text q:${qn.id}`, o.text);
      scanEntity(slug, `option detail q:${qn.id}`, o.detail);
    }
    scanEntity(slug, `q text ${qn.id}`, qn.q);
    scanEntity(slug, `hint ${qn.id}`, qn.hint);
  }

  /* launcher title (user-directed, double-banned framings) */
  checks++;
  if (q.title !== 'What Are You Really Asking?') {
    soft(slug, `launcher title = "${q.title}" (canonical user-directed title expected)`);
    if (/Read His .+ Pattern/.test(q.title || '')) push(slug, 'BANNED title framing: "Read His X Pattern"');
    if (/With Him\?/.test(q.title || '')) push(slug, 'BANNED title framing: "...With Him?"');
  }
  if (!q.launchSub || q.launchSub.length < 40) soft(slug, 'launchSub missing/short (main.js fallback would show old framing)');
  scanEntity(slug, 'title', q.title);
  scanEntity(slug, 'launchSub', q.launchSub);
  scanEntity(slug, 'subtitle', q.subtitle);

  /* results / patterns */
  checks++;
  const results = q.results || {};
  const patternKeys = Object.keys(results);
  if (patternKeys.length > 5) push(slug, `${patternKeys.length} patterns (contract: <=5): ${patternKeys.join(',')}`);
  if (!patternKeys.includes('not-enough-evidence')) push(slug, 'missing not-enough-evidence fallback pattern');
  for (const pk of patternKeys) {
    const r = results[pk];
    for (const k of ['path', 'summary', 'suggest', 'dontTell', 'watch']) {
      if (typeof r[k] === 'undefined') push(slug, `result ${pk}: missing ${k}`);
    }
    scanEntity(slug, `result ${pk}.path`, r.path);
    scanEntity(slug, `result ${pk}.summary`, r.summary);
    scanEntity(slug, `result ${pk}.dontTell`, r.dontTell);
  }

  /* resolve literals ⊆ results */
  checks++;
  if (typeof q.resolve !== 'function') push(slug, 'resolve() missing');
  else for (const lit of returnLiterals(q.resolve)) {
    if (!results[lit]) push(slug, `resolve() returns '${lit}' — not a pattern in results`);
  }

  /* matchPractice literals ⊆ practice registry  */
  checks++;
  const practice = q.practice || {};
  const pKeys = Object.keys(practice);
  if (pKeys.length < 5) soft(slug, `practice registry has only ${pKeys.length} keys (shared contract = 7 incl. general)`);
  if (!pKeys.includes('general')) soft(slug, 'no general fallback practice');
  if (typeof q.matchPractice !== 'function') push(slug, 'matchPractice() missing');
  else for (const lit of returnLiterals(q.matchPractice)) {
    if (!practice[lit]) push(slug, `matchPractice() returns '${lit}' — NOT in practice registry (renderer degrades to general)`);
  }

  /* matchAha literals ⊆ MYSTICDO_AHA */
  checks++;
  if (typeof q.matchAha !== 'function') soft(slug, 'matchAha() missing (v2 engine contract)');
  else for (const lit of returnLiterals(q.matchAha)) {
    if (!AHA[lit]) push(slug, `matchAha() returns '${lit}' — NOT in MYSTICDO_AHA`);
  }

  /* underneath */
  checks++;
  if (typeof q.underneath !== 'function') soft(slug, 'underneath() missing');
  else {
    for (const k of keyLiterals(q.underneath)) {
      if (typeof k !== 'string') push(slug, 'underneath key malformed');
    }
  }

  /* practice hrefs exist */
  checks++;
  for (const pk of pKeys) {
    const p = practice[pk];
    for (const [label, v] of [['href', p.href], ['secondary.href', p.secondary?.href], ['choose.href', p.choose?.href]]) {
      if (v && !hrefExists(v)) push(slug, `practice ${pk}: ${label} 404 on disk -> ${v}`);
      if (v && !v.startsWith('/') && !/^https?:/.test(v)) push(slug, `practice ${pk}: ${label} not root-relative: ${v}`);
    }
    scanEntity(slug, `practice ${pk}.fit`, p.fit);
    scanEntity(slug, `practice ${pk}.note`, p.note);
  }

  /* ctaText literals in customResult should reference pattern:practice pairs */
  checks++;
  if (typeof q.customResult !== 'function') soft(slug, 'customResult() missing (v2 renderer hook)');
}

/* mirror of the renderer's schema normalization (results + underneath)
   so the logic walkthrough can call suggest/watch/underneath directly */
function normalizeResult(r) {
  if (!r || typeof r.suggest === 'function') return r;
  if (!r.path && r.title) r.path = r.title;
  if (!r.path && r.name) r.path = r.name;
  if (Array.isArray(r.whatAnswersSuggest)) {
    const paras = r.whatAnswersSuggest;
    r.suggest = () => paras.join(' ');
  } else if (typeof r.description === 'string' || typeof r.whatYourAnswersSuggest === 'string') {
    const body = [r.description, r.whatYourAnswersSuggest].filter(Boolean).join(' ');
    r.suggest = () => body;
  }
  if (!r.dontTell && typeof r.whatItCannotProve === 'string') r.dontTell = r.whatItCannotProve;
  if (!r.dontTell && typeof r.cannotSettle === 'string') r.dontTell = r.cannotSettle;
  if (Array.isArray(r.whatToWatchNext)) {
    const items = r.whatToWatchNext;
    if (!r.watchIntro) r.watchIntro = 'What to look at next:';
    r.watch = () => items;
  } else if (typeof r.watchNext === 'string') {
    const items = [r.watchNext, r.supports].filter(Boolean);
    if (!r.watchIntro) r.watchIntro = 'What to look at next:';
    r.watch = () => items;
  }
  return r;
}

/* ================= runtime walkthrough ================= */
let walks = 0, crashes = 0, unresolvedPractice = 0;
const routeCounts = {};
for (const slug of intent) {
  const q = Q[slug];
  for (const a of answerSets(q)) {
    walks++;
    try {
      const pattern = q.resolve(a);
      if (!results_ok(pattern, q)) throw new Error(`resolve -> unknown pattern ${pattern}`);
      const r = normalizeResult(q.results[pattern]);
      const s = typeof r.suggest === 'function' ? r.suggest(a) : r.suggest;
      if (typeof s !== 'string' || !s) throw new Error('suggest() empty');
      const w = r.watch(a);
      if (!Array.isArray(w) || w.length < 1) throw new Error('watch() empty');
      let u = q.underneath(a, pattern);
      if (typeof u === 'string') u = { key: null, label: 'x', text: u };
      if (u !== null && typeof u === 'object') {
        for (const k of ['key', 'label', 'text']) if (typeof u[k] === 'undefined') throw new Error(`underneath missing ${k}`);
      }
      const mp = q.matchPractice(a);
      if (!q.practice[mp]) { unresolvedPractice++; problems.push(`[walk ${slug}] matchPractice -> '${mp}' not in practice`); }
      routeCounts[mp] = (routeCounts[mp] || 0) + 1;
      if (typeof q.matchAha === 'function') {
        const ah = q.matchAha(a, pattern);
        if (!AHA[ah]) throw new Error(`matchAha -> unknown ${ah}`);
      }
    } catch (e) {
      crashes++;
      if (crashes < 25) problems.push(`[walk ${slug}] ${e.message}`);
    }
  }
}
function results_ok(p, q) { return !!q.results[p]; }

/* ================= mount mapping ================= */
import { readdirSync, statSync } from 'node:fs';
const mounts = new Set();
(function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = presolve(dir, e);
    if (e === '_design-check' || e === 'node_modules' || e === '.git' || e === 'scratch' || e === 'logo-drafts') continue;
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (e.endsWith('.html')) {
      const html = readFileSync(p, 'utf8');
      for (const m of html.matchAll(/data-quiz="([^"]+)"/g)) mounts.add(m[1]);
    }
  }
})(ROOT);
const mountList = [...mounts];
for (const m of mountList) if (!Q[m]) push(m, 'mounted via data-quiz but NO quiz object');
for (const s of slugs) if (!mountList.includes(s)) soft(s, 'quiz object never mounted (orphan)');

/* ================= report ================= */
console.log('════════ QUIZ CONTRACT VALIDATION ════════');
console.log(`quiz objects: ${slugs.length} (intent: ${intent.length}, category: ${category.length})`);
console.log(`mounted ids: ${mountList.length}`);
console.log(`contract checks run: ~${checks * intent.length + checks * category.length}`);
console.log(`runtime walkthroughs: ${walks}, crashes: ${crashes}, unroutable practice: ${unresolvedPractice}`);
console.log('');
console.log('── practice routing distribution (walkthrough) ──');
for (const [k, v] of Object.entries(routeCounts).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${v}`);
console.log('');
console.log(`PROBLEMS: ${problems.length}`);
for (const p of problems) console.log('  ✗ ' + p);
console.log('');
console.log(`WARNINGS: ${warn.length}`);
for (const w of warn) console.log('  ⚠ ' + w);
