#!/usr/bin/env python3
"""
MysticDo GA4 (Google Analytics 4) injector.

Injects the official gtag.js snippet into every deployable HTML page's <head>.
Idempotent: re-running replaces the previously injected block, so updating the
Measurement ID only requires running it again.

Usage (from project root):
  python scripts/inject_ga4.py --id G-XXXXXXXXXX
  python scripts/inject_ga4.py                 # inject with placeholder ID
  python scripts/inject_ga4.py --remove        # strip the block from all pages

Find your ID: analytics.google.com -> Admin -> Data streams -> your web stream
-> Measurement ID (starts with "G-").
"""
import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Directories that never contain deployable HTML pages.
# email-templates is excluded on purpose: scripts inside emails are useless
# (clients strip them) and hurt deliverability.
EXCLUDE_DIRS = {
    ".workbuddy", ".astro", ".git", "node_modules",
    "_design-check", "logo-drafts", "scripts", "assets", "functions", "worker",
    "email-templates",
}

START = "<!-- GOOGLE-ANALYTICS-START (managed by scripts/inject_ga4.py) -->"
END = "<!-- GOOGLE-ANALYTICS-END -->"

DEFAULT_ID = "__GA4_MEASUREMENT_ID__"

# Official snippet from https://support.google.com/analytics/answer/9304153
# (Google tag / gtag.js). ID is substituted at injection time.
SNIPPET = """<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=__ID__"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '__ID__');
</script>"""


def iter_html_files():
    for p in sorted(ROOT.rglob("*.html")):
        if any(part in EXCLUDE_DIRS for part in p.relative_to(ROOT).parts):
            continue
        yield p


def build_block(measurement_id: str) -> str:
    return START + "\n" + SNIPPET.replace("__ID__", measurement_id) + "\n" + END


def strip_block(html: str) -> str:
    pattern = re.compile(re.escape(START) + r".*?" + re.escape(END) + r"\n?", re.DOTALL)
    return pattern.sub("", html)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--id", default=DEFAULT_ID, help="GA4 Measurement ID (G-XXXXXXXXXX)")
    ap.add_argument("--remove", action="store_true", help="remove injected block from all pages")
    args = ap.parse_args()

    if not args.remove and not re.fullmatch(r"G-[A-Z0-9]{6,12}", args.id):
        if args.id != DEFAULT_ID:
            print(f"[!] '{args.id}' does not look like a GA4 Measurement ID (G-XXXXXXXXXX).")
            return 1

    if not args.remove and args.id == DEFAULT_ID:
        print("[!] Injecting with PLACEHOLDER ID. Data will NOT be captured until you")
        print("    re-run with --id G-... (analytics.google.com -> Admin -> Data streams).")

    injected = updated = removed = skipped = 0
    block = build_block(args.id)

    for path in iter_html_files():
        html = path.read_text(encoding="utf-8")
        had_block = START in html
        if args.remove:
            if had_block:
                path.write_text(strip_block(html), encoding="utf-8")
                removed += 1
            continue
        html = strip_block(html)  # idempotent: drop old block first
        m = re.search(r"</head\s*>", html, re.IGNORECASE)
        if not m:
            print(f"[skip] no </head> found: {path.relative_to(ROOT)}")
            skipped += 1
            continue
        html = html[: m.start()] + block + "\n" + html[m.start():]
        path.write_text(html, encoding="utf-8")
        if had_block:
            updated += 1
        else:
            injected += 1

    if args.remove:
        print(f"Removed GA4 block from {removed} page(s).")
    else:
        print(f"Injected: {injected} new | updated: {updated} | skipped: {skipped}")
        print(f"ID    : {args.id}")
        if args.id == DEFAULT_ID:
            print("\nNEXT STEP: re-run with your real ID, e.g.:")
            print("  python scripts/inject_ga4.py --id G-XXXXXXXXXX")
    return 0


if __name__ == "__main__":
    sys.exit(main())
