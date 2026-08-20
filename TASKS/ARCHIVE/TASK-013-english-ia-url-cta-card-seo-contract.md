# TASK-013 冻结英语站 IA、URL、CTA 与产品卡片/SEO 最小合同
accepted_at: 2026-07-29T15:52:30Z

task_id: TASK-013
status: CLOSED
owner_lane: planner
assigned_lanes: [frontend, wordpress_cms, localization_seo]
review_lane: adversarial_reviewer
linked_issues: []
artifacts_dir: TASKS/ARTIFACTS/TASK-013
acceptance_state: ACCEPTED
recovery_recorded_at: 2026-07-29T15:48:07Z
git_status: MERGED
document_impact: RESOLVED
readme_impact: NOT_APPLICABLE
project_type: software

## 原始请求

> 创建 TASK-013：冻结英语站 IA、URL、CTA 与产品卡片/SEO 最小合同

## 结构化理解

- 本任务是 ADR-006 产品优先路线的阶段 1 小任务，也是进入 TASK-014 可见产品纵向切片前的最后一项最小合同工作。
- “冻结”指冻结英语站公开页面类型、层级关系、路由形状、canonical 身份、CTA 状态、产品卡片公共投影和首个正式模板的技术 SEO 最小输入；不把尚未确认的产品记录值或最终目录成员资格伪装成已冻结事实。
- 产品、系列和应用场景可以多对多，但同一产品只有一个 canonical 详情页；分类、系列和应用入口不得复制产品身份。
- 正常在售产品主 CTA 使用 `Request a Quote`；停产产品使用 `Contact Us for Replacement`。网站只收集 B2B quotation request，不实现购物车、结算或支付。
- 产品列表不能逐卡调用 `/resolve` 形成 N+1；产品卡片必须消费 normalized collection projection。前端不得读取原始 WordPress/SCF 数据。
- SEO 合同从首个正式模板开始进入完成定义，但本任务只冻结输入与页面行为，不实现 Metadata、JSON-LD、Sitemap、robots、redirect 或页面代码。
- 当前英语是唯一公开语言，不渲染语言切换入口，不创建其他语言 URL、hreflang 或翻译内容。

## 目标

- 冻结英语站一级/二级 IA、页面类型和页面之间的层级关系。
- 冻结公开 URL Map、slug 规则、产品 canonical、列表/详情/系列/应用等路由形状及 404/停产/替代的最小行为。
- 冻结正常、停产、无可报价规格、资料缺失等状态下的主/辅 CTA 与跳转语义。
- 冻结产品卡片 normalized projection：字段、类型、来源权威、必填/可空、公开资格和错误/缺失行为。
- 冻结首个正式英语模板所需的最小 `SeoDocument` 输入和责任边界。
- 从现有已确认测试材料中选择 2～3 个 TASK-014 纵向切片候选，并显式标注其 `TEST_CANDIDATE` 或经用户确认后的生产资料状态。
- 输出 CMS/API/Schema、内容、媒体、域名和产品资料缺口；未经后续任务授权不实施修订。

## 非目标

- 不修改 `frontend/**`、`cms/**`、WordPress 数据库、SCF、GDHE REST API、Schema、Contract Snapshot、Validator 或 Adapter。
- 不连接、读取或修改飞书真实 Base，不建立飞书同步，不写入 quotation request。
- 不导入、批量发布或迁移产品；不把当前测试记录升级为最终生产目录。
- 不开发 Header、Mega Menu、Footer、产品列表、产品详情、询价清单、首页或其他可见正式页面。
- 不实现 Preview、Draft Mode、ISR、缓存、Webhook、Staging、部署、监控或分析。
- 不安装或采购 WPML、ACFML、Yoast 或其他插件；不创建非英语公开入口。
- 不冻结尚未确认的生产产品值、最终 taxonomy 成员、公开域名或关键词研究结论。
- 不扩张 TASK-007～TASK-011 已交付的通用底层能力。

## 交付物

- `TASKS/ARTIFACTS/TASK-013/IA_AND_PAGE_TYPE_MAP.md`
  - 英语站一级/二级 IA、页面类型、入口和层级。
- `TASKS/ARTIFACTS/TASK-013/URL_AND_CANONICAL_CONTRACT.md`
  - URL Map、slug、canonical、分类/系列/应用多入口、停产/替代和 404/redirect 决策边界。
- `TASKS/ARTIFACTS/TASK-013/CTA_CONTRACT.md`
  - 主/辅 CTA 标签、显示条件、目标动作、禁止行为和状态矩阵。
- `TASKS/ARTIFACTS/TASK-013/PRODUCT_CARD_PROJECTION.md`
  - normalized 产品卡片字段合同、数据来源、公开资格、缺失/错误行为和 collection 消费边界。
- `TASKS/ARTIFACTS/TASK-013/SEO_MINIMUM_CONTRACT.md`
  - `SeoDocument` 最小输入、模板责任、canonical/robots/Breadcrumb/Alt/OG/结构化数据边界。
- `TASKS/ARTIFACTS/TASK-013/VERTICAL_SLICE_CANDIDATES.md`
  - 2～3 个 TASK-014 候选、覆盖理由、资料状态、不可宣称范围和缺口。
- `TASKS/ARTIFACTS/TASK-013/GAP_REPORT.md`
  - CMS/API/Schema、真实产品、媒体、文档、域名、内容责任和后续任务缺口。
- 更新 `docs/architecture/headless-wordpress-nextjs-contract.md` 中与上述最小合同直接相关且已获证据支持的条目；不重复建立第二份长期权威路线图。
- 执行报告、验证日志、差异摘要、独立 adversarial review 和 Planner Summary。

## 验收标准

- IA 明确页面类型与父子/交叉入口，且 RapidDirect 只提供节奏与转化参考，Forest/同业只提供目录组织参考，GDHE 事实仍为唯一业务权威。
- URL 合同保证一个产品身份只有一个 canonical 详情页；系列和应用多入口不复制产品或 Article Number。
- URL/slug/canonical 形状可以在公开域名未确认时验证，不虚构生产域名。
- CTA 合同至少覆盖正常在售、停产有替代、停产无替代、无公开可报价规格和目标未发布；正常主 CTA 为 `Request a Quote`，停产主 CTA 为 `Contact Us for Replacement`。
- CTA 不直接下单、支付或提交单产品表单；正常产品进入可继续添加产品的 quotation request 清单。
- 产品卡片合同明确稳定身份、model、英语名称、公开保护图、分类/系列上下文、短描述/关键属性、状态、CTA 和目标 URL 等最小字段，并逐项声明来源、可空性和失败行为。
- collection projection 能批量提供产品卡片，明确禁止逐卡 `/resolve` N+1 和前端原始 WordPress/SCF 消费。
- SEO 最小合同覆盖 title、description、canonical path、robots、OG、图片 Alt、Breadcrumb、允许的 JSON-LD 输入及缺失/未发布状态；只定义英语公开行为。
- 2～3 个纵向切片候选覆盖至少一个轨道详情、一个复杂规格产品或配件类型，以及必要的关联/停产/资料状态；测试数据必须显式标记，不能视为最终生产发布授权。
- GAP_REPORT 区分“可以直接进入 TASK-014”“需要用户确认”“需要单独 Schema/API 任务”“必须等待 10～20 个最终生产产品门”。
- 不修改禁止范围；Markdown、本地链接、绝对路径、治理、Lane、消息、Git scope 和 `git diff --check` 全部通过。
- 独立 adversarial review 最终为 `PASS / P0=0 / P1=0 / P2=0`。

## 允许修改范围

- `docs/architecture/headless-wordpress-nextjs-contract.md`
- `TASKS/ACTIVE/TASK-013-english-ia-url-cta-card-seo-contract.md`
- `TASKS/ARTIFACTS/TASK-013/**`
- `PROJECT/STATE.md`
- `PROJECT/ACTIVITY.md`
- `TASKS/BOARD.md`
- `TASKS/ARCHIVE/INDEX.md`
- `TASKS/ARCHIVE/TASK-012-roadmap-reprioritization.md`
- `LANES/planner/**`
- `LANES/frontend/**`
- `LANES/wordpress_cms/**`
- `LANES/localization_seo/**`
- `LANES/adversarial_reviewer/**`
- 当前任务所需的 `LANES/messages/**` 与 `LANES/registry/events.jsonl`

## 禁止修改范围

- `frontend/**`
- `cms/**`
- `.local/**`
- WordPress 数据库、运行配置、插件状态、用户和凭据
- 飞书、极空间、外部 SaaS、DNS、GitHub 配置和部署环境
- `package.json`、lockfile、依赖和构建配置
- 用户附件原文件
- 产品导入、发布、同步或公开页面实现

## 约束

- 以 ADR-006 和 `docs/architecture/headless-wordpress-nextjs-contract.md` 第 14 节为路线权威。
- 以 TASK-012 `REAL_PRODUCT_VALIDATION_GATE.md` 的已确认规则和测试数据边界为业务输入。
- 当前测试记录可以验证合同和候选覆盖，但不能满足 10～20 个最终生产产品验收门。
- 实施中遇到会改变 IA、产品身份、URL、CTA、公开字段或 SEO 责任的未决业务问题时，Planner 必须逐项向用户确认，不自行选择方便答案。
- 当前只有英语公开；未来九语言目标不进入本任务运行范围。
- 所有对外图片只引用业务方预制的 `公开保护图`；内部原图不得进入网站链路。

## 假设和待确认事项

- 公开生产域名尚未确认；本任务冻结 path 结构和 canonical 生成责任，不写死域名。
- 2～3 个纵向切片候选可先从 TASK-012 测试材料中选择，但必须由用户确认是否可在 TASK-014 本地页面中使用。
- 最终一级/二级产品目录标签、营销短描述和 SEO 文案可能仍需用户提供英语材料；缺失时输出明确缺口，不由参考站补写。
- 若现有 collection/API 无法无 N+1 地提供卡片投影，只输出精确缺口和后续任务边界，不在本任务修改 Schema/API。

## 验证计划

- 对照 ADR-006、架构契约第 14 节和 TASK-012 业务规则逐项建立可追溯矩阵。
- 只读核对现有 CMS Schema 19-file graph、前端 16-Schema `/resolve` closure、collection/navigation/route-manifest 和 Adapter 边界。
- 由 `wordpress_cms` 只读审计卡片投影、页面类型与当前 CMS/API 的可表达性。
- 由 `frontend` 只读审计 URL、卡片投影、CTA 和 SEO 输入能否直接支持 TASK-014，且不产生 N+1。
- 由 `localization_seo` 只读审计英语 canonical、robots、Breadcrumb、OG、Alt 和未来语言隔离边界。
- Planner 汇总并只修改授权文档；随后运行 Markdown、本地链接、绝对路径、Schema 数量/哈希、受保护范围、项目、Registry、Messages、strict lane audit 和 `git diff --check`。
- `adversarial_reviewer` 独立检查错误产品身份、伪冻结生产数据、URL 重复、CTA 歧义、SEO 缺口、N+1 和越权实施。

## 文档影响

`RESOLVED`：本任务交付物本身是权威合同文档；正式验收前必须完成架构契约和所有 TASK-013 artifacts 的同步。

## README 影响

`NOT_APPLICABLE`：本任务不改变当前可运行方式、命令或已交付功能。

## 分支和 Worktree

- 分支：`codex/TASK-013-english-ia-url-cta-contract`
- Worktree：当前主工作区

## 当前状态

`CLOSED / ACCEPTED / MERGED`。用户于 2026-07-29T15:52:30Z 使用精确口令正式验收 TASK-013；正式提交 `72d500bd2bb424a0f3896b336f3e9a3d79f90ab9` 已推送任务分支，并快进合并、推送至远端 `main`。

## 恢复入口

先读 `AGENTS.md`、`PROJECT/COORDINATION.md`、`PROJECT/AGENT_LANES.md`、`LANES/registry/lanes.json`、本任务文件，再读 `PROJECT/STATE.md`、`TASKS/BOARD.md`、ADR-006、架构契约第 14 节和 TASK-012 `REAL_PRODUCT_VALIDATION_GATE.md`。

## 下一步

无。本任务已正式交付并归档；后续工作必须通过独立任务登记。

## Lane Plan

| lane | responsibility | write_scope | expected_artifacts | status |
|---|---|---|---|---|
| planner | 业务权威、任务状态、跨 Lane 汇总、权威架构更新和用户确认 | `PROJECT/**`、`TASKS/**`、`MEMORY/**`、`LANES/**` | intake、综合合同、Planner checkpoint/summary | ACCEPTED; FORMAL_GIT_DELIVERY_IN_PROGRESS |
| wordpress_cms | 只读审计页面类型、卡片 projection 与当前 CMS/API/Schema 可表达性 | `TASKS/ARTIFACTS/TASK-013/**`、`LANES/wordpress_cms/**` | CMS feasibility response / gap evidence | COMPLETE |
| frontend | 只读审计 URL、卡片、CTA、SEO 输入和 TASK-014 消费可行性 | `TASKS/ARTIFACTS/TASK-013/**`、`LANES/frontend/**` | frontend feasibility response / N+1 evidence | COMPLETE |
| localization_seo | 只读审计英语 canonical/robots/Breadcrumb/OG/Alt 和语言隔离 | `TASKS/ARTIFACTS/TASK-013/**`、`LANES/localization_seo/**` | localization/SEO feasibility response | COMPLETE |
| adversarial_reviewer | 对业务交付物只读独立审查 | canonical review report 与自身 Lane | `ADVERSARIAL_REVIEW_REPORT.md` | ROUND_2_PASS |

## Messages

- `MSG-TASK-013-A2-FRONTEND-READONLY-AUDIT`：done；response done。
- `MSG-TASK-013-A2-LOCALIZATION-SEO-READONLY-AUDIT`：done；response done。
- `MSG-TASK-013-A2-WORDPRESS-CMS-READONLY-AUDIT`：done；response done。
- 三条 assignment 和三条 execution response 均已通过真实线程桥并由对应 Lane / Planner ACK。
- `MSG-TASK-013-A4-ADVERSARIAL-REVIEW`：done；Round 1 response 和 recovery request done。
- `MSG-TASK-013-A4-ADVERSARIAL-REVIEW-R2`：done；最终 PASS response 和 recovery request done。

## 执行记录

用户已确认需求；A1/A2/A3 已完成，Decision 1–9 均已回答。A4 Round 1 已完成并窄修订，Round 2 最终结果为 `PASS / P0=0 / P1=0 / P2=0`；Planner final validation、Planner Summary 和 checked acceptance preparation 均已完成。

## Execution Artifacts

- `DESIGN.md`
- `IMPLEMENTATION_PLAN.md`
- `PLANNER_BASELINE_TRACEABILITY.md`
- `FRONTEND_READONLY_AUDIT.md`
- `WORDPRESS_CMS_READONLY_AUDIT.md`
- `LOCALIZATION_SEO_READONLY_AUDIT.md`
- `A2_CHECKPOINT.md`
- `A3_CHECKPOINT.md`
- `OPEN_DECISIONS.md`
- `IA_AND_PAGE_TYPE_MAP.md`
- `URL_AND_CANONICAL_CONTRACT.md`
- `CTA_CONTRACT.md`
- `PRODUCT_CARD_PROJECTION.md`
- `SEO_MINIMUM_CONTRACT.md`
- `VERTICAL_SLICE_CANDIDATES.md`
- `GAP_REPORT.md`
- `EXECUTION_REPORT.md`
- `DIFF_OR_OUTPUT_SUMMARY.md`
- `TEST_OR_VALIDATION_LOG.md`
- `ADVERSARIAL_REVIEW_REPORT.md`

## Adversarial Review

`PASS / P0=0 / P1=0 / P2=0`

Evidence：`TASKS/ARTIFACTS/TASK-013/ADVERSARIAL_REVIEW_REPORT.md` 顶层 current verdict 和 Round 2 final review；P1/P2 均关闭，其他已通过边界无回归。该 PASS 不是用户验收，也不授权 Git 交付或 TASK-014。

## Review History

Round 1 历史结果为 `FAIL / P0=0 / P1=1 / P2=1`。其 ProductCard 确定性 P1 和当前叙述 P2 已经窄修订，并由 Round 2 独立关闭；完整历史保留在 canonical review report。

## Validation Evidence

`PASS`

Evidence：`TASKS/ARTIFACTS/TASK-013/TEST_OR_VALIDATION_LOG.md` 第 8 节。Planner final validation 已完成：CMS 19/15 Golden/6 negative、frontend 16/2/2、61-entry checksum、Markdown/private path、project/registry/messages/strict lane、protected scope 和 diff 均 PASS。

## User Acceptance

`ACCEPTED` at 2026-07-29T15:52:30Z by exact phrase `确认 TASK-013 完成并提交到远端`。

## Recovery Entry 2026-07-29T15:32:31Z

- Reason: checked prepare-awaiting-user 已成功，但活动任务当前状态、Project focus 与 Board 人类可读视图仍保留 UNDER_REVIEW；仅为同步这些当前事实而受控 reopen。
- Resolution: 人类可读状态已同步，第二次 checked `prepare-awaiting-user` 于 2026-07-29T15:32:58Z 成功；该恢复入口已关闭。

## Recovery Entry 2026-07-29T15:48:07Z

- Reason: 用户确认修复 DPG full audit 的当前结果格式和过期收口叙述。
- Resolution target: 当前 Review/Validation 使用明确 `PASS + Evidence`；Round 1 移入历史区；Lane、Messages、执行记录和 Execution Report 同步完成。完成完整 audit 后重新 checked `prepare-awaiting-user`。

## Recovery Entry 2026-07-29T15:48:07Z

- Reason: 用户确认修复只读复核发现的治理收口缺陷：DPG audit 因当前 Review/Validation 区混入历史 FAIL 且缺少显式 Evidence 而报三个 HIGH；Lane、Messages、执行记录和 Execution Report 仍有过期叙述。
- Next step: 只修正当前 PASS+Evidence 格式、把 Round 1 FAIL 移到历史区、同步 Lane/Messages/执行记录和 Execution Report，然后重跑完整 audit；不得改变业务合同、实现、Git 或 TASK-014。
