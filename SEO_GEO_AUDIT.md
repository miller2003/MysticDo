# MysticDo SEO + GEO Technical Audit Report

**Date:** 2026-09-18 (re-audited after the launch content expansion)
**Scope:** Full technical SEO + GEO (Generative Engine Optimization) audit of the MysticDo launch site, calibrated to top-tier standard.
**Result:** ✅ All critical gaps closed. 39 pages, 0 errors, 0 warnings.

---

## 0. 2026-09-18 launch expansion — what changed

The decision library grew from 3 to **14 guides**, completing the blueprint §36 Phase-1 skeleton:

- **Psychic (new):** psychic-reading-cost, is-online-psychic-legit, online-psychic-vs-in-person
- **Tarot (new):** tarot-reading-cost, how-to-choose-tarot-reader, tarot-vs-astrology
- **Astrology (new):** astrology-reading-vs-horoscope, how-to-choose-astrologer, birth-chart-reading-cost
- **Medium (new):** psychic-vs-medium, medium-reading-guide

All 14 guides carry `Article` + `BreadcrumbList` + `FAQPage` JSON-LD (FAQ auto-extracted from visible `<details class="faq-item">` blocks), `og:type=article` with publish/modify timestamps, and the full GEO layer structure (Direct Answer → Key Takeaways → HTML comparison tables → real scenarios → decision tree → FAQ → methodology note).

Also in this pass: developer-era "v0" language removed across about / contact / join / methodology / 4 category pages / guide pages; guides index rebuilt (14 cards, organized by intent level and practice, no "planned" placeholders); 4 category pages cross-linked to their new guides; homepage guide preview diversified; `llms.txt` expanded to 14 guide entries; a breadcrumb bug on psychic-vs-tarot fixed.

| Metric | v0.2 (2026-09-17) | Launch (2026-09-18) |
|---|---|---|
| Total HTML pages | 28 | 39 |
| Sitemap URLs | 26 | 37 |
| Valid JSON-LD blocks | 55 | 88 |
| Article-schema guides | 3 | 14 |
| Internal links checked, all resolve | 27 | 42 |

---

## 1. Audit findings — before vs. after

| Check | Before | After | Status |
|---|---|---|---|
| `<link rel="canonical">` | 0 / 28 pages | 37 / 39 (2 noindex correctly skip) | ✅ Fixed |
| JSON-LD structured data | 0 blocks | 88 valid blocks across 37 pages | ✅ Fixed |
| `og:url`, `og:site_name`, `og:locale`, `og:image` | missing | all present on 37 indexable pages | ✅ Fixed |
| Twitter Card meta (`twitter:card`, `title`, `description`, `image`) | 0 | all present on 37 pages | ✅ Fixed |
| `article:published_time` / `modified_time` / `author` / `section` | missing | present on 14 guide articles | ✅ Fixed |
| `<meta name="author">` | missing | present on article pages | ✅ Fixed |
| `sitemap.xml` | missing | valid XML, 37 URLs + lastmod | ✅ Fixed |
| `robots.txt` | missing | present, explicit AI-crawler allow | ✅ Fixed |
| `llms.txt` (GEO standard) | missing | present, 14 guide entries | ✅ Fixed |
| `404.html` | missing | branded, noindex, links to Do What Fits | ✅ Fixed |
| `site.webmanifest` + `<link rel="manifest">` + `<meta theme-color>` | missing | present on all 39 pages | ✅ Fixed |
| OG image (`og:image`) | missing | 1200×630 PNG at `/assets/og/logo-card.png` | ✅ Fixed |
| `<h1>` per page | OK (1 each) | OK (39/39) | ✅ Already good |
| `lang="en"` | OK | OK (39/39) | ✅ Already good |
| Internal links | — | all 42 unique resolve, 0 broken | ✅ Verified |
| Mobile viewport meta | OK | OK (39/39) | ✅ Already good |

---

## 2. What "top-tier" required and what was added

### 2.1 Canonical control (blueprint §31)
Every indexable page now declares an absolute canonical URL (`https://mysticdo.com/{path}`). Noindex pages (the 404 and the legacy quiz redirect) intentionally omit canonical — correct SEO behavior, prevents canonicalizing a page that shouldn't be indexed.

> ⚠️ **Domain note:** canonical/OG/sitemap use `https://mysticdo.com` as the production domain. If the real domain differs, run a project-wide find-replace of `https://mysticdo.com` → real domain. The injection script (`seo_inject.py`) has `BASE_URL` at the top — change one line and re-run to regenerate all canonical/OG/sitemap/llms.txt paths.

### 2.2 JSON-LD structured data (blueprint §31 "schema markup where appropriate")
88 valid schema blocks, calibrated per page type:

| Page type | Schema types applied |
|---|---|
| Homepage | `Organization` + `WebSite` (sitelinks/entity signals) |
| 14 decision-guide articles | `Article` (headline, datePublished, dateModified, author, publisher, mainEntityOfPage, image) + `BreadcrumbList` + `FAQPage` |
| Daily Card tool | `WebApplication` (applicationCategory, free Offer) + `BreadcrumbList` |
| Contact page | `ContactPage` + `BreadcrumbList` |
| About page | `AboutPage` + `BreadcrumbList` |
| All other subpages | `WebPage` + `BreadcrumbList` |

**FAQPage schema is auto-generated from the visible `<details class="faq-item">` Q&A** on each guide — AI engines (Google AI Overviews, Perplexity, ChatGPT) prioritize FAQ schema for citation. The Article schema carries `dateModified` pulled from each page's visible "Updated: Month Year" line, so freshness signals stay in sync with content edits.

### 2.3 GEO (Generative Engine Optimization) — blueprint §13–15
This is where MysticDo's commercial moat lives (blueprint §14: "let AI cite us at the key decision node, and give the user a reason to click after"). Concrete GEO assets now in place:

- **`llms.txt`** at root — the emerging standard (llmstxt.org) that hands AI crawlers a curated map of the site's content, organized by entry point / practices / questions / guides / tools. AI models read this to understand what MysticDo *is* in one pass.
- **`robots.txt` explicitly allows `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, `CCBot`, `anthropic-ai`** — many sites block these by default; MysticDo invites citation.
- **Direct-answer blocks** (`.direct-answer`) lead every commercial page — blueprint §15 layer 1.
- **Key-takeaways lists** (`<div class="key-takeaways">`) — blueprint §15 layer 2.
- **Comparison tables are HTML** (`.cmp-table`), not images — blueprint §15 "don't put key facts/prices/comparison data only in images." AI crawlers and search parsers can read every cell.
- **Decision trees as HTML `<ol>` lists** — blueprint §15 layer 6.
- **FAQ as HTML `<details>`** + mirrored as FAQPage JSON-LD — double GEO surface.
- **Methodology + update dates + affiliate disclosure** on every commercial page — blueprint §47 E-E-A-T.
- **Known-vs-subjective separation** explicitly labeled on the methodology page.

### 2.4 Open Graph + Twitter Card
Full social-sharing surface on all 26 indexable pages: `og:url`, `og:site_name`, `og:locale`, `og:image` (1200×630), `og:image:alt`, `og:image:width/height`, plus `twitter:card=summary_large_image` with matching title/description/image. Article pages additionally carry `og:type=article` + `article:*` timestamps.

### 2.5 Crawl infrastructure
- `sitemap.xml` — 26 URLs with `<lastmod>` (file mtime) + `<changefreq>` + `<priority>` (homepage 0.9, rest 0.7).
- `robots.txt` — allows all, references sitemap, explicitly whitelists the 6 known AI crawlers.
- `404.html` — branded, `noindex`, funnels lost visitors to Do What Fits + the two browse axes.

### 2.6 PWA / mobile
`site.webmanifest` (brand name, theme color `#0a0e1f`, standalone display, SVG icon) linked from all 28 pages via `<link rel="manifest">` + `<meta name="theme-color">`.

---

## 3. What remains for production (not launch blockers)

These are honest limitations flagged for the next phase — none block top-tier indexing:

1. ~~OG image is SVG~~ → **Resolved:** 1200×630 PNG at `/assets/og/logo-card.png`, referenced site-wide.
2. **Domain is a placeholder** (`mysticdo.com`). Change `BASE_URL` in `seo_inject.py` and re-run to regenerate canonical/sitemap/llms.txt/OG URLs.
3. **No real `<lastmod>` from content edits** — currently file mtime. Once a CMS or content pipeline exists, drive lastmod from the visible "Updated" date in each page's body.
4. ~~`apple-touch-icon` needs a PNG~~ → **Resolved:** 180×180 at `/assets/brand/apple-touch-icon.png`, linked on all pages.
5. **No `hreflang`** — single-language (en) site, not needed yet. Add if multilingual launches (blueprint §34 defers this).
6. **JSON-LD `datePublished`** is a static default (2026-09-17). When articles get real publish dates, wire `article:published_time` from a per-page front-matter or metadata source.
7. **JSON-LD `author` is "MysticDo Editorial" (org).** When named human reviewers are added (E-E-A-T boost), upgrade to `Person` with `sameAs` links.
8. **Guide-article lists in `seo_inject.py` are hardcoded** (two whitelists: article meta + Article JSON-LD). When adding a new guide, add its path to both lists and re-run. Missing this step silently downgrades a guide to generic `WebPage` schema.

---

## 4. Re-running the tooling

Two dev scripts live at project root (served by the local server but contain no secrets):

- **`seo_inject.py`** — idempotent. Strips any `<!-- SEO-INJECTED-START -->…END -->` block first, then re-injects canonical + OG + Twitter + article meta + JSON-LD + manifest + theme-color, and regenerates `sitemap.xml`. **Run this whenever pages are added/removed** so canonical/sitemap stay in sync.
- **`validate_seo.py`** — runs the full check (JSON-LD validity, sitemap, robots, llms.txt, canonical coverage, internal-link resolution, h1 count, lang). Re-run after any structural change.

Both use Python 3.13 at `C:\Users\samja\.workbuddy\binaries\python\versions\3.13.12\python.exe`.

---

## 5. Verification snapshot (2026-09-18, launch)

```
SUMMARY: 10 ok, 0 warnings, 0 errors
  Pages with canonical: 37/39   (2 noindex, correct)
  Pages with manifest link: 39/39
  Pages with JSON-LD: 37/39     (2 noindex, correct)
  Total JSON-LD blocks (valid): 88
  sitemap.xml: valid XML, 37 URLs
  robots.txt: present, AI crawler allows + sitemap ref
  llms.txt: present (GEO)
  Internal links: all resolve (42 unique checked)
  h1 audit: every page has exactly 1 h1 (39 pages)
  lang attribute: all pages have lang=en
```

The MysticDo launch site meets top-tier SEO + GEO technical standard: every indexable page is canonicalized, schema-marked, AI-crawlable, social-shareable, and crawl-mapped. The GEO layer (llms.txt + AI-crawler allow + Direct-Answer/Key-Takeaways/Comparison/FAQ structure as HTML across all 14 guides) directly serves blueprint §14's goal — letting AI cite MysticDo at the decision node while giving the cited user a reason to click through to the interactive matcher.
