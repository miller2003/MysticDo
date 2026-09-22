import json
import re

with open('scratch/quiz_meta.json', 'r', encoding='utf-8') as f:
    quizzes = json.load(f)

with open('scratch/quiz_inventory.json', 'r', encoding='utf-8') as f:
    pages = json.load(f)

# Let's inspect each quiz and automatically synthesize high-quality dimensions
quiz_specs = {}

for p in pages:
    slug = p['slug']
    qz = quizzes.get(slug, {})
    tool_name = p['tool_name']
    
    # Ensure tool name has "Pattern Check"
    if not tool_name.endswith('Pattern Check'):
        tool_name = f"{tool_name} Pattern Check"
    # Clean up any weird prefixes/punctuation
    tool_name = re.sub(r'^[Ww]hat\s+[Dd]oes\s+', '', tool_name)
    tool_name = re.sub(r'\?.*', ' Pattern Check', tool_name)
    
    questions = qz.get('questions', [])
    patterns = qz.get('patterns', [])
    num_patterns = len(patterns) if patterns else 5
    
    # Let's extract question topics
    q_hints = [q.get('hint', '') for q in questions if q.get('hint')]
    q_texts = [q.get('q', '') for q in questions if q.get('q')]
    
    quiz_specs[slug] = {
        'path': p['path'],
        'slug': slug,
        'tool_name': tool_name,
        'num_patterns': num_patterns,
        'q_hints': q_hints,
        'q_texts': q_texts,
        'has_check_da': p['has_check_da'],
        'existing_faqs': p['quiz_faqs']
    }

print(f"Generated specs for {len(quiz_specs)} quizzes.")
with open('scratch/quiz_specs_draft.json', 'w', encoding='utf-8') as f:
    json.dump(quiz_specs, f, indent=2)
