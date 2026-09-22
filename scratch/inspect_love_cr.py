with open('assets/js/quizzes.js', 'r', encoding='utf-8') as f:
    src = f.read()

def inspect_quiz_custom_result(slug):
    idx = src.find(f"'{slug}':")
    if idx == -1: idx = src.find(f'"{slug}":')
    if idx == -1:
        print(f"Quiz {slug} not found")
        return
    cr_idx = src.find('customResult:', idx)
    end_cr = src.find('},\n', cr_idx)
    print(f"=== {slug} customResult ===")
    print(src[cr_idx:end_cr+2])

inspect_quiz_custom_result('does-he-think-about-me')
inspect_quiz_custom_result('does-my-crush-like-me-back')
inspect_quiz_custom_result('is-he-the-one')
inspect_quiz_custom_result('does-he-miss-me')
inspect_quiz_custom_result('is-he-serious-about-me')
