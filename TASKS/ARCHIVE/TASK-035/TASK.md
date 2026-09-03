# Task: Freeze Phase-One Core Database Skeleton and Evolution Baseline

task_id: TASK-035
status: CLOSED
risk_level: MEDIUM
assigned_lanes: ["planner"]
acceptance_state: ACCEPTED
blocker_ref: NONE
next_action: Complete remaining Git delivery
contract_refs: ["project_contract", "architecture_contract", "product_master_logical_model", "public_product_flow_contract", "core_database_architecture"]

## 用户原始请求

以经过第一性原理和对抗式审核的最终指令取代所有旧 TASK-035 草稿，只把第一阶段核心数据库骨架和数据库演进基线写入长期权威、专项架构文档与任务治理记录。本轮不是数据库实施任务。

## 结构化理解

第一阶段只支撑一个 Manual Track Product 从 WordPress 正式发布、Core Application 组合、Next.js 展示到客户提交原始 RFQ 并由 PostgreSQL 原子保存的链路。

当前设计领域为 Site、Catalog、Publication 与 RFQ。实际目标表范围为 `site.sites`，Catalog 的 categories、products、colors、product_colors、track_products、track_standard_lengths，Publication 的 pages、page_versions，以及 RFQ 的 requests、request_lines、idempotency_records。

长期保留 Product → Product Spec → 品类专属 Product Spec 的关系，但第一阶段不创建 Product Spec、轨道重量、轨道具体成品或布带专属结构。Article Number 始终属于 Product Spec；客户原始 RFQ 不解析 Product Spec 或 Article Number。

Drizzle 是完成最小真实 PostgreSQL 兼容性验证后的条件性首选，不是绕过正确数据库约束的理由。正式数据库演进只能经过已审查 Migration。

## 第一性原理调整

相较早期草稿，本任务明确完成以下收缩和修正。

- 第一阶段删除 Product Spec、Track Weight 和 Track Product Spec 的实际建表范围；
- 增加稳定的 `site.sites`；
- Publication 增加稳定 WordPress Page 来源身份和稳定来源版本幂等身份；
- RFQ 每行使用单一、受控、服务端生成的 `line_snapshot`；
- PostgreSQL 幂等记录删除当前 MySQL Stub Sink 的外部交付状态机；
- Drizzle 改为最小兼容性验证通过后采用；
- 增加 Migration Role 与 Application Role 的权限分离；
- 删除 `is_orderable`、完整 Length Policy、通用 Repository、通用 Soft Delete、万能 JSONB/EAV 和其他过早结构。

## 目标与非目标

目标是建立可由 Manifest 稳定发现的长期数据库架构权威，清楚区分第一阶段实际结构、长期扩展、不变量、迁移原则和未决事项。

非目标包括数据库或 Schema 创建、Drizzle/Driver 安装、DDL、Migration、NestJS 数据模块、Next.js/WordPress/RFQ/MySQL 变更、Product Spec、布带、CRM、ERP、Audit、Outbox、外部系统、部署和任何 Git delivery。

## 允许范围

- 更新 `PROJECT/CONTRACT.md` 的高层长期数据库边界；
- 在 `PROJECT/MANIFEST.md` 增加语义化 `core_database_architecture` 路由；
- 创建 `docs/architecture/CORE_DATABASE_ARCHITECTURE.md`；
- 更新 TASK-035 治理记录及 DPG 生命周期所需的 State 与事件；
- 仅在确有冲突时调整旧架构文档的权威状态。

## 禁止范围

- 不修改业务代码、依赖、数据库、Migration、运行配置或目录结构；
- 不修改现有 MySQL RFQ、WordPress 数据流、Product Configuration、Quote Basket、RFQ 合同或 Next.js 页面；
- 不创建 PostgreSQL、Drizzle Schema、NestJS Module、Product Spec、ERP、CRM、布带表、Audit 或 Outbox；
- 不增加 Schema/Migration Hash、Baseline 或 Freeze Gate；
- 不覆盖 `.codex/config.toml`、`frontend/tsconfig.json` 或其他无关未提交修改；
- 不提交、推送、合并或部署。

## 验收标准

1. 专项文档标记 `accepted` 且明确 `not_implemented`，完整记录用户确认的第一阶段范围、长期关系和演进基线。
2. Project Contract 只追加不可违反的高层数据库边界，不复制实施级字段设计。
3. Manifest 以语义化 `core_database_architecture` 路由指向真实存在的专项文档，不增加任务编号路由。
4. 当前 architecture contract 仍指向新的目标架构权威；旧 Headless WordPress 文档保留 historical/superseded 状态。
5. Product Spec、轨道重量、布带、CRM、ERP、Audit、Integration 等后置结构和所有未决物理设计明确可辨。
6. Manifest JSON 解析、所有新增路由存在性、必需内容、受限变更范围、Markdown 基础检查、DPG full 和 `git diff --check` 通过。
7. 没有业务代码、依赖、数据库、Migration、Next.js、WordPress、RFQ 合同、MySQL RFQ、运行配置或无关工作区修改由本任务改变。

## 当前验收状态

本轮执行只能形成候选并进入 `AWAITING_USER`。按照当前 DPG 规则，`CLOSED / ACCEPTED` 与正式 Git delivery 需要用户后续给出精确接受指令；本任务明确禁止自行提交或推送，因此执行阶段不得伪造已接受状态。

推荐下一候选为 TASK-036 PostgreSQL 与 Drizzle 最小兼容性验证。它只作为待讨论候选，不在本任务创建或自动授权。

## 执行与验收证据

- 新增语义化数据库架构权威并明确其尚未实施；
- Project Contract 仅追加高层硬边界；
- Manifest 新增的数据库架构路由解析到真实文件；
- 旧 Headless WordPress 文档继续为 `SUPERSEDED / HISTORICAL`，未被重写；
- Manifest JSON、四条架构语义路由、必需内容断言和 `git diff --check` 通过；
- DPG full 校验通过且 findings 为零；
- 任务候选的 canonical validation verdict 为 PASS；
- 未运行或声称数据库、Drizzle、Migration、依赖、业务测试、提交、推送、合并或部署。
