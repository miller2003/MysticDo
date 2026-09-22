with open('assets/js/quizzes.js', 'r', encoding='utf-8') as f:
    src = f.read()

slugs = [
  'does-he-think-about-me',
  'does-my-crush-like-me-back',
  'is-he-the-one',
  'does-he-miss-me',
  'is-he-serious-about-me'
]

for s in slugs:
    idx = src.find(f"'{s}': {{")
    next_idx = src.find("\n  '", idx + 10)
    chunk = src[idx:next_idx]
    cr_pos = chunk.find("customResult:")
    print(f"=== {s} ===")
    print(chunk[cr_pos:])
