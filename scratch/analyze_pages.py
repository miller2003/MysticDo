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

faq_patterns = {}
direct_answers = {}

for path, content in quiz_files:
    # Check FAQ
    faq_match = re.findall(r'<details class="faq-item">\s*<summary>(.*?)</summary>\s*<div class="faq-answer"><p>(.*?)</p></div>\s*</details>', content, re.DOTALL)
    quiz_faq = []
    for q, a in faq_match:
        if 'pattern check' in q.lower() or 'quiz' in q.lower() or 'check' in q.lower():
            quiz_faq.append((q.strip(), a.strip()))
    
    # Check front-panel-answer
    fp_match = re.search(r'<div class="front-panel-answer">(.*?)</div>', content, re.DOTALL)
    fp_text = fp_match.group(1).strip() if fp_match else "NONE"
    
    # Check title
    title_match = re.search(r'<title>(.*?)</title>', content)
    title = title_match.group(1).strip() if title_match else "NONE"
    
    # Check meta description
    desc_match = re.search(r'<meta name="description" content="(.*?)">', content)
    desc = desc_match.group(1).strip() if desc_match else "NONE"

    faq_patterns[path] = quiz_faq
    direct_answers[path] = fp_text

# Print summary
print("\n--- FAQ SUMMARY ---")
has_personalized = 0
has_does_tell = 0
has_none = 0
other = 0

for path, faqs in faq_patterns.items():
    if not faqs:
        has_none += 1
        print(f"NO QUIZ FAQ: {path}")
    else:
        for q, a in faqs:
            if "personalized" in q.lower():
                has_personalized += 1
            elif "does the pattern check tell" in q.lower():
                has_does_tell += 1
            else:
                other += 1
                print(f"OTHER FAQ: {path} -> Q: {q}")

print(f"\nStats: Total={len(quiz_files)}, Personalized={has_personalized}, DoesTell={has_does_tell}, None={has_none}, Other={other}")
