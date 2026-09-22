import os
import glob
import re

files = glob.glob('questions/**/*.html', recursive=True) + glob.glob('guides/*.html')
quiz_files = []
for f in files:
    if f.endswith('index.html'): continue
    with open(f, 'r', encoding='utf-8') as fp:
        content = fp.read()
        if 'data-quiz="' in content:
            quiz_files.append((f, content))

print(f"Total quiz files: {len(quiz_files)}")

has_check_in_direct_answer = []
missing_check_in_direct_answer = []

for path, content in quiz_files:
    fp_match = re.search(r'<div class="front-panel-answer">\s*<h2 class="front-panel-kicker">.*?</h2>\s*<p>(.*?)</p>', content, re.DOTALL)
    if fp_match:
        fp_text = fp_match.group(1).strip()
        # Check if check/quiz/pattern is mentioned
        if re.search(r'(two-minute check|pattern check|self-check|interactive check|check on this page|matcher on this page)', fp_text, re.IGNORECASE):
            has_check_in_direct_answer.append((path, fp_text))
        else:
            missing_check_in_direct_answer.append((path, fp_text))
    else:
        # maybe it's a guide that doesn't have front-panel-answer?
        missing_check_in_direct_answer.append((path, "NO FRONT-PANEL-ANSWER MATCH"))

print(f"Has check mentioned in direct answer: {len(has_check_in_direct_answer)}")
print(f"Missing check in direct answer: {len(missing_check_in_direct_answer)}")

print("\nMissing list:")
for p, t in missing_check_in_direct_answer:
    print(f"  {p}")
