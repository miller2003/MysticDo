#!/usr/bin/env node
/**
 * indexnow-preflight.mjs — IndexNow 提交前预检（mysticdo.com）
 *
 * 目的：提交前把「会白推 / 推了也没用」的情况先暴露出来，避免遗漏与无效提交。
 *
 * 用法：
 *   node scripts/indexnow-preflight.mjs                    # 检查 sitemap.xml 全部 URL
 *   node scripts/indexnow-preflight.mjs --changed HEAD~1   # 只检查某次改动涉及的页
 *   node scripts/indexnow-preflight.mjs --urls a.html,b.html
 *   node scripts/indexnow-preflight.mjs --strict           # 有问题时以退出码 1 失败（默认仅告警）
 *   node scripts/indexnow-preflight.mjs --concurrency 12   # 并发数（默认 8）
 *   node scripts/indexnow-preflight.mjs --offline          # 跳过全部网络检查，只做本地一致性核验
 *
 * 四项检查：
 *   1. 本地 HTML 页 vs sitemap.xml 双向差集
 *        - 可索引但不在 sitemap → 遗漏（warn）
 *        - 在 sitemap 却标了 noindex → 自相矛盾，浪费抓取预算（warn）
 *        - sitemap 有但本地无对应文件 → 死条目（error）
 *   2. 线上 sitemap 与本地 sitemap 的 URL 集合差集 → 本地新增页未部署（error）
 *   3. 每条 URL 的 HTTP 状态（HEAD，跟随重定向，失败重试 1 次）→ 非 200 属未生效/路径错（error）
 *   4. key 文件线上可取（HEAD 200）→ 否则 IndexNow 会回 403/422（error）
 *
 * 默认「告警不阻断」：线上正在部署时就先提交是正常操作，且 IndexNow 会去重、重复提交无害。
 * 需要把它当门禁时加 --strict。
 */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { collectUrls, REPO_ROOT, sitemapUrls, HOST, ORIGIN, KEY, KEY_LOCATION } from './submit-indexnow.mjs';

const FLAGS = new Set(['--strict', '--offline']);
const argv = process.argv.slice(2);
const strict = argv.includes('--strict');
const offline = argv.includes('--offline');

/* 解析 --concurrency N，并把已消费的参数剔出，剩下的交给 collectUrls。 */
const collectArgs = [];
let concurrency = 8;
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (FLAGS.has(a)) continue;
  if (a === '--concurrency') { concurrency = Math.max(1, Number(argv[++i]) || 8); continue; }
  collectArgs.push(a);
}

/** 统一为「站内路径 + 无尾斜杠」以便集合比对（`/guides/` 与 `/guides` 视为同一页）。 */
function norm(u) {
  const p = String(u).replace(ORIGIN, '').replace(/^https?:\/\/[^/]+/, '') || '/';
  return p === '/' ? '/' : p.replace(/\/+$/, '');
}

const errors = [];
const warnings = [];

/* ── 1. 本地页面 vs sitemap ──────────────────────────────────────────────── */

/** 这些目录里的 .html 不是站点页面（工具、草稿、邮件模板），不参与比对。 */
const SKIP_DIRS = new Set([
  '.git', 'node_modules', 'scratch', '_design-check', 'email-templates',
  '.workbuddy', '__pycache__', 'logo-drafts', 'tmp', 'temp', 'worker', 'functions',
]);

function walkHtml(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name)) walkHtml(full, out);
    } else if (e.name.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

/** 本地 .html 绝对路径 → 站内路径（`/index.html` → `/`，其余去 `.html`）。 */
function pageToPath(absFile) {
  const rel = path.relative(REPO_ROOT, absFile).replaceAll('\\', '/').replace(/\.html$/, '');
  if (rel === 'index') return '/';
  return norm(`/${rel.endsWith('/index') ? rel.slice(0, -'/index'.length) : rel}`);
}

function isNoindex(absFile) {
  const head = readFileSync(absFile, 'utf8').slice(0, 20000);
  const m = head.match(/<meta[^>]+name=["']robots["'][^>]*>/i);
  return /\bnoindex\b/i.test(m ? m[0] : '');
}

const sitePaths = new Map(); // 站内路径 -> 绝对文件路径
for (const f of walkHtml(REPO_ROOT)) sitePaths.set(pageToPath(f), f);

const smPaths = new Set(sitemapUrls().map(norm));

for (const [p, f] of [...sitePaths].sort()) {
  if (p === '/404') continue; // 错误页永不进 sitemap
  const inSitemap = smPaths.has(p);
  const noindex = isNoindex(f);
  if (inSitemap && noindex) warnings.push(`sitemap 中有 noindex 页（自相矛盾）：${p}`);
  else if (!inSitemap && !noindex) warnings.push(`可索引页未进 sitemap（遗漏）：${p}`);
}
for (const p of smPaths) if (!sitePaths.has(p)) errors.push(`sitemap 条目无本地文件（死条目）：${p}`);

console.log(`[preflight] 本地站点页 ${sitePaths.size - 1}（不含 404）| sitemap ${smPaths.size} 条`);

/* ── 2/3/4. 网络检查 ─────────────────────────────────────────────────────── */

let target;
try {
  target = [...new Set(collectUrls(collectArgs))].sort();
} catch (e) {
  console.error(`[preflight] ${e.message}`);
  if (e.hint) console.error(`  ${e.hint}`);
  process.exit(e.exitCode ?? 1);
}

if (offline) {
  console.log('[preflight] --offline：已跳过线上 sitemap、HTTP 与 key 文件检查。');
} else {
  try {
    const res = await fetch(`${ORIGIN}/sitemap.xml`, { headers: { 'cache-control': 'no-cache' } });
    if (res.status !== 200) {
      errors.push(`线上 sitemap.xml 返回 ${res.status}`);
    } else {
      const live = new Set([...(await res.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => norm(m[1])));
      const undeployed = [...smPaths].filter((p) => !live.has(p));
      const extra = [...live].filter((p) => !smPaths.has(p));
      if (undeployed.length) errors.push(`本地 sitemap 有 ${undeployed.length} 条线上未列出（未部署？）：${undeployed.slice(0, 5).join(', ')}${undeployed.length > 5 ? ' …' : ''}`);
      if (extra.length) warnings.push(`线上 sitemap 多出 ${extra.length} 条本地已无（历史残留）：${extra.slice(0, 5).join(', ')}`);
      if (!undeployed.length && !extra.length) console.log('[preflight] 本地/线上 sitemap URL 集合一致 ✅');
    }
  } catch (e) {
    errors.push(`无法获取线上 sitemap.xml：${e.message}`);
  }

  console.log(`[preflight] 检查 ${target.length} 条 URL 的 HTTP 状态（并发 ${concurrency}）…`);
  let i = 0;
  const bad = [];
  async function worker() {
    while (i < target.length) {
      const u = target[i++];
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const res = await fetch(u, { method: 'HEAD', redirect: 'follow' });
          if (res.status === 200) break;
          if (attempt === 2) bad.push([String(res.status), u, res.url && res.url !== u ? `→ ${res.url}` : '']);
        } catch (e) {
          if (attempt === 2) bad.push(['ERR', u, e.message]);
          else await new Promise((r) => setTimeout(r, 800));
        }
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, target.length) }, worker));
  for (const [s, u, extra] of bad.sort()) errors.push(`HTTP ${s}：${u}${extra ? ' ' + extra : ''}`);
  if (!bad.length) console.log(`[preflight] HTTP 200：${target.length}/${target.length} ✅`);

  try {
    const keyRes = await fetch(KEY_LOCATION, { method: 'HEAD' });
    if (keyRes.status !== 200) errors.push(`key 文件不可取：${KEY_LOCATION} 返回 ${keyRes.status}（IndexNow 会回 403/422）`);
    else console.log(`[preflight] key 文件在线可取 ✅（${KEY}）`);
  } catch (e) {
    errors.push(`无法获取 key 文件：${e.message}`);
  }
}

/* ── 收尾 ───────────────────────────────────────────────────────────────── */

for (const e of errors) console.log(`  ❌ ${e}`);
for (const w of warnings) console.log(`  ⚠️  ${w}`);

console.log(`[preflight] 结果：${errors.length} error / ${warnings.length} warn —— 待提交 ${target.length} 条（host ${HOST}）`);
if (errors.length === 0 && warnings.length === 0) console.log('[preflight] ALL GREEN ✅');

if (strict && (errors.length || warnings.length)) {
  console.error('[preflight] --strict：存在问题，退出码 1。');
  process.exit(1);
}
