# RFQ Failure and Idempotency Matrix

status: frozen design; implementation deferred

## 1. Failure matrix

| Condition | HTTP / public code | Durable RFQ state | Downstream action | Browser behavior |
|---|---|---|---|---|
| Valid first request, Feishu acceptance confirmed | `201 / accepted` | `ACCEPTED` | exactly one accepted business RFQ | show receipt; clear only submitted Basket snapshot |
| Same key, same digest, already accepted | `200 / accepted` + replay marker | unchanged `ACCEPTED` | none | show same receipt; clear only matching snapshot |
| Same key, same digest, durable indeterminate work | `202 / processing` | `DELIVERY_INDETERMINATE` | no blind resend | retain Basket; show reference and retry-later state |
| Same key, different digest | `409 / idempotency_conflict` | original unchanged | none | retain Basket; obtain a new intent/key for changed request |
| Intent invalid, unseen-expired or context mismatch | `403 / invalid_submission_intent` | none | none | retain Basket; refresh form/intent |
| Origin mismatch or missing in production | `403 / request_not_allowed` | none | none | retain Basket; generic error |
| Challenge required but missing/invalid/expired/replayed | `403 / challenge_required_or_invalid` | none | none | retain Basket; present/retry challenge as allowed |
| Unseen/expired key at source/contact hard limit | `429 / rate_limited` | none | none | retain Basket; honor bounded `Retry-After` |
| Unsupported media type | `415 / unsupported_media_type` | none | none | retain Basket |
| Body over 262144 bytes | `413 / payload_too_large` | none | none | retain Basket; reduce content; never truncate |
| Basket submission projection over 163840 bytes while raw body is otherwise valid | `422 / basket_too_large_to_submit` | none | none | retain Basket; reduce or split RFQ; never truncate |
| Malformed JSON or unknown contract key | `400 / invalid_request` | none | none | retain Basket; generic correction message |
| Missing/invalid customer field or contact combination | `422 / invalid_customer_fields` | none; pre-reservation | none | retain Basket; show closed field errors |
| 0 lines or 51+ lines | `422 / invalid_line_count` | none; pre-reservation | none | retain Basket; add product or split request |
| Quantity invalid/unsafe | `422 / invalid_quantity` | none; pre-reservation | none | retain Basket; show affected public line |
| Basket expired or client line shape unsupported | `409 / basket_refresh_required` | none; pre-reservation | none | retain Basket; ask customer to review current products |
| Product missing/unpublished/revoked/identity-conflicted | `409 / product_unavailable` | `REJECTED_BEFORE_DELIVERY` reserved result | none | retain Basket; identify public line without internal details |
| Standard option removed, changed or ambiguous | `409 / configuration_changed` | `REJECTED_BEFORE_DELIVERY` reserved result | none | retain Basket; return to product and reconfigure |
| Explicit custom/manual-follow-up policy valid | normal acceptance path | line uses `sales_follow_up` | included in the one RFQ | receipt does not expose internal resolution status |
| CMS batch resolver unavailable/invalid | `503 / service_temporarily_unavailable` | no delivery | none | retain Basket; safe retry with same key/digest |
| Durable idempotency state unavailable | `503 / service_temporarily_unavailable` | not established | none | retain Basket; no success claim |
| Feishu fails before any write is dispatched | `503 / service_temporarily_unavailable` | durable delivery failure/pending policy | none | retain Basket; same-key retry follows recorded state |
| Feishu outcome unknown after dispatch/timeout | `202 / processing` when durable, otherwise `503` | `DELIVERY_INDETERMINATE` | no blind resend | retain Basket; same reference on retry |
| Public response validation fails in browser | treat as unavailable | server state unknown to browser | none from browser | retain Basket; do not infer success |
| Client abort/network loss | no reliable response | server state may continue | governed by durable state only | retain Basket; retry exact key/digest |

## 2. Idempotency identity

One idempotency identity is:

```text
(contractVersion, idempotencyKey, canonicalPayloadDigest)
```

The raw key is not logged and is never the business RFQ reference. The canonical digest includes normalized customer data, privacy-notice record and the complete `PublicRfqBasketSubmission` projection including source snapshot identity. Images and other display-only storage fields are absent by contract. Anti-abuse/challenge tokens and transport metadata are excluded so an exact business retry remains identical.

## 3. First-use and replay rules

| Key state | Payload | Intent | Result |
|---|---|---|---|
| unseen | valid | within 30 minutes | validate, reserve durably, then resolve/deliver |
| unseen | valid | expired/invalid | reject; no reservation or delivery |
| reserved/rejected/accepted/indeterminate within 30 days | same digest | intent now expired or source now hard-limited | return the stored `200`, `202` or deterministic `409`; no second delivery |
| reserved/rejected/accepted/indeterminate within 30 days | different digest | any | `409 idempotency_conflict`; original state unchanged |
| record expired after 30 days | any | fresh valid intent required | treated as a new business attempt under current limits |

Every durable reservation fixes `createdAt`; `expiresAt` is exactly `createdAt + 2592000000 ms` for all states and is never extended by replay. Pre-reservation failures create no idempotency business state. The 30-day idempotency record window is distinct from the 24-month accepted-RFQ business retention rule.

## 4. Atomicity rules

- Validate the complete customer object and all Basket lines before downstream delivery.
- Resolve all lines into one complete authoritative document before delivery.
- Any invalid line rejects the whole RFQ; no valid subset is sent.
- Never truncate a 51-line request to 50.
- Never delete an invalid line silently.
- Never clear the Basket on `processing` or error.
- Never create a second Feishu business RFQ merely because the first HTTP response was lost.
- Never reuse an existing key for a corrected/changed payload; issue a new intent and key.

## 5. Recovery rules

`DELIVERY_INDETERMINATE` requires a controlled reconciliation path that checks the stable external RFQ identity against Feishu before any retry. Reconciliation may transition to `ACCEPTED` when the existing record is proven, or to a separately authorized safe retry state when absence is proven. It must not infer absence from a timeout alone.

Expiry does not schedule or authorize a resend. After the exact 30-day window, the old key is no longer replayable; a customer must make a new explicit submission with a fresh intent/key. An unresolved indeterminate state remains a reconciliation concern and cannot be used as evidence that a downstream record is absent.

No recovery worker, queue or store is selected by TASK-024. A later implementation must prove crash recovery, concurrent duplicate requests, multi-instance behavior and Feishu ambiguity before live write is enabled.

## 6. Customer-visible guarantees

- A receipt is not a quotation, price, order confirmation or payment record.
- `accepted` means one RFQ was accepted for business follow-up.
- `processing` means the website cannot yet confirm final acceptance but has a durable reference.
- All errors preserve the local Basket.
- Public messages name only customer-actionable fields/lines and stable outcomes; they do not expose Article Numbers, internal IDs, downstream payloads or exception text.
