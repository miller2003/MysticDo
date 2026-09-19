# 邮件系统安装手册（MailerLite + Cloudflare）

> 面向：不懂技术也能照着做。全程网页操作，不需要安装任何软件。
> 代码部分我已经写完并测试通过（40 项自动化测试）。这份手册只讲**只有你能做**的事：注册、复制、粘贴。

---

## 0. 三十秒看懂原理

```
访客在网站填邮箱
      ↓
本站 /api/subscribe（Cloudflare Worker）
      ↓  密钥藏在这里，访客看不到
MailerLite 的订阅者列表
      ↓
你以后在 MailerLite 后台写信、群发、看谁打开了
```

**为什么不能直接连？** 因为邮箱平台的密钥一旦写进网页，任何人都能拿走它冒充你发垃圾邮件。所以中间必须隔一层 Worker 做代理。

---

## 1. 分三阶段，可以分开做

| 阶段 | 做完之后 | 时间 | 必须吗 |
|---|---|---|---|
| **一、接通订阅** | 访客订阅真的进列表（页面上显示 "You're subscribed."） | ~20 分钟 | ✅ 必须 |
| **二、配好发件身份** | 邮件不容易进垃圾箱，访客回复能进你邮箱 | ~15 分钟 | 强烈建议 |
| **三、欢迎邮件 + 联系表单送达** | 新人自动收到欢迎信；联系表单真正发到你邮箱 | ~10 分钟 | 可选 |

**建议顺序：先把阶段一做通、验证成功，再做二和三。** 一次做太多容易乱。

---

## 阶段一：接通订阅（约 20 分钟）

### 1.1 注册 MailerLite

1. 浏览器打开 → **https://www.mailerlite.com/**
2. 点右上角 **Sign up free**（免费注册）
3. 填你的常用邮箱 + 密码。这个邮箱是你以后登录用的
4. 去邮箱收确认信，点里面的链接激活
5. 登录后，右上角头像 → **Language** → 可以切换成**中文界面**

> ⚠️ **可能会被人工审核**：MailerLite 大约有 30% 的新账号需要 1–3 个工作日人工审核。被要求填资料时，这样填能快速通过：
> - 公司/网站名：`MysticDo`
> - 网站地址：`https://mysticdo.com`
> - 你的订阅者来源：`Website signup form on mysticdo.com`
> - 如果它要求用域名邮箱注册而你没有，先跳过，用个人邮箱即可（不影响后面）

### 1.2 先处理首页那个 "Let's get you started" 清单

你一进后台会看到中间有个 4 步引导清单。**除了第 4 步，其他现在都不用做**，可以点右下角 **Dismiss checklist** 先收起来：

| 清单里的那一步 | 要不要做 |
|---|---|
| 1. Give subscribers a way to sign up | ❌ **不用**。那是给"用 MailerLite 自带表单/弹窗"的人准备的。你的订阅表单已经在你自己的网站上，通过 API 直接写进列表——正是我们这一步在配的东西 |
| 2. Set up your brand styles | ⏸ 可选。以后想让 MailerLite 发出的邮件更像你的品牌再弄 |
| 3. Engage your subscribers | ⏸ 以后做（就是阶段三的自动欢迎邮件） |
| 4. Connect your domain | ✅ **以后要做**，就是阶段二——让邮件别进垃圾箱 |

> 界面是英文的？左侧 **Account settings** 里可以找 **Language** 切成简体中文（找不到也没关系，按本手册的英文菜单名点就行）。

### 1.3 建一个分组（Group）

分组是用来装"从网站表单订阅来的人"的，以后发信就发给这个组。

1. 左侧菜单点 **Subscribers**
2. 页面上方切到 **Groups** 标签（旁边一般还有 Subscribers / Segments / Fields）
3. 点右上角 **Create group**
4. 名字填：`MysticDo Subscribers` → 保存
5. **点进刚建好的这个组**，看浏览器**地址栏**（不是页面里的文字），找到类似这样的一串：

   `app.mailerlite.com/subscribers/groups/123456789012345678`

   最后那串**纯数字**就是 Group ID。复制下来先存记事本。

### 1.4 生成 API 密钥

1. 左侧菜单点 **Integrations**
2. 在列表里找到 **MailerLite API**（可能需要往下滚一点）
3. 点 **Use** 或 **Generate new token**
4. 名字填 `mysticdo-website`
5. 点生成 → **立刻复制**出现的那串字符（很长，通常以 `eyJ` 开头）

> ⚠️ **这个 token 只显示一次，关掉就再也看不到了。** 先粘到记事本。如果丢了，删掉重新生成一个即可。

### 1.5 把密钥放进 Cloudflare（关键一步）

> ⚠️ **这一步最容易填错，先看懂两个框的区别再动手：**
>
> ### 中文界面的「密钥」出现了两次，含义完全不同
>
> | 界面上的位置 | 真正的含义 | 你要填什么 |
> |---|---|---|
> | **左边那行的标签**「密钥」（英文版是 Name） | 变量的**名字** | **英文字母**开头的标识符，逐字照抄下面的表 |
> | **右边的小开关**「密钥」（带勾选框） | 是否加密保存 | 保持**勾选**即可 |
>
> ### 每个变量是「名字 + 数据」的一对，不能交叉配
>
> - **名字**必须是英文字母（代码按这个名字去读数据）
> - **数据**（token 或数字）填在「值」栏
>
> **★ 最常见的两个错误：**
> 1. 把 token 填进了「密钥」（名字）栏 → 报错"变量名称必须以字母开头"。**token 是数据，不是名字。**
> 2. 名字和数据配错对（比如名字写 API_KEY、值却填 Group ID）→ 不报错，但 `/api/health` 会一直显示 `not_configured`。
>
> **填完之后自查一遍：名字是纯英文标识符，值才是 token / 数字。**

要加的是**两个独立变量**：

| | Name（名称）— 逐字照抄 | Value（值）— 粘贴 |
|---|---|---|
| 第 1 个 | `MAILERLITE_API_KEY` | 1.4 复制的**那串很长的 token**（`eyJ` 开头） |
| 第 2 个 | `MAILERLITE_GROUP_ID` | 1.3 复制的**那串纯数字** |

操作：

1. 打开 → **https://dash.cloudflare.com/** 并登录
2. 左侧 **Workers & Pages** → 点你的 Worker，名字是 **mysticdo**
3. 顶部 **Settings（设置）** → 左侧 **Variables and Secrets（变量和密钥）**
4. 点 **Add（添加）**，类型保持 **Secret（加密）**
   - **Name** 填：`MAILERLITE_API_KEY`
   - **Value** 粘贴：那串 token
5. 点 **+ 添加** 再开一行（一次把两个都加上再部署）：
   - **Name** 填：`MAILERLITE_GROUP_ID`
   - **Value** 粘贴：那串数字
6. 点 **Add 2 variables and deploy**（按钮上会显示你加了几条）

> ✅ **名称必须一字不差**：全大写 + 下划线。写成小写 `mailerlite_api_key`、或带短横线的 `MAILERLITE-API-KEY`，代码都读不到 → `/api/health` 会一直显示 `not_configured`。
> ✅ **token 要完整**：很长，别只复制开头一小段。
> ⚠️ 密钥属于敏感信息，截图分享前记得遮一下。

保存后 Cloudflare 会自动重新部署，等 1 分钟左右。

### 1.6 验证是否成功

打开这个网址：

**https://mysticdo.com/api/health**

看到 `"subscribe": "configured"` 就说明密钥生效了。
（如果显示 `"not_configured"`，说明 Secret 名字拼错了或还没部署完，等 1 分钟刷新再看。）

然后自己实测一遍：

1. 打开 **https://mysticdo.com/join**
2. 填一个**你自己的邮箱**，提交
3. 页面上应该显示 **"You're subscribed."**（不再是 "Noted on this device."）
4. 去 MailerLite 后台 → **订阅者** → 应该能看到这个邮箱

**到这里，核心功能就通了。** 🎉

---

## 阶段二：配好发件身份（约 15 分钟，强烈建议）

不做这一步，你的邮件会从 MailerLite 的公共地址发出，**容易进垃圾箱**，读者看到的发件人也是乱码地址。

三小步，**2.1 必须先做**（它是 2.2 和阶段三的前提）。

### 2.1 让 hello@mysticdo.com 能收信（Cloudflare Email Routing，免费）

**为什么做**：你以后发出的邮件，发件人显示 `hello@mysticdo.com`。读者直接回复那封信时，得有人收得到——这一步就是给这个地址装一条"转接到你个人邮箱"的通道。

1. Cloudflare 控制台 → 点 **mysticdo.com** 这个域名
2. 左侧 **「电子邮件」** → **「电子邮件路由」**（英文版：Email → Email Routing）
3. 点 **启用**；它问"要不要自动添加 MX 记录" → **同意**（它自动加，不用你手动填）
4. **先加"目标地址"**：点顶部标签 **「目标地址」**（英文：Destination addresses）→ 添加你的**个人邮箱**（Gmail 之类）
5. 去那个个人邮箱收 Cloudflare 的验证信 → 点里面的**确认链接** → 回来确认状态变成「已验证」
6. **再建"自定义地址"**：点顶部标签 **「路由规则」**（英文：Routing rules）→ 找到自定义地址区块 → **创建地址**：
   - 自定义地址填 `hello`（或完整 `hello@mysticdo.com`）→ 操作选**「发送到」** → 目标选你刚验证的个人邮箱
   - 再建一个 `contact@mysticdo.com`（阶段三的联系表单要用）

> ⚠️ **顺序不能反**：必须先有"已验证的目标地址"，才能创建自定义地址，否则下拉框里选不到目标。

#### 界面术语对照（中文 ↔ 英文）

| 中文界面 | 英文界面 | 在这里干什么 |
|---|---|---|
| **目标地址** | Destination addresses | 添加并验证你要收信的个人邮箱 |
| **路由规则** | Routing rules | 创建 `hello@mysticdo.com` 这类地址 |
| 活动日志 | Activity log | 看转发有没有成功（排查用） |
| 设置 → DNS 记录 | Settings → DNS records | 查看 MX / SPF 是否正常 |

> 💡 **MX 记录显示「已锁定」是正常的**——说明 Cloudflare 在自动管理，你不用动它。

**配完自测**：用你另一个邮箱给 `hello@mysticdo.com` 发一封信，看个人邮箱能不能收到。

> ⚠️ **前提检查**：如果你这个域名**已经在用企业邮箱**（Google Workspace、腾讯企业邮等），启用 Email Routing 会改 MX 记录、导致原邮箱收不到信。你目前用个人邮箱，所以**没问题**；如果以后要接企业邮箱，先告诉我。

### 2.2 在 MailerLite 里验证"发件域名"

**目的**：让邮件服务商（Gmail 等）确认"这封信确实来自 mysticdo.com"（技术上叫 SPF / DKIM）。不做的后果是进垃圾箱，或显示"通过 mailerlite.com 代发"。

1. MailerLite 后台 → 左侧 **Account settings（账户设置）** → 找 **Domains（域名）**
2. 点 **Add domain** → 填 `mysticdo.com`
3. MailerLite 生成几条 DNS 记录（一般 1 条 TXT = SPF，加 1–2 条 CNAME = DKIM）
4. **新开一个标签页** → Cloudflare → **mysticdo.com** → 左侧 **DNS** → **Records**
5. 把 MailerLite 给的记录**一条一条照抄**加进去：
   - 点 **Add record**，Type / Name / Content 逐字复制（区分大小写）
   - ⚠️ **加 CNAME 时，把"代理状态"点成灰色（DNS only）**——Cloudflare 默认橙色（Proxied），橙色会挡住验证，必须点灰
6. 全部加完，回 MailerLite 点 **Verify（验证）**
7. 显示 **Verified / 绿色对勾** = 成功

> 💡 **如果免费版找不到 Domains 入口**：MailerLite 免费版不含"自定义域名"功能——但那指的是把**它的落地页**挂在你域名下（我们不需要）。发件域名认证**通常**免费版可用。万一点不进去，告诉我，两条备选：
> - **① 先不认证**：邮件照样能发，只是容易进垃圾箱、发件人显示 MailerLite 的地址。**对你现在的阶段完全够用。**
> - **② 升级 Comfort（$12/月）**：等订阅者多了再决定值不值。
>
> 结论：这一步**做不成也不影响系统运行**，别为它卡住。

### 2.3 设置发件人并做第一次测试

1. MailerLite → **Account settings** → 找 **Sender（发件人信息）**，填：
   - 名字：`MysticDo`
   - 邮箱：`hello@mysticdo.com`
2. 测试：**Campaigns** → **Create campaign** → 收件人选 `MysticDo Subscribers` → 随便写个标题正文 → 用**发送测试邮件**功能发到你个人邮箱
3. 检查那封信：
   - 发件人是否显示 `MysticDo <hello@mysticdo.com>`？
   - 有没有进垃圾箱？（进了说明 2.2 没生效，或 DNS 还没生效，等几小时）

---

## 阶段三：欢迎邮件 + 联系表单（约 10 分钟）

### 3.1 自动欢迎邮件（新订阅者自动收到）

1. MailerLite → 左侧 **Automations（自动化）** → **Create new automation**
2. 触发条件（Trigger）选：**Subscriber joins a group**（订阅者加入分组）→ 选 `MysticDo Subscribers`
3. 下一步加一个 **Email** 动作 → 打开邮件编辑器
4. 写欢迎信（下面有可直接用的英文草稿）
5. 右上角保存 → 把**启用开关打开**（不打开不会跑）

免费版可建 3 个自动化流程，够用。

**怎么验证它真的在工作**：用另一个邮箱去 https://mysticdo.com/join 订阅一次，几分钟内那个邮箱应该收到欢迎信（第一次可能延迟几分钟）。

#### 欢迎信草稿（可直接抄；你的读者是英文用户，所以是英文）

**Subject：** `You're in — here's what to expect`

**Preview text（可选）：** `One note a week. Decision guides, not horoscopes.`

**正文：**

> Hi,
>
> Thanks for joining MysticDo — glad you're here.
>
> Quick note on what this is. MysticDo isn't a horoscope newsletter. It's a decision guide for people who are about to spend money on a spiritual service and want to know whether it's worth it, which kind actually fits their situation, and how to avoid the obvious traps.
>
> **What you'll get:** roughly one email a week —
> - one decision guide (what things cost, how to tell legit from not, how to choose)
> - one free tool or exercise you can use in five minutes
> - occasionally, a plain-language note about how this industry actually works
>
> **What you won't get:** daily horoscopes, affiliate link dumps, or anything that pretends to know your future.
>
> One thing worth knowing up front: I'm not here to tell you what to believe. I'm here to help you decide what to do next — and to say "skip it, save your money" when that's the honest answer.
>
> If you ever want a specific question answered, just reply to this email. Replies land in my inbox.
>
> — MysticDo
> mysticdo.com

> 💡 这段文案刻意保持了与网站一致的语气：冷静、证据化、不承诺超自然效果。你可以先原样用，跑几期再按自己的表达调整。**注意别加"我们会预测你的未来"这类话**——那会和你方法论页面的承诺矛盾。

### 3.2 让联系表单真正送达

现在联系表单会诚实地说"暂存在本机"。要让它真正发到你邮箱：

**你先做：**
1. 确认阶段 **2.1（Email Routing）已配好并通过验证**
2. 把**你要收信的个人邮箱地址**告诉我

**我随后做**（你提供邮箱后我改代码，你 push 一次即可）：
- 在 `wrangler.jsonc` 里加上 Cloudflare 的免费发信配置（`send_email` binding）
- 部署后 `/api/health` 里的 `contact` 会从 `not_configured` 变成 `configured`
- 你在网站联系页发一条测试消息，检查个人邮箱是否收到

> ⚠️ **安全说明**：这个配置在 Cloudflare 侧被硬性限制为**只能发到你自己验证过的那个邮箱**，所以即使配置泄露也无法被人拿去群发垃圾邮件。

---

## 4. 费用：从 0 到 250 订阅者，全程 $0

**先说结论：MailerLite 免费档是"永久免费"（Forever Free），注册不需要信用卡，我也没有给你接任何要付费的东西。** 你现在从头做完整套流程，花费是 0 元。

**三条"不会偷偷扣钱"的保证：**

1. **注册不用填卡号。** 官方注册页原话：*No credit card required.*
2. **超限 ≠ 扣费。** 免费档超出额度后是**暂停**（暂停发送、暂停新增订阅者），不是自动升级、不是自动扣款。官方原话：免费账号**只有在你主动选择升级时**才会产生费用。
3. **高级功能试用期到期不会变成付费订阅。** 注册后有一段高级功能试用（14–30 天），到期自动回落到免费档，不扣费，订阅者数据也不会被删。

**Cloudflare 那边同样是免费的**，全部落在免费额度内：

| 项目 | 免费额度 | 你的实际用量 |
|---|---|---|
| Worker 请求 | 10 万次/天 | 现在一天可能不到 100 次 |
| 网站文件分发 | 10 GB | 约 20 MB |
| 收信转发（阶段二） | 免费 | — |

**唯一的付费触发点是你主动升级**，一般只有两种情况：想移除邮件页脚的 MailerLite 标识，或者订阅者超过 250 人还想继续增长。

**250 人满了又暂时不想花钱，有两条免费出路：**

- **清理不活跃订阅者。** 免费额度只算**活跃**订阅者——已退订的、退信的人**不占额度**。MailerLite 后台有专门的清理工具（Subscribers → Clean up inactive）。
- **换到 Kit（原 ConvertKit）：免费档 10,000 订阅者**，额度大 40 倍，代价是英文界面、操作稍复杂。想换跟我说一声，我改一行上游地址即可——**现在写的代码不会白费**。

---

## 5. 额度限制一览（免费档）

MailerLite 免费版（2026 年 6 月起）：

| 项目 | 免费版额度 | 说明 |
|---|---|---|
| 订阅者上限 | **250 人** | 达到 250 后，新订阅会被暂停，你有两个选择：清理不活跃的人，或升级 |
| 每月发信量 | **2,500 封** | 250 人 × 每周 1 封 ≈ 每月 1,000 封，够用 |
| 邮件上的 MailerLite 标识 | **有** | 免费版去不掉，升级后可用自己品牌 |
| API | 可用（**仅限管理订阅者，不能通过 API 发信**） | 我们的用法正好落在允许范围内 ✅ |

**什么时候需要升级？** 只有当你接近 250 人、并且还想继续增长时。下一个档位是 **Comfort：$12/月（500 订阅者）**，按月付费、随时可取消。

---

## 6. 出问题怎么排查

| 现象 | 原因 | 怎么办 |
|---|---|---|
| `/api/health` 显示 `not_configured` | Secret 名称拼错 / 还没部署完 | 检查名称是否**精确**为 `MAILERLITE_API_KEY`，等 1 分钟再刷新 |
| 提交后仍显示 "Noted on this device." | 密钥没生效，或 token 无效 | 看 `/api/health`；确认 token 完整（以 `eyJ` 开头）没漏字符 |
| MailerLite 里看不到订阅者 | Group ID 填错 | 重做 1.3，只复制**纯数字**部分 |
| 邮件进垃圾箱 | 阶段二没做 | 完成 2.1 / 2.2 |
| 提示 401 / Unauthorized | token 被删了或复制不全 | 在 Integrations 里重新生成一个，更新 Cloudflare 里的 Secret |
| 提示已达到订阅者上限 | 超过 250 人 | 清理不活跃订阅者，或升级 Comfort |

**任何一步卡住，把截图发我，我帮你判断。**

---

## 7. 我这边已完成的部分（供参考）

- `worker/_lib/subscribe.js` —— 新增 `/api/subscribe`（转发到 MailerLite）和 `/api/contact`（走 Cloudflare 发信）两个接口
- `worker/index.js` —— 接入路由；`/api/health` 增加邮件配置状态自检
- `assets/js/main.js`、`join.html`、`contact.html` —— 表单改为提交到站内接口，不再需要你手动配置任何前端变量
- `scripts/test-email-api.mjs` —— 40 项测试，覆盖正常路径、上游故障、密钥缺失、机器人提交、超长请求等
- 安全设计：密钥只存在于 Cloudflare 服务端；带蜜罐字段拦截机器人；请求体大小限制；邮件头注入防护；未配置时诚实降级而不是假装成功
