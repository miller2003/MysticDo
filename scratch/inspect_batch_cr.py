with open('assets/js/quizzes.js', 'r', encoding='utf-8') as f:
    src = f.read()

def show_custom_result(slug):
    idx = src.find(f"'{slug}': {{")
    if idx == -1: return
    cr_pos = src.find("customResult:", idx)
    end_cr = src.find("  },", cr_pos)
    print(f"=== {slug} ===")
    print(src[cr_pos:end_cr+4])

show_custom_result('why-am-i-always-broke')
show_custom_result('444-meaning')
show_custom_result('tower-card-meaning')
