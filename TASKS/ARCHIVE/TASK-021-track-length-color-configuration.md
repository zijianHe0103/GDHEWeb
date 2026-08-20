# TASK-021 重构 FGD X15+PVC 长度与颜色配置并移除安装选择
accepted_at: 2026-08-04T18:39:41Z

task_id: TASK-021
legacy_closed_at_source: project_state_delivery_record
legacy_task_branch: codex/TASK-021-track-length-color-config
legacy_delivery_commit: 8ebaba40ddb47de0f55594591e628d7a8a3a0253
delivery_profile: REMOTE_LEGACY
closed_at: 2026-08-04T18:48:00Z
status: CLOSED
owner_lane: planner
assigned_lanes: [wordpress_cms, frontend, visual_qa]
review_lane: adversarial_reviewer
linked_issues: []
artifacts_dir: TASKS/ARTIFACTS/TASK-021
acceptance_state: ACCEPTED
recovery_recorded_at: 2026-08-04T18:32:19Z
git_status: MERGED
document_impact: RESOLVED
readme_impact: UPDATED
project_type: software

## 原始请求

> Track Length 直接列出飞书中该型号真实 Article Number 对应的标准长度，并在同级提供 Custom Length 和输入框；下一项为 Color，只列出飞书中真实存在的颜色。轨道本身不需要选择 Installation。Packaging、其他配置和 Add to Quotation 保持当前方向。配置模块之后增加可横向滑动的相关产品推荐列表。

## 任务分类

本请求改变产品配置字段、选择顺序、Article Number 解析方式和 QuoteLine 语义，属于实质性任务。为保持任务颗粒度和回退边界，本任务只完成“长度/颜色/移除安装”的闭环；相关产品横向推荐涉及另一条型号级关系数据与卡片消费链，留作 TASK-021 完成后单独创建的下一任务，不在本任务混合实施。

## 结构化理解

- 浏览器不直接读取飞书。正式数据路径仍为：飞书产品主数据 -> 受控同步 -> WordPress 镜像 -> GDHE REST API -> Next.js server-only consumer -> 页面公开 DTO。
- `Track Length` 是第一个配置项。标准长度只能由当前型号已发布、可报价的真实 Article Number 记录投影，不在 React 中硬编码 `4.3 m`、`6 m`、`7 m`。
- `Custom Length` 与标准长度处于同一级选择；选中后显示长度输入框，继续沿用“大于零、最多一位小数、无法直接解析 Article Number、交由业务员跟进”的规则。
- `Color` 紧随长度。标准长度下只显示与所选长度形成真实 Article Number 组合的颜色；定制长度下只显示该型号已公开的真实颜色集合。
- 标准长度与颜色组合必须唯一解析到一个真实 Article Number。零个或多个候选都必须 fail closed，不猜测、不静默选择。
- 轨道 QuoteLine 不再要求客户选择 `Installation`。页面只在产品能力说明中保留“支持顶装和墙装”的事实；安装码作为型号级相关配件在后续推荐任务中展示。
- 基础包装、Logo Printing、保护/排列方式、数量验证以及当前单条内存 `Add to Quote` 结果保持不变。
- 当前已确认的真实 FGD X15+PVC 规格仍只有 `GDHEPRD000172 / 6 m / Ivory White / piece`。在取得其他真实 Article Number 前，本地受控页面不得把 `4.3 m` 或 `7 m` 伪装成可报价标准规格。

## 目标

- 建立向后可审计的新版本 Product Configuration，并保留未来服务端 QuoteLine 最小合同，使轨道公开询价草稿不再携带客户选择的安装方式或任何内部身份。
- 将配置器顺序改为 `Track Length -> Color -> Packaging -> Quantity`，其中包装区域内部规则保持不变。
- 标准长度与颜色完全由真实 Article Number 选项动态投影，并以封闭、确定的规则解析 Article Number。
- `Custom Length` 与标准长度并列，选择后显示输入框并产生公开询价草稿；未来服务端 QuoteLine 转换才写入 `articleNumber:null + sales_follow_up`。
- 更新用户可读结果摘要，移除 Installation，保持不显示 Article Number 和内部字段。
- 继续保持一次产品详情请求、一次产品配置请求、零逐选项请求和零浏览器直连 WordPress。

## 非目标

- 不实现相关产品/相关配件横向推荐列表；该功能在本任务验收后作为独立小任务创建。
- 不实现多行 Quote Basket、30 天持久化、全局角标、询价表单、提交 API 或飞书写入。
- 不实现飞书到 WordPress 的真实同步程序，也不读取或修改真实飞书多维表格。
- 不虚构 `4.3 m`、`7 m`、其他颜色或对应 Article Number；真实记录未同步前不公开。
- 不增加顶码、墙码、走珠或封口的临时假数据，不自动把任何配件加入询价行。
- 不改动 Packaging 的三选一、Logo Printing、Single-piece Bagging 与 Paired Interlocking 互斥规则。
- 不扩展到其他型号、产品类别、正式 SEO、多语言、部署或生产发布。
- 不提交、推送或合并，除非后续收到精确正式交付口令。

## 交付物

- `TASKS/ARTIFACTS/TASK-021/REQUIREMENTS.md`：长度、颜色、Article Number 解析和无安装字段 QuoteLine 规则。
- `TASKS/ARTIFACTS/TASK-021/DESIGN.md`：版本化合同、WordPress 投影、server-only DTO 与 UI 状态设计。
- `TASKS/ARTIFACTS/TASK-021/IMPLEMENTATION_PLAN.md`：按合同、CMS、frontend、visual 拆分的 TDD 顺序。
- 新版本 Product Configuration 与 QuoteLine Schema、Fixture/Golden、handoff、frontend snapshot/verifier；既有 1.0.0 字节保持冻结。
- WordPress GDHE REST API 的最小版本化输出与完整候选校验。
- FGD X15+PVC 配置器、用户摘要和相关 tests 的最小修改。
- 1440/1024/768/390 与 320 CSS px 的视觉、键盘、错误状态和响应式证据。
- execution、validation、diff、visual QA、adversarial review 与 Planner Summary 证据。
- 行为完成后同步根 `README.md`、`frontend/README.md` 和相应 CMS/frontend 合同文档。

## 验收标准

- 页面配置顺序明确为 `Track Length`、`Color`、Packaging、Quantity；不再出现 Installation 表单控件或结果摘要字段。
- 标准长度列表只来自 Product Configuration DTO 的真实 Article Number 选项，按数值稳定排序并去重；`Custom Length` 是同级选项。
- 选择 Custom Length 后才显示输入框；只接受大于零、最多一位小数且可精确安全表示的米数。
- Color 选项由真实候选动态产生：标准长度按所选长度过滤，定制长度使用型号级公开颜色集合；没有可用颜色时 fail closed。
- 每一个标准 `length + color` 必须唯一命中一个可公开选项；不存在或不唯一时不得生成公开询价草稿，并显示脱敏错误。
- 当前真实测试候选仍只显示 `6 m` 与 `Ivory White`；未取得真实 Article Number 前不出现 `4.3 m` 或 `7 m` 标准选项。
- 浏览器公开询价草稿不要求 installation 且不含内部身份；QuoteLine 2.0.0 作为未来服务端转换权威同样移除 installation。旧 1.0.0 权威和历史样本保持字节不变。
- Packaging、Logo、保护方式、数量、单条最新公开询价草稿和 Add to Quote 交互与 TASK-020 一致；刷新清空且不发网络请求。
- CMS 页面加载仍只有一次 `/resolve` 和一次 `/product-configurations`，零 ProductCard/逐选项请求，浏览器零 WordPress 请求。
- raw CMS、WordPress/SCF、飞书 record ID、Article Number、供应商、成本、价格、库存、利润和诊断不得进入 DOM 或客户端错误。
- preview/cms 继续是本地非生产、`noindex,nofollow`，production 强制 404。
- 聚焦测试、全量测试、所有合同 verifier、lint、typecheck、build、production smoke、保护哈希、scope、diff 和 DPG 门通过。
- 最终 visual QA 与 adversarial review 为 PASS，且文档影响已处理。

## 允许修改范围

- `cms/wp-content/plugins/gdhe-site/**` 中 TASK-021 版本化 Product Configuration 合同和只读 API 最小修改
- `docs/cms/**`
- `frontend/src/app/products/fgd-x15-pvc/**`
- `frontend/src/components/product-configurator/**`
- `frontend/src/lib/cms/server/product-configurations/**`
- `frontend/src/lib/cms/product-configuration-contract/**` 中新增版本，不覆盖 1.0.0
- `frontend/src/lib/product-configuration/**`
- `frontend/src/lib/quote-contract/**` 中新增版本，不覆盖 1.0.0
- `frontend/src/types/**` 中 TASK-021 公开 DTO
- `frontend/tests/**` 与必要的验证脚本
- `docs/frontend/**`、`frontend/README.md`、根 `README.md`
- `QA/TASK-021/**`、`TASKS/ARTIFACTS/TASK-021/**`
- 本任务必要的 `PROJECT/**`、`TASKS/**`、`LANES/**` 治理记录

## 禁止修改范围

- WordPress Core、SCF、数据库中的真实业务内容和飞书数据
- TASK-019 Product Configuration 1.0.0 四份 Schema、Golden、错误样本、17-checksum handoff 及其前端 snapshot 字节
- TASK-019 QuoteLine 1.0.0 Schema、样本、相等和合并规则字节
- TASK-008～018 的冻结合同、权威证据和历史 artifacts
- TASK-020 的历史 review、visual 与 acceptance 证据
- ProductCard、ProductList 和产品详情的无关布局或行为
- `frontend/package.json`、lockfile、依赖和生产媒体白名单
- 相关产品 carousel、Basket、持久化、提交 API、飞书 Open API、部署和生产环境

## 约束

- 使用 TypeScript；CMS 端只修改 GDHE 自有插件，不修改 WordPress Core。
- 新语义使用明确的新合同版本；不得回写或伪装旧 1.0.0 合同。
- UI 只消费 DTO，不持有第二份长度、颜色或 Article Number 真相。
- 真实 Article Number 是标准选项解析权威；同型号下重复 `length + color` 必须整体拒绝而不是任选一条。
- 浏览器不得直连 WordPress 或飞书；所有秘密、原始 payload 和内部字段停留在 server-only 边界。
- 遵循严格 TDD：先用现有错误行为形成 RED，再做最小 GREEN，并保持旧版本回归。
- 本地服务可供用户查看，但不等于部署、生产数据通过或正式验收。

## 假设和待确认事项

- 建议把“相关产品推荐横向列表”拆成紧随其后的独立任务，因为它依赖型号级关联记录、配件公开资格、ProductCard 行为和横向交互，不应与 QuoteLine 合同版本修改混在同一个回滚单元。
- 下一任务中的推荐项默认只做可选推荐，不自动加入当前轨道 QuoteLine；顶码、墙码、走珠和封口必须来自飞书型号级关联并通过 WordPress 公开资格后才显示。
- 本任务完成前，现有本地 preview 继续运行 TASK-020 已交付页面，不能被描述为已经采用本次新规则。

## 验证计划

1. 冻结基线：记录 TASK-019/020 合同、verifier、routes、保护图片、package/lock 和当前测试哈希。
2. 合同 RED/GREEN：证明旧合同要求 installation 且不能表达新语义；新增版本并验证旧字节、旧回归不变。
3. WordPress RED/GREEN：验证真实选项完整性、型号身份、Article Number 全局唯一和型号内 `length + color` 唯一。
4. Frontend RED/GREEN：验证长度优先、Custom 同级、颜色联动、零/多候选 fail closed、无 installation、包装和数量不变。
5. 运行时边界：一次 resolve、一次 configuration、零逐选项请求、server-only 和 hostile/internal-field 负例。
6. 回归：聚焦与全量测试、全部 verifier、lint、typecheck、build、smokes、hash/scope/diff/DPG。
7. Visual QA：1440/1024/768/390/320，默认、标准、定制、错误、键盘、焦点和 reduced-motion。
8. 独立审查：合同版本、真实数据投影、无安装字段、无猜测、无越权和证据完整性。

## 文档影响

`NOT_APPLICABLE`（需求确认前）。实施改变配置流程和合同后，必须更新并置为 `RESOLVED`。

## README 影响

`NOT_APPLICABLE`（需求确认前）。实施后必须更新本地查看方式与已实现/未实现边界，并置为 `UPDATED`。

## 分支和 Worktree

- 分支：`codex/TASK-021-track-length-color-config`
- Worktree：当前共享项目工作区
- 基线：`main` / `origin/main` at `0dd33907b11e2c5413dd6e15868487c819d60186`
- 用户自有 `.codex/config.toml`、历史 resume packet 与本地 dev 生成的 `frontend/next-env.d.ts` 原样保留并排除。

## 当前状态

用户已于 `2026-08-04T18:39:41Z` 输入精确正式交付口令，`task_accept.py check/accept` 均成功。正式提交 `8ebaba40ddb47de0f55594591e628d7a8a3a0253` 已推送任务分支，fast-forward 合并到 `main` 并推送 `origin/main`；本地/远端 `main` 与远端任务分支已核对一致。任务现为 `CLOSED / ACCEPTED / MERGED`，未部署。Adversarial Round 2 final 为 `PASS / P0=0 / P1=0 / P2=0`，Planner final validation PASS，Visual 与历史 FAIL 记录完整保留。

## 恢复入口

先读 `AGENTS.md`、`PROJECT/COORDINATION.md`、`PROJECT/AGENT_LANES.md`、`LANES/registry/lanes.json`、本任务文件，再读 `PROJECT/STATE.md`、`TASKS/BOARD.md`、TASK-012 `REAL_PRODUCT_VALIDATION_GATE.md`、`TASKS/ARCHIVE/TASK-019-product-configuration-quote-line-contract.md` 和 `TASKS/ARCHIVE/TASK-020-fgd-x15-visible-configurator-quote-line-slice.md`。

## 下一步

TASK-021 已完成正式 Git 交付。相关产品滑动推荐、Basket、30 天持久化、提交 API 与飞书集成仍属于后续独立任务；不在本任务历史中继续修改。

正式交付只接受：

```text
确认 TASK-021 完成并提交到远端
```

## Lane Plan

| lane | responsibility | write_scope | expected_artifacts | status |
|---|---|---|---|---|
| planner | 冻结新合同版本、真实选项投影、任务边界并执行独立 checkpoint/最终汇报 | `PROJECT/**`、`TASKS/**`、`LANES/**`、必要 README | requirements、design gate、Planner Summary | FINAL_VALIDATION_PASS |
| wordpress_cms | 确认后以 TDD 新增版本化 Product Configuration 权威/API，保持 1.0.0 冻结 | 允许的 GDHE 插件、`docs/cms/**`、TASK-021 artifacts/lane records | RED/GREEN、handoff、execution report | EXACT_DECIMAL_AND_FINAL_HANDOFF_CHECKPOINT_PASS |
| frontend | CMS checkpoint 后新增前端 snapshot/runtime/DTO 和可见配置顺序，保持 Packaging/Add to Quote | 允许的 `frontend/**`、`docs/frontend/**`、TASK-021 artifacts/lane records | RED/GREEN、execution report、validation | ADVERSARIAL_R1_P1_REVISION_CHECKPOINT_PASS |
| visual_qa | frontend checkpoint 后执行四视口、320、键盘、焦点和状态验证 | `QA/TASK-021/**`、artifacts、lane records | visual report | ROUND_2_PASS |
| adversarial_reviewer | visual 与 Planner pre-review gate 后独立只读审查 | canonical review report、reviewer lane records | PASS/FAIL/P0/P1/P2 | ROUND_2_PASS_0_0_0 |

## Messages

- `MSG-TASK-021-WORDPRESS-CMS-V2-IMPLEMENTATION` 已由 wordpress_cms ACK、执行并回传；response 已由 Planner ACK/done。
- `MSG-TASK-021-FRONTEND-VISUAL-R1-REVISION-RESPONSE` 已 ACK/done；O1 code checkpoint PASS。Visual Round 1 FAIL 历史保留，下一消息只允许 same-origin Visual QA Round 2，review 仍阻塞。
- `MSG-TASK-021-VISUAL-QA-R2-RESPONSE` 已 validate、ACK/done；当前 Visual verdict 为 `PASS / severe=0 / obvious=0 / detail=0`，Round 1 `FAIL / 1 / 1 / 1` 历史与十份证据保留。
- `MSG-TASK-021-ADVERSARIAL-REVIEW-R1-RESPONSE` 已 validate、ACK/done；verdict `FAIL / P0=0 / P1=2 / P2=1`，Planner final validation 不允许。
- 用户于 `2026-08-05` 选择 A：Add to Quote 当前权威为 browser-only `PublicQuoteDraft`；QuoteLine v2 延后到未来最终 Request a Quote 的服务端转换。
- `MSG-TASK-021-WORDPRESS-ADVERSARIAL-HANDOFF-P2-R1-RESPONSE` 已 validate、ACK/done；Planner 独立复现 literal `20/20`，P2-1 进入中间 checkpoint PASS。P1-1 会修改 handoff 源文件，因此最终 frontend pins 仍保持阻塞。
- `MSG-TASK-021-WORDPRESS-ADVERSARIAL-EXACT-DECIMAL-P1-R1-RESPONSE` 已 validate、ACK/done；Planner 独立复现 full-root `4.3/5.8/6.7` PASS、`6.05` FAIL 和最终 literal `20/20`。CMS/Python P1-1 与 P2-1 最终权威链已关闭，frontend 窄修订已放行。
- `MSG-TASK-021-FRONTEND-ADVERSARIAL-P1-R1-RESPONSE` 已 validate、ACK/done；Planner 独立复现 `4/14` focused、`40/422` full、五 verifier、build、三 smoke、browser-byte/protected/23 visual hashes PASS。三项 Round 1 根因进入 Round 2 gate。
- `MSG-TASK-021-ADVERSARIAL-REVIEW-R2-RESPONSE` 已 validate、ACK/done；final verdict `PASS / P0=0 / P1=0 / P2=0`，Planner final validation 已允许并通过。

## 执行记录

Adversarial Round 1 历史为 `FAIL / 0 / 2 / 1`；Round 2 final 为 `PASS / 0 / 0 / 0`。CMS/frontend exact one-tenth、P2-1 final handoff 与 P1-2 PublicQuoteDraft 权威/生产命名均已独立关闭。Planner final validation 当前 PASS。Visual Round 1 FAIL、frontend 修订 PASS、Visual Round 2 PASS 与原验证历史均保留。

## Durable Task Artifacts

- `FRONTEND_EXECUTION_REPORT.md`
- `FRONTEND_VALIDATION_LOG.md`
- `FRONTEND_TDD_RED_GREEN_EVIDENCE.md`
- `VISUAL_QA_REPORT.md`
- `ADVERSARIAL_REVIEW_REPORT.md`
- `ADVERSARIAL_ROUND1_RECOVERY.md`
- `PUBLIC_QUOTE_DRAFT_AUTHORITY_DECISION.md`
- `WORDPRESS_ADVERSARIAL_HANDOFF_P2_R1_DISPATCH.md`
- `WORDPRESS_ADVERSARIAL_HANDOFF_P2_R1_REPORT.md`
- `WORDPRESS_ADVERSARIAL_EXACT_DECIMAL_P1_R1_DISPATCH.md`
- `WORDPRESS_ADVERSARIAL_EXACT_DECIMAL_P1_R1_REPORT.md`
- `FRONTEND_ADVERSARIAL_P1_R1_REPORT.md`
- `TEST_OR_VALIDATION_LOG.md`

## Adversarial Review

Round 1 历史为 `FAIL / P0=0 / P1=2 / P2=1`；Round 2 final 为 `PASS / P0=0 / P1=0 / P2=0`。三项根因均已独立关闭，Planner final validation 当前 PASS。

## Validation Evidence

设计/基线、WordPress、frontend、Visual Round 2 与 Adversarial Round 2 均 PASS。Planner 当前字节独立复现 focused `4/14`、full `40/422`、CMS/Python exact-decimal full-root、final handoff literal `20/20`、v1 `17/17`；五套 verifier、lint、typecheck、最终 build、三项 smoke、23/23 视觉证据、Core/SCF/DB、v1/package/lock/protected-image/CSS/next-env、零 listener/temp/generated residue、project/messages/strict lane/diff PASS。

## User Acceptance

`NOT_ACCEPTED`。

## Recovery Entry 2026-08-04T18:32:19Z

- Reason: Checked prepare succeeded, but human-readable task/state/board narration still described UNDER_REVIEW and pending prepare; reopen only to synchronize those views without changing product, evidence, review or validation.
- Next step: Synchronize AWAITING_USER-ready narratives, rerun governance and checked prepare, then wait for exact formal user acceptance.
