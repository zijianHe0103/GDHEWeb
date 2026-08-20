# TASK-007 A3 Schema 3 consumer P1 revision

Status: `EXECUTION_COMPLETE_PENDING_PLANNER_VALIDATION`

Message: `MSG-TASK-007-WORDPRESS-SCHEMA3-CONSUMER-P1-R1`

Date: `2026-07-24`

## Scope and versions

This revision closes only the two CMS P1 findings from the A3 frontend consumer audit. `gdhe-site` is `0.4.1` and the synthetic fixture evidence is `TASK-007-A3-P1-R1`. REST API `1`, Content Schema `3.0.0` and Module Schema `1.0.0` are unchanged.

No frontend, root README, WordPress Core, SCF source, theme, GraphQL, multilingual, real content, deployment, review, Git delivery, acceptance or task closure work was performed.

## P1-1: runtime type/template pairing

The public envelope now requires the same type/template pair as the Schema 3 discriminator:

- `page` and `post` use `standard`
- `product` uses `product`
- `market` uses `market`
- `reference` uses `reference`
- `support_article` uses `support_article`
- `download` uses `download`

A new published Product fixture carries the known `market` template, otherwise valid Schema 3 fields, the Product collection filter terms and a navigation marker. The runtime returns `gdhe_contract_invariant` for resolve and excludes it from Product collection items and total, navigation and route manifest. Valid Product totals remain `3/3/3`; page item counts remain `2/1/0`.

## P1-2: complete Schema authority

`a3-schema-validate.py` now recursively resolves non-fragment local `$ref` values from five current roots and loads only the resulting 19-file authority graph. `A3_SCHEMA_VALIDATION.json` records the exact sorted paths and SHA-256 for every loaded file. `CONTRACT_AND_HANDOFF_MANIFEST.md` freezes the same list and gives the reproducible traversal, generation and verification algorithm. `HANDOFF_CHECKSUMS.sha256` contains each of those 19 Schema files separately; the whole-plugin stream is no longer used as Schema completeness authority.

The graph includes the page and collection roots, error, navigation, route manifest, UUIDv4, canonical path, content/media/file/link/safeHtml shared schemas and all seven module schemas.

## Validation result

- PHP syntax: PASS
- plugin and artifact JSON parse: PASS
- Draft 2020-12 Golden validation: 13/13 PASS
- transitive Schema graph: 19/19 loaded and hashed
- known Product/Market-template mismatch: resolve, collection, navigation and route-manifest fail-closed PASS
- Product collection totals: `3/3/3`
- Product collection item counts: `2/1/0`
- two complete Fixture lifecycles with different WordPress IDs: 13/13 Golden hashes identical
- positive Golden hashes compared to the A3 baseline: 13/13 unchanged
- final cleanup: 16 posts, one attachment and five terms removed; posts, marker postmeta, terms, option and uploads all zero
- WordPress Core checksum: PASS
- Secure Custom Fields checksum: PASS
- database check: 12/12 tables PASS

The existing benchmark was not repeated because the positive DTO set and all 13 hashes are unchanged. Planner's independently frozen result remains visible: p95 `2001.839 ms`, above the `500 ms` future architecture-comparison trigger. This revision neither repeats nor suppresses that trigger and does not authorize a GraphQL/cache PoC.

## Deferred findings

The frontend audit P2 notes remain recorded and unchanged: native Post/non-root Page positive coverage, HTTPS-only video in machine Schema and production media-origin policy. They are outside this narrow revision.
