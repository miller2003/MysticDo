import json
import re
import sys
sys.path.append('.')
from scratch.quiz_configs import CONFIGS

with open('scratch/quiz_inventory.json', 'r', encoding='utf-8') as f:
    pages = json.load(f)

replace_count = 0
insert_count = 0

for p in pages:
    path = p['path']
    slug = p['slug']
    cfg = CONFIGS[slug]
    tool_name = cfg['tool_name']
    
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if there is an existing pattern check FAQ
    # Look for details whose summary contains 'pattern check' or 'Does the pattern check'
    pattern = r'<details class="faq-item">\s*<summary>[^<]*?(?:pattern check|is the pattern check|does the pattern check)[^<]*?</summary>\s*<div class="faq-answer"><p>.*?</p></div>\s*</details>'
    m = re.search(pattern, content, re.DOTALL | re.IGNORECASE)
    
    if m:
        replace_count += 1
        # print(f"REPLACE in {path}: {m.group(0)[:80]}...")
    else:
        # Check if there's an FAQ with 'quiz' in summary
        pattern2 = r'<details class="faq-item">\s*<summary>[^<]*?quiz[^<]*?</summary>\s*<div class="faq-answer"><p>[^<]*?pattern check.*?</p></div>\s*</details>'
        m2 = re.search(pattern2, content, re.DOTALL | re.IGNORECASE)
        if m2:
            replace_count += 1
            # print(f"REPLACE(quiz) in {path}: {m2.group(0)[:80]}...")
        else:
            insert_count += 1
            print(f"INSERT in {path}")

print(f"\nStats: Replace={replace_count}, Insert={insert_count}, Total={replace_count + insert_count}")
