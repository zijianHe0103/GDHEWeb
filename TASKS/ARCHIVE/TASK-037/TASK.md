# Task: 正式 Site 与 Manual Track Catalog 数据库基础

task_id: TASK-037
status: CLOSED
risk_level: MEDIUM
assigned_lanes: ["planner", "validation"]
acceptance_state: ACCEPTED
blocker_ref: NONE
next_action: Complete remaining Git delivery
contract_refs: ["project_contract", "architecture_contract", "product_master_logical_model", "public_product_flow_contract", "core_database_architecture"]

## 用户原始请求

把 TASK-036 验证的工具能力转化为正式 Site 与 Manual Track Catalog 数据库基础。仅创建 site.sites、catalog.categories、catalog.products、catalog.colors、catalog.product_colors、catalog.track_products、catalog.track_standard_lengths 七张表，以及 Drizzle Schema、SQL Migration、真实 PostgreSQL 集成测试和最小运行说明。正式资产登记到 Manifest；小范围校正过时的工具验证/实施状态描述。

## 结构化理解

用户已在本轮明确授权实施。正式资产位于独立 database/ 包，不从归档 Probe 改名，也不建立 NestJS 应用。TASK-036 已 CLOSED / ACCEPTED，结论 PASS；采用其已验证的精确工具版本，不重新泛化选型。

物理实现选择：稳定实体使用调用方提供的 PostgreSQL uuid，不继承 Probe 主键生成方式；Site key、Category code 和 Color code 唯一，Product model 不强加尚未确认的全局唯一性。第一阶段 family_code 只支持 track；Product–Color 使用复合主键；标准长度为整数毫米并以 length_mm 为主键。生命周期仅 active/inactive，不等同于 Publication 的发布状态；所有引用删除采用 RESTRICT。轨道子表先表达允许定制长度与 piece 单位，未确认的技术事实字段后续新增，不使用万能 JSONB。

## 目标与非目标

正式数据库基础可以重复从空库建立、读回和验证。标准长度字典采用已确认的 4300/5800/6000/6300/6700 mm；不预建产品配置组合。

不建立 Publication、RFQ、Product Spec、重量、布带、ERP、CRM 或 Integration 表；不建立业务 API，不迁移现有数据。

## 允许与禁止范围

本任务精确授权 database/**、PROJECT/MANIFEST.md、PROJECT/CONTRACT.md、docs/architecture/CORE_DATABASE_ARCHITECTURE.md、docs/architecture/GDHE_TARGET_ARCHITECTURE.md，以及必要的当前逻辑权威状态说明、任务包和官方生命周期状态。此为用户本轮批准的新增数据库范围，不据此扩大其他任务的 Lane 权限。

禁止修改 frontend/**、cms/**、现有 MySQL RFQ、历史 Probe 和既有 RFQ 合同。保护开始前的 .codex/config.toml、AGENTS.md、frontend/tsconfig.json 修改。无提交、推送、合并或部署授权。

测试只管理自己创建的随机命名一次性 PostgreSQL 容器及数据库；不通过外部连接串删除 Schema。正式 migrate 命令只执行版本控制中的 Migration，不承担环境删除。

## 验收标准

1. 正式 Schema 和 Migration 恰好包含七张业务表；Drizzle 自身 Migration 元数据表单独说明。
2. 真实 PostgreSQL 从空库执行全部 Migration，读回表、列和约束；再次执行不重复应用。
3. 无效外键、重复 Product–Color 关系、重复稳定 code、非法长度/顺序/状态/单位被数据库拒绝；型号相同的不同 Product 不被误拒绝。
4. 多表事务第二次写入失败后，第一次写入无残留；引用删除不级联丢失数据。
5. 五个已确认标准长度按顺序读回；测试产品和客户数据不进入正式 Migration。
6. 单独执行再次 generate，记录声明快照无未解释差异；不把它当作运行数据库检查。
7. 测试容器正常与失败路径均清理；测试结束确认本次容器不存在。
8. 定向检查 Manifest 路由、文档状态和 git diff --check；旧应用路径保持不变。

## 执行与验证安排

先写真实数据库行为测试并观察缺失结构 RED；实现七表声明并生成、审查 SQL；执行完整数据库集成测试与类型检查；独立记录再次 generate 结果；完成最小文档说明及一次最终审阅。除实际失败或后续改动外，不重跑 TASK-036 工具实验、旧站全量测试或额外完整审核。
