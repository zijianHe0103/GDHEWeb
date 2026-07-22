# TASK-002 执行报告

status: accepted-formal-commit-authorized
task: TASK-002
owner_lane: planner
completed_at: 2026-07-22T08:23:06Z
revised_at: 2026-07-22T08:44:20Z

## 1. 执行范围

本次只制定 Headless WordPress + Next.js 前端架构契约。没有初始化 Next.js，没有安装依赖或 WordPress 插件，没有修改 WordPress、数据库、主题、用户、页面或 uploads，也没有 commit、push、部署或修改远程仓库设置。

## 2. 已完成工作

1. frontend、wordpress_cms、localization_seo 三个持久化专业 Lane 分别完成独立证据文件；planner 接收、阅读并 ack 三条 execution response。
2. planner 复核本地只读运行基线和官方一手资料，完成 `docs/architecture/headless-wordpress-nextjs-contract.md`。
3. 建立 `ADR-004-headless-wordpress-nextjs-contract.md`，状态保持 `proposed`，等待 TASK-002 正式用户验收后才可改为 `accepted`。
4. 对两组真实分歧建立 `EVIDENCE_SYNTHESIS.md`：
   - frontend/CMS 推荐 WPGraphQL-first，planner 最终选择 REST-first；
   - localization/SEO 推荐 WPML + WPML GraphQL，planner最终选择 Polylang Pro。
5. 契约固化 Next.js/WordPress 责任、内容模型、ACF、九语言、SEO、预览、缓存、媒体、询盘、安全、部署和后续实施顺序。
6. 同步任务、项目状态、活动记录、planner worklog、Lane 消息与事件记录。
7. 处理 Round 1 `FAIL` 的窄范围意见：冻结 reference-level `MediaReference` 多语言模型，定义 `_gdhe_translation_group_uuid` 持久事实源，并把 GraphQL 重评门量化为固定 fixture、请求量、并发、延迟、错误率、负载与聚合复杂度阈值。

## 3. 最终架构裁决

| 领域 | 结论 |
|---|---|
| 公开前端 | Next.js App Router + TypeScript；初始化任务锁定当时稳定补丁版 |
| 内容后台 | 现有 WordPress；`wp-admin` 是唯一最终内容管理后台 |
| 数据协议 | REST-first：Core REST + 厂商 REST + 有限 `/gdhe/v1`；首期不安装 WPGraphQL |
| 内容字段 | `gdhe-site` PHP 注册事实源；目标编辑方案为 ACF Pro + Local JSON，受许可证与 PoC 门约束 |
| 多语言 | Polylang Pro 候选；九语言独立实体、人工审核和独立发布；不使用机器翻译发布 |
| SEO | Yoast 候选编辑层；Next.js 是公开 Metadata/Schema/Sitemap/robots 的唯一输出权威 |
| 预览/缓存 | 签名 Draft Mode + 服务端预览身份；HMAC Webhook + tag/path 失效 |
| 询盘/附件 | Next.js BFF + 隔离存储/扫描；机密文件不进入 Media Library |

## 4. 决策理由与保留门

REST-first 的原因不是否定 GraphQL，而是目前没有代表页面 fixture 或性能数据证明 WPGraphQL、ACF、多语言与 SEO 扩展链具有净收益。前端 adapter/DTO 保留协议隔离；如果 REST 出现被测量的关系查询、延迟或维护瓶颈，必须以新 ADR 复核，不允许在组件内临时双轨。

重评基准固定为 Home、Service、Case、Material 四个 fixture，在 CMS 同区域、WordPress 正常 object cache、旁路 Next.js 数据缓存的条件下，每类预热后 200 次、并发 20；串行请求、p95/错误率、归一化负载和聚合端点/查询图达到契约阈值时才强制启动 GraphQL 对照 PoC 与新 ADR。

Polylang Pro 与 REST-first 直接匹配且依赖链较短。WPML 仍是 GraphQL-first 或复杂翻译任务编排的主要备选；两者不得并装。Polylang Pro、ACF Pro、Yoast 和所有版本/许可证都需要后续独立任务重新核实、采购授权与 English/French/Arabic PoC。

媒体本地化只采用 reference-level override：首期保持 Polylang Media module 关闭，每次内容引用保存当前语言、当前上下文自己的 `MediaReference`；公开 alt 不回退英语、文件名或 attachment 全局 alt。译文组稳定 ID 由 GDHE Site Plugin 受保护 meta `_gdhe_translation_group_uuid` 持久化，不由 slug、URL 或 sibling 集合推导。

## 5. 产出

- `docs/architecture/headless-wordpress-nextjs-contract.md`
- `MEMORY/DECISIONS/ADR-004-headless-wordpress-nextjs-contract.md`
- `TASKS/ARTIFACTS/TASK-002/FRONTEND_ARCHITECTURE_EVIDENCE.md`
- `TASKS/ARTIFACTS/TASK-002/WORDPRESS_CMS_API_EVIDENCE.md`
- `TASKS/ARTIFACTS/TASK-002/LOCALIZATION_SEO_EVIDENCE.md`
- `TASKS/ARTIFACTS/TASK-002/EVIDENCE_SYNTHESIS.md`
- 本报告、验证日志和差异摘要。

## 6. 当前门禁

- execution：完成。
- Round 1 adversarial review：`FAIL`，P0=0、P1=1、P2=2；response 与 recovery request 均已处理并 ack。
- Round 1 窄修订：完成。
- fresh validation：修订后通过治理、边界、WordPress 基线、JSON、验收覆盖、Round 1 定向术语和 diff 检查；详见验证日志。
- Round 2 adversarial review：`PASS`；P0=0、P1=0。Round 1 的媒体 P1 与两项 P2 全部关闭；唯一非阻断 document impact P2 已由 planner 同步为 `RESOLVED`。
- user acceptance：`ACCEPTED` at `2026-07-22T09:07:14Z`。
- Git：本地 formal commit 已获精确授权；push 未授权。

正式提交前将重新运行治理、边界、WordPress checksum、diff、敏感信息和 staged content 检查；通过后创建一个本地正式提交并停止。
