// IndexNow submission — notifies Bing (feeds ChatGPT Search + Copilot),
// Yandex, Naver, Seznam of new/updated pages. Protocol: https://www.indexnow.org/documentation
//
// USAGE (run from the repo root):
//   node scripts/indexnow.mjs <url-or-local-path> ...     # submit specific pages
//   node scripts/indexnow.mjs --sitemap                   # submit every URL in sitemap.xml
//   node scripts/indexnow.mjs --dry-run <...>             # show payload, don't submit
//
// Examples:
//   node scripts/indexnow.mjs questions/love-relationships/does-he-love-me.html
//     -> submits https://mysticdo.com/questions/love-relationships/does-he-love-me
//   node scripts/indexnow.mjs guides/psychic-vs-tarot.html index.html
//     -> submits https://mysticdo.com/guides/psychic-vs-tarot and https://mysticdo.com/
//
// Notes:
//   - Deploy FIRST (git push -> CF Workers Builds). Submitted URLs must return 200.
//   - Domain ownership is proven by the key file at
//     https://mysticdo.com/<KEY>.txt — must stay deployed at the site root.
//   - HTTP 200/202 = accepted; 403 = key/key-file problem; 422 = URL not on host.
//   - IndexNow dedupes repeats; re-submitting is harmless.

import { readFileSync } from 'node:fs';

const HOST = 'mysticdo.com';
const KEY = '286d6f8e5ebb0b9d5f5c0acb59c00859';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

// ── local path / URL -> canonical clean URL ────────────────────────────────
function toCanonicalUrl(arg) {
  if (/^https?:\/\//i.test(arg)) {
    const u = new URL(arg);
    if (u.host !== HOST) throw new Error(`URL not on ${HOST}: ${arg}`);
    return `https://${HOST}${u.pathname.replace(/\.html$/, '') || '/'}`;
  }
  let p = String(arg).replaceAll('\\', '/').replace(/^\.?\//, '').replace(/\.html$/, '');
  if (p === 'index' || p === '') return `https://${HOST}/`;
  return `https://${HOST}/${p}`;
}

function fromSitemap() {
  const xml = readFileSync(new URL('../sitemap.xml', import.meta.url), 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

// ── parse args ──────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const useSitemap = args.includes('--sitemap');
const rest = args.filter((a) => !a.startsWith('--'));

if (rest.length === 0 && !useSitemap) {
  console.error('Usage: node scripts/indexnow.mjs <url-or-local-path> ... | --sitemap [--dry-run]');
  process.exit(1);
}

let urlList;
try {
  urlList = useSitemap ? fromSitemap() : rest.map(toCanonicalUrl);
} catch (e) {
  console.error('Error:', e.message);
  process.exit(1);
}

const body = JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList });

if (dryRun) {
  console.log('Dry run — payload that would be POSTed to https://api.indexnow.org/indexnow:\n');
  console.log(JSON.stringify({ ...JSON.parse(body), urlList }, null, 2));
  process.exit(0);
}

// IndexNow POST JSON (single endpoint covers Bing, Yandex, Naver, Seznam, Yesim)
fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body,
})
  .then(async (res) => {
    console.log(`Submitting ${urlList.length} URL(s) to IndexNow...`);
    for (const u of urlList) console.log(`  ${u}`);
    const ok = res.status === 200 || res.status === 202;
    console.log(`IndexNow HTTP ${res.status} — ${ok ? 'accepted ✅' : 'FAILED ❌'}`);
    if (!ok) console.log(await res.text().catch(() => ''));
    process.exit(ok ? 0 : 1);
  })
  .catch((e) => {
    console.error('Network error:', e.message);
    process.exit(1);
  });
