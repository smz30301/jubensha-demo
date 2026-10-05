# 修订记录

## 2026-10-04：概念版完善与说明文档

### 范围

以浏览器原生应用和现有初稿为基础，按基础、账户、场次、结算、拼场、玩家端、社区、平台八阶段完善。保留本地及 Supabase 两种运行模式，不增加正式支付、微信小程序或复杂 SaaS 功能。

### 文档

- 新增 `README.md`：Windows 启动、演示身份、20 项核心操作、导出重置、Supabase 建库与账号绑定、财务口径、常见错误和交付目录。
- 新增 `PROJECT_BRIEF.md`：范围、阶段、数据规模、功能边界与未联调限制。
- 新增 `PAGE_MAP.md`：各角色导航、详情弹窗与权限入口。
- 新增 `DATA_MAP.md`：关系图、各表用途、整数分、原子结算、作废与统计口径。
- 新增本修订记录；不包含真实凭据或私人业务数据。

### 验证状态

- `npm run check`：通过。
- `npm test`：29/29 通过，0 失败。
- `node tools/seed.js --check`：通过，不修改种子。
- HTTP：`http://127.0.0.1:5173/` 返回 200。
- 本地浏览器：20 项核心操作全部通过，附加模块与五种视口通过，控制台 0 警告/错误。
- 测试后已重置演示数据；真实 Supabase 仍未联调。

当前真实 Supabase URL 和公开 key 未配置，未在真实云端项目执行 schema / seed、Auth 跨账号联调或事务与 RLS 实机验收。不能将本地通过视为云端部署完成。

### 交付与来源

源码、配置模板、SQL、测试、README 与四份项目文档可作为交付文件。虚构资料由 `js/demo-data.js` 生成，视觉占位来自页面代码与 `css/`。本次新建的说明文档没有修改前原文件，因而无相应文档备份。

实际验收记录：`_artifacts/verification.md`；截图：`_artifacts/screenshots/`；日志：`_artifacts/logs/`。真实登录资料、浏览器私人数据导出与含私人信息的日志不建议提交。

### 源码与测试修订文件

- `js/app.js`：身份/页面保留、获授门店选择、编辑入口、结算汇总、危险操作、失败提示、收藏与搜索保护。
- `js/pages.js`：城市筛选、真实首页数据、门店社区回复、人数与前后余额显示。
- `js/ui.js`：明确按钮类型、选择器可访问名称。
- `js/domain.js`：写入字段白名单、实际日期与权限、编辑、DM冲突、公开数量投影。
- `js/utils.js`：日期/时间/月有效性、月末与上海时间、中文状态。
- `js/store.js`：浏览器Web Locks、写入失败与冲突提示；消除Node测试挂起。
- `js/finance.js`：充值统计的上海时区日期。
- `js/api.js`：配置校验、会话刷新、仅401安全重试、空响应处理。
- `js/auth.js`：云端真实角色与门店上下文。
- `js/demo-data.js`：保留重点数据、调整虚构场次时间。
- `css/main.css`、`css/admin.css`、`css/mobile.css`：溢出、侧栏滚动、手机标题与弹窗布局。
- `database/schema.sql`：编辑RPC、权限/角色读取、冲突约束、可见人数投影。
- `database/seed.sql`、`tools/seed.js`：统一种子来源和固定快照一致性检查。
- `tests/domain.test.js`：20项业务测试；新增支付防覆盖、日期、编辑、权限、存储、时区回归。
- `tests/api.test.js`：新增9项无真实网络的API模拟回归。

说明文档、源码与SQL可提交。`_artifacts`为采用的验收记录及过程材料，可按需作为附件，不参与应用运行。没有新增第三方运行依赖、真实支付、追踪埋点或远程发布。

## 2026-10-05：生产构建与公开手机测试准备

### 范围

保留原生 JavaScript、既有 UI 和业务模型，引入 Vite 开发/构建/预览；升级公开数据库配置、安全忽略、手机布局和 Vercel 部署说明。不增加业务模块或把开发服务当作公网服务器。

### 文档同步

- `README.md`：安装、dev/LAN/build/preview、.env.local、Publishable Key白名单、构建时公开配置、GitHub私有仓库及Vercel HTTPS部署步骤。
- `PROJECT_BRIEF.md`：Vite与dist托管方式、本设备Demo和Auth/RLS共享数据边界、本轮范围。
- `PAGE_MAP.md`：根入口路由、无SPA rewrites、手机验收范围及云端隐藏重置入口。
- `DATA_MAP.md`：沿用统一适配器、设备/origin隔离、Vite配置和跨设备共享条件，保留财务模型。
- 本修订记录保留原本地29项测试与20步验收为历史事实，不据此宣称本轮通过。

### 备份与证据

修改前文件保存在 `_artifacts/backups/before-public-demo-20261004-234917/`。本轮报告使用 `_artifacts/public-demo-verification.md`，日志使用 `_artifacts/public-demo-logs/`，截图使用 `_artifacts/public-demo-screenshots/`。

当前Supabase项目尚未创建，配置为空，本轮完成接入准备，真实SQL/RLS/Auth跨账号联调在测试项目建立后进行。没有已核实的GitHub推送、Vercel发布或HTTPS公网URL。本轮本地生产预览验收通过，历史验收与公开部署分别记录。

### 实际源码与配置修订（25个文件）

- `package.json`、`package-lock.json`：Vite8.3.2依赖、Node版本范围、dev/build/preview及start兼容别名。
- `config.js`、`vite.config.js`：Vite公开环境配置、Publishable白名单、旧变量别名、生产HTTPS、Vercel精确metadata兼容及客户端暴露范围。
- `vercel.json`、`.env.example`、`.gitignore`：npm ci/build/dist部署设置，无rewrites；空变量模板；依赖、产物、实际环境文件及本地材料忽略。
- `index.html`：viewport-fit=cover及移动端入口配置。
- `js/api.js`、`js/app.js`、`js/ui.js`、`js/pages.js`：统一数据适配器、网络状态反馈和重复提交防护、原生手机抽屉/焦点、44px菜单、本设备Demo提示、云端隐藏重置。
- `css/main.css`、`css/admin.css`、`css/mobile.css`：移动安全区、抽屉、按钮、单列表单与长结算弹窗、卡片和溢出处理。
- `tests/api.test.js`、`tests/config.test.js`、`tests/ui.test.js`：新配置、重试、模式与界面权限回归，保留原业务测试。
- `tools/check.js`、`tools/server.js`：根配置语法检查及旧静态服务退役指引。
- `README.md`、`PROJECT_BRIEF.md`、`PAGE_MAP.md`、`DATA_MAP.md`、`CHANGELOG.md`：运行、部署、目录分类与真实验收结果同步。

### 最终检查

- `npm test`：40/40通过，0失败。
- `npm run check`、`node tools/seed.js --check`、`npm run build`：通过，种子核对只读，无构建警告。
- Vite真实构建环境入口：8/8通过，证据为 `_artifacts/vite-env-entry-check/run-AONUnh/checks.json`。
- 产物：17模块；CSS20.07kB（gzip5.09）、JS80.63kB（gzip27.12）；资源哈希以当前dist为准。
- HTTP私有路径返回与首页一致的HTML且不返回私有文件源码；不将结果表述为全部404。
- 4173生产预览：六种宽度及玩家首页/个人中心/拼场列表/后台工作台/5人长结算表单无整页横向溢出；375/390/430px抽屉焦点、Escape及遮罩关闭通过。
- 390px业务：组合支付、错误金额拒绝、双击只保存一次、余额充值、会员续期、拼场确认、历史快照、作废退款/统计恢复和刷新持久化通过。浏览器0警告/错误，测试后恢复初始演示。

日志位于 `_artifacts/public-demo-logs/`，采用的后台概览截图为 `_artifacts/public-demo-screenshots/admin-final-390.jpg` 和 `admin-final-desktop.jpg`。源码/配置/测试/文档可提交；dist由构建生成，验收材料可独立作为附件，备份与实际配置不提交。真实Supabase和公网HTTPS仍未联调。

该阶段结束时Git远程为空；gh/vercel不在PATH，没有安装CLI、推送或发布。Vercel Dashboard浏览器会话跳转至登录页，需要登录；直接读取登录页超时不作为已发布证据。当前远程及发布状态以下述Pages阶段为准。

## 2026-10-05：GitHub Actions + Pages 公开演示

### 范围与文件

采用已创建的Public仓库`smz30301/jubensha-demo`，目标是让手机访客无需GitHub/Vercel账号直接进入DEMO ONLY身份入口。本地origin已绑定`https://github.com/smz30301/jubensha-demo.git`；公开源码与仅上传dist的站点文件范围分别说明。

本次修订8个文件：

- `.github/workflows/deploy-pages.yml`：main推送及手动运行触发；Node24安装、检查、测试、构建；固定SHA的官方Actions，仅dist上传部署。
- `vite.config.js`：构建/预览读取Pages元数据生成的`PAGES_BASE_PATH`，开发固定`/`，未配置时普通构建/预览为`/`；不固定业务仓库名。
- `tests/build-base.test.js`：5项路径回归，覆盖根路径、仓库改名、开发固定路径、非法路径拒绝及客户端变量范围。
- `README.md`：当前Public仓库、Pages配置/推送/进度/匿名入口、公开Variables、错误排查及交付目录，Vercel改为备用历史方案。
- `PROJECT_BRIEF.md`、`PAGE_MAP.md`、`DATA_MAP.md`、`CHANGELOG.md`：本次范围、子路径入口、数据边界和实际验证状态。

未调整业务模型或页面功能；`vercel.json`保留备用，`.env.example`仍为原两项公开空值模板，无新增依赖。

### 本地检查与部署状态

- `npm ci`：成功，15个依赖安装、16个包审计、0漏洞。
- `npm run check`：通过。
- `npm test`：45/45通过，原40项及新增5项路径回归。
- 普通无变量构建：通过，资源引用为根路径`/assets/`。
- Pages子路径构建：通过，17模块，无构建警告；HTML0.88kB（gzip0.57）、CSS20.07kB（gzip5.09）、JS80.64kB（gzip27.13）。本次资源为`index-C2Ks4grH.js`及`index-C8_M9cwC.css`。
- HTTP：开发根入口、`4173/jubensha-demo/`预览及两个资源200、无跳转；私有路径返回同首页HTML且不含对应源码。dist仅HTML/JS/CSS三个文件。
- 子路径浏览器：375/390/430px的玩家首页、个人中心、管理员工作台、4人长结算无横向溢出；底栏44px，抽屉Tab操作、Escape和焦点恢复通过；长结算内容3367–3391px，确认按钮44px且可触达。仅打开后取消，未保存结算，控制台0警告/错误。
- 敏感模式及路径：87个文本文件和main可达37个blob检查通过，没有候选；无关材料不进入main提交范围。

当前尚未推送，Actions构建部署和匿名HTTPS入口尚未核实。预期网址为`https://smz30301.github.io/jubensha-demo/`，不作为已发布地址。Supabase项目尚未创建，真实云端共享、真实Safari和微信手机浏览器未实测；桌面视口或本地构建不代替这些验证。

### 备份与交付材料

修改前五份文档保存在`_artifacts/backups/before-github-pages-20261005-152506/`。本次报告为`_artifacts/github-pages-verification.md`，日志为`_artifacts/github-pages-logs/`，截图为`_artifacts/github-pages-screenshots/`；原`public-demo-`材料保留为Vite/Vercel准备阶段历史证据。

工作流、源码配置、测试和五份文档可提交到Public仓库；dist由Actions构建上传，依赖、实际环境文件、私人导出、备份与本地验收过程材料不提交。
