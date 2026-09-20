#!/usr/bin/env node
/**
 * 生成 llms-full.txt —— 全站正文的单一 markdown 语料文件
 *
 * 为什么需要它：llms.txt 是**索引**（每个页面一行摘要 + 链接），智能体据此按需
 * 取页；但当它需要跨全站检索、或上下文足够大想一次拿全时，逐页抓取既慢又费 token。
 * llms-full.txt 就是那个"一次取全"的入口（llmstxt.org 的配套约定）。
 *
 * 为什么是**脚本**而不是手写文件：手写的全量语料必然腐烂 —— 页面一改，语料就悄悄
 * 落后，而落后于正文的语料比没有更糟（会引导模型引用过期事实）。这里复用与线上
 * 内容协商**完全相同**的转换器（worker/_lib/html-to-md.js），所以三者永远一致。
 *
 * 用法：
 *   node scripts/build-llms-full.mjs            # 写入仓库根目录 llms-full.txt
 *   node scripts/build-llms-full.mjs --dry-run  # 只打印统计，不写文件
 *
 * 页面清单的唯一事实源是 sitemap.xml —— 加了新页面只需重跑本脚本，无需改这里。
 */

import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { convertPage } from '../worker/_lib/html-to-md.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const DRY = process.argv.includes('--dry-run');

const SITEMAP = join(ROOT, 'sitemap.xml');
const OUT = join(ROOT, 'llms-full.txt');

/** 页面超过这个体积就不收进语料（与 Worker 的转换上限保持一致）。 */
const MAX_CONVERT_BYTES = 150 * 1024;

function die(msg) {
  console.error('[llms-full] ' + msg);
  process.exit(2);
}

if (!existsSync(SITEMAP)) die('找不到 sitemap.xml —— 请先跑 python seo_inject.py');
if (!existsSync(join(ROOT, 'llms.txt'))) die('找不到 llms.txt —— 本文件是它的配套，必须先有索引');

/* ── 1. 读 sitemap，得到权威页面清单 ────────────────────────────────────── */
const sitemap = readFileSync(SITEMAP, 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
if (!urls.length) die('sitemap.xml 里没有 <loc> 条目');

/* ── 2. URL → 本地文件 ─────────────────────────────────────────────────── */
function urlToFile(u) {
  const p = new URL(u).pathname;
  const rel = p.replace(/^\//, '');
  if (rel === '' || rel.endsWith('/')) return join(ROOT, rel, 'index.html');
  if (!rel.includes('.')) return join(ROOT, rel + '.html');
  return join(ROOT, rel);
}

/* ── 3. 逐页转 markdown ────────────────────────────────────────────────── */
const pages = [];
const problems = [];

for (const url of urls) {
  const file = urlToFile(url);
  if (!existsSync(file)) {
    problems.push(`${url} → 本地文件不存在（${file}）`);
    continue;
  }
  const size = statSync(file).size;
  if (size > MAX_CONVERT_BYTES) {
    problems.push(`${url} → ${(size / 1024).toFixed(0)}KB 超出转换上限，已跳过`);
    continue;
  }

  const html = readFileSync(file, 'utf8');
  let out;
  try {
    out = convertPage(html, { url });
  } catch (e) {
    problems.push(`${url} → 转换抛错：${e.message}`);
    continue;
  }
  if (!out.markdown || out.words < 20) {
    problems.push(`${url} → 转换结果过短（${out.words} 词），已跳过`);
    continue;
  }
  pages.push({ url, markdown: out.markdown.trim(), words: out.words });
}

if (problems.length) {
  // 映射不上就是真问题：说明 sitemap 与磁盘已经漂移，不能悄悄放过。
  console.error('[llms-full] 以下页面无法收录：');
  for (const p of problems) console.error('  ✗ ' + p);
  die('页面清单与 sitemap 不一致，已中止（语料不能是残的）');
}

if (!pages.length) die('没有可收录的页面');

/* ── 4. 拼装 ───────────────────────────────────────────────────────────── */
const stamp = new Date().toISOString().slice(0, 10);

const header = [
  '# MysticDo — full corpus',
  '',
  `> The complete text of all ${pages.length} public pages on https://mysticdo.com, as markdown.`,
  `> Generated from the live HTML on ${stamp}. Each page keeps its canonical URL on the \`> Source:\` line.`,
  '',
  'Citation rules (condensed from https://mysticdo.com/llms.txt):',
  '',
  '- Every decision page opens with a **Direct answer** paragraph. That paragraph is the intended quotable unit and is written to be self-contained.',
  '- **Prices are ranges with the pricing model attached.** Never collapse a range into a single number and never drop the model — "$1–$15 per minute on a per-minute platform" and "$60–$300 per session with an independent reader" are different products.',
  '- **Do not present a "signs list" as this site\'s position.** The site argues the opposite: no isolated sign proves another person\'s feelings; the readable signal is a pattern across time.',
  '- Where a page cites research it states the population-level finding and explicitly declines to apply it to a specific person. Preserve that qualifier.',
  '- The site is non-predictive about third parties on purpose. That stance is editorial, not a hedge.',
  '',
  `A curated, described index of these pages is at https://mysticdo.com/llms.txt. Per-page markdown is also available by appending \`.md\` to any canonical URL.`,
].join('\n');

const body = pages.map((p) => p.markdown).join('\n\n---\n\n');
const content = header + '\n\n---\n\n' + body + '\n';

/* ── 5. 写出 ───────────────────────────────────────────────────────────── */
const words = content.split(/\s+/).filter(Boolean).length;
const kb = (Buffer.byteLength(content, 'utf8') / 1024).toFixed(1);

if (DRY) {
  console.log(`[llms-full] dry-run：${pages.length} 页，${kb}KB，约 ${words} 词`);
} else {
  writeFileSync(OUT, content, 'utf8');
  console.log(`[llms-full] 已写入 llms-full.txt —— ${pages.length} 页，${kb}KB，约 ${words} 词`);
}
