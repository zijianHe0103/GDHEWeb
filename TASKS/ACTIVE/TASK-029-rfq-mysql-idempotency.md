# TASK-029 建立基于独立 MySQL Schema 的 RFQ 持久幂等 Repository 与跨重启恢复最小纵向切片，继续使用隔离 Stub Sink
accepted_at: 2026-08-12T17:38:09Z

task_id: TASK-029
status: AWAITING_USER
owner_lane: planner
assigned_lanes: [frontend]
review_lane: adversarial_reviewer
linked_issues: []
artifacts_dir: TASKS/ARTIFACTS/TASK-029
acceptance_state: ACCEPTED
recovery_recorded_at: 2026-08-12T17:34:32Z
git_status: FORMAL_COMMIT_PENDING
document_impact: RESOLVED
readme_impact: UPDATED
project_type: software

## 原始请求

> 确定建立TASK-029：建立基于独立 MySQL Schema 的 RFQ 持久幂等 Repository 与跨重启恢复最小纵向切片，继续使用隔离 Stub Sink

用户确认使用当前 MySQL 服务，但必须建立独立于 WordPress `GDHE` 数据库的 RFQ Schema。用户同时确认：持久幂等只去除同一次提交意图的技术性重复；同一客户新增、删除或修改产品、数量、配置、包装或客户信息后重新提交，必须使用新的提交意图并允许形成新的 RFQ。恶意不断换新提交意图不由本任务的幂等 Repository 单独处理。

## 结构化理解

TASK-027 已建立 Next.js-only、本地非生产 RFQ Intake、进程内 `StubRfqRepository` 和隔离 `StubRfqSink`；TASK-028 已把客户可见表单、30 分钟 Intent、一次 Intake、公开回执和精确 Basket 清除接入该链路。当前 Repository 使用 Node.js 进程内 `Map`，Next.js 重启后状态丢失，无法证明跨进程、跨重启和数据库级并发时仍不会重复调用下游。

本任务只把 RFQ 的幂等、状态转换和客户安全公开结果持久保存到独立 MySQL Schema，并在继续使用隔离 Stub Sink 的情况下验证跨重启、跨 Repository 实例、并发和故障窗口恢复。它不接飞书、不实现完整反滥用安全门、不开放 production，也不改变客户页面的视觉设计。

## 已确认业务规则

1. 幂等身份绑定“一次提交意图”，不绑定客户永久身份、公司、联系方式或产品组合。
2. 同一 Idempotency Key 加同一规范化业务内容属于技术性重放：返回原公开状态，零重复 mixed-batch、零重复 Sink 调用，且不延长 30 天到期时间。
3. 同一 Idempotency Key 加不同规范化业务内容属于协议冲突：返回稳定 `409 idempotency_conflict`，不覆盖或新增记录，不调用 mixed-batch 或 Sink。
4. 客户修改产品、数量、配置、包装或客户信息后，旧 live attempt 必须失效；新提交取得新的 Intent/Idempotency Key，并允许产生新的 RFQ Reference。
5. 同一客户可以多次合法询价；新 Key 即使内容与旧询价完全相同，也不得被 Repository 自动合并、覆盖或拒绝。
6. 跨 Key 的疑似重复只能留给未来 CRM/业务员辅助判断，不属于本任务的自动去重规则。
7. 攻击者反复使用同一 Key 时由幂等保护下游；攻击者不断生成新 Key 时必须由后续来源限流、联系指纹和自适应 Challenge 安全门处理。

## 目标

1. 在当前 MySQL 8.4 服务上建立独立 `gdhe_rfq` Schema，不写入 WordPress `GDHE` 数据库、WordPress Core 表或内容表。
2. 冻结最小持久记录、合法状态转换、唯一约束、30 天保留锚、并发控制、迁移和精确清理规则。
3. 把 Intake Runtime 对具体 `StubRfqRepository` 类的依赖收敛为最小 server-only Repository 合同，同时保留现有 Stub 实现用于单元测试。
4. 建立 MySQL 持久 Repository，实现原子 `lookup`、`reserve` 和 compare-and-set `transition`，使不同 Node/Repository 实例共享同一幂等事实源。
5. 增加显式本地 `persistent_stub` 模式，把现有客户表单、Intent、Intake、一次 TASK-025 mixed-batch 与隔离 Stub Sink 接入持久 Repository。
6. 证明 Next.js 重启后，同一 Key/同一内容返回原公开结果、同一 Key/不同内容返回冲突，并且不重复调用 mixed-batch 或 Sink。
7. 证明并发相同请求只产生一条 reservation、一个 RFQ Reference 和至多一次 Sink delivery attempt。
8. 证明崩溃或结果不确定时持久保存 `processing/delivery_indeterminate`，重启后不伪造 accepted、不自动盲目重发，并保留未来受控对账入口。
9. 使用最小权限 MySQL 运行账号；凭据只通过服务端环境或本机 secret 方式注入，不进入 Git、浏览器、HTML/Flight、公开错误或普通日志。
10. 保持 production、未配置和禁用模式最终 404，继续使用隔离 Stub Sink，零真实飞书/CRM/邮件副作用。

## 非目标

- 不接入飞书、CRM、邮件、Webhook、队列或真实业务 Sink。
- 不进行真实飞书 Base/table/field 映射；该工作必须在后续独立只读任务中执行。
- 不实现完整来源限流、联系指纹阈值、Trusted Proxy、验证码、自适应 Challenge、WAF 或 CDN。
- 不自动跨 Key 判断、合并或删除同一客户的多次合法询价。
- 不自动重发 `delivery_pending`、`processing` 或 `delivery_indeterminate` 请求，不实现后台 Worker 或对账处理器。
- 不开放 production `/request-a-quote/`、`/api/rfq/intent/` 或 `/api/rfq/intake/`，不部署或公开发布。
- 不修改客户表单字段、Quote Basket UI、产品配置、Article Number 展示规则或页面视觉风格。
- 不修改 WordPress/CMS、SCF、产品主数据、WordPress `GDHE` 数据库或既有 GDHE REST 合同。
- 不修改 TASK-025、TASK-026、TASK-027、TASK-028 已冻结的历史 Schema、样本和固定向量；如发现真实冲突，停止并返回 Planner。
- 不把 RFQ Repository 描述为 CRM、报价单、订单、支付或客户主数据系统。

## 持久数据边界

Planner A0 必须先冻结实际表结构和字段白名单。最低需要支持：

- Idempotency Key 的不可逆 SHA-256 fingerprint，不保存原始 Key；
- versioned payload HMAC digest、comparison token 和 Basket snapshot token；
- 内部 RFQ UUID 与客户可见 Public Reference；
- `createdAt`、固定 `expiresAt`、`lastTransitionAt`；
- 合同允许的内部状态、delivery state、attempt count 和并发版本；
- 为跨重启重放所需的已验证 public receipt/error；
- 为 crash/reconciliation 边界所需且已经 RFQ `2.0.0` 验证的最小权威数据；不得把任意原始请求或未知 JSON 当作权威记录保存。

不得保存 HMAC secret、原始 Idempotency Key、Challenge token、数据库凭据或下游原始错误。普通日志不得记录完整联系方式、完整请求正文、Article Number 清单、原始 IP、幂等指纹/Key、token 或 SQL/连接诊断。

## 状态与故障语义

1. Pre-reservation 拒绝不创建持久业务记录。
2. 首次成功 reservation 固定 `createdAt`，`expiresAt = createdAt + 2592000000ms`；所有重放不延长到期时间。
3. 在任何下游 delivery 前，必须先原子持久化“attempt 已占用/待发送”事实；同一 reservation 的 delivery attempt 上限为 `1`。
4. 合法终态和中间态至少覆盖既有 RFQ `2.0.0` 的 reserved/resolving/delivery-pending/accepted/delivery-indeterminate/rejected-before-delivery 语义；A0 必须冻结精确状态名和转换表。
5. Crash 发生在 reservation 后、mixed-batch 或 Sink 前时，重启不得将该记录当成新请求，也不得自动盲目调用 Sink。
6. Sink 调用已经开始但结果未知时，记录必须进入或恢复为 `delivery_indeterminate/processing`，等待未来受控对账。
7. Accepted 已持久保存但 HTTP 响应丢失时，重启重放必须返回原 Accepted Receipt 和原 Public Reference，零重复下游调用。
8. MySQL 查询、reservation 或 transition 无法确定成功与否时，公开端只返回闭合的 temporary-unavailable/processing 语义，不泄漏数据库诊断，不伪造成功。

## 交付物

1. `TASKS/ARTIFACTS/TASK-029/`：需求、A0 设计、TDD seam、迁移/回滚计划、保护基线、执行、验证、差异和审查证据。
2. 独立 `gdhe_rfq` Schema 的版本化、幂等 MySQL migration 与受控验证/清理脚本；不在应用启动时隐式创建或改表。
3. 最小 server-only RFQ Repository 合同、保留的 Stub 实现和 MySQL 持久实现。
4. 本地 `persistent_stub` 配置和 Route/Runtime 接线；production/unset/disabled 边界保持关闭。
5. Repository 单元测试、真实 MySQL 集成测试、双实例/并发测试、真实 Next.js 跨重启 HTTP smoke 和故障窗口测试。
6. MySQL 最小权限证明、客户端泄漏/日志泄漏扫描、迁移幂等和数据库零残留或受控保留证明。
7. 根 README、frontend README 和架构契约的真实使用说明；不得声称飞书、完整安全门、部署或 production 已完成。

## 验收标准

1. `gdhe_rfq` 与 WordPress `GDHE` 数据库逻辑隔离；迁移和测试不创建、修改或删除任何 WordPress Core、SCF、GDHE 内容或产品数据。
2. Runtime 使用的 MySQL 账号只有运行所需的最小权限，不具备运行时 `CREATE/DROP/ALTER/GRANT` 权限；迁移权限与运行权限分离，任何凭据均不入库。
3. Migration 从空 Schema 可重复建立目标版本；重复执行不破坏数据；失败可确定性回滚或恢复；测试清理只作用于精确测试记录/Schema。
4. 持久记录字段、类型、索引、唯一约束、字符集/时区、JSON 边界和合法状态转换由机器测试约束；非法、未知、损坏或跨版本记录 fail closed。
5. 同一 Key/同一规范化内容首次提交返回既有合同规定的 `201/202/409`，重启后重放返回同一 Public Reference 和原 `200/202/409` 状态，mixed-batch 与 Sink 计数不增加。
6. 同一 Key/不同规范化内容稳定返回 `409 idempotency_conflict`；旧记录、到期锚和公开结果不变，mixed-batch/Sink 调用为零。
7. 新 Key 始终代表新的合法业务意图：同一客户、同一联系方式或完全相同 Basket 可以产生新的 RFQ；Repository 不做跨 Key 自动合并、覆盖或拒绝。
8. 客户修改 Basket、产品、数量、配置、包装或客户字段后，旧 live attempt 失效，新提交使用新 Key；旧 accepted 回执不得清除后来变化的 Basket。
9. 至少 20 个并发同 Key/同内容请求、两个独立 Repository 实例以及受控双 Next 进程场景都只能产生一条 reservation、一个 RFQ Reference、一次 mixed-batch 和至多一次 Stub Sink attempt。
10. Reservation 创建、mixed-batch 前后、delivery-pending 前后、Sink 返回前后和 accepted 持久化后等故障点均有可重复注入测试；任何重启都不得形成第二次 Sink attempt。
11. `delivery_indeterminate/processing` 在重启和到期后保持受控恢复语义，不自动删除、不伪造成功、不盲目重发；未来 connector/对账由独立任务实现。
12. `createdAt` 与固定 30 天 `expiresAt` 精确保存；重放、查询、进程重启和状态转换均不延长到期时间；pre-reservation 失败零持久状态。
13. MySQL 不可用、超时、连接中断、事务冲突、非法返回或 transition 失败时，客户只收到闭合安全错误或 processing；Basket 保留，错误不含 SQL、表名、连接串、凭据、客户数据或内部诊断。
14. 持久库、日志、HTML/Flight、Client bundle 和公开 receipt/error 不包含原始 Idempotency Key、secret、Challenge token、数据库凭据或下游原始错误；Article Number 仍不主动显示给客户。
15. 本地 `persistent_stub` 模式可以完成真实提交、重启、重放、冲突、并发和 indeterminate 测试；原 `stub` 单元测试路径可保留。production/unset/disabled 始终 final 404 且数据库、mixed-batch、Sink 调用为零。
16. TASK-025 一次 `1..50` mixed-batch、TASK-026 RFQ Submission `2.0.0`、TASK-027 Intake、TASK-028 表单/公开结果/精确 Basket 清除全部保持回归通过。
17. 聚焦测试、真实 MySQL 集成、完整资源安全测试清单、十个既有 verifier、lint、typecheck、production build、production smoke、server-only、保护哈希、generated/listener/database residue、`git diff --check` 和 DPG 门全部 PASS。
18. 实施收敛后只做一次完整独立审核；如存在 finding，只由同一 reviewer 对原 finding 做 bounded closure，不进行第二次完整审核。

## 允许修改范围

- `frontend/src/lib/rfq/server/**`
- `frontend/src/app/api/rfq/**` 中完成 `persistent_stub` 所必需的最小接线
- `frontend/tests/**` 中 TASK-029 聚焦、集成、重启和回归测试
- `frontend/scripts/**` 或明确的 `frontend/` 数据库 migration/verification 目录
- 必要且经确认的最小数据库驱动依赖及 lockfile
- `docs/frontend/**`、根 `README.md`、`frontend/README.md`、架构契约
- `TASKS/ARTIFACTS/TASK-029/**` 与 Planner-owned 治理文件
- 经需求确认后，本地 MySQL `gdhe_rfq` Schema、专用测试数据和最小权限本地账号

## 禁止修改范围

- WordPress `GDHE` 数据库、`cms/**`、WordPress Core、SCF Core、GDHE 产品内容与既有 REST/API Schema
- TASK-024～028 冻结合同/样本/向量的历史字节，除非任务明确授权的 additive consumer 接线和文档事实同步
- 飞书/CRM、邮件、真实外部 Sink、生产数据库、生产域名、部署平台、CDN/WAF 或第三方 Challenge 服务
- 客户页面视觉、产品配置、Quote Basket 展示和非 RFQ 业务模块
- `.env*`、真实 secret、数据库密码、SQL 数据备份、上传文件和运行时产物
- 用户现有 `.codex/config.toml`、pre-existing `frontend/tsconfig.json`、旧任务 post-delivery closure edits 和历史 resume packets

## 约束

- 继续采用 Next.js-only，不引入 NestJS 或第二套常驻后端服务。
- 继续严格 TDD；每个状态/迁移/故障 seam 先记录真实 RED，再做最小 GREEN。
- 使用 `apply_patch` 修改受管文件；不覆盖或清理无关 dirty 状态。
- MySQL DDL/DML 必须通过显式、可审计脚本执行；不得把数据库初始化隐藏在 Next.js import 或请求处理路径。
- 数据库删除/清理只能针对验证过的 `gdhe_rfq` 测试对象，执行前必须只读确认精确目标；不得使用宽泛递归或未解析变量。
- 不把本任务 PASS 描述为 production、飞书或完整安全防护已经完成。

## 假设和待确认事项

- 已确认使用当前 MySQL 8.4 服务，并建立独立 `gdhe_rfq` Schema；当前本地 GDHE MySQL 实例位于 `127.0.0.1:3307`，实施前必须重新只读核验。
- A0 冻结运行账号名、迁移账号边界、测试隔离方式、表名、字段白名单、状态转换表和故障注入 seam；密码和 secret 只通过本机安全方式设置，不写入任务卡或 Git。
- 生产部署平台、托管 MySQL 供应商、TLS/备份/高可用方案仍未选择；本任务只能证明真实 MySQL 语义和本地跨重启恢复，不能宣称生产基础设施已落地。
- 完整来源限流、联系指纹与 Challenge 是 TASK-029 后的独立安全任务，不在本任务中顺带实现。

## 验证计划

- A0：只读核验 MySQL/Core/SCF/DB、冻结持久记录、状态转换、权限、migration/rollback、故障窗口、保护基线和逐步 TDD 计划；A0 PASS 前不写产品代码或数据库。
- A1：严格 RED/GREEN 建立 Repository 接口、MySQL migration、最小权限验证和保留的 Stub 回归；完成独立 Planner checkpoint。
- A2：严格 RED/GREEN 建立 MySQL Repository 的 lookup/reserve/CAS transition、30 天锚、非法记录和事务/连接错误边界；完成真实 MySQL 集成 checkpoint。
- A3：严格 RED/GREEN 建立 `persistent_stub` 本地接线、一次 mixed-batch/一次 Sink、同键重放/冲突与公开错误；production 继续 404。
- A4：严格 RED/GREEN 完成两个 Repository/两个受控 Next 进程、20 并发请求、Next 重启、六类故障窗口和 indeterminate 不重发验证。
- A5：完成安全/泄漏/权限/迁移/清理、TASK-025～028 与完整 frontend 回归、README/架构文档和 consolidated evidence。
- 实施全部收敛后，只派发一次完整 `adversarial_reviewer` 审核；若 FAIL，只修原 finding 并请求同一 reviewer bounded closure。

## 文档影响

`RESOLVED`：根 README、frontend README 与架构契约已记录本地 `persistent_stub`、独立 MySQL Repository、进程内 Stub Sink 及未实现的生产、飞书和完整安全门。

## README 影响

`UPDATED`：根 README 与 frontend README 已记录 `persistent_stub` 的真实本地配置、迁移、启动、重启验证、清理和限制。

## 分支和 Worktree

- 计划分支：`codex/TASK-029-rfq-mysql-idempotency`
- 基线：`main` / `origin/main` at `fc2a5395da10520683133bfd947085a6dbc75486`
- 当前分支：`codex/TASK-029-rfq-mysql-idempotency`，从 `main` / `origin/main` 的 `fc2a5395da10520683133bfd947085a6dbc75486` 创建；共享 dirty 内容原样保留。
- Worktree：共享当前工作区；保留并排除 `.codex/config.toml`、pre-existing `frontend/tsconfig.json`、TASK-021～028 post-delivery closure edits 和历史 resume packets。

## 当前状态

`ACCEPTED / ACCEPTED / FORMAL_COMMIT_PENDING`。用户已使用精确口令正式验收；唯一完整审核历史 `FAIL / P0=0 / P1=2 / P2=2` 与同 reviewer bounded closure `PASS / P0=0 / P1=0 / P2=0` 均保留。Fresh Planner final validation 与 checked acceptance preparation 已 PASS；只允许正式提交、任务分支推送、`main` 合并和推送，部署及外部系统仍未开始。

## 恢复入口

先读 `AGENTS.md`、`PROJECT/COORDINATION.md`、`PROJECT/AGENT_LANES.md`、`LANES/registry/lanes.json`、本任务文件，再读 `PROJECT/STATE.md`、`TASKS/BOARD.md`、TASK-026～028 合同/实现和 ADR-006 第 41、44～50 项。

## 下一步

只暂存 TASK-029 授权范围，生成中文正式提交，立即推送任务分支，合并到 `main` 并推送 `main`；不部署。

## Lane Plan

| lane | responsibility | write_scope | expected_artifacts | status |
|---|---|---|---|---|
| planner | A0、需求/状态、MySQL 目标与保护基线、逐阶段 checkpoint、最终汇报 | `PROJECT/**`, `TASKS/**`, `MEMORY/**`, `LANES/**`, assigned docs | A0 design/checkpoints/final validation | formal_delivery |
| frontend | Repository 合同、migration、MySQL Adapter、persistent_stub 接线、测试和 frontend docs | `frontend/**`, `docs/frontend/**`, assigned TASK-029 artifacts | RED/GREEN reports, code, migrations, tests, validation | complete_waiting_user |
| adversarial_reviewer | 收敛后唯一完整只读审核；FAIL 后只做同 reviewer bounded finding closure | canonical review report and reviewer lane records only | one complete review, optional bounded closure | closure_complete |

## Messages

- `MSG-TASK-029-FRONTEND-REPOSITORY-MIGRATION-A1`：ACK/done；A1 execution response 已关联回传。
- `MSG-TASK-029-FRONTEND-REPOSITORY-MIGRATION-A1-RESPONSE`：ACK/done；Planner checkpoint PASS。
- `MSG-TASK-029-FRONTEND-MYSQL-REPOSITORY-A2`：ACK/done；A2 execution response 已关联回传。
- `MSG-TASK-029-FRONTEND-MYSQL-REPOSITORY-A2-RESPONSE`：ACK/done；Planner checkpoint PASS。
- `MSG-TASK-029-FRONTEND-PERSISTENT-STUB-A3`：ACK/done；A3 execution response 已关联回传。
- `MSG-TASK-029-FRONTEND-PERSISTENT-STUB-A3-RESPONSE`：ACK/done；Planner checkpoint PASS。
- `MSG-TASK-029-FRONTEND-RESTART-CONCURRENCY-CRASH-A4`：ACK/done；A4 execution response 已关联回传。
- `MSG-TASK-029-FRONTEND-RESTART-CONCURRENCY-CRASH-A4-RESPONSE`：ACK/done；Planner checkpoint PASS。
- `MSG-TASK-029-FRONTEND-CONSOLIDATION-A5`：ACK/done；frontend A5 已完成。
- `MSG-TASK-029-FRONTEND-CONSOLIDATION-A5-RESPONSE`：ACK/done；Planner checkpoint PASS。
- `MSG-TASK-029-ADVERSARIAL-REVIEW-R1`：ACK/done；唯一完整审核已完成。
- `MSG-TASK-029-ADVERSARIAL-REVIEW-R1-RESPONSE`：ACK/done；`FAIL / P0=0 / P1=2 / P2=2`，只允许最小修订与同 reviewer bounded closure。
- `MSG-TASK-029-FRONTEND-ADVERSARIAL-FINDINGS-R1`：ACK/done；四项 bounded correction 已完成。
- `MSG-TASK-029-FRONTEND-ADVERSARIAL-FINDINGS-R1-RESPONSE`：ACK/done；四项 bounded correction `PASS_FOR_PLANNER_RECHECK`，Planner fresh recheck PASS。
- `MSG-TASK-029-ADVERSARIAL-FINDING-CLOSURE`：ACK/done；同一 reviewer bounded closure 已完成。
- `MSG-TASK-029-ADVERSARIAL-FINDING-CLOSURE-RESPONSE`：ACK/done；bounded closure `PASS / P0=0 / P1=0 / P2=0`。

## 执行记录

- `2026-08-12T13:53:55Z`：用户确认建立 TASK-029，并接受当前 MySQL 服务上的独立 `gdhe_rfq` Schema。Planner 创建任务卡；未开始实施。
- `2026-08-12T13:59:00Z`：用户精确输入 `确认 TASK-029 需求并开始执行`。任务从 `AWAITING_REQUIREMENT_CONFIRMATION` 推进到 `READY`，仅释放 Planner A0；产品代码、数据库写入、依赖安装和 frontend dispatch 继续受 A0 门禁阻塞。
- `2026-08-12T14:01:32Z`：Planner A0 PASS。只读核验 MySQL 8.4.10/3307、独立目标不存在、WordPress 12 表/Core/SCF/DB、权限隔离、Node 24、十个 verifier、19/19 保护哈希和 DPG/diff 均通过；冻结两表/六态/权限/migration/故障计划，任务进入 `IN_PROGRESS`，仅释放 frontend A1。
- `2026-08-12T14:44:41Z`：frontend A1 与 Planner 独立 checkpoint PASS。通用 Repository/真实 Stub seam、精确 `mysql2@3.23.3`、版本化 migration/verifier、两表 `gdhe_rfq` 与运行账号最小权限已落地。Planner 复现受影响 `4 files / 16 tests`、migration `2/2`、十 verifier、lint/typecheck、WordPress Core/SCF/12 表、数据库现场和 DPG/diff；A0 基线为 `15 exact + 4 A1-authorized`。只释放 frontend A2。
- `2026-08-12T15:28:42Z`：frontend A2 与 Planner 独立 checkpoint PASS。MySQL lookup/原子 reserve/duplicate re-read/六态 CAS/RFQ 2.0 authority binding 与安全错误边界已落地；Planner 复现 focused `4 files / 20 tests`、完整串行 `90 files / 719 tests`、十 verifier、lint/typecheck/build、MySQL/WordPress/protected/diff/DPG。数据库最终零业务行，账户仍为三项 DML 最小权限且无可用凭据保留。只释放 frontend A3。
- `2026-08-12T15:30:41Z`：受控派发 frontend A3，只允许本地 `persistent_stub` Intake 接线及同进程重放/冲突/新 Key/production 关闭证明；A4 与后续保持阻塞。
- `2026-08-12T15:56:52Z`：frontend A3 与 Planner checkpoint PASS。Planner 复现 focused `5 files / 29 tests`、十 verifier、lint/typecheck/build、migration/MySQL/DPG；数据库为两表/零行且运行账号仍为三项 DML 最小权限。只释放 frontend A4。
- `2026-08-12T16:21:05Z`：frontend A4 与 Planner checkpoint PASS。Planner 独立复现 A4 `13/13` 和双 Next/20 并发/重启 HTTP proof；十 verifier、lint/typecheck、migration、MySQL/WordPress/protected/diff/DPG 全部通过，数据库仍为两表/零行。只释放 frontend A5。
- `2026-08-12T16:22:55Z`：受控派发 frontend A5，只允许完整回归、安全/泄漏/权限/残留、frontend README、consolidated evidence 和 Planner-owned 文档精确 delta；完整审核及后续继续阻塞。
- `2026-08-12T16:40:43Z`：frontend A5 与 Planner 最终实施 checkpoint PASS。Root/frontend README 与架构契约已同步；focused `5/29`、lane full `92/738`、合同/typecheck、MySQL/WordPress/protected/cleanup/diff/DPG 通过。任务进入 `UNDER_REVIEW`，只释放唯一完整审核。
- `2026-08-12T16:43:52Z`：唯一完整 `adversarial_reviewer` 请求已 validate、真实线程投递并由 `dispatch-once` 记录；不得重复完整审核。
- `2026-08-12T16:58:06Z`：唯一完整审核响应已 ACK/done，结论 `FAIL / P0=0 / P1=2 / P2=2`。按 developer gate 运行 checked `task_transition.py reopen`，helper 因只接受 `AWAITING_USER` 而对真实 `UNDER_REVIEW` 安全拒绝且零 mutation；Planner 记录等价受控 `NEEDS_REVISION` 恢复。只允许修复状态/版本绑定、非事务 DDL 半状态恢复及两项过期叙述，随后 fresh validation 与同 reviewer bounded closure。
- `2026-08-12T16:59:34Z`：四项原 finding 的 bounded frontend 修订已 validate、真实线程投递并由 `dispatch-once` 记录；不得扩展范围或重复完整审核。
- `2026-08-12T17:19:20Z`：bounded revision Planner fresh recheck PASS。独立复现 Repository `9/9`、migration/recovery `3/3`、migration verify、lint/typecheck、MySQL 两表/零行/三项 DML、WordPress Core/SCF/12 表、生成物/哈希/diff/DPG；任务回到 `UNDER_REVIEW`，只释放同 reviewer bounded closure。
- `2026-08-12T17:21:42Z`：同 reviewer bounded finding closure 已 validate、真实线程投递并由 `dispatch-once` 记录；这不是第二次完整审核。
- `2026-08-12T17:30:25Z`：bounded closure 响应 ACK/done；fresh Planner final validation PASS。完整审核 FAIL 与 bounded closure PASS 历史均保留，当前只允许 checked acceptance preparation。
- `2026-08-12T17:33:26Z`：为治理解析器补充 plain `verdict: PASS` / `status: PASS` 兼容字段后，registry/messages/strict lane/diff 与首次 checked `prepare-awaiting-user` PASS；机器状态进入 `AWAITING_USER`。
- `2026-08-12T17:34:32Z`：AWAITING_USER Hook 阻止同步旧 Board/当前叙述；checked `reopen` 只为治理视图同步暂时进入 `NEEDS_REVISION`，未重开实现、测试或审核。唯一下一步是同步后重新 checked prepare。
- `2026-08-12T17:35:28Z`：治理视图同步完成，重新 checked `prepare-awaiting-user` PASS；任务最终回到 `AWAITING_USER`，只等待用户精确正式交付口令。
- `2026-08-12T17:38:09Z`：用户精确输入正式交付口令；checked task acceptance PASS，任务进入 `ACCEPTED / FORMAL_COMMIT_PENDING`。只允许创建正式提交、推送任务分支、合并并推送 `main`。

## Execution Artifacts

- `TASKS/ARTIFACTS/TASK-029/REQUIREMENTS.md`
- `TASKS/ARTIFACTS/TASK-029/A0_DESIGN.md`
- `TASKS/ARTIFACTS/TASK-029/STATE_MACHINE.md`
- `TASKS/ARTIFACTS/TASK-029/MYSQL_MIGRATION_AND_ROLLBACK_PLAN.md`
- `TASKS/ARTIFACTS/TASK-029/TDD_SEAMS.md`
- `TASKS/ARTIFACTS/TASK-029/IMPLEMENTATION_PLAN.md`
- `TASKS/ARTIFACTS/TASK-029/A0_PROTECTED_BASELINE.sha256`
- `TASKS/ARTIFACTS/TASK-029/A0_VALIDATION_LOG.md`
- `TASKS/ARTIFACTS/TASK-029/A0_CHECKPOINT.md`
- `TASKS/ARTIFACTS/TASK-029/FRONTEND_A1_TDD_RED_EVIDENCE.md`
- `TASKS/ARTIFACTS/TASK-029/FRONTEND_A1_EXECUTION_REPORT.md`
- `TASKS/ARTIFACTS/TASK-029/FRONTEND_A1_VALIDATION_LOG.md`
- `TASKS/ARTIFACTS/TASK-029/FRONTEND_A1_DIFF_SUMMARY.md`
- `TASKS/ARTIFACTS/TASK-029/A1_PLANNER_CHECKPOINT.md`
- `TASKS/ARTIFACTS/TASK-029/FRONTEND_A2_DISPATCH.md`
- `TASKS/ARTIFACTS/TASK-029/FRONTEND_A2_TDD_RED_EVIDENCE.md`
- `TASKS/ARTIFACTS/TASK-029/FRONTEND_A2_EXECUTION_REPORT.md`
- `TASKS/ARTIFACTS/TASK-029/FRONTEND_A2_VALIDATION_LOG.md`
- `TASKS/ARTIFACTS/TASK-029/FRONTEND_A2_DIFF_SUMMARY.md`
- `TASKS/ARTIFACTS/TASK-029/A2_PLANNER_CHECKPOINT.md`
- `TASKS/ARTIFACTS/TASK-029/FRONTEND_A3_DISPATCH.md`
- `TASKS/ARTIFACTS/TASK-029/FRONTEND_A3_TDD_RED_EVIDENCE.md`
- `TASKS/ARTIFACTS/TASK-029/FRONTEND_A3_EXECUTION_REPORT.md`
- `TASKS/ARTIFACTS/TASK-029/FRONTEND_A3_VALIDATION_LOG.md`
- `TASKS/ARTIFACTS/TASK-029/FRONTEND_A3_DIFF_SUMMARY.md`
- `TASKS/ARTIFACTS/TASK-029/A3_PLANNER_CHECKPOINT.md`
- `TASKS/ARTIFACTS/TASK-029/FRONTEND_A4_DISPATCH.md`
- `TASKS/ARTIFACTS/TASK-029/FRONTEND_A4_TDD_RED_EVIDENCE.md`
- `TASKS/ARTIFACTS/TASK-029/FRONTEND_A4_EXECUTION_REPORT.md`
- `TASKS/ARTIFACTS/TASK-029/FRONTEND_A4_VALIDATION_LOG.md`
- `TASKS/ARTIFACTS/TASK-029/FRONTEND_A4_DIFF_SUMMARY.md`
- `TASKS/ARTIFACTS/TASK-029/A4_PLANNER_CHECKPOINT.md`
- `TASKS/ARTIFACTS/TASK-029/FRONTEND_A5_DISPATCH.md`
- `TASKS/ARTIFACTS/TASK-029/FRONTEND_A5_EXECUTION_REPORT.md`
- `TASKS/ARTIFACTS/TASK-029/FRONTEND_A5_VALIDATION_LOG.md`
- `TASKS/ARTIFACTS/TASK-029/FRONTEND_A5_DIFF_SUMMARY.md`
- `TASKS/ARTIFACTS/TASK-029/FRONTEND_A5_PLANNER_DOC_DELTAS.md`
- `TASKS/ARTIFACTS/TASK-029/EXECUTION_REPORT.md`
- `TASKS/ARTIFACTS/TASK-029/TEST_OR_VALIDATION_LOG.md`
- `TASKS/ARTIFACTS/TASK-029/DIFF_OR_OUTPUT_SUMMARY.md`
- `TASKS/ARTIFACTS/TASK-029/A5_PLANNER_CHECKPOINT.md`
- `TASKS/ARTIFACTS/TASK-029/ADVERSARIAL_REVIEW_DISPATCH.md`

## Adversarial Review

- 唯一完整审核已完成：`FAIL / P0=0 / P1=2 / P2=2`。P1 为不可能的 state/`row_version` 配对仍可被当成真实重放，以及 rollback/初始化清理在运行账号已删而 Schema 仍在时没有受支持恢复路径；P2 为 consolidated 当前证据仍称 Planner 文档 delta 未应用，以及本节旧称审核未开始。完整 FAIL 历史必须保留，后续只允许同一 reviewer 对这四项原 finding 做 bounded closure。
- Owner-lane bounded correction 与 Planner fresh recheck 已 PASS；当前未获得 review closure，仍只允许同 reviewer bounded closure。
- 同一 reviewer bounded closure 已 `PASS / P0=0 / P1=0 / P2=0`；未进行第二次完整审核，审核门已满足。

## Validation Evidence

- A0 `PASS`：MySQL `8.4.10` / `3307`、InnoDB 事务能力、`gdhe_rfq` 不存在、WordPress `GDHE` 12 表、Core/SCF/DB、Node 24.18.0/npm 11.16.0、十个既有 verifier、19/19 保护哈希、DPG project/messages/strict lane 和 diff 全部通过。
- A0 仅证明环境与设计可行；没有数据库对象、账号、依赖、Repository 或 `persistent_stub` 运行时 PASS 声明。
- A1 `PASS_FOR_PLANNER_CHECKPOINT`：独立复现 Repository/Stub/migration focused `4 files / 16 tests`、migration `2/2`、十 verifier、lint/typecheck、WordPress Core/SCF/DB；数据库现场为 `gdhe_rfq` 两表/零业务行、运行账号三项 DML 权限、migration checksum 与 SQL 一致。A1 不包含 MySQL Repository 实现或 runtime 接线。
- A2 `PASS_FOR_PLANNER_CHECKPOINT`：独立复现当前 focused `4 files / 20 tests`、完整串行 `90 files / 719 tests`、十 verifier、lint/typecheck/build、migration/MySQL/WordPress/protected/diff/DPG；两实例真相、atomic reserve、六态 CAS、30 天锚、冲突/过期与异常边界通过，最终零业务行。A2 不包含 `persistent_stub` Route/runtime 或跨重启矩阵。
- A3 `PASS_FOR_PLANNER_CHECKPOINT`：Planner 独立复现 focused `5 files / 29 tests`、十 verifier、lint/typecheck/build、migration/MySQL/diff/DPG；`persistent_stub` 的同进程首次/重放/冲突/新 Key、indeterminate/rejected 重放和 production 关闭通过，最终两表/零业务行。A3 不包含双进程、进程重启、20 并发或崩溃窗口证明。
- A4 `PASS_FOR_PLANNER_CHECKPOINT`：Planner 独立复现 real-MySQL `13/13` 与双 Next/20 并发/双进程重放/停止重启 HTTP proof；全部冻结崩溃窗口、pending/indeterminate 零自动重发、accepted 原回执重放、十 verifier、lint/typecheck、migration/MySQL/WordPress/protected/diff/DPG 通过，最终两表/零业务行。A4 不包含 A5 文档收口或完整独立审核。
- A5 `PASS_FOR_PLANNER_CHECKPOINT`：Frontend current-byte focused `47/245`、full `92/738`、十 verifier、lint/typecheck/build、五 production smoke、A3/A4 HTTP、MySQL/WordPress/泄漏/残留通过；Planner 独立复现 `5/29`、关键合同/typecheck、MySQL 两表/零行/三项 DML、文档/diff/DPG。Root/frontend README 与架构契约已同步，未开始审核或 Git。
- 唯一完整审核历史 `FAIL / P0=0 / P1=2 / P2=2` 已由同 reviewer bounded closure `PASS / P0=0 / P1=0 / P2=0` 收口；fresh Planner final validation 与首次 checked acceptance preparation 均 PASS。

## Planner Final Summary

- 已完成：独立 `gdhe_rfq`、最小权限 MySQL Repository、本地 `persistent_stub`、跨实例/并发/重启/故障恢复、显式 migration/rollback、安全边界和文档均已落地。
- 验证：完整串行 `92 files / 740 tests`、十 verifier、lint/typecheck/build、七 smoke、MySQL/WordPress/protected/cleanup/DPG PASS。
- 审核：唯一完整审核历史 `FAIL / P0=0 / P1=2 / P2=2`；同 reviewer bounded closure `PASS / P0=0 / P1=0 / P2=0`。
- 边界：仍是本地隔离 Stub Sink；未完成生产数据库、真实 Sink、飞书/CRM/email、完整反滥用、部署或公开发布。

## User Acceptance

- `ACCEPTED` at `2026-08-12T17:38:09Z`。用户精确口令已授权 Git 正式交付；仍不授权部署、生产开放或外部系统接入。

## Recovery Entry 2026-08-12T17:34:32Z

- Reason: Checked acceptance preparation succeeded, but the AWAITING_USER write guard blocked synchronization of stale human-readable Board and current-state narration.
- Next step: Synchronize only the human-readable governance views, rerun validation, then run checked prepare-awaiting-user again; do not reopen implementation or review.
