# TASK-023 Frontend Unified Cards R1 Report

Date: 2026-08-08
Lane: `frontend`
Request: `MSG-TASK-023-FRONTEND-UNIFIED-CARDS-R1`
Result: `PASS_FOR_PLANNER_CHECKPOINT`

## Preserved history and scope

The request was acknowledged before mutation. Canonical Visual Round 1/2
failures, Visual Round 3 PASS, Adversarial Round 1 failure, Adversarial Round 2
PASS and their evidence files remain unchanged. This revision touched only the
RelatedProducts presentation/public return-state seam, its direct test,
frontend behavior documentation, this revision evidence and the frontend lane
worklog.

No CMS, API, Schema, snapshot, verifier, Quote Basket contract, package,
lockfile, ProductCard/ProductList, final RFQ, Feishu, Planner authority, QA
evidence, Git or deployment work was performed.

## Strict TDD evidence

The first focused command ran after only the new behavioral tests were added:

```sh
cd frontend
PATH=/Users/arron/.nvm/versions/node/v24.18.0/bin:/usr/bin:/bin:/usr/sbin:/sbin \
  npm test -- tests/related-products-presentation.test.ts
```

It exited `1`: one file ran, six prior tests passed and four assertions failed.
The failures were the intended missing-behavior evidence:

1. the current cards had no shared semantic `figure` region;
2. the accessory draft builder rejected direct add without quantity input;
3. the public return-state key and serializer/parser did not exist;
4. the component still contained card-level quantity state and UI.

After the minimum implementation, the same command exited `0` with one file
and ten tests passing. One intermediate GREEN run exposed only a test/CSS
selector mismatch; the CSS was narrowed so the common action control alone owns
full width, then the focused test passed. A later test-only compatibility cleanup
renamed a local variable and replaced an ES2018-only RegExp flag; production
behavior was unchanged.

## Minimum implementation

- Every recommendation now uses the same semantic
  `article > figure + body(information + footer action)` skeleton. Both truthful
  action labels use one full-width action-control geometry, while canonical
  `View Product` hrefs remain unchanged.
- Accessory cards no longer render quantity labels, inputs or inline quantity
  errors. Deliberate `Add to Quote` creates a validated `catalog_accessory`
  draft with quantity `1`. The existing Quote Basket adapter performs the
  persistent add and deterministic repeat-add merge; later quantity editing and
  removal remain on the existing Basket route.
- A canonical View Product activation stores only a session-scoped version,
  source `visibleCount` and browser scroll position. Return parsing is closed,
  exact-key, non-negative safe-integer and clamped to the current item count;
  the entry is consumed once. No product UUID, Article Number, CMS/WordPress,
  Feishu identity, raw response or diagnostic is stored.
- Existing initial three, next three and final seven behavior, focus handoff,
  polite live announcements, View Quote Basket, protected local media, one
  related collection request, zero per-card resolve, server-only consumer and
  production/CMS fail-closed boundaries remain intact.

## Files changed by this revision

- `frontend/src/components/related-products/index.tsx`
- `frontend/src/components/related-products/related-products.module.css`
- `frontend/tests/related-products-presentation.test.ts`
- `frontend/README.md`
- `TASKS/ARTIFACTS/TASK-023/FRONTEND_UNIFIED_CARDS_R1_REPORT.md`
- `TASKS/ARTIFACTS/TASK-023/FRONTEND_UNIFIED_CARDS_R1_VALIDATION_LOG.md`
- `LANES/frontend/worklog.md`

## Outcome and next gate

Current frontend-owned bytes pass the direct, full, contract, build, production
smoke, protected-hash, leakage, cleanup and governance gates recorded in the
companion validation log. This is a frontend execution checkpoint only; it is
not Visual QA, adversarial review, user acceptance, Git delivery or deployment.
The unique next step is Planner independent validation and checkpoint control.
