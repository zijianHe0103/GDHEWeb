# TASK-027 建立本地 RFQ Intake Runtime Core 与隔离 Stub Sink 最小纵向切片
accepted_at: 2026-08-12T07:18:50Z
closed_at: 2026-08-12T07:26:44Z
recovery_recorded_at: 2026-08-12T07:14:24Z

task_id: TASK-027
legacy_closed_at_source: legacy_task_state
legacy_task_branch: codex/TASK-027-local-rfq-intake-stub-sink
legacy_delivery_commit: 8891df61759f377cc9e2f110ecb41aabb7cd15fb
delivery_profile: REMOTE_LEGACY
status: CLOSED
owner_lane: planner
assigned_lanes: [frontend]
review_lane: adversarial_reviewer
linked_issues: []
artifacts_dir: TASKS/ARTIFACTS/TASK-027
acceptance_state: ACCEPTED
git_status: MERGED
document_impact: RESOLVED
readme_impact: UPDATED
project_type: software

## 原始请求

> 创建TASK-027：建立本地 RFQ Intake Runtime Core 与隔离 Stub Sink 最小纵向切片

## 结构化理解

TASK-024 已冻结客户字段、安全、幂等、回执和失败语义；TASK-025 已交付 Quote Basket `3.0.0`、Article Number 与一次 `1..50` 混合行权威校验；TASK-026 已交付 RFQ Submission `2.0.0` 的五份闭合 Schema、映射和确定性向量。

本任务只把这些已交付合同连接成一个**本地、非生产、服务端运行时纵向切片**：Next.js 接收同源 RFQ 请求，执行闭合验证和一次 TASK-025 mixed-batch 权威校验，生成权威文档，并交给隔离 Stub Sink 返回受控回执。它不是客户可见表单、生产持久化或真实飞书交付。

## 目标

1. 在 `frontend/` 建立 RFQ Submission `2.0.0` 的前端本地快照、权威清单和离线校验器，运行时不得读取 `TASKS/**`。
2. 建立仅服务端可调用的 RFQ Intake Runtime Core：原始请求门、Schema/语义校验、RFC 8785 规范化、HMAC/比较 token、Basket snapshot token 和错误归一化。
3. 对完整 `1..50` 行请求只调用一次已交付 TASK-025 server-only mixed consumer，零逐行 `/resolve`、Product Configuration 或 RelatedProductCard 请求。
4. 仅从完全绑定的 mixed-batch 响应生成 `AuthoritativeRfqDocument 2.0.0`；浏览器 Article Number 继续视为公开但不可信。
5. 建立进程内、依赖注入的 Stub Idempotency Repository 与 Stub Sink，证明预留、重放、冲突、accepted、processing/indeterminate 和 pre-reservation rejection 语义。
6. 建立一个显式本地模式下才可用的同源 Next.js Route Handler；未启用模式和 production 构建必须 fail closed，并且不得调用 WordPress 或 Stub Sink。
7. 为后续生产持久化、客户表单和飞书连接保留清晰接口，但不在本任务中选择或实现这些外部设施。

## 关键边界

- Runtime 继续采用 Next.js-only，不引入 NestJS 或第二套后端服务。
- Stub Repository 和 Stub Sink 只用于本地验证，允许进程重启后丢失；它们不得被描述为生产持久幂等或真实交付。
- 本地 Stub 不把完整客户联系方式、Article Number 清单、幂等键、token、HMAC secret 或原始下游错误写入仓库、日志或可公开输出。
- 本任务不得连接飞书、发送邮件、写 WordPress、创建生产数据库、采购服务或部署。
- 不创建客户可见表单，也不改变 `/request-a-quote/` 当前 UI、Quote Basket 展示或清除行为。
- 不修改 TASK-024、TASK-025、TASK-026 的冻结合同、Schema、样本、向量或既有产品/CMS 行为；如发现真实冲突，停止并退回 Planner，不静默改写历史权威。
- 本任务没有 Visual QA 门；用户可通过受控本地 HTTP 示例和测试证据核查服务端结果，UI 在后续独立任务中处理。

## 交付物

1. `TASKS/ARTIFACTS/TASK-027/`：需求、设计、TDD seam、保护基线、执行、验证、差异和审查证据。
2. `frontend/src/lib/rfq-submission-contract/v2/`：独立闭合快照、manifest、确定性样本和离线 verifier。
3. `frontend/src/lib/rfq/server/**`：server-only Validator、canonicalizer、DTO/opaque wrapper、错误、intake orchestration、Stub Repository 与 Stub Sink。
4. 一个受本地模式门保护的 Next.js RFQ Route Handler；具体文件路径在 Planner A0 中冻结。
5. 直接单元测试、Route Handler HTTP 测试、server-only build negatives、生产 fail-closed smoke 和完整回归。
6. 更新根 `README.md` 的本地运行/验证说明，并同步架构契约中 TASK-027 的真实实现状态；不写未来能力已完成。

## 验收标准

1. TASK-026 五份 Schema、必要样本和向量以独立前端快照存在，清单、哈希、递归 `$ref` 闭合和权威绑定可离线验证；运行时代码不读取 `TASKS/**`。
2. 公共入口只接受固定 POST、可信同源 Origin、精确 JSON media type 和不超过 `262144` bytes 的原始正文；非法方法、来源、媒体类型、正文、Unicode、未知字段和超限请求在业务调用前稳定拒绝。
3. Basket 投影规范化后不超过 `163840` UTF-8 bytes，完整请求保留 `98304` bytes 信封预算；不接受文件、base64 或二进制附件。
4. 仅 `ready` 的 Quote Basket `3.0.0` 行可进入 intake；`requires_validation`、`requires_readd`、重复 entry/merge identity、无效数量或不完整联系信息整单拒绝。
5. 每次新的合法意图最多执行一次 TASK-025 mixed-batch 请求，保持输入顺序并绑定全部行；任何一行未知、失效、歧义或不匹配时整单失败，Stub Sink 调用为零。
6. 权威标准配置和目录配件的 Article Number、model、path 和完整配置只来自 mixed-batch 响应；custom 保持 `articleNumber:null / sales_follow_up`，不伪造稳定 Product UUID。
7. Runtime Core 复现 TASK-026 固定 RFC 8785、HMAC、comparison token、snapshot token 和 lone-surrogate fail-closed 向量；secret 只能通过服务端依赖注入，不进入源码、客户端 bundle、HTML/Flight、日志或错误。
8. 进程内 Stub Idempotency Repository 复现：同键同 digest 返回已存 `200/202/409` 且零下游；同键不同 digest 冲突；pre-reservation 失败零状态；首次 reservation 固定 30 天锚且重放不延长；expired indeterminate 不重发。
9. Stub Sink 只接收 Schema/语义有效的 `AuthoritativeRfqDocument 2.0.0`，可确定性模拟 accepted、processing/indeterminate 和 pre-delivery rejection；一次 reservation 最多一次 sink 调用。
10. 公开 receipt/error 严格符合 v2 合同，不包含 Article Number、客户联系方式、产品身份、secret、内部状态、原始异常或诊断；错误保持稳定、可序列化且不泄漏攻击者输入。
11. 本地启用模式可通过真实 HTTP 证明成功、重放、冲突和失败路径；未设置、显式 disabled、CMS/preview 非授权模式和 production 均最终 404 或等价 fail-closed，且 mixed consumer、repository 和 sink 调用均为零。
12. 公共/Client Component 导入 server-only 模块和深层路径均在真实 Next build 中失败；合法 Route Handler 服务器路径可构建。
13. TASK-024/025/026、WordPress/CMS、Quote Basket、ProductCard、Product Configuration、RelatedProductCard、依赖和受保护业务文件保持不变；没有飞书、邮件、生产数据库、外部写入或部署副作用。
14. 聚焦测试、完整资源安全测试清单、离线 verifiers、lint、typecheck、production build、生产 smoke、`git diff --check` 和 DPG project/registry/messages/strict-lane 门全部 PASS。
15. 文档影响为 `RESOLVED`，根 README 只记录真实本地运行方式、Stub 限制和生产未启用事实。

## 验证计划

- 严格 RED/GREEN：先证明缺少快照/verifier、Runtime Core、一次 mixed-batch orchestration、Stub Repository/Sink、Route Handler 和 production gate，再做最小实现。
- 快照验证：清单、哈希、递归引用、正负样本、向量、不可替换权威路径和 symlink/non-regular fail-closed。
- Runtime 单测：原始请求门、Schema/语义、规范化/HMAC/token、权威绑定、幂等状态机、错误归一化和调用计数。
- HTTP 集成：本地成功、同键重放、不同 digest 冲突、整单失败、Stub processing/indeterminate、生产/disabled 404。
- 安全验证：server-only 正负构建、客户端/HTML/Flight/日志泄漏扫描、secret/内部字段扫描。
- 回归：TASK-025 consumer、Quote Basket `3.0.0`、TASK-026 verifier、全量 frontend tests、lint、typecheck、build 和 production smokes。
- 治理验证：保护哈希、生成物/监听器清理、JSON/Markdown/link、`git diff --check`、project、registry、messages 和 strict lane audit。

## 文档影响

- `PENDING`：本任务将改变本地 RFQ Runtime 使用方式，完成前必须更新根 README 与架构契约真实状态。
- 不把 Stub Repository/Sink 写成生产持久化或飞书已接入。

## 分支和 Worktree

- 分支：`codex/TASK-027-local-rfq-intake-stub-sink`
- 基线：`main` / `origin/main` at `ae59adcbcc3d61996ec7727d0746026b04af9d61`
- Worktree：共享当前工作区；保留并排除用户自有配置、TASK-021～026 post-delivery closure edits 和历史 resume packets。

## 当前状态

`CLOSED / ACCEPTED / MERGED`。正式提交 `8891df61759f377cc9e2f110ecb41aabb7cd15fb` 已推送至任务分支并快进进入远端 `main`；本地任务分支、本地 `main`、远端任务分支和远端 `main` 四个引用一致。未执行部署或外部系统集成。

## 下一步

等待用户决定下一项任务；不自动开始客户表单、生产持久化、飞书接入或部署。

## Lane Plan

1. `planner`：A0 已 PASS；47/47 保护哈希、TASK-026 `94/94`、DPG/diff 均通过。
2. `frontend`：A1-A6 已 PASS（A3/A5 初次 FAIL 历史保留）；实现、文档与全量回归已收敛，不自行开始审核。
3. `planner`：A6 独立 checkpoint 与最终 current-byte validation 均已 PASS。
4. `adversarial_reviewer`：唯一完整审核 FAIL 历史保留；同 reviewer bounded closure 已 `PASS / P0=0 / P1=0 / P2=0`，未重复完整审核。
5. `planner`：用户正式验收、任务分支提交/推送、`main` 快进/推送与四引用核验均已完成。

## Execution Artifacts

- A0：`REQUIREMENTS.md`、`A0_DESIGN.md`、`TDD_SEAMS.md`、`IMPLEMENTATION_PLAN.md`、`A0_PROTECTED_BASELINE.md`、`A0_PROTECTED_CHECKSUMS.sha256`、`A0_VALIDATION_LOG.md`、`A0_CHECKPOINT.md`。
- A1：`FRONTEND_A1_EXECUTION_REPORT.md`、`FRONTEND_A1_TDD_RED_EVIDENCE.md`、`FRONTEND_A1_VALIDATION_LOG.md`、`FRONTEND_A1_DIFF_SUMMARY.md`、`A1_PLANNER_CHECKPOINT.md`。
- A2：`FRONTEND_A2_EXECUTION_REPORT.md`、`FRONTEND_A2_TDD_RED_EVIDENCE.md`、`FRONTEND_A2_VALIDATION_LOG.md`、`FRONTEND_A2_DIFF_SUMMARY.md`、`A2_PLANNER_CHECKPOINT.md`。
- A3：`FRONTEND_A3_EXECUTION_REPORT.md`、`FRONTEND_A3_TDD_RED_EVIDENCE.md`、`FRONTEND_A3_VALIDATION_LOG.md`、`FRONTEND_A3_DIFF_SUMMARY.md`、`A3_PLANNER_CHECKPOINT.md`（保留初次 FAIL，当前 PASS_AFTER_NARROW_REVISION）。
- A4：`FRONTEND_A4_EXECUTION_REPORT.md`、`FRONTEND_A4_TDD_RED_EVIDENCE.md`、`FRONTEND_A4_VALIDATION_LOG.md`、`FRONTEND_A4_DIFF_SUMMARY.md`、`A4_PLANNER_CHECKPOINT.md`。
- A5：`FRONTEND_A5_EXECUTION_REPORT.md`、`FRONTEND_A5_TDD_RED_EVIDENCE.md`、`FRONTEND_A5_VALIDATION_LOG.md`、`FRONTEND_A5_DIFF_SUMMARY.md`、`A5_PLANNER_CHECKPOINT.md`（保留初次 FAIL，当前 PASS_AFTER_NARROW_REVISION）。
- A6：`EXECUTION_REPORT.md`、`TEST_OR_VALIDATION_LOG.md`、`FRONTEND_A6_PLANNER_DOC_DELTAS.md`、`A6_PLANNER_CHECKPOINT.md`。

## Adversarial Review

- 唯一完整审核保持历史 `FAIL / P0=0 / P1=1 / P2=2`；同一 reviewer bounded closure 已 `PASS / P0=0 / P1=0 / P2=0`。该 closure 不是第二轮完整审核。

## Validation Evidence

- A0：TASK-026 `5 Schema / 63 refs / 94 checks`、20 JSON、47/47 protected、零产品/runtime diff、generated cleanup、Git diff 和 DPG gates PASS。
- A1：独立快照 `20/20` 字节、21-file inventory、focused `5/5`、离线 verifier `5 Schema / 63 refs / 94/94`、lint/typecheck、46/46 非文档 protected、generated cleanup、diff/messages PASS。没有 Runtime Validator、crypto 或 intake PASS 声明。
- A2：独立 focused `3 files / 18 tests`、A1 `5/5`、九个既有 verifier、lint/typecheck、server-only build negatives、精确 canonical/HMAC/comparison/snapshot vectors、保护哈希、generated cleanup、diff/DPG 全 PASS。没有 mixed orchestration、Repository/Sink、Route Handler 或外部副作用 PASS 声明。
- A3：初次 Planner probe 两项失败历史保留；当前 direct intake `6/6`、A1–A3 `49/49`、TASK-025/Quote Basket、verifier、lint/typecheck、protected/cleanup/diff/DPG 均 PASS。Date-range 在所有业务副作用前拒绝，未知 Proxy 零 trap/零诊断泄漏。
- A4：独立 direct `3/11`、A1–A4 `9/62`、TASK-025/Quote Basket v3 `15/35`、十个 verifier、lint/typecheck、protected/cleanup/diff/DPG 均 PASS；重放不延长 expiry、不重发，并发同键至多一次 mixed/Sink。
- A5 初次 checkpoint：linked response 已 ACK/done，独立 focused `11/68` PASS；但 removable Vite SSR 攻击得到 `returned=false / leaked=true / traps=1`，证明 hostile body-reader rejection 未归一化。当前证据与恢复入口见 `A5_PLANNER_CHECKPOINT.md`。
- A5 窄复验：direct Route `5/5`；同一 hostile attack 返回 authentic `400 invalid_request`、零 trap/零诊断；lane current-byte A1-A5 `11/70`、full `77/649`、十 verifier、lint/typecheck/build/extended HTTP smoke/protected/cleanup/DPG PASS。当前结果 `PASS_AFTER_NARROW_REVISION`。
- A6：Planner 独立复现 RFQ `11 files / 70 tests`、十 verifier、lint/typecheck/build、五个 production smoke、受保护 next-env、generated/listener cleanup、文档与 DPG/diff PASS；lane 资源安全完整清单 `77 files / 649 tests` PASS。文档影响 `RESOLVED`，README `UPDATED`。
- Final：当前字节 RFQ `11 files / 71 tests`、十 verifier、lint/typecheck/build、五个 production smoke、保护基线 `44 exact + 3 authorized docs + 0 blocking`、generated/listener cleanup、diff 和 DPG 全 PASS；证据见 `FINAL_VALIDATION.md`。

## User Acceptance

- `ACCEPTED` at `2026-08-12T07:18:50Z`；授权口令为 `确认 TASK-027 完成并提交到远端`。

## Recovery Entry 2026-08-12T07:14:24Z

- Reason: Synchronize post-prepare Board and current narration after the checked transition; no product or evidence change.
- Next step: Apply the narrow governance narration sync and immediately rerun checked prepare-awaiting-user.
