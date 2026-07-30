# TASK-016 TDD RED Evidence

Date: 2026-07-30
Lane: `frontend`
Runtime: Node.js `v24.18.0`, npm `11.16.0`

All production edits followed a behavior-level RED. Loopback tests cannot bind
`127.0.0.1` inside the frontend lane sandbox; those runs stopped with
`listen EPERM` and are recorded as environment evidence, not code failures.
Planner reran the exact commands against the same shared bytes in the
unrestricted main environment before each corresponding GREEN edit.

## RED 1 — query and fixed URL module absent

Command:

```sh
npm test -- --run tests/product-card-transport.test.ts
```

Result: exit `1`; module
`src/lib/cms/server/product-cards/transport` did not exist. Minimum GREEN added
the closed query validator and fixed English ProductCard `1.0.0` URL builder.
Focused result: `1 file / 2 tests PASS`.

## RED 2 — ProductCard request function absent

Unrestricted command:

```sh
npm test -- tests/product-card-transport.test.ts
```

Result: exit `1`; `3 tests`, prior `2 PASS`, sole failure
`TypeError: requestProductCardCollection is not a function`. Minimum GREEN
added one anonymous fixed GET and sanitized `200` outcome. Result:
`1 file / 3 tests PASS`.

## RED 3 — bodyless 304 not typed

Unrestricted result: exit `1`; `4 tests`, prior `3 PASS`; the new 304 test
received `ProductCardProtocolError(kind="unexpected_status")`. Minimum GREEN
added only the `not_modified` outcome and 304 branch. Result:
`1 file / 4 tests PASS`.

## RED 4 — normalized HTTP error type absent

Unrestricted result: exit `1`; `5 tests`, prior `4 PASS`; the new assertion
failed because `ProductCardHttpError` was undefined. Minimum GREEN added the
typed HTTP error, stable status mapping, required `no-store`, single JSON parse
and private body. Result: `1 file / 5 tests PASS`.

## RED 5 — redirect, timeout and caller abort unclassified

Unrestricted result: exit `1`; `8 tests`, prior `5 PASS`, new `3 FAIL`:

- redirect leaked raw `TypeError: fetch failed`;
- the delayed response resolved after about 5505 ms instead of timing out;
- an already-aborted caller signal still resolved successfully.

Minimum GREEN added redirect mapping, the fixed 5000 ms timeout, caller/timeout
signal composition, stable transport errors, timer cleanup, one request and
zero retry. Result: `1 file / 8 tests PASS`.

## RED 6 — runtime Validator absent

Command:

```sh
npm test -- tests/product-card-runtime-validator.test.ts
```

Result: exit `1`; the ProductCard validation module did not exist. Minimum
GREEN added exact static eight-Schema registration, strict Draft 2020-12 Ajv,
version gates, isolated snapshot, deep freeze and authentic wrapper.

The first GREEN attempt failed closed during compilation because the frozen
Schema relies on inherited object typing inside three `then.action` branches.
Only the in-memory structured clone received the redundant `type: object`;
Snapshot bytes and semantics remained unchanged. Result:
`1 file / 4 tests PASS`.

## RED 7 — detail action/path mismatch accepted

Command:

```sh
npm test -- tests/product-card-runtime-validator.test.ts
```

Result: exit `1`; `5 tests`, prior `4 PASS`; a detail action targeting another
valid canonical path did not throw. Minimum GREEN added explicit semantic
equality after Schema validation. Result: `1 file / 5 tests PASS`.

## RED 8 — DTO Adapter absent

Command:

```sh
npm test -- tests/product-card-adapter.test.ts
```

Result: exit `1`; Adapter module absent. Minimum GREEN added the frontend-owned
readonly DTO types and explicit allowlisted deep copy/freeze. Result:
`1 file / 1 test PASS`.

## RED 9 — orchestration entry absent

Command:

```sh
npm test -- tests/product-card-consumer.test.ts
```

Result: exit `1`; public ProductCard server entry absent. Minimum GREEN added
the SDK-style load function and fixed Transport → Validator → Adapter
sequence. Planner unrestricted result: `1 file / 1 test PASS`, exactly one
ProductCard collection path and zero `/resolve`.

## RED 10 — normalized errors not sanitized or status-bound

Unrestricted result: exit `1`; `3 tests`, prior success `PASS`, new `2 FAIL`:

- the full normalized body remained reachable on `ProductCardHttpError`;
- HTTP `400` with body status `404` remained a `bad_request` instead of
  failing closed.

Minimum GREEN reused the existing common error Validator, required status
equality and rethrew a bodyless typed HTTP error. Result:
`1 file / 3 tests PASS`.

## Final GREEN

- ProductCard loopback Transport + orchestration: `2 files / 39 tests PASS`.
- Validator, Adapter and four Client Component server-only negatives:
  `3 files / 21 tests PASS` before the six error-sample additions.
- Current Validator focused gate: `1 file / 18 tests PASS`.
- Current full suite, unrestricted Planner run: `15 files / 237 tests PASS`.

## Round 1 P1 revision — closed query reflection boundary

Request: `MSG-TASK-016-FRONTEND-QUERY-BOUNDARY-P1-R1`

No-listener RED command:

```sh
npm test -- tests/product-card-transport.test.ts -t "ProductCard query and URL"
```

Result: exit `1`; `6 failed / 14 passed / 22 skipped`.

The six failures reproduced the canonical Round 1 finding:

1. a stateful `Symbol.toPrimitive` filter was accepted instead of rejected;
2. an unknown non-enumerable own key was accepted;
3. a symbol own key was accepted;
4. an accessor on the allowed `page` key was invoked and accepted;
5. a Proxy hiding an unknown key was accepted;
6. a `getPrototypeOf` trap leaked `private reflection failure` instead of the
   stable `ProductCardConfigurationError("invalid_query")`.

Minimum production changes were confined to the query/URL seam. The first
focused GREEN was `20 passed / 22 skipped`, but Planner's unrestricted full
suite exposed a copied-project type regression: two positive-control Next
builds rejected the returned `filter?: unknown`. That full-suite result was a
second valid RED (`242 passed / 2 failed`) and was not reported as completion.

The final control flow obtains template-literal types only from runtime-backed
sort/filter predicates. It returns early when filter is absent, rejects a
non-matching primitive, and constructs the filter-bearing frozen snapshot only
after the predicate succeeds. No unchecked assertion was added.

Final current-byte GREEN:

- no-listener query/URL: `20/20 PASS`;
- copied-project positive/guarded build controls: `2/2 PASS`;
- unrestricted Transport: `42/42 PASS`;
- unrestricted full suite: `15 files / 244 tests PASS`;
- typecheck and production build: PASS.
