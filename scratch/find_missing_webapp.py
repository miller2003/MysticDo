import glob
import re

files = glob.glob('questions/**/*.html', recursive=True) + glob.glob('guides/*.html')
quiz_files = [f for f in files if not f.endswith('index.html')]

missing_webapp = []
for f in quiz_files:
    with open(f, 'r', encoding='utf-8') as fp:
        c = fp.read()
    if 'data-quiz="' in c and '"@type": "WebApplication"' not in c:
        missing_webapp.append(f)

print(f"Missing WebApplication in ({len(missing_webapp)}):")
for f in missing_webapp:
    print(f"  {f}")
