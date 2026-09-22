# MysticDo 上线前终检报告

**日期**：2026-09-22
**范围**：新增 20 篇旗舰意图文章（commit `4f71f64`）+ 全站 71 个 quiz 对象 + 全部 SEO/GEO/Agent 生成物 + 未提交的前端改动
**方法**：静态审计（结构/契约/生成物一致性）+ 逻辑仿真（Node 全量 quiz 走查）+ 真实浏览器验证（headless Chrome，同一进程内起服务）
**初次结论**：**不具备上线条件（NO-GO）**。4 项 P0 阻断，其中 1 项会导致 20 篇新文章中的 15 篇 quiz 完全不可用。
**当前状态（见 §八 修复记录）**：**4 项 P0 + P1 + P2 技术性问题已全部修复并复验通过；P0-4 内容补全亦完成**。剩余仅 4 项可后置的非阻断项（P2-4 / P1-4 / P2-6 / 一个文案微调）。

---

## 八、修复记录（2026-09-22 当日完成）

| 项 | 内容 | 验证方式 |
|---|---|---|
| **P0-1** | 15 个失效 quiz 全部修复 | 5 个 legacy 的 `customResult` 改回 `function (ctx) { window.mysticdoPatternResult(ctx,'<slug>',{resultV2:true}) }`；渲染器增加 results 键名与 `underneath` 的兼容归一化（`title/name→path`、`whatAnswersSuggest/whatYourAnswersSuggest/description→suggest`、`whatItCannotProve/cannotSettle→dontTell`、`whatToWatchNext/watchNext/supports→watch`、裸字符串 underneath → `{key,label,text}`）。`scripts/test-quiz-render.mjs` 现已 71 quiz / 691 pattern 渲染 / 838 checks **ALL GREEN**；headless Chrome 实机复验 **broken=0、undefined 漏出=0** |
| **P0-2** | 删除伪造的 "98.4% Match" 徽标 | 实机复验 `ninety=0`；联盟 offer 块仍正常渲染（`partners=2`） |
| **P0-3** | 20 条标题全部降至 ≤60 字符（7 条超限 + 12 条边缘一并处理），og:title 同步 | `seo_geo_deep_audit.py` **Errors 0 / Warnings 2**（原 7 error / 13 warning） |
| **P1-1** | 新增 `scripts/test-quiz-render.mjs` 结果渲染门禁；`seo_geo_deep_audit.py` 改为 0 error 才退出 0；两者连同 `test-love-quizzes.mjs` + 4 个 `test-batch*` 全部并入 `npm test` | `npm test` 19 道门禁 **ALL GREEN** |
| **P1-2** | `.assetsignore` 增加 `scratch`、`scratch/**`、`__pycache__`、`*.pyc` | 内部草稿不再进入 CDN |
| **P1-3** | `main.js` 的 ceremony 定时器加句柄与 `cancelCalculating()`，在 `closeModal()` / `startQuiz()` 中取消；`renderResult()` 增加 try/catch + "未写入即视为失败"检测，失败时给出诚实失败态与重试按钮 | `node --check` 通过；实机全量渲染无卡死 |
| **P1-5** | `test-markdown-for-agents.mjs` 从"只收集 `index.html`（18 页）"改为收集全部 110 个发布页，并让测试替身按 clean URL 回退 `.html` | 覆盖率从 18/110 提升到 **110/110**，测试通过 |
| **P2-1/P2-2** | `--font-serif→--font-display`、`--text-dark→--ink-900`、`--text-body→--text`；补 `@keyframes fadeIn` | 脚本校验：未定义变量 0、孤儿动画 0、花括号平衡 |
| **P2-3** | 删除随徽标一起引入的绿配色 `.specialist-match-badge` | 全站无残留引用 |
| **P0-4（内容补全）** | 5 篇第三代文章（`what-is-my-moon-sign` / `what-is-my-saturn-return` / `am-i-in-the-right-career` / `dream-about-someone-dying` / `feeling-lost-in-life`）补齐契约缺失的全部章节：at-a-glance 4 列表、§10 quiz 说明卡（含 launchSub 同向标题与 pattern 清单）、§11 spiritual bridge、§13 mid `.cta-band`、§14 `#which-practice` 决策表 + "How to use a reading well" 保护框 + red flags、§15 before-you-book（4 卡 + when-to-wait）、end `.cta-band`。逐篇按主题撰写原创文案（如 Moon sign 表区分感官处理/Barnum/birth-time；Saturn 区分自愿剪枝/非自愿崩塌/anticipatory dread；career 区分 burnout/mismatch/plateau/passion/golden-handcuffs；death-dream 区分 attachment-continuity/ego-death/grief-processing/premonition；lost 区分 liminal/freeze/achievement-hangover/inherited-script/destiny-paralysis），voice 与既有旗舰页一致：克制、有判断、不写 somatic 处方、可能焦虑/抑郁时转介 therapist。`scratch/complete_5_pages.py`（幂等）统一插入。 | 5 篇 306→412-414 行、cmp-table 0→2、cta-band 0→2、`#which-practice` 0→1；headless Chrome 实机 3 篇抽查全部正常渲染；`test-intent-conventions` 1059 checks ALL GREEN |
| **P1-5+ 实体扩展** | markdown 测试扩大覆盖后暴露 `html-to-md.js` 实体表缺 `&eacute;`/`&lsqb;`/`&rsqb;`/`&minus;`（站点 red-flags 文案与负相关系数在用）。扩展实体表：加方括号、减号、Latin-1 字母（agrave…yuml 共 25 个），杜绝今后借词字符复发 | markdown 测试 110/110 通过，llms-full 重建 |

**未修复（均可后置，不阻断上线）**：P2-4（同 5 个 quiz 缺 `matchAha`，故 aha 块不渲染——不影响结果页，仅少一个心理学 reframe 段）、P1-4（"4-Signal" 与 "— pattern check" 双命名并存于 llms.txt，非功能性）、P2-6（全站 `twitter:card` 缺失，既有问题）、一个文案微调（`is-he-serious-about-me` 的 pattern 展示名 "Building but undefined" 英文略生硬，但语义正确、非缺陷）。

---

## 一、门禁状态总览

| 门禁 | 命令 | 结果 |
|---|---|---|
| Worker / Agent 路由 | `test-worker-agent-routes.mjs` | ✅ 129/129 |
| 邮件 API | `test-email-api.mjs` | ✅ 40/40 |
| WebMCP | `test-webmcp.mjs` | ✅ 15/15 |
| Markdown 孪生 | `test-markdown-for-agents.mjs` | ✅ 通过（覆盖仅 18/111 页，见 P1-5） |
| 6 个既有 quiz 逻辑 | `test-*-quiz.mjs` | ✅ 全绿 |
| 旗舰意图页规范 | `test-intent-conventions.mjs` | ✅ 1019 checks / 111 页 |
| 4 个 batch quiz | `test-batch{1..4}-quizzes.mjs` | ✅ 35×4 全绿 —— **但无法覆盖真实缺陷（P1-1）** |
| SEO 一致性 | `validate_seo.py` | ✅ 11 ok / 0 err |
| **SEO/GEO 深度审计** | `seo_geo_deep_audit.py` | ❌ **7 errors** / 13 warnings |
| **quiz 结果渲染（新增）** | 本次新增仿真 | ❌ **15/20 新 quiz 失败** |
| **发布资产排除** | `.assetsignore` | ❌ **scratch/ 内部草稿会公开** |

---

## 二、P0 —— 上线阻断项

### P0-1　20 篇新文章中 15 篇的 quiz 结果页完全不可用

**判定**：真实用户完成 8 题后，会**永久卡在 "Analyzing Your Pattern" 界面**，永远看不到结果。

**证据**：两套独立验证结果完全一致。

Node 全量仿真（`scratch/sim_all_quizzes.mjs`，71 个 quiz）：

```
TOTAL quizzes: 71
  OK: 51        DEFAULT: 5        CRASH: 10        BLANK: 5
=== BROKEN among the 51 PRE-EXISTING ===
  (none)          ← 既有 51 个全部正常，故障 100% 落在新增批次
```

无头 Chrome 实机（真实 DOM + 真实 `quizzes.js`）：

```
333-meaning        THROW: r.suggest is not a function
444 / 555 / 777 / 888-meaning        THROW
dream-about-being-chased / dream-about-your-ex    THROW
lovers-card-meaning / tarot-yes-or-no / tower-card-meaning   THROW
what-is-my-moon-sign / what-is-my-saturn-return /
am-i-in-the-right-career / dream-about-someone-dying /
feeling-lost-in-life                 EMPTY 0
dream-about-deceased-loved-one / is-my-loved-one-watching-over-me /
signs-from-deceased-loved-ones / why-am-i-always-broke / will-i-be-rich   OK ~9.7K
```

**根因**：这批 20 个 quiz 用了**三套互不兼容的 `results` 结构**，而共享渲染器 `mysticdoPatternResult` 只认一套。

| 结构 | 数量 | `results[p]` 实际键 | 渲染器要求（`quizzes.js:279-388`） | 后果 |
|---|---|---|---|---|
| 契约标准 | 5 | `path, summary, suggest(a), dontTell, watchIntro, watch(a)` | ✅ 完全匹配 | 正常 |
| ALT | 10 | `title, summary, whatAnswersSuggest, whatItCannotProve, whatToWatchNext` | ❌ `r.suggest` 不存在 | **抛异常** |
| 第一代残留 | 5 | `name, summary, description, supports, cannotSettle, watchNext, whatYourAnswersSuggest` | ❌ 签名也不对 | **渲染空内容** |

- ALT 组：`quizzes.js:331` 的 `r.suggest(a)` 抛 `TypeError`，`body.innerHTML` 从未被赋值。
- 第一代 5 个：`customResult` 仍是旧签名 `function(pKey, rKey, answers) { return null; }`，而 `main.js:946` 传的是单个 `ctx` 对象 —— 返回 null、不写 DOM。
- **关键放大器**：`main.js:945` 一旦发现 `customResult` 是函数就**无条件 `return`**，不再回退默认渲染器；且 `main.js:907` 用 `setTimeout(doneCb, 3000)` 调用它，**无 try/catch**。新增的 3 秒 "Analyzing Your Pattern" 动画先把界面写好，异常发生后界面就停在那里 —— 用户看到的是**加载动画卡死 100%**，而不是报错。
- 三个"第一代"特征高度重合，指向同一批产物：与 P0-4 的 5 篇缺章文章**是同一批 5 个页面**。

**为什么测试全绿**：`test-batch*.mjs` 只校验"8 题 / 5-6 patterns / 7 practice keys / resolve 合法 / matchPractice 合法"，**从不调用渲染路径**；且这 4 个脚本**根本没进 `npm test`**（见 P1-1）。

**修复方向**（二选一，推荐 A）：

- **A. 补齐数据结构（最小改动）**：给 ALT 组的 10 个 quiz 把 `title→path`、`whatAnswersSuggest→suggest`（转成**函数**，或包一层 `() => 原字符串`）、`whatItCannotProve→dontTell`、`whatToWatchNext→watch`（转函数）。10 个对象 × 5 个 pattern = 50 处。
- **B. 给渲染器加兼容层**：在 `mysticdoPatternResult` 读取前做一次键名归一化（`r.path || r.title || r.name` 等），并在 `main.js` 的 `setTimeout` 内加 try/catch，异常时降级到默认渲染器。
- 第一代 5 个（`return null`）无论选哪条路，都必须改写成 `function(ctx){ window.mysticdoPatternResult(ctx, '<slug>', {resultV2:true, ...}) }`。

---

### P0-2　结果页出现伪造的 "98.4% Match for this pattern" —— 违反项目自身硬规则

**判定**：这是**今天新引入**的（HEAD 中不存在 `98.4`），且会真实渲染。

```
$ git show HEAD:assets/js/quizzes.js | grep -c "98.4"   →  0
$ grep -c "98.4" assets/js/quizzes.js                   →  1
```

diff 位置 `assets/js/quizzes.js:188`，替换掉了原来无害的 kicker 文案：

```diff
-    + '<span class="love-offers-kicker">From pattern to person</span>'
+    + '<span class="specialist-match-badge">…</svg> 98.4% Match for this pattern</span>'
+    + '<span class="love-offers-kicker">Verified Specialists &middot; Direct Insight</span>'
```

**为什么是 P0**：

1. **违反 `INTENT_PAGE_PROMPT.md` §5 明文红线**："**不给分数、不给判决**：Quiz 输出 pattern，不输出 love score / 百分比 / yes-no"。quiz 契约同样要求 "Never score, never verdict"。
2. **与同屏文案自相矛盾**：结果页底部 fineprint 写着 "a perspective to weigh, not a verdict on what anyone privately feels"，上方却给出 98.4% 这种精确到小数的"匹配度"。
3. **虚假精确度**：`MYSTICDO_PARTNERS`（`quizzes.js:130`）已配置真实联盟链接，该数字挂在 `.specialist-match-badge`（绿色"通过"勾图标）旁、紧贴联盟 offer 卡片 —— 这是用编造数据推动联盟转化的典型形态，同时踩到平台自述的 "We refuse to exaggerate / We demystify technical claims"（本页 methodology 段落原文）。
4. **覆盖全部 `resultV2` quiz**：即 6 个 love quiz + 全部能跑通的新 quiz。

**修复**：直接删除该 `specialist-match-badge` 一行，恢复中性 kicker。`.specialist-match-badge` 样式与绿配色一并移除（见 P2-2）。

---

### P0-3　7 篇新文章标题超长，SEO 深度审计报 error（发布门禁要求 0 error）

`python scripts/seo_geo_deep_audit.py` → **Errors: 7**（全部为本次新增页面）：

| 页面 | 长度 | 标题 |
|---|---|---|
| am-i-in-the-right-career | **73** | Am I in the Right Career? 4-Signal Burnout & Values Diagnostic \| MysticDo |
| is-my-loved-one-watching-over-me | **72** | Is My Loved One Watching Over Me? 4-Signal Alignment Screener \| MysticDo |
| signs-from-deceased-loved-ones | **72** | Signs From Deceased Loved Ones: 4-Signal Diagnostic & Meaning \| MysticDo |
| lovers-card-meaning | **72** | Lovers Tarot Card Meaning: 4-Signal Values Alignment Screener \| MysticDo |
| what-is-my-moon-sign | **69** | What Is My Moon Sign? 4-Signal Somatic Regulation Screener \| MysticDo |
| dream-about-deceased-loved-one | **68** | Dream About Deceased Loved One: 4-Signal Dream Diagnostic \| MysticDo |
| dream-about-someone-dying | **66** | Dream About Someone Dying: 4-Signal Transition Screener \| MysticDo |

**根因**：新批次统一在标题尾部追加 "4-Signal \<Screener/Diagnostic\>"，而正文页标题上限是 65 字符（`seo_geo_deep_audit.py:59,376`）。上一批（`08649a3`）结尾是 "— pattern check"，长度可控。

**修复**：把这 7 条标题的 "4-Signal …" 后缀缩短或前置。建议保留主查询词 + 品牌后缀，例如 `Am I in the Right Career? | MysticDo`（33）、`Signs From Deceased Loved Ones | MysticDo`（42）。注意改完 `<title>` 后要同步 `og:title`，并重跑 P0-3 的生成管线（`seo_inject.py` 会带 og:title）。

---

### P0-4　5 篇新文章结构残缺，缺 9-10 个契约章节

**同 P0-1 的第一代 5 个页面**：`what-is-my-moon-sign` / `what-is-my-saturn-return` / `am-i-in-the-right-career` / `dream-about-someone-dying` / `feeling-lost-in-life`。

篇幅对照（标准体 vs 这 5 篇）：

| | 行数 | H2 数 | 字符数 |
|---|---|---|---|
| 标准（如 dream-about-being-chased） | 381 | 16 | 46.0 KB |
| **这 5 篇** | **306-308** | **12** | **34.3-36.1 KB** |

**缺失章节**（对 `INTENT_PAGE_PROMPT.md` §4 的 15 节）：

| 契约节 | 状态 |
|---|---|
| §7 At-a-glance 4 列表（`cmp-table`，"全页最强 GEO 资产"） | ❌ 整页 0 个表格 |
| §10 Quiz 说明区（"What this pattern check looks at"） | ❌ 缺 |
| §11 Spiritual bridge | ❌ 缺 |
| §13 Mid CTA band（`.cta-band`） | ❌ 缺 |
| §14 `#which-practice` 决策表 + "How to use a reading well" 保护框 | ❌ 缺 |
| §15 Before you book（4 卡 + 何时该等） | ❌ 缺 |
| §15 End CTA band（`.cta-band`） | ❌ 缺 |
| §15 Related cards | ✅ 有 |

**业务影响**：这 5 页**没有 `#which-practice`、没有任何 `.cta-band`** —— 转化路径只剩 hero 一个按钮，且丢失了最强的 GEO 引用资产（对比表）。`am-i-in-the-right-career` / `dream-about-someone-dying` / `feeling-lost-in-life` 还额外缺 red flags 保护性内容。

**修复**：按 `dream-about-being-chased.html` 补齐缺失 7-8 节；或先下线这 5 页（保留 URL 但加 `noindex`）以免以残缺形态被索引。

---

## 三、P1 —— 应在本次上线前处理

### P1-1　测试链路存在系统性盲区，导致 P0-1 被"全绿"掩盖

1. **`seo_geo_deep_audit.py` 不在 `npm test` 中** —— 这正是 P0-3 的 7 个 error 能通过全部自动化测试的原因（与 2026-09-21 记录的问题同源，仍未修）。
2. 新增的 `test-batch1..4-quizzes.mjs` **也不在 `npm test` 中**。
3. **即便加进链路也发现不了 P0-1**：这 4 个脚本只做静态结构断言，从不执行 `customResult` / 渲染器。建议在 batch 测试中增加一条"结果渲染冒烟"——遍历全部 pattern 调用 `mysticdoPatternResult` 并断言 `body.innerHTML.length > 200`。本次的 `scratch/sim_all_quizzes.mjs` 可直接改造成正式冒烟测试。

**建议把发布门禁固化为一条命令**（当前是三条互不相关的检查）：

```
node scripts/test-quiz-render-smoke.mjs      # 新增：结果渲染冒烟（71 quiz × 全 pattern）
&& node scripts/test-intent-conventions.mjs
&& node scripts/test-batch{1..4}-quizzes.mjs
&& python scripts/seo_geo_deep_audit.py      # 必须 0 error
```

### P1-2　`scratch/` 未被 `.assetsignore` 排除，内部工程草稿会公开

`.assetsignore` 排除了 `scripts`、`*.py`、`*.mjs`、`*.md`、`_design-check`、`worker`，**但没有排除 `scratch/`**。因此以下文件会作为静态资产上传并可直接下载：

| 文件 | 大小 | 内容 |
|---|---|---|
| `scratch/quiz_meta.json` | 272 KB | **全部 quiz 题库全文**（题目/选项/评分） |
| `scratch/quiz_specs_draft.json` | 110 KB | quiz 规格草稿（pattern 数、hints） |
| `scratch/quiz_inventory.json` | 98 KB | 全站页面清单 + Direct answer 全文 |
| `scratch/__pycache__/quiz_configs.cpython-314.pyc` | - | 编译产物 |

即 `https://mysticdo.com/scratch/quiz_meta.json` 可被任意下载。**修复**：在 `.assetsignore` 加一行 `scratch`（本次已顺手删除自己产生的 3 个临时文件，但 scratch 里原有的 3 个 JSON 与 pyc 需要处理）。

### P1-3　新增 3 秒"计算动画"无取消机制，存在串场覆盖风险

`main.js:907` 的 `setTimeout(doneCb, 3000)` 及 `phases` 定时器都没有句柄、没有取消：

- 用户在 3 秒内关闭弹层 → `renderResult()` 仍在隐藏容器上执行并让 `phase='done'`，状态机被污染。
- 用户在 3 秒内重开/重启 quiz → 旧闭包的 `doneCb()` 会把**上一轮的答案结果**渲染进**新会话的界面**。
- 叠加 P0-1：这 3 秒把"结果页空白"变成了"永久卡在加载动画"，故障体感更差。

**修复**：把定时器句柄存到实例作用域，`closeDrawer()` / `startQuiz()` 时 `clearTimeout`；并在 `doneCb` 外层包 try/catch，异常时给出可读失败态而不是静默卡死。

### P1-4　命名体系分叉 + 12 条边缘标题

- 新批次统一用 "4-Signal \<X\> Screener/Diagnostic" 命名，与既有 "— pattern check" 体系分叉。这导致 **`llms.txt` 的 `## Pattern checks (interactive, personalized)` 同一节内混用两种命名**（如 `…— pattern check` 与 `…— 4-Signal Burnout & Values Diagnostic`），而"4-Signal"是站内自造词，对 AI 检索与用户搜索意图都不友好。
- 12 条 61-65 字符的边缘标题（`333/444/888-meaning`、`dream-about-being-chased`、`dream-about-your-ex`、`what-is-my-saturn-return`、`feeling-lost-in-life`、`why-am-i-always-broke`、`will-i-be-rich`、`tarot-yes-or-no`、`tower-card-meaning`）。不阻断，但移动端 SERP 会截断。

### P1-5　Markdown 孪生测试只覆盖 16% 的页面

`test-markdown-for-agents.mjs:53` 的 `collect()` **只收集 `index.html`** —— 全站 18 个目录索引页，**93 个非索引正文页（含全部 20 篇新文章）从未被验证**。Worker 的 `/path.md` 路由是动态转换（`worker/index.js:294`），功能上对新页大概率有效，但"`/path.md` 永不 404"这一对外承诺当前只有抽样依据。**修复**：改为从 `sitemap.xml` 派生待测页面清单（与 `llms-full.txt` 同一单源），或直接扩大 `collect()`。

---

## 四、P2 —— 建议排期处理

| # | 问题 | 位置 | 说明 |
|---|---|---|---|
| P2-1 | 新 CSS 引用未定义变量 | `style.css:1812/1815/1881/1885/1902` | `var(--font-serif)`、`var(--text-dark)`、`var(--text-body)` **在 style.css 中从未定义**（`:root` 只有 `--font-body/--font-brand/--font-display`、`--text/--text-muted/--text-faint`）。声明在计算值阶段失效 → `.quiz-calc-title` 拿不到衬线字体、echo 区块颜色退回继承。 |
| P2-2 | 未定义动画 | `style.css` `.quiz-calc-wrap { animation: fadeIn 0.3s }` | `@keyframes fadeIn` **不存在**（`calcSpin`/`calcPulse` 存在）→ 静默无效声明。 |
| P2-3 | 绿配色越出设计系统 | `.specialist-match-badge` | `rgba(34,139,34)/#1b6329` 不在 Aurum 调色板（ivory/ink/gold/plum）。随 P0-2 一并删除。 |
| P2-4 | 第一代 5 个 quiz 个性化不足 | `underneath` / `matchAha` | 这 5 个只有 **1 个** `underneath` 键（其余 15 个有 2-3 个），且**无 `matchAha`** → behind-the-scenes 的 aha 层不渲染，暗流块近乎静态。 |
| P2-5 | 死变量声明 | `quizzes.js` `mysticdoPatternResult` | `var wantText` 声明两次（echo 区块内 + 第 403 行），前者赋值被立即覆盖。 |
| P2-6 | `twitter:card` 全站缺失 | 112/112 页 | 既有问题，非本次回归；补上可改善 X 分享卡片。 |
| P2-7 | 契约文档与脚本路径不符 | `INTENT_PAGE_PROMPT.md` §9 | 文档写 `validate_seo.py` 在 `scripts/`，实际在仓库根目录；照抄管线会报 file-not-found。 |

---

## 五、已验证通过项（可安心）

- **资产完整性**：71 个 quiz 对象 ↔ 71 个页面挂载点，**1:1 完全对应，无死对象、无断挂载**；唯一的 slug 不一致是 `do-what-fits.html → general`，属设计预期。
- **语法**：`node --check` 对 `assets/js/*.js`（3 个）与 `worker/**/*.js`（8 个）全部通过。
- **SEO 生成物一致性**：sitemap 109 URL ≡ content-index 109 页 ≡ llms-full 109 页；20 篇新页面 **100% 收录**于三处。
- **注册完整性**：20 个新页面在 `seo_inject.py` 中各出现 3 次（两个 article 元组 + `QUIZ_TOOL_PAGES`）；`QUIZ_TOOL_PAGES` 46 → **66**，符合 §8 要求。
- **结构化数据**：20 篇新页面 **全部**具备 `Article` + `WebApplication`(@id=canonical#quiz) + `FAQPage` + `BreadcrumbList`；canonical 全部 HTTPS 且为 clean URL，与 `BASE_URL + path` 精确匹配。
- **H1 / 标题层级 / robots**：20 页均恰好 1 个 H1，无层级跳跃，`robots = index, follow`，无意外 noindex。
- **内链完整性**：`validate_seo.py` 全站内链 107 条全部可解析；本次审计对 20 页逐一验证出链，无 404（`/.well-known/ai-catalog.json` 由 Worker 提供，属审计误报）。
- **描述长度**：20 篇 meta description 全部 145-163 字符，**均在 165 上限内**；且全部以工具子句收尾（§4b 要求）。
- **§4b AI 工具面**：20 页均有"个性化"FAQ 条目（交互式 / 结果来自用户答案 / free / no signup / answers stay in browser），隐私句齐备。
- **Quiz 可达性**：30,000 次随机走查，**无不可达 pattern、无 resolve 返回非法键、无 matchPractice 返回非法键、无异常**；`free_first` 在 20 个 quiz 中**全部可达**（未出现"全部导向付费"）。
- **文案去重**：跨页共享句子 17 条，其中 16 条为共享组件样板（related 卡片 / Do What Fits / Daily Card 描述），1 条为 front-panel fineprint（§4 要求全站统一），**无正文级重复**。
- **HTML 完整性**：20 页标签配对全部平衡，无未闭合。
- **运行时**：headless Chrome 抽查 4 个页面，header/footer 注入正常、quiz 启动卡渲染正常、静态层无误。
- **无 somatic 处方**：契约禁止的盐水/蜡烛/整理抽屉/晒太阳等表述，20 页中未发现（`dream-about-your-ex` 的 "candle" 命中为梦境象征语境，非处方）。

---

## 六、建议的修复顺序

**第 1 步（阻断，必须先做）**

1. 删除 `quizzes.js:188` 的 "98.4% Match" 徽标与其绿色样式 → 消除 P0-2。
2. 修复 15 个新 quiz 的结果结构 / 签名（P0-1）。改完立即跑全量渲染冒烟，确认 `CRASH: 0  BLANK: 0`。
3. 缩短 7 条超长标题 → 重跑 `seo_inject.py` → `seo_geo_deep_audit.py` 必须 **0 error**。

**第 2 步（应做）**

4. `.assetsignore` 加 `scratch`（P1-2）。
5. 5 篇缺章文章补齐 §7/§10/§11/§13/§14/§15，或先 `noindex` 下线（P0-4）。
6. 给 `doneCb` 定时器加取消 + try/catch（P1-3）。

**第 3 步（门禁固化）**

7. 新增结果渲染冒烟测试，并把 `seo_geo_deep_audit.py`、`test-batch*.mjs`、冒烟测试一起并入 `npm test`（P1-1）。
8. 修 `--font-serif` / `--text-dark` / `--text-body` / `@keyframes fadeIn`（P2-1、P2-2）。

**第 4 步（上线前最后确认）**

9. 重跑三件套 + 全量回归：
   `seo_inject.py` → `scripts/build-content-index.py` → `node scripts/build-llms-full.mjs`
   → `npm test` → `seo_geo_deep_audit.py`（0 error）→ `quiz_render_smoke`（0 fail）
10. push 后跑 `python scripts/verify-agent-surface.py`（对**线上**验证，本地全绿不代表部署新鲜）。

---

## 七、附：本次审计用到的可复现脚本（均在 `scratch/`，不发布）

| 脚本 | 用途 |
|---|---|
| `scratch/audit_new20.py` | 20 页标题/描述/canonical/JSON-LD/章节/出链/禁语 |
| `scratch/audit_sections.py` | 20 页 × 16 项契约章节矩阵 |
| `scratch/audit_quizzes.mjs` | 新 quiz 契约字段校验 |
| `scratch/sim_results.mjs` | 单批结果渲染仿真 |
| `scratch/sim_all_quizzes.mjs` | **全站 71 quiz 结果渲染仿真（核心证据）** |
| `scratch/audit_reach.mjs` | 30k 随机走查：pattern 可达性 / practice 路由 |
| `scratch/audit_fns.mjs` | 新 quiz 函数完整性与 customResult 签名 |
| `scratch/audit_dup.py` | 跨页语句复用 + HTML 标签平衡 |
