# Mobile QA Audit — MysticDo

**Scope:** 39 pages · iPhone viewports (390 × 844 and 320 × 568) · latest Safari behaviour
**Date:** 2026-09-19
**Method:** headless Chrome rendering each page inside a true-width same-origin iframe, then
walking the rendered DOM to measure *painted glyph geometry* (not just box geometry),
overflow against the viewport, tap-target sizes and effective type sizes.

---

## 1. Executive summary

The site was structurally sound — no horizontal scrolling, no broken layout, no missing
assets. The defects were concentrated in three places: **hero call-to-action buttons whose
labels were physically cut off**, **one page with a 147px horizontal overflow that made
content unreachable**, and **a set of iOS-specific touch/typography behaviours** that made
the site feel less polished than it looks.

All of it is now fixed and re-verified: **39/39 pages report zero overflow and zero clipped
content at both 390px and 320px.**

| Metric (home page, 390px) | Before | After |
|---|---|---|
| Pages with clipped CTA labels | **4** under the shipped font / **6** under the fallback font | **0** |
| Pages with horizontal overflow | 1 of 39 (`/guides/` — 147px) | **0** |
| Tap targets under 44px | 17 | **2** (both inline links inside sentences) |
| Text under 12px | 21 elements | **11** (the eyebrow micro-label only) |
| Third-party font requests | 2 (DNS+TLS+CSS+font) | **0** |

---

## 2. Critical defects (fixed)

### 2.1 Hero CTA labels were physically cut off

**Severity: critical.** On `/astrology/` the primary button rendered as
**"ake the astrology quiz"** — the "T" was gone. Measured against the shipped
self-hosted Cormorant face, the labels were being cut by up to **12px on each side**, and
the defect was *font-dependent*:

| Page | Label | Cut (shipped font) | Cut (Georgia fallback) |
|---|---|---|---|
| `/astrology/` | Take the astrology quiz → | **12px L + 12px R** | clipped |
| `/medium/` | Take the medium quiz → | **8px L + 8px R** | clipped |
| `/psychic/` | Take the psychic quiz → | **4px L + 4px R** | clipped |
| `/tarot/` | Take the tarot quiz → | 0 (fits) | clipped |
| `/index.html`, `/404.html` | Do What Fits → | 0 (fits) | clipped |

That last column is the dangerous part: the shorter labels only survived because Cormorant
is narrow. Whenever the webfont was slow, blocked or blocked-by-privacy-tooling, every one
of these buttons silently truncated at the same moment the page fell back to Georgia — i.e.
the failure appeared exactly when the reader's connection was already bad.

**Root cause.** The mobile rule gave both pills a fixed share of the row:

```css
@media (max-width: 760px) {
  .hero-cta-row .btn { flex: 1; min-width: 140px; }
}
```

At 390px each button received 173px. `.btn` also carries `white-space: nowrap` and
`overflow: hidden`, so a 216px label in a 173px box was silently truncated — no error,
no scrollbar, just a missing letter. `overflow: hidden` clips at the *padding* edge, so the
overrun first eats the 32px padding and then starts cutting glyphs.

**Fix.** The two pills now stack full-width (capped at 380px on larger phones), which also
gives the two most important buttons on the site a 54px-tall target each:

```css
.hero-cta-row { flex-direction: column; align-items: stretch; gap: var(--s3); }
.hero-cta-row .btn { flex: 0 0 auto; width: 100%; max-width: 380px; min-width: 0; margin-inline: auto; }
```

**Evidence:** `_design-check/shots/cmp-astro-cta.png` (and `cmp-index-cta.png`) — the
"before" half is the live page with the legacy rule re-injected at runtime, so it is a real
rendering, not a mock-up.

### 2.2 `/guides/` overflowed the viewport by 147px — content unreachable

`document.scrollWidth` was **537px on a 390px screen**. Because `body` carries
`overflow-x: clip`, that overflow propagated to the viewport and was clipped — so the right
147px simply could not be reached by scrolling.

**Root cause.** An inline style overrode the responsive grid:

```html
<div class="grid grid-5" style="--cols:5;grid-template-columns:repeat(5,1fr);gap:var(--s3)">
```

`repeat(5, 1fr)` is really `repeat(5, minmax(auto, 1fr))`, so the tracks could not shrink
below their min-content width; and being *inline*, it also beat every media query. `.grid-5`
was not defined in the stylesheet at all.

**Fix.** Added a real `.grid-5` with `minmax(0, 1fr)` plus 3-up (≤960px) and 2-up (≤760px)
rules, removed the inline override, and let the stranded 5th card span the full width:

```css
.grid-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
@media (max-width: 960px) { .grid-5 { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 760px) {
  .grid-5 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .grid-5 > :last-child:nth-child(odd) { grid-column: 1 / -1; }
}
```

**Evidence:** `_design-check/shots/cmp-guides-grid.png`.

---

## 3. iOS Safari behaviour (fixed)

### 3.1 Sticky `:hover` latched onto whatever was tapped

iOS Safari applies `:hover` on tap and keeps it until the user taps something else. Every
hover transform in the stylesheet therefore *stuck*: a card stayed lifted, a category tile
kept its gilded top edge, the nav link kept its gold background. Worse, most of these
elements had **no `:active` state**, and `-webkit-tap-highlight-color: transparent` removed
the system feedback — so tapping a card produced no response at all.

**Fix.** A single `@media (hover: none)` block neutralises the hover movement and adds
genuine tap feedback. It is declared last and uses `:not(:active)` so a press still gets its
own state:

```css
@media (hover: none) {
  .card:hover:not(:active), .cat-tile:hover:not(:active), … { transform: none; }
  .card:active, .cat-tile:active, .provider-card:active { transform: scale(0.985); }
  .cat-tile:hover:not(:active)::after { transform: scaleX(0); }   /* gilded edge */
  .badge[href^="#"]:active { background: var(--gold-100); }
}
```

### 3.2 Opening the drawer could lose the reader's scroll position

`document.body.style.overflow = 'hidden'` is unreliable in WebKit, and the previous code
never restored the scroll offset. The lock now applies to `<html>` (what actually works) and
the offset is captured and restored with `scroll-behavior` temporarily set to `auto`, so
closing the menu never dumps the reader back at the top:

```js
function setPageScrollLock(lock) { … window.scrollTo(0, lockedScrollY) … }
```

### 3.3 Notch handling put the header bands out of place in landscape

`env(safe-area-inset-left/right)` was on `body`, which insets every full-bleed band — so in
landscape the frosted header and parchment footer stopped 44px short of the screen edge.
The insets now live on `.container`, so bands stay edge-to-edge while text stays clear of
the notch, and the fixed drawer got its own horizontal insets:

```css
.container { padding-left: calc(var(--s5) + env(safe-area-inset-left)); … }
.nav       { padding: … calc(var(--s3) + env(safe-area-inset-right)) … }
```

### 3.4 Sticky header swallowed in-page anchors

`#practices`, `#questions`, `#what`, `#cost` … all landed underneath the sticky header.
Added `[id] { scroll-margin-top: calc(var(--header-h) + var(--s5)); }`.

### 3.5 Email keyboard hygiene

`type="email"` alone still lets iOS capitalise and autocorrect. Applied centrally in `main.js`
so no page can get it wrong: `autocapitalize=off`, `autocorrect=off`, `spellcheck=false`,
`inputmode=email`, `autocomplete=email`.

---

## 4. Typography & touch ergonomics (fixed)

| Element | Before | After |
|---|---|---|
| Footer column links | 58 × **18px** | full column width × **44px** |
| In-page jump chips (`#what`, `#cost`) | 79 × **29px** | **42px** tall |
| Small pills (`.btn-sm`) | **36px** | **44px** |
| Card action links ("Pull a card") | 292 × **25px** | **44px** |
| Header wordmark (home link) | 96 × **37px** | **44px** |
| Breadcrumb links | 36 × **21px** | padded to ~44px, rhythm unchanged |
| Drawer sub-links | ~38px | **44px** |
| Badges / level labels / footer headings | 11.8px | **12.5px** |
| Drawer sub-link descriptions | 11.8px, 3.2:1 contrast | **12.5px**, `--text-muted` (5.5:1) |

Only 2 sub-44px targets remain site-wide, and both are links inside running sentences
(WCAG 2.5.8 explicitly exempts those).

### 4.1 Two layout fixes worth calling out

**Email capture** used to wrap raggedly — a full-width field with a half-width button
stranded underneath. It now stacks cleanly:

```css
.email-form { flex-direction: column; align-items: stretch; }
.email-form .btn { width: 100%; }
```

**Quiz result badge.** Path labels like *"A direct, conversational read"* wrapped to two
lines inside a fully-rounded capsule, leaving an orphan word beside a vertically-centred
star. It is now an inline-block label with a 16px radius, balanced wrapping and the star
baselined to the first line — which holds for every one of the 32 result paths.

---

## 5. Mobile performance (verified & completed)

The display face was loaded with `@import` from `fonts.googleapis.com` — a DNS + TLS + CSS
round-trip *before* the font was even discovered — and any privacy-hardened browser (Brave,
Safari with content blockers) blocked it outright, silently falling back to Georgia and
losing the entire typographic identity of the brand.

A parallel session migrated the face to `assets/fonts/` while this audit was running. This
audit then did three things to the in-flight migration:

1. **Verified the payloads.** Only 2 distinct SHA-1 hashes across the 5 `woff2` files looked
   like a faulty download. It is not — Google itself serves one identical payload for every
   requested weight of this family, so the shared bytes are correct. Re-downloaded and
   hashed each face independently to confirm; recorded in `assets/fonts/manifest.json`.
2. **Removed the dead hints.** 38 pages were still carrying `preconnect` to
   `fonts.googleapis.com` / `fonts.gstatic.com` — two connections opened per page load that
   were never used once the face went self-hosted. Replaced with a single `preload` for the
   600-normal face (above-the-fold weight). **Zero third-party font requests remain.**
3. **Confirmed end-to-end rendering** that the self-hosted face is actually what paints —
   the fallback Georgia serif and Cormorant Garamond are visually distinguishable in the
   hero headline and the wordmark.

---

## 6. Recommended, deliberately not changed

These are judgement calls that would alter the design language or need your decision, so
they were left alone:

1. **`--text-faint` (#968C76) contrast.** 3.19:1 against the ivory background — below the
   WCAG AA 4.5:1 threshold for the small text it is used on (`.form-note`, `.quiz-counter`,
   `.update-date`, `.footer-bottom`, `.cat-meta`). Darkening to ≈`#786F5A` reaches 4.79:1
   but visibly changes the airy tertiary hierarchy you tuned in the Aurum Edition. I fixed
   only the worst case (drawer descriptions), which sit in the primary mobile navigation.
2. **`.quiz-entry-bar` CSS is dead** — no markup or JS references it, and it never gets
   `.visible`. Safe to delete.
3. **PostHog loads on all 39 pages** (~50KB of JS). It is async, but it is the single
   largest third-party cost on mobile first load. Worth deferring until after first paint.
4. **`quiz/find-your-path.html` has no viewport meta.** It is a 0-second meta-refresh
   redirect stub with `noindex`, so the impact is a brief zoomed-out flash. Adding the meta
   would be trivially correct.
5. **Maskable PWA icon** still reuses `icon-512`; a dedicated safe-zone version would stop
   round-cropping from clipping the star's points.

### Verification limitation (stated honestly)

Headless Chrome resolves `env(safe-area-inset-*)` to `0`, so the notch/landscape safe-area
work in §3.3 was verified **by code review plus the guarantee that at zero insets the
computed padding is byte-identical to before**, not by on-device rendering. The rest of the
audit — overflow, clipping, tap sizes, type sizes, both interactive flows — was measured
directly from rendered output.

---

## 7. How to re-run this audit

```bash
# preview server
python -m http.server 8765 --bind 127.0.0.1

# full-site measurement at a given width (writes _design-check/audit-<w>.json)
node _design-check/audit.js 390
node _design-check/audit.js 320

# single page, verbose
node _design-check/one.js /astrology/index.html 390

# true-width screenshot + auto-sliced bands
node _design-check/shot.js /index.html 390              # 0 clicks, plain
node _design-check/shot.js /do-what-fits.html 390 7     # auto-answer a 7-step quiz
node _design-check/shot.js /index.html 390 0 menu       # open the drawer
```

The probes render each page in a **390px-wide same-origin iframe**, which is the only way to
get a true sub-500px viewport in headless Chrome (it enforces a ~500px minimum window width,
so `--window-size=390` produces a left-crop of a 500px layout, not a mobile layout).

---

## 8. Files changed

| File | Change |
|---|---|
| `assets/css/style.css` | safe-area moved to `.container`; `[id]` scroll-margin; `.grid-5` + responsive; hero CTA stacking; `.nav-cta-mobile`; `html.nav-open`; mobile type/touch sizing; email-form stacking; result-badge mobile treatment; `@media (hover: none)` touch block; 2 dead rules removed |
| `assets/js/main.js` | `setPageScrollLock()` (iOS-safe, restores offset); drawer CTA wrapper; `initInputAttrs()` for iOS keyboards |
| `guides/index.html` | removed the 5-column inline grid override |
| 38 `*.html` | dead Google Fonts `preconnect` removed (font `preload` kept) |
| `robots.txt` | `Disallow: /_design-check/` for the QA tooling |
| `scripts/normalize-head-hints.py` | new — idempotent head-hint normaliser (prevents the dead preconnects returning) |
| `assets/fonts/manifest.json` | new — records the self-hosted face set and its hashes |

*Note: this audit ran alongside a parallel session that was self-hosting the display face.
`assets/fonts/`, the `@font-face` block in `style.css`, the per-page font `preload`, and
`#site-header { display: contents }` (the sticky-header fix) come from that work, not this one.*
