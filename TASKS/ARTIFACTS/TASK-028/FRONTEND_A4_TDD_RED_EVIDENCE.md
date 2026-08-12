# TASK-028 Frontend A4 TDD RED Evidence

recorded_at: `2026-08-12T09:31:05Z`
runtime: `Node 24.18.0 / npm 11.16.0`
result: `PASS`

## RED 1 — validated receipt clear material was absent

The public-response test first added an authenticity-bound accepted-receipt
check while the existing three A3 tests stayed green.

```text
npm test -- tests/rfq-public-response.test.ts
exit 1
1 file; 4 tests: 3 passed, 1 failed
TypeError: matchesValidatedAcceptedRfqReceipt is not a function
```

The minimum GREEN retains the already Schema-validated source snapshot and
token only in a module-private frozen `WeakMap`. The customer-safe receipt DTO
keeps its exact four visible keys. A structured clone or plain caller-created
lookalike cannot pass the matcher. Direct result: `1 file / 4 tests PASS`.

## RED 2 — browser snapshot-token seam was absent

The vector test was added before the browser implementation.

```text
npm test -- tests/rfq-basket-snapshot-token.test.ts
exit 1
Cannot find module '../src/lib/rfq/submission/snapshot-token'
```

The minimum GREEN uses Web Crypto SHA-256, the exact
`GDHE-RFQ-BASKET-SNAPSHOT-V2\n` prefix and the fixed RFC 8785 member order for
the closed six-field snapshot. It reproduces
`622441dee2464f41bad2130388dd31021a42328b45965450ab04ab406dc5b4eb`.

A later direct hostile-value regression produced a second meaningful RED: the
valid vector still passed, while a transparent Proxy incorrectly resolved to
the valid token. The minimum closure adds a browser-native structured-clone
proof after data-descriptor inspection, so transparent, throwing and revoked
Proxy values, accessors, symbols, invalid Unicode and unsafe precision now
fail through one sanitized error. Final result: `1 file / 2 tests PASS`.

## RED 3 — atomic compare-and-clear was absent

The storage test was added before the adapter operation.

```text
npm test -- tests/rfq-accepted-clear.test.ts
exit 1
1 file; 3 tests failed
TypeError: adapter(...).clearAcceptedReceipt is not a function
```

The minimum GREEN computes and authenticates the submitted token first, then
performs one final raw storage read, parses a legal unexpired Basket, compares
the current six fields against the same hidden receipt proof and removes only
the Quote Basket key. Direct result: `1 file / 3 tests PASS`, including all six
field mismatches, token/status/authenticity mismatch, missing/malformed/
expired/changed storage and throwing read/remove boundaries.

## RED 4 — live-attempt retry and accepted result states were absent

The client tests first required accepted-clear/changed outcomes and one
byte-identical unchanged retry while the preceding nine cases stayed green.

```text
npm test -- tests/rfq-submission-client.test.ts
exit 1
1 file; 13 tests: 9 passed, 4 failed
received accepted_local instead of accepted_cleared/accepted_basket_changed
unchanged retry called /api/rfq/intent/ instead of reusing /api/rfq/intake/
```

The minimum GREEN keeps one normalized customer, exact source snapshot,
validated intent/key, immutable draft and serialized request body in the
operation closure until exact expiry. An explicit unchanged retry performs
zero new intent requests and exactly one intake POST with the byte-identical
body. Customer/Basket change, expiry, security invalidation, conflict and
accepted terminal results discard the attempt; processing, rate limiting and
temporary uncertainty may retain it. Pending duplication remains suppressed.

## RED 5 — A3 retained-only copy was stale

The presentation test required the new accepted-clear and changed-Basket copy
before the component mapping changed.

```text
npm test -- tests/rfq-form-presentation.test.ts
exit 1
1 file; 5 tests: 4 passed, 1 failed
expected accepted result to contain "was cleared"
received the prior temporary/retained fallback
```

Minimum GREEN adds only the two frozen A4 result messages and wires the hook
callback. The successful hook clears UI state to the empty Basket view; a
changed snapshot keeps the complete current Basket and reports that exact
truth.

## Regression closures encountered during GREEN

- TypeScript initially rejected the conditional accepted-result object and
  readonly test tuples. Explicit discriminated branches and readonly tuple
  typing closed the regression; `tsc --noEmit --incremental false` passes.
- ESLint rejected a render-time ref update used by the first callback wiring.
  The callback-bound operation now uses `useMemo`; ESLint passes with zero
  warnings.
- The existing Quote Basket v3 copied-project positive control initially could
  not resolve the new client-safe RFQ imports. Its temporary fixture now copies
  exactly `public-response.ts`, `snapshot-token.ts` and the frozen local RFQ
  snapshot. The original positive/negative server-only semantics pass at
  `1 file / 1 test` with complete temporary-root cleanup.

## Final TDD result

The direct A4 form/response/token/clear/client inventory is `5 files / 31
tests PASS`. No automatic retry, polling, persisted attempt, partial Basket
deletion, A5 behavior, Visual QA, external integration or contract mutation
was introduced.
