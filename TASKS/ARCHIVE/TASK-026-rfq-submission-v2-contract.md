# TASK-026 建立基于 Quote Basket 3.0 与 Article Number 的 RFQ Submission 2.0 合同
accepted_at: 2026-08-12T03:52:49Z

task_id: TASK-026
legacy_closed_at_source: legacy_task_state
legacy_task_branch: codex/TASK-026-rfq-submission-v2-contract
legacy_delivery_commit: ae59adcbcc3d61996ec7727d0746026b04af9d61
delivery_profile: REMOTE_LEGACY
status: CLOSED
owner_lane: planner
assigned_lanes: [executor]
review_lane: adversarial_reviewer
linked_issues: []
artifacts_dir: TASKS/ARTIFACTS/TASK-026
acceptance_state: ACCEPTED
recovery_recorded_at: 2026-08-12T03:50:46Z
git_status: MERGED
closed_at: 2026-08-12T04:00:42Z
document_impact: RESOLVED
readme_impact: NOT_APPLICABLE
project_type: software

## 原始请求

> 创建 TASK-026：建立基于 Quote Basket 3.0 与 Article Number 的 RFQ Submission 2.0 合同。

## 结构化理解

本任务承接已交付的 TASK-024 和 TASK-025：TASK-024 已冻结客户联系字段、Next.js-only 服务端边界、安全/幂等/回执/保留语义；TASK-025 已冻结 Article Number “可进入浏览器但不主动展示”的新规则，并交付 Quote Basket `3.0.0` 和 `1..50` 行混合批量权威校验。

本任务只建立 additive RFQ Submission `2.0.0` 机器合同、字段映射和固定向量。它不原地修改 TASK-024 的 `1.0.0` 历史字节，不实现客户表单、Next.js Route Handler、持久幂等状态、真实提交、飞书写入或部署。

## 目标

- 建立基于 Quote Basket `3.0.0` 的 Public RFQ Submission `2.0.0` 闭合机器合同。
- 允许标准配置产品和可直接询价目录配件提交 Article Number；Article Number 仍是不可信客户输入，必须经 TASK-025 混合批量权威校验。
- 保留自定义长度的 `articleNumber: null` 与 `sales_follow_up`，不猜测或伪造编号。
- 复用 TASK-024 已确认的客户联系字段、隐私告知、同源边界、幂等、限流、challenge、失败原子性、回执和保留语义，不重新询问已关闭的业务决策。
- 为后续 TASK-027 的本地可见表单和 Next.js intake 提供唯一、可验证的输入/输出边界。

## 非目标

- 不实现 `/request-a-quote/` 客户信息表单、提交按钮、成功/失败界面或 Basket 清空。
- 不实现 Next.js Route Handler、持久存储、队列、后台作业、邮件或通知。
- 不读取、创建或修改真实飞书 Base/table/field/record，不配置飞书凭据。
- 不修改 WordPress API、数据库、真实产品、Quote Basket `3.0.0` 或 TASK-025 批量校验运行时。
- 不原地改写 TASK-024 的 Submission `1.0.0` Schema、样本、HMAC 向量或审查历史。
- 不安装依赖、引入 NestJS、开放生产路由、部署、提交、推送或合并。

## 交付物

- `TASKS/ARTIFACTS/TASK-026/REQUIREMENTS.md`：2.0 继承规则、Article Number 边界、非目标和后续实施门。
- `TASKS/ARTIFACTS/TASK-026/RFQ_SUBMISSION_V2_CONTRACT.md`：公开请求、服务端权威文档、公开回执/错误的字段字典和跨字段规则。
- `TASKS/ARTIFACTS/TASK-026/BASKET_V3_TO_SUBMISSION_V2_MAPPING.md`：Quote Basket `3.0.0` 到 Submission `2.0.0` 的确定性投影，明示排除展示专用字段。
- `TASKS/ARTIFACTS/TASK-026/SECURITY_AND_IDEMPOTENCY_INHERITANCE.md`：TASK-024 哪些规则原样继承，哪些因 Article Number 和 v2 canonical bytes/HMAC 必须新增固定向量。
- `TASKS/ARTIFACTS/TASK-026/schemas/**`：闭合 Draft 2020-12 Schema，不依赖远程 ref。
- `TASKS/ARTIFACTS/TASK-026/samples/**` 和 `vectors/**`：正向、负向、canonical serialization、HMAC/摘要、Basket 快照清除的确定性样本。
- `EXECUTION_REPORT.md`、`TEST_OR_VALIDATION_LOG.md`、`DIFF_OR_OUTPUT_SUMMARY.md` 与一次完整独立 `ADVERSARIAL_REVIEW_REPORT.md`。
- 必要的架构契约和 ADR/decision 更新；不改运行时 README 描述。

## 验收标准

- Submission `2.0.0` 是 additive 新版本；TASK-024 `1.0.0` 历史字节和 TASK-025 已冻结合同保持不变。
- 公开请求每行只允许冻结的 `configured_product | catalog_accessory` 联合，总行数为 `1..50`，保持 Basket 顺序。
- 标准配置产品和目录配件必须提交格式有效的 Article Number；自定义长度必须提交 `articleNumber: null` 和 `sales_follow_up`。
- 公开 Article Number 不被当作 secret，但服务端必须通过 TASK-025 的一次混合批量边界重新验证；不允许客户值直接进入权威询价文档。
- 公开投影排除图片/Alt/尺寸、产品名称/型号等展示提示、内部 UUID、WordPress/飞书 ID、价格、库存、成本、供应商和 secret。
- 客户联系字段、至少一种联系方式、国家/城市、Message、隐私告知和字节上限必须与 TASK-024 已确认决策一致，不自行新增字段。
- 同一 Basket 完整 merge identity 和 `entryId` 不得重复；数量必须符合 Quote Basket `3.0.0` 边界；任一行无效则整单失败。
- 请求体、客户字段、询价行、回执和错误均是闭合对象；未知字段、跨域 field-error 配对、违法状态组合和不安全数值必须 fail closed。
- 重新生成 v2 RFC 8785 canonical bytes、版本化 secret-key HMAC/摘要和精确比较 token 固定向量；不复用 v1 digest 假装兼容。
- 已确认的重放优先级、首次成功保留的 `2592000000 ms` 锚点、不延长重放、过期后不重发、事前拒绝零业务状态和精确 Basket 快照清除规则均通过机器向量复现。
- 全部 Schema 严格编译，local refs 闭合，正/负向样本和跨字段语义校验通过；错误不包含原始联系方式、Article Number 清单或内部诊断。
- 完成一次完整独立审核；若存在真实 finding，修复后只做该 finding 的窄关闭确认，不重复完整审核。

## 允许修改范围

- `TASKS/ARTIFACTS/TASK-026/**`
- `docs/architecture/headless-wordpress-nextjs-contract.md`
- 本任务直接需要的 `MEMORY/DECISIONS/**` 与 `MEMORY/DECISIONS.md`
- Planner 管理的 `PROJECT/**`、`TASKS/**`、`LANES/**`

## 禁止修改范围

- `frontend/src/**`、`frontend/tests/**`、`frontend/package.json`、lockfile 和任何前端运行时/路由/UI
- `cms/**`、WordPress Core、SCF、数据库、上传和真实业务记录
- TASK-024/025 已冻结 Schema、样本、证据、保护字节与审查历史
- 真实飞书工作区、Base/table/field/record、凭据和工作流
- `.env*`、secret store、部署配置、生产域名、CDN、WAF 和外部 SaaS
- 用户自有 `.codex/config.toml`、pre-existing `frontend/tsconfig.json`、TASK-021～025 post-delivery closure edits 与历史 resume packets

## 约束

- 官网是 B2B 询价站；不引入价格、付款、订单、Checkout 或库存预留语义。
- 公开浏览器未来只调用同源 Next.js intake；不直接调用 WordPress 批量端点或飞书。
- Article Number 是公开、非敏感但不可信的订购身份；“允许提交”不等于“免验证”。
- 机器合同使用 TypeScript/Node 支持的 Draft 2020-12 JSON Schema、闭合 local refs 和确定性序列化/固定向量，不引入生产 secret。
- TASK-024 已确认的字段和安全决策默认继承；只有与 Basket 3.0/Article Number 投影直接冲突的部分才能以 v2 明示取代。
- 本任务只交付合同，不把 Schema PASS 声称为表单、API、持久化或飞书可用。

## 假设和待确认事项

- 默认继承 TASK-024 已经用户确认的 16 项客户字段与安全决策，不重新逐项询问。
- 当前任务的唯一业务变更是：Submission v2 允许 Article Number 进入不可信公开请求，并使用 TASK-025 mixed batch 作为权威重新校验入口。
- 后续 TASK-027 才实现客户表单、同源 Route Handler 和本地测试接收器；TASK-028 再单独处理真实飞书映射/写入。

## 验证计划

1. 冻结 TASK-024/025、Quote Basket `3.0.0`、MixedQuoteLineValidation `1.0.0`、package/lock 和用户改动哈希。
2. 以 strict Draft 2020-12 validator 验证所有 Schema 及其闭合 local ref graph。
3. 建立标准配置产品、自定义长度、目录配件和混合 1/50 行正向样本。
4. 建立缺/多 Article Number、custom 伪造编号、重复 entry/merge identity、0/51 行、非法数量、多余字段、展示/内部字段泄漏和跨域状态矩阵负向样本。
5. 独立计算并复现 v2 RFC 8785 canonical bytes、HMAC/摘要、comparison token、幂等 TTL 和 Basket 快照清除向量。
6. 验证不修改 frontend/CMS 运行时、冻结合同、依赖、真实数据或外部系统。
7. 校验 Markdown/JSON、本地链接、保护哈希、`git diff --check` 与 DPG project/registry/messages/strict-lane 门。
8. 实施物合并后只做一次完整独立 adversarial review；若 FAIL，修复后只复核原 finding。

## 文档影响

本任务是新版本业务/机器合同交付。实施时必须更新架构契约和必要决策记录，完成后将 `document_impact` 改为 `RESOLVED`。

## README 影响

本任务不改变当前可运行功能；根 README 仍应说明最终 RFQ intake 未实现，`readme_impact` 保持 `NOT_APPLICABLE`。

## 分支和 Worktree

- 分支：`codex/TASK-026-rfq-submission-v2-contract`
- 基线：`main` / `origin/main` at `c642166c20b57735fe500608176de109163caf9a`
- Worktree：共享当前工作区；保留并排除用户自有配置、TASK-021～025 post-delivery closure edits 和历史 resume packets。

## 当前状态

`CLOSED / ACCEPTED / MERGED`。正式提交 `ae59adcbcc3d61996ec7727d0746026b04af9d61` 已推送至任务分支并快进合并、推送到远端 `main`；review、finding closure、fresh final validation 和文档影响均保持 PASS。未执行部署。

## 恢复入口

先读 `AGENTS.md`、`PROJECT/COORDINATION.md`、`PROJECT/AGENT_LANES.md`、`LANES/registry/lanes.json`、本任务文件，再读 TASK-024 的 `MACHINE_CONTRACT.md` / `RFQ_SUBMISSION_CONTRACT.md`、TASK-025 的 `REQUIREMENTS.md` / `DESIGN.md`、架构契约第 11/14 节和 ADR-006 当前 RFQ 决策。

## 下一步

TASK-026 已完成正式交付。下一步由用户决定是否创建独立的 Next.js RFQ intake、持久幂等与隔离 stub sink 实施任务；不得自动开始。

需求确认口令已于 `2026-08-12T02:41:20Z` 收到并完成状态转换：

```text
确认 TASK-026 需求并开始执行
```

当前不再等待需求确认；该历史口令不是系统 `PermissionRequest`，也不授权任务外的 runtime、外部系统或 Git 操作。

审查和验证完成后，使用 `task_transition.py prepare-awaiting-user` 进入验收等待；需要修订时使用 `task_transition.py reopen`。

正式交付只接受：

```text
确认 TASK-026 完成并提交到远端
```

## Lane Plan

| lane | responsibility | write_scope | expected_artifacts | status |
|---|---|---|---|---|
| planner | 冻结 v2 继承/取代规则、保护基线、顺序 checkpoint、文档影响和最终验证 | `PROJECT/**`, `TASKS/**`, `MEMORY/**`, `LANES/**`, 明确文档权限 | requirements、design/baseline、checkpoint、final validation | A0 + implementation checkpoint + docs PASS |
| executor | 在确认后以严格 TDD 创建闭合 Schema、字段映射、正/负样本、canonical/HMAC/快照固定向量和执行证据 | `TASKS/ARTIFACTS/TASK-026/**`, `LANES/executor/**` | machine contract、vectors、execution/validation/diff reports | bounded P1 revision response ACKed; Planner checkpoint PASS |
| adversarial_reviewer | 实施收敛后做一次完整独立审核，检查版本继承、Article Number 信任边界、Schema 闭合、向量和非实施语义 | reviewer 注册范围 | `ADVERSARIAL_REVIEW_REPORT.md` 和 PASS/FAIL/P0/P1/P2 | full review FAIL history preserved; bounded closure PASS 0/0/0 |

## Messages

- `MSG-TASK-026-RFQ-SUBMISSION-V2-CONTRACT-IMPLEMENTATION` — executor execution request，已 dispatch、ACK 并移入 done；等待 linked response。
- `MSG-TASK-026-RFQ-SUBMISSION-V2-CONTRACT-IMPLEMENTATION-RESPONSE` — executor execution response，已 validate、ACK 并移入 done；Planner checkpoint PASS。
- `MSG-TASK-026-ADVERSARIAL-REVIEW-R1` — 唯一一次完整独立 review request，已 dispatch、ACK 并移入 done；等待 linked verdict。
- `MSG-TASK-026-ADVERSARIAL-REVIEW-R1-RESPONSE` — 唯一完整审核 response，已 ACK/done；`FAIL / P0=0 / P1=2 / P2=0`。
- `MSG-TASK-026-ADVERSARIAL-P1-R1-REVISION` — 仅针对上述两项 P1 的 executor 修订请求，已 dispatch；等待 mutation 前 ACK 和 linked response。
- `MSG-TASK-026-ADVERSARIAL-P1-R1-REVISION-RESPONSE` — 两项 P1 窄修订 response，已 validate、ACK/done；Planner checkpoint PASS。
- `MSG-TASK-026-ADVERSARIAL-FINDING-CLOSURE` — 同一 reviewer 两项 finding 的窄关闭请求，已 dispatch；不是第二次完整审核。
- `MSG-TASK-026-ADVERSARIAL-FINDING-CLOSURE-RESPONSE` — 两项 finding closure response，已 validate、ACK/done；`PASS / P0=0 / P1=0 / P2=0`。
- `MSG-TASK-026-CLOSURE-REPORT-COMPATIBILITY` / `...-RESPONSE` — 仅补充 closure 区块的机器可读 `verdict: PASS`；均已 ACK/done，没有重新审核。

## 执行记录

- `2026-08-12T02:37:16Z`：用户创建 TASK-026；以已交付 `origin/main@c642166` 为基线创建任务分支，只登记 Submission `2.0.0` 合同、Article Number 边界、验收标准和 Lane Plan。未开始合同实施或外部操作。
- `2026-08-12T02:41:20Z`：用户精确输入 `确认 TASK-026 需求并开始执行`；任务从 `AWAITING_REQUIREMENT_CONFIRMATION` 进入 `READY`，仅放行 Planner A0。
- `2026-08-12T02:48:09Z`：Planner A0 PASS；冻结 67 个 TASK-024/025、frontend/CMS 与依赖权威文件，明确 Basket 3.0 到 Submission 2.0 的最小投影、单次 mixed batch 权威边界、五 Schema bundle、TDD/固定向量与回滚。任务进入 `IN_PROGRESS`。
- `2026-08-12T02:51:32Z`：实施请求已通过真实注册 executor 会话投递并在 mutation 前 ACK/done；当前等待其 artifact-only implementation response。
- `2026-08-12T03:08:12Z`：Executor response 已 ACK/done；Planner 独立复跑 `50/50` verifier、五 Schema/63 local refs、13 JSON、67/67 保护哈希、TASK-025 兼容和 DPG/diff 门均 PASS。架构契约、ADR-006 与 decisions index 已按 v2 artifact-only 事实窄同步，`document_impact=RESOLVED`。
- `2026-08-12T03:10:15Z`：唯一一次完整独立 review request 已创建，任务进入 `UNDER_REVIEW`；当前尚未产生 verdict，也未授权修复、验收、Git 或部署。
- `2026-08-12T03:11:38Z`：review request 已通过真实注册 reviewer 会话投递并在实质审查前 ACK/done；当前只等待一个 linked PASS/FAIL/P0/P1/P2 verdict。
- `2026-08-12T03:22:22Z`：review response 已 ACK/done；两项 P1 分别是 Basket/TASK-025→权威文档语义绑定不闭合，以及 RFC 8785/HMAC/comparison/replay 证据不具约束力。Checked reopen 因 helper 只接受 `AWAITING_USER` 而安全拒绝；等价 recovery 进入 `NEEDS_REVISION`，只允许两项 bounded artifact-only 修订与同一 reviewer finding closure。
- `2026-08-12T03:25:22Z`：两项 P1 的唯一 bounded revision request 已通过注册 executor thread bridge 派发；任务回到 `IN_PROGRESS`，当前只等待 ACK/response，禁止扩展范围或重复完整审核。
- `2026-08-12T03:38:00Z`：revision response 已 ACK/done；Planner 独立复现 verifier `94/94`、五 Schema/63 refs、20 JSON、67/67 保护哈希、独立 HMAC/authoritative binding、五 replay/30-day/zero-state/no-resend 与治理门全部 PASS。任务进入 `UNDER_REVIEW`，只等待同一 reviewer finding closure。
- `2026-08-12T03:38:10Z`：同一 reviewer finding-closure request 已通过真实注册 thread bridge 投递并 dispatch-once；当前只等待 linked verdict，不重新检查已通过范围。
- `2026-08-12T03:46:00Z`：closure response 已 ACK/done；同一 reviewer 独立攻击矩阵 `67/67` PASS。Planner 重新运行规范 verifier `94/94`、20 JSON、五 Schema 历史哈希、67/67 保护哈希、独立 HMAC/replay、零 generated residue/listener 与治理门，全部 PASS；只剩 checked acceptance preparation。
- `2026-08-12T03:49:58Z`：closure report 机器字段兼容修正 response 已 ACK/done；首次 checked `prepare-awaiting-user` PASS。
- `2026-08-12T03:50:46Z`：只因人类可读任务/项目/看板叙述仍停留在 pre-transition 状态，使用 checked `reopen` 做治理叙述同步；产品、合同、review、validation 与授权边界均未改变。
- `2026-08-12T03:52:49Z`：用户精确输入正式交付口令；`task_accept.py check` 与 `accept` 均 PASS，任务进入 `ACCEPTED / ACCEPTED / FORMAL_COMMIT_PENDING`。
- `2026-08-12T04:00:42Z`：正式提交 `ae59adcbcc3d61996ec7727d0746026b04af9d61` 已推送任务分支；本地和远端 `main` 均快进至同一提交并核验一致。任务收口为 `CLOSED / ACCEPTED / MERGED`，未部署。

## Execution Artifacts

- `REQUIREMENTS.md`
- `A0_DESIGN.md`
- `A0_PROTECTED_BASELINE.md`
- `A0_PROTECTED_CHECKSUMS.sha256`
- `A0_VALIDATION_LOG.md`
- `A0_CHECKPOINT.md`

## Adversarial Review

- 唯一完整审核：`FAIL / P0=0 / P1=2 / P2=0`，历史保留，不会被 closure 覆盖。
- P1-1：真实 Basket 3.0 ready/non-ready 投影和完整 TASK-025 response→authoritative binding 未封闭；configured-standard root/nested Article Number 可不一致。
- P1-2：authoritative digest 未绑定固定 HMAC，bad-token/replay 负例为空标签校验，canonicalizer/Schema 接受 RFC 8785 必须拒绝的 lone surrogate。
- 政策：修订后只由同一 reviewer 对这两个 finding 做窄关闭确认，不重复完整审核。
- finding closure：`PASS / P0=0 / P1=0 / P2=0`；独立攻击矩阵 `67/67`，只关闭原两项 P1，不替换完整审核历史。

## Validation Evidence

- A0: 67/67 protected checksums PASS; all paths unique regular non-symlink files.
- Protected TASK-024/025/frontend/CMS/dependency diff: zero.
- `git diff --check`, project, registry, messages and strict-lane audit: PASS.
- Executor/Planner checkpoint: verifier `50/50`（29 positive / 21 negative），五份 strict Draft 2020-12 Schema、63 个闭合本地 refs、TASK-025 request/response/order/authority compatibility 与 v2 crypto/snapshot vectors PASS。
- Bounded revision checkpoint: verifier `94/94`（47 positive / 47 negative）；20 JSON、37 artifact files、67/67 protected hashes、独立 HMAC/authoritative digest、五 replay tuples/effects、project/registry/messages/strict lane/diff 均 PASS。
- Final validation after closure ACK: normative `94/94`、closure attack matrix `67/67`、五 Schema pre-revision hashes、67/67 protected hashes、zero generated residue/listener、DPG/diff 全 PASS。

## Planner Final Summary

TASK-026 只建立了 additive RFQ Submission `2.0.0` 机器合同、Quote Basket 3.0 → submission 映射、TASK-025 一次 mixed-batch 权威绑定、客户/安全/幂等/回执继承和确定性 crypto/replay/snapshot 向量。Article Number 允许进入浏览器询价数据但仍视为不可信，标准产品/配件必须重新权威解析，自定义长度保持 `null / sales_follow_up`。本任务没有实现可见表单、提交接口、持久化或飞书写入。

## User Acceptance

用户已于 `2026-08-12T03:52:49Z` 输入并通过正式验收口令：

```text
确认 TASK-026 完成并提交到远端
```

正式提交 `ae59adcbcc3d61996ec7727d0746026b04af9d61` 已推送至 `origin/codex/TASK-026-rfq-submission-v2-contract` 和远端 `main`；任务现为 `CLOSED / MERGED`。未执行部署。

## Recovery Entry 2026-08-12T03:50:46Z

- Reason: Checked preparation succeeded, but human-readable current-state narration still described the pre-transition UNDER_REVIEW gate; reopen only to synchronize narration without changing product or evidence.
- Next step: Synchronize task, board, project and Planner narration to the already-passing closure/final-validation facts, rerun governance validation and checked prepare-awaiting-user.
