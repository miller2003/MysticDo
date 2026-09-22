with open('scratch/article_pages_set.py', 'r', encoding='utf-8') as f:
    set_code = f.read()

with open('seo_inject.py', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Insert ARTICLE_PAGES after QUIZ_TOOL_PAGES
target = "}\n\ndef webapp_jsonld(title, desc, url):"
replacement = "}\n\n" + set_code + "\ndef webapp_jsonld(title, desc, url):"

if target not in content:
    print("ERROR: Target 1 not found in seo_inject.py")
    exit(1)

content = content.replace(target, replacement, 1)

# 2. Replace Tuple 1:
# From `if rel in (` to `):`
import re
tuple1_pattern = r'# article-specific meta \(E-E-A-T for guide articles\)\s+if rel in \(.*?\):'
m1 = re.search(tuple1_pattern, content, re.DOTALL)
if not m1:
    print("ERROR: Tuple 1 not found in seo_inject.py")
    exit(1)

content = content[:m1.start()] + "# article-specific meta (E-E-A-T for guide articles)\n        if rel in ARTICLE_PAGES:" + content[m1.end():]

# 3. Replace Tuple 2:
tuple2_pattern = r'is_guide_article = rel in \(.*?\)'
m2 = re.search(tuple2_pattern, content, re.DOTALL)
if not m2:
    print("ERROR: Tuple 2 not found in seo_inject.py")
    exit(1)

content = content[:m2.start()] + "is_guide_article = (rel in ARTICLE_PAGES)" + content[m2.end():]

with open('seo_inject.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated seo_inject.py successfully!")
