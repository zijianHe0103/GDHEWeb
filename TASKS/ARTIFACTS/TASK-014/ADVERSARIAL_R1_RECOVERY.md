# TASK-014 Adversarial Round 1 Recovery

timestamp: `2026-07-30T04:24:46Z`

## Verdict

`FAIL / P0=0 / P1=2 / P2=1`

Planner final validation is not allowed until the narrow revision is independently validated.

## P1-1 Route-role authority

The public-reference helper binds the source UUID to a unique complete public target, but it does not bind the semantic role to the frozen TASK-013 route:

- `primaryCategory` must resolve under one of the two frozen category families:
  - curtain-track categories: `/products/curtain-track-systems/` or `/products/curtain-track-systems/{subcategory-slug}/`;
  - accessory categories: `/products/accessories/` or `/products/accessories/{accessory-category-slug}/`;
- `series` must resolve under `/series/...`;
- `applications` must resolve under `/applications/...`.

Current Fixture/Golden evidence accepts `/products/series/...` and therefore freezes an authority conflict.

The authority file is `TASKS/ARTIFACTS/TASK-013/URL_AND_CANONICAL_CONTRACT.md`.

Required TDD closure:

1. Add focused RED cases proving a valid UUID/path pair is rejected when the path belongs to the wrong role.
2. Add the minimum role-aware helper or call-site validation.
3. Preserve identity binding, unique target resolution and complete-envelope eligibility.
4. Align Fixture, all eight success Goldens and the 25-file handoff with the frozen routes.

## P1-2 Safe pagination

A digit-only `page` beyond the native integer range saturates to `PHP_INT_MAX`, passes the existing request validation and overflows the offset calculation to float. `array_slice` then throws `TypeError`.

Required TDD closure:

1. Add a focused anonymous request RED for the reproduced extreme page.
2. Reject unsafe integer conversion or unsafe offset before slicing.
3. Return the existing normalized HTTP `400` error with `Cache-Control: no-store`.
4. Preserve valid pagination, conditional `304`, one collection request and zero per-card `/resolve`.

## P2 exact cleanup

The reviewer import generated exactly:

- `cms/wp-content/plugins/gdhe-site/tests/__pycache__/product-card-schema-test.cpython-311.pyc`
- `cms/wp-content/plugins/gdhe-site/tests/__pycache__/a3-schema-validate.cpython-311.pyc`

The reviewer correctly did not bypass its read-only write scope. The authorized wordpress_cms lane must remove only these files, remove the directory only if empty, and prove no ProductCard/A3 `.pyc` or `__pycache__` residue remains.

## Required fresh evidence

- focused RED/GREEN for both P1 findings;
- all ProductCard request negatives and eight success Goldens;
- ProductCard two-lifecycle determinism and exact cleanup;
- A3 19-file / 15-Golden / 6-negative regression and runtime totals;
- role-correct reference identity and mismatch negatives;
- regenerated sorted handoff checksums;
- PHP, JSON, Schema, protected scope and governance checks;
- local runtime restored for Planner fresh validation before adversarial Round 2.

## Preserved boundaries

No route/version/field/action redesign, frontend implementation, SeoDocument, real product import, Feishu/RFQ integration, dependency change, Git delivery or deployment is authorized.
