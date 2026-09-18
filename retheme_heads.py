# -*- coding: utf-8 -*-
"""One-off retheme: strip Google Fonts, swap favicon + theme-color in all HTML heads."""
import re, pathlib

ROOT = pathlib.Path(r"C:\Users\samja\Desktop\site\mysticdo")

NEW_FAVICON = ('<link rel="icon" href="data:image/svg+xml,'
               "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'>"
               "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>"
               "<stop offset='0' stop-color='%236f6ceb'/><stop offset='1' stop-color='%234c48c9'/>"
               "</linearGradient></defs>"
               "<rect x='1' y='1' width='30' height='30' rx='8' fill='url(%23g)'/>"
               "<path d='M20 8a8 8 0 1 0 4 14 7 7 0 1 1-4-14z' fill='white'/>"
               "<circle cx='22' cy='11' r='1.5' fill='white'/></svg>\">")

favicon_re = re.compile(r'<link rel="icon" href="data:image/svg\+xml,[^"]*">')
font_line_re = re.compile(r'^.*fonts\.(googleapis|gstatic)\.com.*\r?\n', re.M)

changed = []
for f in sorted(ROOT.rglob("*.html")):
    if ".workbuddy" in f.parts:
        continue
    s = f.read_text(encoding="utf-8-sig")
    orig = s
    s = font_line_re.sub("", s)
    s = favicon_re.sub(NEW_FAVICON, s)
    s = s.replace('content="#f7f4ec"', 'content="#fbfbfd"')
    if s != orig:
        # preserve BOM if the file had one (daily-card.html does)
        raw = f.read_bytes()
        bom = raw.startswith(b"\xef\xbb\xbf")
        f.write_text(s, encoding="utf-8")
        if bom:
            data = f.read_bytes()
            if not data.startswith(b"\xef\xbb\xbf"):
                f.write_bytes(b"\xef\xbb\xbf" + data)
        changed.append(str(f.relative_to(ROOT)))

print(f"updated {len(changed)} files")
for c in changed:
    print(" -", c)
