# TASK-016 前端 ProductCard Transport、Runtime Validator 与 DTO Adapter

task_id: TASK-016
status: CLOSED
accepted_at: 2026-07-30T15:28:57Z
owner_lane: planner
assigned_lanes: [frontend]
review_lane: adversarial_reviewer
linked_issues: []
artifacts_dir: TASKS/ARTIFACTS/TASK-016
acceptance_state: ACCEPTED
recovery_recorded_at: 2026-07-30T14:32:21Z
git_status: MERGED
document_impact: RESOLVED
readme_impact: UPDATED
project_type: software

## 原始请求

> 创建 TASK-016：建立前端 ProductCard Transport、Runtime Validator 与 DTO Adapter

## 结构化理解

- TASK-014 已交付匿名只读 `/wp-json/gdhe/v1/product-cards`、独立 ProductCard Schema `1.0.0`、0/1/N、四格 kind/lifecycle/action 组合、非空关系、规范化错误和缓存头证据。
- TASK-015 已把该合同冻结为前端拥有的 8-file Schema Snapshot、3 份成功样例、6 份错误样例和离线权威校验器，但没有运行时消费者。
- 本任务只补齐 ProductCard 的 server-only HTTP Transport、运行时 Schema/语义 Validator、只读 DTO Adapter 和最小编排，使后续 React 页面只接触安全的前端 DTO。
- 本任务仍是最后一个非可视化接入任务，不创建 React 卡片、产品列表页或产品详情页。完成后再单独建立第一批本地可见界面任务。

## 目标

- 建立独立的 ProductCard server-only Transport；不得放宽、改名或泛化 TASK-009 的 `resolveCmsPath`。
- 固定消费 `/gdhe/v1/product-cards`、英语 `en` 和 ProductCard Schema `1.0.0`，只开放已冻结的分页、排序和分类筛选参数。
- 每次编排只发起一次 collection 请求、只解析一次 JSON、零重试，并证明不会为卡片逐项调用 `/resolve`。
- 使用 TASK-015 前端本地 8-file Snapshot 建立严格的 Draft 2020-12 runtime Validator，不在运行时读取 `cms/**` 或 `TASKS/**`。
- 在 Schema 校验之外验证跨字段语义，至少包括详情产品 `action.targetPath === publicPath` 以及冻结的 kind/lifecycle/action/path 组合。
- 建立不可伪造、调用方隔离的 validated wrapper，使 Adapter 只能接收验证后的 ProductCard collection。
- 将验证后的 collection 映射为前端拥有、深度只读、无内部字段的 ProductCard DTO 和分页元数据。
- 用离线样例及隔离 loopback HTTP 测试证明 0、1、N、四格 kind/lifecycle/action 组合、非空关系、错误语义、一次请求和 server-only 边界。

## 非目标

- 不创建或修改 React ProductCard、产品列表、分类页、系列页、应用页、产品详情页、路由、样式、动画或可见页面。
- 不实现 `SeoDocument`、Metadata、canonical、Breadcrumb、JSON-LD、robots、sitemap、404/redirect 页面语义。
- 不修改 WordPress、GDHE Site、数据库、Fixture、ProductCard Schema 权威源或 TASK-014 handoff。
- 不导入、发布或修订真实产品，不连接飞书，不实现 RFQ 提交或报价记录写入。
- 不实现 last-known-good cache、ISR、React cache、cache tags、Preview、Webhook、Staging 或部署。
- 不发送条件请求；Transport 可以识别无正文 `304` 为 typed outcome，但没有匹配的已验证 DTO cache 时不得把它适配成卡片或空列表。
- 不修改现有 `/resolve` Snapshot、Transport、Validator、Adapter 或 `/integration/cms` 行为。
- 不新增 npm 依赖、修改 lockfile、环境文件或构建拓扑；如现有 Ajv 能力不足，停止并重新确认。
- 不提交、推送、合并或部署，除非后续收到精确正式交付口令。

## 交付物

- `frontend/src/lib/cms/server/product-cards/**`：固定查询 builder、server-only Transport、typed outcomes/errors、runtime Validator、validated wrapper、Adapter 与最小编排。
- `frontend/src/types/product-card.ts` 或同等单一前端类型文件：深度只读 ProductCard collection/card DTO。
- `frontend/tests/product-card-transport.test.ts`：隔离 loopback HTTP Transport、请求次数、参数、状态和错误测试。
- `frontend/tests/product-card-runtime-validator.test.ts`：Snapshot runtime 校验、语义校验、隔离和伪造负例。
- `frontend/tests/product-card-adapter.test.ts`：0/1/N、四格 kind/lifecycle/action 组合、关系、分页和内部字段边界测试。
- `frontend/tests/product-card-consumer.test.ts`：一次 collection 请求、零逐卡 `/resolve` 的最小编排证明；如实施设计能在前三个聚焦文件中清晰证明，可不额外拆文件。
- `frontend/README.md` 与根 `README.md`：记录运行时 ProductCard consumer、验证命令、server-only/无 UI/无 cache 边界。
- `TASKS/ARTIFACTS/TASK-016/`：DESIGN、IMPLEMENTATION_PLAN、TDD RED、execution report、validation log、diff summary、独立审查和 Planner Summary。

## 验收标准

- 新 Transport 的生产入口含 framework-supported `server-only` guard；Client Component 对公开入口和深层模块的导入负例均不能形成有效客户端 bundle。
- Transport 复用现有受控 `WORDPRESS_API_URL` 配置边界，但使用独立 ProductCard 入口；调用方不能覆盖 origin、endpoint、locale、schema、timeout 或任意 query key。
- URL 固定为 `/gdhe/v1/product-cards`，固定 `locale=en`、`schema=1.0.0`；只接受 `page >= 1`、`perPage 1..100`、`modified_desc|title_asc` 和可选 `product_category:<slug>`。
- 每次调用精确一个匿名 `GET`，携带 `Accept: application/json`，拒绝 redirect，使用 5000 ms 有界超时、调用方 abort、`cache: no-store` 和零重试；不发送 Cookie、Authorization、nonce 或 Application Password。
- `200` 只解析一次并返回 `unknown + sanitized metadata`；`304` 是无正文 typed outcome；非 JSON、空/畸形 JSON、意外 2xx、redirect、网络、timeout、abort 和 HTTP 状态具有稳定、非泄漏语义。
- `200` 必须先通过 ProductCard Schema `1.0.0` 和显式跨字段语义校验，才能形成不可伪造、深度冻结、调用方隔离的 validated wrapper。
- normalized error body 必须通过现有前端错误 Schema；HTTP status 与 body `status` 不一致、无效 error body 或把上游故障伪装为业务错误时 fail closed。
- Adapter 只接受真实 validated wrapper，输出深度只读 collection DTO；包含前端渲染必需的完整公开卡片、分页、sort/filter 信息，不输出 raw body、Transport metadata、WordPress/数据库 ID、SCF/meta、飞书/供应商/成本/库存/内部 Article Number 等字段。
- 0、1、N 三种成功集合、四格已冻结 kind/lifecycle/action 组合、非空合法 series/applications 和详情 action/path 相等均通过；Mutation 必须覆盖额外字段、版本漂移、关系/媒体无效、动作/路径不一致和 wrapper 伪造。
- 编排测试精确证明一次 `/product-cards` collection 请求、零 `/resolve` 请求、零浏览器直连 WordPress；任何 card count 都不能触发逐卡补取。
- 没有已验证 cache entry 时，`304` 不得生成空数组、旧数据、伪 404 或成功 DTO；本任务不实现 last-known-good cache。
- `npm run verify:product-card-contract`、旧 `verify:cms-contract`、ProductCard 聚焦测试、旧 CMS 测试、lint、typecheck、完整 test 和 build 全部通过。
- TASK-015 13-file Snapshot inventory、TASK-014 25-file authority checksum、既有 `/resolve` 20-file Snapshot/verifier、package-lock 和依赖集合保持不变。
- execution report、validation evidence、独立 adversarial review 和 Planner Summary 齐全；最终 review 为 `PASS / P0=0 / P1=0 / P2=0`。

## 允许修改范围

- `frontend/src/lib/cms/server/product-cards/**`
- `frontend/src/types/product-card.ts`
- `frontend/tests/product-card-transport.test.ts`
- `frontend/tests/product-card-runtime-validator.test.ts`
- `frontend/tests/product-card-adapter.test.ts`
- `frontend/tests/product-card-consumer.test.ts`
- `frontend/tests/**` 中仅由本任务新增且 server-only build 负例或隔离 loopback 测试必需的最小 helper/fixture
- `frontend/vitest.config.ts`，仅在现有 `server-only` 测试映射无法覆盖新模块且不改变其他测试行为时
- `frontend/README.md`
- `README.md`
- `TASKS/ACTIVE/TASK-016-product-card-runtime-consumer.md`
- `TASKS/ARTIFACTS/TASK-016/**`
- `TASKS/ARCHIVE/INDEX.md`
- `TASKS/ARCHIVE/TASK-015-product-card-contract-snapshot.md`
- 本任务所需的 `PROJECT/**`、`TASKS/**`、`LANES/**` 治理记录和受控消息

## 禁止修改范围

- `cms/**`、WordPress 数据库、内容、用户、Fixture、插件与运行配置
- `TASKS/ARTIFACTS/TASK-014/**`、`TASKS/ARTIFACTS/TASK-015/**`
- `frontend/src/lib/cms/product-card-contract/**`
- `frontend/scripts/verify-product-card-contract.mjs`
- `frontend/src/lib/cms/contracts/**`、`frontend/scripts/verify-cms-contract.mjs`
- 现有 `frontend/src/lib/cms/server/transport.ts`、`resolve-url.ts`、`validation/**`、`adapter/**` 和 `integration/**`，除非设计阶段证明一个仅复用通用无行为 helper 的最小改动不可避免并先回到 Planner 重新确认
- `frontend/src/app/**`、现有页面、组件、样式与公开路由
- `frontend/package.json`、`frontend/package-lock.json`、依赖版本和 `.env*`
- 飞书、GitHub 设置、DNS、Staging、Preview、生产环境和其他外部系统

## 约束

- TASK-015 `frontend/src/lib/cms/product-card-contract/**` 是运行时唯一 ProductCard Schema/样例事实源；生产代码不得跨目录读取 `cms/**` 或 `TASKS/**`。
- 独立 ProductCard consumer 不得泛化 TASK-009 `/resolve` 入口或破坏其 `no-store`、5000 ms、零重试和 server-only 语义。
- 使用现有精确依赖与 Node/Next.js/TypeScript/Vitest 工具链；不为类型便利绕过 runtime validation。
- 所有网络 payload 在通过 Validator 前保持 `unknown`；TypeScript 类型断言、样例可信或 WordPress 已验证都不能代替前端运行时校验。
- 只允许经 Adapter 输出的 readonly DTO 进入未来 UI；raw JSON、validated wrapper、Transport metadata、CMS origin 和 ETag 不得成为 React props。
- `304` 只有在未来独立任务拥有与请求身份匹配的最后成功已验证 DTO cache 时才能复用；本任务没有该 cache，不得猜测或回退。
- 英语仍是唯一公开 locale；本任务不增加翻译、hreflang、RTL 或语言入口。
- 生产媒体 HTTPS origin 和 Next Image allowlist、真实产品、SeoDocument 和正式可见页面继续作为后续任务门，不在本任务伪造完成。

## 假设和待确认事项

- 默认沿用现有 `WORDPRESS_API_URL` 语义和 5000 ms 超时，不新增 ProductCard 专用环境变量。
- 默认 Adapter 保留合同中的全部公开字段，不在运行时重新计算 action、过滤属性或猜测 Article Number；只做验证后结构复制与冻结。
- 默认成功响应仍使用 `cache: no-store`，避免把 Transport 正确性与阶段 3 的 last-known-good/ISR 设计混合。
- 默认 normalized ProductCard errors 继续复用 TASK-008 已冻结的公共 error Schema；实施前必须用 TASK-015 六份错误样例证明兼容，若不兼容则停止并回到 Planner，不修改任一 Snapshot。

## 验证计划

1. 记录 TASK-015 Snapshot/verifier、TASK-014 25-file authority、现有 `/resolve` Transport/Validator/Adapter、依赖和测试基线哈希。
2. 形成 DESIGN 和 IMPLEMENTATION_PLAN，冻结新目录、查询类型、200/304/error outcomes、Validator/semantic checks、wrapper、DTO、一次请求证明和回滚方式。
3. 按 TDD 先写聚焦测试，得到“ProductCard runtime consumer 不存在”的有效 RED，再做最小 GREEN。
4. 用 TASK-015 0/1/N、四格 kind/lifecycle/action 组合、非空关系和六种错误样例验证；在临时克隆/内存对象中做版本、额外字段、action/path、wrapper 伪造和隔离 mutation。
5. 使用隔离 loopback HTTP 服务验证固定 URL、参数 allowlist、一次匿名 GET、零重试、redirect、timeout/abort、200/304/error、一次 parse、request count 和 handle cleanup。
6. 运行 ProductCard/旧合同 verifier、所有聚焦与完整测试、lint、typecheck、build、Client Component build negatives、依赖/lockfile和禁止范围检查。
7. 运行 secret/internal-field/absolute-path/runtime-cross-import 扫描、`git diff --check`、DPG project/registry/messages/strict lane 验证。
8. 交由 `adversarial_reviewer` 独立挑战任意查询注入、Validator 绕过、wrapper 伪造、共享引用可变、action/path 不一致、304 误用、逐卡 `/resolve`、浏览器直连和旧消费者回归。

## 文档影响

`RESOLVED`：`frontend/README.md` 已记录 server-only ProductCard consumer、验证命令及无 UI/无 cache 边界；根 `README.md` 已同步运行时消费者与当前未实现可见页面的事实。

## README 影响

`UPDATED`：根 `README.md` 已增加 TASK-016 运行时消费者、一次 collection 请求/零逐卡 `/resolve` 和验证入口，并移除“尚无前端消费者”的过时表述。

## 分支和 Worktree

- 分支：`codex/TASK-016-product-card-runtime-consumer`
- Worktree：当前共享项目工作区
- 基线：`main` / `origin/main` at `54917bdedcdb710830021c6397adc217252a8423`

## 当前状态

`CLOSED / ACCEPTED / MERGED`。正式提交 `5b448c5c169db7aba1b6c69b3b4baa216493f4d3` 已同时成为本地/远端任务分支与本地/远端 `main` 的共同指针；TASK-016 已完成归档。

## 恢复入口

先读 `AGENTS.md`、`PROJECT/STATE.md`、`PROJECT/COORDINATION.md`、`PROJECT/AGENT_LANES.md`、lane registry、planner 最近 worklog、本任务文件，再读 TASK-015 Snapshot/Planner Summary、TASK-014 frontend handoff audit、TASK-013 ProductCard projection 和 TASK-009～011 归档任务。

## 下一步

无。后续工作由独立任务管理。

## Lane Plan

| lane | responsibility | write_scope | expected_artifacts | status |
|---|---|---|---|---|
| planner | 冻结需求、设计门、状态、调度、独立验证和用户汇报 | `PROJECT/**`、`TASKS/**`、`LANES/**` | intake、DESIGN/PLAN、checkpoint、Planner Summary | CLOSED |
| frontend | 确认后按 TDD 建立独立 ProductCard Transport、Validator、wrapper、DTO Adapter、编排和测试 | 本任务允许的 `frontend/**`、TASK-016 artifacts、lane records | RED/GREEN、implementation、execution report、validation evidence | REVISION_RESPONSE_ACKED; COMPLETE |
| adversarial_reviewer | 实施与 Planner validation 后只读独立审查 | canonical review report、reviewer lane records | PASS/FAIL/P0/P1/P2 report | ROUND_1_FAIL_HISTORY_PRESERVED; ROUND_2_PASS; RESPONSE_ACKED |

## Messages

- `MSG-TASK-016-FRONTEND-RUNTIME-CONSUMER-IMPLEMENTATION`：已 validate、dry-run，通过真实 Codex thread bridge 投递至注册 frontend session，并由 `lane_dispatch.py dispatch-once` 记录；frontend 已 ACK 并完成受控执行。
- `MSG-TASK-016-FRONTEND-RUNTIME-CONSUMER-IMPLEMENTATION-RESPONSE`：已由 frontend 生成、通过线程桥回传并由 Planner ACK；execution report 和 validation evidence 已独立复核。
- `MSG-TASK-016-ADVERSARIAL-REVIEW-R1`：已 validate、dry-run，通过真实 Codex thread bridge 投递至注册 reviewer session，并由 `lane_dispatch.py dispatch-once` 记录；reviewer 已 ACK 并完成 Round 1。
- `MSG-TASK-016-ADVERSARIAL-REVIEW-R1-RESPONSE`：已回传并由 Planner ACK；verdict `FAIL / P0=0 / P1=1 / P2=1`。
- `MSG-TASK-016-FRONTEND-QUERY-BOUNDARY-P1-R1`：已 validate、dry-run，通过真实 Codex thread bridge 投递至注册 frontend session，并由 `lane_dispatch.py dispatch-once` 记录；frontend 已 ACK 并完成窄修订。
- `MSG-TASK-016-FRONTEND-QUERY-BOUNDARY-P1-R1-RESPONSE`：已通过线程桥回传并由 Planner ACK；Planner fresh checkpoint 已独立复核代码、测试、构建、受保护哈希、范围和治理。
- `MSG-TASK-016-ADVERSARIAL-REVIEW-R2`：已 validate、dry-run，经 Codex thread turn `019fb367-989d-7980-a6d3-126b20f014bd` 真实投递并由 `lane_dispatch.py dispatch-once` 记录；reviewer 已 ACK 并完成 Final Round 2。
- `MSG-TASK-016-ADVERSARIAL-REVIEW-R2-RESPONSE`：已通过线程桥回传并由 Planner ACK；final verdict `PASS / P0=0 / P1=0 / P2=0`。

## 执行记录

- 2026-07-30T10:49:44Z：核验 TASK-015 正式提交、任务分支、远端任务分支、本地 `main` 与 `origin/main` 均为 `54917bdedcdb710830021c6397adc217252a8423`，将 TASK-015 同步为 `CLOSED / MERGED` 并归档。
- 2026-07-30T10:49:44Z：从已同步的 `main` 创建 `codex/TASK-016-product-card-runtime-consumer`。
- 2026-07-30T10:49:44Z：创建 TASK-016 intake；仅冻结 ProductCard Transport、runtime Validator、DTO Adapter 和一次请求/零 resolve 边界，等待用户明确需求确认。
- 2026-07-30T13:16:26Z：收到精确口令 `确认 TASK-016 需求并开始执行`；任务从 `AWAITING_REQUIREMENT_CONFIRMATION` 推进为 `READY`。已确认测试接缝为 Transport、Runtime Validator、DTO Adapter 和最小编排；设计门通过前不修改产品代码。
- 2026-07-30T13:21:11Z：DESIGN、IMPLEMENTATION_PLAN 与 baseline validation 通过。Node 24.18.0 下 ProductCard `8/3/6`、旧合同 `16/2/2`、171/171、lint、typecheck、build 通过；任务转为 `IN_PROGRESS`，下一步只 dispatch frontend。
- 2026-07-30T13:22:48Z：`MSG-TASK-016-FRONTEND-RUNTIME-CONSUMER-IMPLEMENTATION` 经 Codex thread turn `019fb330-c341-72d1-b89b-4b7def1cbf5a` 真实投递并记录 dispatched；frontend 必须先 ACK。
- 2026-07-30T13:51:11Z：ACK frontend execution response。Planner 在 Node 24.18.0 下重跑 ProductCard verifier `8/3/6`、旧 verifier `16/2/2`、五个聚焦文件 `66/66`、全量 `237/237`、lint、typecheck 和生产 build，均 PASS；受保护哈希、13/20 inventory、禁止导入、README、DPG strict audit 和 diff 通过。任务从 `IN_PROGRESS` 推进为 `UNDER_REVIEW`。
- 2026-07-30T13:52:53Z：`MSG-TASK-016-ADVERSARIAL-REVIEW-R1` 经 Codex thread turn `019fb34c-740f-7492-a582-9a9d7103cd8a` 真实投递并记录 dispatched；任务保持 `UNDER_REVIEW`，等待只读独立 verdict。
- 2026-07-30T14:06:25Z：ACK Round 1 FAIL response。代码复核确认 `RegExp.test` 与 URL 构造对 caller-owned `filter` 发生两次强制转换，且 `Object.keys` 不能关闭 non-enumerable、symbol、accessor 与 Proxy-hidden extras。`task_transition.py reopen` 因 helper 只接受 `AWAITING_USER` 而拒绝 `UNDER_REVIEW`；Planner 按同一受控恢复语义记录 `NEEDS_REVISION`，不伪造 AWAITING_USER。
- 2026-07-30T14:09:01Z：`MSG-TASK-016-FRONTEND-QUERY-BOUNDARY-P1-R1` 经 Codex thread turn `019fb35b-33fb-7a01-b54a-48db198ae477` 真实投递并记录 dispatched；只允许 query validation/URL seam 和对应 tests/artifacts 窄修订。
- 2026-07-30T14:20:30Z：ACK frontend narrow revision response。Planner 独立检查 proxy-before-reflection、`Reflect.ownKeys`、own data descriptor、primitive guards、frozen snapshot 和 URL snapshot 使用；重跑 ProductCard `8/3/6`、旧 CMS `16/2/2`、五个聚焦文件 `73/73`、全量 `244/244`、lint、typecheck、build、受保护哈希/inventory、范围、DPG strict audit 和 diff，全部 PASS。任务从 `NEEDS_REVISION` 恢复为 `UNDER_REVIEW`，下一步仅 Round 2。
- 2026-07-30T14:22:35Z：`MSG-TASK-016-ADVERSARIAL-REVIEW-R2` 经 Codex thread turn `019fb367-989d-7980-a6d3-126b20f014bd` 真实投递并记录 dispatched；审查只覆盖 Round 1 P1/P2 closure 与直接回归。
- 2026-07-30T14:29:23Z：ACK Final Round 2 PASS response。Planner 在冻结 Node 24.18.0 上 fresh 重跑 ProductCard `8/3/6`、旧 CMS `16/2/2`、focused `73/73`、full `244/244`、lint、typecheck、build，并复核 TASK-014 `25/25`、13/20 inventory、受保护哈希、范围、零残留、DPG 和 diff 全 PASS；`PLANNER_SUMMARY.md` 已生成。

## Execution Artifacts

- `TDD_RED_EVIDENCE.md`：10 个行为纵切的真实 RED 与最小 GREEN 记录。
- `EXECUTION_REPORT.md`：server-only ProductCard Transport、Validator、wrapper、Adapter 和 orchestration 实施报告。
- `TEST_OR_VALIDATION_LOG.md`：Node 24 当前字节门禁、server-only 负例、受保护哈希和范围证据。
- `DIFF_OR_OUTPUT_SUMMARY.md`：产品行为、修改文件、未改变权威和交付边界。

## Adversarial Review

- Evidence: PASS。
- Final Round 2: `PASS / P0=0 / P1=0 / P2=0`。
- Planner final validation: `PASS`。

## Review History

- Round 1: `FAIL / P0=0 / P1=1 / P2=1`。
- P1: closed-query validator 接受 caller-owned stateful/non-data/reflection-hidden 输入，验证值与传输值可能不同。
- P2: review ACK 后当前叙述仍显示等待 ACK；恢复记录已关闭该叙述问题。
- Revision checkpoint: `PASS`；六类 P1 回归、primitive snapshot 与 transmitted value identity 已在当前字节复现关闭。
- Round 2 PASS 已关闭所有 P1/P2；Round 1 历史未被覆盖或改写。

## Validation Evidence

- Evidence: PASS — Final Round 2 与 Planner fresh final validation 均通过；当前具备受检进入 `AWAITING_USER` 的条件，但仍不代表用户验收。
- ProductCard verifier `8 schemas / 3 success / 6 errors`；旧 CMS verifier `16/2/2`。
- 五个 ProductCard 聚焦文件 `73/73`；完整 Vitest `15 files / 244 tests`；Transport `42/42` 包含六类 Round 1 查询边界回归。
- `npm run lint`、`npm run typecheck`、`npm run build` 全部 exit `0`；build 路由仍仅 `/`、`/_not-found`、`/integration/cms`。
- package/lock、TASK-014 handoff `25/25`、TASK-015 13-file Snapshot、旧 `/resolve` 20-file Snapshot/verifier 哈希与 inventory 均保持基线。
- 产品运行时无 `cms/**`/`TASKS/**`/filesystem/React/`/resolve` 导入；根 README 与 frontend README 已同步。
- project、registry、messages、strict lane audit 和 `git diff --check` 均 PASS。

## User Acceptance

- `ACCEPTED` at `2026-07-30T15:28:57Z` by exact phrase `确认 TASK-016 完成并提交到远端`。

## Formal Delivery Authorization 2026-07-30T15:28:57Z

- 任务内容：建立前端 server-only ProductCard Transport、Runtime Validator、authentic wrapper、readonly DTO Adapter 与一次 collection 请求/零逐卡 `/resolve` 编排。
- 主要变更：增加固定英语 ProductCard collection Transport、8-Schema 与跨字段语义校验、稳定错误与 304 fail-closed、深度只读 DTO；Round 1 查询边界 P1 通过 primitive frozen snapshot 与反射输入拒绝完成修订。
- 验证结果：Final Round 2 `PASS / P0=0 / P1=0 / P2=0`；Node 24.18.0 合同 `8/3/6` 与 `16/2/2`、focused `73/73`、full `244/244`、lint、typecheck、build、TASK-014 `25/25`、13/20 inventory、受保护哈希、范围与 DPG 门均通过。
- 文档更新：根 `README.md`、`frontend/README.md`、TASK-016 四份执行证据、canonical review report 与 `PLANNER_SUMMARY.md` 已同步；明确本任务没有可见 UI、cache、CMS、RFQ/飞书或部署。
- Git 边界：只提交 TASK-016 产品、测试、文档和治理文件；排除既有 `.codex/config.toml` 与历史 resume packets。

## Recovery Entry 2026-07-30T14:06:25Z

- Reason: Round 1 `FAIL / P0=0 / P1=1 / P2=1`。P1 为 closed-query validator 重用 caller-owned filter 且未拒绝反射隐藏 extras；P2 为 reviewer ACK 后当前叙述滞后。
- Helper note: 已按要求运行 `task_transition.py reopen`，但当前插件 helper 只允许从 `AWAITING_USER` 重开并拒绝真实 `UNDER_REVIEW` 状态；本记录执行相同 `NEEDS_REVISION` 恢复语义，未伪造中间状态。
- Next step: frontend 先用 TDD 复现 stateful coercion、non-enumerable、symbol、accessor、Proxy-hidden/reflection failure，再做 primitive snapshot/canonicalization 最小修复；Planner checkpoint 后只进行 Round 2。

## Recovery Entry 2026-07-30T14:30:45Z

- Reason: First checked prepare succeeded, but human-readable current state and Board remained UNDER_REVIEW and audit could not detect current Round 2 PASS review evidence.
- Next step: Synchronize only current AWAITING_USER narrative and explicit current PASS review evidence, rerun strict audit, then run checked prepare-awaiting-user again.

## Recovery Entry 2026-07-30T14:32:21Z

- Reason: Second checked prepare succeeded, but the AWAITING_USER write hook blocked recording its final current-focus completion after the transition.
- Next step: Synchronize only the final waiting-user narrative while NEEDS_REVISION, then run checked prepare-awaiting-user once more and stop.
