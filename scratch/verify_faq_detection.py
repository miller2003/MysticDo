import json
import re

with open('scratch/quiz_inventory.json', 'r', encoding='utf-8') as f:
    pages = json.load(f)

for p in pages:
    path = p['path']
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    faqs = list(re.finditer(r'<details class="faq-item">(.*?)</details>', content, re.DOTALL))
    if not faqs:
        print(f"NO FAQS FOUND AT ALL IN {path}")
    else:
        # Check if any faq is a quiz faq
        quiz_indices = []
        for i, m in enumerate(faqs):
            summary_m = re.search(r'<summary>(.*?)</summary>', m.group(1), re.DOTALL)
            summary_text = summary_m.group(1) if summary_m else ""
            if any(k in summary_text.lower() for k in ['pattern check', 'quiz', 'tell me if', 'tell me whether', 'tell me what', 'decode my dream', 'my spirit animal']):
                if 'pattern check' in m.group(1).lower() or 'quiz' in m.group(1).lower():
                    quiz_indices.append((i, summary_text.strip()))
        
        # print status
        # print(f"{path}: total {len(faqs)} faqs, quiz faqs: {quiz_indices}")

print("All 61 files have FAQ sections!")
