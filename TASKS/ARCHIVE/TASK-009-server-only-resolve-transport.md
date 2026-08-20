# TASK-009 Next.js server-only `/resolve` Transport 与错误语义基础
accepted_at: 2026-07-25T17:16:01Z

task_id: TASK-009
status: CLOSED
owner_lane: planner
assigned_lanes: [frontend]
review_lane: adversarial_reviewer
linked_issues: []
artifacts_dir: TASKS/ARTIFACTS/TASK-009
acceptance_state: ACCEPTED
recovery_recorded_at: 2026-07-25T16:47:35Z
resumed_at: 2026-07-25T15:48:23Z
git_status: MERGED
document_impact: RESOLVED
readme_impact: UPDATED
project_type: software

## 原始请求

> 创建 TASK-009：Next.js server-only /resolve Transport 与错误语义基础

## 结构化理解

- TASK-008 已冻结前端拥有的 `/resolve` 成功/错误 Schema 传递闭包、样例、manifest 和 checksum parity，并已正式提交、推送任务分支、快进合并和推送远端 `main`。
- 本任务只实现 Next.js 服务端到 WordPress 公开 `/gdhe/v1/resolve` 的最小只读 HTTP Transport，以及在运行时 Schema 校验之前可稳定区分的配置、网络、协议和 HTTP 状态错误。
- Transport 返回的 JSON 仍是 `unknown`；本任务不得把 TypeScript 断言当成运行时验证，也不得把原始数据传给 React 页面或组件。
- 用户要求的显式开启、本地可见技术页面仍是后续目标，但不与 Transport 混在同一任务中，以保持回退成本和故障定位边界足够小。

## 目标

- 在 `frontend/src/lib/cms/` 建立明确的 server-only 边界，浏览器或 Client Component 不得导入 CMS Transport。
- 读取并 fail closed 校验 `WORDPRESS_API_URL`，不暴露 CMS origin、凭据或内部错误细节。
- 确定性构造英语 `/wp-json/gdhe/v1/resolve?locale=en&path=...&schema=3.0.0` URL；调用者不能注入任意 endpoint、origin 或查询参数。
- 使用匿名 `GET`、`Accept: application/json` 和有界超时发起一次请求，不实现隐式重试。
- 响应正文只解析一次并保持为 `unknown`；成功响应携带受控元数据供后续 Validator 使用。
- 建立稳定、可判别的配置错误、网络/超时错误、协议/解析错误和 HTTP 状态错误；权威 404 必须与非 404 上游故障区分，但本任务不调用 Next.js `notFound()`。
- 用隔离的本地 HTTP 测试服务覆盖正负矩阵，并证明测试不依赖真实 WordPress、外部网络或浏览器环境。

## 非目标

- 不安装 Ajv、Zod 或其他运行时 Schema 库，不实现 TASK-008 Schema 的运行时 Validator。
- 不建立 Product、Page 或模块 DTO，不实现 Adapter、判别联合、组件 props 或内容归一化。
- 不修改 `frontend/src/app/**`，不创建 `/integration/cms`、catch-all route、页面、loading、error boundary 或 `notFound()` 路由行为。
- 不执行真实 WordPress live E2E，不创建或修改 Fixture、文章、产品、用户、数据库、插件或 REST 合同。
- 不实现请求去重、React `cache`、ISR、stale retention、cache tag、Preview、Webhook、认证、重试或熔断。
- 不接入 collection、navigation、route-manifest、多语言、SEO、询盘、正式首页、Header、Mega Menu、Footer 或视觉系统。
- 不提交、推送、合并或部署，除非后续收到精确正式交付口令。

## 交付物

- `frontend/src/lib/cms/server/**`：server-only 配置、`/resolve` URL builder、HTTP Transport、响应元数据与 typed errors。
- `frontend/tests/cms-transport.test.ts` 或同等单一聚焦测试文件：使用进程内本地 HTTP 服务覆盖 Transport 矩阵。
- 如测试需要，最小测试 helper 只能位于 `frontend/tests/**`，不得形成生产抽象。
- `frontend/README.md`：记录 `WORDPRESS_API_URL` 的 server-only 运行规则、Transport 当前能力、验证命令和明确非目标。
- 根 `README.md`：仅在根文档治理规则要求新增运行/验证入口时做最小同步。
- `TASKS/ARTIFACTS/TASK-009/DESIGN.md`。
- `TASKS/ARTIFACTS/TASK-009/IMPLEMENTATION_PLAN.md`。
- 标准 execution report、validation log、diff/output summary、adversarial review 和 planner final summary。

## 验收标准

- 生产 Transport 入口具有 framework-supported server-only guard；负例证明 Client Component 或浏览器侧导入不能形成有效客户端 bundle。
- `WORDPRESS_API_URL` 缺失、非绝对 URL、带用户名/密码、带 query/hash、非 HTTP(S)、非 `/wp-json` base 或非本机明文 HTTP 均在发请求前拒绝。
- 本地开发允许 `http://localhost`、`http://127.0.0.1` 和 IPv6 loopback 的显式端口；非 loopback CMS origin 必须使用 HTTPS。
- builder 只生成 `/gdhe/v1/resolve`，固定 `locale=en` 与 `schema=3.0.0`，正确编码 canonical path；非法或非英语输入必须 fail closed。
- 每次调用只发一个匿名 GET，设置 `Accept: application/json`，不携带 cookie、Authorization、nonce 或 Application Password，不自动重试。
- 超时使用 `AbortController` 或当前 Node/Next.js 支持的等价机制；超时、DNS/连接失败与调用方主动 abort 的语义可区分且不会泄漏 CMS origin。
- 200 JSON 只解析一次并以 `unknown` 返回；保留 status、`X-GDHE-Request-ID`、`ETag`、`Last-Modified`、`Retry-After` 和 Content-Type 中存在的受控值。
- 204、304、非 JSON、空/畸形 JSON 和意外 2xx 行为有明确协议错误或冻结行为；不得部分渲染或伪装成 404。
- 400、401、403、404、409、429、500、502、503 和其他意外状态映射为稳定 typed error；404 具有独立判别值，429 保留合法 `Retry-After`，非 404 不得映射为不存在。
- 错误对象、日志断言和浏览器构建扫描中不出现真实 CMS origin、凭据、cookie 或原始内部响应全文。
- 不新增运行时依赖；如实施中证明必须新增依赖，停止并回到 Planner 重新确认，不在 lane 内自行扩大。
- `npm run verify:cms-contract`、`npm run lint`、`npm run typecheck`、`npm test`、`npm run build` 与本任务新增测试全部通过。
- `cms/**`、WordPress 数据库、TASK-008 冻结快照和 `frontend/src/app/**` 保持字节不变。
- execution evidence、独立 adversarial review 和 Planner final validation 齐全；最终 review 为 PASS，P0/P1/P2 均为 0。

## 允许修改范围

- `frontend/src/lib/cms/server/**`
- `frontend/tests/cms-transport.test.ts`
- `frontend/tests/**` 中仅由本任务新增且 Transport 测试必需的最小 helper
- `frontend/vitest.config.ts`，仅用于把生产 `server-only` marker 映射到测试空 stub；不得改变其他测试行为
- `frontend/README.md`
- `README.md`，仅限必要的 TASK-009 开发者命令入口
- `TASKS/ACTIVE/TASK-009-server-only-resolve-transport.md`
- `TASKS/ARTIFACTS/TASK-009/**`
- 当前任务所需的 `PROJECT/**`、`TASKS/**`、`LANES/**` 治理记录和受控消息

## 禁止修改范围

- `cms/**`、WordPress 数据库、运行时内容、Fixture、插件、用户和配置
- `frontend/src/app/**`
- `frontend/src/lib/cms/contracts/**`
- `frontend/.env*`
- `frontend/package.json`、`frontend/package-lock.json` 和依赖版本；如现有测试命令足够，不新增 script
- TASK-007 和 TASK-008 的 Schema、Golden、manifest、checksum、review 与运行时证据
- 正式页面、组件、样式、图片、SEO、多语言、询盘和部署文件
- Git 提交、远端分支、`main`、GitHub 设置和任何外部系统

## 约束

- 使用现有 Node `24.18.0`、npm `11.16.0`、Next.js `16.2.11`、TypeScript `5.9.3` 和 Vitest `4.1.10`，不更换工具链。
- Transport 必须消费前端边界定义的 API `1` 与 Content Schema `3.0.0`，不得直接读取 WordPress Core REST、SCF、post meta 或数据库形状。
- 生产代码不得在运行时跨目录读取 `cms/` 或 `TASKS/`；TASK-008 本地合同快照仍是前端的离线事实源。
- 请求输入、返回值和错误必须使用 TypeScript 明确建模，但所有网络 JSON 在 Validator 任务之前始终视为 `unknown`。
- 测试应使用 Node 进程内绑定 loopback 随机端口的 HTTP 服务，结束后关闭 server/handle，不占用固定端口，不依赖机器现有 WordPress。
- 只实现 `/resolve` Transport；发现其他 endpoint、缓存、页面或 Schema 校验需求时记录为后续候选，不扩大 TASK-009。

## 假设和待确认事项

- 默认 `WORDPRESS_API_URL` 的合同为 REST base，例如本地 `http://127.0.0.1:8080/wp-json` 或生产 `https://cms.example.com/wp-json`，不是 WordPress 站点首页 URL。
- 默认超时值由 TASK-009 设计阶段冻结为一个保守的技术验证值，并通过注入或内部测试选项缩短测试等待；不把它误称为生产 SLA。
- 默认 Transport 暂不使用 Next.js ISR/cache 选项，以避免把缓存策略与网络正确性混合。
- 默认本任务不新增依赖；server-only 隔离使用 Next.js 当前支持的机制。

## 验证计划

- 先写失败测试：不安全配置、任意 endpoint/query 注入、timeout、连接失败、非 JSON、畸形 JSON、状态矩阵和无重试。
- 实现最小配置/URL builder，再验证发请求前的 fail-closed 行为。
- 实现单次匿名 GET、超时和一次性 JSON 解析，再验证 headers、method、请求次数和 metadata。
- 实现 typed error 层，再验证 404 与其他错误分流、429 `Retry-After`、敏感信息不泄漏。
- 执行 server-only 隔离负例和客户端构建/产物扫描。
- 运行 parity、lint、typecheck、完整 Vitest、production build、依赖/lockfile零差异、禁止范围 diff、secret scan 和 `git diff --check`。
- 运行 DPG project validate、message validate 和 strict lane audit；由 `adversarial_reviewer` 独立复核范围、错误语义、无泄漏与回归矩阵。

## 文档影响

任务将首次启用 `WORDPRESS_API_URL` 的运行时消费并新增开发者验证行为。实施完成后必须更新 `frontend/README.md`，将 `document_impact` 更新为 `RESOLVED`。

## README 影响

任务会改变本地前端 CMS 接入的使用方式；完成后必须评估并按根 README 治理规则更新最小入口，将 `readme_impact` 更新为 `UPDATED`。

## 分支和 Worktree

- 分支：`codex/TASK-009-server-only-resolve-transport`
- Worktree：当前共享项目工作区
- 基线：本地与远端 `main` 的 TASK-008 正式提交 `ba8148623a7a3e4b4b9d50974f02ec6fe70b9e8d`

## 当前状态

任务已正式验收、提交、推送任务分支、快进合并并推送至远端 `main`。正式提交为 `dd07662698744b90a0c810a0d1f9342109eb1a22`，本地 `main`、`origin/main` 与远端任务分支已验证一致。

## 恢复入口

先读 `AGENTS.md`、`PROJECT/STATE.md`、`PROJECT/COORDINATION.md`、`PROJECT/AGENT_LANES.md`、lane registry、planner 最近 worklog、本任务文件，再读 TASK-008 snapshot 设计、TASK-005 frontend integration boundary 与架构契约第 14.3 节。

## 下一步

任务已归档。后续只允许在独立任务中实现 Runtime Schema Validator、DTO Adapter 和可见技术验证页面；不得把本任务的 Transport 误称为已完成的前端界面。

## Lane Plan

| lane | responsibility | write_scope | expected_artifacts | status |
|---|---|---|---|---|
| planner | 冻结需求、维护范围与门禁、独立验证、派发审查和最终汇报 | `PROJECT/**`、`TASKS/**`、`LANES/planner/**` | task state、设计/计划、checkpoint、planner summary | AWAITING_USER; NOT_ACCEPTED |
| frontend | 测试先行实现 server-only 配置、URL builder、Transport、typed errors、测试和 frontend README | 本任务允许的 `frontend/**`、TASK-009 artifacts、lane records | implementation、execution report、validation evidence | COMPLETE; R3 response acknowledged |
| adversarial_reviewer | 只读挑战 server-only 隔离、URL allowlist、错误语义、敏感信息、测试真实性和范围 | TASK-009 review report、reviewer lane records | PASS/FAIL/P0/P1/P2 report | COMPLETE; Round 2 PASS P0/P1/P2=0 |

## Messages

- `MSG-TASK-009-FRONTEND-RESOLVE-TRANSPORT`：`execution_request`，已 validate、投递并由 frontend ACK 移入 `done`。
- frontend 尝试使用受控 helper 发送 BLOCKED/scope-resolution/response 时，prompt 参数中的 `apply_patch` 字样触发同一 Hook 的无目标写误判；Lane 未手写 message JSON。BLOCKED 结论通过真实 Codex thread 回传并由 Planner 核对。
- `MSG-TASK-009-FRONTEND-RESOLVE-TRANSPORT-R1` 及 response：已 dispatch/ACK/done；完成主体 Transport。
- `MSG-TASK-009-FRONTEND-EXPLICIT-LOOPBACK-PORT-R2` 及 response：已 dispatch/ACK/done；关闭显式 port P1。
- `MSG-TASK-009-ADVERSARIAL-REVIEW-R1`、FAIL response 和 stop recovery：已 dispatch/ACK/done；canonical verdict `FAIL / P0=0 / P1=1 / P2=1`。
- `MSG-TASK-009-FRONTEND-DEEP-IMPORT-SURFACE-R3` 及 response：已 dispatch/ACK/done；关闭生产 deep-import base/timeout bypass。
- `MSG-TASK-009-ADVERSARIAL-REVIEW-R2`：已 validate、dry-run、Codex thread 投递并 dispatch；只复核 Round 1 P1/P2 与直接回归边界。
- `MSG-TASK-009-ADVERSARIAL-REVIEW-R2-RESPONSE` 与 stop recovery：最终 `PASS / P0=0 / P1=0 / P2=0`，已 validate/ACK/done。

## 执行记录

- 2026-07-25T04:49:22Z：远端复核确认本地 `main`、`origin/main` 和远端 TASK-008 分支均为 `ba8148623a7a3e4b4b9d50974f02ec6fe70b9e8d`；工作区干净。
- 2026-07-25T04:49:22Z：TASK-008 同步为 `CLOSED / MERGED` 并归档；从同步 `main` 创建 `codex/TASK-009-server-only-resolve-transport`。
- 2026-07-25T04:49:22Z：创建 TASK-009 intake；只定义 Transport 与错误语义边界，等待用户明确需求确认。
- 2026-07-25T04:55:14Z：收到精确口令 `确认 TASK-009 需求并开始执行`；任务从 `AWAITING_REQUIREMENT_CONFIRMATION` 推进为 `READY`。确认测试配置可新增一个无依赖的 `server-only` marker stub alias，以便 Vitest 测试真实 guarded module，同时仍由 Next.js client-import 负例验证生产隔离。
- 2026-07-25T04:58:39Z：`MSG-TASK-009-FRONTEND-RESOLVE-TRANSPORT` 已 validate、dry-run，通过 Codex 线程桥投递至注册 frontend session `019f88cf-f8d2-7953-bdb4-9fbbe9876445` 并标记 dispatched；任务转为 `IN_PROGRESS`。
- 2026-07-25T05:08:00Z：frontend 返回 BLOCKED。测试 alias/stub、聚焦测试 import 和最小 `CmsConfigurationError` 由合规 `apply_patch` 保留；一个早期编码写入测试文件已删除并通过 `apply_patch` 重建，不存在 workaround-written 文件。有效 RED 为缺少 `config` 模块。
- 2026-07-25T05:09:30Z：Planner 只读复现 DPG 根因：freeform `tool_input` 经 `command_string()` 后长度为 0、目标路径集合为空；普通 `lane_message.py` prompt 中出现 `apply_patch` 时被 `write_like_command()` 错判为写命令且仍无目标。源插件与当前缓存 hook 字节一致。任务暂停等待新的插件修改授权。
- 2026-07-25T15:48:23Z：用户授权 DPG 修复与 TASK-009 恢复。三条回归分别取得预期失败并锁定 freeform path loss、helper prompt false-positive 与 TypeScript `=>` false redirection；最小修复后源插件聚焦 7/7、完整 83/83 tests PASS。Codex 安装并启用 `0.2.0+codex.20260725151602`，当前线程兼容缓存与新缓存验证一致；frontend scope、helper prompt 与完整 arrow-function patch 实际探针 PASS。任务恢复为 `IN_PROGRESS`。
- 2026-07-25T16:13:43Z：Planner ack R1 execution response 并独立重跑现有门禁 PASS；源码和 Node 24 predicate 复现无显式端口的三种 loopback HTTP base 均被当前实现接受。记录一个 P1，只允许显式端口 RED-GREEN 与 frontend README 窄同步；review 暂不放行。
- 2026-07-25T16:18:40Z：R2 response 已 ack；Planner 独立重跑 58/58 focused、67/67 full、parity、lint、typecheck、build、checksum、禁止范围、泄漏、临时残留和治理门禁全部 PASS。根 README 最小指针已同步，任务转为 `UNDER_REVIEW`。
- 2026-07-25T16:26:36Z：Round 1 reviewer response 与 recovery request 已 ack；verdict `FAIL / P0=0 / P1=1 / P2=1`。受控 reopen helper 因仅允许 AWAITING_USER 而安全拒绝且无 mutation；Planner 记录 direct `UNDER_REVIEW` -> `NEEDS_REVISION` recovery。P2 current-state 段落已同步，只放行 P1 deep-import surface R3。
- 2026-07-25T16:35:03Z：R3 response 已 ack；Planner 独立验证 production export surface 仅有 `resolveCmsPath`，base/timeout injection identifiers 为零；60/60 focused、69/69 full、parity、lint、typecheck、build、public/deep client negatives、scope 与治理门禁 PASS。任务转回 `UNDER_REVIEW`。
- 2026-07-25T16:38:20Z：`MSG-TASK-009-ADVERSARIAL-REVIEW-R2` 已 validate、dry-run，通过 Codex thread bridge 投递并标记 dispatched；当前等待窄范围独立 verdict。
- 2026-07-25T16:44:05Z：Round 2 PASS response 与 recovery 已 ACK；Planner fresh 运行 focused 60/60、full 69/69、parity、lint、typecheck、build、scope、checksum、residue、leakage 与治理门禁全部 PASS，并生成 `PLANNER_SUMMARY.md`。
- 2026-07-25T16:45:36Z：第一次 checked `prepare-awaiting-user` 验证 execution、final review PASS、validation 和文档影响后成功；随后只为同步 Board 和人类可读等待验收状态执行受控 reopen。
- 2026-07-25T16:46:19Z：受控同步完成；产品交付物、final PASS、validation、`NOT_ACCEPTED` 与 `DIRTY` 边界未改变，fresh checked transition 为唯一剩余动作。

## Execution Artifacts

- `DESIGN.md`
- `IMPLEMENTATION_PLAN.md`
- `EXECUTION_REPORT.md`
- `TEST_OR_VALIDATION_LOG.md`
- `DIFF_OR_OUTPUT_SUMMARY.md`
- `ADVERSARIAL_REVIEW_REPORT.md`
- 七份设计、实施、执行、审查和最终汇总文件均存在；final evidence 为 focused 60/60、full 69/69 与完整门禁 PASS。

## Adversarial Review

- Round 1 已完成：`FAIL / P0=0 / P1=1 / P2=1`。
- P1 production deep import bypass 与 P2 current-state drift 已完成 R3/Planner correction。
- Round 2 最终 `PASS / P0=0 / P1=0 / P2=0`；Planner final validation allowed 且已完成。

## Validation Evidence

- Planner final fresh 运行 focused 60/60、full 69/69、contract parity、lint、typecheck 和 production build PASS。
- REST/path allowlists、显式 loopback port、fixed URL、单次匿名 GET、timeout through body、typed errors、metadata、leakage、loopback cleanup 和 Client Component build negative 均通过。
- package/lock、`frontend/src/app/**`、合同快照、`cms/**` 和环境文件无差异；lockfile SHA-256 为 `fa5938d44418ccd8ba750edd8e78baa579a0417a661d404df6d129092ed526a0`。
- root/frontend README 当前行为一致；`document_impact=RESOLVED`，`readme_impact=UPDATED`。
- production source scan 不存在 `requestResolvedPath`、`baseUrl`、`timeoutMs` 或替代 seam；runtime export keys 精确为 `resolveCmsPath`，public/deep imports 指向同一函数与 path/signal 类型。
- project validate、message validate、strict lane audit 和 `git diff --check` PASS；无 queue/failed/blocked message；final checked `prepare-awaiting-user` PASS。

## Adversarial Round 1 Recovery 2026-07-25T16:26:36Z

- verdict: `FAIL / P0=0 / P1=1 / P2=1`；response 与 recovery request 已 ack。
- p1: production deep import exposes caller-controlled `baseUrl/timeoutMs`。
- p2: current-state narrative drift；已由 Planner 精确同步本文件相关段落，历史记录保留。
- transition_attempt: `task_transition.py reopen` 安全拒绝，原因是 helper 只支持 matching AWAITING_USER；无 mutation。
- transition: direct controlled `UNDER_REVIEW` -> `NEEDS_REVISION` with this canonical recovery。
- allowed_revision: 仅移除 production deep-import injection surface、迁移测试 seam、fresh validate 和 Round 2。
- unique_next_step: 派发 `MSG-TASK-009-FRONTEND-DEEP-IMPORT-SURFACE-R3`。

## Recovery Entry 2026-07-25T05:09:30Z

- reason: DPG Hook 不识别 Codex App freeform patch 输入，并对 helper 参数中的 `apply_patch` 字符串产生写命令误判。
- preserved_state: 设计/计划、有效 RED、四个合规部分文件和 frontend worklog BLOCKED 证据保留；无依赖、App、合同或 CMS 差异。
- authorization_needed: 修改 `/Users/arron/.codex/plugins/durable-project-governance` 源插件与当前缓存副本并增加两个回归测试。
- unique_next_step: 用户授权精确 DPG Hook 修复后，先验证源/缓存 parity 与测试，再恢复同一 TASK-009 frontend Lane。

## Recovery Resume 2026-07-25T15:48:23Z

- authorization: 用户明确授权修复 DPG Hook 并恢复 TASK-009。
- resolved: freeform patch 目标解析、helper prompt 误判和 patch 正文 `=>` 被当作 shell 重定向均已由 RED-GREEN 回归测试修复。
- evidence: 源插件 83/83 tests PASS；当前线程与新缓存聚焦 7/7 PASS；源/缓存 hook 与测试文件字节一致；真实 frontend allow/deny/helper/arrow-patch probes PASS。
- plugin_version: `0.2.0+codex.20260725151602` installed and enabled。
- preserved_state: 原设计、计划、RED、四个部分文件和禁止范围零差异保持不变。
- transition: `PAUSED` -> `IN_PROGRESS`。
- unique_next_step: 派发关联 continuation 给同一 frontend session，从原 RED 继续并返回标准 execution response。

## User Acceptance

`ACCEPTED` at 2026-07-25T17:16:01Z。

## Recovery Entry 2026-07-25T16:46:19Z

- Reason: Synchronize Board and human-readable acceptance-state narratives after the first checked prepare-awaiting-user transition; product deliverables, final PASS review, validation, NOT_ACCEPTED and DIRTY boundaries remain unchanged.
- Next step: Update only Board/current-state/handoff narratives, rerun governance readiness checks, then repeat checked prepare-awaiting-user.

## Recovery Entry 2026-07-25T16:47:35Z

- Reason: Final git diff check found three trailing spaces on empty governance event lane fields generated by controlled transitions; product deliverables and final PASS evidence are unchanged.
- Next step: Remove only the three trailing spaces in PROJECT/ACTIVITY.md, rerun diff and governance checks, then repeat checked prepare-awaiting-user.
