# TASK-025 Adversarial Finding Closure Dispatch

## Purpose

This is not a second full TASK-025 review. The complete independent review already finished with historical result `FAIL / P0=0 / P1=2 / P2=0`. The owning frontend lane repaired exactly those two findings and Planner independently reproduced the closure evidence.

The same registered reviewer must now confirm only whether the two original findings are closed on the current shared bytes. Preserve the original FAIL and all prior passing evidence. Do not reopen or repeat WordPress, Article Number business policy, UI, documentation, performance, scope or unrelated regression review surfaces unless a direct regression from these two repairs is observed.

## Finding 1 closure

Original finding: exported `applyQuoteBasketV3Validation` accepted a plain structurally incomplete DTO and could update a migrated Basket without the authentic A3 validation boundary.

Confirm only:

- the application helper is no longer exported or reachable as a public plain-DTO seam;
- public `validateQuoteBasketV3` applies a response only after the authentic A3 Transport, eleven-Schema runtime Validator, opaque wrapper, Adapter and semantic binding path;
- missing root metadata, missing line model, extra root/line properties and invalid locale reject with stable sanitized errors and leave the original Basket unchanged;
- ordinary 1-line/50-line success, one mixed POST and zero legacy per-line calls remain intact.

## Finding 2 closure

Original finding: frozen Basket v1/v2/v3 accepted uppercase UUID hexadecimal while the mixed request/CMS boundary required lowercase, leaving a valid legacy standard line unable to reach its only upgrade path.

Confirm only:

- accepted writer, mutation and entry UUIDs canonicalize to lowercase at v3 ingress before duplicate/merge-identity checks;
- uppercase v1/v2/v3 values migrate deterministically without changing other customer meaning;
- two entry IDs differing only by hexadecimal case fail closed as an identity collision;
- a frozen v2 uppercase standard line produces a lowercase mixed request, performs exactly one POST and upgrades to `ready / GDHEPRD000172`;
- frozen Basket Schema and CMS authority bytes remain unchanged.

## Proportionate evidence

Independently inspect and run the focused repair tests and directly relevant regressions. The Planner checkpoint already reproduced `66 files / 579 tests`, all nine verifiers, lint, typecheck, build, four smokes, frozen hashes and cleanup. Do not repeat the complete full-scope review; use that current-byte checkpoint as regression evidence and rerun only what is proportionate to challenge the two closures.

## Required output

Update the canonical `ADVERSARIAL_REVIEW_REPORT.md` while preserving the historical FAIL. Return exactly one linked closure verdict:

- `PASS / P0=0 / P1=0 / P2=0` if both original findings are closed; or
- `FAIL` with exact P0/P1/P2 counts if either original finding remains, including the smallest reproducible evidence.

The reviewer remains read-only for product, tests, Planner authority, CMS, dependencies, external systems and Git. A closure PASS is not user acceptance, final validation, commit, push, merge or deployment authorization.
