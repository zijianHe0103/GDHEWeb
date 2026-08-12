# TASK-026 Requirements

status: Planner A0 frozen
contract_target: RFQ Submission 2.0.0
runtime_status: not implemented

## 1. Purpose

TASK-026 creates one additive machine-contract bundle for a future same-origin Next.js RFQ intake. It bridges the delivered Quote Basket `3.0.0` and TASK-025 mixed-line authority to the customer/security/idempotency decisions already frozen by TASK-024. It does not create a form, endpoint, persistence layer or Feishu connector.

## 2. Version and inheritance

1. The new public request, authoritative document, public receipt and public error use contract version `2.0.0`.
2. TASK-024 `1.0.0` files remain immutable historical authority. V2 copies only the still-valid customer, privacy, anti-abuse, replay, retention, receipt and error semantics and explicitly replaces the Basket/line identity projection.
3. Quote Basket `3.0.0`, MixedQuoteLineValidation `1.0.0` and the TASK-025 server-only consumer remain immutable. The future intake must call that consumer once for the complete `1..50` line projection.
4. Article Number is public and non-sensitive but untrusted. It may occur in the browser request and developer tools, but it remains excluded from visible customer copy, accessible names, public receipts and public errors.

## 3. Exact public line eligibility

Only Basket `3.0.0` lines in a submit-ready state are projectable:

| Basket line | Submission result |
|---|---|
| configured standard, `state=ready`, valid Article Number, `resolution=standard_ready` | one configured public RFQ line with that Article Number |
| configured custom, `state=ready`, `articleNumber=null`, `resolution=sales_follow_up` | one configured public RFQ line with `articleNumber:null` |
| catalog accessory, `state=ready`, valid Article Number | one accessory public RFQ line with that Article Number |
| configured `requires_validation` | blocked until TASK-025 batch validation upgrades the Basket line |
| accessory `requires_readd` | blocked until the customer re-adds a current accessory |

A public configured line is the exact TASK-025 mixed-request configured shape: `entryId`, `lineKind`, `canonicalPath`, closed `selection`, closed `packaging`, `quantityUnit` and `quantity`. A public accessory line is the exact TASK-025 mixed-request accessory shape: `entryId`, `lineKind`, `articleNumber`, `quantityUnit` and `quantity`.

The network projection excludes Basket `state`, `createdAt`, product model/name, image/Alt/dimensions, catalog display path, internal UUID, WordPress/SCF/database ID, Feishu identity, price, cost, margin, supplier, inventory and secret.

## 4. Identity, order and quantity

1. Lines preserve Basket order and the complete request contains `1..50` lines.
2. UUID input is canonical lower-case before equality checks.
3. Every `entryId` is unique.
4. Configured merge identity is the RFC 8785 JCS value of `{lineKind,canonicalPath,selection,packaging,quantityUnit}`.
5. Accessory merge identity is the RFC 8785 JCS value of `{lineKind,articleNumber,quantityUnit}`.
6. `entryId` and `quantity` are excluded from merge identity. Duplicate identities reject; intake never silently merges them.
7. Quantity is a positive safe integer. The public request never performs internal meter or package-count conversion.

## 5. Customer and envelope rules

The exact TASK-024 customer and envelope rules are inherited: required `fullName`, `companyName`, `countryRegion` and `city`; optional WhatsApp, WeChat, business email, phone, company Website and message; at least one contact method; privacy notice record without a marketing-consent flag; exact-empty honeypot and optional bounded challenge token. The field names, bounds and validation categories must not be widened or reinterpreted.

The Basket submission projection is limited to `163840` canonical UTF-8 bytes. The complete raw HTTP body remains limited to `262144` bytes, leaving the same `98304`-byte envelope reserve. No file, base64 payload or binary attachment is allowed.

## 6. Authoritative conversion

The public request is never authoritative. The future Next.js intake validates the closed v2 request, builds the exact TASK-025 mixed request, performs exactly one server-only mixed batch call and accepts only a fully bound, ordered response with the same line count and entry IDs.

Authoritative standard configured and catalog-accessory lines use the Article Number returned by the batch response, never the browser value. Authoritative custom-length lines use `articleNumber:null`, `resolution:sales_follow_up` and the controlled custom-length reason. The current public model/path may be added only from the batch response. Stable Product UUID is not invented because the delivered TASK-025 response does not expose it.

Any mismatch, stale configuration, unpublished/revoked product, duplicate identity, role/unit conflict or incomplete response rejects the entire request. There is no per-line public `/resolve`, Product Configuration or RelatedProductCard fallback.

## 7. Canonicalization, idempotency and clearing

1. V2 uses a new MAC prefix: `GDHE-RFQ-DIGEST-V2\n2.0.0\n`.
2. V2 uses a new Basket snapshot prefix: `GDHE-RFQ-BASKET-SNAPSHOT-V2\n`.
3. The business digest covers only normalized `basket`, `customer` and `privacyNotice`; intent, idempotency key, anti-abuse and transport observations remain excluded.
4. The task must publish non-production fixed vectors for RFC 8785 bytes, version-selected HMAC-SHA-256, comparison token and Basket snapshot token. V1 vector values must not be reused as if compatible.
5. Replay precedence, first durable reservation anchoring, exact `2592000000 ms` expiry, no replay extension, no automatic resend after expiry and zero business state for pre-reservation rejection remain exactly as TASK-024.
6. Basket clearing requires an accepted, Schema-valid v2 receipt plus exact equality of the six Basket `3.0.0` snapshot fields and successful recomputation of the v2 snapshot token. Processing, error, timeout or any newer Basket mutation retains the Basket.

## 8. Evidence and review

The bundle must contain strict Draft 2020-12 Schemas with closed local refs, positive and negative samples, semantic cross-item/cross-field validation, deterministic crypto/snapshot vectors and a dependency-free or existing-dependency verifier. Tests must demonstrate compatibility with frozen TASK-025 mixed request/response Schemas without modifying them.

After Planner validation, exactly one complete independent adversarial review is requested. If it finds a real issue, only that bounded finding is repaired and the same reviewer performs a narrow closure confirmation; the full review scope is not repeated.

## 9. Explicitly deferred

Customer UI, Route Handler, security-state persistence, challenge vendor, mail/notification, Feishu field mapping/write, reconciliation, Staging, production origin/WAF/observability, deployment and Git delivery are not part of TASK-026.
