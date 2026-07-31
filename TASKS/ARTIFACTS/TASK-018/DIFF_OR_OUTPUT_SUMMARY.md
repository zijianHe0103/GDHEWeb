# TASK-018 Diff and Output Summary

status: `COMPLETE`

## New production paths

- `frontend/src/types/product-detail.ts`
- `frontend/src/lib/product-detail/config.ts`
- `frontend/src/lib/product-detail/preview.ts`
- `frontend/src/lib/product-detail/load.ts`
- `frontend/src/lib/cms/server/product-detail/adapter.ts`
- `frontend/src/components/product-detail/index.tsx`
- `frontend/src/components/product-detail/product-detail.module.css`
- `frontend/src/app/products/fgd-x15-pvc/page.tsx`
- `frontend/src/app/products/fgd-x15-pvc/page.module.css`

## New focused validation paths

- `frontend/tests/product-detail-config.test.ts`
- `frontend/tests/product-detail-adapter.test.ts`
- `frontend/tests/product-detail-loader.test.ts`
- `frontend/tests/product-detail-route.test.ts`
- `frontend/tests/product-detail-production-smoke.mjs`

## Updated authorized paths

- `frontend/README.md`
- `LANES/frontend/worklog.md`
- TASK-018 execution evidence in this directory

## Visible output

- One local-only responsive detail page for `FGD X15+PVC Track`.
- Product Hero with protected square track image, category, model, H1, local
  candidate notice and navigation-only CTA.
- Product Overview with replaceable local/CMS plain text.
- Key Specifications with exactly five semantic definition rows.
- Fixed sanitized unavailable state.
- Disabled and validated not-found states use framework 404.

## No-change proof

- No package, lockfile or dependency delta.
- No root README delta; the proposed Planner paragraph is recorded in
  `EXECUTION_REPORT.md`.
- No CMS, database, Feishu or external-system mutation.
- No existing Transport, URL builder, Validator, contract Snapshot,
  ProductCard or ProductList implementation delta.
- No `src/app` route other than the authorized
  `products/fgd-x15-pvc` subtree was changed.
- No visual QA, formal SEO, working RFQ, review, acceptance, Git delivery or
  deployment was performed.

## Planner checkpoint R1 delta

- Updated only the existing Product Detail notice expression so CMS ready
  markup remains visibly local and non-production.
- Extended `frontend/tests/product-detail-route.test.ts` with one authentic
  hostile-media CMS-to-rendered-markup proof.
- Added `frontend/tests/product-detail-server-only.test.ts` for loader and deep
  Adapter Client Component build negatives plus marker-stripped controls.
- Updated only direct frontend documentation, these TASK-018 evidence files
  and the frontend lane worklog.
- No DTO/Adapter mapping, loader, Transport, Validator, contract, ProductCard,
  ProductList, CMS, dependency, root README or Planner-state delta.

## Visual Round 1 CSS revision delta

- Updated only Product Detail local CSS to make Hero, Overview and
  Specifications border-box width-safe.
- Let Hero use the full Product Detail article width instead of the inherited
  global `42rem` cap.
- Replaced word-internal H1 wrapping with normal word-boundary wrapping.
- Added one directly corresponding source-level regression in the existing
  Product Detail route test.
- Added `FRONTEND_VISUAL_R1_REVISION.md` and appended current-byte RED/GREEN and
  validation evidence to existing TASK-018 artifacts and frontend worklog.
- Preserved global CSS, DOM, semantics, DTO, Adapter, loader, Transport,
  Validator, data, wording, routes, links, dependencies, other product paths,
  Planner state and the independent visual history.
