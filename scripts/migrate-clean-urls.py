#!/usr/bin/env python3
"""
One-time migration: internal .html links -> clean URLs.

Why: Cloudflare static assets run `html_handling: "auto-trailing-slash"`,
which 308-redirects every `/foo.html` request to `/foo`. Until this
migration the whole site linked, canonicalized, and sitemapped to the
.html form, so every internal navigation ate a redirect and canonicals
pointed at redirecting URLs.

Scope of this script (run once, then never again):
  1. All published .html files  - href="/xxx.html" -> href="/xxx"
                                  (also handles .html#anchor and .html?q=v)
  2. assets/js/main.js           - nav/footer/WebMCP/highlightNav paths
  3. assets/js/quizzes.js        - result `before` / cross-quiz redirect paths
  4. worker/_lib/*.js            - URLs returned by the agent surface
  5. 404.html                    - CTA link
  6. seo_inject.py               - path_to_url() strips .html; SEG_NAMES key
  7. scripts/build-content-index.py - page_url() strips .html

After running: re-run seo_inject.py + build-content-index.py, then npm test.
Excluded on purpose: test files (they test protocol behavior, not link
targets), internal .md docs (unpublished), _design-check/ (dev only).
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKIP_DIRS = {"_design-check", "logo-drafts", "worker", "functions", "scripts",
             "node_modules", ".git", ".workbuddy", ".vscode", ".idea", ".wrangler"}

report = []


def sub_in(pattern, repl, s, count_name):
    """Regex-sub and record the number of replacements."""
    new, n = re.subn(pattern, repl, s)
    if n:
        report.append((count_name, n))
    return new


def migrate_html_pages():
    """href="/path.html" (optionally #fragment or ?query) -> clean path."""
    total = 0
    for p in sorted(ROOT.rglob("*.html")):
        if any(part in SKIP_DIRS for part in p.parts):
            continue
        s = p.read_text(encoding="utf-8")
        # absolute internal links: href="/xxx.html", href="/xxx.html#frag", href="/xxx.html?q"
        new, n = re.subn(
            r'(href=")(/[A-Za-z0-9_\-./]*?)\.html((?:[#?][^"]*)?")',
            r"\1\2\3",
            s,
        )
        # absolute self-referential full URLs (rare, but keep consistent)
        new, n2 = re.subn(
            r'(href="https://mysticdo\.com)(/[A-Za-z0-9_\-./]*?)\.html((?:[#?][^"]*)?")',
            r"\1\2\3",
            new,
        )
        n += n2
        if n:
            p.write_text(new, encoding="utf-8")
            report.append((f"links in {p.relative_to(ROOT)}", n))
            total += n
    return total


def migrate_js_strings(path, label):
    """Replace '/xxx.html' string literals in a JS file (paths only, not text)."""
    p = ROOT / path
    s = p.read_text(encoding="utf-8")
    new, n = re.subn(r"([\"'])(/[A-Za-z0-9_\-./]*?)\.html\1", r"\1\2\1", s)
    if n:
        p.write_text(new, encoding="utf-8")
        report.append((f"strings in {label}", n))
    return n


def main():
    total = 0
    total += migrate_html_pages()
    total += migrate_js_strings("assets/js/main.js", "main.js")
    total += migrate_js_strings("assets/js/quizzes.js", "quizzes.js")
    for lib in ["agent-discovery.js", "search.js", "mcp.js"]:
        total += migrate_js_strings(f"worker/_lib/{lib}", f"worker/_lib/{lib}")

    # main.js highlightNav(): 'methodology.html' / 'about.html' segment match
    p = ROOT / "assets/js/main.js"
    s = p.read_text(encoding="utf-8")
    s = s.replace("top === 'methodology.html'", "top === 'methodology'")
    s = s.replace("top === 'about.html'", "top === 'about'")
    p.write_text(s, encoding="utf-8")

    # seo_inject.py: canonical/sitemap/JSON-LD URLs drop .html
    p = ROOT / "seo_inject.py"
    s = p.read_text(encoding="utf-8")
    s = s.replace(
        """    # /psychic/index.html -> /psychic/
    p = re.sub(r'/index\\.html$', '/', p)
    return p""",
        """    # /psychic/index.html -> /psychic/
    p = re.sub(r'/index\\.html$', '/', p)
    # Cloudflare auto-trailing-slash serves /about for about.html and 308s the
    # .html form, so every published URL must be extension-less.
    p = re.sub(r'\\.html$', '', p)
    return p""",
    )
    s = s.replace('"do-what-fits.html": "Do What Fits",', '"do-what-fits": "Do What Fits",')
    p.write_text(s, encoding="utf-8")
    report.append(("seo_inject.py path_to_url + SEG_NAMES", 2))

    # build-content-index.py: content index URLs drop .html
    p = ROOT / "scripts/build-content-index.py"
    s = p.read_text(encoding="utf-8")
    s = s.replace(
        '    return re.sub(r"/index\\.html$", "/", p)',
        '    p = re.sub(r"\\.html$", "", p)\n    return re.sub(r"/index\\.html$", "/", p)',
    )
    p.write_text(s, encoding="utf-8")
    report.append(("build-content-index.py page_url", 1))

    for name, n in report:
        print(f"{n:4d}  {name}")
    print(f"\n{total} link replacements across {len(report)} targets.")
    if total == 0:
        print("Nothing to do (already migrated?)")
        return 0
    print("\nNext steps:")
    print("  1. python seo_inject.py          # regenerate canonical/OG/JSON-LD/sitemap")
    print("  2. python scripts/build-content-index.py")
    print("  3. npm test")
    return 0


if __name__ == "__main__":
    sys.exit(main())
