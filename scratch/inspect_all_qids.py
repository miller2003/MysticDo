import json
from collections import Counter

with open('scratch/quiz_meta.json', 'r', encoding='utf-8') as f:
    meta = json.load(f)

q1_ids = Counter()
q2_ids = Counter()
q_all_ids = Counter()

for s, qz in meta.items():
    qs = qz.get('questions', [])
    if qs:
        q1_ids[qs[0]['id']] += 1
    if len(qs) > 1:
        q2_ids[qs[1]['id']] += 1
    for q in qs:
        q_all_ids[q['id']] += 1

print("Q1 IDs:", q1_ids.most_common(10))
print("Q2 IDs:", q2_ids.most_common(10))
print("Top Question IDs overall:", q_all_ids.most_common(20))
