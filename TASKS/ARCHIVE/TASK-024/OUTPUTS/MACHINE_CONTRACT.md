# TASK-024 RFQ Machine Contract 1.0.0

status: frozen design; runtime not implemented

## 1. Normative files

The following Draft 2020-12 Schemas and fixed vectors are one closed contract:

- `schemas/common.v1.schema.json`
- `schemas/public-rfq-submission-draft.v1.schema.json`
- `schemas/authoritative-rfq-document.v1.schema.json`
- `schemas/public-rfq-receipt.v1.schema.json`
- `schemas/public-rfq-error.v1.schema.json`
- `vectors/vector-1.public-request.json`
- `vectors/vector-2.public-request.json`
- `vectors/vector-1.authoritative.json`
- `vectors/vector-1.accepted-receipt.json`
- `vectors/vector-1.processing-receipt.json`
- `vectors/vector-1.error.json`
- `vectors/invalid/duplicate-entry-id.public-request.json`
- `vectors/invalid/cross-domain-field-error.json`
- `vectors/invalid/cross-domain-customer-line-error.json`
- `vectors/invalid/duplicate-line-identity.public-request.json`
- `vectors/invalid/accepted-not-started.authoritative.json`
- `vectors/invalid/pre-reservation-outcome.authoritative.json`
- `vectors/expected.json`
- `verify-machine-contract.cjs`

Every object is closed. A field not present in the applicable Schema is forbidden. The Schemas define names, nesting, types, enums and structural bounds; this document defines the exact semantic checks that JSON Schema cannot express by itself. An implementation must satisfy both.

Every public and authoritative line `entryId` must be unique within its document. This is an identity constraint, not whole-object equality: two lines with the same `entryId` are invalid even when quantity or another field differs.

Public submitted lines additionally use the exact TASK-022 merge identity. For `configured_product`, the identity is the RFC 8785 JCS value of `{lineKind,resolutionIdentity,selection,packaging,quantityUnit}`. For `catalog_accessory`, absent `selection` and `packaging` members are omitted by JCS, so the identity is the JCS value of `{lineKind,resolutionIdentity,quantityUnit}`. `entryId` and quantity are excluded. Two public lines with the same merge identity are invalid even when they have different `entryId` or quantity. Intake never merges or adds them.

`verify-machine-contract.cjs` is the normative executable evidence for both cross-item rules. `duplicate-entry-id.public-request.json` must fail as `duplicate_entry_id`, and `duplicate-line-identity.public-request.json` must fail as `duplicate_line_identity`, after Schema validation and before digest lookup or reservation.

This bundle is an architecture artifact only. It is not copied into the current frontend or CMS and does not create an endpoint.

## 2. Exact public projection

`PublicRfqBasketSubmission 1.0.0` is derived from a separately validated Quote Basket `2.0.0`; it is not the stored Basket.

### Configured product

| Network field | Exact source/conversion |
|---|---|
| `lineKind` | literal `configured_product` |
| `entryId` | copied UUIDv4 |
| `resolutionIdentity` | `{kind:"canonical_path", value:item.product.publicPath}` |
| `selection.type` | copied `standard` or `custom` |
| `selection.lengthTenths` | `item.selection.lengthMeters * 10`; accept only a positive safe integer and never round |
| `selection.color` | copy the exact validated public `code` and English `label` |
| `packaging.basePackaging` | exact mapping below |
| `packaging.logoPrinting` | copied Boolean |
| `packaging.protectionArrangement` | exact mapping below |
| `quantityUnit` | copied only when it is `piece` or `roll` |
| `quantity` | copied positive safe integer |

The only accepted current English label mappings are:

| Stored public label | Network enum |
|---|---|
| `Standard Packaging` | `standard` |
| `Carton Packaging` | `carton` |
| `Large Shrink Wrap` | `large_shrink_wrap` |
| no protection (`null`) | `null` |
| `Single-piece Bagging` | `single_bag` |
| `Paired Interlocking` | `paired` |

An absent, legacy or unknown label fails projection; it is never guessed or silently converted. The Basket remains available for customer review.

### Catalog accessory

The exact future line shape is frozen in `accessoryPublicLine`: it requires an `aq_`-prefixed opaque public quote key, `piece` and a positive safe-integer quantity. Current Quote Basket `2.0.0` contains no such key, so production accessory submission remains blocked. Model, name, image, catalog path and recommendation position are not substitutes.

### Semantic byte/time checks

- `submissionIntent` is at most 8192 UTF-8 bytes.
- `challengeToken`, when present, is at most 16384 UTF-8 bytes.
- `privacyNotice.version` is at most 128 Unicode code points.
- Customer maxima are Unicode code-point counts, not JavaScript UTF-16 code-unit counts.
- `sourceBasket.expiresAt` must equal `sourceBasket.updatedAt + 2592000000 ms` exactly.
- The JCS-serialized Basket projection is at most 163840 UTF-8 bytes.
- The complete raw HTTP body is at most 262144 bytes; no parse or business lookup precedes this raw streamed-byte gate.

## 3. Exact authoritative line variants

`authoritative-rfq-document.v1.schema.json` allows exactly three line variants:

1. configured standard: `resolved_article_number`, one current Article Number, standard selection and validated packaging;
2. configured custom: `sales_follow_up`, `articleNumber:null`, custom selection and `followUpReason:"custom_length"`;
3. catalog accessory: `resolved_article_number`, one current Article Number, `publicPath:null`, `piece`, and no configured selection/packaging fields.

The server supplies current `stableProductUuid`, Article Number, model, public path and quantity unit only after unique authoritative resolution. The public request supplies none of those internal identities. Version 1.0.0 does not contain a generic free-form selection map or an accessory sales-follow-up fallback; a future product family requiring another shape needs an additive contract version.

`sourceSecurity.outcomeCode` is exactly `new_intent`. An idempotent replay does not mutate the stored authoritative document; conflicts and pre-reservation rejections never create one. Authoritative status and delivery are limited to this exact matrix:

| `status` | `delivery.state` | `attemptCount` |
|---|---|---:|
| `idempotency_reserved` | `not_started` | 0 |
| `resolving_lines` | `not_started` | 0 |
| `delivery_pending` | `pending` | 1 |
| `accepted` | `accepted` | 1 |
| `delivery_indeterminate` | `indeterminate` | 1 |
| `rejected_before_delivery` | `rejected` | 0 |

The authoritative Schema enforces this matrix. The two invalid authoritative vectors must be rejected.

## 4. Canonical business payload and digest

Normalization defined in `RFQ_SUBMISSION_CONTRACT.md` runs first. Then construct an object with exactly these members:

```text
{
  basket: normalized PublicRfqBasketSubmission,
  customer: normalized PublicRfqCustomer,
  privacyNotice: normalized PublicPrivacyNoticeRecord
}
```

Serialize that object with RFC 8785 JSON Canonicalization Scheme (JCS). Arrays preserve order; object members use JCS ordering. The exact MAC input is:

```text
UTF8("GDHE-RFQ-DIGEST-V1\n1.0.0\n") || UTF8(JCS(canonicalBusinessPayload))
```

The digest is:

```text
lowerhex(HMAC-SHA-256(secretKey[keyVersion], macInput))
```

`keyVersion` is a persisted public selector for a server-secret key; it is not the HMAC key. `submissionIntent`, `idempotencyKey`, `antiAbuse` and transport observations are excluded from the business digest. They remain independently validated security inputs.

`vectors/expected.json` freezes two complete request examples, canonical bytes, the non-production 32-byte test secret, HMAC results and Basket snapshot tokens. The second vector changes the Basket mutation and quantity, and therefore must produce a different payload digest and snapshot token. The test secret is never a production secret.

## 5. Exact snapshot token and clear rule

For `sourceBasket`, compute:

```text
lowerhex(SHA-256(UTF8("GDHE-RFQ-BASKET-SNAPSHOT-V1\n") || UTF8(JCS(sourceBasket))))
```

The server returns both `submittedBasketSnapshot` and `submittedBasketToken` in every valid receipt. The browser may clear only when all conditions are true:

1. the receipt validates as `PublicRfqReceipt 1.0.0`;
2. `status` is exactly `accepted`;
3. the current local Basket's six snapshot fields exactly equal `submittedBasketSnapshot`;
4. recomputing the token from the current six fields exactly equals `submittedBasketToken`.

Any mismatch, later mutation, missing Basket, `processing`, error, timeout or invalid receipt retains the Basket. A matching receipt never clears a newer revision from another tab.

## 6. Exact receipt and error representation

- Success/progress uses `messageKey`, never server-supplied English copy.
- `accepted` uses `rfq.accepted` and has no `retryAfterSeconds`.
- `processing` uses `rfq.processing` and requires `retryAfterSeconds` in `1..3600`.
- Public RFQ references match `RFQ-[A-Z2-9]{12}`; error/support references match `REQ-[A-Z2-9]{12}`.
- Error `messageKey` is exactly `rfq.error.` plus the error `code`; the Schema enforces every pair.
- Only `rate_limited` carries `retryAfterSeconds`, bounded to `1..86400`.
- Customer-level field errors never contain `entryId`; line-level `quantity`, `selection` and `packaging` errors require the public Basket `entryId`.
- `invalid_customer_fields` requires only customer-field errors; `invalid_line_count` requires `lineCount/invalid`; `invalid_quantity` requires `quantity/invalid`; `basket_refresh_required` requires `basket/(expired|changed|unavailable)`; `product_unavailable` requires `selection/unavailable`; `configuration_changed` requires only `selection|packaging` with `changed|unavailable`. These six codes require at least one matching field error. Every other code forbids `fieldErrors`.
- Public messages, references and field errors never include Article Number, internal UUID, raw rejected values, contact details, downstream bodies or exception text.

## 7. Replay, limit and reservation precedence

Every request increments source traffic telemetry after trusted source derivation. The exact decision order is:

1. method, trusted source, Origin, Content-Type and 262144-byte raw-body gates;
2. parse once, validate the closed public Schema, semantic byte/code-point checks and canonical digest;
3. perform one bounded durable lookup by idempotency-key fingerprint;
4. if an unexpired record exists, same key + same digest returns the stored terminal/public state (`200`, `202` or the same deterministic pre-delivery `409`) and performs no CMS/Feishu delivery; same key + different digest returns `409 idempotency_conflict`;
5. only an unseen/expired key proceeds through intent, honeypot, source/contact limit and adaptive-challenge gates;
6. an unseen request at source attempt 6+ in rolling 10 minutes or 21+ in rolling 24 hours returns `429`; it creates no reservation and performs no downstream call.

Thus a same-key/same-digest replay still counts as source traffic but is not replaced by a hard-limit response. The hard source limit controls new business attempts, while an existing durable state remains recoverable without a duplicate delivery.

## 8. Reservation and retention

- Method/origin/content-type/body/Schema/customer/line/intent/honeypot/rate/challenge failures occur before durable reservation and create no durable RFQ or idempotency business state.
- After every pre-reservation gate passes, create one reservation with the canonical digest before authoritative line resolution.
- Deterministic product/configuration failures after reservation become `rejected_before_delivery` and replay the same stable public `409` while the reservation is live.
- Every reserved, rejected, accepted or delivery-indeterminate idempotency record has `createdAt` equal to the first successful durable reservation and `expiresAt = createdAt + 2592000000 ms` exactly. Replay never extends the window.
- At expiry, the key is no longer replayable. A new customer submission requires a fresh intent and key and is a new explicit business attempt; expiry never triggers an automatic downstream resend.
- `delivery_indeterminate` forbids blind resend for its full lifetime and must use controlled reconciliation. The 30-day idempotency window is distinct from the 24-month accepted-RFQ business retention rule.

## 9. Implementation gate

TASK-024 freezes these bytes and semantics only. TASK-025 or another separately confirmed task must copy or generate runtime-owned Schemas, implement validators, prove hostile-input and fixed-vector tests, and provide the missing accessory key/batch resolver gates before live submission. No implementation may silently loosen this contract.
