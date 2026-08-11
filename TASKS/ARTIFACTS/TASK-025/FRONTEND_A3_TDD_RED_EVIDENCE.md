# TASK-025 Frontend A3 TDD RED Evidence

runtime: Node.js `24.18.0`, npm `11.16.0`

Every production seam was entered from a focused test before its minimum implementation. Existing passing behavior was kept green between slices.

## RED 1 — authority snapshot and verifier

Command:

```text
npm test -- tests/article-number-batch-contract-snapshot.test.ts
```

Observed: `1 file failed / 1 test failed`. Node reported `MODULE_NOT_FOUND` for `scripts/verify-article-number-batch-contract.mjs`. No production file existed before this run.

Minimum GREEN: add the independent 11-Schema closure, five success snapshots, frozen error evidence, authority-bound manifest and Node-built-in verifier. Focused result: `1/1 PASS`; final mutation suite: `1 file / 5 tests PASS`.

## RED 2 — request query and static request validation

Command:

```text
npm test -- tests/article-number-batch-query.test.ts
```

Observed: suite import failure because `src/lib/cms/server/article-number-batch/query` did not exist.

Minimum GREEN: add server-only request types, static Ajv request/response roots, authentic request snapshot, closed duplicate/count/unknown-key gates and the `163840`-byte request ceiling. Focused result: `1 file / 2 tests PASS`.

## RED 3 — fixed POST Transport

Command:

```text
npm test -- tests/article-number-batch-transport.test.ts
```

Observed: suite import failure because the production Transport module did not exist.

Minimum GREEN: add one fixed anonymous JSON POST, exact endpoint, `no-store`, redirect refusal, 5000 ms timeout, caller abort and zero retry. Initial success slice: `1/1 PASS`.

## RED 4 — frozen HTTP matrix

The next Transport test kept the existing success case green and failed only because HTTP `400` produced `MixedQuoteLineProtocolError(unexpected_status)` instead of typed `MixedQuoteLineHttpError(bad_request)`.

Minimum GREEN: add the closed `400/409/413/415/500` status classification and single JSON body parse. Result: `1 file / 2 tests PASS`; final Transport suite including redirect/timeout/abort/network/hostile Proxy checks is `1 file / 4 tests PASS`.

## RED 5 — opaque wrapper and DTO Adapter

Command:

```text
npm test -- tests/article-number-batch-runtime.test.ts
```

Observed: suite import failure because the production Adapter did not exist.

Minimum GREEN: add the deep-frozen Adapter over the authentic null-prototype/WeakMap wrapper. Result: `1 file / 2 tests PASS`; caller mutation cannot change the body and keys/spread/JSON do not expose it.

## RED 6 — one-call orchestration

Command:

```text
npm test -- tests/article-number-batch-consumer.test.ts
```

Observed: suite import failure because the public server-only consumer entry did not exist. An initial generated `0.30000000000000004` test fixture was separately corrected to a deliberate one-decimal value before evaluating the seam.

Minimum GREEN: add request → Transport → response Validator → semantic comparison → Adapter orchestration. Real loopback proof passes for one and fifty ordered lines with one POST each and zero `/resolve`, Product Configuration or RelatedProductCard requests.

## RED 7 — normalized error/status mismatch

Existing orchestration success remained green. A `400` HTTP response carrying a valid frozen `409` body failed as `MixedQuoteLineContractError(invalid_error_payload)` instead of the required `MixedQuoteLineProtocolError(error_status_mismatch)`.

Minimum GREEN: validate the closed body against its own status first, then compare HTTP/body status and sanitize the body from the rethrown HTTP error. Result: consumer suite `2/2 PASS`.

## RED 8 — duplicate-identity error variant

The frozen `400 / gdhe_invalid_quote_line_request` duplicate-identity message was initially rejected because only the generic frozen message was allowlisted.

Minimum GREEN: allow exactly the two authority messages for that code/status without accepting arbitrary messages. Final consumer suite: `1 file / 3 tests PASS`.

Client Component public/deep build negatives were then added as boundary proof. Marker-stripped positive controls build successfully; real imports fail on `server-only`; all temporary roots are removed.
