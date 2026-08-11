# RFQ Submission Contract 1.0.0

status: frozen design; runtime not implemented
public_locale: en

## 1. Contract layers

The RFQ flow has three deliberately different documents:

| Layer | Canonical name | Trust | Internal identity |
|---|---|---|---|
| Browser request | `PublicRfqSubmissionDraft 1.0.0` | untrusted | forbidden |
| Server record | `AuthoritativeRfqDocument 1.0.0` | server-produced after validation | allowed and required where resolved |
| Browser response | `PublicRfqReceipt 1.0.0` | server-produced public projection | forbidden |

The three documents are not aliases. A public draft never becomes authoritative merely because it passed JSON validation.

The normative closed shapes are the Draft 2020-12 files under `schemas/`; semantic checks, conversions, canonicalization, fixed vectors and replay precedence are frozen in `MACHINE_CONTRACT.md`. Prose in this document is explanatory and cannot widen those closed contracts.

## 2. PublicRfqSubmissionDraft 1.0.0

Closed top-level shape:

```text
contractVersion: "1.0.0"
submissionIntent: opaque server-issued string, maximum 8192 UTF-8 bytes
idempotencyKey: UUIDv4 string
basket: PublicRfqBasketSubmission 1.0.0 derived from a validated QuoteBasketDocument 2.0.0
customer: PublicRfqCustomer
privacyNotice: PublicPrivacyNoticeRecord
antiAbuse: PublicAntiAbuseEnvelope
```

Unknown keys are rejected at every object boundary.

### PublicRfqBasketSubmission 1.0.0

This is a network submission projection, not a third browser storage format and not a byte-for-byte copy of Quote Basket `2.0.0`.

```text
contractVersion: "1.0.0"
sourceBasket:
  schemaVersion: "2.0.0"
  revision: positive safe integer
  writerId: public browser UUIDv4
  mutationId: public browser UUIDv4
  updatedAt: RFC 3339 timestamp
  expiresAt: RFC 3339 timestamp
items: 1..50 PublicRfqBasketLine values
```

The exact line union is `configuredPublicLine | accessoryPublicLine` from `schemas/common.v1.schema.json`. A configured line contains canonical path, public `entryId`, `standard|custom`, positive safe-integer `lengthTenths`, closed color, closed packaging enums, `piece|roll` and positive safe-integer quantity. An accessory line contains only its future opaque quote key, public `entryId`, `piece` and positive safe-integer quantity. It excludes product model/name, image URL/dimensions/Alt, line creation time, Article Number and every internal identity. The authoritative document may add the current public model only after successful server resolution.

Every `entryId` must be unique across the request. The complete public line merge identity must also be unique: for a configured product it is `resolutionIdentity + selection + packaging + quantityUnit`; for a catalog accessory it is `resolutionIdentity + quantityUnit`. `entryId` and quantity are excluded from that merge identity. Duplicate IDs or duplicate merge identities reject the whole request before digest lookup or durable reservation; the intake neither adds their quantities nor chooses one line.

Resolution identity is a closed union:

```text
configured_product:
  kind: canonical_path
  value: canonical public product path

catalog_accessory:
  kind: opaque_public_quote_key
  value: bounded opaque public identifier issued by the approved product/accessory contract
```

The opaque accessory key is public, non-secret and purpose-specific and matches `^aq_[A-Za-z0-9_-]{20,80}$`. It must not equal or reversibly encode a WordPress/database ID, stable Product UUID, Article Number or Feishu identity. Public model/name/category/catalog position is not a substitute.

Current Quote Basket `2.0.0` can project configured-product canonical paths but cannot produce the required accessory key. Production catalog-accessory submission is therefore an explicit follow-up contract gate; TASK-024 does not rewrite the frozen Basket bytes.

The canonical UTF-8 serialization of this Basket projection is limited to `163840` bytes (`160 KiB`). The complete raw HTTP request remains limited to `262144` bytes (`256 KiB`), reserving `98304` bytes (`96 KiB`) for the customer, notice, intent, idempotency and anti-abuse envelope. The final exact serialized request must still pass the raw-body limit; the reserve is not permission to exceed it. A locally valid Basket that cannot meet the submission projection budget is retained and must be reduced or split; it is never truncated.

### PublicRfqCustomer

```text
fullName: required string
companyName: required string
whatsApp?: string
weChat?: string
businessEmail?: string
phone?: string
countryRegion: required string
city: required string
companyWebsite?: absolute http/https URL string
message?: string
```

At least one of `whatsApp`, `weChat`, `businessEmail` and `phone` must be present and valid. Empty optional values are omitted, not serialized as empty strings or `null`.

### PublicPrivacyNoticeRecord

```text
version: non-empty public notice version, maximum 128 Unicode code points
presentedAt: RFC 3339 timestamp generated when the exact notice is rendered
```

The field is intentionally named a notice record, not consent. It contains no marketing flag.

### PublicAntiAbuseEnvelope

```text
honeypot: exact empty string
challengeToken?: opaque string, maximum 16384 UTF-8 bytes, present only when the server requires a challenge
```

Minimum-fill-time is derived from the server-issued intent. Anti-abuse values are transport evidence and are excluded from the canonical business-payload digest.

### Forbidden public fields

The request must not contain Article Number, stable Product/Media UUID, WordPress/SCF/database ID, Feishu Base/table/field/record ID, price, currency, cost, margin, supplier, inventory, customer-specific quotation, raw IP, server fingerprint, secret, downstream response or server processing state.

## 3. Normalization and canonical digest

The server validates before normalization. It then creates one versioned canonical representation:

- Unicode strings are normalized to NFC;
- approved surrounding Unicode whitespace is trimmed;
- optional empty values are omitted;
- message line endings become LF;
- email domain is lower-cased while the supplied local part is preserved;
- Website is parsed as an absolute HTTP/HTTPS URL, rejects credentials/control characters and is serialized by the approved URL parser without any network fetch;
- Basket items preserve their submitted order for customer meaning;
- object keys follow RFC 8785 JCS ordering; arrays preserve customer-submitted order;
- challenge token, honeypot, source bucket, raw headers and other transport/security observations are excluded.

The exact business object contains only normalized `basket`, `customer` and `privacyNotice`. Its bytes are RFC 8785 JCS. The MAC input is `UTF8("GDHE-RFQ-DIGEST-V1\n1.0.0\n") || UTF8(JCS(businessPayload))`; the digest is `lowerhex(HMAC-SHA-256(secretKey[keyVersion], macInput))`. `keyVersion` selects the secret and is never used as the key itself. The complete algorithm and two fixed vectors are in `MACHINE_CONTRACT.md` and `vectors/expected.json`.

## 4. AuthoritativeRfqDocument 1.0.0

This is created only by the Next.js server after closed validation, idempotency reservation and complete authoritative line re-resolution.

```text
contractVersion: "1.0.0"
rfqId: server-generated internal identity
publicReference: bounded random customer-safe reference
receivedAt: server timestamp
status: internal RFQ state
customer: normalized customer fields
privacyNotice: version + presentedAt + receivedAt
lines: 1..50 AuthoritativeRfqLine values
payloadDigest: keyVersion + lower-case HMAC-SHA-256 hex
idempotency: keyed key fingerprint + first durable reservation createdAt + exact 30-day expiresAt
sourceSecurity: keyed source/contact fingerprints + closed outcomeCode
delivery: closed state + attemptCount 0..1 + lastTransitionAt; never copied to the public receipt verbatim
```

### AuthoritativeRfqLine

The authoritative Schema permits exactly three closed variants: configured standard with one resolved Article Number; configured custom with `articleNumber:null`, `sales_follow_up` and `followUpReason:"custom_length"`; and catalog accessory with one resolved Article Number, `publicPath:null` and `piece`. Exact fields, nesting and bounds are in `schemas/authoritative-rfq-document.v1.schema.json`. Version 1.0.0 has no free-form selection map and no accessory sales-follow-up fallback.

`sourceSecurity.outcomeCode` is exactly `new_intent`; a replay does not rewrite the stored authoritative document, while a conflict or pre-reservation rejection creates none. The authoritative `status / delivery.state / attemptCount` combinations are exactly `idempotency_reserved / not_started / 0`, `resolving_lines / not_started / 0`, `delivery_pending / pending / 1`, `accepted / accepted / 1`, `delivery_indeterminate / indeterminate / 1`, and `rejected_before_delivery / rejected / 0`. No cross-combination is valid.

No line stores price, cost, margin, supplier or inventory in this contract.

## 5. Authoritative line-resolution rules

The server resolves all lines in one bounded batch or an equivalently bounded validated snapshot. It must not issue up to 50 independent public CMS requests.

For every line:

1. Resolve the current unique published product from the closed public resolution identity. Configured products use canonical path; no-detail accessories use the approved opaque public quote key.
2. Confirm the line role, current RFQ eligibility and server-owned quantity unit.
3. Do not accept or reconstruct product model/name/image from the public draft. Add the current public model to the authoritative line only after successful unique server resolution.
4. For a standard configured option, match the complete current option identity and require exactly one Article Number.
5. For an explicitly allowed custom length, emit `sales_follow_up` with `articleNumber=null` and the controlled custom-configuration reason.
6. Version 1.0.0 permits no other manual sales-resolution variant; another product family requires an additive contract version.
7. For a catalog accessory, resolve one unique current product identity and Article Number from the opaque public quote key; never infer it from title, category, catalog path or source-product relationship position.
8. Reject the whole RFQ if the product is missing, unpublished, revoked, identity-conflicted, selection-stale, role-mismatched or otherwise not safely resolvable.

An ambiguous Article Number is never guessed. Intentional sales follow-up is a controlled business state, not a hidden fallback for tampering or stale data.

## 6. Internal state machine

```text
INTENT_ISSUED
  -> VALIDATING
  -> IDEMPOTENCY_RESERVED
  -> RESOLVING_LINES
  -> DELIVERY_PENDING
  -> ACCEPTED
       or DELIVERY_INDETERMINATE
       or REJECTED_BEFORE_DELIVERY
```

Rules:

- states are monotonic for one idempotency key and digest;
- `ACCEPTED` requires durable evidence of one accepted business RFQ;
- `DELIVERY_INDETERMINATE` is durable and never automatically reported as accepted;
- a blind retry from an indeterminate state is forbidden;
- pre-delivery validation failure creates no Feishu business record;
- a second payload under the same reserved key never replaces the first.

## 7. PublicRfqReceipt 1.0.0

Closed success/progress projection:

```text
contractVersion: "1.0.0"
publicReference: bounded random customer-safe reference
status: accepted | processing
receivedAt: server timestamp
lineCount: 1..50
messageKey: accepted uses rfq.accepted; processing uses rfq.processing
submittedBasketSnapshot: exact six-field source Basket snapshot
submittedBasketToken: lower-case SHA-256 hex of the frozen snapshot construction
retryAfterSeconds: forbidden for accepted; required 1..3600 for processing
```

The public receipt contains no customer fields, Article Number, internal UUID, idempotency key, Feishu ID, raw downstream status, stack trace or secret. `processing` means a durable indeterminate/recovery state exists; it does not mean accepted.

## 8. Public error envelope

```text
contractVersion: "1.0.0"
error:
  code: stable public code
  requestReference: bounded random support reference
  messageKey: exact rfq.error.<code> mapping
  fieldErrors?: closed list of public field + stable code
  retryAfterSeconds?: bounded integer
```

The public code enum, exact message-key pairing, field enum/code combinations and retry bounds are enforced by `schemas/public-rfq-error.v1.schema.json`. Public RFQ references match `RFQ-[A-Z2-9]{12}` and error references match `REQ-[A-Z2-9]{12}`.

Field errors are category-local: `invalid_customer_fields` requires customer-field errors; `invalid_line_count` requires `lineCount/invalid`; `invalid_quantity` requires `quantity/invalid`; `basket_refresh_required` requires `basket` with `expired|changed|unavailable`; `product_unavailable` requires `selection/unavailable`; and `configuration_changed` requires `selection|packaging` with `changed|unavailable`. These six codes require at least one matching field error. All other public codes forbid `fieldErrors`.

Public errors never echo the raw request, rejected value, contact details, Article Numbers, server path, downstream body or exception text.

## 9. HTTP semantics

| HTTP | Public meaning |
|---:|---|
| `201` | first confirmed accepted receipt |
| `200` | same-key/same-payload replay of a terminal accepted receipt |
| `202` | durable `processing` state; Basket retained |
| `400` | malformed JSON, unknown key or invalid closed contract |
| `403` | Origin/intent/challenge/security rejection |
| `409` | expired/stale Basket, product/configuration changed, or idempotency conflict |
| `413` | raw body exceeds 262144 bytes |
| `415` | unsupported media type |
| `422` | customer-field, contact-combination, quantity or line-count validation failure |
| `429` | rate limit; bounded `Retry-After` |
| `503` | durable state or downstream service unavailable; no success claim |

An idempotent replay may carry `Idempotency-Replayed: true`. No response enables cross-origin credentials or public caching.

After raw/closed-contract validation and digest construction, one bounded idempotency lookup precedes hard limits for a new business attempt. An unexpired same-key/same-digest record returns its stored `200`, `202` or deterministic pre-delivery `409` state even if the source bucket is now above the new-attempt threshold; it still increments traffic telemetry and never calls CMS/Feishu. Hard `429` applies to an unseen/expired key. The exact precedence is normative in `MACHINE_CONTRACT.md` section 7.

## 10. Browser Basket clearing rule

Only `status=accepted` with a valid `PublicRfqReceipt 1.0.0` authorizes clearing. The current Basket's `schemaVersion`, `revision`, `writerId`, `mutationId`, `updatedAt` and `expiresAt` must exactly equal `submittedBasketSnapshot`, and the recomputed `lowerhex(SHA-256(UTF8("GDHE-RFQ-BASKET-SNAPSHOT-V1\n") || UTF8(JCS(sourceBasket))))` must equal `submittedBasketToken`. `processing`, any mismatch, later tab mutation, error, client abort, timeout, invalid response or receipt-validation failure retains the Basket.
