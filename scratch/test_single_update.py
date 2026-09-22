import sys
import re
sys.path.append('.')
from scratch.quiz_configs import CONFIGS

num_words = {
    4: "four",
    5: "five",
    6: "six",
    7: "seven"
}

def update_page(path, slug):
    cfg = CONFIGS[slug]
    tool_name = cfg['tool_name']
    dimensions = cfg['dimensions']
    num_p = num_words.get(cfg['num_patterns'], "five")
    da_sentence = cfg['da_sentence']
    
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Update Direct Answer
    fp_pattern = r'(<div class="front-panel-answer">\s*<h2 class="front-panel-kicker">.*?</h2>\s*<p>)(.*?)(</p>\s*</div>)'
    m = re.search(fp_pattern, content, re.DOTALL)
    if not m:
        raise ValueError(f"Direct answer not found in {path}")
    
    da_lead = m.group(1)
    da_text = m.group(2).strip()
    da_trail = m.group(3)
    
    # Remove any existing trailing check sentence
    clean_da = re.sub(r'([.\u2014;]?\s*(?:&mdash;\s*)?(?:and\s+)?(?:That\s+pattern\s+is\s+exactly\s+what\s+)?(?:the\s+)?(?:two-minute\s+)?check\s+on\s+this\s+page.*?)$', '', da_text, flags=re.IGNORECASE).strip()
    clean_da = re.sub(r'[.\u2014;]+$', '.', clean_da)
    if not clean_da.endswith('.'):
        clean_da += '.'
    
    new_da_block = f"{da_lead}{clean_da} {da_sentence}{da_trail}"
    content = content[:m.start()] + new_da_block + content[m.end():]
    
    # 2. Update FAQ
    new_faq = f"""<details class="faq-item">
        <summary>Is the {tool_name} on this page personalized, or does everyone get the same result?</summary>
        <div class="faq-answer"><p>Personalized. You answer eight questions about your own situation &mdash; {dimensions} &mdash; and your answers return one of {num_p} distinct patterns before the check suggests a grounded next step that fits yours. Two people can arrive with the same question and leave with two entirely different reads: it computes directly from your specific answers, not from a fixed signs list. It is free, needs no signup or email, and runs privately in your browser &mdash; your answers are never stored or sent.</p></div>
      </details>"""

    # Look for existing pattern check FAQ
    pattern1 = r'<details class="faq-item">\s*<summary>[^<]*?(?:pattern check|is the pattern check|does the pattern check)[^<]*?</summary>\s*<div class="faq-answer"><p>.*?</p></div>\s*</details>'
    faq_match = re.search(pattern1, content, re.DOTALL | re.IGNORECASE)
    if not faq_match:
        pattern2 = r'<details class="faq-item">\s*<summary>[^<]*?quiz[^<]*?</summary>\s*<div class="faq-answer"><p>[^<]*?pattern check.*?</p></div>\s*</details>'
        faq_match = re.search(pattern2, content, re.DOTALL | re.IGNORECASE)
    
    if faq_match:
        content = content[:faq_match.start()] + new_faq + content[faq_match.end():]
    else:
        # Insert after last </details>
        last_details_idx = content.rfind('</details>')
        if last_details_idx == -1:
            raise ValueError(f"No </details> found in {path}")
        content = content[:last_details_idx + 10] + "\n      " + new_faq + content[last_details_idx + 10:]
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Updated {path} successfully!")

if __name__ == '__main__':
    update_page('questions/love-relationships/will-he-come-back.html', 'will-he-come-back')
