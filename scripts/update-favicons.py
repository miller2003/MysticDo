#!/usr/bin/env python
"""
Replace the old inline data-URI SVG favicon with the real PNG icon set, and
add the apple-touch-icon / PWA icon links. Idempotent: safe to re-run.

Why PNG rather than the old inline SVG data URI:
  * Google's favicon pipeline in SERPs re-encodes and downsamples the icon. A
    pre-rendered, pre-sharpened PNG at the exact sizes Google requests (16, 32,
    48) survives that pass far better than a scaled SVG.
  * An explicit multi-size icon set also lets the browser and the crawler each
    pick the correct raster instead of rasterising on demand.
  * `apple-touch-icon` and the PWA manifest icons need raster files regardless.
"""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

OLD_FAVICON_RE = re.compile(r'<link rel="icon" href="data:image/svg\+xml,[^"]*">')

NEW_FAVICON = (
    '<link rel="icon" type="image/png" sizes="32x32" href="/assets/brand/favicon-32.png">\n'
    '<link rel="icon" type="image/png" sizes="48x48" href="/assets/brand/favicon-48.png">\n'
    '<link rel="icon" type="image/png" sizes="16x16" href="/assets/brand/favicon-16.png">\n'
    '<link rel="apple-touch-icon" sizes="180x180" href="/assets/brand/apple-touch-icon.png">'
)

MARKER = "<!-- BRAND-ICONS -->"


def already_updated(text: str) -> bool:
    return MARKER in text or "favicon-32.png" in text


def update_file(path: Path) -> str:
    text = path.read_text(encoding="utf-8")

    if already_updated(text):
        return "skip (already updated)"

    if OLD_FAVICON_RE.search(text):
        text = OLD_FAVICON_RE.sub(NEW_FAVICON, text, count=1)
    elif '<link rel="stylesheet"' in text:
        # no favicon present at all - insert before the stylesheet link
        text = text.replace(
            '<link rel="stylesheet"',
            NEW_FAVICON + "\n" + '<link rel="stylesheet"',
            1,
        )
    else:
        return "skip (no head anchor found)"

    path.write_text(text, encoding="utf-8")
    return "updated"


def main() -> None:
    pages = sorted(
        p
        for p in ROOT.rglob("*.html")
        if "node_modules" not in p.parts and not p.name.startswith("_")
    )
    tally: dict[str, int] = {}
    for p in pages:
        result = update_file(p)
        tally[result] = tally.get(result, 0) + 1
        print(f"  {result:<28} {p.relative_to(ROOT)}")
    print()
    for k, v in sorted(tally.items()):
        print(f"{v:>3}  {k}")


if __name__ == "__main__":
    main()
