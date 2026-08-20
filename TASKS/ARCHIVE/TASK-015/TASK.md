# TASK-015 前端 ProductCard Contract Snapshot 与离线权威校验器
accepted_at: 2026-07-30T10:25:34Z
closed_at: 2026-07-30T10:25:34Z
delivery_profile: REMOTE
recovery_recorded_at: 2026-07-30T10:23:51Z

task_id: TASK-015
status: CLOSED
owner_lane: planner
assigned_lanes: ["frontend", "validation"]
review_lane: adversarial_reviewer
linked_issues: []
artifacts_dir: TASKS/ARTIFACTS/TASK-015
acceptance_state: ACCEPTED
git_status: MERGED
document_impact: RESOLVED
readme_impact: UPDATED
project_type: software

## 原始请求

> 创建 TASK-015：建立前端 ProductCard Contract Snapshot 与离线权威校验器

## 结构化理解

- TASK-014 已交付独立 ProductCard Schema `1.0.0`、匿名只读 `/wp-json/gdhe/v1/product-cards`、精确 8-file Schema closure、8 份成功 Golden、规范化错误证据和 25-file handoff 校验清单。
- 本任务只把 TASK-014 已冻结的 ProductCard 合同复制为前端拥有、可离线验证、可追溯来源的 Snapshot；不建立 HTTP 消费、运行时 Schema Validator、DTO Adapter 或页面。
- 既有 TASK-008 `/resolve` Snapshot 的 verifier 要求 `frontend/src/lib/cms/contracts/**` 是精确文件集合。因此 ProductCard 必须使用独立目录，不能向既有目录塞入新文件，也不能放宽旧 verifier。
- 本任务完成后，才重新判断下一项前端 ProductCard Transport/Validator/Adapter 或可见页面任务；不在 TASK-015 中提前实现。

## 目标

- 冻结 ProductCard collection 根 Schema 及其完整 8-file 本地 `$ref` 闭包。
- 冻结足以证明 `0/1/N`、四种 action、非空合法 series/applications 和规范化错误语义的代表性样例。
- 建立机器可读 manifest，记录 TASK-014 来源、REST API、Content Schema、ProductCard Schema、endpoint、源路径、Snapshot 路径与 SHA-256。
- 建立只使用 Node.js 内置能力的离线权威校验器，验证精确集合、路径安全、来源/快照字节一致性、checksum、`$ref` closure 与来源身份。
- 用 focused tests 证明正常 Snapshot 通过，缺失、额外、篡改、路径逃逸、远程/未知 `$ref`、来源替换和 source drift 均 fail closed。
- 保持既有 `/resolve` Snapshot、verifier、Transport、Validator、Adapter 与可见集成页不变。

## 非目标

- 不实现 ProductCard HTTP Transport、请求参数构造、超时、重试、缓存或 `304` 消费。
- 不安装 Ajv，不实现 ProductCard runtime Validator、validated wrapper、DTO、Adapter 或 TypeScript UI model。
- 不创建 React ProductCard、产品列表、分类页、详情页、路由、Metadata、SeoDocument 或任何新的可见页面。
- 不修改现有 `/resolve` Snapshot、`verify-cms-contract.mjs`、Transport、Validator、Adapter 或 `/integration/cms`。
- 不修改 WordPress、GDHE Site 插件、数据库、Fixture、Schema 权威源或 TASK-014 handoff。
- 不导入或发布真实产品，不连接询价 API、飞书、多语言、Preview、Webhook、Staging 或部署。
- 不新增 npm 依赖，不修改 lockfile、环境变量或构建拓扑。
- 不提交、推送、合并或部署，除非后续收到正式交付口令。

## 交付物

- `frontend/src/lib/cms/product-card-contract/manifest.json`。
- `frontend/src/lib/cms/product-card-contract/schemas/**`：TASK-014 ProductCard 精确 8-file `$ref` closure。
- `frontend/src/lib/cms/product-card-contract/samples/success/**`：覆盖 0/1/N、四种 action、非空合法 series/applications 的最小代表性样例。
- `frontend/src/lib/cms/product-card-contract/samples/errors/**`：经挑选的规范化 ProductCard request/error 样例。
- `frontend/scripts/verify-product-card-contract.mjs`：离线、确定性、authority-bound、fail-closed 校验器。
- `frontend/tests/product-card-contract-snapshot.test.ts`：正常和 mutation failure 测试。
- `frontend/package.json`：仅新增 `verify:product-card-contract` 命令，不新增依赖。
- `frontend/README.md` 与根 `README.md`：记录 Snapshot 职责、验证命令、与现有 `/resolve` Snapshot 的隔离及明确非目标。
- `TASKS/ARTIFACTS/TASK-015/` 下的设计、实施计划、执行报告、差异摘要、验证日志、独立对抗审查和 Planner Summary。

## 验收标准

- manifest 明确记录来源 `TASK-014`、REST API `1`、Content Schema `3.0.0`、ProductCard Schema `1.0.0`、endpoint `/wp-json/gdhe/v1/product-cards` 和稳定 handoff 身份。
- Schema Snapshot 精确包含 TASK-014 manifest 指定的 8 个文件，不缺失、不夹带；所有本地 `$ref` 可达且留在 Snapshot 根内。
- manifest 中所有路径均为排序稳定的仓库相对路径；每个源文件和 Snapshot 文件都有 SHA-256，且 exact-byte parity 可验证。
- success samples 至少证明：空集合、真实单项集合、多项集合、四种冻结 action、合法非空 series/applications；不要求把 8 份 Golden 全量复制。
- error samples 只取 TASK-014 已冻结的规范化错误，不自行发明新错误语义。
- verifier 正常运行 PASS；临时副本中的缺失文件、额外文件、单字节篡改、路径逃逸、远程/未知 `$ref`、错误 authority/source mapping 和 source drift 均稳定 FAIL。
- 校验器不访问网络、不连接 WordPress/数据库、不依赖本机绝对路径、不运行 CMS Fixture，也不在正式 Snapshot 上执行 mutation。
- 前端运行时不从 `cms/**` 或 `TASKS/**` 导入文件；Snapshot 是前端自有运行输入，CMS/TASK-014 仅在离线 parity 校验时作为权威来源。
- 既有 `npm run verify:cms-contract`、`npm run lint`、`npm run typecheck`、`npm test` 和 `npm run build` 保持通过；新增 verifier 与 focused tests 通过。
- `frontend/package-lock.json` 与依赖集合不变；既有 `/resolve` 合同目录和 verifier 字节不因本任务改变。
- execution report、validation evidence、独立 adversarial review 和 Planner Summary 齐全；最终 review 为 `PASS / P0=0 / P1=0 / P2=0`。

## 允许修改范围

- `frontend/src/lib/cms/product-card-contract/**`
- `frontend/scripts/verify-product-card-contract.mjs`
- `frontend/tests/product-card-contract-snapshot.test.ts`
- `frontend/package.json`
- `frontend/README.md`
- `README.md`
- `TASKS/ACTIVE/TASK-015-product-card-contract-snapshot.md`
- `TASKS/ARTIFACTS/TASK-015/**`
- `TASKS/ARCHIVE/INDEX.md`
- `TASKS/ARCHIVE/TASK-014/TASK.md`
- `PROJECT/STATE.md`
- `PROJECT/ACTIVITY.md`
- `TASKS/BOARD.md`
- `LANES/planner/**`
- `LANES/frontend/**`
- `LANES/adversarial_reviewer/**`
- 本任务所需的 `LANES/messages/**` 与 `PROJECT/events.jsonl`

## 禁止修改范围

- `cms/**`
- WordPress 数据库、内容、用户、Fixture、插件与运行配置
- `TASKS/ARTIFACTS/TASK-014/**`
- `frontend/src/lib/cms/contracts/**`
- `frontend/scripts/verify-cms-contract.mjs`
- 既有 `/resolve` Validator、Transport、Adapter 与 `frontend/src/app/**`
- `frontend/package-lock.json`、依赖版本、`.env*` 与部署配置
- 飞书、GitHub 配置、DNS、Staging、生产环境和其他外部系统

## 约束

- TASK-014 `PRODUCT_CARD_HANDOFF_MANIFEST.json` 与 `PRODUCT_CARD_HANDOFF_CHECKSUMS.sha256` 是本任务的直接来源权威；不得从聊天摘要重建文件集合或 checksum。
- 使用单独的 `product-card-contract` 目录，避免扩大 TASK-008 `/resolve` Snapshot 的精确 inventory。
- 只使用仓库相对路径、确定性排序和 SHA-256；任何歧义、重复路径、路径逃逸、未知/远程 `$ref` 或 authority substitution 均 fail closed。
- 测试必须在临时副本中制造失败，不得改写 TASK-014 权威文件或正式前端 Snapshot。
- 英语仍是唯一公开 locale；本任务不增加翻译、hreflang、RTL 或语言入口。
- 生产媒体 HTTPS origin 与 Next Image allowlist 继续保留为未来可见页面/部署 gate，不阻塞纯合同 Snapshot。

## 假设和待确认事项

- 代表性 success/error sample 的精确最小集合在实施前 DESIGN checkpoint 中从 TASK-014 已冻结证据选择；不得删减 `0/1/N`、四种 action 或非空 relation 的覆盖。
- 前端 Snapshot 目录与 manifest 字段名可在不改变上述职责和边界的前提下由 frontend lane 做最小设计；如必须修改既有 `/resolve` verifier、增加依赖或改变 CMS 权威合同，必须停止并重新向用户确认。

## 验证计划

1. 记录 TASK-014 handoff 8-file closure、25-file checksum、8 Golden/error 与现有 TASK-008 `/resolve` Snapshot 基线。
2. 形成 DESIGN 和 IMPLEMENTATION_PLAN，冻结目录、manifest、最小样例集合、authority mapping、mutation matrix 与回滚方式。
3. 先写 focused test，得到“ProductCard Snapshot/verifier 尚不存在”的预期 RED，再做最小 GREEN。
4. 在临时目录运行缺失、额外、篡改、路径逃逸、远程/未知 `$ref`、authority substitution 和 source drift mutation tests。
5. 运行新增 verifier/focused tests，以及既有 `verify:cms-contract`、lint、typecheck、test 和 build。
6. 校验 dependency/lockfile 未变化、既有 `/resolve` Snapshot/verifier 未变化、无内部字段/凭据/绝对路径、protected scope、Markdown/链接、project/registry/messages/strict lane 和 `git diff --check`。
7. 交由 adversarial_reviewer 独立检查权威替换、非精确 closure、弱 checksum、路径逃逸、测试修改正式文件、运行时跨目录依赖和越权 UI 实现。

## 文档影响

`RESOLVED`：frontend README 与根 README 已同步开发者验证命令、独立 Snapshot 职责及明确非目标。

## README 影响

`UPDATED`：frontend README 与根 README 已记录 ProductCard Snapshot 和验证命令。

## 分支和 Worktree

- 分支：`codex/TASK-015-product-card-contract-snapshot`
- Worktree：当前共享项目工作区
- 基线：`main` / `origin/main` at `c8417089c716244a4739ae17b7abe6c5f31ef929`

## 当前状态

`CLOSED / ACCEPTED / MERGED`。正式提交
`54917bdedcdb710830021c6397adc217252a8423` 已推送任务分支，并已快进合并和推送至远端 `main`；本地任务分支、远端任务分支、本地 `main` 与 `origin/main` 均已核验一致。

## 恢复入口

先读 `AGENTS.md`、`PROJECT/COORDINATION.md`、`PROJECT/AGENT_LANES.md`、`LANES/registry/lanes.json`、本任务文件，再读 TASK-014 `PRODUCT_CARD_HANDOFF_MANIFEST.json`、`PRODUCT_CARD_HANDOFF_CHECKSUMS.sha256`、`FRONTEND_HANDOFF_READONLY_AUDIT.md` 和 TASK-008 归档任务。

## 下一步

任务已归档。后续 ProductCard Transport、runtime Validator、DTO Adapter、React/UI、SeoDocument、真实产品或部署必须在独立任务中实施。

## Lane Plan

| lane | responsibility | write_scope | expected_artifacts | status |
|---|---|---|---|---|
| planner | 需求冻结、状态、设计 checkpoint、调度、最终验证和用户汇报 | `PROJECT/**`、`TASKS/**`、`LANES/**` | intake、checkpoint、Planner Summary | FORMAL_DELIVERY |
| frontend | 确认后按 TDD 建立独立 Snapshot、离线 verifier、focused tests 和文档 | 本任务允许的 `frontend/**`、TASK-015 artifacts、lane records | RED/GREEN、Snapshot、verifier、tests、execution report | EXECUTION_COMPLETE |
| adversarial_reviewer | 实施与 Planner validation 后只读独立审查 | canonical review report、reviewer lane records | PASS/FAIL/P0/P1/P2 report | REVIEW_COMPLETE_PASS |

## Messages

- `MSG-TASK-015-FRONTEND-IMPLEMENTATION` 与关联 execution response 均已通过 Codex thread bridge 交付并 ACK。
- `MSG-TASK-015-ADVERSARIAL-REVIEW-R1` 与关联 PASS response 均已通过真实 Codex thread bridge 交付并 ACK。

## 执行记录

- 2026-07-30T10:23:51Z：活动任务 Validation Evidence 已采用可解析的 `Evidence: PASS`；fresh full strict audit 无 HIGH，只有正式提交前预期的 `GIT_DIRTY` medium 与 WordPress Core 文件名 low heuristic。最终受控同步后再次 checked prepare。
- 2026-07-30T10:20:49Z：review response 已 ACK；fresh final verifier/focused/旧 verifier/lint/typecheck/build/full suite、13-file inventory、25/25 authority、protected scope 与治理门禁通过。机器可读 review PASS 标签完成最小格式同步；checked prepare 成功后因 Board/叙述仍旧而受控 reopen，只同步状态面并再次 prepare。
- 2026-07-30T09:55:13Z：frontend execution response 已受控送达并 ACK，先前 permission recovery 关闭。Planner 复核代码、authority、Snapshot、文档与 protected scope，独立运行 verifier/focused/旧 verifier/lint/typecheck/build/full suite 全通过；根 README 已同步，任务进入 `UNDER_REVIEW`。
- 2026-07-30T09:33:03Z：frontend 已实现并验证 8 Schema / 3 success / 6 errors、13 focused tests；获批非沙箱全量测试为 10 files / 171 tests PASS，执行证据已写入。独立 task 随后停在重复系统权限请求，尚无 execution response。Planner 独立重跑同一全量测试也为 10/171 PASS，但不代替 lane response；记录恢复入口后等待权限处理。
- 2026-07-30T06:01:49Z：`MSG-TASK-015-FRONTEND-IMPLEMENTATION` 通过真实 Codex thread bridge 投递并记录 dispatched；等待 frontend ACK/TDD execution。
- 2026-07-30T06:00:39Z：DESIGN、IMPLEMENTATION_PLAN 与 baseline validation 完成；Node 24 全量 baseline 在获批的非沙箱监听环境为 9 files/158 tests PASS，旧 verifier/lint/typecheck/build 通过。任务 `READY` -> `IN_PROGRESS`，准备受控 dispatch frontend。
- 2026-07-30T05:49:14Z：用户输入精确口令 `确认 TASK-015 需求并开始执行`；任务从 `AWAITING_REQUIREMENT_CONFIRMATION` 转为 `READY`。先完成设计与 baseline gate，不直接实施。
- 2026-07-30T05:38:12Z：核验 TASK-014 task branch、`main`、`origin/main` 均为正式提交 `c8417089c716244a4739ae17b7abe6c5f31ef929`；TASK-014 可归档为 `CLOSED / MERGED`。
- 2026-07-30T05:38:12Z：创建 TASK-015 分支和需求登记；未修改前端/CMS/数据库/外部系统，未运行实施或 dispatch。

## Durable Task Artifacts

- `TASKS/ARCHIVE/TASK-015/OUTPUTS/DESIGN.md`
- `TASKS/ARCHIVE/TASK-015/EVIDENCE/validation/TEST_OR_VALIDATION_LOG.md`
- `TASKS/ARCHIVE/TASK-015/VALIDATION_REPORT.md`
- `TASKS/ARCHIVE/TASK-015/EVIDENCE/validation/FINAL_VALIDATION.md`

## Adversarial Review

- Current final verdict：`PASS / P0=0 / P1=0 / P2=0`；Planner final validation allowed。独立 reviewer 复现 exact 13-file inventory、8-file closure、25/25 authority、focused 13/13、五个附加 mutation probes、0/1/N、四格 action、六错误重建、旧 verifier/lint/typecheck/build/full suite 与 protected scope。Evidence：`TASKS/ARCHIVE/TASK-015/VALIDATION_REPORT.md`。

## Validation Evidence

- Evidence: PASS。Status：`PASS_FOR_CHECKED_ACCEPTANCE_PREPARATION`。审查后 Planner 从当前字节再次运行 ProductCard verifier `8/3/6`、focused `13/13`、旧 verifier `16/2/2`、lint、typecheck、build、system-approved full suite `10 files/171 tests`，全部通过；13-file inventory、25/25 authority、protected scope、baseline hashes、project/registry/messages/strict lane 与 `git diff --check` 通过。详见 `FINAL_VALIDATION.md`。

## User Acceptance

`ACCEPTED`。用户于 2026-07-30T10:25:34Z 输入精确口令 `确认 TASK-015 完成并提交到远端`；正式 Git 交付进行中。

## Recovery Entry 2026-07-30T09:33:03Z

- Reason: frontend implementation and validation bytes exist, but the registered frontend task is waiting on a duplicate system permission request and has not sent the required linked execution response.
- Verified so far: ProductCard verifier `8/3/6` PASS, focused `13/13` PASS, old verifier/lint/typecheck/build PASS, system-approved full tests `10 files / 171 tests` PASS; Planner independently reproduced the same current full-suite result.
- Next step: approve or cancel the visible frontend permission request, allow frontend to finish non-privileged evidence and dispatch the linked execution response, then perform fresh Planner checkpoint. Do not begin adversarial review before that response.

## Recovery Closure 2026-07-30T09:55:13Z

- `MSG-TASK-015-FRONTEND-IMPLEMENTATION-RESPONSE` 已通过真实 Codex thread bridge 送达并由 Planner ACK。
- 先前 duplicate PermissionRequest 不再阻塞；恢复记录作为历史证据保留。
- fresh Planner checkpoint 已完成并通过；唯一下一步为独立 adversarial review。

## Review Recovery 2026-07-30T10:14:04Z

- `MSG-TASK-015-ADVERSARIAL-REVIEW-R1-RESPONSE` 已通过真实 Codex thread bridge 送达并由 Planner ACK。
- Final verdict：`PASS / P0=0 / P1=0 / P2=0`；没有修订 finding。
- Reviewer 独立复现 ProductCard verifier `8/3/6`、focused `13/13`、五个附加 fail-closed probes、旧 verifier `16/2/2`、lint、isolated typecheck/build、system-approved full suite `171/171` 与 TASK-014 `25/25`。
- PASS 不等于用户验收；唯一下一步是 fresh Planner final validation、Planner Summary 与 checked `prepare-awaiting-user`。

## Prepared For User Acceptance 2026-07-30T10:20:49Z

- fresh Planner final evidence：ProductCard verifier `8/3/6`、focused `13/13`、旧 verifier `16/2/2`、lint、typecheck、build、full suite `171/171`、TASK-014 `25/25`、protected scope 与治理检查通过。
- `ADVERSARIAL_REVIEW_REPORT.md` 仅补充 DPG 解析器需要的机器可读 `status: PASS`；结论、findings 和证据未改变。
- 首次 checked prepare 返回 `ok: true`；因 Board 与人类可读叙述仍显示 `UNDER_REVIEW`，受控 reopen 只同步这些状态面，随后再次运行 checked prepare。
- acceptance 仍为 `NOT_ACCEPTED`，Git 仍为 `DIRTY`；没有 commit、push、merge 或 deployment。

## Strict Audit Evidence Recovery 2026-07-30T10:22:07Z

- second checked prepare 已成功，但 strict project audit 报 `VERIFY_EVIDENCE_MISSING`。
- 原因是活动任务的 `Validation Evidence` 章节虽包含 `PASS` 和完整结果，但章节正文没有解析器要求的字面量 `Evidence`/`证据`。
- 只在同一 PASS 行增加 `Evidence:` 标签；不改变命令、结果、review、实现或验收边界。
- 下一步为 fresh governance checks；HIGH 清零后再次 checked prepare。

## Strict Audit PASS Token Recovery 2026-07-30T10:23:01Z

- audit parser 使用 `\bPASS\b`；`PASS_FOR_...` 的下划线属于 word character，因此不构成独立 PASS token。
- 同一 validation line 改为 `Evidence: PASS`，原 status、命令和结果完整保留。
- 这是机器可读格式修正，不改变产品实现、review verdict、evidence 或验收范围。

## Final Strict Audit 2026-07-30T10:23:51Z

- fresh full strict project audit：zero HIGH。
- remaining notices：`GIT_DIRTY` medium（正式验收/提交前预期）与 `cms/wp-admin/includes/class-wp-debug-data.php` low heuristic（既有 WordPress Core 文件，不是任务临时产物）。
- acceptance readiness、project、registry、messages、strict lane 与 `git diff --check` 均通过。
- 最终状态只等待用户正式验收；无 Git、deployment 或下一任务。

## Formal User Acceptance 2026-07-30T10:25:34Z

- authorization: 用户输入精确口令 `确认 TASK-015 完成并提交到远端`。
- acceptance: `task_accept.py accept` 返回 `accepted: true`。
- pre_commit_validation: ProductCard verifier `8/3/6`、focused `13/13`、旧 verifier `16/2/2`、lint、typecheck、build 与 full suite `171/171` 全通过。
- delivery: 只提交 TASK-015 范围，立即推送任务分支、fast-forward 合并并推送 `main`。
- exclusion: `.codex/config.toml` 与既有 resume packets 继续排除。

## Recovery Entry 2026-07-30T10:20:49Z

- Reason: Checked prepare succeeded, but Board and human-readable current-state narratives still display UNDER_REVIEW; reopen only to synchronize those status surfaces.
- Next step: Synchronize active-task narrative, PROJECT/STATE current focus, TASKS/BOARD, activity and planner worklog, rerun governance checks, then checked prepare-awaiting-user again.

## Recovery Entry 2026-07-30T10:22:07Z

- Reason: Strict project audit found VERIFY_EVIDENCE_MISSING because the active Validation Evidence section lacked the literal evidence marker required by the audit parser.
- Next step: Add one explicit evidence marker to the existing PASS validation section, update the final-validation audit narrative, rerun all governance checks, then checked prepare-awaiting-user again.

## Recovery Entry 2026-07-30T10:23:01Z

- Reason: Strict audit parser treats underscore as a word character, so PASS_FOR did not satisfy the required standalone PASS token even after the Evidence marker was added.
- Next step: Change the existing validation label to literal Evidence: PASS, rerun strict audit and all governance gates, then checked prepare-awaiting-user.

## Recovery Entry 2026-07-30T10:23:51Z

- Reason: Final strict audit has zero HIGH findings; reopen only to persist that final audit result and replace stale NEEDS_REVISION narrative before the final checked prepare.
- Next step: Write final no-HIGH audit evidence and AWAITING_USER narrative, run checked prepare-awaiting-user once, then perform read-only final audit and stop.
