# TASK-014 WordPress/CMS Execution Report

status: `EXECUTION_COMPLETE_AWAITING_INDEPENDENT_VALIDATION`

## Outcome

GDHE Site `0.5.0` now exposes the additive anonymous read-only endpoint:

```text
GET /wp-json/gdhe/v1/product-cards
```

The endpoint returns complete English ProductCard projections under independent Schema `1.0.0`. Content Schema `3.0.0`, Module Schema `1.0.0`, REST API `1`, `/resolve`, `/collection/{type}`, navigation and route manifest remain unchanged.

This delivery is a CMS/API/Schema contract foundation. It is not a frontend page, accepted product catalog, production import, preview system, RFQ write path or deployment.

## TDD

The implementation followed the required test-first gate:

1. Schema test RED: missing `product-card-collection.v1.schema.json`.
2. Runtime test RED: `/gdhe/v1/product-cards` not registered.
3. Minimum GREEN: closed eight-file Schema closure and empty anonymous route.
4. Fixture GREEN: four valid cards, twelve invalid/unpublished exclusions, query/error matrix, pagination, filters, actions and leakage checks.
5. Public-reference P1 RED/GREEN: a valid UUID paired with another entity's resolvable path failed before the helper fix, then passed only after source/target identity binding was enforced.
6. Frontend-handoff P1 RED/GREEN: the suite first failed for the absent real one-item response, then failed for empty legal relations; the minimum Fixture/evidence change supplied one real one-item response and one valid card with identity-bound series/applications.
7. Adversarial R1 route-role RED/GREEN: an otherwise valid application target was accepted as a primary category before the helper became field-aware.
8. Adversarial R1 pagination RED/GREEN: extreme digit-only page input produced native `array_slice` `TypeError` before lossless integer and offset checks were added.

The retained RED/GREEN result is summarized in [TEST_OR_VALIDATION_LOG.md](TEST_OR_VALIDATION_LOG.md).

## Implemented contract

- One collection request returns 0, 1 or N complete cards; the frozen one-item response uses `per_page=1&page=1` and requires zero per-card `/resolve` requests.
- Query allowlist: English, Schema `1.0.0`, integer page/per-page, `modified_desc|title_asc`, optional `product_category:<slug>`.
- Eligibility runs before filter, `total`, `totalPages` and pagination.
- Detail Product active/discontinued derives `view_product`.
- Active catalog accessory derives `direct_rfq`.
- Discontinued catalog accessory derives `replacement_contact`.
- Public DTOs use UUIDv4 identifiers; WordPress/database IDs remain only in the removable Fixture manifest.
- Private `_gdhe_product_card_v1_source` is not registered to generic REST and has an exact field allowlist.
- `test_candidate` sources are eligible only when `WP_ENVIRONMENT_TYPE=local`.
- Protected media requires explicit confirmation, HTTPS, UUIDv4, positive dimensions and non-empty Alt.
- Primary category and optional relation references must be complete, canonical and publicly linkable; their source UUID must equal the resolved target's stable public UUID.
- Reference roles are path-bound: primary category uses only the frozen curtain-track/accessory category families, series uses `/series/`, and applications uses `/applications/`.
- The isolated positive Fixture includes one public series landing and one public application landing, both with source UUID equal to target stable public UUID.
- Raw meta/ACF/SCF, Article Number internals, Feishu identifiers, supplier/cost fields and internal media paths are absent.

## Runtime evidence

- Valid total: `4`.
- Page item counts: `2 / 2 / 0`; total remains `4 / 4 / 4`.
- Filters prove `N=4` and `0`.
- Eight Golden responses validate against Draft 2020-12 Schema, including a real anonymous one-item success response.
- One-item evidence: HTTP `200`, one item, total `4`, total pages `4`, existing ETag/cache/request-id headers and a server-derived `view_product` action.
- Eleven invalid request/error cases use the stable normalized error envelope and `no-store`, including native-integer and offset overflow.
- Twelve invalid/unpublished candidates are explicitly excluded, including `mismatched_reference_id`.
- The shared reference helper rejects identity mismatch for `primaryCategory`, `series` and `applications`.
- One valid card emits non-empty legal `series` and `applications` references bound to their resolved targets.
- Conditional request returns `304`.
- Two complete Fixture lifecycles used different WordPress database IDs and produced identical `8/8` Golden SHA-256 values.

## Regression and cleanup

- Existing A3 runtime contract: 15 Golden responses, totals `3/3/3`, item counts `2/1/0`, negative matrix GREEN.
- Existing A3 19-file Draft 2020-12 graph and six boundary negatives GREEN.
- TASK-014 final cleanup: posts, postmeta/source documents, terms, termmeta, option and uploads all `0`.
- A3 final cleanup: marker/migration meta and option all `0`.
- WordPress Core checksum, official SCF checksum, 12-table database check, plugin PHP lint and JSON parsing passed.

## Public-reference P1 revision

Planner's checkpoint identified that the first legal Fixture used category source UUID `43000000-0000-4000-8000-000000000001` while the resolved category landing used stable public UUID `44000000-0000-4000-8000-000000000001`.

The legal Fixture now uses the target UUID. `gdhe_product_card_public_reference()` additionally compares every source reference UUID with the unique resolved target's `_gdhe_public_id`; mismatch fails closed before any reference is returned. This helper is shared by primary category, series and applications. Route, ProductCard Schema/version/fields, four actions and Content Schema `3.0.0` did not change.

## Frontend handoff P1 evidence revision

The isolated Fixture now has 19 manifest-owned posts: the prior category landing and card matrix plus one public series landing and one public application landing. Only the valid active detail card references the two new targets. The authoritative `one-item.json` response proves a real anonymous request with exactly one complete card, while `all.json` and `page-1.json` prove the same card's legal non-empty relations. The existing `mismatched_reference_id` candidate and direct shared-helper checks remain unchanged and fail closed.

## Adversarial R1 revision

The helper now receives the semantic reference role and validates the frozen route family before target lookup. The Fixture category is `/products/curtain-track-systems/task-014-card-products/`, series is `/series/task-014-series/`, and application remains `/applications/task-014-application/`. Focused wrong-role cases cover primary category, series and applications while retaining unique-target, complete-envelope and UUID identity checks.

The Schema-only inline positive also uses the frozen `/products/curtain-track-systems/synthetic-tracks/` category path. The active ProductCard production source, Fixture, contract/Schema tests, eight Goldens and runtime/Schema evidence contain no historical `/products/category/` or `/products/series/` namespace.

Pagination now compares normalized decimal text to `PHP_INT_MAX` before casting and rejects any page whose `(page - 1) * perPage` offset cannot remain an integer. Both failures return the existing `gdhe_invalid_pagination` HTTP `400` envelope with `Cache-Control: no-store` before querying or slicing.

The two reviewer-created bytecode files were verified against the reported SHA-256 values, deleted by exact path, and their directory was removed only after it was empty. No `.pyc` or `__pycache__` remains under the plugin tests.

## Backup and rollback boundary

Before any Fixture write, the existing immutable SQL backup was verified:

- path: `.local/backups/TASK-014/20260729T164606Z/database.sql`
- bytes: `179205`
- SHA-256: `1b9f7def6c333284e324719e3fd43e68a8201100a96a7eba47aa48588635cb98`
- SQL completion marker: present

The backup was not modified. Healthy-state validation used exact Fixture cleanup; no broad restore was run.

## Documentation impact

`RESOLVED`: CMS README, REST contract and operations/rollback documentation now describe the actual ProductCard route, version, boundaries, Fixture commands and backup.

## Deferred gates

- No real GDHE Product/Article Number/media value was inferred or imported.
- The private source document is not a final wp-admin/SCF editing experience.
- Frontend consumption, one-request/zero-resolve client proof, SeoDocument, Preview, Webhook, GraphQL, multilingual, RFQ writes and deployment remain separately authorized work.
- No review, acceptance, commit, push, merge or deployment was performed.
