# MysticDo 欢迎邮件 · 文案 + 视觉改造清单

> 用途：新订阅者加入后自动收到的第一封邮件。
> 你现在用的是 MailerLite 的 **Christmas Sale（节日促销）** 模板——布局骨架可以留，但节日元素必须全部换掉。

---

## ⚡ 最快路径（推荐）：直接导入现成的 HTML 模板

已经按网站风格做好了一个可直接粘贴的模板：

**文件：`email-templates/welcome.html`**

### 导入步骤（官方路径，已核实）

1. 用记事本或 VS Code 打开 `email-templates/welcome.html` → **全选复制**（Ctrl+A、Ctrl+C）
2. MailerLite → **Campaigns** → **Create campaign**
   （如果是在 Automation 里，就点那个 **Email** 动作 → 编辑邮件）
3. 选 **Regular campaign** → 点 **Next**
4. 在模板列表里选 **Start from scratch**（从零开始）
5. 选 **Custom HTML editor** → 再选 **Code from scratch**（从空白代码开始）
6. 把复制的代码**粘贴进右侧代码区**
7. 左侧会实时预览 → 确认排版正常 → 保存

> ✅ 官方确认：**Custom HTML editor 在所有计划（含免费版）可用**。
> ✅ 官方会在保存时自动把你代码里 `<style>` 标签内的 CSS **转成内联样式**，所以我写的手机适配、预览文字设置都会保留。
> ✅ 代码看起来乱就点 **Beautify** 一键整理。

### 导入后必须做的三件事

**① 替换地址占位符（法律要求）**

找到这一行：

```
[REPLACE WITH YOUR REAL POSTAL ADDRESS]
```

换成你的真实邮寄地址。

**② 用官方方式插入退订链接（比我模板里的写法更可靠）**

侧边栏找 **Fields and variables** → **Link variables** → **Unsubscribe link** → 点 **Copy**，
然后把它粘贴**替换掉**我模板里的 `{$unsubscribe}`。

> MailerLite 明文规定：**每封邮件都必须有可见的退订链接**。这是合规硬性要求，不能省。

**③ 检查 Settings 有没有"重复添加"**

编辑器 **Settings** 里有"自动添加 preheader / footer / CSS inline"这类开关。如果有：

- **preheader 自动添加 → 关掉**（我模板自带，开着会出现两行预览文字）
- **footer 自动添加 → 关掉**（我模板自带，开着会出现两个页脚）
- **CSS inline → 保持开启**（它帮我保证各客户端样式一致）

### 这个模板已经替你处理好的细节

| 已做好 | 说明 |
|---|---|
| 配色与网站一致 | 象牙白底 `#FCFAF5`、墨黑正文 `#211B10`、古金 `#8A651A` |
| 字体 | 标题用系统衬线体（Georgia）——邮件客户端不加载 webfont，这样最稳 |
| 兼容性 | 表格布局 + 全内联样式，Gmail / Outlook / Apple Mail 都能正常显示 |
| 手机适配 | 窄屏自动缩小字号与内边距 |
| 收件箱预览文字 | `One note a week. Decision guides, not horoscopes.` |
| 退订链接 | 已用 `{$unsubscribe}` 变量，MailerLite 保存时会自动替换成真实链接 |
| 零图片 | 所以不存在"图片被拦截后一片空白"的问题 |

### 导入后检查三件事

1. 页脚地址**已换成真实地址**（那个方括号占位符不能留）
2. 退订链接显示为正常链接（如果显示成一串 `{$unsubscribe}` 字样，告诉我）
3. 手机预览：按钮好点、文字不挤

---

## 一、模板改造对照表（如果你更想手动改那个节日模板）

| 模板里的东西 | 怎么处理 |
|---|---|
| 顶部圣诞袜 / 圣诞球装饰 | **删掉**（或换一张克制的氛围图，见第三节） |
| `WELCOME! FREE for you get in.` | 换成下面的 eyebrow + 大标题 |
| 礼物盒插图 | **删掉** |
| 黑色按钮 `SAVE ON SHIPPING` | 换成金色按钮 **Find what fits** |
| "节日免运费" 说明段 | 换成下面的正文 |
| 页脚地址 `401 Forest Knoll, Roselle` | **必须改成你的真实地址**（第四节，法律要求） |
| 页脚 `Unsubscribe` 链接 | **保留，不要删**（合规必需） |

---

## 二、邮件正文（可直接复制）

### Subject（主题行）

```
You're in — here's what to expect
```

### Preview text（预览文字）

```
One note a week. Decision guides, not horoscopes.
```

### 正文各块

**① 顶部小字（eyebrow / 那个小号大写字母的位置）**

```
WELCOME
```

**② 大标题（H1）**

```
Before you pay, decide.
```

**③ 开场段**

```
Thanks for joining MysticDo.

Most spiritual content online is written to make you buy something. This newsletter is written for a narrower moment — the one where you're about to spend money on a reading, and you want to know whether it's worth it, which kind actually fits your situation, and how to avoid the obvious traps.
```

**④ 小标题**

```
What you'll get — roughly one email a week
```

**⑤ 列表（模板里那三条图标行正好用得上）**

```
One decision guide — what things cost, how to tell legit from not, how to choose

One free tool or exercise — five minutes, no signup required

Occasionally, a plain-language note on how this industry actually works
```

**⑥ 小标题**

```
What you won't get
```

**⑦ 列表**

```
Daily horoscopes

Lists of affiliate offers dressed up as advice

Anything that pretends to know your future
```

**⑧ 按钮（模板里那个黑色按钮的位置）**

按钮文字：

```
Find what fits
```

按钮链接：

```
https://mysticdo.com/do-what-fits
```

**⑨ 收尾段（按钮下方那段说明文字的位置）**

```
One thing worth saying up front: we're not here to tell you what to believe. We're here to help you decide what to do next — and to say "skip it, save your money" when that's the honest answer.

If a specific question is on your mind, just reply to this email.
```

**⑩ 签名**

```
— MysticDo
mysticdo.com
```

---

## 三、配色与排版（跟网站保持一致）

MysticDo 的视觉是「象牙白纸 + 墨黑字 + 古金点缀」，邮件照这个来就不会显得像另一个品牌：

| 用途 | 颜色值 | 备注 |
|---|---|---|
| 整封底色 | `#FCFAF5` | 象牙白，比纯白暖 |
| 正文文字 | `#211B10` | 墨黑；别用 `#000`，太硬 |
| 按钮 | `#8A651A` | 古金，白字 |
| 次要文字 / 页脚 | `#5F5E5A` | 灰褐 |
| 标题字体 | **衬线体**（Georgia / Times New Roman） | 邮件客户端基本不加载自定义字体，用系统衬线体最稳，气质也对 |

**关于配图：建议少用或不用。**

理由有三：① 邮件里图片常被默认拦截，读者看到的是空白块；② 廉价库存图会让"我们帮你判断"的可信度打折；③ 你卖的是冷静的判断力，克制本身就是品牌信号。

如果一定要一张头图，按这个标准找（MailerLite 图片库里搜）：

- 关键词：`celestial minimal`、`tarot still life muted`、`night sky minimal`
- 风格：**低饱和、暖调、留白多**
- 避开：紫色渐变 + 星星、发光水晶球、夸张光效——那是廉价玄学站的视觉

---

## 四、两个必须处理的细节

### 1. 页脚地址要改成真实的（法律要求，别跳过）

你截图页脚里的 `401 Forest Knoll, Roselle, United States of America` 是**模板示例**。

美国 CAN-SPAM 法案（以及多数国家的反垃圾邮件法）要求：**每封营销邮件都必须包含真实有效的邮寄地址**。去 MailerLite → **Account settings → Company profile** 改掉：

- 有办公地址就填办公地址
- 没有的话，填你本人能收到信的地址也行（家庭地址、或租的信箱）
- **不要留示例地址，也不要填假地址**——这会让你的域名被投诉、进而连累整站邮件送达率

### 2. 退订链接必须保留

模板底部的 `Unsubscribe` 是 MailerLite 自动生成的，**不要删**。它是合规必需项，也是保护你域名声誉的东西。

---

## 五、做完怎么验证

1. 用 **Send test** 发到**你自己的个人邮箱**（先别群发）
2. **在手机上看一遍**——大多数读者用手机读邮件，确认文字不挤、按钮好点
3. 确认发件人显示为 `MysticDo <hello@mysticdo.com>`
4. 都没问题 → 保存 → 回到 **Automations** 把开关打开

---

## 六、先别急着改的部分

「What you'll get」里写了"每周一封"。如果你现在还没准备好每周产出，两个选择：

- **改文案**：把"roughly one email a week"改成"when there's something worth saying"——这是更诚实的承诺，也更适合起步阶段
- **保持文案，按期兑现**：那就先把前 3 期的选题想好（可以从 `/guides/` 里挑现成的改写成邮件版）

我建议**起步阶段用第一种**：宁少承诺、多兑现。等你能稳定产出后再改回"每周一封"。
