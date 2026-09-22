import os
import glob
import re
import json

files = glob.glob('questions/**/*.html', recursive=True) + glob.glob('guides/*.html')
quiz_files = []
for f in files:
    if f.endswith('index.html'): continue
    with open(f, 'r', encoding='utf-8') as fp:
        content = fp.read()
        if 'data-quiz="' in content:
            quiz_files.append((f, content))

print(f"Total quiz files: {len(quiz_files)}")

results = []
for path, content in quiz_files:
    # Slug
    slug_match = re.search(r'data-quiz="([^"]+)"', content)
    slug = slug_match.group(1) if slug_match else "unknown"
    
    # Tool Name from WebApplication JSON-LD
    web_app_match = re.search(r'\{"@context": "https://schema.org", "@type": "WebApplication",.*?"name": "([^"]+)"', content)
    tool_name = web_app_match.group(1) if web_app_match else f"{slug.replace('-', ' ').title()} Pattern Check"
    
    # H1
    h1_match = re.search(r'<h1[^>]*>(.*?)</h1>', content, re.DOTALL)
    h1 = re.sub(r'<[^>]+>', '', h1_match.group(1)).strip() if h1_match else "unknown"
    
    # Direct Answer paragraph
    fp_match = re.search(r'<div class="front-panel-answer">\s*<h2 class="front-panel-kicker">.*?</h2>\s*<p>(.*?)</p>', content, re.DOTALL)
    direct_answer = fp_match.group(1).strip() if fp_match else ""
    
    # Has check mentioned in direct answer?
    has_check_da = bool(re.search(r'(two-minute check|pattern check|self-check|interactive check|check on this page|matcher on this page)', direct_answer, re.IGNORECASE))
    
    # FAQ quiz item
    faq_matches = re.findall(r'<details class="faq-item">\s*<summary>(.*?)</summary>\s*<div class="faq-answer"><p>(.*?)</p></div>\s*</details>', content, re.DOTALL)
    quiz_faqs = []
    for q, a in faq_matches:
        if 'pattern check' in q.lower() or 'quiz' in q.lower() or 'check' in q.lower() or 'tell me' in q.lower():
            if 'pattern check' in q.lower() or 'quiz' in q.lower() or 'pattern check' in a.lower():
                quiz_faqs.append((q.strip(), a.strip()))
    
    results.append({
        'path': path,
        'slug': slug,
        'tool_name': tool_name,
        'h1': h1,
        'has_check_da': has_check_da,
        'direct_answer': direct_answer,
        'quiz_faqs': quiz_faqs
    })

print(f"Parsed {len(results)} pages.")
with open('scratch/quiz_inventory.json', 'w', encoding='utf-8') as fp:
    json.dump(results, fp, indent=2, ensure_ascii=False)
print("Saved inventory to scratch/quiz_inventory.json")
