# -*- coding: utf-8 -*-
"""Structural section matrix for the 20 new pages vs the §4 contract."""
import os, re, io

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NEW = ["questions/angel-numbers/333-meaning.html","questions/angel-numbers/444-meaning.html",
"questions/angel-numbers/555-meaning.html","questions/angel-numbers/777-meaning.html",
"questions/angel-numbers/888-meaning.html","questions/astrology/what-is-my-moon-sign.html",
"questions/astrology/what-is-my-saturn-return.html","questions/career-work/am-i-in-the-right-career.html",
"questions/dreams/dream-about-being-chased.html","questions/dreams/dream-about-someone-dying.html",
"questions/dreams/dream-about-your-ex.html","questions/life-direction/feeling-lost-in-life.html",
"questions/loss-closure/dream-about-deceased-loved-one.html","questions/loss-closure/is-my-loved-one-watching-over-me.html",
"questions/loss-closure/signs-from-deceased-loved-ones.html","questions/money-wealth/why-am-i-always-broke.html",
"questions/money-wealth/will-i-be-rich.html","questions/tarot/lovers-card-meaning.html",
"questions/tarot/tarot-yes-or-no.html","questions/tarot/tower-card-meaning.html"]

def read(rel):
    with io.open(os.path.join(BASE, rel.replace("/", os.sep)), encoding="utf-8") as f:
        return f.read()

# contract features
FEATS = [
 ("ATGLANCE",   lambda h: "cmp-table" in h),
 ("EVIDENCE",   lambda h: bool(re.search(r"research can", h, re.I))),
 ("SIGFRAME",   lambda h: bool(re.search(r"signal", h, re.I))),
 ("QUIZEXPL",   lambda h: "What this pattern check looks at" in h),
 ("INLINECTA",  lambda h: "quiz-inline-cta" in h),
 ("SPIRITBR",   lambda h: bool(re.search(r"outside perspective|If you still want", h, re.I))),
 ("UNDERNEATH", lambda h: bool(re.search(r"underneath the question|actually be trying to know|underneath", h, re.I))),
 ("MIDCTA",     lambda h: h.count('class="cta-band"') >= 1),
 ("WHICHPRAC",  lambda h: 'id="which-practice"' in h),
 ("READWELL",   lambda h: bool(re.search(r"How to use a (reading|reader)", h, re.I))),
 ("REDFLAGS",   lambda h: bool(re.search(r"red flag", h, re.I))),
 ("BEFOREBOOK", lambda h: bool(re.search(r"Before you book|Read this first", h, re.I))),
 ("FAQ",        lambda h: h.count("faq-item") >= 6),
 ("METHOD",     lambda h: bool(re.search(r"editorial approach|methodology", h, re.I))),
 ("RELATED",    lambda h: bool(re.search(r"Related .* (resources|guides|<)", h, re.I)) or "grid-3" in h),
 ("ENDCTA",     lambda h: h.count('class="cta-band"') >= 2),
]

hdr = "%-32s" % "slug" + "".join("%-11s" % f[0] for f in FEATS)
print(hdr)
print("-" * len(hdr))
summary = {}
for rel in NEW:
    html = read(rel)
    slug = os.path.basename(rel)[:-5]
    line = "%-32s" % slug
    missing = []
    for name, fn in FEATS:
        ok = fn(html)
        line += "%-11s" % ("ok" if ok else "MISSING")
        if not ok:
            missing.append(name)
    print(line)
    summary[slug] = missing

print("\n=== FILES WITH MISSING SECTIONS ===")
for slug, miss in summary.items():
    if miss:
        print("%-32s %s" % (slug, ", ".join(miss)))
print("\ncomplete: %d / %d" % (sum(1 for m in summary.values() if not m), len(summary)))
