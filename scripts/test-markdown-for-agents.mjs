#!/usr/bin/env node
/**
 * Markdown for Agents —— 回归测试
 *
 * 覆盖两块：
 *   1) worker/_lib/html-to-md.js  转换质量
 *   2) worker/index.js            Worker fetch 各分支（含"永不抛错"断言）
 *   3) CPU 基准 —— Cloudflare Workers 免费版有 10ms/请求 的硬上限，
 *      超了会被运行时直接杀掉（1102），所以这条必须每次改完都跑
 *
 * 用法：
 *   node scripts/test-markdown-for-agents.mjs --dist=.
 *   （MysticDo 无构建步骤：站点根目录即可部署，--dist=. 直接测根目录）
 *
 * 想拿别的目录（例如某次部署快照）做验证：
 *   node scripts/test-markdown-for-agents.mjs --dist=C:\path\to\snapshot
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const distArg = process.argv.find((a) => a.startsWith('--dist='));
const DIST = join(ROOT, distArg ? distArg.slice('--dist='.length) : 'dist');
const LIB = join(ROOT, 'worker', '_lib', 'html-to-md.js');
const WORKER = join(ROOT, 'worker', 'index.js');

if (!existsSync(DIST)) {
  console.error(`未找到 ${DIST} —— 请用 --dist=. 指向站点根目录`);
  process.exit(2);
}
if (!existsSync(LIB) || !existsSync(WORKER)) {
  console.error('未找到 worker/_lib/html-to-md.js 或 worker/index.js');
  process.exit(2);
}
const toFileUrl = (p) => 'file:///' + p.replace(/\\/g, '/');
const { convertPage } = await import(toFileUrl(LIB));
const worker = (await import(toFileUrl(WORKER))).default;

const MAX_CONVERT_BYTES = 150 * 1024;
let fail = 0;
const ok = (name, cond, extra = '') => {
  console.log(`${cond ? 'OK  ' : 'FAIL'} ${name}${extra ? '  ' + extra : ''}`);
  if (!cond) fail++;
};

// ── 收集样本页 ────────────────────────────────────────────────────────────
function collect(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    const st = statSync(p);
    if (st.isDirectory()) collect(p, out);
    else if (f === 'index.html') out.push({ p, size: st.size });
  }
  return out;
}
const all = collect(DIST).sort((a, b) => a.size - b.size);
if (!all.length) { console.error(`${DIST} 里没有 index.html 页面`); process.exit(2); }
const urlOf = (rel) => 'https://mysticdo.com/' + rel.replace(/index\.html$/, '');
const relOf = (p) => relative(DIST, p).replace(/\\/g, '/');

// 抽 12 个样本：覆盖小/中/大与顶层页面
const picks = [];
const seenBucket = new Set();
for (const x of all) {
  const bucket = Math.round(x.size / 1024 / 30);
  if (seenBucket.has(bucket)) continue;
  seenBucket.add(bucket);
  picks.push(x);
  if (picks.length >= 12) break;
}

// ── 1. 转换质量 ───────────────────────────────────────────────────────────
console.log('══ 1. 转换质量（真实 dist 产物）══');
let convertErr = 0;
for (const x of picks) {
  const rel = relOf(x.p);
  const html = readFileSync(x.p, 'utf8');
  let md, words;
  try {
    ({ markdown: md, words } = convertPage(html, { url: urlOf(rel) }));
  } catch (e) {
    convertErr++;
    console.log(`FAIL ${rel}  抛错: ${e.message}`);
    continue;
  }
  const problems = [];
  if (!md || md.length < 200) problems.push('输出过短');
  if (/<\/?(div|span|p|section|ul|li|table|tr|td|h[1-6]|strong|em)\b/i.test(md)) problems.push('残留 HTML 标签');
  const ent = md.match(/&[a-zA-Z]+;/g);
  if (ent) problems.push('未解码实体: ' + [...new Set(ent)].slice(0, 4).join(','));
  const h1 = md.split('\n').filter((l) => /^#\s+\S/.test(l)).length;
  if (h1 !== 1) problems.push(`一级标题 ${h1} 个`);
  if (md.includes('\u0000')) problems.push('残留占位符');
  if (/^\|/m.test(md) && !/^\|\s*---/m.test(md)) problems.push('表格缺分隔行');

  if (problems.length) fail++;
  console.log(`${problems.length ? 'FAIL' : 'OK  '} ${rel.padEnd(46)} ${(md.length / 1024).toFixed(0).padStart(4)}KB ${String(words).padStart(6)} 词 ${(100 - md.length / html.length * 100).toFixed(0)}%↓`);
  for (const q of problems) console.log('       ✗ ' + q);
}

// ── 2. Worker fetch 分支 ─────────────────────────────────────────────────
console.log('\n══ 2. Worker fetch（内容协商）══');
function makeNext(original) {
  return async (req) => {
    const u = new URL((req || original).url);
    let p = u.pathname;
    if (p.endsWith('/')) p += 'index.html';
    const file = join(DIST, p.replace(/^\//, ''));
    try {
      const body = readFileSync(file);
      return new Response(body, {
        status: 200,
        headers: { 'Content-Type': p.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream' },
      });
    } catch {
      return new Response('not found', { status: 404, headers: { 'Content-Type': 'text/plain' } });
    }
  };
}
async function call(url, headers = {}) {
  const req = new Request(url, { headers });
  const t0 = process.hrtime.bigint();
  const res = await worker.fetch(req, { ASSETS: { fetch: makeNext(req) } });
  return { res, ms: Number(process.hrtime.bigint() - t0) / 1e6 };
}
const BROWSER = { Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' };
const AGENT = { Accept: 'text/markdown' };

// 选一个**真正的内容页**做协商测试：站点里有过小的存根/跳转页（十几词），
// 中间件对它们会按"内容不足"退回 HTML，拿它们测会误报失败。
const contentPages = all.filter((x) => x.size > 60000 && x.size <= MAX_CONVERT_BYTES);
const small = contentPages.length ? contentPages[0] : picks.find((x) => x.size <= MAX_CONVERT_BYTES);
const big = [...all].reverse().find((x) => x.size > MAX_CONVERT_BYTES);

{
  const { res } = await call('https://www.mysticdo.com/x/?a=1', BROWSER);
  ok('www → apex 301 且保留 path+query', res.status === 301 && res.headers.get('Location') === 'https://mysticdo.com/x/?a=1');
}
{
  const { res } = await call('https://mysticdo.com/', BROWSER);
  ok('浏览器请求 → HTML', (res.headers.get('Content-Type') || '').includes('text/html'));
  ok('HTML 响应带 Vary: Accept', /(^|,)\s*Accept\s*($|,)/i.test(res.headers.get('Vary') || ''));
}
{
  const { res } = await call(urlOf(relOf(small.p)), AGENT);
  const body = await res.text();
  ok('Accept: text/markdown → markdown', (res.headers.get('Content-Type') || '').startsWith('text/markdown'));
  ok('正文含标题与来源标注', body.startsWith('# ') && body.includes('> Source: https://'));
  ok('相对链接已绝对化', !/\]\(\/go\//.test(body));
}
{
  const a = await call(urlOf(relOf(small.p)), { Accept: 'text/html, text/markdown;q=0.1' });
  ok('markdown q 值低 → 仍返回 HTML', (a.res.headers.get('Content-Type') || '').includes('text/html'));
  const b = await call(urlOf(relOf(small.p)), { Accept: 'text/html;q=0.2, text/markdown' });
  ok('markdown q 值高 → 返回 markdown', (b.res.headers.get('Content-Type') || '').startsWith('text/markdown'));
}
{
  const a = await call('https://mysticdo.com/go/kasamba/', AGENT);
  ok('/go/ 不协商', !(a.res.headers.get('Content-Type') || '').startsWith('text/markdown'));
  const b = await call('https://mysticdo.com/sitemap.xml', AGENT);
  ok('静态资源后缀（.xml）不协商', !(b.res.headers.get('Content-Type') || '').startsWith('text/markdown'));
  const c = await call('https://mysticdo.com/api/postback?x=1', AGENT);
  ok('/api/ 不协商', !(c.res.headers.get('Content-Type') || '').startsWith('text/markdown'));
  const d = await call('https://abc.mysticdo.workers.dev/', BROWSER);
  ok('workers.dev 预览域名不被 301', d.res.status !== 301);

  // .html 是正文页的后缀，必须参与协商（全站 guide 都是 .html）。
  // 2026-09-19 修正：原先 `last.includes('.')` 把 .html 一并排除了。
  const htmlPage = join(DIST, 'about.html');
  if (existsSync(htmlPage)) {
    const e = await call('https://mysticdo.com/about.html', AGENT);
    ok('.html 正文页参与协商 → markdown', (e.res.headers.get('Content-Type') || '').startsWith('text/markdown'));
  }
}
if (big) {
  try {
    const { res } = await call(urlOf(relOf(big.p)), AGENT);
    const body = await res.text();
    ok(
      `超大页(${(big.size / 1024).toFixed(0)}KB)优雅退回 HTML`,
      res.status === 200 && (res.headers.get('Content-Type') || '').includes('text/html') && body.length > 10000
    );
  } catch (e) {
    fail++;
    console.log('FAIL 超大页退回时抛错: ' + e.message);
  }
}

// ── 3. CPU 基准 ───────────────────────────────────────────────────────────
console.log('\n══ 3. CPU 基准（Workers 免费版上限 10ms/请求）══');
const bench = (file, iters) => {
  const html = readFileSync(file, 'utf8');
  const t0 = process.hrtime.bigint();
  for (let i = 0; i < iters; i++) convertPage(html, { url: 'https://mysticdo.com/x/' });
  return Number(process.hrtime.bigint() - t0) / 1e6 / iters;
};
bench(all[all.length - 1].p, 2);
let over = 0;
for (const x of picks.filter((x) => x.size <= MAX_CONVERT_BYTES)) {
  const ms = bench(x.p, x.size > 100000 ? 10 : 25);
  const flag = ms <= 10 ? 'OK' : '超限';
  if (ms > 10) over++;
  console.log(`  ${(x.size / 1024).toFixed(0).padStart(4)}KB  ${ms.toFixed(2).padStart(6)} ms  ${flag}`);
}
console.log(`  覆盖范围：全站 ${all.length} 页中 ${all.filter((x) => x.size <= MAX_CONVERT_BYTES).length} 页会转 markdown（${(all.filter((x) => x.size <= MAX_CONVERT_BYTES).length / all.length * 100).toFixed(1)}%）`);
if (over) { fail++; console.log(`  ✗ 有 ${over} 个样本超过 10ms —— 需要下调 MAX_CONVERT_BYTES`); }

console.log(`\n${fail ? '✗ 失败 ' + fail + ' 项' : '✓ 全部通过'}`);
process.exit(fail ? 1 : 0);
