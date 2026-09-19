# Agent Readiness — MysticDo

What was done in response to the `isitagentready.com` scan, why each decision was
made, how to verify it, and the one thing that still needs a manual step.

Implemented 2026-09-19. Companion documents: `DEPLOY_CF_WORKERS.md` (deploy
mechanics), `SEO_GEO_AUDIT.md` (search-engine side), `MOBILE_QA_AUDIT.md` (client side).

---

## 1. Status against the scan

| # | Scan finding | Status | Where it lives |
|---|---|---|---|
| 1 | Link response headers (RFC 8288) | **Done** | `worker/index.js` → `LINK_HEADER`, applied to every HTML/Markdown response |
| 2 | DNS-AID records | **Manual step** | See §4 — needs Cloudflare DNS records, cannot be done from the repo |
| 3 | Content Signals in robots.txt | **Done** | `robots.txt` |
| 4 | API catalog (RFC 9727) | **Done** | `GET /.well-known/api-catalog` → `application/linkset+json` |
| 5 | OAuth/OIDC discovery | **Done** | `GET /.well-known/oauth-authorization-server` (RFC 8414) |
| 6 | OAuth Protected Resource Metadata | **Done** | `GET /.well-known/oauth-protected-resource` (RFC 9728) |
| 7 | `auth.md` | **Done** | `GET /auth.md` |
| 8 | MCP Server Card | **Done** | `GET /.well-known/mcp/server-card.json` (SEP-1649) |
| 9 | Agent Skills index | **Done** | `GET /.well-known/agent-skills/index.json` (RFC v0.2.0) |
| 10 | WebMCP | **Done** | `assets/js/main.js` → `initWebMcp()` |
| 11 | ARD manifest | **Done** | `GET /.well-known/ai-catalog.json` |

Supporting surfaces added so that nothing is advertised without existing:
`GET /.well-known/openapi.json`, `GET /.well-known/jwks.json`, `GET /api/health`,
`POST /mcp`, `POST /oauth/register`, `GET /oauth/authorize`, `POST /oauth/token`,
`POST /oauth/revoke`, `GET /oauth/../.well-known/agent-skills/<name>/SKILL.md`,
`GET /assets/data/content-index.json`.

---

## 2. The governing principle

**Do not publish a discovery document describing something that does not exist.**

A server card pointing at a dead `/mcp` is worse than no card: the agent burns a
turn, gets a 404, and downgrades the whole domain. So every URL in every document
here resolves and works, and two test suites assert it:

- `scripts/test-worker-agent-routes.mjs` — runs the real Worker in-process (129 assertions)
- `scripts/test-webmcp.mjs` — drives the real `main.js` in headless Chrome (15 assertions)
- `scripts/verify-agent-surface.py` — re-checks all of it against a **live** deployment

Where a scanner check could only be satisfied by asserting something untrue, the
choice was made to implement the missing thing instead. That is why a real MCP
server and a real OAuth authorization server exist in this repository — see §3.

---

## 3. Design decisions worth knowing about

### 3.1 A real MCP server, not a card for an imaginary one

`worker/_lib/mcp.js` implements Streamable HTTP MCP, stateless, JSON-RPC 2.0.
Four tools, all read-only, all annotated `readOnlyHint: true` so a host can
auto-approve them:

| Tool | Backed by |
|---|---|
| `search_mysticdo` | `assets/data/content-index.json` (37 pages, rebuilt by `scripts/build-content-index.py`) |
| `get_mysticdo_page` | the live asset, converted HTML→Markdown by the existing `html-to-md.js` |
| `list_mysticdo_topics` | the same index, grouped by section |
| `recommend_reading_type` | a rule base written from the site's own comparison copy |

**Stateless by choice.** No session id, no SSE stream, no `notifications/initialized`
requirement. On the Workers free tier CPU is capped at 10 ms/request; an SSE
connection would burn a request slot for as long as the agent idles, and session
state has nowhere to live. The protocol permits a single `application/json`
response, so that is what this does.

### 3.2 A real OAuth authorization server — with an honest framing

MysticDo has no protected data. Strictly, a site like this needs no authorization
server, and the scan's own wording is conditional ("*if* your site has protected
APIs"). Two options were available: leave the check failing, or fabricate
metadata. Both are worse than the third option actually taken — implement the
thing, and be explicit in the documents about what it does and does not mean.

- Tokens are **opaque and HMAC-signed**, so they verify without server state.
- `client_id`s are signed envelopes carrying the client's redirect URIs.
  Registration is stateless: nothing is stored, nothing can leak, nothing needs
  garbage collection.
- **`redirect_uri` is restricted to this origin plus loopback** (RFC 8252 §7.3).
  This is the load-bearing control: without it `/oauth/authorize` is an open
  redirector. Tests assert that `https://attacker.example/cb` is rejected.
- PKCE `S256` is mandatory for `authorization_code`; `plain` and absent
  challenges are rejected.
- `/auth.md`, the AS metadata and the PRM all carry the same explicit statement
  that the resource is public and a token grants nothing extra.

**Signing key.** `env.OAUTH_HMAC_KEY` is used when set. When it is not, a
documented constant is used. A forged token gains nothing, because the only thing
tokens unlock is public content. **Set the secret anyway** if this surface is ever
put in front of anything non-public:

```
npx wrangler secret put OAUTH_HMAC_KEY
```

**`jwks_uri` returns `{"keys": []}`** — deliberately, and truthfully: this server
issues opaque tokens, not JWTs, so it publishes no signing keys. RFC 8414 §2 makes
`jwks_uri` optional; it is advertised only because some clients probe for it. If a
scanner insists on a non-empty key set, that single sub-check will report
differently — the alternative would be to publish a public signing key, which is
worse.

### 3.3 Content Signals — `ai-train=no, search=yes, ai-input=yes`

This is a policy decision, recorded here because it is a machine-readable grant:

- The site wants to be **cited**. `search=yes` and `ai-input=yes` protect the GEO
  strategy that the whole content system is built around.
- It does **not** grant model-training rights.

`CCBot` is additionally `Disallow`ed at the crawl level: Common Crawl's only
downstream product is training data, and it returns no search or answer channel to
this site, so the token is unambiguous. `Google-Extended` and `Applebot-Extended`
are deliberately **left allowed**, because those tokens bundle training with
grounding — disallowing them would close the `ai-input` channel that the
declaration is trying to keep open. `GPTBot`, `ClaudeBot` and `anthropic-ai` are
likewise left allowed for the same reason. The preference is declared, not
blanket-enforced.

If you want crawl-level enforcement anyway, add `Disallow: /` for `GPTBot`,
`ClaudeBot` and `anthropic-ai` in `robots.txt` and accept the loss of grounding.

### 3.4 Two bugs found and fixed on the way

**`.html` pages were not content-negotiable.** `isNegotiable()` rejected any path
with an extension, which included every `.html`. Since *all* of the site's real
content lives at `.html` URLs, Markdown for Agents was switched off for exactly
the pages worth converting — and `DEPLOY_CF_WORKERS.md` had been documenting
`about.html` as a working example of a behaviour that did not exist. Now `.html`
and `.htm` negotiate; images, CSS, JS, XML and JSON still do not.

**Dev-only pages were in `sitemap.xml`.** `seo_inject.py` walked `_design-check/`,
so harness pages under it received canonicals and sitemap entries — URLs that are
blocked by `.assetsignore` and therefore 404 in production. Fixed with a
`NEVER_PUBLISH_DIRS` list; the three affected files were cleaned and the sitemap
dropped from 40 to 37 URLs.

### 3.5 Agent Skills are computed, not pasted

`worker/_lib/agent-skills.js` computes each `sha256` at request time from the same
constant that serves the artifact (`crypto.subtle.digest`, memoised per isolate).
A published digest therefore cannot disagree with the published bytes — which is
the failure mode that makes most skills indexes quietly worthless. The test suite
re-hashes every artifact and compares.

The five skills are real procedures, not filler: matching a situation to a
practice, vetting a reader before paying, budgeting a reading, retrieving content
programmatically, and calling the MCP tools.

---

## 4. The one manual step: DNS-AID

This cannot be done from the repository — it needs records in the Cloudflare DNS
zone for `mysticdo.com`.

**Publish these records** (Cloudflare dashboard → `mysticdo.com` → DNS → Records
→ Add record). Set Proxy status to **DNS only** (grey cloud); SVCB/HTTPS records
are not proxied.

| Type | Name | Content / target | Priority | TTL |
|---|---|---|---|---|
| `SVCB` | `_index._agents` | `1 mysticdo.com. alpn="h2,h3" port=443 mandatory=alpn,port` | — | Auto |
| `SVCB` | `_mcp._agents` | `1 mysticdo.com. alpn="h2" port=443 mandatory=alpn,port` | — | Auto |
| `TXT` | `_catalog._agents` | `url=https://mysticdo.com/.well-known/ai-catalog.json` | — | Auto |

Notes:

- `_index._agents` is the discovery entry point the DNS-AID draft names.
- `_mcp._agents` points at the MCP endpoint that actually exists at
  `https://mysticdo.com/mcp`. Do not publish `_a2a._agents` — there is no A2A
  agent on this origin, and advertising one would be exactly the kind of dangling
  record §2 exists to prevent.
- `_catalog._agents` TXT is the ARD spec §6.1 mechanism for pointing agents at a
  manifest hosted at the well-known path.
- If the Cloudflare UI rejects `SVCB`, try the `HTTPS` record type — both are
  ServiceMode-compatible and the registry accepts either.

**Enable DNSSEC** so validating resolvers return authenticated data:
Cloudflare dashboard → `mysticdo.com` → **DNS** → **Settings** → **DNSSEC** →
**Enable DNSSEC**. Cloudflare then shows a DS record; it must be added at the
registrar. DNSSEC changes can take a few hours to propagate.

**Verify** (the scanner uses DoH; this mirrors it):

```powershell
curl.exe -s -H "Accept: application/dns-json" "https://cloudflare-dns.com/dns-query?name=_index._agents.mysticdo.com&type=SVCB"
curl.exe -s -H "Accept: application/dns-json" "https://cloudflare-dns.com/dns-query?name=_catalog._agents.mysticdo.com&type=TXT"
```

Or just re-run `python scripts/verify-agent-surface.py` — it checks both and
reports them as warnings rather than failures until they exist.

---

## 5. Verification

```powershell
# Everything, locally, no network needed
node scripts/test-worker-agent-routes.mjs   # 129 assertions — Worker routes, MCP, OAuth, regressions
node scripts/test-webmcp.mjs                #  15 assertions — real main.js in headless Chrome
node scripts/test-markdown-for-agents.mjs --dist=.   # pre-existing suite, still green

# Or: npm test

# After deploying, against production
python scripts/verify-agent-surface.py
python scripts/verify-agent-surface.py https://mysticdo.<sub>.workers.dev   # preview domain
```

Quick manual spot checks once live:

```powershell
curl.exe -sI https://mysticdo.com/ | findstr /i link
curl.exe -s https://mysticdo.com/.well-known/ai-catalog.json
curl.exe -s -H "Accept: text/markdown" https://mysticdo.com/guides/psychic-vs-tarot.html
curl.exe -s -X POST https://mysticdo.com/mcp -H "Content-Type: application/json" -d "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}"
```

---

## 6. Files

**Added**

| File | Role |
|---|---|
| `worker/_lib/agent-discovery.js` | Every discovery document, single source of truth |
| `worker/_lib/agent-skills.js` | SKILL.md artifacts + runtime-digest index |
| `worker/_lib/mcp.js` | MCP server |
| `worker/_lib/oauth.js` | OAuth 2.0 AS (registration, authorize, token, revoke) |
| `worker/_lib/search.js` | Search, topic listing, reading-type recommender |
| `assets/data/content-index.json` | Generated corpus (37 pages, 95 KB) |
| `scripts/build-content-index.py` | Rebuilds the corpus — run after editing copy |
| `scripts/test-worker-agent-routes.mjs` | In-process Worker test suite |
| `scripts/test-webmcp.mjs` | Headless-Chrome WebMCP test |
| `scripts/verify-agent-surface.py` | Live-deployment verifier |
| `_design-check/webmcp-probe.html` | Probe page used by the WebMCP test |

**Changed**

| File | Change |
|---|---|
| `worker/index.js` | Agent routing, Link headers, `.html` negotiation fix |
| `assets/js/main.js` | `initWebMcp()` — four browser tools |
| `robots.txt` | Content Signals + Agentmap + categorised AI crawler rules |
| `llms.txt` | "For AI agents" section with every machine endpoint |
| `seo_inject.py` | `<link rel="ai-catalog">` injection; `NEVER_PUBLISH_DIRS` fix |
| `package.json` | `"type": "module"`, `test` / `build:index` / `verify` scripts |
| 39 × `*.html` | `rel="ai-catalog"` pointer |
| `sitemap.xml` | Regenerated, 37 URLs |

---

## 7. Residual risk

- **DNS-AID** is the only item still outstanding, and it is outside the repo. Until
  the records exist, that check will keep failing.
- **`jwks_uri` is an empty key set** by design — see §3.2. If the scanner reports
  `oauthDiscovery` as failing on that field alone, that is the reason.
- **OAuth is unauthenticated by design.** `/oauth/register` has no rate limiting;
  it is cheap and stateless, but a determined caller can generate tokens freely.
  They grant nothing. Add Cloudflare Rate Limiting rules on `/oauth/*` and `/mcp`
  if abuse ever appears.
- **Content Signals is a declaration, not enforcement.** Crawlers that ignore it
  can still crawl; only `CCBot` is blocked at the crawl level. Real enforcement
  means Cloudflare's AI Crawl Control (dashboard feature) or WAF rules.
- **`content-index.json` is a build artifact.** It goes stale if pages are edited
  without re-running `scripts/build-content-index.py`. Wire it into your pre-push
  habit, or the MCP search will return outdated excerpts.
- **`--text-faint` contrast** (#968C76 on ivory, 3.19:1) remains below WCAG AA —
  unchanged, untouched by this work, still awaiting a decision.
