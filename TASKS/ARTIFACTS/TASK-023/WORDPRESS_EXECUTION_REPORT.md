# TASK-023 WordPress A1/A2 Execution Report

## Result

WordPress A1/A2 plus the Round 1 public-UUID identity correction are complete within the registered `wordpress_cms` scope. The implementation adds the independent anonymous read-only `RelatedProductCardCollection 1.0.0` and:

```text
GET /wp-json/gdhe/v1/related-product-cards
```

The route reads a unique published Schema 3 Product's `relationships.products` in stored order, enforces the 20-relation ceiling, projects only complete ProductCard `1.0.0` targets and returns all eligible cards in one response. ProductCard `1.0.0` and TASK-014 authority remain byte-identical. The current shared tree matches 21/27 task-start protected hashes: five differences are disclosed authorized frontend/Quote Basket changes, while generated `frontend/next-env.d.ts` is one additional concurrent protected drift outside this Lane.

Because the protected baseline freezes `gdhe-site.php` and `includes/public-api.php`, one GDHE-owned task-scoped MU bootstrap loads the additive route/Fixture files after the existing plugin. It does not modify WordPress Core, SCF, a theme or a third-party plugin.

## TDD

- RED 1: missing root Schema, exit 1.
- RED 2: missing REST route, exit 1.
- RED 3: A1 placeholder returned no valid relation collection, exit 1.
- GREEN: exact nine-file Schema closure, registered GET route and full relation truth/eligibility projection.

The retained failures, commands and final result are in `WORDPRESS_VALIDATION_LOG.md`.

## Runtime contract

- closed `locale=en`, `schema=1.0.0`, canonical `source_path` query;
- unique published complete Product source;
- complete stored relation list, maximum 20, stable order;
- self and later duplicates skipped;
- distinct eligible posts sharing one public UUID all omitted, while a repeated identical post remains one ordinary duplicate and unrelated order is preserved;
- unpublished, revoked, invalid ProductCard, hostile media, missing-unit and replacement-contact targets omitted;
- detail product: ProductCard `view_product` plus `directQuote: null`;
- active catalog accessory: ProductCard `direct_rfq` plus explicit `{kind: catalog_accessory, quantityUnit: piece}`;
- no quantity-unit or compatibility inference;
- strong ETag, public 60-second success cache and conditional bodyless `304`;
- nine normalized no-store request/source errors;
- no write method, pagination, per-card resolve, WordPress/Feishu ID or internal field.

## Fixture and determinism

The removable Fixture creates 12 marker-owned synthetic posts and three task-scoped terms. It proves ordered 0/1/3/4+ collections with one detail product and one direct-quote accessory among the valid set, plus self, duplicate, unpublished, revoked, hostile-media, missing-unit, action-mismatch and distinct-post shared-UUID negatives.

Final evidence-determinism lifecycles used post IDs `3404–3415` and `3416–3427`. Both rounds produced the same four Golden hashes:

- `four-plus.json`: `5359939897c49200644497fde7a0e145a0e8e3656e8425450ef1db5a447472e1`
- `one.json`: `1c337364157486db1c09cf56d99152db0cdc4ce3f4f3c50a4792caf42e203b2b`
- `three.json`: `e260f2c66b21fe709e834519bf8ae3f128d1a9cf54dc3ab79aa98e35ad6ce780`
- `zero.json`: `10c511e8e8bdf7c2ee294c9f2562fbeadf4d0002eb549ff9b60b7c9574d0b805`

Each round removed exactly 12 posts and three terms. Final matching posts, marker/source meta, option, terms, termmeta and uploads are all zero.

Every real runtime error response is still checked as a UUIDv4 request identity.
Only the saved non-production evidence copy replaces those volatile values with
`00000000-0000-4000-8000-000000000023`. Its SHA-256 is stable across both
lifecycles: `e431d02338ccc82f9f576044dc860501c7711856bb01d8a09a454b86ecc2c91c`.

## Handoff

- exact Schema closure: 9/9;
- Golden Schema validation: 4/4;
- Schema negatives: 7/7 rejected;
- handoff files: 26/26 verified;
- manifest SHA-256: `809fe879374e604553311217e6085f5f2b605c4a78bcb00258b8c6b2965cf51e`;
- checksum stream SHA-256: `fc3552dc84c8e6eacb954654b4d858a326eab03261eda02da440aa48bddfde90`.

## Documentation and boundaries

CMS README, content model, REST contract and operations/rollback now describe only the implemented public contract and removable Fixture. No frontend, Quote Basket, real relationship set, Feishu, database structure, Core, SCF source, dependency, Planner authority, Git or deployment change was made.

This report is an execution checkpoint, not review, user acceptance, Git delivery or deployment.
