#!/usr/bin/env python3
"""
Self-host Cormorant Garamond for MysticDo (run once; idempotent).

Why: the Google Fonts @import created a 4-hop serial chain
(html -> style.css -> fonts.googleapis.com -> fonts.gstatic.com),
causing a visible FOUT "jump" on mobile. This script:
  1. Fetches Google's CSS (woff2-capable UA) for the 5 variants in use.
  2. Keeps the *latin* subset @font-face blocks (site is English-only).
  3. Downloads the woff2 files into assets/fonts/.
  4. Replaces the @import line in assets/css/style.css with local
     @font-face rules (unicode-range preserved, font-display: swap).
  5. Injects a <link rel="preload"> for the critical weight (600 normal)
     into every page head so the font downloads in parallel with CSS.

Re-run safe: existing woff2 files are kept, style.css replacement only
matches the exact @import line, preload injection skips pages that
already contain it.
"""
import glob
import os
import re
import sys
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSS_PATH = os.path.join(ROOT, "assets", "css", "style.css")
FONT_DIR = os.path.join(ROOT, "assets", "fonts")
CSS_URL = ("https://fonts.googleapis.com/css2?"
           "family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600"
           "&display=swap")
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")
CRITICAL = "cormorant-garamond-latin-600-normal.woff2"
PRELOAD_TAG = ('<link rel="preload" href="/assets/fonts/' + CRITICAL +
               '" as="font" type="font/woff2" crossorigin>')

os.makedirs(FONT_DIR, exist_ok=True)

req = urllib.request.Request(CSS_URL, headers={"User-Agent": UA})
css = urllib.request.urlopen(req, timeout=30).read().decode("utf-8")

block_re = re.compile(r"/\*\s*([a-z0-9-]+)\s*\*/\s*(@font-face\s*\{[^}]*\})",
                      re.S)
url_re = re.compile(r"url\((https://fonts\.gstatic\.com/[^)]+\.woff2)\)")
weight_re = re.compile(r"font-weight:\s*(\d+)")
style_re = re.compile(r"font-style:\s*(\w+)")

kept = []
for subset, block in block_re.findall(css):
    if subset != "latin":
        continue
    src = url_re.search(block)
    weight = weight_re.search(block).group(1)
    style = style_re.search(block).group(1)
    fname = f"cormorant-garamond-latin-{weight}-{style}.woff2"
    dest = os.path.join(FONT_DIR, fname)
    if not os.path.exists(dest):
        data = urllib.request.urlopen(
            urllib.request.Request(src.group(1), headers={"User-Agent": UA}),
            timeout=30).read()
        with open(dest, "wb") as fh:
            fh.write(data)
        print(f"downloaded {fname}  ({len(data)/1024:.1f} KB)")
    else:
        print(f"exists     {fname}")
    kept.append(block.replace(src.group(1), "/assets/fonts/" + fname))

if not kept:
    sys.exit("ERROR: no latin @font-face blocks found — Google CSS layout changed?")

fontface_css = ("/* Self-hosted Cormorant Garamond (latin subset, woff2).\n"
                "   Migrated from the Google Fonts @import to kill the\n"
                "   serial font-fetch chain that caused mobile FOUT.\n"
                "   Regenerate via scripts/selfhost-fonts.py. */\n"
                + "\n".join(kept) + "\n")

with open(CSS_PATH, "r", encoding="utf-8") as fh:
    style = fh.read()

import_line = ("@import url('https://fonts.googleapis.com/css2?"
               "family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;"
               "1,500;1,600&display=swap');")
if import_line in style:
    style = style.replace(import_line, fontface_css.rstrip(), 1)
    with open(CSS_PATH, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(style)
    print("style.css: @import replaced with local @font-face rules")
elif "/assets/fonts/cormorant-garamond-latin" in style:
    print("style.css: already self-hosted, skipping")
else:
    sys.exit("ERROR: @import line not found in style.css — inspect manually")

pages = [p for p in glob.glob(os.path.join(ROOT, "**", "*.html"),
                              recursive=True)
         if os.sep + "_design-check" not in p
         and os.sep + "logo-drafts" not in p]
patched = skipped = 0
for path in pages:
    with open(path, "r", encoding="utf-8") as fh:
        html = fh.read()
    if CRITICAL in html:
        skipped += 1
        continue
    if "</head>" not in html:
        print(f"WARN: no </head> in {path}")
        continue
    html = html.replace("</head>", "  " + PRELOAD_TAG + "\n</head>", 1)
    with open(path, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(html)
    patched += 1
print(f"preload injected into {patched} page(s), {skipped} already had it")
