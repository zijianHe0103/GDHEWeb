# TASK-017 Frontend Visual Round 1 Narrow Revision

status: `READY_FOR_FRONTEND_REVISION`
source: `MSG-TASK-017-VISUAL-QA-R1-RESPONSE`

## Findings to close

1. At a fresh 1024 CSS px render, the 44 px `View Product` action intersects
   the clipping card by only about `0.4375px`; it is visually absent and is
   not a normal pointer target. Keyboard focus causes a later reflow but does
   not repair initial presentation.
2. The media-link focus outline is drawn outside the card and is clipped on
   three sides. It remains barely detectable and is a detail finding.

Canonical evidence:

- `QA/TASK-017/VISUAL_QA_REPORT.md`
- `QA/TASK-017/products-1024-cta-missing.png`
- `QA/TASK-017/focus-1024-action.png`
- `QA/TASK-017/focus-390-media.png`

## Authorized revision

Use strict narrow TDD and modify only:

- `frontend/src/components/product-card/product-card.module.css`
- the directly corresponding TASK-017 focused test if required;
- TASK-017 execution/validation/diff/TDD artifacts and frontend worklog.

Required behavior:

- At the existing `max-width: 64rem` two-column breakpoint, the card body must
  size from content rather than retain the desktop calculated height.
- The media-link focus indicator must remain inside the clipping card and be
  visibly complete without changing link semantics, DOM order or card radius.

The expected minimal implementation is a `height: auto` override at the
existing 64rem breakpoint plus an inside-card media-link focus treatment.
Choose no broader redesign.

## TDD and validation

1. Add or adjust one focused source/style assertion that is RED against the
   current CSS and directly describes both required rules.
2. Apply the minimum CSS GREEN.
3. Re-run:
   - ProductList focused tests;
   - TASK-016 five-file focused regressions;
   - full Vitest;
   - both contract verifiers;
   - lint, typecheck and production build;
   - production fail-closed smoke.
4. Reconfirm protected image, package/lock, contracts/runtime, CMS and
   Planner-owned files are unchanged by the revision.
5. Return one controlled revision `execution_response` linked to the Planner
   request. Do not run visual QA in the frontend lane.

## Boundaries

- No component content/markup/action/DTO/data change.
- No new breakpoint, global CSS, dependency, lockfile or Next config change.
- No CMS, database, real product, detail, RFQ, SEO, multilingual, deployment,
  Git, acceptance or Planner-state work.
- Preserve all Round 1 PASS evidence and history.
