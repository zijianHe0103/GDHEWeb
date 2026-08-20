# TASK-002 Headless WordPress + Next.js 前端架构契约
accepted_at: 2026-07-22T09:07:14Z

task_id: TASK-002
status: CLOSED
owner_lane: planner
assigned_lanes: [planner, frontend, wordpress_cms, localization_seo]
review_lane: adversarial_reviewer
linked_issues: []
artifacts_dir: TASKS/ARTIFACTS/TASK-002
acceptance_state: ACCEPTED
recovery_recorded_at: 2026-07-22T08:56:55Z
git_status: PUSHED
document_impact: RESOLVED
project_type: software

## 原始请求

> 创建 TASK-002：制定 Headless WordPress + Next.js 前端架构契约，暂不初始化正式前端项目。

## 结构化理解

- 将 Next.js 作为独立海外官网前端的目标技术方向，将现有 WordPress 与 `wp-admin` 定义为最终 Headless CMS 后台。
- 本任务只研究、比较、决策并写出可实施的架构契约，不运行 Next.js 初始化，不安装 npm/WordPress 插件，不修改 CMS 数据库或业务页面。
- 架构契约需要覆盖前端渲染、WordPress API、内容模型、九语言人工发布、SEO、预览、缓存、媒体、询盘和未来后台接入边界。
- RapidDirect 只作为信息架构、视觉节奏、组件和转化路径参考，不复制其源码、主题、品牌素材或文案。

## 目标

- 明确 Next.js + Headless WordPress 的系统边界、职责、数据流和部署形态。
- 在 REST API、WPGraphQL 或受控组合之间给出有证据的推荐与使用边界。
- 定义 WordPress 内容模型、字段、媒体、SEO 和译文关联的原则，确保全部内容可由 `wp-admin` 管理。
- 固化九语言 URL、人工翻译、发布状态、当前页面语言切换、hreflang 和阿拉伯语 RTL 契约。
- 定义草稿预览、缓存失效、Webhook、鉴权、安全、询盘/上传与后续 CMS 扩展边界。
- 形成下一任务可直接用于初始化前端与 CMS 基础结构的实施输入。

## 非目标

- 不创建或初始化 `frontend/`、Next.js、TypeScript、Tailwind 或其他正式前端工程。
- 不运行 `npm`、`pnpm`、`yarn`、`npx create-next-app` 或任何依赖安装。
- 不安装、升级或配置 WordPress 插件、主题、CPT、ACF 字段或数据库内容。
- 不开发 Header、Mega Menu、Footer、首页、页面模板、后台功能或询盘表单。
- 不部署、不配置域名/CDN、不开通第三方 SaaS，不修改 GitHub 仓库设置。
- 不复制 RapidDirect 的受保护源码、主题、图像、视频、字体或原文。

## 交付物

- `docs/architecture/headless-wordpress-nextjs-contract.md`：主架构契约。
- `MEMORY/DECISIONS/ADR-004-headless-wordpress-nextjs-contract.md`：经审查的关键技术决策记录。
- `TASKS/ARTIFACTS/TASK-002/`：执行报告、验证日志、差异摘要、对抗审查和 planner summary。
- 同步后的 `PROJECT/STATE.md`、`TASKS/BOARD.md`、`PROJECT/ACTIVITY.md` 与相关 lane worklog。

## 验收标准

- 契约明确选择 Next.js + TypeScript 作为独立前端，WordPress `wp-admin` 作为唯一最终内容后台，并说明两者的责任边界。
- 给出 REST、WPGraphQL 或组合方案的明确结论、理由、适用端点、鉴权和失败边界；不能只列选项不作决策。
- 定义 Services、Industries、Materials、Surface Finishes、Cases、Blog、Pages、Testimonials 等内容类型及共享字段原则。
- 明确 ACF/ACF Pro、原生字段、CPT/Taxonomy 和版本化字段导出的建议与许可证边界；无法确认的内容标为“待验证”或“推测”。
- 固化英语 `/` 及 `/fr/`、`/de/`、`/es/`、`/zh-CN/`、`/ar/`、`/hi/`、`/ja/`、`/pt/`，并覆盖当前页面译文切换、独立发布、缺失译文、hreflang 与 RTL。
- 覆盖 SSR/SSG/ISR 或等效渲染策略、预览、Webhook/按需刷新、缓存层、媒体优化、SEO/Schema、Sitemap、Robots、Canonical 和 Open Graph。
- 明确询盘、文件上传、邮件/CRM、权限、秘密配置、速率限制、日志与错误恢复边界，但不实现这些功能。
- 给出建议目录/模块边界、数据契约示例和后续阶段顺序，同时明确本任务未初始化任何正式项目。
- 所有关键结论具有官方或一手资料证据；时间敏感版本与插件能力在执行时重新核实。
- governance validate、lane registry validate 和 lane message validate 通过，adversarial review 为 PASS，文档影响为 `RESOLVED`。

## 允许修改范围

- `docs/architecture/headless-wordpress-nextjs-contract.md`
- `MEMORY/DECISIONS/ADR-004-headless-wordpress-nextjs-contract.md`
- `PROJECT/STATE.md`
- `PROJECT/ACTIVITY.md`
- `PROJECT/MANIFEST.md`
- `TASKS/BOARD.md`
- `TASKS/ACTIVE/TASK-002-headless-wordpress-nextjs-architecture-contract.md`
- `TASKS/ARTIFACTS/TASK-002/**`
- `LANES/planner/worklog.md`
- `LANES/frontend/worklog.md`
- `LANES/wordpress_cms/worklog.md`
- `LANES/localization_seo/worklog.md`
- `LANES/adversarial_reviewer/worklog.md`
- `LANES/registry/lanes.json`
- `LANES/registry/events.jsonl`
- `LANES/messages/**`

## 禁止修改范围

- `frontend/**`
- `cms/**`
- `.local/**`
- `package.json`、lockfile、Node/Next.js 配置和依赖目录。
- WordPress 数据库、插件、主题、uploads、用户、权限和运行配置。
- GitHub 远程 refs、仓库设置、默认分支、部署或域名配置。
- `docs/reference-site-analysis.md` 的历史研究正文。

## 约束

- 默认英语，其余八种语言由编辑人员在 `wp-admin` 中分别保存、审核和独立发布；不把机器翻译作为正式发布流程。
- 语言切换进入当前页面的对应译文，不能统一返回首页；未发布译文不生成公开路由或 hreflang。
- 阿拉伯语必须支持组件级 RTL；内容模型和前端契约不能把 LTR 假设写死。
- 前端不依赖 WordPress 主题或 Elementor 进行页面渲染；所有最终内容管理仍在 `wp-admin` 完成。
- 数据结构需支持以后维护产品/服务、案例、文章和页面，而不在本任务实现后台扩展。
- 关键技术判断优先引用 Next.js、WordPress、WPGraphQL、插件厂商等官方一手资料；无法准确确认时明确标记不确定性。

## 假设和待确认事项

- “Next.js”已作为目标方向，但具体稳定版本、部署平台和包管理器留到正式初始化任务按当时官方稳定版决定。
- API 最终采用 WPGraphQL、REST 或组合方案，由本任务基于内容查询、预览、缓存、插件维护和安全边界形成结论。
- 多语言内容关联插件/模型、ACF 或 ACF Pro、SEO 插件与表单/CRM 集成仍需在契约中比较并明确推荐。
- 本任务不要求购买商业插件；涉及许可证的建议必须列出开源替代或后续采购门。

## 验证计划

- 重新读取当前 ADR、项目约束、RapidDirect 研究快照和本地 WordPress 现场，只将仍有效内容纳入契约。
- 使用官方一手资料核实 Next.js 渲染/缓存/预览能力、WordPress REST 能力、WPGraphQL/多语言/SEO 插件公开接口与维护状态。
- 用责任矩阵检查前端、CMS、翻译、SEO、媒体、询盘、缓存、部署和安全边界是否唯一且无重叠。
- 用代表页面（服务详情、行业、材料、表面处理、博客详情、联系/RFQ）走查内容模型与 API 数据流。
- 检查九语言发布状态、当前页面语言切换、缺失译文、hreflang、RTL 和草稿预览的边界案例。
- 检查 Git diff，确认没有 `frontend/**`、`cms/**`、依赖文件、数据库或远程 refs 变化。
- 运行 governance、lane registry、lane message validation 和 non-strict audit。

## 文档影响

RESOLVED：主架构契约、ADR、专业证据、两轮审查历史、验证日志、差异摘要与 planner summary 已同步；没有需要另行修改的运行手册或实现文档。

## 分支和 Worktree

- 分支：`codex/TASK-002-headless-architecture-contract`
- Worktree：当前项目根目录，不创建额外 worktree。

## 当前状态

CLOSED

## 恢复入口

先读 `AGENTS.md`、`PROJECT/COORDINATION.md`、`PROJECT/AGENT_LANES.md`、`LANES/registry/lanes.json`、本任务文件，再读 `PROJECT/STATE.md`、`TASKS/BOARD.md`、现有 ADR 和 RapidDirect 研究快照。

## 下一步

第一轮 `FAIL` 的三项意见已按窄范围修订并通过 fresh validation；第二轮最终独立审查为 `PASS`，P0=0、P1=0，document impact 已同步为 `RESOLVED`。用户于 2026-07-22T09:07:14Z 使用精确口令正式验收；正式提交 `1cf97ce837e9f4621a63fad736c84a9bdb028a5a` 已推送至 `origin/codex/TASK-002-headless-architecture-contract`。

任务已关闭并归档。后续实施从独立的 TASK-003 前端基础初始化需求卡开始。

## Lane Plan

| lane | responsibility | write_scope | expected_artifacts | status |
|---|---|---|---|---|
| planner | 统筹研究范围、整合冲突、形成主契约与最终摘要 | 本任务允许的 docs、ADR、task/project/artifacts | architecture contract、execution report、planner summary | completed and accepted |
| frontend | 审核 Next.js 渲染、路由、数据获取、预览、缓存、目录与部署边界 | frontend worklog、TASK-002 artifacts | frontend architecture evidence | completed |
| wordpress_cms | 审核 WordPress API、内容模型、字段、权限、媒体和后台操作边界 | wordpress_cms worklog、TASK-002 artifacts | CMS/API architecture evidence | completed |
| localization_seo | 审核九语言、发布状态、hreflang、RTL、SEO 与 Schema 契约 | localization_seo worklog、TASK-002 artifacts | localization/SEO evidence | completed |
| adversarial_reviewer | 独立挑战架构假设、证据、遗漏、过度设计和禁止修改范围 | review report、reviewer worklog | PASS/FAIL/BLOCKED review | round 2 PASS completed |

## Messages

- `MSG-TASK-002-FRONTEND-ARCHITECTURE` / `-RESPONSE` — `done`。
- `MSG-TASK-002-WORDPRESS-CMS-ARCHITECTURE` / `-RESPONSE` — `done`。
- `MSG-TASK-002-LOCALIZATION-SEO-ARCHITECTURE` / `-RESPONSE` — `done`。
- 三条 specialist stop recovery 状态消息已由 planner 同步并 ack — `done`。
- `MSG-TASK-002-ADVERSARIAL-REVIEW` / `-RESPONSE` — round 1 review — `done`，verdict `FAIL`。
- `MSG-TASK-002-ADVERSARIAL-REVIEW-RECOVERY-REQUEST` — Round 1 recovery — `done`。
- `MSG-TASK-002-ADVERSARIAL-REVIEW-R2` / `-RESPONSE` — round 2 final review — `done`，verdict `PASS`。
- `MSG-TASK-002-ADVERSARIAL-REVIEW-R2-STOP-RECOVERY` — final lifecycle recovery — `done`。

## 执行记录

- 2026-07-22T07:46:28Z：用户要求创建 TASK-002；已完成 task-switch 检查并冻结为纯架构契约任务，未初始化前端或修改 WordPress。
- 2026-07-22T07:54:57Z：按用户授权创建并注册 6 个独立 Codex 持久化会话；所有 7 个 lanes 均使用真实 thread ID，错误的临时 reviewer 标识已完成替换与 handoff。TASK-002 仍未开始执行。
- 2026-07-22T07:59:38Z：收到精确口令 `确认 TASK-002 需求并开始执行`；需求状态由 `AWAITING_REQUIREMENT_CONFIRMATION` 转为 `READY`，实施范围与禁止修改范围保持不变。
- 2026-07-22T08:02:00Z：创建三条受控 execution request，dispatch dry-run 正确解析真实 Lane 会话，并向 frontend、wordpress_cms、localization_seo 三个持久化会话派发；任务由 `READY` 转为 `IN_PROGRESS`。
- 2026-07-22T08:17:24Z：三个专业 Lane 的证据和 execution response 已接收并 ack；planner 明确记录 WPGraphQL/REST 与 WPML/Polylang 分歧，裁决为首期 REST-first + Polylang Pro，同时保留有证据的新 ADR 重评门。主契约、ADR 与 `EVIDENCE_SYNTHESIS.md` 已形成；未初始化前端或修改 WordPress。
- 2026-07-22T08:25:21Z：执行报告、验证日志和差异摘要完成；governance、registry、messages、lane audit、WordPress checksum、边界、JSON、验收术语和 diff 检查通过。创建并 dry-run `MSG-TASK-002-ADVERSARIAL-REVIEW`，任务转为 `UNDER_REVIEW`。
- 2026-07-22T08:37:24Z：第一轮审查 response 已 ack；verdict `FAIL`，P1 为多语言媒体 alt 模型不闭合，P2 为 translationGroupId 事实源与 GraphQL 重评预算。`task_transition.py reopen` 按规则尝试但拒绝从 `UNDER_REVIEW` 转换（该 helper 仅接受 `AWAITING_USER`）；未绕过到 `AWAITING_USER`，而是将任务同步为 `NEEDS_REVISION` 并保留完整失败证据。
- 2026-07-22T08:45:51Z：Round 1 三项意见已完成窄修订；fresh validation 通过。创建 `MSG-TASK-002-ADVERSARIAL-REVIEW-R2`，dispatch dry-run 解析至真实 reviewer session `019f88d0-018d-75e2-8e28-54a904a6bf8c`，任务转回 `UNDER_REVIEW`。
- 2026-07-22T08:51:59Z：Round 2 response 已 ack；最终独立结论 `PASS`，P0=0、P1=0。唯一非阻断 P2 为 document impact 生命周期字段，现已更新为 `RESOLVED`；`PLANNER_SUMMARY.md` 已生成，进入最终 fresh validation。
- 2026-07-22T08:55:49Z：最终验收前 validation 通过，首次受控 `task_transition.py prepare-awaiting-user` 成功；08:55:55Z 已 ack reviewer stop-hook recovery。08:56:55Z 按治理 hook 要求 reopen，仅同步人类可读状态、验证快照和恢复记录，未改业务契约。
- 2026-07-22T09:07:14Z：收到精确口令 `确认 TASK-002 完成并生成正式提交`；`task_accept.py` 验收成功，状态转为 `ACCEPTED`，当前 turn 获得 formal commit 授权，不包含 push。
- 2026-07-22T09:51:19Z：记录精确口令 `推送 TASK-002` 的执行结果；正式提交 `1cf97ce837e9f4621a63fad736c84a9bdb028a5a` 推送成功，本地与远程 divergence 为 0/0。
- 2026-07-22T09:51:19Z：用户要求继续；TASK-002 关闭并归档，切换到独立 TASK-003 需求收集阶段。

## Execution Artifacts

- `TASKS/ARTIFACTS/TASK-002/FRONTEND_ARCHITECTURE_EVIDENCE.md`
- `TASKS/ARTIFACTS/TASK-002/WORDPRESS_CMS_API_EVIDENCE.md`
- `TASKS/ARTIFACTS/TASK-002/LOCALIZATION_SEO_EVIDENCE.md`
- `TASKS/ARTIFACTS/TASK-002/EVIDENCE_SYNTHESIS.md`
- `TASKS/ARTIFACTS/TASK-002/EXECUTION_REPORT.md`
- `TASKS/ARTIFACTS/TASK-002/TEST_OR_VALIDATION_LOG.md`
- `TASKS/ARTIFACTS/TASK-002/DIFF_OR_OUTPUT_SUMMARY.md`

## Adversarial Review

- Round 1 request/response: `MSG-TASK-002-ADVERSARIAL-REVIEW` / `MSG-TASK-002-ADVERSARIAL-REVIEW-RESPONSE`，均 `done`。
- Round 1 verdict: `FAIL`；P0=0、P1=1、P2=2。
- Artifact: `TASKS/ARTIFACTS/TASK-002/ADVERSARIAL_REVIEW_REPORT.md`。
- Required revision: 冻结 Polylang Media attachment 模型，并明确 stable translationGroupId；GraphQL 重评门改为可测量。
- Round 1 revision: 已完成 reference-level `MediaReference`、`_gdhe_translation_group_uuid` 和量化 GraphQL fixture 门，并统一 Webhook UUID 示例。
- Round 2 request: `MSG-TASK-002-ADVERSARIAL-REVIEW-R2`，已完成并 ack。
- Round 2 response: `MSG-TASK-002-ADVERSARIAL-REVIEW-R2-RESPONSE`，已 ack；final verdict `PASS`，P0=0、P1=0，document impact 非阻断 P2 已处理。

## Validation Evidence

- Pre-review fresh validation：PASS；详细命令、输出摘要与未实现能力见 `TEST_OR_VALIDATION_LOG.md`。
- Project audit 只有预期的 `GIT_DIRTY` 与 WordPress Core 文件名低优先级提示；Core checksum 独立验证通过。
- 第一轮 reviewer 独立复核 governance、registry、messages、lane audit、禁止路径与 diff；报告记录了媒体模型 P1，不能进入用户验收。
- Round 1 窄修订 fresh validation：PASS；定向术语、Webhook UUID 一致性、验收覆盖、治理、JSON、边界、WordPress checksum 与 diff 检查均通过。
- Round 2 reviewer 独立验证：PASS；无新增业务阻断项，禁止范围保持完整。

## User Acceptance

- 状态：`ACCEPTED`。
- 时间：`2026-07-22T09:07:14Z`。
- 口令：`确认 TASK-002 完成并生成正式提交`。
- 当前 turn 已授权本地正式提交；不包含 push、merge 或前端/CMS 实施。

## Recovery Entry 2026-07-22T08:56:55Z

- Reason: Synchronize the human-readable task section, board, project narrative, final validation snapshot, and acknowledged reviewer recovery with the controlled AWAITING_USER transition; no business contract change.
- Next step: Apply governance-only narrative synchronization, rerun final validation, then run prepare-awaiting-user again.
