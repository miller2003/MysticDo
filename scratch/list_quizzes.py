import os
import glob

files = glob.glob('questions/**/*.html', recursive=True) + glob.glob('guides/*.html')
print(f'Total HTML files found: {len(files)}')

quiz_files = []
for f in files:
    if f.endswith('index.html'): 
        continue
    with open(f, 'r', encoding='utf-8') as fp:
        content = fp.read()
        if 'data-quiz="' in content:
            quiz_files.append(f)

print(f'Files with data-quiz: {len(quiz_files)}')
for qf in sorted(quiz_files):
    print(qf)
