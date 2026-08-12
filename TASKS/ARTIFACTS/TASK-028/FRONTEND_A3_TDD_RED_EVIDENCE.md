# TASK-028 Frontend A3 TDD RED Evidence

recorded_at: `2026-08-12T09:01:47Z`
runtime: `Node 24.18.0 / npm 11.16.0`
result: `PASS`

## RED 1 — visible form seam absent

The focused presentation test was added before any A3 form production file.

```text
PATH=/Users/arron/.nvm/versions/node/v24.18.0/bin:/usr/bin:/bin:/usr/sbin:/sbin npm test -- tests/rfq-form-presentation.test.ts
exit 1
FAIL tests/rfq-form-presentation.test.ts
Cannot find module '../src/components/rfq-form/presentation'
```

Minimum GREEN added only the stateless form presentation and its local CSS.
The direct result became `1 file / 2 tests PASS`, proving exact field order,
required/autocomplete/ID semantics, local Stub notice and ready/blocked/empty/
storage/config gating.

## RED 2 — one-operation client seam absent

The state-machine test was added while RED 1 remained green.

```text
PATH=/Users/arron/.nvm/versions/node/v24.18.0/bin:/usr/bin:/bin:/usr/sbin:/sbin npm test -- tests/rfq-form-presentation.test.ts tests/rfq-submission-client.test.ts
exit 1
presentation: 2 tests PASS
FAIL tests/rfq-submission-client.test.ts
Cannot find module '../src/lib/rfq/submission/client'
```

Minimum GREEN added one closure-owned operation with fixed same-origin paths,
bare JSON, `no-store`, redirect refusal and no retry. It normalizes through A1,
projects/builds through A2, suppresses a pending duplicate and always returns a
Basket-retained result. The direct result became `2 files / 4 tests PASS`.

## RED 3 — closed public response boundary absent

The public response test was added after RED 2 was green.

```text
PATH=/Users/arron/.nvm/versions/node/v24.18.0/bin:/usr/bin:/bin:/usr/sbin:/sbin npm test -- tests/rfq-form-presentation.test.ts tests/rfq-submission-client.test.ts tests/rfq-public-response.test.ts
exit 1
prior 4 tests PASS
FAIL tests/rfq-public-response.test.ts
Cannot find module '../src/lib/rfq/submission/public-response'
```

Minimum GREEN added exact frozen receipt/error Schema validation, semantic and
HTTP-status binding, the complete sixteen-code status matrix and an immutable
customer-safe projection. Unknown, extra, malformed, oversized, wrong-media,
wrong-status and hostile non-string bodies now throw only the stable sanitized
`RfqPublicResponseError(invalid_response)`. The direct result became
`3 files / 7 tests PASS`.

## RED 4 — real Quote Basket still rendered the disabled placeholder

After all three seams were green, a direct `QuoteBasketContent` test exercised
the current production component. It failed on the actual legacy behavior:

```text
exit 1
prior A3 tests: 7 PASS
expected ready markup to contain name="fullName"
received the legacy "Final quote submission is not available yet" section
```

Minimum GREEN connected the validated client form below ready Basket rows,
removed only the legacy placeholder, disabled Basket and form controls during
the operation, and passed only a server-derived enabled boolean across the
Server/Client boundary. Expanded focused evidence finished at
`5 files / 25 tests PASS`.

## Preserved stop gate

No A3 production path clears storage, removes submitted lines, retains an
intent/key for retry, polls, or automatically resends. Accepted-local copy
explicitly states that the Basket has not been cleared in this checkpoint.
A4 and A5 remain unimplemented.
