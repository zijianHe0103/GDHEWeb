# TASK-008 前端 CMS Contract Snapshot 与校验基线
accepted_at: 2026-07-24T17:58:37Z

task_id: TASK-008
status: CLOSED
owner_lane: planner
assigned_lanes: [frontend, governance_maintainer]
review_lane: adversarial_reviewer
linked_issues: []
artifacts_dir: TASKS/ARTIFACTS/TASK-008
acceptance_state: ACCEPTED
recovery_recorded_at: 2026-07-24T17:33:22Z
git_status: MERGED
document_impact: RESOLVED
readme_impact: UPDATED
project_type: software

## 原始请求

> 在实际开发过程中，我们应该尽可能把每一步开发都拆解成小任务。因为只有这样，当我们去执行每一个小任务时，颗粒度能够更高，出现错误时的回退成本更低。

> TASK-008 已设计完成，现在先去把 008 这个任务实际完成，然后再看下一个任务是否需要调整。

## 结构化理解

- TASK-007 已冻结并验证 Forest-aligned Content Schema `3.0.0`、REST API `1`、公开 `/resolve` 合同、Golden、错误 envelope 和 handoff checksum，并已合并到远端 `main`。
- 本任务只把 `/resolve` 成功/错误合同变成前端拥有、可离线校验、可追溯来源的最小快照，不建立 HTTP Transport、运行时 Schema Validator、DTO Adapter 或可见页面。
- 前端运行时和未来部署包不得跨目录读取 `cms/`；TASK-008 的快照是独立消费输入，源文件仍由 WordPress/GDHE 插件拥有。
- 后续任务必须逐个确认；TASK-008 完成前不创建或实施 TASK-009。

## 目标

- 冻结 `/resolve` 所需的 `page.v3.schema.json`、`error.schema.json` 及其完整传递 `$ref` 闭包。
- 冻结最小成功样例与错误样例，至少覆盖 Product、Page、内容不存在和不兼容 Schema。
- 建立机器可读 manifest，记录 TASK-007 来源、API/Schema 版本、源路径、快照路径和每个文件 SHA-256。
- 建立只读 parity 校验，证明快照完整、checksum 与权威源一致，且任何篡改会 fail closed。
- 在 frontend README 中记录快照职责、验证命令和明确非目标。

## 非目标

- 不实现 `WORDPRESS_API_URL` 读取、URL Builder、HTTP Client、超时、重试或错误分类。
- 不安装 Ajv，不实现 Draft 2020-12 运行时 Validator。
- 不建立 Product/Page DTO、Adapter 或 TypeScript 判别联合。
- 不修改 `frontend/src/app/**`，不创建 `/integration/cms` 或任何页面。
- 不连接、写入或创建 WordPress Fixture，不修改数据库、CMS 插件或后端合同。
- 不接入 collection、navigation、route-manifest、Preview、Webhook、缓存、多语言、SEO 或部署。

## 交付物

- `frontend/src/lib/cms/contracts/manifest.json`。
- `frontend/src/lib/cms/contracts/schemas/**`：仅 `/resolve` 成功和错误根 Schema 的传递闭包。
- `frontend/src/lib/cms/contracts/samples/**`：最小成功和错误样例。
- `frontend/scripts/verify-cms-contract.mjs`：使用 Node.js 内置能力执行来源、路径、集合和 checksum parity 校验。
- `frontend/tests/cms-contract-snapshot.test.ts`：覆盖正常 parity、缺失文件、额外文件和篡改失败。
- `frontend/package.json`：仅增加 TASK-008 验证命令，不增加运行时依赖。
- `frontend/README.md`：记录合同快照边界和本地验证方法。
- `TASKS/ARTIFACTS/TASK-008/DESIGN.md`。
- `TASKS/ARTIFACTS/TASK-008/IMPLEMENTATION_PLAN.md`。
- 标准 execution、validation、diff summary、adversarial review 与 planner final summary。

## 验收标准

- manifest 明确写出 API `1`、Content Schema `3.0.0`、来源 TASK-007、根 Schema、完整文件集合和每个 SHA-256。
- 快照精确覆盖 `page.v3.schema.json` 与 `error.schema.json` 可达的本地 `$ref` 闭包；不得夹带 collection、navigation 或 route-manifest 独占文件。
- Product 与 Page 成功样例通过来源 checksum；404 与不兼容 Schema 错误样例来自 TASK-007 冻结错误合同。
- parity 命令在未修改快照时 PASS；复制到临时目录后的缺失、额外和单字节篡改测试均 FAIL，且测试不修改正式快照。
- `frontend/` 不在运行时导入 `cms/`，快照与校验脚本不包含数据库 ID、凭据、真实业务内容或 WordPress/SCF 内部字段。
- `npm run lint`、`npm run typecheck`、`npm test`、`npm run build` 和新增 parity 命令全部通过。
- WordPress、数据库、CMS 插件、现有 Next.js 页面和环境变量保持不变。
- execution report、validation evidence、独立 adversarial review 和 planner final summary 齐全；最终 review 为 PASS 且 P0/P1/P2 为 0。

## 允许修改范围

- `frontend/src/lib/cms/contracts/**`
- `frontend/scripts/verify-cms-contract.mjs`
- `frontend/tests/cms-contract-snapshot.test.ts`
- `frontend/package.json`
- `frontend/README.md`
- `README.md`
- `TASKS/ARTIFACTS/TASK-008/DESIGN.md`
- `TASKS/ARTIFACTS/TASK-008/IMPLEMENTATION_PLAN.md`
- `TASKS/ACTIVE/TASK-008-frontend-cms-contract-snapshot.md`
- `TASKS/ARTIFACTS/TASK-008/**`
- `PROJECT/STATE.md`
- `PROJECT/ACTIVITY.md`
- `TASKS/BOARD.md`
- `TASKS/ARCHIVE/INDEX.md`
- `TASKS/ARCHIVE/TASK-007-english-api-dto-fixture.md`
- `LANES/planner/**`
- `LANES/frontend/**`
- `LANES/governance_maintainer/**`
- `LANES/adversarial_reviewer/**`
- 本任务受控 lane message 与 registry event

## 禁止修改范围

- `cms/**`
- WordPress 数据库、内容、用户、Fixture、插件和运行配置
- `frontend/src/app/**`
- `frontend/.env*`
- `frontend/package-lock.json` 和依赖版本
- TASK-007 的 Schema、Golden、review 和运行时证据内容
- 外部系统、GitHub、部署、DNS、邮件或 CRM

## 约束

- 使用 TypeScript 项目既有 Node `24.18.0`、npm `11.16.0`、Next.js `16.2.11` 和 Vitest，不新增包管理器或运行时依赖。
- 快照生成/校验必须确定性排序，路径必须为仓库相对路径，不能依赖本机绝对路径。
- manifest 是前端消费快照的事实源，但不能取代 WordPress/GDHE Schema 权威源。
- 只做 `/resolve` 合同快照；发现未来端点需要时建立新的独立任务，不扩大 TASK-008。
- 任何源/快照不一致、未知 `$ref`、路径逃逸、重复目标或 checksum 漂移均 fail closed。

## 假设和待确认事项

- 已确认使用独立小任务推进；本任务完成后才重新评估下一任务。
- 已确认未来最终需要显式开启的本地可见 `/integration/cms` 页面，但该页面不属于 TASK-008。
- TASK-008 不需要真实 WordPress 内容；所有输入均来自 TASK-007 已冻结文件。

## 验证计划

- 先写 parity 和负例测试，确认在交付物不存在时失败。
- 生成最小快照与 manifest，再运行正常、缺失、额外、篡改和路径逃逸验证。
- 检查传递 `$ref` 闭包与 TASK-007 Schema 图的精确子集关系。
- 扫描数据库 ID、凭据、绝对路径、`cms/` 运行时 import 和禁止范围差异。
- 运行 frontend lint、typecheck、Vitest、production build 和 parity 命令。
- 运行治理 validate、controlled messages、strict lane audit 和 `git diff --check`。
- 由 `adversarial_reviewer` 独立检查最小性、来源权威、闭包完整性、篡改失败和零后端/页面范围。

## 文档影响

任务会新增开发者验证命令和合同消费流程；执行完成后必须把 `document_impact` 更新为 `RESOLVED`。

## README 影响

任务改变了 frontend 开发和校验流程；`frontend/README.md` 已记录完整行为，根 README 已增加最小命令入口，`readme_impact` 为 `UPDATED`。

## 分支和 Worktree

- 分支：`codex/TASK-008-frontend-cms-contract-snapshot`
- Worktree：当前共享项目工作区

## 当前状态

`CLOSED / MERGED`。用户已于 `2026-07-24T17:58:37Z` 使用精确口令验收；正式提交 `ba8148623a7a3e4b4b9d50974f02ec6fe70b9e8d` 已推送任务分支、快进集成并推送到远端 `main`。2026-07-25 创建 TASK-009 前再次验证本地 `main`、`origin/main` 与远端 TASK-008 分支均指向该提交，工作区干净。

## 恢复入口

先读 `AGENTS.md`、`PROJECT/STATE.md`、`PROJECT/COORDINATION.md`、`PROJECT/AGENT_LANES.md`、lane registry、planner 最近 worklog、本任务文件、TASK-007 handoff manifest 与 frontend 现状。

## 下一步

任务已归档。后续只允许在独立任务中逐层实现 Transport、Validator、Adapter 和可见技术验证页面，不把本任务的离线合同快照误称为运行时 CMS 接入。

## Lane Plan

| lane | responsibility | write_scope | expected_artifacts | status |
|---|---|---|---|---|
| planner | 冻结需求、维护门禁、综合验证、派发审查与最终汇报 | `PROJECT/**`、`TASKS/**`、`LANES/planner/**`、本任务两份设计/计划文档 | task state、spec/plan、planner summary | CLOSED / MERGED |
| frontend | 按测试优先实现最小合同快照、manifest、parity 脚本、测试和 frontend README | 本任务允许的 `frontend/**`、TASK-008 artifacts、lane records | snapshot implementation、execution/validation evidence | CLOSED / MERGED |
| governance_maintainer | 仅按根 README 治理规则补充 TASK-008 离线验证入口 | `README.md`、lane records | one README pointer and response | CLOSED / MERGED |
| adversarial_reviewer | 只读挑战快照最小性、闭包完整性、checksum、篡改失败和范围隔离 | TASK-008 review report、reviewer lane records | PASS/FAIL/P0/P1/P2 report | final PASS; P0/P1/P2=0 |

## Messages

- `MSG-TASK-008-FRONTEND-CONTRACT-SNAPSHOT`：`execution_request`，已 validate、dry-run、通过 Codex thread bridge 派发并由 registry 标记为 `dispatched`；目标 session `019f88cf-f8d2-7953-bdb4-9fbbe9876445`。
- `MSG-TASK-008-FRONTEND-CONTRACT-SNAPSHOT-RESPONSE`：初始 execution response 已 validate 并由 Planner ack；正常矩阵 PASS，但 Planner 独立复核发现 authority identity 未硬绑定。
- `MSG-TASK-008-FRONTEND-AUTHORITY-BINDING-R1`：单一 P1 窄修订已 validate、dry-run、通过 Codex thread bridge 派发并标记 `dispatched`。
- `MSG-TASK-008-FRONTEND-AUTHORITY-BINDING-R1-RESPONSE`：R1 execution response 已 validate 并由 Planner ack；authority substitution regression 和完整矩阵 PASS。
- `MSG-TASK-008-ADVERSARIAL-REVIEW-R1`：独立 review request 已 validate、dry-run、通过 Codex thread bridge 派发并标记 `dispatched`。
- `MSG-TASK-008-ADVERSARIAL-REVIEW-R1-RESPONSE`：final `PASS`，P0=0、P1=0、P2=0，已 validate 并由 Planner ack。
- `MSG-TASK-008-ADVERSARIAL-REVIEW-R1-STOP-RECOVERY`：reviewer 只读恢复交接已由 Planner ack；本记录即为 planner-owned recovery。
- `MSG-TASK-008-GOVERNANCE-README-SYNC` / `-RESPONSE`：根 README 窄同步已完成并由 Planner ack；managed block 字节不变。TASK-008 report 由有权写 `TASKS/**` 的 Planner 记录，无需扩大 lane registry。

## 执行记录

- 2026-07-24T16:52:29Z：用户要求停止连续设计后续任务，先完成已确认设计的 TASK-008；planner 完成切换检查、归档 TASK-007、创建独立分支和 intake，不修改产品交付物。
- 2026-07-24T16:57:40Z：收到精确需求确认口令；TASK-008 从 `AWAITING_REQUIREMENT_CONFIRMATION` 转为 `READY`，范围和非目标不变，进入设计/计划冻结与受控 frontend execution 派发准备。
- 2026-07-24T17:01:32Z：`DESIGN.md` 和 `IMPLEMENTATION_PLAN.md` 已冻结并通过治理/范围检查；frontend execution request 已受控派发，TASK-008 从 `READY` 转为 `IN_PROGRESS`。
- 2026-07-24T17:15:41Z：Planner 独立重跑 parity/lint/typecheck/8 tests/build 均 PASS，但用同字节 `error.schema.json.rogue` 替换 manifest `sourcePath` 后 verifier 意外 PASS；记录为 authority-binding P1，只派发该路径身份硬绑定与负例测试窄修订。
- 2026-07-24T17:21:42Z：R1 response 已 ack；Planner 重跑 `.rogue` 利用被明确拒绝，parity/lint/typecheck/9 tests/build、lockfile、范围和治理全部 PASS；任务转为 `UNDER_REVIEW` 并派发独立 Round 1。
- 2026-07-24T17:27:55Z：独立 Round 1 final `PASS`，P0=0、P1=0、P2=0；review response 和 stop-recovery 均已 ack。最终验证前只补根 README 的离线 parity 命令指针，以满足项目 README 治理门禁。
- 2026-07-24T17:32:00Z：根 README 同步完成；Planner fresh final validation 对 parity、lint、typecheck、9 tests、build、20-file inventory、lockfile、范围、secret/internal-ID、治理/messages/strict lane/diff 全部 PASS；`PLANNER_SUMMARY.md` 已生成。
- 2026-07-24T17:32:46Z：首次 checked `prepare-awaiting-user` PASS；随后仅为同步人类可读状态视图执行受控 reopen，交付物、verdict 与 `NOT_ACCEPTED` 不变。
- 2026-07-24T17:58:37Z：用户精确输入 `确认 TASK-008 完成并提交到远端`；`task_accept.py accept` 成功，正式提交、任务分支推送、合并到 `main` 和推送 `main` 已授权。
- 2026-07-25T04:49:22Z：创建 TASK-009 前重新核对正式交付；本地 `main`、`origin/main` 和远端 TASK-008 分支均为 `ba8148623a7a3e4b4b9d50974f02ec6fe70b9e8d`，工作区干净，TASK-008 同步为 `CLOSED / MERGED` 并归档。

## Execution Artifacts

- `DESIGN.md`
- `IMPLEMENTATION_PLAN.md`
- `EXECUTION_REPORT.md`
- `TEST_OR_VALIDATION_LOG.md`
- `DIFF_OR_OUTPUT_SUMMARY.md`
- `PLANNER_CHECKPOINT.md`
- `README_SYNC_REPORT.md`

## Adversarial Review

Round 1 final：`PASS`，P0=0、P1=0、P2=0；Planner final validation allowed。

## Validation Evidence

- Intake 前 `main` 与 `origin/main` 均为 `8a3e4f26d148e64d301a508e69c1e4a28ad3b9e9`，divergence `0/0`，工作区干净。
- 无 queue/dispatched/failed/blocked lane message，无活动 issue，当前 session 为注册 `planner`。
- TASK-007 任务分支、远端任务分支、本地 `main` 与 `origin/main` 已在上一交付回合验证为同一提交。
- Planner 独立验证：Node `24.18.0`、npm `11.16.0`、parity、lint、typecheck、9/9 tests 和 build PASS。
- authority identity 利用在修订前意外 PASS、修订后明确拒绝；20-file inventory、lockfile SHA、禁改目录、secret/internal-ID、治理、messages、strict lane 和 diff check 均 PASS。
- Final fresh validation：Node `24.18.0`、npm `11.16.0`、parity、lint、typecheck、9/9 tests、build、README、20-file inventory、lockfile/current-HEAD parity、禁改范围、secret/internal-ID、project/messages/strict lane/diff 全部 PASS。
- 归档前交付复核：远端 `main` 与远端 TASK-008 分支均为正式提交 `ba8148623a7a3e4b4b9d50974f02ec6fe70b9e8d`；本地 `main` 同步且工作区干净。

## User Acceptance

`ACCEPTED` at 2026-07-24T17:58:37Z。

## Recovery Entry 2026-07-24T17:33:22Z

- Reason: Synchronize the human-readable task, project and board views after the checked AWAITING_USER transition; deliverables, final PASS and NOT_ACCEPTED state are unchanged.
- Next step: Synchronize narrative-only state views, rerun governance and acceptance checks, then run checked prepare-awaiting-user again.
