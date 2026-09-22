import json

with open('scratch/quiz_meta.json', 'r', encoding='utf-8') as f:
    quizzes = json.load(f)

with open('scratch/quiz_inventory.json', 'r', encoding='utf-8') as f:
    pages = json.load(f)

for p in pages:
    slug = p['slug']
    qz = quizzes.get(slug, {})
    title = qz.get('title', '')
    questions = qz.get('questions', [])
    patterns = qz.get('patterns', [])
    pattern_paths = [pd.get('path', pd.get('key', '')) for pd in qz.get('patternDetails', [])]
    
    q_texts = [q.get('q', '') for q in questions[:4]]
    
    print(f"SLUG: {slug} ({p['tool_name']})")
    print(f"  Patterns ({len(patterns)}): {', '.join(pattern_paths[:3])}...")
    print(f"  Q1-Q2: {q_texts[:2]}")
