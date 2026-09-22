import re

with open('assets/js/quizzes.js', 'r', encoding='utf-8') as f:
    src = f.read()

# Let's inspect is-he-cheating and will-he-come-back questions
def show_quiz(slug):
    print(f"\n==================== QUIZ: {slug} ====================")
    idx = src.find(f"'{slug}':")
    if idx == -1:
        idx = src.find(f'"{slug}":')
    if idx == -1:
        print("NOT FOUND")
        return
    snippet = src[idx:idx+3500]
    # find questions
    q_idx = snippet.find("questions: [")
    if q_idx != -1:
        print(snippet[q_idx:q_idx+2500])

show_quiz('is-he-cheating')
show_quiz('will-he-come-back')
show_quiz('twin-flame-separation')
