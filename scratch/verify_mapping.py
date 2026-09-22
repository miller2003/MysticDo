import json

with open('scratch/quiz_inventory.json', 'r', encoding='utf-8') as f:
    pages = json.load(f)

with open('scratch/quiz_meta.json', 'r', encoding='utf-8') as f:
    quizzes = json.load(f)

print(f"Total pages in inventory: {len(pages)}")

missing = []
for p in pages:
    slug = p['slug']
    if slug not in quizzes:
        missing.append((p['path'], slug))

if missing:
    print(f"Missing quiz metadata for: {missing}")
else:
    print("ALL 61 pages have matching quiz metadata!")
