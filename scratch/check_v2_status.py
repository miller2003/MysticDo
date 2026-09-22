import json, re

with open('scratch/quiz_meta.json', 'r', encoding='utf-8') as f:
    meta = json.load(f)

with open('assets/js/quizzes.js', 'r', encoding='utf-8') as f:
    src = f.read()

v2_quizzes = []
v1_quizzes = []
no_custom_result = []

for slug in meta.keys():
    # find slug definition
    pattern = rf"'{slug}':\s*\{{"
    m = re.search(pattern, src)
    if not m:
        pattern = rf'"{slug}":\s*\{{'
        m = re.search(pattern, src)
    if not m:
        continue
    start = m.start()
    # next quiz
    next_m = re.search(r"\n  '([a-z0-9-]+)':\s*\{", src[start+10:])
    end = start + 10 + next_m.start() if next_m else len(src)
    chunk = src[start:end]
    
    if 'customResult' not in chunk:
        no_custom_result.append(slug)
    elif 'resultV2: true' in chunk:
        v2_quizzes.append(slug)
    else:
        v1_quizzes.append(slug)

print(f"Total quizzes in meta: {len(meta)}")
print(f"Quizzes with resultV2: {len(v2_quizzes)}")
print(f"Quizzes with v1 customResult: {len(v1_quizzes)} -> {v1_quizzes}")
print(f"Quizzes with NO customResult: {len(no_custom_result)} -> {no_custom_result}")
