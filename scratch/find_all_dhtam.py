with open('assets/js/quizzes.js', 'r', encoding='utf-8') as f:
    src = f.read()

import re
matches = [m.start() for m in re.finditer(r"'does-he-think-about-me':", src)]
print(matches)
for m in matches:
    print(src[:m].count('\n') + 1)
