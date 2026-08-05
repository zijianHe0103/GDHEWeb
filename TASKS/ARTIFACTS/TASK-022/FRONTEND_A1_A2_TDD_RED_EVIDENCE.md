# TASK-022 Frontend A1/A2 TDD RED Evidence

Date: 2026-08-05
Runtime: Node `24.18.0`, npm `11.16.0`
Scope: frontend A1/A2 only

## RED 1 — missing public Basket contract and domain

Test added first: `frontend/tests/quote-basket-domain.test.ts`.

```sh
cd frontend
PATH=/Users/arron/.nvm/versions/node/v24.18.0/bin:/usr/bin:/bin:/usr/sbin:/sbin \
  npm test -- tests/quote-basket-domain.test.ts
```

Result: exit `1`; one suite failed before collection with
`Cannot find module '../src/lib/quote-basket'`. This was the intended
missing-contract/domain failure. No production Basket file existed.

Minimum GREEN introduced the closed public types, runtime validation, deep
freeze and create/add/summary seam. The first focused result was 1 file / 1
test PASS.

## RED 2 — missing 30-day persistence

Test added first: `frontend/tests/quote-basket-storage.test.ts`.

```sh
cd frontend
PATH=/Users/arron/.nvm/versions/node/v24.18.0/bin:/usr/bin:/bin:/usr/sbin:/sbin \
  npm test -- tests/quote-basket-storage.test.ts
```

Result: exit `1`; 1 test failed at the first persistence call with
`TypeError: persistQuoteBasket is not a function`. This was the intended
missing-persistence failure.

Minimum GREEN introduced dependency-free serialization/parsing, the fixed key,
30-day TTL, 256 KiB UTF-8 ceiling and injected storage/time/ID seams. The first
storage result was 1 file / 1 test PASS.

## RED 3 — closed contract invariants

After the primary A1/A2 seams were green, two focused regressions were added
before their fixes:

- local image traversal `/test-candidates/../private/product.png` was accepted;
- a stored document could contain two entry IDs with the same complete public
  identity.

Result: exit `1`; 16 tests total, 14 passed and exactly these 2 failed with
“expected function to throw, but it did not”. Minimum GREEN tightened the local
image URL grammar and rejected duplicate public identities during validation.

## RED 4 — reflection failure sanitization

A hostile Proxy whose `getPrototypeOf` trap threw a private diagnostic was
passed through the public validation seam. Result: exit `1`; 17 tests total,
16 passed and the new test failed because the raw `Error` escaped instead of a
`QuoteBasketDomainError`. Minimum GREEN normalized reflective failures at the
closed-record boundary.

## Final focused GREEN

```text
Test Files  2 passed (2)
Tests       25 passed (25)
```

The final cases cover zero/one/N, every merge/split dimension, standard/custom,
safe integers and overflow, caller isolation, internal/PII/commercial/remote
field rejection, canonical protected media, 30-day persistence, corrupt and
oversized recovery, quota/security errors and deterministic storage-event
reconciliation.

## RED 5/6 — Planner P1 R1

The historical lane PASS and Planner `FAIL / P1=2` remain preserved. Three
direct regression tests were added before the revision:

- exact 30-day authority: far-future and plus/minus one millisecond intervals;
- observed `items.map` Proxy trap plus accessor-index non-invocation;
- sparse, symbol, non-enumerable and failing-reflection array boundaries.

Focused command:

```sh
cd frontend
PATH=/Users/arron/.nvm/versions/node/v24.18.0/bin:/usr/bin:/bin:/usr/sbin:/sbin \
  npm test -- tests/quote-basket-domain.test.ts
```

Observed RED: exit `1`; 20 tests total, prior 17 PASS and exactly the 3 new
tests FAIL. The failures proved that a non-exact expiry did not throw, the raw
`private items map trap` escaped instead of `QuoteBasketDomainError`, and the
adjacent illegal array shapes were not all rejected.

Minimum GREEN changed only `domain.ts`: exact TTL arithmetic, descriptor-only
array copying, native structured-clone Proxy rejection and safe closed-record
snapshots. The observed Proxy `get` counter remains zero, accessor-index counter
remains zero and neither string nor JSON serialization contains private trap
text.

Final R1 GREEN:

```text
Domain       1 file / 20 tests PASS
Domain+A2    2 files / 28 tests PASS
```
