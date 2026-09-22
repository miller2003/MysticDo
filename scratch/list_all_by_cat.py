import json

with open('scratch/quiz_meta.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Total quizzes: {len(data)}")
categories = {}

# Group by category from file paths or intent names
import glob, re
html_files = glob.glob('questions/**/*.html', recursive=True)
slug_to_cat = {}
for h in html_files:
    m = re.search(r'data-quiz=["\']([^"\']+)["\']', open(h, 'r', encoding='utf-8').read())
    if m:
        parts = h.replace('\\', '/').split('/')
        cat = parts[1] if len(parts) > 2 else 'root'
        slug_to_cat[m.group(1)] = cat

for slug, qz in data.items():
    cat = slug_to_cat.get(slug, 'other')
    categories.setdefault(cat, []).append(slug)

print("\nQuizzes by category:")
for cat, slugs in sorted(categories.items()):
    print(f"\n[{cat}] ({len(slugs)} quizzes):")
    for s in slugs:
        q_count = data[s].get('questionsCount', 0)
        p_count = len(data[s].get('patterns', []))
        print(f"  - {s:35} | {q_count} qs | {p_count} patterns | title: {data[s].get('title')}")
