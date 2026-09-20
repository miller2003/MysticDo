#!/usr/bin/env python3
"""Validate MysticDo SEO/GEO setup: JSON-LD validity, sitemap, canonical coverage, internal links."""
import os
import re
import json
import xml.dom.minidom as minidom
from urllib.parse import urlparse

BASE = r"C:\Users\samja\Desktop\site\mysticdo"

errors = []
warnings = []
ok = []

# 1. Validate JSON-LD on every page
jsonld_re = re.compile(r'<script type="application/ld\+json">(.*?)</script>', re.DOTALL)
all_pages = []
for root, dirs, files in os.walk(BASE):
    # `_design-check` and `email-templates` are excluded from deployment by
    # .assetsignore, so counting them here inflates every page-level metric and
    # produces h1 warnings for dev probe files that are never served.
    dirs[:] = [d for d in dirs if d not in
               ("node_modules", ".workbuddy", ".git", "assets", "_design-check", "email-templates")]
    for fn in files:
        if fn.endswith(".html"):
            all_pages.append(os.path.relpath(os.path.join(root, fn), BASE))

canonical_count = 0
manifest_count = 0
schema_count = 0
total_jsonld = 0
total_pages = len(all_pages)

for rel in sorted(all_pages):
    rel_norm = rel.replace("\\", "/")
    path = os.path.join(BASE, rel)
    with open(path, encoding="utf-8") as f:
        h = f.read()
    # canonical
    if 'rel="canonical"' in h:
        canonical_count += 1
    # manifest
    if 'rel="manifest"' in h:
        manifest_count += 1
    # JSON-LD blocks
    blocks = jsonld_re.findall(h)
    page_jsonld = 0
    for i, b in enumerate(blocks):
        try:
            obj = json.loads(b)
            total_jsonld += 1
            page_jsonld += 1
        except json.JSONDecodeError as e:
            errors.append(f"{rel_norm} JSON-LD block {i}: INVALID JSON — {e}")
    if page_jsonld > 0:
        schema_count += 1

ok.append(f"Pages with canonical: {canonical_count}/{total_pages}")
ok.append(f"Pages with manifest link: {manifest_count}/{total_pages}")
ok.append(f"Pages with JSON-LD: {schema_count}/{total_pages}")
ok.append(f"Total JSON-LD blocks (valid): {total_jsonld}")

# 2. Validate sitemap.xml
sm_path = os.path.join(BASE, "sitemap.xml")
if os.path.exists(sm_path):
    try:
        dom = minidom.parse(sm_path)
        urls = dom.getElementsByTagName("url")
        ok.append(f"sitemap.xml: valid XML, {len(urls)} URLs")
    except Exception as e:
        errors.append(f"sitemap.xml: INVALID XML — {e}")
else:
    errors.append("sitemap.xml: MISSING")

# Clean-URL aware URL -> file mapping, shared by every check below
# (/psychic/ -> psychic/index.html, /about -> about.html, /about.html -> about.html).
def url_to_file(url):
    """/psychic/ -> psychic/index.html, /do-what-fits.html -> do-what-fits.html,
    /do-what-fits -> do-what-fits.html (clean URLs are canonical; Cloudflare
    serves the extensionless form, so the checker must too)."""
    p = urlparse(url).path
    if not p or p == "/":
        return "index.html"
    p = p.lstrip("/")
    if p.endswith("/"):
        return os.path.join(p, "index.html")
    if "." not in os.path.basename(p):
        return p + ".html"
    return p


def url_is_on_disk(u):
    """True if the URL maps to a file, or is served by the Worker instead."""
    p = urlparse(u).path or "/"
    if p.startswith("/.well-known/") or p in ("/mcp", "/mcp/", "/auth.md"):
        return True          # answered by worker/index.js, never on disk
    return os.path.exists(os.path.join(BASE, url_to_file(u).replace("/", os.sep)))


sitemap_locs = []
if os.path.exists(sm_path):
    with open(sm_path, encoding="utf-8") as f:
        sitemap_locs = [m.strip() for m in re.findall(r"<loc>([^<]+)</loc>", f.read())]
_norm = lambda u: u.rstrip("/")

# 3. Validate robots.txt
#    Standalone baseline ("does the file exist") was not enough: a robots.txt can
#    be present and still wall off every AI crawler. These checks are about the
#    *crawl contract* rather than the file's existence.
rb_path = os.path.join(BASE, "robots.txt")

# Every token below is a search/answer/grounding channel that can carry a citation
# back to this site. The site's standing position is that none of them is blocked.
# Token spellings verified against the community list at
# github.com/ai-robots-txt/ai.robots.txt — do not add a token without checking it.
AI_ALLOW_TOKENS = [
    "Googlebot", "Bingbot", "DuckDuckBot", "Applebot", "PetalBot",
    "OAI-SearchBot", "PerplexityBot", "Claude-SearchBot", "DuckAssistBot",
    "Amazonbot", "AzureAI-SearchBot",
    "ChatGPT-User", "Perplexity-User", "Claude-User", "MistralAI-User",
    "meta-externalfetcher",
    "GPTBot", "ClaudeBot", "Google-Extended", "Applebot-Extended",
]
# Training-only corpora that return no search or answer channel. Only these may
# be refused outright; anything else being blocked is a citation channel lost.
AI_DENY_OK = ["CCBot"]


def parse_robots(text):
    """Minimal RFC 9309 parser -> (groups, sitemaps).

    groups is a list of (ua_list, [(field, value), ...]). Consecutive user-agent
    lines share one group; a user-agent line after rules have started opens the
    next group. Comment-only and blank lines are ignored, and '#' starts a
    comment anywhere on a line, exactly as the spec requires.
    """
    groups, sitemaps = [], []
    uas, rules = [], []

    def flush():
        if uas:
            groups.append((list(uas), list(rules)))

    for raw in text.splitlines():
        line = raw.split("#", 1)[0].strip()
        if not line or ":" not in line:
            continue
        field, _, value = line.partition(":")
        field, value = field.strip().lower(), value.strip()
        if field == "user-agent":
            if rules:            # rules already collected -> this starts a new group
                flush()
                uas.clear()
                rules.clear()
            uas.append(value)
        elif field in ("allow", "disallow"):
            rules.append((field, value))
        elif field == "sitemap":
            sitemaps.append(value)
    flush()
    return groups, sitemaps


if os.path.exists(rb_path):
    with open(rb_path, encoding="utf-8") as f:
        rb = f.read()
    rb_groups, rb_sitemaps = parse_robots(rb)

    ua_rules = {}
    for uas, rules in rb_groups:
        for ua in uas:
            ua_rules.setdefault(ua, []).extend(rules)

    # 3a. The wildcard group IS the guarantee that no AI search tool is blocked:
    #     any crawler not named explicitly falls back to it.
    star = ua_rules.get("*")
    if star is None:
        errors.append("robots.txt: no `User-agent: *` group — unnamed crawlers (incl. "
                      "newly launched AI crawlers) lose their default allow")
    else:
        if "/" not in [v for k, v in star if k == "allow"]:
            errors.append("robots.txt: wildcard group does not `Allow: /`")
        if "/" in [v for k, v in star if k == "disallow"]:
            errors.append("robots.txt: wildcard group contains `Disallow: /` — this "
                          "blocks every AI crawler that is not named below")

    # 3b. No citation-capable crawler may be refused outright.
    unlisted = []
    for token in AI_ALLOW_TOKENS:
        rules = ua_rules.get(token)
        if rules is None:
            unlisted.append(token)
            continue
        if any(v == "/" for k, v in rules if k == "disallow"):
            errors.append(f"robots.txt: {token} is refused with `Disallow: /` — a "
                          f"citation channel is closed")
    if unlisted:
        warnings.append(f"robots.txt: {len(unlisted)} key crawler(s) not listed "
                        f"explicitly (wildcard still allows them): {', '.join(unlisted)}")

    # 3c. A named group REPLACES the wildcard group — it does not inherit from it.
    #     So every Disallow in `*` must be repeated in each named group, or those
    #     crawlers silently gain access to the excluded path.
    if star is not None:
        star_deny = {v for k, v in star if k == "disallow"}
        gaps = []
        for uas, rules in rb_groups:
            if "*" in uas or not uas:
                continue
            deny = {v for k, v in rules if k == "disallow"}
            if "/" in deny:
                continue         # fully refused on purpose; nothing to inherit
            for path in sorted(star_deny):
                if path not in deny:
                    gaps.append(f"{uas[0]} missing Disallow: {path}")
        if gaps:
            warnings.append("robots.txt: named groups do not repeat the wildcard's "
                            "Disallow (named groups do not inherit): " + "; ".join(gaps[:6]))

    # 3d. Only intended training-only corpora may be refused.
    for uas, rules in rb_groups:
        if any(v == "/" for k, v in rules if k == "disallow"):
            for ua in uas:
                if ua != "*" and ua not in AI_DENY_OK:
                    warnings.append(f"robots.txt: {ua} is refused outright but is not in "
                                    f"the expected deny list {AI_DENY_OK}")

    # 3e. Required declarations.
    if not rb_sitemaps:
        errors.append("robots.txt: no Sitemap directive")
    if "Content-Signal:" not in rb:
        warnings.append("robots.txt: no Content-Signal declaration")
    ok.append(f"robots.txt: {len(rb_groups)} crawler groups, {len(AI_ALLOW_TOKENS)} "
              f"citation-capable tokens verified unblocked, {len(rb_sitemaps)} sitemap ref(s)")
else:
    errors.append("robots.txt: MISSING")

# 4. Validate llms.txt against the llmstxt.org v2 spec
#    The previous check only asserted the file existed, which is precisely why the
#    2026-09-20 defect (20 entries welded onto 4 lines) shipped unnoticed.
lt_path = os.path.join(BASE, "llms.txt")
lt_urls = []
if os.path.exists(lt_path):
    with open(lt_path, encoding="utf-8") as f:
        lt = f.read()
    lt_lines = lt.splitlines()

    # 4a. Required structure: exactly one H1, plus a blockquote summary.
    h1s = [l for l in lt_lines if re.match(r"^# \S", l)]
    if len(h1s) != 1:
        errors.append(f"llms.txt: expected exactly 1 H1, found {len(h1s)}")
    if not [l for l in lt_lines if l.startswith("> ")]:
        errors.append("llms.txt: missing the blockquote summary required by the spec")

    # 4b. Every file-list item must be a markdown hyperlink, one per line.
    #     This is the check that would have caught the welded-lines defect: after
    #     the .html suffix strip, URLs ran straight into the next entry's title
    #     (`.../quiz/astrology- Psychic quiz`), so no item parsed as a link.
    #
    #     Only lines AFTER the first H2 are file-list items. The detail block above
    #     them is prose and may legitimately contain inline links mid-sentence.
    first_h2 = next((i for i, l in enumerate(lt_lines) if l.startswith("## ")), None)
    item_re = re.compile(r"^- \[[^\]]+\]\((https?://[^)\s]+)\)(?:: .*)?$")
    # The weld signature, verbatim from the defect: `.../astrology- Psychic quiz`.
    weld_re = re.compile(r"https?://[^\s)]+-\s+[A-Z]")
    bad_items, welded, multi = [], [], []
    for i, line in enumerate(lt_lines, 1):
        urls_here = re.findall(r"https?://[^\s)]+", line)
        if len(urls_here) > 1:
            multi.append(f"L{i} ({len(urls_here)} URLs)")
        if weld_re.search(line):
            welded.append(f"L{i}")
        if first_h2 is not None and (i - 1) > first_h2 and line.startswith("- ") and "http" in line:
            if not item_re.match(line):
                bad_items.append(f"L{i}: {line[:70]}")
    if multi:
        errors.append("llms.txt: more than one URL on a single line (entries welded "
                      "together) on " + ", ".join(multi[:6]))
    if welded:
        errors.append("llms.txt: URL welded to following text on line(s) " + ", ".join(welded[:6]))
    if bad_items:
        errors.append("llms.txt: file-list items are not `- [name](url): notes` — "
                      + "; ".join(bad_items[:5]))

    # 4c. Every URL in the file must resolve.
    lt_urls = re.findall(r"\((https?://[^)\s]+)\)", lt)
    dead = [u for u in sorted(set(lt_urls)) if not url_is_on_disk(u)]
    if dead:
        errors.append(f"llms.txt: {len(dead)} link(s) point at nothing — " + "; ".join(dead[:6]))

    # 4d. Coverage: llms.txt must not silently fall behind the site.
    have = {_norm(u) for u in lt_urls}
    missing = [u for u in sitemap_locs if _norm(u) not in have]
    if missing:
        errors.append(f"llms.txt: {len(missing)} page(s) in sitemap.xml are not listed — "
                      + "; ".join(missing[:8]))
    else:
        ok.append(f"llms.txt: v2 structure valid, {len(set(lt_urls))} unique links, "
                  f"covers all {len(sitemap_locs)} sitemap pages")
else:
    errors.append("llms.txt: MISSING (GEO standard)")

# 4b-bis. llms-full.txt must exist and must not be stale.
lf_path = os.path.join(BASE, "llms-full.txt")
if not os.path.exists(lf_path):
    warnings.append("llms-full.txt: MISSING — run `npm run build:llms` to generate it")
else:
    with open(lf_path, encoding="utf-8") as f:
        lf = f.read()
    in_corpus = {_norm(u) for u in re.findall(r"^> Source: (\S+)", lf, re.M)}
    stale = [u for u in sitemap_locs if _norm(u) not in in_corpus]
    if stale:
        errors.append(f"llms-full.txt: STALE — {len(stale)} sitemap page(s) missing from the "
                      f"corpus; re-run `npm run build:llms`. Missing: " + "; ".join(stale[:6]))
    else:
        ok.append(f"llms-full.txt: current, all {len(sitemap_locs)} pages present "
                  f"({len(lf) // 1024}KB)")

# 5. Check internal links resolve to existing files

href_re = re.compile(r'href="((?:/)[^"#:]*)(?:#.*?)?"')
# Routes answered dynamically by the Worker (worker/index.js), not by files on
# disk — the filesystem check cannot see them, so whitelist them here.
WORKER_ROUTES = {
    "/.well-known/ai-catalog.json", "/.well-known/api-catalog",
    "/.well-known/openapi.json", "/.well-known/agent-skills",
    "/.well-known/mcp", "/api/health",
}
broken = []
checked = set()
for rel in sorted(all_pages):
    path = os.path.join(BASE, rel)
    with open(path, encoding="utf-8") as f:
        h = f.read()
    for m in href_re.finditer(h):
        link = m.group(1)
        if link in checked:
            continue
        checked.add(link)
        if link in WORKER_ROUTES:
            continue
        target = url_to_file(link)
        full = os.path.join(BASE, target.replace("/", os.sep))
        if not os.path.exists(full):
            broken.append(f"{link} (from {rel.replace(chr(92),'/')})")

if broken:
    errors.append(f"Broken internal links ({len(broken)}):")
    for b in broken[:20]:
        errors.append(f"  - {b}")
else:
    ok.append(f"Internal links: all resolve ({len(checked)} unique checked)")

# 6. h1 audit
h1_issues = []
for rel in sorted(all_pages):
    path = os.path.join(BASE, rel)
    with open(path, encoding="utf-8") as f:
        h = f.read()
    count = len(re.findall(r"<h1", h))
    if count != 1:
        h1_issues.append(f"{rel.replace(chr(92),'/')}: {count} h1 tags")
if h1_issues:
    warnings.append(f"h1 count issues: {h1_issues}")
else:
    ok.append(f"h1 audit: every page has exactly 1 h1 ({total_pages} pages)")

# 7. lang attribute
lang_issues = []
for rel in sorted(all_pages):
    path = os.path.join(BASE, rel)
    with open(path, encoding="utf-8") as f:
        first_line = f.read(200)
    if 'lang="en"' not in first_line and "lang='en'" not in first_line:
        lang_issues.append(rel.replace("\\", "/"))
if lang_issues:
    warnings.append(f"Missing lang=en: {lang_issues}")
else:
    ok.append(f"lang attribute: all pages have lang=en")

print("=" * 60)
print("MYSTICDO SEO/GEO VALIDATION REPORT")
print("=" * 60)
print("\n--- OK ---")
for o in ok:
    print("  " + o)
if warnings:
    print("\n--- WARNINGS ---")
    for w in warnings:
        print("  ! " + w)
if errors:
    print("\n--- ERRORS ---")
    for e in errors:
        print("  X " + e)
else:
    print("\n--- No errors ---")
print("\n" + "=" * 60)
print(f"SUMMARY: {len(ok)} ok, {len(warnings)} warnings, {len(errors)} errors")
print("=" * 60)
