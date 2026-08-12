# Quote Basket 3.0 to RFQ Submission 2.0 Mapping

## Eligibility

Only submit-ready Basket 3.0 lines project. The complete source document first validates against the frozen Basket 3.0 Schema while its `state` fields are still present. `configured_product/ready/standard_ready`, `configured_product/ready/sales_follow_up`, and `catalog_accessory/ready` are eligible. Any `requires_validation` or `requires_readd` line rejects before any display/state field is stripped; it cannot be converted by treating `state` as an unknown field in an already projected DTO. The three real source fixtures in `samples/basket-v3/` machine-prove these cells.

## Envelope mapping

| Submission field | Basket 3.0 source |
|---|---|
| `sourceBasket.schemaVersion` | exact `schemaVersion`, must be `3.0.0` |
| `revision` | exact positive safe integer |
| `writerId` | canonical lower-case UUID |
| `mutationId` | canonical lower-case UUID |
| `updatedAt` / `expiresAt` | exact timestamps; delta must be `2592000000 ms` |
| item order | exact Basket array order |

## Configured line mapping

| Submission field | Exact Basket source/conversion |
|---|---|
| `entryId` | lower-case canonical public UUID |
| `lineKind` | literal `configured_product` |
| `canonicalPath` | `product.publicPath` |
| `selection.type` | standard becomes `article_number`; custom becomes `custom_length` |
| `selection.articleNumber` | standard copies Article Number; custom is `null` |
| `selection.lengthMeters` | exact validated one-decimal-positive number; no rounding |
| `selection.color` | exact public code/label |
| `selection.resolution` | `standard_ready` or `sales_follow_up` |
| `packaging.basePackaging` | exact validated choice key |
| `packaging.logoPrinting` | exact Boolean |
| `packaging.protectionArrangement` | exact validated choice key or `null` |
| `quantityUnit` | exact `piece` in Basket 3.0/TASK-025 generation |
| `quantity` | exact positive safe integer; no conversion |

The standard line's Article Number remains untrusted after projection. Custom length cannot carry a fabricated or inferred number.

## Accessory line mapping

An eligible accessory maps only `entryId`, literal `catalog_accessory`, Article Number, literal `piece`, and quantity. Model, name, media and catalog path are display-only and excluded.

## Explicit exclusions

Do not project `state`, `createdAt`, product model/name, image URL/Alt/width/height, catalog display path, internal UUID, WordPress/SCF/database/Feishu identity, price/currency/cost/margin, supplier, inventory or secret. Unknown fields fail closed; no excluded field is retained for convenience.

## One-call authority conversion

The complete projected line array is the `lines` member of one MixedQuoteLineValidation `1.0.0` request. `samples/task025/` freezes an independent full request/response pair. The binding gate checks count, order, entry ID, kind, unit, quantity, canonical configured path, complete selection and packaging, resolution, model and all root/nested/accessory Article Number positions. The resulting authoritative line array must byte-shape-equal the response-owned projection (plus the fixed custom follow-up reason). There is no public per-line resolve fallback or partial acceptance.
