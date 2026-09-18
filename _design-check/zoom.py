"""Zoom a region of a shot for close inspection.
Usage: python zoom.py <src.png> <out.png> <x> <y> <w> <h> [scale]
"""
import sys
from PIL import Image

src, out = sys.argv[1], sys.argv[2]
x, y, w, h = (int(v) for v in sys.argv[3:7])
scale = float(sys.argv[7]) if len(sys.argv) > 7 else 3.0

im = Image.open(src).convert("RGB")
im = im.crop((x, y, x + w, y + h))
im = im.resize((int(im.size[0] * scale), int(im.size[1] * scale)), Image.LANCZOS)
im.save(out)
print(f"{out} {im.size}")
