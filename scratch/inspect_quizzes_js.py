import re
import json

with open('assets/js/quizzes.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

# Let's find all quiz keys in MYSTICDO_QUIZZES
keys = re.findall(r"['\"]([a-z0-9-]+)['\"]\s*:\s*\{\s*(?:id\s*:\s*['\"][a-z0-9-]+['\"]|title\s*:)", js_content)
print(f"Found quiz keys in quizzes.js: {len(keys)}")
print(keys)
