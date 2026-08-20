# TASK-014 Design

status: `DESIGN_CHECKPOINT`

## 1. Outcome

本任务只增加一套英语 `ProductCard` collection CMS/API/Schema 合同基础，使未来前端能够用一次请求取得 0、1 或 N 张可渲染卡片。既有 Schema 3 `/resolve`、`/collection/{type}`、navigation 与 route-manifest 保持不变。

本任务不建立前端消费者、可见页面、`SeoDocument`、RFQ 写入、飞书同步或生产产品目录。

## 2. Authority

1. `TASKS/ARCHIVE/TASK-013/OUTPUTS/PRODUCT_CARD_PROJECTION.md`
2. `TASKS/ARCHIVE/TASK-013/EVIDENCE/GAP_REPORT.md`
3. TASK-012 已确认的产品身份、公开媒体、停产、询价和测试数据边界
4. 当前 GDHE Site 0.4.2 / Content Schema 3.0.0 / REST API 1 的实际代码与本地运行基线

任何未被以上权威确认的 ProductCard 值都不得由实现推测。

## 3. Additive public contract

### Route

新增只读匿名接口：

```text
GET /wp-json/gdhe/v1/product-cards
```

允许的查询参数：

- `locale=en`，省略时仍为 `en`；
- `schema=1.0.0`，省略时仍为 `1.0.0`；
- `page`，整数且至少为 1；
- `per_page`，整数 1～100；
- `sort=modified_desc|title_asc`；
- `filter=product_category:<slug>` 或省略。

其他 locale、Schema、排序、筛选和分页值 fail closed，返回既有规范化错误 envelope。接口不接受 WordPress ID、Article Number、任意 meta key 或任意 taxonomy 查询。

### Envelope

新增封闭 Draft 2020-12 Schema：

```text
product-card-collection.v1.schema.json
```

响应顶层固定为：

- `apiVersion: "1"`
- `schemaVersion: "1.0.0"`
- `locale: "en"`
- `type: "product_card"`
- `sort`
- `filter`
- `page`
- `perPage`
- `total`
- `totalPages`
- `items`

`additionalProperties` 在顶层与所有嵌套对象均为 `false`。`items` 一次携带完整卡片，不提供逐卡 `/resolve` 提示或 WordPress origin。

### Schema closure

新增 closure 计划为：

- `product-card-collection.v1.schema.json`
- `product-card.v1.schema.json`
- `public-protected-media.v1.schema.json`
- `public-taxonomy-ref.v1.schema.json`
- `card-attribute.v1.schema.json`
- `card-action.v1.schema.json`

复用既有：

- `uuid-v4.schema.json`
- `public-path.schema.json`

该 closure 独立版本化；不得修改现有 `collection.v3.schema.json` 或改变既有 19-file CMS graph 的内容与校验结果。插件 manifest 只以新增键登记新 route 和 Schema，不将 Content Schema 3.0.0 改写为新的 breaking version。

## 4. ProductCard public shape

每个 item 精确包含：

- `id`
- `kind`
- `model`
- `name`
- `publicPath`
- `image`
- `primaryCategory`
- `series`
- `applications`
- `summary`
- `keyAttributes`
- `lifecycle`
- `action`
- `modifiedAt`

字段类型、可空性和枚举以 TASK-013 冻结合同为准。额外字段、原始字段容器和任意 attribute bag 均拒绝。

## 5. Source mapping

本任务不新增长期 SCF 编辑字段。为建立机器合同和可逆 Fixture，插件使用一个未公开、未注册到通用 REST、不可被前端读取的版本化内部 source document：

```text
_gdhe_product_card_v1_source
```

它只承载当前合同无法从既有 Schema 3 明确得到、且禁止推测的输入：

- `sourceClass: test_candidate|production`
- `websiteEligible`
- `kind`
- `lifecycle`
- 业务预制保护图的规范化公开引用及保护确认
- 显式 primary category 公开引用和筛选 slug
- 已确认且可链接的 series/application 引用
- 0～3 个已批准 key attributes

现有权威字段继续复用：

| Public field | Source |
|---|---|
| `id` | 既有稳定 `_gdhe_public_id`；不得回退为 post ID |
| `model` | 既有 `product_details.model` |
| `name` | 已发布英语 `post_title` |
| `publicPath` | detail product 使用既有 canonical `_gdhe_public_path`；catalog accessory 强制 `null` |
| `summary` | 既有人工英语 `summary`，缺失输出 `null` |
| `modifiedAt` | WordPress `post_modified_gmt` 规范化为 ISO timestamp |
| `action` | 只由已确认的 `kind + lifecycle + publicPath` 矩阵派生，不允许编辑覆盖 |

内部 source document 可以被本任务 Fixture 和未来另行授权的同步/编辑映射写入，但它不是 wp-admin 最终编辑体验，也不授权生产导入。未来如需新增长期 SCF 编辑界面，必须单独确认。

## 6. Eligibility and fail-closed rules

一个项目只有同时满足以下条件才计入 `total` 并进入 `items`：

- post type 为 `product` 且 WordPress status 为 `publish`；
- 稳定 public UUID、英语 model/name 和 modified time 合法；
- source document 版本、`websiteEligible`、kind 和 lifecycle 合法；
- image 为显式保护成品图，具有稳定 UUID、HTTPS URL、正整数尺寸和非空 Alt；
- primary category 为显式完整的公开引用；
- detail product 有合法 canonical path；
- catalog accessory 的 public path 为 `null`；
- series/application 目标全部经过公开可链接资格过滤；
- key attributes 为批准结构且不超过 3；
- 派生 action 与四格矩阵完全一致。

无效项整体排除，不能返回半张卡、占位图或猜测值。`total` 在全部资格检查和筛选完成后计算。

`test_candidate` 只允许在 `WP_ENVIRONMENT_TYPE=local` 的本地 Fixture 运行中进入该接口；非 local 环境必须排除。它不生成 SEO、Sitemap、hreflang 或生产发布资格。

## 7. Four action matrix

| kind | lifecycle | action |
|---|---|---|
| `detail_product` | `active` | `view_product`，target 为该 canonical path |
| `detail_product` | `discontinued` | `view_product`，target 为保留的 canonical path |
| `catalog_accessory` | `active` | `direct_rfq`，target `/request-a-quote/` |
| `catalog_accessory` | `discontinued` | `replacement_contact`，target `/contact/` |

响应中的 action 只能由服务端派生。source document 中出现 action 字段应判为无效输入，防止内容源覆盖业务规则。

## 8. Fixture design

TASK-014 使用独立版本、独立 option 和独立 marker，不复用或污染 A3 Fixture：

- 至少四个合法 item 覆盖四格 action；
- 一个合法 category landing route，供 primary category linkability 验证；
- 缺图、未确认保护图、缺主分类、无 UUID、错误 kind/lifecycle、detail 无 path、accessory 带 path、超过 3 个 attributes、未公开记录等负例；
- 分页证明 0/1/N；
- 排序与 `total` 稳定；
- 内部字段泄漏扫描；
- cleanup 精确删除本任务创建的 post、term、attachment/temporary media、option 和 marker。

运行前必须创建新的不可变数据库备份；测试后必须证明 TASK-014、A3 Fixture 和迁移 marker 均为零残留。Fixture 是 `TEST_CANDIDATE/noindex`，不是 GDHE 正式产品。

## 9. Handoff

实现完成后生成：

- ProductCard closure 精确文件清单；
- 每个文件 SHA-256；
- Golden 与 negative fixture 清单；
- route/query/error 说明；
- 前端下一任务必须保持的 `one collection request / zero per-card resolve` 边界。

frontend lane 在本任务中只读审计该 handoff；不得修改 `frontend/**`。

## 10. Stop conditions

立即停止并交回 Planner：

- 需要新增长期 SCF 编辑字段；
- 需要改变真实产品、型号或 Article Number 身份；
- 需要修改既有 Schema 3 公开语义或删除/重命名旧 route；
- 需要真实飞书数据、生产媒体、域名、部署或前端代码；
- 无法在不猜测业务值的情况下构造合法卡片。
