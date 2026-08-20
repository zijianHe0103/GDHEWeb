# TASK-007 A3 execution report

Status: `EXECUTION_COMPLETE_PENDING_INDEPENDENT_REVIEW`

Message: `MSG-TASK-007-WORDPRESS-FOREST-PRODUCT-MODEL-A3`

## Outcome

The GDHE-owned WordPress model now uses Content Schema `3.0.0` with REST transport `/gdhe/v1`, API version `1`, Module Schema `1.0.0` and plugin version `0.4.2`.

Implemented public types:

- native `page` and `post`
- `product`, `market`, `reference`, `support_article`, `download`

Implemented taxonomies:

- `product_category`, `product_series`, `installation_type`
- `support_topic`, `document_type`

`site_settings` remains internal. Schema 3 adds bounded product specifications, article numbers, finishes, installation/control/compatibility data, market/reference/support/download details, the five fixed relationship keys and a public file DTO without WordPress IDs.

No Forest brand, model, copy or image was copied. The fixtures are synthetic GDHE-domain data.

## Backup and migration gate

The new immutable snapshot is:

`/Users/arron/Storage/Personal/ObsidianWorkSpace/茂洋/独立站/.local/backups/TASK-007/A3-20260724T092322Z`

- SQL: 1,121,762 bytes
- SQL SHA-256: `15f779ed70fe4cdd8c2a51eef4850c169d9f84255a315f6621ff05c323ef7101`
- 12 table definitions, 10 insert groups, completion marker present
- complete 41-file pre-A3 plugin copy
- plugin checksum stream: `f87176cac871fb25f3d2916486724f229084d615e9f61aec32b69095c0d60a2a`
- all backup checksums passed; existing backups were unchanged

The pre-write inventory found zero real legacy business records. One empty `service` auto-draft (ID 833) was classified `ignored_ephemeral`; no real-content migration apply was executed. A disposable WordPress runtime suite proved non-zero inventory, dry-run zero-write, successful apply, repeated apply, exact rollback, repeated rollback and ambiguity refusal. Injected post-update and path/template/relation read-back failures restored the complete immutable snapshot and left no marker or backup meta.

## Contract and fixture result

The synthetic lifecycle contains Home, three Products under one category, Market, Reference, Support Article, Download plus PDF attachment, draft/private/pending/trash Products and four published contract-invalid Products.

- resolve, collection, navigation and route manifest passed
- structured specifications, article numbers, bidirectional relations and public file DTO passed
- publication, locale, path, schema, type, filter, sort and pagination negatives passed
- unknown template, known Product/Market-template mismatch, invalid module and invalid canonical path fail closed
- the known mismatch is rejected by resolve and excluded from collection items/total, navigation and route manifest
- cross-page Product totals: `3/3/3`
- cross-page Product item counts: `2/1/0`
- native Post and non-root Page resolve plus route-manifest coverage passed
- Product and Support HTTPS video positives plus HTTP/non-HTTPS Schema negatives passed
- all 15 Golden responses passed Draft 2020-12 validation
- two complete lifecycles used different database IDs and produced identical 15/15 Golden hashes

The prior warmed benchmark remains recorded without rerun. Planner's independent run remains the governing performance trigger: 1,600 origin requests, p50 `858.246 ms`, p95 `2001.839 ms`, error rate `0`.

GraphQL remains only a recorded future Planner-owned trigger. It was not installed, implemented or adopted.

## Cleanup and integrity

Final fixture cleanup removed 18 posts, one attachment and five terms. The migration runtime suite separately removed all six disposable legacy records. Queries proved zero A3 posts, migration/fixture marker meta, fixture terms, fixture options and uploads. No temporary user, standalone process or listener was created.

- WordPress Core checksum: PASS
- Secure Custom Fields 6.9.2 official checksum: PASS
- database check: PASS for 12 tables
- DPG project validation: PASS
- strict lane audit: PASS
- message validation: PASS
- secret scan: no match

## Scope

No frontend, root README, WordPress Core, SCF source, theme, third-party plugin, real business content, multilingual/SEO, GraphQL, preview, webhook, cache invalidation, inquiry, deployment, review, Git delivery, acceptance or closure work was performed.
