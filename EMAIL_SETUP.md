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

### 1.2 建一个分组（Group）

分组是用来装"从网站表单订阅来的人"的，以后发信就发给这个组。

1. 左侧菜单 → **订阅者 / Subscribers** → **Groups（分组）**
2. 点 **Create group**（创建分组）
3. 名字填：`MysticDo Subscribers`
4. 创建好后**点进这个分组**，看浏览器地址栏，找到类似这一串数字：

   `.../subscribers/groups/123456789012345678`

   波浪线后面那串**纯数字**就是 Group ID，复制下来先存在记事本。

### 1.3 生成 API 密钥

1. 右上角头像 → **Integrations（集成）**
2. 找到 **MailerLite API** → 点 **Use** / **Generate new token**
3. 名字随便填，比如 `mysticdo-website`
4. **复制生成的 token**（很长的一串字符，通常以 `eyJ` 开头）

> ⚠️ **这个 token 只显示一次，关掉就再也看不到了。** 先粘到记事本。如果丢了，删掉重新生成一个即可。

### 1.4 把密钥放进 Cloudflare（关键一步）

1. 打开 → **https://dash.cloudflare.com/** 并登录
2. 左侧 **Workers & Pages** → 点你的 Worker，名字是 **mysticdo**
3. 顶部 **Settings（设置）** → 左侧 **Variables and Secrets（变量和密钥）**
4. 点 **Add（添加）** → 类型选 **Secret（密钥）**
   - Name（名称）填：`MAILERLITE_API_KEY`
   - Value（值）粘贴刚才复制的 token
   - 保存
5. 再点一次 **Add**：
   - Name 填：`MAILERLITE_GROUP_ID`
   - Value 粘贴 1.2 复制的**数字** Group ID
   - 保存

保存后 Cloudflare 会自动重新部署，等 1 分钟左右。

### 1.5 验证是否成功

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

不配这一步，你的邮件会从 MailerLite 的公共地址发出，**容易进垃圾箱**，看起来也不够专业。

### 2.1 让 hello@mysticdo.com 能收信（Cloudflare Email Routing，免费）

1. Cloudflare 控制台 → 点 **mysticdo.com** 这个域名
2. 左侧找 **Email（电子邮件）** → **Email Routing（电子邮件路由）**
3. 点 **Enable / 启用**，它问是否自动添加 MX 记录 → **同意**
4. 在 **Destination addresses（目标地址）** 里添加你的**个人邮箱**
5. 去个人邮箱收验证信，点里面的确认链接
6. 回到页面，在 **Custom addresses（自定义地址）** 里创建：
   - `hello@mysticdo.com` → 转发到你的个人邮箱
   - `contact@mysticdo.com` → 转发到你的个人邮箱

现在这两个地址收到的信都会转到你个人邮箱了。

### 2.2 在 MailerLite 里验证发件域名

1. MailerLite 后台 → **设置 / Settings** → **Domains（域名）**
2. 点 **Add domain**，填 `mysticdo.com`
3. MailerLite 会给你几条 DNS 记录（通常是 1 条 TXT + 2 条 CNAME）
4. 新开一个浏览器标签 → Cloudflare → **mysticdo.com** → 左侧 **DNS** → **Records**
5. 把 MailerLite 给的记录**一条一条**加进去：
   - 点 **Add record**，Type/Name/Value 照抄，**逐字**复制
   - ⚠️ 如果加的是 **CNAME**，把那个橙色小云朵点成**灰色**（显示 "DNS only"）——这一步很重要
6. 全部加完后，回 MailerLite 点 **Verify（验证）**
7. 变成绿色 / **Verified** 就成功了

> 💡 如果你在 MailerLite 免费版里**找不到 Domains 设置**，告诉我一声——免费版功能时有调整，我帮你换一条路线，不影响订阅功能继续用。

### 2.3 设置发件人地址

在 MailerLite 设置里把发件人填成：

- 名字：`MysticDo`
- 地址：`hello@mysticdo.com`

---

## 阶段三：欢迎邮件 + 联系表单（约 10 分钟，可选）

### 3.1 自动欢迎邮件

1. MailerLite → **Automation（自动化）** → **Create workflow**
2. 触发条件选：**当订阅者加入分组** → 选 `MysticDo Subscribers`
3. 加一个 **Email** 步骤，写一封欢迎信（一屏以内，说清你是谁、多久发一次、有什么值得看）
4. 保存 → 打开开关 / 启用

免费版最多 3 个自动化流程，够用。

### 3.2 联系表单真正送达

现在联系表单会诚实地告诉你"暂存在本机"。要让它真正发到你邮箱，需要我在后台加一段配置。

**你只需要告诉我"Email Routing 配好了"，我来加剩下的部分**（这是代码改动，你不用动手）。

原理是先启用阶段二的 Email Routing，然后我加一个 Cloudflare 的免费发信配置。

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
| MailerLite 里看不到订阅者 | Group ID 填错 | 重做 1.2，只复制**纯数字**部分 |
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
