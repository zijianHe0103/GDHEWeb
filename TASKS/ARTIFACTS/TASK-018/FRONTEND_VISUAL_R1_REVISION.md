# TASK-018 Frontend Visual Round 1 CSS Revision

status: `IMPLEMENTED_AWAITING_INDEPENDENT_VISUAL_RETEST`
request: `MSG-TASK-018-FRONTEND-VISUAL-R1-REVISION`
lane: `frontend`
completed_at: `2026-07-31T06:40:49Z`

## Outcome

Strict RED/GREEN closed the code causes assigned for O1 and O2 with one local
CSS correction and one directly corresponding focused test.

- O1: Hero, Overview and Specifications now use border-box sizing at `100%`
  available inline width, so inherited section padding and borders cannot
  enlarge them beyond narrow viewports.
- O2: Hero overrides the global `42rem` section cap and uses the available
  Product Detail article width. Its H1 uses normal word-boundary wrapping so
  the model token `X15+PVC` cannot be split internally.

## TDD Evidence

The focused test first exited `1` with one failure and seven skipped tests
because the width-safe local contract was absent. After the CSS-only change,
the identical command exited `0` with one passing test and seven skipped.

## Current-byte Validation

- Product Detail: `5 files / 32 tests PASS`
- ProductList: `4 / 29 PASS`
- CMS: `7 / 156 PASS`
- ProductCard: `6 / 86 PASS`
- full Vitest: `24 / 305 PASS`
- CMS verifier: `16 / 2 / 2 PASS`
- ProductCard verifier: `8 / 3 / 6 PASS`
- lint, typecheck and production build: `PASS`
- Product Detail, ProductList and CMS integration production smokes: `PASS`
- protected hashes, inventories, scope, generated-file cleanliness, diff and
  DPG gates: `PASS`

## Preserved Boundaries

No global CSS, component DOM, DTO, Adapter, loader, Transport, Validator, data,
wording, routes, links, dependencies, CMS, external system, Planner state or
Git operation changed. Frontend did not run visual QA.

The original `BLOCKED_NO_VISUAL_EVIDENCE` record and the current independent
verdict `FAIL / severe 0 / obvious 2 / detail 0` remain intact. Planner and
`visual_qa` must independently retest 1440/1024/768/390/320 before changing
that verdict.
