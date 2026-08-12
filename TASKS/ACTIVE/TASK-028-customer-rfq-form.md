# TASK-028 建立客户可见 RFQ 表单与本地提交闭环
accepted_at: 2026-08-12T12:29:13Z

task_id: TASK-028
status: AWAITING_USER
owner_lane: planner
assigned_lanes: [frontend, visual_qa]
review_lane: adversarial_reviewer
linked_issues: []
artifacts_dir: TASKS/ARTIFACTS/TASK-028
acceptance_state: ACCEPTED
git_status: FORMAL_COMMIT_PENDING
document_impact: RESOLVED
readme_impact: UPDATED
project_type: software

## 原始请求

> 创建 TASK-028：建立客户可见 RFQ 表单与本地提交闭环

用户同时确认：客户输入字段参考当前飞书 CRM 的“线索”结构，但已冻结的 RFQ Submission 合同优先；公司名称和城市仍为必填，WhatsApp、WeChat、Business Email、Phone 至少填写一种。`初步客户等级` 不由客户填写，未来进入 CRM 时保持空白，由业务员人工判断。

## 结构化理解

TASK-022 已交付浏览器本地 Quote Basket，TASK-025 已交付 Quote Basket `3.0.0` 与一次混合行权威校验，TASK-026 已交付 RFQ Submission `2.0.0` 机器合同，TASK-027 已交付仅本地、非生产、进程内 Stub 的 Next.js RFQ intake。

本任务只补齐客户能够在本地 `/request-a-quote/` 页面完成的可见闭环：查看 Basket、填写合同规定的客户字段、提交到 TASK-027 本地 intake、看到安全回执或错误，并仅在精确匹配的 `accepted` 回执后清空对应 Basket 快照。它不把 Stub 变成生产存储，不连接飞书，也不开放生产路由。

## 已确认客户字段

客户可见顺序与规则：

1. `Full Name`：必填，对应未来 CRM `联系人姓名`。
2. `Company Name`：必填，对应未来 CRM `公司名称`。
3. `Country/Region`：必填，对应未来 CRM `国家`。
4. `City`：必填，对应未来 CRM `城市`。
5. `WhatsApp`：选填。
6. `WeChat`：选填。
7. `Business Email`：选填。
8. `Phone`：选填。
9. 上述四种联系方式至少一种通过闭合校验。
10. `Company Website`：选填，不发起网络请求验证。
11. `Additional Requirements`：选填，对应未来 CRM `意向需求`；CRM `备注` 保留给内部人员。

不得让客户填写：来源渠道、首次接触时间、初步客户等级、负责人、分配市场、线索状态、查重结果、转换字段或任何内部 ID。未来飞书连接中，来源渠道由服务端写为待正式冻结的“官网询盘”，首次接触时间由服务端产生，初步客户等级保持空白。本任务不修改真实 CRM 字段或选项。

## 目标

1. 在现有本地 `/request-a-quote/` 页面加入合同一致、可访问的客户信息表单。
2. 从 Quote Basket `3.0.0` 和客户字段生成唯一、闭合的 `PublicRfqSubmissionDraft 2.0.0`；不得由浏览器伪造权威产品值、HMAC 或内部状态。
3. 建立仅本地模式可用的 server-owned submission intent/idempotency seam，使浏览器能够合法调用 TASK-027 intake，而不暴露 secret。
4. 对新合法提交只执行一次同源 RFQ intake POST；提交中阻止重复触发，重放与冲突遵循现有 v2 合同。
5. 呈现稳定的 loading、accepted、processing、field error、Basket refresh、conflict、rate/security 和 temporary-unavailable 状态，不泄漏原始异常或内部诊断。
6. 只有收到与当前提交 Basket snapshot 精确绑定的 `accepted` 回执后才清空对应 Basket；processing、失败、冲突、网络中断和快照已变化时都保留 Basket。
7. 保持本地 `noindex,nofollow` 和 production final 404；不部署。

## 非目标

- 不创建生产数据库、持久幂等仓库、队列、worker 或生产 secret 管理。
- 不写入飞书，不新增或修改 CRM 字段/选项/记录/Workflow，不发送邮件。
- 不采购或接入验证码、WAF、正式限流、可信代理或其他生产安全供应商。
- 不修改 WordPress/CMS、产品数据、Quote Basket `3.0.0`、TASK-025 mixed validation 或 TASK-026/027 冻结合同。
- 不显示价格、付款、订单、Checkout、Article Number、内部 UUID、WordPress/飞书 ID 或供应商信息。
- 不开放 production `/request-a-quote/` 或 `/api/rfq/intake/`，不部署。

## 交付物

1. `TASKS/ARTIFACTS/TASK-028/`：需求、设计、TDD seam、保护基线、执行、验证、视觉和审查证据。
2. 客户表单的 public projection、闭合客户端状态与安全 server-only 提交编排。
3. `/request-a-quote/` 的表单、提交状态、回执/错误和精确 Basket 清除行为。
4. 本地 intent/idempotency 发行 seam 与 TASK-027 intake 的真实同源集成测试。
5. 1440、1024、768、390 和 320 CSS px 的视觉/回流证据，以及键盘、焦点、错误关联、aria-live 和 reduced-motion 验证。
6. 根 README、frontend README 和架构契约的真实本地使用说明；不得描述为生产或飞书已接入。

## 验收标准

1. 空 Basket 不显示可提交表单；有 `requires_validation` 或 `requires_readd` 行时阻止提交并给出客户可理解的恢复入口。
2. 字段、必填性、至少一种联系方式、Unicode/长度、Email/Phone/WhatsApp/WeChat、绝对 HTTP(S) Website、Message 和未知字段规则与 RFQ Submission `2.0.0` 完全一致。
3. 客户页面和浏览器状态不包含客户等级、来源渠道选择、首次接触时间输入、内部 CRM 字段、secret、HMAC、比较 token 或权威服务端文档。
4. Article Number 可按既定合同存在于不可信请求数据中，但不得主动显示在可见文本、accessible name、错误、回执、摘要或日志。
5. 客户提交由服务端发行的本地 intent/idempotency 材料驱动；伪造、过期、重复或不匹配材料 fail closed。
6. 每次新意图仅一次同源 intake POST；无逐行 `/resolve`、Product Configuration、RelatedProductCard 或浏览器直连 WordPress/飞书。
7. 所有公开成功/错误响应先通过 v2 运行时验证和语义绑定，再进入 UI；不信任 TypeScript 类型或任意 JSON。
8. `accepted` 且当前完整 Basket 的六项 source snapshot 与回执及 snapshot token 精确匹配时才清空；Basket 在提交期间发生任何变化时保留整个当前 Basket，不做部分删除。
9. `processing`、网络失败、400/409/413/429/503、未知响应、取消和重复点击都保留 Basket，并提供稳定、可访问且不泄漏诊断的状态。
10. 表单具备正确 label、autocomplete/inputmode、字段级错误关联、错误摘要、焦点转移、键盘操作、aria-live、禁用态和重新提交行为。
11. 本地真实 HTTP 可证明成功、重放、冲突、验证失败和 Stub processing；production/unset/disabled 均 final 404 且零 intake/mixed/sink 调用。
12. 视觉在 1440/1024/768/390/320 下无横向溢出，Basket 条目、表单和回执层级清晰；不把本地测试状态伪装为正式上线。
13. 真实 CRM 只读核对结果仅作为未来映射依据；本任务对飞书零写入，`初步客户等级` 明确保持人工判断。
14. 聚焦测试、完整资源安全回归、合同 verifier、lint、typecheck、production build、production smoke、视觉 QA、保护哈希、generated/listener cleanup、`git diff --check` 和 DPG 门全部 PASS。
15. 只执行一次完整独立审核；如发现 finding，修复后只由同一 reviewer 做 bounded closure，不重复完整审核。

## 验证计划

- A0：冻结真实路径、表单字段、intent seam、保护基线、模式矩阵和分步 TDD 计划。
- A1：以 RED/GREEN 建立客户字段 public domain、闭合验证、规范化和安全错误映射。
- A2：以 RED/GREEN 建立 server-owned 本地 intent/idempotency 和 Public Draft 2.0 投影。
- A3：以 RED/GREEN 建立客户可见表单、提交状态与 TASK-027 一次同源 POST。
- A4：以 RED/GREEN 建立回执语义、精确 Basket snapshot 清除和错误/重试恢复。
- A5：完成真实本地 HTTP、生产 404、server-only、泄漏扫描、完整回归、视觉 QA 和文档。
- 收敛后只进行一次完整 `adversarial_reviewer` 审核；FAIL 后只修复并关闭原 finding。

## 文档影响

`RESOLVED`：根 README、frontend README 和架构契约已更新为真实的本地 RFQ 使用流程，并明确保留进程内非持久、production 404、无生产安全供应商、无飞书/CRM/邮件和未部署边界。

## 分支和 Worktree

- 分支：`codex/TASK-028-customer-rfq-form`
- 基线：`main` / `origin/main` at `8891df61759f377cc9e2f110ecb41aabb7cd15fb`
- Worktree：共享当前工作区；保留并排除 `.codex/config.toml`、pre-existing `frontend/tsconfig.json`、TASK-021～027 post-delivery closure edits 和历史 resume packets。

## 需求确认与 Checkpoints

- `2026-08-12T07:46:24Z`：用户精确输入 `确认 TASK-028 需求并开始执行`，任务从 `AWAITING_REQUIREMENT_CONFIRMATION` 进入 `READY`。
- `2026-08-12T07:50:55Z`：Planner A0 PASS；冻结客户字段、30 分钟本地 intent/key、Quote Basket 3.0 -> RFQ 2.0 投影、TASK-026 完整快照清除规则、模式矩阵、49-file 保护基线和 A1-A5 纵向 TDD 顺序。
- A0 验证：49/49 哈希、RFQ v2 verifier `20/5/63/94`、既有 `2 files / 10 tests`、lint、typecheck、generated/listener、diff 和 DPG 全 PASS。
- clear_rule: 如果提交期间 Basket 发生变化，则保留整个当前 Basket；不做部分行清除。
- `2026-08-12T08:08:58Z`：frontend A1 linked response 已 ACK/done；Planner 独立复现 `3 files / 15 tests`、RFQ v2 `20/5/63/94`、lint/typecheck、49/49 protected、generated/listener/diff/DPG PASS。客户 public domain、规范化、闭合字段错误与 hostile 输入边界通过；未产生 UI、intent、Basket 投影或提交调用。
- `2026-08-12T08:39:21Z`：frontend A2 linked response 已 ACK/done；Planner 独立复现 intent/Route/projection/builder/intake `5 files / 18 tests`、server-only `1/10`、RFQ v2 `20/5/63/94`、lint/typecheck、49/49 protected、generated/listener/diff/DPG PASS。本地 30 分钟 HMAC intent、Basket 3.0 -> RFQ 2.0 投影及 replay-before-intent 门通过；尚无可见表单或 Basket 清除。
- `2026-08-12T09:07:13Z`：frontend A3 linked response 已 ACK/done；Planner 检查四份执行证据并独立复现当前 RFQ + Basket route `20 files / 113 tests`、RFQ v2 `20/5/63/94`、lint/typecheck、49/49 protected、generated/diff/DPG PASS。可见十字段表单、一次 intent + 一次 intake、pending 抑制与闭合公开结果通过；accepted-local 仍保留 Basket，尚未实现 A4 清除或 retry/replay。
- `2026-08-12T09:42:06Z`：frontend A4 linked response 已 ACK/done；Planner 独立复现 A4 `5/31`、RFQ + Basket `36/189`、full `87/700`、十 verifier、lint/typecheck、`47 exact + 2 authorized` protected 与 generated/diff/DPG PASS。仅 authentic accepted + submitted/receipt/current 六字段 + token 全匹配时清除；变化 Basket 整篮保留；显式不变重试复用同一 live draft，不自动重试或持久化。
- `2026-08-12T10:06:29Z`：frontend A5 linked response 已 ACK/done；Planner 独立复现 focused `3/23`、full `87/702`、十 verifier、lint/typecheck、production build 和真实 RFQ HTTP smoke。页面、intent、intake 共用完整本地 Stub gate，unset/disabled/production 全部 final 404；根 README、frontend README 与架构契约已同步。保护基线 `47 exact + 2 authorized`，generated/listener/diff/DPG PASS。
- `2026-08-12T10:26:54Z`：Visual QA Round 1 linked response 已 ACK/done，历史结果为 `FAIL / severe 1 / obvious 2 / detail 0`。三个窄 finding 为：尾斜杠 POST 触发 308 并被 `redirect:error` 拒绝；空提交未一次返回四个必填字段加联系方式组错误；提交前没有真实可聚焦的本地 Privacy Policy 目标。1440/1024/768/390/320 回流、基础键盘、reduced motion、无私密泄漏与零外部请求保持 PASS。
- `2026-08-12T10:50:15Z`：frontend 窄修订 linked response 已 ACK/done；Planner 独立复验 direct `3/29`、串行完整清单 `87/705`、十 verifier、lint/typecheck/build 和五 production smoke 全 PASS。S1/O1/O2 代码原因均收敛，Visual R1 FAIL 历史保留；当前只释放 Visual QA Round 2。
- `2026-08-12T11:24:00Z`：Visual QA Round 2 linked response 已 ACK/done，结果为 `FAIL / severe 0 / obvious 1 / detail 0`。S1/O1/O2、accepted unchanged/changed、processing/replay、键盘/ARIA、reduced motion、privacy/network 全部通过；唯一 finding 是嵌套 Privacy Policy 在 390/320 下继承全局 content-box section 宽度与 padding，分别产生 `390/427` 与 `320/361` 的真实横向溢出。checked `task_transition.py reopen` 因任务本来为 `IN_PROGRESS` 安全拒绝且零 mutation；已建立同任务窄修订入口。
- `2026-08-12T11:36:00Z`：frontend overflow linked response 已 ACK/done；Planner 独立确认产品改动仅为 policy 直属 section 的 `box-sizing: border-box` 与 `min-width: 0`，直接 `1/8`、资源隔离后的完整 focused `36/195`、lint/typecheck、`47 exact + 2 authorized`、generated/listener/diff/DPG 全 PASS。首个并行 focused 运行的旧 server-only 临时目录时序失败已保留，并由隔离 `1/10` 加其余 `35/185` 关闭。
- `2026-08-12T11:46:00Z`：bounded Visual closure linked response 已 ACK/done，结果 `PASS / severe 0 / obvious 0 / detail 0`。390 与 320 分别精确 `390/390/390`、`320/320/320`，policy 与 form bounds 一致；Privacy -> Submit 键盘顺序、同页目标焦点和零外部/CMS/Feishu/analytics 请求通过。R1 `20/20`、R2 `42/42`、closure `5/5` 哈希与真实 JPEG/JFIF 编码均已复验，Planner 已清理唯一 preview 和 generated 状态。
- `2026-08-12T11:54:56Z`：唯一完整 adversarial review 已 ACK/done，历史 verdict 固定为 `FAIL / P0=0 / P1=1 / P2=1`。P1 是原生 `maxlength` 按 UTF-16 code unit 缩窄冻结的 Unicode code-point 合同；P2 是受控请求列出的三份 canonical consolidated evidence 文件缺失。checked `task_transition.py reopen` 已运行，但 helper 仅接受 `AWAITING_USER`，因此对当前 `UNDER_REVIEW` 安全拒绝且零 mutation；本记录建立等价的同任务修订入口。
- `2026-08-12T12:06:00Z`：frontend P1 linked response 已 ACK/done；Planner 独立复现直接 `2/14`、有效 RFQ `21/127`、lint/typecheck、十 verifier、`47 exact + 2 authorized`、generated/listener/diff/DPG PASS。十个 native `maxlength` 已移除，120 个 emoji 原样通过而第 121 个稳定 `too_long`。三份 canonical consolidated evidence 已由 Planner 建立，P2 路径现均存在且不改写历史。
- `2026-08-12T12:16:00Z`：same-reviewer bounded closure linked response 已 ACK/done，结果 `PASS / P0=0 / P1=0 / P2=0`；唯一完整 review `FAIL 0/1/1` 历史保持不变。fresh final current-byte validation 为 full `87/707`、十 verifier、lint/typecheck/build、五 smoke、protected/visual/cleanup/diff/DPG PASS。
- `2026-08-12T12:29:13Z`：用户精确输入 `确认 TASK-028 完成并提交到远端`；`task_accept.py check` 与 `accept` 均 PASS。任务进入 `AWAITING_USER / ACCEPTED / FORMAL_COMMIT_PENDING`，只允许正式提交、任务分支推送、`main` 集成与远端引用核验。

## 当前状态

`AWAITING_USER / ACCEPTED / FORMAL_COMMIT_PENDING`。唯一完整 review 历史仍为 `FAIL 0/1/1`，同一 reviewer bounded closure 已 `PASS 0/0/0`；fresh final validation 已 PASS。用户正式验收已通过，当前只允许正式 Git 交付。CMS、真实 CRM、数据库、依赖和外部系统保持不变。

## 下一步

仅暂存 TASK-028 授权文件并生成正式中文提交；随后立即推送任务分支，合并到 `main` 并推送 `main`。不部署。

## Lane Plan

1. `planner`：bounded closure、final validation 和正式用户验收均已 PASS；执行 Git 交付。
2. `frontend`：P1 Unicode 窄修订完成；返回等待态。
3. `visual_qa`：bounded closure `PASS 0/0/0`；返回等待态。
4. `adversarial_reviewer`：bounded closure `PASS 0/0/0`；返回等待态。
5. `planner`：生成正式提交、推送任务分支、合并并推送 `main`，然后核验四个引用。

## Adversarial Review

唯一完整审核历史为 `FAIL / P0=0 / P1=1 / P2=1`；同一 reviewer bounded closure 为 `PASS / P0=0 / P1=0 / P2=0`。审核门已满足，未重复完整审核。

## Validation Evidence

A0 PASS：49/49 保护哈希、RFQ v2 verifier `20 JSON / 5 Schema / 63 refs / 94 checks`、既有 `2 files / 10 tests`、lint、typecheck、generated/listener、diff 与 DPG 门均通过。A1 Planner checkpoint PASS：`3 files / 15 tests`、同一 verifier `20/5/63/94`、lint/typecheck、49/49 protected、generated/listener/diff/DPG 均通过。A2 Planner checkpoint PASS：`5 files / 18 tests`、server-only `1/10`、同一 verifier、lint/typecheck、49/49 protected、generated/listener/diff/DPG 均通过。A3 Planner checkpoint PASS：独立 RFQ + Basket route `20 files / 113 tests`、同一 verifier、lint/typecheck、49/49 protected、generated/diff/DPG 均通过；lane full `85/687` 与 build/smoke 证据已核对。A4 Planner checkpoint PASS：`5/31`、RFQ + Basket `36/189`、full `87/700`、十 verifier、lint/typecheck、`47 exact + 2 authorized` protected、generated/listener/diff/DPG 均通过。A5 Planner checkpoint PASS：focused `3/23`、full `87/702`、十 verifier、lint/typecheck/build、真实 HTTP smoke、`47 exact + 2 authorized` protected、文档、generated/listener/diff/DPG 均通过。

Visual QA Round 1：`FAIL / severe 1 / obvious 2 / detail 0`。通过项包括 1440/1024/768/390/320 无横向溢出、空/ready 层级、基础键盘/焦点、reduced motion、零外部请求和零保护字段泄漏。未通过项限于 S1 308 POST 阻断、O1 完整必填错误和 O2 本地 Privacy Policy 目标。

Visual R1 frontend 窄修订 Planner checkpoint PASS：direct `3/29`；串行完整清单 `87/705`；十 verifier、lint/typecheck/build、五 production smoke、`47 exact + 2 authorized`、generated/listener/diff/DPG 全 PASS。首次并发全量的唯一旧超时计数失败已通过隔离 `1/4` 和串行完整清单证实为资源时序问题，无代码修改。

Visual QA Round 2：`FAIL / severe 0 / obvious 1 / detail 0`。真实 Chrome Guest 已证明 S1/O1/O2、accepted unchanged clear、pending second-tab changed Basket retain、processing/no-auto-retry/explicit replay `1 intent / 2 intake`、键盘/ARIA/reduced motion/privacy/network 全 PASS。唯一 finding 为 Privacy Policy 在 390/320 下 `client/scroll=390/427` 与 `320/361`；42 份新增 JPEG/JFIF-under-.png 证据已由 visual_qa 固定哈希。

Visual R2 overflow frontend revision Planner checkpoint PASS：presentation `1/8`；首个并行 focused 运行保留旧 server-only 临时目录时序失败，隔离 server-only `1/10` 加其余 `35/185`，有效完整 focused `36/195`；lint/typecheck、`47 exact + 2 authorized`、production next-env、generated/listener/diff/DPG 全 PASS。

Visual overflow bounded closure：`PASS / severe 0 / obvious 0 / detail 0`。390/320 的 inner/client/scroll 完全相等，policy/form bounds 相同；原生 Privacy-before-Submit 与同页 target focus 通过；R1 `20/20`、R2 `42/42`、closure `5/5` 哈希与编码通过。Pre-review validation、generated/listener cleanup、diff/DPG 全 PASS。
