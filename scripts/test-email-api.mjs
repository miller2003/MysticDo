#!/usr/bin/env node
/**
 * MysticDo — 邮件接口测试（/api/subscribe 与 /api/contact）
 *
 * 跑的是真实的 Worker（worker/index.js），只把两样东西换掉：
 *   · globalThis.fetch —— 拦下发往 connect.mailerlite.com 的请求，
 *     让我们能断言"发出去的到底是什么"并模拟上游的各种响应；
 *   · env.CONTACT_EMAIL  —— 一个记录调用的 send_email binding 替身。
 *
 * 用法：node scripts/test-email-api.mjs
 * 退出码：0 全过 · 1 有失败
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://mysticdo.com';

const worker = (await import(new URL('../worker/index.js', import.meta.url).href)).default;

/* ══════════════ 上游 fetch 替身 ══════════════ */

let upstreamCalls = [];
let upstreamQueue = [];

const realFetch = globalThis.fetch;
globalThis.fetch = async (url, init) => {
  const u = String(url);
  if (u.includes('connect.mailerlite.com')) {
    upstreamCalls.push({ url: u, init });
    const preset = upstreamQueue.shift();
    if (preset) return preset();
    return new Response(JSON.stringify({ data: { id: 'fake-subscriber-id' } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return realFetch(url, init);
};

/* ══════════════ env 替身 ══════════════ */

const ASSETS = {
  async fetch() {
    return new Response('<!doctype html><h1>home</h1>', {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  },
};

let sentMail = [];
const CONTACT_BINDING = {
  async send(msg) {
    sentMail.push(msg);
  },
};

function baseEnv(extra = {}) {
  return { ASSETS, ...extra };
}

/* ══════════════ 微型测试框架 ══════════════ */

const results = [];
let group_ = '';

function group(name) {
  group_ = name;
}

function check(name, condition, detail) {
  results.push({ group: group_, name, ok: Boolean(condition), detail });
}

async function post(pathname, body, extraHeaders = {}) {
  const init = { method: 'POST', headers: { 'Content-Type': 'application/json', ...extraHeaders } };
  if (typeof body === 'string') init.body = body;
  else if (body !== undefined) init.body = JSON.stringify(body);
  const res = await worker.fetch(new Request(ORIGIN + pathname, init), baseEnv());
  return res;
}

async function postEnv(pathname, body, env) {
  const res = await worker.fetch(
    new Request(ORIGIN + pathname, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
    env,
  );
  return res;
}

async function get(pathname) {
  return worker.fetch(new Request(ORIGIN + pathname), baseEnv());
}

/* ══════════════ 1. 订阅接口 ══════════════ */

group('subscribe — 方法与输入校验');
{
  const r = await get('/api/subscribe');
  check('GET /api/subscribe → 405', r.status === 405, `status=${r.status}`);

  const r2 = await post('/api/subscribe', {});
  const j2 = await r2.json();
  check('缺 email → 400 invalid_email', r2.status === 400 && j2.error === 'invalid_email', JSON.stringify(j2));

  const r3 = await post('/api/subscribe', { email: 'not-an-email' });
  const j3 = await r3.json();
  check('非法 email → 400 invalid_email', r3.status === 400 && j3.error === 'invalid_email');

  const r4 = await post('/api/subscribe', 'not json at all');
  const j4 = await r4.json();
  check('非 JSON body → 400 invalid_body', r4.status === 400 && j4.error === 'invalid_body', JSON.stringify(j4));
}

group('subscribe — 未配置密钥时优雅降级');
{
  upstreamCalls = [];
  const r = await post('/api/subscribe', { email: 'visitor@example.com' });
  const j = await r.json();
  check('无 MAILERLITE_API_KEY → 503 not_configured', r.status === 503 && j.error === 'not_configured', JSON.stringify(j));
  check('未配置时不会调用上游', upstreamCalls.length === 0, `calls=${upstreamCalls.length}`);
}

group('subscribe — 正常路径');
{
  upstreamCalls = [];
  upstreamQueue = [];
  const env = baseEnv({ MAILERLITE_API_KEY: 'test-token-abc', MAILERLITE_GROUP_ID: '987654321' });
  const r = await postEnv('/api/subscribe', { email: 'visitor@example.com', source: 'email-form' }, env);
  const j = await r.json();
  check('合法订阅 → 200 subscribed:true', r.status === 200 && j.ok === true && j.subscribed === true, JSON.stringify(j));
  check('上游被调用一次', upstreamCalls.length === 1, `calls=${upstreamCalls.length}`);

  if (upstreamCalls.length) {
    const call = upstreamCalls[0];
    const sent = JSON.parse(call.init.body);
    check('上游 URL 正确', call.url === 'https://connect.mailerlite.com/api/subscribers', call.url);
    check('Authorization 用 Bearer token', (call.init.headers.Authorization || '') === 'Bearer test-token-abc', call.init.headers.Authorization);
    check('body 带 email', sent.email === 'visitor@example.com', JSON.stringify(sent));
    check('body 带 group', Array.isArray(sent.groups) && sent.groups[0] === '987654321', JSON.stringify(sent.groups));
    check('未要求自定义字段时不发 fields', sent.fields === undefined, JSON.stringify(sent.fields));
  }
}

group('subscribe — 自定义字段缺失时自动重试');
{
  upstreamCalls = [];
  upstreamQueue = [
    () => new Response(JSON.stringify({ message: 'field does not exist' }), { status: 422 }),
    () => new Response(JSON.stringify({ data: { id: 'retry-ok' } }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
  ];
  const env = baseEnv({ MAILERLITE_API_KEY: 'test-token-abc' });
  const r = await postEnv('/api/subscribe', { email: 'visitor@example.com', intent: 'love', format: 'tarot' }, env);
  const j = await r.json();
  check('422 后重试仍成功', r.status === 200 && j.subscribed === true, JSON.stringify(j));
  check('上游被调用两次', upstreamCalls.length === 2, `calls=${upstreamCalls.length}`);
  if (upstreamCalls.length === 2) {
    const first = JSON.parse(upstreamCalls[0].init.body);
    const second = JSON.parse(upstreamCalls[1].init.body);
    check('第一次带 fields', first.fields && first.fields.intent === 'love', JSON.stringify(first.fields));
    check('重试时不带 fields', second.fields === undefined, JSON.stringify(second.fields));
    check('重试仍保留 email', second.email === 'visitor@example.com');
  }
}

group('subscribe — 上游故障');
{
  upstreamCalls = [];
  upstreamQueue = [() => new Response('boom', { status: 500 })];
  const env = baseEnv({ MAILERLITE_API_KEY: 'test-token-abc' });
  const r = await postEnv('/api/subscribe', { email: 'visitor@example.com' }, env);
  const j = await r.json();
  check('上游 500 → 502 upstream_error', r.status === 502 && j.error === 'upstream_error', JSON.stringify(j));
}

group('subscribe — 蜜罐与体积限制');
{
  upstreamCalls = [];
  const env = baseEnv({ MAILERLITE_API_KEY: 'test-token-abc' });
  const r = await postEnv('/api/subscribe', { email: 'bot@example.com', company: 'Spam Inc' }, env);
  const j = await r.json();
  check('蜜罐命中 → 假装成功', r.status === 200 && j.ok === true && j.subscribed === false, JSON.stringify(j));
  check('蜜罐不触碰上游', upstreamCalls.length === 0, `calls=${upstreamCalls.length}`);

  const big = JSON.stringify({ email: 'a@b.com', pad: 'x'.repeat(20000) });
  const r2 = await post('/api/subscribe', big, { 'Content-Length': String(big.length) });
  const j2 = await r2.json();
  check('超大 body → 413', r2.status === 413 && j2.error === 'payload_too_large', `status=${r2.status}`);
}

/* ══════════════ 2. 联系接口 ══════════════ */

group('contact — 方法与输入校验');
{
  const r = await get('/api/contact');
  check('GET /api/contact → 405', r.status === 405, `status=${r.status}`);

  const r2 = await post('/api/contact', { email: 'a@b.com', message: 'hi' });
  const j2 = await r2.json();
  check('过短留言 → 400 message_too_short', r2.status === 400 && j2.error === 'message_too_short', JSON.stringify(j2));

  const r3 = await post('/api/contact', { email: 'bad', message: 'enough text here' });
  const j3 = await r3.json();
  check('非法 email → 400 invalid_email', r3.status === 400 && j3.error === 'invalid_email');
}

group('contact — 未配置 binding 时诚实降级');
{
  const r = await post('/api/contact', { email: 'visitor@example.com', message: 'A real message about pricing.' });
  const j = await r.json();
  check('未配 binding → 200 delivered:false', r.status === 200 && j.ok === true && j.delivered === false, JSON.stringify(j));
  check('降级原因标为 not_configured', j.reason === 'not_configured', JSON.stringify(j));
}

group('contact — 正常路径');
{
  sentMail = [];
  const env = baseEnv({
    CONTACT_EMAIL: CONTACT_BINDING,
    CONTACT_TO: 'owner@mysticdo.com',
    CONTACT_FROM: 'noreply@mysticdo.com',
  });
  const r = await postEnv(
    '/api/contact',
    {
      name: 'Jane',
      email: 'jane@example.com',
      type: 'Correction / outdated info',
      message: 'The psychic reading cost page lists $1–$15/min.',
      page: '/psychic/',
    },
    env,
  );
  const j = await r.json();
  check('配置齐全 → 200 delivered:true', r.status === 200 && j.delivered === true, JSON.stringify(j));
  check('binding 收到一封邮件', sentMail.length === 1, `count=${sentMail.length}`);
  if (sentMail.length) {
    const m = sentMail[0];
    check('收件人 = CONTACT_TO', m.to === 'owner@mysticdo.com', m.to);
    check('发件人取自 CONTACT_FROM', m.from && m.from.email === 'noreply@mysticdo.com', JSON.stringify(m.from));
    check('replyTo 指向访客', m.replyTo === 'jane@example.com', m.replyTo);
    check('主题含表单类型', String(m.subject).includes('Correction'), m.subject);
    check('正文包含留言原文', String(m.text).includes('$1–$15/min'), 'missing body');
    check('正文包含来源页面', String(m.text).includes('/psychic/'), 'missing page');
    check('正文不含控制字符', !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(String(m.text)));
  }
}

group('contact — 发信失败与蜜罐');
{
  sentMail = [];
  const failing = {
    async send() {
      throw new Error('binding unavailable');
    },
  };
  const env = baseEnv({ CONTACT_EMAIL: failing, CONTACT_TO: 'owner@mysticdo.com' });
  const r = await postEnv('/api/contact', { email: 'jane@example.com', message: 'A real message here.' }, env);
  const j = await r.json();
  check('binding 抛错 → 502 send_failed', r.status === 502 && j.error === 'send_failed', JSON.stringify(j));

  sentMail = [];
  const env2 = baseEnv({ CONTACT_EMAIL: CONTACT_BINDING, CONTACT_TO: 'owner@mysticdo.com' });
  const r2 = await postEnv('/api/contact', { email: 'bot@example.com', message: 'buy cheap stuff now', website: 'http://spam' }, env2);
  const j2 = await r2.json();
  check('蜜罐命中 → 不发送', sentMail.length === 0 && j2.delivered !== true, JSON.stringify(j2));
}

/* ══════════════ 3. 未影响静态层 ══════════════ */

group('静态层未受影响');
{
  const r = await get('/');
  const html = await r.text();
  check('GET / 仍返回 HTML', r.status === 200 && html.includes('<h1>'), `status=${r.status}`);
  const r2 = await get('/api/nope');
  check('未知 /api/ 路径不会误吞', r2.status === 200 || r2.status === 404, `status=${r2.status}`);
}

/* ══════════════ 汇总 ══════════════ */

let lastGroup = '';
let pass = 0;
let fail = 0;
for (const r of results) {
  if (r.group !== lastGroup) {
    console.log('\n── ' + r.group + ' ─────────────────────────────');
    lastGroup = r.group;
  }
  if (r.ok) {
    pass++;
    console.log('  PASS  ' + r.name);
  } else {
    fail++;
    console.log('  FAIL  ' + r.name + (r.detail ? '\n          → ' + r.detail : ''));
  }
}
console.log('\n' + '='.repeat(66));
console.log(`  ${pass} passed, ${fail} failed, ${results.length} total`);
console.log('='.repeat(66));

process.exit(fail === 0 ? 0 : 1);
