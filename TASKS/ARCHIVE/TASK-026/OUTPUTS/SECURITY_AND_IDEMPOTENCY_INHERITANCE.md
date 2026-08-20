# TASK-024 Security and Idempotency Inheritance for RFQ 2.0

## Inherited unchanged

- same-origin Next.js-only intake; browser never calls WordPress or Feishu directly;
- method, trusted source, Origin, exact JSON media type and `262144` raw-byte gates before parse/business work;
- exact TASK-024 customer/contact normalization, at-least-one-contact rule, privacy notice, intent, honeypot, challenge and logging restrictions;
- one bounded idempotency lookup after closed validation/digest and before hard limits for new business attempts;
- same key/same digest replays stored `200`, `202` or deterministic pre-delivery `409` without downstream work; same key/different digest is conflict;
- pre-reservation rejection creates zero RFQ/idempotency business state;
- first durable reservation fixes `createdAt`; `expiresAt = createdAt + 2592000000 ms`; replay never extends expiry;
- expiry authorizes neither replay nor automatic resend; indeterminate delivery requires controlled reconciliation;
- one complete line set is resolved and delivered atomically; no truncation, partial success or silent merge;
- accepted business records retain the TASK-024 24-month business-retention meaning, distinct from the 30-day idempotency window.

## V2 replacements

V2 replaces only the Basket/line projection and version-bound canonical values. Basket snapshot `schemaVersion` is `3.0.0`. Public standard/accessory lines carry untrusted Article Number and must pass exactly one TASK-025 mixed batch. Public custom lines carry `null/sales_follow_up`.

The business object still has exactly `basket`, `customer`, and `privacyNotice`. After inherited normalization, RFC 8785 JCS serializes it. Arrays preserve order.

```text
macInput = UTF8("GDHE-RFQ-DIGEST-V2\n2.0.0\n") || UTF8(JCS(businessPayload))
digest = lowerhex(HMAC-SHA-256(secretKey[keyVersion], macInput))
comparisonToken = lowerhex(SHA-256(UTF8("GDHE-RFQ-COMPARISON-V2\n2.0.0\n") || UTF8(JCS(businessPayload))))
snapshotToken = lowerhex(SHA-256(UTF8("GDHE-RFQ-BASKET-SNAPSHOT-V2\n") || UTF8(JCS(sourceBasket))))
```

`keyVersion` selects a server secret; it is not the key. Published vectors use only the non-production test key in `vectors/expected.v2.json`. V1 digests/tokens are not reused. RFC 8785 processing fails closed on non-finite values and invalid Unicode such as a lone surrogate; the recursive semantic gate covers all five Schema document domains before canonicalization. The authoritative positive fixture's `payloadDigest` is the exact recomputed v2 HMAC, and altered digest/HMAC/comparison values pass through the real semantic rejection functions.

## Exact replay tuples

`vectors/expected.v2.json` encodes exactly five input/expected-effect tuples in normative order: unexpired same digest, unexpired different digest, unseen fresh valid, pre-reservation rejected and expired indeterminate. The executable evaluator checks the transport/closed-contract/digest/lookup order, exact original `createdAt` and `expiresAt` anchor, `2592000000 ms` duration, unchanged replay expiry, zero pre-reservation business state, zero downstream dispatches on replay/conflict/rejection/expired indeterminate, and no automatic resend after expiry. Any arbitrary or mutated expected effect fails the semantic gate.

## Exact Basket clear gate

Clearing requires all of: Schema-valid v2 receipt; `status=accepted`; exact equality of the six Basket 3.0 snapshot fields; successful recomputation of the v2 snapshot token. Processing, error, timeout, invalid receipt, missing Basket, token mismatch or any newer revision/writer/mutation/time value retains the Basket.

## Deferred security implementation

TASK-026 selects no persistent store, key store, rate-limit backend, challenge vendor, delivery connector or reconciliation worker. Fixed vectors prove only the machine boundary, not a live security control.
