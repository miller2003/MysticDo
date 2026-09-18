# MysticDo — GitHub 连接 Cloudflare Workers 部署教程

> 方案：**GitHub 推送 → Cloudflare 自动构建部署**（Workers Builds）。
> 你本地**不需要安装 wrangler**，也不需要在命令行部署——只需要会 `git push`，每次推送后 Cloudflare 自己在云端完成构建和上线。

---

## 一、先说清楚：wrangler 是什么？

wrangler 是 Cloudflare 官方的部署命令行工具。**你不需要用它**——选了 GitHub 方案后，每次推送代码，Cloudflare 的构建机会自动在云端运行一次部署（内部就是跑一遍部署命令）。仓库里保留的 `wrangler.jsonc` 只是 **Cloudflare 官方部署配置文件**（声明：站点文件在根目录、Worker 代码在哪、404 怎么处理等），Cloudflare 靠它知道怎么部署你的站。**这个文件必须保留，但它不是软件，你不用安装、不用运行任何东西。**

## 二、已经准备好的文件（勿删）

| 文件 | 作用 |
|---|---|
| `wrangler.jsonc` | Cloudflare 部署配置（云端读取，本地无需安装任何工具） |
| `worker/index.js` + `worker/_lib/` | Worker 边缘代码：www→apex 301、Markdown for Agents |
| `.assetsignore` | 决定哪些文件**不进**公网 CDN（开发脚本、`*.md` 研究文档、草稿目录等已全部排除） |
| `.gitignore` | 已排除 `.env`、`.workbuddy/`、`.dev.vars` 等本机文件，不会进仓库 |

已通过完整验证：Worker 语法零错误、打包正常（27 KiB）、回归测试全绿（内容协商、301、CPU 基准全部 OK）。

---

## 三、前置条件

1. **Git**：PowerShell 里运行 `git --version` 检查；没有就去 https://git-scm.com/download/win 安装（一路默认即可）。
2. **GitHub 账号**：github.com 注册/登录。
3. **Cloudflare 账号**：dash.cloudflare.com 注册/登录（免费版即可）。

---

## 四、操作步骤

### 步骤 1：本地初始化 Git 仓库（只做一次）

```powershell
cd C:\Users\samja\Desktop\site\mysticdo

git init
git add -A
git commit -m "MysticDo v0.3 — initial commit for Cloudflare Workers"
git branch -M main
```

> 如果 git 提示需要身份配置，先跑一次（换成你自己的）：
> `git config --global user.name "你的名字"` 和 `git config --global user.email "你的邮箱"`

### 步骤 2：创建 GitHub 仓库并推送

1. 打开 https://github.com/new ，按如下填写：
   - Repository name：`mysticdo`
   - 可见性：**Private**（推荐——仓库虽然不含密钥，但没必要公开）
   - ⚠️ **不要**勾选 "Add a README" / "Add .gitignore" / "Choose a license"（保持空仓库，否则推送会冲突）
2. 点 **Create repository**，然后回到 PowerShell 推送（替换 `<你的GitHub用户名>`）：

```powershell
git remote add origin https://github.com/<你的GitHub用户名>/mysticdo.git
git push -u origin main
```

> 第一次推送会弹出 GitHub 登录窗口，按提示授权浏览器登录即可。

### 步骤 3：Cloudflare 连接仓库（核心步骤，只做一次）

1. 登录 Cloudflare 控制台 → 左侧 **Workers & Pages** → **Create application** → **Workers** 标签 → **Import a repository**（连接 Git）。
2. 首次会要求授权：点 **Connect GitHub** → 在 GitHub 授权页安装 Cloudflare 的 GitHub App → 选择 **Only select repositories → mysticdo**（或 All repositories）→ 回到 Cloudflare 选中 `mysticdo` 仓库。
3. 构建设置按下表填写（其余保持默认）：

| 设置项 | 填什么 |
|---|---|
| Production branch | `main` |
| Build command | **留空**（本站无构建步骤） |
| Deploy command | 保持默认 `npx wrangler deploy`（CF 云端执行，与你本地无关） |
| Root directory | 留空（仓库根目录就是站点） |

4. 点 **Create and deploy**。约 1–2 分钟后完成，得到预览地址 `https://mysticdo.<你的子域>.workers.dev`，先在浏览器里把主要页面点一遍。

### 步骤 4：绑定自定义域名 mysticdo.com

1. **域名接入 Cloudflare**（若还没接入）：控制台 → **Add a domain** → 输入 `mysticdo.com` → Free 计划 → 拿到两个 NS 地址 → 到域名注册商处把 Nameservers 改成这两个 → 等状态变为 Active（几分钟到几小时）。
2. **绑定**：**Workers & Pages** → `mysticdo` → **Settings** → **Domains & Routes** → **Add** → **Custom domain**：
   - 添加 `mysticdo.com`
   - 再添加 `www.mysticdo.com`
   Cloudflare 自动创建 DNS 记录和 SSL 证书（免费，约 1–5 分钟生效）。
3. www→apex 的 301 收敛 Worker 代码里已做好，不用额外设置。
4. 建议顺手开：域名 → **SSL/TLS** → **Always Use HTTPS**。

> ⚠️ 如果这个域名以前绑过别的 Cloudflare 项目，必须先去那个项目的设置里移除该域名，同一个域只能服务一个项目。

### 步骤 5：上线核验清单

```powershell
# 1) 页面 200
curl.exe -I https://mysticdo.com/psychic/

# 2) www 301 到 apex
curl.exe -I https://www.mysticdo.com/

# 3) 404 状态码正确（期望输出 404）
curl.exe -o NUL -s -w "%{http_code}" https://mysticdo.com/this-page-does-not-exist

# 4) Markdown for Agents（GEO 核心，应输出 markdown 正文）
curl.exe -s -H "Accept: text/markdown" https://mysticdo.com/about.html | Select-Object -First 5
```

再人工确认一条：浏览器打开 `https://mysticdo.com/EEAT_COMPETITOR_RESEARCH.md` 应为 404（内部研究文档不能公开，`.assetsignore` 已挡住）。

---

## 五、日常更新与回滚

```powershell
# 改完文件后，两步上线：
git add -A
git commit -m "更新说明"
git push
# 推送后 Cloudflare 自动构建部署，约 1–2 分钟生效
```

- **回滚**：控制台 → Workers & Pages → `mysticdo` → **Deployments** → 每次部署记录旁的菜单 → **Rollback**（秒级生效，不需要动 git）。也可以 `git revert` 后 push 重新部署。
- **构建日志**：Deployments → 点某次部署 → View build，出错时看这里。
- **实时日志**：Worker → **Logs**（已开启 observability）。

---

## 六、免费额度

| 项 | 免费额度 |
|---|---|
| GitHub 构建次数 | 3,000 次/月（每次 push 算 1 次，单人站点绰绰有余） |
| Worker 请求数 | 10 万次/天 |
| 资产存储 | 10 GB / 2 万文件（本站约 70 个文件） |
| 自定义域 | 免费，不限数量 |

---

## 七、故障速查

| 现象 | 处置 |
|---|---|
| GitHub 仓库列表里看不到 mysticdo | GitHub App 授权时只选了部分仓库——去 GitHub → Settings → Applications → Cloudflare Workers & Pages → Configure → 增加该仓库 |
| 构建失败 | Deployments → View build 看日志；最常见是 `wrangler.jsonc` 没提交进仓库 |
| 页面 404 但文件存在 | 文件被 `.assetsignore` 误伤（gitignore 语法），调整清单后 push |
| 自定义域报错 | 域名 NS 未切到 Cloudflare 或状态未 Active |
| push 了但没触发部署 | 确认推的是 `main` 分支（Production branch） |
