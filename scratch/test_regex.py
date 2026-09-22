import re

path = 'questions/love-relationships/will-he-come-back.html'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Direct Answer
# Find the front-panel-answer paragraph
fp_pattern = r'(<div class="front-panel-answer">\s*<h2 class="front-panel-kicker">.*?</h2>\s*<p>)(.*?)(</p>\s*</div>)'
m = re.search(fp_pattern, content, re.DOTALL)
if m:
    lead = m.group(1)
    text = m.group(2).strip()
    trail = m.group(3)
    print("Found direct answer text:")
    print(text[-150:])
else:
    print("Direct answer NOT found!")

# 2. Find FAQ item
faq_pattern = r'<details class="faq-item">\s*<summary>([^<]*?(?:pattern check|quiz)[^<]*?)</summary>\s*<div class="faq-answer"><p>(.*?)</p></div>\s*</details>'
m2 = re.search(faq_pattern, content, re.DOTALL | re.IGNORECASE)
if m2:
    print("\nFound quiz FAQ:")
    print("Summary:", m2.group(1))
    print("Answer preview:", m2.group(2)[:100])
else:
    print("\nQuiz FAQ NOT found!")
