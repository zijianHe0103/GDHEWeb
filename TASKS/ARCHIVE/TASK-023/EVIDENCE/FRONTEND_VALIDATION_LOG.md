# TASK-023 Frontend Validation Log

Date: 2026-08-06
Runtime: Node.js 24.18.0 / npm 11.16.0

## Current-byte automated gates

| Gate | Result |
| --- | --- |
| TASK-023 focused plus direct v1/server-only regressions | PASS — 14 files / 110 tests |
| Full Vitest | PASS — 50 files / 511 tests |
| ESLint | PASS — zero errors/warnings |
| TypeScript `tsc --noEmit` | PASS |
| Next.js 16.2.11 production build | PASS |
| Real preview HTML/Flight leakage test | PASS — 2/2 |
| Related server-only Client import builds | PASS — public/deep Transport/Validator/Adapter rejected; 8/8 combined ProductCard test cells |

Focused command:

```sh
cd frontend
PATH=/Users/arron/.nvm/versions/node/v24.18.0/bin:/usr/bin:/bin:/usr/sbin:/sbin \
npm test -- tests/related-product-card-contract-snapshot.test.ts tests/related-product-card-transport.test.ts tests/related-product-card-runtime.test.ts tests/product-detail-loader.test.ts tests/product-detail-route.test.ts tests/product-configurator-preview-response.test.ts tests/quote-basket-v2-contract.test.ts tests/quote-basket-v2.test.ts tests/related-products-presentation.test.ts tests/quote-basket-domain.test.ts tests/quote-basket-storage.test.ts tests/quote-basket-product-integration.test.ts tests/quote-basket-route.test.ts tests/product-card-server-only.test.ts
```

## Contract verifiers

All seven current verifiers passed:

- CMS: `16 schemas / 2 success / 2 error`;
- ProductCard: `8 schemas / 3 success / 6 error`;
- Product Configuration 1.0: `4 schemas / 1 success / 6 error`;
- Product Configuration 2.0: PASS;
- QuoteLine 2.0: PASS;
- RelatedProductCard: `9 schemas / 4 success / 9 error`;
- Quote Basket 2.0: `1 schema / 1 success / 3 invalid`.

## Production smokes

- CMS integration: disabled 404, enabled 200, root 200, one fixed CMS request — PASS.
- Product list: preview/cms final 404, root 200, integration 404, CMS requests 0 — PASS.
- Product detail: preview/cms final 404, CMS requests 0 — PASS.
- Quote Basket: preview/cms final 404, CMS requests 0, submission endpoints 0 — PASS.

## Security and contract evidence

- Exact CMS orchestration: one Product Detail `/resolve`, one Product Configuration request, one RelatedProductCard collection request, zero per-card `/resolve`.
- Preview response contains the visible recommendation module but no Product/Media/taxonomy UUID prefixes, `view_product`, `direct_rfq`, `modifiedAt`, `directQuote`, Article Number, WordPress/SCF/Feishu marker, CMS origin or diagnostic.
- CMS response with Schema-valid hostile HTTPS related media produces no recommendation markup, remote image/preload or origin leakage.
- Normalized HTTP error bodies validate, then become unreachable on the outward error.
- Timeout, caller abort, redirect, 304-without-cache and no-retry behavior pass focused tests.
- v2 migration, TTL, same-origin reconciliation, hostile items-array accessor, safe-integer/overflow, add/merge/split/quantity/remove and v1 configured-product regressions pass.

## Protected baseline

The following SHA-256 values exactly match `PROTECTED_BASELINE.md`:

- package.json `958e8c8937ef092c75295e8a09de6062059df431e3419a70b5b661706ac02bce`;
- package-lock.json `dda25a9069e1c1b41c4f94393a54d3e9eb3dcfea158fc2b6bbdf06cc1cb852a7`;
- next-env.d.ts `7b550dda9686c16f36a17bf9051d5dbf31e98555b30d114ac49fc49a1e712651`;
- protected image `9a8ed9fe7145ae582450425be493987ad874d052c176e340d28d7d24bf0d4880`;
- ProductCard type/manifest/verifier, QuoteLine v1/v2, Quote Basket v1 type/domain/storage/index, CMS ProductCard Schemas/source and TASK-014 manifest/checksum hashes all match.

Package/lock and protected-file diffs are empty. The pre-existing `frontend/tsconfig.json` diff was not changed or reformatted by this lane.

## Governance and cleanup

- `git diff --check`: PASS.
- DPG project validation: PASS (`DPG-LANES-1.0.0`).
- DPG message validation: PASS.
- strict lane audit: PASS, zero issues.
- No `.tmp-*` root or task-owned Next.js listener remains.
- Final `.next` build output was moved recoverably to the system Trash after smoke evidence; `next-env.d.ts` has no diff.
