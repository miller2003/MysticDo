/* Repository-hygiene gate — keeps throwaway files out of git.
 *
 * Why this exists: one-off agent scripts (inspect_*, find_*, audit_*, fix_*)
 * and generated artifacts (design screenshots, logo drafts) had accumulated
 * inside the repository — 570 files / ~145 MB at the 2026-09-23 cleanup,
 * including a 125 MB `_design-check/` screenshot dump and 78 scratch scripts.
 * Nothing in the normal toolchain noticed, because `.assetsignore` only
 * controls what reaches the CDN — it does not keep files out of git.
 *
 * This gate scans TRACKED files only (`git ls-files`). Untracked files are
 * governed by `.gitignore` and are none of this gate's business.
 *
 * Rules:
 *   1. `scratch/`, `_design-check/`, `logo-drafts/`, `tmp/`, `temp/`
 *      must never be tracked. They are the sanctioned homes for throwaway
 *      work and generated output, and both are git-ignored.
 *   2. `__pycache__/`, `*.pyc` — compiled bytecode.
 *   3. Editor/backup residue: `*.bak`, `*.bak.*`, `*.old`, `*.orig`, `*.rej`,
 *      `*.tmp`, `*.log`, `*.swp`, `*.swo`, `*~`.
 *   4. OS junk: `.DS_Store`, `Thumbs.db`, `desktop.ini`.
 *   5. `.workbuddy/`, `.env`, `.env.*` — local session data and secrets.
 *   6. A one-off `*.py` dropped in the REPOSITORY ROOT. Only two root-level
 *      Python files are legitimate (`seo_inject.py`, `validate_seo.py` — both
 *      invoked by `npm test`). Anything else belongs in `scripts/` (durable
 *      tools) or `scratch/` (throwaway).
 *   7. A one-off `*.mjs` / `*.js` in the REPOSITORY ROOT. Node tooling lives
 *      in `scripts/`.
 *
 * Fix for a hit:
 *   git rm --cached <path>          # stop tracking, keep the file locally
 *   ...then add the matching pattern to .gitignore so it stays out.
 *
 * Run: node scripts/test-no-junk.mjs
 * ESM (package.json type: module).
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

/* Root-level scripts that are part of the shipped toolchain (see package.json). */
const ROOT_SCRIPT_ALLOW = new Set(['seo_inject.py', 'validate_seo.py']);

const RULES = [
  {
    id: 'scratch-dir',
    why: 'throwaway work must live in an ignored directory',
    test: (p) => /^(scratch|_design-check|logo-drafts|tmp|temp)\//.test(p),
  },
  {
    id: 'bytecode',
    why: 'compiled Python artifacts are regenerated on demand',
    test: (p) => /(^|\/)__pycache__\//.test(p) || /\.pyc$/.test(p),
  },
  {
    id: 'editor-residue',
    why: 'backup / swap files are never source of truth',
    test: (p) => /\.(bak|old|orig|rej|tmp|log|swp|swo)$/.test(p) ||
                  /\.bak\./.test(p) || /~$/.test(p),
  },
  {
    id: 'os-junk',
    why: 'OS-generated clutter',
    test: (p) => /(^|\/)\.DS_Store$/.test(p) || /(^|\/)Thumbs\.db$/.test(p) ||
                  /(^|\/)desktop\.ini$/.test(p),
  },
  {
    id: 'local-only',
    why: 'session data and secrets must never be committed',
    test: (p) => /^\.workbuddy\//.test(p) || /^\.env(\.|$)/.test(p),
  },
  {
    id: 'root-stray-python',
    why: 'one-off Python belongs in scripts/ or scratch/',
    test: (p) => !p.includes('/') && /\.py$/i.test(p) && !ROOT_SCRIPT_ALLOW.has(p),
  },
  {
    id: 'root-stray-node',
    why: 'Node tooling belongs in scripts/',
    test: (p) => !p.includes('/') && /\.(mjs|js)$/i.test(p),
  },
];

/* Resolve the git binary explicitly. `execFileSync('git', ...)` does not do
 * PATHEXT resolution on Windows, and Git-Bash puts a non-.exe wrapper first
 * on PATH — both failure modes silently turn this gate into a no-op. */
function findGit() {
  const candidates = [
    process.env.GIT_EXE,
    'git.exe',
    'git',
    'C:\\Program Files\\Git\\cmd\\git.exe',
    'C:\\Program Files (x86)\\Git\\cmd\\git.exe',
    '/usr/bin/git',
    '/mingw64/bin/git',
  ].filter(Boolean);
  for (const c of candidates) {
    try {
      execFileSync(c, ['--version'], { cwd: ROOT, stdio: 'ignore' });
      return c;
    } catch { /* try next */ }
  }
  return null;
}

/* Test hook: `NO_JUNK_FILELIST=<path>` reads a newline-delimited path list
 * instead of querying git. Lets the rule engine be verified against fixtures
 * (the gate's own self-test uses it) and keeps the gate honest in sandboxes
 * where a child process cannot be spawned. */
function collectTracked() {
  const fixture = process.env.NO_JUNK_FILELIST;
  if (fixture) {
    const out = readFileSync(fixture, 'utf8');
    return {
      source: 'fixture:' + fixture,
      tracked: out.split('\n').map((s) => s.trim()).filter(Boolean),
    };
  }
  const git = findGit();
  if (!git) return { source: null, tracked: [] };
  try {
    const out = execFileSync(git, ['ls-files', '-z'], {
      cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
    });
    return { source: 'git ls-files', tracked: out.split('\0').filter(Boolean) };
  } catch {
    return { source: git, tracked: [] };
  }
}

const { source, tracked } = collectTracked();

if (!source || tracked.length === 0) {
  /* A silent pass here would defeat the gate's whole purpose, so say so. */
  console.log('NO-JUNK GATE: WARNING — could not read the git index' +
    (source ? '' : ' (git binary not found)') +
    '; hygiene was NOT verified.');
  console.log('NO-JUNK GATE: run `git ls-files | head` here to confirm git works.');
  process.exit(0);
}

const hits = new Map(); // rule id -> [paths]
for (const rel of tracked) {
  const p = rel.replace(/\\/g, '/');
  for (const rule of RULES) {
    if (rule.test(p)) {
      if (!hits.has(rule.id)) hits.set(rule.id, []);
      hits.get(rule.id).push(p);
      break;
    }
  }
}

if (hits.size === 0) {
  console.log('NO-JUNK GATE: ' + tracked.length + ' tracked files, 0 junk -> ALL GREEN');
  process.exit(0);
}

let total = 0;
console.log('NO-JUNK GATE: junk is tracked in this repository.\n');
for (const rule of RULES) {
  const paths = hits.get(rule.id);
  if (!paths) continue;
  total += paths.length;
  console.log('  [' + rule.id + '] ' + paths.length + ' file(s) — ' + rule.why);
  for (const p of paths.slice(0, 12)) console.log('      ' + p);
  if (paths.length > 12) console.log('      ... and ' + (paths.length - 12) + ' more');
  console.log('');
}
console.log('Fix: git rm --cached <path>   (keeps your local copy), then add the');
console.log('pattern to .gitignore so it cannot come back.');
console.log('\nNO-JUNK GATE: ' + total + ' junk file(s) tracked -> ' + total + ' FAILURES');
process.exit(1);
