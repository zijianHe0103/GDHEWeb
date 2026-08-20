# TASK-013 Localization / SEO Read-only Audit

审计日期：2026-07-29

Lane：`localization_seo`

消息：`MSG-TASK-013-A2-LOCALIZATION-SEO-READONLY-AUDIT`

结论：**FEASIBLE_WITH_ENTRY_GATES**

本审计只冻结供 Planner 综合的英语 SEO 与页面状态边界，不实现 Metadata、页面、CMS、Schema、API、插件、多语言或部署。

## 1. 审计结论

TASK-013 可以冻结足以进入 TASK-014 的最小英语 `SeoDocument` 和页面状态合同，但必须明确区分：

1. **当前技术事实**：Schema 3 已有英语 locale、canonical public path、title、excerpt、featured media、媒体 alt/decorative、发布时间和 route manifest 基础。
2. **TASK-013 待冻结域合同**：Next.js 消费的 normalized `SeoDocument`、稳定 Breadcrumb、robots 状态、OG、JSON-LD 白名单和页面生命周期。
3. **当前缺口**：Page Schema 3 不含 `seo`、停产/替代或页面 indexability；媒体合同不证明图片是 `公开保护图`，也不强制 decorative/alt 条件关系。
4. **TASK-014 技术 SEO**：可在首个正式英语纵向切片中实现并验证 metadata/status rendering，但测试候选、Local、Preview 和 Staging 必须 `noindex`，不能因技术标签完整而获得生产索引资格。
5. **延期范围**：最终关键词、正式 SEO 文案、市场内容和所有未来语言仍属于内容 SEO / 多语言成熟度门。

## 2. 已核查的权威输入

- `TASKS/ACTIVE/TASK-013-english-ia-url-cta-card-seo-contract.md`
- `TASKS/ARCHIVE/TASK-013/OUTPUTS/DESIGN.md`
- `TASKS/ARCHIVE/TASK-013/TASK.md`
- `MEMORY/DECISIONS/ADR-006-product-first-roadmap-and-multilingual-maturity-gate.md`
- `docs/architecture/headless-wordpress-nextjs-contract.md` 第 7 节和第 14 节
- `TASKS/ARCHIVE/TASK-012/OUTPUTS/REAL_PRODUCT_VALIDATION_GATE.md`
- CMS 权威 Schema 3、route manifest、collection、media、error 和 public path 合同
- frontend 当前 16-Schema `/resolve` snapshot、server-only Adapter、英语 resolve URL 与 App Router 页面事实
- 本文第 11 节列出的当前官方一手资料

## 3. 当前英语合同事实

| 领域 | 当前事实 | 不能据此宣称 |
|---|---|---|
| locale | Page、collection、navigation、route manifest 和 download 均固定 `en` | 未来 locale 已实现或可从请求动态切换 |
| public path | `public-path.schema.json` 只接受 `/` 或小写 ASCII slug 分段并保留尾斜杠 | 公开 origin、最终 IA 和 slug 已冻结 |
| page | Page Schema 3 有 `title`、可选 `excerpt`、`featuredMedia`、`publishedAt`、`modifiedAt` | 已有 normalized SEO、robots 或生命周期状态 |
| media | `id/url/mimeType/width/height/alt/decorative` 必填 | 已证明是公开保护图，或 alt/decorative 组合一定有效 |
| publication | 匿名 `/resolve` 对 draft/private 等返回 404；当前 Adapter 只消费已验证 payload | 停产、替代、撤销发布资格已经可表达 |
| route manifest | 英语公开 route 有 `id/type/publicPath/modifiedAt` | route 自带 indexability、redirect 或 SEO 字段 |
| frontend | 根布局是英语 placeholder metadata；技术页为 `noindex,nofollow` | 正式模板 SEO 已实现 |
| locales | resolve 请求固定 `locale=en`，非英语 locale 负例失败 | 可构造非英语 URL、alternate 或 hreflang |

## 4. 最小英语 `SeoDocument`

`SeoDocument` 是 Next.js server-only 归一化域对象，不等同于原始 WordPress/SCF JSON，也不要求 CMS 使用同名字段。它必须在 Metadata、可见 Breadcrumb 和 JSON-LD 渲染前通过运行时校验。

```ts
type EnglishSeoDocument = {
  locale: "en";
  canonicalPath: CanonicalPublicPath;
  title: string;
  description: string;
  robots: "index,follow" | "noindex,nofollow";
  openGraph: {
    title: string;
    description: string;
    urlPath: CanonicalPublicPath;
    type: "website";
    image: {
      url: string;
      width: number;
      height: number;
      alt: string;
    } | null;
  };
  breadcrumbs: readonly {
    label: string;
    publicPath: CanonicalPublicPath;
  }[];
  jsonLd: {
    webPage: AllowedWebPageInput;
    breadcrumbList: AllowedBreadcrumbInput;
    product: AllowedProductInput | null;
  };
};
```

这是合同形状，不是 TASK-013 的代码实现。

### 4.1 字段责任和缺省规则

| 字段 | 最小来源 | 合同规则 | 缺失行为 |
|---|---|---|---|
| `locale` | 已验证 Page locale | 只接受字面量 `en` | 非 `en` fail closed，不回退英语 |
| `canonicalPath` | 已验证 Page `publicPath` + TASK-013 URL Map | 与当前页面 canonical 身份一致，无 query/fragment | 不生成 indexable 页面 |
| `title` | WordPress 英语 SEO title；TASK-014 测试候选可用明确测试值 | 非空、页面唯一；公开生产值需内容审核 | 测试页 noindex；生产页阻止公开 |
| `description` | WordPress 英语 SEO description；明确批准时可由高质量 excerpt 初始化 | 必须准确描述可见页面；OG 默认复用 | 不以空串、关键词堆砌或参考站文案填充 |
| `robots` | 页面状态机 | 只能由状态映射产生，编辑文本不能覆盖 | unknown 状态 fail closed |
| `openGraph.title/description` | 默认复用 SEO title/description | 允许未来独立编辑，但不得为空 | 复用已审核值 |
| `openGraph.urlPath` | `canonicalPath` | 必须完全相同 | 不渲染冲突 URL |
| `openGraph.type` | 模板映射 | TASK-014 最小固定 `website` | 不接受 CMS 任意字符串 |
| `openGraph.image` | 已通过公开媒体门的非装饰图片 | 只接受公开保护图、公开 HTTPS URL、真实尺寸、非空英语 alt | 省略 OG image；不得使用内部原图或 filename fallback |
| `breadcrumbs` | 冻结 IA + 当前 canonical page | 稳定、非空、顺序确定，最后一项等于当前 canonical | 页面不能进入 indexable 完成态 |
| `jsonLd` | 本文白名单映射 | 由 typed data 生成，不接收 HTML/JSON blob | 省略不具备证据的类型/属性 |

绝对 canonical 和 `og:url` 由受控 `PUBLIC_SITE_ORIGIN + canonicalPath` 组成。生产 origin 未确认前，TASK-013 只冻结 path 与生成责任；不得把示例域名、CMS origin、Local 或 Staging origin 写成生产 canonical。

## 5. Canonical path 和多入口产品身份

- 每个产品只有一个 canonical detail path；Article Number、系列、应用、分类、筛选和 referral query 不产生第二个产品 canonical。
- 分类、系列和应用页面是发现入口，所有产品卡片链接回同一 canonical path。
- canonical 为绝对 HTTPS self-reference；HTML canonical、OG URL、站内链接、route manifest 和未来 Sitemap 必须使用同一路径事实源。
- Breadcrumb 不随访客从哪个系列/应用入口进入而改变。产品页使用 TASK-013 冻结的稳定 primary IA trail。
- 如果 primary IA 尚未冻结，TASK-014 可以验证 noindex 测试页面，但不能宣称 indexable 产品模板完成。
- slug 变更属于 URL 生命周期：只有已批准旧→新映射才单跳永久 redirect；停产或替代产品不因存在替代项而改变 canonical 或自动 redirect。

## 6. Robots 与页面状态合同

| 归一化状态 | HTTP/页面行为 | robots | Canonical / OG / JSON-LD | 公开集合 |
|---|---|---|---|---|
| `PUBLIC_ACTIVE` | 200，正常产品内容 | `index,follow` | 完整 self-canonical；允许白名单输出 | 可进入 route manifest / Sitemap |
| `PUBLIC_DISCONTINUED` | 200，保留原 URL，显示 `Discontinued` 和替代联系 CTA | `index,follow` | 保留自身 canonical；替代产品只是可见链接 | 保留公开集合 |
| `PUBLIC_NO_QUOTABLE_VARIANT` | 200 仅在页面仍有真实独立信息价值时；不显示无效 RFQ | `index,follow` 需内容责任人确认，否则 `noindex,nofollow` | 不伪造 Offer/库存；canonical 保持自身 | 按最终 indexability 决定 |
| `TEST_CANDIDATE` | TASK-014 Local / 受控 Staging 测试页面 | `noindex,nofollow` | 可渲染技术形状，但不得进入生产 Sitemap | 排除 |
| `PREVIEW` | 身份保护、Draft Mode、`private,no-store` | `noindex,nofollow` | 不进入公开 SEO 聚合 | 排除 |
| `UNPUBLISHED` | draft/private/尚未人工发布 | 404 | 不渲染页面级 canonical/OG/Product JSON-LD | 排除 |
| `WITHDRAWN` | 撤回决定已生效 | 404；明确永久删除政策才可 410 | 移除公开 SEO 输出 | 排除 |
| `NOT_FOUND` | 未知 canonical path | 404 | 使用站点级 404 metadata，不伪装产品页 | 排除 |
| `MOVED` | 有批准的新 canonical path | 单跳永久 redirect | 目标页输出目标 canonical | 只保留目标 |
| `INVALID_OR_UPSTREAM_FAILURE` | 合同错误、timeout、429/5xx 不得伪装 404；使用最后成功公开页或真实 5xx | 不生成新的可索引错误内容 | 不用无效新值覆盖最后成功 SEO | 不更新公开集合 |

### 必须由 Planner 保留的业务分叉

`PUBLIC_NO_QUOTABLE_VARIANT` 是否继续索引取决于页面是否仍提供真实产品资料、下载、替代或支持价值；TASK-013 不能把所有此类页面统一假设为薄内容。若 TASK-014 候选触发此状态，应先取得用户/内容责任人确认。

撤销飞书“允许发布”属于例外审核，不等同于自动 404。只有受控工作流形成最终 `WITHDRAWN` 公开状态后，Next.js 才移除页面。审核期间保持最后一次成功公开事实，避免半更新。

## 7. Breadcrumb / `BreadcrumbList`

- 可见 Breadcrumb 与 JSON-LD `BreadcrumbList` 必须从同一个 typed item 数组生成。
- 每项至少有英语 `label` 和 canonical `publicPath`；JSON-LD position 从 1 连续递增。
- 第一项为 Home `/`；最后一项必须是当前页面标题和 canonical path。
- 分类/系列/应用多入口不允许按 referer 或 query 改写产品页 Breadcrumb。
- Breadcrumb 中间节点必须是真实公开、可访问的 IA 页面；不得为尚未实现的 taxonomy 构造假链接。
- 若中间 IA 页面尚未获批，TASK-014 测试页保持 noindex，并把 Breadcrumb 缺口反馈给 Planner。

## 8. 公开保护图与 Alt

### 8.1 公开媒体资格

OG、Schema 和产品 Hero 只能使用：

- 业务方在上传前制作的 `公开保护图`；
- 已进入 WordPress 公开媒体链路的成品；
- 公开 HTTPS URL、真实 MIME、宽高；
- 不含内部无水印原图引用、隐藏 URL、构建副本或缓存副本。

现有 `MediaReference` 没有可机器验证的 `public_protected` 字段。TASK-013 必须在 GAP_REPORT 标为 `FOLLOW_UP_TASK_REQUIRED` 或冻结由受控媒体入口保证的明确前置断言；TASK-014 不得仅凭 URL 存在推断图片已获公开资格。

### 8.2 Alt 条件

- `decorative: true` 时 `alt` 必须是空字符串，且该图片不能作为 OG image 或 Product image。
- `decorative: false` 时 `alt` 必须是经英语内容责任人确认的非空、上下文准确描述；不得使用文件名、内部型号串或关键词堆砌作为机械 fallback。
- 含可见型号/尺寸标注的保护图，alt 描述产品与必要的图像目的；不必逐字抄写所有水印。
- primary product image 缺少有效 alt 时，该图片 fail closed。不得把空 alt 的信息图公开，也不得让 JSON-LD/OG 绕过同一媒体门。
- TASK-014 可以使用明确 `TEST_CANDIDATE` alt 验证渲染，但页面保持 noindex；这不等于生产内容审核完成。

## 9. 允许的 JSON-LD 输入

Next.js 只能从白名单 typed input 生成 JSON-LD，不接收 CMS 提供的任意 JSON 字符串、HTML blob、脚本或未知属性。

### TASK-014 必需

1. `WebPage`
   - `name`：已验证 SEO title 或页面 title。
   - `description`：与可见内容一致的英语 description。
   - `url`：绝对 self-canonical。
   - `inLanguage`：固定 `en`。
   - `primaryImageOfPage`：仅在公开保护图媒体门通过时输出。
2. `BreadcrumbList`
   - 只从可见 Breadcrumb 的同一 items 生成。

### 条件允许的 `Product`

只在 canonical 产品详情页、单一产品身份和可见页面事实成立时允许：

- `name`
- `description`
- `url`
- `image`（仅公开保护图）
- `brand`（仅品牌事实已确认）
- `model`（仅公开型号）

以下输入不进入 TASK-014 最小合同：

- `Offer`、价格、库存、配送、结算或支付；
- `AggregateRating`、`Review`、伪造认证；
- 不可见 FAQ；
- 内部成本、供应商、利润、库存、备注或审核字段；
- 把多个 Article Number 塞入单一 `sku`，或为不存在的属性组合生成 variant；
- 任意 CMS JSON-LD blob。

Google 的 Product rich-result eligibility 对 `Offer` / `Review` / `AggregateRating` 有额外要求。GDHE 当前是 B2B quotation request 而非直接购买，TASK-014 不应为了富结果虚构价格、Offer、评分或库存。多 Article Number / variant 的 Product Schema 映射在真实生产数据门和专门验证前保持延期。

## 10. TASK-014、内容 SEO 与多语言成熟度门

### 10.1 TASK-014 必需的技术 SEO

- server-only normalized `SeoDocument` validation；
- 根据页面状态返回正确 200 / 404 / redirect / 5xx 或最后成功页；
- Metadata title、description、absolute self-canonical、robots、OG；
- `<html lang="en">`；
- visible Breadcrumb 与 `BreadcrumbList` 同源；
- JSON-LD 白名单序列化和注入安全；
- 公开保护图/alt/decorative 条件门；
- 不把测试候选或 Staging 加入 Sitemap / route aggregation；
- rendered HTML、status、canonical、robots、OG、JSON-LD 和 alt 的自动化测试；
- 非英语路径、locale 参数和 alternate 输出均为零。

### 10.2 不属于 TASK-014 完成门的内容 SEO

- 最终关键词研究与搜索意图；
- 正式 production title、description、H1 和产品营销正文；
- 市场文章、案例、FAQ、内部链接策略和发布频率；
- 最终 OG 选图和每张生产图片的编辑复核；
- Search Console 表现或排名承诺。

TASK-014 可以用明确标记的测试候选证明技术合同，但不得把测试文案或测试媒体升级为生产 SEO 事实。

### 10.3 不属于 TASK-013 / TASK-014 的多语言成熟度门

- 不创建 `/fr/`、`/de/`、`/es/`、`/zh-CN/`、`/ar/`、`/hi/`、`/ja/`、`/pt/`；
- 不渲染 language switcher；
- 不输出 hreflang、`x-default` 或非英语 Sitemap alternate；
- 不安装或采购 WPML/ACFML，不执行翻译；
- 不从未知/未来 locale 回退到英语页面；
- 不预设 translated slug、translation group 或 RTL 内容。

未来语言必须继续通过 ADR-006 的 PoC 进入门和生产成熟度门；当前英语 `SeoDocument` 不添加未使用的 locale map 或 sibling 占位。

## 11. 进入 TASK-014 前的门和缺口

| 条目 | 分类 | TASK-014 进入要求 |
|---|---|---|
| normalized `SeoDocument` 形状与状态枚举 | TASK-013 contract | Planner 在 `SEO_MINIMUM_CONTRACT.md` 冻结 |
| canonical path / stable Breadcrumb | TASK-013 contract | URL Map 与 primary IA trail 一致 |
| title/description 测试输入 | TEST_CANDIDATE | 明确标记，页面 noindex |
| production title/description | CONTENT_GAP | 不阻止本地纵切，但阻止生产索引 |
| `public_protected` 媒体资格可验证性 | FOLLOW_UP_TASK_REQUIRED | 冻结媒体入口断言或独立 Schema/API 缺口 |
| decorative/alt 条件 | FOLLOW_UP_TASK_REQUIRED | TASK-014 validator/adapter 必须 fail closed；若需要改变权威 Schema，另建任务 |
| discontinued/replacement 表达 | FOLLOW_UP_TASK_REQUIRED | 当前 Schema 3 不表达；不得在 TASK-014 猜测 |
| public origin | DEPLOYMENT_GAP | 本地用受控测试 origin；阻止生产 canonical |
| Product variant JSON-LD | PRODUCTION_DATA_GATE | 等待 10～20 个最终生产产品和专门验证 |
| future locale / hreflang | MULTILINGUAL_MATURITY_GATE | 严格延期 |

## 12. 官方一手资料

全部访问日期：**2026-07-29**。

- Google canonical：<https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls>
- Google robots meta / X-Robots-Tag：<https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag>
- Google Breadcrumb structured data：<https://developers.google.com/search/docs/appearance/structured-data/breadcrumb>
- Google structured data guidelines：<https://developers.google.com/search/docs/appearance/structured-data/sd-policies>
- Google Product structured data：<https://developers.google.com/search/docs/appearance/structured-data/product>
- Google Product snippet requirements：<https://developers.google.com/search/docs/appearance/structured-data/product-snippet>
- Google image / alt guidance：<https://developers.google.com/search/docs/appearance/google-images>
- Google localized versions / hreflang：<https://developers.google.com/search/docs/specialty/international/localized-versions>
- Next.js `generateMetadata`：<https://nextjs.org/docs/app/api-reference/functions/generate-metadata>
- Open Graph protocol：<https://ogp.me/>

## 13. Lane 完成边界

- 本文是 Planner 综合 TASK-013 合同的专业只读证据，不是独立 review 或用户验收。
- 未修改产品代码、CMS、Schema、API、数据库、插件、架构契约、活动任务或其他 authority 文档。
- 未实现 SEO、页面、翻译、采购、安装、部署、提交、推送、合并、验收或关闭任务。
