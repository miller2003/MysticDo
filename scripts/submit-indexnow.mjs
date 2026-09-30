#!/usr/bin/env node
/**
 * submit-indexnow.mjs — IndexNow 提交器（mysticdo.com）
 *
 * 用法：
 *   node scripts/submit-indexnow.mjs                # 提交 sitemap.xml 里全部 URL（首次/全量）
 *   node scripts/submit-indexnow.mjs --changed ref  # 提交 ref..HEAD 之间改动的 HTML 页（增量）
 *   node scripts/submit-indexnow.mjs --urls a.html,b.html  # 显式指定（相对路径或完整 URL）
 *
 * IndexNow 协议：POST https://api.indexnow.org/indexnow
 *   { host, key, keyLocation, urlList }   （单次 ≤10,000 条）
 * 响应：200/202 = 已受理；400 报文错；403 key 无效；422 URL 不属于 host；429 过频。
 *
 * key 文件：根目录 `<key>.txt`（内容 = key 本体）。改 key 时必须同步改名该文件。
 */
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const HOST = 'mysticdo.com';
const ORIGIN = `https://${HOST}`;
const KEY = 'a53283218b178692862c487c88b2c2b6';
const KEY_LOCATION = `${ORIGIN}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';

const args = process.argv.slice(2);

function collectUrls() {
  if (args[0] === '--urls') {
    const raw = args[1] || '';
    return raw.split(',').map(s => s.trim()).filter(Boolean)
      .map(p => p.startsWith('http') ? p : `${ORIGIN}/${p.replace(/^\//, '')}`);
  }
  if (args[0] === '--changed') {
    const ref = args[1];
    if (!ref) { console.error('--changed 需要 git 基准 ref，如 --changed HEAD~1'); process.exit(1); }
    const out = execSync(`git diff --name-only ${ref}..HEAD`, { encoding: 'utf8' });
    return out.split('\n').filter(f => f.endsWith('.html'))
      .map(f => `${ORIGIN}/${f.replace(/\.html$/, '')}`);
  }
  // 默认：sitemap.xml 全量
  const xml = readFileSync('sitemap.xml', 'utf8');
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1].trim());
}

const urls = [...new Set(collectUrls())].sort();
if (urls.length === 0) { console.log('[indexnow] 没有要提交的 URL，退出。'); process.exit(0); }
if (urls.length > 10000) { console.error(`[indexnow] ${urls.length} 条超单次上限 10,000，需分批。`); process.exit(1); }

const body = JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: urls });

console.log(`[indexnow] 提交 ${urls.length} 条 URL -> ${ENDPOINT}`);
if (process.argv.includes('-v')) console.log(urls.join('\n'));

try {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body,
  });
  const text = await res.text().catch(() => '');
  const hints = {
    400: '报文无效（检查 JSON）',
    403: 'key 无效（key 文件内容/位置是否正确）',
    422: 'URL 不属于提交的 host，或 key 文件尚未在线可取',
    429: '提交过于频繁，稍后再试',
  };
  const hint = hints[res.status] ? ` — ${hints[res.status]}` : '';
  console.log(`[indexnow] HTTP ${res.status}${res.statusText ? ' ' + res.statusText : ''}${hint}`);
  if (text) console.log(text.slice(0, 400));
  if (res.status === 200 || res.status === 202) {
    console.log('[indexnow] 已受理。Bing 通常数分钟~数小时内抓取；Yandex/Seznam/Naver 各自排队。');
  }
  process.exit(res.status === 200 || res.status === 202 ? 0 : 2);
} catch (e) {
  console.error('[indexnow] 网络失败：', e.message);
  process.exit(3);
}
