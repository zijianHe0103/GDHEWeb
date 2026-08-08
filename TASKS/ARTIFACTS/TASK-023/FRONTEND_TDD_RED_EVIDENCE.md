# TASK-023 Frontend TDD RED Evidence

Date: 2026-08-06
Runtime: Node.js 24.18.0 / npm 11.16.0

All RED runs used the shared current repository bytes and preceded the corresponding production addition.

## A3 contract snapshot

Command:

```sh
cd frontend
npm test -- tests/related-product-card-contract-snapshot.test.ts
```

Result: exit 1. Vitest could not load `scripts/verify-related-product-card-contract.mjs` (`MODULE_NOT_FOUND`). This was the expected missing verifier/snapshot behavior.

## A4 Transport

Command:

```sh
cd frontend
npm test -- tests/related-product-card-transport.test.ts
```

Result: exit 1. Vitest could not import `src/lib/cms/server/related-product-cards/errors`. This was the expected missing server-only Transport surface.

## A4 runtime Validator and Adapter

Command:

```sh
cd frontend
npm test -- tests/related-product-card-runtime.test.ts
```

Result: exit 1. Vitest could not import `src/lib/cms/server/related-product-cards/adapter`. This was the expected missing runtime consumer.

## A4 Product Detail orchestration

Command:

```sh
cd frontend
npm test -- tests/product-detail-loader.test.ts
```

Result: exit 1 with 2 focused failures. The ready state had no `relatedProducts`, and the expected third fixed related-products request was absent. Existing detail/configuration tests remained green.

## A5 Quote Basket 2.0

Command:

```sh
cd frontend
npm test -- tests/quote-basket-v2.test.ts
```

Result: exit 1. Vitest could not import `src/lib/quote-basket/v2`. This was the expected missing public union/migration domain.

The additional offline-contract RED used:

```sh
cd frontend
npm test -- tests/quote-basket-v2-contract.test.ts
```

Result: exit 1 because `scripts/verify-quote-basket-v2-contract.mjs` did not exist.

## A6 visible module

Command:

```sh
cd frontend
npm test -- tests/related-products-presentation.test.ts
```

Result: exit 1. Vitest could not import `src/components/related-products`. This was the expected missing public projection and progressive UI.

## RED integrity

- No RED was caused by dependency installation, package/lock mutation, CMS mutation or a synthetic forced assertion.
- The later GREEN changes were restricted to the behavior named by each RED.
- A single validation command was initially launched from the repository root and returned npm `ENOENT` because that directory has no `package.json`; it made no product change and was immediately rerun from `frontend/`.
