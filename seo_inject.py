#!/usr/bin/env python3
"""
MysticDo SEO/GEO injector — v0.3
For every HTML page, inject:
  - canonical link
  - og:url, og:site_name, og:locale, og:image, og:image:alt
  - twitter:card, twitter:title, twitter:description, twitter:image
  - article:modified_time / article:author (for article pages)
  - page-specific JSON-LD: Organization + WebSite (home), Article + FAQPage +
    BreadcrumbList (guides), BreadcrumbList (all subpages), WebApplication (daily card),
    ContactPage/AboutPage where relevant
Also generates sitemap.xml. Idempotent: strips a previously-injected block first.
"""
import os
import re
import json
import html as html_mod
from datetime import datetime

BASE = r"C:\Users\samja\Desktop\site\mysticdo"
BASE_URL = "https://mysticdo.com"

# The social card is served as PNG, not SVG. Google, Facebook, LinkedIn and
# Twitter all render SVG inconsistently (several will not render it at all),
# and every one of them re-encodes to a raster anyway - so shipping a
# pre-rendered PNG is what actually controls how the card looks in a SERP or a
# link preview.
OG_IMAGE = BASE_URL + "/assets/og/logo-card.png"
OG_IMAGE_ALT = "MysticDo — Match Your Spiritual Needs. Choose What to Do Next."

# Organization.logo should be the square brand mark, not the wide social card:
# Google crops this field to a square/round avatar in the knowledge panel.
PUBLISHER_LOGO = BASE_URL + "/assets/brand/mysticdo-mark-512.png"
PUBLISHER_LOGO_W = 512
PUBLISHER_LOGO_H = 512
PUBLISHED_DEFAULT = "2026-09-17"

# Segment -> nice breadcrumb name
SEG_NAMES = {
    "psychic": "Psychic",
    "tarot": "Tarot",
    "astrology": "Astrology",
    "medium": "Medium",
    "guides": "Guides",
    "quiz": "Quizzes",
    "questions": "Questions",
    "tools": "Free Tools",
    "love-relationships": "Love & Relationships",
    "career-work": "Career & Work",
    "money-wealth": "Money & Wealth",
    "life-direction": "Life Direction",
    "loss-closure": "Loss & Closure",
    "spiritual-growth": "Spiritual Growth",
    "do-what-fits.html": "Do What Fits",
}

# Pages that should NOT be indexed (redirect / 404)
NOINDEX_PAGES = {"quiz/find-your-path.html", "404.html"}

# Directories that are never part of the published site. `.assetsignore` keeps
# them off the CDN, so any canonical/sitemap entry pointing into them would be a
# link to a 404. Previously these were walked like real pages — which is how
# dev-only harness pages ended up in sitemap.xml.
NEVER_PUBLISH_DIRS = {
    "_design-check", "logo-drafts", "worker", "functions", "scripts",
    "node_modules", ".git", ".workbuddy", ".vscode", ".idea", ".wrangler",
}

# ---- helpers ----

def read(p):
    with open(p, "r", encoding="utf-8") as f:
        return f.read()

def write(p, s):
    with open(p, "w", encoding="utf-8") as f:
        f.write(s)

def extract_meta(html, name):
    """Get content of <meta name=...> or <meta property=...>.
    Uses backreference so a ' inside "..." doesn't terminate early."""
    m = re.search(r'<meta\s+(?:name|property)=["\']' + re.escape(name) + r'["\']\s+content=(["\'])(.*?)\1', html, re.IGNORECASE | re.DOTALL)
    return m.group(2) if m else ""

def extract_title(html):
    m = re.search(r'<title>(.*?)</title>', html, re.IGNORECASE | re.DOTALL)
    return m.group(1).strip() if m else ""

def clean_title(title):
    """Strip ' | MysticDo' suffix for a clean headline."""
    return re.sub(r'\s*\|\s*MysticDo\s*$', '', title).strip()

def extract_updated_date(html):
    """Find 'Updated: Month Year' -> ISO date (first of month)."""
    months = {
        "January": 1, "February": 2, "March": 3, "April": 4, "May": 5, "June": 6,
        "July": 7, "August": 8, "September": 9, "October": 10, "November": 11, "December": 12,
    }
    m = re.search(r'Updated:\s*([A-Z][a-z]+)\s+(\d{4})', html)
    if m and m.group(1) in months:
        return "%s-%02d-01" % (m.group(2), months[m.group(1)])
    return None

def extract_faqs(html):
    """Parse <details class=faq-item><summary>Q</summary><div class=faq-answer>A</div></details>"""
    faqs = []
    for m in re.finditer(r'<details class="faq-item">(.*?)</details>', html, re.DOTALL):
        block = m.group(1)
        qm = re.search(r'<summary>(.*?)</summary>', block, re.DOTALL)
        am = re.search(r'<div class="faq-answer">(.*?)</div>', block, re.DOTALL)
        if qm and am:
            q = html_unescape(strip_tags(qm.group(1))).strip()
            a = html_unescape(strip_tags(am.group(1))).strip()
            if q and a:
                faqs.append((q, a))
    return faqs

def strip_tags(s):
    return re.sub(r'<[^>]+>', '', s)

def html_unescape(s):
    return html_mod.unescape(s)

def path_to_url(rel):
    """Convert relative file path to URL path."""
    p = rel.replace("\\", "/")
    # normalize index.html -> /
    if p == "index.html":
        return "/"
    p = "/" + p
    # /psychic/index.html -> /psychic/
    p = re.sub(r'/index\.html$', '/', p)
    return p

def build_breadcrumbs(rel, title):
    """Return list of (name, url) crumbs."""
    crumbs = [("Home", BASE_URL + "/")]
    segs = [s for s in rel.replace("\\", "/").split("/") if s and s != "index.html"]
    cur = ""
    for i, seg in enumerate(segs):
        cur += "/" + seg
        if i < len(segs) - 1:  # intermediate
            name = SEG_NAMES.get(seg, seg.replace("-", " ").title())
            url = BASE_URL + (cur + "/").replace("/index.html", "/")
            # normalize index for dirs
            url = url.replace("/index.html", "/")
            if not url.endswith("/"):
                url = url + "/"
            crumbs.append((name, url))
        else:
            # last segment = current page
            if seg in SEG_NAMES:
                name = SEG_NAMES[seg]
            else:
                # derive from title
                name = clean_title(title)
            crumbs.append((name, BASE_URL + path_to_url(rel)))
    return crumbs

def breadcrumb_jsonld(crumbs):
    items = []
    for i, (name, url) in enumerate(crumbs, 1):
        items.append({"@type": "ListItem", "position": i, "name": name, "item": url})
    return {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": items}

def faq_jsonld(faqs):
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}}
            for q, a in faqs
        ],
    }

def article_jsonld(title, desc, url, date_mod, faqs_present):
    obj = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": clean_title(title),
        "description": desc,
        "datePublished": PUBLISHED_DEFAULT,
        "dateModified": date_mod or PUBLISHED_DEFAULT,
        "author": {"@type": "Organization", "name": "MysticDo Editorial", "url": BASE_URL + "/methodology.html"},
        "publisher": {
            "@type": "Organization", "name": "MysticDo",
            "logo": {
                "@type": "ImageObject", "url": PUBLISHER_LOGO,
                "width": PUBLISHER_LOGO_W, "height": PUBLISHER_LOGO_H,
            },
        },
        "mainEntityOfPage": {"@type": "WebPage", "@id": url},
        "image": OG_IMAGE,
        "isPartOf": {"@type": "WebSite", "name": "MysticDo", "url": BASE_URL + "/"},
        "about": {"@type": "Thing", "name": "Spiritual services decision guidance"},
    }
    return obj

def org_website_jsonld(desc):
    org = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "MysticDo",
        "url": BASE_URL + "/",
        "logo": {
            "@type": "ImageObject",
            "url": PUBLISHER_LOGO,
            "width": PUBLISHER_LOGO_W,
            "height": PUBLISHER_LOGO_H,
        },
        "description": desc,
        "sameAs": [],
    }
    site = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "MysticDo",
        "url": BASE_URL + "/",
        "description": desc,
        "inLanguage": "en",
        "publisher": {"@type": "Organization", "name": "MysticDo", "url": BASE_URL + "/"},
    }
    return [org, site]

def webapp_jsonld(title, desc, url):
    return {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": clean_title(title),
        "url": url,
        "description": desc,
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Web",
        "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"},
        "publisher": {"@type": "Organization", "name": "MysticDo", "url": BASE_URL + "/"},
    }

def webpage_jsonld(title, desc, url, extra_type=None):
    t = extra_type or "WebPage"
    obj = {
        "@context": "https://schema.org",
        "@type": t,
        "name": clean_title(title),
        "description": desc,
        "url": url,
        "isPartOf": {"@type": "WebSite", "name": "MysticDo", "url": BASE_URL + "/"},
        "publisher": {"@type": "Organization", "name": "MysticDo", "url": BASE_URL + "/"},
    }
    return obj

# ---- build the injected head block for a page ----

def build_head_block(rel, html, title, desc, is_noindex):
    url = BASE_URL + path_to_url(rel)
    date_mod = extract_updated_date(html)
    faqs = extract_faqs(html)

    parts = []
    parts.append('<!-- SEO-INJECTED-START -->')

    # PWA / mobile theming (all pages, including 404)
    parts.append('<link rel="manifest" href="/site.webmanifest">')
    parts.append('<meta name="theme-color" content="#FCFAF5">')

    # Agentic Resource Discovery pointer (ARD spec §6.1). The well-known path is
    # the primary mechanism; this <link> is the secondary one, for crawlers that
    # only ever read <head>. Harmless on noindex pages, so it is not conditional.
    # rel="ai-catalog" is the relation named by the ARD spec — no invented ones.
    parts.append('<link rel="ai-catalog" href="/.well-known/ai-catalog.json">')

    # canonical (skip on noindex)
    if is_noindex:
        parts.append('<meta name="robots" content="noindex, follow">')
    else:
        parts.append('<link rel="canonical" href="%s">' % url)

    # OG (always, even noindex pages can have OG for sharing — but noindex pages skip)
    if not is_noindex:
        og_title = extract_meta(html, "og:title") or clean_title(title)
        og_desc = extract_meta(html, "og:description") or desc
        parts.append('<meta property="og:url" content="%s">' % url)
        parts.append('<meta property="og:site_name" content="MysticDo">')
        parts.append('<meta property="og:locale" content="en_US">')
        parts.append('<meta property="og:image" content="%s">' % OG_IMAGE)
        parts.append('<meta property="og:image:alt" content="%s">' % OG_IMAGE_ALT)
        parts.append('<meta property="og:image:width" content="1200">')
        parts.append('<meta property="og:image:height" content="630">')
        # Twitter Card metadata intentionally omitted at launch: no @mysticdo
        # account exists, and the Open Graph tags above already cover link
        # previews on X/Twitter, Facebook, LinkedIn, and Slack. Re-add
        # twitter:card + twitter:site here once the X handle is registered.
        # article-specific meta (E-E-A-T for guide articles)
        if rel in (
            "guides/before-paying-psychic-reading.html",
            "guides/how-to-choose-psychic-reader.html",
            "guides/psychic-vs-tarot.html",
            "guides/psychic-reading-cost.html",
            "guides/is-online-psychic-legit.html",
            "guides/online-psychic-vs-in-person.html",
            "guides/tarot-reading-cost.html",
            "guides/how-to-choose-tarot-reader.html",
            "guides/tarot-vs-astrology.html",
            "guides/astrology-reading-vs-horoscope.html",
            "guides/how-to-choose-astrologer.html",
            "guides/birth-chart-reading-cost.html",
            "guides/psychic-vs-medium.html",
            "guides/medium-reading-guide.html",
        ):
            parts.append('<meta property="og:type" content="article">')
            parts.append('<meta property="article:published_time" content="%s">' % (PUBLISHED_DEFAULT + "T00:00:00+00:00"))
            parts.append('<meta property="article:modified_time" content="%s">' % ((date_mod or PUBLISHED_DEFAULT) + "T00:00:00+00:00"))
            parts.append('<meta property="article:author" content="MysticDo Editorial">')
            parts.append('<meta property="article:section" content="Spiritual Services Decision Guidance">')
            parts.append('<meta name="author" content="MysticDo Editorial">')

    # JSON-LD
    jsonld_blocks = []
    is_home = (rel in ("index.html", "index.htm"))
    is_guide_article = rel in (
        "guides/before-paying-psychic-reading.html",
        "guides/how-to-choose-psychic-reader.html",
        "guides/psychic-vs-tarot.html",
        "guides/psychic-reading-cost.html",
        "guides/is-online-psychic-legit.html",
        "guides/online-psychic-vs-in-person.html",
        "guides/tarot-reading-cost.html",
        "guides/how-to-choose-tarot-reader.html",
        "guides/tarot-vs-astrology.html",
        "guides/astrology-reading-vs-horoscope.html",
        "guides/how-to-choose-astrologer.html",
        "guides/birth-chart-reading-cost.html",
        "guides/psychic-vs-medium.html",
        "guides/medium-reading-guide.html",
    )
    is_daily_card = (rel == "tools/daily-card.html")
    is_contact = (rel == "contact.html")
    is_about = (rel == "about.html")
    is_methodology = (rel == "methodology.html")

    if is_home:
        jsonld_blocks.extend(org_website_jsonld(desc))
    elif is_guide_article:
        jsonld_blocks.append(article_jsonld(title, desc, url, date_mod, len(faqs) > 0))
        crumbs = build_breadcrumbs(rel, title)
        jsonld_blocks.append(breadcrumb_jsonld(crumbs))
        if faqs:
            jsonld_blocks.append(faq_jsonld(faqs))
    elif is_daily_card:
        jsonld_blocks.append(webapp_jsonld(title, desc, url))
        jsonld_blocks.append(breadcrumb_jsonld(build_breadcrumbs(rel, title)))
    elif is_contact:
        jsonld_blocks.append(webpage_jsonld(title, desc, url, "ContactPage"))
        jsonld_blocks.append(breadcrumb_jsonld(build_breadcrumbs(rel, title)))
    elif is_about:
        jsonld_blocks.append(webpage_jsonld(title, desc, url, "AboutPage"))
        jsonld_blocks.append(breadcrumb_jsonld(build_breadcrumbs(rel, title)))
    else:
        # default: WebPage + BreadcrumbList (skip noindex pages)
        if not is_noindex:
            jsonld_blocks.append(webpage_jsonld(title, desc, url))
            jsonld_blocks.append(breadcrumb_jsonld(build_breadcrumbs(rel, title)))

    for b in jsonld_blocks:
        parts.append('<script type="application/ld+json">' + json.dumps(b, ensure_ascii=False) + '</script>')

    parts.append('<!-- SEO-INJECTED-END -->')
    return "\n    " + "\n    ".join(parts) + "\n"

# ---- main ----

def main():
    # gather all html files (exclude 404 and find-your-path from sitemap; still inject meta to find-your-path as noindex)
    all_pages = []
    for root, dirs, files in os.walk(BASE):
        # skip node_modules, .workbuddy, .git
        dirs[:] = [d for d in dirs if d not in ("node_modules", ".workbuddy", ".git", "assets")]
        for fn in files:
            if fn.endswith(".html"):
                all_pages.append(os.path.relpath(os.path.join(root, fn), BASE))

    # also include index.html at root (excluded by assets dir filter — it's at root, fine)
    sitemap_entries = []

    for rel in sorted(all_pages):
        rel_norm = rel.replace("\\", "/")
        path = os.path.join(BASE, rel)
        h = read(path)

        # Dev-only pages: strip anything a previous run injected, then leave them
        # alone. They are never canonicalised and never enter the sitemap.
        if rel_norm.split("/")[0] in NEVER_PUBLISH_DIRS:
            h_clean = re.sub(r'\n?\s*<!-- SEO-INJECTED-START -->.*?<!-- SEO-INJECTED-END -->\n?', '', h, flags=re.DOTALL)
            if h_clean != h:
                write(path, h_clean)
                print("CLEANED (dev-only, unpublished): %s" % rel_norm)
            continue

        is_noindex = rel_norm in NOINDEX_PAGES

        title = extract_title(h)
        desc = extract_meta(h, "description")

        # strip any previously-injected block (idempotent)
        h_new = re.sub(r'\n?\s*<!-- SEO-INJECTED-START -->.*?<!-- SEO-INJECTED-END -->\n?', '', h, flags=re.DOTALL)

        block = build_head_block(rel_norm, h_new, title, desc, is_noindex)

        # insert before </head>
        h_new = h_new.replace('</head>', block + '</head>', 1)

        write(path, h_new)

        # sitemap entry
        if not is_noindex:
            url = BASE_URL + path_to_url(rel_norm)
            mt = os.path.getmtime(path)
            lastmod = datetime.utcfromtimestamp(mt).strftime("%Y-%m-%d")
            sitemap_entries.append((url, lastmod))
            print("INJECTED: %-55s -> %s" % (rel_norm, url))

    # write sitemap.xml
    sm = ['<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for url, lastmod in sorted(sitemap_entries):
        sm.append('  <url>')
        sm.append('    <loc>%s</loc>' % url)
        sm.append('    <lastmod>%s</lastmod>' % lastmod)
        sm.append('    <changefreq>weekly</changefreq>')
        sm.append('    <priority>%.1f</priority>' % (0.9 if url.rstrip('/').endswith('mysticdo.com') else 0.7))
        sm.append('  </url>')
    sm.append('</urlset>')
    write(os.path.join(BASE, "sitemap.xml"), "\n".join(sm))
    print("\nWrote sitemap.xml with %d URLs" % len(sitemap_entries))

if __name__ == "__main__":
    main()
