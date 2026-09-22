import json
import re

with open('scratch/quiz_meta.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Inspect does-he-love-me
dhlm = data.get('does-he-love-me')
print("=== DOES HE LOVE ME ===")
print("Title:", dhlm.get('title'))
print("LaunchSub:", dhlm.get('launchSub'))
print("Questions count:", dhlm.get('questionsCount'))
for i, q in enumerate(dhlm.get('questions', [])):
    print(f"Q{i+1} [{q['id']}]: {q['q']}")
    if q.get('hint'):
        print(f"    Hint: {q['hint']}")

print("\nPatterns:")
for p in dhlm.get('patternDetails', []):
    print(f"  {p['key']}: {p['path']}")
