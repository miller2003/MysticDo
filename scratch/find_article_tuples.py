with open('seo_inject.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'questions/' in line and ('(' in line or '=' in line):
        print(f"Line {i+1}: {line.strip()[:100]}")
