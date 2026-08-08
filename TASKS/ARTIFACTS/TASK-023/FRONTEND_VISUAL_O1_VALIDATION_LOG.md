# TASK-023 Frontend Visual O1 Validation Log

Date: 2026-08-06
Runtime: Node.js 24.18.0 / npm 11.16.0 / Next.js 16.2.11

## Current-byte results

| Gate | Result |
| --- | --- |
| Direct route focused test | PASS — 1 file / 14 tests |
| Related/Product Detail focused tests | PASS — 3 files / 30 tests |
| Real Next preview responses | PASS — declared 1/3/5/7 final 200; 2/4/6/8, catalog accessory and unknown final 404 |
| Full Vitest | PASS — 51 files / 535 tests |
| Seven contract verifiers | PASS |
| ESLint | PASS — zero errors/warnings |
| TypeScript | PASS |
| Production build | PASS |
| Four production smokes | PASS |
| Protected hashes / visual evidence / leakage / diff | PASS |

## Focused and full tests

```sh
npm test -- tests/related-product-preview-detail-route.test.ts
# 1 file / 14 tests PASS

npm test -- tests/related-product-preview-detail-route.test.ts \
  tests/related-products-presentation.test.ts \
  tests/product-detail-route.test.ts
# 3 files / 30 tests PASS

npm test
# 51 files / 535 tests PASS
```

The full suite includes a real Next preview response test. Planner independently confirmed the shared preview before stopping it: declared candidates 1/3/5/7 final 200, and candidates 2/4/6/8, catalog accessory and unknown final 404.

## Contract verifiers

- CMS: `16 schemas / 2 success / 2 error` PASS.
- ProductCard: `8 schemas / 3 success / 6 error` PASS.
- Product Configuration 1.0: `4 schemas / 1 success / 6 error` PASS.
- Product Configuration 2.0: PASS.
- QuoteLine 2.0: PASS.
- RelatedProductCard: `9 schemas / 4 success / 9 error` PASS.
- Quote Basket 2.0: `1 schema / 1 success / 3 invalid` PASS.

## Static analysis and build

```sh
npm run lint
# PASS

npm run typecheck
# PASS

npm run build
# PASS
```

The production route table contains only the four new dynamic server routes: `test-candidate-1`, `-3`, `-5` and `-7`. There is no generic candidate route.

## Production smokes

```sh
node tests/cms-integration-production-smoke.mjs
node tests/product-list-production-smoke.mjs
node tests/product-detail-production-smoke.mjs
node tests/quote-basket-production-smoke.mjs
```

- CMS integration: disabled 404, enabled 200, root 200, one fixed CMS request — PASS.
- Product list: preview/cms final 404, root 200, integration 404, CMS requests 0 — PASS.
- Product detail/candidates: default/preview/cms all final 404, CMS requests 0 — PASS.
- Quote Basket: preview/cms final 404, CMS requests 0, submission endpoints 0 — PASS.

## Integrity

- package.json: `958e8c8937ef092c75295e8a09de6062059df431e3419a70b5b661706ac02bce`.
- package-lock.json: `dda25a9069e1c1b41c4f94393a54d3e9eb3dcfea158fc2b6bbdf06cc1cb852a7`.
- protected image: `9a8ed9fe7145ae582450425be493987ad874d052c176e340d28d7d24bf0d4880`.
- ProductCard type/manifest/verifier and QuoteLine v1/v2 hashes match `PROTECTED_BASELINE.md`.
- all 19 historical Visual Round 1 files match `VISUAL_EVIDENCE_MANIFEST.sha256`; the detailed QA inventory reduces to the same hash/path stream.
- candidate landing source contains no Article Number, Product/Media/taxonomy UUID, WordPress/SCF/Feishu marker, raw action, price/payment/checkout or Add to Quote marker.
- `git diff --check` PASS.

## Runtime ownership note

The first combined listener run was safely interrupted by the Planner-owned `.next/dev/lock`; this was recorded as an environment conflict, not a product failure. No foreign process was stopped. After Planner stopped its preview, the exact current-workspace full test, build and smoke gates above passed. No temporary source-copy workaround was used.
