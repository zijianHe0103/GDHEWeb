# TASK-014 Public-reference Identity P1 Revision

status: `REVISION_COMPLETE_AWAITING_PLANNER_CHECKPOINT`

## Finding

The first ProductCard implementation validated a source reference UUID and its canonical public path independently. It did not prove that both identified the same public entity. The legal category Fixture therefore emitted source UUID `43000000-0000-4000-8000-000000000001` while its resolved landing target used stable UUID `44000000-0000-4000-8000-000000000001`.

## Valid RED

A regression passed another valid UUIDv4 with the existing unique, publicly resolvable category path through `gdhe_product_card_public_reference()`. Before production code changed, the real WordPress test failed only with:

```text
Public reference accepted a UUID that differs from its resolved target.
```

WordPress, database, Fixture, route and target envelope resolution were otherwise available. The full output and interpretation are appended to `TDD_RED_EVIDENCE.md`.

## Minimum fix

`gdhe_product_card_public_reference()` now requires:

```text
source reference id == resolved target stable _gdhe_public_id
```

Mismatch returns `null`. The legal category source now uses the target UUID `44000000-0000-4000-8000-000000000001`.

No route, endpoint, ProductCard Schema version, public field, action, filter, pagination or Content Schema behavior changed.

## Negative and shared-helper coverage

The isolated Fixture adds one published `mismatched_reference_id` candidate. Its primary category, series and applications reference data use a valid but incorrect UUID for the same linkable target. Runtime evidence proves:

- `primaryCategory`: mismatch rejected;
- `series`: mismatch rejected by `gdhe_product_card_reference_list()`;
- `applications`: mismatch rejected by the same list helper;
- candidate excluded before filter, total and pagination;
- valid totals remain `4/4/4` and items remain `2/2/0`.

## Refrozen evidence

- seven ProductCard Goldens;
- runtime and Schema validation;
- 12 invalid/unpublished candidate exclusions;
- two different-database-ID determinism rounds;
- ProductCard handoff manifest and 24 checksums;
- CMS REST/operations/README contract text.

## Regression and cleanup

- ProductCard Schema/Golden/runtime/determinism: PASS;
- A3 19-file Schema graph, 15 Goldens, six boundary negatives and runtime: PASS;
- each final TASK-014 round removed 17 posts and three terms;
- final TASK-014/A3 posts, source/marker/migration meta, terms, termmeta, options and uploads: zero.

## Boundaries preserved

No frontend, SeoDocument, real product/media, WordPress Core, SCF source, theme, dependency, external system, Git delivery, review, acceptance or deployment work was performed.
