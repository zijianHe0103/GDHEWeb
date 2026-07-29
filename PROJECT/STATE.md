# 项目状态

schema_version: DPG-LANES-1.0.0
project_type: software
current_task: TASK-013
task_state: ACCEPTED
git_state: FORMAL_COMMIT_PENDING
last_updated: 2026-07-29T15:52:30Z

## 当前焦点

`TASK-013` 为 `ACCEPTED / ACCEPTED / FORMAL_COMMIT_PENDING`。用户于 2026-07-29T15:52:30Z 使用精确口令正式验收；Round 2 为 `PASS / P0=0 / P1=0 / P2=0`，Planner final validation、完整治理审计与 checked acceptance preparation 均已通过。当前只执行任务分支正式提交/推送与 `main` 合并/推送；未部署或开始 TASK-014。

## TASK-013 Governance Closeout Revision 2026-07-29T15:48:07Z

- authorization: 用户回复“确认”，同意执行只读复核提出的窄收口修订。
- audit_finding: full project audit 曾报 `FAILED_REVIEW_OR_VERIFY_AWAITING_USER`、`REVIEW_EVIDENCE_MISSING`、`VERIFY_EVIDENCE_MISSING`。
- cause: current Review/Validation 区同时保存历史 FAIL 与最终 PASS，且正文缺少审计器要求的显式 Evidence；Lane、Messages、执行记录和 Execution Report 也有过期叙述。
- scope: 只修活动任务和执行证据的当前/历史表达，不改变 IA、URL、CTA、ProductCard、SEO、候选、缺口或实现。
- next: fresh full audit、technical validations 和 checked `prepare-awaiting-user`。

## TASK-013 Round 2 Pass Received 2026-07-29T15:29:56Z

- verdict: `PASS / P0=0 / P1=0 / P2=0`；Planner final validation 允许。
- messages: Round 2 PASS response 和 stop-recovery request 已真实桥接、dispatch 并由 Planner ACK。
- closure: ProductCard 四格动作矩阵确定；活动任务验证/审查叙述与当前事实一致。
- preserved: Round 1 `FAIL / P0=0 / P1=1 / P2=1` 历史完整保留。
- boundary: PASS 不等于用户验收，不授权 TASK-014、实现、CMS/API/Schema 修改、Git 或部署。
- next: fresh Planner final validation，生成 Planner Summary，随后 checked `prepare-awaiting-user`。

## TASK-013 Round 2 Review Dispatch 2026-07-29T15:23:51Z

- message: `MSG-TASK-013-A4-ADVERSARIAL-REVIEW-R2` 已创建并通过 message validation/dry-run。
- ordering: Active Task、Project State 和 Board 在唤醒 Reviewer 前同步为 `UNDER_REVIEW`。
- transition: `NEEDS_REVISION` -> `UNDER_REVIEW`。
- scope: 只复核 Round 1 P1/P2 是否关闭及已通过边界是否保持。
- boundary: 不授权修复、TASK-014、实现、验收、Git 交付或部署。
- next: 真实桥接 Round 2 请求并等待独立结论。

## TASK-013 Round 1 Review Recovery 2026-07-29T15:20:56Z

- verdict: `FAIL / P0=0 / P1=1 / P2=1`；Planner final validation 不允许。
- p1: 停产 `detail_product` 卡片动作必须按 Decision 5 固定为进入 retained canonical detail；无详情停产配件必须固定为 replacement contact。
- p2: 活动任务的 Validation Evidence 与 Reviewer Lane 状态需要同步到当前事实。
- helper: 已按要求运行 `task_transition.py reopen`；helper 因只接受 `AWAITING_USER` 而安全拒绝，未产生 mutation。
- transition: 按既有受控恢复惯例记录 `UNDER_REVIEW` -> `NEEDS_REVISION`。
- boundary: 保留其余已通过的业务合同；不得启动 TASK-014、产品实现、CMS/API/Schema 修改、验收、Git 交付或部署。
- next: 仅做窄文档修订、fresh validation 和 Round 2。

## TASK-013 A3 Complete And A4 Dispatched 2026-07-29T15:13:18Z

- deliverables: 七份正式合同/候选/缺口交付物、A3 checkpoint、execution report、diff summary 和 validation log 已完成。
- validation: CMS 19/frontend 16、A3 hash/list parity、frontend byte/hash parity、verify:cms-contract、Markdown、absolute path、protected scope、project/registry/messages/strict lane 和 diff 均 PASS。
- review_message: `MSG-TASK-013-A4-ADVERSARIAL-REVIEW` 已取得真实 thread bridge 回执并 dispatch。
- transition: `IN_PROGRESS` -> `UNDER_REVIEW`。
- boundary: Reviewer 只读业务交付物，只可写 review report、自身 worklog 和受控 response；未授权修复、实施或 Git 交付。
- next: 等待 independent verdict。

## TASK-013 Decision 9 Confirmed As Deployment Gap 2026-07-29T15:06:37Z

- confirmation: 用户回复“暂未确定”。
- result: 不虚构生产域名，生产 canonical origin 保留为 `DEPLOYMENT_GAP`。
- configuration: 未来 Next.js 通过受控 `PUBLIC_SITE_ORIGIN` 取得生产 origin；WordPress、Local、Preview 和 Staging origin 不得作为生产 canonical。
- gate: 正式部署前必须确认唯一 HTTPS origin，并统一用于 canonical、OG URL、Sitemap、绝对站内链接和未来 hreflang。
- transition: `PAUSED` -> `IN_PROGRESS`。
- boundary: 只恢复 TASK-013 A3 文档收口；不实施部署、DNS、页面、CMS、Schema/API 或 TASK-014。
- next: 生成七份正式合同/候选/缺口交付物并同步架构契约。

## TASK-013 Decision 8 Confirmed 2026-07-29T15:04:56Z

- confirmation: 用户回复“可以”，采用 English card summary/key attributes 规则。
- common_card: 公开保护图、型号、英语名称、可选人工短摘要、最多三项分类专属参数、必要状态和已确认动作。
- summary: 在 `wp-admin` 人工编写；缺失时省略，不自动生成，也不阻止已公开产品询价。
- category_attributes: 轨道、布带、线珠、电机/控制和小配件分别使用受控关键参数；完整规格留在详情或询价选择器。
- exclusions: 卡片不显示价格、成本、MOQ、供应商、库存或内部 Article Number 选择结果。
- boundary: 该确认只冻结卡片信息合同，不实施 collection projection、卡片 UI、内容或 Schema/API。
- state: 继续保持 `PAUSED`，按一次一个问题等待 Decision 9。
- next: 确认生产 canonical origin，或确认将其保留为部署前必须关闭的 `DEPLOYMENT_GAP`。

## TASK-013 Decision 7 Confirmed 2026-07-29T15:00:45Z

- confirmation: 用户回复“可以”，采用三个 TASK-014 本地测试候选。
- candidates: `FGD X15+PVC / GDHEPRD000172`、`SSD-01 / GDHEPRD000692 + GDHEPRD000695`、`PJ-D16 / GDHEPRD000640`。
- coverage: 轨道详情与配件入口、复杂真实规格组合、电机渐进内容和规格不完整仍可询价。
- boundary: 全部为 `TEST_CANDIDATE / noindex`，不构成正式目录、生产发布授权、最终 Article Number 冻结或 10～20 产品门通过。
- state: 继续保持 `PAUSED`，按一次一个问题等待 Decision 8。
- next: 确认英语 card summary 与分类专属 key attributes 的显示策略。

## TASK-013 Decision 6 Confirmed And Corrected 2026-07-29T14:57:46Z

- confirmation: 用户确认采用分层发布保护，并补充同步到 WordPress 的产品即使缺少完整询价规格也可以通过 Request a Quote API 询价。
- publication_gate: 首次同步创建草稿；公开保护图、基本公开身份与 WordPress 人工发布决定是否对匿名访客公开。
- quoteability_gate: 成功同步并已公开的 WordPress 产品即具备询价资格，完整规格或唯一 Article Number 解析不是前置条件。
- unresolved_quote: 提交稳定产品身份、公开型号、已知选择、数量和备注；Article Number 可未解析，由业务员在飞书中继续判断。
- prohibition: 前端/API 不猜测规格组合或 Article Number；草稿、私有和未发布记录不可匿名询价。
- boundary: 该确认只冻结发布/询价语义，不实施同步、发布校验、Request a Quote API 或飞书写入。
- state: 继续保持 `PAUSED`，按一次一个问题等待 Decision 7。
- next: 确认 TASK-014 使用的 2～3 个本地 `TEST_CANDIDATE`。

## TASK-013 Decision 5 Confirmed 2026-07-29T14:50:59Z

- confirmation: 用户回复“采用”，接受 product card navigation/direct RFQ 分层规则。
- detail_products: 有 canonical 详情页的产品卡片统一进入详情页，完成页面实际提供的已知选择与数量后再加入询价；按 Decision 6 允许 Article Number 未解析。
- small_accessories: 没有独立详情页的小配件可在目录或关联模块满足选择要求并填写数量后直接加入询价。
- prohibition: 卡片不得猜测规格或 Article Number，不为无详情页小配件创建虚构详情 URL。
- boundary: 该确认只冻结卡片交互语义，不实施卡片、详情、选择器或询价状态。
- state: 继续保持 `PAUSED`，按一次一个问题等待 Decision 6。
- next: 确认缺少公开保护图或完整可报价规格时的 fail-closed 行为。

## TASK-013 Decision 4 Confirmed 2026-07-29T14:46:57Z

- confirmation: 用户回复“采用”，接受 RFQ 与 replacement/contact target routes。
- rfq_route: 正常多产品询价统一使用 `/request-a-quote/`。
- contact_route: 通用联系和停产替代咨询统一使用 `/contact/`，原产品稳定身份与公开型号作为非 URL 表单上下文。
- prohibition: 不建立 cart、checkout、buy 或支付路径，不在 URL 暴露内部 Article Number。
- boundary: 该确认只冻结目标 route 与转化语义，不实施表单、询价清单、提交接口或飞书写入。
- state: 继续保持 `PAUSED`，按一次一个问题等待 Decision 5。
- next: 确认产品卡片进入详情或直接加入询价清单的规则。

## TASK-013 Decision 3 Confirmed 2026-07-29T14:43:01Z

- confirmation: 用户回复“采用”，接受 stable primary Breadcrumb 规则。
- product_trail: `Home > Products > Primary Product Group > Primary Subcategory > Product Model`。
- primary_category: 每个公开产品显式保存一个且仅一个主分类；前端不得按当前入口、排序或第一个关系猜测。
- stability: 产品从系列、应用或相关推荐进入时保持相同 Breadcrumb、`BreadcrumbList` 与 canonical 身份。
- boundary: 该确认只冻结 Breadcrumb 业务语义，不实施字段、Schema/API、页面或 JSON-LD。
- state: 继续保持 `PAUSED`，按一次一个问题等待 Decision 4。
- next: 确认 `Request a Quote` 与 replacement/contact 的公开目标 route。

## TASK-013 Decision 2 Confirmed 2026-07-29T14:40:06Z

- confirmation: 用户回复“可以的”，采用已提议的 route words 与 slug policy。
- canonical: 产品详情使用 `/products/{product-slug}/`，以公开型号为主要 slug 来源，Article Number 不进入公开 URL。
- discovery_routes: 产品分类、配件分类、系列和应用使用各自受控发现路径，但全部链接回同一产品 canonical。
- lifecycle: 分类、系列或应用归属改变不改变产品 URL；已公开 slug 变更必须单跳永久重定向。
- boundary: 该确认只冻结公开 path 形状和 slug 规则，不实施 redirect、页面、Schema/API 或数据迁移。
- state: 继续保持 `PAUSED`，按一次一个问题等待 Decision 3。
- next: 确认多系列/多应用产品的稳定 primary Breadcrumb trail。

## TASK-013 Decision 1 Confirmed 2026-07-29T10:22:45Z

- confirmation: 用户回复“可以”，采用已提议的英语一级导航和 Products Mega Menu。
- primary_navigation: `Products`、`Applications`、`Resources`、`About GDHE`、`Contact`；`Request a Quote` 为独立主按钮。
- product_groups: `Curtain Track Systems` 与 `Accessories`，使用已提议的二级分类。
- boundary: 该确认冻结导航标签和层级，不代表任何产品已导入、发布或成为最终生产目录成员。
- state: 继续保持 `PAUSED`，按一次一个问题等待 Decision 2。
- next: 确认产品、分类、系列、应用和配件目录的 route words 与 slug policy。

## TASK-013 A2 Checkpoint and User Decision Pause 2026-07-29T07:56:01Z

- frontend: `PASS_WITH_BLOCKING_FOLLOW_UPS / P0=0 / P1=7 / P2=1`。
- wordpress_cms: `PASS_WITH_REQUIRED_FOLLOW_UP_CONTRACTS`。
- localization_seo: `FEASIBLE_WITH_ENTRY_GATES`。
- consensus: 现有 `/resolve` 可支撑单个已知产品详情纵切；真实卡片列表禁止逐卡 resolve，必须先有一次 collection 的 normalized projection；CTA state 与 `SeoDocument` 同样需要后续机器合同。
- user_gate: 精确英语导航/目录、route words、Breadcrumb、CTA target、card interaction 和测试候选属于业务选择，Planner 不自行猜测。
- transition: `IN_PROGRESS` -> `PAUSED`。
- next: 只确认 Decision 1——英语一级导航和 Products Mega Menu；收到答案后恢复 A3。

## TASK-013 A1 Complete and A2 Queued 2026-07-29T07:45:10Z

- a1: DESIGN/IMPLEMENTATION_PLAN 已建立；project、registry、messages、strict lane audit、protected scope 和 diff 全部 PASS。
- messages: frontend、wordpress_cms、localization_seo 三项只读审计消息已创建并 validate。
- transition: `READY` -> `IN_PROGRESS`。
- dispatch_gate: 每项必须取得真实 Codex thread bridge delivery ID 后才允许 `dispatch-once --execute`；接收 Lane 必须先 ACK。
- next: 先派发 lexicographic queue 首项 frontend，再依次派发其余两项。

## TASK-013 Requirement Confirmation 2026-07-29T07:41:57Z

- authorization: 用户精确输入 `确认 TASK-013 需求并开始执行`。
- transition: `AWAITING_REQUIREMENT_CONFIRMATION` -> `READY`。
- execution_order: Planner 基线与执行设计 → 三个 specialist 只读审计 → Planner 综合合同和缺口 → 独立 adversarial review → checked acceptance preparation。
- protected: `frontend/**`、`cms/**`、数据库、飞书、Schema/API、依赖、运行环境、产品导入/发布、页面实现、多语言和部署。
- next: 生成 DESIGN/IMPLEMENTATION_PLAN，验证后创建并桥接 specialist 消息。

## TASK-013 Intake 2026-07-29T07:37:54Z

- user_request: `创建 TASK-013：冻结英语站 IA、URL、CTA 与产品卡片/SEO 最小合同`。
- branch: `codex/TASK-013-english-ia-url-cta-contract`，从远端一致的 `main` `374dc19` 创建。
- scope: 英语站 IA/页面类型、URL/slug/canonical、CTA 状态、normalized 产品卡片投影、最小 `SeoDocument`、2～3 个 TASK-014 候选和缺口报告。
- evidence_boundary: 当前产品记录仍是业务合同测试数据；除非用户另行提供并确认最终生产资料，不把候选记录写成最终生产目录，也不宣称 10～20 产品生产数据门已通过。
- protected: `frontend/**`、`cms/**`、数据库、飞书、Schema、API、依赖、运行环境、产品导入/发布、Preview/cache/Webhook、页面实现、多语言和部署。
- next: 等待精确口令 `确认 TASK-013 需求并开始执行`。

## TASK-012 Closure Scope Decision 2026-07-29

- task_scope: 收口已确认的业务合同、询价规则、飞书同步规则、媒体规则、权威实施路线图和未来进入条件。
- test_data_boundary: 当前测试记录不作为最终生产目录。
- deferred_mandatory_gate: 10～20 个最终生产产品数据验收必须在正式批量导入、产品模板业务冻结和 Schema 业务冻结前完成。
- prohibited_claim: 通过该门前不得批量发布正式产品或声称产品 Schema 已业务冻结。
- authorization_boundary: 用户已使用精确正式交付口令验收 TASK-012，并授权正式提交、任务分支推送、合并 `main` 与推送 `main`。
- implementation_boundary: 未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: 正式提交并推送 TASK-012 分支，随后合并并推送 `main`。

## TASK-012 Relation Target Publication Gate Decision 2026-07-29

- retained_relation: 飞书内部关系可以保留。
- hidden_conditions: 目标产品停用、撤销“允许发布”或 WordPress 未公开。
- public_behavior: 官网隐藏相关产品/相关配件，不生成指向未公开目标的卡片或链接。
- restoration: 目标重新满足飞书发布资格且 WordPress 公开后，在下一次成功同步或发布刷新后自动恢复。
- no_relation_rebuild: 隐藏和恢复不要求删除或重建飞书关系。
- lifecycle_result: 关联新增、删除、同步失败和目标发布资格门均已确认。
- resolved: TASK-012 收口业务合同和未来进入门；10～20 个最终生产产品验收后置为强制门。
- implementation_boundary: 本轮未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: fresh validation 和当前修订版独立对抗审查。

## TASK-012 Relation Removal Sync Decision 2026-07-29

- relation_authority: 飞书。
- deletion_flow: 飞书删除关联 → 下一次完整成功同步 → WordPress 只读镜像移除 → API 移除 → Next.js 产品详情页移除。
- no_duplicate_editing: 不需要在 WordPress 手工删除。
- atomicity: 一次成功同步原子替换关系集合。
- failure_behavior: 同步失败保留最后一次成功关系集合，不展示半更新状态。
- resolved: 目标未通过公开资格门时隐藏推荐并保留飞书关系，恢复资格后自动恢复。
- implementation_boundary: 本轮未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: 只确认 TASK-012 收口范围。

## TASK-012 Test Data Authority And Relation Sync Decision 2026-07-29

- data_status: 当前提供的产品记录主要是测试数据，后续继续完善。
- validation_meaning: 样本 001～009 只验证业务模型、页面、询价和同步行为，不冻结最终生产记录值。
- production_gate: 当前测试数据不满足 10～20 个最终真实产品数据验收门。
- relation_authority: 飞书是型号级产品关联关系的唯一维护入口。
- add_flow: 飞书添加关联 → 下一次成功同步 → WordPress 只读镜像更新 → GDHE REST API 输出 → Next.js 产品详情页自动显示。
- no_duplicate_editing: 不在 WordPress 重复维护飞书关联关系。
- failure_behavior: 同步失败保留最后一次成功数据，不展示半成品关系。
- resolved: 飞书删除关系后，下一次完整成功同步对称移除 WordPress 镜像、API 和前端相关推荐。
- implementation_boundary: 本轮未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: 只确认关联目标的公开发布资格门。

## TASK-012 Sample 008 End Cap Compatibility Decision 2026-07-29

- `FK-J-12 / GDHEPRD000488`: 兼容并推荐给 `FGG J06`。
- `FK-J-16 / GDHEPRD000489`: 兼容并推荐给 `FGD X16`。
- `FK-J-11 / GDHEPRD000487`: 当前无兼容关系，只进入配件目录并可独立询价。
- deduplication: 飞书重复关联值按轨道型号去重，不生成重复推荐。
- seo_boundary: 三条均不建立独立 SEO 产品详情页。
- validation_result: 样本 008 核心验证完成。
- implementation_boundary: 未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: 只确认样本 009 三条走珠记录的独立条目身份。

## TASK-012 Internal Original Media Isolation Decision 2026-07-29

- internal_storage: 内部无水印原图只保存在飞书、极空间等内部系统。
- wordpress_exclusion: 不进入 WordPress。
- delivery_exclusion: 不进入 GDHE REST API、Next.js、公开媒体、隐藏字段、构建产物或公开缓存。
- public_input: 网站链路只能接收业务方预制的公开保护图。
- media_boundary_result: 公开保护图发布资格、制作职责和内部原图隔离边界已确认。
- implementation_boundary: 未导入样本，也未修改 WordPress、Schema、API、前端或数据库。
- next: 只确认样本 008 封口配件的型号级兼容关系。

## TASK-012 Public Protected Media Pipeline Decision 2026-07-29

- selected_option: A。
- producer: 业务方在上传前制作公开保护图。
- wordpress_role: WordPress 只管理和发布保护成品图。
- website_exclusion: 网站不自动添加水印、品牌底纹、型号或尺寸标注，也不承担图片排版。
- quality_reason: 品牌位置、尺寸标注和产品构图由业务方在成品图中控制。
- resolved: 内部原图完全排除在 WordPress、GDHE REST API、Next.js 和公开媒体之外。
- implementation_boundary: 未导入样本，也未修改 WordPress、Schema、API、前端或数据库。
- next: 进入样本 008 封口配件兼容关系验证。

## TASK-012 Public Protected Media Decision 2026-07-29

- canonical_term: `公开保护图`。
- publication_requirement: 官网发布图需要带水印、品牌标识或品牌底纹等防盗用元素。
- superseded_assumption: 撤销“公开站需要无水印原图、带水印图只作内部参考”的假设。
- sample: `FGD X15切面01_1.png`，`800 × 800` RGB PNG。
- sample_content: 黑色背景、GDHE 标识、`FGD X15` 型号、`28 mm × 27 mm` 尺寸标注和产品图。
- sample_sha256: `9a8ed9fe7145ae582450425be493987ad874d052c176e340d28d7d24bf0d4880`。
- storage_boundary: 本轮只验证本地样本，没有复制到 WordPress、仓库或公开媒体。
- resolved: 业务方上传前制作保护成品图；网站不自动生成。
- implementation_boundary: 未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: 只确认内部原图的存储边界。

## TASK-012 Sample 007 Missing Remote Presentation Decision 2026-07-29

- model: `PJ-D16`。
- confirmed_content_only: 页面只展示已经确认的电机信息。
- omitted_module: 遥控器资料未取得时完全不渲染遥控器模块。
- prohibited_placeholders: 不显示“即将推出”、占位型号或推测性兼容信息。
- future_enablement: 只有取得真实且允许发布的遥控器资料后才在同一页面渲染该模块。
- validation_result: 样本 007 核心验证完成。
- implementation_boundary: 未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: 只确认无水印产品原图的公开发布资格。

## TASK-012 Sample 007 Progressive Motor Publication Decision 2026-07-29

- model: `PJ-D16`。
- article_number: `GDHEPRD000640`。
- publication: 不等待遥控器资料，可先作为电机产品公开。
- future_remote: 取得同款配套遥控器资料后补充到同一产品页面，不另建遥控器页面。
- truth_boundary: 当前不得虚构遥控器型号、Article Number、图片、控制协议或兼容能力。
- resolved: 资料未齐期间完全省略遥控器模块与占位文案。
- implementation_boundary: 未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: 确认公开保护图的制作路径。

## TASK-012 Sample 006 Missing Compatibility Decision 2026-07-29

- examples: `AZM-K-1 / GDHEPRD000011`、`AZM-K-10 / GDHEPRD000012`。
- catalog_without_relation: 没有轨道兼容关系时，仍可在配件目录浏览。
- rfq_without_relation: 没有轨道兼容关系时，仍可作为独立询价行。
- recommendation_gate: 没有已确认型号级兼容关系时，不得出现在任何轨道详情页的相关配件模块。
- enablement: 只有飞书中补充并通过同步校验的型号级关系才能启用相关推荐。
- validation_result: 样本 006 核心验证完成。
- implementation_boundary: 未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: 只确认样本 007 `PJ-D16` 的发布边界。

## TASK-012 Sample 006 Small Accessory Display Decision 2026-07-29

- examples: `AZM-K-1 / GDHEPRD000011`、`AZM-K-10 / GDHEPRD000012`。
- accessory_catalog: 作为配件目录中的独立条目，支持分类筛选。
- rfq_role: 可填写数量并作为独立询价行。
- related_accessory_role: 只有存在已确认型号级兼容关系时，才进入轨道详情页的相关配件模块。
- seo_boundary: 安装码、封口、走珠等小配件不各自建立独立 SEO 产品详情页。
- complex_accessory_exception: 布带、线珠等规格复杂的配件产品继续拥有产品详情页。
- resolved: 缺少轨道兼容关系时仍可目录浏览和独立询价，但不进入相关推荐。
- implementation_boundary: 未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: 进入样本 007 `PJ-D16`。

## TASK-012 Sample 005 SSZ-01A Grouping Decision 2026-07-29

- model: `SSZ-01A`。
- article_numbers: `GDHEPRD000784`、`GDHEPRD000785`、`GDHEPRD000786`。
- page_grouping: 三条记录归入同一个产品页面。
- public_options: 线珠间距和卷长均为客户可见、可选择的规格。
- combination_rule: 每个飞书真实存在且允许发布的组合保留自身 Article Number。
- no_cartesian_product: 前端不得生成不存在的间距/卷长组合。
- validation_result: 样本 005 核心验证完成。
- implementation_boundary: 未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: 只确认样本 006 安装码的目录展示粒度。

## TASK-012 Sample 004 Article Mapping Decision 2026-07-29

- `GDHEPRD000692`: 薄不锈钢钉。
- `GDHEPRD000695`: 厚不锈钢钉。
- combination_rule: 每条 Article Number 绑定其真实宽度、间距和卷长组合。
- no_cartesian_product: 前端不得把各属性自由组合成飞书中不存在的规格，也不得生成 Article Number。
- validation_result: 样本 004 核心验证完成。
- implementation_boundary: 未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: 只确认样本 005 `SSZ-01A` 的页面归组和公开间距/卷长选项。

## TASK-012 Sample 004 Staple Specification Decision 2026-07-29

- model: `SSD-01`。
- page_grouping: 两条代表记录归入同一产品页面。
- canonical_term: `钉子规格`。
- public_options: `薄不锈钢钉`、`厚不锈钢钉`，客户可见且可选择。
- terminology_boundary: 两者材质同为不锈钢，不建模成两个普通材质；不得把来源品名“全不锈/半不锈”直接作为公开术语。
- combination_role: 钉子规格与宽度、间距、卷长共同确定真实可询价组合。
- article_mapping: `GDHEPRD000692` 为薄不锈钢钉；`GDHEPRD000695` 为厚不锈钢钉。
- combination_rule: 两条记录分别绑定自身宽度、间距和卷长组合。
- implementation_boundary: 未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: 进入样本 005 `SSZ-01A`。

## TASK-012 Sample 003 RFQ Article Resolution Decision 2026-07-29

- model: `FGL X14`。
- public_selection: 客户选择型号、长度并填写数量。
- weight_boundary: 米重差异当前不是前端展示或选择刚需，后期可按业务价值另行建模。
- ambiguous_article_resolution: 公开选项无法唯一确定 Article Number 时，网站不提交 Article Number，由业务员在飞书选择具体内部记录。
- no_guessing: 网站不得根据隐藏米重猜测，也不得生成 Article Number。
- exception_boundary: 已能由公开选项唯一确定的其他规格仍保留各自 Article Number。
- validation_result: 样本 003 核心验证完成。
- implementation_boundary: 未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: 只确认样本 004 `SSD-01` 的页面归组和公开材质选项。

## TASK-012 Sample 003 Internal Variant Visibility Decision 2026-07-29

- model: `FGL X14`。
- public_primary_identity: 网页主要显示型号 `FGL X14`。
- internal_only: `1132 / 9973 / 250`、对应源中文品名、源重量和供应来源差异仅用于内部识别。
- public_selector_boundary: 上述内部字段不向客户显示，也不作为公开选择项。
- article_number_conflict: `GDHEPRD000418`、`GDHEPRD000420`、`GDHEPRD000421` 的公开长度均为 `6 m`，仅凭 `FGL X14 + 6 m` 无法唯一确定 Article Number。
- resolved: 网站不附 Article Number，由业务员在飞书选择具体内部记录；米重前端区分延后。
- implementation_boundary: 未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: 进入样本 004 `SSD-01`。

## TASK-012 Sample 003 FGL X14 Page Grouping Decision 2026-07-29

- model: `FGL X14`。
- page_identity: 一个产品页面、一个 URL、一个 canonical SEO 身份。
- article_numbers: `GDHEPRD000418`、`GDHEPRD000419`、`GDHEPRD000420`、`GDHEPRD000421`、`GDHEPRD000422`。
- variant_role: 五个 Article Number 是同一型号页面下的具体可询价规格。
- no_page_split: 不因中文品名、长度、重量或供应来源值不同拆分页面。
- internal_only: `1132 / 9973 / 250` 及对应中文品名、重量和供应来源差异仅供内部识别，不公开。
- unresolved: 三个 `6 m` Article Number 的公开询价选择策略。
- implementation_boundary: 未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: 只确认样本 003 的公开 Article Number 选择策略。

## TASK-012 Sample 002 Packaging Default And Core Validation Decision 2026-07-29

- model: `FGE X08+pvc`。
- default_base_packaging: 常规包装。
- default_logo_printing: 关闭。
- default_bagging: 不选。
- default_paired_nesting: 不选。
- customer_override: 客户可在合法组合内主动修改。
- core_validation: 长度与 Article Number、定制 RFQ、核心兼容关系、配件可选性和包装均已验证。
- deferred_gaps: 遥控器资料和原始行未知字段可后补，不影响继续验证下一代表样本。
- implementation_boundary: 未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: 只确认样本 003 的供应来源差异是否公开。

## TASK-012 Sample 002 Packaging Applicability Decision 2026-07-29

- model: `FGE X08+pvc`。
- contract: 适用完整轨道包装合同。
- base_packaging: 常规包装、纸盒包装、大收缩膜包装三选一。
- logo_printing: 可选。
- protection_arrangement: 单支套袋与对扣可以都不选；选择时互斥。
- defaults: 常规包装、Logo 关闭、套袋与对扣均不选。
- implementation_boundary: 未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: 只确认样本 003 的供应来源差异是否公开。

## TASK-012 Sample 002 Custom Length Range Policy Decision 2026-07-29

- model: `FGE X08+pvc`。
- fixed_minimum: 无。
- fixed_maximum: 无。
- frontend_validation: 长度大于 `0`，最多一位小数。
- submission_semantics: 提交表示询价需求，不承诺可生产、包装、运输或报价。
- feasibility_owner: 业务员收到询价后在飞书中人工判断。
- implementation_boundary: 未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: 只确认样本 003 的供应来源差异是否公开。

## TASK-012 Sample 002 Custom Length Precision Decision 2026-07-29

- model: `FGE X08+pvc`。
- decimal_places: 最多一位小数。
- increment: `0.1 m`。
- valid_example: `5.5 m`。
- invalid_examples: `5.55 m`、`5.555 m`。
- quantity_separation: 支数仍只允许大于零的整数。
- range_policy: 不设固定最小值或最大值，由业务员判断可行性。
- implementation_boundary: 未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: 只确认样本 003 的供应来源差异是否公开。

## TASK-012 Sample 002 Custom Length Input Contract Decision 2026-07-28

- selector: `Custom Length`。
- length_field: 以米（m）为固定单位，允许正小数，例如 `5.5 m`。
- quantity_field: 独立填写支数，只允许大于零的整数。
- semantic_separation: 长度允许小数不改变 RFQ 数量禁止小数的既有规则。
- status: RFQ 行标记为定制长度、待业务处理。
- precision: 最多一位小数，最小增量 `0.1 m`。
- range_policy: 不设固定最小值或最大值，由业务员判断可行性。
- implementation_boundary: 未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: 只确认样本 002 的包装默认值。

## TASK-012 Sample 002 New Custom Length RFQ Decision 2026-07-28

- model: `FGE X08+pvc`。
- case: 客户需要飞书产品主数据中尚不存在 Article Number 的新定制长度。
- website_action: 允许客户直接提交询价。
- identity_boundary: 网站不生成、伪造或临时复用 Article Number。
- handoff: RFQ 标记为尚无 Article Number 的定制长度需求，由业务员在飞书中处理。
- ownership: 后续产品主数据和 Article Number 处理属于飞书业务流程，不由网站自动完成。
- input_contract: `Custom Length` + 米制小数长度 + 整数支数。
- precision: 最多一位小数，最小增量 `0.1 m`。
- range_policy: 不设固定最小值或最大值，由业务员判断可行性。
- implementation_boundary: 未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: 只确认样本 002 是否采用完整轨道包装合同。

## TASK-012 Sample 002 Length Article Identity Decision 2026-07-28

- model: `FGE X08+pvc`。
- rule: 每一个不同长度规格分别拥有独立 Article Number。
- confirmed_example: `GDHEPRD000328` 只对应每支 `6 m`。
- prohibition: 不同长度不得复用 6 米规格 Article Number，网站不得自行生成 Article Number。
- new_custom_flow: 允许提交无 Article Number 的定制长度 RFQ，由业务员在飞书处理。
- input_contract: `Custom Length` + 米制小数长度 + 整数支数。
- precision: 最多一位小数，最小增量 `0.1 m`。
- unresolved: 定制长度最小值和最大值。
- implementation_boundary: 未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: 只确认该型号允许的定制长度范围。

## TASK-012 Sample 002 Length And Customization Decision 2026-07-28

- model: `FGE X08+pvc`。
- confirmed_article: `GDHEPRD000328`。
- confirmed_specification: 每支 `6 m`。
- other_lengths: 同一型号还存在其他米数规格。
- customization: 支持客户定制长度。
- identity_rule: 每一个不同长度规格均使用独立 Article Number。
- new_custom_flow: 尚无 Article Number 时仍允许提交询价，业务员在飞书处理。
- input_contract: `Custom Length` + 米制小数长度 + 整数支数。
- unresolved: 定制长度允许的小数位数或最小增量。
- implementation_boundary: 未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: 只确认定制长度的小数精度或最小增量。

## TASK-012 Sample 002 RFQ Optionality Decision 2026-07-28

- electric_track: `FGE X08+pvc / GDHEPRD000328`。
- optional_recommendations: `PJ-D16` 电机、`PJ-D25` 传动箱、`PJ-LJ-15` 外连接器。
- default_quote_state: 三者默认均不加入询价清单。
- track_only_quote: 客户可以只询轨道本体。
- add_action: 客户主动添加某个配件后才创建独立 RFQ 行，并要求大于零的整数数量。
- bundling: 不强制捆绑，不自动创建套装或组合 Article Number。
- implementation_boundary: 未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: 只确认其他标准长度和客户定制长度如何对应 Article Number。

## TASK-012 Sample 002 Connector Compatibility Decision 2026-07-28

- electric_track: `FGE X08+pvc / GDHEPRD000328`。
- compatible_connector: `PJ-LJ-15 / 佳丽斯外连接器 / GDHEPRD000642`。
- relation_status: 用户明确确认兼容。
- confirmed_core_relations: `PJ-D16` 电机、`PJ-D25` 传动箱、`PJ-LJ-15` 外连接器。
- rfq_optionality: 三个配件全部为可选推荐，客户可以只询轨道。
- implementation_boundary: 未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: 只确认样本 002 的 `6 M` 是否表示每支轨道长度为 6 米。

## TASK-012 Sample 002 Transmission Compatibility Decision 2026-07-28

- electric_track: `FGE X08+pvc / GDHEPRD000328`。
- compatible_transmission_box: `PJ-D25 / 佳丽斯传动箱 / GDHEPRD000641`。
- relation_status: 用户明确确认兼容。
- business_basis: 该轨道属于佳丽斯轨道系统。
- inference_boundary: 品牌/系统归属是本次人工确认依据，不构成所有佳丽斯产品自动互相兼容的规则。
- authority: 公开站最终只使用飞书中明确的型号级兼容关系。
- implementation_boundary: 未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: 只确认 `FGE X08+pvc` 是否兼容 `PJ-LJ-15 / 佳丽斯外连接器 / GDHEPRD000642`。

## TASK-012 Sample 002 Remote Data Deferred Decision 2026-07-28

- electric_track: `FGE X08+pvc / GDHEPRD000328`。
- compatible_motor: `PJ-D16 / 杜亚82电机 / GDHEPRD000640`。
- remote_data: 用户目前暂时没有可提供或确认的配套遥控器资料。
- semantic_boundary: 只表示当前验证资料缺口；不表示电机不支持遥控器，也不否定未来补充。
- publication_boundary: 未确认遥控器不得生成公开产品事实、Article Number 或兼容关系。
- implementation_boundary: 未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: 只确认 `FGE X08+pvc` 是否兼容 `PJ-D25 / 佳丽斯传动箱 / GDHEPRD000641`。

## TASK-012 Sample 002 Motor Compatibility Decision 2026-07-28

- electric_track: `FGE X08+pvc / GDHEPRD000328`。
- compatible_motor: `PJ-D16 / 杜亚82电机 / GDHEPRD000640`。
- relation_status: 用户明确确认兼容。
- cardinality_boundary: 仅确认一条兼容关系，不推定 `PJ-D16` 是唯一兼容电机。
- confirmed_relations: `PJ-D16` 电机、`PJ-D25` 传动箱、`PJ-LJ-15` 外连接器。
- confirmed_length: `GDHEPRD000328` 对应每支 6 米。
- customization: 同一型号有其他长度并支持定制。
- confirmed_length_identity: 每个长度规格分别拥有独立 Article Number。
- packaging_contract: 适用完整轨道包装合同。
- deferred_gaps: 配套遥控器资料暂缺；其他兼容电机和原始行未知字段可后补。
- implementation_boundary: 未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: 只确认样本 003 的供应来源差异是否公开。

## TASK-012 Sample 002 Electric Track Batch Received 2026-07-28

- sample: `FGE X08+pvc / GDHEPRD000328`。
- direct_fields: `1458静音电动轨白`、`FGE X08+pvc Track`、轨道、白色/White、`图片.png`、`6 M`。
- candidate_batch: 原始粘贴含重复行；按 Article Number 去重后为 27 个候选记录。
- same_batch_records: `PJ-D16 / GDHEPRD000640` 电机、`PJ-D25 / GDHEPRD000641` 传动箱、`PJ-LJ-15 / GDHEPRD000642` 外连接器。
- evidence_boundary: 同批出现不构成产品兼容关系；不得自动绑定。
- confirmed_relation: `FGE X08+pvc` 兼容 `PJ-D16 / GDHEPRD000640`；不推定唯一性。
- missing_relation: 配套遥控器资料目前暂缺；不推定为“不支持遥控器”。
- unknown_columns: `601*17.5*6`、`0.0630000`、`43.3`、`常用`、`Error` 等在字段名未核对前不映射。
- implementation_boundary: 未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: 只确认 `FGL X14` 五个 Article Number 的页面归组。

## TASK-012 Sample 001 No Installation Selector Decision 2026-07-28

- sample: `FGD X15+PVC`。
- installation_support: 产品页说明同时支持顶装和墙装。
- selection_model: 不设置“顶装/墙装”选择字段或前置选择步骤。
- accessory_presentation: 推荐配件区同时展示经型号级关系确认兼容的顶码和墙码，不做安装方式预过滤。
- customer_action: 客户根据实际需要直接添加顶码或墙码，并为已添加配件填写大于零的整数数量。
- supersedes: 撤销此前“选择安装方式后过滤安装码推荐”的未确认假设；该假设从未实施。
- implementation_boundary: 未修改 WordPress、Schema、API、前端、数据库或 RFQ 实现。
- next: 提供并核对样本 002，一个真实电动轨道及其电机、遥控器关系。

## TASK-012 Sample 001 Related Accessory Suggestion Decision 2026-07-28

- sample: `FGD X15+PVC`。
- related_accessories: 顶码、墙码、走珠、封口。
- default_quote_state: 默认均不加入询价清单。
- presentation: 在产品页面作为推荐配件展示。
- add_action: 客户主动点击添加并填写大于零的整数数量后，创建独立配件询价行。
- implementation_boundary: 未修改 WordPress、Schema、API、前端、数据库或 RFQ 实现。
- next: 提供并核对样本 002，一个真实电动轨道及其电机、遥控器关系。

## TASK-012 Sample 001 Optional Runner And End Stop Decision 2026-07-28

- sample: `FGD X15+PVC`。
- related_accessories: 对应走珠、对应封口。
- selection: 可选，客户可以只询轨道本体。
- bundling: 不强制捆绑，不自动生成套装 Article Number。
- quantity_rule: 客户主动添加配件后，该配件行必须填写大于零的整数数量。
- supersedes: 覆盖本轮被中断输入中的“需要填写”歧义，以用户最新完整说明为准。
- implementation_boundary: 未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: 提供并核对样本 002，一个真实电动轨道及其电机、遥控器关系。

## TASK-012 Sample 001 Runner And End Stop Relation Decision 2026-07-28

- sample: `FGD X15+PVC`。
- related_accessories: 对应走珠、对应封口。
- relation_level: 目标为型号级兼容配件关系。
- qualification: “需要关联”不等于默认包含、必选或自动加入询价清单。
- implementation_boundary: 未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: 确认关联配件是否默认不加入询价清单，仅作为推荐项展示。

## TASK-012 Sample 001 Packaging Default Decision 2026-07-28

- sample: `FGD X15+PVC`。
- default_base_packaging: 常规包装。
- default_logo_printing: 关闭。
- default_protection_arrangement: 单支套袋与对扣均不选。
- customer_override: 客户可以在合法组合内主动修改。
- implementation_boundary: 未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: 确认走珠与封口在询价时是必选配件还是可选配件。

## TASK-012 Sample 001 Packaging Applicability Decision 2026-07-28

- sample: `FGD X15+PVC`。
- base_packaging: 常规包装、纸盒包装、大收缩膜包装三选一。
- logo_printing: 可选。
- protection_arrangement: 可以不选；选择时单支套袋与对扣二选一。
- implementation_boundary: 未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: 确认除顶码和墙码外，该轨道是否还关联走珠与封口。

## TASK-012 Sample 001 Transition Exit Criteria Decision 2026-07-28

- minimum_retention: 至少 30 天。
- minimum_full_syncs: 至少 3 次完整同步。
- review: 人工抽查通过。
- deletion_gate: 最后取得人工确认，才允许删除旧 Article Number 级字段。
- excluded: 不额外加入未经用户确认的“零异常”或其他门槛。
- implementation_boundary: 未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: 确认默认值是否为常规包装、不开启 Logo 印刷、套袋与对扣均不选。

## TASK-012 Sample 001 Transition Field Read Policy Decision 2026-07-28

- scope: 过渡期内旧 Article Number 级兼容关联字段。
- write_policy: 冻结为只读，仅用于迁移核对。
- sync_policy: 不再参与网站同步。
- public_authority: 网站只读取型号级兼容关系。
- dual_authority: 禁止形成型号级与 Article Number 级两个可写权威来源。
- implementation_boundary: 未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: 确认 `FGD X15+PVC` 实际支持哪些轨道包装选项。

## TASK-012 Sample 001 Article Link Transition Decision 2026-07-28

- scope: 型号级兼容关系迁移成功后的旧 Article Number 级关联字段。
- retention: 保留一段过渡期，不立即删除。
- reason: 为迁移核对和稳定性观察保留旧数据证据。
- unresolved: 过渡期内字段是否只读、是否参与网站同步，以及过渡期退出条件。
- implementation_boundary: 未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: 确认过渡期采用固定时长，还是达到成功同步次数和人工抽查条件后退出。

## TASK-012 Sample 001 Migration Retry Policy Decision 2026-07-28

- conflict_scope: 同一型号下现有 Article Number 记录的兼容关联不一致。
- correction_authority: 在飞书人工修正。
- retry: 下一次同步自动重新校验冲突型号。
- success: 校验通过后自动继续该型号迁移。
- manual_recovery: 不要求额外人工恢复或单独触发。
- implementation_boundary: 未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: 确认旧字段在过渡期内是否冻结为只读且不再参与网站同步。

## TASK-012 Sample 001 Migration Conflict Policy Decision 2026-07-28

- scope: Article Number 级兼容关联迁移到型号级关系。
- conflict: 同一型号下现有 Article Number 记录的关联配件集合不一致。
- action: 停止该型号迁移，等待人工核对。
- prohibited: 不自动取并集、交集、首条或末条覆盖。
- isolation: 只阻止冲突型号，其他校验通过的型号继续迁移。
- implementation_boundary: 未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: 确认型号级迁移成功后，旧 Article Number 级关联字段应删除、改为隐藏只读，还是保留过渡期。

## TASK-012 Sample 001 Model Compatibility Inheritance Decision 2026-07-28

- sample: `FGD X15+PVC`。
- model_rule: 同一型号下所有轨道规格使用相同的兼容配件。
- inheritance: 每个 Article Number 规格从型号继承兼容关系。
- override: 不允许 Article Number 级兼容配件覆盖、追加或删除。
- implementation_boundary: 未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: 确认型号级迁移成功后，旧 Article Number 级关联字段应删除、改为隐藏只读，还是保留过渡期。

## TASK-012 Sample 001 Compatibility Level Target Decision 2026-07-28

- sample: `FGD X15+PVC`。
- current_level: 飞书当前在每个具体 Article Number 产品记录上维护兼容配件关联。
- target_level: 兼容关系应建立在型号层级，由型号下的 Article Number 规格继承。
- reason: 避免同一型号的各规格重复维护相同配件关系。
- migration_status: 只记录目标模型，尚未设计或执行飞书字段和数据迁移。
- implementation_boundary: 未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: 确认型号级迁移成功后，旧 Article Number 级关联字段应删除、改为隐藏只读，还是保留过渡期。

## TASK-012 Sample 001 Compatibility Link Field Decision 2026-07-28

- sample: `FGD X15+PVC`。
- track_article_number: `GDHEPRD000172`。
- storage_form: 飞书关联记录字段。
- relation_target: 直接关联兼容配件产品记录，而不是保存 Article Number 文本、普通文字或图片。
- sync_identity: 同步读取目标配件记录自身的 Article Number。
- implementation_boundary: 未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: 确认型号级迁移成功后，旧 Article Number 级关联字段应删除、改为隐藏只读，还是保留过渡期。

## TASK-012 Sample 001 Compatibility Authority Decision 2026-07-28

- sample: `FGD X15+PVC`。
- track_article_number: `GDHEPRD000172`。
- authority: 轨道与顶码、墙码的实际兼容关系已经存放在飞书产品主数据中。
- website_boundary: 网站只读取并展示飞书提供的兼容关系，不自行按宽度推导。
- implementation_boundary: 未连接或修改飞书，也未修改 WordPress、Schema、API、前端或数据库。
- next: 确认型号级迁移成功后，旧 Article Number 级关联字段应删除、改为隐藏只读，还是保留过渡期。

## TASK-012 Sample 001 Explicit Bracket Compatibility Rule 2026-07-28

- sample: `FGD X15+PVC`。
- track_article_number: `GDHEPRD000172`。
- cross_model_compatibility: 安装码可以兼容多个轨道型号。
- track_type_constraint: 不同轨道类型使用的配件不同。
- width_role: 安装面宽度只用于生成建议候选，不能自动判定兼容。
- authoritative_selection: 最终可选安装码必须来自该轨道类型经确认的实际配件关系。
- implementation_boundary: 未修改飞书、WordPress、Schema、API、前端或数据库。
- next: 确认型号级迁移成功后，旧 Article Number 级关联字段应删除、改为隐藏只读，还是保留过渡期。

## TASK-012 Sample 001 Bracket Width Compatibility Rule 2026-07-28

- sample: `FGD X15+PVC`。
- track_article_number: `GDHEPRD000172`。
- cardinality: 同一个安装码可兼容多个轨道型号。
- primary_compatibility_dimension: 轨道安装面宽度仅用于候选建议。
- example: 28 mm 安装面的轨道通常使用 28 mm 安装码。
- qualification: 不同轨道类型使用的配件不同；同宽不能直接判定兼容。
- implementation_boundary: 未修改飞书、WordPress、Schema、API、前端或数据库。
- next: 确认型号级迁移成功后，旧 Article Number 级关联字段应删除、改为隐藏只读，还是保留过渡期。

## TASK-012 Sample 001 Bracket Article Identity Decision 2026-07-28

- sample: `FGD X15+PVC`。
- track_article_number: `GDHEPRD000172`。
- ceiling_bracket_identity: 顶码具有独立 Article Number，具体编号待提供。
- wall_bracket_identity: 墙码具有独立 Article Number，具体编号待提供。
- relation: 顶装或墙装只替换安装码配件，不改变轨道 Article Number。
- implementation_boundary: 未修改飞书、WordPress、Schema、API、前端或数据库。
- next: 确认型号级迁移成功后，旧 Article Number 级关联字段应删除、改为隐藏只读，还是保留过渡期。

## TASK-012 Sample 001 Installation Article Boundary Decision 2026-07-28

- sample: `FGD X15+PVC`。
- track_article_number: `GDHEPRD000172`。
- invariant: 顶装与墙装不改变轨道 Article Number。
- changed_component: 仅更换对应顶码或墙码配件。
- page_identity: 两种安装方式共用同一产品页面。
- implementation_boundary: 未修改飞书、WordPress、Schema、API、前端或数据库。
- next: 确认型号级迁移成功后，旧 Article Number 级关联字段应删除、改为隐藏只读，还是保留过渡期。

## TASK-012 Sample 001 Installation Methods Decision 2026-07-28

- sample: `FGD X15+PVC`。
- article_number: `GDHEPRD000172`。
- supported_installation: 顶装、墙装。
- differentiator: 主要由不同安装码决定。
- page_identity: 不因安装方式拆成两个产品页面。
- confirmed_article_boundary: 两种安装方式保持轨道 Article Number `GDHEPRD000172`，只改变安装码配件。
- implementation_boundary: 未修改飞书、WordPress、Schema、API、前端或数据库。
- next: 确认型号级迁移成功后，旧 Article Number 级关联字段应删除、改为隐藏只读，还是保留过渡期。

## TASK-012 Sample 001 Section Dimensions Decision 2026-07-28

- sample: `FGD X15+PVC`。
- article_number: `GDHEPRD000172`。
- section_height: `27 mm`。
- section_width: `28 mm`。
- source: 用户提供的截面图标注并确认单位。
- implementation_boundary: 未修改飞书、WordPress、Schema、API、前端或数据库。
- next: 确认切换顶装/墙装是否不改变轨道 Article Number，只改变安装码配件。

## TASK-012 Sample 001 PVC Nano Strip Weight Decision 2026-07-28

- sample: `FGD X15+PVC`。
- article_number: `GDHEPRD000172`。
- track_meter_weight: `155–160 g/m`。
- pvc_nano_strip_meter_weight: `115 g/m`。
- section_dimensions: 高度 `27 mm`；宽度 `28 mm`。
- installation_methods: 顶装、墙装；主要通过不同安装码实现。
- storage_boundary: 两个重量参数分开保存，不相加为单一字段。
- implementation_boundary: 未修改飞书、WordPress、Schema、API、前端或数据库。
- next: 确认切换顶装/墙装是否不改变轨道 Article Number，只改变安装码配件。

## TASK-012 Sample 001 Meter Weight Decision 2026-07-28

- sample: `FGD X15+PVC`。
- article_number: `GDHEPRD000172`。
- meter_weight: `155–160 g/m`。
- pvc_nano_strip_meter_weight: `115 g/m`。
- meaning: 轨道主体每米重量范围。
- implementation_boundary: 未修改飞书、WordPress、Schema、API、前端或数据库。
- next: 确认切换顶装/墙装是否不改变轨道 Article Number，只改变安装码配件。

## TASK-012 Sample 001 Length Specification Decision 2026-07-28

- sample: `FGD X15+PVC`。
- article_number: `GDHEPRD000172`。
- piece_length: `6 m`。
- public_quantity_unit: `支`。
- internal_length_relation: 飞书可使用 `6 m × 支数` 计算总米数；计算实现仍属于飞书端。
- meter_weight: `155–160 g/m`。
- implementation_boundary: 未修改飞书、WordPress、Schema、API、前端或数据库。
- next: 确认切换顶装/墙装是否不改变轨道 Article Number，只改变安装码配件。

## TASK-012 Sample 001 Article Number Decision 2026-07-28

- sample: `FGD X15+PVC`。
- article_number: `GDHEPRD000172`。
- identity: 该具体规格的公开 Article Number。
- length_specification: 每支 `6 m`。
- model_relation: 一个型号下的一个具体规格行，符合已确认的一型号多规格、一规格一 Article Number 规则。
- implementation_boundary: 未修改飞书、WordPress、Schema、API、前端或数据库。
- next: 确认切换顶装/墙装是否不改变轨道 Article Number，只改变安装码配件。

## TASK-012 Real Product Sample 001 Partial Mapping 2026-07-28

- model: `FGD X15+PVC`。
- names: 中文 `999纳米喷牙白`；英文 `FGD X15+PVC Track`。
- classification: 类别 `轨道`；二级类别 `大方`。
- colors: 中文 `鑫邦牙白`；英文 `ivory white`。
- source_values_pending_semantics: 顶码/墙码/走珠/封口的具体 Article Number、未来飞书迁移方案和其他关联配件。
- confirmed_meter_weight: `155–160 g/m`。
- confirmed_pvc_nano_strip_meter_weight: `115 g/m`。
- confirmed_length_specification: `6 M` 表示每支轨道 6 米。
- image_evidence: 图片标注 `FGD X15`、`H:27`、`W:28`，展示 PVC/软质内衬截面；公开使用权和原始图待确认。
- supplier_tail: `LSB-246`、`152`、`04#`、`115`、供应商图片名、`4.7432` 等不进入公开映射。
- confirmed_identifier: `GDHEPRD000172` 是该具体规格的 Article Number。
- validation_status: `PARTIAL_MAPPING`，不构成完整真实产品验证或 Schema 冻结。
- implementation_boundary: 未修改飞书、WordPress、Schema、API、前端或数据库。
- next: 提供并核对样本 002，一个真实电动轨道及其电机、遥控器关系。

## TASK-012 Duplicate RFQ Line Decision 2026-07-28

- line_identity: `Article Number + 完整公开配置`。
- merge: Article Number 与包装、Logo、套袋/对扣等全部配置相同时合并并累加数量。
- separate: 任一公开配置不同则保留独立行。
- safety: 不得仅按 Article Number 合并而丢失客户配置。
- implementation_boundary: 未修改 WordPress、Schema、API、前端或 RFQ 表单。
- next: 确认切换顶装/墙装是否不改变轨道 Article Number，只改变安装码配件。

## TASK-012 Multi-product RFQ List Flow Decision 2026-07-28

- product_action: 把当前已选 Article Number、规格/选项和数量加入询价清单。
- continued_browsing: 客户可以继续浏览并添加其他产品。
- final_step: 最后统一填写联系信息并一次提交全部行项目。
- excluded: 产品 CTA 不立即提交单产品表单，也不构成在线下单。
- implementation_boundary: 未修改 WordPress、Schema、API、前端或 RFQ 表单。
- next: 确认切换顶装/墙装是否不改变轨道 Article Number，只改变安装码配件。

## TASK-012 Primary RFQ CTA Label Decision 2026-07-28

- primary_cta: `Request a Quote`。
- scope: 英语站正常在售产品的统一主询价路径。
- disallowed_mixed_labels: 同一主路径不混用 `Ask for Quotation` 或 `Get a Quote`。
- discontinued_exception: 停产产品继续使用 `Contact Us for Replacement`。
- implementation_boundary: 未修改 WordPress、Schema、API、前端或 RFQ 表单。
- next: 确认切换顶装/墙装是否不改变轨道 Article Number，只改变安装码配件。

## TASK-012 RFQ Positive Integer Quantity Decision 2026-07-28

- scope: 所有按支、卷、个提交的产品和配件 RFQ 行项目。
- type: 大于零的整数。
- minimum: `1`。
- invalid: 空值、`0`、负数和小数。
- future_validation: 浏览器交互层与服务端 intake 均须校验；本轮不实现。
- implementation_boundary: 未修改飞书、WordPress、Schema、API、前端或 RFQ 表单。
- next: 确认切换顶装/墙装是否不改变轨道 Article Number，只改变安装码配件。

## TASK-012 Article Number Terminology Decision 2026-07-28

- canonical_term: `Article Number`。
- correction: 本轮出现的 `Part Number` 是用户口误。
- model_effect: 不建立 `Part Number` 字段、别名、映射或第二套编号。
- conversion_key: 飞书报价系统按 Article Number 读取对应长度换算字段。
- implementation_boundary: 未修改飞书、WordPress、Schema、API、前端或 RFQ 表单。
- next: 确认切换顶装/墙装是否不改变轨道 Article Number，只改变安装码配件。

## TASK-012 Feishu Conversion Field Authority Decision 2026-07-28

- authority: 每个可订购产品对应的长度换算字段保存在飞书产品主数据中。
- quote_input: 飞书报价系统只选择产品并取得客户数量。
- quote_calculation: 报价系统读取产品主数据字段并计算总长度及包装件数。
- website_boundary: 上述字段读取与计算属于飞书端，不属于官网、WordPress、GDHE REST API 或 Next.js 实现范围。
- terminology_resolved: 统一使用 `Article Number`；`Part Number` 是口误，不创建该字段或别名。
- implementation_boundary: 未修改飞书、WordPress、Schema、API、前端或 RFQ 表单。
- next: 确认切换顶装/墙装是否不改变轨道 Article Number，只改变安装码配件。

## TASK-012 Public RFQ Units and Internal Conversion Decision 2026-07-28

- public_units: 轨道按支；布带和线珠按卷；电机、遥控器及其他配件按个。
- internal_length_conversion: 飞书报价系统将轨道、布带和线珠换算为总米数。
- accessory_calculation: 配件继续按个计算。
- package_conversion: 飞书报价系统根据包装方式折算轨道、布带/线珠和小配件的包装件数。
- website_boundary: 客户只填写公开订购单位数量，不填写内部总米数或包装件数。
- implementation_boundary: 未修改飞书、WordPress、Schema、API、前端或 RFQ 表单。
- next: 确认切换顶装/墙装是否不改变轨道 Article Number，只改变安装码配件。

## TASK-012 RFQ Quantity Required Decision 2026-07-28

- scope: 所有加入 quotation request 的产品和配件 RFQ 行项目。
- required: 每个行项目都必须填写数量。
- incomplete_submission: 缺少数量的行项目不能作为完整询价提交。
- no_salesperson_backfill_path: 不提供先留空数量、再由业务员补录的公开提交路径。
- implementation_boundary: 未修改飞书、WordPress、Schema、API、前端或 RFQ 表单。
- next: 确认切换顶装/墙装是否不改变轨道 Article Number，只改变安装码配件。

## TASK-012 Motor and Remote RFQ Selection Decision 2026-07-28

- selection_modes: 允许只选电机、只选遥控器或同时选择两者。
- independent_quantities: 电机和遥控器分别填写数量。
- quantity_may_differ: 两个行项目的数量可以不同。
- line_identity: 两个 RFQ 行项目分别使用各自的 Article Number。
- implementation_boundary: 未修改飞书、WordPress、Schema、API、前端或 RFQ 表单。
- next: 确认切换顶装/墙装是否不改变轨道 Article Number，只改变安装码配件。

## TASK-012 Motor and Remote Article Number Decision 2026-07-28

- public_page: 同款、同型号且出厂配套的电机和遥控器共用一个公开页面。
- motor_identity: 电机保留自己的全局唯一 Article Number。
- remote_identity: 遥控器保留自己的全局唯一 Article Number。
- no_bundle_article: 不创建额外组合 Article Number。
- implementation_boundary: 未修改飞书、WordPress、Schema、API、前端或 RFQ 表单。
- resolved: 客户可只选择电机、只选择遥控器或同时选择两者，并分别填写可以不同的数量。
- next: 确认切换顶装/墙装是否不改变轨道 Article Number，只改变安装码配件。

## TASK-012 Bead Article Number Decision 2026-07-28

- model_identity: 颜色和具体珠型共同决定线珠型号。
- specification_identity: 珠距和卷长共同确定具体可订购规格。
- article_number_rule: 不同珠距或不同卷长均产生独立 Article Number。
- model_stability: 珠距和卷长变化不改变型号。
- bead_contract_status: 线珠型号—规格—Article Number 层级已闭合，真实记录仍须代表样本核对。
- implementation_boundary: 未修改飞书、WordPress、Schema、API、前端或 RFQ 表单。
- resolved: 电机和遥控器分别保留独立 Article Number，不创建组合 Article Number。
- next: 确认切换顶装/墙装是否不改变轨道 Article Number，只改变安装码配件。

## TASK-012 Bead Model and Specification Decision 2026-07-28

- model_identity: 颜色和具体珠型共同决定线珠型号。
- somfy_series: 单扣尚飞大方珠、双扣尚飞大方珠、大圆扣尚飞大方珠。
- user_named_jialis_series: 单扣佳丽斯中方珠、双扣佳丽斯中方珠、小圆扣佳丽斯珠。
- spacing_values: 6cm、6.6cm、7cm、8cm、10.2cm。
- spacing_relation_guard: 10.2cm 一般用于双扣，但当前不建立排他约束。
- roll_lengths: 40m、50m、60m 等；卷长改变 Article Number，不改变型号。
- implementation_boundary: 未修改飞书、WordPress、Schema、API、前端或 RFQ 表单。
- resolved: 不同珠距和不同卷长均产生独立 Article Number。
- next: 确认切换顶装/墙装是否不改变轨道 Article Number，只改变安装码配件。

## TASK-012 Tape Unit Decision 2026-07-28

- width_unit: 毫米（mm）。
- nail_spacing_unit: 毫米（mm）。
- length_unit: 米（m）。
- confirmed_examples: 宽度 30mm/45mm/60mm；钉距 125mm/145mm/165mm/170mm 及更多值；长度 30m/40m/50m/60m 等。
- tape_contract_status: 布带型号—规格—Article Number 层级已闭合，真实记录仍须代表样本核对。
- implementation_boundary: 未修改飞书、WordPress、Schema、API、前端或 RFQ 表单。
- resolved: 线珠型号驱动因素、珠型系列、常见珠距和卷长规则已记录。
- next: 确认切换顶装/墙装是否不改变轨道 Article Number，只改变安装码配件。

## TASK-012 Tape Model Identity Decision 2026-07-28

- model_identity: 布带型号由颜色和钉子材质共同决定。
- examples: 黑色不锈钢钉、黑色铝钉、白色不锈钢钉、白色铝钉分别属于不同型号。
- specification_only: 宽度、钉距、长度不改变型号，只确定型号下的具体规格及独立 Article Number。
- implementation_boundary: 未修改飞书、WordPress、Schema、API、前端或 RFQ 表单。
- resolved: 布带宽度和钉距使用 mm，长度使用 m。
- next: 确认切换顶装/墙装是否不改变轨道 Article Number，只改变安装码配件。

## TASK-012 Accessory Model Hierarchy Decision 2026-07-28

- global_rule: 配件不强制每个 Article Number 都有一个独立型号。
- tape_model_driver_confirmed: 布带钉子材质不同会产生不同型号；不锈钢钉与铝钉分别属于不同型号。
- tape_specification_drivers: 同一型号下，宽度、钉距和长度不同会产生独立 Article Number。
- tape_known_values: 宽度 30mm/45mm/60mm；钉距 125mm/145mm/165mm/170mm 及更多值；长度 30m/40m/50m/60m 等。
- other_accessories: 封口、顶码、吊码、走珠等通常同时有型号和独立 Article Number，但“通常”不构成全局必填约束。
- implementation_boundary: 未修改飞书、WordPress、Schema、API、前端或 RFQ 表单。
- resolved: 布带型号由颜色和钉子材质共同决定。
- next: 确认切换顶装/墙装是否不改变轨道 Article Number，只改变安装码配件。

## TASK-012 Accessory Category Cardinality Decision 2026-07-28

- relation: 配件到配件类别为多对一。
- required_single_category: 每个具体配件必须且只能属于一个配件类别。
- article_number_guard: 同一 Article Number 不得同时归入多个配件类别。
- category_capacity: 一个配件类别可以包含多个配件。
- implementation_boundary: 未修改飞书、WordPress、Schema、API、前端或 RFQ 表单。
- resolved: 配件型号与 Article Number 的非一对一层级已部分确认。
- next: 确认切换顶装/墙装是否不改变轨道 Article Number，只改变安装码配件。

## TASK-012 Accessory Terminology Normalization 2026-07-28

- confirmed: 用户确认“强码”是“墙码”的笔误。
- canonical_term: 墙码。
- prohibited_duplicate: 不创建“强码”配件类别。
- affected_examples: 顶码、墙码、走珠、封口、布带、线珠。
- implementation_boundary: 未修改飞书、WordPress、Schema、API、前端或 RFQ 表单。
- resolved: 配件类别采用多对一基数，每个配件必须且只能属于一个类别。
- next: 确认切换顶装/墙装是否不改变轨道 Article Number，只改变安装码配件。

## TASK-012 Unified Accessory Role Decision 2026-07-28

- role: 产品领域统一使用“配件”，不建立“备件”或“套装成员”独立业务角色。
- classification: 使用可筛选的“配件类别”组织配件。
- examples: 顶码、墙码、走珠、封口、布带、线珠。
- orthogonal_page_identity: 配件类别不决定页面身份；布带/线珠可有独立类型详情页，小型配件可仅在相关配件区域展示。
- terminology_resolved: “强码”确认为“墙码”的笔误，只保留“墙码”规范类别。
- implementation_boundary: 未修改飞书、WordPress、Schema、API、前端或 RFQ 表单。
- next: 确认切换顶装/墙装是否不改变轨道 Article Number，只改变安装码配件。

## TASK-012 Small Accessory Packaging Decision 2026-07-28

- scope: 封口、走珠、顶码、墙码等不单独建页的小型相关配件。
- fixed_packaging: 固定使用纸箱包装。
- public_behavior: 官网不提供包装选择。
- contract_isolation: 不接入其他产品类别的包装合同。
- category_packaging_status: 当前已知产品类别的包装合同已确认完成；真实记录分配留待代表产品核对。
- implementation_boundary: 未修改飞书、WordPress、Schema、API、前端或 RFQ 表单。
- resolved: 产品领域统一使用“配件”角色，通过配件类别筛选。
- next: 确认切换顶装/墙装是否不改变轨道 Article Number，只改变安装码配件。

## TASK-012 Motor and Remote Packaging Decision 2026-07-28

- scope: 同款、同型号且出厂配套的电机和遥控器。
- fixed_packaging: 固定使用纸箱包装。
- public_behavior: 官网只展示固定包装说明，不提供包装选择。
- contract_isolation: 不接入轨道类三维包装选择，也不复用布带/线珠包装合同。
- implementation_boundary: 未修改飞书、WordPress、Schema、API、前端或 RFQ 表单。
- resolved: 小型相关配件固定使用纸箱包装，官网不提供包装选择。
- next: 确认切换顶装/墙装是否不改变轨道 Article Number，只改变安装码配件。

## TASK-012 Tape and Bead Packaging Decision 2026-07-28

- excluded_from_rail_contract: 布带和用户所称“线珠”不适用轨道类的三维包装合同。
- public_default: 官网只展示纸箱常规包装。
- website_excluded_service: 特殊组合包装不公开，也不作为 RFQ 自助选项；由业务员针对已有需求的客户单独提供。
- terminology_guard: “常规包装”必须按产品类别区分；轨道类表示防撞膜加尼龙带，布带/线珠类表示纸箱，不得合并为一个全局通用选项。
- implementation_boundary: 未修改飞书、WordPress、Schema、API、前端或 RFQ 表单。
- resolved: 电机和遥控器固定使用纸箱包装，官网不提供包装选择。
- resolved: 小型相关配件固定使用纸箱包装，官网不提供包装选择。
- next: 确认切换顶装/墙装是否不改变轨道 Article Number，只改变安装码配件。

## TASK-012 Real Packaging Option Evidence 2026-07-28

- evidence: 用户提供的飞书选项截图与逐项业务说明；未在线读取真实 Base。
- source_labels: 常规、纸盒、打字、套袋、大收缩膜、对扣。
- meanings: 常规为防撞膜加尼龙带；纸盒为泡沫膜外加纸盒；打字为客户 Logo 印刷；套袋为单支 PP 膜热塑；大收缩膜为整扎塑封热缩；对扣为两根轨道配对以节省装柜空间。
- wordpress_presentation: 官网由 WordPress 维护详细说明；“打字”不得在英文网站按字面翻译。
- normalized_dimensions: 基础包装、Logo 印刷、保护/排列方式。
- required_base: 常规/纸盒/大收缩膜必须三选一。
- optional_logo_printing: Logo 印刷可以不选。
- optional_protection_arrangement: 套袋/对扣可以都不选；选择时二选一。
- compatibility: Logo 印刷可与任一基础包装和套袋或对扣组合。
- partially_resolved: 布带和线珠已排除在本合同之外；本合同当前按轨道类规则记录。
- resolved: 电机和遥控器采用固定纸箱包装，不属于本轨道选择合同。
- resolved: 小型相关配件固定使用纸箱包装，不属于本轨道选择合同。
- still_unconfirmed: 轨道真实记录分配。
- next: 确认切换顶装/墙装是否不改变轨道 Article Number，只改变安装码配件。

## TASK-012 Public B2B Information Decision 2026-07-28

- not_public: MOQ 不在官网特别展示。
- lead_time: 收到客户定金，并确认订单、包装和生产资料后，整柜交期通常为 `30–40 天`。
- packaging: 可选包装材料按产品类别维护，每类相对固定；轨道与布带/线珠的类别边界已确认。
- sample: 所有产品均可提供样品。
- oem_odm: 公司可提供 OEM 和 ODM。
- wordpress_authority: 包装类别与可选材料、交期、样品和 OEM/ODM。
- feishu_only_if_needed: MOQ。
- conversion_boundary: 信息公开不改变 B2B quotation request 模式，也不启用购物车、在线下单或支付。
- publication_gate: 只展示经过相应发布门审核的数据。
- resolved: 六个包装来源标签及其业务含义已由用户提供的截图和说明确认。
- resolved: 包装互斥、兼容和必选性已确认并拆为三个维度。
- resolved: 布带和线珠使用独立包装合同，官网只显示纸箱常规包装，特殊组合包装由业务员线下提供。
- resolved: 电机和遥控器固定使用纸箱包装，官网不提供包装选择。
- resolved: 小型相关配件固定使用纸箱包装，当前已知类别包装合同已确认。
- still_unconfirmed: 真实记录分配。
- implementation_boundary: 尚未读取或修改真实 Base，也未实现同步或页面。
- next: 确认切换顶装/墙装是否不改变轨道 Article Number，只改变安装码配件。

## TASK-012 First Public Product Field Allowlist Decision 2026-07-28

- public_identity: 产品名称、型号、Article Number。
- public_specification: 真实可选规格、尺寸、颜色、表面处理。
- public_technical: 技术参数、安装方式、兼容关系。
- public_lifecycle: 在售/停产状态。
- public_content: 产品图片、当前有效资料。
- publication_gate: 白名单只定义字段可公开范围；记录仍须通过飞书发布资格、数据校验和 WordPress 发布状态门。
- implementation_boundary: 尚未读取或修改真实 Base，也未实现同步。
- resolved: B2B 信息已改为分层公开，MOQ 不特别展示；编辑权威和交期起算事件已确认。
- next: 确认切换顶装/墙装是否不改变轨道 Article Number，只改变安装码配件。

## TASK-012 Internal Notes and Business Audit Decision 2026-07-27

- feishu_only: 内部备注和业务审核记录。
- wordpress_boundary: WordPress 只保留自身对公开文案、SEO、图片和页面模块的编辑修订历史，不复制飞书业务审核记录。
- excluded_from_website: 飞书内部备注和业务审核记录不进入 WordPress 产品镜像、GDHE REST API、Next.js、公开缓存或应用日志。
- implementation_boundary: 尚未读取或修改真实 Base，也未实现同步。
- resolved: 第一批公开产品字段白名单已确认。
- next: 确认切换顶装/墙装是否不改变轨道 Article Number，只改变安装码配件。

## TASK-012 Sensitive Field Isolation Decision 2026-07-27

- feishu_only: 成本、采购价、内部销售底价、利润/利润率、供应商信息、库存数据、客户专属报价。
- excluded_from_website: 不进入 WordPress、GDHE REST API、Next.js、公开缓存或应用日志。
- control: 产品同步采用公开字段白名单；未列入白名单的飞书字段默认不读取、不传输、不落库。
- implementation_boundary: 尚未读取或修改真实 Base，也未实现同步。
- resolved: 内部备注和业务审核记录同样只保存在飞书。
- next: 确认切换顶装/墙装是否不改变轨道 Article Number，只改变安装码配件。

## TASK-012 Current-Only Website Document Decision 2026-07-27

- website_storage: 只保存当前有效的型录、安装说明和技术图纸。
- current_metadata: 类型、版本号、语言、生效日期。
- product_relation: 一个当前文件可以关联多个产品。
- archive_authority: 失效旧版本只在极空间归档，不在网站内容层重复保存。
- replacement: 新版本生效时切换网站关系并移除旧文件。
- isolation: 极空间历史库不进入公开 API 或网站同步路径。
- implementation_boundary: 未连接极空间，未移动或删除任何文件。
- next: 确认切换顶装/墙装是否不改变轨道 Article Number，只改变安装码配件。

## TASK-012 Structured Technical Parameter Decision 2026-07-27

- fields: 分组、名称、值、单位、显示顺序。
- storage: 不将整张参数表只保存为自由文本。
- units: 第一阶段统一使用公制单位。
- excluded: 第一阶段不按市场自动换算英制。
- future: 如有真实市场需求，另行实现显示换算并保留原始标准值。
- still_unconfirmed: 真实产品参数分组、名称、单位和排序映射。
- resolved: 已确认网站只存当前文件、极空间归档旧版本及多产品关联规则。
- next: 确认切换顶装/墙装是否不改变轨道 Article Number，只改变安装码配件。

## TASK-012 Product Series and Application Cardinality Decision 2026-07-27

- product_to_series: 多对多。
- product_to_application: 多对多。
- identity: 多个系列和应用入口共享同一个产品身份、canonical 详情页和 Article Number 规格集合。
- prohibited: 不因目录归属复制产品、规格或 Article Number 记录。
- still_unconfirmed: 真实 Base 关系字段和代表样本的实际归属。
- resolved: 已确认技术参数结构和第一阶段公制单位规则。
- resolved: 已确认网站只存当前文件、极空间归档旧版本及多产品关联规则。
- next: 确认切换顶装/墙装是否不改变轨道 Article Number，只改变安装码配件。

## TASK-012 Discontinued Product Public Page Decision 2026-07-27

- keep_public: 停产产品保留原 URL 和公开页面，不直接删除。
- label: 页面显著显示 `Discontinued`。
- replacement: 有替代型号时展示替代产品链接。
- cta: 常规询价改为 `Contact Us for Replacement`。
- intent: 保留历史客户查询和 SEO 入口，不代表原型号仍可供货。
- still_unconfirmed: 替代/升级关系、生效日期和无替代型号时的真实字段与内容。
- resolved: 已确认产品与系列、产品与应用场景均为多对多关系。
- resolved: 已确认技术参数结构和第一阶段公制单位规则。
- resolved: 已确认网站只存当前文件、极空间归档旧版本及多产品关联规则。
- next: 确认切换顶装/墙装是否不改变轨道 Article Number，只改变安装码配件。

## TASK-012 Layered Publication Lifecycle Decision 2026-07-27

- first_sync: 创建 WordPress 草稿，由编辑人员完善营销内容后手动发布。
- existing_published: 普通飞书主数据变更通过校验后自动更新只读镜像并保持公开。
- exceptional_changes: Article Number、型号归属、产品记录删除和撤销网站发布资格进入例外审核，不自动覆盖或下线。
- validation_failure: 保留最后一次成功公开数据并记录错误。
- ownership_guard: 自动同步不得覆盖 WordPress 管理的文案、SEO、公开媒体和页面模块。
- implementation_boundary: 尚未读取或修改真实 Base、WordPress、Schema 或同步代码。
- resolved: 已确认停产产品保留原页面、显示状态和替代型号 CTA。
- resolved: 已确认产品与系列、产品与应用场景均为多对多关系。
- resolved: 已确认技术参数结构和第一阶段公制单位规则。
- resolved: 已确认网站只存当前文件、极空间归档旧版本及多产品关联规则。
- next: 确认切换顶装/墙装是否不改变轨道 Article Number，只改变安装码配件。

## TASK-012 Feishu Website Publication Eligibility Decision 2026-07-27

- accepted: 飞书产品记录必须具有显式的网站发布资格。
- eligible: 业务方标记为“允许发布”、Article Number 有效且对应真实存在规格。
- default_deny: 未标记、状态不明确、Article Number 无效或校验失败的记录不得进入同步范围。
- implementation_boundary: 尚未读取真实 Base，也未创建或修改字段。
- resolved: 已确认首次双重审核、已发布产品普通更新自动同步、重大变更例外审核。
- resolved: 已确认停产产品公开页面策略。
- resolved: 已确认产品与系列、产品与应用场景均为多对多关系。
- resolved: 已确认技术参数结构和第一阶段公制单位规则。
- resolved: 已确认网站只存当前文件、极空间归档旧版本及多产品关联规则。
- next: 确认切换顶装/墙装是否不改变轨道 Article Number，只改变安装码配件。

## TASK-012 Product Read Sync Topology Decision 2026-07-27

- accepted: 用户接受“飞书产品主数据 → 受控同步 → WordPress 只读镜像 → GDHE REST API → Next.js”。
- frontend_boundary: Next.js 只消费 GDHE REST API，公开页面不逐请求直连飞书。
- wordpress_role: WordPress 组合飞书只读主数据镜像与 `wp-admin` 营销内容。
- resilience: 无效同步不得替换最后一次成功的公开数据；精确实现合同仍待后续独立任务确认。
- rfq_separation: quotation request 通过独立受控入口新增飞书询价记录，不修改产品主数据。
- resolved: 已确认飞书必须具有显式网站发布资格，只有“允许发布”且数据有效的真实记录才进入同步范围。
- resolved: 已确认分层发布生命周期。
- resolved: 已确认停产产品公开页面策略。
- resolved: 已确认产品与系列、产品与应用场景均为多对多关系。
- resolved: 已确认技术参数结构和第一阶段公制单位规则。
- resolved: 已确认网站只存当前文件、极空间归档旧版本及多产品关联规则。
- next: 确认切换顶装/墙装是否不改变轨道 Article Number，只改变安装码配件。

## TASK-012 WordPress Read-Only Product Master Decision 2026-07-27

- accepted: 用户接受飞书主数据字段在 `wp-admin` 可查看但只读。
- feishu_only_edit: 型号、Article Number、规格和可用状态。
- wordpress_edit: 产品介绍、SEO、公开图片和页面模块。
- sync_effect: 飞书修改通过单向同步更新 WordPress/网站侧只读数据。
- document_impact: `PROJECT/CONSTRAINTS.md` 的 `wp-admin` 唯一内容后台表述需要在 TASK-012 最终验收前受控澄清；当前任务允许范围未包含该文件，本轮未越权修改。
- resolved: 已确认 WordPress 只读镜像拓扑和飞书网站发布资格门。

## TASK-012 Feishu Product Master Decision 2026-07-27

- choice: 用户选择方案 A。
- feishu_authority: 型号、Article Number、规格和可用状态。
- wordpress_authority: 营销文案、SEO、公开媒体和页面编排。
- direction: 产品主数据只从飞书单向流向网站侧；不默认双向同步。
- rfq_direction: quotation request 从网站写入飞书，由业务员报价；该方向不修改产品主数据。
- resolved: 飞书字段在 `wp-admin` 可见但只读。
- resolved: 已确认飞书 → 受控同步 → WordPress 只读镜像 → GDHE REST API → Next.js。
- resolved: 已确认分层发布生命周期。
- resolved: 已确认停产产品公开页面策略。
- resolved: 已确认产品与系列、产品与应用场景均为多对多关系。
- resolved: 已确认技术参数结构和第一阶段公制单位规则。
- resolved: 已确认网站只存当前文件、极空间归档旧版本及多产品关联规则。
- next: 确认切换顶装/墙装是否不改变轨道 Article Number，只改变安装码配件。

## TASK-012 Feishu Product and RFQ Boundary 2026-07-27

- product_records: 飞书多维表格已经保存部分现有产品记录。
- publication: 属性可以组合，但网站只使用飞书中真实存在、具有 Article Number 的产品规格，不自动生成不存在的组合。
- rfq: 客户提交 quotation request 后在飞书新增记录；业务员在飞书完成报价。
- resolved_authority: 飞书是结构化产品主数据权威；`wp-admin` 是营销与页面内容权威。
- lark_gate: 未提供具体 Base 链接/token，且当前没有外部读取/写入授权；实施前必须只读检查真实 Base、表、字段、关联和权限。
- resolved: 已确认产品读取拓扑和飞书网站发布资格门。

## TASK-012 Accessory Page-Type Rules 2026-07-27

- motor_remote: 同款、同型号且出厂配套的电机与遥控器作为一个组合产品页面，不分开建页。
- motor_remote_article_identity: 电机和遥控器分别保留自己的全局唯一 Article Number，不创建组合 Article Number。
- motor_remote_rfq_selection: 电机和遥控器作为两个独立 RFQ 行项目，可只选其一或同时选择；数量分别填写且可以不同。
- tape: 一种类型的布带建立一个独立详情页；transparent tape 属于另一产品类型，单独建页。
- tape_axes: 颜色黑/白，宽度 30mm/45mm/60mm，钉子种类不锈钢/铝，钉子间距 125mm/145mm/165mm/170mm 及更多值，长度 30m/40m/50m/60m 等。
- tape_model_hierarchy: 颜色和钉子材质共同决定型号；同一型号下宽度、钉距、长度变化会产生独立 Article Number。
- bead_model_hierarchy: 颜色和具体珠型共同决定型号；珠距和卷长共同确定具体规格；任一变化都产生独立 Article Number，但不改变型号。
- bead_types: 尚飞大方珠系列为单扣/双扣/大圆扣；用户所称佳丽斯中方珠/珠系列为单扣佳丽斯中方珠、双扣佳丽斯中方珠、小圆扣佳丽斯珠。
- bead_spacing_and_length: 珠距 6cm/6.6cm/7cm/8cm/10.2cm；10.2cm 一般用于双扣但不设排他约束；卷长 40m/50m/60m 等。
- standalone_categories: 布带和用户所称“线珠”等大类可独立建页。
- related_only: 轨道封口、走珠、顶码、墙码不单独建页，只作为相关配件。
- safety: 属性允许组合但并非所有组合都有现有记录；只有飞书中实际存在且拥有 Article Number 的组合才能公开选择。
- next: 先确认飞书与 WordPress 权威拆分，再核对真实规格记录。

## TASK-012 Accessory Public Page Decision 2026-07-27

- confirmed: 配件采用混合公开模式。
- unified_role: 所有附属产品统一称为“配件”，不区分备件或套装成员角色。
- filterable_categories: 使用配件类别筛选；当前示例包括顶码、墙码、走珠、封口、布带、线珠。
- terminology_resolved: “强码”确认为“墙码”的笔误，只保留“墙码”规范类别。
- category_cardinality: 每个具体配件必须且只能属于一个配件类别；一个类别可以包含多个配件。
- standalone: 部分配件拥有自己的公开详情页。
- related_only: 其余配件只在主产品的相关配件区域展示。
- invariant: 两类配件都可以作为 quotation request 的独立行，并用独立 Article Number 识别。
- resolved: 已按电机/遥控器、布带/transparent tape/线珠、封口/走珠/顶码/墙码形成具体页面身份规则。
- resolved: 布带型号—规格—Article Number 层级和单位已确认，真实记录仍需代表样本核对。
- resolved: 线珠型号—珠距/卷长规格—Article Number 层级已确认。
- resolved: 电机与遥控器共用页面但分别保留独立 Article Number。
- still_unconfirmed: 所有产品和配件的 RFQ 行项目是否必须填写数量；线珠正式英文名。
- next: 确认切换顶装/墙装是否不改变轨道 Article Number，只改变安装码配件。

## TASK-012 Accessory Identity Decision 2026-07-27

- confirmed: 每个可独立询价的配件都有自己的 Article Number。
- uniqueness: 配件 Article Number 沿用已确认的全公司范围不重复规则。
- model_effect: 配件可以作为 quotation request 中的独立行，并通过 Article Number 唯一识别。
- resolved: 配件采用混合公开模式，部分独立详情页，部分仅相关配件展示。
- resolved: 独立详情页判定规则已由具体产品类型确认。
- resolved: 配件、备件和套装成员不需要不同角色，统一称为配件。
- resolved: 配件类别采用多对一基数，同一 Article Number 不得归入多个类别。
- resolved: 配件不强制“一件一个独立型号”；布带型号与规格/Article Number 分层，其他小配件通常同时有型号和 Article Number。
- resolved: 布带颜色和钉子材质共同决定型号。
- resolved: 布带宽度和钉距使用 mm，长度使用 m；布带层级已闭合。
- still_unconfirmed: 其他配件的真实例外。
- next: 确认切换顶装/墙装是否不改变轨道 Article Number，只改变安装码配件。

## TASK-012 Accessory and B2B RFQ Decisions 2026-07-27

- accessory: 配件可以脱离主产品独立提交询价。
- conversion: 网站是 B2B 询价站；用户选择型号、规格、配件等必要选项后提交 quotation request。
- excluded: 当前业务不包含面向消费者的直接下单、购物车结算或在线支付。
- resolved: 每个可独立询价配件都有独立且全公司不重复的 Article Number。
- resolved: 配件公开页面采用混合模式。
- resolved: 配件独立详情页判定规则已由具体类型确认。
- confirmed_public: 收到定金并确认订单、包装和生产资料后，整柜交期通常为 `30–40 天`；按产品类别的包装材料；所有产品可提供样品；支持 OEM 和 ODM。
- not_public: MOQ 不特别展示。
- confirmed_authority: 包装、交期、样品和 OEM/ODM 由 WordPress 维护；MOQ 如内部需要只留飞书。
- confirmed_packaging_evidence: 常规、纸盒、打字、套袋、大收缩膜、对扣及其详细含义。
- confirmed_packaging_logic: 轨道类基础包装必须三选一；Logo 印刷可选；套袋/对扣可都不选，选择时二选一。
- confirmed_category_exception: 布带和线珠只公开纸箱常规包装；特殊组合包装不公开、不进入 RFQ 自助选择。
- confirmed_fixed_packaging: 电机和遥控器固定使用纸箱包装，官网不提供包装选项。
- confirmed_small_accessory_packaging: 封口、走珠、顶码、墙码等小型相关配件固定使用纸箱包装，官网不提供包装选项。
- confirmed_accessory_role: 统一称为配件，通过可筛选的配件类别组织；类别与页面身份分离。
- confirmed_accessory_category_cardinality: 每个具体配件必须且只能属于一个类别，一个类别可以包含多个配件。
- confirmed_accessory_model_hierarchy: 配件型号不是全局逐件必填；布带颜色和钉子材质共同决定型号，宽度/钉距/长度改变 Article Number。
- confirmed_bead_model_hierarchy: 线珠颜色和具体珠型决定型号；珠距和卷长任一变化都产生独立 Article Number。
- confirmed_motor_remote_identity: 电机与遥控器共用页面，但分别保留独立 Article Number，不创建组合 Article Number。
- confirmed_motor_remote_rfq_selection: 客户可只选电机、只选遥控器或同时选择两者；两个独立 RFQ 行项目分别填写可以不同的数量。
- confirmed_general_rfq_quantity: 所有产品和配件的每个 RFQ 行项目都必须填写数量；缺少数量不能提交。
- confirmed_public_units_and_internal_conversion: 官网轨道按支、布带/线珠按卷、配件按个；飞书内部换算米数和包装件数。
- confirmed_feishu_conversion_authority: 长度换算字段保存在飞书产品主数据中；报价系统负责读取并计算，不属于官网实现范围。
- confirmed_article_number_terminology: `Article Number` 是唯一规范术语；`Part Number` 是口误。
- confirmed_quantity_input: 所有 RFQ 行项目数量只能是大于零的整数，最小值为 1。
- confirmed_primary_rfq_cta: 英语站正常在售产品统一使用 `Request a Quote`；停产产品例外继续使用 `Contact Us for Replacement`。
- confirmed_multi_product_rfq_flow: 正常产品先加入多产品询价清单，客户可继续添加产品，最后统一填写联系信息并一次提交。
- confirmed_duplicate_rfq_line_rule: 同一 Article Number 且完整公开配置相同则合并数量；任一配置不同则保留独立行。
- sample_001: `FGD X15+PVC` 已收到并完成部分映射。
- still_unconfirmed: 安装方式是否改变轨道 Article Number、公开包装选择和关联配件。
- next: 确认切换顶装/墙装是否不改变轨道 Article Number，只改变安装码配件。

## TASK-012 Product Boundary Decision 4 2026-07-27

- confirmed: Article Number 在全公司全部产品和型号范围内不会重复。
- model_effect: Article Number 是规格层的全局唯一稳定业务键，可唯一查找一个型号下的具体可订购规格。
- deferred: Excel 导入可将 Article Number 作为候选匹配键，但覆盖、冲突和回滚规则仍需在第 9 项确认。
- next: 确认配件是否能够独立下单。

## TASK-012 Product Boundary Decision 3 2026-07-27

- confirmed: 现有独立下单编码直接作为网站和 WordPress 后台中的 `Article Number`。
- model_effect: 不创建第二套公开货号；每个可订购规格行保存并展示其 Article Number。
- resolved_by_decision_4: Article Number 在全部产品和型号范围内唯一。
- next: 进入配件业务边界确认。

## TASK-012 Product Boundary Decision 2 2026-07-27

- confirmed: 同一型号下，每个具体规格都有独立下单编码。
- model_effect: 型号与下单编码是一对多；可订购规格必须保存各自编码，产品层不能只保存一个编码。
- resolved_by_decision_3: 独立下单编码直接作为网站/CMS 的 `Article Number`。
- resolved_by_decision_4: Article Number 在全部产品范围内唯一。
- next: 进入配件业务边界确认。

## TASK-012 Product Boundary Decision 1 2026-07-27

- confirmed: 同一个型号可以包含不同规格。
- model_effect: 长度、颜色或表面处理变化本身不创建新型号；暂按同一产品型号下的规格差异处理。
- resolved_by_decision_2: 每个具体规格具有独立下单编码。
- still_unconfirmed: 规格最终采用选项还是组合行存储；该问题需要结合真实样本再决定。

## TASK-012 Product Source Availability 2026-07-27

- available: 每个产品的图片、切面/尺寸、产品型号；配件展示图片；覆盖全部产品的总目录。
- deferred: 安装说明当前没有但可补充；不作为第一轮产品边界确认的阻断项。
- absent_as_separate_assets: 没有独立配件表和单品目录；配件图需人工确认后才能结构化，总目录可以作为样本选择来源。
- boundary: 资料类型可支持启动验证，但具体样本尚未提交和选择；型号定义产品，规格的独立下单编码定义 Article Number。
- next: 按用户要求一次确认一个业务问题，先确认产品、型号、规格变体与 Article Number 的关系。

## TASK-012 Real Product Validation Gap 2026-07-26T09:25:50Z

- correction: TASK-007 Schema 3 是技术合同基线，主要经过设计、Fixture、Golden 和产品型同业结构参考验证；未经过 10～20 个 GDHE 真实产品的业务压力验证。
- unconfirmed: 产品/变体、型号/Article Number、配件角色、跨系列/应用、参数单位/排序/分组、文档版本/语言/替换、内外字段、B2B 字段和 Excel 导入/更新。
- transition: checked reopen 已将 TASK-012 从 `AWAITING_USER` 退回 `NEEDS_REVISION`；旧 review/validation 保留为历史，不是当前 final verdict。
- gate: Header、URL、产品模板和 SEO 在真实产品门关闭前保持阻塞；不得用 Fixture 或 Forest 参考代替 GDHE 业务确认。
- next: 用户或业务责任人提供 10～20 个真实产品权威资料，再逐项形成映射、缺口和决策证据。

## TASK-012 Acceptance View Synchronization 2026-07-26T05:35:32Z

- reason: 首次 checked prepare 已 PASS，但 AWAITING_USER Hook 阻止同步 Board 和人类可读状态。
- controlled_reopen: 只为同步展示视图；路线图、review、validation、`NOT_ACCEPTED / DIRTY` 不变。
- next: 立即重跑 checked `prepare-awaiting-user`，然后等待 `确认 TASK-012 完成并提交到远端`。

## TASK-012 Planner Final Validation PASS 2026-07-26T05:33:21Z

- review: final Round 2 `PASS / P0=0 / P1=0 / P2=0`。
- validation: Schema 19/16、A3/manifest hash/bytes、endpoint source、Preview absence、links、paths、protected scope、zero listeners、project/registry/messages/strict lane/diff PASS。
- summary: `TASKS/ARTIFACTS/TASK-012/PLANNER_SUMMARY.md` 已生成。
- boundary: `NOT_ACCEPTED / DIRTY`；未 commit、push、merge、deploy、PoC 或开始后续阶段。
- next: checked `prepare-awaiting-user` only。

## TASK-012 Final Review PASS Recovery 2026-07-26T05:31:03Z

- review: Round 2 final `PASS / P0=0 / P1=0 / P2=0`；Round 1 历史完整保留。
- endpoint: TASK-007 四端点当前事实与源码一致；Preview 保持未来未实现。
- multilingual: PoC-entry 不预先要求兼容性；compatibility PASS 是生产采购与公开建设前置。
- regressions: REST-first、非授权、19/16、受保护范围与治理全部通过。
- responses: Round 2 PASS response 与 stop-recovery request 已投递并 ACK。
- boundary: PASS 不是用户验收或 Git/部署/PoC/后续阶段授权。
- next: Planner final fresh validation、Planner Summary 和 checked `prepare-awaiting-user`。

## TASK-012 Round 1 P1 Revision Checkpoint PASS 2026-07-26T05:24:33Z

- endpoint: `/resolve`、`/collection/{type}`、`/navigation`、`/route-manifest` 明确为 TASK-007 已交付；只有 Preview 仍未实现。
- multilingual: 14.6.1 冻结 PoC-entry；14.6.2 冻结生产采购/公开发布门；兼容性 PASS 是 PoC 输出和生产前置。
- adr: proposed ADR-006 同步两级门，不授权 PoC、安装、采购或公开语言。
- fresh_validation: Schema 19/16、hash/byte parity、Markdown links、absolute paths、protected scope、project/registry/messages/strict lane/diff PASS。
- transition: `NEEDS_REVISION` -> `UNDER_REVIEW`。
- next: 窄 Round 2 只复核两项 P1 与直接回归；PASS 前不得 final validation。

## TASK-012 Adversarial Round 1 FAIL Recovery 2026-07-26T05:20:17Z

- verdict: `FAIL / P0=0 / P1=2 / P2=0`；review response 与 recovery request 已投递并 ACK。
- p1_endpoint: 架构契约把已由 TASK-007 交付的 resolve、collection、navigation、route-manifest 与未来 preview 一并标为未实现。
- p1_multilingual: Stage 10 先要求全部 14.6 门通过，14.6 又要求同一 PoC 才能产出的 SCF + WPML/ACFML 兼容证据，形成循环。
- passed: 19/16、REST-first、阶段 1/2/3/5/6、TASK-011 归档、受保护范围和零 runtime 改动。
- transition_helper: `task_transition.py reopen` 按其 AWAITING_USER-only 前置条件安全拒绝且无 mutation；未伪造验收状态，真实状态直接同步为 `NEEDS_REVISION`。
- boundary: 只允许两处权威文档修订、fresh validation 与窄 Round 2；禁止 final validation、Git、验收、部署或后续阶段。
- next: 修正当前端点事实，并拆分 PoC-entry 与生产采购/公开发布成熟度门。

## TASK-012 Planner Checkpoint PASS 2026-07-26T05:11:34Z

- roadmap: 十阶段真实产品优先顺序、技术 SEO 首模板门、产品系统先于首页、Preview/cache/Webhook/Staging 前置与多语言成熟度门一致。
- conflict_fixes: 三处历史“下一任务/下一阶段”指令改为未来目标或独立复评门；TASK-011 归档底部状态同步为 `ACCEPTED / MERGED`。
- schema: Planner 独立复算 CMS 19、frontend 16、CMS-only 三份、frontend-only 零；A3 hash 和 frontend byte/hash parity 全部通过。
- scope: 临时 executor scope 已回收；`frontend/**`、`cms/**`、`.local/**`、依赖、lockfile 和运行环境零差异。
- transition: `IN_PROGRESS` -> `UNDER_REVIEW`。
- next: 发起并等待独立 adversarial review；PASS 前不做 final validation 或 checked AWAITING_USER transition。

## TASK-012 Executor Complete and Scope Rollback 2026-07-26T05:05:48Z

- execution: 权威架构契约、proposed ADR-006、决策索引及三份 executor 证据已完成；受控 execution response 已投递并 ACK。
- rollback: 已从 `lanes.json`、executor `LANE.md` 和 `PROJECT/AGENT_LANES.md` 收回三个临时权威文档范围。
- validation: registry、messages、project、strict lane 与 `git diff --check` 通过；产品代码、CMS、数据库、依赖和运行环境未进入 executor 范围。
- next: Planner 独立重算 Schema 19/16、核对路线图与受保护范围；checkpoint PASS 后才允许独立 review。

## TASK-012 Executor Scope Recovery 2026-07-26T04:55:36Z

- blocker: 任务消息允许权威路线图和必要 ADR，但 executor 注册 write scope 仍只有 artifacts/worklog；Hook 在任何写入前拒绝。
- recovery: Planner ACK scope request，并临时增加三个精确范围：架构契约、决策索引、`ADR-006-*`。
- safety: 未修改权威交付物；`frontend/**`、`cms/**`、数据库、依赖和运行环境不在新增范围。
- rollback: executor 阶段完成或任务退出执行阶段后立即收回临时范围。
- next: executor 在同一原消息范围内重新执行权威文档窄修订。

## TASK-012 Specialist Audits ACKed 2026-07-26T04:53:48Z

- wordpress_cms: `PASS WITH ENTRY GATES`；真实产品批量录入前需冻结样本权属、变体、配件角色、文档生命周期、业务键和编辑/公开限制。
- frontend: `PASS_WITH_ENTRY_GATES`；Stage 1 需冻结产品卡片投影与 SEO 合同，Stage 3 顺序为部署拓扑/Staging -> Preview -> last-known-good cache -> signed Webhook -> 故障/多实例演练。
- localization_seo: `CONDITIONAL PASS`；技术 SEO 从首个正式英语模板开始，完整多语言按成熟度门，任何 PoC 都是独立、隔离、非公开、非采购。
- schema: CMS graph 19 与 frontend `/resolve` closure 16 的差异仅为 collection、navigation、route-manifest 三个 CMS-only Schema。
- next: executor 基于最终审计窄改权威路线图并回传 execution response。

## TASK-012 Controlled Dispatch 2026-07-26T04:43:19Z

- design_gate: `DESIGN.md` 与 `IMPLEMENTATION_PLAN.md` 已创建；project、registry、messages、strict lane 与 diff 校验 PASS。
- dispatched: wordpress_cms、frontend、localization_seo 可实施性审计；executor 权威文档修订请求。
- executor_gate: 三份专业审计未齐备前不得修改路线图或 ADR。
- transition: `READY` -> `IN_PROGRESS`。
- next: 等待受控 execution responses；Planner ACK 和 checkpoint 后才允许独立 review。

## TASK-012 Requirement Confirmation 2026-07-26T04:38:18Z

- authorization: 用户精确输入 `确认 TASK-012 需求并开始执行`。
- transition: `AWAITING_REQUIREMENT_CONFIRMATION` -> `READY`。
- scope: 路线图、必要 ADR、Schema 19/16 解释、状态事实源与后续阶段门。
- protected: `frontend/**`、`cms/**`、数据库、依赖、运行环境和用户附件保持不变。
- next: 完成设计/计划和消息校验，再派发 executor 文档实施与三个专业 Lane 只读审计。

## TASK-012 Intake 2026-07-26T04:06:13Z

- source: 用户确认采用所附评估文本的总体方向与任务顺序。
- previous_task: TASK-011 正式提交已在远端任务分支与 `main`，本次同步为 `CLOSED / MERGED` 并归档。
- branch: 从同步 `main` 创建 `codex/TASK-012-roadmap-reprioritization`。
- scope: 只重排权威实施路线图，统一 Schema 19/16 口径，冻结真实产品、IA/URL/CTA、视觉纵切、SEO/Preview/cache/Staging、产品优先与多语言条件门。
- boundary: 不修改 `frontend/**`、`cms/**`、数据库、依赖或运行环境，不导入真实产品，不实现页面、SEO、Preview、缓存、Webhook、询盘、多语言或部署。
- next: 等待精确口令 `确认 TASK-012 需求并开始执行`。

## TASK-011 Formal Delivery Authorized 2026-07-26T01:17:57Z

- authorization: 用户精确输入 `确认 TASK-011 完成并提交到远端`，`task_accept.py check/accept` 均成功。
- acceptance: `ACCEPTED`；final Round 2 `PASS / P0=0 / P1=0 / P2=0`。
- delivery: 创建一条包含任务内容、主要变更、验证结果和文档更新的正式中文提交；推送任务分支；快进合并并推送 `main`；验证远端 ancestry。
- boundary: 不 force push、不 rebase、不删除分支/worktree，不部署或启动 TASK-012。
- next: 完成提交前完整性检查，然后执行已授权 Git 链。

## TASK-011 Final Review and Planner Validation PASS 2026-07-26T01:11:24Z

- review: Round 2 final `PASS / P0=0 / P1=0 / P2=0`；Round 1 runtime Adapter forgery P1 independently closed。
- attacks: raw、ordinary、error wrapper、proxy、authentic-wrapper proxy、symbol/descriptor imitation 和 accessor/export replacement 均关闭且 non-leaking。
- final_validation: Node 24.18.0 focused 85/85、full 158/158、contract 16/2/2、lint、typecheck、dynamic build、production smoke、dependency/audit、protected scope、leakage、zero Fixture/upload/listener/build residue、project/messages/strict lane/diff PASS。
- report_recovery: canonical top Outcome 已与 R2 PASS 同步；Round 1 audit trail 完整保留，不增加 review round。
- summary: `TASKS/ARTIFACTS/TASK-011/PLANNER_SUMMARY.md` 已生成。
- boundary: review/test PASS 不等于用户验收；未 Git、未部署、未启动 TASK-012。
- next: 等待 `确认 TASK-011 完成并提交到远端`。

## TASK-011 Round 1 P1 Planner Checkpoint PASS 2026-07-26T01:02:17Z

- response: `MSG-20260726T005933Z-planner` 已 validate/ACK。
- implementation: module-private authentic-wrapper WeakSet、non-replaceable success-body accessor、Adapter mandatory accessor、stable non-leaking rejection。
- invariants: wrapper representation/error behavior unchanged；normal path remains one Transport、one Schema validation、one Adapter。
- independent_validation: Node 24.18.0 focused 85/85、full 158/158、contract 16/2/2、lint、typecheck、dynamic build、production smoke、dependency/audit、protected scope、leakage、zero residue、project/messages/strict lane/diff PASS。
- transition: `IN_PROGRESS` -> `UNDER_REVIEW`。
- next: 等待 narrow Round 2 verdict；verdict before final validation。

## TASK-011 Round 1 P1 Revision Authorized 2026-07-26T00:53:03Z

- authorization: 用户精确输入 `确认 TASK-011 Round 1 P1 修订并开始执行`。
- scope: 仅 `validation/index.ts` 中 module-private runtime identity、Adapter brand-checked body access、直接 executable forgery tests 和受影响证据。
- invariant: 保持一次 Transport、一次 Schema validation、一次 Adapter；身份检查不是第二次 Schema validation。
- protected: TASK-010 registry/errors/contracts/wrapper semantics、Transport、route、CMS、数据库、Fixture、dependencies、package/lock 均不得修改。
- transition: `NEEDS_REVISION` -> `IN_PROGRESS`。
- next: 等待 frontend 关联 execution response；Planner fresh checkpoint PASS 后才允许 Round 2。

## TASK-011 Adversarial Round 1 FAIL Recovery 2026-07-25T20:05:52Z

- responses: Round 1 review response 与 stop-recovery request 已 validate/ACK。
- verdict: `FAIL / P0=0 / P1=1 / P2=0`；Planner final validation 不允许。
- p1: exported production Adapter 只依赖 TypeScript branded type，运行时普通对象可直接提供 `body` 并生成 DTO；现有 negative 在 `if (false)` 内，只做 compile-time check。
- passed: normal Transport -> Validator -> Adapter、一次请求、validated 404、default-off 固定配置、server-only/leakage、真实 E2E、截图、A4 cleanup、protected scope、依赖与文档。
- cleanup: Reviewer required build 生成的 `.next` 与 `tsconfig.tsbuildinfo` 已由 Planner 移入废纸篓；当前无 build/server residue。
- authority_gate: 最窄安全修订需要在 Validator brand 所有模块增加 runtime authenticity accessor，并由 Adapter 使用；`frontend/src/lib/cms/server/validation/index.ts` 是本任务明确保护范围，按活动任务约束必须重新确认后才能修改。
- transition: `UNDER_REVIEW` -> `NEEDS_REVISION`。
- next: 等待用户确认这一窄范围；确认前不得实现、Round 2、final validation、验收、Git 或部署。

## TASK-011 Integration Checkpoint PASS 2026-07-25T19:57:27Z

- execution: DTO、validated-wrapper-only Adapter、一次请求的一次 Validator 编排、严格 validated 404、default-off 固定 path dynamic Server Component 已完成。
- live_e2e: 真实 WordPress -> Next.js production -> browser HTTP 200；恶意 query 不改变固定英语根路径，浏览器无 WordPress 直连或敏感泄漏。
- visual: Planner 已目检 1440px 与 390px 截图，字段可读，移动端无横向溢出。
- cleanup: WP-CLI、数据库与 filesystem 独立查询确认 posts/revisions/attachment/upload/terms/meta/option 全零；3211/8080 无监听。
- fresh_validation: Node 24.18.0 focused 39/39、full 155/155、16/2/2 parity、lint、typecheck、dynamic build、dependency/audit、protected scope、leakage、residue、project/messages/strict lane/diff PASS。
- transition: `IN_PROGRESS` -> `UNDER_REVIEW`。
- next: 等待 `MSG-TASK-011-ADVERSARIAL-REVIEW-R1` 的关联 verdict；verdict 前不得 final validation、验收、Git 或部署。

## TASK-011 WordPress A2 Dispatched 2026-07-25T19:39:29Z

- message: `MSG-TASK-011-WORDPRESS-A3-FIXTURE-A2` 已 validate、通过 Codex thread bridge 投递并标记 dispatched。
- scope: 只读核对、零残留前置、现有 A3 Fixture create/show、匿名英语 Schema 3 根路径 resolve。
- protected: CMS 源码、Schema、插件、数据库结构、永久内容、用户和配置不得修改。
- cleanup: Fixture 创建后成为强制责任；A3 成败都必须进入 A4 cleanup。
- next: 等待 ACK 和关联 A2 execution response。

## TASK-011 A1 Planner Checkpoint PASS 2026-07-25T19:38:17Z

- response: `MSG-TASK-011-FRONTEND-OFFLINE-VERTICAL-SLICE-A1-RESPONSE` 已 validate/ACK。
- implementation: frozen ten-field DTO、validated-wrapper-only Adapter、exact default-off config、no-argument one-request orchestration、validated 404 agreement、dynamic technical route。
- independent_validation: Node 24.18.0 / npm 11.16.0 focused 38/38、full 155/155、parity 16/2/2、lint、typecheck、dynamic build、real next-start smoke、dependency/audit、protected scope、leakage、residue、project/message/diff PASS。
- toolchain_note: shell 默认 Node 20.11.1 在 Vitest startup 安全失败；切换项目规定 Node 24 后从头重跑通过，不属于产品失败。
- documentation: root/frontend README 和 `.env.example` 已同步；document impact RESOLVED，README impact UPDATED。
- gate: A1 PASS；只允许 dispatch A2 Fixture create/show/anonymous resolve。Fixture 创建后 cleanup 成为强制责任。
- boundary: 未完成 live WordPress E2E、截图、cleanup、review、Git 交付或部署。
- next: dispatch `MSG-TASK-011-WORDPRESS-A3-FIXTURE-A2`。

## TASK-011 Design and Frontend A1 Dispatch 2026-07-25T19:20:11Z

- design: 冻结最小 readonly DTO、validated-wrapper-only Adapter、无参数 server-only orchestration、validated 404 agreement、显式 enable/path 配置和 route-local technical UI。
- phases: A1 frontend offline；Planner checkpoint；A2 short-lived Fixture；A3 live Next.js E2E/screenshots；A4 mandatory cleanup。
- message: `MSG-TASK-011-FRONTEND-OFFLINE-VERTICAL-SLICE-A1` 已 validate、通过 Codex thread bridge 投递并标记 dispatched。
- queued_gate: `MSG-TASK-011-WORDPRESS-A3-FIXTURE-A2` 只在 queue 中；A1 checkpoint PASS 前禁止投递。
- transition: `READY` -> `IN_PROGRESS`。
- boundary: 未创建 Fixture、未 live E2E、未审查、未 Git 交付或部署。
- next: 等待 frontend ACK 与关联 A1 execution response。

## TASK-011 Requirement Confirmation 2026-07-25T19:17:25Z

- authorization: 用户精确输入 `确认 TASK-011 需求并开始执行`。
- transition: `AWAITING_REQUIREMENT_CONFIRMATION` -> `READY`。
- execution_order: frontend 第一阶段先完成 DTO/Adapter/orchestration/route gate 的 TDD 与 loopback 验证；Planner checkpoint PASS 后，wordpress_cms 才短暂创建 A3 Fixture；随后 frontend 做 live E2E/截图，wordpress_cms 立即 cleanup。
- boundary: 未实现、未创建 Fixture、未运行 E2E、未审查、未 Git 交付或部署。
- next: 创建 `DESIGN.md` 与 `IMPLEMENTATION_PLAN.md`，校验后派发 frontend 第一阶段。

## TASK-011 Intake 2026-07-25T19:14:26Z

- delivery_baseline: 本地 `main`、`origin/main` 与远端 TASK-010 分支均为 `a89bb4de91e63dce2f9960e31b1cd39cae58f335`；intake 前工作区干净。
- previous_task: TASK-010 已同步为 `CLOSED / MERGED` 并归档。
- branch: 从同步 `main` 创建 `codex/TASK-011-minimal-cms-integration-page`。
- scope: 最小 Adapter、server-only orchestration、显式开启的 `/integration/cms` Server Component、现有 A3 Fixture live E2E、桌面/手机截图和 cleanup。
- boundary: 不开发正式首页/导航/视觉系统，不修改 CMS 源码/合同/数据库结构，不实现 cache/Preview/Webhook/SEO/多语言，不提交、推送、合并或部署。
- next: 等待精确口令 `确认 TASK-011 需求并开始执行`。

## TASK-010 Formal Delivery Authorized 2026-07-25T19:08:41Z

- authorization: 用户精确输入 `确认 TASK-010 完成并提交到远端`，`task_accept.py check/accept` 均成功。
- acceptance: `ACCEPTED`；final closure `PASS / P0=0 / P1=0 / P2=0`。
- delivery: 创建一条包含任务内容、主要变更、验证结果和文档更新的正式中文提交；推送任务分支；快进合并并推送 `main`；验证远端 ancestry。
- boundary: 不 force push、不 rebase、不删除分支/worktree，不部署或启动 TASK-011。
- next: 完成提交前完整性检查，然后执行已授权 Git 链。

## TASK-010 Closure PASS and Planner Final Validation 2026-07-25T18:45:33Z

- review: user-authorized closure response 与 recovery request 已 validate/ACK；最终 `PASS / P0=0 / P1=0 / P2=0`。
- closure: Round 2 prototype-integrity P1 关闭；Round 1 current-evidence P2 保持关闭。
- final_validation: Node 24.18.0 / npm 11.16.0 focused 48/48、full 117/117、16-Schema parity、lint、typecheck、build、dependency tree、production audit、protected scope、server-only、leakage、residue、messages、project/strict lane 和 diff PASS。
- summary: `TASKS/ARTIFACTS/TASK-010/PLANNER_SUMMARY.md` 已生成。
- boundary: `NOT_ACCEPTED / DIRTY`；未 commit、push、merge、部署、Adapter、route、页面、Transport wiring、CMS/数据库或 TASK-011。
- next: 运行 checked `prepare-awaiting-user`，然后等待精确正式交付口令。

## TASK-010 Extra Closure Review Authorized and Dispatched 2026-07-25T18:41:15Z

- authorization: 用户精确输入 `授权 TASK-010 进行一次额外独立 closure review`。
- message: `MSG-TASK-010-ADVERSARIAL-CLOSURE-REVIEW-R3` 已 validate、dry-run，通过 Codex thread bridge 投递到注册 reviewer session 并标记 dispatched。
- scope: 只复核 Round 2 prototype-integrity P1、Round 1 P2 closure 和直接 server-only/leakage/dependency/protected-scope/test 回归。
- transition: `PAUSED` -> `UNDER_REVIEW`。
- boundary: reviewer 对业务交付物只读；未验收、Git、部署、Adapter、route、可见页面、Transport wiring、CMS/数据库或 TASK-011。
- next: 等待关联 review response；verdict 前不执行 Planner final validation。

## TASK-010 R3 Checkpoint and Extra Review Gate 2026-07-25T18:36:00Z

- response: `MSG-TASK-010-FRONTEND-PROTOTYPE-INTEGRITY-R3-RESPONSE` 已 validate/ACK。
- artifact_recovery: Round 2 FAIL 已完整追加到 canonical `ADVERSARIAL_REVIEW_REPORT.md`，recovery response 已 ACK。
- r3: wrapper 改为 frozen null-prototype 对象，固定 own body getter、kind-only toJSON、kind 与 brand；prototype poisoning 不再改变 body 或序列化。
- independent_validation: Node 24.18.0 / npm 11.16.0 focused 48/48、full 117/117、parity、lint、typecheck、build、dependency tree、production audit、protected scope、server-only、leakage、residue、governance 和 diff PASS。
- gate: 已使用两轮 adversarial review；额外 closure review 未获授权，不能自动派发。
- transition: `NEEDS_REVISION` -> `PAUSED`，属于 human-required wait。
- boundary: 未验收、Git、部署、Adapter、route、可见页面、Transport wiring、CMS/数据库或 TASK-011。
- next: 等待精确口令 `授权 TASK-010 进行一次额外独立 closure review`。

## TASK-010 Adversarial Round 2 FAIL Recovery 2026-07-25T18:25:24Z

- verdict: `FAIL / P0=0 / P1=1 / P2=0`；Planner final validation 不允许。
- residual_p1: wrapper own instance/kind/brand/body snapshot 已固定，但 class prototype 和 prototype `body` getter 可修改；公开 seam 可被 prototype poisoning 改为返回伪造 body或通过新增 `toJSON` 泄漏完整 body。
- p2: active task current evidence 已同步，Round 1 P2 关闭。
- responses: Round 2 response 与 reviewer scope-recovery request 已 validate/ACK。
- artifact_blocker: 请求的新 `ADVERSARIAL_REVIEW_ROUND2.md` 不在 reviewer hook 识别的精确 canonical write scope，写入被安全拒绝且未绕过；实质证据已保存在 reviewer worklog。
- transition: `UNDER_REVIEW` -> `NEEDS_REVISION`。
- boundary: 先授权 reviewer 只追加既有 canonical report；之后只允许 prototype integrity regression/fix，不启动 Adapter、页面、Transport wiring、CMS、Git、部署或 TASK-011。
- next: 完成 review artifact recovery，再派发 frontend R3。

## TASK-010 R2 Planner Checkpoint PASS 2026-07-25T18:20:06Z

- response: `MSG-TASK-010-FRONTEND-WRAPPER-INTEGRITY-R2-RESPONSE` 已 validate/ACK。
- p1: wrapper 改为 caller-isolated deep-immutable snapshot，kind/brand/instance 固定；ordinary/revoked Proxy 均收敛为既有 stable errors。
- independent_validation: Node 24.18.0 / npm 11.16.0 focused 44/44、full 113/113、parity、lint、typecheck、build、dependency tree、production audit、scope、server-only、residue、leakage、governance 和 diff PASS。
- p2: active task current evidence 保持与实际实现同步。
- transition: `NEEDS_REVISION` -> `UNDER_REVIEW`。
- boundary: 未验收、Git、部署、Adapter、route、可见页面、Transport wiring、CMS/数据库或 TASK-011。
- next: 派发只复核 Round 1 P1/P2 和直接回归的 adversarial Round 2。

## TASK-010 Wrapper Integrity R2 Dispatched 2026-07-25T18:11:55Z

- message: `MSG-TASK-010-FRONTEND-WRAPPER-INTEGRITY-R2` 已 validate、dry-run，通过 Codex thread bridge 投递到注册 frontend session 并标记 dispatched。
- scope: caller-isolated deep-immutable payload snapshot、fixed wrapper kind/instance integrity、success/error public-seam RED/GREEN 和直接 frontend 文档。
- protected: registry、errors、contract、Transport、src/app、package/lock、root README、CMS、环境和 Planner state 不得修改。
- next: 等待关联 execution response，Planner fresh checkpoint 后再请求 Round 2。

## TASK-010 Adversarial Round 1 FAIL Recovery 2026-07-25T18:10:35Z

- verdict: `FAIL / P0=0 / P1=1 / P2=1`；Planner final validation 不允许。
- p1: validated wrapper 保留 caller input 同一引用，嵌套 body 与 runtime `kind` 可在校验后改写，使 validated token 与已验证事实脱钩。
- p2: active task current Validation Evidence 停留在 intake；本恢复入口已同步实际 frontend/依赖/README 变更与保护范围。
- responses: review response 与 reviewer stop-recovery request 已 validate/ACK。
- transition_helper: `task_transition.py reopen` 按其 AWAITING_USER-only 前置条件安全拒绝且无 mutation；Planner 直接记录 `UNDER_REVIEW` -> `NEEDS_REVISION` recovery。
- boundary: 只允许 caller-isolated deep-immutable snapshot、fixed wrapper integrity、success/error public regression 和直接文档同步；不启动 Adapter、route、页面、Transport wiring、CMS、Git、部署或 TASK-011。
- next: 派发一次 frontend P1 修订；fresh Planner checkpoint 后请求 Round 2。

## TASK-010 Adversarial Review Dispatched 2026-07-25T18:04:29Z

- message: `MSG-TASK-010-ADVERSARIAL-REVIEW-R1` 已 validate、dry-run，通过 Codex thread bridge 投递到注册 reviewer session 并标记 dispatched。
- focus: Schema rebasing/strict 语义、server-only public/deep imports、wrapper 伪造/可变性、错误泄漏、mutation 覆盖、依赖和禁止范围。
- boundary: reviewer 对业务交付物只读；未验收、Git、部署、Adapter、route、可见页面、CMS/数据库或 TASK-011。
- next: 等待关联 review response；verdict 前不执行 Planner final validation。

## TASK-010 Planner Checkpoint PASS 2026-07-25T18:03:10Z

- response: `MSG-TASK-010-FRONTEND-RUNTIME-VALIDATOR-R1-RESPONSE` 已 validate 并由 Planner ACK。
- independent_validation: 固定 Node 24.18.0 / npm 11.16.0 下 focused 38/38、full 107/107、parity、lint、typecheck、build、dependency tree、production audit、scope、server-only、residue、leakage 和 diff PASS。
- implementation: server-only 16-Schema Draft 2020-12 registry、success/error validators、opaque wrapper、stable sanitized errors 和文档已完成。
- documentation: frontend README 和根 README 已同步；`document_impact=RESOLVED`，`readme_impact=UPDATED`。
- transition: `IN_PROGRESS` -> `UNDER_REVIEW`。
- boundary: 未验收、commit、push、merge、部署、Adapter、route、可见页面、Transport wiring、CMS/数据库或 TASK-011。
- next: 派发独立 adversarial review；收到 verdict 前不执行 Planner final validation。

## TASK-010 Frontend Execution Dispatched 2026-07-25T17:47:59Z

- design: `DESIGN.md` 已冻结 16-Schema 静态 registry、内部 URI rebasing、Draft 2020-12 strict/format 配置、public validation seams、opaque wrapper 和 stable errors。
- dependencies: 直接依赖精确锁定候选为 `ajv@8.20.0` 与 `ajv-formats@3.0.1`，由 frontend Lane 安装后通过 Node 24、Next.js build 和 lockfile 验证。
- message: `MSG-TASK-010-FRONTEND-RUNTIME-VALIDATOR-R1` 已 validate、dry-run，通过 Codex thread bridge 投递到注册 frontend session 并标记 dispatched。
- transition: `READY` -> `IN_PROGRESS`。
- boundary: 不实现 Adapter、route、可见页面、Transport wiring、CMS/数据库、视觉系统、Git 交付、部署或 TASK-011。
- next: 等待关联 execution response；Planner 独立 checkpoint PASS 前不得派发 adversarial review。

## TASK-010 Requirement Confirmation 2026-07-25T17:43:44Z

- authorization: 用户精确输入 `确认 TASK-010 需求并开始执行`。
- transition: `AWAITING_REQUIREMENT_CONFIRMATION` -> `READY`。
- seams: 生产 public seam 为 success/error runtime validation 入口、opaque validated wrapper 与 stable contract error；测试只通过这些 public seams，不测试 Ajv 内部实现。
- dependency_boundary: 默认直接依赖仅 `ajv` 与 `ajv-formats`；版本在设计阶段通过官方 registry、Node 24、Next.js build 和 lockfile 验证后冻结。
- boundary: 不实现 Adapter、route、可见页面、Transport wiring、CMS/数据库、视觉系统、Git 或部署。
- next: 创建 `DESIGN.md` 与 `IMPLEMENTATION_PLAN.md`，校验范围后派发受控 frontend execution request。

## TASK-010 Intake 2026-07-25T17:25:35Z

- delivery_baseline: 本地 `main`、`origin/main` 与远端 TASK-009 分支均为 `dd07662698744b90a0c810a0d1f9342109eb1a22`；intake 前工作区干净。
- previous_task: TASK-009 同步为 `CLOSED / MERGED` 并归档。
- branch: 从同步 `main` 创建 `codex/TASK-010-cms-runtime-schema-validator`。
- scope: 只实现前端拥有的 Draft 2020-12 Schema registry、success/error runtime validator、opaque validated wrapper、stable contract errors、mutation tests 和文档。
- dependency_candidate: 默认仅允许 `ajv` 与 `ajv-formats`；精确版本和兼容性在需求确认后的设计阶段验证。
- boundary: 不实现 Adapter、React route、可见页面、Transport 接线、CMS/数据库修改、视觉系统、Git 交付或部署。
- next: 等待 `确认 TASK-010 需求并开始执行`。

## TASK-009 Formal Delivery Authorized 2026-07-25T17:16:01Z

- authorization: 用户精确输入 `确认 TASK-009 完成并提交到远端`，`task_accept.py check/accept` 均成功。
- acceptance: `ACCEPTED`；final adversarial `PASS`，P0=0、P1=0、P2=0。
- delivery: 创建一个包含完整中文说明的正式提交；推送任务分支；快进合并到 `main`；推送 `main` 并验证远端包含任务提交。
- boundary: 不 force push、不 rebase、不删除分支/worktree，不部署或创建 TASK-010。
- next: 完成交付前完整性检查，然后执行已授权 Git 链。

## TASK-009 Prepared for User Acceptance 2026-07-25T16:46:19Z

- first_prepare: checked `prepare-awaiting-user` 于 2026-07-25T16:45:36Z PASS。
- controlled_reopen: 只为同步 Board 和人类可读 acceptance-state 叙述；产品交付物、final PASS、validation、`NOT_ACCEPTED` 和 `DIRTY` 边界不变。
- final_prepare: 同步完成后 fresh checked `prepare-awaiting-user` 再次 PASS。
- state: `AWAITING_USER / NOT_ACCEPTED / DIRTY`。
- boundary: review、tests 和 checked transition 不等于用户验收；未 commit/push/merge/deploy，未启动 Validator、Adapter、页面、CMS 或 TASK-010。
- next: 等待精确口令 `确认 TASK-009 完成并提交到远端`。

## TASK-009 Round 2 PASS and Final Validation 2026-07-25T16:44:05Z

- review: Round 2 response 与 reviewer recovery request 已 validate/ack；最终 `PASS / P0=0 / P1=0 / P2=0`，Round 1 P1/P2 均关闭。
- final_validation: Node 24.18.0、npm 11.16.0、focused 60/60、full 69/69、contract parity、lint、typecheck、production build、server-only、single-fetch、package/lock、protected scope、residue、leakage、messages 和 DPG checks PASS。
- summary: `TASKS/ARTIFACTS/TASK-009/PLANNER_SUMMARY.md` 已生成。
- boundary: `NOT_ACCEPTED / DIRTY`；未 commit/push/merge/deploy，未启动 Validator、Adapter、页面、CMS 或 TASK-010。
- next: 等待精确口令 `确认 TASK-009 完成并提交到远端`。

## TASK-009 R3 Planner Checkpoint PASS and Round 2 Gate 2026-07-25T16:35:03Z

- response: frontend R3 execution response 已 validate/ack；deep-import export regression RED 为 1 failed/58 passed，修复后 focused 60/60、full 69/69。
- p1_closed: production source 不再包含 `requestResolvedPath`、`baseUrl`、`timeoutMs` 或替代 injection seam；public/deep import 均只暴露同一个 `resolveCmsPath(path, signal?)`。
- independent_validation: contract parity、lint、typecheck、full tests、production build、public/deep Client Component negatives、package/lock checksum、禁止范围、residue、leakage、project/messages/strict lane 和 diff PASS。
- p2_closed: active task current-state、next、messages、artifacts、review 和 validation 段落已按 R3 与 Round 2 gate 再次同步，历史记录保留。
- transition: `NEEDS_REVISION` -> `UNDER_REVIEW`。
- boundary: 未验收、未 Git/部署、未启动 Validator、Adapter、页面、CMS 或 TASK-010。
- next: 等待 adversarial Round 2 verdict；只复核 Round 1 P1/P2 及直接回归边界。

## TASK-009 Adversarial Round 1 FAIL Recovery 2026-07-25T16:26:36Z

- response: review response 与 reviewer recovery request 已 validate/ack。
- verdict: `FAIL`，P0=0、P1=1、P2=1；Planner final validation 不允许。
- p1: `transport.ts` 生产 export `requestResolvedPath()` 接受 caller-controlled `baseUrl/timeoutMs`，server-side deep import 可绕过唯一 public entry、环境拥有的 CMS origin 和冻结 5000 ms timeout。
- p2: active task current-state、next、messages、artifacts、review 和 validation 段落停留在早期 blocker 状态；本次 recovery 已只同步这些 current-state 入口，保留全部时间戳历史。
- transition_helper: `task_transition.py reopen` 按其 AWAITING_USER-only 前置条件安全拒绝且无 mutation；Planner 直接记录 `UNDER_REVIEW` -> `NEEDS_REVISION` recovery。
- boundary: 只允许 P1 测试 seam/production export 修订和 P2 narrative sync；不启动 Validator、Adapter、页面、CMS、部署、Git 或 TASK-010。
- next: 派发一次 frontend deep-import surface R3；fresh validation 后请求 adversarial Round 2。

## TASK-009 Planner Checkpoint PASS and Review Gate 2026-07-25T16:18:40Z

- response: frontend R2 response 已 validate/ack；P1 的三个无端口 loopback RED 与 `url.port !== ""` 最小修复证据完整。
- independent_validation: focused 58/58、full 67/67、contract parity、lint、typecheck、production build、package/lock checksum、禁止范围、server-only markers、泄漏、临时目录、project/messages/strict lane 和 diff check PASS。
- documentation: frontend README 已更新；根 README 最小 Transport 指针已由 Planner 同步；`document_impact=RESOLVED`，`readme_impact=UPDATED`。
- transition: `IN_PROGRESS` -> `UNDER_REVIEW`。
- boundary: review 只读；未验收、未 commit/push/merge/deploy，未创建 TASK-010。
- next: 派发独立 adversarial review，等待 PASS/FAIL/P0/P1/P2 verdict。

## TASK-009 DPG Hook Repair and Resume 2026-07-25T15:48:23Z

- authorization: 用户明确授权修复 DPG Hook 并恢复 TASK-009。
- fix_1: `command_string()` 支持 Codex App freeform string `tool_input`，并兼容 dict 的 `command/cmd/input/patch`。
- fix_2: `write_like_command()` 只在首个命令 token 的 basename 为 `apply_patch` 时判定 shell patch，不再因普通参数文字出现该词而误判。
- fix_3: `tool_write_paths()` 对真实 patch payload 只解析 patch 文件头，不再把 TypeScript `=>` 等补丁正文当作 shell 重定向。
- tdd: 三条新回归分别复现 freeform path loss、helper prompt false-positive 与 TypeScript arrow false redirection；修复后聚焦 7/7 和完整 83/83 tests PASS。
- runtime: 源插件、新缓存与当前线程兼容缓存 hook/test 字节一致；frontend 实际 scope 探针允许 `frontend/**`、拒绝 `PROJECT/**`，helper prompt 与完整 arrow-function patch 探针放行。
- plugin: Codex 已安装并启用 `0.2.0+codex.20260725151602`；旧线程固定路径已恢复为同内容兼容缓存。
- transition: `PAUSED` -> `IN_PROGRESS`；保留原 RED 与部分合规文件。
- boundary: 未实现产品功能、未开始 review、未 commit/push/merge/deploy，未创建 TASK-010。
- next: 发送与原 execution request 关联的 frontend continuation，从缺少 config module 的 RED 继续。

## TASK-009 Planner Checkpoint P1 2026-07-25T16:13:43Z

- response: frontend R1 execution response 已 validate 并由 Planner ack；55/55 focused、64/64 full、contract parity、lint、typecheck 和 production build 已独立重跑 PASS。
- p1: `parseWordPressApiUrl()` 的 loopback HTTP allowlist 未要求 `url.port` 非空，当前会接受无显式端口的 localhost、IPv4 loopback 和 IPv6 loopback REST base，不满足活动任务“本地明文 HTTP 使用显式端口”的验收边界。
- reproduced: Node 24 对三个无端口 URL 均返回 `port=""`，而当前 predicate 对三者均为 `acceptedByCurrentPredicate=true`。
- revision: 只允许新增三个无端口拒绝 RED、要求 HTTP loopback 显式端口的最小实现与对应 frontend README 文字；其余 Transport、错误、测试和禁止范围保持不变。
- gate: adversarial review 暂不允许；任务保持 `IN_PROGRESS / NOT_ACCEPTED / DIRTY`。
- next: 派发一次关联 frontend R2 revision，收到 response 后重跑配置负例和完整门禁。

## TASK-009 DPG Hook Blocker 2026-07-25T05:09:30Z

- frontend_result: BLOCKED；未声称 execution PASS，未生成标准 execution response 或 review request。
- preserved: TDD RED、Vitest server-only alias/stub、测试 import 骨架、最小 error class 和 frontend worklog。
- root_cause_1: `command_string()` 只接受 dict 的 `command/cmd`，对 Codex App freeform patch 输入返回空字符串，导致 write target 为空。
- root_cause_2: `write_like_command()` 以任意命令文本包含 `apply_patch` 判断为写命令，使受控 helper 的 blocker prompt 被误判且没有路径。
- verification: 源插件和当前缓存 hook 字节一致；Planner 探针复现 `freeform_command_length=0`、`paths=[]` 和 `helper_write_like=true`。
- protected_scope: package/lock、`src/app`、contract snapshot、CMS、数据库和环境文件无差异。
- state: `PAUSED / NOT_ACCEPTED / DIRTY`；无 review、Git、部署或 TASK-010。
- next: 等待用户授权精确 DPG 修复；修复验证通过后恢复同一 TASK-009。

## TASK-009 Frontend Execution Dispatched 2026-07-25T04:58:39Z

- message: `MSG-TASK-009-FRONTEND-RESOLVE-TRANSPORT` 已 validate、dry-run 并通过 Codex 线程桥投递到注册 frontend session。
- transition: `READY` -> `IN_PROGRESS`。
- scope: server-only config、fixed resolve URL、single anonymous GET、timeout、single JSON parse、metadata、typed errors、真实 Next.js client-import 负例和文档。
- boundary: 不改 dependency/lockfile、`src/app`、contract snapshot、CMS/数据库；不实现 Validator、Adapter、页面、live E2E、cache/retry、Git 或后续任务。
- next: 等待 ack 和 execution response；Planner 独立 checkpoint PASS 前不得派发 review。

## TASK-009 Requirement Confirmation 2026-07-25T04:55:14Z

- authorization: 用户精确输入 `确认 TASK-009 需求并开始执行`。
- transition: `AWAITING_REQUIREMENT_CONFIRMATION` -> `READY`。
- design: 冻结 REST base 安全规则、canonical path、固定 `/resolve` URL、单次 GET、5000 ms timeout、一次性 JSON 解析、allowlisted metadata、typed errors 和 server-only build gate。
- tdd: `IMPLEMENTATION_PLAN.md` 将实现拆为 config/path、HTTP/protocol、status/timeout/leakage、server-only build 和完整验证的 RED-GREEN 小循环。
- boundary: 不实现 Runtime Validator、DTO Adapter、React route/page、live WordPress E2E、CMS/数据库写入、依赖变更、cache/retry 或后续任务。
- next: 校验设计/计划与 scope 后派发一次受控 frontend execution request。

## TASK-009 Intake 2026-07-25T04:49:22Z

- delivery_baseline: 本地 `main`、`origin/main` 与远端 TASK-008 分支均为 `ba8148623a7a3e4b4b9d50974f02ec6fe70b9e8d`，intake 前工作区干净。
- branch: 从同步 `main` 创建 `codex/TASK-009-server-only-resolve-transport`。
- scope: 只实现 server-only config、固定 `/resolve` URL builder、单次匿名 GET、有界超时、一次性 JSON 解析、受控 metadata 和 typed configuration/transport/protocol/HTTP errors。
- boundary: 网络 JSON 仍为 `unknown`；不实现运行时 Validator、DTO Adapter、React route/page、真实 WordPress E2E、CMS/数据库修改、依赖变更、缓存、重试或后续任务。
- next: 等待 `确认 TASK-009 需求并开始执行`。

## TASK-008 Intake 2026-07-24T16:52:29Z

- user_direction: 每个 TASK 设计完成后先实际完成、验证和收口，再根据结果调整下一任务。
- scope: 只冻结 `/resolve` 成功/错误 Schema 传递闭包、最小样例、manifest 和 checksum parity。
- boundary: 不实现 Transport、Ajv Validator、DTO Adapter、页面、WordPress Fixture、数据库写入或后续任务。
- branch: `codex/TASK-008-frontend-cms-contract-snapshot` from clean synchronized `main` `8a3e4f2`。
- next: 等待 `确认 TASK-008 需求并开始执行`。

## TASK-008 Requirement Confirmation 2026-07-24T16:57:40Z

- authorization: 用户精确输入 `确认 TASK-008 需求并开始执行`。
- transition: `AWAITING_REQUIREMENT_CONFIRMATION` -> `READY`。
- unchanged_scope: 只冻结 `/resolve` 成功/错误 Schema 传递闭包、最小样例、manifest 和 checksum parity。
- boundary: 不实现 Transport、Ajv Validator、DTO Adapter、可见页面、WordPress Fixture、数据库写入或后续任务。
- next: 在 TASK-008 artifacts 中冻结设计和测试优先实施计划，再向已注册 `frontend` lane 派发受控 execution request。

## TASK-008 Frontend Execution Dispatched 2026-07-24T17:01:32Z

- design: `TASKS/ARTIFACTS/TASK-008/DESIGN.md` 已冻结 16-file Schema 闭包、2 个成功样例、2 个错误样例、manifest 和 fail-closed parity。
- plan: `TASKS/ARTIFACTS/TASK-008/IMPLEMENTATION_PLAN.md` 已按测试先行拆成 5 个实施步骤。
- message: `MSG-TASK-008-FRONTEND-CONTRACT-SNAPSHOT` 已 validate、dry-run 并通过 Codex thread bridge 派发到注册 `frontend` session。
- transition: `READY` -> `IN_PROGRESS`。
- boundary: 不实现 Transport、Validator、Adapter、页面、CMS/数据库写入、Git 交付或 TASK-009。
- next: 等待关联 execution response，Planner 独立校验后才允许 adversarial review。

## TASK-008 Planner Checkpoint P1 2026-07-24T17:15:41Z

- received: 初始 frontend execution response 已 validate 并由 Planner ack。
- independent_pass: Node/npm 版本、parity、lint、typecheck、全量 8 tests 和 production build 均 PASS。
- p1: manifest 只校验安全相对路径与 checksum，未把 Schema、Page/Product、错误 bundle 的来源身份硬绑定；将 `error.schema.json` 来源换成同字节 `.rogue` 文件仍意外 PASS。
- evidence: 临时仓库复现 `{unexpectedPass:true}`，正式快照未被修改。
- revision: `MSG-TASK-008-FRONTEND-AUTHORITY-BINDING-R1` 已派发，只允许精确 authority path mapping、RED regression 和 fresh validation。
- boundary: 不扩大到 Transport、Validator、DTO、页面、CMS/数据库、Git 或 TASK-009。
- next: 等待 R1 execution response，重跑替换负例和完整验证后才允许 independent adversarial review。

## TASK-008 Planner Checkpoint PASS and Review Dispatched 2026-07-24T17:21:42Z

- response: authority-binding R1 execution response 已 validate 并由 Planner ack。
- exploit_regression: Planner 原 `.rogue` 临时仓库利用现在明确拒绝，错误为 canonical schema authority mismatch。
- validation: Node/npm、parity、lint、typecheck、9 tests、build、20-file inventory、lockfile SHA、禁改范围、secret/internal-ID、治理、messages、strict lane 和 diff check PASS。
- documentation: TASK-008 developer flow documented；`document_impact=RESOLVED`，`readme_impact=UPDATED`。
- transition: `IN_PROGRESS` -> `UNDER_REVIEW`。
- review: `MSG-TASK-008-ADVERSARIAL-REVIEW-R1` 已派发到注册 reviewer session。
- boundary: PASS 仅允许 final validation，不等于验收；未 commit、push、merge、部署或创建 TASK-009。
- next: 等待独立 verdict。

## TASK-008 Adversarial PASS Recovery 2026-07-24T17:27:55Z

- response: Round 1 review response 已 validate 并由 Planner ack。
- verdict: final `PASS`，P0=0、P1=0、P2=0；Planner final validation allowed。
- recovery: reviewer 无权修改 planner-owned task/project/board；stop-recovery request 已 ack，本段为 canonical recovery。
- documentation_gate: 项目根 README 的 managed rule 要求新增开发命令有根入口；只允许补一个 TASK-008 offline parity 指针。
- boundary: 不改产品合同、snapshot、verifier、测试、CMS、依赖或页面；未验收、未 Git 交付、未部署、未创建 TASK-009。
- next: 完成根 README 窄同步，重跑 final validation，再执行 checked `prepare-awaiting-user`。

## TASK-008 Final Validation PASS 2026-07-24T17:32:00Z

- readme: 根 README offline contract pointer 已完成；managed block SHA 前后相同。
- final_validation: Node 24.18.0、npm 11.16.0、parity、lint、typecheck、9 tests、build、20-file inventory、lockfile/current-HEAD parity、scope、secret/internal-ID、project、messages、strict lane 和 diff check PASS。
- summary: `TASKS/ARTIFACTS/TASK-008/PLANNER_SUMMARY.md` 已生成。
- verdict: adversarial final PASS，P0=0、P1=0、P2=0 保持有效。
- boundary: NOT_ACCEPTED；未 commit、push、merge、部署或创建 TASK-009。
- next: 只运行 checked `prepare-awaiting-user`。

## TASK-008 Acceptance View Synchronization 2026-07-24T17:33:22Z

- first_prepare: checked `prepare-awaiting-user` 于 2026-07-24T17:32:46Z PASS。
- controlled_reopen: 只为同步 TASK/PROJECT/BOARD 人类可读视图；产品交付物、final adversarial PASS、final validation、NOT_ACCEPTED 和 DIRTY Git 边界不变。
- boundary: 未 commit、push、merge、部署或创建 TASK-009。
- next: fresh governance/readiness check 后再次运行 checked `prepare-awaiting-user`。

## TASK-008 Formal Delivery Authorized 2026-07-24T17:58:37Z

- authorization: 用户精确输入 `确认 TASK-008 完成并提交到远端`，`task_accept.py check/accept` 均成功。
- acceptance: `ACCEPTED`；final adversarial `PASS`，P0=0、P1=0、P2=0。
- delivery: 创建一个包含完整中文说明的正式提交；推送任务分支；快进合并到 `main`；推送 `main` 并验证远端包含任务提交。
- boundary: 不 force push、不 rebase、不删除分支/worktree，不部署或创建 TASK-009。

## TASK-007 A3 Independent Review Dispatched 2026-07-24T10:55:51Z

- validation: 55/55 handoff checksums、16 PHP、全部 scoped JSON、Core/SCF、12-table DB、A3 backup、零 Fixture/bytecode/upload 残留、secret scan、governance/messages/diff 均 `PASS`。
- message: `MSG-TASK-007-ADVERSARIAL-FOREST-SCHEMA3-REVIEW-R1` 已 validate、dry-run 并通过 Codex thread bridge 派发到注册 `adversarial_reviewer` session。
- review_scope: Forest-aligned Schema 3 产品模型、迁移/回滚、公开安全、consumer P1 closure、三个 deferred P2、determinism、benchmark、cleanup、文档与治理。
- boundary: review 只读；不授权产品前端、GraphQL、多语言、验收、Git 或部署。

## 上一步完成

- 已完成 RapidDirect 参考站研究文档。
- 已安装并验证 WordPress 7.0.2 + PHP 8.3.32 + MySQL 8.4.10，数据库名为 `GDHE`。
- 已初始化 Durable Project Governance、7 个 Agent Lanes 和 Git；当前会话已注册为 `planner`。
- 已建立最小 Git 忽略边界，WordPress 运行时、凭据和数据库备份不入库。
- `TASK-001` 已验收，正式提交 `a81ba288627eca71d38b27253f177899f4b3f121` 已推送到 `origin/codex/TASK-001-github-remote-initialization` 并归档。
- `TASK-002` 已验收，正式提交 `1cf97ce837e9f4621a63fad736c84a9bdb028a5a` 已推送到 `origin/codex/TASK-002-headless-architecture-contract` 并归档。
- `TASK-003` 已验收，正式提交 `65f50093da88dd0b47dca10b836d5aab8818de7d` 已推送到 `origin/codex/TASK-003-nextjs-foundation` 并归档；切换前本地/远端 divergence 为 `0/0`。
- `TASK-004` 已验收，正式提交 `8f8ce2121916e4c764af86aaa04e2a9b83da2a28` 已推送到 `origin/codex/TASK-004-english-cms-scf-foundation` 并归档；切换前本地/远端 divergence 为 `0/0`。
- `TASK-005` 已验收，正式提交 `c9cbf1306d8a142eed43f5cfd24fcb7ec21d25a9` 已推送到 `origin/codex/TASK-005-roadmap-api-integration-boundaries` 并归档；TASK-001 至 TASK-005 历史完全线性。
- `TASK-006` 已验收，正式提交 `4c52e5da4dd9a132a1f019affadc34892bb325df` 已推送任务分支、合并并推送到 `origin/main` 后归档；GitHub 默认分支为 `main`。
- `TASK-007` 已验收，正式提交 `8a3e4f26d148e64d301a508e69c1e4a28ad3b9e9` 已推送任务分支、合并并推送到 `origin/main` 后归档。
- `TASK-008` 已验收，正式提交 `ba8148623a7a3e4b4b9d50974f02ec6fe70b9e8d` 已推送任务分支、合并并推送到 `origin/main` 后归档。

## 未解决问题

- Next.js 16.2.11 App Router + TypeScript 基础和 TASK-008 离线 CMS 合同快照已完成，仍不包含运行时 Transport、Validator、Adapter、首页、Header、Mega Menu、Footer 或正式视觉系统。
- 官方 SCF 6.9.2 与 `gdhe-site` 0.4.2 已安装并激活，供应链、checksum、字段能力和 WordPress/PHP 兼容性已核实；Forest-aligned Schema 3 consumer gate 已通过，Schema 2 仅保留为历史回归基线。
- 用户已选择“英语优先”：WPML Multilingual CMS 与 ACFML 推迟到未来生产英语站稳定运行三个月后再采购、PoC 和启用；当前只保留技术扩展点，不输出其他语言入口。
- TASK-007 已实现并验证 Forest-aligned Schema 3 英语 REST Fixture、完整 DTO、route resolution、稳定错误与缓存 header，并已正式验收、提交、推送和合并到远端 `main`。
- GDHE 正式品牌素材、产品内容、公司介绍、联系方式和 SEO 文案尚未入库。
- `planner`、`executor`、`adversarial_reviewer`、`frontend`、`wordpress_cms`、`localization_seo`、`visual_qa` 均已注册真实 Codex thread ID；6 个工作会话已只读验证并进入待命。
- 当前分支为 `codex/TASK-009-server-only-resolve-transport`，从已同步的 `main` 提交 `ba8148623a7a3e4b4b9d50974f02ec6fe70b9e8d` 创建。
- 本地 `main`、`origin/main` 与远端 TASK-008 分支均指向 `ba8148623a7a3e4b4b9d50974f02ec6fe70b9e8d`；GitHub 默认分支为 `main`。
- 治理钩子会把隐藏相对路径 `.local/...` 规范化为 `local/...`，导致与注册 scope 不一致；本任务只允许使用已实测匹配的工作区绝对路径写入 `.local/backups/TASK-004/**`，不修改治理插件代码。
- SCF 官方 API、ZIP 包名和主插件头为 6.9.2，但包内 `readme.txt` 的 Stable tag 为 6.9.1；该上游元数据不一致已记录，安装包 checksum 与官方插件 checksum 均通过。

## 下一步

等待用户授权修复 DPG Hook 的 freeform patch 目标解析和命令参数误判。不得通过关闭 write-scope、shell 写入或 Planner 代写 frontend 产品代码绕过。

## TASK-007 Formal Delivery Authorized 2026-07-24T15:16:22Z

- authorization: 用户精确输入 `确认 TASK-007 完成并提交到远端`，`task_accept.py check/accept` 均成功。
- acceptance: `ACCEPTED`；Forest Schema 3 final `PASS`，P0=0、P1=0、P2=0。
- delivery: 创建一个包含完整中文说明的正式提交；推送任务分支；合并到 `main`；推送 `main` 并验证远端包含任务提交。
- boundary: 不 force push、不 rebase、不删除分支或 worktree，不启动 frontend、GraphQL、多语言或部署。

## TASK-007 Forest Schema 3 Prepared for User Acceptance 2026-07-24T11:28:24Z

- checked_transition: 首次 `prepare-awaiting-user` 成功验证 execution report、final adversarial PASS、validation evidence、document impact 与 README impact。
- synchronization: 随后只为同步人类可读 TASK/PROJECT/BOARD 与清理 helper 尾随空格执行受控 reopen；交付物和 verdict 未改变。
- target_state: `AWAITING_USER` / `NOT_ACCEPTED` / `DIRTY`。
- verdict: Forest-aligned Schema 3 final `PASS`，P0=0、P1=0、P2=0。
- boundary: 没有 commit、push、merge、accept、close、frontend、GraphQL、多语言或部署。
- next: 重跑治理检查和 checked prepare，然后等待精确口令 `确认 TASK-007 完成并提交到远端`。

## TASK-007 A3 Round 2 Final PASS and Final Validation 2026-07-24T11:26:00Z

- response: `MSG-TASK-007-ADVERSARIAL-FOREST-SCHEMA3-REVIEW-R2-RESPONSE` 已 validate 并由 Planner ack。
- verdict: canonical Forest-aligned Schema 3 final `PASS`，P0=0、P1=0、P2=0；Planner final validation allowed。
- final_validation: 61/61 handoff、6/6 backup、15/15 Golden 双轮 parity、19-file Schema、migration matrix、17 PHP、JSON、Core/SCF、12-table DB、零 residue、secret、frontend zero diff、governance/messages/strict/diff 全部 `PASS`。
- summary: `PLANNER_SUMMARY.md` 已从 Schema 2 历史快照重写为 Forest-aligned Schema 3 最终摘要。
- boundary: PASS 不等于用户验收；未执行 commit、push、merge、frontend、GraphQL、多语言或部署。

## TASK-007 A3 Round 1 Revision Planner Checkpoint PASS 2026-07-24T11:18:36Z

- response: `MSG-TASK-007-WORDPRESS-FOREST-SCHEMA3-REVIEW-R1-FIX-RESPONSE` 已 validate 并由 Planner ack。
- migration: fresh real WordPress runtime 证明 non-zero inventory、dry-run、apply/repeated apply、exact rollback/repeated rollback、ambiguity refusal 与四种 failure injection；快照恢复且无 backup/marker residue。
- positives: fresh Fixture/contract/Schema 生命周期包含 native Page `/company/` 与 native Post `/news/task-007-a3-product-update/`；两者匿名 resolve 并进入 route manifest。
- machine_contract: Product HTTP video 和 Support FTP video 均被拒绝，HTTPS positives 通过。
- determinism: actual 15 Golden hashes 与两轮 frozen hashes 全部一致，两轮 WordPress database IDs 不同。
- integrity: plugin `0.4.2`、61/61 handoff、19-file Schema、17 PHP、JSON、Core/SCF、12-table DB、backup、零 residue、frontend zero diff、governance/messages/strict/diff 均 `PASS`。
- gate: 状态转为 `UNDER_REVIEW`；只放行 A3 Round 2，不授权产品前端、GraphQL、多语言、验收、Git 或部署。

## TASK-007 A3 Adversarial Round 1 FAIL Recovery 2026-07-24T11:03:37Z

- response: `MSG-TASK-007-ADVERSARIAL-FOREST-SCHEMA3-REVIEW-R1-RESPONSE` 已 validate 并由 Planner ack。
- verdict: `FAIL`，P0=0、P1=1、P2=2；Planner final validation 不允许。
- p1: A3 migration apply 未完整验证 public path、template、remapped relations，早期 post-update failure 会遗留 backup meta，且缺少非零 inventory 的 apply/idempotence/exact rollback runtime proof。
- p2: 13 Golden/两轮 lifecycle 缺少 native Post 和非根 Page 正例；Product/Support runtime 要求 HTTPS video，但 machine Schema 只要求 generic URI。
- nonfinding: production media HTTPS origin 与 Next Image allowlist 继续作为未来 frontend/deployment gate，不计当前 finding。
- transition: `task_transition.py reopen` 因只接受 `AWAITING_USER` 而安全拒绝且无 mutation；Planner 将真实状态同步为 `NEEDS_REVISION`。
- gate: 只允许上述窄修订、fresh validation 与 Round 2；不授权 frontend、GraphQL、多语言、验收、Git 或部署。

## TASK-007 A3 Consumer Gate and Documentation PASS 2026-07-24T10:49:23Z

- frontend: `MSG-TASK-007-FRONTEND-SCHEMA3-P1-READAUDIT-R2-RESPONSE` 已 validate 并由 Planner ack；narrow re-audit `PASS`，P0=0、P1=0、P2=3 deferred。
- contract: 7 个合法 type/template 配对接受、35 个错配拒绝；known mismatch 在 resolve、collection、navigation 和 route manifest 全部 fail closed。
- closure: 19-file transitive Schema graph 四方一致，55/55 handoff checksums 通过；13 Golden 不变，数据库 ID 变化且零残留。
- docs: `MSG-TASK-007-GOVERNANCE-README-SCHEMA3-SYNC-RESPONSE` 已 ack；README 已使用 `schema=3.0.0` 并声明公开类型与内部 `site_settings` 边界，managed block 未变。
- gate: 文档影响 `RESOLVED`、README 影响 `UPDATED`；只放行 fresh validation 与新的 A3 adversarial review。

## TASK-007 A3 Consumer P1 Planner Checkpoint PASS 2026-07-24T10:38:57Z

- response: `MSG-TASK-007-WORDPRESS-SCHEMA3-CONSUMER-P1-R1-RESPONSE` 已 validate 并由 Planner ack。
- p1_1: runtime 强制 `page/post -> standard` 与五个结构化类型的同名 template 配对；known Product/market-template mismatch 在 resolve、collection、navigation、route manifest 全部 fail closed。
- p1_2: validator 从五个 roots 递归解析的 19-file transitive Schema graph 已逐文件写入 Schema report、manifest 和 handoff checksum，并定义可复现遍历/排序/校验算法。
- independent_runtime: 两轮不同 database IDs，13/13 positive Golden hashes 保持与 A3 baseline 一致；totals `3/3/3`、items `2/1/0`，两轮零残留。
- integrity: plugin `0.4.1`、PHP/JSON、Core/SCF、12-table DB、handoff checksums、governance/messages/strict/diff PASS。
- gate: 只放行 narrow frontend re-audit；P2 仍记录但不扩展本轮必修范围，不授权 review、产品前端、GraphQL、验收或 Git 交付。

## TASK-007 A3 Frontend Consumer Audit FAIL 2026-07-24T10:25:54Z

- response: `MSG-TASK-007-FRONTEND-FOREST-SCHEMA3-READAUDIT-RESPONSE` 已 validate 并由 Planner ack。
- verdict: `FAIL`，P0=0、P1=2、P2=3；`frontend/**` 产品代码保持未修改。
- p1_1: runtime 只校验 template 是否属于全局已知集合，没有强制 `product/market/reference/support_article/download` 与同名 template 配对；已知但错配的 template 可输出 Schema-invalid DTO。
- p1_2: 32 项 handoff checksum 全部通过，但 validator 实际加载的完整传递 Schema 图没有逐文件冻结；whole-plugin stream 缺少可复现算法和完整文件清单。
- passed: 13 Golden、totals `3/3/3`、items `2/1/0`、UUIDv4、safeHtml、errors/headers、publication fail closed、database-ID isolation、determinism、cleanup 和 named checksums。
- deferred_p2: 原生 Post/非根 Page 正例覆盖、机器 Schema HTTPS video 收紧、production media origin/Next Image allowlist；这些不允许掩盖两个 P1，也不扩展本轮必修范围。
- gate: 只允许 CMS P1 revision、Planner checkpoint 和 narrow frontend re-audit；不允许 adversarial review 或产品前端。

## TASK-007 A3 Planner Checkpoint PASS 2026-07-24T10:12:34Z

- response: `MSG-TASK-007-WORDPRESS-FOREST-PRODUCT-MODEL-A3-RESPONSE` 已 validate 并由 Planner ack。
- independent_runtime: 两轮完整生命周期使用不同 posts/attachment/term database IDs，13/13 Golden hashes 完全一致；Product totals `3/3/3`、items `2/1/0`，两轮 cleanup 均为零残留。
- independent_benchmark: 新 Fixture 生命周期 1,600 请求、并发 20、p50 `858.246 ms`、p95 `2001.839 ms`、error rate `0`。性能继续触发未来独立 GraphQL/cache PoC candidate，但不授权在 TASK-007 采用。
- integrity: A3 backup/checksums、16 PHP lint、全部 JSON、Core/SCF、12-table DB、inventory、公开 DTO、handoff checksums、secret scan、governance、messages、strict lane 和 diff checks PASS。
- gate: 只放行 frontend read-only consumer re-audit；不授权产品前端、GraphQL、验收或 Git 交付。

## TASK-007 Forest-aligned A3 Revision Authorized 2026-07-24T09:19:20Z

- authority: RapidDirect 继续负责前端工程、视觉、交互、SEO 与询盘路径参考；Forest Group 改为产品目录、市场、支持、下载与产品详情信息架构参考；GDHE 真实业务资料仍是最终内容权威。
- model: 目标为 Schema `3.0.0`，公开类型调整为原生 `page/post` 加 `product`、`market`、`reference`、`support_article`、`download`，`site_settings` 继续内部使用。
- migration: Schema 2 内容必须先 inventory；零真实记录可执行 no-content migration，非零记录必须 dry-run、歧义 fail-closed、不可变快照、幂等 apply 与精确 rollback。
- gate: A3 CMS checkpoint 后仅放行 frontend read-only re-audit，随后重新进行 independent adversarial review。Schema 2 final PASS 不再授权用户验收或 Git 交付。

## TASK-007 Prepared for User Acceptance 2026-07-24T07:41:58Z

- final_validation: 46 frozen checksums、12 PHP lint、全部 JSON、WordPress/Core/SCF、12-table DB、TASK residue、禁止范围、secret pattern、governance、messages、strict lane 与 diff checks PASS。
- transition: 首次 checked prepare 通过后，为同步 task/project/board 人类可读视图执行受控 reopen；交付物和 canonical PASS verdict 未改变。同步后将再次运行相同 final validation 与 checked prepare。
- acceptance: `NOT_ACCEPTED`；Git 为 `DIRTY`，没有 commit、push、merge、accept、close 或部署。
- next: 最终 prepare 成功后等待精确口令 `确认 TASK-007 完成并提交到远端`。

## TASK-007 Adversarial Review Round 2 Final PASS 2026-07-24T05:36:01Z

- response: `MSG-TASK-007-ADVERSARIAL-REVIEW-R2-RESPONSE-FINAL` 已由 Planner ack；canonical verdict `PASS`，P0=0、P1=0、P2=0。
- closure: Round 1 collection eligible-content P1 与 current-facts P2 均独立确认关闭；此前 PASS 的 migration/rollback、security/contracts、determinism、benchmark、cleanup、consumer gate、docs、scope 与治理回归通过。
- transient_cleanup: reviewer 编译检查短暂生成三个 `.pyc`；Planner 在同一 review turn 精确删除，reviewer 复核无 `.pyc` 或 `__pycache__` 残留。临时 FAIL response 在 Planner ack 前已受控 supersede，审计历史保留。
- gate: Planner final validation allowed；PASS 不等于用户验收，不授权 frontend、GraphQL、commit、push、merge、accept 或 close。

## TASK-007 Collection Eligibility R4 Planner Checkpoint PASS 2026-07-24T05:23:30Z

- response: `MSG-TASK-007-WORDPRESS-COLLECTION-ELIGIBILITY-R4-RESPONSE` 已 validate 并由 Planner ack。
- independent_runtime: Planner 独立双生命周期重跑 PASS；数据库 IDs 改变，13/13 Golden 哈希一致。
- contract: unknown template、invalid module、invalid canonical path 三类已发布候选均被排除；有效集合 totals `3/3/3`、items `2/1/0`，每个返回项均可匿名 resolve 到相同 UUID。
- integrity: R5 contract、18 Schema、24 negatives、冻结 handoff checksum、PHP、12-table DB、零残留、governance、message、strict lane 和 diff checks PASS。
- transition: `NEEDS_REVISION` to `UNDER_REVIEW`；仅授权 adversarial review Round 2，不授权 frontend、GraphQL、验收或 Git 交付。

## TASK-007 Adversarial Review Round 1 FAIL Recovery 2026-07-24T05:05:29Z

- response: canonical Round 1 response validated and acknowledged；verdict `FAIL`，P0=0、P1=1、P2=1。
- p1: collection 只预筛 publication/schema/UUID 并输出轻量 reference，未复用 template/module/path 完整合同；可产生不可 resolve item 或错误 total。
- p2: PROJECT current unresolved 与 TASK current Validation Evidence 的旧叙述已同步，不改写历史记录。
- passed: A1 schema/migration/rollback/backups；REST transport、UUID、safeHtml、errors/headers、valid-dataset determinism、benchmark、cleanup、consumer audit、scope 和治理。
- gate: NEEDS_REVISION；只允许 collection eligible-content 修订、fresh validation 与 Round 2；禁止 final validation、frontend adapter、GraphQL、acceptance 和 Git delivery。

## TASK-007 Consumer Gate PASS 2026-07-24T04:55:24Z

- cms_fix: terminal empty page 使用同约束完整计数；三页 totals `3/3/3`、items `2/1/0`。
- planner_checkpoint: fresh two-lifecycle determinism 为 13/13 hashes identical，数据库内部 IDs 不同；cleanup 和数据库零残留。
- frontend_reaudit: final `PASS`，P0=0、P1=0、P2=1；46/46 handoff checksums 与 runtime invariant 有效。
- deferred_p2: production media HTTPS origin 与 Next Image allowlist 是未来部署门，不阻塞当前 REST consumer contract。
- gate: 只放行 independent adversarial review；不授权 adapter、GraphQL、commit、push、merge、accept 或 close。

## TASK-007 Frontend Re-audit R2 FAIL 2026-07-24T04:44:00Z

- response: frontend re-audit response validated and acknowledged；verdict `FAIL`，P0=0、P1=1、P2=1。
- closed: safeHtml、seven modules、link/CTA/template、publicPath、error/header matrix、UUIDv4 and payload bounds。
- remaining_p1: service collection page 1/2 report `total=3` while terminal page 3 reports `total=0` for the same filter and sort；contract test asserts only page 1 total。
- deferred_p2: production media origin remains a later deployment gate。
- next: one CMS collection-total fix and one single-finding frontend re-audit；no adversarial review yet。

## TASK-007 CMS Consumer Contract R2 Planner Checkpoint PASS 2026-07-24T04:10:09Z

- response: CMS R2 execution response validated and acknowledged。
- independent_static: complete handoff checksum、12 PHP lint、3 Python scripts、18 Draft 2020-12 schemas、13 successful DTOs、10 error bodies、8 module fixtures and five boundary negatives PASS。
- independent_runtime: fresh two-lifecycle run used different WordPress IDs while all 13 Golden hashes matched the frozen R3 set；each cleanup returned zero task posts/meta/terms/uploads。
- security: public WYSIWYG is serialized only as CMS-sanitized `safeHtml`；malicious tags, event attributes and dangerous protocols are covered and absent。
- integrity: plugin checksum stream `62cca108...`、Core/SCF checksums、12-table DB、zero residue、scope, project governance, strict lane, messages and diff check PASS。
- gate: frontend read-only re-audit only；no product frontend, adversarial review, GraphQL, acceptance or Git delivery。

## TASK-007 Frontend Consumer Audit FAIL 2026-07-24T02:36:14Z

- response: frontend read-only audit response validated and acknowledged；`frontend/**` remained unchanged。
- verdict: `FAIL`，P0=1、P1=5、P2=3。
- p0: WYSIWYG HTML in rich text, split media and accordion lacks a frozen sanitization or structured-text authority on the public DTO path。
- contract_p1: strict link/CTA/template and remaining module samples；single canonical publicPath contract；error/cache/header fixtures；multi-item pagination/sort/filter proof。
- graphql_p1: all p95 values crossed the architecture comparison threshold；this requires a separate PoC/ADR candidate, not GraphQL adoption inside TASK-007。
- gate: no adversarial review or frontend implementation；CMS contract revision and frontend re-audit are required first。

## TASK-007 A2 Planner Checkpoint PASS 2026-07-24T02:20:17Z

- revision: public page/reference/media/navigation/route identifiers are persisted UUIDv4 strings；WordPress numeric IDs remain internal cleanup handles。
- independent_determinism: Planner fresh two-lifecycle runner used different post/attachment IDs but produced exact 9/9 frozen Golden hashes；both schema and cleanup passes succeeded。
- independent_http: 4 warmups plus 200 requests per fixture at concurrency 20；800 measured origin requests，0 errors；all p95 values still cross the separate GraphQL comparison gate。
- independent_integrity: PHP lint、9/9 Draft 2020-12 Schema、plugin stream checksum `9888c90b...`、handoff checksum set、Core/SCF checksum、12-table DB and zero-residue queries PASS。
- docs_scope: root README now documents local WordPress startup and GDHE English public API boundary；frontend/Core/SCF source/themes remain unchanged。
- governance: project validation、strict lane audit、message validation and `git diff --check` PASS。
- gate: A2 checkpoint PASS authorizes only frontend read-only consumer audit；product frontend implementation、review、acceptance and Git delivery remain blocked。

## TASK-007 A2 Planner Checkpoint NEEDS_REVISION 2026-07-24T02:01:26Z

- response: CMS A2 execution response 已 validate 并由 Planner ack；报告的 9 正例、14 负例、800 次 HTTP benchmark 和零残留证据已接收。
- independent_static: A2 backup 145,807 bytes / expected SHA-256、12 PHP lint、全部 JSON、9/9 Draft 2020-12 Golden Schema、WordPress 7.0.2、PHP 8.3.32、SCF 6.9.2、GDHE Site 0.3.0、Core/SCF checksum 和 12-table DB check 均 PASS。
- p1_finding: Planner 第二次创建 Fixture 后，公开 page/reference/media/route DTO 中的 WordPress post/attachment database IDs 改变，9 份 Golden SHA-256 全部与冻结 handoff 不同；文档“database IDs are not frontend contracts”与实际 Schema/DTO 要求 integer IDs 冲突。
- cleanup: Planner 重跑产生的 8 posts、4 attachments、3 terms 已全部 cleanup；数据库 check PASS。
- gate: A2 checkpoint 为 `NEEDS_REVISION`；只允许稳定公开 ID/确定性 Golden 的窄修订、两轮哈希一致性证明和 handoff 再冻结。Frontend audit、review、acceptance 与 Git delivery 仍阻塞。

## TASK-007 A1 Planner Checkpoint PASS 2026-07-23T14:48:53Z

- independently_verified: SQL backup 145,805 bytes and expected SHA-256；9 PHP lint；22 JSON parse；14 Draft 2020-12 schemas；WordPress 7.0.2、PHP 8.3.32、SCF 6.9.2、GDHE Site 0.2.0。
- runtime: A1 test rerun returned 14 schema files、36 assertions、cleanup true。
- residue: independent database queries returned fixture 0、migration markers 0、task fixture revisions 0；12-table database check passed。
- boundary: A2 routes remain absent；frontend、WordPress Core、SCF source and themes have no diff。
- governance: project validation、strict lane audit、message validation and `git diff --check` passed。
- gate: A1 is PASS；only A2 dispatch is authorized。Frontend consumption、review、acceptance and Git delivery remain unauthorized。

## TASK-007 A1 Stop Recovery 2026-07-23T09:10:53Z

- task_state: `IN_PROGRESS`；acceptance 仍为 `NOT_ACCEPTED`，Git 为 `DIRTY`。
- completed: A1 专用备份已验证；Schema v2、稳定模块 ID/version、结构化 `data_table`、迁移/回滚代码、测试、CMS 文档和四份 A1 artifacts 已生成。
- lane_status: CMS lane 报告核心运行时与 Schema canonical ID/envelope 版本一致性回归通过；关联 execution response 已返回并由 Planner ack。
- blocked_scope: A2 endpoint、四类 Fixture、benchmark、不可变 handoff、frontend consumer audit 和 adversarial review 均未开始。
- recovery_entry: 由 Planner 独立验证 A1；未通过或未记录 PASS 时不得派发 A2。
- git_boundary: 未 commit、push、merge、accept、close 或部署。

## TASK-007 Planner Diagnostic Recovery 2026-07-23T09:30:20Z

- task_state: `IN_PROGRESS`；A1 execution response 和 stop-recovery 均已由 Planner 确认，当前 lane message queue 为空。
- diagnostic: `wordpress_cms` thread 当前为 `idle`，未发现消息丢失或重复执行；已识别 stop-hook 全局任务状态判断、命令路径误判及 Codex delegation 重复投递风险，未在 TASK-007 内修改治理插件。
- boundary: 本次仅完成只读诊断和恢复交接；未执行 A1 独立 checkpoint、A2、frontend consumer audit、review、commit、push、merge、accept、close 或部署。
- recovery_entry: 唯一下一步仍为 Planner 独立重跑 A1 checkpoint 验证；只有明确记录 PASS 后才能派发 A2。

## TASK-006 Closure PASS Recovery 2026-07-23T07:29:30Z

- Closure response 与 stop-recovery 已确认；canonical PASS，P0=0、P1=0、P2=0。
- Round 2 sole P2、five-record evidence、模板、插件 70 tests、治理/消息/strict/diff、live refs/default 和零产品范围全部通过。
- Planner Final Summary 已生成，document impact 为 `RESOLVED`，readme impact 为 `UPDATED`。
- PASS 不等于用户验收，不授权正式 Git 交付。
- 唯一下一步是 final validation 和 checked `prepare-awaiting-user`。

## TASK-006 User-authorized Closure Review 2026-07-23T07:24:41Z

- Authorization: 用户精确输入 `授权 TASK-006 进行一次额外独立 closure review`。
- Scope: 只复核 Round 2 唯一 current-status P2、five-record evidence、current refs/default、既有 PASS 区域和零产品范围。
- Message: `MSG-TASK-006-ADVERSARIAL-CLOSURE-REVIEW` 已 dry-run 到注册 reviewer session。
- Boundary: 授权不包含 acceptance、commit、push、merge、GitHub 修改或产品/runtime 工作。
- Next step: 等待 closure verdict。

## TASK-006 Round 2 Final FAIL Recovery 2026-07-23T07:19:18Z

- Round 2 response 与 stop-recovery 已确认；final FAIL，P0=0、P1=0、P2=1。
- 唯一 P2 是 active task current-status 一行没有同步用户创建的 origin/main 和默认 main；其余模板、插件、70 tests、five-record evidence、main refs 和零产品范围通过。
- Reopen helper 从 UNDER_REVIEW 再次安全拒绝且无 mutation；真实状态同步为 NEEDS_REVISION。
- 当前状态一行已窄修正；两轮上限已用完，不自动制造 Round 3。
- 唯一下一步是 fresh validation 后等待用户授权一次 closure review。

## TASK-006 Recovery Entry 2026-07-23T07:20:46Z

- Stop hook 所需 canonical recovery marker 已补齐，active task 的 `recovery_recorded_at` 同步为本时间。
- Round 2 唯一 P2 的当前状态句已修正，fresh governance、strict lane、message、diff、main/origin/default 和零产品检查通过。
- 两轮审查上限已用完；任务保持 `NEEDS_REVISION`，不自行派发第三轮或绕过 PASS。
- 唯一下一步是等待用户精确授权一次额外 independent closure review。
- 未执行 TASK-006 acceptance、commit、task-branch push、merge、main push 或产品/runtime 工作。

## TASK-006 Round 1 FAIL Recovery 2026-07-23T07:07:36Z

- Round 1 response 与 stop-recovery 已确认；verdict FAIL，P0=0、P1=0、P2=2。
- `task_transition.py reopen` 已执行但因 helper 只接受 `AWAITING_USER` 而安全拒绝，没有 mutation；planner 将真实 review 状态同步为 `NEEDS_REVISION`。
- 两个 P2 仅涉及当前叙述反事实和 TASK-005 第五份迁移记录证据精度；模板、插件、Recovery R2、本地 main ancestry 与产品零差异均通过。
- 用户随后创建 `origin/main` 并设为默认分支；fresh fetch 证明 local/main/origin-main 均为 `c9cbf1306d8a142eed43f5cfd24fcb7ec21d25a9`。
- 唯一下一步是窄文档/证据修订、fresh validate 和 Round 2。

## TASK-006 Recovery Entry 2026-07-23T06:41:54Z

- execution response 已确认；result 为 `BLOCKED`，阻塞仅限 `AGENTS.md` 一行含角括号的旧 merge 口令。
- hook 的三次拒绝均发生在写入前，未使用 shell 写入，也未产生越权变化。
- README、任务模板、AGENTS 新规则和三份 execution artifacts 已生成；插件 70 tests、source/cache parity、项目治理、strict lane audit 和产品零差异均通过。
- planner 授权同一最小权限 lane 使用 apply_patch delete/add 重建全 managed `AGENTS.md`，保持其余内容逐字不变，只省略该旧行；完成 fresh validation 前不得进入 review。

## TASK-006 Recovery Entry 2026-07-23T06:47:37Z

- Recovery R1 仍被 hook 在预执行阶段拒绝；`AGENTS.md` 未发生 partial delete，SHA 保持 `52bd3c20a2c02be8b33ddd81f50c8b0fd2e0bdf3792348a31fdb9a485de1e6dd`。
- R1 response 与两条 stop-recovery 已确认，消息队列恢复有效。
- 下一恢复机制限定为调用插件已验证的原子 `merge_managed_block` API，只替换 `AGENTS.md` 的既有 managed block；不运行完整 bootstrap，也不触碰其他文件。
- Recovery R2 fresh validation 通过前，TASK-006 保持 `IN_PROGRESS`，不得进入 adversarial review。

## TASK-006 Recovery Entry 2026-07-23T06:53:40Z

- Recovery R2 已 PASS：插件原子 managed-block API 只更新 `AGENTS.md`，未调用 bootstrap，最终文件与当前插件模板逐字一致。
- managed markers、统一口令、旧口令清零、README/任务模板一致性、插件 70 tests、source/cache parity、project/strict/message/scope/zero-product validation 均通过。
- planner 已修正自身 `PROJECT/ACTIVITY.md` 单一尾随空格；全局验证将在 review 前 fresh 执行。
- 唯一下一步是确认 R2 messages、建立本地 `main` 基线并派发独立审查；没有远端或外部状态授权。

## TASK-006 Local main Baseline 2026-07-23T06:54:24Z

- 本地 `main` 已创建并精确指向 TASK-005 正式提交 `c9cbf1306d8a142eed43f5cfd24fcb7ec21d25a9`。
- TASK-001 至 TASK-005 ancestry 全部验证通过；不需要逐任务 merge 或重写历史。
- 当前仍位于 TASK-006 分支，工作树未提交；远端 `main` 仍不存在。
- 唯一下一步是 fresh validation 和 independent review；正式 Git 交付仍等待后续用户精确口令。

## User-authorized closure review 2026-07-23T05:33:16Z

- 用户明确授权一次额外独立 closure review；该授权不扩展产品实施或 Git 权限。
- Expanded stale scan、governance、strict lane audit、message、zero product diff 与 `git diff --check` preflight 通过。
- 请求已 dry-run 到注册 reviewer session `019f88d0-018d-75e2-8e28-54a904a6bf8c` 并唤醒。
- 唯一下一步是等待受控 closure verdict。

## Closure PASS recovery 2026-07-23T05:39:49Z

- Closure response 与 stop-recovery 已确认；canonical verdict `PASS`，P0/P1/P2 均为 0。
- Reviewer 独立确认两处 Round 2 defect 闭环、current-state 一致、A1/A2 门保持、决策内容不变且产品/runtime diff 为零。
- PASS 不是用户验收，也不授权 Task A/B 或任何 Git 交付操作。
- 唯一下一步是 final validation、Planner Summary 和 checked `prepare-awaiting-user`。

## Final validation recovery 2026-07-23T05:41:42Z

- Planner final validation PASS：governance、strict lane audit、messages、review counts、状态一致、stale scan、A1/A2 gate、artifacts、scope、diff、branch 与 HEAD 全部通过。
- Planner Summary 已生成，document impact 为 `RESOLVED`。
- PASS 与验证不等于用户验收；没有 Task A/B、commit、push、merge 或 close。
- 唯一下一步是 checked `prepare-awaiting-user`。

## Checked preparation narrative sync 2026-07-23T05:42:43Z

- 首次 checked prepare 于 2026-07-23T05:42:26Z 成功。
- 随后受控 reopen 只同步人类可读 current state、board 和 handoff narrative；业务交付物、closure PASS 与验证不变。
- 最终 prepare 后唯一下一步为等待精确正式验收口令。

## Recovery Entry 2026-07-23T04:43:16Z

- `wordpress_cms` 与 `frontend` 均完成 TASK-005 只读边界分析并回传 execution response；两者因 scope 禁止写 planner 文件，通过 stop-recovery message 交回恢复入口。
- frontend 首版 evidence map 的四个错误引用已受控修正并验证；技术结论未改变。
- 两个 stop-recovery message 已确认。TASK-005 保持 `IN_PROGRESS`，唯一下一步是 planner 完成综合与验证后请求独立 review。

## Recovery Entry 2026-07-23T04:51:57Z

- `MSG-TASK-005-ADVERSARIAL-REVIEW-R1-RESPONSE` 已确认；Round 1 verdict 为 `FAIL`，P0=0、P1=0、P2=1。技术路线、两个后续任务边界和零产品代码范围均通过。
- 唯一 P2 是 ADR-005、ADR-004 amendment、决策索引、项目/活动任务叙述和 stale-status 验证声称没有随 TASK-004 已验收事实同步。
- `task_transition.py reopen` 从 `UNDER_REVIEW` 按规则安全拒绝，因为 helper 只接受 `AWAITING_USER`；未伪造中间状态，planner 将真实状态同步为 `NEEDS_REVISION`。
- 受控修订只扩展到三份明确的决策状态文件，且只同步已发生的 TASK-004 acceptance/commit/push 元数据，不改变已接受的业务决策内容。
- Reviewer stop-recovery message 已确认。唯一下一步是完成该 P2、重跑可复现扫描并请求 Round 2。

## Recovery Entry 2026-07-23T05:01:06Z

- Round 2 final response 与 stop-recovery 已确认；verdict `FAIL`，P0=0、P1=0、P2=1。
- ADR-005 acceptance、ADR-004 amendment、decision index、A1/A2 final gate 和零产品代码范围均通过。
- 唯一剩余 P2 精确落在本文件“未解决问题”的旧进行时叙述，以及架构契约顶部仍称 ADR-005 待 TASK-004 验收的 authority metadata；历史 recovery 记录不计为缺陷。
- 任务恢复为 `NEEDS_REVISION`。唯一下一步是修正这两行并 fresh validate；两轮审查上限已用完，planner 不自行制造第三轮或绕过 final PASS 验收门。

## TASK-006 Planner Final Validation 2026-07-23T07:32:05Z

- 用户授权的额外独立 closure review 已返回 canonical `PASS`，P0=0、P1=0、P2=0。
- Planner final validation 已通过：插件 70 tests、治理、strict lane、messages、模板/parity、artifacts、scope/diff、zero product/runtime 和 live main/default 全部符合。
- TASK-006 仍未被用户验收，未 commit、push 或 merge。
- 唯一下一步是运行 checked `prepare-awaiting-user`，成功后等待精确正式交付口令。

## TASK-006 Checked Preparation Narrative Sync 2026-07-23T07:33:17Z

- 首次 checked prepare 于 2026-07-23T07:32:52Z 成功验证 artifacts 并进入 `AWAITING_USER`。
- 受控 reopen 只同步 active task、project、board、handoff narrative 和 helper 行尾空格；交付物、closure PASS 与 final validation 未改变。
- 未执行用户验收、commit、push、merge 或产品/runtime 修改。
- 唯一下一步是 final checked prepare，成功后等待 `确认 TASK-006 完成并提交到远端`。
