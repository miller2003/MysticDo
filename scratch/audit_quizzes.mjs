/* Contract validation for the 20 new quiz objects. */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const src = readFileSync(path.join(ROOT, 'assets/js/quizzes.js'), 'utf8');

global.window = {};
global.document = { querySelectorAll: () => [], addEventListener() {}, querySelector: () => null, createElement: () => ({ style: {}, classList: { add() {}, remove() {} }, setAttribute() {}, appendChild() {} }) };
const NAV = { userAgent: 'node' };
const LOC = { search: '', hash: '' };

const factory = new Function('window', 'document', 'navigator', 'location',
  src + '\nreturn { Q: window.MYSTICDO_QUIZZES, AHA: window.MYSTICDO_AHA };');
const { Q, AHA } = factory(global.window, global.document, NAV, LOC);

const NEW = ['333-meaning','444-meaning','555-meaning','777-meaning','888-meaning',
'what-is-my-moon-sign','what-is-my-saturn-return','am-i-in-the-right-career',
'dream-about-being-chased','dream-about-someone-dying','dream-about-your-ex',
'feeling-lost-in-life','dream-about-deceased-loved-one','is-my-loved-one-watching-over-me',
'signs-from-deceased-loved-ones','why-am-i-always-broke','will-i-be-rich',
'lovers-card-meaning','tarot-yes-or-no','tower-card-meaning'];

const PRACTICE_KEYS = ['psychic','tarot_relationship','tarot_decision','tarot_deep','closure','free_first','general'];
const BANNED_TITLE = [/^Read\s+(His|Her|Its|Your Partner)/i, /\bWith Him\?/i, /Read His .*Pattern/i];

let problems = 0;
const p = (slug, msg) => { problems++; console.log('  FAIL [' + slug + '] ' + msg); };

for (const slug of NEW) {
  const q = Q[slug];
  if (!q) { p(slug, 'object missing'); continue; }
  console.log('\n--- ' + slug + ' ---');

  // questions
  const qs = q.questions || [];
  if (qs.length !== 8) p(slug, 'questions = ' + qs.length + ' (contract: 8)');
  const ids = qs.map(x => x.id);
  if (new Set(ids).size !== ids.length) p(slug, 'duplicate question ids: ' + ids.join(','));

  // option integrity + score range
  let optCounts = [];
  for (const qq of qs) {
    const opts = qq.options || [];
    optCounts.push(opts.length);
    if (opts.length < 2) p(slug, 'question "' + qq.id + '" has ' + opts.length + ' options');
    for (const o of opts) {
      if (typeof o.score === 'number' && (o.score < -2 || o.score > 2)) {
        p(slug, 'score out of [-2,2] in ' + qq.id + ': ' + o.score);
      }
      if (!('text' in o)) p(slug, 'option missing text in ' + qq.id);
    }
  }

  // resolve
  if (typeof q.resolve !== 'function') p(slug, 'resolve is not a function');
  if (typeof q.underneath !== 'function') p(slug, 'underneath is not a function');
  if (typeof q.matchPractice !== 'function') p(slug, 'matchPractice is not a function');
  if (typeof q.customResult !== 'function') p(slug, 'customResult is not a function');

  // title / launcher
  if (!q.title || !q.title.trim()) p(slug, 'missing title');
  for (const re of BANNED_TITLE) if (re.test(q.title || '')) p(slug, 'banned launcher title: ' + q.title);
  if (!q.launchSub) p(slug, 'missing launchSub (main.js fallback is the retired framing)');

  // results
  const rkeys = Object.keys(q.results || {});
  if (rkeys.length > 5) p(slug, 'results = ' + rkeys.length + ' (>5)');
  if (!('not-enough-evidence' in (q.results || {}))) p(slug, 'no not-enough-evidence fallback result');
  for (const k of rkeys) {
    const r = q.results[k];
    if (typeof r.suggest !== 'function') p(slug, 'results["' + k + '"].suggest is not a function');
    if (!r.dontTell) p(slug, 'results["' + k + '"].dontTell missing');
    if (!r.summary) p(slug, 'results["' + k + '"].summary missing');
    if (!r.path) p(slug, 'results["' + k + '"].path missing');
  }

  // practice
  const pr = q.practice || {};
  const pk = Object.keys(pr);
  const unknown = pk.filter(k => !PRACTICE_KEYS.includes(k));
  if (unknown.length) p(slug, 'unknown practice key(s): ' + unknown.join(','));
  for (const k of pk) {
    const v = pr[k];
    if (!v.name || !v.fit || !v.href || !v.cta) p(slug, 'practice["' + k + '"] incomplete');
  }

  // walk: all-null path -> should hit a valid result, no crash
  const nullAns = {};
  for (const qq of qs) nullAns[qq.id] = null;
  try {
    const pat = q.resolve(nullAns);
    if (!(pat in (q.results || {}))) p(slug, 'resolve(nulls) returned unknown pattern: ' + pat);
    q.underneath(nullAns, pat);
    const m = q.matchPractice(nullAns);
    if (m && !PRACTICE_KEYS.includes(m)) p(slug, 'matchPractice(nulls) unknown key: ' + m);
  } catch (e) { p(slug, 'crash on all-null answers: ' + e.message); }

  // walk option-score matrix for resolve stability
  const scoreQs = qs.filter(qq => (qq.options || []).some(o => typeof o.score === 'number'));
  let combos = 0, seen = new Set(), crashes = 0;
  const rec = (i, ans) => {
    if (i === scoreQs.length) {
      combos++;
      try {
        const pat = q.resolve(ans);
        if (!(pat in (q.results || {}))) { p(slug, 'resolve -> unknown pattern ' + pat); }
        seen.add(pat);
        const u = q.underneath(ans, pat);
        if (u && (!u.key || !u.label || !u.text)) p(slug, 'underneath returned malformed object');
        const m = q.matchPractice(ans);
        if (m && !PRACTICE_KEYS.includes(m)) p(slug, 'matchPractice -> ' + m);
      } catch (e) { crashes++; if (crashes < 3) p(slug, 'crash: ' + e.message); }
      return;
    }
    const opts = scoreQs[i].options || [];
    for (const o of opts) { ans[scoreQs[i].id] = (typeof o.score === 'number') ? o.score : null; rec(i + 1, ans); }
    // plus a null branch
    ans[scoreQs[i].id] = null; rec(i + 1, ans);
  };
  rec(0, {});
  console.log('  questions=' + qs.length + ' optCounts=[' + optCounts.join(',') + '] results=' + rkeys.length +
    ' practice=' + pk.length + ' combos=' + combos + ' patternsSeen=' + seen.size + ' crashes=' + crashes);
  if (seen.size > 5) p(slug, 'distinct patterns reachable = ' + seen.size + ' (>5)');
  if (seen.size < 3) p(slug, 'distinct patterns reachable = ' + seen.size + ' (<3, thin differentiation)');

  // matchPractice routing sanity: does any combo yield each of the 7 keys?
  const rout = new Set();
  const rec2 = (i, ans) => {
    if (i === scoreQs.length) { rout.add(q.matchPractice(ans)); return; }
    for (const o of (scoreQs[i].options || [])) {
      ans[scoreQs[i].id] = (typeof o.score === 'number') ? o.score : null; rec2(i + 1, ans);
    }
    ans[scoreQs[i].id] = null; rec2(i + 1, ans);
  };
  rec2(0, {});
  const free = rout.has('free_first');
  const gen = rout.has('general');
  console.log('  routing keys reachable: ' + [...rout].filter(Boolean).sort().join(',') +
    (free ? '' : '   [!] free_first unreachable') + (gen ? '' : '   [!] general unreachable'));
  if (!free) console.log('  WARN [' + slug + '] free_first never reachable from signal answers');
  if (!gen) console.log('  WARN [' + slug + '] general never reachable from signal answers');
}

console.log('\n' + '='.repeat(60));
console.log(problems === 0 ? 'NEW-20 QUIZ CONTRACT: ALL GREEN' : 'NEW-20 QUIZ CONTRACT: ' + problems + ' FAILURES');
