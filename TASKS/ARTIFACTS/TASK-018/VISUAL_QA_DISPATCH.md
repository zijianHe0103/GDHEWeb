# TASK-018 Visual QA Round 1 Dispatch

status: `AUTHORIZED_AFTER_MESSAGE_ACK`
owner: `visual_qa`

## Objective

Independently verify the local-only FGD X15+PVC Product Detail slice at
`/products/fgd-x15-pvc/` after the Planner implementation checkpoint passed.
This is a visual/accessibility evidence gate, not a product-code revision.

## Runtime

Use Node `24.18.0` and start one non-production local server with:

```sh
GDHE_PRODUCT_LIST_MODE=preview \
GDHE_PRODUCT_DETAIL_MODE=preview \
npm run dev
```

Record the actual port and stop the server after capture.

## Required evidence

1. Fresh full-page screenshots at exact CSS widths:
   - 1440 px;
   - 1024 px;
   - 768 px;
   - 390 px.
2. Fresh 320 CSS px reflow proof:
   - screenshot;
   - `scrollWidth <= clientWidth`;
   - no clipped heading, image, notice, specification value or CTA.
3. Product identity and modules:
   - only `FGD X15+PVC` / `FGD X15+PVC Track`;
   - protected image visible at the intended ratio with non-empty accurate Alt;
   - Product Hero, Product Overview and exactly five Key Specifications;
   - local test-candidate notice visible;
   - no `/products/fgd-x15/` second identity.
4. Navigation and interaction:
   - from `/products/`, the FGD X15+PVC card title/image/View Product path enters
     `/products/fgd-x15-pvc/`;
   - category link target is
     `/products/curtain-track-systems/manual-curtain-tracks/`;
   - Request a Quote target is `/request-a-quote/`;
   - CTA remains fully visible, at least 44 CSS px high and its center hit-test
     resolves to the CTA;
   - natural keyboard order is category then Request a Quote, with visible
     focus indicators.
5. Responsive layout:
   - hero media/content balance;
   - heading and body readability;
   - overview/specification spacing;
   - desktop two-column to mobile one-column transition;
   - no horizontal overflow or overlap.
6. Browser-facing safety:
   - no WordPress/CMS URL, `wp-content`, Article Number, internal product code,
     raw payload or diagnostic in rendered markup/network;
   - console errors and warnings recorded.

## Difference grading

Return one current verdict:

- `PASS` only with severe `0`, obvious `0`, detail `0`; or
- `FAIL` with exact severe, obvious and detail counts.

For every finding, record viewport, reproducible measurement or screenshot,
user impact and the smallest proposed frontend correction. Preserve all
Round 1 evidence if a Round 2 becomes necessary.

## Allowed writes

- `QA/TASK-018/**`;
- `TASKS/ARTIFACTS/TASK-018/VISUAL_QA_REPORT.md`;
- `LANES/visual_qa/**`.

## Protected scope

Do not edit frontend product code, CSS, tests, README, CMS, task authority,
Planner state, dependencies, Git or external systems. If any finding needs a
fix, return it to Planner; do not repair it in the visual lane.

## Stop boundary

Stop after one controlled `execution_response` linked to the visual request.
Do not perform adversarial review, user acceptance, commit, push, merge,
deployment or later Product Detail modules.
