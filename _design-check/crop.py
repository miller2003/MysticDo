"""Slice a tall screenshot into readable bands for design review.
Usage: python crop.py <src.png> <out_prefix> [slice_h] [overlap]
"""
import sys
from PIL import Image

src = sys.argv[1]
prefix = sys.argv[2]
slice_h = int(sys.argv[3]) if len(sys.argv) > 3 else 1100
overlap = int(sys.argv[4]) if len(sys.argv) > 4 else 120

im = Image.open(src)
w, h = im.size
print(f"source: {w}x{h}")

y = 0
i = 0
while y < h:
    box = (0, y, w, min(y + slice_h, h))
    im.crop(box).save(f"{prefix}-{i:02d}.png")
    print(f"slice {i}: y={y}..{box[3]}")
    y += slice_h - overlap
    i += 1
