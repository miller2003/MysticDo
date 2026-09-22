import json

with open('scratch/quiz_inventory.json', 'r', encoding='utf-8') as f:
    pages = json.load(f)

for p in pages:
    print(f"=== {p['slug']} ({p['path']}) ===")
    print(f"Tool Name: {p['tool_name']}")
    print(f"Has check in Direct Answer: {p['has_check_da']}")
    print(f"Quiz FAQs ({len(p['quiz_faqs'])}):")
    for q, a in p['quiz_faqs']:
        print(f"  Q: {q}")
        print(f"  A preview: {a[:120]}...")
    print()
