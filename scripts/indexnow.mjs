// IndexNow submission script — notifies Bing (feeds ChatGPT Search + Copilot),
// Yandex, Naver, Seznam of new/updated pages.
//
// HOW TO USE:
//   1. Make sure the site is BUILT + DEPLOYED (URLs must return 200).
//   2. Set HOST / KEY below (see "SETUP" — the key proves domain ownership).
//   3. Put the changed URLs in `urlList`.
//   4. Run:  node scripts/indexnow.mjs
//   Expected: "HTTP 200/202 = accepted". If 403, the key file at
//   https://<HOST>/<KEY>.txt is not reachable (or KEY doesn't match it).
//
// SETUP — do this ONCE per new domain:
//   - Generate a fresh key:  node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
//   - Save it as <KEY>.txt at the site root (contents = the KEY string, nothing else).
//   - Set HOST to your domain and KEY to that string below.

const HOST = 'mysticdo.com';
const KEY = 'REPLACE_WITH_YOUR_INDEXNOW_KEY';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

// Only submit canonical URLs of pages that actually changed (and are live).
// urlList starts empty — add the URLs you publish or update, then run.
const urlList = [
  // 'https://mysticdo.com/guides/psychic-vs-tarot.html',
];

const body = JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList });

fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body,
})
  .then((res) => {
    console.log(`IndexNow HTTP ${res.status} — ${res.status === 200 || res.status === 202 ? 'accepted ✅' : 'check error code:'}`);
    if (res.status !== 200 && res.status !== 202) return res.text().then((t) => console.log(t));
  })
  .catch((e) => console.error('Network error:', e.message));
