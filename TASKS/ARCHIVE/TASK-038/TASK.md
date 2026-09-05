# Task: NestJS Core 最小运行基础与 Manual Track Catalog 受控读写

task_id: TASK-038
status: CLOSED
risk_level: MEDIUM
assigned_lanes: ["planner", "validation"]
acceptance_state: ACCEPTED
blocker_ref: NONE
next_action: Complete remaining Git delivery
contract_refs: ["project_contract", "architecture_contract", "product_master_logical_model", "public_product_flow_contract", "core_database_architecture", "core_database_source"]

## 用户原始请求

用户明确授权本地 TASK-038：复用 TASK-037 七表，建立可运行 NestJS Core，实现受控 Manual Track 创建、整体事务 PATCH、按 ID 读取、型号及中英文名称搜索、CMS 只读接口、公开事实投影和参考数据读取。必须通过构建后的 Node.js、真实 HTTP、正式 Migration 和真实 PostgreSQL 验证，不只是脚手架。

## 结构化理解

起点 HEAD 为 603d670b78fbc577d2e8c750e8b3e0206b82f198；TASK-037 已 CLOSED/ACCEPTED，State 原 current_task=NONE。在当前非 main 的工作分支原位执行，不搬动目录或覆盖四项已有本地修改。需求和常规接口/函数/包接入选择已获本轮授权；改变业务含义、数据库字段或主要技术选型时才暂停受影响部分。

实施说明已先在会话输出。Core 落点 core/；database/ 保留唯一 Schema/Migration，通过最小 ESM build/exports 和 file:../database 接入。输入与 OpenAPI 使用同一 TypeBox JSON Schema，Ajv 校验；不另建快照/Hash/Gate。REST + OpenAPI 仅冻结本次 Catalog 接口。

## 目标与非目标

交付运行中的受控 Catalog 行为，供 TASK-039 消费。创建显式提交生命周期；PATCH 未提交字段和颜色关系保持不变，颜色按稳定 Color ID 增改、显式停用，不物理删除。Product UUID 由当前 Core 实现生成，型号不唯一。所有多表修改同一事务，updated_at 服务端维护。

维护、CMS、英文公开事实分别映射；CMS 可以识别 inactive/不完整记录，但公开事实只接受 active Product、active Category、完整 Track。公开颜色同时要求 Color active、关系 active、is_public=true；标准长度实时读取 active 字典。公开事实不是站点发布资格。当前 API 不接受 Site ID、不推断 Site–Product 分配。

## 允许与禁止范围

允许 core/**；database 的 package/build/exports、测试辅助接入及运行说明（不改 schema.ts 或 migrations）；PROJECT/MANIFEST.md、PROJECT/CONTRACT.md、docs/architecture/GDHE_TARGET_ARCHITECTURE.md 相关状态校正；本次 Catalog API 合同与任务记录及官方生命周期。

禁止修改七表/0000/0001；禁止建立第二份 Schema/journal；禁止 Nest 自动 migrate/seed、真实数据导入、WordPress、frontend、旧 RFQ、Publication、Spec、重量、布带、媒体、SSO/RBAC 平台、缓存/队列、通用 Repository/UoW、部署或 Git 交付。保护既有 .codex/config.toml、AGENTS.md、frontend/tsconfig.json、AGENTS.md.backup-20260905-125627。

维护和 CMS 使用不同 Bearer 服务凭据；缺失/错误凭据 401、CMS 写入 403。仅监听 127.0.0.1。真实 API 使用仅具必要 SELECT/INSERT/UPDATE 的非所有者账户；Migration/参考数据初始化由测试专用管理员执行。测试复用 database/tests/postgres.ts，只销毁自有容器。

## 验收标准

1. 干净安装后构建；node dist/main.js 可加载 database 包、启动、真实探测数据库并关闭释放 Pool/HTTP。
2. 实际 HTTP 鉴权及非法字段/UUID/枚举/搜索边界验证；凭据、SQL、堆栈和连接信息不外泄。
3. API 创建三表并读回；同型号不同 ID 独立保存；Category/Color 不存在不自动创建。
4. PATCH 原子更新、未提交信息保留、显式颜色停用保留关系、系统字段不可写、updated_at 由服务端更新。
5. 在已执行前序 SQL 后由真实外键失败触发创建/更新事务回滚，读回无残留/无部分修改。
6. DB 端有界搜索型号/中英文名，稳定排序；空列表、404 与系统 503/500 分开。
7. CMS 投影更新可见；公开事实颜色与生命周期过滤，不伪造未实现字段、不泄漏内部维护字段。
8. 关闭并重新启动 Core 后使用同一测试数据库读到原产品；应用账户不能 DDL/DELETE/写字典。
9. OpenAPI 请求和响应 Schema 与实际 HTTP 正反例一致；受影响 database 类型/测试回归；不重跑旧站全套或 Probe。
10. Manifest 增加真实 core_source 与 catalog_api_contract 路由；记录一次独立审阅、当前候选绑定和 git diff --check，等待用户验收，不自动交付。

## 实施计划与进度

本节是本任务唯一执行计划，按 writing-plans / TDD 思路执行；不另建重复 spec/ledger，不进行每个小步骤的完整审核或提交。用户完整任务指令为范围依据。

- [x] 包接入：database/tests/package.test.ts 先证明 Node 无法按包入口消费，再增加 package exports / tsconfig.build.json / build，复用原测试辅助。
- [x] Core HTTP：core/src/main.ts、app.module.ts、config.ts、database.ts、auth.guard.ts、errors.ts；core/tests/http.test.ts 先验证构建后启动/权限和创建缺口，再补最小运行基础。
- [x] Catalog：core/src/catalog/contract.ts（TypeBox 输入/输出与 OpenAPI）、catalog.service.ts（原子写入、DB 搜索、三种投影）、catalog.controller.ts、catalog.module.ts。测试先声明创建/更新/颜色保留/真实后续 SQL 失败回滚，再完成实现。
- [x] 集成：同一真实 HTTP 测试覆盖搜索、参考数据、公开过滤、错误脱敏、OpenAPI、数据库故障、最小权限和重启持久化；有缺陷只修相应点。
- [x] 交接：core/README.md 和 Catalog API 合同说明实际路径/权限/缺口；定向回归与一个独立终验 PASS，保存 IMPLEMENTATION_NOTES / VALIDATION_REPORT，交由官方状态进入 AWAITING_USER；用户验收和 Git 交付未执行。
