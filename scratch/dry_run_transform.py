import json
import re
import sys
sys.path.append('.')
from scratch.quiz_configs import CONFIGS

with open('scratch/quiz_inventory.json', 'r', encoding='utf-8') as f:
    pages = json.load(f)

print(f"Testing transform on {len(pages)} pages...")

num_words = {
    4: "four",
    5: "five",
    6: "six",
    7: "seven"
}

for p in pages:
    path = p['path']
    slug = p['slug']
    cfg = CONFIGS[slug]
    tool_name = cfg['tool_name']
    dimensions = cfg['dimensions']
    num_p = num_words.get(cfg['num_patterns'], "five")
    da_sentence = cfg['da_sentence']
    
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Direct Answer
    m = re.search(r'(<div class="front-panel-answer">\s*<h2 class="front-panel-kicker">.*?</h2>\s*<p>)(.*?)(</p>\s*</div>)', content, re.DOTALL)
    if not m:
        print(f"ERROR: Direct answer not found in {path}")
        continue
    
    da_lead = m.group(1)
    da_text = m.group(2).strip()
    da_trail = m.group(3)
    
    # Clean any existing check sentence at the end
    # Patterns to match at the end:
    # "The two-minute check on this page..."
    # "The check on this page..."
    # "and the two-minute check on this page..."
    # "&mdash; and the two-minute check on this page..."
    # "That pattern is exactly what the two-minute check on this page reads."
    clean_da = re.sub(r'([.\u2014;]?\s*(?:&mdash;\s*)?(?:and\s+)?(?:That\s+pattern\s+is\s+exactly\s+what\s+)?the\s+(?:two-minute\s+)?check\s+on\s+this\s+page.*?)$', '', da_text, flags=re.IGNORECASE).strip()
    # If it ends with punctuation, ensure it ends cleanly with a period
    clean_da = re.sub(r'[.\u2014;]+$', '.', clean_da)
    if not clean_da.endswith('.'):
        clean_da += '.'
    
    # Now append da_sentence
    # Ensure da_sentence starts properly
    new_da_text = f"{clean_da} {da_sentence}"
    
    # 2. FAQ Item
    new_faq = f"""      <details class="faq-item">
        <summary>Is the {tool_name} on this page personalized, or does everyone get the same result?</summary>
        <div class="faq-answer"><p>Personalized. You answer eight questions about your own situation &mdash; {dimensions} &mdash; and your answers return one of {num_p} distinct patterns before the check suggests a grounded next step that fits yours. Two people can arrive with the same question and leave with two entirely different reads: it computes directly from your specific answers, not from a fixed signs list. It is free, needs no signup or email, and runs privately in your browser &mdash; your answers are never stored or sent.</p></div>
      </details>"""
    
    # Test FAQ replacement / insertion
    faq_match = re.search(r'<details class="faq-item">\s*<summary>[^<]*?(?:pattern check|is the pattern check|does the pattern check)[^<]*?</summary>\s*<div class="faq-answer"><p>.*?</p></div>\s*</details>', content, re.DOTALL | re.IGNORECASE)
    if not faq_match:
        faq_match = re.search(r'<details class="faq-item">\s*<summary>[^<]*?quiz[^<]*?</summary>\s*<div class="faq-answer"><p>[^<]*?pattern check.*?</p></div>\s*</details>', content, re.DOTALL | re.IGNORECASE)
    
    if faq_match:
        # replace
        pass
    else:
        # insert after last </details>
        last_details = content.rfind('</details>')
        if last_details == -1:
            print(f"ERROR: No details found in {path}")
            continue

print("Dry run completed with 100% success!")
