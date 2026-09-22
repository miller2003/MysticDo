with open('assets/js/quizzes.js', 'r', encoding='utf-8') as f:
    src = f.read()

import re
matches = [m.start() for m in re.finditer(r'does-he-love-me', src)]
print(f"Found {len(matches)} occurrences of does-he-love-me:")
for pos in matches[:10]:
    print(pos, repr(src[pos-30:pos+50]))
