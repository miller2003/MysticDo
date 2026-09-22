with open('seo_inject.py', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.findall(r'def \w+\([^)]*\):', text)
print("Functions defined in seo_inject.py:")
for m in matches:
    print(" ", m)

# Let's see main loop in seo_inject.py
main_idx = text.find('def main(')
if main_idx != -1:
    print("\nMain function preview:")
    print(text[main_idx:main_idx+1500])
