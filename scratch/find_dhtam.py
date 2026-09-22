with open('assets/js/quizzes.js', 'r', encoding='utf-8') as f:
    src = f.read()

idx = src.find("'does-he-think-about-me':")
line_no = src[:idx].count('\n') + 1
print('does-he-think-about-me line:', line_no)

idx_cr = src.find("customResult:", idx)
print(src[idx_cr:idx_cr+400])
