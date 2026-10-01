#!/usr/bin/env node
/**
 * submit-indexnow.mjs — IndexNow 提交器（mysticdo.com）
 *
 * 用法：
 *   node scripts/submit-indexnow.mjs                      # 提交 sitemap.xml 里全部 URL（全量）
 *   node scripts/submit-indexnow.mjs --changed <ref>      # 提交 ref..HEAD 之间改动的 HTML 页（增量）
 *   node scripts/submit-indexnow.mjs --urls a.html,b.html  # 显式指定（本地路径 / 裸路径 / 完整 URL）
 *   node scripts/submit-indexnow.mjs --dry-run            # 只打印报文，不提交
 *   node scripts/submit-indexnow.mjs -v                   # 同时列出 URL
 *
 * IndexNow 协议：POST https://api.indexnow.org/indexnow
 *   { host, key, keyLocation, urlList }   （单次 ≤10,000 条）
 * 响应：200/202 = 已受理；400 报文错；403 key 无效；422 URL 不属于 host；429 过频。
 *
 * key 文件：仓库根目录 `<key>.txt`（内容 = key 本体），且必须线上可取
 *   （https://mysticdo.com/<key>.txt → 200），否则 403/422。
 *   轮换 key = 改名根目录 `.txt` 文件 + 改本文件 KEY（两处，缺一即静默失效）。
 *
 * 提交前建议先跑预检：`node scripts/indexnow-preflight.mjs`（npm run preflight:indexnow）。
 *
 * 本文件同时作为模块被 indexnow-preflight.mjs 复用：`collectUrls` / `toCanonicalUrl`。
 */
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const HOST = 'mysticdo.com';
export const ORIGIN = `https://${HOST}`;
export const KEY = 'a53283218b178692862c487c88b2c2b6';
export const KEY_LOCATION = `${ORIGIN}/${KEY}.txt`;
export const ENDPOINT = 'https://api.indexnow.org/indexnow';
export const MAX_URLS = 10000;

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SITEMAP_PATH = path.join(REPO_ROOT, 'sitemap.xml');

/** 收集参数失败时抛出，附带退出码与可选提示，交由 CLI 决定呈现方式。 */
export class CollectError extends Error {
  constructor(message, exitCode = 1, hint = '') {
    super(message);
    this.name = 'CollectError';
    this.exitCode = exitCode;
    this.hint = hint;
  }
}

/** 本地路径 / 裸路径 / 完整 URL → 站内规范 URL（clean URL：去 `.html`，`index` → `/`）。 */
export function toCanonicalUrl(input) {
  const raw = String(input).trim();
  if (/^https?:\/\//i.test(raw)) {
    const u = new URL(raw);
    if (u.host !== HOST) throw new CollectError(`URL 不属于 ${HOST}：${raw}`);
    return ORIGIN + u.pathname.replace(/\.html$/, '').replace(/\/index$/, '/');
  }
  const p = raw.replaceAll('\\', '/').replace(/^\.?\//, '').replace(/\.html$/, '');
  if (p === '' || p === 'index') return `${ORIGIN}/`;
  return `${ORIGIN}/${p}`;
}

/**
 * 收集待提交 URL。参数语义与 CLI 一致（已剔除 --dry-run / -v / --sitemap）。
 * 抛出 CollectError 而不是直接 exit，便于预检脚本复用同一套解析逻辑。
 */
export function collectUrls(args = []) {
  if (args[0] === '--urls') {
    const list = (args[1] || '').split(',').map((s) => s.trim()).filter(Boolean);
    if (list.length === 0) throw new CollectError('--urls 需要一个逗号分隔的路径/URL 列表');
    return list.map(toCanonicalUrl);
  }

  if (args[0] === '--changed') {
    const ref = args[1];
    if (!ref) throw new CollectError('--changed 需要 git 基准 ref，如 --changed HEAD~1');
    const r = spawnSync('git', ['diff', '--name-only', `${ref}..HEAD`], { encoding: 'utf8', cwd: REPO_ROOT });
    if (r.error || r.status !== 0) {
      throw new CollectError(
        `无法运行 git diff（${r.error ? r.error.code : 'exit ' + r.status}）`,
        4,
        `手动方式：把改动页列表传给 --urls，或在本机 shell 直接跑：\n    git diff --name-only ${ref}..HEAD | grep '\\.html$'`,
      );
    }
    return r.stdout.split('\n').filter((f) => f.endsWith('.html'))
      .map((f) => `${ORIGIN}/${f.replace(/\.html$/, '')}`);
  }

  // 默认（`--sitemap` 等价）：sitemap.xml 全量
  return sitemapUrls();
}

/** sitemap.xml 中的 URL 原文列表（不做规范化，供预检做集合比对）。 */
export function sitemapUrls() {
  const xml = readFileSync(SITEMAP_PATH, 'utf8');
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1].trim());
}

/* ── CLI ─────────────────────────────────────────────────────────────────── */
const FLAGS = new Set(['--dry-run', '-v', '--sitemap']);

function isMain() {
  const entry = process.argv[1];
  if (!entry) return false;
  const a = path.resolve(entry);
  const b = fileURLToPath(import.meta.url);
  return process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b;
}

async function main() {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes('--dry-run');
  const verbose = argv.includes('-v');

  let urls;
  try {
    urls = [...new Set(collectUrls(argv.filter((a) => !FLAGS.has(a))))].sort();
  } catch (e) {
    console.error(`[indexnow] ${e.message}`);
    if (e.hint) console.error(`  ${e.hint}`);
    process.exit(e.exitCode ?? 1);
  }

  if (urls.length === 0) { console.log('[indexnow] 没有要提交的 URL，退出。'); return; }
  if (urls.length > MAX_URLS) {
    console.error(`[indexnow] ${urls.length} 条超单次上限 ${MAX_URLS}，需分批。`);
    process.exit(1);
  }

  const payload = { host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: urls };

  if (dryRun) {
    console.log(`[indexnow] dry-run：${urls.length} 条 URL，未提交。`);
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log(`[indexnow] 提交 ${urls.length} 条 URL -> ${ENDPOINT}`);
  if (verbose) console.log(urls.join('\n'));

  const hints = {
    400: '报文无效（检查 JSON）',
    403: 'key 无效（key 文件内容/位置是否正确）',
    422: 'URL 不属于提交的 host，或 key 文件尚未在线可取',
    429: '提交过于频繁，稍后再试',
  };

  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error('[indexnow] 网络失败：', e.message);
    process.exit(3);
  }

  const text = await res.text().catch(() => '');
  const hint = hints[res.status] ? ` — ${hints[res.status]}` : '';
  console.log(`[indexnow] HTTP ${res.status}${res.statusText ? ' ' + res.statusText : ''}${hint}`);
  if (text) console.log(text.slice(0, 400));

  if (res.status === 200 || res.status === 202) {
    console.log('[indexnow] 已受理。Bing 通常数分钟~数小时内抓取；Yandex/Seznam/Naver 各自排队。');
    return;
  }
  process.exit(2);
}

if (isMain()) await main();
