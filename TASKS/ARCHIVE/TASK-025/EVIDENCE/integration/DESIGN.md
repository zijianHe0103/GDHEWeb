# TASK-025 Design

status: frozen by Planner A0; implementation requires sequential lane checkpoints

## 1. Smallest architecture

```text
Feishu product master (future sync authority)
  -> WordPress private exact source mirrors + public Article Number lookup index
  -> RelatedProductCard 2.0 and mixed validation 1.0
  -> Next.js server-only Transport / Validator / Adapter
  -> Quote Basket 3.0 browser document
  -> future RFQ intake (not TASK-025)
```

No opaque key, encryption layer, token exchange, NestJS service or second product database is introduced.

## 2. CMS storage and lookup

### Existing configured products

`_gdhe_product_configuration_v2_source` remains the exact configured-product source. Its Product Configuration `2.0.0` document and Article Number options remain byte-compatible.

### Catalog accessories

Add one private exact source mirror `_gdhe_catalog_accessory_quote_v1_source` with closed version, source class, website eligibility, public Product identity, Article Number and `piece`. It is not returned raw.

### Query index

Add repeatable post meta `_gdhe_public_article_number_v1`, one exact value per current orderable Article Number. It is an index, not an authority. Runtime must compare it with the configured-product or accessory private source; missing, extra or conflicting values fail closed.

For one request, the resolver performs at most two bounded domain candidate queries:

1. canonical Product candidates for configured custom or migrated-standard lines, using at most 50 distinct canonical paths and a hard candidate ceiling of 101;
2. Article Number candidates for submitted and uniquely recovered numbers, using at most 50 distinct numbers and a hard candidate ceiling of 101.

Candidate overflow rejects the batch. WordPress object/meta caching may execute framework queries, but product-domain code must not loop through public endpoint calls or create one `WP_Query` per line.

## 3. RelatedProductCard 2.0

The existing GET route remains `/gdhe/v1/related-product-cards` and selects the additive version through `schema=2.0.0`.

For an eligible active catalog accessory, `directQuote` is exactly:

```json
{
  "kind": "catalog_accessory",
  "articleNumber": "GDHEPRD000901",
  "quantityUnit": "piece"
}
```

Detail products still use `directQuote:null`. Missing, duplicate or inconsistent Article Number/source/index data omits the accessory card rather than producing a partial direct-quote action. Version `1.0.0` output and frozen Schema remain unchanged.

## 4. Mixed validation request

The request has one closed ordered `lines` array. Common fields are `entryId`, `lineKind`, `quantityUnit` and `quantity`.

Configured products add:

- `canonicalPath`;
- a closed standard-ready, standard-refresh or custom selection;
- closed canonical packaging enum values.

Catalog accessories add only Article Number beyond common fields. Display product data is intentionally absent.

Duplicate `entryId` and duplicate complete merge identity are semantic pre-resolution failures. The endpoint does not merge quantities.

## 5. Mixed validation response

Success returns the same number and order of lines. Each line includes the submitted `entryId`, current public model, public path or `null`, authoritative Article Number or controlled custom `null`, normalized current selection/configuration, server-owned quantity unit and submitted quantity.

No stable Product UUID, WordPress ID, source meta, Feishu ID, price or media is included.

The server builds the complete response in memory and emits it only after every line passes. Any line failure discards the candidate result and returns one normalized error.

## 6. HTTP matrix

| HTTP | code | meaning |
|---:|---|---|
| 200 | success document | all lines resolved atomically |
| 400 | `gdhe_invalid_quote_line_request` | JSON/Schema/count/duplicate/unknown-field failure |
| 409 | `gdhe_quote_lines_changed` | current product/configuration/Article Number/role/unit conflict |
| 413 | `gdhe_quote_line_request_too_large` | body exceeds 163840 bytes |
| 415 | `gdhe_unsupported_media_type` | not exact JSON media type |
| 500 | `gdhe_quote_line_validation_unavailable` | sanitized internal failure |

Every response is `no-store`. Errors use the existing normalized GDHE error envelope shape with a fresh UUID request ID and no rejected business values.

## 7. Frontend versions

### Public configurator

The server-only Product Configuration 2.0 Adapter retains its Article Number. A new versioned public configurator projection may pass Article Number into the Client Component option data. The visible label remains only length and color. The draft builder copies the exact selected option's Article Number for standard lines; custom length emits null plus `sales_follow_up`.

### Related products

The new RelatedProductCard 2.0 snapshot and server-only Adapter expose the accessory Article Number to the browser action data. The card and Basket presentation do not render it.

### Quote Basket 3.0

Use a new independent closed Schema and runtime. Do not widen the 1.0/2.0 Schemas or mutate their samples. The v3 union has `ready`, `requires_validation` and `requires_readd` states with only the legal line/state combinations defined in REQUIREMENTS.md.

### Batch consumer

One server-only orchestration accepts the v3 submission projection, performs exactly one mixed validation POST and returns a deep-frozen DTO. It never calls `/resolve`, Product Configuration or RelatedProductCard per line. A browser-import or deep Client Component import must fail the build through `server-only`.

## 8. TDD and handoff order

1. WordPress RED: missing RelatedProductCard 2.0 root/route behavior and missing mixed-validation root/POST route.
2. WordPress GREEN in vertical slices: source/index normalization, one accessory projection, one configured standard, custom, mixed 1/N/50, atomic errors, determinism/cleanup and handoff.
3. Planner CMS checkpoint: exact Schema closure, route, request/response/error samples, query/subrequest evidence and protected-version comparison.
4. Frontend RED: missing authority snapshot/verifier, missing v3 Basket, missing server-only batch consumer.
5. Frontend GREEN in vertical slices: snapshot, Validator, Adapter, Transport, v3 migration, configured/accessory additions, non-rendered Article Number and one-call orchestration.
6. Planner checkpoint, independent adversarial review, fresh final validation and checked acceptance preparation.

## 9. Rollback

Remove only TASK-025 additive route registration, Schema/source/index/runtime files and frontend v3/new consumer files; restore the small version-dispatch seams. Existing Product Configuration 2.0, RelatedProductCard 1.0, Quote Basket 1.0/2.0, QuoteLine 1.0/2.0 and TASK-024 artifacts remain valid and byte-identical. Fixture cleanup removes all TASK-025 posts/meta/options/uploads and proves zero residue.
