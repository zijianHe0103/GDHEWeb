<!-- BEGIN DURABLE_PROJECT_GOVERNANCE -->
## Durable Project Governance

本项目使用 Durable Project Governance schema `DPG-LANES-1.0.0`。

治理层：

- `PROJECT/`：项目事实；
- `TASKS/`：任务、交付物和 issue；
- `MEMORY/`：长期决策和经验；
- `LANES/`：多会话 Agent Lanes 的 session、message、worklog、resume 和 handoff。

默认 lanes：`planner`、`executor`、`adversarial_reviewer`。`planner` 是默认用户沟通入口。任何 lane、dispatch 或 automation 都不能绕过 `task-accept` 的精确用户验收口令。

正式交付使用精确口令 `确认 TASK-XXX 完成并提交到远端`。收到口令后，完成本地正式提交，立即推送当前任务分支，再合并到 `main` 并推送 `main`；远端 `main` 包含该任务提交后，正式交付才算完成。

任务影响使用方式、功能或流程时，更新本文件并将任务字段 `readme_impact` 置为 `UPDATED`；其他任务使用 `NOT_APPLICABLE`。
<!-- END DURABLE_PROJECT_GOVERNANCE -->

## 本地 WordPress 与英语公开 API

WordPress 位于 `cms/`，继续作为唯一内容管理后台；`gdhe-site` 提供英语版、匿名只读、版本化的前端 DTO。启动本地 CMS：

```sh
wp server --path=cms --host=127.0.0.1 --port=8080
```

后台地址为 `http://127.0.0.1:8080/wp-admin/`。公开 API 基线：

- `/wp-json/gdhe/v1/schema`
- `/wp-json/gdhe/v1/resolve?locale=en&path=/&schema=3.0.0`
- `/wp-json/gdhe/v1/collection/{type}?locale=en`
- `/wp-json/gdhe/v1/product-cards?locale=en&schema=1.0.0&page=1&per_page=10`
- `/wp-json/gdhe/v1/navigation?locale=en`
- `/wp-json/gdhe/v1/route-manifest?locale=en`

当前公开内容模型包括原生 `page`/`post`，以及 `product`、`market`、`reference`、`support_article`、`download`；`site_settings` 不公开。

`product-cards` 是独立、封闭的 ProductCard Schema `1.0.0` collection：一次请求返回列表渲染所需的完整卡片 DTO，资格校验先于筛选、总数和分页，禁止前端逐卡调用 `/resolve`。它不会改变 Content Schema `3.0.0` 或原有四个公开内容端点。

前端只能消费这些 GDHE 归一化 DTO，不能依赖 Core REST、SCF 字段、post meta、数据库表或 WordPress 数字 ID。当前只开放英语 `en`；ProductCard 已具备 CMS/API 合同、前端离线快照、server-only 运行时消费者和本地受控可见列表切片，但尚无正式公开产品页或正式产品导入。Fixture、benchmark、清理和完整契约验证命令见 `docs/cms/`。

### 前端离线合同快照

前端现已在 `frontend/` 内持有 TASK-007 `/resolve` 合同的离线快照；从 `frontend/` 运行 `npm run verify:cms-contract` 验证。它不是 WordPress 连接、DTO Adapter 或可见页面；详细行为见 [`frontend/README.md`](frontend/README.md#cms-contract-snapshot)。

### 前端 ProductCard 离线合同快照

前端现已在 `frontend/src/lib/cms/product-card-contract/` 内持有 TASK-014 ProductCard 合同的独立离线快照；从 `frontend/` 运行 `npm run verify:product-card-contract` 验证 TASK-014 权威身份、精确 8-file Schema closure、3 份 0/1/N 成功样例和 6 份规范化错误。它与 TASK-008 `/resolve` Snapshot 相互隔离；快照自身不执行网络请求、React/UI、可见页面或 WordPress 连接。详细边界见 [`frontend/README.md`](frontend/README.md#productcard-contract-snapshot)。

### 产品配置与 QuoteLine 离线合同

TASK-019 在前端增加了 WordPress `ProductConfigurationDocument 1.0.0` 的精确离线快照和独立 `QuoteLine 1.0.0` 询价行合同。从 `frontend/` 运行 `node scripts/verify-product-configuration-contract.mjs` 验证配置快照，再运行 `npm test -- tests/product-configuration-contract-snapshot.test.ts tests/quote-line-contract.test.ts` 验证权威绑定、正负样本及询价行相等/合并规则。

TASK-020/021 已将这些合同接入本地可见配置器；TASK-022 建立了不含付款语义、同一浏览器保存 30 天的公开 Quote Basket；TASK-025/026 又交付 Quote Basket `3.0.0`、一次混合行校验与 RFQ Submission `2.0.0`。TASK-027 建立仅限本地开发的 server-only `POST /api/rfq/intake/` Stub；TASK-028 在本地 `/request-a-quote/` 接入十字段客户表单、30 分钟 intent、一次同源 intake、客户安全回执与精确 accepted 清除。TASK-029 又在本地 `persistent_stub` 模式下将进程内 Repository 替换为独立 `gdhe_rfq` MySQL Schema，并验证两个 Repository、两个 Next 进程、20 个同 Key 并发请求、跨重启重放与冻结崩溃窗口；只有 MySQL Repository 持久，隔离 Stub Sink 仍为进程内，pending/indeterminate 不会自动重发。这些仍是 `noindex,nofollow` 的本地测试切片；production、未配置和禁用模式下页面、intent 与 intake 均最终 404。生产 TLS、备份/恢复、高可用、托管密钥、限流/challenge/trusted-proxy、受控对账、真实 Sink、飞书/CRM/邮件、部署和公开发布仍未实现。精确 migration、启动、重启验证与清理命令见 [`frontend/README.md`](frontend/README.md#local-persistent-rfq-replay)。

### 前端 server-only ProductCard 运行时消费者

TASK-016 在 `frontend/src/lib/cms/server/product-cards/` 建立了 server-only ProductCard 运行时消费者：它固定请求英语 ProductCard Schema `1.0.0` collection，使用本地 8-file Schema closure 验证响应，并且只有真实 validated wrapper 才能适配为只读前端 DTO。每次编排只发起一次 collection 请求、零逐卡 `/resolve`；当前故意不包含 UI 或缓存。验证时从 `frontend/` 运行五个 `product-card-*.test.ts` 聚焦文件，以及 `npm run verify:product-card-contract` 和 `npm run verify:cms-contract`。

### 英语 ProductCard 本地可见列表切片

TASK-017 在 `/products/` 增加了一个固定 `noindex,nofollow` 的本地受控英语列表切片。它默认关闭，只能在非生产环境通过 server-only `GDHE_PRODUCT_LIST_MODE=preview|cms` 开启：`preview` 使用带 GDHE 品牌保护的 FGD X15 本地测试候选且不请求 CMS，`cms` 复用 TASK-016 的一次 collection 请求、零逐卡 `/resolve` 消费链。生产媒体来源尚未授权，因此非空 CMS 集合若只提供远程媒体 URL，会在进入 React 前整体转为脱敏的暂不可用状态，浏览器不会直连 WordPress；空集合仍保持独立空状态。两种模式在 production 都强制返回 404。

这只是可视化和接入验证页面，不是正式公开产品目录。真实产品导入、可工作的 RFQ/Contact 目标、公开 SEO、生产媒体配置和部署仍未实现；完整启动方式与边界见 [`frontend/README.md`](frontend/README.md#local-only-productcard-list-slice)。

### FGD X15+PVC 本地可见产品详情切片

TASK-018 在 `/products/fgd-x15-pvc/` 增加了一个本地受控、固定 `noindex,nofollow` 的英语产品详情切片。它默认关闭，只能在非生产环境通过 server-only `GDHE_PRODUCT_DETAIL_MODE=preview|cms` 开启：`preview` 使用仓库内受保护测试候选且不访问网络；`cms` 只执行一次经过 Schema 3 Validator 验证的 `/resolve` 请求，并在 Product Detail DTO 边界排除 CMS 媒体、Article Number、内部产品代码和诊断信息。两种 ready 模式都明确显示本地非生产提示，production 中均强制返回 404。

TASK-021 将该配置区升级到 Product Configuration `2.0.0`，并保留 QuoteLine `2.0.0` 作为未来服务端转换合同：`Track Length` 首先列出 WordPress 已验证 Article Number 动态投影出的标准长度，并在同级提供 `Custom Length`；`Color` 紧随长度并只显示真实可用组合。轨道询价不再要求客户选择 Installation。当前测试数据只有 `6 m / Ivory White`，不会虚构 `4.3 m` 或 `7 m`。TASK-022 已将 Packaging、数量和 `Add to Quote` 接入版本化的公开 Quote Basket：完整相同的公开配置合并数量，不同配置保留独立行，并在同一浏览器中保存 30 天。本地 `/request-a-quote/` 可查看、修改和删除条目；TASK-028 已接入十字段客户表单、仅本地进程内 Stub 提交和精确 accepted 快照清除。该能力在 production、未配置和禁用模式下最终 404，仍没有生产持久化、安全供应商、飞书/CRM/邮件或部署。TASK-025 又增加了 Quote Basket `3.0.0`：标准配置和可直接询价配件在浏览器数据中携带 Article Number，自定义长度继续使用 `articleNumber:null / sales_follow_up`；Article Number 不主动显示在客户可见或可访问文本中，但允许出现在 HTML/Flight、状态、浏览器存储和开发者工具。生产模式继续强制 404。完整启动、验证方式与当前边界见 [`frontend/README.md`](frontend/README.md#local-only-fgd-x15pvc-product-detail-slice)。

TASK-023 又在本地 FGD X15+PVC 详情切片中接入一次完整的 RelatedProductCard 集合，并在配置器之后显示受保护的 `You May Also Need` 测试模块。复杂产品使用 `View Product`；明确允许直接询价的目录配件以数量 `1` 加入浏览器本地 Quote Basket，客户再在 Basket 中修改数量。TASK-025 保留 RelatedProductCard `1.0.0`，新增携带配件 Article Number 的 `2.0.0`，并建立一次最多校验 50 条配置产品/目录配件的匿名只读 WordPress 批量合同与 Next.js server-only consumer；一次批量请求不逐行调用 `/resolve`、Product Configuration 或 RelatedProductCard，任一行失败时不应用部分结果。该能力仍是本地、`noindex` 且生产强制 404 的纵向切片，不代表最终询价提交、飞书同步、价格、付款、结账或部署。

### 前端 server-only `/resolve` Transport

前端已建立英语 Schema 3 `/resolve` 的 server-only 匿名只读 Transport，并通过真实 Next.js Client Component 导入负例验证隔离。运行时使用 `WORDPRESS_API_URL`；本地明文 loopback 必须带显式端口，生产 CMS 使用 HTTPS。返回 JSON 仍为 `unknown`，当前不包含 Validator、DTO Adapter 或可见页面；配置、测试与验证命令见 [`frontend/README.md`](frontend/README.md#server-only-cms-transport)。

### 前端 server-only Runtime Validator

前端已使用精确锁定的 Ajv Draft 2020-12 校验 TASK-008 的 16-Schema 本地闭包，并为成功和错误 payload 提供 server-only 运行时入口、opaque validated wrapper 与稳定的非泄漏错误语义。TASK-011 在不修改 Validator 语义的前提下，将它接入最小 Adapter 和技术验证页；Validator 的聚焦测试和使用边界见 [`frontend/README.md`](frontend/README.md#server-only-cms-runtime-validator)。

### 本地 CMS 技术验证页

`/integration/cms` 是显式开启、默认关闭的 Server Component 技术页，用于验证 `WordPress /resolve -> Runtime Validator -> Adapter -> frontend DTO` 的最小只读链路。它不是正式首页或通用 CMS 页面模板，不接受浏览器提供的 CMS 地址或内容路径，也不渲染原始 JSON、`safeHtml` 或媒体。

本地使用时，在用户自己的 `frontend/.env.local` 中配置有效的 loopback `WORDPRESS_API_URL`，并设置：

```dotenv
GDHE_ENABLE_CMS_INTEGRATION_PAGE=1
GDHE_CMS_INTEGRATION_PATH=/
```

然后从 `frontend/` 运行 `npm run dev`，访问 `http://localhost:3000/integration/cms`。开关缺失或不是精确值 `1` 时该路径返回 404。详细边界和离线验证命令见 [`frontend/README.md`](frontend/README.md#offline-cms-integration-vertical-slice)。
