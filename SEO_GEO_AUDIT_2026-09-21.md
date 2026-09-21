# MysticDo 技术 SEO + GEO 全站审计报告

**日期：** 2026-09-21
**范围：** 46 页全量独立扫描（静态分析）+ 仓库门禁复跑 + 线上协议/性能/安全头实测 + GEO/AI 引用面核对
**方法：** 独立审计脚本（非仓库自带门禁）逐页解析 head 元素、结构化数据、标题树、内链图、sitemap/llms.txt 交叉一致性；curl 实测线上响应头。
**总评：A-。** 顶尖水准的骨架已经全部就位，系统性缺口集中在三处：标题长度治理（guides/分类页从未纳入门禁）、3 个 "coming soon" 占位导航死链、静态资产缓存与安全头缺失。
**➡ 修复已于同日全部执行完毕，终态 0 error 全绿（见文末"修复执行记录"）。**

---

## 一、评分卡

| 维度 | 评级 | 依据 |
|---|---|---|
| 可索引性 / Canonical | **A** | 45/45 可索引页 canonical 全部自指且与 clean URL 一致；404 与 find-your-path 跳转桩正确 noindex（不进 sitemap/llms.txt，实现教科书级）；无意外 noindex；www→apex 301 正确 |
| 标题/描述治理 | **C+** | **18 页标题 >65 字符**（最长 102）；22 页描述 >165 字符（最长 226）。唯一系统性缺口，详见 P1 |
| 结构化数据 | **A** | 全站 0 个 JSON-LD 解析错误；Article/BreadcrumbList/FAQPage 必填属性齐全；6 篇意图页另有 WebApplication（@id=canonical#quiz）；标题/描述/canonical 0 重复 |
| sitemap / llms.txt / ai-catalog 一致性 | **A** | sitemap 44 URL 与实体页完全对应、44 条 lastmod；llms.txt 对全部可索引页覆盖率 100%、0 CRLF、链接格式全合规 |
| 内链 / 信息架构 | **A-** | 静态+JS 注入链接合并后 0 断链（占位链接除外，见 P1）；H1 每页恰好 1 个；孤页 0；3 个薄页见 P3 |
| 性能 / 协议 | **B** | Brotli ✓、gtag async ✓、**0 渲染阻塞脚本**（main.js/quizzes.js 全在 body 尾）、字体预载 46/46 ✓、H3 via alt-svc ✓、HTML 走 CF 边缘缓存 HIT；扣分：CSS/JS/字体 `max-age=0, must-revalidate` → 回访每个资产都走条件请求 |
| 安全响应头 | **C** | 无 HSTS、无 X-Content-Type-Options、无 Referrer-Policy、无 X-Frame-Options/CSP —— `_headers` 一个文件可全补 |
| GEO / AI 引用面 | **A** | 行业少见的完整度，亮点清单见第三节 |
| 移动 / 基础设施 | **A** | viewport/manifest/theme-color/favicon 全备；lang 属性正确 |

---

## 二、P1 —— 本周必修（直接影响 SERP 呈现与品牌红线）

### 1. 标题长度治理（18 页超标）
Google 移动端约 60 字符截断。最严重的 5 页：

| 页面 | 字符数 |
|---|---|
| guides/psychic-reading-cost | **102** |
| guides/tarot-reading-cost | **96** |
| guides/medium-reading-guide | **85** |
| guides/birth-chart-reading-cost | **84** |
| guides/before-paying-psychic-reading | **82** |

其余超标（67–81）：how-to-choose-tarot-reader(81)、psychic/(81)、how-to-choose-astrologer(80)、is-online-psychic-legit(79)、questions/love-relationships/(79)、astrology-reading-vs-horoscope(76)、medium/(75)、questions/(73)、career-work/(73)、money-wealth/(73)、about(72)、tarot/(72)、methodology(71)、online-psychic-vs-in-person(71)、do-what-fits(70)、psychic-vs-medium(67)。

**根因：** `seo_geo_deep_audit.py` 的标题长度门禁只覆盖 6 篇 love 意图文章（它们全部 ≤64 合格）；guides 与分类页从未受闸。
**修法：** ① 手工压写这 18 个标题到 ≤60（保留关键词前置 + "| MysticDo" 后缀）；② 把门禁的 ARTICLES 列表扩为全站页面清单，防止回归。

### 2. "coming soon" 占位导航死链（品牌红线 + SEO 双杀）
`assets/js/main.js:190` 导航下拉含 3 个指向不存在页面的链接：
`/feng-shui/`、`/manifestation/`、`/numerology/`（class="is-placeholder"，文案 "coming soon"）。

- SEO：全站每页 3 个 404 内链，爬虫每轮抓取都会撞到；
- 品牌：直接违反既定规则「线上页面禁止任何未完成/占位措辞」。

**修法：** 从 main.js 移除这三项（或改为锚点链接到现有 practices 区块）。若未来上线这些分类，再恢复。

---

## 三、GEO/AI 引用面 —— 已达行业第一梯队的部分（保持，勿动）

1. **llms.txt v2**：`- [name](url): notes` 格式全合规、0 CRLF、可索引页 100% 覆盖；llms-full.txt 同步 200。
2. **Agent surface v0.4**：每个响应带 `Link: <…api-catalog> <…llms.txt> <…ai-catalog.json>` 头；`/.well-known/` 四件套 + `/auth.md` + `/mcp/` 全部 live 200 —— 这是极少数站点部署的完整 RFC 9410 + ARD 发现面。
3. **robots.txt**：通配 `Allow: /` 兜底 + 33 个 AI bot 命名组即文档 + Content-Signal 声明（ai-train=no, ai-input=yes）+ CCBot 有意拒绝；线上与仓库逐字节一致。
4. **FAQ 层**：全站 124 条 `<details class="faq-item">`，FAQPage JSON-LD 自动提取注入；6 篇意图页 front-panel direct-answer 结构（GEO answer-first 标准形态）。
5. **Markdown twins**：`/path.md` Worker 级镜像 200；首页 Link 头含 `/index.md alternate`。
6. **正确实现确认**：find-your-path 为 noindex,follow 元刷新跳转桩——正确地不进 sitemap/llms.txt/og:url。

**已知非缺口**：站点零 `<img>` 标签（视觉全靠 CSS/SVG）→ 零图片搜索面，属取舍而非缺陷；quiz 工具页静态词数低（33–63 词）符合工具页属性。

---

## 四、P2 —— 性能与协议（一个 `_headers` 文件解决两项）

### 3. 静态资产缓存策略
现状（实测）：CSS/JS/woff2 全部 `Cache-Control: public, max-age=0, must-revalidate` → 回访者每个资产发起条件请求（304 往返），浪费 RTT 且增加边缘负载。
**修法：** 根目录新增 `_headers`（Workers Static Assets 原生支持，`.assetsignore` 勿排除它）：

```
/assets/*
  Cache-Control: public, max-age=86400
/assets/fonts/*
  Cache-Control: public, max-age=31536000, immutable
/assets/og/*
  Cache-Control: public, max-age=31536000, immutable
```

### 4. 安全响应头（并入同一 `_headers`）
```
/*
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN
```
（CSP 可后续以 Report-Only 引入，不急。）

### 5. og:title 补齐 33 页
非文章页只有 og:site_name 无 og:title（FB/X 会回退 `<title>`，故为打磨项）。在 `seo_inject.py` 模板里补一行即可全站生效。

---

## 五、P3 —— 打磨项（顺手做）

6. **h1→h3 跳级 22 页**：guides/quiz/do-what-fits/methodology/questions hub 模板中 hero h1 后直接 h3 小标题。改模板一处（h3→h2）全站生效，纯语义打磨。
7. **薄页**：questions/ hub 155 词（6 分类仅 love 填充，随内容增长自然解决）、contact 216 词、join 279 词。
8. **22 页描述 >165 字符**：改标题时顺带收紧到 ≤160。
9. **og:image 权重**：logo-card.png 172KB，建议压到 <100KB（社交抓取更快）。

---

## 六、结论

46 页站点的技术 SEO 骨架（canonical/结构化数据/sitemap/内链/robots/agent surface）已经是第一梯队水平且自动化门禁护住了大半。**把它推到无懈可击只差三件事：标题长度全站纳入门禁、删占位死链、`_headers` 补缓存与安全头。** 完成后本站技术面与 GEO 面均可对标行业头部独立站。

*审计方法注记：标题长度标准 ≤60（移动截断线）；描述 ≤160；缓存头标准参照 web.dev 静态资源最佳实践；GEO 面对照 llms.txt v2 规范 + RFC 9410 (api-catalog) + contentsignals.org。线上实测经代理执行，TTFB 读数含代理开销（约 0.75–0.80s，仅作上界参考），建议用 PageSpeed Insights 拿一次现场 CrUX 数据作为基线。*

---

## 六、修复执行记录（2026-09-21 同日完成，终态 0 error）

| 项 | 执行内容 | 终态 |
|---|---|---|
| P1 标题治理 | 29 个标题重写至 ≤60 字符（保留品牌后缀与关键词，句子式大小写与站内口吻一致） | title 警告清零 |
| P1 占位死链 | `main.js` 导航删除 /numerology/ /manifestation/ /feng-shui/ 三个 "coming soon" 占位项（品牌红线 + 全站 404 内链一并消除） | 0 断链 |
| P2 安全头 | `worker/index.js` 新增 `SECURITY_HEADERS` + `harden()`：HSTS(1y)、nosniff、Referrer-Policy、X-Frame-Options、Permissions-Policy，**所有响应**（静态/JSON/OAuth/301）统一注入，幂等不覆盖 | C → A |
| P2 缓存策略 | `worker/index.js` `ASSET_TTL_RULES`：字体 1y immutable、图片 7d、CSS/JS 1d；HTML 保持 must-revalidate | B → A- |
| P2 OG 补齐 | `seo_inject.py` 模板补 og:title / og:description / og:type(website)，全站重新注入（33 页） | og 警告清零 |
| P3 描述收紧 | 28 条 >160 描述重写至 ≤160（含 2 篇 love 文章的 HTML 实体膨胀修正：&ldquo;/&mdash; → 字面字符） | desc 警告清零 |
| P3 标题层级 | 22 页 h1→h3 跳级修复：.direct-answer/.key-takeaways 盒内 h3→h2（CSS 原生含 h2 变体，**零视觉变化**）；quiz noscript 卡 h3→h2.card-title；questions hub 卡片 h3→h2 | heading 警告清零 |
| 门禁扩全站 | `seo_geo_deep_audit.py` 新增 FULL-SITE GATE：46 页扫描 title/desc/canonical/og:title/H1/heading-skip，**error 时退出码非零**（根治 guides 无闸的根因） | 0 error |
| 同步重建 | sitemap.xml（44 URL）、content-index.json（44 页）、llms-full.txt（44 页 416.9KB） | 一致性 ✓ |
| 回归测试 | 6 个 node 测试脚本全绿：worker-agent-routes 129 + email-api 40 + webmcp 15 + markdown-for-agents + love-quiz + intent-conventions 204 ALL GREEN | 0 failed |

**遗留（有意不做，需单独评审）：** CSP 头（有内联脚本，需 Report-Only 观察期后再上）；CSS/JS 指纹化（当前 1 天 TTL 已安全）；does-he-think-about-me 兄弟链接补充（内容编辑项）。

**部署：** 用户 `git push` 后 1–2 分钟生效。上线验证命令：
`curl -sI https://mysticdo.com/ | grep -iE "strict-transport|x-content-type|referrer-policy|cache-control"`
（安全头应出现；woff2 应为 `max-age=31536000, immutable`；HTML 保持 must-revalidate）
