# -*- coding: utf-8 -*-
"""Pre-launch structural audit of the 20 new flagship intent articles."""
import os, re, json, io, sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

NEW = [
 "questions/angel-numbers/333-meaning.html",
 "questions/angel-numbers/444-meaning.html",
 "questions/angel-numbers/555-meaning.html",
 "questions/angel-numbers/777-meaning.html",
 "questions/angel-numbers/888-meaning.html",
 "questions/astrology/what-is-my-moon-sign.html",
 "questions/astrology/what-is-my-saturn-return.html",
 "questions/career-work/am-i-in-the-right-career.html",
 "questions/dreams/dream-about-being-chased.html",
 "questions/dreams/dream-about-someone-dying.html",
 "questions/dreams/dream-about-your-ex.html",
 "questions/life-direction/feeling-lost-in-life.html",
 "questions/loss-closure/dream-about-deceased-loved-one.html",
 "questions/loss-closure/is-my-loved-one-watching-over-me.html",
 "questions/loss-closure/signs-from-deceased-loved-ones.html",
 "questions/money-wealth/why-am-i-always-broke.html",
 "questions/money-wealth/will-i-be-rich.html",
 "questions/tarot/lovers-card-meaning.html",
 "questions/tarot/tarot-yes-or-no.html",
 "questions/tarot/tower-card-meaning.html",
]

def read(rel):
    p = os.path.join(BASE, rel.replace("/", os.sep))
    with io.open(p, encoding="utf-8") as f:
        return f.read()

def strip(t):
    return re.sub(r"<[^>]+>", "", t).strip()

BASE_URL = "https://mysticdo.com"

print("=" * 100)
print("NEW-20 STRUCTURAL AUDIT")
print("=" * 100)

rows = []
for rel in NEW:
    html = read(rel)
    slug = os.path.basename(rel)[:-5]
    d = {"slug": slug, "rel": rel}

    m = re.search(r"<title>(.*?)</title>", html, re.S)
    d["title"] = strip(m.group(1)) if m else ""
    d["title_len"] = len(d["title"])

    m = re.search(r'<meta\s+name="description"\s+content="([^"]*)"', html)
    d["desc"] = m.group(1) if m else ""
    d["desc_len"] = len(d["desc"])

    m = re.search(r'<link\s+rel="canonical"\s+href="([^"]+)"', html)
    d["canonical"] = m.group(1) if m else ""
    exp = BASE_URL + "/" + rel[:-5]
    d["canonical_ok"] = (d["canonical"] == exp)
    d["canonical_exp"] = exp

    d["h1"] = len(re.findall(r"<h1[\s>]", html))

    # JSON-LD types
    types = []
    for blk in re.findall(r'<script\s+type="application/ld\+json">(.*?)</script>', html, re.S):
        try:
            data = json.loads(blk)
        except Exception as e:
            types.append("BADJSON:" + str(e)[:40]); continue
        for item in (data if isinstance(data, list) else [data]):
            types.append(item.get("@type", "?"))
    d["jsonld"] = types
    d["has_webapp"] = any(t == "WebApplication" for t in types)
    d["has_article"] = any(t == "Article" for t in types)
    d["has_faq"] = any(t == "FAQPage" for t in types)
    d["has_breadcrumb"] = any(t == "BreadcrumbList" for t in types)

    # structure signals
    d["front_panel"] = 'class="front-panel"' in html and 'id="pattern-check"' in html
    d["quiz_div"] = re.search(r'<div\s+id="quiz"\s+data-quiz="([^"]+)"', html)
    d["quiz_div"] = d["quiz_div"].group(1) if d["quiz_div"] else ""
    d["quiz_modal"] = "data-quiz-modal" in html
    d["quiz_open"] = html.count("data-quiz-open")
    d["btn_gold"] = html.count("btn-gold")
    d["direct_answer"] = "front-panel-kicker" in html
    d["cmp_tables"] = html.count("cmp-table")
    d["cmp_cols"] = len(re.findall(r"<th[\s>]", html.split("cmp-table")[1][:2000])) if "cmp-table" in html else 0
    d["faq_items"] = html.count("faq-item")
    d["quiz_inline_cta"] = html.count("quiz-inline-cta")
    d["cta_band"] = html.count("cta-band")
    d["which_practice"] = 'id="which-practice"' in html
    d["reading_well"] = "How to use a reading well" in html
    d["email_input"] = ('type="email"' in html)
    d["underneath_h3"] = len(re.findall(r"<h3[^>]*>", html))
    d["words"] = len(strip(html).split())

    # banned somatic
    d["somatic"] = [w for w in ["salt water","saltwater","candle","tidy","drawer","sunlight reset","moon water"] if w.lower() in html.lower()]
    # banned launcher phrasing
    d["read_his"] = bool(re.search(r"Read (His|Its) .{0,30}Pattern", html, re.I))
    d["with_him"] = bool(re.search(r"With Him\?", html, re.I))

    # internal links -> check existence
    links = re.findall(r'href="(/[^"#?]*)"', html)
    bad = []
    for l in set(links):
        if l.startswith("/assets") or l.endswith(".xml") or l.endswith(".txt") or l.startswith("/api"):
            continue
        cand = l.lstrip("/")
        if cand.endswith("/"):
            cand += "index.html"
        elif "." not in os.path.basename(cand):
            cand += ".html"
        if not os.path.exists(os.path.join(BASE, cand.replace("/", os.sep))):
            bad.append(l)
    d["bad_links"] = sorted(bad)

    rows.append(d)

# report
print("\n%-2s %-38s %5s %5s %3s %3s %3s %-14s" % ("#","slug","tLen","dLen","H1","tbl","faq","quiz"))
for i, d in enumerate(rows, 1):
    print("%-2d %-38s %5d %5d %3d %3d %3d %-14s" % (
        i, d["slug"], d["title_len"], d["desc_len"], d["h1"], d["cmp_tables"], d["faq_items"], d["quiz_div"] or "MISSING"))

print("\n" + "=" * 100)
print("DETAIL")
print("=" * 100)
for d in rows:
    probs = []
    if d["title_len"] > 65: probs.append("TITLE>65 (%d)" % d["title_len"])
    elif d["title_len"] > 60: probs.append("title borderline (%d)" % d["title_len"])
    if d["desc_len"] > 165: probs.append("DESC>165 (%d)" % d["desc_len"])
    elif d["desc_len"] < 120: probs.append("desc short (%d)" % d["desc_len"])
    if d["h1"] != 1: probs.append("H1=%d" % d["h1"])
    if not d["canonical_ok"]: probs.append("canonical=%s" % d["canonical"])
    if not d["has_webapp"]: probs.append("no WebApplication")
    if not d["has_article"]: probs.append("no Article")
    if not d["has_faq"]: probs.append("no FAQPage")
    if not d["has_breadcrumb"]: probs.append("no BreadcrumbList")
    if not d["front_panel"]: probs.append("no front-panel/#pattern-check")
    if not d["quiz_div"]: probs.append("no #quiz mount")
    if not d["quiz_modal"]: probs.append("no data-quiz-modal")
    if d["faq_items"] < 6: probs.append("faq=%d (<6)" % d["faq_items"])
    if d["cta_band"] < 2: probs.append("cta-band=%d (<2)" % d["cta_band"])
    if not d["which_practice"]: probs.append("no #which-practice")
    if not d["reading_well"]: probs.append("no 'How to use a reading well'")
    if d["email_input"]: probs.append("EMAIL INPUT PRESENT")
    if d["bad_links"]: probs.append("BAD LINKS %s" % d["bad_links"])
    if d["somatic"]: probs.append("SOMATIC %s" % d["somatic"])
    if d["read_his"]: probs.append("banned 'Read His Pattern'")
    if d["with_him"]: probs.append("banned '...With Him?'")
    if not probs:
        print("OK   %-38s words=%d jsonld=%s" % (d["slug"], d["words"], ",".join(d["jsonld"])))
    else:
        print("FAIL %-38s" % d["slug"])
        for p in probs:
            print("       - " + p)
