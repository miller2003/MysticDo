import glob
import re

files = glob.glob('questions/**/*.html', recursive=True)
for f in sorted(files):
    if f.endswith('index.html'): continue
    with open(f, 'r', encoding='utf-8') as fp:
        c = fp.read()
        t = re.search(r'<title>(.*?)</title>', c)
        title = t.group(1) if t else 'NONE'
        d = re.search(r'<meta name="description" content="(.*?)">', c)
        desc = d.group(1) if d else 'NONE'
        print(f"{f} ->\n  Title: {title}\n  Desc: {desc}\n")
