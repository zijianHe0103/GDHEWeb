# TASK-023 RelatedProductCard Handoff

## Frozen public contract

- Endpoint: `GET /wp-json/gdhe/v1/related-product-cards`
- API: `1`
- Schema: `RelatedProductCardCollection 1.0.0`
- ProductCard dependency: exact `ProductCard 1.0.0`
- Query: closed `locale=en`, `schema=1.0.0`, canonical `source_path`
- Source: one unique published Schema 3 Product
- Relation authority: stored `relationships.products` order, maximum 20
- Response: one complete collection request, no pagination and zero per-card `/resolve`

Each item is `{card, directQuote}`. `card` is an exact ProductCard `1.0.0` object. A detail product uses `directQuote: null`. An active catalog accessory is returned only when its independent related-product mirror explicitly provides `{kind: catalog_accessory, quantityUnit: piece}`. No category, kind, name or other value is used to infer a unit.

Self, later duplicates, unpublished, revoked, invalid-card, hostile-media, missing-unit and replacement-contact targets are omitted without changing the surviving order. If two distinct eligible posts claim one public UUID, every card/action with that UUID is omitted; a repeated identical post remains an ordinary duplicate, and unrelated stored order is retained. Malformed or over-20 source relation sets fail closed through the normalized no-store error envelope.

## Consumer evidence

- Goldens: `zero.json`, `one.json`, `three.json`, `four-plus.json`
- Ordered four-item positive includes both `view_product` and explicit-unit `direct_rfq`
- Strong ETag, public 60-second success cache and bodyless `304`
- Nine normalized request/source errors with `no-store`
- Every live error request ID is validated as UUIDv4; the saved evidence copy alone uses fixed non-production UUID `00000000-0000-4000-8000-000000000023`
- Exact nine-file Draft 2020-12 Schema closure
- Two different WordPress-ID fixture lifecycles with 4/4 identical Golden hashes
- Exact cleanup per lifecycle: 12 posts, 3 terms; final residue all zero

The machine authority is `RELATED_PRODUCT_CARD_HANDOFF_MANIFEST.json`. Verify its 26 files with:

```text
shasum -a 256 -c TASKS/ARTIFACTS/TASK-023/RELATED_PRODUCT_CARD_HANDOFF_CHECKSUMS.sha256
```

Final manifest SHA-256: `809fe879374e604553311217e6085f5f2b605c4a78bcb00258b8c6b2965cf51e`.

Final checksum-stream SHA-256: `fc3552dc84c8e6eacb954654b4d858a326eab03261eda02da440aa48bddfde90`.

## Boundaries

This handoff does not confirm real FGD X15+PVC relationships or implement Feishu sync, frontend consumption, Quote Basket, RFQ submission, GraphQL, multilingual behavior, deployment or publication. All Fixture records are local TEST_CANDIDATE data and have been removed.
