#!/usr/bin/env node
/**
 * test-chrome-baked.mjs — 门禁：每个发布页的 header/footer 必须是静态烘焙的。
 *
 * 为什么这是门禁而不是约定（2026-10-02 的教训）：
 *   chrome 曾由 main.js 注入。Google 渲染 JS 所以 GSC 正常；Bingbot 与 AI 爬虫
 *   不执行 JS，于是全站对它们没有任何可跟随的导航 —— Bing 只收录了静态 HTML
 *   可达的那几个页面。烘焙修复后，任何人新增页面如果忘了跑 bake-chrome.py，
 *   或者有人把注入逻辑改回来，这条测试必须让 npm test 变红。
 *
 * 断言：
 *   1. 每个发布 HTML 的 #site-header / #site-footer 都含烘焙标记，且不是空占位
 *   2. 页脚包含完整的分类学入口：11 个簇 + 信任页 + 转化页（防止页脚被裁剪回退）
 *   3. main.js 不再包含任何 chrome 注入逻辑（防止回归到 JS 注入）
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['.git', '.workbuddy', '.vscode', '.wrangler', 'assets',
  'scripts', 'email-templates', '_design-check', 'node_modules', 'scratch',
  '__pycache__', 'logo-drafts', 'functions', 'worker']);

/** 页脚必须存在的入口 —— 分类学完整性的最小集。 */
const FOOTER_MUST_LINK = [
  '/questions/love-relationships/', '/questions/career-work/',
  '/questions/money-wealth/', '/questions/life-direction/',
  '/questions/loss-closure/', '/questions/spiritual-growth/',
  '/questions/angel-numbers/', '/questions/dreams/', '/questions/signs/',
  '/questions/tarot/', '/questions/astrology/', '/questions/',
  '/guides/', '/do-what-fits', '/tools/daily-card',
  '/methodology', '/about', '/contact', '/privacy', '/join',
];

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (!SKIP.has(name)) yield* walk(full);
    } else if (name.endsWith('.html')) {
      yield full;
    }
  }
}

const pages = [...walk(ROOT)];
let failures = 0;
const fail = (msg) => { failures++; console.error('  [FAIL]', msg); };

console.log(`[chrome-baked] 发布面 HTML：${pages.length} 个文件`);

for (const page of pages) {
  const rel = path.relative(ROOT, page).replaceAll('\\', '/');
  const html = readFileSync(page, 'utf8');

  if (!html.includes('<div id="site-header"><!--chrome-h-start-->')) {
    fail(`${rel}: #site-header 未烘焙（空占位或无标记）`);
  }
  if (!html.includes('<div id="site-footer"><!--chrome-f-start-->')) {
    fail(`${rel}: #site-footer 未烘焙（空占位或无标记）`);
  }
  if (/<div id="site-(?:header|footer)"\s*>\s*<\/div>/.test(html)) {
    fail(`${rel}: 存在残留的空占位 div`);
  }
  const footerAt = html.indexOf('<!--chrome-f-start-->');
  const footerChunk = footerAt === -1 ? '' : html.slice(footerAt, html.indexOf('<!--chrome-f-end-->', footerAt));
  if (footerChunk) {
    for (const href of FOOTER_MUST_LINK) {
      if (!footerChunk.includes(`href="${href}"`)) {
        fail(`${rel}: 页脚缺入口 ${href}`);
      }
    }
  }
}

const mainJs = readFileSync(path.join(ROOT, 'assets/js/main.js'), 'utf8');
for (const banned of ['injectLayout', 'HEADER_HTML', 'FOOTER_HTML']) {
  if (mainJs.includes(banned)) fail(`assets/js/main.js 仍包含 ${banned} —— chrome 必须由 bake-chrome.py 静态输出`);
}

if (failures) {
  console.error(`[chrome-baked] ${failures} 处不达标`);
  process.exit(1);
}
console.log('[chrome-baked] ALL GREEN — 全站 chrome 已烘焙，页脚分类学完整，无 JS 注入回归');
