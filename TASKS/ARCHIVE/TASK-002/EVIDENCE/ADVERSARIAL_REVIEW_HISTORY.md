# TASK-002 Adversarial Review Report

verdict: FAIL
reviewed_by: adversarial_reviewer
reviewed_at: 2026-07-22T08:30:28Z
review_message: MSG-TASK-002-ADVERSARIAL-REVIEW

## Verdict

FAIL。REST-first 与 Polylang Pro、Next.js 与 Headless WordPress 责任边界、ACF Pro 许可证门、九语言发布、SEO 权威、Preview、Webhook、cache、询盘安全与禁止修改范围总体有充分的一手资料和可逆门；但已选 Polylang Pro 路线下的多语言媒体数据契约不闭合，直接影响“alt 按译文独立维护”这一已声明要求。本结论不是用户验收，不授权 commit、push 或任何实施。

## Findings

### P0

- 无。

### P1

- **多语言媒体 alt 的存储与返回模型未冻结，与当前字段规则不自洽。** 主契约一方面规定图片字段可使用 Copy Once，API 按 attachment 返回单个 alt；另一方面又规定 alt 必须按译文独立维护。WordPress REST 的 alt_text 属于单个 Media Item；同一 attachment 被多个语言共用时，无法仅靠当前 DTO 得到九个独立 alt。Polylang 官方方案是事先启用 Media module，以不复制物理文件的翻译 attachment 维护 title、alt 和 description；该模块默认关闭，官方且不建议内容开始后改变设置。契约未在“启用 Media module 并返回当前 locale 的 attachment sibling”与“在每次内容引用上存本地化 alt override”之间做决定，也未规定缺失媒体译文时的 fail-closed 行为。下一任务因而无法直接按契约建模，并可能在不自知中共享英语 alt。一手证据为 WordPress Media REST schema 与 Polylang Working with media；契约对应第 4.3、6.1 和 10 节。

### P2

- **translationGroupId 稳定性只被要求，未定义事实源。** Polylang Pro REST 提供 locale 到内容 ID 的 translations 映射，不直接提供契约示例中的持久 group UUID。当前文档只写“由多语言适配层规范化”，未规定是 GDHE 自有 meta UUID、英语源 ID 还是另一算法，也未覆盖重连或源文重建时的稳定性。该 ID 同时被 Webhook、cache tag 和 hreflang 闭包依赖，实施前应冻结。一手证据为 Polylang REST API；契约对应第 4.3、5.3 和 9.1 节。
- **WPGraphQL 重评门尚未量化。** 裁决保留了 fixture、请求数、延迟和维护成本的重评条件，这使 REST-first 可逆；但“超过既定延迟与错误预算”中的预算没有数值或测量方法。这不否定当前选择，但会让后续 ADR 触发依赖主观判断。

## Acceptance Mapping

| TASK-002 验收要求 | 审查结果 | 独立证据与评估 |
|---|---|---|
| Next.js + TypeScript 与 wp-admin 唯一后台 | PASS | 主契约第 0、2、3 节与 ADR-004 责任一致，未形成第二 CMS。 |
| REST 与 WPGraphQL 明确决策、鉴权、失败边界 | PASS | REST-first 裁决对专业 Lane 的 GraphQL 异议有显式回应；adapter、DTO、Application Password、HTTP 错误与新 ADR 门完整。 |
| CPT、Taxonomy、共享字段 | PASS | Services、Industries、Materials、Surface Finishes、Cases、Blog、Pages、Testimonials 均有建模，PHP 自有插件为事实源。 |
| ACF 与 ACF Pro、原生字段、Local JSON、许可证 | PASS | Pro 能力与采购门明确，无授权替代路线与 revision、preview PoC 均已声明。 |
| 九语言、当前页切换、独立发布、缺失译文、hreflang、RTL | PASS with P2 | 路由、发布闭包、404、x-default、组件级 RTL 完整；但 translation group 持久 ID 需冻结。 |
| ISR、Preview、Webhook、cache | PASS | Draft Mode、短时 HMAC、服务端凭据、防重放、标签与路径失效、重试和多实例边界已覆盖。 |
| SEO、Schema、Sitemap、robots、canonical、OG | PASS | Next.js 是唯一公开输出权威；Yoast 仅为 wp-admin 编辑层，结构化 REST 读取与公开 host 归一化边界成立。 |
| 媒体 | FAIL | 公开与机密存储、尺寸、MIME、CDN 与远程白名单完整，但本地化 alt 没有可实施的 attachment 或 reference 模型。 |
| 询盘、上传、邮件与 CRM、权限、secret、限流、日志和恢复 | PASS | 同源 BFF、隔离对象存储、MIME、文件签名、扫描、异步失败恢复和最小权限边界明确，未实现。 |
| 建议目录、DTO、后续阶段 | PASS | 主契约第 3.4、5.3、14 节可作为后续输入，且明确为示例而非已创建代码。 |
| 一手资料与时间敏感重验 | PASS with gaps | Polylang、Yoast、ACF、Next.js、WordPress、Google 与 OWASP 一手资料支持主要判断；媒体本地化一手资料未进入主契约。 |
| 禁止范围与未初始化 | PASS | frontend 目录不存在；Git 状态无 CMS、package、lockfile、uploads 或历史参考文档变化；WordPress checksum 证据通过。 |
| 治理验证 | PASS at review time | project、registry、message validate 独立通过；lane audit 仅报当前 review message 尚在 queue，是本审查 ack 前的预期生命周期状态。 |

## Evidence Gaps

1. 缺少 Polylang Media module 是否启用、媒体译文 attachment 如何归一化、缺失 locale 媒体时如何处理的决策。
2. 缺少 translationGroupId 的持久事实源、创建与重连规则、迁移边界。
3. 缺少 REST 代表页 fixture 的请求数、p95 延迟、错误预算和 gdhe version 1 端点复杂度阈值；它们可留到后续 contract test 与基准任务，但应在那个任务冻结为可执行的 ADR 重评门。

## Independent Validation

- governance project validate：PASS。
- lane registry validate：PASS。
- lane message validate：PASS。
- lane audit：仅 QUEUE_MESSAGES_PENDING MEDIUM，与当前待 ack 审查消息一致。
- Git diff check：PASS。
- 禁止路径状态过滤：0 个命中；frontend 目录不存在。
- 主契约、ADR、三份专业证据、execution、validation 与 diff summary 均已逐份读取，未仅依赖 planner 摘要。

## Sole Recommendation

planner 使用受控 task transition reopen 将 TASK-002 退回 NEEDS_REVISION；仅修订契约、ADR 与相关验证证据，先在“Polylang 媒体译文 attachment”和“每次媒体引用的本地化 alt override”中冻结唯一方案，并同步明确 translationGroupId 事实源；完成 fresh validation 后再发起第二轮审查。

## Round 2 Final Review

round_2_final_verdict: PASS
verdict: PASS
round_2_reviewed_by: adversarial_reviewer
round_2_reviewed_at: 2026-07-22T08:49:58Z
round_2_review_message: MSG-TASK-002-ADVERSARIAL-REVIEW-R2

### Final Verdict

PASS。Round 1 的一项 P1 与两项 P2 已在主契约、ADR、综合证据和修订后验证中形成一致且可实施的闭环。完整验收、证据、过度承诺与禁止范围复核未发现新的业务阻断项。本结论是第二轮也是本次最多两轮中的最终独立审查结论，不等于用户验收，也不授权实施、commit 或 push。

### Round 1 Finding Closure

| Round 1 finding | Round 2 result | Independent assessment |
|---|---|---|
| P1 多语言媒体 alt 模型不闭合 | CLOSED | 唯一模型已冻结为 reference level MediaReference。Polylang Media module 必须在首批导入前保持关闭。当前语言内容引用拥有 attachment ID、alt、caption 与 decorative。非装饰图缺少本地化 alt 时阻止发布，异常数据由 API fail closed，明确禁止英语、文件名和 attachment 全局 alt 回退。 |
| P2 translationGroupId 无稳定事实源 | CLOSED | 受保护 meta `_gdhe_translation_group_uuid` 已定义为 UUID v4 持久事实源。首次创建、sibling 复制、一致性与 locale 唯一性校验、删除英语源文、拆组、合组、重连、旧内容迁移和缓存及 SEO 失效规则均已冻结。前端不得从 slug、标题、URL 或当前 sibling 集合推导。 |
| P2 GraphQL 重评门未量化 | CLOSED | Home、Service、Case、Material 四类 fixture、同区域运行条件、正常 object cache、旁路前端数据缓存、预热后每类二百次与并发二十均已固定。串行请求、p95 五百毫秒、错误率百分之一、负载二百五十 KB、端点与模板查询图阈值均可执行，并明确这些是协议比较门而非生产 SLA。 |

### P0

- 无。

### P1

- 无。

### P2

- 非阻断治理生命周期项：活动任务中的 document impact 仍为 PENDING。架构文档与 ADR 已实际交付，planner 必须在受控等待用户验收转换前把该字段同步为 RESOLVED。此项不否定业务交付物的最终审查 PASS，但不得在仍为 PENDING 时声称已满足正式验收门。

### Acceptance Mapping

| TASK-002 acceptance area | Round 2 result | Independent assessment |
|---|---|---|
| 独立 Next.js 与 TypeScript 前端，WordPress 唯一后台 | PASS | 系统责任、服务端数据边界与后台唯一性明确，未形成第二 CMS。 |
| REST 与 WPGraphQL 裁决 | PASS | REST first 已明确，专业 Lane 的 GraphQL 异议被保留并回应，量化重评门确保可逆且禁止业务组件双轨。 |
| CPT、Taxonomy、共享字段与 ACF | PASS | 所有要求的内容类型、PHP 事实源、有限模块、Local JSON、Pro 许可证与替代路线均有边界。 |
| 九语言发布、切换、hreflang 与 RTL | PASS | 九语言路径、独立发布、缺失译文真实 404、当前页切换、公开 sibling 闭包与阿拉伯语组件级 RTL 均闭合。 |
| 译文组稳定性 | PASS | 受保护持久 UUID、完整迁移与 fail closed 规则足以支撑路由、Webhook、cache 与 SEO 闭包。 |
| Preview、ISR、Webhook 与 cache | PASS | 草稿隔离、短时签名、最小权限、防重放、旧新路径与多实例失效边界明确。 |
| 媒体 | PASS | 唯一本地化引用模型、当前语言 alt、装饰状态、发布阻断、API fail closed 与公共及机密媒体隔离完整。 |
| SEO 与公开输出权威 | PASS | Next.js 为 canonical、hreflang、Sitemap、robots、Open Graph 与 Schema 的唯一公开权威，插件仅承担编辑输入。 |
| 询盘、上传、邮件与 CRM | PASS | 同源接收、隔离存储、校验、扫描、限流、异步失败恢复、secret 与日志边界明确且未冒充已实现。 |
| 实施输入与后续顺序 | PASS | 目录边界、版本化 DTO、错误语义、PoC 与后续阶段可直接用于后续任务 intake。 |
| 一手证据与不确定性 | PASS | 专业证据保留真实分歧，最终裁决与官方资料相容；版本、许可证、插件兼容与运行时能力均留在后续重验门。 |
| 禁止范围 | PASS | frontend 不存在，状态检查未发现 CMS、依赖或 lockfile 变化；未安装插件，未修改数据库，未 commit 或 push。 |
| 治理验证 | PASS with lifecycle note | project、registry 与 message validate 通过。lane audit 仅报告本轮待 ack queue 消息，符合当前消息生命周期。document impact 需由 planner 在验收转换前置为 RESOLVED。 |

### Evidence Gaps

没有阻断本架构契约的证据缺口。Next.js build、真实插件兼容、九语言内容、Preview、Webhook、缓存、媒体字段、询盘与部署仍未实现或运行验证；交付物已明确把它们放入后续独立实施和 PoC 门，没有作过度承诺。

### Independent Validation

- project governance validate：PASS。
- lane registry validate：PASS。
- lane message validate：PASS。
- lane audit：仅当前 Round 2 queue 消息待 ack 的预期生命周期提示。
- Git diff check：PASS。
- 禁止路径状态过滤：无命中；frontend 目录不存在。
- 主契约、ADR、综合证据、三份专业证据、执行报告、验证日志、差异摘要与 Round 1 历史均已重新读取并交叉核对。

### Sole Recommended Next Action

planner 确认受控 PASS response 后，将 document impact 同步为 RESOLVED，重新运行最终治理验证，并使用受控 prepare awaiting user 转换进入用户验收等待；不得把本审查当作用户验收或 Git 授权。
