# MysticDo Quiz 结果引擎规范（v2）

_结果页是本站的核心商业引擎。本文档是其唯一生产规范；INTENT_PAGE_PROMPT.md §7 引用本文件。_

---

## 0. 定位（先想清楚再动手）

Quiz 不是产品，是**需求识别器**。结果页决定商业价值：把"我现在到底需要什么"推导成"那我下一步应该做什么"。

固定漏斗：

```
QUIZ → 被理解的结果 → 个性化解读 → 未解决信息缺口 → 最佳匹配实践 → 个性化 CTA → 购买/留资
```

三条铁律：

1. **不直接给"答案"。** 结果页永远不能输出 "Yes, he probably loves you" 这类判词。Quiz 解决的是"你在困惑什么"；付费服务解决的是"需要更深入探索的东西"。中间的信息缺口就是 CTA 的燃料。用户产生"哦，我知道了"的那一刻，需求死亡。
2. **不给决策负担。** 用户做完 quiz 恰恰说明他不确定该怎么办——结果页绝不能再让他 "Choose: Tarot / Psychic / Astrology…"。MysticDo 的角色是 Decision Layer：直接给唯一最佳匹配，并解释为什么。
3. **推荐层与供应层分离。** 结果页只建立 MysticDo 自己的 Recommendation Layer；affiliate / 未来自有产品 / 未来 reader marketplace 都只是推荐层后面可插拔的供应商。结果页文案永远不写死任何外部商家。

---

## 1. 结果页九层解剖（v2，顺序固定）

| # | 层 | 职责 | 数据来源 |
|---|----|------|---------|
| 1 | Pattern head | **被理解**：模式命名 + 一句话画像（即时奖励，"对，这就是我"） | `results[k].path / .summary` |
| 2 | What your answers suggest | **个性化解读**：结构化解释（非 fake certainty），随答案动态变化 | `results[k].suggest(a)` |
| 3 | Aha block | **情绪峰值**：进化心理学解释"为什么这个问题缠着你不放" + 一个今晚可做的躯体化微练习（免费价值） | `matchAha()` × `MYSTICDO_AHA` |
| 4 | The honest edge | **信息缺口**：左"这个模式能告诉你什么" / 右"它不能告诉你什么"。不能侧收尾句固定：quiz 能整理你的问题，但无法判定另一个人私下的想法、感受或计划——那需要他本人的话，或一次针对你具体处境的更深入的解读。**这是全页 CTA 燃料的出处。** | `opts.canTell` + `results[k].dontTell` |
| 5 | What to look at next | **免费行动价值**：未来几周可观察的具体事项 | `results[k].watch(a)` |
| 6 | Underneath current（条件层） | **深层命名**：把表面问题之下的真问题说出来（closure/cycle/decision/reassurance/meaning） | `underneath(a, pattern)` |
| 7 | Your best-fit next step | **决策层**：唯一最佳实践匹配 + 为什么匹配你的处境 + 个性化金按钮 CTA + 诚实替代项 + 选购指南 + before-you-pay 提醒 | `matchPractice()` × `practice` × `opts.ctaText` |
| 8 | ~~Email capture~~ | **已移除**（2026-09-20 用户决策：邮箱收集截断"结果 → 实践推荐"的转化动线，影响 aff 转化）。尾部现为 divider → fineprint → retake 直连 | — |
| 9 | Fineprint + retake | 诚实声明（渲染器内置，不可删）+ 重做入口 | 渲染器 |

设计约束：

- **结果页是诊断报告 + 推荐，不是文章。** 每层 1-3 段，总阅读时长 ≤ 90 秒。禁止在结果页塞 1500 词长文。
- 第 3 层（aha）解释的是**用户自己的心理机制**，不是对方的想法——与品牌"structured interpretation, not fake certainty"完全一致。
- 第 4 层的"不能告诉你"必须具体、诚实、不吓唬人。制造恐惧 = 廉价玄学站；解释边界 = 严肃决策平台。
- CTA 只在第 7 层出现一次（金按钮）。全站 `.btn-gold` = quiz 转化路径专用的纪律在结果页内同样有效：结果页内只允许一个金按钮。

---

## 2. Aha 匹配机制（确定性，禁止随机）

### 2.1 原则

aha-moment 文案（8 个进化心理学模式）是结果页的情绪峰值，但**必须可解释地匹配，禁止随机或伪随机**。匹配机制与 `underneath()` 同构：**有序规则链**，每条规则引用具体答案组合，第一个命中的规则胜出，最后一个规则是 quiz 级默认兜底。

为什么是规则链而不是标签计分：
- 与现有架构一致（`underneath()` 就是规则链）；
- 每条规则可读、可审、可测试——"为什么给这个用户看这个解释"永远有答案；
- 测试可以枚举每条规则分支，保证可达性与确定性。

### 2.2 契约

每个 v2 quiz 定义：

```js
matchAha: function (answers, patternKey) { /* 有序 if 链，必须 return 8 个合法 key 之一 */ }
```

- 输入：原始答案对象 + resolve() 算出的 pattern key。
- 输出：`window.MYSTICDO_AHA` 中存在的 key。
- 必须**全覆盖**：任何答案组合都有返回值（默认兜底规则）。
- 必须**确定性**：同一输入永远同一输出。禁止 `Math.random()`、日期、A/B 分流。

### 2.3 模式 × 信号映射表（love cluster）

| aha key | 模式 | 典型触发信号（答案组合） |
|---------|------|--------------------------|
| `choice_friction` | 两未来冻结（拖延决策=逃避损失） | `want=wait`（我该等还是该走） |
| `sudden_loss` | 丧钟级分离警报（新鲜结束） | `status=exes/separated` + 近期 trigger（distant/changed/conflict）或 `want=still` |
| `boundary_invasion` | 越界付出=缴保护费 | `effort=me` 且 pattern=one-sided/uneven（一个人在扛关系） |
| `toxic_loop` | 熟悉的痛被误认为安全 | `status=complicated` + 混合/单边 pattern；或"第二次第三次问同一种人" |
| `illusion_fixation` | 真空中的模式制造机 | pattern=not-enough-evidence；`trigger=unknown`；`want=beneath`（证据不足却剧情满溢） |
| `scarcity_panic` | 过度警觉的看门狗 | 忽冷忽热/变安静（hotcold/quieter/distant）；pattern 良好却仍不安（reassurance loop）；**love 题默认兜底** |
| `stagnation_void` | 节能型停滞（冬眠） | 预留给 career/direction 类 intent：`trigger=stalled`+低能量答案 |
| `identity_crisis` | 自我贬值=臣服信号 | 预留给 self-worth/career 类 intent：imposter 信号 |

规则顺序 = 诊断特异性从高到低：决策题 → 新鲜失去 → 单边付出 → 循环模式 → 证据真空 → 无因不安 → 默认警觉。**特异规则永远排在兜底之前。**

### 2.4 渲染

每个 aha 模式在 `MYSTICDO_AHA` 中携带：`name`（模式短名）、`heading`（区块标题，每个模式一句钩子）、`explanation`（2-3 段：命名你的处境 → 进化机制 → 重构）、`practice{name, text, mechanism}`（一个躯体化微练习 + 机制一句话）。

渲染位置：第 3 层（suggest 之后、信息缺口之前）。练习以 "Tonight, try this:" 呈现——先给免费价值，再在第 7 层提出付费路径。

文案纪律：保留进化心理学内核与第二人称力度；删绝对化断言；不出现"你的基因注定"这类决定论措辞；始终落在"这是过时但正常的反应，不是你的缺陷"。

---

## 3. CTA 架构（推荐层）

### 3.1 三层分离

```
结果页文案（推荐层）  →  MYSTICDO_OFFERS（配置层）  →  affiliate/自有产品（供应层）
```

- 结果页只引用逻辑 key（`slug:practiceKey`）。
- `window.MYSTICDO_OFFERS` 是唯一供应配置：`{ "does-he-love-me:psychic": { href, label, partner, disclosure } }`。
- 配置为空 → CTA 落到站内决策页（/psychic/、/tarot/ 等），行为与今天一致。
- 配置生效 → CTA href 换为 offer.href，自动加 `rel="sponsored nofollow"`、`target="_blank"`，并在按钮下渲染 disclosure 行。**换供应商只改配置，不动文案、不动引擎。**

### 3.2 个性化 CTA 文案（按意图，不是按商品）

CTA 承接的是用户刚才形成的需求，不是"买东西"。解析顺序：

1. `opts.ctaText[want + ':' + practiceKey]`（意图 × 实践，最具体）
2. `opts.ctaText['*:' + practiceKey]`（实践级默认）
3. `practice[practiceKey].cta`（库级兜底）

旗舰页示例：

| 意图 | practice | CTA |
|------|----------|-----|
| 他爱不爱我 (feelings) | psychic | Get personal insight into his feelings → |
| 他为什么变了 (why) | psychic | Get insight into what changed → |
| 等还是走 (wait) | tarot_decision | Get guidance on your next step → |
| 分手后他还想我吗 (still) | closure | Get a reading focused on closure → |
| 走向何方 (going/commit) | tarot_relationship | Get a reading on where this is heading → |
| 表层之下 (beneath) | tarot_deep | Get a deeper read on the connection → |

禁止文案："Book Now"（太普通）、"Learn More"（没动力）、任何"Buy/Purchase"。

### 3.3 CTA 前置句（为什么现在行动）

第 7 层引言固定结构："Based on your answers, this is the most relevant next step — matched to what you said you most want to know: "<用户答案原文>"."

配合第 4 层的缺口收尾句，完整逻辑链：我有问题 → quiz 整理了问题 → 但问题没真正解决 → 我知道为什么没解决 → 我知道下一步该找什么 → CTA。

### 3.4 诚实替代项永远在场

金按钮下方永远有：secondary（另一个方向的实践，文字链）+ choose-guide（选购框架与红旗）+ before-you-pay 提醒。这不是削弱转化，是品牌资产——用户被诚实对待过一次，才会回来第二次。

### 3.5 邮件捕获 = 不购买路径

第 8 层固定以 "Not ready for a reading?" 起头，把邮件定位成"还没准备好"的正当选择，而非次级转化。捕获的是"今天不点击的人"，是未来所有产品的起点资产。

---

## 4. 分析事件（PostHog）

| 事件 | 时机 | 属性 |
|------|------|------|
| `quiz_completed` | 结果渲染 | quiz, pattern, status, trigger, want, underneath, practice, **aha**（v2 新增） |
| `quiz_cta_click` | 金按钮点击 | quiz, practice, cta_href, **offer**（是否命中 MYSTICDO_OFFERS） |

核心 KPI：quiz 完成 → CTA 点击转化率，按 pattern × aha × practice 切片。这三层切片就是未来优化推荐层的全部依据。

---

## 5. 工程契约

- 渲染器：`window.mysticdoPatternResult(ctx, slug, opts)`。`opts.resultV2: true` 开启第 3/4/7/8 层的 v2 行为；未开启的 quiz 保持 v1 渲染（向后兼容，逐个迁移）。
- v2 必需：`QZ.matchAha`、`window.MYSTICDO_AHA`、`opts.canTell`（3 条）、`opts.ctaText`（至少 `*:practiceKey` 全覆盖）。
- 优雅降级：`matchAha` 或 `MYSTICDO_AHA` 缺失时跳过第 3 层，绝不抛错、绝不阻塞结果页。
- 结果页 DOM 全部在 modal overlay 内渲染，遵守现有性能约束：动画只用 opacity/transform，不引入 backdrop-filter。
- 测试：每个 v2 quiz 必须通过——(a) matchAha 全组合返回合法 key；(b) 同一输入两次调用结果相同；(c) 每条规则分支可达；(d) 渲染扫描不抛错且含 v2 区块标记；(e) `MYSTICDO_AHA` 8 key 数据完整。

## 6. 反模式（一票否决）

1. 结果页给出对他人内心的判词（"he probably loves you"）。
2. 列出多个实践让用户自己选。
3. 金按钮超过一个。
4. CTA 文案写死外部商家名或写 "Book Now / Buy"。
5. aha 匹配出现随机性，或解释内容指向"对方的心理"（只能解释用户自己）。
6. 信息缺口层用恐惧营销（"不问清楚你会失去他"）。
7. 把免责/劝退文案塞进 hero→quiz→CTA 转化动线（遵守 INTENT_PAGE_PROMPT.md §4 诚实放置规则；结果页的"诚实"体现在边界说明，不是劝退）。
8. 结果页变文章（任何一层超过 3 段）。

---

## 7. 迁移清单（复制引擎到其余 quiz / 未来 intent）

每个 quiz 迁移到 v2 需要且只需要：

1. 写 `matchAha(answers, pattern)` 规则链（用 §2.3 映射表，特异规则在前，默认兜底在后）。
2. 写 `opts.canTell` 3 条（这个 quiz 能告诉用户的三类东西）。
3. 写 `opts.ctaText`（至少覆盖该 quiz 全部可达 practiceKey 的 `*:` 默认文案；高流量意图补 `want:practice` 具体文案）。
4. `customResult` 的 opts 加 `resultV2: true`。
5. 测试文件补 v2 断言块（§5 测试清单）。
6. 跑 `scripts/test-love-quizzes.mjs` 全绿。
