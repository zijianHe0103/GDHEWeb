# TASK-017 Frontend Dispatch

status: `AUTHORIZED_AFTER_ACK`

## Objective

Implement only the locally gated English ProductCard list slice frozen by TASK-017 DESIGN and IMPLEMENTATION_PLAN.

## Mandatory sequence

1. ACK the linked execution request before any mutation.
2. Record protected hashes/inventories and confirm the baseline.
3. For each of the four frozen seams, add a focused test first and run it to an expected behavior RED caused by missing TASK-017 code.
4. Add only the minimum production code needed for GREEN.
5. Keep focused and existing regressions green between slices.
6. Update frontend documentation and the four execution artifacts.
7. Return one controlled `execution_response` linked to the request. Do not self-review or advance task state.

## Frozen implementation

- Add one server-only mode reader using only `GDHE_PRODUCT_LIST_MODE`.
- Only non-production exact `preview` and `cms` are enabled; every other value and every production process is disabled.
- Add `/products/` as `force-dynamic`, fixed `noindex,nofollow`; disabled mode calls `notFound()`.
- Preview mode returns the one frozen FGD X15 local `ProductCardCollectionDto` and makes no network request.
- CMS mode calls existing `loadProductCardCollection({ page: 1, perPage: 12, sort: "modified_desc" })` exactly once and never calls `/resolve`.
- Enabled load failures return a closed `unavailable` page state with no error detail. Valid zero items return a distinct empty state.
- React presentation accepts only `ProductCardCollectionDto`/`ProductCardDto`.
- Add only the scoped ProductCard component family and CSS needed for page heading, preview notice, grid, cards, empty and unavailable states.
- Copy the provided FGD X15 protected PNG to a repository-relative test-candidate path and verify exact SHA-256.
- Use a reusable native responsive media component for this local slice; document that production Next Image origin/allowlist remains deferred. Do not modify `next.config.ts`.
- Use semantic HTML, visible `:focus-visible`, 44 px action target and responsive 3/2/1 columns.

## Required tests

- Closed configuration: unset/unknown disabled, non-production `preview|cms` enabled, production always disabled.
- Presentation: 0/1/N, all four frozen action/lifecycle cells, image/title/action identity, Alt, optional fields and no internal/raw content.
- Route: disabled 404, preview zero network, CMS one fixed collection request and zero `/resolve`, fixed metadata/dynamic, empty and sanitized unavailable states.
- Built production smoke: both `preview` and `cms` remain 404, zero CMS requests; `/` and existing `/integration/cms` behavior remain truthful.
- CSS/source checks sufficient to catch missing focus-visible, fixed media geometry and accidental browser API fetch.

## Allowed frontend paths

- `frontend/src/app/products/**`
- `frontend/src/components/product-card/**`
- `frontend/src/lib/product-list/**`
- `frontend/public/test-candidates/fgd-x15-protected.png`
- new `frontend/tests/product-list-*.test.ts`
- new `frontend/tests/product-list-production-smoke.mjs`
- `frontend/package.json` only if one focused verification script is required; no dependency changes
- `frontend/README.md`
- TASK-017 artifacts and `LANES/frontend/**`

## Protected paths

- `frontend/package-lock.json`, dependencies and `next.config.ts`
- all TASK-014/015/016 artifacts and product contracts
- `frontend/src/lib/cms/product-card-contract/**`
- `frontend/src/lib/cms/contracts/**`
- `frontend/src/lib/cms/server/product-cards/**`
- `frontend/src/types/product-card.ts`
- existing `/resolve` consumer and `/integration/cms`
- `frontend/src/app/globals.css`
- `cms/**`, database and external systems
- root `README.md` and Planner-owned task/project state

## Required artifacts

- `TDD_RED_EVIDENCE.md`
- `EXECUTION_REPORT.md`
- `TEST_OR_VALIDATION_LOG.md`
- `DIFF_OR_OUTPUT_SUMMARY.md`

## Final lane gates

- ProductCard verifier `8/3/6`.
- CMS verifier `16/2/2`.
- TASK-017 focused tests and production smoke.
- Existing TASK-016 ProductCard focused tests.
- Full Vitest, lint, typecheck and build.
- Protected image hash.
- package-lock/protected hashes and inventories unchanged.
- no CMS/raw/internal/absolute-path/secret leakage.
- frontend write scope, DPG project/registry/messages/strict lane and `git diff --check`.

No visual QA, adversarial review, user acceptance, Git delivery, deployment, CMS mutation, real-product import, product detail or RFQ implementation is authorized.
