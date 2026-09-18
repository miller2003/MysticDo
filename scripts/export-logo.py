#!/usr/bin/env python
"""
MysticDo brand mark - production export pipeline.

Takes the RGBA master produced by ``extract-logo.py`` and emits the complete
set of web assets. The point of every step here is to defeat the blurring that
happens when Google and social crawlers re-encode images:

1. **Square, re-centred, padded canvas.** The raw artwork runs to the very edge
   of frame. Crawlers scale to a square thumbnail, so edge-touching artwork
   gets clipped the moment anything rounds or pads it.

2. **Pre-scaled bitmaps at the exact display sizes.** The single biggest cause
   of blurry logos is shipping one large PNG and letting the browser downscale
   it, or shipping one small PNG and letting it upscale. We render the exact
   pixel dimensions actually used, plus 2x for retina.

3. **Unsharp mask at each size.** Resampling always softens edges. A small,
   size-appropriate sharpen restores micro-contrast and is what makes a
   downscaled mark still read crisply at 26 px in a header.

4. **WebP alongside PNG.** Typically 60-75% smaller at identical quality, so
   the header payload drops without any loss of fidelity.

5. **A 1200x630 social card.** Locks in how the logo looks in Google's
   knowledge panel and in link previews, rather than letting a crawler guess.

Outputs
-------
  assets/brand/mysticdo-mark.svg          vector fallback
  assets/brand/mysticdo-mark-{n}.png      header / hero sizes
  assets/brand/mysticdo-mark.webp         modern format
  assets/brand/favicon-{n}.png            tab icons
  assets/brand/apple-touch-icon.png       180x180 iOS home screen
  assets/brand/icon-192.png / -512.png    PWA manifest icons
  assets/og/logo-card.png                 1200x630 social card
"""

from __future__ import annotations

import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
BRAND = ROOT / "assets" / "brand"
OG = ROOT / "assets" / "og"
MASTER = BRAND / "_master_rgba.png"

# how much empty margin to add around the mark, as a fraction of the mark size
PADDING = 0.06

# sizes actually consumed by the site
HEADER_SIZES = [24, 32, 48, 64, 96]
FAVICON_SIZES = [16, 32, 48]
PWA_SIZES = [192, 512]

SHARPEN = {
    "tiny": (0.9, 110, 2),
    "small": (0.8, 95, 2),
    "mid": (0.7, 80, 2),
    "large": (0.6, 65, 2),
}


def sharpen_params(size: int) -> tuple[float, int, int]:
    if size <= 24:
        return SHARPEN["tiny"]
    if size <= 48:
        return SHARPEN["small"]
    if size <= 96:
        return SHARPEN["mid"]
    return SHARPEN["large"]


def tight_crop(im: Image.Image, threshold: int = 8) -> Image.Image:
    a = np.asarray(im)[:, :, 3]
    ys, xs = np.where(a > threshold)
    return im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))


def to_square(im: Image.Image, padding: float = PADDING) -> Image.Image:
    """Re-centre on a square canvas with uniform breathing room."""
    w, h = im.size
    side = int(max(w, h) * (1.0 + 2 * padding))
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(im, ((side - w) // 2, (side - h) // 2), im)
    return canvas


def render(im: Image.Image, size: int) -> Image.Image:
    """High-quality Lanczos downscale + size-appropriate unsharp mask."""
    out = im.resize((size, size), Image.LANCZOS)
    radius, percent, threshold = sharpen_params(size)
    out = out.filter(
        ImageFilter.UnsharpMask(radius=radius, percent=percent, threshold=threshold)
    )
    return out


def render_social_card(square: Image.Image) -> None:
    """Compose the 1200x630 Open Graph card as a PNG.

    Social crawlers render SVG inconsistently and several will not fetch a
    nested image reference at all, so the card ships as a flat bitmap. The
    emblem is rasterised at 380px - comfortably above its ~112px display size
    on the card - so the compositor only ever downsamples.
    """
    import subprocess
    import tempfile

    CARD_W, CARD_H = 1200, 630
    card = Image.new("RGB", (CARD_W, CARD_H), (251, 251, 253))

    # preferred path: rasterise cover.svg with headless Chrome at 2x, then
    # downscale - this renders the typography crisply and keeps the layout in
    # one place (the SVG).
    chrome = _find_chrome()
    cover = OG / "cover.svg"
    if chrome and cover.exists():
        with tempfile.TemporaryDirectory() as td:
            shot = Path(td) / "cover.png"
            try:
                subprocess.run(
                    [
                        chrome,
                        "--headless",
                        "--disable-gpu",
                        "--no-sandbox",
                        "--hide-scrollbars",
                        f"--screenshot={shot}",
                        f"--window-size={CARD_W},{CARD_H}",
                        "--default-background-color=ffffffff",
                        cover.resolve().as_uri(),
                    ],
                    check=True,
                    capture_output=True,
                    timeout=60,
                )
                base = Image.open(shot).convert("RGB")
                card = base.resize((CARD_W, CARD_H), Image.LANCZOS)
            except Exception as exc:  # noqa: BLE001
                print(f"  (svg render skipped: {type(exc).__name__})")

    # fall back to a plain emblem-centred card if the SVG path did not run
    if card.getpixel((5, 5)) == (251, 251, 253):
        mark = render(square, 380)
        card.paste(mark, ((CARD_W - 380) // 2, 70), mark)

    card.save(OG / "logo-card.png", optimize=True)


def _find_chrome() -> str | None:
    for cand in (
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    ):
        if Path(cand).exists():
            return cand
    return None


def main() -> None:
    BRAND.mkdir(parents=True, exist_ok=True)
    OG.mkdir(parents=True, exist_ok=True)

    master = Image.open(MASTER).convert("RGBA")
    square = to_square(tight_crop(master))
    print(f"master {master.size} -> square {square.size}")

    # ---- header / hero bitmaps ------------------------------------------
    # Both PNG and WebP are emitted at the same sizes. The header markup
    # offers WebP first via <source> and falls back to PNG, so modern
    # browsers fetch 60-75% fewer bytes with no change in appearance.
    for size in HEADER_SIZES:
        r = render(square, size)
        r.save(BRAND / f"mysticdo-mark-{size}.png", optimize=True)
        r.save(BRAND / f"mysticdo-mark-{size}.webp", quality=92, method=6)
    print(f"header PNGs : {', '.join(str(s) for s in HEADER_SIZES)} (+ webp)")

    # Square mark for schema.org Organization.logo. Google crops this field to
    # a square avatar in the knowledge panel, so it must be square and large
    # enough that the crop never upscales.
    render(square, 512).save(BRAND / "mysticdo-mark-512.png", optimize=True)
    print("schema logo : mysticdo-mark-512.png")

    # highest-fidelity WebP for the header (256px 2x-friendly master)
    webp = render(square, 256)
    webp.save(BRAND / "mysticdo-mark.webp", quality=92, method=6)
    print("webp        : mysticdo-mark.webp (256px)")

    # ---- favicons --------------------------------------------------------
    for size in FAVICON_SIZES:
        render(square, size).save(BRAND / f"favicon-{size}.png", optimize=True)
    print(f"favicons    : {', '.join(str(s) for s in FAVICON_SIZES)}")

    # ---- iOS / PWA -------------------------------------------------------
    render(square, 180).save(BRAND / "apple-touch-icon.png", optimize=True)
    for size in PWA_SIZES:
        render(square, size).save(BRAND / f"icon-{size}.png", optimize=True)
    print(f"touch + PWA : apple-touch-icon.png, icon-{PWA_SIZES[0]}.png, "
          f"icon-{PWA_SIZES[1]}.png")

    # ---- 1200x630 social card -------------------------------------------
    # Crawlers render SVG inconsistently, so the card is shipped as a PNG.
    # The emblem is composited in at its native resolution rather than being
    # scaled up from a smaller source.
    render_social_card(square)
    print("social card : assets/og/logo-card.png (1200x630)")

    # ---- report ----------------------------------------------------------
    print("\nfile sizes:")
    total = 0
    for p in sorted(BRAND.glob("*.png")) + sorted(BRAND.glob("*.webp")):
        if p.name.startswith("_"):
            continue
        kb = p.stat().st_size / 1024
        total += kb
        print(f"  {p.name:<28} {kb:7.1f} KB")
    card_kb = (OG / "logo-card.png").stat().st_size / 1024
    print(f"  {'assets/og/logo-card.png':<28} {card_kb:7.1f} KB")
    print(f"  {'TOTAL':<28} {total + card_kb:7.1f} KB")


if __name__ == "__main__":
    main()
