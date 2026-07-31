# TASK-018 Visual QA Round 1 Recovery Dispatch

status: `READY_FOR_CONTROLLED_REDISPATCH`
source: `MSG-TASK-018-VISUAL-QA-R1-RESPONSE`

## Purpose

Recover the original Product Detail visual gate after Round 1 ended as
`BLOCKED_NO_VISUAL_EVIDENCE`. The blocked report is retained as execution
history and is neither a product `PASS` nor a product `FAIL`.

This recovery repeats the same Round 1 acceptance scope in a fresh
browser-control turn. It does not authorize product fixes or expand TASK-018.

## Verified Runtime

Planner has already started the current shared checkout on
`http://localhost:3000` with both local preview modes:

```sh
GDHE_PRODUCT_LIST_MODE=preview
GDHE_PRODUCT_DETAIL_MODE=preview
```

Read-only HTTP verification on the current shared bytes returned:

- `/products/`: `200`;
- `/products/fgd-x15-pvc/`: `200`.

Use this already-running origin. Do not start a second server, use port `3001`,
create a temporary source copy, or stop the existing port `3000` process.

## Required Fresh Evidence

1. Capture full-page Product Detail screenshots at exact CSS widths:
   - 1440 px;
   - 1024 px;
   - 768 px;
   - 390 px.
2. Capture 320 CSS px reflow evidence and record
   `scrollWidth <= clientWidth`.
3. From `/products/`, verify the FGD X15+PVC card image, title and
   `View Product` path enter `/products/fgd-x15-pvc/`.
4. Verify the detail page shows:
   - `FGD X15+PVC` and `FGD X15+PVC Track`;
   - the protected local image with accurate non-empty Alt;
   - Product Hero, Product Overview and exactly five Key Specifications;
   - the visible local test-candidate notice;
   - no `/products/fgd-x15/` second identity.
5. Verify link and interaction boundaries:
   - category target
     `/products/curtain-track-systems/manual-curtain-tracks/`;
   - Request a Quote target `/request-a-quote/`;
   - CTA is fully visible, at least 44 CSS px high, and its center hit-test
     resolves to the CTA;
   - keyboard order is category then Request a Quote and focus is visible.
6. Verify responsive behavior:
   - desktop two-column Hero becomes a mobile one-column layout;
   - image/content balance, type, spacing and specification readability;
   - no clipped heading, image, notice, specification value or CTA;
   - no overlap or horizontal overflow.
7. Inspect browser-facing output:
   - record console errors and warnings;
   - no WordPress/CMS origin, `wp-content`, Article Number, internal product
     code, raw payload or diagnostic in rendered markup or browser network.

## Verdict

Return one fresh current verdict:

- `PASS` only when severe `0`, obvious `0`, detail `0`; or
- `FAIL` with exact counts, viewport, reproducible measurement or screenshot,
  user impact and smallest proposed frontend correction.

The previous `BLOCKED_NO_VISUAL_EVIDENCE` history must remain in both reports.
Append a clearly separated recovery-run section; do not erase or relabel the
blocked run.

## Allowed Writes

- `QA/TASK-018/**`;
- `TASKS/ARTIFACTS/TASK-018/VISUAL_QA_REPORT.md`;
- `LANES/visual_qa/**`.

## Protected Scope

Do not edit frontend product code, CSS, tests, README, CMS, task authority,
Planner state, dependencies, Git, deployment or external systems. If the
browser-control surface blocks again, return a precise blocker without
substituting HTTP evidence or using another browser surface.

## Stop Boundary

Stop after one controlled `execution_response` linked to the recovery request.
Do not perform adversarial review, user acceptance, commit, push, merge,
deployment or later Product Detail modules.
