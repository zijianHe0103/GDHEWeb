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

### 前端 server-only ProductCard 运行时消费者

TASK-016 在 `frontend/src/lib/cms/server/product-cards/` 建立了 server-only ProductCard 运行时消费者：它固定请求英语 ProductCard Schema `1.0.0` collection，使用本地 8-file Schema closure 验证响应，并且只有真实 validated wrapper 才能适配为只读前端 DTO。每次编排只发起一次 collection 请求、零逐卡 `/resolve`；当前故意不包含 UI 或缓存。验证时从 `frontend/` 运行五个 `product-card-*.test.ts` 聚焦文件，以及 `npm run verify:product-card-contract` 和 `npm run verify:cms-contract`。

### 英语 ProductCard 本地可见列表切片

TASK-017 在 `/products/` 增加了一个固定 `noindex,nofollow` 的本地受控英语列表切片。它默认关闭，只能在非生产环境通过 server-only `GDHE_PRODUCT_LIST_MODE=preview|cms` 开启：`preview` 使用带 GDHE 品牌保护的 FGD X15 本地测试候选且不请求 CMS，`cms` 复用 TASK-016 的一次 collection 请求、零逐卡 `/resolve` 消费链。生产媒体来源尚未授权，因此非空 CMS 集合若只提供远程媒体 URL，会在进入 React 前整体转为脱敏的暂不可用状态，浏览器不会直连 WordPress；空集合仍保持独立空状态。两种模式在 production 都强制返回 404。

这只是可视化和接入验证页面，不是正式公开产品目录。真实产品导入、产品详情页、可工作的 RFQ/Contact 目标、公开 SEO、生产媒体配置和部署仍未实现；完整启动方式与边界见 [`frontend/README.md`](frontend/README.md#local-only-productcard-list-slice)。

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
