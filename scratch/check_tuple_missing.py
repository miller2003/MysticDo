import glob
import re

files = glob.glob('questions/**/*.html', recursive=True) + glob.glob('guides/*.html')
articles = [f.replace('\\', '/') for f in files if not f.endswith('index.html')]

with open('seo_inject.py', 'r', encoding='utf-8') as f:
    code = f.read()

# Extract Tuple 1
t1_m = re.search(r'if rel in \((.*?)\):', code, re.DOTALL)
t1_files = re.findall(r'"([^"]+)"', t1_m.group(1)) if t1_m else []

# Extract Tuple 2
t2_m = re.search(r'is_guide_article = rel in \((.*?)\)', code, re.DOTALL)
t2_files = re.findall(r'"([^"]+)"', t2_m.group(1)) if t2_m else []

print(f"Total article files on disk: {len(articles)}")
print(f"Tuple 1 count: {len(t1_files)}")
print(f"Tuple 2 count: {len(t2_files)}")

missing_in_t1 = [a for a in articles if a not in t1_files]
missing_in_t2 = [a for a in articles if a not in t2_files]

print(f"\nMissing in Tuple 1 ({len(missing_in_t1)}):")
for a in missing_in_t1:
    print(" ", a)

print(f"\nMissing in Tuple 2 ({len(missing_in_t2)}):")
for a in missing_in_t2:
    print(" ", a)
