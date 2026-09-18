"""Normalise per-page resource hints in <head> (idempotent).

The display face is now self-hosted (see assets/fonts + the @font-face
block in style.css), so:
  * a preconnect to fonts.googleapis.com / fonts.gstatic.com is dead
    weight — it opens two connections that are never used;
  * a preload for the display face used above the fold is a real win,
    because it starts the download in parallel with style.css instead
    of waiting for the CSS to be parsed and the @font-face discovered.

Run from the project root:  python scripts/normalize-head-hints.py
"""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP_DIRS = {"_design-check", "assets", "scripts", "functions", "worker",
             "node_modules", ".git", ".workbuddy", "logo-drafts"}

PRECONNECT = re.compile(
    r'[ \t]*<link rel="preconnect" href="https://fonts\.(?:googleapis|gstatic)\.com"[^>]*>\s*\n?',
    re.I)
VIEWPORT = re.compile(r'(<meta name="viewport"[^>]*>)[ \t]*(?=\S)', re.I)
DOUBLE_BLANK = re.compile(r'\n{3,}')

PRELOAD = ('<link rel="preload" href="/assets/fonts/cormorant-garamond-latin-600-normal.woff2"'
           ' as="font" type="font/woff2" crossorigin>')

changed, ok = [], []

for dirpath, dirnames, filenames in os.walk(ROOT):
    dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and not d.startswith('.')]
    for fn in filenames:
        if not fn.endswith('.html'):
            continue
        p = os.path.join(dirpath, fn)
        rel = os.path.relpath(p, ROOT).replace('\\', '/')
        with open(p, encoding='utf-8') as f:
            src = f.read()
        out = PRECONNECT.sub('', src)
        out = VIEWPORT.sub(lambda m: m.group(1) + '\n', out, count=1)
        out = DOUBLE_BLANK.sub('\n\n', out)
        # add the display-face preload only where a stylesheet is linked
        if 'woff2' not in out and 'style.css' in out:
            out = out.replace('<link rel="stylesheet" href="/assets/css/style.css">',
                              '<link rel="stylesheet" href="/assets/css/style.css">\n' + PRELOAD, 1)
        if out != src:
            with open(p, 'w', encoding='utf-8', newline='') as f:
                f.write(out)
            changed.append(rel)
        else:
            ok.append(rel)

print(f'updated: {len(changed)}')
for c in changed:
    print('  ' + c)
print(f'unchanged: {len(ok)}')

# report
still = []
for dirpath, dirnames, filenames in os.walk(ROOT):
    dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and not d.startswith('.')]
    for fn in filenames:
        if fn.endswith('.html'):
            p = os.path.join(dirpath, fn)
            if 'fonts.googleapis.com' in open(p, encoding='utf-8').read():
                still.append(os.path.relpath(p, ROOT))
print('\nremaining google-font references:', still or 'none')
