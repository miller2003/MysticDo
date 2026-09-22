import os, re

files = [
    'questions/loss-closure/signs-from-deceased-loved-ones.html',
    'questions/loss-closure/dream-about-deceased-loved-one.html',
    'questions/loss-closure/is-my-loved-one-watching-over-me.html',
    'questions/money-wealth/why-am-i-always-broke.html',
    'questions/money-wealth/will-i-be-rich.html',
    'questions/angel-numbers/444-meaning.html',
    'questions/angel-numbers/333-meaning.html',
    'questions/angel-numbers/777-meaning.html',
    'questions/angel-numbers/555-meaning.html',
    'questions/angel-numbers/888-meaning.html',
    'questions/tarot/tower-card-meaning.html',
    'questions/tarot/lovers-card-meaning.html',
    'questions/tarot/tarot-yes-or-no.html',
    'questions/dreams/dream-about-being-chased.html',
    'questions/dreams/dream-about-your-ex.html',
    'questions/dreams/dream-about-someone-dying.html',
    'questions/astrology/what-is-my-moon-sign.html',
    'questions/astrology/what-is-my-saturn-return.html',
    'questions/life-direction/feeling-lost-in-life.html',
    'questions/career-work/am-i-in-the-right-career.html',
]

for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        content = fp.read()
    title = re.search(r'<title>(.*?)</title>', content)
    fp_ans = re.search(r'<div class="front-panel-answer">(.*?)</div>', content, re.DOTALL)
    faq_match = re.search(r'<details class="faq-item">\s*<summary>(.*?Pattern Check.*?)</summary>', content, re.DOTALL)
    print(f'=== {f} ===')
    print('TITLE:', title.group(1) if title else 'NONE')
    if fp_ans:
        ans_text = re.sub(r'<[^>]+>', ' ', fp_ans.group(1))
        ans_clean = ' '.join(ans_text.split())
        print('FRONT PANEL:', ans_clean)
    if faq_match:
        print('FAQ SUMMARY:', faq_match.group(1).strip())
