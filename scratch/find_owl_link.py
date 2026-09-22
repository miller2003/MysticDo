with open('questions/signs/owl-meaning.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
for m in re.finditer(r'href="([^"]*?synchronicities[^"]*?)"', text):
    print(m.group(0))
