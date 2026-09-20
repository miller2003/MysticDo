/* Intent-page convention gate — keeps future articles honest.
 *
 * The quiz/CTA conventions were hard-won across many review rounds
 * (see INTENT_PAGE_PROMPT.md §4). This gate fails `npm test` when a
 * new (or edited) page drifts back to a retired pattern:
 *
 *   1. `quiz-inline-cta-note` is retired — CTA bands are bare buttons.
 *   2. `.quiz-inline-cta` may only be:
 *        - `class="quiz-inline-cta mt-3"`  (in-section, right after the
 *          explanation card — mt-3 tight spacing per user instruction)
 *        - `class="quiz-inline-cta"`       (standalone, inside `.cta-band`)
 *      Anything else (mt-4/5/6…, extra classes) fails.
 *   3. A standalone CTA section must be `<section class="cta-band">`,
 *      never `section-sm` (the old 48px-air band).
 *   4. Every CTA holds exactly one
 *      `<a class="btn btn-gold btn-lg" href="#pattern-check" data-quiz-open>`
 *      and nothing else (no eyebrow / note / second link).
 *   5. Every `cta-band` section must contain its `.quiz-inline-cta`.
 *   6. A page mounting `data-quiz-modal` must wire at least one
 *      `data-quiz-open` opener.
 *
 * Run: node scripts/test-intent-conventions.mjs
 * ESM (package.json type: module).
 */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SKIP_DIRS = new Set([
  '_design-check', 'email-templates', 'logo-drafts', 'worker',
  'node_modules', 'scripts', 'functions', '.workbuddy', '.git',
]);

const files = [];
(function walk(dir) {
  let entries = [];
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name)) walk(join(dir, e.name));
    } else if (e.name.endsWith('.html')) {
      files.push(join(dir, e.name));
    }
  }
})(ROOT);

let checks = 0;
let failures = 0;
function fail(msg) { failures++; console.log('  FAIL ' + msg); }

for (const f of files) {
  const rel = relative(ROOT, f).split(sep).join('/');
  const src = readFileSync(f, 'utf8');
  const lines = src.split(/\r?\n/);
  checks++;

  /* 1. retired note class */
  checks++;
  if (src.includes('quiz-inline-cta-note')) {
    fail(rel + ': quiz-inline-cta-note is retired — CTA bands are bare buttons');
  }

  /* 2-4. CTA structure */
  let lastSectionClass = '';
  for (let i = 0; i < lines.length; i++) {
    const L = lines[i];
    const sm = L.match(/<section class="([^"]*)"/);
    if (sm) lastSectionClass = sm[1];
    if (/^\s*<\/section>/.test(L)) lastSectionClass = '';

    const cm = L.match(/<div class="(quiz-inline-cta[^"]*)"\s*>/);
    if (!cm) continue;
    const lineNo = i + 1;

    checks++;
    const cls = cm[1];
    if (cls !== 'quiz-inline-cta' && cls !== 'quiz-inline-cta mt-3') {
      fail(rel + ':' + lineNo + ': quiz-inline-cta class "' + cls +
        '" — allowed: "quiz-inline-cta" (cta-band) or "quiz-inline-cta mt-3" (in-section)');
    }

    checks++;
    if (/(^|\s)section-sm(\s|$)/.test(lastSectionClass)) {
      fail(rel + ':' + lineNo + ': standalone CTA section still uses section-sm — use cta-band');
    }

    checks++;
    const inner = [];
    for (let j = i + 1; j < lines.length; j++) {
      inner.push(lines[j]);
      if (/<\/div>/.test(lines[j])) break;
    }
    const innerSrc = inner.join('\n');
    const aCount = (innerSrc.match(/<a\s/g) || []).length;
    const isGold = /class="btn btn-gold btn-lg"/.test(innerSrc);
    const hasOpen = /data-quiz-open/.test(innerSrc);
    const hasHref = /href="#pattern-check"/.test(innerSrc);
    const hasStray = /<p[ >]/.test(innerSrc) || /class="eyebrow"/.test(innerSrc);
    if (aCount !== 1 || !isGold || !hasOpen || !hasHref || hasStray) {
      fail(rel + ':' + lineNo +
        ': CTA must hold exactly one <a class="btn btn-gold btn-lg" href="#pattern-check" data-quiz-open> and nothing else');
    }
  }

  /* 5. cta-band carries its CTA */
  for (let i = 0; i < lines.length; i++) {
    if (/<section class="cta-band"/.test(lines[i])) {
      checks++;
      const windowSrc = lines.slice(i, i + 4).join('\n');
      if (!/quiz-inline-cta/.test(windowSrc)) {
        fail(rel + ':' + (i + 1) + ': cta-band without a quiz-inline-cta inside');
      }
    }
  }

  /* 6. modal mount needs an opener */
  checks++;
  if (/data-quiz-modal/.test(src) && !/data-quiz-open/.test(src)) {
    fail(rel + ': mounts data-quiz-modal but has no data-quiz-open opener');
  }
}

console.log('INTENT CONVENTIONS: ' + checks + ' checks across ' + files.length +
  ' pages -> ' + (failures === 0 ? 'ALL GREEN' : failures + ' FAILURES'));
process.exit(failures === 0 ? 0 : 1);
