import json
import glob
import re

with open('scratch/quiz_meta.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Total quizzes in quiz_meta.json: {len(data)}")

# Check all html files in questions/ and guides/ and root
html_files = glob.glob('questions/**/*.html', recursive=True) + glob.glob('guides/**/*.html', recursive=True) + glob.glob('*.html')
pages_with_quiz = {}

for path in html_files:
    try:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
            m = re.search(r'data-quiz=["\']([^"\']+)["\']', content)
            if m:
                pages_with_quiz[m.group(1)] = path
    except Exception as e:
        pass

print(f"Total pages with data-quiz: {len(pages_with_quiz)}")
print("\nSample mapping (quiz_slug -> html_file):")
for slug in list(pages_with_quiz.keys())[:20]:
    print(f"  {slug:35} -> {pages_with_quiz[slug]}")
