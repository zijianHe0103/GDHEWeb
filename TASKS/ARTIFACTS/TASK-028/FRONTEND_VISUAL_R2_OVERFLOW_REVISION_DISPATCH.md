# TASK-028 Visual Round 2 Overflow Revision Dispatch

message_id: `MSG-TASK-028-FRONTEND-VISUAL-R2-OVERFLOW-REVISION`

## Preserved result

- Visual QA Round 1 remains `FAIL / severe 1 / obvious 2 / detail 0`.
- Visual QA Round 2 remains `FAIL / severe 0 / obvious 1 / detail 0`.
- Round 2 S1/O1/O2, accepted unchanged clear, accepted changed retain, processing retain, no automatic retry, explicit replay, keyboard/focus/aria-live, reduced motion, privacy and network boundaries all PASS.

## Sole authorized finding

The nested `#rfq-privacy-policy` semantic section inherits the global content-box section width plus padding. This produces real overflow only at the two narrow acceptance widths:

- 390 CSS px: `clientWidth=390`, `scrollWidth=427`, policy right edge `427.5`.
- 320 CSS px: `clientWidth=320`, `scrollWidth=361`, policy right edge `361`.

## Required revision

1. Use strict focused RED/GREEN to prove the local policy target lacks a width-safe box-model seam.
2. Apply the smallest local CSS correction to that nested policy target only, using border-box and a zero minimum inline size or an equally narrow equivalent.
3. Preserve the semantic same-page target, copy, focusability, submission behavior, all RFQ/Basket contracts and every passing Round 2 boundary.
4. Add only a direct CSS/source regression and update TASK-028 frontend evidence/worklog.
5. Re-run the direct presentation/style test, RFQ plus Quote Basket focused tests, lint, non-incremental typecheck, protected hashes, generated cleanup, diff and DPG gates. Run wider regression only if the local change or focused gates require it.

## Forbidden scope

- Do not change RFQ endpoints, validators, domain rules, Basket clearing, retry/replay, routes, customer copy, contracts, CMS, dependencies or external systems.
- Do not run Visual QA, complete adversarial review, Git delivery or deployment.
- Do not change the historical Visual evidence or claim Visual PASS.

## Stop gate

Return one linked `execution_response` and stop for Planner verification. After that, only one bounded Visual closure retest at 390 and 320 is allowed; do not repeat the complete five-width/state matrix.
