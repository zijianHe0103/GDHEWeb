# TASK-025 WordPress Diff Summary

## Added

- four versioned Draft 2020-12 Schema files;
- one TASK-025 MU bootstrap;
- private source/index and mixed validation runtime;
- removable TASK-025 Fixture;
- route, contract, Schema, determinism, real-HTTP and handoff tests;
- TASK-025 WordPress machine evidence and seven Goldens.

## Narrow shared changes

- `includes/related-product-cards.php`: additive `1.0.0|2.0.0` dispatch and v2
  authority projection; the v1 response branch is retained.
- `tests/related-product-card-contract-test.php`: unsupported Schema negative
  changed from newly valid `2.0.0` to `9.9.9`.
- four `docs/cms` files document the additive public/API/operations behavior.

## Planner Round 1 revision

- only the two mixed `1.0.0` Schema roots changed business-neutral reference
  spelling from fragment-only to exact root `$id` plus fragment;
- `task025-schema-test.py` now rejects ambiguous fragment-only refs and forbids
  network resolution;
- `task025-determinism-test.py` now guarantees post-create cleanup and exposes
  one controlled failure-injection seam;
- TASK-025 WordPress evidence and the same 52-file handoff were refreshed.

## Excluded

No frontend, TASK-024, Planner authority, Core, SCF, theme, real content,
database structure, Feishu, dependency, Git or deployment change belongs to
this execution.
