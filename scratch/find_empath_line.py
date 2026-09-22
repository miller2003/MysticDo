with open('questions/spiritual-growth/am-i-an-empath.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'how-to-trust-your-intuition' in line:
        print(f"Line {i+1}: {line.strip()}")
