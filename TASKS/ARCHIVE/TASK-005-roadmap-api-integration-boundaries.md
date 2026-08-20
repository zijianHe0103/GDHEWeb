# TASK-005 更新实施路线图并制定英语版 API/DTO/Fixture 与前端接入任务边界
accepted_at: 2026-07-23T05:47:23Z

task_id: TASK-005
status: CLOSED
owner_lane: planner
assigned_lanes: [wordpress_cms, frontend]
review_lane: adversarial_reviewer
linked_issues: []
artifacts_dir: TASKS/ARTIFACTS/TASK-005
acceptance_state: ACCEPTED
recovery_recorded_at: 2026-07-23T05:42:43Z
git_status: PUSHED
document_impact: RESOLVED
project_type: software

## 原始请求

> TASK-005：更新实施路线图，并制定英语版 API/DTO/Fixture 与前端接入任务边界

## 结构化理解

- 本任务是规划与架构边界任务，不是 API、WordPress 或 Next.js 功能实施任务。
- 更新现有 Headless WordPress + Next.js 架构契约中的实施路线，使 TASK-003、TASK-004 的完成状态和后续顺序与现场一致。
- 把“英语版 API/DTO/Fixture 实施”和“Next.js 前端 CMS 接入”定义为两个可独立确认、实施、验证和回退的后续任务，消除当前路线图中的颗粒度歧义。
- 保持一个实施路线权威来源；不为了形式整齐再复制一份相互竞争的总路线图。

## 目标

- 将 `docs/architecture/headless-wordpress-nextjs-contract.md` 第 14 节更新为当前真实进度和后续阶段顺序。
- 明确英语版 API/DTO/Fixture 后续任务的输入、输出、数据所有权、端点、Fixture、契约测试、安全门和完成定义。
- 明确 Next.js 前端接入后续任务的输入、输出、server-only 数据访问层、类型/校验、路由消费、错误状态、缓存边界和端到端完成定义。
- 明确两个后续任务的依赖方向、交接物和禁止交叉实施范围。
- 明确全局壳层、首页批次、页面模板、英语 SEO/询盘、三个月后多语言和最终 QA 的后续顺序。

## 非目标

- 不修改 WordPress、数据库、内容、用户、插件状态或 SCF 字段。
- 不实现新 REST 端点、完整 DTO、route resolution、Fixture 数据或 contract test。
- 不修改 Next.js 运行时代码、环境变量、依赖、路由、页面或组件。
- 不开发 Header、Mega Menu、Footer、首页、正式视觉系统或响应式页面。
- 不安装 WPML、ACFML、WPGraphQL、Yoast 或其他插件；不建立任何非英语入口。
- 不实现 Preview、Webhook、缓存失效、SEO 输出、询盘、文件上传、部署或生产配置。
- 不创建 PR，不合并，不部署。

## 交付物

- 更新后的 `docs/architecture/headless-wordpress-nextjs-contract.md` 第 14 节，并同步必要的交叉引用。
- `TASKS/ARTIFACTS/TASK-005/API_DTO_FIXTURE_BOUNDARY.md`：WordPress/API 侧边界分析。
- `TASKS/ARTIFACTS/TASK-005/FRONTEND_INTEGRATION_BOUNDARY.md`：Next.js 接入侧边界分析。
- `TASKS/ARTIFACTS/TASK-005/ROADMAP_AND_BOUNDARY_SYNTHESIS.md`：planner 统一后的阶段图、依赖和验收门。
- 标准 execution、validation、diff summary、planner summary 与 adversarial review 证据。

## 必须冻结的边界

### 后续任务 A：英语版 API/DTO/Fixture 实施

- WordPress/GDHE 插件拥有原始内容到公开 DTO 的归一化、版本控制和发布可见性。
- 完成稳定 page DTO、module instance ID、module schema version 和结构化 `data_table`。
- 定义并验证 route resolution、collection、navigation 和代表页面读取所需的最小端点；不得为推测性需求批量新增端点。
- 代表 Fixture 至少覆盖首页、Service 详情、Case Study 详情和 Material 详情，以及 publish/draft/private/404/非法引用等负例。
- 建立 REST contract tests、Schema 兼容规则、错误模型和 Fixture 清理证明。
- 不修改 Next.js 页面、组件或正式视觉；可提供机器可读样例，但不把前端渲染伪装成该任务完成条件。

### 后续任务 B：Next.js 英语版 CMS 接入

- 只消费任务 A 已冻结并验证的公开 DTO，不直接依赖 WordPress Core、SCF 或插件原始响应形状。
- 建立 server-only CMS client/adapter、TypeScript 判别联合、运行时校验和明确的 timeout/error/not-found 行为。
- 通过最小技术性集成入口证明“WordPress 发布内容到 Next.js 服务端读取并渲染”；不提前实现正式首页或视觉模块。
- 明确请求去重、缓存标签和未来 Preview/Webhook 接口位，但 Preview、Webhook 和生产缓存失效仍由后续独立任务实施，除非需求确认时另有明确裁决。
- 不从浏览器暴露 WordPress 管理凭据、Application Password、preview secret 或后台 cookie；公开前端不写 WordPress 内容。

### 交接门

- 后续任务 B 不得在任务 A 的 DTO、模块 ID/version、结构化表格和 contract tests 通过审查前开始正式消费。
- 任务 A 的 WordPress 原始字段变化不得泄漏到页面组件；任务 B 只依赖版本化 DTO。
- 任一 Schema 破坏性变化必须先提供兼容/迁移策略，再更新前端消费者。
- 两个任务都保持英语唯一 locale `en`；九语言、hreflang 和 RTL 继续受 ADR-005 的三个月延后决策约束。

## 验收标准

- 路线图明确标记 TASK-003、TASK-004 已完成并推送，不再保留“TASK-004 待验收”等过期叙述。
- 路线图把 API/DTO/Fixture 与前端接入拆为两个独立后续阶段，并显示依赖、输入、输出、完成门和非目标。
- API 边界覆盖 DTO/version、模块 ID/version、结构化 `data_table`、端点最小化、四类代表 Fixture、正负契约测试、发布可见性和清理。
- 前端边界覆盖 server-only adapter、类型/运行时校验、技术性端到端证明、错误/404、秘密隔离及缓存/预览/Webhook 延后边界。
- 仍采用 REST-first；只有现有契约中的可测触发条件满足时，才启动 WPGraphQL PoC 和新 ADR。
- 英语 SEO 与未来九语言实施顺序分开；WPML/ACFML 仍在生产英语站稳定监控三个月后单独 PoC。
- 文档之间不存在相互矛盾的当前状态、任务编号或“已实现”声明。
- 没有 WordPress、数据库、插件运行态或 `frontend/` 产品代码变化。
- execution/validation/diff summary、独立 adversarial review 和 planner final summary 齐全；review 为 PASS 且 P0/P1/P2 为 0 后才进入用户验收。

## 允许修改范围

- `docs/architecture/headless-wordpress-nextjs-contract.md`
- `PROJECT/MANIFEST.md`（仅在权威来源映射确需同步时）
- `PROJECT/STATE.md`
- `PROJECT/ACTIVITY.md`
- `TASKS/BOARD.md`
- `TASKS/ACTIVE/TASK-005-roadmap-api-integration-boundaries.md`
- `TASKS/ARTIFACTS/TASK-005/**`
- `TASKS/ARCHIVE/INDEX.md`
- `TASKS/ARCHIVE/TASK-004-english-wordpress-cms-scf-rest-foundation.md`
- `MEMORY/DECISIONS.md`（仅同步 ADR-005 已接受索引）
- `MEMORY/DECISIONS/ADR-004-headless-wordpress-nextjs-contract.md`（仅同步 ADR-005 amendment 接受状态）
- `MEMORY/DECISIONS/ADR-005-english-first-scf-wpml-deferral.md`（仅同步已发生的 TASK-004 acceptance/commit/push 状态）
- `LANES/planner/**`
- `LANES/frontend/**`
- `LANES/wordpress_cms/**`
- `LANES/adversarial_reviewer/**`
- 本任务生成的受控 lane message 与 registry event

## 禁止修改范围

- `frontend/**`
- `cms/**`
- `.local/**`
- WordPress 数据库、用户、内容、插件、主题和运行配置
- TASK-001～TASK-004 的业务交付物和审查结论；TASK-004 只允许完成推送后的归档状态同步
- 上述三份 decision 文件中的决策内容；本轮只允许把已发生的 TASK-004 acceptance/commit/push 元数据从待验收同步为已接受
- 任何生产、托管、DNS、邮件、CRM 或第三方外部状态

## 约束

- 当前架构事实源仍是已接受的 Headless WordPress + Next.js 契约与 ADR；RapidDirect 分析文档第 12～15 节的 Elementor 路线不得重新成为默认。
- 路线图只描述已验证现场和明确的未来门；不能把契约设计写成已实现能力。
- 避免建立重复路线图权威；如新增摘要，只能引用现有架构契约，不得复制完整内容。
- 不冻结尚未确认的生产域名、托管商、CRM、对象存储或付费插件采购。
- 当前只启用英语；多语言不是本任务的运行时工作。

## 假设和待确认事项

- 默认把“API/DTO/Fixture 实施”和“Next.js CMS 接入”拆成两个后续任务，而不是在 TASK-005 中实现。
- 后续任务编号在路线图中可标为“下一候选”而不是提前制造已创建任务；只有用户创建后才成为正式 TASK。
- Preview bridge、Webhook 和生产缓存失效默认位于前端接入之后的独立任务，除非边界研究证明必须作为最小端到端验收前置。

## 验证计划

- 对照 `PROJECT/STATE.md`、`TASKS/BOARD.md`、TASK-003/004 归档和 Git SHA 检查路线图进度。
- 对照 TASK-002 架构契约、ADR-004、ADR-005、TASK-004 final review 与 CMS REST contract 检查边界一致性。
- 由 `wordpress_cms` 和 `frontend` lane 分别产出独立边界证据，planner 只在两者交接处做综合裁决。
- 搜索过期状态、重复权威、Elementor 默认路线、未实现能力当前式表述和跨任务越界。
- 运行 Markdown/链接/格式检查、`git diff --check`、治理 validate、strict lane audit 和 Git scope 检查。
- adversarial reviewer 独立挑战任务拆分是否遗漏 route resolution、DTO 版本、Fixture 负例、秘密边界、缓存/Preview/Webhook 门或多语言延后。

## 文档影响

`RESOLVED`：本任务本身就是文档与架构边界更新；所有受影响的权威路线和交叉引用必须在验收前同步。

## 分支和 Worktree

- 分支：`codex/TASK-005-roadmap-api-integration-boundaries`
- Worktree：当前工作区

## 当前状态

`AWAITING_USER`

用户已正式验收 TASK-005；正式提交 `c9cbf1306d8a142eed43f5cfd24fcb7ec21d25a9` 已推送到 `origin/codex/TASK-005-roadmap-api-integration-boundaries`。尚未 merge。

## 恢复入口

先读 `AGENTS.md`、`PROJECT/COORDINATION.md`、`PROJECT/AGENT_LANES.md`、`LANES/registry/lanes.json`、本任务文件，再读 `PROJECT/STATE.md`、`TASKS/BOARD.md`、`docs/architecture/headless-wordpress-nextjs-contract.md` 第 14 节、ADR-004、ADR-005 和 TASK-004 final review。

## 下一步

TASK-005 已完成验收、正式提交和推送。等待用户创建下一任务或明确 merge 指令；不得自动实施 Task A/Task B 或 merge。

## Lane Plan

| lane | responsibility | write_scope | expected_artifacts | status |
|---|---|---|---|---|
| planner | 任务拆分、权威路线综合、状态同步与最终汇报 | `PROJECT/**`、`TASKS/**`、`docs/architecture/**`、`LANES/planner/**`，以及本任务明确列出的三份 decision 状态文件 | roadmap/boundary synthesis、validation、planner summary | accepted and pushed; awaiting next user instruction |
| wordpress_cms | 只读复核 CMS/API 现场，定义 DTO/Fixture 后续实施边界 | `TASKS/ARTIFACTS/TASK-005/**`、`LANES/wordpress_cms/**` | `API_DTO_FIXTURE_BOUNDARY.md` | execution complete; response acknowledged |
| frontend | 只读复核 Next.js 现场，定义 server-only 接入后续实施边界 | `TASKS/ARTIFACTS/TASK-005/**`、`LANES/frontend/**` | `FRONTEND_INTEGRATION_BOUNDARY.md` | execution and P2 reference correction complete; responses acknowledged |
| adversarial_reviewer | 独立只读审查路线、拆分、遗漏和越界 | `TASKS/ARTIFACTS/TASK-005/ADVERSARIAL_REVIEW_REPORT.md`、`LANES/adversarial_reviewer/**` | PASS/FAIL/BLOCKED review | closure PASS; P0=0, P1=0, P2=0; response acknowledged |

## Messages

- `MSG-TASK-005-WORDPRESS-API-DTO-FIXTURE-BOUNDARY`：已排队并唤醒注册的 `wordpress_cms` 会话。
- `MSG-TASK-005-FRONTEND-CMS-INTEGRATION-BOUNDARY`：dry-run 已解析到注册的 `frontend` 会话并已唤醒。
- 两个 execution response 均已确认；frontend 首版证据的四个错误引用已通过 `MSG-TASK-005-FRONTEND-EVIDENCE-REFERENCE-CORRECTION` 受控修正并确认回执。
- `MSG-TASK-005-WORDPRESS-CMS-STOP-RECOVERY` 与 `MSG-TASK-005-FRONTEND-STOP-RECOVERY` 已确认，恢复入口记录在本任务与 `PROJECT/STATE.md`。
- `MSG-TASK-005-ADVERSARIAL-REVIEW-R1`：dry-run 已解析到注册 reviewer session `019f88d0-018d-75e2-8e28-54a904a6bf8c` 并已唤醒。
- `MSG-TASK-005-ADVERSARIAL-REVIEW-R1-RESPONSE`：已确认；verdict `FAIL`，P0=0、P1=0、P2=1。
- `MSG-TASK-005-ADVERSARIAL-REVIEW-R1-STOP-RECOVERY`：已确认；planner 已记录受控修订入口。
- `MSG-TASK-005-ADVERSARIAL-REVIEW-R2`：dry-run 已解析到同一注册 reviewer session 并已唤醒。
- `MSG-TASK-005-ADVERSARIAL-REVIEW-R2-RESPONSE` 与 stop-recovery：已确认；final `FAIL`，P0=0、P1=0、P2=1。
- `MSG-TASK-005-ADVERSARIAL-CLOSURE-REVIEW`：用户明确授权后创建；dry-run 已解析到同一注册 reviewer session 并已唤醒。
- `MSG-TASK-005-ADVERSARIAL-CLOSURE-REVIEW-RESPONSE` 与 stop-recovery：已确认；`PASS`，P0=0、P1=0、P2=0。

## 执行记录

- 2026-07-23T04:26:20Z：用户请求创建 TASK-005；planner 仅建立分支、归档上一已接受并推送任务、创建需求卡和同步治理状态，未开始路线图或产品实施。
- 2026-07-23T04:32:27Z：收到精确口令 `确认 TASK-005 需求并开始执行`；任务范围冻结并转为 `READY`，尚未派发或修改交付物。
- 2026-07-23T04:34:01Z：两个 execution request 已创建并派发到独立会话；任务转为 `IN_PROGRESS`。
- 2026-07-23T04:43:16Z：两个专业边界 artifact、execution response 和 frontend P2 引用修正均完成；stop-recovery handoff 已确认，planner 综合路线图处理中。
- 2026-07-23T04:45:59Z：planner 综合与 fresh validation 完成，任务转为 `UNDER_REVIEW` 并派发独立 adversarial review Round 1。
- 2026-07-23T04:51:57Z：Round 1 response 与 stop-recovery 已确认；单一 P2 成立。`task_transition.py reopen` 因 source state 为 `UNDER_REVIEW` 而安全拒绝，planner 未伪造 `AWAITING_USER`，同步真实状态为 `NEEDS_REVISION` 并限定三份 decision 文件只做 acceptance metadata 修订。
- 2026-07-23T04:56:09Z：窄状态修订、A1/A2 路线补充和可复现 exact-file stale scan 全部通过；任务转回 `UNDER_REVIEW` 并派发 Round 2。
- 2026-07-23T05:01:06Z：Round 2 final response 与 stop-recovery 已确认；reviewer 在 scan set 中复现两处漏网 current-state wording。任务恢复为 `NEEDS_REVISION`，只修这两处；两轮上限已用完。
- 2026-07-23T05:33:16Z：用户授权一次额外独立 closure review；严格 stale scan、governance、scope、message queue 与 diff preflight 通过，任务转为 `UNDER_REVIEW` 并派发单轮 closure request。
- 2026-07-23T05:39:49Z：closure review response 与 stop-recovery 已确认；canonical verdict 为 `PASS`，P0/P1/P2 均为 0，planner final validation 开始。

## Recovery Entry 2026-07-23T04:43:16Z

- Reason: `wordpress_cms` 与 `frontend` 已完成只读边界分析，但其 lane scope 禁止写 planner 拥有的活动任务和项目状态；两者通过受控 stop-recovery message 交回恢复入口。
- Completed: 两份 artifact 已生成并验证；原始 execution response 已确认。frontend 证据中四个错误文件/章节引用已通过独立 P2 revision 修正，替代/修订回执均已确认。
- Boundary: 没有 WordPress、数据库、`cms/**`、`frontend/**` 产品代码或外部状态变更。
- Next step: planner 完成路线图和边界综合、execution/validation artifacts，再派发独立 adversarial review。

## Durable Task Artifacts

- `TASKS/ARTIFACTS/TASK-005/API_DTO_FIXTURE_BOUNDARY.md`
- `TASKS/ARTIFACTS/TASK-005/FRONTEND_INTEGRATION_BOUNDARY.md`
- `TASKS/ARTIFACTS/TASK-005/ROADMAP_AND_BOUNDARY_SYNTHESIS.md`

## Adversarial Review

- Round 1：`FAIL`，P0=0、P1=0、P2=1。技术边界全部通过；P2 为 current-state/decision metadata 未同步以及 stale-status scan 的错误 PASS 声称。
- Round 2：final `FAIL`，P0=0、P1=0、P2=1。ADR/A1-A2/零产品范围通过；两处 stale wording 未闭环。
- User-authorized closure：`PASS`，P0=0、P1=0、P2=0。两处 current-state defect 已闭环；历史 FAIL 保留。

## Validation Evidence

- intake 前 TASK-004 正式提交 `8f8ce2121916e4c764af86aaa04e2a9b83da2a28` 已推送，local/remote divergence 为 `0/0`；无 pending/blocked/failed lane message、无活动 issue、非 detached HEAD。
- intake 仅改变治理文件和任务分支；没有 `frontend/**`、`cms/**`、数据库或外部状态变更。
- 2026-07-23T04:45:59Z 的首次 stale-status scan 覆盖不完整；Round 1 复现了其遗漏。该 PASS 声称已撤回，修订后必须使用明确列出的 current-state 文件集合重新验证。
- 2026-07-23T05:41:42Z closure PASS 后 fresh final validation 全部通过：governance valid、strict lane audit 零问题、messages/JSON/open queue、canonical PASS counts、三处状态一致、expanded stale scan、A1/A2 gate、九份 artifacts、zero product/runtime diff、whitespace、branch 与 HEAD 均验证通过。

## Recovery Entry 2026-07-23T04:51:57Z

- Reason: Round 1 `FAIL` 的唯一 P2 发现已接受的 TASK-004 与决策索引、ADR amendment、项目/任务当前叙述未同步，且首次 stale-status scan 错误报告 PASS。
- Authorization boundary: TASK-005 的明确验收标准要求文档间无相互矛盾的当前状态；本恢复入口只把三份明确 decision 文件扩展为状态元数据同步范围，不改变 TASK-004 已接受的业务决策。
- Completed: review response 和 reviewer stop-recovery 均已确认；技术范围无需返工；A1/A2 分批建议已纳入路线综合，但 A2 final gate 仍是 Task B 的唯一消费前置。
- Next step: 完成状态修订，重跑可复现 stale-status/scope/governance checks，然后请求 Round 2。

## Recovery Entry 2026-07-23T05:01:06Z

- Reason: Round 2 final review 复现 `PROJECT/STATE.md` 未解决问题中的旧进行时叙述和架构契约顶部待验收 authority metadata。
- Passed: 技术路线、ADR metadata 修订、A1/A2 final gate、product/runtime zero-change 和治理范围均通过。
- Boundary: 只修 reviewer 指明的两处 current-state wording 和对应 validation truthfulness；不改变决策、不实施 Task A/B。
- Review gate: `max_rounds: 2` 已用完，当前仍无 PASS；planner 不自行创建第三轮、修改验收标准或把自身验证当作独立审查。
- Next step: fresh validate 两处修正，并等待用户决定是否授权一次额外的独立 closure review。

## User-authorized closure review 2026-07-23T05:33:16Z

- Authorization: 用户精确输入 `授权 TASK-005 进行一次额外独立 closure review`。
- Scope: 只复核 Round 2 两处 current-state 修正、A1/A2 final gate、已接受决策不变和零产品/runtime diff。
- Preflight: expanded stale-pattern scan、governance validate、strict lane audit、controlled messages、zero product scope、empty TASK-005 queue/blocked/failed 和 `git diff --check` 均通过。
- Boundary: 该授权只增加一次独立审查，不授权 Task A/B 实施、用户验收、commit、push、merge 或 close。
- Next step: 等待 closure review response。

## Closure PASS recovery 2026-07-23T05:39:49Z

- Response: closure review response 与 reviewer stop-recovery 均已确认。
- Verdict: canonical `PASS`，P0=0、P1=0、P2=0；Round 1 与 Round 2 FAIL 历史仍完整保留。
- Verified by reviewer: expanded current-state scan、task/project/board consistency、accepted decision unchanged、A1/A2 final gate、zero product/runtime diff、governance/messages/diff 均通过。
- Boundary: PASS 不是用户验收，不授权 Task A/B、commit、push、merge、accept 或 close。
- Next step: planner fresh final validation、最终摘要与 checked `prepare-awaiting-user`。

## Final validation recovery 2026-07-23T05:41:42Z

- Result: PASS；最终验证结论、stale-status finding 与 closure 由本任务记录和 canonical `ADVERSARIAL_REVIEW_REPORT.md` 保存。
- Artifacts: execution、validation、diff、synthesis、两份 specialist boundary、revision history、canonical closure PASS review 与 Planner Summary 齐全。
- Document impact: `RESOLVED`。
- Boundary: 尚未用户验收、commit、push、merge、close，也未实施 Task A/B。
- Next step: checked `task_transition.py prepare-awaiting-user`。

## Checked preparation narrative sync 2026-07-23T05:42:43Z

- First prepare: `task_transition.py prepare-awaiting-user` 于 2026-07-23T05:42:26Z 成功验证 artifacts 并进入 `AWAITING_USER`。
- Controlled reopen: 只为同步活动任务正文、项目叙述、看板和 helper 生成的行尾空格，受控回到 `NEEDS_REVISION`；没有改变交付物、PASS verdict 或验证结论。
- Boundary: 未用户验收，未实施 Task A/B，未 commit、push、merge 或 close。
- Next step: final fresh validation 后再次运行 checked `prepare-awaiting-user`，然后停止等待正式验收口令。

## User Acceptance

- 2026-07-23T05:47:23Z：用户使用精确口令 `确认 TASK-005 完成并生成正式提交` 正式验收，并仅授权本地正式提交；未授权 push、merge 或后续产品任务。

## Formal Commit

- 2026-07-23T05:49:21Z：提交前 governance、strict lane audit、messages/JSON、canonical PASS、acceptance state、staged scope、secret、forbidden paths、whitespace 与 `git diff --cached --check` 全部通过。
- TASK-005 单一正式提交已生成；当前只等待独立 `推送 TASK-005` 授权。

## Push

- 2026-07-23T05:53:06Z：正式提交 `c9cbf1306d8a142eed43f5cfd24fcb7ec21d25a9` 已推送到 `origin/codex/TASK-005-roadmap-api-integration-boundaries`。
- 本地 HEAD 与 remote-tracking SHA 一致，divergence 为 `0/0`。
- 未 merge、未创建 PR、未实施 Task A/B。

## Recovery Entry 2026-07-23T05:42:43Z

- Reason: Synchronize human-readable active-task, board and project handoff narrative after the successful checked prepare; remove helper-generated trailing whitespace
- Next step: Update only the final handoff narrative, rerun fresh validation, then run prepare-awaiting-user again
