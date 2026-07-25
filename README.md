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
- `/wp-json/gdhe/v1/navigation?locale=en`
- `/wp-json/gdhe/v1/route-manifest?locale=en`

当前公开内容模型包括原生 `page`/`post`，以及 `product`、`market`、`reference`、`support_article`、`download`；`site_settings` 不公开。

前端只能消费这些 GDHE 归一化 DTO，不能依赖 Core REST、SCF 字段、post meta、数据库表或 WordPress 数字 ID。当前只开放英语 `en`；Fixture、benchmark、清理和完整契约验证命令见 `docs/cms/`。

### 前端离线合同快照

前端现已在 `frontend/` 内持有 TASK-007 `/resolve` 合同的离线快照；从 `frontend/` 运行 `npm run verify:cms-contract` 验证。它不是 WordPress 连接、DTO Adapter 或可见页面；详细行为见 [`frontend/README.md`](frontend/README.md#cms-contract-snapshot)。

### 前端 server-only `/resolve` Transport

前端已建立英语 Schema 3 `/resolve` 的 server-only 匿名只读 Transport，并通过真实 Next.js Client Component 导入负例验证隔离。运行时使用 `WORDPRESS_API_URL`；本地明文 loopback 必须带显式端口，生产 CMS 使用 HTTPS。返回 JSON 仍为 `unknown`，当前不包含 Validator、DTO Adapter 或可见页面；配置、测试与验证命令见 [`frontend/README.md`](frontend/README.md#server-only-cms-transport)。
