# 上线前最终检查报告 — 2026-09-21 新增 40 篇文章

_基准：`/questions/love-relationships/does-he-love-me`（v2 母版）_
_方法：全量静态解析 + 既有门禁全跑 + 无头 Chrome 运行时渲染验证_

---

## 0. 结论（先读这段）

**写作质量：达到并在部分维度超过旗舰水准。**
**可就绪状态：不可发布。40 篇中 35 篇的核心交互是死的。**

两句话拆开说：

1. **编辑层（文案、结构、诚实纪律）= 旗舰水准，甚至更好。** 40 篇全部精确复刻母版骨架（16 个 H2 / 13 个 `<section>` / front-panel 合成带 / 3 张 cmp-table / 2 个 cta-band / breadcrumb / noscript 兜底 / key-takeaways），Direct answer 段落的诚实度与信息密度不输旗舰，禁用项（somatic 处方、"no score no verdict" 对冲串、"Read His Pattern" 模板腔）零命中。
2. **工程层 = 半成品。** 40 篇里有 35 篇挂载了一个**代码库里根本不存在的交互工具**，11 篇对搜索引擎与 AI 爬虫完全不可见，16 篇是站内孤儿页，5 个新集群中心页 404。

一个能概括全局的规律：

> **`assets/js/quizzes.js` 里是否存在该页的 quiz 对象，精确标记了这篇是否"真正完成"。**
> 有对象的 5 篇（is-he-cheating / twin-flame-separation / will-he-come-back / am-i-cursed / will-i-get-the-job）同时满足：meta 合规（标题 49–59、描述 135–147）、FAQ 8 条、正文 5,000–5,450 词（**均超过旗舰的 4,501 词**）、有配套测试脚本。
> 没有对象的 35 篇，同一个集合内同时出现 meta 超长、正文偏薄、无入链等所有问题。
>
> 也就是说：**这 5 篇是端到端做完的旗舰级页面，另外 35 篇只生成了 HTML 外壳与文案，从未接线。**

---

## 1. 检查范围与基准

### 1.1 40 篇新文章（= 今日未提交的新增内容页）

| 组 | 数量 | 文件 |
|---|---|---|
| `questions/` 决策页 | **29** | angel-numbers×4、astrology×3、career-work×2、dreams×2、life-direction×1、love-relationships×10、signs×1、spiritual-growth×5、tarot×1 |
| `guides/` 编辑页 | **11** | dark-night-of-the-soul、evil-eye-meaning、full-moon-ritual、how-to-manifest(-money)、how-to-open-your-third-eye、how-to-read-tarot、new-moon-ritual、what-are-chakras、what-are-synchronicities、what-is-shadow-work |

### 1.2 旗舰基准的客观指标（实测）

```
标题 54 字符 · 描述 147 字符 · 1 个 H1 · 16 个 H2 · 29 个 H3 · 13 个 section
FAQ 9 条 · 3 张表 · 3 个 cmp-table · 2 个 cta-band · 4 个 data-quiz-open
正文 4,501 词 · 28 条站内链接（其中 6 条同集群兄弟页）· WebApplication JSON-LD ✓
```

---

## 2. P0 — 发布阻断项（4 项）

### P0-1 ⛔ 35 / 40 篇的核心交互是死的（最高优先级）

**事实**：这 35 篇页面都挂载了 `#quiz` 容器与 4 枚金色 CTA，但 `assets/js/quizzes.js` 中只有 **11 个** quiz 对象（6 个老 love 页 + 今日新增 5 个）。其余 **35 篇请求的 quiz key 在整个代码库中不存在**——不在 `quizzes.js`，不在页面内联 `<script>`，不在任何 JSON。

**受影响页面（35 篇）**：

- **24 篇 `questions/` 决策页**：1111-meaning、222-meaning、angel-numbers-meaning、what-is-my-angel-number、mercury-retrograde-meaning、what-is-my-rising-sign、zodiac-compatibility、should-i-quit-my-job、dream-about-snakes、dream-about-teeth-falling-out、what-is-my-life-purpose、am-i-in-love、does-he-like-me、how-to-get-over-someone、should-i-break-up、should-i-text-him、when-will-i-meet-my-soulmate、who-is-my-soulmate、owl-meaning、am-i-an-empath、am-i-psychic、how-to-know-your-past-life、what-is-my-spirit-animal、death-card-meaning
- **11 篇 `guides/`**：全部（each mounts `#quiz` + 4 CTAs）

**运行时证据（无头 Chrome `--dump-dom`，JS 执行后）**：

| 页面 | `.quiz-launch` | 金徽章 | Begin 按钮 | overlay 骨架 | 启动卡标题 |
|---|---|---|---|---|---|
| does-he-love-me（旗舰） | 6 | ✓ | ✓ | ✓ | "What Are You Really Asking?" |
| does-he-like-me（新页） | **0** | **0** | **0** | **0** | **无** |

截图对比：`_design-check/shots/audit40-does-he-love-me.png`（右栏有金徽章 + 启动卡）vs `audit40-does-he-like-me.png`（右栏完全空白，只剩一行 fineprint）。

**机制**：`assets/js/main.js` `initQuiz()` 第 561–564 行

```js
var key = root.getAttribute('data-quiz') || 'general';
var Q   = window.MYSTICDO_QUIZZES[key];
if (!Q) return;                   // ← 从这里直接返回
...
updateLauncher();                 // ← 启动卡渲染（永远不会执行）
document.querySelectorAll('[data-quiz-open]').forEach(...)  // ← CTA 绑定（永远不会执行）
```

由于 `[data-quiz-open]` 的绑定在这行早退**之后**，35 篇页面上**全部 4 枚金色 CTA 都是死链**：点击只走 `href="#pattern-check"` 锚点，滚到已经所在的合成带，什么都不出现。

**四重可见症状**（不只是"按钮没反应"）：

1. 前屏合成带右栏空白（见截图）——全页最重要的转化位变成空洞。
2. 4 枚金色 CTA 点击无响应（hero + 2 个 cta-band + 说明区）。
3. **导航 CTA 未被替换**：正常意图页会把头部/抽屉 CTA 换成金色 "Begin the check"，该替换同样在早退之后 → 这 35 篇顶部仍显示默认的 "Do What Fits"（截图可见）。
4. **结构化数据说谎**：每页都注入 `WebApplication`（`@id=…#quiz`）+ Article `mentions`，宣称存在一个 "Xxx Pattern Check" 交互工具；FAQ 里还有整段描述该工具行为（"Eight questions… it runs in your browser"）。工具不存在 → 属于 Google structured-data 的 "功能不存在" 风险，同时是诚信问题。

**修复**：为 35 篇逐一按 `INTENT_PAGE_PROMPT.md` §7 工程契约补齐 quiz 对象（8 题 = 2 context + 4 signal + 2 intent；5 个 pattern；`resolve`/`underneath`/`matchPractice`/`results.suggest`/`practice`/`launchSub`），追加进 `assets/js/quizzes.js`，并各配一个 `scripts/test-<slug>-quiz.mjs` 入 `npm test` 链。
**替代方案（若来不及）**：从这 35 篇移除 `#quiz` 挂载与 4 枚 `data-quiz-open` CTA，并把 `WebApplication` / `mentions` / FAQ 中描述工具的段落一并撤下——**绝不可保留"承诺了工具但没有工具"的中间态**。

---

### P0-2 ⛔ 5 个新集群中心页 404，而被面包屑引用

实测 HTTP 状态：

```
/questions/angel-numbers/   404
/questions/astrology/       404
/questions/dreams/          404
/questions/signs/           404
/questions/tarot/           404
```

- **可见 UI 死链**：`questions/signs/owl-meaning.html` 的 hero 面包屑里是 `<a href="/questions/signs/">Signs</a>`——一个用户可见、点了就 404 的链接。11 篇新集群页都有。
- **JSON-LD 死链**：`BreadcrumbList` 的 `item` 指向同一批 404 URL（angel-numbers×4、astrology×3、dreams×2、signs×1、tarot×1）。

**修复**：为 5 个新集群各建一个 `index.html` 中心页（含该集群文章列表）+ 补 `DESCRIPTION`，或（若这些主题不打算作为独立集群）把面包屑改为指向现有 6 个集群之一。（按记忆中的约定，cluster 限原 6 个——需要你决策：新增 5 个集群是刻意的架构扩张，还是应当并入 `spiritual-growth` / `love-relationships`？）

---

### P0-3 ⛔ 11 篇未进入 sitemap / content-index / llms-full

```
未进 sitemap.xml + assets/data/content-index.json + llms-full.txt（11 篇）：
  questions/signs/owl-meaning.html
  questions/tarot/death-card-meaning.html
  questions/spiritual-growth/what-is-my-spirit-animal.html
  guides/full-moon-ritual.html
  guides/how-to-manifest-money.html
  guides/how-to-open-your-third-eye.html
  guides/how-to-read-tarot.html
  guides/new-moon-ritual.html
  guides/what-are-chakras.html
  guides/what-are-synchronicities.html
  guides/what-is-shadow-work.html
```

**根因（由 mtime 定位，非猜测）**：`sitemap.xml` 最后写入 `21:30:51`，`content-index.json` `21:30:55`，`llms-full.txt` `21:30:56`；而上述 11 篇的 mtime 全部晚于 `21:30:51`（21:34–21:49）。
→ **最后一次 `seo_inject.py` 跑完之后，又写了 11 篇页面，构建管线没有重跑。**

**修复（严格按顺序）**：

```bash
python seo_inject.py                    # 重建 canonical/OG/JSON-LD/sitemap
python scripts/build-content-index.py   # 重建 content-index.json
node scripts/build-llms-full.mjs        # 重建 llms-full.txt
```

> 先跑 P0-1 的修复再跑这条——否则会把 11 篇"承诺了不存在工具"的页面正式注册进 sitemap。

---

### P0-4 ⛔ 16 篇站内孤儿页；hub 页未收录新内容

**零入链（站内任何页面都不链接它们）——16 篇**：
angel-numbers-meaning、mercury-retrograde-meaning、what-is-my-rising-sign、am-i-in-love、should-i-break-up、should-i-text-him、when-will-i-meet-my-soulmate、what-is-my-spirit-animal、dark-night-of-the-soul、evil-eye-meaning、how-to-manifest-money、how-to-open-your-third-eye、new-moon-ritual、what-are-chakras、what-are-synchronicities、what-is-shadow-work

**中心页收录缺口**：

| hub 页 | 文件数 | hub 收录 | 缺口 |
|---|---|---|---|
| `questions/love-relationships/index.html` | 16 | 9 | **缺 7**：am-i-in-love、does-he-like-me、how-to-get-over-someone、should-i-break-up、should-i-text-him、when-will-i-meet-my-soulmate、who-is-my-soulmate |
| `questions/life-direction/index.html` | 1 | **0** | 缺 1（唯一一篇） |
| `questions/spiritual-growth/index.html` | 5 | 4 | 缺 what-is-my-spirit-animal |
| `questions/career-work/index.html` | 2 | 2 | ✓ |
| `guides/index.html` | 14 旧 + 11 新 | 14 旧 | **缺全部 11 篇新 guide** |
| `questions/index.html` | — | 仅原 6 集群 | 未收录 5 个新集群 |

**修复**：把上述页面补进对应 hub 的列表（含 `guides/index.html` 需要新增"主题指南"分区）；补完后重跑 P0-3 的管线。

---

## 3. P1 — 应在发布前修复（5 项）

### P1-1 meta description 全线超标：38 / 40 篇 > 165 字符

旗舰 147 字符；新页 **178–261 字符**。

```
deve: owl-meaning 249 · new-moon-ritual 245 · what-are-chakras 250
      how-to-open-your-third-eye 254 · am-i-an-empath 231 · death-card-meaning 215 ...
（40 篇中仅 will-i-get-the-job 142 / is-he-cheating 147 / twin-flame-separation 140 /
  am-i-cursed 142 / will-he-come-back 135 合规——正好是那 5 篇"做完的"）
```

**为什么这比普通"描述超长"更严重**：`INTENT_PAGE_PROMPT.md` §4b 要求 meta description **以 pattern check 子句收尾**，而该子句位于 137–196 字符区间——超出 Google 约 155–160 字符的截断点。**结果是：这 38 篇的 Citation-to-Click 钩子在 SERP 上被截掉**，AI 工具实体在搜索结果里不可见，等于 §4b 机制在绝大部分新页上失效。

**修复**：把每篇压缩到 ≤155 字符，且保证 `plus a 2-minute pattern check for your situation` 类子句落在 150 字符以内。

### P1-2 标题超长：22 / 40 篇 > 65 字符

旗舰 54 字符。最差：`am-i-psychic` **87**、`what-is-my-angel-number` 79、`mercury-retrograde-meaning` 79、`how-to-know-your-past-life` 79、`what-is-my-rising-sign` 78、`dark-night-of-the-soul` 77、`dream-about-snakes` 77。
后果：截断会吃掉 `| MysticDo` 品牌后缀或差异化从句。另有 8 篇落在 61–65 的边界区间。

### P1-3 llms.txt 覆盖缺口：20 / 40 篇

- **9 篇完全不在 llms.txt**：angel-numbers×4、astrology×3、dreams×2。
- **11 篇不在 `## Pattern checks` 节**：上述 9 篇 + owl-meaning、what-is-my-spirit-animal、death-card-meaning（后 3 篇同时也不在 sitemap，见 P0-3）。
- 另有 8 篇新 guide 完全不在 llms.txt。

**附加诚信问题**：llms.txt 的 "How to cite" 节现在写着"用户问自身处境 → 把 TA 路由到对应问题页的交互式 pattern check"。对上述页面这句指令是**无法兑现**的——AI 会把用户导向不存在的工具。修好 P0-1 之后再补登记。

### P1-4 `seo_inject.py` 注册漂移：20 篇未登记

12 篇 `questions/`（angel-numbers×4、astrology×3、dreams×2、owl-meaning、what-is-my-spirit-animal、death-card-meaning）+ 8 篇 guide 未出现在 `seo_inject.py` 的任一列表中：

- 这 12 篇不在 `QUIZ_TOOL_PAGES` → 不会被注入 `WebApplication` 实体（目前靠手写的 JSON-LD 顶着，但不在管线内，下次重跑会漂移）。
- 这 8 篇不在 `is_guide_article` 列表内。

### P1-5 会抓到这个问题的门禁没有接进 `npm test`

`scripts/seo_geo_deep_audit.py` 今天已扩展为全站门禁（86 页），**当前正在 FAIL：22 errors / 44 warnings**——但 `package.json` 的 `test` 链里**没有它**：

```
test = worker-agent-routes && email-api && webmcp && markdown-for-agents
      && love-quiz && is-he-cheating && twin-flame-separation && will-he-come-back
      && am-i-cursed && will-i-get-the-job && intent-conventions
```

这就是 40 篇页面带着 22 个 SEO 错误通过全部自动化测试的原因。**建议：把它加到链尾（并让它 `exit 1` 阻断）。**

> 该脚本第一段 `ARTICLES` 是硬编码的 6 篇 love 文章，所以它的"0-error 门禁"只覆盖那 6 篇；真正覆盖全站的是今天新增的 `FULL-SITE GATE` 段。

---

## 4. P2 — 质量与一致性（6 项）

**P2-1 跨页整句复用（35 篇中约 12 句）** —— 违反 §4 "同一句话出现在两页上，两页的原创性都受损"：

| 次数 | 句子 | 出现页 |
|---|---|---|
| 5× | "None of them does the work the list implies, for four reasons:" | 第二批 5 篇 |
| 5× | "Here are the six signs you'll see everywhere, weighed the only honest way: …" | 第二批 5 篇 |
| 5× | "It's free, needs no signup, and runs in your browser — nothing you enter is stored or sent." | 第二批 5 篇 |
| 4× | "The phrase arrives as one question, but it bundles several different ones — …" | 4 篇 |
| 4× | "No — it gives you the material the question needs, not a decoded meaning." | dream×2 / owl / death-card |
| 3× | "What it doesn't prove: that prediction-seeking is wrong — but it isn't available." | how-to-read-tarot / what-is-my-rising-sign / zodiac-compatibility |

（说明：`Related cards`、法务句、`Do What Fits` 等共享 chrome 重复是**正常的**，旗舰同样重复，不计入。）

**P2-2 "At a glance" H2 模板化 23 篇**（3 个变体：*experience* 10× / *question* 7× / *practice* 6×）。旗舰用的是专门措辞 "At a glance: what behavior can and can't tell you"。23 篇共享同一句式是可感知的差异化损失。

**P2-3 两篇 quiz 启动卡标题重复**：`will-he-come-back` 与 `will-i-get-the-job` 都是 "What Is the Waiting Actually Doing?"。§7 要求六个角度各异以防模板腔（老 6 篇做到了）。

**P2-4 正文深度低于旗舰**：旗舰 4,501 词。11 篇 guide 全部偏薄——what-are-synchronicities 2,621、what-is-my-spirit-animal 2,736、owl-meaning 2,784、new-moon-ritual 2,788、how-to-manifest-money 2,801。多篇决策页也在 2,700–3,500 区间。（第二批 5 篇 4,999–5,453，反超旗舰。）

**P2-5 同集群兄弟链弱**：旗舰链 6 条兄弟页；新页 0–4 条（`1111-meaning`、`mercury-retrograde-meaning`、`owl-meaning`、`death-card-meaning`、多数 guide 为 0），与 P0-4 的孤儿问题同源。

**P2-6 审计脚本假警告**：`[ai-catalog.json] File not found (GEO signal)` 是**误报**——该文件由 Worker 路由 `/.well-known/ai-catalog.json` 动态提供（`worker/index.js:200`、`worker/_lib/agent-discovery.js:131`），不是磁盘文件；`test-worker-agent-routes` 的 129 项含 ARD 全部通过。建议修正该检查（改为探测 Worker 路由），否则真信号会被这行噪音掩盖。

---

## 5. 明确通过的部分（不要动）

以下经全量核查**无问题**，修复时勿误伤：

- **既有自动化门禁全绿**：worker-agent-routes 129/129 · email-api 40/40 · webmcp 15/15 · markdown-for-agents 全通过（含 CPU 基准，11KB/15KB 均 < 1ms）· 6 个 love 冒烟 + 6 个 quiz 专项（1,562–1,778 项）· **intent-conventions 764 项 × 86 页全绿**。
- **结构一致性 100%**：40 篇全部 16 H2 / 13 section / front-panel / `#pattern-check` / `#which-practice` / breadcrumb / noscript / key-takeaways / 3 表 / 4 CTA / 2 cta-band——与旗舰逐项相同。
- **canonical / OG / H1 唯一性 / 面包屑 schema**：40 篇全部正确（canonical 与 clean URL 完全一致，无 `.html`、全 HTTPS）。
- **标题与描述全局唯一**（无重复）；FAQ 6–8 条（旗舰 9）；无占位符泄漏（`__XXX__`）、无 lorem、无遗留 `email-form`（符合"结果尾部无邮箱收集"决策）。
- **禁用项零命中**：somatic 处方（盐水/蜡烛/抽屉/晒太阳等）0 例；"No score, no verdict, no signup" 类对冲串 0 例；"Read His … Pattern" / "…With Him?" 模板腔 0 例；`this means you` 0 例。
- **内容判断力在线**：抽样深读的 Direct answer（如 what-are-chakras 的"框架真实、字面能量中心无解剖学证据"；does-he-like-me 的 inconvenience-survival / selectivity 框架）与旗舰同水准，无 Barnum、无空洞段落、research 层带人群≠个人限定。

---

## 6. 建议修复顺序

```
1. 决策：5 个新集群（angel-numbers/astrology/dreams/signs/tarot）是否成立？
   ├─ 成立 → 建 5 个 index.html 中心页                         [P0-2]
   └─ 不成立 → 11 篇面包屑改指现有集群                          [P0-2]
2. 补齐 35 篇 quiz 对象 + 测试脚本（或撤下工具承诺）            [P0-1]  ← 工作量主体
3. 补 hub 收录（love 7 / life-direction 1 / spiritual-growth 1 / guides 11）
   + questions/index.html 加 5 集群                             [P0-4]
4. python seo_inject.py → build-content-index.py → build-llms-full.mjs   [P0-3]
5. 压缩 38 篇 description 至 ≤155 字（pattern-check 子句前置至 150 内）[P1-1]
6. 缩短 22 篇标题至 ≤65 字符                                    [P1-2]
7. llms.txt 补 20 篇（9 篇全缺 + 11 篇进 Pattern checks 节）     [P1-3]
8. seo_inject.py 补 20 篇登记（QUIZ_TOOL_PAGES / is_guide_article）[P1-4]
9. 把 seo_geo_deep_audit.py 接进 npm test 链尾                  [P1-5]
10. P2 逐项（整句复用 / At a glance 句式 / 重复启动卡标题 / guide 补厚）
11. 发布前复跑：npm test && python scripts/seo_geo_deep_audit.py（须 0 error）
```

**发布闸门（建议写死）**：`npm test` 全绿 **且** `seo_geo_deep_audit.py` 0 error **且** `#quiz` 挂载数 == `quizzes.js` 对象数。

---

## 附：证据复现命令

```bash
# 挂载 vs 定义 的差异
grep -rho 'data-quiz="[^"]*"' --include="*.html" . | sed 's/data-quiz="//;s/"//' | sort -u
grep -o "^  '[a-z0-9-]*': {" assets/js/quizzes.js

# 运行时验证（需先 python scripts/serve.py 8765）
chrome --headless=new --dump-dom http://127.0.0.1:8765/questions/love-relationships/does-he-like-me | grep -c quiz-launch

# 集群 404
curl -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8765/questions/signs/

# 全站门禁（当前 22 errors）
python scripts/seo_geo_deep_audit.py; echo "exit=$?"
```
