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
    idx = src.find(f"'{s}':")
    cr_idx = src.find('customResult:', idx)
    end_cr = src.find('},\n', cr_idx)
    line_no = src[:cr_idx].count('\n') + 1
    print(f"Slug: {s}, Line: {line_no}")
    print(src[cr_idx:end_cr+2])
    print("-" * 50)
