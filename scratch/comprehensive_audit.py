import json
import re
import os
import glob

files = glob.glob('questions/**/*.html', recursive=True) + glob.glob('guides/*.html')
quiz_files = [f for f in files if not f.endswith('index.html')]

print(f"Auditing {len(quiz_files)} article files...")

audit_results = {
    'total_files': len(quiz_files),
    'has_viewport': 0,
    'has_font_preload': 0,
    'has_noscript': 0,
    'has_clean_canonical': 0,
    'has_og_article': 0,
    'has_article_schema': 0,
    'has_faq_schema': 0,
    'has_webapp_schema': 0,
    'has_breadcrumb_schema': 0,
    'meta_desc_under_160': 0,
    'meta_desc_over_160': [],
    'jsonld_syntax_errors': [],
    'faq_count_mismatches': []
}

for f in quiz_files:
    with open(f, 'r', encoding='utf-8') as fp:
        c = fp.read()
    
    # 1. Viewport
    if 'name="viewport"' in c:
        audit_results['has_viewport'] += 1
    
    # 2. Font preload
    if 'rel="preload"' in c and 'cormorant-garamond' in c:
        audit_results['has_font_preload'] += 1
    
    # 3. Noscript inside quiz
    if '<noscript>' in c:
        audit_results['has_noscript'] += 1
    
    # 4. Canonical
    can_m = re.search(r'<link rel="canonical" href="https://mysticdo\.com/([^"]+)">', c)
    if can_m and not can_m.group(1).endswith('.html'):
        audit_results['has_clean_canonical'] += 1
    
    # 5. OpenGraph
    if 'property="og:type" content="article"' in c:
        audit_results['has_og_article'] += 1
    
    # 6. Meta description length
    desc_m = re.search(r'<meta name="description" content="([^"]+)">', c)
    if desc_m:
        desc_len = len(desc_m.group(1))
        if desc_len <= 165:
            audit_results['meta_desc_under_160'] += 1
        else:
            audit_results['meta_desc_over_160'].append((f, desc_len, desc_m.group(1)))
    
    # 7. JSON-LD blocks
    jsonld_blocks = re.findall(r'<script type="application/ld\+json">(.*?)</script>', c, re.DOTALL)
    for b in jsonld_blocks:
        try:
            data = json.loads(b)
            t = data.get('@type')
            if t == 'Article':
                audit_results['has_article_schema'] += 1
            elif t == 'FAQPage':
                audit_results['has_faq_schema'] += 1
                # verify count of questions matches visible details
                q_count = len(data.get('mainEntity', []))
                details_count = len(re.findall(r'<details class="faq-item">', c))
                if q_count != details_count:
                    audit_results['faq_count_mismatches'].append((f, q_count, details_count))
            elif t == 'WebApplication':
                audit_results['has_webapp_schema'] += 1
            elif t == 'BreadcrumbList':
                audit_results['has_breadcrumb_schema'] += 1
        except Exception as e:
            audit_results['jsonld_syntax_errors'].append((f, str(e)))

print("AUDIT RESULTS:")
for k, v in audit_results.items():
    if isinstance(v, list):
        print(f"  {k}: {len(v)}")
        if v and k != 'meta_desc_over_160':
            print("   Samples:", v[:3])
    else:
        print(f"  {k}: {v}")

if audit_results['meta_desc_over_160']:
    print(f"\nMeta descriptions > 165 chars ({len(audit_results['meta_desc_over_160'])}):")
    for path, length, text in audit_results['meta_desc_over_160'][:5]:
        print(f"  {path} ({length} chars): {text}")
