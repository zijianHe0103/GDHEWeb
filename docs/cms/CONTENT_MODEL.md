# CMS content model

Content Schema: `3.0.0`
Module Schema: `1.0.0`

## Public content

| Type | Canonical path | Purpose |
|---|---|---|
| Native `page` | explicitly stored | Home, hubs, company, contact and curated landing pages |
| Native `post` | `/news/{slug}/` | News and editorial content |
| `product` | `/products/{slug}/` | Product and system detail |
| `market` | `/markets/{slug}/` | Market/application solution |
| `reference` | `/references/{slug}/` | Project/reference story |
| `support_article` | `/support/{topic}/{slug}/` | Technical support and instructions |
| `download` | `/downloads/{slug}/` | Public document metadata and file |

`site_settings` remains internal and has no public route.

## Taxonomies

| Taxonomy | Object |
|---|---|
| `product_category` | `product` |
| `product_series` | `product` |
| `installation_type` | `product` |
| `support_topic` | `support_article` |
| `document_type` | `download` |

Markets remain editorial content rather than a product taxonomy.

## GDHE product vocabulary

- `钉子规格`：布带产品中客户可以选择的钉子类型。当前已验证样本 `SSD-01` 区分“薄不锈钢钉”和“厚不锈钢钉”；两者材质均为不锈钢，因此公开名称不能只写“不锈钢材质”，也不能沿用未经确认的“全不锈/半不锈”。
- `配件目录`：集中展示并筛选安装码、封口、走珠等小配件的集合。目录配件可以形成独立询价行，也可以出现在主产品的相关配件模块，但不因此自动获得独立 SEO 产品详情页；规格复杂的布带、线珠等产品不属于该边界。
- `测试产品数据`：仅用于验证页面归组、规格组合、询价和同步行为的非最终数据。它可以证明模型和流程行为，不能作为生产目录、最终兼容关系或公开发布事实。

## Common and structured fields

Every public record uses the common Schema 3 fields:

- `schema_version`, `template_key`, `summary`, `hero`
- `relationships` with only `products`, `markets`, `references`, `support_articles`, `downloads`
- up to 20 controlled modules from the existing seven-layout Module Schema

Product details are structured, not a free-form specification blob:

- model and product code
- positioning and bounded feature list
- ordered specifications with key, label, value and optional unit
- article/order numbers with region
- colors/finishes
- installation and operating/control information
- compatibility
- gallery, HTTPS video and strict inquiry CTA

Market details include benefits, requirements and CTA. Reference details include location, challenge, CMS-sanitized solution HTML, results and CTA. Support details include one support topic, problem/goal, CMS-sanitized instructions and optional HTTPS video. Download details include one document type, version, issue date, locale `en`, a public file DTO and description.

Relations supply bidirectional consumption. General Schema 3 relation references appear publicly only when they are published, viewable, carry a UUIDv4 public identifier, have a valid unique canonical path and satisfy the complete Schema 3 envelope. The independent TASK-023 related-product projection reads only `relationships.products` in stored order, caps the raw source set at 20, and then requires every returned target to satisfy the complete ProductCard `1.0.0` contract. It omits self, duplicates, unpublished/ineligible targets and hostile media. Active catalog accessories additionally require an explicit closed direct-quote quantity unit; no compatibility or unit is inferred.

TASK-025 adds no editable content type or database table. It uses the existing
Product Configuration `2.0.0` private mirror for configured products, a closed
private catalog-accessory quote mirror, and repeatable
`_gdhe_public_article_number_v1` post-meta values as a lookup index. The source
mirror remains authority; the index must match it exactly and globally unique
Article Number ownership is required before public quote validation succeeds.

## Publication and safety

- Anonymous output is English and published-only.
- Template keys are `standard`, `product`, `market`, `reference`, `support_article` and `download`.
- Templates are paired to public types: Page/Post use `standard`; Product, Market, Reference, Support Article and Download use their matching template keys. Unknown and known-but-mismatched templates fail closed, as do invalid modules, paths, identifiers, relations, media and files.
- Public WYSIWYG values are emitted only as `safeHtml` after the GDHE `wp_kses` allowlist.
- Public IDs are UUIDv4. WordPress post, attachment and term IDs are internal.
- Navigation is curated; content types and taxonomies do not automatically become menu truth.

## Legacy migration

The A3 inventory found no real Schema 2 business content. One empty `service` auto-draft is preserved as ephemeral and is not migrated.

For any future non-zero legacy inventory:

- `industry` may map to `market`.
- `case_study` may map to `reference`.
- `service` maps to `product` only with explicit `product` and `confirmed` classification markers.
- `material`, `surface_finish`, `testimonial` and every unclassified record remain ambiguous and are refused.

`gdhe a3-migrate` supports read-only inventory/dry-run and explicit-ID apply/rollback. Apply stores an exact post/meta/term-relationship snapshot and reads back the target type, Schema version, canonical path, matching template, all five remapped relation arrays and marker. Any write/read-back failure restores and verifies the complete snapshot, including removal of partial marker and backup meta. Repeated apply and rollback are idempotent.
