# TASK-022 Adversarial Round 1 Frontend TDD RED Evidence

Date: 2026-08-05
Runtime: Node `24.18.0`, npm `11.16.0`
Request: `MSG-TASK-022-FRONTEND-ADVERSARIAL-P1-P2-R1`

## Direct RED

The four focused regressions were added before production changes and run with:

```sh
npm test -- tests/quote-basket-domain.test.ts tests/quote-basket-storage.test.ts tests/quote-basket-product-integration.test.ts tests/quote-basket-route.test.ts
```

Exit `1`: 4 files failed, 4 new tests failed and the prior 36 tests passed.

- P1-1 received raw `Error: private secondary proxy diagnostic` instead of a
  stable `QuoteBasketDomainError`; the same regression also requires the
  JavaScript Date-maximum TTL failure to be sanitized.
- P1-2 received raw `Error: private quota reflection diagnostic` instead of a
  stable `QuoteBasketStorageError(storage_unavailable)`.
- P2-1 observed two `now()` calls around expiry rather than one operation-time
  sample from the exact mutation base.
- P2-2 found `QuoteBasketContent` absent, so the final empty state had no
  persistent live-region rendering seam.

The RED was caused by the four reviewed missing behaviors. It was not a syntax,
fixture, dependency or environment failure.

## Minimum GREEN

The same command after the four bounded changes exited `0`: 4 files / 40 tests
PASS. A later natural direct-component test cleanup retained 4/40 PASS. Its
first typecheck exposed one missing test-only `add` callback; adding that
required prop corrected only the test fixture and did not change production.
