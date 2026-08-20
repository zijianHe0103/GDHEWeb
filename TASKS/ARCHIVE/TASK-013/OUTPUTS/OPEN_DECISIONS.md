# TASK-013 Open Decisions

Planner 按“一次只确认一个业务问题”推进。

## Decision 1 — English primary navigation and Products mega menu

status: `CONFIRMED`
confirmed_at: `2026-07-29T10:22:45Z`
confirmation: 用户回复“可以”。

推荐：

- Products
- Applications
- Resources
- About GDHE
- Contact
- `Request a Quote`（独立主按钮）

Products mega menu：

- Curtain Track Systems
  - Manual Curtain Tracks
  - Motorized Curtain Tracks
  - Medical Curtain Tracks
  - S-Fold / Ripplefold Systems
  - Roman Rods & Special Systems
- Accessories
  - Mounting Brackets
  - End Caps
  - Runners
  - Curtain Tapes
  - Bead Chains
  - Motors & Controls

说明：这是基于 Forest 按系统类型组织全部产品的方式与 GDHE 已确认产品类别形成的 GDHE 草案，不复制 Forest 品牌词或目录成员。

## Decision 2 — Route words and slug policy

status: `CONFIRMED`
confirmed_at: `2026-07-29T14:40:06Z`
confirmation: 用户回复“可以的”。

推荐：

- 产品总入口：`/products/`
- 产品详情 canonical：`/products/{product-slug}/`
- 轨道系统入口：`/products/curtain-track-systems/`
- 轨道子分类：`/products/curtain-track-systems/{subcategory-slug}/`
- 配件目录入口：`/products/accessories/`
- 配件分类：`/products/accessories/{accessory-category-slug}/`
- 系列入口：`/series/{series-slug}/`
- 应用场景入口：`/applications/{application-slug}/`

Slug 规则：

- 只使用小写英语字母、数字和连字符，采用 `kebab-case`。
- 所有公开路径保留开头和结尾 `/`。
- 产品详情 slug 以公开型号为主要来源，不把内部 Article Number 放入 URL。
- `products`、`curtain-track-systems`、`accessories`、`series` 和 `applications` 等固定目录词属于保留词，不能作为产品 slug。
- 产品归属分类、系列或应用发生变化时，canonical 产品 URL 不随之变化。
- 已公开 slug 变更必须保留旧路径到新路径的单跳永久重定向，不静默复用旧 slug。

说明：产品详情采用扁平 canonical，分类、系列和应用只作为发现入口。这样同一产品可以出现在多个目录中，但始终链接到同一个产品详情 URL。

## Decision 3 — Stable primary Breadcrumb trail

status: `CONFIRMED`
confirmed_at: `2026-07-29T14:43:01Z`
confirmation: 用户回复“采用”。

推荐：

- 产品详情固定使用：`Home > Products > Primary Product Group > Primary Subcategory > Product Model`。
- 每个公开产品必须明确指定且只指定一个 `primary category`；它必须属于该产品已经关联的公开分类。
- `primary category` 必须由内容数据明确保存，前端不得根据排序、当前入口或第一个关系自行猜测。
- 产品即使属于多个系列或应用场景，其详情页 Breadcrumb 也保持上述产品分类路径，不随访客入口改变。
- 系列页使用：`Home > Series > Series Name`。
- 应用场景页使用：`Home > Applications > Application Name`。
- 分类页与配件分类页按 Decision 2 已确认的目录层级生成 Breadcrumb。
- Breadcrumb 中间项均链接至对应 canonical hub；最后一项为当前页面，不生成重复产品身份。
- 没有独立 SEO 详情页的小配件只出现在配件目录或关联模块中，不生成虚构的产品详情 Breadcrumb。

说明：该规则保证同一个产品从分类、系列、应用或相关推荐进入时，页面可见 Breadcrumb、`BreadcrumbList` 和 canonical 身份始终一致。

## Decision 4 — RFQ and replacement/contact target routes

status: `CONFIRMED`
confirmed_at: `2026-07-29T14:46:57Z`
confirmation: 用户回复“采用”。

推荐：

- 全站唯一询价工作区：`/request-a-quote/`。
- Header 的 `Request a Quote` 直接进入该询价工作区，可以从空清单开始。
- 正常产品详情页要求客户完成当前页面实际提供的必选项并填写有效数量后，把该产品加入多产品询价清单，并进入或打开 `/request-a-quote/`。如果源数据暂时没有完整可选规格，仍允许以产品身份、已知选项和数量提交，Article Number 可保持未解析。
- 客户可以继续浏览并加入其他产品，最后在同一个询价工作区填写联系信息并一次提交。
- 通用联系页面：`/contact/`。
- 停产产品的 `Contact Us for Replacement` 指向 `/contact/`，同时把原产品稳定身份和公开型号作为表单上下文传递，用于业务员识别替代需求。
- replacement 上下文不创建新的可索引 URL，也不把内部 Article Number 暴露在 URL query 中。
- 停产且暂时没有已确认替代型号时仍使用 `/contact/`，不得自动跳转到猜测的替代产品。
- 不创建 `/cart/`、`/checkout/`、`/buy/` 或在线支付路径；询价清单不代表订单。

说明：`/request-a-quote/` 处理正常多产品询价，`/contact/` 处理通用联系和停产替代咨询，避免建立两套重复表单。

## Decision 5 — Product card navigation and direct RFQ

status: `CONFIRMED`
confirmed_at: `2026-07-29T14:50:59Z`
confirmation: 用户回复“采用”。

推荐采用分层规则：

- 对拥有 canonical 产品详情页的产品，卡片图片、标题和 `View Product` 均进入产品详情页。
- 这类卡片不直接加入询价清单；客户先在详情页查看资料、完成页面实际提供的已知选择并填写数量，再执行 `Request a Quote`。
- 卡片不得根据部分属性猜测 Article Number，也不得自行生成询价行；详情页可以按 Decision 6 提交 Article Number 未解析的产品级询价。
- 对没有独立 SEO 详情页的小配件，卡片不链接到虚构详情页。
- 这类小配件可以在配件目录或相关配件模块中直接加入询价清单，但必须先满足该条目的公开选择要求并填写有效数量。
- 如果小配件只有一个可报价身份且没有其他必选项，只需填写正整数数量即可加入询价清单。
- 布带、线珠、电机与遥控器等拥有详情页或复杂规格的产品继续走详情页，不适用小配件直接加入规则。

说明：该规则避免复杂产品在卡片阶段错误映射 Article Number，同时保证没有独立详情页的小配件仍可独立询价。

## Decision 6 — Fail-closed publication and quoteability

status: `CONFIRMED`
confirmed_at: `2026-07-29T14:57:46Z`
confirmation: 用户确认采用分层发布保护，并补充“只要产品同步到 WordPress，就可以通过 Request a Quote API 询价，即使完整询价规格暂时缺失”。

确认规则：

- 产品首次成功同步到 WordPress 时仍创建草稿，由编辑人员在 `wp-admin` 完善公开内容后手动发布。
- 缺少业务方预制的 `公开保护图` 时，该产品不进入公开产品卡片、产品详情、route manifest 或 Sitemap。
- 不使用无水印内部原图、供应商图片、通用占位图或 AI 生成图替代正式产品图。
- 缺少公开型号、英语名称、主分类或足以识别产品的已确认内容时，同样保持未发布。
- 只要产品已经成功同步到 WordPress，形成可识别的 WordPress 产品记录，并由编辑人员发布为公开状态，就具备 `Request a Quote` 资格；完整规格不是询价资格前置条件。
- 规格或 Article Number 尚不能在网页端唯一解析时，询价行仍可携带稳定产品身份、公开型号、客户已经选择的已知选项、数量和备注提交；Article Number 可以保持未解析。
- 前端和 API 不得猜测不存在的规格组合或 Article Number。业务员收到询价后在飞书中补充判断并完成报价。
- WordPress 草稿、私有或未发布记录仍不对外显示，也不能由匿名访客提交询价。
- 已发布产品的普通同步更新保持公开；同步校验失败保留最后一次成功公开数据，重大身份变化继续进入例外人工审核。
- Local、Preview、Staging 和全部 `TEST_CANDIDATE` 始终 `noindex`，不得进入公开 route aggregation。

说明：发布保护与询价资格是两套门。公开保护图和基本公开内容决定产品能否发布；成功同步且已发布的产品即使规格不完整，也可以提交 B2B 询价，由业务员在飞书中继续解析。

## Decision 7 — TASK-014 test candidates

status: `CONFIRMED`
confirmed_at: `2026-07-29T15:00:45Z`
confirmation: 用户回复“可以”。

推荐使用以下三个本地 `TEST_CANDIDATE`：

1. `FGD X15+PVC / GDHEPRD000172`
   - 验证轨道产品详情、公开型号、6 m 规格、截面尺寸、顶装/墙装说明、相关配件入口和多产品询价。
   - 已有一张业务方预制的 GDHE 公开保护图样本，可用于本地视觉纵切。
2. `SSD-01 / GDHEPRD000692 + GDHEPRD000695`
   - 验证同一型号页面下薄钉/厚钉、宽度、间距、卷长和真实 Article Number 组合。
   - 验证不能生成笛卡尔积，并验证完整规格产品先进入详情页再询价。
3. `PJ-D16 / GDHEPRD000640`
   - 验证电机产品渐进展示：只展示已确认电机信息，遥控器资料缺失时完全省略遥控器模块。
   - 验证资料模块不完整时，已同步且公开的产品仍可提交 `Request a Quote`。

共同边界：

- 三者仍是测试数据，不是最终生产目录或正式发布授权。
- TASK-014 只在 Local/受控测试环境使用，始终 `noindex`，不进入公开 route manifest 或 Sitemap。
- `SSD-01` 和 `PJ-D16` 在进入任何公开环境前仍须取得业务方预制的公开保护图和最终英语内容。
- 候选不满足 10～20 个最终生产产品验收门，也不冻结最终 Article Number 数据。

## Decision 8 — English card summary and key attributes

status: `CONFIRMED`
confirmed_at: `2026-07-29T15:04:56Z`
confirmation: 用户回复“可以”。

推荐采用“统一骨架 + 分类专属最多三项参数”：

所有产品卡片统一显示：

- 公开保护图。
- 公开型号。
- 英语产品名称。
- 一句人工编写的英语短摘要。
- 最多三项分类专属关键参数。
- 必要时显示 `Discontinued` 等公开状态。
- 已确认的 `View Product` 或小配件直接询价动作。

短摘要规则：

- 在 `wp-admin` 中由编辑人员人工编写，建议控制为一句话。
- 不由前端、AI、规格表或原始飞书字段自动拼接。
- 摘要缺失时直接省略，不显示占位文案，也不阻止已经满足其他发布条件的产品询价。

分类专属关键参数建议：

- 轨道：系统类型、截面尺寸 `W × H`、标准/可定制长度。
- 布带：钉子材质、可选宽度、钉距/卷长范围。
- 线珠：珠子类型、间距、卷长。
- 电机与控制：已确认的电机类型、控制方式/协议、兼容系统；缺失项直接省略。
- 小配件：配件类别、材质/颜色、已确认兼容轨道型号摘要。

显示边界：

- 每张卡片最多三项关键参数，完整规格留在详情页或询价选择器。
- 只显示真实存在且允许公开的值，不生成范围之外的组合。
- 多个值过多时显示简洁的 `Multiple options`，不把全部 Article Number 铺在卡片上。
- 卡片不显示价格、成本、MOQ、供应商、库存、内部 Article Number 选择结果或其他内部字段。

说明：统一骨架保证列表整齐，分类专属参数让不同产品保留有用的辨识信息，同时避免卡片变成完整规格表。

## Decision 9 — Production canonical origin

status: `CONFIRMED_AS_DEPLOYMENT_GAP`
confirmed_at: `2026-07-29T15:06:37Z`
confirmation: 用户回复“暂未确定”。

如果正式官网域名尚未确定，推荐：

- 本任务把生产 canonical origin 标记为 `DEPLOYMENT_GAP`，不虚构或写死示例域名。
- Next.js 未来通过受控环境变量 `PUBLIC_SITE_ORIGIN` 取得生产 origin。
- Local 使用本地测试 origin，Preview/Staging 使用各自受控 HTTPS origin，但全部保持 `noindex`。
- WordPress 后台域名、CMS REST 域名、Local、Preview 或 Staging 域名均不得成为生产 canonical。
- 正式部署前必须由用户确认唯一 HTTPS 官网 origin；canonical、Open Graph URL、Sitemap、站内绝对链接和未来 hreflang 必须使用同一来源。
- origin 变更属于部署与 SEO 迁移事项，必须单独处理 redirect、Sitemap 和 Search Console，不在 TASK-013 静默修改。

如果域名已经确定，需要用户提供完整形式，例如 `https://www.example.com`，再将其冻结为生产 canonical origin。

## Decision status

Decision 1–9 均已取得用户回答。Decision 9 不包含虚构域名，其确认结果是保留一个必须在正式部署前关闭的 `DEPLOYMENT_GAP`。
