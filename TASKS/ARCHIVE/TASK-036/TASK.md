# Task: PostgreSQL 与 Drizzle 最小兼容性验证

task_id: TASK-036
status: CLOSED
risk_level: MEDIUM
assigned_lanes: ["planner"]
acceptance_state: ACCEPTED
blocker_ref: NONE
next_action: Complete remaining Git delivery
contract_refs: ["project_contract", "architecture_contract", "product_master_logical_model", "public_product_flow_contract", "core_database_architecture"]

## 用户原始请求

验证经过实时核查并精确锁定的稳定版本 Drizzle ORM、Drizzle Kit、PostgreSQL Driver 与真实 PostgreSQL，是否能够准确支持 TASK-035 已接受的数据库能力。必须提供真实数据库执行和读回证据，不得只凭文档、类型检查或模拟数据库判定通过。

## 结构化理解

这是一次隔离的兼容性 Spike，也是项目从规划阶段进入实际代码验证阶段的第一项任务。验证资产保存在本任务包内部的 `PROBE` 目录，不进入 Next.js、WordPress 或未来 Core Application 正式源码，也不构成完整正式数据库 Schema。

验证使用两个可安全重建的本地测试数据库：一个从空库执行全部 Migration；另一个先执行上一版最小 Migration、写入代表性测试数据，再执行新增 Migration。测试结构只表达验证约束所需的最小代表性关系，不据此冻结 TASK-035 尚未决定的正式表名、字段、ID 类型或索引清单。

## 目标与非目标

目标：

- 实际验证 PostgreSQL 多 Schema、主键、唯一约束、复合唯一约束、外键、复合外键、CHECK 和 JSONB；
- 实际验证 Page 当前版本只能指向属于同一 Page 的 Page Version；
- 实际验证模拟品类 Product Spec 子记录与 Product Spec 主记录属于同一 Product；
- 实际验证多表事务整体回滚和 RFQ 最小并发幂等；
- 实际运行 Drizzle Kit `generate`，保留人工可审查的候选 SQL；
- 实际验证清晰的 Custom SQL Migration 能与生成 Migration 顺序共存；
- 实际验证空数据库从零迁移和上一版测试数据库升级迁移；
- 根据证据给出 `PASS`、`PASS_WITH_CUSTOM_SQL` 或 `FAIL`。

非目标：

- 不创建完整正式数据库 Schema，不实施 TASK-035 的全部正式业务表；
- 不冻结 TASK-035 尚未决定的物理字段、ID 方案、索引、删除动作或运行架构；
- 不建立正式 Catalog、Publication、RFQ、Product Spec、ERP、CRM、飞书或生产模块；
- 不迁移现有 MySQL RFQ、真实产品、客户或其他业务数据；
- 不创建 NestJS 项目，不建立通用 Repository、Unit of Work 或 CRUD Framework。

## 允许范围

- 在 `TASKS/ACTIVE/TASK-036/PROBE/**` 增加独立 Node.js/TypeScript 技术验证包；
- 在验证包内精确锁定经实时核查的稳定 Drizzle ORM、Drizzle Kit 和 PostgreSQL Driver；
- 增加最小 Drizzle Schema、生成 Migration、Custom SQL Migration、测试与验证脚本；
- 使用本地真实 PostgreSQL 测试实例和可重建测试数据库；
- 在任务包中记录实际 SQL、版本、命令、读回结果与结论；
- 更新本任务合同、验证报告及 DPG 生命周期所需的项目状态。

## 禁止范围

- 不修改 `PROJECT/CONTRACT.md` 或 Manifest 路由的任何长期架构权威；
- 不修改现有 Next.js 产品页面、RFQ 业务合同、WordPress 数据流或 MySQL RFQ；
- 不修改 `frontend/package.json`、`frontend/package-lock.json` 或现有应用依赖；
- 不导入真实产品、客户或生产数据；
- 不使用 SQLite 或 Mock Repository 替代真实 PostgreSQL 证据；
- 不使用 `drizzle-kit push` 代替 Migration；
- 不增加 Hash、Baseline、持续 Schema Gate、自定义 Migration Framework 或无关抽象；
- 不因 Drizzle 的限制删除数据库约束或改变已冻结业务模型；
- 不覆盖 `.codex/config.toml`、`AGENTS.md`、`frontend/tsconfig.json` 等任务开始前已有的无关修改；
- 不提交、推送、合并、发布或部署。

## 验收标准

1. 报告精确记录 PostgreSQL、Node.js、npm、Drizzle ORM、Drizzle Kit 和 Driver 版本及核查来源。
2. Drizzle Kit `generate` 成功，候选 SQL可人工阅读，并明确哪些约束由生成 SQL 表达。
3. Custom SQL Migration 被实际顺序执行，并说明它补足的具体能力；若完全不需要 Custom SQL，也必须提供实际验证依据。
4. 主键、唯一、复合唯一、外键、复合外键、CHECK 的有效写入成功，代表性无效写入被真实 PostgreSQL 拒绝。
5. JSONB 写入后按结构读回；不得把关系型产品或规格事实改成 JSONB。
6. Page/current Page Version 同属 Page 约束和 Product Spec 子记录同属 Product 约束均有成功与数据库拒绝证据。
7. 人为触发第二张表失败后，多表事务第一张表的写入不存在。
8. 并发相同 RFQ 幂等 key 只产生一个权威结果；同 key 不同 payload 被区分为冲突或数据库拒绝，且无重复 RFQ。
9. 空库执行完整 Migration 后结构与约束可用。
10. 上一版测试数据库保留代表性旧数据并成功升级，新约束和新结构可用。
11. `git diff --check` 通过，现有无关修改保持未纳入任务差异。
12. 最终结论严格为 `PASS`、`PASS_WITH_CUSTOM_SQL` 或 `FAIL`，并列出未实施的正式业务范围。

## 停止条件

若验证表明必须改变 TASK-035 的业务模型或 PostgreSQL、TypeScript、NestJS 等主要技术方向，停止相关实施，先报告问题、真实证据、可选方案、影响和推荐，不自行修改长期权威。
