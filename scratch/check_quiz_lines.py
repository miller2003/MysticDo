with open('assets/js/quizzes.js', 'r', encoding='utf-8') as f:
    src = f.read()

slugs = [
  'does-he-love-me',
  'does-he-think-about-me',
  'does-my-crush-like-me-back',
  'is-he-the-one',
  'does-he-miss-me',
  'is-he-serious-about-me'
]

for s in slugs:
    idx = src.find(f"'{s}': {{")
    print(f"{s}: idx={idx}, line={src[:idx].count(chr(10))+1 if idx != -1 else -1}")
