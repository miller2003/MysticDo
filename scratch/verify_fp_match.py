import json
import re

with open('scratch/quiz_inventory.json', 'r', encoding='utf-8') as f:
    pages = json.load(f)

for p in pages:
    path = p['path']
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    m = re.search(r'<div class="front-panel-answer">\s*<h2 class="front-panel-kicker">.*?</h2>\s*<p>(.*?)</p>\s*</div>', content, re.DOTALL)
    if not m:
        print(f"FAILED TO MATCH front-panel-answer in {path}")
    else:
        pass

print("Check finished!")
