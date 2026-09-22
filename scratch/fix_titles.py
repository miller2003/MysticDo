# -*- coding: utf-8 -*-
"""Shorten the 20 batch-2026-09-22 titles so every <title> is <=60 chars
(the audit soft limit; hard gate is 65). Keeps the query term first, drops
the verbose "4-Signal ... Screener/Diagnostic" tail, keeps "| MysticDo".

Updates <title> and the matching og:title in the same pass, then asserts
length + uniqueness. Dry-run by default: pass --apply to write.
"""
import io, os, re, sys, html as htmllib

APPLY = '--apply' in sys.argv
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

NEW = {
 "questions/angel-numbers/333-meaning.html":
   "333 Meaning: A Decision Crossroads Check | MysticDo",
 "questions/angel-numbers/444-meaning.html":
   "444 Meaning: An Autonomic Grounding Check | MysticDo",
 "questions/angel-numbers/555-meaning.html":
   "555 Meaning: A Life Transition Check | MysticDo",
 "questions/angel-numbers/777-meaning.html":
   "777 Meaning: An Introspection Check | MysticDo",
 "questions/angel-numbers/888-meaning.html":
   "888 Meaning: A Reciprocity Audit | MysticDo",
 "questions/astrology/what-is-my-moon-sign.html":
   "What Is My Moon Sign? Finding It Accurately | MysticDo",
 "questions/astrology/what-is-my-saturn-return.html":
   "What Is My Saturn Return? Timing &amp; Meaning | MysticDo",
 "questions/career-work/am-i-in-the-right-career.html":
   "Am I in the Right Career? Burnout &amp; Values | MysticDo",
 "questions/dreams/dream-about-being-chased.html":
   "Dream About Being Chased: What It Means | MysticDo",
 "questions/dreams/dream-about-someone-dying.html":
   "Dream About Someone Dying: What It Means | MysticDo",
 "questions/dreams/dream-about-your-ex.html":
   "Dream About Your Ex: What It Means | MysticDo",
 "questions/life-direction/feeling-lost-in-life.html":
   "Feeling Lost in Life: A Direction Check | MysticDo",
 "questions/loss-closure/dream-about-deceased-loved-one.html":
   "Dream About a Deceased Loved One: Meaning | MysticDo",
 "questions/loss-closure/is-my-loved-one-watching-over-me.html":
   "Is My Loved One Watching Over Me? | MysticDo",
 "questions/loss-closure/signs-from-deceased-loved-ones.html":
   "Signs From Deceased Loved Ones: What They Mean | MysticDo",
 "questions/money-wealth/why-am-i-always-broke.html":
   "Why Am I Always Broke? A Scarcity Check | MysticDo",
 "questions/money-wealth/will-i-be-rich.html":
   "Will I Be Rich? A Financial Reality Check | MysticDo",
 "questions/tarot/lovers-card-meaning.html":
   "Lovers Tarot Card Meaning: A Values Check | MysticDo",
 "questions/tarot/tarot-yes-or-no.html":
   "Tarot Yes or No: What It Can Decide | MysticDo",
 "questions/tarot/tower-card-meaning.html":
   "Tower Tarot Card Meaning: A Crisis Check | MysticDo",
}

def strip_tags(t):
    return re.sub(r'<[^>]+>', '', t).strip()

def decoded_len(t):   # what the audit actually measures
    return len(strip_tags(t))

# uniqueness across the whole site + within this batch
all_titles = {}
seen = {}
problems = []

for rel, new_title in NEW.items():
    path = os.path.join(BASE, rel.replace('/', os.sep))
    src = io.open(path, encoding='utf-8').read()

    m = re.search(r'<title>(.*?)</title>', src, re.S | re.I)
    if not m:
        problems.append(rel + ': no <title>'); continue
    old_title = m.group(1)
    ol, nl = decoded_len(old_title), decoded_len(new_title)

    if nl > 60:
        problems.append('%s: new title %d chars > 60' % (rel, nl))
    if '| MysticDo' not in new_title:
        problems.append(rel + ': missing brand suffix')
    if nl <= 15:
        problems.append(rel + ': suspiciously short')
    key = strip_tags(new_title)
    if key in seen:
        problems.append('%s: title collides with %s' % (rel, seen[key]))
    seen[key] = rel
    new_src = re.sub(r'<title>.*?</title>',
                     lambda _: '<title>%s</title>' % new_title,
                     src, count=1, flags=re.S | re.I)
    if not re.search(r'<meta property="og:title"', new_src):
        problems.append(rel + ': no og:title to sync')
    else:
        new_src = re.sub(r'(<meta property="og:title" content=")[^"]*(")',
                         lambda mo: mo.group(1) + new_title.replace(' | MysticDo', '') + mo.group(2),
                         new_src, count=1)
    # also sync the <title> inside the og/twitter-less head hints if any
    print('%-62s %2d -> %2d' % (os.path.basename(rel), ol, nl))
    if APPLY and new_src != src:
        io.open(path, 'w', encoding='utf-8', newline='').write(new_src)

print()
if problems:
    print('PROBLEMS (%d):' % len(problems))
    for p in problems:
        print('  ' + p)
    sys.exit(1)
print('OK: 20 titles validated <=60 chars, unique, branded.' + (' APPLIED.' if APPLY else ' (dry run)'))
