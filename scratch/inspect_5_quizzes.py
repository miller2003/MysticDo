import json

with open('scratch/quiz_meta.json', 'r', encoding='utf-8') as f:
    meta = json.load(f)

slugs = [
  'does-he-think-about-me',
  'does-my-crush-like-me-back',
  'is-he-the-one',
  'does-he-miss-me',
  'is-he-serious-about-me'
]

for s in slugs:
    qz = meta[s]
    print(f"=== {s} ===")
    print("Patterns:", qz['patterns'])
    print("Questions:", [q['id'] for q in qz['questions']])
