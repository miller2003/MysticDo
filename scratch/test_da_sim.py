import json
import re
import sys
sys.path.append('.')
from scratch.quiz_configs import CONFIGS

with open('scratch/quiz_inventory.json', 'r', encoding='utf-8') as f:
    pages = json.load(f)

for p in pages:
    path = p['path']
    slug = p['slug']
    cfg = CONFIGS[slug]
    da_sentence = cfg['da_sentence']
    
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    fp_pattern = r'(<div class="front-panel-answer">\s*<h2 class="front-panel-kicker">.*?</h2>\s*<p>)(.*?)(</p>\s*</div>)'
    m = re.search(fp_pattern, content, re.DOTALL)
    if not m:
        print(f"FAILED TO MATCH DIRECT ANSWER IN {path}")
        continue
    
    lead = m.group(1)
    text = m.group(2).strip()
    trail = m.group(3)
    
    # Check if text already has a sentence about the check
    # Check patterns like:
    # "The two-minute check on this page..."
    # "and the two-minute check on this page..."
    # "The pattern check on this page..."
    # "The two-minute [Name] Pattern Check on this page..."
    # "Those four things don’t predict his behavior — they predict what the question is doing to you, which is the part you can actually work with. The two-minute check on this page sorts yours."
    
    # We want to replace the existing check sentence if present, or append da_sentence if not present
    existing_check_pattern = r'(&mdash;\s*and\s+the\s+two-minute\s+.*?$|The\s+two-minute\s+.*?$|\s*and\s+the\s+two-minute\s+.*?$)'
    
    # Let's see if there is an existing mention
    sub_m = re.search(r'([.\u2014;]\s*(?:(?:&mdash;\s*)?(?:and\s+)?the\s+two-minute\s+check\s+on\s+this\s+page.*?$|The\s+two-minute\s+check\s+on\s+this\s+page.*?$))', text, re.IGNORECASE)
    
    if sub_m:
        old_clause = sub_m.group(1)
        # print(f"Found existing clause in {slug}: '{old_clause}'")
    else:
        # print(f"No existing check clause in {slug}")
        pass

print("Direct Answer simulation finished!")
