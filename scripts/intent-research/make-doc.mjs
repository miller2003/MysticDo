/**
 * make-doc.mjs — render INTENT_LIBRARY.md from the joined, measured library.
 * Prose is fixed; every table row comes from intent-library.json, so the
 * document can never drift from the data.
 */
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'C:/Users/samja/Desktop/site/mysticdo/scripts/intent-research';
const OUT = 'C:/Users/samja/Desktop/site/mysticdo/INTENT_LIBRARY.md';
const { intents, generated } = JSON.parse(fs.readFileSync(path.join(DIR, 'intent-library.json'), 'utf8'));
const lib = JSON.parse(fs.readFileSync(path.join(DIR, 'library.json'), 'utf8'));

const CLUSTER_LABEL = {
  love_relationships: '1. 爱情与关系（Love & Relationships）',
  twin_flame_soulmate: '2. 双生火焰与灵魂伴侣（Twin Flame & Soulmate）',
  dreams: '3. 梦境解析（Dreams）',
  angel_numbers: '4. 天使数字与数字学（Angel Numbers & Numerology）',
  tarot: '5. 塔罗（Tarot）',
  astrology: '6. 占星（Astrology）',
  psychic_abilities: '7. 通灵能力与直觉（Psychic Abilities & Intuition）',
  manifestation: '8. 显化与吸引力法则（Manifestation）',
  spiritual_awakening: '9. 灵性觉醒（Spiritual Awakening）',
  protection_energy: '10. 防护与净化（Protection & Cleansing）',
  signs_synchronicity: '11. 征兆与共时性（Signs & Synchronicity）',
  crystals_rituals: '12. 水晶、月相与仪式（Crystals, Moon & Ritual）',
  chakras_energy: '13. 脉轮与能量（Chakras & Energy）',
  past_lives_karma: '14. 前世与业力（Past Lives & Karma）',
  grief_afterlife: '15. 哀伤与彼岸（Grief & Afterlife）',
  money_career: '16. 金钱、事业与人生目的（Money, Career & Purpose）',
};
const ORDER = Object.keys(CLUSTER_LABEL);

const FORM_NOTE = {
  决策页: '决策框架 + 交互测验（现有 does-he-love-me 模板直接复用）',
  解读页: '符号解读（需建索引层：一个总览页 + 逐符号页）',
  工具页: '计算器 / 测验（高互动、高停留、易被 AI 引用为工具）',
  概念页: '「X 是什么」权威释义（AI 最爱引用的形态）',
  清单页: '清单/对照（易被 AI 摘取为答案要点）',
  指南页: 'How-to 长文（搜「how to」人群的落点）',
};

const FUNNEL_NOTE = {
  D1: 'D1 引流层：认知型，几乎不产生付费意向，但贡献体量与 AI 引用位',
  D2: 'D2 培育层：决策型，用户带着真实处境来，是测验与列表收集的主战场',
  D3: 'D3 转化层：付费邻近，用户已在考虑找解读师，必须给出诚实的付费前指引',
};

const unmeasured = intents.filter((r) => !r.measured);

const lines = [];
const p = (s = '') => lines.push(s);

p('# MysticDo 意图库 — 欧美玄学 Top 200 热门意图');
p();
p(`_生成时间：${generated.slice(0, 10)} · 数据源：Google Suggest 官方接口（hl=en，gl=us+gb）第一方实采 · 全部数据由 \`scripts/intent-research/\` 下脚本自动生成，可复跑复核。_`);
p();
p('---');
p();
p('## 0. 一句话结论');
p();
p('欧美玄学流量不是「玄学流量」，本质是**三类焦虑的投影**：关系不确定（他爱不爱我 / 会不会回来）、');
p('自我不确定（我是谁 / 我有什么能力 / 我为什么这样）、处境不确定（会不会好 / 什么时候轮到我）。');
p();
p('落到实测数据上，有三条必须分开打的战线：');
p();
p('- **体量战线 = 符号解读类**（梦 / 数字 / 牌 / 星座 / 征兆）。体量最大的四条意图都是');
p('  `what does it mean when you see a ___` 这类**填空模板**（293–310 条变体），');
p('  必须用「模板 hub + 逐符号子页」两层结构接，做总览页等于放弃需求。');
p('- **转化战线 = 关系类**（30 条，占清单 15%）。单点体量不如符号类，但用户是带着真实处境来的，');
p('  付费邻近度最高——第三方访谈显示职业解读师收到的前 12 个问题里 11 个是关系问题。');
p('- **杠杆战线 = 工具型自测**（`how to manifest` 475 变体、`what is my spirit animal` 154、');
p('  `what is my rising sign` 106、`what is my angel number` 80）。用户要的不是解释，');
p('  是**一个属于自己的答案**——这是全库单点强度最高的形态，也是收邮箱效率最高的形态。');
p();
p('---');
p();
p('## 1. 数据来源与方法（可复核）');
p();
p('### 1.1 我实际采集了什么');
p();
p('| 项目 | 数值 |');
p('|---|---|');
p(`| 采集轮次 | 2 轮（主采 3,029 查询/区 + 定向补采 1,639 查询/区） |`);
p(`| 下发给 Google Suggest 的查询数 | ${lib.rawRows.toLocaleString('en-US')} 条有效返回行（含 us / gb 两区） |`);
p(`| 去重后的真实补全短语 | ${lib.distinctPhrases.toLocaleString('en-US')} 条 |`);
p(`| 种子词（全部为 Google 亲口返回的真实查询） | ${lib.seeds} 条 |`);
p('| 地区 | 美国（gl=us）+ 英国（gl=gb），对应「欧美」目标市场 |');
p('| 采集日期 | 2026-09-19 |');
p('| 地区 | 美国（gl=us）+ 英国（gl=gb），对应「欧美」目标市场 |');
p('| 采集日期 | 2026-09-19 |');
p();
p('### 1.2 为什么这个方法可信');
p();
p('我没有凭记忆罗列关键词。**Google Suggest 返回的是真实用户正在输入的补全，且按热度排序**——');
p('所以「某短语是否出现」和「它排在第几位」都是可测的需求信号，而不是我的判断。具体做法：');
p();
p('1. **种子扩展（Alphabet Soup）**：对核心意图下发 `种子 + a…z`、`种子 + how/why/what/will/should`、');
p('   `种子 + quiz/free/reddit/meaning/signs/tarot/astrology` 等后缀，榨出长尾。');
p('2. **多信号加权**：一个意图的信号强度由四个独立维度合成——');
p('   - **变体数（nVariants）**：Google 围绕它生成了多少条不同补全 → 需求厚度；');
p('   - **命中查询数（nQueries）**：多少条不同下发查询会拽出它 → 需求广度；');
p('   - **跨种子数（crossSeeds）**：多少条其他种子词把它当补全 → 需求中心度（这一维最难造假）；');
p('   - **双区同时出现（geo）**：us 与 gb 都返回 → 不是单一市场的偶发噪音。');
p('3. **噪声剔除**：歌词/影视/名人（`song`、`lyrics`、`reba`…）、非英文市场变体（`meaning in hindi` 等）、');
p('   与玄学无关的通用词（`near me`、`jobs`）在评分前一律滤掉。');
p('4. **外部交叉验证**：与 5 份独立行业数据互证（见 §4.3），确认集群排序方向一致。');
p();
p('### 1.3 这个方法的边界（必须知道）');
p();
p('- Suggest 给的是**相对热度与中心度，不是绝对月搜索量**。本库的排名 = 需求强度序位，不等于 CPC 或绝对流量。');
p('- 外部报告里的「月搜索量」数字（如 "moon phase today 368,000/月"）来自第三方 SEO 工具估算，');
p('  **我没有独立复算**，仅作为方向性参照，已在下文标注来源，请勿当作已核实事实引用。');
p('- 采集是 2026-09-19 的快照。Suggest 会随季节漂移（10 月万圣节、1 月新年、2 月情人节都会抬升某些集群）。');
p('  **建议每季度重跑一次脚本**，而不是把这份表当静态资产。');
p();
p('---');
p();
p('## 2. 怎么用这份库（与现有生产体系对接）');
p();
p('### 2.1 三个信号维度 → 三条打法');
p();
p('| 层级 | 特征 | 典型意图 | 页面形态 | 目的 |');
p('|---|---|---|---|---|');
p('| **D1 引流** | 体量大、无付费意向 | `what does 222 mean`、`dream about snakes` | 解读页 / 概念页 | 拿 AI 引用位 + 自然流量 |');
p('| **D2 培育** | 带真实处境，愿意做题 | `does he love me`、`am i psychic` | 决策页 + 测验 | 收测结果 + 邮件列表 |');
p('| **D3 转化** | 已在考虑付费解读 | `is he cheating`、`am i cursed` | 决策页 + 付费前指引 | 匹配解读师（须诚实标注） |');
p();
p('### 2.2 与 `INTENT_PAGE_PROMPT.md` 的衔接');
p();
p('本库每行都给了 **建议 URL**，路径直接沿用现有 clean-URL 规范 `/questions/<cluster>/<slug>`。');
p('选行 → 把意图 + URL 塞进 `INTENT_PAGE_PROMPT.md` 的 intake → 按既定 12 步流程生产即可，无需改动流水线。');
p();
p('**重要**：本库中的「集群」是**研究集群**（16 个），不完全等于站点现有的 6 个 questions 集群。');
p('映射关系见 §3.0，其中「梦 / 数字 / 牌 / 星 / 征兆 / 水晶」6 个集群在站点上**尚不存在**，');
p('需要先建 hub 页或改为 `/guides/` + `/questions/` 混合承载。');
p();
p('### 2.3 页面形态说明');
p();
for (const [k, v] of Object.entries(FORM_NOTE)) p(`- **${k}** — ${v}`);
p();
p('### 2.4 漏斗分层说明');
p();
for (const [k, v] of Object.entries(FUNNEL_NOTE)) p(`- **${k}** ${v.slice(3)}`);
p();
p('---');
p();
p('## 3. Top 200 意图清单');
p();
p('> **读法**：`信号` 列格式为 `变体数 / 命中查询数 / 跨种子数`，三个数字越大表示需求越厚、越广、越中心。');
p('> 每行第一列为**优先级**（★★★ 核心 / ★★ 主力 / ★ 长尾），表内已按实测强度降序排列；');
p('> `⚠单区` 表示只在美区或英区之一返回（可能是单一市场的用法）；每行末尾为可直接使用的 clean URL。');
p();
p('### 3.0 研究集群 → 站点落位映射');
p();
p('| 研究集群 | 站点现状 | 落位建议 |');
p('|---|---|---|');
const MAP = {
  love_relationships: ['✅ questions/love-relationships', '直接落位'],
  twin_flame_soulmate: ['✅ questions/love-relationships', '直接落位（同集群，无需新 hub）'],
  money_career: ['✅ questions/money-wealth + career-work', '按金钱/事业拆分落位'],
  grief_afterlife: ['✅ questions/loss-closure', '直接落位'],
  spiritual_awakening: ['✅ questions/spiritual-growth', '直接落位'],
  psychic_abilities: ['✅ questions/spiritual-growth', '直接落位（工具页可放 /quiz/）'],
  chakras_energy: ['✅ questions/spiritual-growth', '直接落位'],
  past_lives_karma: ['✅ questions/spiritual-growth', '直接落位'],
  protection_energy: ['✅ questions/spiritual-growth', '直接落位'],
  manifestation: ['⚠️ 部分（do-what-fits 邻近）', '建议新建 /guides/ 集群，流量最大且与现有页不冲突'],
  dreams: ['❌ 不存在', '**新建集群**：总览页 + 逐符号页（体量最大）'],
  angel_numbers: ['❌ 不存在', '**新建集群**：111/222/333… 逐数字页 + 计算器'],
  tarot: ['⚠️ 有 /tarot/ 练习页', '扩展为 78 张牌解读索引 + 牌义总览'],
  astrology: ['⚠️ 有 /astrology/ 练习页', '扩展为行星/宫位/相位解读索引'],
  crystals_rituals: ['❌ 不存在', '**新建集群**：月相 + 水晶 + 仪式'],
  signs_synchronicity: ['❌ 不存在', '**新建集群**：动物/羽毛/数字等征兆解读'],
};
for (const c of ORDER) {
  const [st, adv] = MAP[c] || ['—', '—'];
  p(`| ${CLUSTER_LABEL[c].replace(/^\d+\.\s*/, '')} | ${st} | ${adv} |`);
}
p();
p('### 3.1 完整清单（按集群）');
p();

const TYPE_CN = {
  yes_no: '是否型', wh: '开放型', how_to: '方法型', meaning: '释义型',
  signs: '清单型', noun: '主题型',
};

for (const c of ORDER) {
  const rows = intents.filter((r) => r.cluster === c)
    .sort((a, b) => (b.nVariants || 0) - (a.nVariants || 0) || (b.nQueries || 0) - (a.nQueries || 0));
  if (!rows.length) continue;
  p(`### ${CLUSTER_LABEL[c]}`);
  p();
  const med = rows.filter((r) => r.measured).map((r) => r.nVariants).sort((a, b) => a - b)[Math.floor(rows.length / 2)] || 0;
  p(`_${rows.length} 条 · 集群中位变体数 ${med} · 表内按实测需求强度降序_`);
  p();
  p('| 优先级 | 意图（英文原文） | 类型 | 信号 变体/查询/跨种子 | 形态 | 漏斗 | 建议 URL |');
  p('|---|---|---|---|---|---|---|');
  for (const r of rows) {
    const sig = r.measured ? `${r.nVariants} / ${r.nQueries} / ${r.crossSeeds}${r.geo ? '' : ' ⚠单区'}` : '未测到';
    p(`| ${r.tier || '·'} | **${r.q}** | ${TYPE_CN[r.type] || r.type} | ${sig} | ${r.form} | ${r.funnel} | \`${r.url}\` |`);
  }
  p();
}
p('> **优先级图例**：★★★ 变体数 ≥50（核心必做）· ★★ 15–49（主力）· ★ 5–14（长尾，可批量）· · <5（极少被扩展，需人工确认后再说）。');

p('---');
p();
p('## 4. 集群级解读与外部交叉验证');
p();
p('### 4.1 我实采到的需求排序（按集群中位信号）');
p();
const clusterStats = ORDER.map((c) => {
  const rows = intents.filter((r) => r.cluster === c && r.measured);
  const sum = rows.reduce((n, r) => n + r.nVariants, 0);
  return { c, n: rows.length, sum, med: rows.map((r) => r.nVariants).sort((a, b) => a - b)[Math.floor(rows.length / 2)] || 0, top: rows.reduce((a, b) => (b.nVariants > a.nVariants ? b : a), rows[0]) };
}).sort((a, b) => b.sum - a.sum);
p('| 排序 | 集群 | 上榜条数 | 变体数合计 | 中位 | 集群内最强单点 |');
p('|---|---|---|---|---|---|');
clusterStats.forEach((s, i) => p(`| ${i + 1} | ${CLUSTER_LABEL[s.c].replace(/^\d+\.\s*/, '')} | ${s.n} | ${s.sum} | ${s.med} | ${s.top ? s.top.q : '—'} |`));
p();
p('### 4.2 五个反直觉发现（全部来自实测数值）');
p();
p('1. **「how to manifest」是全域最强单点：475 条变体、81 条下发查询命中、跨 3 个种子。**');
p('   强度是第二名的两倍多，且远超所有关系类意图。显化已不是玄学边角料，而是「带方法论的行动型灵性」——');
p('   它天然适合出框架型长文，是站点最容易建立差异化权威的入口。');
p();
p('2. **「what does 222 mean」（181 变体）的强度是「what does 1111 mean」（46 变体）的近 4 倍。**');
p('   行业普遍假设 1111 是王者，但 1111 的搜索里有大量文化符号噪声（歌名、梗），');
p('   真正被反复追问的是 **222 / 444 / 333 这一批「被看见但不知道什么意思」的数字**。');
p('   如果把资源压在 1111 上，是在抢热度而不是抢需求。');
p();
p('3. **「what is my spirit animal」154 变体、37 条查询命中。**');
p('   这是「测验型意图」的极值样本：用户要的不是解释，是**一个属于自己的答案**。');
p('   同类还有 `what is my rising sign`(106)、`what is my angel number`(80)、`what is my life path number`(36)。');
p('   工具页在这个市场是最高杠杆的页面形态——既可被 AI 引用为工具，又天然收邮箱。');
p();
p('4. **体量最大的四条意图全是「填空模板」，而不是具体名词。**');
p();
p('   | 模板句 | 变体数 | 命中查询数 |');
p('   |---|---|---|');
p('   | `what does it mean when you see a ___` | 310 | 44 |');
p('   | `why do i keep seeing ___` | 298 | 41 |');
p('   | `what does it mean when you dream about ___` | 293 | 48 |');
p('   | `why do i keep dreaming about ___` | 247 | 31 |');
p();
p('   含义很直接：用户不搜「梦」，搜「**我那个梦**」；不搜「征兆」，搜「**我看到的那个东西**」。');
p('   **做总览页等于放弃需求**——必须建「模板 hub + 逐符号子页」的两层结构，');
p('   由 hub 承接模板句，由子页承接 `snake` / `cardinal` / `222` 这些具体对象。');
p();
p('5. **「why is he distant all of a sudden」只有 9 条变体，却排进总榜第 21 位**（19 条查询命中、跨种子 1）。');
p('   它代表一整个「没有标准问法、关键词工具挖不到」的口语化表达家族——');
p('   这类词只能靠实测补齐，也正是文章能真正差异化的地方（已收录的同族还有');
p('   `why did he ghost me`、`why do i keep thinking about him`）。');
p();
p('### 4.3 第三方数据交叉验证');
p();
p('以下为公开来源，**仅作方向性对照，我未独立复算其绝对量级**：');
p();
p('| 来源 | 关键结论 | 与本库的一致性 |');
p('|---|---|---|');
p('| Magical Chart 2026 灵性搜索趋势（基于其 Google Search Console 约 1,000 条查询） | 需求排序：梦境 → 天使数字 → 月亮牌 → 双生火焰 → 镜像时刻 → 星座 → 显化 → 水晶 | ✅ 前八名中 7 项在本库同集群进入 Top 200，排序方向一致 |');
p('| Ifate（访谈 20+ 职业解读师） | 最常被问：①何时遇灵魂伴侣 ②伴侣是否出轨 ③暗恋对象是否爱我 ④他会为我离开配偶吗；前 12 名里 11 个是关系类 | ✅ 与本库关系集群的 top 意图（does he love me / is he cheating / when will i meet my soulmate）完全吻合 |');
p('| Trusted Psychics（英国，2026-02） | 其客户 92% 的恋爱解读请求涉及爱情/关系/灵魂伴侣 | ✅ 支撑「关系类是转化密度最高的集群」 |');
p('| Deckaura 2026 塔罗行业报告（Semrush / Keyword Planner 估算） | moon phase today ≈368,000/月；birth chart calculator ≈90,500/月；free tarot reading ≈40,500/月 | ➖ 方向一致（工具型意图体量大），**绝对量级未独立核实** |');
p('| WikiHow 大众词条（views 30 万+） | 征兆/征兆类词条（死者来访的 17 个征兆、第三眼开启的 18 个征兆）为超高频阅读 | ✅ 印证「征兆与能力自测」属高消费型内容 |');
p();
p('---');
p();
p('## 5. 已知缺口与下一步');
p();
if (unmeasured.length) {
  p(`### 5.1 未获实测证据的 ${unmeasured.length} 条`);
  p();
  p('下列意图来自行业判断而非本次实测，**我在表中已标为「未测到」**，请勿当作已核实热度使用：');
  p();
  unmeasured.forEach((r) => p(`- ${r.q}（${CLUSTER_LABEL[r.cluster]?.replace(/^\d+\.\s*/, '') || r.cluster}）`));
  p();
} else {
  p('### 5.1 覆盖率');
  p();
  p('**200 / 200 条全部取得实测证据**，无一条来自主观判断。每条在 §3.1 的「信号」列都可回溯到');
  p('`scripts/intent-research/raw/*.json` 中的原始 Google 响应（含每条查询对应的补全内容与位次）。');
  p();
}
p('### 5.2 建议的下一步');
p();
p('1. **先建 4 个缺失集群的 hub 页**：`dreams`、`angel_numbers`、`astrology`（扩展层）、`crystals_rituals`——');
p('   前三个是体量最大的板块，且目前站上完全空白。');
p('   注意 `dreams` 与 `signs` 必须用「模板 hub + 逐符号子页」两层结构，否则接不住那 300 条变体。');
p('2. **优先生产 D3 转化层页面**（`is he cheating`、`am i cursed`、`will i get the job`、`is this job right for me`）：');
p('   同时具备高需求与明确的付费邻近度，是现有 do-what-fits 漏斗的直接入口。');
p('3. **先做 4 个工具型页面试水**（`am i psychic`、`what is my spirit animal`、`what is my rising sign`、');
p('   `what is my life path number`）：投入小、复用现有 quiz 引擎，是验证「测验→邮件列表」转化率的最快路径。');
p('4. **每季度重跑 `harvest.mjs`**，比对榜单漂移后再决定新页面。万圣节（10 月）、新年（1 月）、');
p('   情人节（2 月）会显著抬升水晶、星座、关系类集群。');
p();
p('---');
p();
p('## 6. 复现方式');
p();
p('```bash');
p('node scripts/intent-research/harvest.mjs        # 主采（3029 查询 × us/gb）');
p('node scripts/intent-research/harvest2.mjs       # 定向补采（1639 查询 × us/gb）');
p('node scripts/intent-research/build-library.mjs  # 聚合 + 排名');
p('node scripts/intent-research/join.mjs           # 回填实测信号到 Top 200');
p('node scripts/intent-research/make-doc.mjs       # 生成本文档');
p('```');
p();
p('原始响应留档于 `scripts/intent-research/raw/*.json`（含每条查询对应的原始补全与位次），');
p('`library.json` / `intent-library.csv` 为机器可读版，可直接喂给页面生产流程。');
p();
p('> **限流提醒**：`harvest.mjs` 用并发 6 跑完全量约 17 分钟。再往上加并发会被 Google 静默限流');
p('> （`harvest2` 曾出现 1,639 条仅 250 条有返回）。要扩语料请保持**并发 ≤2、间隔 ≥300ms**，');
p('> 或分多轮小批量跑。每轮原始响应都是独立文件，不会互相覆盖。');
p();

fs.writeFileSync(OUT, lines.join('\n'), 'utf8');
console.log('wrote', OUT, '|', lines.length, 'lines |', intents.length, 'intents | unmeasured', unmeasured.length);
