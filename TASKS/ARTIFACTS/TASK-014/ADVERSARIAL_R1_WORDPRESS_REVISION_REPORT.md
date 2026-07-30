# TASK-014 Adversarial R1 WordPress Revision Report

status: `EXECUTION_COMPLETE_AWAITING_PLANNER_VALIDATION`

## Scope

This revision closes only adversarial Round 1 P1-1 route-role authority, P1-2 pagination overflow and the exact P2 reviewer-bytecode cleanup. It follows `TASKS/ARTIFACTS/TASK-013/URL_AND_CANONICAL_CONTRACT.md` and the corrected continuation.

## TDD P1-1 — route-role authority

The RED used published Fixture targets whose UUID, public path, unique resolution, complete envelope and UUID/path identity were valid. Before the helper was role-aware, an application target was accepted as `primaryCategory`:

```text
RuntimeException: Public reference accepted a valid target under the wrong route role for primaryCategory.
```

Minimum GREEN:

- `primaryCategory`: only `/products/curtain-track-systems/` or `/products/accessories/`, with zero or one child category segment;
- `series`: only `/series/` or one detail segment;
- `applications`: only `/applications/` or one detail segment;
- existing UUID, unique-target and complete-envelope gates preserved.

The Fixture now uses:

- `/products/curtain-track-systems/task-014-card-products/`;
- `/series/task-014-series/`;
- `/applications/task-014-application/`.

Focused wrong-role assertions cover all three fields. Existing mismatched-UUID coverage also remains passing.

Planner's byte-level pre-response check additionally found that the Schema-only inline positive still used the historical `/products/category/` namespace. That single synthetic path was corrected to `/products/curtain-track-systems/synthetic-tracks/`. ProductCard Schema validation was rerun, the affected test-file checksum was refrozen, and the exact active source/test/Golden/runtime scan now contains no `/products/category/` or `/products/series/` value.

## TDD P1-2 — safe pagination

The anonymous route RED reproduced the reviewer finding:

```text
TypeError: array_slice(): Argument #2 ($offset) must be of type int, float given
```

Minimum GREEN compares normalized decimal text against `PHP_INT_MAX` before casting and checks `(page - 1) * perPage` with `intdiv` before query or slice. A 100-digit page and `page=PHP_INT_MAX&per_page=100` now return the existing normalized `gdhe_invalid_pagination` HTTP `400` envelope with `Cache-Control: no-store`.

## P2 exact cleanup

The two files matched the reviewer-recorded SHA-256 values:

- `product-card-schema-test.cpython-311.pyc`: `4783ebac228863a71e39c29119732ca2f21df30616681cd64c3dd11e028f1709`;
- `a3-schema-validate.cpython-311.pyc`: `ae0d3291b7cc649565fec7d0225ac20587ee87e455c70baaa72a08d0f5182a72`.

Only those two files were deleted. The cache directory was removed after it was empty. No `.pyc` or `__pycache__` remains under GDHE Site tests.

## Regression

- ProductCard: eight success Goldens, eleven normalized request negatives, twelve invalid/unpublished candidates and all four action cells pass.
- Determinism: two complete lifecycles used different database IDs and produced identical 8/8 Golden hashes.
- TASK-014 cleanup: each lifecycle removed 19 posts and three terms; final residue is zero.
- A3: 19-file graph, 15 Goldens, six boundary negatives, totals `3/3/3` and item counts `2/1/0` pass; cleanup removed 18 posts, one attachment and five terms.
- ProductCard route/version/fields/actions, Content Schema `3.0.0`, old endpoints and frontend boundaries are unchanged.

## Boundary

No frontend, SeoDocument, real product data, external system, review, acceptance, Git delivery, deployment or TASK-015 work was performed.
