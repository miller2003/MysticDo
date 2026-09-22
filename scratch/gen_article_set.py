import glob

files = glob.glob('questions/**/*.html', recursive=True) + glob.glob('guides/*.html')
articles = sorted([f.replace('\\', '/') for f in files if not f.endswith('index.html')])

print(f"Total article files: {len(articles)}")
tuple_str = 'ARTICLE_PAGES = {\n'
for a in articles:
    tuple_str += f'    "{a}",\n'
tuple_str += '}\n'

with open('scratch/article_pages_set.py', 'w', encoding='utf-8') as f:
    f.write(tuple_str)

print("Wrote scratch/article_pages_set.py")
