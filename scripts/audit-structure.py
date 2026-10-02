#!/usr/bin/env python3
"""站点内容结构审计：链接图、孤儿页、死链、hub 覆盖缺口、点击深度。只读，不修改任何页面。

用法：python scripts/audit-structure.py

判读要点：
  · 「首页不可达」= 用户按站内链接从首页走不到（导航是纯静态 HTML，所以这条等于真实可达性）
  · 「hub 覆盖缺口」= 上一级页面漏连了自己的直属子页，是本项目结构问题的主要形态
  · 「死链」只统计像页面的目标（无扩展名），css/js/图片/well-known 已排除
"""
import os, re, json, collections, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
ORIGIN = 'https://mysticdo.com'

SKIP_DIRS = {'.git', '.workbuddy', '.vscode', '.wrangler', 'assets', 'scripts',
             'email-templates', '_design-check', 'node_modules', 'scratch', '__pycache__'}
SKIP_FILES = {'404.html'}

def is_published_html(p: pathlib.Path) -> bool:
    rel = p.relative_to(ROOT)
    if any(part in SKIP_DIRS for part in rel.parts[:-1]):
        return False
    if rel.name in SKIP_FILES:
        return False
    return p.suffix == '.html'

html_files = [p for p in ROOT.rglob('*.html') if is_published_html(p)]

def to_url(p: pathlib.Path) -> str:
    rel = p.relative_to(ROOT).as_posix()
    if rel == 'index.html':
        return '/'
    if rel.endswith('/index.html'):
        rel = rel[:-len('index.html')]
    elif rel.endswith('.html'):
        rel = rel[:-len('.html')]
    return '/' + rel

pages = {to_url(p): p for p in html_files}

# sitemap 收录集合
sm = set(re.findall(r'<loc>([^<]+)</loc>',
                    (ROOT / 'sitemap.xml').read_text(encoding='utf-8')))
sm_paths = {u.replace(ORIGIN, '') or '/' for u in sm}

HREF_RE = re.compile(r'href\s*=\s*"([^"]+)"', re.I)

def norm(href: str, from_url: str):
    h = href.strip()
    if not h or h.startswith(('mailto:', 'tel:', 'javascript:', 'data:')):
        return None
    h = h.split('#')[0].split('?')[0]
    if not h:
        return None
    if h.startswith('http'):
        if not h.startswith(ORIGIN):
            return None
        h = h[len(ORIGIN):] or '/'
    elif not h.startswith('/'):
        base = from_url if from_url.endswith('/') else from_url.rsplit('/', 1)[0] + '/'
        h = os.path.normpath(os.path.join(base, h)).replace('\\', '/')
    h = re.sub(r'\.html?$', '', h)
    if h.endswith('/index'):
        h = h[:-len('index')]
    if not h.startswith('/'):
        h = '/' + h
    return h or '/'

graph = collections.defaultdict(set)   # page -> set(out)
inbound = collections.defaultdict(set) # page -> set(in)
broken = collections.defaultdict(set)  # target -> set(sources)

def looks_like_page(t: str) -> bool:
    """末尾段没有扩展名（或本身就是目录）才可能是页面；排除 css/js/png/xml 等资源误报。"""
    last = t.rstrip('/').rsplit('/', 1)[-1]
    return '.' not in last

for url, path in pages.items():
    text = path.read_text(encoding='utf-8', errors='replace')
    for raw in HREF_RE.findall(text):
        tgt = norm(raw, url)
        if tgt is None:
            continue
        graph[url].add(tgt)
        if tgt in pages:
            if tgt != url:            # 自链不计入入度
                inbound[tgt].add(url)
        elif looks_like_page(tgt):
            broken[tgt].add(url)

# ---- BFS：从首页出发的最小点击数 ----
dist = {'/': 0}
q = collections.deque(['/'])
while q:
    cur = q.popleft()
    for nxt in sorted(graph.get(cur, ())):
        if nxt in pages and nxt not in dist:
            dist[nxt] = dist[cur] + 1
            q.append(nxt)

unreach = sorted(set(pages) - set(dist))
depth_hist = collections.Counter(dist.values())

print('=' * 68)
print('站点内容结构审计')
print('=' * 68)
print(f'已发布 HTML 页面        : {len(pages)}')
print(f'sitemap 收录            : {len(sm_paths)}')
print(f'本地有 / sitemap 无      : {sorted(set(pages) - sm_paths)}')
print(f'sitemap 有 / 本地无      : {sorted(sm_paths - set(pages))}')

print('\n--- 首页可达性（最小点击数）---')
for d in sorted(depth_hist):
    print(f'  {d} 跳: {depth_hist[d]:3d} 页')
print(f'  首页不可达: {len(unreach)} 页')
for u in unreach:
    print('     ', u)

print('\n--- 入链为 0 的页面（任何人都不指向它）---')
orph = sorted(u for u in pages if not inbound[u] and u != '/')
print(f'  共 {len(orph)} 页')
for u in orph:
    print('     ', u)

print('\n--- 入链仅 1 个的页面（脆弱，仅靠单一入口）---')
weak = sorted(u for u in pages if len(inbound[u]) == 1 and u != '/')
print(f'  共 {len(weak)} 页')
for u in weak[:40]:
    print(f'      {u}   <- {sorted(inbound[u])[0]}')
if len(weak) > 40:
    print(f'      … 其余 {len(weak)-40} 页')

print('\n--- 死链（站内 href 指向不存在的页面）---')
if not broken:
    print('  无')
for t in sorted(broken):
    srcs = sorted(broken[t])
    print(f'  {t}   <- {len(srcs)} 个来源: {srcs[:4]}')

print('\n--- 各 hub 对子页的覆盖 ---')
for url in sorted(pages):
    kids = sorted(t for t in graph.get(url, ()) if t in pages
                  and t.startswith(url.rstrip('/') + '/') and t != url)
    if len(kids) >= 2 or url.count('/') <= 1:
        print(f'  {url:44s} 出链 {len(kids):3d} 个直属子页')

# 目录树视角：哪些中间层目录页缺失
print('\n--- 目录层级完整性 ---')
missing_hubs = []
dirs = collections.Counter()
for u in pages:
    parts = [s for s in u.split('/') if s]
    for i in range(1, len(parts)):
        dirs['/' + '/'.join(parts[:i]) + '/'] += 1
for d in sorted(dirs):
    if d not in pages:
        missing_hubs.append((d, dirs[d]))
if missing_hubs:
    for d, n in missing_hubs:
        print(f'  [缺] 没有 hub 页 {d} —— 其下 {n} 个 URL 无中间落地页')
else:
    print('  所有目录层都有对应 hub 页')

# hub 覆盖缺口：每个页面的「上级 hub」是否给出了到它的入口
# 上级 hub = 该页面路径上最近的、本身也是页面的一级祖先（含簇 hub 这一层）
print('\n--- hub 覆盖缺口（上级 hub 没给出入口的页面）---')

def ancestors_of(u: str):
    parts = [s for s in u.split('/') if s]
    yield '/'
    for i in range(1, len(parts)):
        yield '/' + '/'.join(parts[:i]) + '/'

gaps = collections.defaultdict(list)
for u in pages:
    if u == '/':
        continue
    parent = None
    for cand in ancestors_of(u):      # 由浅到深，取最深的那个已存在页
        if cand in pages and cand != u:
            parent = cand
    if parent and u not in graph.get(parent, ()):
        gaps[parent].append(u)

if not gaps:
    print('  无缺口：每个页面都能从它的上级 hub 直接进入')
else:
    for parent in sorted(gaps):
        kids = sorted(gaps[parent])
        print(f'  {parent}  缺 {len(kids)} 个入口')
        for k in kids:
            print(f'        - {k}')
    print(f'\n  合计 {sum(len(v) for v in gaps.values())} 个页面在上级 hub 上没有入口')

out = ROOT / 'scratch'
out.mkdir(exist_ok=True)
(out / 'structure-report.json').write_text(
    json.dumps({'pages': sorted(pages), 'inbound': {k: sorted(v) for k, v in inbound.items()},
                'dist': dist, 'orphans': orph, 'broken': {k: sorted(v) for k, v in broken.items()},
                'unreachable': unreach, 'hub_gaps': {k: sorted(v) for k, v in gaps.items()}},
               ensure_ascii=False, indent=1), encoding='utf-8')
print('\n明细已写入 scratch/structure-report.json')
