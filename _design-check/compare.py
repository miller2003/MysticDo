"""Side-by-side before/after comparison strip.
Usage: python compare.py <before.png> <after.png> <out.png> <y> <h> [x_before] [x_after]
"""
import sys
from PIL import Image, ImageDraw

before_p, after_p, out_p = sys.argv[1], sys.argv[2], sys.argv[3]
y, h = int(sys.argv[4]), int(sys.argv[5])
xb = int(sys.argv[6]) if len(sys.argv) > 6 else 20
xa = int(sys.argv[7]) if len(sys.argv) > 7 else 0
W = 390

b = Image.open(before_p).convert("RGB").crop((xb, y, xb + W, y + h))
a = Image.open(after_p).convert("RGB").crop((xa, y, xa + W, y + h))

GAP, PAD, LABEL = 24, 18, 34
canvas = Image.new("RGB", (W * 2 + GAP + PAD * 2, h + LABEL + PAD * 2), (232, 234, 237))
canvas.paste(b, (PAD, PAD))
canvas.paste(a, (PAD + W + GAP, PAD))

d = ImageDraw.Draw(canvas)
for x, (tag, col) in [
    (PAD, ("BEFORE", (170, 40, 40))),
    (PAD + W + GAP, ("AFTER", (30, 110, 60))),
]:
    d.rectangle([x, PAD, x + W - 1, PAD + h], outline=(150, 152, 156))
    d.text((x + 4, PAD + h + 8), tag, fill=col)

canvas.save(out_p)
print(f"{out_p} {canvas.size}")
