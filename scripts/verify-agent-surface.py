#!/usr/bin/env python3
"""
MysticDo — agent-surface verification against a LIVE deployment.

Sibling of scripts/test-worker-agent-routes.mjs: that one runs the Worker in
process against a filesystem-backed asset binding, this one checks the thing
that actually shipped. Run it after every deploy — the local suite can be green
while the deployment is stale, mis-typed at the CDN, or missing a file that
`.assetsignore` swallowed.

Usage
-----
    python scripts/verify-agent-surface.py
    python scripts/verify-agent-surface.py https://mysticdo.<sub>.workers.dev

Exit codes: 0 all pass · 1 one or more failures

No third-party dependencies — stdlib only, so it runs anywhere Python does.
"""

import json
import hashlib
import os
import re
import ssl
import sys
import urllib.error
import urllib.parse
import urllib.request

ORIGIN = (sys.argv[1] if len(sys.argv) > 1 else "https://mysticdo.com").rstrip("/")
TIMEOUT = 20

# urllib defaults to `Python-urllib/3.x`, which Cloudflare (and most WAFs) classify
# as a scraper signature and answer with 403 + error 1010. That made every check in
# this file fail for the wrong reason — the site was reachable, the verifier was not.
# Identify honestly instead: a plain descriptive token passes, and if a network ever
# blocks this one too, override it with MYSTICDO_VERIFY_UA rather than editing here.
USER_AGENT = os.environ.get(
    "MYSTICDO_VERIFY_UA", "MysticDo-Verifier/1.0 (+https://mysticdo.com/methodology)"
)

CTX = ssl.create_default_context()

PASS, FAIL, WARN = [], [], []


def record(kind, name, ok, detail=""):
    bucket = {"pass": PASS, "fail": FAIL, "warn": WARN}[kind]
    bucket.append((name, ok, detail))


def check(name, ok, detail=""):
    record("fail" if not ok else "pass", name, ok, detail)


def warn(name, ok, detail=""):
    record("warn", name, ok, detail)


def request(path, method="GET", headers=None, body=None):
    url = path if path.startswith("http") else ORIGIN + path
    req = urllib.request.Request(url, method=method, data=body)
    req.add_header("User-Agent", USER_AGENT)
    # Caller-supplied headers win, so a test can deliberately probe another identity.
    for k, v in (headers or {}).items():
        req.add_header(k, v)
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT, context=CTX) as res:
            return res.status, dict(res.headers), res.read()
    except urllib.error.HTTPError as e:
        return e.code, dict(e.headers), e.read()
    except Exception as e:  # noqa: BLE001 - network failures are test outcomes here
        return 0, {}, str(e).encode()


def get_json(path, headers=None):
    status, hdrs, body = request(path, headers=headers)
    try:
        return status, hdrs, json.loads(body.decode("utf-8", "replace"))
    except Exception:  # noqa: BLE001
        return status, hdrs, None


def ctype(hdrs):
    return (hdrs.get("Content-Type") or hdrs.get("content-type") or "").split(";")[0].strip().lower()


def header(hdrs, name):
    for k, v in hdrs.items():
        if k.lower() == name.lower():
            return v
    return ""


print("Verifying agent surface at %s\n" % ORIGIN)

# ── 1. Link response headers (RFC 8288) ─────────────────────────────────────
status, hdrs, body = request("/")
link = header(hdrs, "Link")
check("GET / → 200", status == 200, "status=%s" % status)
for rel in ("api-catalog", "service-desc", "service-doc", "service-meta", "status"):
    check('Link: rel="%s"' % rel, ('rel="%s"' % rel) in link, link[:180])

# ── 2. Discovery documents ──────────────────────────────────────────────────
status, hdrs, doc = get_json("/.well-known/api-catalog")
check("api-catalog → 200", status == 200, "status=%s" % status)
check("api-catalog Content-Type = application/linkset+json",
      ctype(hdrs) == "application/linkset+json", ctype(hdrs))
check("api-catalog linkset[] non-empty",
      bool(doc and isinstance(doc.get("linkset"), list) and doc["linkset"]))

status, hdrs, ard = get_json("/.well-known/ai-catalog.json")
check("ai-catalog.json → 200", status == 200, "status=%s" % status)
check("ai-catalog Content-Type = application/json", ctype(hdrs) == "application/json", ctype(hdrs))
check("ai-catalog Access-Control-Allow-Origin = *", header(hdrs, "Access-Control-Allow-Origin") == "*")
check("ai-catalog specVersion non-empty", bool(ard and ard.get("specVersion")))
entries = (ard or {}).get("entries") or []
check("ai-catalog entries non-empty", bool(entries), "n=%d" % len(entries))
check("ai-catalog every entry has exactly one of url|data",
      all(bool(e.get("url")) != bool(e.get("data")) for e in entries))
check("ai-catalog identifiers match urn:air:<fqdn>:<ns>:<name>",
      all(re.match(r"^urn:air:mysticdo\.com:[^:]+:[^:]+$", e.get("identifier", "")) for e in entries))
check("ai-catalog every entry has 2-5 representativeQueries",
      all(isinstance(e.get("representativeQueries"), list) and 2 <= len(e["representativeQueries"]) <= 5
          for e in entries))

status, hdrs, openapi = get_json("/.well-known/openapi.json")
check("openapi.json → 200", status == 200, "status=%s" % status)
check("openapi declares 3.1", str((openapi or {}).get("openapi", "")).startswith("3.1"))

# ── 3. MCP server card + endpoint ───────────────────────────────────────────
status, hdrs, card = get_json("/.well-known/mcp/server-card.json")
check("mcp/server-card.json → 200", status == 200, "status=%s" % status)
check("server card serverInfo.name", bool((card or {}).get("serverInfo", {}).get("name")))
check("server card serverInfo.version", bool((card or {}).get("serverInfo", {}).get("version")))
endpoint = (card or {}).get("endpoint", "")
check("server card endpoint under this origin",
      endpoint.startswith(ORIGIN), endpoint)

if endpoint.startswith("http"):
    payload = json.dumps({"jsonrpc": "2.0", "id": 1, "method": "tools/list"}).encode()
    status, hdrs, body = request(endpoint, method="POST",
                                 headers={"Content-Type": "application/json"}, body=payload)
    ok_json = False
    tools = []
    try:
        parsed = json.loads(body.decode("utf-8", "replace"))
        tools = parsed.get("result", {}).get("tools", [])
        ok_json = bool(tools)
    except Exception:  # noqa: BLE001
        pass
    check("advertised MCP endpoint answers tools/list", ok_json and status == 200,
          "status=%s tools=%d" % (status, len(tools)))
    check("every advertised MCP tool has name + inputSchema",
          all(t.get("name") and t.get("inputSchema") for t in tools))

# ── 4. Agent Skills index + artifact digests ────────────────────────────────
status, hdrs, idx = get_json("/.well-known/agent-skills/index.json")
check("agent-skills/index.json → 200", status == 200, "status=%s" % status)
check("agent-skills $schema is v0.2.0",
      (idx or {}).get("$schema") == "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
      str((idx or {}).get("$schema")))
skills = (idx or {}).get("skills") or []
check("agent-skills skills[] non-empty", bool(skills), "n=%d" % len(skills))

for skill in skills:
    url = skill.get("url", "")
    full = url if url.startswith("http") else ORIGIN + url
    status, hdrs, body = request(full)
    digest = "sha256:" + hashlib.sha256(body).hexdigest()
    check("digest matches artifact for %s" % skill.get("name"), digest == skill.get("digest"),
          "%s vs %s" % (digest, skill.get("digest")))
    check("%s served as text/markdown" % skill.get("name"),
          ctype(hdrs) == "text/markdown", ctype(hdrs))

# ── 5. auth.md + OAuth metadata ─────────────────────────────────────────────
status, hdrs, body = request("/auth.md")
text = body.decode("utf-8", "replace")
check("/auth.md → 200", status == 200, "status=%s" % status)
check("/auth.md served as text/markdown", ctype(hdrs) == "text/markdown", ctype(hdrs))
check('/auth.md H1 contains "auth.md"', bool(re.search(r"^#\s+.*auth\.md", text, re.I | re.M)),
      text.splitlines()[0] if text else "")

status, hdrs, oas = get_json("/.well-known/oauth-authorization-server")
check("oauth-authorization-server → 200", status == 200, "status=%s" % status)
for field in ("issuer", "authorization_endpoint", "token_endpoint", "jwks_uri",
              "grant_types_supported", "response_types_supported"):
    check("AS metadata has %s" % field, bool((oas or {}).get(field)))

status, hdrs, prm = get_json("/.well-known/oauth-protected-resource")
check("oauth-protected-resource → 200", status == 200, "status=%s" % status)
check("PRM has resource", bool((prm or {}).get("resource")))
check("PRM has authorization_servers[]", bool((prm or {}).get("authorization_servers")))
check("PRM bearer_methods_supported includes header",
      "header" in ((prm or {}).get("bearer_methods_supported") or []))

status, hdrs, jwks_doc = get_json("/.well-known/jwks.json")
check("jwks.json → 200 with keys[]", status == 200 and isinstance((jwks_doc or {}).get("keys"), list))

# Live token round-trip. Registration is stateless, so this leaves no residue.
payload = json.dumps({
    "client_name": "mysticdo-verify-script",
    "redirect_uris": ["http://127.0.0.1:8799/callback"],
    "scope": "mysticdo:read",
}).encode()
status, hdrs, body = request("/oauth/register", method="POST",
                             headers={"Content-Type": "application/json"}, body=payload)
check("POST /oauth/register → 201", status == 201, "status=%s" % status)
client_id = ""
try:
    client_id = json.loads(body.decode("utf-8", "replace")).get("client_id", "")
except Exception:  # noqa: BLE001
    pass
check("registration issues a client_id", client_id.startswith("mc_"))

form = urllib.parse.urlencode({"grant_type": "client_credentials", "scope": "mysticdo:read"}).encode()
status, hdrs, body = request("/oauth/token", method="POST",
                             headers={"Content-Type": "application/x-www-form-urlencoded"}, body=form)
token = ""
try:
    token = json.loads(body.decode("utf-8", "replace")).get("access_token", "")
except Exception:  # noqa: BLE001
    pass
check("POST /oauth/token → access_token", status == 200 and token.startswith("mt_"),
      "status=%s" % status)

# Redirect-URI policy must hold in production, not just locally.
payload = json.dumps({"redirect_uris": ["https://attacker.example/cb"]}).encode()
status, hdrs, body = request("/oauth/register", method="POST",
                             headers={"Content-Type": "application/json"}, body=payload)
check("registration rejects a third-party redirect_uri", status == 400, "status=%s" % status)

# ── 6. Content Signals + Agentmap ───────────────────────────────────────────
status, hdrs, body = request("/robots.txt")
robots = body.decode("utf-8", "replace")
check("robots.txt → 200", status == 200, "status=%s" % status)
m = re.search(r"^Content-Signal:\s*(.+)$", robots, re.M)
check("robots.txt declares Content-Signal", bool(m), m.group(1) if m else "")
if m:
    signal = m.group(1)
    for token in ("ai-train", "search", "ai-input"):
        check("Content-Signal declares %s" % token, token in signal, signal)
check("robots.txt declares Agentmap",
      bool(re.search(r"^Agentmap:\s*\S+", robots, re.M)))

# ── 6b. llms.txt / llms-full.txt exactly as served ──────────────────────────
# validate_seo.py inspects these files in the repo. This inspects the bytes the
# CDN returns, which is a different question: a file can be perfect on disk and
# still be swallowed by .assetsignore, or served with a mangled content type.
status, hdrs, body = request("/llms.txt")
llms = body.decode("utf-8", "replace")
check("llms.txt → 200", status == 200, "status=%s" % status)
check("llms.txt has exactly one H1", len(re.findall(r"^# \S", llms, re.M)) == 1)
check("llms.txt has a blockquote summary", bool(re.search(r"^> \S", llms, re.M)))
if status == 200:
    first_h2 = llms.find("\n## ")
    items = ([l for l in llms[first_h2:].splitlines() if l.startswith("- ") and "http" in l]
             if first_h2 >= 0 else [])
    # The 2026-09-20 welded-lines defect surfaces right here: after the .html strip
    # the URLs ran into the next entry's title, so no item parsed as a link.
    check("llms.txt file-list items are markdown links",
          bool(items) and all(re.match(r"^- \[[^\]]+\]\(https?://[^)\s]+\)", l) for l in items),
          "n=%d" % len(items))
    check("llms.txt has no line with two URLs",
          not any(len(re.findall(r"https?://[^\s)]+", l)) > 1 for l in llms.splitlines()))

    # Every page the index advertises must actually answer. Worker routes and
    # static assets are skipped — they already have their own checks above.
    pages = [u for u in sorted(set(re.findall(r"\((https?://[^)\s]+)\)", llms)))
             if not re.search(r"/(\.well-known|assets)/", u)
             and u.rstrip("/") not in ("https://mysticdo.com/mcp", "https://mysticdo.com/auth.md")]
    dead = []
    for u in pages:
        s, _, _ = request(u)
        if s >= 400:
            dead.append("%s→%s" % (u, s))
    # `pages` must be non-empty: an index whose links cannot be extracted at all
    # would otherwise pass this check vacuously.
    check("every llms.txt page link resolves live", bool(pages) and not dead,
          "%d checked; dead: %s" % (len(pages), "; ".join(dead[:4])))

status, hdrs, body = request("/llms-full.txt")
check("llms-full.txt → 200", status == 200, "status=%s" % status)
check("llms-full.txt is substantial", status == 200 and len(body) > 100_000,
      "%d bytes" % len(body))

# ── 7. Content layer ────────────────────────────────────────────────────────
status, hdrs, body = request("/assets/data/content-index.json")
check("content-index.json → 200", status == 200, "status=%s" % status)
check("content-index Content-Type = application/json", ctype(hdrs) == "application/json", ctype(hdrs))
try:
    ci = json.loads(body.decode("utf-8", "replace"))
    check("content-index has a non-empty pages[]", bool(ci.get("pages")),
          "pages=%d" % len(ci.get("pages") or []))
    samples = [p["url"] for p in (ci.get("pages") or []) if p.get("url")]
    missing = []
    for path in samples:
        st, _, _ = request(path, method="HEAD")
        if st != 200:
            missing.append("%s(%s)" % (path, st))
    check("every indexed URL resolves", not missing, ", ".join(missing[:5]))
except Exception as e:  # noqa: BLE001
    check("content-index parses as JSON", False, str(e))

status, hdrs, body = request("/guides/psychic-vs-tarot.html", headers={"Accept": "text/markdown"})
md = body.decode("utf-8", "replace")
check(".html page negotiates to text/markdown", ctype(hdrs) == "text/markdown", ctype(hdrs))
check("markdown body has no <html> shell", "<html" not in md.lower())
check("markdown response carries the Link header",
      'rel="api-catalog"' in header(hdrs, "Link"))

status, hdrs, body = request("/this-page-does-not-exist-xyz")
check("unknown path → 404", status == 404, "status=%s" % status)

status, hdrs, body = request("/api/health")
check("/api/health → 200", status == 200, "status=%s" % status)

# ── 8. DNS-AID (DNS over HTTPS) ─────────────────────────────────────────────
host = urllib.parse.urlparse(ORIGIN).hostname or "mysticdo.com"
if host.endswith("mysticdo.com"):
    for name, rrtype in (("_index._agents.%s" % host, "SVCB"),
                         ("_catalog._agents.%s" % host, "TXT")):
        url = "https://cloudflare-dns.com/dns-query?name=%s&type=%s" % (
            urllib.parse.quote(name), rrtype)
        status, hdrs, body = request(url, headers={"Accept": "application/dns-json"})
        found = False
        try:
            answer = json.loads(body.decode("utf-8", "replace")).get("Answer") or []
            found = bool(answer)
        except Exception:  # noqa: BLE001
            pass
        if found:
            check("DNS-AID record present: %s %s" % (name, rrtype), True)
        else:
            warn("DNS-AID record missing: %s %s" % (name, rrtype), False,
                 "publish it in Cloudflare DNS — see AGENT_READINESS.md")
else:
    warn("DNS-AID check skipped (not an apex domain)", True, host)

# ── report ──────────────────────────────────────────────────────────────────
for name, ok, detail in PASS:
    print("  PASS  %s" % name)
for name, ok, detail in WARN:
    print("  WARN  %s%s" % (name, ("\n          → " + detail) if detail else ""))
for name, ok, detail in FAIL:
    print("  FAIL  %s%s" % (name, ("\n          → " + detail) if detail else ""))

total = len(PASS) + len(FAIL) + len(WARN)
print("\n" + "=" * 66)
print("  %d passed, %d failed, %d warnings, %d total" % (len(PASS), len(FAIL), len(WARN), total))
print("=" * 66)

sys.exit(1 if FAIL else 0)
