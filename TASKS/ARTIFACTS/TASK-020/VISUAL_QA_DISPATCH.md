# TASK-020 Visual QA Dispatch

## Authority and runtime

- task: `TASK-020`;
- page: `http://127.0.0.1:3000/products/fgd-x15-pvc`;
- server owner: Planner unified exec session `45587`;
- mode: local `GDHE_PRODUCT_DETAIL_MODE=preview`;
- implementation checkpoint: `FRONTEND_PLANNER_CHECKPOINT_PASS.md`;
- production remains disabled and this local page is `noindex,nofollow`.

The visual lane must not start, stop or reconfigure the server and must not edit
frontend/CMS/task-authority files. It may write only `QA/TASK-020/**`, TASK-020
visual artifacts and its own lane records.

## Required viewport evidence

Capture current-page evidence at exact CSS viewport widths:

- 1440 desktop;
- 1024 small desktop/tablet landscape;
- 768 tablet;
- 390 phone;
- 320 CSS-pixel reflow proof.

Record viewport, DPR, screenshot pixel dimensions, actual image encoding and
SHA-256. Use real PNG encoding for files named `.png`; verify magic bytes.

## Required page states

1. Default initial form:
   - one real `6 m — Ivory White` standard option;
   - no installation or base packaging preselected;
   - quantity empty;
   - Logo off and protection None;
   - customer labels exactly match the frozen wording.
2. Invalid submit:
   - press `Add to Quote` without installation, packaging or quantity;
   - no latest line appears;
   - visible sanitized inline errors are associated to controls;
   - focus/keyboard order remains usable.
3. Valid standard result:
   - standard 6 m, Ceiling Mount, Standard Packaging, Logo No, protection None,
     quantity 2;
   - latest summary contains all frozen customer fields;
   - no Article Number, raw enum, JSON, internal field or sent/saved claim.
4. Valid custom replacement:
   - switch to Custom Length, enter 5.8 m, Ivory White, Wall Mount, Carton
     Packaging, Customer Logo Printing Yes, Single-piece Bagging, quantity 1;
   - latest summary changes to the custom line and the prior standard summary is
     not appended or retained as a second item.

## Interaction and accessibility

- keyboard-only traversal, native control operation and submit;
- visible focus at all interactive elements;
- labels, fieldsets/legends, error associations and `aria-live` result;
- touch targets and readable text at 390/320;
- 320 CSS px has no horizontal page or component overflow;
- `prefers-reduced-motion: reduce` produces no essential-motion loss;
- browser network proof shows no WordPress/external media, ProductCard,
  submission, Feishu or unexpected request from form interactions.

## Visual grading

Return `PASS`, `FAIL` or `BLOCKED` and classify findings as:

- severe difference;
- obvious difference;
- detail difference.

Prioritize severe and obvious differences. This QA judges the TASK-020 local
component slice and responsive/interaction integrity; it does not declare the
whole website's final brand system, SEO copy or production readiness.

## Required artifacts

- `QA/TASK-020/**` screenshots and inventories;
- `TASKS/ARTIFACTS/TASK-020/VISUAL_QA_REPORT.md`;
- one linked `visual_qa_response` with exact counts and evidence paths.

Do not fix findings. Do not run adversarial review, acceptance, Git, deployment,
Basket, persistence, submission or Feishu work.
