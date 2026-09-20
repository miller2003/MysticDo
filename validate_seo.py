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
    dirs[:] = [d for d in dirs if d not in ("node_modules", ".workbuddy", ".git", "assets")]
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

# 3. Validate robots.txt
rb_path = os.path.join(BASE, "robots.txt")
if os.path.exists(rb_path):
    with open(rb_path, encoding="utf-8") as f:
        rb = f.read()
    if "Sitemap:" in rb and "User-agent: GPTBot" in rb:
        ok.append("robots.txt: present, AI crawler allows + sitemap ref")
    else:
        warnings.append("robots.txt: missing AI crawler allow or sitemap ref")
else:
    errors.append("robots.txt: MISSING")

# 4. Validate llms.txt
lt_path = os.path.join(BASE, "llms.txt")
if os.path.exists(lt_path):
    ok.append("llms.txt: present (GEO)")
else:
    warnings.append("llms.txt: MISSING (GEO standard)")

# 5. Check internal links resolve to existing files
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
