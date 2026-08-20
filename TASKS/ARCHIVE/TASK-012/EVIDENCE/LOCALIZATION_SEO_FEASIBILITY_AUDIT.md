# TASK-012 Localization / SEO 可实施性审计

审计日期：2026-07-26

Lane：`localization_seo`

消息：`MSG-TASK-012-LOCALIZATION-SEO-FEASIBILITY-AUDIT`

性质：只读架构与路线可实施性核查，不是实现、采购、安装、翻译或公开发布授权

## 1. 结论

**CONDITIONAL PASS**：TASK-012 的新路线在 Localization / SEO 范围内可实施，前提是权威路线图同时冻结以下边界：

1. 技术 SEO 从首个正式英语模板开始，不能继续推迟到全部页面完成后集中补做。
2. 技术 SEO 与内容 SEO 分轨：前者随模板和路由交付，后者依赖真实产品、关键词、市场与经审核文案持续迭代。
3. 英语仍是当前唯一公开语言；多语言最小 PoC 和完整九语言发布都必须通过独立任务及相应进入门。
4. 最小 PoC 只能是隔离、非公开、非采购承诺的验证；它不证明 WPML/ACFML 已购买、SCF 已兼容、译文已审核或任何非英语语言已上线。

未发现需要推翻 Headless WordPress + Next.js、SCF、REST-first 或 Next.js 公开 SEO 输出权威的理由。

## 2. 核查范围与权威依据

已完整核查：

- `TASKS/ACTIVE/TASK-012-roadmap-reprioritization.md`
- `TASKS/ARCHIVE/TASK-012/OUTPUTS/DESIGN.md`
- `TASKS/ARCHIVE/TASK-012/TASK.md`
- `docs/architecture/headless-wordpress-nextjs-contract.md` 第 6、7、14 节
- `MEMORY/DECISIONS/ADR-002-multilingual-publishing.md`
- `MEMORY/DECISIONS/ADR-004-headless-wordpress-nextjs-contract.md`
- `MEMORY/DECISIONS/ADR-005-english-first-scf-wpml-deferral.md`
- 用户确认的新路线输入及当前仓库只读事实
- 本文第 10 节列出的官方一手资料

ADR-005 已取代 ADR-004 第 5、6 项的相关实现选择：当前字段层为 SCF，未来完整多语言候选为 WPML Multilingual CMS + ACFML；这仍是候选路线，不是采购或兼容性事实。

## 3. 当前事实、候选状态与缺口

| 项目 | 当前可验证事实 | TASK-012 候选状态 | 尚未满足 |
|---|---|---|---|
| 公开语言 | 仅英语 `en`，公共前缀 `/` | 保持英语优先 | 不得构造非英语公开 URL、switcher 或 hreflang |
| 正式页面 | `/` 是 foundation 占位页；`/integration/cms` 是技术证明页 | 首个真实产品纵向切片形成首批正式模板 | 真实 IA、产品内容、CTA、URL Map 尚未冻结 |
| Metadata | 根布局只有占位 title/description；技术页有 title 和 `noindex,nofollow` | 模板级 Metadata 合同 | 无正式页面级 title/description/OG/canonical |
| Canonical | 未实现 | 首个正式模板开始自引用 canonical | 公开域名、route manifest、URL 规则未冻结 |
| robots / Sitemap | 未发现 `robots.*` 或 `sitemap.*` | 随正式公开路由建立 | indexability 规则与公开域名未冻结 |
| Breadcrumb / Schema | 未发现可见 Breadcrumb 或 JSON-LD | 随层级模板同源生成 | IA 层级与真实可见数据未冻结 |
| 404 / redirect | 技术集成页用 `notFound()`；无公开 URL 生命周期实现 | 路由模板同时定义 404、迁移和撤回语义 | 旧新 URL 映射与撤回策略未建立 |
| 图片 alt | 无正式产品媒体模板 | 随真实产品纵切进入验收 | 内容字段、装饰图规则和语言责任未冻结 |
| 多语言插件 | 未安装 WPML、ACFML、Polylang 或机器翻译插件 | 未来独立 PoC 后再决策 | 未采购；SCF + ACFML 未获官方兼容证据 |
| 九语言发布 | 仅未来契约 | 成熟度门满足后逐语种发布 | 译文、审核人、RTL、发布/撤回、回滚均未实证 |

该扫描只证明当前仓库状态，不把路线图候选写成已经交付的功能。

## 4. 技术 SEO 从首个正式模板开始的最小合同

“首个正式模板”指使用真实 WordPress 内容、面向未来公开 URL、进入产品验收的模板；foundation 占位页和受控技术集成页不属于正式模板。

### 4.1 英语 URL 与索引状态

- 阶段 1 冻结英语 URL Map、slug 字符规则、大小写、尾斜杠、分页和筛选参数政策。
- 每个正式页面必须有唯一 canonical public path；CMS origin 和内部技术路径不能成为公开 canonical。
- 公开、已发布、合同有效且允许索引的页面才可进入导航、Sitemap 和站内链接。
- 搜索结果、任意筛选组合、Preview、内部工具和 Staging 默认不得索引；只有经 IA 批准的落地页例外。
- 不用 `robots.txt` 代替 `noindex` 或访问控制。需让爬虫读取 `noindex` 的页面不能同时被 robots 禁止抓取。

### 4.2 Metadata、canonical 与社交元数据

- 从每个正式模板首版开始输出唯一 title、相关 meta description、唯一 H1、自引用 canonical、Open Graph / Twitter 基础。
- Next.js 继续作为公开 HTML 的唯一 SEO 输出权威；未来即使采用 Yoast，也只能把经归一化和校验的编辑数据提供给 Next.js。
- title、description 和 OG 文案的字段/渲染机制属于技术 SEO；最终关键词定位、说服性文案和市场差异属于内容 SEO。
- canonical、redirect 和 Sitemap 必须指向同一公开 URL 事实源，不能各自维护路径。

### 4.3 robots 与 Sitemap

- `robots.txt` 指向公开 Sitemap；Staging 使用身份保护并补充 `noindex`，不能只用 robots 阻止索引。
- Sitemap 只列绝对 HTTPS、canonical、公开、已发布、可索引、返回成功状态的 URL。
- `lastmod` 只能来自真实的重大页面更新，不能在每次生成时伪造当前时间。
- 第一阶段允许单一 Sitemap；只有规模或运维观测需要时才按内容类型拆分。

### 4.4 Breadcrumb 与 Schema

- 可见 Breadcrumb 与 `BreadcrumbList` 必须读取同一 IA/route manifest，名称、顺序和 URL 保持一致。
- JSON-LD 只描述页面可见且已核验的事实；使用 JSON-LD 不保证获得富结果。
- 全站可在组织事实确认后输出 `Organization` / `WebSite`；层级页使用 `BreadcrumbList`。
- 真实产品模板只有在业务语义与页面可见数据满足定义时才输出 `Product`。无真实价格、库存、评分或评价时，不输出虚构 `Offer`、`AggregateRating` 或 `Review`。
- Schema 字段映射属于技术 SEO；产品事实、认证、价格、评价与 FAQ 的真实性和编辑质量属于内容治理。

### 4.5 404、redirect 与 URL 生命周期

- 不存在或未公开的页面返回真实 `404`；明确永久删除且无替代时，才按批准策略使用 `410`。
- 内容有明确新位置时采用单跳永久重定向，并同步 canonical、站内链接和 Sitemap。
- 不把大量无关旧 URL 重定向到首页；这可能造成软 404 和错误用户意图。
- slug 变更前必须产生可审计的旧→新映射；撤回则从 Sitemap、导航、站内搜索和未来 hreflang 集合移除。

### 4.6 图片 alt

- 信息型图片使用简洁、上下文相关的替代文本；不得关键词堆砌。
- 纯装饰图片使用空 `alt`；不能以文件名或产品标题机械填充全部图片。
- alt 的字段、必填/装饰标记和渲染回退属于技术合同；准确描述和未来各语言本地化属于内容责任。
- 阿拉伯语等目标语言发布时必须独立复核 alt，不默认持续同步英语文本。

## 5. 技术 SEO 与内容 SEO 的明确分轨

| 技术 SEO：随模板/路由交付 | 内容 SEO：持续迭代 |
|---|---|
| URL/slug 规则、状态码、redirect | 关键词与搜索意图研究 |
| Metadata 生成、canonical、robots | title、description、H1 和正文策略 |
| Sitemap 与 indexability | 产品卖点、案例、市场文章 |
| Breadcrumb / JSON-LD 渲染与验证 | FAQ、认证、评价等真实内容 |
| `html lang/dir`、未来 hreflang 闭合 | 各语言人工翻译、本地化与复核 |
| alt 字段合同和装饰图行为 | 每张信息型图片的准确 alt |
| Preview/Staging 的访问与 noindex | 内链策划、内容更新频率 |

技术机制先交付不代表内容质量已经完成；内容尚不完整也不能成为推迟正确 URL、状态码、canonical 和索引边界的理由。

## 6. 与 TASK-012 候选阶段的进入门

### 阶段 1：英语 IA、真实目录与转化基线

进入下一阶段前至少冻结：

- 10～20 个代表产品的真实资料与缺口，不用虚构内容填充；
- 一级/二级 IA、模板类型、URL Map、slug 和参数规则；
- 主/辅 CTA、访客类型和转化路径；
- SEO 字段所有权、公开 URL/canonical 数据源、索引矩阵；
- Breadcrumb 层级、产品 Schema 可用事实和图片 alt 责任。

### 阶段 2：视觉基线与真实产品纵向切片

首个正式分类/产品纵向切片必须同时验收：

- 页面级 Metadata、canonical、robots；
- 正确 H1、可见 Breadcrumb 与一致的 `BreadcrumbList`；
- 基于真实事实的最小 Schema；
- 真实 404、批准的 redirect 行为和 alt；
- 1440、1024、768、390 视口与 WCAG 2.2 AA 基础。

“技术 SEO 从首个正式模板开始”在此成为模板完成定义，不单独等待后期 SEO 任务。

### 阶段 3：Preview、缓存、Webhook 与 Staging

- Preview / Draft Mode 使用签名、身份校验、`noindex` 和 `no-store`，不进入 Sitemap。
- Staging 以身份保护为主，并以全站 `noindex` 做纵深保护；验证公开域名与环境变量不会串用。
- 发布、撤回、slug 变更和合同无效必须正确失效 route manifest、页面、Sitemap 及相关 redirect。

### 阶段 4 至上线

- 每个新增正式模板复用同一 SEO 合同并增加模板特定 Schema 验证。
- 上线前执行 rendered HTML、状态码、canonical、robots、Sitemap、Schema、内部链接、404/redirect 和图片 alt 的完整回归。
- Search Console、真实抓取与性能观测属于上线任务，不在本审计中配置。

## 7. 完整多语言成熟度门

固定“生产英语站稳定三个月”不再是唯一启动条件。完整多语言至少同时满足以下可验证成熟度门；日历稳定期可作为风险信号，但不能替代这些证据：

1. **产品与内容门**：代表产品、关系、下载、媒体、alt 和目标市场内容已完整，英语内容所有人明确。
2. **IA / URL 门**：英语 route manifest、slug、canonical、redirect 和 Sitemap 已在真实模板中稳定验证。
3. **Schema 门**：公开 DTO、模板 Schema 与 translation group 身份设计稳定；字段翻译/复制/关系映射有逐字段策略。
4. **发布门**：Preview、独立 Draft/Review/Publish/Withdraw、缓存失效和故障降级已经在英语流程中可靠运行。
5. **插件兼容门**：在许可合规的隔离环境中证明当前 SCF 与候选 WPML/ACFML 的字段、关系、REST、升级和回滚兼容。
6. **语言质量门**：目标语言、市场、译者、复核者、术语表、法律/隐私责任和素材本地化均被确认。
7. **SEO 门**：每个翻译组只输出真实已发布 sibling；self-reference 和双向闭合 hreflang、各语言 self-canonical、Sitemap 与切换器使用同一映射。
8. **RTL / 可访问性门**：Arabic 使用 `<html lang="ar" dir="rtl">`，CSS logical properties、双向文本、表单、表格、Breadcrumb、图标和四视口用真实阿拉伯语验收。
9. **运维门**：备份、升级、回滚、日志、权限、缓存清理、撤回及清除公开入口均有演练证据。
10. **治理门**：独立任务已确认范围、许可证/采购权限、风险、验收和退出方案；没有未处理 P1。

完整九语言发布应逐语种、逐模板放行，不因插件安装一次性公开全部前缀。

## 8. 最小多语言 PoC 的严格边界

### 8.1 PoC 允许验证的最小闭环

- 一个产品；
- 一个分类；
- 一个下载；
- 一个关系；
- 一个目标语言 translated slug；
- 一个包含自身且双向闭合的 hreflang 组；
- Preview、独立发布/撤回、REST 投影、缓存失效和回滚。

为覆盖语言方向和翻译关系风险，候选测试语言可以是 English / French / Arabic，但必须使用明确标记的测试 fixture 或已授权译文。

### 8.2 非公开边界

- 必须由后续独立任务授权，并在隔离、可清理、许可合规的环境执行。
- 环境须有身份保护，并补充 `noindex`；不得把 PoC URL 写入生产 DNS、公开导航、生产 Sitemap、Search Console 或外部推广。
- 不得在公开站构造 `/fr/`、`/ar/` 或其他未来路由，也不得显示语言切换入口。
- 不得用首页回退冒充缺失译文；未发布 sibling 必须 404 且从 hreflang、Sitemap 和切换器排除。
- 结束时验证插件/fixture/URL/缓存残留清理或明确保留的隔离证据。

### 8.3 非采购、非上线边界

- 本 PoC 规划不等于已购买 WPML Multilingual CMS、ACFML、翻译额度或外部服务。
- WPML 官方资料表明 ACFML 需要 WPML、String Translation 和支持该组件的商业账户；采购必须另行明确授权。
- 官方 ACFML 文档明确面向 ACF / ACF Pro，未提供当前 SCF 组合的生产兼容承诺。因此 SCF + ACFML 必须以阻断项进入 PoC，不能从名称或论坛答复推断兼容。
- PoC 通过只证明指定版本、指定 fixture 和指定环境的候选可行性；不等于九语言内容就绪、公开路由获批或生产发布完成。

## 9. 阻断项与建议进入门

| 阻断项 | 影响 | 建议解除证据 |
|---|---|---|
| 英语 IA、URL Map、CTA 未冻结 | 无法稳定 canonical、Breadcrumb、redirect | 阶段 1 受确认交付物 |
| 正式真实产品模板尚不存在 | 不能验收模板级 SEO | 阶段 2 真实纵向切片 |
| 真实产品/媒体/下载资料未就绪 | Schema 与 alt 可能失真 | 10～20 个样本及缺口清单 |
| 公开域名和 Staging 类型未冻结 | 绝对 canonical/Sitemap 和隔离策略不能实测 | 部署类型、环境和域名决策 |
| route manifest 尚无公开实现 | Sitemap、canonical、redirect 缺单一事实源 | 独立实现与合同测试 |
| WPML/ACFML 未采购或安装 | 不能开始插件 PoC | 独立任务与采购授权 |
| SCF + ACFML 官方兼容证据不足 | 字段/关系/升级存在生产风险 | 许可合规 PoC 的通过/回滚证据 |
| 目标市场、译文和审核责任未确认 | 完整多语言不能进入 | 语言/市场/人员/术语/法律责任清单 |

建议 Planner 把上述门写入权威第 14 节，但不得在 TASK-012 内创建后续任务、实现 SEO 或执行 PoC。

## 10. 官方一手资料

全部访问日期：**2026-07-26**。

### Google Search Central

- Canonical：<https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls>
- Robots meta / X-Robots-Tag：<https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag>
- Sitemap 构建：<https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap>
- 抓取错误、404/410、soft 404 与 redirect：<https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors>
- URL 迁移与避免无关首页重定向：<https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes>
- Meta description / snippet：<https://developers.google.com/search/docs/appearance/snippet>
- 图片与 alt 最佳实践：<https://developers.google.com/search/docs/appearance/google-images>
- Breadcrumb structured data：<https://developers.google.com/search/docs/appearance/structured-data/breadcrumb>
- Structured data 总则：<https://developers.google.com/search/docs/appearance/structured-data/sd-policies>
- 多语言页面与 hreflang：<https://developers.google.com/search/docs/specialty/international/localized-versions>

### Next.js

- Metadata / `generateMetadata`：<https://nextjs.org/docs/app/api-reference/functions/generate-metadata>
- Metadata file conventions：<https://nextjs.org/docs/app/api-reference/file-conventions/metadata>
- `notFound` / `not-found`：<https://nextjs.org/docs/app/api-reference/file-conventions/not-found>
- 永久重定向：<https://nextjs.org/docs/app/api-reference/functions/permanentRedirect>
- Draft Mode：<https://nextjs.org/docs/app/api-reference/functions/draft-mode>

### 多语言与 RTL

- WPML ACFML 官方要求与组件边界：<https://wpml.org/documentation/related-projects/translate-sites-built-with-acf/>
- WPML 账户/采购入口：<https://wpml.org/purchase/>
- W3C HTML RTL 结构化方向：<https://www.w3.org/International/questions/qa-html-dir.en>

## 11. 本 Lane 的完成边界

- 只产出本审计与 `LANES/localization_seo/worklog.md` 记录。
- 未修改 `frontend/**`、`cms/**`、架构契约、活动任务、planner 文件、依赖或运行环境。
- 未采购、安装、翻译、实现、部署、提交、推送、合并、验收或关闭任务。
- 本文是供 executor / planner 修订权威路线图的专业证据；最终路线、实施任务和授权仍由治理门控制。
