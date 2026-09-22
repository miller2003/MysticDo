with open('questions/spiritual-growth/am-i-an-empath.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
for m in re.finditer(r'href="([^"]*?intuition[^"]*?)"', text):
    print(m.group(0))
