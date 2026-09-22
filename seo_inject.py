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
    WebApplication + Article.mentions (pattern-check question pages),
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

# Per-page publish dates for the 2026-09-18..20 content batch.
# Staggered so the sitemap and JSON-LD reflect a natural multi-day rollout
# rather than 40 pages appearing on one day.
PUBLISH_DATES = {
    "questions/angel-numbers/1111-meaning.html": "2026-09-18",
    "questions/angel-numbers/222-meaning.html": "2026-09-18",
    "questions/angel-numbers/333-meaning.html": "2026-09-20",
    "questions/angel-numbers/444-meaning.html": "2026-09-20",
    "questions/angel-numbers/555-meaning.html": "2026-09-21",
    "questions/angel-numbers/777-meaning.html": "2026-09-21",
    "questions/angel-numbers/888-meaning.html": "2026-09-22",
    "questions/angel-numbers/angel-numbers-meaning.html": "2026-09-18",
    "questions/angel-numbers/what-is-my-angel-number.html": "2026-09-20",
    "questions/astrology/mercury-retrograde-meaning.html": "2026-09-19",
    "questions/astrology/what-is-my-moon-sign.html": "2026-09-22",
    "questions/astrology/what-is-my-rising-sign.html": "2026-09-19",
    "questions/astrology/what-is-my-saturn-return.html": "2026-09-22",
    "questions/astrology/zodiac-compatibility.html": "2026-09-20",
    "questions/career-work/am-i-in-the-right-career.html": "2026-09-22",
    "questions/career-work/should-i-quit-my-job.html": "2026-09-18",
    "questions/career-work/will-i-get-the-job.html": "2026-09-18",
    "questions/dreams/dream-about-being-chased.html": "2026-09-22",
    "questions/dreams/dream-about-snakes.html": "2026-09-20",
    "questions/dreams/dream-about-someone-dying.html": "2026-09-22",
    "questions/dreams/dream-about-teeth-falling-out.html": "2026-09-19",
    "questions/dreams/dream-about-your-ex.html": "2026-09-22",
    "questions/life-direction/feeling-lost-in-life.html": "2026-09-22",
    "questions/life-direction/what-is-my-life-purpose.html": "2026-09-20",
    "questions/loss-closure/signs-from-deceased-loved-ones.html": "2026-09-21",
    "questions/loss-closure/dream-about-deceased-loved-one.html": "2026-09-21",
    "questions/loss-closure/is-my-loved-one-watching-over-me.html": "2026-09-21",
    "questions/money-wealth/why-am-i-always-broke.html": "2026-09-21",
    "questions/money-wealth/will-i-be-rich.html": "2026-09-21",
    "questions/tarot/lovers-card-meaning.html": "2026-09-22",
    "questions/tarot/tarot-yes-or-no.html": "2026-09-22",
    "questions/tarot/tower-card-meaning.html": "2026-09-22",
    "questions/love-relationships/am-i-in-love.html": "2026-09-19",
    "questions/love-relationships/does-he-like-me.html": "2026-09-19",
    "questions/love-relationships/how-to-get-over-someone.html": "2026-09-18",
    "questions/love-relationships/is-he-cheating.html": "2026-09-20",
    "questions/love-relationships/should-i-break-up.html": "2026-09-20",
    "questions/love-relationships/should-i-text-him.html": "2026-09-20",
    "questions/love-relationships/twin-flame-separation.html": "2026-09-19",
    "questions/love-relationships/when-will-i-meet-my-soulmate.html": "2026-09-19",
    "questions/love-relationships/who-is-my-soulmate.html": "2026-09-19",
    "questions/love-relationships/will-he-come-back.html": "2026-09-20",
    "questions/signs/owl-meaning.html": "2026-09-20",
    "questions/spiritual-growth/am-i-an-empath.html": "2026-09-20",
    "questions/spiritual-growth/am-i-cursed.html": "2026-09-19",
    "questions/spiritual-growth/am-i-psychic.html": "2026-09-19",
    "questions/spiritual-growth/how-to-know-your-past-life.html": "2026-09-20",
    "questions/spiritual-growth/what-is-my-spirit-animal.html": "2026-09-20",
    "questions/tarot/death-card-meaning.html": "2026-09-18",
    "guides/dark-night-of-the-soul.html": "2026-09-18",
    "guides/evil-eye-meaning.html": "2026-09-20",
    "guides/full-moon-ritual.html": "2026-09-20",
    "guides/how-to-manifest-money.html": "2026-09-18",
    "guides/how-to-manifest.html": "2026-09-18",
    "guides/how-to-open-your-third-eye.html": "2026-09-18",
    "guides/how-to-read-tarot.html": "2026-09-19",
    "guides/new-moon-ritual.html": "2026-09-19",
    "guides/what-are-chakras.html": "2026-09-19",
    "guides/what-are-synchronicities.html": "2026-09-18",
    "guides/what-is-shadow-work.html": "2026-09-18",
}

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
    "do-what-fits": "Do What Fits",
    "angel-numbers": "Angel Numbers",
    "dreams": "Dreams",
    "signs": "Signs",
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
    "email-templates",
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
    for m in re.finditer(r'<details[^>]*class=["\'][^"\']*faq-item[^"\']*["\'][^>]*>(.*?)</details>', html, re.DOTALL):
        block = m.group(1)
        qm = re.search(r'<summary[^>]*>(.*?)</summary>', block, re.DOTALL)
        am = re.search(r'<div[^>]*class=["\'][^"\']*faq-answer[^"\']*["\'][^>]*>(.*?)</div>', block, re.DOTALL)
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
    # Cloudflare auto-trailing-slash serves /about for about.html and 308s the
    # .html form, so every published URL must be extension-less.
    p = re.sub(r'\.html$', '', p)
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

def article_jsonld(title, desc, url, date_mod, faqs_present, pub_date=None):
    obj = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": clean_title(title),
        "description": desc,
        "datePublished": pub_date or PUBLISHED_DEFAULT,
        "dateModified": date_mod or pub_date or PUBLISHED_DEFAULT,
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

# Question article pages that mount an interactive pattern check
# (<div data-quiz ... data-quiz-modal>). Each gets an extra WebApplication
# JSON-LD entity plus an Article "mentions" reference, so AI systems can see
# the page ships an interactive, personalized tool — the "citation-to-click"
# surface: an AI answer can summarize the article, but only the page can run
# the check. Descriptions must stay honest: personalized from the user's own
# answers, free, runs in the browser, nothing stored or sent.
QUIZ_TOOL_PAGES = {
    "questions/love-relationships/does-he-love-me.html": {
        "name": "Does He Love Me Pattern Check",
        "description": ("A free, interactive two-minute self-check. You answer eight questions about "
            "your own relationship — what changed, how his behavior runs across weeks, and what you most "
            "want to know — and it reads your answers into one of five behavior patterns (steady investment, "
            "inconsistent engagement, words over actions, early-stage ambiguity, one-sided maintenance), ending "
            "on a next step that fits. Personalized from your answers rather than a fixed signs list; runs in "
            "your browser and never stores or sends anything."),
    },
    "questions/love-relationships/does-he-think-about-me.html": {
        "name": "Does He Think About Me Pattern Check",
        "description": ("A free, interactive two-minute self-check. Eight questions map why this question is "
            "on your mind, what the pattern of his contact and recall looks like, and what you want to happen "
            "next — then return a personalized read of what that pattern may suggest, where it stops, and what "
            "to watch. Works from your own answers rather than a fixed article; runs in your browser and never "
            "stores or sends anything."),
    },
    "questions/love-relationships/does-my-crush-like-me-back.html": {
        "name": "Does My Crush Like Me Back Pattern Check",
        "description": ("A free, interactive two-minute self-check for early-stage connections. Eight questions "
            "cover what has actually happened between you so far and what you want to happen next; your answers "
            "produce a personalized read of the signals available — saying plainly when there isn't enough data "
            "yet — plus a concrete next step. Runs in your browser; nothing is stored or sent."),
    },
    "questions/love-relationships/is-he-the-one.html": {
        "name": "Is He the One Pattern Check",
        "description": ("A free, interactive two-minute self-check. Eight questions surface what your own "
            "reactions already track — the relationship's directional behavior, what you are hoping for, and what "
            "you would need to feel sure — and return a personalized read of what the pattern supports and what "
            "it cannot settle, with a next step. It never issues a verdict; runs in your browser and never stores "
            "or sends anything."),
    },
    "questions/love-relationships/does-he-miss-me.html": {
        "name": "Does He Miss Me Pattern Check",
        "description": ("A free, interactive two-minute self-check. Eight questions look at how the distance sits "
            "with you, what his behavior across it actually shows, and what reaching out would be for — then give "
            "a personalized read of the pattern and a next step, which may be reaching out, waiting a defined "
            "window, or letting go. It reads your answers, not his mind; runs in your browser and never stores or "
            "sends anything."),
    },
    "questions/love-relationships/is-he-serious-about-me.html": {
        "name": "Is He Serious About Me Pattern Check",
        "description": ("A free, interactive two-minute self-check. Eight questions cover how his investment looks "
            "over time, where his words and actions diverge, and what would make you feel sure; your answers return "
            "a personalized read of whether his behavior reads as intention or comfort, plus a next step that fits. "
            "Runs in your browser and never stores or sends anything."),
    },
    "questions/love-relationships/how-to-get-over-someone.html": {
        "name": "How to Get Over Someone Pattern Check",
        "description": ("A free, interactive two-minute self-check. Eight questions surface what your own recovery "
            "already tracks — the phase you are in, whether idealization is still intact, and what would genuinely "
            "move it versus what would only reset it — and return a personalized read and a next step. It never "
            "issues a verdict; runs in your browser and never stores or sends anything."),
    },
    "questions/love-relationships/should-i-break-up.html": {
        "name": "Should I Break Up Pattern Check",
        "description": ("A free, interactive two-minute self-check. Eight questions surface what your own experience "
            "already tracks — whether the doubt is healthy, whether the relationship is repairable, and what kind "
            "of mismatch is at play — and return a personalized read of what the pattern supports and what it cannot "
            "settle, with a next step. It never issues a verdict; runs in your browser and never stores or sends anything."),
    },
    "questions/love-relationships/does-he-like-me.html": {
        "name": "Does He Like Me Pattern Check",
        "description": ("A free, interactive two-minute self-check. Eight questions surface what your own observations "
            "already track — whether there is genuine interest, what kind of interest, and what your own hope may be "
            "adding — and return a personalized read of what the pattern supports and what it cannot settle, with a "
            "next step. It never issues a verdict; runs in your browser and never stores or sends anything."),
    },
    "questions/love-relationships/should-i-text-him.html": {
        "name": "Should I Text Him Pattern Check",
        "description": ("A free, interactive two-minute self-check. Eight questions surface what your own situation "
            "already tracks — the initiative balance, how it will land, and whether silence is itself information — "
            "and return a personalized read of what the pattern supports and what it cannot settle, with a next step. "
            "It never issues a verdict; runs in your browser and never stores or sends anything."),
    },
    "questions/love-relationships/am-i-in-love.html": {
        "name": "Am I in Love Pattern Check",
        "description": ("A free, interactive two-minute self-check. Eight questions surface what your own experience "
            "already tracks — whether what you feel is infatuation, attachment, or love, and what survives the early "
            "intensity — and return a personalized read of the pattern and the next step that fits. It never issues a "
            "verdict; runs in your browser and never stores or sends anything."),
    },
    "questions/love-relationships/who-is-my-soulmate.html": {
        "name": "Who Is My Soulmate Pattern Check",
        "description": ("A free, interactive two-minute self-check. Eight questions surface what your own experience "
            "already tracks — whether you are seeking a specific person, a recognition, or a concept that may not "
            "hold up — and return a personalized read of the pattern and the next step that fits. It never issues a "
            "verdict; runs in your browser and never stores or sends anything."),
    },
    "questions/love-relationships/when-will-i-meet-my-soulmate.html": {
        "name": "When Will I Meet My Soulmate Pattern Check",
        "description": ("A free, interactive two-minute self-check. Eight questions surface what your own situation "
            "already tracks — whether you are seeking a forecast the question cannot give, managing waiting, or "
            "engaging a self-blame pattern — and return a personalized read of the pattern and the next step that fits. "
            "It never issues a verdict; runs in your browser and never stores or sends anything."),
    },
    "questions/spiritual-growth/am-i-an-empath.html": {
        "name": "Am I an Empath Pattern Check",
        "description": ("A free, interactive two-minute self-check. Eight questions surface what your own experience "
            "already tracks — whether you are a high-empathy person, whether absorption is the issue, and whether the "
            "label is doing identity work or diagnostic work — and return a personalized read of the pattern and the "
            "next step that fits. It never issues a verdict; runs in your browser and never stores or sends anything."),
    },
    "questions/spiritual-growth/am-i-psychic.html": {
        "name": "Am I Psychic Pattern Check",
        "description": ("A free, interactive two-minute self-check. Eight questions surface what your own experience "
            "already tracks — whether what you call psychic is intuition, pattern recognition, or susceptibility to "
            "Barnum effects — and return a personalized read of the pattern and the next step that fits. It never "
            "issues a verdict; runs in your browser and never stores or sends anything."),
    },
    "questions/spiritual-growth/how-to-know-your-past-life.html": {
        "name": "How to Know Your Past Life Pattern Check",
        "description": ("A free, interactive two-minute self-check. Eight questions surface what your own approach "
            "already tracks — whether you are seeking a literal past-life fact, whether narrative self-understanding "
            "is the real gain, and whether the literal framing is doing work the metaphor cannot support — and return "
            "a personalized read and the next step that fits. It never issues a verdict; runs in your browser and "
            "never stores or sends anything."),
    },
    "questions/career-work/should-i-quit-my-job.html": {
        "name": "Should I Quit My Job Pattern Check",
        "description": ("A free, interactive two-minute self-check. Eight questions surface what your own experience "
            "already tracks — whether the doubt is healthy, whether burnout is the issue, and what kind of mismatch "
            "is at play — and return a personalized read of the pattern and the next step that fits. It never issues "
            "a verdict; runs in your browser and never stores or sends anything."),
    },
    "questions/life-direction/what-is-my-life-purpose.html": {
        "name": "What Is My Life Purpose Pattern Check",
        "description": ("A free, interactive two-minute self-check. Eight questions surface what your own experience "
            "already tracks — whether you are seeking a discoverable purpose, whether a meaning-gap is the real issue, "
            "and whether the discovery model is paralyzing you — and return a personalized read of the pattern and the "
            "next step that fits. It never issues a verdict; runs in your browser and never stores or sends anything."),
    },
    "guides/how-to-manifest.html": {
        "name": "How to Manifest Pattern Check",
        "description": ("A free, interactive two-minute self-check. Eight questions surface what your own approach "
            "already tracks — whether you are using the documented mechanism (goal-clarity, mental contrast, action), "
            "whether self-efficacy is the real gain, and whether the supernatural framing is doing work the psychology "
            "cannot support — and return a personalized read and the next step that fits. It never issues a verdict; "
            "runs in your browser and never stores or sends anything."),
    },
    "guides/evil-eye-meaning.html": {
        "name": "What Is the Evil Eye Pattern Check",
        "description": ("A free, interactive two-minute self-check. Eight questions surface what your own situation "
            "already tracks — whether you are seeking cultural understanding, whether affected-anxiety is the real "
            "issue, and whether misfortune is being attributed to the evil eye in ways that deserve honest "
            "examination — and return a personalized read and the next step that fits. It never issues a verdict; runs "
            "in your browser and never stores or sends anything."),
    },
    "guides/dark-night-of-the-soul.html": {
        "name": "Dark Night of the Soul Pattern Check",
        "description": ("A free, interactive two-minute self-check. Eight questions surface what your own experience "
            "already tracks — whether you are in a genuine meaning-crisis, whether clinical depression is the thing "
            "to engage, and whether the spiritual frame is helping or bypassing — and return a personalized read and "
            "the next step that fits. It never issues a verdict; runs in your browser and never stores or sends "
            "anything."),
    },
    "questions/love-relationships/is-he-cheating.html": {
        "name": "Is He Cheating Pattern Check",
        "description": ("A free, interactive two-minute self-check. Eight questions read what you have actually "
            "observed across four domains — his openness, his time, his warmth, and his device habits — and sort your "
            "suspicion into one of five patterns, from a cluster worth taking seriously to one thread pulled hard to a "
            "steady baseline. It reads change against his normal rather than collecting signs, never issues a verdict "
            "on his conduct, and ends on a next step that fits. Runs in your browser and never stores or sends anything."),
    },
    "questions/love-relationships/twin-flame-separation.html": {
        "name": "Twin Flame Separation Pattern Check",
        "description": ("A free, interactive two-minute self-check. Eight questions read whether the twin-flame "
            "framework is moving you through the separation or holding you in it — how the framework is affecting you, "
            "how much checking fills your day, whether the connection is mutual, and how the pain has been moving — and "
            "give a personalized read of the pattern and a next step. It never confirms the twin-flame label or "
            "predicts reunion, both unfalsifiable by design. Runs in your browser and never stores or sends anything."),
    },
    "questions/love-relationships/will-he-come-back.html": {
        "name": "Will He Come Back Pattern Check",
        "description": ("A free, interactive two-minute self-check. Eight questions read what the waiting is doing to "
            "you — the shape of the ending, whether he returns after distance as a pattern, how much of your day is "
            "checking, and how the pain has been moving — and sort your wait into one of five patterns, from a clean "
            "closure worth grieving to a holding pattern to a historical-returner tendency. It never predicts his "
            "return, which is his to choose; runs in your browser and never stores or sends anything."),
    },
    "questions/spiritual-growth/am-i-cursed.html": {
        "name": "Am I Cursed Pattern Check",
        "description": ("A free, interactive two-minute self-check. Eight questions read whether the bad luck is "
            "clustering in a real, addressable domain or your mind is pattern-making under strain — the streak's "
            "shape, how manageable life has felt, where the claim came from, and how the streak has been moving. Your "
            "answers sort into one of five patterns, from a real cluster worth investigating to a reader-suggested "
            "curse. It never confirms a curse, which is unfalsifiable, and names the one structural red flag: a reader "
            "who diagnoses and sells the removal. Runs in your browser and never stores or sends anything."),
    },
    "questions/career-work/will-i-get-the-job.html": {
        "name": "Will I Get the Job Pattern Check",
        "description": ("A free, interactive two-minute self-check. Eight questions read what the waiting is doing to "
            "you — how much the uncertainty is costing you, whether your timeline is realistic, how clearly you have "
            "read fit, and how much weight one outcome is carrying — and sort your wait into one of five patterns, from "
            "a focused single application to a diversified real search to a stakes inflation. It never predicts the "
            "outcome, which is the hiring committee's to decide; runs in your browser and never stores or sends anything."),
    },
    "questions/signs/owl-meaning.html": {
        "name": "Owl Meaning Pattern Check",
        "description": "A free, interactive two-minute self-check. Eight questions surface what your own experience already tracks — whether you are using the encounter as meaning-making, whether message-seeking is doing work the encounter can’t support, and whether omen-attribution is extending anxiety — and return a personalized read and the next step that fits. It never issues a verdict; runs in your browser and never stores or sends anything.",
    },
    "questions/spiritual-growth/what-is-my-spirit-animal.html": {
        "name": "What Is My Spirit Animal Pattern Check",
        "description": "A free, interactive two-minute self-check. Eight questions surface what your own relationship with your spirit animal already tracks — whether you are using it as personal-symbol reflection, whether supernatural attribution is doing work the framework can’t support, and whether identity-anchoring is operating — and return a personalized read and the next step that fits. It never issues a verdict; runs in your browser and never stores or sends anything.",
    },
    "questions/tarot/death-card-meaning.html": {
        "name": "Death Card Pattern Check",
        "description": "A free, interactive two-minute self-check. Eight questions surface what your own experience of the card already tracks — whether you are using it as transformation reflection, whether literal fear is doing anxiety work, and whether the omen-attribution is extending distress — and return a personalized read and the next step that fits. It never issues a verdict; runs in your browser and never stores or sends anything.",
    },
    "guides/full-moon-ritual.html": {
        "name": "Full Moon Ritual Pattern Check",
        "description": "A free, interactive two-minute self-check. Eight questions surface what your own practice already tracks — whether you are using the ritual as structured reflection, whether energy attribution is doing work the practice can’t support, and whether manifestation-confirmation is operating — and return a personalized read and the next step that fits. It never issues a verdict; runs in your browser and never stores or sends anything.",
    },
    "guides/how-to-manifest-money.html": {
        "name": "How to Manifest Money Pattern Check",
        "description": "A free, interactive two-minute self-check. Eight questions surface what your own approach already tracks — whether you are using the documented financial mechanisms, whether supernatural attraction framing is doing work the evidence can’t support, and whether scarcity self-blame is the costly pattern — and return a personalized read and the next step that fits. It never issues a verdict; runs in your browser and never stores or sends anything.",
    },
    "guides/how-to-open-your-third-eye.html": {
        "name": "Third Eye Pattern Check",
        "description": "A free, interactive two-minute self-check. Eight questions surface what your own practice already tracks — whether you are using third eye practice as introspective reflection, whether supernatural capability attribution is doing work the practice can’t support, and whether blockage-attribution is operating — and return a personalized read and the next step that fits. It never issues a verdict; runs in your browser and never stores or sends anything.",
    },
    "guides/how-to-read-tarot.html": {
        "name": "How to Read Tarot Pattern Check",
        "description": "A free, interactive two-minute self-check. Eight questions surface what your own tarot practice already tracks — whether you are using it as structured reflection, whether prediction-seeking is doing work the practice can’t support, and whether the cards are amplifying anxiety — and return a personalized read and the next step that fits. It never issues a verdict; runs in your browser and never stores or sends anything.",
    },
    "guides/new-moon-ritual.html": {
        "name": "New Moon Ritual Pattern Check",
        "description": "A free, interactive two-minute self-check. Eight questions surface what your own practice already tracks — whether you are using the ritual for intention-setting, whether energy attribution is doing work the practice can’t support, and whether manifestation-confirmation is operating — and return a personalized read and the next step that fits. It never issues a verdict; runs in your browser and never stores or sends anything.",
    },
    "guides/what-are-chakras.html": {
        "name": "Chakra Pattern Check",
        "description": "A free, interactive two-minute self-check. Eight questions surface what your own relationship with chakras already tracks — whether you are using them as body-awareness reflection, whether energy-blockage attribution is doing work the framework can’t support, and whether spiritual bypassing is operating — and return a personalized read and the next step that fits. It never issues a verdict; runs in your browser and never stores or sends anything.",
    },
    "guides/what-are-synchronicities.html": {
        "name": "Synchronicity Pattern Check",
        "description": "A free, interactive two-minute self-check. Eight questions surface what your own experience already tracks — whether you are using synchronicity as meaning-making, whether message-seeking is doing work the framework can’t support, and whether apophenia is operating — and return a personalized read and the next step that fits. It never issues a verdict; runs in your browser and never stores or sends anything.",
    },
    "guides/what-is-shadow-work.html": {
        "name": "Shadow Work Pattern Check",
        "description": "A free, interactive two-minute self-check. Eight questions surface what your own practice already tracks — whether you are using shadow work as self-integration reflection, whether energy-clearing attribution is doing work the practice can’t support, and whether trauma-surfacing needs clinical support — and return a personalized read and the next step that fits. It never issues a verdict; runs in your browser and never stores or sends anything.",
    },

    "questions/angel-numbers/1111-meaning.html": {
        "name": "What does 1111 mean? Pattern Check",
        "description": "A free, interactive two-minute self-check. Eight questions surface what your own experience already tracks — and return a personalized read of the pattern and the next step that fits. It never issues a verdict; runs in your browser and never stores or sends anything.",
    },
    "questions/angel-numbers/222-meaning.html": {
        "name": "What does 222 mean? Pattern Check",
        "description": "A free, interactive two-minute self-check. Eight questions surface what your own experience already tracks — and return a personalized read of the pattern and the next step that fits. It never issues a verdict; runs in your browser and never stores or sends anything.",
    },
    "questions/angel-numbers/333-meaning.html": {
        "name": "MysticDo Decision Crossroads Screener (4-Signal MDCS-333)",
        "description": "A free, interactive two-minute decision conflict screener. Eight questions evaluate decision friction, cognitive dissonance, creative hesitation, and commitment execution, classifying your situation into five choice archetypes without storing personal data.",
    },
    "questions/angel-numbers/444-meaning.html": {
        "name": "MysticDo Autonomic Grounding Screener (4-Signal MAGS-444)",
        "description": "A free, interactive two-minute autonomic nervous-system screener. Eight questions evaluate your physiological stress arousal, perceived safety deficits, visual scanning frequency, and grounding effectiveness, categorizing your experience into five nervous-system archetypes without storing data.",
    },
    "questions/angel-numbers/555-meaning.html": {
        "name": "MysticDo Life Transition Readiness Screener (4-Signal MLTR-555)",
        "description": "A free, interactive two-minute adaptation screener. Eight questions evaluate transition control, anticipatory stress spikes, somatic flexibility, and agency follow-through, mapping your state into five transition archetypes without storing personal data.",
    },
    "questions/angel-numbers/777-meaning.html": {
        "name": "MysticDo Introspection vs. Jackpot Diagnostic (4-Signal MIJD-777)",
        "description": "A free, interactive two-minute cognitive reflection diagnostic. Eight questions evaluate contemplative depth, jackpot fallacy wishfulness, intellectual fatigue, and grounded reality testing, sorting your state into five cognitive archetypes without storing data.",
    },
    "questions/angel-numbers/888-meaning.html": {
        "name": "MysticDo Reciprocity & Abundance Diagnostic (4-Signal MRAA-888)",
        "description": "A free, interactive two-minute exchange and equity diagnostic. Eight questions evaluate effort-reward equity, transactional resentment, budgeting stewardship, and magical rescue beliefs, sorting your profile into five equity archetypes without storing data.",
    },
    "questions/angel-numbers/angel-numbers-meaning.html": {
        "name": "Angel numbers meaning Pattern Check",
        "description": "A free, interactive two-minute self-check. Eight questions surface what your own experience already tracks — and return a personalized read of the pattern and the next step that fits. It never issues a verdict; runs in your browser and never stores or sends anything.",
    },
    "questions/angel-numbers/what-is-my-angel-number.html": {
        "name": "What is my angel number? Pattern Check",
        "description": "A free, interactive two-minute self-check. Eight questions surface what your own experience already tracks — and return a personalized read of the pattern and the next step that fits. It never issues a verdict; runs in your browser and never stores or sends anything.",
    },
    "questions/astrology/mercury-retrograde-meaning.html": {
        "name": "What does Mercury retrograde mean? Pattern Check",
        "description": "A free, interactive two-minute self-check. Eight questions surface what your own experience already tracks — and return a personalized read of the pattern and the next step that fits. It never issues a verdict; runs in your browser and never stores or sends anything.",
    },
    "questions/astrology/what-is-my-rising-sign.html": {
        "name": "What is my rising sign? Pattern Check",
        "description": "A free, interactive two-minute self-check. Eight questions surface what your own experience already tracks — and return a personalized read of the pattern and the next step that fits. It never issues a verdict; runs in your browser and never stores or sends anything.",
    },
    "questions/astrology/zodiac-compatibility.html": {
        "name": "Zodiac compatibility Pattern Check",
        "description": "A free, interactive two-minute self-check. Eight questions surface what your own experience already tracks — and return a personalized read of the pattern and the next step that fits. It never issues a verdict; runs in your browser and never stores or sends anything.",
    },
    "questions/dreams/dream-about-snakes.html": {
        "name": "Dream about snakes meaning Pattern Check",
        "description": "A free, interactive two-minute self-check. Eight questions surface what your own experience already tracks — and return a personalized read of the pattern and the next step that fits. It never issues a verdict; runs in your browser and never stores or sends anything.",
    },
    "questions/dreams/dream-about-teeth-falling-out.html": {
        "name": "Dream about teeth falling out Pattern Check",
        "description": "A free, interactive two-minute self-check. Eight questions surface what your own experience already tracks — and return a personalized read of the pattern and the next step that fits. It never issues a verdict; runs in your browser and never stores or sends anything.",
    },
    "questions/loss-closure/signs-from-deceased-loved-ones.html": {
        "name": "MysticDo Bereavement Signal Diagnostic (4-Signal MBSD)",
        "description": "A free, interactive two-minute clinical diagnostic. Eight questions evaluate your experience across four behavioral signals — encounter frequency, emotional valence, somatic regulation, and compulsive scanning — sorting responses into five validated bereavement archetypes without collecting personal data.",
    },
    "questions/loss-closure/dream-about-deceased-loved-one.html": {
        "name": "MysticDo Bereavement Dream Diagnostic (4-Signal MBDD)",
        "description": "A free, interactive two-minute sleep psychology diagnostic. Eight questions audit dream narrative coherence, emotional wake-state, daytime replay, and relational friction to classify your dream into five emotional processing archetypes without storing personal data.",
    },
    "questions/loss-closure/is-my-loved-one-watching-over-me.html": {
        "name": "MysticDo Continuing Bonds Alignment Screener (4-Signal MCBA)",
        "description": "A free, interactive two-minute bereavement alignment screener. Eight questions evaluate your connection across agency retention, emotional relief, surveillance urges, and life movement, classifying your experience into five continuing-bonds archetypes without collecting personal data.",
    },
    "questions/money-wealth/why-am-i-always-broke.html": {
        "name": "MysticDo Scarcity Bandwidth Diagnostic (4-Signal MSBD)",
        "description": "A free, interactive two-minute financial psychology diagnostic. Eight questions evaluate your cash flow margin, cognitive stress overhead, emotional spend triggers, and relational boundaries, classifying your financial cycle into five archetypes without storing personal data.",
    },
    "questions/money-wealth/will-i-be-rich.html": {
        "name": "MysticDo Wealth Expectation & Reality Screener (4-Signal MWER)",
        "description": "A free, interactive two-minute wealth mindset diagnostic. Eight questions evaluate capital compounding discipline, asymmetric risk management, emotional status drivers, and fortune-telling reliance, sorting responses into five reality-grounded archetypes without storing data.",
    },
    "questions/tarot/tower-card-meaning.html": {
        "name": "MysticDo Structural Crisis Archetype Diagnostic (4-Signal MSCD)",
        "description": "A free, interactive two-minute crisis psychology diagnostic. Eight questions audit foundation stability, anticipatory dread, denial postures, and rebuilding capacity, categorizing your life disruption into five structural crisis archetypes without storing data.",
    },
    "questions/tarot/lovers-card-meaning.html": {
        "name": "MysticDo Relational Values Alignment Screener (4-Signal MRVA)",
        "description": "A free, interactive two-minute relational values screener. Eight questions evaluate core value congruence, moral crossroad tension, romantic projection, and personal autonomy, sorting your spread into five alignment archetypes without storing personal data.",
    },
    "questions/tarot/tarot-yes-or-no.html": {
        "name": "MysticDo Binary Decision Conflict Diagnostic (4-Signal MBDC)",
        "description": "A free, interactive two-minute decision conflict diagnostic. Eight questions evaluate outcome fixation urgency, decision avoidance, binary distortion, and responsibility reclamation, classifying your inquiry into five decision archetypes without storing data.",
    },
    "questions/dreams/dream-about-being-chased.html": {
        "name": "MysticDo Threat Simulation & Avoidance Screener (4-Signal MTSA)",
        "description": "A free, interactive two-minute threat simulation screener. Eight questions evaluate waking avoidance salience, post-awakening physiological arousal, pursuer projection characteristics, and confrontation capacity, categorizing your dream into five stress archetypes without storing data.",
    },
    "questions/dreams/dream-about-your-ex.html": {
        "name": "MysticDo Attachment Closure & Re-consolidation Diagnostic (4-Signal MACD)",
        "description": "A free, interactive two-minute attachment closure diagnostic. Eight questions evaluate waking emotional intensity, daytime boundary maintenance, current vulnerability triggers, and closure integration, sorting your dream into five attachment archetypes without storing data.",
    },
    "questions/dreams/dream-about-someone-dying.html": {
        "name": "MysticDo Relational Transition & Shadow Boundary Screener (4-Signal MRTS)",
        "description": "A free, interactive two-minute dream transition screener. Eight questions evaluate relationship evolution, separation anxiety baseline, unexpressed resentment or guilt, and magical omen fears, classifying your death dream into five transition archetypes without storing data.",
    },
    "questions/astrology/what-is-my-moon-sign.html": {
        "name": "MysticDo Somatic Regulation & Moon Sign Screener (4-Signal MSMS)",
        "description": "A free, interactive two-minute somatic astrology screener. Eight questions evaluate somatic self-soothing patterns, Sun-Moon internal dissonance, birth time precision certainty, and Barnum effect discernment, classifying your profile into five regulatory archetypes without storing data.",
    },
    "questions/astrology/what-is-my-saturn-return.html": {
        "name": "MysticDo Saturn Return Maturation Screener (4-Signal MSRM)",
        "description": "A free, interactive two-minute adult development screener. Eight questions evaluate life structure dissatisfaction, disruption voluntariness, adult agency reclamation, and fatalistic dread, categorizing your transition into five developmental archetypes without storing data.",
    },
    "questions/life-direction/feeling-lost-in-life.html": {
        "name": "MysticDo Liminal Void Diagnostic (4-Signal MLVD)",
        "description": "A free, interactive two-minute existential transition diagnostic. Eight questions evaluate personal agency reserves, temporal orientation, somatic vitality, and identity flexibility, classifying your situation into five developmental archetypes without storing personal data.",
    },
    "questions/career-work/am-i-in-the-right-career.html": {
        "name": "MysticDo Career Burnout vs. Values Alignment Matrix (4-Signal MCBA)",
        "description": "A free, interactive two-minute career psychology diagnostic. Eight questions evaluate craft versus environmental exhaustion, core career anchor alignment, day-to-day autonomy, and passion fantasy fixation, classifying your career into five archetypes without storing data.",
    },
}

ARTICLE_PAGES = {
    "guides/astrology-reading-vs-horoscope.html",
    "guides/before-paying-psychic-reading.html",
    "guides/birth-chart-reading-cost.html",
    "guides/dark-night-of-the-soul.html",
    "guides/evil-eye-meaning.html",
    "guides/full-moon-ritual.html",
    "guides/how-to-choose-astrologer.html",
    "guides/how-to-choose-psychic-reader.html",
    "guides/how-to-choose-tarot-reader.html",
    "guides/how-to-manifest-money.html",
    "guides/how-to-manifest.html",
    "guides/how-to-open-your-third-eye.html",
    "guides/how-to-read-tarot.html",
    "guides/is-online-psychic-legit.html",
    "guides/medium-reading-guide.html",
    "guides/new-moon-ritual.html",
    "guides/online-psychic-vs-in-person.html",
    "guides/psychic-reading-cost.html",
    "guides/psychic-vs-medium.html",
    "guides/psychic-vs-tarot.html",
    "guides/tarot-reading-cost.html",
    "guides/tarot-vs-astrology.html",
    "guides/what-are-chakras.html",
    "guides/what-are-synchronicities.html",
    "guides/what-is-shadow-work.html",
    "questions/angel-numbers/1111-meaning.html",
    "questions/angel-numbers/222-meaning.html",
    "questions/angel-numbers/333-meaning.html",
    "questions/angel-numbers/444-meaning.html",
    "questions/angel-numbers/555-meaning.html",
    "questions/angel-numbers/777-meaning.html",
    "questions/angel-numbers/888-meaning.html",
    "questions/angel-numbers/angel-numbers-meaning.html",
    "questions/angel-numbers/what-is-my-angel-number.html",
    "questions/astrology/mercury-retrograde-meaning.html",
    "questions/astrology/what-is-my-moon-sign.html",
    "questions/astrology/what-is-my-rising-sign.html",
    "questions/astrology/what-is-my-saturn-return.html",
    "questions/astrology/zodiac-compatibility.html",
    "questions/career-work/am-i-in-the-right-career.html",
    "questions/career-work/should-i-quit-my-job.html",
    "questions/career-work/will-i-get-the-job.html",
    "questions/dreams/dream-about-being-chased.html",
    "questions/dreams/dream-about-snakes.html",
    "questions/dreams/dream-about-someone-dying.html",
    "questions/dreams/dream-about-teeth-falling-out.html",
    "questions/dreams/dream-about-your-ex.html",
    "questions/life-direction/feeling-lost-in-life.html",
    "questions/life-direction/what-is-my-life-purpose.html",
    "questions/loss-closure/dream-about-deceased-loved-one.html",
    "questions/loss-closure/is-my-loved-one-watching-over-me.html",
    "questions/loss-closure/signs-from-deceased-loved-ones.html",
    "questions/love-relationships/am-i-in-love.html",
    "questions/love-relationships/does-he-like-me.html",
    "questions/love-relationships/does-he-love-me.html",
    "questions/love-relationships/does-he-miss-me.html",
    "questions/love-relationships/does-he-think-about-me.html",
    "questions/love-relationships/does-my-crush-like-me-back.html",
    "questions/love-relationships/how-to-get-over-someone.html",
    "questions/love-relationships/is-he-cheating.html",
    "questions/love-relationships/is-he-serious-about-me.html",
    "questions/love-relationships/is-he-the-one.html",
    "questions/love-relationships/should-i-break-up.html",
    "questions/love-relationships/should-i-text-him.html",
    "questions/love-relationships/twin-flame-separation.html",
    "questions/love-relationships/when-will-i-meet-my-soulmate.html",
    "questions/love-relationships/who-is-my-soulmate.html",
    "questions/love-relationships/will-he-come-back.html",
    "questions/money-wealth/why-am-i-always-broke.html",
    "questions/money-wealth/will-i-be-rich.html",
    "questions/signs/owl-meaning.html",
    "questions/spiritual-growth/am-i-an-empath.html",
    "questions/spiritual-growth/am-i-cursed.html",
    "questions/spiritual-growth/am-i-psychic.html",
    "questions/spiritual-growth/how-to-know-your-past-life.html",
    "questions/spiritual-growth/what-is-my-spirit-animal.html",
    "questions/tarot/death-card-meaning.html",
    "questions/tarot/lovers-card-meaning.html",
    "questions/tarot/tarot-yes-or-no.html",
    "questions/tarot/tower-card-meaning.html",
}

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

def quiz_tool_jsonld(tool, url):
    """WebApplication entity for a page's interactive pattern check.
    @id anchors to the #quiz mount node on the same page."""
    return {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "@id": url + "#quiz",
        "name": tool["name"],
        "url": url,
        "description": tool["description"],
        "applicationCategory": "LifestyleApplication",
        "operatingSystem": "Web",
        "browserRequirements": "Requires JavaScript",
        "isAccessibleForFree": True,
        "inLanguage": "en",
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
    pub_date = PUBLISH_DATES.get(rel)
    date_mod = extract_updated_date(html)
    # dateModified must never precede datePublished. "Updated: <Month Year>" maps
    # to the 1st of that month, which predates PUBLISHED_DEFAULT for a page that
    # was published and last edited in the same month (does-he-love-me shipped
    # 2026-09-17 with dateModified 2026-09-01 — an inconsistent signal set).
    _floor = pub_date or PUBLISHED_DEFAULT
    if date_mod is None or date_mod < _floor:
        date_mod = _floor
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
        # 2026-09-21 audit: og:title / og:description were computed but never
        # emitted — 33 pages fell back to platform-side <title> inference.
        # Emit them explicitly (top-tier standard).
        parts.append('<meta property="og:title" content="%s">' % og_title)
        parts.append('<meta property="og:description" content="%s">' % og_desc)
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
        if rel in ARTICLE_PAGES:
            parts.append('<meta property="og:type" content="article">')
            parts.append('<meta property="article:published_time" content="%s">' % ((pub_date or PUBLISHED_DEFAULT) + "T00:00:00+00:00"))
            parts.append('<meta property="article:modified_time" content="%s">' % ((date_mod or pub_date or PUBLISHED_DEFAULT) + "T00:00:00+00:00"))
            parts.append('<meta property="article:author" content="MysticDo Editorial">')
            parts.append('<meta property="article:section" content="Spiritual Services Decision Guidance">')
            parts.append('<meta name="author" content="MysticDo Editorial">')
        else:
            parts.append('<meta property="og:type" content="website">')

    # JSON-LD
    jsonld_blocks = []
    is_home = (rel in ("index.html", "index.htm"))
    is_guide_article = (rel in ARTICLE_PAGES)
    is_daily_card = (rel == "tools/daily-card.html")
    is_contact = (rel == "contact.html")
    is_about = (rel == "about.html")
    is_methodology = (rel == "methodology.html")

    if is_home:
        jsonld_blocks.extend(org_website_jsonld(desc))
    elif is_guide_article:
        art = article_jsonld(title, desc, url, date_mod, len(faqs) > 0, pub_date=pub_date)
        tool = QUIZ_TOOL_PAGES.get(rel)
        if tool:
            art["mentions"] = [{"@type": "WebApplication", "@id": url + "#quiz", "name": tool["name"]}]
        jsonld_blocks.append(art)
        crumbs = build_breadcrumbs(rel, title)
        jsonld_blocks.append(breadcrumb_jsonld(crumbs))
        if faqs:
            jsonld_blocks.append(faq_jsonld(faqs))
        if tool:
            jsonld_blocks.append(quiz_tool_jsonld(tool, url))
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
