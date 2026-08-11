# TASK-025 Frontend A4 Diff Summary

## New A4 files

- `frontend/src/lib/quote-basket-contract/v3/**`: four-file independent contract snapshot.
- `frontend/scripts/verify-quote-basket-v3-contract.mjs`: offline closed-inventory verifier.
- `frontend/src/types/quote-basket-v3.ts`: frozen public v3 line/state union.
- `frontend/src/lib/quote-basket/v3/index.ts`: domain, migration, storage and reconciliation runtime.
- `frontend/src/lib/quote-basket/v3/batch.ts`: server-only ordered A3 batch projection/application/orchestration.
- `frontend/tests/quote-basket-v3-*.test.ts`: eight focused contract/domain/storage/configured/accessory/browser/batch/server-only files.

## Minimal shared frontend seams

- Product Configuration public projection/build path now carries exact selected standard Article Number into a v3 draft; custom remains null/sales follow-up.
- RelatedProductCard 2.0 public projection and direct accessory action carry exact Article Number; v1 behavior is preserved.
- Existing browser adapter/hook and ProductConfigurator/RelatedProducts actions use v3 domain/storage.
- Quote Basket rows render migration recovery copy and use local index control IDs rather than exposing entry UUIDs.
- Directly corresponding legacy tests now assert the v3 migration truth; preview response proof distinguishes permitted Flight data from forbidden deliberate visible rendering.
- `frontend/README.md` documents only the current A4 behavior and exclusions.

## Explicitly unchanged

- Quote Basket 1.0/2.0, QuoteLine 2.0, Product Configuration 2.0 and RelatedProductCard 1.0 frozen contract bytes.
- A3 Transport/Validator/Adapter semantics and A3 snapshot authority.
- `frontend/package.json`, `frontend/package-lock.json`, `frontend/tsconfig.json`, `frontend/next-env.d.ts` and the protected image.
- CMS/database, TASK-024 and Planner-owned authority, routes, final RFQ/customer form/Basket clearing/Feishu, visual/review evidence and Git state.
