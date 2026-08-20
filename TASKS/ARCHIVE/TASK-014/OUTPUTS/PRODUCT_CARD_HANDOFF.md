# TASK-014 ProductCard Handoff

status: `CMS_CONTRACT_READY_FOR_INDEPENDENT_AUDIT`

## Frozen identifiers

- REST API: `1`
- Content Schema: `3.0.0` unchanged
- ProductCard Schema: `1.0.0`
- Fixture: `TASK-014-PRODUCT-CARD-1`
- Endpoint: `/wp-json/gdhe/v1/product-cards`

## Consumer invariant

```text
one ProductCard collection request
-> one closed envelope validation
-> one adaptation pass
-> ProductCard[]
-> zero per-card /resolve requests
```

The future frontend consumer must use a server-only WordPress origin. It must not expose the origin or credentials to the browser and must not read raw Core REST, meta, ACF or SCF fields.

## Exact Schema closure

1. `card-action.v1.schema.json`
2. `card-attribute.v1.schema.json`
3. `product-card-collection.v1.schema.json`
4. `product-card.v1.schema.json`
5. `public-path.schema.json`
6. `public-protected-media.v1.schema.json`
7. `public-taxonomy-ref.v1.schema.json`
8. `uuid-v4.schema.json`

Exact repository-relative paths and SHA-256 values are frozen in `PRODUCT_CARD_HANDOFF_MANIFEST.json` and `PRODUCT_CARD_HANDOFF_CHECKSUMS.sha256`.

## Query contract

| Parameter | Allowed |
|---|---|
| `locale` | `en`, default `en` |
| `schema` | `1.0.0`, default `1.0.0` |
| `page` | decimal integer at least 1 whose native value and pagination offset are safe |
| `per_page` | integer 1 to 100 |
| `sort` | `modified_desc` or `title_asc` |
| `filter` | omitted or `product_category:<slug>` |

Unknown parameters and all other values fail closed through the normalized error envelope.

## Public item

Every item is closed and contains only:

`id`, `kind`, `model`, `name`, `publicPath`, `image`, `primaryCategory`, `series`, `applications`, `summary`, `keyAttributes`, `lifecycle`, `action`, `modifiedAt`.

No WordPress/database/attachment IDs, raw field containers, Feishu identifiers, internal Article Number resolution, supplier/cost/price data or internal media paths are public.

Every `primaryCategory`, `series` and `applications` reference is identity-bound: its `id` must exactly equal the stable public UUID of the unique content target resolved from `publicPath`. A valid but different UUID fails closed; a consumer may safely use the pair for cache identity, deduplication and navigation.

References are also role-bound. Primary category accepts only the frozen `/products/curtain-track-systems/` or `/products/accessories/` hub/one-child families; series accepts `/series/` hub/detail; applications accepts `/applications/` hub/detail. A valid target under another role is rejected.

The authoritative Fixture proves both sides: one valid card contains one non-empty series and one non-empty application whose IDs match their resolved targets, while `mismatched_reference_id` proves mismatched UUID/path pairs are excluded.

## Actions

| Kind | Lifecycle | Mode | Target |
|---|---|---|---|
| detail product | active | `view_product` | canonical Product path |
| detail product | discontinued | `view_product` | retained canonical Product path |
| catalog accessory | active | `direct_rfq` | `/request-a-quote/` |
| catalog accessory | discontinued | `replacement_contact` | `/contact/` |

The server derives actions. Source content cannot override them.

## Fixture and error evidence

Eight Golden files prove full list, a real anonymous one-item response, page 1, page 2, terminal empty page, title sort, matching filter and empty filter. `one-item.json` contains one complete card, total `4`, total pages `4`, existing success headers and a server-derived action from one collection request with zero per-card resolve. Twelve invalid/unpublished candidates prove fail-closed eligibility, including a source/target reference UUID mismatch exercised through the helper shared by primary category, series and applications. Eleven request negatives cover locale, Schema, integer syntax, native-integer/offset overflow, per-page bound, sort, filter taxonomy/slug and unknown parameter.

Two complete lifecycles used different WordPress database IDs and produced identical Golden hashes. Both completed exact cleanup with zero TASK-014 and A3 residue.

## Explicit non-delivery

This handoff does not provide a frontend Adapter or visible page. It does not confirm real GDHE product values, authorize production import, provide a final SCF editor experience, implement SeoDocument/RFQ/Preview/Webhook/GraphQL/multilingual behavior, or authorize Git delivery, acceptance or deployment.
