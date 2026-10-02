#!/usr/bin/env python3
"""bake-chrome.py — 把全站 header/footer 从 JS 注入改为静态 HTML。

为什么要这么做（2026-10-02 的教训）：
  header/footer 过去由 main.js 用 innerHTML 注入。Google 会执行 JS，所以 GSC 一切
  正常；但 Bingbot 与绝大多数 AI 爬虫不执行（或延迟执行）JS —— 对它们而言，
  全站每一页的静态 HTML 里都几乎没有可跟随的站内链接。实测 Bing 已收录的 3 个
  页面，恰好等于静态 HTML 可达集合。这就是「Bing 只有 1 个页面」的另一半根因。

本脚本把同一份标记写进每页的 #site-header / #site-footer 占位 div：

  · 单一事实源 —— 标记只在本文件维护；main.js 的注入模板已删除。
  · 幂等 —— 重复运行只刷新内容（CHROME 标记之间），不会重复注入。
  · 零视觉差异 —— 标记与原 main.js 模板逐字节同源（footer 为补全版），
    渲染结果与 JS 注入完全一致，CSS 不需要任何改动。
  · markdown 孪生体不受影响 —— worker/_lib/html-to-md.js 的 stripRawBlocks
    本来就丢弃 nav/footer，烘焙后行为不变。

配套门禁：scripts/test-chrome-baked.mjs 断言每个发布页都已烘焙且无残留空占位。

用法：
  python scripts/bake-chrome.py            # 写入（幂等）
  python scripts/bake-chrome.py --check    # 只校验不写，失败退出码 1

页面改动后的流水线顺序：
  python seo_inject.py → python scripts/bake-chrome.py →
  python scripts/build-content-index.py → node scripts/build-llms-full.mjs
"""
import re
import sys
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent

# 与 audit-structure.py 一致的发布面：这些目录下的 HTML 不进公网 CDN
SKIP_DIRS = {'.git', '.workbuddy', '.vscode', '.wrangler', 'assets', 'scripts',
             'email-templates', '_design-check', 'node_modules', 'scratch',
             '__pycache__', 'logo-drafts', 'functions', 'worker'}

H_MARKER = '<!--chrome-h-start-->'
H_END = '<!--chrome-h-end-->'
F_MARKER = '<!--chrome-f-start-->'
F_END = '<!--chrome-f-end-->'

# ─────────────────────────────────────────────────────────────────────────────
# 页眉：与原 main.js HEADER_HTML 逐字节同源（行为不变，仅改为静态输出）
# ─────────────────────────────────────────────────────────────────────────────
HEADER_HTML = '''<header class="site-header">
  <div class="container header-inner">
    <a href="/" class="brand" aria-label="MysticDo home">
      <span class="brand-word">MysticDo</span>
    </a>
    <nav class="nav" aria-label="Primary">
      <div class="nav-item has-dropdown">
        <button class="nav-link" type="button" data-nav="practices">Practices <svg class="nav-chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></button>
        <div class="nav-dropdown">
          <a href="/astrology/"><strong>Astrology</strong><span>timing, patterns, natal charts</span></a>
          <a href="/psychic/"><strong>Psychic readings</strong><span>direct read on a specific question</span></a>
          <a href="/medium/"><strong>Medium readings</strong><span>connection, closure, loss</span></a>
          <a href="/tarot/"><strong>Tarot</strong><span>structured reflection, spreads</span></a>
        </div>
      </div>
      <div class="nav-item has-dropdown">
        <button class="nav-link" type="button" data-nav="questions">Questions <svg class="nav-chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></button>
        <div class="nav-dropdown">
          <a href="/questions/love-relationships/"><strong>Love &amp; Relationships</strong><span>breakups, ex, uncertainty, new</span></a>
          <a href="/questions/career-work/"><strong>Career &amp; Work</strong><span>job, move, offer, direction</span></a>
          <a href="/questions/money-wealth/"><strong>Money &amp; Wealth</strong><span>income, debt, financial decisions</span></a>
          <a href="/questions/life-direction/"><strong>Life Direction</strong><span>purpose, crossroads, transitions</span></a>
          <a href="/questions/loss-closure/"><strong>Loss &amp; Closure</strong><span>grief, connection, endings</span></a>
          <a href="/questions/spiritual-growth/"><strong>Spiritual Growth</strong><span>intuition, patterns, meaning</span></a>
        </div>
      </div>
      <a href="/guides/" class="nav-link" data-nav="guides">Guides</a>
      <a href="/methodology" class="nav-link" data-nav="methodology">Methodology</a>
      <a href="/about" class="nav-link" data-nav="about">About</a>
    </nav>
    <button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
    <a href="/do-what-fits" class="btn btn-primary btn-sm nav-cta-header">Do What Fits</a>
  </div>
</header>'''

# ─────────────────────────────────────────────────────────────────────────────
# 页脚：在原模板基础上补全 —— Questions 列从 4 条扩到全部 11 个簇 + All，
# Decide 列补齐 Contact / Privacy / Join / All quizzes。
# 设计约束（Aurum）：不加金色横条、不引入新组件，只沿用既有 footer-col 结构。
# ─────────────────────────────────────────────────────────────────────────────
FOOTER_HTML = '''<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <div class="footer-brand">
          <img src="/assets/brand/mysticdo-mark-64.png" width="24" height="24" alt="" loading="lazy" decoding="async"> MysticDo
        </div>
        <p class="footer-tag">Match your spiritual needs. Choose what to do next — before you pay.</p>
        <div class="tag-list mt-4">
          <span class="badge badge-ghost">Psychic</span>
          <span class="badge badge-ghost">Tarot</span>
          <span class="badge badge-ghost">Astrology</span>
          <span class="badge badge-ghost">Medium</span>
          <span class="badge badge-ghost">Numerology</span>
          <span class="badge badge-ghost">Manifestation</span>
        </div>
      </div>
      <div class="footer-col"><h4>Practices</h4><ul>
        <li><a href="/astrology/">Astrology</a></li>
        <li><a href="/psychic/">Psychic</a></li>
        <li><a href="/tarot/">Tarot</a></li>
        <li><a href="/medium/">Medium</a></li>
        <li><a href="/tools/daily-card">Free daily card</a></li>
      </ul></div>
      <div class="footer-col"><h4>Questions</h4><ul>
        <li><a href="/questions/love-relationships/">Love &amp; Relationships</a></li>
        <li><a href="/questions/career-work/">Career &amp; Work</a></li>
        <li><a href="/questions/money-wealth/">Money &amp; Wealth</a></li>
        <li><a href="/questions/life-direction/">Life Direction</a></li>
        <li><a href="/questions/loss-closure/">Loss &amp; Closure</a></li>
        <li><a href="/questions/spiritual-growth/">Spiritual Growth</a></li>
        <li><a href="/questions/angel-numbers/">Angel Numbers</a></li>
        <li><a href="/questions/dreams/">Dream Meanings</a></li>
        <li><a href="/questions/signs/">Signs &amp; Symbols</a></li>
        <li><a href="/questions/tarot/">Tarot Card Meanings</a></li>
        <li><a href="/questions/astrology/">Astrology &amp; Your Chart</a></li>
        <li><a href="/questions/">All questions</a></li>
      </ul></div>
      <div class="footer-col"><h4>Decide</h4><ul>
        <li><a href="/do-what-fits">Do What Fits quiz</a></li>
        <li><a href="/quiz/">All quizzes</a></li>
        <li><a href="/guides/">Decision guides</a></li>
        <li><a href="/methodology">Methodology</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/contact">Contact</a></li>
        <li><a href="/privacy">Privacy</a></li>
        <li><a href="/join">Join the newsletter</a></li>
      </ul></div>
    </div>
    <div class="footer-disclosure">
      <strong style="color:var(--accent-link)">Affiliate disclosure:</strong> As provider reviews publish, some outbound links will be affiliate links — meaning we may earn a commission if you sign up through them, at no extra cost to you. That never affects what we recommend or how it ranks. No affiliate links exist on MysticDo today. See <a href="/methodology" style="color:var(--accent-link)">methodology</a>.
    </div>
    <div class="footer-bottom mt-5">
      <span>&copy; 2026 MysticDo — an intent-driven spiritual decision platform.</span>
      <span>Not professional advice. See <a href="/about">disclaimers</a>.</span>
    </div>
  </div>
</footer>'''


def published_pages():
    out = []
    for p in sorted(ROOT.rglob('*.html')):
        rel = p.relative_to(ROOT)
        if any(part in SKIP_DIRS for part in rel.parts[:-1]):
            continue
        out.append(p)
    return out


def bake_block(text, placeholder_id, marker, end, html):
    """把 html 写进占位 div。返回 (new_text, status)；status ∈ baked/fresh/missing。"""
    wrap_open = '<div id="%s">' % placeholder_id
    replacement = wrap_open + marker + html + end + '</div>'
    re_baked = re.compile(
        re.escape(wrap_open) + re.escape(marker) + r'.*?' + re.escape(end) + r'</div>',
        re.S)
    if re_baked.search(text):
        new, n = re_baked.subn(lambda m: replacement, text, count=1)
        return (new, 'baked' if n else 'missing')
    empty = wrap_open + '</div>'
    if empty in text:
        return (text.replace(empty, replacement, 1), 'fresh')
    return (text, 'missing-placeholder')


def read_page(path):
    with open(path, 'r', encoding='utf-8', newline='') as f:
        return f.read()


def write_page(path, text):
    with open(path, 'w', encoding='utf-8', newline='') as f:
        f.write(text)


def main(check_only=False):
    pages = published_pages()
    changed, errors = [], []

    for path in pages:
        raw = read_page(path)
        # Preserve the file's own line-ending convention: bake on an
        # LF-normalised copy, then restore the original ending on write.
        # (The LF-only HTML constants written verbatim used to produce mixed
        # endings — CRLF body + LF chrome — breaking the repo's CRLF norm.)
        nl = '\r\n' if '\r\n' in raw else '\n'
        work = raw.replace('\r\n', '\n')
        text, h_state = bake_block(work, 'site-header', H_MARKER, H_END, HEADER_HTML)
        text, f_state = bake_block(text, 'site-footer', F_MARKER, F_END, FOOTER_HTML)

        if h_state.startswith('missing') or f_state.startswith('missing'):
            errors.append(f'{path.relative_to(ROOT)}: '
                          f'header={h_state} footer={f_state}')
            continue
        # Compare after ending restoration so a line-ending drift (e.g. from
        # an earlier LF-constants bake) is also normalised, not just content.
        final = text.replace('\n', nl)
        if final != raw:
            if check_only:
                errors.append(f'{path.relative_to(ROOT)}: chrome 需要刷新（当前是旧内容）')
                continue
            write_page(path, final)
            changed.append(path.relative_to(ROOT).as_posix())

    print(f'[bake-chrome] 发布面 HTML：{len(pages)} 个文件')
    if check_only:
        if errors:
            print(f'[bake-chrome] CHECK FAILED — {len(errors)} 个文件不达标：')
            for e in errors:
                print('   ', e)
            sys.exit(1)
        print('[bake-chrome] CHECK PASSED — 全部页面已烘焙最新 chrome')
        return

    if changed:
        print(f'[bake-chrome] 更新 {len(changed)} 个文件')
    else:
        print('[bake-chrome] 无变化（已是最新）')
    if errors:
        print(f'[bake-chrome] {len(errors)} 个文件缺占位 div，未处理：')
        for e in errors:
            print('   ', e)
        sys.exit(1)


if __name__ == '__main__':
    main(check_only='--check' in sys.argv)
