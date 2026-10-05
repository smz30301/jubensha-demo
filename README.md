# 剧场账本：剧本杀店铺管理平台概念验证版

浏览器中的可操作原型，使用 HTML、CSS、原生 JavaScript。支持场次、组合支付、会员、门店余额、DM 提成、拼场和社区。保留原有界面和业务模块，使用 Vite 提供开发服务及生产构建，不引入前端框架。

默认运行本地演示模式。Supabase 模式提供真实表结构和受权限校验的事务 RPC，需要先创建数据库并绑定 Auth 账号。当前尚未创建 Supabase 项目，本轮完成接入准备，真实云端部署与跨设备联调在项目创建后按第 6 节执行。

## 1. 安装、开发与手机测试

在 Windows PowerShell 中执行以下命令。执行目录为 `D:\Codex test\xcx`；用途是检查 Node.js 环境、安装锁定的构建依赖并启动 Vite 开发服务。

```powershell
Set-Location -LiteralPath 'D:\Codex test\xcx'
node --version
npm --version
npm install
npm run dev
```

终端显示 Vite 已启动后，浏览器打开：

[http://127.0.0.1:5173](http://127.0.0.1:5173)

保持此终端运行；停止服务时按 `Ctrl+C`。首次获取项目或依赖改变后需要安装，普通代码修改无需反复安装。已存在 `package-lock.json` 时，自动化构建使用 `npm ci`，以锁文件保证依赖一致。如果提示找不到 `node` 或 `npm`，需先安装符合项目版本要求的 Node.js；安装、升级或修改系统设置应由设备使用者确认后执行。

当前锁定 Vite 8.3.2，要求 Node.js 20 系列不低于 20.19.0，或 Node.js 不低于 22.12.0。依赖版本以 `package-lock.json` 为准。

`npm start` 保留为 Vite 开发服务别名；新操作说明统一使用 `npm run dev`。

**不要双击 `index.html`。** 项目使用 JavaScript ES Modules，需要 HTTP 地址；`file://` 打开可能出现模块加载或跨域错误。

端口被占用时，先确认是否已有开发服务运行；也可以在项目目录改用另一个端口：

```powershell
Set-Location -LiteralPath 'D:\Codex test\xcx'
npm run dev -- --port 5174
```

以终端实际打印的地址为准。本地数据按浏览器和地址分别保存：更换端口、浏览器，或从 `127.0.0.1` 改为 `localhost`，会看到另一份演示数据。

### 1.1 在同一局域网用手机打开

电脑和手机连接同一个可信 Wi-Fi。在项目目录执行下列命令，用途是让 Vite 开发服务接受局域网访问：

```powershell
Set-Location -LiteralPath 'D:\Codex test\xcx'
npm run dev -- --host 0.0.0.0
```

在手机浏览器打开终端的 `Network` 地址，例如形如 `http://电脑局域网IP:5173/` 的地址；手机不能使用电脑的 `127.0.0.1`。不要将 `0.0.0.0` 直接填进手机地址栏。

连接失败时检查是否同一 Wi-Fi、是否开启了访客网络隔离，以及电脑防火墙是否允许此开发服务。更改防火墙或网络设置前需由设备使用者确认。局域网开发地址不是公网地址，不适用于发给不同网络的朋友。

电脑与手机的 localStorage **不是同一份数据**，即便打开同一个公网网址也不会共享。跨设备测试必须配置同一个 Supabase 项目，并登录有权限的账号。

### 1.2 构建与本地生产预览

在项目根目录执行以下命令。`build` 生成生产静态文件；`preview` 用于检查这些产物：

```powershell
Set-Location -LiteralPath 'D:\Codex test\xcx'
npm run build
npm run preview
```

成功构建后产物在 `D:\Codex test\xcx\dist\`。浏览器打开预览命令打印的地址，默认预览端口为 4173。`vite preview` 仅用于本地检查，不是正式公网服务器；公网部署使用第 13 节的 Vercel 步骤。参考：[Vite 静态部署说明](https://vite.dev/guide/static-deploy.html)。

## 2. 身份与测试数据

本地入口无需注册或密码，点击身份卡片即可进入。右上角“切换身份”用于体验其他角色；当前身份与页面保存在 sessionStorage，刷新后保留，关闭标签页后重新进入。

| 入口 | 演示用户 | 业务 ID | 主要范围 |
| --- | --- | --- | --- |
| 玩家 | 张三 | `p1` | 自己的拼场、会员、余额、流水、收藏、帖子 |
| DM | 小王 | `d1` | 小王的场次与提成；可录入场次 |
| 门店管理员 | 李店长 | `a1` | XX剧本杀·大学城店，门店 ID `s1` |
| 平台管理员 | 平台管理员 | `root` | 商家订阅、门店和公共剧本示意页、举报处理 |

初始数据包含 2 个品牌、3 家门店、6 名 DM、20 名玩家、10 个公共剧本、22 个历史完成场次、4 个拼场、132 条历史玩家消费记录、132 条支付记录、24 条余额流水和 10 篇社区帖子。

初始张三在大学城店余额为 **372 元**，会员到期 **2027-03-01**，有 5 个历史参加场次；在 YY剧本杀·海岸店余额为 100 元。小王初始本月有效场次为 **18 场**，历史提成合计 **1,860 元**。部分历史场次快照为 110 元，其余为 100 元，当前规则是每场 100 元，因此历史合计不等于直接套用当前规则。

本地种子日期在首次打开或重置时生成，已保存的数据不会随月份自动迁移。跨月后初始月度统计可能减少，必要时先备份再重置；云端 `seed.sql` 的日期固定在该文件生成时。

会员和余额都是“玩家 × 门店”独立账户。在一家门店修改会员或充值，不影响另一家门店。

本地身份属于 **DEMO ONLY**，浏览器内的代码和 localStorage 可被设备使用者修改。业务层有权限校验，但本地模式不能作为正式生产系统的安全边界。公网未配置数据库时也只能保存本设备演示数据；顶部模式提示用于区分本地与共享数据库。

## 3. 20 项核心操作教程

以下流程从未改动的初始数据开始。日期选择本月一个空闲日期，DM 选择小王，剧本选择《年轮》，参考价格 128 元。若提示时间冲突，调整至该 DM 未使用的日期与开始时间；初始虚构样本不代表完整时长排班。

| 项 | 操作 | 正常结果 |
| --- | --- | --- |
| 1 | 按第 1 节启动服务，打开网页 | 显示身份入口与“本地演示”提示 |
| 2 | 点击“以门店管理员身份进入” | 显示大学城店后台及李店长 |
| 3 | 查看“工作台” | 显示本月营业额、完成场次、拼场和预计 DM 提成 |
| 4 | “场次管理 → 创建场次”，填写剧本、日期、时间、小王、人数 6、价格 128，选择普通场次和发布；备注写“操作验收场次” | 新场次状态为“已确认” |
| 5 | 打开新场次“详情 → 添加玩家”，依次添加张三、玩家2，应收各 128 元 | 场次详情显示 2 名玩家 |
| 6 | 点击“场次结算” | 打开按玩家逐项填写的结算表 |
| 7 | 玩家2消费 128、优惠 0、现金 128，其他支付方式均 0 | 支付合计与实际消费一致 |
| 8 | 张三消费 128、优惠 0、余额 100、微信 28，支付宝、现金、其他均 0；点击“确认结算” | 场次变为已完成，总消费 256；余额扣款、支付和提成一并保存 |
| 9 | “玩家管理”，搜索张三，打开详情 | 大学城店余额由 372 变为 272 元 |
| 10 | 切换为玩家，进入“我的 → 查看流水” | 显示张三的 100 元场次消费；刷新后仍保留 |
| 11 | 切换为 DM，进入“我的提成 → 明细”，选择场次所在月份 | 新增此场次提成 100 元及规则快照 |
| 12 | 切换为管理员，打开“财务统计”，覆盖该场次日期 | 消费增加 256；微信增加 28、现金增加 128、余额消费增加 100 |
| 13 | “拼场管理 → 创建拼场”，选择空闲时间并发布，备注写“操作验收拼场” | 玩家端出现该拼场，初始人数 0 / 6 |
| 14 | 切换为玩家，在“拼场”查找新场次，点击“查看详情 → 我要上车”，填昵称和至少一种联系方式 | 显示“待商家确认”，人数暂不增加 |
| 15 | 切换为管理员，在“拼场管理”找到报名，点击“确认上车” | 报名变为“已确认”，场次人数增加 1；玩家端同步可见 |
| 16 | “会员与余额”，找到张三，点击“会员”，改为会员并设置到期日 2028-03-01，保存 | 玩家端会员资料立即同步 |
| 17 | 张三“余额操作”，类型充值、金额 500、支付方式现金，填写原因后确认 | 余额从 272 变为 772 元 |
| 18 | 打开张三详情中的余额流水 | 新增充值 +500，操作前 272、操作后 772；财务充值资金流入增加 500，消费收入不增加 |
| 19 | “场次管理”，打开第 4 项的已完成场次，点击“作废场次”，填原因后确认 | 状态变为已作废，原消费、支付、提成和审计记录保留 |
| 20 | 查看张三余额、财务及小王提成 | 余额由 772 恢复至 872；新增退款 +100；消费收入减少 256；该场次有效人次及提成退出统计 |

微信、支付宝、现金等在此版本中仅记录线下支付，作废不会调用实际退款接口。余额部分自动生成反向流水；其他资金退款需在实际收款渠道线下处理。

补充验证：尝试付款合计不等于消费、重复添加玩家、余额不足、重复结算或重复作废，应提示错误，并且不产生半笔支付、半笔余额流水或部分提成。

## 4. 日常功能入口

- 管理员：工作台、场次管理、拼场管理、玩家管理、会员与余额、DM管理、剧本管理、财务统计、工资统计、门店设置。
- DM：工作台、我的场次、我的提成。DM 不能修改会员和余额、查看门店总营业额或其他 DM 工资。
- 玩家：首页、拼场、剧本、社区、我的。拼场支持筛选；剧本详情可查看销售门店、门店价格和收藏。
- 平台管理员：平台概览、商家订阅、门店列表、公共剧本库、帖子举报。订阅状态和期限手动维护，不接入年费收款。

玩家首页“探索门店”可查看介绍、地址、营业时间、环境、房间、拼场、DM 和本店剧本。DM 详情展示介绍、擅长类型、可开剧本和主持场次数。图片为本地页面占位，无上传或云存储。当前城市支持手动切换青岛、济南、烟台；种子门店都在青岛，其他城市出现空状态属于正常结果。

管理员可编辑已有玩家基础资料；管理员和对应 DM 可编辑未完成场次。已完成、已取消、已作废场次不能通过编辑改写业务和财务历史。日期、人数、价格、剧本权限与 DM 时间冲突在业务层校验。历史场次是虚构月度样本，开始时间不代表完整真实排班；初始小王 18 场用于统计展示。

社区支持文字帖子、图片占位、点赞、收藏、评论和举报。门店可在相关帖子中官方回复或举报，下架由平台角色处理。不得录入真实隐私；原型没有自动内容审核能力。

窄窗口下点击“菜单”打开后台导航；玩家底部导航适用于手机宽度预览。浏览器开发者工具的设备预览可以检查按钮、表单、弹窗和横向表格。

## 5. 保存、导出与重置

本地模式每次业务操作先在副本中校验，通过后一次性写入 localStorage。结算失败时不保存副本。刷新页面保留业务数据，同一地址的其他标签页可收到数据变更。

“门店设置”或玩家“我的”提供“导出当前可见数据”。导出范围随角色权限变化，管理员导出并不是全平台备份。导出可能包含自行录入的联系方式或业务资料，应按私人资料保存；不应直接提交到公共仓库。

“重置演示数据”会替换**当前浏览器、当前地址**保存的整套演示业务数据，包括其他演示身份录入的记录。先导出需要保留的内容，再点击重置并在弹窗中确认。它不删除整个浏览器的其他网站数据，不影响其他浏览器，也不重置 Supabase。

当前没有导入导出 JSON 的恢复界面。需要长期留存的数据应使用专用 Supabase 测试项目并做好数据库备份。

## 6. 配置 Supabase

以下步骤在专用测试项目中操作，不使用已承载真实业务的数据库。SQL 脚本创建公共业务表和函数，`schema.sql` 是初次建库脚本，不是可反复执行的迁移文件。

### 6.1 创建数据库结构

1. 在 Supabase Dashboard 创建测试项目，等待数据库就绪。
2. 进入项目的 **SQL Editor**，新建查询。
3. 用 UTF-8 打开 `D:\Codex test\xcx\database\schema.sql`，复制全部内容到查询，执行。
4. 确认返回成功，再新建查询执行 `database\seed.sql` 全部内容。
5. 在 Table Editor 查看 `users`、`stores`、`sessions` 等表是否存在；不要以表编辑器手动改余额替代余额操作。

`schema.sql` 用事务创建表、外键、索引、RLS、权限和 RPC。发生错误时先处理报错，不继续执行种子。若提示 `relation already exists`，说明该项目已有同名表；不要删除已有业务数据来强行重跑。应检查是否已经完成建库，或另建空的测试项目。

`seed.sql` 以事务插入虚构数据，已存在的主键记录不覆盖。重新执行可以补未插入记录，但不会重置数据，也不会更新已经存在场次的日期和金额。

若确实需要按当前日期重新生成种子，以下命令仅重新写出本地种子文件，**不会连接数据库**。执行目录是项目根目录；执行前应保留现有种子版本：

```powershell
Set-Location -LiteralPath 'D:\Codex test\xcx'
node tools/seed.js
```

参考：[Supabase 数据表及 SQL Editor 官方说明](https://supabase.com/docs/guides/database/tables)。

### 6.2 预建 Auth 测试账号并绑定业务用户

云端使用 Supabase Auth 邮箱和密码登录，不提供任意用户的无密码切换。数据库根据 `auth.uid()` 识别当前用户，不信任网页传来的用户 ID。

1. 在 Dashboard 的 **Authentication → Users** 创建测试账号，设置测试邮箱和自行管理的密码；确保账号可以进行邮箱密码登录。
2. 复制该账号的 Auth User UID。
3. 在 **Table Editor → public.users** 找到对应业务用户，将其 `auth_id` 填为这个 UID。
4. 四种角色分别使用独立 Auth 测试账号，按下面的业务 ID 绑定。实际邮箱和密码不写入源码或文档。

| Auth 账号用途 | `public.users.id` | 初始权限来源 |
| --- | --- | --- |
| 玩家张三 | `p1` | 玩家默认身份；门店账户在 `store_customers` |
| DM小王 | `d1` | `store_members` 中 `s1 / dm / active=true` |
| 管理员李店长 | `a1` | `store_members` 中 `s1 / admin / active=true` |
| 平台管理员 | `root` | 种子中的 `is_platform=true` |

项目所有者也可以在 SQL Editor 绑定。下面是模板，必须先替换 UID 占位文字，再执行；不能原样运行：

```sql
update public.users
set auth_id = '替换为该账号的Auth-User-UID'::uuid
where id = 'p1';
```

绑定 DM、管理员或平台账号时，相应将 `p1` 改为 `d1`、`a1` 或 `root`。一个 Auth UID 只能绑定一个业务用户。`auth.users` 与 `public.users` 是两张表，仅创建 Auth 账号不会自动绑定业务资料。

同一个业务用户可以通过 `store_members` 拥有多个身份。云端“切换身份”根据服务器返回的 `available_contexts` 显示**当前登录账号**的身份与授权门店，可在拥有权限的门店之间切换；玩家和平台身份不固定绑定 `s1`。要体验另一个账号，先“切换身份 → 退出登录”，再登录相应邮箱。`auth_id`、门店角色和平台权限只能由项目所有者在受信任的数据库管理环境设置，不能由普通网页用户提升。

参考：[Supabase 用户及 Dashboard 官方说明](https://supabase.com/docs/guides/auth/users)、[业务用户表绑定官方说明](https://supabase.com/docs/guides/auth/managing-user-data)。

### 6.3 配置 .env.local

配置模板是 `D:\Codex test\xcx\.env.example`，只包含变量名称和空值。实际本地配置放在同目录的 `.env.local`，该文件由 Git 忽略。项目地址和公开 **Publishable Key** 从 Supabase Dashboard 的项目连接信息与 API Keys 设置中获取。

```dotenv
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

可用文本编辑器新建 `.env.local`，把模板内容复制进去并填写实际公开配置；不要将真实值填进 `.env.example`。`VITE_SUPABASE_URL` 填该项目的 `https://…supabase.co` 地址，`VITE_SUPABASE_PUBLISHABLE_KEY` 填以 `sb_publishable_` 开头的公开 Publishable Key。旧别名 `VITE_SUPABASE_ANON_KEY` 保留兼容，但也只能填写 Publishable Key，不接受 legacy anon JWT；新变量与别名同时填写不同值时会报冲突。

代码通过 `import.meta.env.VITE_SUPABASE_URL` 和 `import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY` 读取。修改 `.env.local` 后重新启动 `npm run dev`。两个字段都为空时启用本地，均完整有效时启用云端；只填一项、地址错误或使用错误类型 key 会明确报错，不自动回退。配置有值但登录或网络失败时，不会把写入切到本地。

生产配置必须使用 HTTPS。Vercel 自动注入的已知公开系统 metadata 可以通过构建校验，但不会进入应用数据库配置或浏览器产物。

切回本地模式：清空两项本地配置并重启开发服务；若还有旧配置别名，也必须一并清空。两种模式数据独立，配置切换不会迁移 localStorage 数据。正式测试网站优先配置 Supabase，共享的是数据库中受账号权限控制的数据。

**所有 `VITE_` 变量都会进入客户端 bundle，任何访问者都可读取。** 禁止创建 `VITE_SUPABASE_SECRET_KEY`、`VITE_SERVICE_ROLE_KEY`，也禁止放入数据库密码或个人 access token。将敏感信息放在 Vercel 环境变量中再加 `VITE_` 前缀，同样会泄露到浏览器。生产配置在构建时写入产物：更改 Vercel 变量后必须重新部署，已有部署不会自动换配置。参考：[Vite 环境变量说明](https://vite.dev/guide/env-and-mode)。

公开 API key 并不提供管理员权限；本项目仍要求 Auth 登录，由服务器校验角色。公开 key 仅放在 `apikey` 请求头，登录后以用户 access token 作为 Bearer JWT。会话保存在 sessionStorage，401 时刷新一次 token；遇网络或数据库错误不会自动重发财务写入，避免重复提交。参考：[Supabase API keys 官方说明](https://supabase.com/docs/guides/getting-started/api-keys)。

### 6.4 云端联调检查

| 检查 | 预期 |
| --- | --- |
| 未登录调用业务 RPC | 拒绝访问 |
| 绑定张三账号登录 | 只能看到自己的会员、余额、流水和报名 |
| 小王切换 DM | 当前账号的场次和提成可见，其他 DM 工资及玩家余额不可见 |
| 李店长切换管理员 | 只能管理被授权门店 |
| 张三充值、结算、作废 | 余额、流水、支付、提成、审计在同一次 RPC 中一致保存 |
| 余额不足时结算 | RPC 失败，整笔事务回滚 |
| 修改当前提成规则 | 已完成场次的快照和金额不变化 |

这些是部署后的验收步骤，不表示当前项目已在真实 Supabase 上执行过。云端账号、网络和数据库尚未配置时，本地自动化通过也不能替代该项验证。

## 7. 结算、财务及工资口径

所有金额以整数“分”保存。页面输入单位为元，最多两位小数。128 元存为 `12800`。提成比例使用万分比：10% 存为 `1000`。

每位玩家必须满足：

```text
应收 = 实际消费 + 优惠
实际消费 = 微信 + 支付宝 + 现金 + 余额 + 其他
```

免单是实际消费 0、优惠等于应收，并填写原因；“免单”不是支付方式。组合支付允许同一玩家多种方式，余额部分生成扣款流水。

营业额仅汇总有效已完成场次的实际消费。充值资金流入单独展示，不加进营业额；余额消费属于本次场次收入，避免在充值和消费时重复计入。

财务日期范围与 DM、剧本筛选作用于场次；充值使用流水操作日期。支付方式筛选选择**包含该付款方式的场次**，展示这些场次完整消费及各方式金额，同时提示“所选方式收款”。组合支付场次不能按筛选后的单个支付金额伪造全场消费。

工资统计按场次日期的月份计算有效提成快照，加补贴、减扣款。仅已完成且未作废场次计入有效场次；规则调整影响后续结算，不改历史。四种模板为固定每场、按人数、营业额百分比、固定金额加超员奖励。百分比提成不足一分向下取整。

已完成场次不能直接删除，只能填原因作废。草稿允许删除；尚无财务记录的有效场次允许取消。审计记录包含操作人、动作、对象、操作前后数据和时间。

## 8. 检查命令与阶段验证

以下命令在项目根目录执行。`check` 检查 JavaScript 语法，`test` 验证业务行为，`build` 检查生产打包；都不连接真实数据库。

```powershell
Set-Location -LiteralPath 'D:\Codex test\xcx'
npm run check
npm test
node tools/seed.js --check
npm run build
```

语法检查正常时显示“JavaScript 语法检查通过”。测试正常时 Node test runner 的 `fail` 为 0；测试数量以实际输出为准。自动化测试使用内存存储，不修改浏览器演示数据。`seed.js --check` 核对种子与演示数据一致，不改写种子文件。

| 阶段 | 范围 | 运行验收重点 |
| --- | --- | --- |
| 1 | 框架、身份、Demo数据库、Dashboard | 各身份可进入；管理员数据来自业务记录；刷新不丢失数据 |
| 2 | 玩家、会员、余额、流水 | 会员即时保存；充值 500 生成前后余额及审计；门店独立 |
| 3 | 剧本、DM、场次 | 本店剧本设置、DM 开本权限和场次玩家可操作 |
| 4 | 结算、支付、余额、提成、财务 | 组合支付、余额不足回滚、历史快照、作废恢复 |
| 5 | 拼场 | 玩家报名待确认；管理员确认后人数增加；重复报名拒绝 |
| 6 | 玩家端 | 首页、详情、会员、余额和收藏；手机宽度表单可操作 |
| 7 | 社区 | 发帖、评论、点赞、收藏、举报；店铺不能自行下架 |
| 8 | 平台 | 订阅设置、门店列表、公共剧本、举报下架或驳回 |

业务层回归、HTTP/浏览器操作和真实数据库联调是不同检查。阶段表是验收指南；实际执行证据以 `CHANGELOG.md` 记录为准。

## 9. 常见错误

| 现象或提示 | 含义与处理 |
| --- | --- |
| `node` / `npm` 不是可识别命令 | Node.js 未安装或当前终端无法找到；安装确认后重开终端 |
| 端口已被占用 | 检查已有开发服务；按第 1 节换端口并使用终端实际地址 |
| 页面显示“正在打开”或模块/CORS错误 | 检查是否从 HTTP 地址打开；不要使用 `file://`；查看浏览器 Console 的首个错误 |
| 无法使用本地存储 / 保存失败 | 浏览器阻止存储或空间不足；允许网站存储，必要时更换正常浏览器；失败操作未提交 |
| 本地演示数据无法读取 | 已存数据损坏或版本不兼容；先保留需用的数据，再通过确认重置恢复；不要直接清空全部网站数据 |
| 另一地址看不到原数据 | 浏览器、主机名或端口不同；回到原始地址，数据按 origin 保存 |
| 演示数据已被其他窗口修改 | 同时操作冲突；刷新后核对最新记录再操作 |
| DM没有此剧本的开本权限 | 到“剧本管理”勾选该 DM；同时检查 DM 门店权限是否启用 |
| 余额不足 / 支付不一致 | 修正该玩家付款方式或金额；结算失败后不产生部分流水 |
| 登录失败 | 检查网络、URL、Publishable Key、邮箱密码、账号状态、是否执行 SQL 以及 `users.auth_id` 绑定 |
| 没有该身份或门店权限 | 云端登录账号未获该门店角色，或角色被停用；由项目所有者核对 `store_members` |
| `demo_read` / `demo_command` 不存在 | `schema.sql` 未完整成功执行，或配置指向了另一项目 |
| `relation already exists` | 初次建库脚本重复运行；检查已有数据库，不执行清库命令 |
| 云端不能重置 | 云端不开放本地重置功能；使用专用测试项目，不在网页批量删除财务记录 |
| 月度统计与初始数据说明不同 | 跨月、已修改数据或云端种子日期固定；检查筛选月份和历史记录 |
| 表格超出手机宽度 | 表格区域允许水平滚动；按钮和输入框应仍可点击；后台可用“菜单”进入页面 |
| 构建提示 Node.js 版本不支持 | 核对 `package.json` 的 engines 与所装 Node.js；升级前需确认，不删除测试或降级安全校验来绕过 |
| Vercel构建找不到依赖或脚本 | 确认导入的是项目根目录、锁文件已提交、Install Command为npm ci、Build Command为npm run build |
| Vercel部署仍显示本地演示 | 检查两个环境变量是否设在本次部署环境（Preview或Production）；保存后重新部署 |
| Vercel页面404或缺少资源 | 确认Output Directory为dist，构建输出含index.html；当前入口为根路径，不直接访问不存在的/admin等路径 |
| 朋友打开地址要求Vercel登录 | 检查Deployment Protection及该部署的共享权限；这与应用的Supabase登录不同 |
| 手机不能打开开发地址 | 使用Network地址，检查同一网络和防火墙；不同网络测试使用Vercel HTTPS网址 |

排查时只共享过滤后的错误摘要，避免展示密码、token、cookie、Authorization 请求头或包含隐私的数据导出。

## 10. 交付目录说明

```text
D:\Codex test\xcx\
├─ index.html：浏览器入口，加载样式与 ESM 应用
├─ config.js：读取 Vite 公开配置并兼容旧字段名称
├─ .env.example：两项公开数据库环境变量空模板，可提交
├─ .env.local：需自行创建的本地公开配置，Git 忽略，不提交
├─ .gitignore：忽略依赖、构建产物、实际环境配置和本地材料
├─ package.json：Vite 开发、构建、预览及原有检查/测试命令
├─ package-lock.json：锁定构建依赖，供 npm ci 使用
├─ vite.config.js：Vite 开发与预览服务配置，保留现有根目录入口
├─ vercel.json：Vite、安装、构建、dist 输出配置，无路由 rewrites
├─ css\
│  ├─ main.css：全局组件、颜色、文字、表单、弹窗
│  ├─ admin.css：后台侧栏、工作台和表格布局
│  └─ mobile.css：玩家界面、窄窗口和移动适配
├─ js\
│  ├─ app.js：页面状态、交互、表单提交与身份入口
│  ├─ api.js：选择本地存储或 Supabase Auth/RPC
│  ├─ auth.js：演示角色及账号映射
│  ├─ store.js：localStorage 持久化、原子提交与数据重置
│  ├─ domain.js：业务校验、权限、结算、作废和审计
│  ├─ demo-data.js：虚构测试数据生成器
│  ├─ finance.js：财务及工资统计
│  ├─ pages.js：各角色页面及列表渲染
│  ├─ ui.js：通用按钮、表单、卡片和表格
│  └─ utils.js：金额、日期、文本转义等基础方法
├─ database\
│  ├─ schema.sql：PostgreSQL 表结构、RLS、权限及事务 RPC
│  └─ seed.sql：由生成器写出的可提交测试种子
├─ tests\
│  ├─ domain.test.js：核心业务回归测试
│  ├─ api.test.js：认证、公开配置与请求重试模拟测试
│  ├─ config.test.js：模式选择、Publishable白名单及Vercel构建配置
│  └─ ui.test.js：本地模式提示与云端隐藏重置的回归
├─ tools\
│  ├─ server.js：旧静态服务退役指引，提示改用Vite后退出
│  ├─ check.js：JavaScript 语法检查
│  └─ seed.js：生成种子；--check 只读核对固定快照一致性
├─ README.md：启动、数据库配置、20 项操作及故障处理
├─ PROJECT_BRIEF.md：产品范围、阶段和限制
├─ PAGE_MAP.md：页面、角色及操作入口
├─ DATA_MAP.md：数据关系、金额和统计口径
├─ CHANGELOG.md：真实修订及检查记录
├─ dist\：npm run build 生成的可部署静态产物，Git 忽略
└─ _artifacts\：验收材料，不参与网页运行
   ├─ verification.md、screenshots\、logs\：原本地概念版验收记录
   ├─ public-demo-verification.md：本轮构建、响应式与公开部署准备验收报告
   ├─ public-demo-screenshots\：本轮浏览器真实操作截图
   ├─ public-demo-logs\：本轮构建、回归、HTTP及浏览器日志
   ├─ vite-env-entry-check\run-AONUnh\checks.json：8项真实构建环境入口结果
   └─ backups\before-public-demo-20261004-234917\：本轮修改前备份
```

用 VS Code 等文本编辑器打开整个 `D:\Codex test\xcx` 文件夹；“终端 → 新建终端”运行 `npm install` 和 `npm run dev`，再打开浏览器地址。该项目没有需单独打开的工程文件；生产构建使用 `npm run build`，只把 `dist` 交给静态托管服务。正常开发显示完整身份入口，正常预览应与开发版具有相同业务入口。

源码为 `index.html`、`js\`、`css\`；配置为 `config.js`、`vite.config.js`、`vercel.json`、`package.json`、`.env.example` 和 `.gitignore`；`database\` 是云端部署脚本；`dist\` 是自动构建产物。源码、配置模板、锁文件、SQL、测试和 Markdown 文档可提交。`node_modules\`、`dist\`、`.env.local`、实际登录资料、私人 JSON 导出与备份不提交。验收报告和脱敏截图/日志可作为独立交付附件，不参与部署。

素材来源为 `js\demo-data.js` 的虚构文字资料；封面、头像、门店环境由 `css\` 和页面代码绘制占位，不依赖下载图片。需求附件属于原始输入，不是运行依赖。

原本地验收报告为 `_artifacts/verification.md`；原截图来源为本地浏览器实际操作，保存于 `_artifacts/screenshots/`，原命令与浏览器日志位于 `_artifacts/logs/`。本轮验收材料使用 `public-demo-` 前缀的目录和报告，实际执行结果以报告内容为准。修改前文档备份位于 `_artifacts/backups/before-public-demo-20261004-234917/`，不作为最终说明文件提交。源码修订记录以 `CHANGELOG.md` 为准。

## 11. 当前边界

该版本适合概念测试，不是正式 SaaS 或微信小程序。未接入在线充值、微信/支付宝 API、短信、微信登录、评分、私聊、地图、推荐算法、复杂工资社保或图片云存储。

多品牌和多门店由数据结构支持，演示管理员固定管理大学城店，云端按真实授权选择门店。正式部署还需要真实云端验收、账号恢复与生产会话策略、迁移和备份策略、生产安全测试及运营流程确认。原型的预建云端账号用于受控测试，不应发给无权限人员。

## 12. 原本地概念版实测结果（2026-10-04）

JavaScript 语法检查通过，29 项自动化测试通过（20 项业务、9 项 API 模拟），种子一致性通过，HTTP 返回 200。浏览器完成第 3 节全部 20 项核心操作，并验证场次/玩家编辑、DM 新增玩家、社区互动、官方回复、平台下架、城市筛选和手机布局。

测试结束后已通过重置按钮恢复初始演示数据：张三 372 元、会员到期 2027-03-01；小王本月 18 场、1860 元场次提成。实际 Supabase SQL、RLS、Auth 及事务仍需在配置后的测试项目实机验收。详见 `_artifacts/verification.md`。

以上为引入 Vite 前的本地验收记录，不代替本轮生产构建、指定手机视口和公网部署验证。

## 13. GitHub 与 Vercel 部署

### 13.1 保存到 GitHub 私有仓库

1. 先运行第 8 节检查、测试和构建，核对 `.gitignore`；`git status` 不应包含 `node_modules`、`dist`、实际 `.env`、凭据或私人材料。
2. 当前项目使用 Git 的 `main` 分支，提交作者仅配置在本仓库。换设备或新建本地仓库时，首次提交前需由使用者设置真实 Git 作者，不填猜测身份。
3. 登录 GitHub 网页，点击新建 repository，选择 **Private**；采用已有本地仓库时不要生成与本地冲突的初始 README。
4. 复制 GitHub 新仓库页面给出的远程仓库地址，按该页面“push an existing repository”命令连接和推送当前分支，不使用 force push。
5. 当前没有 `gh` CLI；无需为网页导入安装它。若后续使用已安装的 GitHub CLI，应先执行 `gh auth login` 正常认证，不绕过登录。

当前 Git remote 为空，没有推送到 GitHub。以上是操作说明，不代表已建立远程仓库。仓库继续迭代时提交小范围源码改动，依赖变更同时提交 `package.json` 与 `package-lock.json`。

本地已有提交且尚未设置 `origin` 时，在项目根目录执行以下命令；用途是连接刚创建的 Private 仓库并首次推送。输入 GitHub 页面提供的仓库 HTTPS 地址，不输入带 token 或密码的 URL：

```powershell
Set-Location -LiteralPath 'D:\Codex test\xcx'
$repositoryUrl = Read-Host '粘贴 GitHub Private 仓库的 HTTPS 地址'
git remote add origin $repositoryUrl
git push -u origin main
```

Git 提示登录时按官方认证流程操作。已有 `origin` 时不要重复添加或随意更换远程；按当前仓库配置推送。

### 13.2 在 Vercel 网页导入

1. 登录 Vercel，创建新 Project，选择 Import Git Repository，连接 GitHub 并授权访问该 Private 仓库。
2. 选择项目，Root Directory 设为含本项目 `package.json` 的目录。独立仓库通常是仓库根目录。
3. 核对 Framework Preset 为 **Vite**，Install Command 为 `npm ci`，Build Command 为 `npm run build`，Output Directory 为 `dist`。
4. 如需跨设备共享，在部署前添加下表两项环境变量。值来自同一个 Supabase 项目；选择本次使用的 Preview / Production 环境。数据库必须已完成第 6 节建库及 Auth 用户绑定。
5. 点击 Deploy，等待构建与部署完成；打开部署详情提供的 **HTTPS** 地址，进行手机和电脑验收。

| Vercel 变量 | 值来源 | 用途 |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Supabase 项目 URL | 同一共享数据库项目 |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | 该项目 Publishable Key | 浏览器公开应用 key，仍需 Auth 与服务器权限 |

不配置这两项时网站仍可运行，但显示本设备演示模式，手机和电脑不会共享 localStorage。只配置一项属于配置错误。不要添加任何 `VITE_` 前缀的 Secret / Service Role Key。

通过分支或 PR 部署的 Preview 用于先验收；`main` 作为 Production Branch 时，确认 Preview 正常后将对应改动合并到该分支触发 Production 部署。仅发布通过检查的版本。环境变量变更后执行 Redeploy，重新构建客户端。

部署完成后在 Vercel Project 的 Domains 或 Deployment 详情中取得实际网址，通常形如 `https://项目名.vercel.app`。必须复制真实部署地址，不能把示例地址当作交付 URL。HTTPS 地址可从不同 Wi-Fi 或移动数据打开，不依赖电脑一直运行开发服务器。

Preview 或其他部署可能启用 Deployment Protection。发给朋友前检查该网址的访问权限，必要时在部署界面提供可共享访问；不能以已登录的管理员电脑能打开，推断所有访客都能访问。参考：[Vercel 部署访问保护](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments)。

参考：[Vercel 的 Vite 部署说明](https://vercel.com/docs/frameworks/frontend/vite)、[Git 导入与私有仓库](https://vercel.com/docs/git)、[Vercel 环境变量](https://vercel.com/docs/environment-variables)。

### 13.3 CLI 与路由说明

当前 `gh` 和 `vercel` 均不在 PATH，本轮没有安装 CLI。浏览器访问 Vercel Dashboard 跳转至 `Login – Vercel`，当前会话需要登录；直接读取登录页超时，不能据此推断发布成功。登录后可按第13.2节网页导入。若以后已安装并登录 Vercel CLI，可在项目根目录使用 `vercel` 创建 Preview，核验后使用 `vercel --prod` 发布。安装或升级 CLI 需先由设备使用者确认。

当前角色页面在同一入口切换，URL 为根路径，没有 `/admin`、`/sessions` 或 `/profile` 的客户端路径路由。`vercel.json` 不添加 SPA rewrites；这些地址不是受支持的直达页面，应从根入口使用导航。服务可能对未知路径返回首页或404，不能仅凭状态码判定路由或源码保护是否正确。未来实际加入路径路由时才增加对应 fallback。

旧 `tools/server.js` 已退役，直接执行只会提示使用 `npm run dev` 并退出。不要把开发服务、`vite preview` 或整个源码目录暴露为正式站点。

### 13.4 发布后验收与当前状态

发布后需要从电脑、iPhone、Android、不同 Wi-Fi 与移动数据打开实际 HTTPS 网址；在约 390px 宽度完成玩家报名、余额与流水，以及管理员创建、结算、余额、会员、财务、提成和报名确认。375、390、430、768、1024、1440px 视口应无整页横向溢出，宽表仅在自身容器内滚动。

跨设备共享验证应在同一 Supabase 项目中进行：在设备 A 保存一条获授权的业务修改，在设备 B 登录相应账号并刷新读取，确认服务器数据一致。验证时仅使用虚构资料。

当前尚无 Supabase 项目，配置为空，云端接入准备已完成，创建项目后按第 6 节启用；未进行真实云端跨设备联调。尚无已核实的 Vercel 部署和公网 URL。生产构建和本轮手机检查通过，详见第 14 节；本地预览结果不代表公开发布完成。

## 14. 本轮构建与生产预览核验（2026-10-05）

| 检查 | 实测结果 | 证据 |
| --- | --- | --- |
| 自动化测试 | 40/40通过，0失败 | `_artifacts/public-demo-logs/tests.log` |
| JavaScript语法 | 通过 | `_artifacts/public-demo-logs/check.log` |
| 种子一致性 | 只读 `--check` 通过 | `_artifacts/public-demo-logs/seed-check.log` |
| 生产构建 | Vite 8.3.2，17个模块，无构建警告 | `_artifacts/public-demo-logs/build.log` |
| 构建环境入口 | 8项真实Vite构建用例通过 | `_artifacts/vite-env-entry-check/run-AONUnh/checks.json` |
| 私有路径保护 | HTTP返回与首页一致的HTML，未返回私有文件源码；不能表述为全部404 | `_artifacts/public-demo-logs/http.json` |
| 生产预览 | `http://127.0.0.1:4173/`；6种宽度与390px流程通过 | `_artifacts/public-demo-logs/browser.json` |
| 浏览器控制台 | 0警告、0错误 | `_artifacts/public-demo-logs/browser.json` |

最终产物为 `dist/index.html`、`dist/assets/index-C8_M9cwC.css`（20.07kB，gzip 5.09kB）和 `dist/assets/index-BJ7XukKL.js`（80.63kB，gzip 27.12kB）。资源文件名含构建哈希，后续代码变更时会变化，不应在业务代码或部署配置中固定这些名称。

生产预览检查375、390、430、768、1024、1440px六种宽度；玩家首页、个人中心、拼场列表、管理员工作台、5名玩家的长结算表单均无整页横向溢出。375/390/430px抽屉的原生Tab焦点循环、Escape关闭、遮罩点击及关闭后菜单焦点恢复通过，菜单点击区域44px。

390px完成两人《年轮》结算：张三余额100+微信28，玩家2现金128；微信误填27时被拒绝，双击提交只保存一次。营业额16896→17152元，有效场次22→23，张三余额372→272，小王18场/1860元→19场/1960元。双击现金充值500只生成一次，余额变772，会员续期2027-06-30；拼场确认只增加一人，4/6→5/6。规则改为150元后，已结算场次仍保留100元快照及1960元历史合计。

作废上述结算后生成余额退款100元，余额变872，营业额恢复16896元、22场，刷新后数据保留。测试结束后通过界面重置演示数据，生产预览当前为初始数据。此过程没有真实支付或云端数据库写入。

本轮实际修订25个文件：

- 构建与配置：`package.json`、`package-lock.json`、`config.js`、`vite.config.js`、`vercel.json`、`.env.example`、`.gitignore`、`index.html`。
- 页面与数据交互：`js/api.js`、`js/app.js`、`js/ui.js`、`js/pages.js`。
- 响应式样式：`css/main.css`、`css/admin.css`、`css/mobile.css`。
- 测试：`tests/api.test.js`、`tests/config.test.js`、`tests/ui.test.js`。
- 工具：`tools/check.js`、`tools/server.js`。
- 说明文档：`README.md`、`PROJECT_BRIEF.md`、`PAGE_MAP.md`、`DATA_MAP.md`、`CHANGELOG.md`。

本轮完整报告为 `_artifacts/public-demo-verification.md`；采用的后台概览截图为 `_artifacts/public-demo-screenshots/admin-final-390.jpg` 和 `admin-final-desktop.jpg`，其余截图为各流程和视口的过程证据。备份路径及可提交分类见第10节。Git远程为空、未推送，Vercel当前会话需要登录，未发布；真实Supabase项目、跨设备共享和HTTPS公网部署均未实测。
