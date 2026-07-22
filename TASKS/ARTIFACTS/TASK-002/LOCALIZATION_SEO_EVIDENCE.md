# TASK-002 九语言与 SEO 架构证据

- lane: `localization_seo`
- message: `MSG-TASK-002-LOCALIZATION-SEO-ARCHITECTURE`
- evidence date: 2026-07-22
- scope: 仅定义 Headless WordPress 与 Next.js 的九语言、发布、SEO 和 Schema 契约；未安装或配置插件，未修改 frontend、CMS 或数据库。

## 1. 结论摘要

1. 固化一个公开 URL 权威层：Next.js 生成公开路由、canonical、hreflang、Sitemap、robots、Open Graph 与 JSON-LD；WordPress 只保存各语言内容、关联、状态和可编辑 SEO 字段。不得让 WordPress 主题 URL、SEO 插件 URL 与公开前端同时成为权威来源。
2. 固化九个 locale key：英语为无前缀 `/`，其余为 `/fr/`、`/de/`、`/es/`、`/zh-CN/`、`/ar/`、`/hi/`、`/ja/`、`/pt/`。内容之间以稳定翻译组关联，不能靠 slug、标题或 URL 猜测关系。
3. 只有 WordPress 已发布且人工审核通过的语言 sibling 才可公开。未发布 sibling 不生成公开路由，不进入当前页语言切换、hreflang、Sitemap 或 Schema 关系；直接访问不存在的译文 URL 返回真实 404，不回退到英语或首页。
4. 每个公开译文自 canonical；同一翻译组内所有公开 sibling 输出完全一致、自包含、双向闭合的 hreflang 集合。`x-default` 指向该内容的英语 sibling，不统一指向首页。
5. 多语言机制主推荐为 **WPML Multilingual CMS 加 WPML GraphQL**；若主架构最终明确为 REST-only，备选为 **Polylang Pro**。两者不得并装。主推荐受商业许可、WordPress、PHP、ACF、WPGraphQL 版本兼容 PoC 和九语言发布流程验证门约束。
6. SEO 编辑层推荐 **Yoast SEO 免费版基线加 WPML SEO glue add-on**；Next.js 通过受控 adapter 消费 `yoast_head_json` 或结构化字段并生成最终标签，禁止把插件返回的整段 HTML 不经校验直接注入。Yoast Premium 仅在明确需要付费功能并完成采购时启用。

## 2. Locale 与 URL 契约

路由 key、内容 locale、HTML 语言标签和搜索引擎标记必须显式映射，不能用字符串拼接互相推断。

| locale key | 公开前缀 | HTML lang 与 hreflang | dir | 说明 |
|---|---:|---|---|---|
| `en` | `/` | `en` | `ltr` | 默认语言、源文、无 `/en/` 公开别名 |
| `fr` | `/fr/` | `fr` | `ltr` | 不预设法国地域定向 |
| `de` | `/de/` | `de` | `ltr` | 不预设德国地域定向 |
| `es` | `/es/` | `es` | `ltr` | 不预设西班牙地域定向 |
| `zh-CN` | `/zh-CN/` | `zh-Hans` | `ltr` | URL 保留已确认的 `zh-CN`；SEO 与 HTML 表达简体脚本而非未经确认的地域市场 |
| `ar` | `/ar/` | `ar` | `rtl` | 通用阿拉伯语；国家定向需另行确认 |
| `hi` | `/hi/` | `hi` | `ltr` | 通用印地语 |
| `ja` | `/ja/` | `ja` | `ltr` | 日语 |
| `pt` | `/pt/` | `pt` | `ltr` | 未确认葡萄牙或巴西市场前使用通用葡萄牙语 |

Google 支持语言、可选地域和脚本代码，并明确支持 `zh-Hans`。若业务以后确认目标是中国大陆而非泛简体中文，可经 ADR 把 HTML lang 和 hreflang 改为 `zh-CN`；公开路径无需随之改变。

### 2.1 路径规则

- 英语详情路径为 `/{typeBase}/{slug}/`，首页为 `/`。
- 非英语详情路径为 `/{localePrefix}/{localizedTypeBase}/{localizedSlug}/`，首页为 `/{localePrefix}/`。
- `typeBase` 与内容 slug 都由受版本控制的 locale route map 和对应译文记录提供，不得运行时机器翻译。
- slug 唯一性键为 locale、contentType、parentPath 和 slug 的组合；不同语言可相同，也可完全不同。
- current-page language switch 使用 translationGroupId、公开 sibling 集合和 publicPath 的显式关系，禁止用当前 slug 查询其他语言。
- 大小写、尾斜杠和百分号编码采用一个全站策略；所有非规范变体永久重定向到唯一规范 URL。
- 不公开 `/en/` 别名；若历史上出现，永久重定向到无前缀英语对应页。

## 3. WordPress 翻译关系与独立发布

### 3.1 最小数据契约

每个语言版本都是独立 WordPress 内容实体，并至少暴露：

```json
{
  "id": "cms-node-id",
  "contentType": "service",
  "translationGroupId": "stable-group-id",
  "locale": "de",
  "sourceLocale": "en",
  "status": "publish",
  "reviewStatus": "approved",
  "slug": "cnc-bearbeitung",
  "routeBase": "dienstleistungen",
  "modifiedGmt": "2026-07-22T00:00:00Z",
  "translatedFromRevision": "source-revision-id",
  "seo": {},
  "translations": [
    {"locale": "en", "id": "id-en", "status": "publish", "reviewStatus": "approved", "publicPath": "/services/cnc-machining/"},
    {"locale": "de", "id": "id-de", "status": "publish", "reviewStatus": "approved", "publicPath": "/de/dienstleistungen/cnc-bearbeitung/"}
  ]
}
```

字段名是跨系统语义契约，不代表本任务已经实现数据库字段。若插件原生提供等价关系和状态，adapter 负责转换为此稳定形状。

### 3.2 公开资格

一个 sibling 仅在下列条件全部满足时进入公开集合：

- locale 在九语言 allowlist 中且启用；
- WordPress `post_status` 为 `publish`；
- 人工流程已批准；采用 WordPress 原生权限流程时，有发布权限的编辑实际发布即为批准；采用额外 `reviewStatus` 时必须为 `approved`；
- 必需内容和 SEO 校验通过；
- 公开路径可唯一解析，所需父级与分类关系可公开。

API 或 adapter 无法确认状态时必须 fail closed：视为不可公开，不得用英语内容填充该 locale。

### 3.3 编辑流程

1. 英语源文保存或发布。
2. 编辑者在 `wp-admin` 创建或关联目标语言 sibling；新 sibling 默认为 `draft`。
3. 译者只编辑被授权语言，人工填写正文、slug、图片替代文本、SEO 和 Schema 所需可编辑字段。
4. 无发布权限的译者提交为 `pending`；有发布权限的编辑复核并发布。
5. 发布事件携带 `translationGroupId`、locale、旧路径、新路径和内容类型触发前端刷新。
6. 英语源文更新时，已发布译文不自动覆盖或自动下线，而是标记 `needs_update`。若内容已不再语义等价，编辑必须下线该译文，复核完成前不能继续放在 hreflang 闭包中。

禁止开启缺失译文显示源文、自动 fallback、自动发布或未经人工复核的机器翻译。WPML 或 Polylang 的复制功能只能用于创建草稿起点，不能成为公开译文。

## 4. 语言切换、缺失译文与错误状态

- 当前页切换器只渲染当前翻译组中的公开 sibling；每个链接直达同内容的对应译文。
- 未创建、草稿、待审、私有、已下线或校验失败的 sibling 不出现在当前页切换器中；这落实 ADR-002，不做可点击的英语 fallback。
- 用户手工访问从未存在的译文路径时返回 404。
- 已永久撤回且无替代的旧译文返回 410 或 404，并同时从 hreflang、Sitemap、导航和缓存中移除。
- slug 变更时，旧公开 URL 永久重定向到同 locale 的新 URL，不得跨语言重定向。
- 不依据 IP 强制跳转。首页可在首次访问时给出可关闭的语言建议；任何 locale negotiation 都不得覆盖用户明确选择，也不得让爬虫看到不稳定内容。

## 5. Canonical、hreflang、Sitemap 与 robots

### 5.1 Canonical

- 每个公开译文输出绝对、自引用 canonical；法语 canonical 指向法语本身，不指向英语。
- tracking query、大小写和尾斜杠等重复 URL canonical 到同语言规范 URL，并在可行时重定向。
- canonical 由 Next.js 的公开 host 和 locale route map 计算。CMS 或 SEO 插件若返回 WordPress host，adapter 必须替换或拒绝，不能原样发布。
- 编辑者不得日常手填 canonical。只允许受控例外覆盖，并验证目标为同语言、公开、允许索引的 URL。

### 5.2 hreflang 闭包

对每个翻译组执行：

1. 取所有公开且允许索引的 sibling，得到集合 P。
2. P 少于两个版本时不输出多语言 alternates；页面仍自 canonical。
3. P 至少两个版本时，每个版本输出完全相同的集合：每个 sibling 一条绝对 URL alternate，并包含自身。
4. 所有版本相互返回，形成双向闭包；校验任何页面的集合都与组快照一致。
5. 增加 `x-default`，指向该翻译组的英语公开 sibling。英语缺失属于数据错误，不得改指首页掩盖错误。

例如仅英、法、日发布时，四条 alternate 的 hreflang 值应为 `en`、`fr`、`ja` 和 `x-default`，后三个语言版本都输出同一集合；德语等未发布 sibling 不得出现。

Next.js `generateMetadata` 和 Metadata API 可生成 canonical 和 language alternates，但输入必须来自同一个已过滤的公开 sibling resolver。

### 5.3 Sitemap

- 公开前端根域的 Sitemap 是唯一提交给搜索引擎的 Sitemap；WordPress 或 Yoast 后台 Sitemap 不作为公开权威，也不应被提交。
- Sitemap 只列 200、公开、允许索引、自 canonical 的 URL；预览、草稿、搜索结果、参数页和 CMS URL 不进入。
- 可按 locale 与 content type 分片并使用 sitemap index；每条记录使用绝对 URL 和可信 `lastmod`。
- 每个多语言 URL 条目包含与页面 head 相同的 hreflang 闭包和 `x-default`，并做集合一致性测试。
- 发布、下线、slug 变更和翻译关系变化都必须刷新对应页面、列表页和 Sitemap。

### 5.4 robots

- 生产 `robots.txt` 指向公开前端 Sitemap；不把 robots.txt 当作 canonical 或 noindex 工具。
- 预发布环境必须鉴权并全站 `noindex`；仅 robots.txt 禁抓不足以保证不被索引。
- 预览响应输出 `noindex, nofollow, noarchive`，并禁止共享缓存。
- 公开页面默认 `index, follow`；搜索、过滤和内部结果页按模板策略 `noindex, follow`，且不得进入 Sitemap。

## 6. 元数据、Open Graph 与社交分享

每个语言 sibling 独立管理 SEO title、meta description、H1、OG title、OG description、OG image、image alt、Twitter 或 X card 字段、可选 robots override 和 Schema 所需事实字段。

技术字段由前端计算，不交给编辑者随意填写：canonical、`og:url`、hreflang、`x-default`、公开 host、Schema `@id` 和 locale alternates。

推荐优先级为该 sibling 的显式本地化值、经批准的同语言模板 fallback、校验失败。禁止从英语复制 description 后以目标 locale 发布。缺少 OG 专用图片时可复用该 sibling 已批准的 featured image，但 alt 必须本地化。

Next.js 应集中使用 `generateMetadata`，设置唯一 `metadataBase`，避免模板各自拼 host。Next.js 文档说明嵌套 metadata 为浅合并，因此公共 OG 对象必须通过共享 builder 显式合并，避免页面覆盖时无意丢失 description 或 image。

## 7. Schema 与 JSON-LD 契约

只输出页面可见、可验证的事实。JSON-LD 的 URL、`@id`、`inLanguage`、图片和 breadcrumb 都使用当前 sibling 的规范公开 URL；不同译文有各自 WebPage `@id`，组织实体使用稳定全站 `@id`。

| 模板 | 推荐类型 | 条件与边界 |
|---|---|---|
| 首页 | `WebSite`、`Organization`、`WebPage` | Organization 名称、Logo、地址、电话和 sameAs 仅在 GDHE 正式资料确认后填写 |
| Service 详情 | `Service`、`WebPage`、`BreadcrumbList` | provider 指向 Organization；不因想获得富结果而伪装为 Product |
| Services、Industries、Materials、Surface Finishes 列表 | `CollectionPage`、`BreadcrumbList` | 可加 `ItemList`，但列表项必须真实可见且顺序一致 |
| Industry、Material、Surface Finish 详情 | `WebPage`、`BreadcrumbList` | 没有真实报价、SKU 和库存时不输出 Product 或 Offer |
| Case Study | `Article` 或更保守的 `CreativeWork`、`BreadcrumbList` | 只有具备作者、发布者和日期的编辑型案例才用 Article |
| Blog 文章 | `BlogPosting`、`BreadcrumbList` | headline、image、日期、author、publisher 均来自当前译文与可信事实 |
| About | `AboutPage`、`Organization`、`BreadcrumbList` | 组织事实与首页使用同一 `@id` |
| Contact 或 RFQ | `ContactPage`、`BreadcrumbList` | 不把询盘页伪装为商品；LocalBusiness 仅在真实实体和地点资料确认后使用 |

- FAQ 仅在问题与答案完整显示且符合 Google 当前资格时使用，不承诺富结果。
- 图片、视频、评价、奖项和 aggregateRating 只有可验证、页面可见且符合政策时输出。
- 采用 JSON-LD，并用 Schema.org validator 与 Google Rich Results Test 验证适用类型；语法通过不等于有资格显示富结果。

## 8. 阿拉伯语 RTL

- 阿拉伯语页面根元素必须设置 `lang=ar` 与 `dir=rtl`；其他语言设置 `dir=ltr`。
- CSS 使用 `margin-inline`、`padding-inline`、`inset-inline`、`text-align: start` 和 `text-align: end` 等逻辑属性，禁止把左右写死为业务语义。
- 导航、面包屑、轮播、表单标签、校验提示、步骤方向和方向性图标逐组件验证；品牌 Logo、播放图标、电话、邮箱、URL、型号和代码不机械镜像。
- 混排片段用 `dir=auto`、`bdi` 或明确 LTR 容器隔离，避免数字、括号和标点错序。
- 390、768、1024、1440 四视口均检查阿拉伯语；同时检查长德文、CJK 和印地语断行，不以缩小字体掩盖溢出。

W3C 建议整体 RTL 文档在 html 元素设置 `dir=rtl`，仅在内部结构确需改变基础方向时再局部设置。

## 9. Preview、发布与缓存交互

### 9.1 预览

- Next.js Draft Mode 入口必须校验短时、签名且绑定目标内容与 locale 的 token，然后设置 bypass cookie；不能仅凭公开 id 或 slug 开启。
- 预览 API 使用具备最小读取权限的服务端凭据访问 draft 或 pending；浏览器不持有 WordPress 凭据。
- 预览只解析请求指定的 sibling，不用英语填充未完成译文；页面显著显示 locale、状态和时间。
- 预览响应使用 `Cache-Control: private, no-store`，输出 noindex，并从 canonical、hreflang、Sitemap 和公开 JSON-LD 图中隔离。

### 9.2 缓存失效

发布、更新或下线 webhook 至少携带事件 ID、内容 ID、`translationGroupId`、locale、content type、old public path、new public path、old publication state、new publication state、timestamp 和 signature。

- 内容更新刷新该 sibling 详情、相关列表或导航和其数据 tag。
- 翻译发布、下线或关系改变刷新翻译组所有已公开 sibling，因为每页 hreflang 闭包都会变化。
- slug 改变刷新旧路径、新路径、对应 locale 列表和 Sitemap，并写入重定向事实。
- SEO、OG 或 Schema 字段改变视同页面内容改变。
- Webhook 必须验签、去重、记录结果并可重放；未知 locale 或 status 时 fail closed。

Next.js 官方资料支持 Draft Mode，以及通过 `revalidateTag` 或 `revalidatePath` 做按需刷新；官方建议 CMS 内容使用标签和较长缓存，再由更新事件精确刷新。

## 10. WordPress 多语言机制比较与推荐

| 方案 | 符合点 | 主要缺口与风险 | 许可边界 | 结论 |
|---|---|---|---|---|
| WPML Multilingual CMS 加 WPML GraphQL | 官方 GraphQL 扩展可按语言过滤并读取 translations；支持 CPT、taxonomy、角色、语言对、人工翻译与审核；与 ACFML、WPML SEO 有官方组合 | 组件较多；需验证九语言、ACF、WPGraphQL、Yoast 与当前 WordPress 和 PHP 兼容；必须关闭 fallback 和自动公开 | WPML CMS 或 Agency 为商业许可；WPML GraphQL 与 SEO add-on 的使用依赖合格计划 | **主推荐**，先 PoC 再采购或安装 |
| Polylang Pro | 官方 REST API 提供 `lang` 与 `translations`，支持按语言查询和关联；Pro 支持 REST、译文 slug 与语言权限 | 未找到厂商官方 WPGraphQL 集成作为当前一手证据；GraphQL 主架构会引入非官方桥接或自建 adapter 风险 | REST API、共享或翻译 slug、部分权限能力属于 Pro 商业版 | REST-only 时的明确备选 |
| MultilingualPress | 每语言独立站、内容独立，关系模型清楚 | 强制 WordPress Multisite；九站运维、API 聚合、媒体、用户、配置和缓存复杂度增加；缺失译文默认回首页与本项目契约冲突 | 商业许可，按 Multisite network 激活 | 不推荐本项目 |
| GDHE 自有翻译关系 | 无第三方商业锁定；可完全匹配稳定 group、status 和 API 契约 | 需自建编辑 UI、权限、关系完整性、迁移、SEO 集成和长期维护，超出当前任务 | 无插件采购，但工程成本和回归责任最高 | 仅在商业插件 PoC 失败后立项评估 |

### 推荐落地门

本任务只做架构推荐，不授权安装。后续 CMS foundation 任务必须先：

1. 核实当时的 WordPress、PHP、WPGraphQL、ACF 或 ACF Pro、WPML 和 Yoast 兼容矩阵与许可证条款。
2. 在隔离环境用 Service CPT 做英语、法语、阿拉伯语三语言 PoC，验证独立 draft、pending、publish、译文关联、slug、GraphQL 字段、下线和权限。
3. 验证自动翻译、duplicate 和 fallback 不会绕过人工发布门。
4. 导出可版本化配置，并证明停用或回滚不会破坏源内容；不直接修改第三方插件。

## 11. SEO 机制比较与推荐

| 方案 | Headless 数据能力 | 风险 | 结论 |
|---|---|---|---|
| Yoast SEO、WPML SEO、Next metadata adapter | Yoast 官方 REST 在 WP REST 对象上提供 `yoast_head_json` 和 `yoast_head`，也支持按 URL 查询；WPML SEO 官方用于翻译 SEO 字段；Next.js 原生支持 canonical、alternates、OG、robots 与 Sitemap | 插件生成值可能含 CMS host 或 WordPress permalink；GraphQL 主查询仍可能需要受控 REST 补充；raw JSON 和 Schema 需 allowlist 与 URL 归一化 | **推荐**：WordPress 管编辑字段，Next.js 管最终技术输出 |
| Rank Math headless endpoint | 官方提供 `rankmath/v1/getHead` REST，返回整段 head | 官方明确 GraphQL 非开箱支持；整段 HTML 解析或注入耦合更高 | 不作为基线，可在 PoC 失败时比较 |
| 全自有 SEO fields | 数据契约最小、无 SEO 插件输出冲突 | 需自建编辑体验、fallback、Schema 和验证，编辑辅助较弱 | 可作为 adapter 的稳定内部模型，不优先替代编辑插件 |

受控 adapter 规则：

- 只读取明确允许的 title、description、robots、OG、Twitter 和 Schema 字段；不执行或盲注入插件 HTML。
- canonical、hreflang、`og:url`、公开 host、Sitemap 和 preview robots 永远由前端策略覆盖。
- CMS 返回的 Schema 必须将 URL 和 `@id` 归一化到公开域，并过滤不可验证实体；解析失败必须记录，不能静默输出半截 JSON-LD。
- 不同时启用两个 SEO 插件。Yoast Premium 与任何付费扩展均需单独采购确认；免费版已能提供基础字段与 REST 元数据，但具体版本能力在安装任务重验。

## 12. 验收与自动化检查矩阵

每种代表模板至少验证英、法、阿拉伯三语言；九语言全部跑 URL 和元数据矩阵。

| 场景 | 必须结果 |
|---|---|
| 只有英语发布 | 仅英语 200、自 canonical；无其他语言链接、hreflang 或 Sitemap URL |
| 英、法、日发布 | 三页 canonical 各自引用；三页 hreflang 集合完全一致，含 en、fr、ja、self 和 x-default |
| 德语 draft 或 pending | 德语无公开路由、切换链接、hreflang、Sitemap；预览需授权且 noindex、no-store |
| 法语下线 | 同组所有缓存刷新；所有 sibling 同时移除 fr alternate；法语 Sitemap 记录删除 |
| 日语 slug 改变 | 旧 URL 永久重定向到新日语 URL；canonical、hreflang、Sitemap 全部使用新 URL |
| 阿拉伯语 | lang 为 ar、dir 为 rtl；四视口无溢出，表单、图标、混排通过检查 |
| zh-CN 路径 | 路由使用 `/zh-CN/`；输出 `zh-Hans`；不得生成额外 `/zh-Hans/` 公开副本 |
| CMS 或 API 状态不明 | fail closed，不公开，不缓存为 200 |
| 预发布环境 | 鉴权加全站 noindex，不进入生产 canonical、hreflang 或 Sitemap |
| Schema | 只含页面可见事实；canonical URL 与 `@id` 一致；validator 通过且无虚构 Offer 或 Rating |

建议 CI 与 QA 断言：

- locale allowlist 和 route map 唯一；
- 所有公开页面自 canonical，且使用绝对 HTTPS URL；
- hreflang 返回链、闭包、语言代码和 x-default 正确；
- Sitemap 集合等于公开、indexable、canonical URL 集合；
- 页面 locale、内容 locale、metadata locale、OG locale 和 Schema `inLanguage` 一致；
- 不存在 CMS host 泄漏、英语 fallback 伪装为译文、重复 title 或 description、preview URL 泄漏；
- RTL 组件级截图、键盘顺序和可访问名称通过人工与自动组合检查。

## 13. 待 planner 合并时明确的边界

- 本证据推荐 WPML 与 Yoast 组合，但没有安装授权；所有当前版本、许可和兼容声明在实施任务重验。
- `zh-Hans` 是基于简体中文而非指定国家市场的架构判断；若市场策略要求中国大陆地域定向，应由 planner 或用户明确后记录 ADR。
- 葡萄牙语和西班牙语当前为通用语言，不推定 `pt-BR`、`pt-PT`、`es-ES` 或 `es-419`。
- SEO 插件的 WordPress Sitemap 与 hreflang 输出不能直接成为独立前端权威；后续实现需明确禁用、隔离或不公开提交，避免双源冲突。
- Schema 类型是契约候选，最终字段只有在 GDHE 提供真实品牌、地址、联系方式、作者、案例与媒体事实后启用。

## 14. 官方一手来源

以下资料均于 **2026-07-22** 访问；时间敏感的版本、价格、许可证和兼容性必须在安装任务再次核实。

### 搜索与国际化

- Google Search Central, [Tell Google about localized versions of your page](https://developers.google.com/search/docs/specialty/international/localized-versions) — hreflang 自引用、双向返回、绝对 URL、Sitemap 标注、语言或脚本代码和 `x-default`。
- Google Search Central, [How to specify a canonical URL](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) — 自引用 canonical、hreflang 与同语言 canonical、Sitemap 信号和绝对 URL。
- Google Search Central, [Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) — 绝对 URL、canonical URL、Sitemap 限制与分片。
- Google Search Central, [Robots meta tag specifications](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag) — 页面级 noindex 规则及其可抓取前提。
- Google Search Central, [Introduction to structured data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data) 与 [General structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies) — JSON-LD 推荐、完整准确字段和质量边界。
- Schema.org, [Service](https://schema.org/Service)、[Organization](https://schema.org/Organization)、[BreadcrumbList](https://schema.org/BreadcrumbList) 与 [BlogPosting](https://schema.org/BlogPosting) — 本契约模板类型与属性语义的权威词汇表。
- W3C Internationalization, [Structural markup and right-to-left text in HTML](https://www.w3.org/International/questions/qa-html-dir.en) — 文档级 RTL 应在 html 设置 `dir=rtl`。

### Next.js

- Next.js, [Internationalization](https://nextjs.org/docs/app/guides/internationalization) — sub-path locale、`[lang]` 路由、html lang 与静态参数。
- Next.js, [`generateMetadata`](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) — canonical、language alternates、Open Graph、`metadataBase` 和元数据合并行为。
- Next.js, [Metadata sitemap.xml](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap) — App Router Sitemap 文件约定。
- Next.js, [Draft Mode](https://nextjs.org/docs/app/api-reference/functions/draft-mode) — 预览 bypass cookie 与 draft rendering。
- Next.js, [Revalidating](https://nextjs.org/docs/app/getting-started/revalidating) 与 [`revalidatePath`](https://nextjs.org/docs/app/api-reference/functions/revalidatePath) — CMS 事件驱动 tag 或 path 缓存刷新。

### WordPress、多语言与 SEO

- WordPress.org, [Post Status](https://wordpress.org/documentation/article/post-status/) — `publish`、`draft`、`pending` 和权限审核流程。
- WPML, [WPML GraphQL](https://wpml.org/documentation/related-projects/wpml-graphql/) — 按语言查询、translations、CPT、taxonomy、ACF 组合与所需插件或计划。
- WPML, [Translation Dashboard](https://wpml.org/documentation/translating-your-contents/) 与 [User Roles and Permissions](https://wpml.org/documentation/translating-your-contents/how-to-set-up-local-translators-and-language-pairs/) — 人工翻译、角色和语言对。
- WPML, [Yoast SEO Multilingual](https://wpml.org/documentation/plugins-compatibility/using-wordpress-seo-with-wpml/) — SEO 字段、WPML SEO add-on、许可计划与 multilingual SEO 集成。
- WPML, [Pricing](https://wpml.org/shop/) — WPML 为商业许可且 CMS 与 Agency 计划能力不同；本契约不冻结价格。
- Polylang, [REST API](https://polylang.pro/documentation/support/developers/rest-api/) — Pro REST 的语言过滤、`lang`、`translations` 与语言 endpoint。
- Polylang, [Share slugs across translations](https://polylang.pro/documentation/support/guides/share-the-same-posts-or-terms-url-slugs-across-translations/) 与 [Language capabilities](https://polylang.pro/documentation/support/guides/how-to-manage-language-capabilities-in-polylang-pro/) — Pro slug 与语言权限能力。
- MultilingualPress, [Single-site installation](https://multilingualpress.org/docs/multilingualpress-wordpress-single-site-installation/) 与 [Common questions](https://multilingualpress.org/docs/multilingualpress-3-common-questions-answers/) — 必须 WordPress Multisite，及缺失译文回首页行为。
- Yoast developer portal, [Yoast SEO REST API](https://developer.yoast.com/customization/apis/rest-api/) — `yoast_head`、`yoast_head_json` 和 URL endpoint。
- Yoast, [WPML compatibility](https://yoast.com/help/does-plugin-work-with-wpml/) 与 [features per language](https://yoast.com/help/features-per-language/) — 官方兼容关系、免费或 Premium 与不同语言分析能力边界。
- Rank Math, [Headless CMS support](https://rankmath.com/kb/headless-cms-support/) — REST `getHead`，以及 GraphQL 非开箱支持的官方说明。
