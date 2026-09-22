import re

with open('assets/js/quizzes.js', 'r', encoding='utf-8') as f:
    src = f.read()

# Find does-he-love-me definition
start = src.find("MYSTICDO_QUIZZES['does-he-love-me'] =")
if start == -1:
    start = src.find('MYSTICDO_QUIZZES["does-he-love-me"] =')

end = src.find("MYSTICDO_QUIZZES['does-he-think-about-me'] =", start)
if end == -1:
    end = src.find('MYSTICDO_QUIZZES["does-he-think-about-me"] =', start)

print("Snippet length:", end - start)
print(src[start:start+4000])
