/**
 * HTML → Markdown（无依赖，纯函数）
 *
 * 用途：Markdown for Agents —— 当 AI 智能体用 `Accept: text/markdown` 请求页面时，
 * 由 worker/index.js 在边缘调用本模块，把 HTML 就地转成 markdown 返回。
 *
 * 为什么在边缘做、而不是构建期产出 .md 文件：
 *   1. 不产生第二个 URL → 没有重复内容的 SEO 风险，也不用动 sitemap
 *   2. 不往 dist 里塞上千个 .md → 部署体积与构建时长都不变
 *   3. 一个实现覆盖全部页面（含以后新增的），无需每页产出步骤
 *   AI 爬虫请求量低，这点 CPU 成本可忽略。
 *
 * 设计原则：**只输出正文**。导航、页头页脚、左右侧栏、目录、面包屑一律剥掉——
 * 智能体要的是内容，不是页面外壳。这是引用准确率的关键。
 */

const DEFAULT_BASE = 'https://mysticdo.com/';

/** 全文丢弃（含子树） */
const DROP_ALWAYS = new Set([
  'script', 'style', 'noscript', 'svg', 'iframe', 'object', 'embed',
  'template', 'canvas', 'map', 'audio', 'video', 'form', 'input',
  'select', 'textarea', 'button', 'link', 'meta', 'base', 'title', 'dialog',
]);

/** 提取正文后额外丢弃（页面外壳） */
const DROP_IN_MAIN = new Set(['aside', 'nav', 'header', 'footer']);

/** 按 class/id 命中的导航性元素 */
const DROP_BY_CLASS = /\b(toc|table-of-contents|breadcrumb|breadcrumbs|skip-link|sr-only|visually-hidden|screen-reader|pagination|social-share|share-bar|back-to-top|newsletter|search-form)\b/i;

/** 空元素：永远不会闭合，绝不能压栈（否则丢弃计数会被永久污染） */
const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr']);

const BLOCK_TAGS = new Set(['p', 'div', 'section', 'article', 'main', 'h1', 'h2', 'h3',
  'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'pre', 'table', 'thead', 'tbody',
  'tfoot', 'tr', 'th', 'td', 'hr', 'details', 'summary', 'figure', 'figcaption',
  'dl', 'dt', 'dd', 'address', 'fieldset']);

const ENTITIES = {
  // 基础
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'",
  // 空白类
  nbsp: ' ', ensp: ' ', emsp: ' ', thinsp: ' ', zwnj: '', zwj: '', shy: '',
  // 标点与引号
  hellip: '…', mdash: '—', ndash: '–', middot: '·', bull: '•', dagger: '†',
  lsquo: '\u2018', rsquo: '\u2019', ldquo: '\u201c', rdquo: '\u201d',
  sbquo: '‚', bdquo: '„', lsaquo: '‹', rsaquo: '›',
  laquo: '«', raquo: '»', prime: '′', Prime: '″', permil: '‰',
  sect: '§', para: '¶', brvbar: '¦', uml: '¨', macr: '¯', acute: '´',
  cedil: '¸', oline: '‾', iexcl: '¡', iquest: '¿', not: '¬',
  // 符号
  trade: '™', reg: '®', copy: '©', deg: '°', times: '×', divide: '÷',
  plusmn: '±', infin: '∞', micro: 'µ', oelig: 'œ',
  // 货币
  euro: '€', pound: '£', yen: '¥', cent: '¢', curren: '¤',
  // 分数与上标
  frac12: '½', frac14: '¼', frac34: '¾', sup1: '¹', sup2: '²', sup3: '³',
  ordf: 'ª', ordm: 'º',
  // 箭头 —— 本站 CTA 文案大量使用（"Get 3 Mins Free →"）。
  // 若正文源里写成实体形式，不解码就会在 markdown 里露出 &rarr; 这种噪声。
  rarr: '→', larr: '←', uarr: '↑', darr: '↓', harr: '↔',
  rArr: '⇒', lArr: '⇐', hArr: '⇔',
  // 勾叉星心
  check: '✓', cross: '✗', star: '★', hearts: '♥',
};

export function decodeEntities(s) {
  const str = String(s);
  // 快速路径：绝大多数文本里没有 & —— 省掉一次全量正则扫描。
  // 这个函数在每个文本节点与每个属性值上都会被调用，是热点。
  if (str.indexOf('&') === -1) return str;
  return str.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);/g, (m, body) => {
    if (body[0] === '#') {
      const code = (body[1] === 'x' || body[1] === 'X')
        ? parseInt(body.slice(2), 16)
        : parseInt(body.slice(1), 10);
      return (Number.isFinite(code) && code > 0 && code <= 0x10ffff) ? String.fromCodePoint(code) : m;
    }
    const v = ENTITIES[body.toLowerCase()];
    return v === undefined ? m : v;
  });
}

/** 取出标签名（小写）。手工扫描代替正则 —— 每个 token 都要调一次，是热点 */
function tagName(tag) {
  let i = 1;
  if (tag.charCodeAt(1) === 47) i = 2;              // '/'
  const start = i;
  const n = tag.length;
  while (i < n) {
    const c = tag.charCodeAt(i);
    if ((c >= 97 && c <= 122) || (c >= 65 && c <= 90) ||      // a-z A-Z
        (c >= 48 && c <= 57) || c === 45) {                    // 0-9 -
      i++;
    } else break;
  }
  return i > start ? tag.slice(start, i).toLowerCase() : '';
}

const NUL_RE = /\u0000\s*/g;
const EMPTY_HEADING_RE = /^#{1,6}\s+$/;

/**
 * 属性正则缓存。
 * 早期版本在 attr() 里每次 new RegExp(...) —— 每个标签要跑 2~3 次，
 * 一个 290KB 页面会产生几十万次正则编译，直接把转换耗时推到 33ms
 * （Workers 免费版 CPU 上限只有 10ms）。缓存后这部分开销基本消失。
 */
const ATTR_RE = new Map();
function attrRe(name) {
  let re = ATTR_RE.get(name);
  if (!re) {
    // 用「前置空白」而不是 \b 来定位属性名：\bid\b 会把 data-page-node-id
    // 里的 id 误认成 id 属性（站点上的标签普遍带 data-page-node-id）。
    re = new RegExp('[\\s]' + name + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))', 'i');
    ATTR_RE.set(name, re);
  }
  return re;
}

function attr(tag, name) {
  const m = tag.match(attrRe(name));
  if (!m) return '';
  return decodeEntities(m[1] !== undefined ? m[1] : (m[2] !== undefined ? m[2] : m[3] || ''));
}

/** 是否该丢弃这个元素（含子树） */
function isDroppable(tag, extraDropSet) {
  const name = tagName(tag);
  if (DROP_ALWAYS.has(name)) return true;
  if (extraDropSet && extraDropSet.has(name)) return true;
  // 快速路径：标签里既没有 class 也没有 id/aria-hidden 就直接放行。
  // 这是最热的判断点之一，省掉两次正则扫描。
  if (tag.indexOf('class') === -1 && tag.indexOf('id=') === -1 && tag.indexOf('aria-hidden') === -1) {
    return false;
  }
  const cls = attr(tag, 'class') + ' ' + attr(tag, 'id');
  if (cls.trim() && DROP_BY_CLASS.test(cls)) return true;
  // aria-hidden 只用于装饰元素时才丢，避免误删被标记的正文
  if (/aria-hidden\s*=\s*"?true/i.test(tag)) {
    if (name === 'svg' || name === 'img' || name === 'i') return true;
  }
  return false;
}

/** 切成 token，属性里的 > 不会误切 */
function tokenize(html) {
  return html.match(/<(?:[^>"']|"[^"]*"|'[^']*')*>|[^<]+/g) || [];
}

/**
 * 分词前必须先切掉 script / style / 注释。
 *
 * 这不是优化，是**正确性前提**：内联 JS 里常有 `a < b` 这类比较运算符、
 * 或字符串里的 '</div>'，分词器会把它们当成标签，把标签栈彻底搞乱，
 * 进而让"是否处于被丢弃子树"的判断永久失效、整页输出变空。
 * 2026-09-10 在 /comparisons/ 页上实测就是这个原因。
 *
 * 只切这三类。试过再加 svg/button/form 等正则，结果**更慢** ——
 * 多几遍全量正则扫描的开销超过了省下的分词量；而它们在逐 token 阶段
 * 本来就会被整棵丢弃，语义上不需要提前切。
 */
function stripRawBlocks(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    // <svg> 是纯装饰图标，站点上每个顾问卡片都带若干 —— 实测占页面体积约 7%、
    // 却是 token 里最密集的部分。整段切掉后转换耗时降约 26%（有测量支撑）。
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');
}

/**
 * 提取正文：优先 <main>，剥掉其中的 aside/nav/header/footer，
 * 再按 class 规则剥掉导航性元素。无 <main> 时退化为 <body>。
 *
 * ⚡ 性能关键：先用一次廉价正则把 <main> 段切出来，**只对这一段**做分词。
 * 整页分词会白跑 head / nav / footer 的大量 token —— 一个 290KB 页面里
 * 其中一半以上是我们根本不要的外壳。Workers 免费版 CPU 上限 10ms，
 * 这个先后顺序的差别是决定性的。
 */
export function extractMain(htmlRaw) {
  let scope = htmlRaw;
  const mm = htmlRaw.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (mm) {
    scope = mm[1];
  } else {
    const bm = htmlRaw.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (bm) scope = bm[1];
  }
  scope = stripRawBlocks(scope);

  const keep = [];
  const stack = [];
  // 是否处于被丢弃子树内。用计数器（O(1)）而不是 stack.some()（O(栈深)）——
  // 这是个热路径，Cloudflare Workers 免费版只有 10ms CPU，必须省。
  // 计数器唯一的风险是"弹出时漏减"，所以下面弹栈时会把被移除的丢弃帧一并数清。
  let skipCount = 0;
  const inSkip = () => skipCount > 0;

  for (const tok of tokenize(scope)) {
    if (tok[0] !== '<') {
      if (!inSkip()) keep.push(tok);
      continue;
    }
    const closing = tok[1] === '/';
    const name = tagName(tok);
    if (!name) continue;
    const isVoid = VOID_TAGS.has(name) || tok.endsWith('/>');

    if (closing) {
      if (!isVoid) {
        let idx = -1;
        for (let i = stack.length - 1; i >= 0; i--) if (stack[i].name === name) { idx = i; break; }
        if (idx > -1) {
          for (let i = stack.length - 1; i >= idx; i--) if (stack[i].skip) skipCount--;
          stack.length = idx;
          if (!inSkip()) keep.push(tok);
        }
        // 找不到匹配的开标签 → 无视这个错位闭合标签（不弹栈，避免误伤已记的丢弃帧）
      }
      continue;
    }

    if (isVoid) {
      if (!inSkip() && !isDroppable(tok, DROP_IN_MAIN)) keep.push(tok);
      continue;
    }

    const droppable = inSkip() || isDroppable(tok, DROP_IN_MAIN);
    stack.push({ name, skip: droppable });
    if (droppable) skipCount++; else keep.push(tok);
  }
  return keep.join('');
}

function absolutize(href, base) {
  if (!href) return '';
  if (/^(https?:|mailto:|tel:|#)/i.test(href)) return href;
  try { return new URL(href, base).toString(); } catch { return href; }
}

/**
 * 正文 HTML → Markdown
 *
 * 主循环分两步，顺序不能颠倒：
 *   ① 记账：把开/闭标签压栈弹栈，维护 skip 深度（丢弃子树），空元素不压栈
 *   ② 渲染：显式处理每一种元素的开与闭
 * 早期版本把闭合标签交给通用分支 continue 掉了，导致行内闭合标记（** 、](url)）
 * 永远不会输出 —— 这是必须避免的结构性错误。
 *
 * @param {string} html 已提取的正文
 * @param {{base?:string}} opts base 用于补绝对 URL
 */
export function htmlToMarkdown(htmlRaw, opts = {}) {
  const base = opts.base || DEFAULT_BASE;
  // convertPage 传进来的内容已经经过 extractMain（内含 stripRawBlocks），
  // 这里不要再切一遍 —— 早期版本重复执行，白白多跑三遍全量正则。
  const html = opts.stripped ? String(htmlRaw) : stripRawBlocks(htmlRaw);

  const lines = [];
  let cur = '';
  let pendingHref = '';
  let inHeading = false;
  const stack = [];
  let preDepth = 0;
  let preBuf = '';
  let quoteDepth = 0;
  const listStack = [];
  let table = null;
  let row = null;
  let inCell = false;
  let cellBuf = '';

  /** 是否处于被丢弃的子树内 —— 计数器 O(1)，热路径必须省 CPU */
  let skipCount = 0;
  const inSkip = () => skipCount > 0;

  const emit = (s) => { if (inCell) cellBuf += s; else cur += s; };
  const flush = () => {
    const t = cur.replace(/[ \t]+/g, ' ').trim();
    cur = '';
    if (!t) return;
    lines.push(quoteDepth > 0 ? t.split('\n').map((x) => '> ' + x).join('\n') : t);
  };
  const blank = () => { if (lines.length && lines[lines.length - 1] !== '') lines.push(''); };
  const heading = (n) => { flush(); cur = '#'.repeat(n) + '\u0000'; };

  function flushTable() {
    const t = table; table = null; row = null; inCell = false; cellBuf = '';
    if (!t || !t.rows.length) return;
    const rows = t.rows.filter((r) => r.length);
    if (!rows.length) return;
    const cols = Math.max(...rows.map((r) => r.length));
    const norm = rows.map((r) => { const c = r.slice(); while (c.length < cols) c.push(''); return c; });
    const esc = (s) => String(s).replace(/\|/g, '\\|').trim();
    blank();
    lines.push('| ' + norm[0].map(esc).join(' | ') + ' |');
    lines.push('| ' + norm[0].map(() => '---').join(' | ') + ' |');
    for (let i = 1; i < norm.length; i++) lines.push('| ' + norm[i].map(esc).join(' | ') + ' |');
    blank();
  }

  function pushCode(raw) {
    const code = decodeEntities(String(raw).replace(/<[^>]+>/g, '')).replace(/^\n+|\n+$/g, '');
    if (!code.trim()) return;
    blank();
    const fence = code.includes('```') ? '~~~~' : '```';
    lines.push(fence);
    for (const l of code.split('\n')) lines.push(l);
    lines.push(fence);
    blank();
  }

  // 行内元素的闭合标记
  const INLINE_OPEN = {
    strong: '**', b: '**', em: '*', i: '*', del: '~~', s: '~~', code: '`', q: '"',
  };

  /**
   * 常见的"透明"标签：只需在闭合时收尾一行，没有别的语义。
   * div / span 是页面上最密集的标签（占 token 的多数），
   * 若让它们走完整条 if 链要比较二十多次才落到末尾 —— 分阶段剖析显示
   * 渲染循环是绝对瓶颈（占全流程 78%），所以给它们一条快速通道。
   */
  const TRANSPARENT_TAGS = new Set([
    'div', 'span', 'section', 'article', 'main', 'figure', 'figcaption',
    'dl', 'dt', 'dd', 'abbr', 'mark', 'time', 'cite', 'small', 'sub', 'sup',
    'u', 'label', 'picture', 'source', 'noscript', 'template', 'address',
    'fieldset', 'legend', 'thead', 'tbody', 'tfoot', 'colgroup',
  ]);
  // 这些作为块级容器，闭合时要把已累积的一行收尾，避免多段文字连成一行。
  // 必须是旧逻辑里真正会走到末尾 flush 的那些标签 —— 漏一个就会把两段文字连成一行。
  // （表格内部的 thead/tbody/tfoot/colgroup 不算：它们在旧逻辑里被表格分支提前拦掉了，
  //   所以这里也不能 flush。）
  const FLUSH_ON_CLOSE = new Set([
    'div', 'section', 'article', 'main', 'figure', 'figcaption',
    'dl', 'dt', 'dd', 'address', 'fieldset', 'legend',
  ]);

  for (const tok of tokenize(html)) {
    // ── 文本 ────────────────────────────────────────────────────────
    if (tok[0] !== '<') {
      if (inSkip()) continue;
      if (preDepth) { preBuf += tok; continue; }
      emit(decodeEntities(tok).replace(/\s+/g, ' '));
      continue;
    }

    const closing = tok[1] === '/';
    const name = tagName(tok);
    if (!name) continue;
    if (preDepth) {
      if (name === 'pre' && closing) { preDepth = 0; pushCode(preBuf); preBuf = ''; }
      else if (name !== 'code') { preBuf += tok; }
      continue;
    }
    const isVoid = VOID_TAGS.has(name) || tok.endsWith('/>');

    // ── ① 记账（计数器 O(1)；弹栈时把移除的丢弃帧一并减掉，避免泄漏）──
    if (closing) {
      if (!isVoid) {
        let idx = -1;
        for (let i = stack.length - 1; i >= 0; i--) if (stack[i].name === name) { idx = i; break; }
        if (idx > -1) {
          const wasSkip = stack[idx].skip;
          for (let i = stack.length - 1; i >= idx; i--) if (stack[i].skip) skipCount--;
          stack.length = idx;
          if (wasSkip) continue;          // 被丢弃元素的闭合标签，不渲染
        } else {
          continue;                        // 错位闭合标签：无视，避免误弹出丢弃帧
        }
      }
    } else if (!isVoid) {
      const droppable = inSkip() || isDroppable(tok);
      stack.push({ name, skip: droppable });
      if (droppable) { skipCount++; continue; }
    }
    if (inSkip()) continue;                // 位于被丢弃子树内，任何渲染都跳过

    // ── ② 渲染 ──────────────────────────────────────────────────────
    // 快速通道：最常见的透明标签不必走完整条判断链
    if (TRANSPARENT_TAGS.has(name)) {
      if (closing && FLUSH_ON_CLOSE.has(name)) flush();
      continue;
    }

    // 表格：单元格内的行内元素要放行，否则格子里的链接会丢 href
    if (name === 'table') { closing ? flushTable() : (flush(), table = { rows: [] }); continue; }
    if (table) {
      if (name === 'tr') { closing ? (row && table.rows.push(row), row = null) : (row = []); continue; }
      if (name === 'td' || name === 'th') {
        if (closing) { inCell = false; if (row) row.push(cellBuf.replace(/\s+/g, ' ').trim()); cellBuf = ''; }
        else { inCell = true; cellBuf = ''; }
        continue;
      }
      if (!(name === 'a' || name === 'img' || name === 'br' || INLINE_OPEN[name])) continue;
      // 行内元素继续往下走，内容写进 cellBuf
    }

    // 列表
    if (name === 'ul' || name === 'ol') {
      if (closing) { flush(); listStack.pop(); blank(); }
      else { flush(); listStack.push({ ordered: name === 'ol' }); }
      continue;
    }
    if (name === 'li') {
      if (closing) { flush(); }
      else {
        flush();
        const depth = Math.max(0, listStack.length - 1);
        const top = listStack[listStack.length - 1];
        cur = '  '.repeat(depth) + (top && top.ordered ? '1. ' : '- ');
      }
      continue;
    }

    // 引用 / 代码块 / FAQ
    if (name === 'blockquote') { flush(); quoteDepth = closing ? Math.max(0, quoteDepth - 1) : quoteDepth + 1; if (closing) blank(); continue; }
    if (name === 'pre') { if (closing) { flush(); } else { flush(); preDepth = 1; preBuf = ''; } continue; }
    if (name === 'summary') { flush(); cur = closing ? '' : '**'; if (closing) { emit('**'); flush(); blank(); } continue; }
    if (name === 'details') { blank(); continue; }

    // 标题
    if (/^h[1-6]$/.test(name)) {
      if (closing) { inHeading = false; flush(); blank(); }
      else { heading(Number(name[1])); inHeading = true; }
      continue;
    }

    // 段落 / 分隔线 / 换行
    if (name === 'p') { if (closing) { flush(); blank(); } continue; }
    if (name === 'hr') { flush(); blank(); lines.push('---'); blank(); continue; }
    // 标题里的 <br> 要变空格：否则会把 "Finding Clarity in <br> Online…" 劈成两行，
    // 标题被截断且与 h1 去重失效（首页实测过）
    if (name === 'br') { emit(inHeading ? ' ' : '  \n'); continue; }

    // 行内
    if (name === 'a') {
      if (closing) { emit('](' + pendingHref + ')'); pendingHref = ''; }
      else { pendingHref = absolutize(attr(tok, 'href'), base); emit('['); }
      continue;
    }
    if (name === 'img') {
      const src = absolutize(attr(tok, 'src'), base);
      const alt = attr(tok, 'alt').replace(/\s+/g, ' ').trim();
      if (src) emit('![' + alt + '](' + src + ')');
      continue;
    }
    if (INLINE_OPEN[name]) { emit(INLINE_OPEN[name]); continue; }

    // 容器类闭标签：把已累积的一行收尾，避免多个 div 的文字连成一行
    if (closing && BLOCK_TAGS.has(name)) flush();
  }

  if (preDepth && preBuf) pushCode(preBuf);
  flushTable();
  flush();

  return lines
    .map((l) => l.charCodeAt(0) === 35 || l.indexOf('\u0000') > -1 ? l.replace(NUL_RE, ' ').replace(EMPTY_HEADING_RE, '') : l)
    .join('\n')
    .trim();
}

/**
 * 顶层入口：整页 HTML → 可直接返回给智能体的 markdown
 * @param {string} html
 * @param {{url?:string,title?:string}} opts
 */
export function convertPage(html, opts = {}) {
  const url = opts.url || '';
  const main = extractMain(html);

  let title = (opts.title || '').trim();
  if (!title) {
    const h1 = main.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    // 标签替换成**空格**而不是空串：`<h1>A.<br><span>B.</span></h1>` 若直接删标签
    // 会得到 "A.B."（单词粘连），既读起来是错的，也会让下面"去掉重复 h1"的匹配失败，
    // 于是同一个标题在正文里出现两次。换成空格后与正文渲染结果一致，去重才生效。
    if (h1) title = decodeEntities(h1[1].replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
  }
  if (!title) {
    const t = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (t) title = decodeEntities(t[1]).replace(/\s+/g, ' ').trim();
  }

  const body = htmlToMarkdown(main, { base: url || DEFAULT_BASE, stripped: true });

  // 正文里通常已经有一个同名 h1，避免重复
  let bodyOut = body;
  if (title) {
    const esc = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    bodyOut = body.replace(new RegExp('^#\\s+' + esc + '\\s*\\n+', 'm'), '');
  }

  const parts = [];
  if (title) parts.push('# ' + title, '');
  if (url) parts.push('> Source: ' + url, '');
  parts.push(bodyOut);

  const markdown = parts.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
  const words = markdown.split(/\s+/).filter(Boolean).length;
  return { markdown, title, words, bytes: markdown.length };
}

export default { convertPage, htmlToMarkdown, extractMain, decodeEntities };
