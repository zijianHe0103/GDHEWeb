# TASK-023 Frontend Visual O2 Revision Report

Date: 2026-08-06
Controlled request: `MSG-TASK-023-FRONTEND-VISUAL-O2-R2`
Result: `PASS_FOR_PLANNER_CHECKPOINT`

## Historical evidence preserved

- Visual Round 1 remains `FAIL / severe 0 / obvious 1 / detail 0` for the original dead `View Product` actions.
- Visual Round 2 remains `FAIL / severe 0 / obvious 1 / detail 0`; O1 was independently closed, while O2 recorded `scrollWidth=832` at 768/390/320 CSS px on the new landing pages.
- All 36 canonical visual files, including the 17 Round 2 files, remain byte-identical. This revision did not edit or replace visual evidence.

## Strict RED/GREEN

Before product mutation, one direct test read the real renderer and expected local responsive structure and CSS:

```sh
cd frontend
PATH=/Users/arron/.nvm/versions/node/v24.18.0/bin:/usr/bin:/bin:/usr/sbin:/sbin \
npm test -- tests/related-product-preview-detail-route.test.ts
```

RED: 1 of 15 tests failed while the prior 14 route/security tests passed. The exact failure was the absence of `preview-detail-page.module.css` and its import in the unstyled renderer. This matches the Visual Round 2 cause: the main/content/image had no width constraint, so the intrinsic 800 px image produced the 832 px document width.

GREEN: 15 of 15 tests pass after the minimum local change.

## Minimum correction

- The existing landing now renders `main > article`, providing a semantic content container without changing visible copy or route behavior.
- `main` is `box-sizing:border-box`, `width:100%`, `max-width:100%` with responsive padding.
- The article is `width:100%`, `max-width:50rem`, `min-width:0` and centered.
- The existing protected Next Image keeps its exact source, alt and intrinsic 800 x 800 dimensions, while CSS applies `width:100%`, `max-width:100%` and `height:auto`.
- Headings and paragraphs stay within the container and use `overflow-wrap:break-word`.
- No `overflow:hidden`, `overflow:clip`, clipping, fixed viewport breakpoint or remote asset was added.

## Preserved boundaries

- Route inventory remains exactly candidates 1/3/5/7; no generic, even-numbered, accessory or unknown route was added.
- `noindex,nofollow`, TEST_CANDIDATE/non-production truth, protected source/alt, zero network/internal identity/commerce action and production/CMS fail-closed behavior remain unchanged.
- Product Detail, Related Products, Quote Basket, contracts, APIs, DTOs, candidate data/order/actions, package/lock, CMS, Planner authority and Git were not changed.

## Files changed by O2

- `frontend/src/lib/related-products/preview-detail-page.tsx`
- `frontend/src/lib/related-products/preview-detail-page.module.css`
- `frontend/tests/related-product-preview-detail-route.test.ts`
- this report, the O2 validation log and `LANES/frontend/worklog.md`

This is implementation evidence only. Planner owns the independent checkpoint and any Visual QA retest.
