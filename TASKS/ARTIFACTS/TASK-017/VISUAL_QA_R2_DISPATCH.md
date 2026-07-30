# TASK-017 Visual QA Round 2 Dispatch

status: `READY_FOR_VISUAL_QA_R2`
source: `MSG-TASK-017-FRONTEND-VISUAL-R1-REVISION-RESPONSE`

## Purpose

Recheck only the Round 1 visual findings against current shared bytes. Preserve
the complete Round 1 FAIL report and screenshots.

Planner independently reproduced the narrow CSS revision and current gates:
ProductList `21/21`, TASK-016 `73/73`, full Vitest `265/265`, both verifiers,
lint, typecheck, production build, production fail-closed smoke, protected
hashes/scope and DPG checks all PASS.

## Retest

Start the existing local preview with Node `24.18.0` and
`GDHE_PRODUCT_LIST_MODE=preview`. Stop the server after capture.

Required Round 2 evidence:

1. Fresh-load 1024 px screenshot before keyboard interaction. The CTA must be
   fully visible inside the card, pointer-accessible and at least 44 CSS px.
2. Fresh-load 768 px regression screenshot. Card, content and CTA must remain
   unclipped.
3. At 1024 px, record card bottom, CTA top/bottom/height and visible
   intersection before focus. Then keyboard-focus media, title and action in
   natural order.
4. At 390 px, record the media-link focus ring. All four sides must remain
   visibly inside the card rather than being clipped by `overflow:hidden`.
5. Confirm no horizontal overflow at 1024, 768 or 390 and that grid columns
   remain `2 / 2 / 1`.

Write Round 2 screenshots under `QA/TASK-017/` with `r2` in the filename.
Update both canonical visual reports by appending a clearly separated Round 2
section; do not erase or rewrite Round 1 history.

## Verdict

Return `PASS` only if both Round 1 findings are closed and no new severe or
obvious difference is introduced. Report exact severe/obvious/detail counts
for the current result and reference the preserved Round 1 counts.

## Boundaries

- No frontend product/CSS/test edits in the visual lane.
- No CMS, database, Planner state, README, Git, deployment or external-system
  mutation.
- Do not recapture unaffected 1440 or 320 evidence unless needed to explain a
  newly observed regression.
- Return one controlled execution response linked to the Planner request.
