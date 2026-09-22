# -*- coding: utf-8 -*-
"""Cross-page sentence reuse + basic HTML integrity for the 20 new pages."""
import os, re, io, collections

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

def body_text(html):
    h = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", html, flags=re.S | re.I)
    h = re.sub(r"<details class=\"faq-item.*?</details>", " ", h, flags=re.S)
    h = re.sub(r"<[^>]+>", " ", h)
    h = h.replace("&mdash;", "-").replace("&ndash;", "-").replace("&rsquo;", "'")
    h = h.replace("&ldquo;", '"').replace("&rdquo;", '"').replace("&amp;", "&")
    h = re.sub(r"\s+", " ", h)
    return h

sent_map = collections.defaultdict(set)
for rel in NEW:
    txt = body_text(read(rel))
    slug = os.path.basename(rel)[:-5]
    for s in re.split(r"(?<=[.!?])\s+", txt):
        s = s.strip()
        if 70 <= len(s) <= 400:
            sent_map[s].add(slug)

shared = {s: v for s, v in sent_map.items() if len(v) > 1}
print("=== SHARED SENTENCES ACROSS NEW PAGES (>=70 chars) ===")
print("total shared: %d" % len(shared))
for s, v in sorted(shared.items(), key=lambda kv: -len(kv[1]))[:25]:
    print("  [%d pages] %s" % (len(v), s[:150]))

print("\n=== HTML INTEGRITY ===")
for rel in NEW:
    h = read(rel)
    slug = os.path.basename(rel)[:-5]
    opens = collections.Counter(re.findall(r"<(section|div|details|p|h[1-6]|ul|ol|li|a|span)\b[^>]*?(?<!/)>", h))
    closes = collections.Counter(re.findall(r"</(section|div|details|p|h[1-6]|ul|ol|li|a|span)>", h))
    diff = {k: opens[k] - closes.get(k, 0) for k in opens}
    bad = {k: v for k, v in diff.items() if v != 0}
    if bad:
        print("  %-38s %s" % (slug, bad))
print("  (only mismatches printed above)")
