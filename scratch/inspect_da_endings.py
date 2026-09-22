import json
import re

with open('scratch/quiz_inventory.json', 'r', encoding='utf-8') as f:
    pages = json.load(f)

for p in pages:
    path = p['path']
    slug = p['slug']
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    m = re.search(r'<div class="front-panel-answer">\s*<h2 class="front-panel-kicker">.*?</h2>\s*<p>(.*?)</p>', content, re.DOTALL)
    text = m.group(1).strip()
    
    # print last 100 chars
    print(f"{slug}: ...{text[-110:]}")
