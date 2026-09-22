import json
import sys
sys.path.append('.')
from scratch.quiz_configs import CONFIGS

with open('scratch/quiz_inventory.json', 'r', encoding='utf-8') as f:
    pages = json.load(f)

print(f"Total pages: {len(pages)}")
print(f"Total configs: {len(CONFIGS)}")

missing = [p['slug'] for p in pages if p['slug'] not in CONFIGS]
if missing:
    print("MISSING CONFIGS FOR:", missing)
else:
    print("100% of pages are covered by CONFIGS!")
