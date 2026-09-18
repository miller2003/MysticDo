"""Crop the 390px iframe out of a shot and slice it into readable bands.
Usage: python slice390.py <src.png> <out_prefix> [slice_h] [overlap] [x] [w]
"""
import sys
from PIL import Image

src = sys.argv[1]
prefix = sys.argv[2]
slice_h = int(sys.argv[3]) if len(sys.argv) > 3 else 1000
overlap = int(sys.argv[4]) if len(sys.argv) > 4 else 100
x = int(sys.argv[5]) if len(sys.argv) > 5 else 20
w = int(sys.argv[6]) if len(sys.argv) > 6 else 390

im = Image.open(src).convert("RGB")
im = im.crop((x, 0, x + w, im.size[1]))
W, H = im.size
print(f"cropped: {W}x{H}")

y, i = 0, 0
while y < H:
    im.crop((0, y, W, min(y + slice_h, H))).save(f"{prefix}-{i:02d}.png")
    y += slice_h - overlap
    i += 1
print(f"{i} slices -> {prefix}-NN.png")
