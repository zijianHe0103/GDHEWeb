# TASK-023 Frontend Visual O1 Revision Report

Date: 2026-08-06
Controlled request: `MSG-TASK-023-FRONTEND-VISUAL-O1-R1`
Result: `PASS_FOR_PLANNER_CHECKPOINT`

## Historical finding preserved

Visual QA Round 1 remains the canonical historical `FAIL / severe 0 / obvious 1 / detail 0`. This revision closes only O1: the four declared preview `View Product` actions no longer end at a same-origin 404. No Visual Round 2, adversarial review, acceptance, Git delivery or deployment was performed.

## Strict RED/GREEN

The first focused test was added before the landing implementation:

```sh
cd frontend
PATH=/Users/arron/.nvm/versions/node/v24.18.0/bin:/usr/bin:/bin:/usr/sbin:/sbin \
npm test -- tests/related-product-preview-detail-route.test.ts
```

RED was meaningful and limited to the missing behavior: Vitest reported one failed suite because `../src/app/products/[slug]/page` did not exist. No product file had been added at that point.

The minimum GREEN is a closed server-only renderer plus four static Next routes:

- `/products/test-candidate-1/` — Ceiling Bracket;
- `/products/test-candidate-3/` — Track Connector;
- `/products/test-candidate-5/` — Glider Set;
- `/products/test-candidate-7/` — Suspension Kit.

Each route is available only when `GDHE_PRODUCT_DETAIL_MODE=preview` outside production, exports `noindex,nofollow`, uses the existing protected local 800 x 800 image, and presents explicit `TEST_CANDIDATE` / non-production / navigation-preview wording. It has no CTA, commerce claim, network call or internal identity.

An intermediate generic `[slug]` route made the Next page surface broader than required and caused full lint to reclassify an unrelated protected Quote Basket link. Instead of editing Quote Basket, the implementation was narrowed to four literal route entries. Final lint and all regression gates pass.

## Closed behavior

- Preview: exactly candidates 1/3/5/7 return meaningful HTTP 200 landings.
- Preview: candidates 2/4/6/8, the catalog-accessory path and unknown paths remain final 404.
- Unset, disabled and CMS modes return framework 404 before any fetch.
- Every production build returns final 404 for FGD detail plus every declared, undeclared and catalog candidate path under default/preview/cms environment values, with zero CMS requests.
- The original preview candidate order, action bytes and hrefs are unchanged.
- Product Detail FGD route, RelatedProductCard/CMS/Quote Basket contracts, CSS/layout, package/lock, protected image, Planner documents and all 19 Visual Round 1 evidence files are unchanged.

## Files in this revision

- `frontend/src/lib/related-products/preview-detail-page.tsx`
- `frontend/src/app/products/test-candidate-{1,3,5,7}/page.tsx`
- `frontend/tests/related-product-preview-detail-route.test.ts`
- `frontend/tests/product-configurator-preview-response.test.ts`
- `frontend/tests/product-detail-production-smoke.mjs`
- `frontend/README.md`
- this report, the revision validation log and `LANES/frontend/worklog.md`

## Boundary

This is a local preview navigation seam, not a generic Product Detail template, published product, compatibility statement, production route authorization or visual acceptance. Planner owns the independent checkpoint and any later Visual QA Round 2 dispatch.
