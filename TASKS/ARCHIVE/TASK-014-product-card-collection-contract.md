# TASK-014 英语版 ProductCard Collection CMS/API 合同基础
accepted_at: 2026-07-30T05:28:54Z

task_id: TASK-014
status: CLOSED
owner_lane: planner
assigned_lanes: [wordpress_cms, frontend]
review_lane: adversarial_reviewer
linked_issues: []
artifacts_dir: TASKS/ARTIFACTS/TASK-014
acceptance_state: ACCEPTED
recovery_recorded_at: 2026-07-30T05:25:44Z
git_status: MERGED
document_impact: RESOLVED
readme_impact: UPDATED
project_type: software

## 原始请求

> 继续

结合已验收的 TASK-013 `GAP_REPORT.md` 和用户此前要求“每个 Task 颗粒度更高、先完成当前任务再设计下一项”，本任务登记为：

> TASK-014：只实现英语版 normalized ProductCard collection 的 CMS/API/Schema 合同基础；不同时开发前端消费者、SeoDocument 或可见产品页面。

## 结构化理解

- TASK-013 已冻结 ProductCard 的公开字段、四格 lifecycle/action 规则、卡片资格、单次 collection 请求和禁止逐卡 `/resolve` 的边界。
- 当前 CMS `collection.v3` item 只有 `id/type/title/publicPath`，不能真实渲染已冻结的产品卡片。
- 下一步必须先提供一个新增、版本化、封闭且可验证的 ProductCard collection CMS/API 合同，再由后续独立任务建立前端 snapshot/Validator/Transport/Adapter。
- 为降低回退成本，本任务不把 `SeoDocument`、前端消费者和可见 category/card/detail 页面并入同一任务。
- 本任务可以使用受控 Fixture 验证 0/1/N、active/discontinued、detail/no-detail 和无效记录排除，但 Fixture 不等于正式产品导入或生产发布。

## 目标

- 在不破坏既有 `/resolve`、`collection.v3`、navigation 和 route-manifest 合同的前提下，增加版本化 normalized ProductCard collection 合同。
- 输出 TASK-013 `ProductCardProjection` 所需的稳定公开字段：身份、kind、model、name、canonical path、公开保护图、主分类、系列、应用、可空 summary、0～3 个 key attributes、lifecycle、typed action 和 modified time。
- 固化四格动作：
  - active detail product -> `view_product`；
  - discontinued detail product -> `view_product`，详情页未来处理 replacement CTA；
  - active no-detail catalog accessory -> `direct_rfq`；
  - discontinued no-detail catalog accessory -> `replacement_contact`。
- 确保列表一次响应提供 0/1/N 项卡片所需数据，前端未来无需逐卡调用 `/resolve`。
- 通过受控 Fixture、Golden/error samples、Schema 校验和真实本地 WordPress REST 测试证明合同。
- 产出前端后续接入所需的不可变 Schema 清单、SHA-256 handoff 和精确消费边界。

## 非目标

- 不修改 `frontend/**`，不建立 collection snapshot、frontend Validator、Transport、Adapter、React 卡片或可见页面。
- 不实现 `SeoDocument`、Next.js Metadata、canonical origin、Breadcrumb、JSON-LD、Sitemap 或 robots。
- 不实现产品详情 lifecycle CTA、询价清单、RFQ 写入 API、飞书连接或 Article Number 自动解析。
- 不导入、发布或迁移正式产品，不把三个 `TEST_CANDIDATE` 升级为生产数据。
- 不连接或修改飞书真实 Base，不建立同步、Webhook、Preview、缓存、Staging 或部署。
- 不修改 WordPress Core、SCF 插件源码、数据库结构、用户、凭据或生产内容。
- 不添加运行时依赖，不采购或安装 WPML、ACFML、SEO 或其他插件。
- 不提交、推送、合并或部署，除非后续收到正式交付口令。

## 交付物

- GDHE Site 插件内新增或扩展的版本化 ProductCard collection JSON Schema、配置 manifest 与 REST projection。
- 受控字段/Fixture 支撑，仅限合同验证所必需的最小实现。
- 0/1/N、分页/排序、active/discontinued、detail/no-detail、缺图/无主分类/错误动作/内部 ID 泄漏等 Golden 与 negative samples。
- 可重复的 PHP/Python/JSON Schema 验证，包含本地 WordPress REST 运行证据、Fixture 精确清理和零残留证明。
- CMS 权威 Schema 图、新增前端 handoff closure 的文件清单与 SHA-256。
- `TASKS/ARTIFACTS/TASK-014/` 下的设计、计划、执行报告、差异摘要、验证日志、前端只读 handoff 审计、独立对抗审查和 Planner Summary。
- 更新根 `README.md`、`docs/cms/README.md` 和架构契约中与新 API/Schema 使用方式直接相关的最小说明。

## 验收标准

- 新合同是 additive、版本化且封闭的；既有 Schema 3、`/resolve` 16-file closure、`collection.v3` 行为及现有 Golden/error fixtures 无回归。
- ProductCard item 不含 WordPress/database/attachment ID、原始 `meta/acf/SCF`、飞书记录 ID、供应商/成本/价格/库存/利润、内部备注或原图路径。
- `detail_product.publicPath` 必须是 canonical path；`catalog_accessory.publicPath` 必须为 `null`，不得伪造详情 URL。
- 公开卡片必须具备稳定 UUID、model、英语 name、业务预制公开保护图、显式主分类、合法 lifecycle/action；缺失或矛盾记录按冻结规则从集合排除。
- `summary` 缺失时明确为 `null`；`keyAttributes` 为 0～3 项受控结构，不制造区间、组合或 Article Number。
- series/applications 只输出公开且可链接的目标；无效或未公开目标不产生死链接。
- 0、1、N 项均使用一次 collection HTTP 请求取得；输出分页、总数和排序稳定，且 total 只计算满足公开卡片合同的记录。
- active/discontinued 与 detail/no-detail 四格动作均有正向和反向证据；CMS 不猜测 Article Number 或询价规格。
- 所有 Fixture 都标注 `TEST_CANDIDATE/noindex` 语义，仅用于本地合同验证；测试结束后数据库、迁移标记和临时文件零残留。
- frontend Lane 只读确认 handoff 足以支持下一项 frontend snapshot/Validator/Transport/Adapter 任务；本任务不修改任何前端文件。
- 独立 adversarial review 最终为 `PASS / P0=0 / P1=0 / P2=0`。

## 允许修改范围

- `cms/wp-content/plugins/gdhe-site/**`
- `README.md`
- `docs/cms/README.md`
- `docs/architecture/headless-wordpress-nextjs-contract.md`
- `TASKS/ACTIVE/TASK-014-product-card-collection-contract.md`
- `TASKS/ARTIFACTS/TASK-014/**`
- `PROJECT/STATE.md`
- `PROJECT/ACTIVITY.md`
- `TASKS/BOARD.md`
- `TASKS/ARCHIVE/INDEX.md`
- `TASKS/ARCHIVE/TASK-013-english-ia-url-cta-card-seo-contract.md`
- `LANES/planner/**`
- `LANES/wordpress_cms/**`
- `LANES/frontend/**`
- `LANES/adversarial_reviewer/**`
- 当前任务所需的 `LANES/messages/**` 与 `LANES/registry/events.jsonl`

## 禁止修改范围

- `frontend/**`
- WordPress Core、`cms/wp-admin/**`、`cms/wp-includes/**`
- SCF 或第三方插件源码
- `.local/**`、`.env*`、`wp-config.php`、数据库备份、SQL 导出、uploads 和运行时产物
- `package.json`、lockfile、Composer/npm 依赖和构建配置
- 飞书、极空间、DNS、GitHub 配置、Staging/生产环境和外部 SaaS
- 正式产品数据、用户附件原文件和内部无保护图片

## 约束

- 以 TASK-013 `PRODUCT_CARD_PROJECTION.md` 与 `GAP_REPORT.md` 为直接合同权威。
- 以 TASK-012 已确认的产品身份、公开字段、媒体、关系、停产和询价规则为业务权威。
- 新实现必须 additive；不得静默改写 TASK-007 已交付的 `collection.v3` 或扩大 TASK-008～TASK-011 的 frontend `/resolve` 消费范围。
- 公开媒体只允许业务方预制的保护成品图；测试素材不得被宣称为生产发布资产。
- 英语仍是唯一公开 locale；不增加语言入口、翻译、hreflang 或 RTL 实现。
- 10～20 个最终生产产品门继续阻塞正式批量导入、产品模板业务冻结和 Schema 业务冻结；本任务只交付技术合同基础。

## 假设和待确认事项

- 技术设计优先采用新增版本化 projection/endpoint，保留现有 `collection.v3` 不变；具体 route 和 Schema 文件名需在实施前的 DESIGN checkpoint 中证明为 additive。
- 受控 Fixture 可以使用 TASK-013 三个候选的最小合法子集，但不得依赖尚未取得的正式英语文案、保护图或完整规格。
- 如实现 normalized card 必须新增长期 SCF 编辑字段、改变真实产品身份或修改既有公开 API 语义，停止并由 Planner 重新向用户确认，不自行扩大范围。

## 验证计划

1. 建立既有 19-file CMS graph、16-file `/resolve` closure、REST route、Golden/error 和插件版本基线。
2. 先形成 DESIGN 与 IMPLEMENTATION_PLAN，冻结 additive route/version、字段来源和回滚策略，再允许修改 CMS 插件。
3. 以测试先行覆盖 closed Schema、四格 action、资格排除、0/1/N、分页/总数、无内部字段和旧合同无回归。
4. 使用独立 Fixture 生命周期运行真实本地 WordPress REST 验证；执行前备份，结束后精确回滚并证明零残留。
5. 生成新 Schema graph、handoff closure、文件清单和 SHA-256；由 frontend Lane 做只读消费可行性审计。
6. 运行 PHP syntax、JSON、Schema、Golden/negative、现有回归、Markdown/链接、protected scope、project/registry/messages/strict lane 和 `git diff --check`。
7. 交由 adversarial_reviewer 独立检查破坏兼容、N+1、内部字段泄漏、错误 action、伪造生产资格、Fixture 残留和越权前端实现。

## 文档影响

`RESOLVED`：任务范围已明确要求同步 CMS 使用说明、根 README 与架构契约；正式验收前必须与实际实现一致。

## README 影响

`UPDATED`：新增 CMS/API/Schema 使用与验证方式会改变开发者流程；正式验收前更新根 README 和 `docs/cms/README.md`。

## 分支和 Worktree

- 分支：`codex/TASK-014-product-card-collection-contract`
- Worktree：当前共享项目工作区
- 基线：`main` / `origin/main` at `72d500bd2bb424a0f3896b336f3e9a3d79f90ab9`

## 当前状态

`CLOSED / ACCEPTED / MERGED`。用户于 2026-07-30T05:28:54Z 使用精确口令正式验收 TASK-014；正式提交 `c8417089c716244a4739ae17b7abe6c5f31ef929` 已推送到任务分支、fast-forward 合并到 `main` 并推送。2026-07-30T05:38:12Z 已核验本地/远端任务分支和 `main` 均指向该提交，任务完成归档。

## 恢复入口

先读 `AGENTS.md`、`PROJECT/COORDINATION.md`、`PROJECT/AGENT_LANES.md`、`LANES/registry/lanes.json`、本任务文件，再读 `PROJECT/STATE.md`、`TASKS/BOARD.md`、TASK-013 `PRODUCT_CARD_PROJECTION.md` 与 `GAP_REPORT.md`。

## 下一步

已归档。后续 TASK-015 只建立前端 ProductCard Contract Snapshot 与离线权威校验器；其实施仍须单独取得需求确认。

## Lane Plan

| lane | responsibility | write_scope | expected_artifacts | status |
|---|---|---|---|---|
| planner | 需求边界、状态、消息、checkpoint、最终验证与用户汇报 | `PROJECT/**`、`TASKS/**`、`LANES/**`、授权文档 | intake、checkpoint、Planner Summary | CLOSED |
| wordpress_cms | 按已冻结设计以 TDD 实现 additive ProductCard collection CMS/API/Schema、Fixture、回滚和验证 | `cms/wp-content/plugins/gdhe-site/**`、TASK-014 artifacts、lane records | RED/GREEN 证据、实现、fixtures、schema/handoff、execution report | CLOSED |
| frontend | 对新 CMS handoff 做只读消费可行性与 N+1 边界审计，不改前端 | TASK-014 artifacts、lane records | frontend read-only handoff audit | CLOSED |
| adversarial_reviewer | 对业务交付物只读独立审查 | canonical review report、reviewer lane records | PASS/FAIL/P0/P1/P2 report | CLOSED |

## Messages

- `MSG-TASK-014-WORDPRESS-CMS-IMPLEMENTATION` 与其 execution response 已完成、回传并由 Planner ACK。
- `MSG-TASK-014-WORDPRESS-PUBLIC-REFERENCE-P1-R1` 与其 execution response 已完成、回传并由 Planner ACK。
- Planner checkpoint 记录于 `TASKS/ARTIFACTS/TASK-014/PLANNER_CMS_CHECKPOINT.md`，P1 已关闭并通过独立验证。
- `MSG-TASK-014-FRONTEND-HANDOFF-READONLY-AUDIT` 与其 response 已完成并由 Planner ACK；结论 `FAIL / P0=0 / P1=2 / P2=1`。
- `MSG-TASK-014-WORDPRESS-FRONTEND-HANDOFF-P1-R1` 与其 response 已完成并由 Planner ACK；两项 P1 已通过独立 checkpoint。
- `MSG-TASK-014-FRONTEND-HANDOFF-READONLY-AUDIT-R2` 与其 response 已完成并由 Planner ACK；结论 `PASS / P0=0 / P1=0 / P2=1`。
- `MSG-TASK-014-ADVERSARIAL-REVIEW-R1` 已完成；corrected response 已由 Planner ACK。Round 1 为 `FAIL / P0=0 / P1=2 / P2=1`，只允许按恢复文档做窄修订。
- `MSG-TASK-014-WORDPRESS-ADVERSARIAL-P1-R1-CONTINUATION` 与 corrected response 已完成并由 Planner ACK；初始权威冲突 blocker 和旧 response retraction 历史保留。
- Round 1 revision checkpoint 已通过，准备受控派发 adversarial Round 2。
- `MSG-TASK-014-ADVERSARIAL-REVIEW-R2` 与 response 已完成并由 Planner ACK；最终 `PASS / P0=0 / P1=0 / P2=0`。

## 执行记录

- 2026-07-30T05:38:12Z：核验本地 `main`、`origin/main`、本地 TASK-014 分支与远端 TASK-014 分支均为正式提交 `c8417089c716244a4739ae17b7abe6c5f31ef929`；任务归档为 `CLOSED / MERGED`。
- 2026-07-29T16:15:22Z：TASK-014 完成任务登记。
- 2026-07-29T16:26:57Z：用户确认需求；任务进入 `READY`，开始设计与 dispatch 准备。
- 2026-07-29T16:46:06Z：DESIGN、IMPLEMENTATION_PLAN 与 baseline validation 通过；任务进入 `IN_PROGRESS`，准备受控派发 wordpress_cms。
- 2026-07-29T18:12:35Z：WordPress/CMS TDD 实现 response 已完成受控回传并由 Planner ACK。
- 2026-07-29T18:26:34Z：Planner 独立验证确认运行、回归与零残留通过，但发现公开 reference `id` 未绑定 resolved target stable UUID 的 P1；只允许单一窄修订。
- 2026-07-29T18:41:52Z：P1 R1 完成；Planner 独立重跑 ProductCard/A3/零残留并重新冻结 24 项 handoff checksum，CMS checkpoint `PASS`。
- 2026-07-29T18:54:15Z：frontend handoff 只读审计 `FAIL / P0=0 / P1=2 / P2=1`；只修真实 1-item HTTP 与非空合法 series/applications 正向证据。
- 2026-07-30T03:57:47Z：两个 frontend handoff P1 已完成并通过 Planner 独立 checkpoint；准备 Round 2 窄复核。
- 2026-07-30T04:07:22Z：frontend Round 2 `PASS / P0=0 / P1=0 / P2=1`；执行报告完成，任务进入 `UNDER_REVIEW`。
- 2026-07-30T04:24:46Z：adversarial review Round 1 `FAIL / P0=0 / P1=2 / P2=1`；response 已 ACK。`task_transition.py reopen` 因只接受 `AWAITING_USER` 而安全拒绝且无 mutation；Planner 按真实 review 状态记录 `UNDER_REVIEW` -> `NEEDS_REVISION`，仅修路由角色、分页溢出与两个 reviewer `.pyc` 残留。
- 2026-07-30T04:29:22Z：wordpress_cms 在 mutation 前发现初始 revision assignment 将主分类错误写成 `/products/category/...` 且引用了不存在的合同文件，受控阻断且未产生 CMS/Fixture/DB 修改。Planner ACK blocker，并按真实 `URL_AND_CANONICAL_CONTRACT.md` 更正为两类主分类路径族。
- 2026-07-30T05:03:54Z：WordPress 窄修订 corrected response 已 ACK。Planner 独立发现并关闭 Schema-only inline positive 旧 namespace，重跑 ProductCard 两轮 determinism、A3 runtime/Schema、零残留、25/25 handoff、Core/SCF/DB、PHP/JSON/Python、scope 与治理门全部通过；任务 `NEEDS_REVISION` -> `UNDER_REVIEW`。
- 2026-07-30T05:18:31Z：adversarial Round 2 最终 `PASS / P0=0 / P1=0 / P2=0`，response 已 ACK；Planner 复核当前 checksums、旧 namespace/pyc、governance 和 diff 全部通过，生成 `PLANNER_SUMMARY.md`，准备 checked `prepare-awaiting-user`。
- 2026-07-30T05:23:00Z：第一次 checked `prepare-awaiting-user` 通过；因 helper 未同步 Board 和当前人类可读段落，随后受控 reopen 只做显示一致性恢复。
- 2026-07-30T05:24:10Z：状态显示已同步，并再次运行 checked `prepare-awaiting-user`；任务最终进入 `AWAITING_USER / NOT_ACCEPTED / DIRTY`。

## Execution Artifacts

- `TASKS/ARTIFACTS/TASK-014/DESIGN.md`
- `TASKS/ARTIFACTS/TASK-014/IMPLEMENTATION_PLAN.md`
- `TASKS/ARTIFACTS/TASK-014/WORDPRESS_CMS_EXECUTION_REPORT.md`
- `TASKS/ARTIFACTS/TASK-014/PLANNER_CMS_CHECKPOINT.md`
- `TASKS/ARTIFACTS/TASK-014/FRONTEND_HANDOFF_AUDIT_REQUEST.md`
- `TASKS/ARTIFACTS/TASK-014/FRONTEND_HANDOFF_READONLY_AUDIT.md`
- `TASKS/ARTIFACTS/TASK-014/FRONTEND_HANDOFF_P1_REVISION.md`
- `TASKS/ARTIFACTS/TASK-014/FRONTEND_HANDOFF_P1_REVISION_REPORT.md`
- `TASKS/ARTIFACTS/TASK-014/FRONTEND_HANDOFF_P1_CHECKPOINT.md`
- `TASKS/ARTIFACTS/TASK-014/FRONTEND_HANDOFF_R2_AUDIT_REQUEST.md`
- `TASKS/ARTIFACTS/TASK-014/EXECUTION_REPORT.md`
- `TASKS/ARTIFACTS/TASK-014/ADVERSARIAL_REVIEW_REQUEST.md`

## Adversarial Review

- Current result：`PASS / P0=0 / P1=0 / P2=0`；Planner final validation allowed。
- Evidence：`TASKS/ARTIFACTS/TASK-014/ADVERSARIAL_REVIEW_REPORT.md` 保留 Round 1 历史并记录独立 Round 2 closure；`PLANNER_ADVERSARIAL_R1_REVISION_CHECKPOINT.md` 与 `TEST_OR_VALIDATION_LOG.md` 记录 fresh runtime、回归和零残留证据。
- Closure：路由角色绑定、极端分页溢出、Schema-only 旧 namespace 和 reviewer `.pyc` 残留均已关闭。
- Boundary：PASS 不等于用户验收，不授权 frontend、TASK-015、Git 或部署。

## Historical Adversarial Review Record

- Round 1：`FAIL / P0=0 / P1=2 / P2=1`；Planner final validation 不允许。
- P1：taxonomy reference 虽绑定稳定 UUID 与唯一公开目标，但未绑定 `primaryCategory`、`series`、`applications` 的冻结路由角色；当前 Fixture/Golden 接受了错误的 `/products/category/...` 与 `/products/series/...`。
- 权威更正：`primaryCategory` 仅允许 `/products/curtain-track-systems/...` 或 `/products/accessories/...` 的冻结层级；`series` 为 `/series/...`；`applications` 为 `/applications/...`。不得实现通用 `/products/category/...`。
- P1：超大 digit-only `page` 会饱和为 `PHP_INT_MAX`，随后 offset 计算溢出为 float，并在 `array_slice` 抛出 `TypeError`，没有返回规范化 `400 no-store`。
- P2：reviewer Python import 生成两个精确已识别的 `.pyc`；reviewer scope 正确阻止清理，必须由有权 wordpress_cms lane 精确删除并证明无残留。
- 其余 additive 合同、8-file/25-checksum、A3、0/1/N、四格动作、缓存/304、确定性和已通过 frontend handoff 边界保持通过。
- `task_transition.py reopen` 已按要求执行；因 helper 只接受 `AWAITING_USER` 而安全拒绝，没有 mutation。Planner 未伪造中间验收状态，直接记录真实 `NEEDS_REVISION` recovery。
- Round 1 revision checkpoint：两个 P1 与 reviewer `.pyc` P2 均已由 wordpress_cms 修订，并经 Planner 独立运行验证关闭；尚未取得 Round 2 verdict。
- Round 2 final：`PASS / P0=0 / P1=0 / P2=0`；两项 P1、Schema-only 旧 namespace 和 reviewer `.pyc` P2 均独立关闭。PASS 不等于用户验收。

## Frontend Handoff Audit

- Round 1：`FAIL / P0=0 / P1=2 / P2=1`。
- P1：缺少真实 1-item HTTP 成功响应；缺少合法非空 series/applications 正向输出。
- P2：生产媒体 origin 与 Next Image allowlist 保留为未来可见页面/部署 gate，不阻塞纯合同快照。
- `task_transition.py reopen` 已按治理要求调用；因当前任务仍为 `IN_PROGRESS` 而非 `AWAITING_USER`，helper 安全拒绝且未修改状态。任务保持实现循环内的 `IN_PROGRESS`。
- 两个 P1 的 CMS 修订与 Planner checkpoint 已完成。
- Round 2 current verdict：`PASS / P0=0 / P1=0 / P2=1`；Round 1 历史保留。P2 仅是未来可见页面/部署 gate。

## Validation Evidence

- TDD：缺少 ProductCard root Schema 与 REST route 的预期 RED 已记录；随后最小 GREEN。
- 新增 GDHE Site 0.5.0、`/gdhe/v1/product-cards` 与独立 ProductCard Schema 1.0.0；Content Schema 3.0.0 和旧 endpoint 保持不变。
- ProductCard 8 Golden、9 request negatives、12 invalid/unpublished exclusions、四格 action、真实 0/1/N、分页 `2/2/0` 与 invariant total `4/4/4` 通过。
- 两轮 Fixture 使用不同 WordPress database IDs，8/8 Golden hashes 相同；每轮精确清理 19 posts/3 terms，TASK-014 与 A3 数据、option、marker 和 uploads 零残留。
- 既有 A3 19-file Schema graph、15 Golden、6 boundary negatives 与 runtime total `3/3/3` 回归通过。
- PHP、JSON、25 handoff checksums、scope、project、registry、messages、strict lane 和 `git diff --check` 通过。
- P1 R1：真实 WordPress RED 证明 mismatch 曾被接受；shared helper 最小修复后，source UUID 必须等于 resolved target stable UUID，`primaryCategory`/`series`/`applications` mismatch 均被拒绝。
- Planner 独立复核：ProductCard 两轮不同数据库 ID 的 7/7 Golden hashes 一致；12/12 invalid/unpublished exclusions；A3 19/15/6 与 runtime `3/3/3` 通过；TASK-014/A3 六项数据库残留均为 0。
- Planner 重跑动态证据后已重新冻结并复核 ProductCard handoff 24/24 checksums；根 README 和架构契约已同步当前事实。
- frontend 只读审计独立复核上述 passing 边界，但指出 runtime Golden counts 为 `4/0/4/2/2/0/4`，没有 1 item；所有成功样本的 `series/applications` 均为空。两项均须由 CMS 权威证据关闭后再复核。
- P1 closure：新增真实 1-item HTTP Golden；合法 card 输出非空 series/application；两轮 8/8 determinism、25/25 handoff、A3 19/15/6 与六项零残留由 Planner 独立重跑通过。
- frontend Round 2 独立复算 8-file、25/25 checksum、8 success、9 error、one-item、non-empty relations、mismatch、actions、cache/304、determinism 和 zero residue 全部通过。
- adversarial Round 1 独立复核上述主体证据，同时实际复现路由角色未绑定和极端 `page` offset 溢出两个 P1；最终验证在修订前被阻止。
- Planner fresh validation：真实 ProductCard 两轮使用不同数据库 ID，8/8 Golden hashes 一致，每轮清理 19 posts/3 terms；11 request negatives、12 exclusions、role mismatch 与极端分页通过。
- Planner A3 fresh regression：19-file Schema graph、15 Goldens、6 boundary negatives、collection total `3/3/3`、items `2/1/0` 通过；cleanup 18 posts/1 attachment/5 terms。
- Planner byte-level checkpoint：Schema-only inline positive 已改为 `/products/curtain-track-systems/synthetic-tracks/`；active handoff 范围 `/products/category/` 与 `/products/series/` 扫描为 0；25/25 checksum 通过。
- Cleanup/integrity：TASK-014/A3 六项数据库残留为 `0`；plugin tests 无 `.pyc`/`__pycache__`；GDHE Site PHP/JSON/Python、WordPress Core、SCF、12-table DB、project/registry/messages/strict lane 与 `git diff --check` 通过。
- Post-review Planner final validation：25/25 checksum、active handoff 旧 namespace 0、plugin-test pyc/cache 0、project/registry/messages/strict lane 与 `git diff --check` fresh PASS。

## Planner Final Summary

- 已生成：`TASKS/ARTIFACTS/TASK-014/PLANNER_SUMMARY.md`。
- TASK-014 仅交付 normalized ProductCard CMS/API/Schema 技术合同；没有可见前端页面、正式产品数据、SeoDocument、RFQ 写入、飞书同步或部署。
- 所有验收标准均有 execution、Planner 和独立 review 证据；等待 checked transition 后由用户决定是否正式交付。

## User Acceptance

`ACCEPTED` at 2026-07-30T05:28:54Z by exact phrase `确认 TASK-014 完成并提交到远端`。

## Recovery Entry 2026-07-30T05:24:10Z

- Reason: Checked prepare succeeded, but TASKS/BOARD and current human-readable status text remained stale because the transition helper updates only canonical status fields.
- Next step: Synchronize the human-readable acceptance view, rerun validation, then rerun checked prepare-awaiting-user without changing implementation or authorization.

## Recovery Entry 2026-07-30T05:25:44Z

- Reason: Strict project audit found that the current Adversarial Review section still mixed historical FAIL text with the final PASS and lacked an explicit evidence label.
- Next step: Separate the final PASS evidence from the preserved historical review record, rerun the strict audit, then rerun checked prepare-awaiting-user.
