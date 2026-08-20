# TASK-010 英语版 CMS Runtime Schema Validator 基础
accepted_at: 2026-07-25T19:08:41Z
closed_at: 2026-07-25T19:08:41Z
delivery_profile: REMOTE

task_id: TASK-010
status: CLOSED
owner_lane: planner
assigned_lanes: ["frontend", "validation"]
review_lane: adversarial_reviewer
linked_issues: []
artifacts_dir: TASKS/ARTIFACTS/TASK-010
acceptance_state: ACCEPTED
git_status: MERGED
document_impact: RESOLVED
readme_impact: UPDATED
project_type: software

## 原始请求

> 好的，下一步

根据上一轮已确认的实施顺序，本任务定义为：

> TASK-010：英语版 CMS Runtime Schema Validator 基础

## 结构化理解

- TASK-007 已冻结并交付 WordPress 英语 Content Schema `3.0.0`、API `1`、公开 DTO/Fixture 和 `/resolve`。
- TASK-008 已把 `/resolve` 的 16 份 JSON Schema 闭包和成功/错误样例冻结到前端，并建立离线 checksum/authority parity。
- TASK-009 已实现 server-only Transport，但网络 JSON 仍保持为 `unknown`，尚不能安全交给 Adapter、页面或组件。
- 本任务只在不可信网络边界建立运行时 Schema 校验，使后续 Adapter 只能接收经过验证的 payload。
- 正式前端界面仍未在本任务中开始；本任务完成后，下一独立任务才能实现最小 Adapter 和显式开启的本地可见 `/integration/cms` 页面。

## 目标

- 选择并固定一个支持 JSON Schema Draft 2020-12 的运行时校验方案；默认候选为 `ajv` 与 `ajv-formats`，精确版本在实施时按现有 Node/Next.js 工具链验证并锁定。
- 只消费 `frontend/src/lib/cms/contracts/**` 中 TASK-008 已冻结的前端合同，不在运行时读取 `cms/**`、`TASKS/**`、WordPress 文件或数据库。
- 建立 server-only Schema registry/validator，覆盖成功 `page.v3.schema.json` 与 `error.schema.json` 的完整本地 `$ref` 闭包。
- 在读取业务字段前判别成功 envelope 与错误 envelope；不兼容版本、错误根 Schema、缺少字段或非法模块必须 fail closed。
- 输出不可伪造的 validated wrapper/brand，原始 `unknown` 不得直接作为页面 props 或组件数据；本任务不执行内容归一化。
- 建立稳定、可判别且不泄漏原始 payload 的 contract error，包括至少 unsupported schema、invalid success payload 和 invalid error payload。
- 使用 TASK-008 canonical samples 和受控 mutation matrix 证明生产校验器真实执行，而不是仅依赖 TypeScript 断言。

## 非目标

- 不实现 DTO Adapter、frontend-owned Page/Product/module types、内容归一化或组件 props。
- 不修改现有 Transport 的 URL、timeout、请求、HTTP/协议错误或 metadata 行为。
- 不修改 `frontend/src/app/**`，不创建 `/integration/cms`、catch-all route、页面、loading、error boundary 或 `notFound()`。
- 不开发 Header、Mega Menu、Footer、首页模块、视觉系统、响应式样式或动画。
- 不启动真实 WordPress live E2E，不修改 CMS、数据库、Fixture、插件、SCF 字段或 REST 合同。
- 不实现缓存、请求去重、retry、Preview、Webhook、认证、多语言、SEO、询盘或部署。
- 不采用代码生成器，不新增 `json-schema-to-typescript` 等类型生成链；如实施证明必须增加第三个依赖，停止并回到 Planner 重新确认。
- 不提交、推送、合并或部署，除非后续收到精确正式交付口令。

## 交付物

- `frontend/src/lib/cms/server/validation/**` 或经设计阶段确认的同等 server-only 目录：
  - Draft 2020-12 Schema registry；
  - 成功/错误 payload 校验入口；
  - validated wrapper/brand；
  - stable contract error。
- `frontend/tests/cms-runtime-validator.test.ts` 或同等单一聚焦测试文件。
- `frontend/package.json` 与 `frontend/package-lock.json`：仅允许增加经确认的运行时 Schema 校验依赖。
- `frontend/README.md`：记录 Validator 的职责、调用边界、验证命令与明确非目标。
- 根 `README.md`：仅在根文档治理规则要求新增最小入口时同步。
- `TASKS/ARCHIVE/TASK-010/OUTPUTS/DESIGN.md`。
- 标准 execution report、validation log、diff/output summary、adversarial review 和 Planner final summary。

## 验收标准

- 校验器使用 Draft 2020-12 模式编译 TASK-008 的完整 16-Schema 本地闭包，不通过远程 `$ref`、外部网络或运行时文件系统取 Schema。
- production validator 与其全部 Schema registry 具有 framework-supported `server-only` guard；真实 Client Component 导入负例必须构建失败。
- canonical `resolve-home.json` 与 `resolve-product-alpha.json` 通过成功 envelope 校验；两份 canonical error sample 通过错误 envelope 校验。
- mutation matrix 至少拒绝：
  - 非 `apiVersion: "1"`；
  - 非 `schemaVersion: "3.0.0"`；
  - 缺少 required 根字段；
  - 非法 content type/template 组合；
  - 未知 module type；
  - 错误 module schema version；
  - 非 UUID module instance ID；
  - 非法 media URL、日期时间或尺寸；
  - 非结构化/非法 `data_table` row/cell；
  - 非法关系、额外禁止字段；
  - malformed error body。
- 日期、date-time 和 URI format 必须真实执行，不得因缺少 format provider 而被静默忽略。
- 编译后的 validator 在模块级复用，不为每次请求重复编译 Schema；不得引入全局可变 payload 状态。
- `unknown` 只有通过 runtime validation 才能获得 validated wrapper；wrapper 不得被普通对象结构性伪造。
- contract error 的 message、枚举属性与 JSON 序列化不得包含完整原始 payload、CMS origin、cookie、credential 或内部 Schema 路径栈。
- 不修改 TASK-008 合同快照、TASK-009 Transport、`frontend/src/app/**`、CMS、数据库或环境文件。
- 依赖变化仅限需求确认后批准的 `ajv`、`ajv-formats` 及其 lockfile 闭包；不得新增 script 或无关包。
- `npm run verify:cms-contract`、`npm run lint`、`npm run typecheck`、`npm test`、聚焦 validator tests 与 `npm run build` 全部通过。
- execution evidence、独立 adversarial review 和 Planner final validation 齐全；最终 review 为 PASS，P0/P1/P2 均为 0。

## 允许修改范围

- `frontend/src/lib/cms/server/validation/**`
- `frontend/tests/cms-runtime-validator.test.ts`
- `frontend/tests/**` 中仅由本任务新增且 Validator 测试必需的最小 helper
- `frontend/vitest.config.ts`，仅在现有 `server-only` 测试映射需要精确延伸时修改
- `frontend/package.json`
- `frontend/package-lock.json`
- `frontend/README.md`
- `README.md`，仅限必要的 TASK-010 开发者命令入口
- `TASKS/ACTIVE/TASK-010-cms-runtime-schema-validator.md`
- `TASKS/ARTIFACTS/TASK-010/**`
- 当前任务所需的 `PROJECT/**`、`TASKS/**`、`LANES/**` 治理记录和受控消息

## 禁止修改范围

- `frontend/src/app/**`
- `frontend/src/lib/cms/contracts/**`
- TASK-008 canonical samples、manifest、checksums、authority mapping 和 verifier
- TASK-009 Transport、URL builder、配置与现有错误语义；如 validator orchestration 需要接线，必须进入后续 Adapter/集成任务
- `frontend/.env*`
- `cms/**`、WordPress、数据库、Fixture、插件、用户和配置
- 页面、组件、样式、图片、SEO、多语言、询盘和部署文件
- Git 提交、远端分支、`main`、GitHub 设置和外部系统

## 约束

- 使用现有 Node `24.18.0`、npm `11.16.0`、Next.js `16.2.11`、TypeScript `5.9.3` 和 Vitest `4.1.10`。
- Validator 必须消费前端拥有的 TASK-008 合同快照；生产代码不得反向导入 `TASKS/**` 或 `cms/**`。
- JSON Schema 注册、format 支持和 strict-mode 设置必须显式冻结；不得通过关闭 strict/schema/format 校验掩盖不兼容。
- 错误输出只提供稳定 kind、受控摘要和必要的最小定位信息；完整 Ajv error objects 只能在测试或受控私有诊断边界使用，不能泄漏到页面。
- validated wrapper 只表示“通过指定根 Schema 的运行时验证”，不等于 frontend DTO，也不能绕过下一步 Adapter。
- Schema 编译失败属于构建/开发错误，不能在生产请求中降级为“接受原始 JSON”。

## 假设和待确认事项

- 默认批准引入 `ajv` 与 `ajv-formats` 两个直接依赖；精确版本在实施前通过官方包元数据、Node 24/Next.js 构建和 lockfile 验证后固定。
- 默认只建立 Page Schema 3 success envelope 与公共 error envelope 两个根校验入口；collection、navigation、settings 等未来合同不在本任务中推测实现。
- 默认 Validator 不接入 React route，也不直接调用 TASK-009 Transport；下一任务负责最小 orchestration、Adapter 和可见页面。
- 默认不生成完整 TypeScript DTO；下一任务根据 validated wrapper 建立 frontend-owned DTO/Adapter。

## 验证计划

- 先写 RED：canonical success/error 样例在缺少 runtime validator 时失败。
- 加载并严格编译 16-Schema 闭包，先让 canonical samples GREEN。
- 按 mutation matrix 逐组加入 RED，再用最小配置/错误语义逐项 GREEN。
- 加入 wrapper 不可伪造和 payload leakage 负例。
- 加入 public/deep Client Component 导入的真实 Next.js build negative。
- 运行 parity、lint、typecheck、聚焦/完整 Vitest、production build、依赖树、lockfile、禁止范围、residue、secret/leakage 与 `git diff --check`。
- 运行 DPG project validate、message validate 和 strict lane audit；由 `adversarial_reviewer` 独立复核 Schema 闭包、strict/format 行为、错误泄漏、依赖和范围。

## 文档影响

本任务将新增运行时依赖和 CMS 网络边界的开发者行为。实施完成后必须更新 `frontend/README.md`；如根 README 治理规则要求新增验证入口，则做最小同步，并在验收前将 `document_impact`、`readme_impact` 更新为已解决状态。

## 分支和 Worktree

- 分支：`codex/TASK-010-cms-runtime-schema-validator`
- Worktree：当前共享项目工作区
- 基线：本地与远端 `main` 的 TASK-009 正式提交 `dd07662698744b90a0c810a0d1f9342109eb1a22`

## 当前状态

任务已正式验收、提交、推送任务分支、快进合并并推送远端 `main`。正式提交为 `a89bb4de91e63dce2f9960e31b1cd39cae58f335`，本地 `main`、`origin/main` 与远端任务分支已验证一致。

## 恢复入口

先读 `AGENTS.md`、`PROJECT/STATE.md`、`PROJECT/COORDINATION.md`、`PROJECT/AGENT_LANES.md`、lane registry、planner 最近 worklog、本任务文件，再读 TASK-008 contract snapshot、TASK-009 Transport、TASK-005 `FRONTEND_INTEGRATION_BOUNDARY.md` 第 3.3/6/8 节。

## 下一步

任务已归档。后续只允许在独立任务中实现最小 Adapter、Transport/Validator 编排和显式开启的本地可见集成页。

## Lane Plan

| lane | responsibility | write_scope | expected_artifacts | status |
|---|---|---|---|---|
| planner | 任务接收、依赖/范围冻结、门禁、独立验证、审查派发和最终汇报 | `PROJECT/**`、`TASKS/**`、`LANES/planner/**` | task state、设计/计划、checkpoint、Planner Summary | CLOSED; MERGED |
| frontend | 测试先行实现 Draft 2020-12 registry、runtime validator、validated wrapper、typed contract errors、测试和 docs | 本任务允许的 `frontend/**`、TASK-010 artifacts、lane records | implementation、execution report、validation evidence | R3 execution complete |
| adversarial_reviewer | 只读挑战 Schema 闭包、strict/format、错误泄漏、server-only、依赖和范围 | TASK-010 review report、reviewer lane records | PASS/FAIL/P0/P1/P2 report | closure PASS; P0/P1/P2=0 |

## Durable Task Artifacts

- `TASKS/ARCHIVE/TASK-010/OUTPUTS/DESIGN.md`：已冻结运行时 Schema registry、public seams、opaque wrapper 和 stable error 设计。
- `MSG-TASK-010-FRONTEND-RUNTIME-VALIDATOR-R1`：已 validate、通过 Codex thread bridge 投递并标记 dispatched。
- `TASKS/ARCHIVE/TASK-010/VALIDATION_REPORT.md`：验证证据已生成并由 Planner 检查。
- `MSG-TASK-010-ADVERSARIAL-REVIEW-R1`：已 validate、投递并标记 dispatched。
- `TASKS/ARCHIVE/TASK-010/EVIDENCE/ADVERSARIAL_REVIEW_HISTORY.md`：Round 1 FAIL，P0=0、P1=1、P2=1。
- `MSG-TASK-010-FRONTEND-WRAPPER-INTEGRITY-R2`：已 validate、投递并标记 dispatched。
- `TASKS/ARCHIVE/TASK-010/EVIDENCE/ADVERSARIAL_REVIEW_HISTORY.md`：保留 Round 1，并已恢复完整 Round 2 FAIL 记录。
- `MSG-TASK-010-ADVERSARIAL-CLOSURE-REVIEW-R3`：用户授权后已 validate、投递并标记 dispatched。
- `TASKS/ARCHIVE/TASK-010/EVIDENCE/ADVERSARIAL_REVIEW_HISTORY.md`：已追加 user-authorized closure `PASS / P0=0 / P1=0 / P2=0`。

## Adversarial Review

- Round 1：`FAIL / P0=0 / P1=1 / P2=1`。
- P1：真实 wrapper 保留原 input 引用，嵌套 body 和 runtime `kind` 均可在校验后改写，破坏 validated token 的持续真实性。
- P2：旧 Validation Evidence 仍声称 frontend/依赖未修改；本恢复入口已同步当前事实。
- frontend R2 和 Planner fresh checkpoint 已完成；Planner final validation 仍不允许，只请求 Round 2。
- Round 2：`FAIL / P0=0 / P1=1 / P2=0`。实例 own properties 已固定，但可变 prototype 仍允许替换 `body` getter 或添加 `toJSON`，P1 未完全关闭；P2 已关闭。
- Round 2 canonical artifact 已恢复。R3 已消除共享 prototype，Planner checkpoint PASS；尚无额外 closure review verdict。
- 用户授权 closure review：`PASS / P0=0 / P1=0 / P2=0`；Round 2 P1 关闭，Round 1 P2 保持关闭，允许 Planner final validation。

## Validation Evidence

- intake 前本地 `main`、`origin/main` 与远端 TASK-009 分支均为 `dd07662698744b90a0c810a0d1f9342109eb1a22`。
- intake 前工作区干净、非 detached HEAD、无 queue/failed/blocked lane message。
- 本任务分支从同步 `main` 创建；当前已新增三个 Validator production modules、一个聚焦测试、`ajv`/`ajv-formats` direct dependencies 和 lockfile closure，并更新 frontend/root README。
- TASK-008 contract snapshot、TASK-009 Transport/config/errors/public entry、`frontend/src/app/**`、`cms/**`、数据库和环境文件保持无产品差异。
- Round 1 前 Planner 独立门禁在 Node 24.18.0 / npm 11.16.0 下 focused 38/38、full 107/107 PASS；Round 1 后 fresh checkpoint 为 focused 44/44、full 113/113、parity、lint、typecheck、build、dependency tree、production audit、scope、server-only、residue、leakage、governance 和 diff PASS。
- R3 Planner fresh checkpoint 为 focused 48/48、full 117/117、parity、lint、typecheck、build、dependency tree、production audit、protected scope、server-only、leakage、residue、governance 和 diff PASS。
- closure PASS 后 Planner final fresh validation 再次得到 focused 48/48、full 117/117、parity、lint、typecheck、build、dependency tree、production audit、protected scope、server-only、leakage、residue、governance 和 diff PASS。

## User Acceptance

- `ACCEPTED` at `2026-07-25T19:08:41Z` by exact phrase `确认 TASK-010 完成并提交到远端`。
