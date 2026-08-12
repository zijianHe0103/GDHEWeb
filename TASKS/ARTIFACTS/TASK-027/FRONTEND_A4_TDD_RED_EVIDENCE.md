# TASK-027 Frontend A4 TDD RED Evidence

runtime: Node 24.18.0
result: RED_GREEN_COMPLETE

## A4.1 process-local repository

The focused repository test was added before the production class existed.

```text
npm test -- tests/rfq-intake-v2-stub-repository.test.ts
exit 1
TypeError: StubRfqRepository is not a constructor
```
Minimum GREEN added only the private process-local Map, authentic lookup
results, atomic reserve/transition and customer-safe inspection seam. The first
test then passed `1 file / 1 test`; final repository coverage passes `2/2` and
includes live replay, conflict, fresh reservation and expired-indeterminate
preservation.

## A4.2 isolated sink

The sink test was added before its production class existed.

```text
npm test -- tests/rfq-intake-v2-stub-sink.test.ts
exit 1
TypeError: StubRfqSink is not a constructor
```

Minimum GREEN accepts only an authentic `delivery_pending/pending/1`
Authoritative document, increments only after authenticity/state checks, returns
one closed outcome and retains no document. The focused test then passed `1/1`.

## A4.3 completed local result and replay

The first complete-runtime test ran against the A3 authoritative-document-only
runtime.

```text
npm test -- tests/rfq-intake-v2-stub-runtime.test.ts
exit 1
RfqIntakeError dependency_failed at requireLookupResult
```

The first request had completed, but the replay result could not pass the old
A3 lookup shape and no `201/200` local result existed. Minimum GREEN added the
closed local overload, authentic receipt/error construction, replay/conflict/
reconciliation decisions, pending delivery conversion, one Sink call and safe
state transition.

## Hostile transition normalization

A later direct regression made repository transition throw a hostile Proxy.
Current production returned that dependency value; the test failed from the
Proxy `get` diagnostic instead of receiving stable `intake/dependency_failed`.
Minimum GREEN added one zero-observation transition catch. The final direct A4
set passes `3 files / 11 tests` and all trap counters remain zero.

## Final focused GREEN

```text
RFQ A1-A4: 9 files / 62 tests PASS
TASK-025 plus Quote Basket v3: 15 files / 35 tests PASS
```
