#!/usr/bin/env python3
"""Deep SEO/GEO audit for the 6 love-relationship flagship articles.
Checks title length, description length, JSON-LD validity, heading
hierarchy, GEO signals, internal links, robots.txt, and more."""
import re, json, os
from html import unescape

BASE = r"C:\Users\samja\Desktop\site\mysticdo"
BASE_URL = "https://mysticdo.com"

ARTICLES = [
    "questions/love-relationships/does-he-love-me.html",
    "questions/love-relationships/does-he-think-about-me.html",
    "questions/love-relationships/does-my-crush-like-me-back.html",
    "questions/love-relationships/is-he-the-one.html",
    "questions/love-relationships/does-he-miss-me.html",
    "questions/love-relationships/is-he-serious-about-me.html",
]

def read(p):
    with open(p, "r", encoding="utf-8") as f:
        return f.read()

def extract_meta(html, name):
    m = re.search(r'<meta\s+(?:name|property)=["\']' + re.escape(name) + r'["\']\s+content=(["\'])(.*?)\1', html, re.IGNORECASE | re.DOTALL)
    return m.group(2) if m else ""

def strip_tags(s):
    return unescape(re.sub(r'<[^>]+>', '', s)).strip()

issues = []  # (severity, file, issue)
warnings = []

def err(f, msg):   issues.append((f, msg))
def warn(f, msg):  warnings.append((f, msg))

print("=" * 70)
print("DEEP SEO/GEO AUDIT — 6 Love-Relationship Flagship Articles")
print("=" * 70)

# ---- Per-article checks ----
for rel in ARTICLES:
    path = os.path.join(BASE, rel.replace("/", os.sep))
    html = read(path)
    slug = rel.split("/")[-1].replace(".html", "")
    short = slug[:30]

    print(f"\n--- {slug} ---")

    # 1. Title tag
    title = ""
    m = re.search(r'<title>(.*?)</title>', html, re.DOTALL)
    if m:
        title = m.group(1).strip()
        title_clean = strip_tags(title)
        tl = len(title_clean)
        # Google truncates ~60 mobile, ~65 desktop
        if tl > 65:
            err(rel, f"Title too long ({tl} chars, max 65): \"{title_clean[:70]}...\"")
        elif tl > 60:
            warn(rel, f"Title borderline ({tl} chars, ideal ≤60): \"{title_clean[:70]}\"")
        else:
            print(f"  Title: {tl} chars OK")
        # Check for | MysticDo suffix
        if "| MysticDo" not in title_clean:
            warn(rel, "Title missing '| MysticDo' brand suffix")
    else:
        err(rel, "No <title> tag found")

    # 2. Meta description
    desc = extract_meta(html, "description")
    if desc:
        desc_clean = strip_tags(desc)
        dl = len(desc_clean)
        if dl > 165:
            err(rel, f"Description too long ({dl} chars, max 165)")
        elif dl > 160:
            warn(rel, f"Description borderline ({dl} chars, ideal ≤160)")
        elif dl < 120:
            warn(rel, f"Description too short ({dl} chars, ideal 150-160)")
        else:
            print(f"  Description: {dl} chars OK")
    else:
        err(rel, "No meta description found")

    # 3. H1 count
    h1s = re.findall(r'<h1[^>]*>(.*?)</h1>', html, re.DOTALL | re.IGNORECASE)
    h1_count = len(h1s)
    if h1_count != 1:
        err(rel, f"Expected exactly 1 H1, found {h1_count}")
    else:
        h1_text = strip_tags(h1s[0])
        print(f"  H1: \"{h1_text[:50]}\"")

    # 4. Heading hierarchy (H1 → H2 → H3, no skipped levels)
    headings = re.findall(r'<(h[1-6])[^>]*>', html, re.IGNORECASE)
    prev_level = 0
    for h in headings:
        level = int(h[1])
        if prev_level > 0 and level > prev_level + 1:
            err(rel, f"Heading hierarchy skip: {h} after H{prev_level}")
        prev_level = level

    # 5. Canonical URL
    canonical = ""
    m = re.search(r'<link\s+rel="canonical"\s+href="([^"]+)"', html)
    if m:
        canonical = m.group(1)
        if not canonical.startswith("https://"):
            err(rel, f"Canonical not HTTPS: {canonical}")
        if canonical.endswith(".html"):
            err(rel, f"Canonical has .html extension: {canonical}")
        expected = f"{BASE_URL}/questions/love-relationships/{slug}"
        if canonical != expected:
            err(rel, f"Canonical mismatch: got {canonical}, expected {expected}")
        else:
            print(f"  Canonical: OK ({canonical})")
    else:
        err(rel, "No canonical link found")

    # 6. JSON-LD blocks
    jsonld_blocks = re.findall(r'<script\s+type="application/ld\+json">(.*?)</script>', html, re.DOTALL)
    types_found = []
    for block in jsonld_blocks:
        try:
            data = json.loads(block)
            t = data.get("@type", "")
            types_found.append(t)
            if t == "Article":
                required = ["headline", "description", "datePublished", "dateModified", "author", "publisher", "mainEntityOfPage", "image"]
                missing = [f for f in required if f not in data]
                if missing:
                    err(rel, f"Article JSON-LD missing fields: {missing}")
                # Check dateModified >= datePublished
                dp = data.get("datePublished", "")
                dm = data.get("dateModified", "")
                if dp and dm and dm < dp:
                    err(rel, f"dateModified ({dm}) < datePublished ({dp})")
                # Check author is Organization (not Person — E-E-A-T policy: no named persona)
                author = data.get("author", {})
                if isinstance(author, dict) and author.get("@type") == "Person":
                    err(rel, "Article author is Person — should be Organization (no named persona per E-E-A-T policy)")
            elif t == "BreadcrumbList":
                items = data.get("itemListElement", [])
                if len(items) < 3:
                    warn(rel, f"BreadcrumbList has only {len(items)} items (expected 4)")
                elif len(items) != 4:
                    warn(rel, f"BreadcrumbList has {len(items)} items (expected 4: Home/Questions/Love/Article)")
            elif t == "FAQPage":
                faqs = data.get("mainEntity", [])
                if len(faqs) < 4:
                    warn(rel, f"FAQPage has only {len(faqs)} Q&As (ideal ≥5 for rich snippet)")
                for fq in faqs:
                    if "name" not in fq or "acceptedAnswer" not in fq:
                        err(rel, "FAQ Q&A missing 'name' or 'acceptedAnswer'")
        except json.JSONDecodeError as e:
            err(rel, f"Invalid JSON-LD: {e}")
    print(f"  JSON-LD types: {types_found}")
    if "Article" not in types_found:
        err(rel, "Missing Article JSON-LD")
    if "BreadcrumbList" not in types_found:
        err(rel, "Missing BreadcrumbList JSON-LD")
    if "FAQPage" not in types_found:
        warn(rel, "Missing FAQPage JSON-LD (no FAQ rich snippet)")

    # 7. OG tags
    og_type = extract_meta(html, "og:type")
    og_url = extract_meta(html, "og:url")
    og_image = extract_meta(html, "og:image")
    og_image_w = extract_meta(html, "og:image:width")
    og_image_h = extract_meta(html, "og:image:height")
    if og_type != "article":
        err(rel, f"og:type should be 'article', got '{og_type}'")
    if not og_url:
        err(rel, "Missing og:url")
    if not og_image:
        err(rel, "Missing og:image")
    if og_image_w != "1200":
        err(rel, f"og:image:width should be 1200, got '{og_image_w}'")
    if og_image_h != "630":
        err(rel, f"og:image:height should be 630, got '{og_image_h}'")

    # 8. article:published_time and article:modified_time
    pub = extract_meta(html, "article:published_time")
    mod = extract_meta(html, "article:modified_time")
    if not pub:
        err(rel, "Missing article:published_time")
    if not mod:
        err(rel, "Missing article:modified_time")
    if pub and mod and mod < pub:
        err(rel, f"article:modified_time ({mod}) < article:published_time ({pub})")

    # 9. robots meta
    robots = extract_meta(html, "robots")
    if robots and "noindex" in robots:
        err(rel, f"robots meta has noindex — article won't be indexed: {robots}")

    # 10. Internal links to sibling articles
    sibling_slugs = [a.split("/")[-1].replace(".html", "") for a in ARTICLES if a != rel]
    links_to_siblings = []
    for sib in sibling_slugs:
        if f'href="/questions/love-relationships/{sib}"' in html or f'href="/questions/love-relationships/{sib}#"' in html:
            links_to_siblings.append(sib)
    if len(links_to_siblings) < 2:
        warn(rel, f"Only links to {len(links_to_siblings)} sibling articles (ideal ≥3 for topical authority)")
    else:
        print(f"  Sibling links: {len(links_to_siblings)}/{len(sibling_slugs)}")

    # 11. Images with missing alt
    imgs = re.findall(r'<img[^>]+>', html, re.IGNORECASE)
    for img in imgs:
        if 'alt=' not in img:
            err(rel, f"Image missing alt attribute: {img[:60]}")

    # 12. rel=preload for font
    if 'rel="preload"' not in html and "preload" not in html:
        warn(rel, "No font preload tag (performance)")

    # 13. viewport
    viewport = extract_meta(html, "viewport")
    if "viewport-fit=cover" not in (viewport or ""):
        warn(rel, "viewport meta missing viewport-fit=cover (notch/safe-area)")

# ---- Cross-article checks ----
print("\n" + "=" * 70)
print("CROSS-ARTICLE CHECKS")
print("=" * 70)

# 14. Duplicate meta descriptions
descs = {}
for rel in ARTICLES:
    html = read(os.path.join(BASE, rel.replace("/", os.sep)))
    d = extract_meta(html, "description")
    descs[rel] = strip_tags(d)
# Check for near-duplicates (same first 50 chars)
by_prefix = {}
for rel, d in descs.items():
    prefix = d[:50].lower()
    by_prefix.setdefault(prefix, []).append(rel)
for prefix, files in by_prefix.items():
    if len(files) > 1:
        err("CROSS", f"Duplicate description prefix ({len(files)} articles): {prefix[:40]}...")

# 15. Title uniqueness
titles = {}
for rel in ARTICLES:
    html = read(os.path.join(BASE, rel.replace("/", os.sep)))
    m = re.search(r'<title>(.*?)</title>', html, re.DOTALL)
    if m:
        titles[rel] = strip_tags(m.group(1))
# Check for keyword cannibalization (same primary keyword)
primary_kw = {}
for rel, t in titles.items():
    # Extract primary keyword (first part before ? or |)
    kw = re.split(r'[?|]', t)[0].strip().lower()
    primary_kw.setdefault(kw, []).append(rel)
for kw, files in primary_kw.items():
    if len(files) > 1:
        warn("CROSS", f"Keyword cannibalization risk — '{kw}' in {len(files)} titles")

print(f"\n  Title uniqueness: all {'unique' if len(set(titles.values())) == len(titles) else 'DUPLICATES FOUND'}")
print(f"  Description uniqueness: all {'unique' if len(set(descs.values())) == len(descs) else 'DUPLICATES FOUND'}")

# 16. robots.txt check
print("\n--- robots.txt ---")
robots_path = os.path.join(BASE, "robots.txt")
if os.path.exists(robots_path):
    robots_content = read(robots_path)
    has_sitemap = "Sitemap:" in robots_content or "sitemap" in robots_content.lower()
    has_gptbot = "GPTBot" in robots_content
    has_claudebot = "Claude-Bot" in robots_content or "ClaudeBot" in robots_content
    has_google_extended = "Google-Extended" in robots_content
    has_ccbot = "CCBot" in robots_content
    if not has_sitemap:
        err("robots.txt", "Missing Sitemap: directive (critical for crawl discovery)")
    else:
        print(f"  Sitemap directive: present")
    if not has_gptbot:
        warn("robots.txt", "GPTBot not configured (GEO: should be Allowed for AI search)")
    else:
        print(f"  GPTBot: configured")
    if not has_google_extended:
        warn("robots.txt", "Google-Extended not configured (GEO: should be Allowed for AI Overviews)")
    else:
        print(f"  Google-Extended: configured")
    if not has_ccbot:
        warn("robots.txt", "CCBot not configured (should be Disallowed per project policy)")
    else:
        print(f"  CCBot: configured")
else:
    err("robots.txt", "robots.txt file not found")

# 17. Sitemap entries
print("\n--- sitemap.xml ---")
sm_path = os.path.join(BASE, "sitemap.xml")
if os.path.exists(sm_path):
    sm = read(sm_path)
    for rel in ARTICLES:
        slug = rel.split("/")[-1].replace(".html", "")
        url = f"{BASE_URL}/questions/love-relationships/{slug}"
        if url not in sm:
            err("sitemap.xml", f"Missing URL: {url}")
        else:
            print(f"  {slug}: in sitemap OK")
else:
    err("sitemap.xml", "File not found")

# 18. llms.txt
print("\n--- llms.txt (GEO) ---")
llms_path = os.path.join(BASE, "llms.txt")
if os.path.exists(llms_path):
    llms = read(llms_path)
    for rel in ARTICLES:
        slug = rel.split("/")[-1].replace(".html", "")
        if slug not in llms and f"/questions/love-relationships/{slug}" not in llms:
            warn("llms.txt", f"Article not referenced: {slug}")
        else:
            print(f"  {slug}: referenced OK")
else:
    err("llms.txt", "File not found")

# 19. ai-catalog.json
print("\n--- /.well-known/ai-catalog.json (GEO) ---")
catalog_path = os.path.join(BASE, ".well-known", "ai-catalog.json")
if os.path.exists(catalog_path):
    try:
        catalog = json.loads(read(catalog_path))
        print(f"  ai-catalog.json: valid, {len(catalog.get('entries', catalog)) if isinstance(catalog, dict) else len(catalog)} entries")
    except:
        err("ai-catalog.json", "Invalid JSON")
else:
    warn(".well-known/ai-catalog.json", "File not found (GEO signal)")

# ---- Summary ----
print("\n" + "=" * 70)
print("SUMMARY")
print("=" * 70)
print(f"  Errors:   {len(issues)}")
print(f"  Warnings: {len(warnings)}")

if issues:
    print("\n--- ERRORS ---")
    for f, msg in issues:
        print(f"  [{os.path.basename(f)}] {msg}")

if warnings:
    print("\n--- WARNINGS ---")
    for f, msg in warnings:
        print(f"  [{os.path.basename(f)}] {msg}")

if not issues and not warnings:
    print("\n  ALL CHECKS PASSED — TOP-TIER SEO/GEO")
