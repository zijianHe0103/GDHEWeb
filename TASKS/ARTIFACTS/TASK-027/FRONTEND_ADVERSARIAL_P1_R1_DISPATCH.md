# TASK-027 Frontend Adversarial P1 R1 Narrow Revision Dispatch

## Authority

- Historical complete review: `FAIL / P0=0 / P1=1 / P2=2`.
- This dispatch repairs only P1-1 from
  `ADVERSARIAL_REVIEW_REPORT.md`. It is not a second complete review.
- Planner has already corrected the two P2 narratives. Frontend must not edit
  Planner-owned task, Board, State, root README or architecture files.

## Required RED/GREEN

1. Add a direct production-runtime regression for `requestReference()` where
   `ids.nextRequestReference()` returns a hostile or revoked non-string value.
   RED must reproduce the current coercion/diagnostic escape.
2. Apply the minimum production fix:
   - receive the dependency result as `unknown` at runtime;
   - inside one protected block, require `typeof value === "string"` before the
     fixed request-reference pattern check;
   - do not coerce, reflect on or inspect non-strings;
   - normalize every invalid/hostile returned value to the existing stable
     `RfqIntakeError { category: "intake", kind: "dependency_failed" }`.
3. GREEN must prove ordinary valid references and the existing customer-safe
   local rejection/replay paths remain unchanged.
4. Add zero-trap coverage for the hostile/revoked value. Preserve all public
   contracts, Route behavior and A1-A6 passing boundaries.

## Validation

- direct request-reference regression;
- RFQ A1-A5 focused suite;
- TASK-025/Quote Basket v3 focused regressions;
- all ten verifiers, lint and typecheck;
- no generated residue, protected-hash drift, diagnostic leakage or listener;
- `git diff --check` and DPG gates.

Do not modify CMS, contracts/snapshots, public Schema, dependencies, UI,
external systems, review report, Planner state, Git or deployment. Return one
linked response with exact RED/GREEN and current-byte evidence; then stop for
Planner validation and same-reviewer bounded finding closure.
