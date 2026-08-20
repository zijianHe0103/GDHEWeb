# RFQ Submission Contract 2.0.0

status: artifact-only machine contract; runtime not implemented

## Contract layers

`PublicRfqSubmissionDraft 2.0.0` is untrusted browser input. `AuthoritativeRfqDocument 2.0.0` is server-produced only after reservation and one complete TASK-025 mixed-batch validation. `PublicRfqReceipt 2.0.0` and `PublicRfqError 2.0.0` are closed customer-safe projections. Passing JSON Schema never promotes a public document to authority.

The normative bundle is exactly the five files in `schemas/` plus the semantic gates and deterministic fixtures in `verify-machine-contract.cjs`, `samples/` and `vectors/`. Every object is closed, the v2 graph contains only relative file/fragment refs, and network ref resolution is disabled. The semantic gate recursively rejects any lone UTF-16 surrogate before RFC 8785 canonicalization for every Schema-valid document kind.

## Public request

The closed root fields are `contractVersion`, `submissionIntent`, `idempotencyKey`, `basket`, `customer`, `privacyNotice` and `antiAbuse`. The exact TASK-024 contact fields, conditional contact rule, privacy-notice record, honeypot and optional challenge token are inherited without widening.

`basket.contractVersion` is `2.0.0`; `basket.sourceBasket.schemaVersion` is `3.0.0`; `items` preserves order and contains `1..50` lines. A configured line is exactly the TASK-025 mixed-request configured shape. Standard selection requires `articleNumber` and `standard_ready`; custom length requires `articleNumber:null` and `sales_follow_up`. An accessory is exactly the TASK-025 mixed-request accessory shape and requires Article Number. Quantity is a positive safe integer and `piece`, matching the delivered TASK-025 generation.

Article Number is public and non-sensitive but untrusted. It is permitted only in the public request line positions above. It is forbidden in visible customer copy, accessible names, receipts and errors. The projection excludes Basket state, creation time, display product/model/name/media/catalog path, internal UUIDs, WordPress/SCF/database/Feishu IDs, price, currency, cost, margin, supplier, inventory and secrets.

The canonical JCS Basket projection limit is `163840` UTF-8 bytes. The future transport retains the TASK-024 `262144` raw-body limit and `98304`-byte envelope reserve. Files, base64 and binary attachments are outside the contract.

## Semantic request gates

UUIDs are lower-case canonical before equality. `entryId` is unique. Configured merge identity is JCS of `{lineKind,canonicalPath,selection,packaging,quantityUnit}`; accessory merge identity is JCS of `{lineKind,articleNumber,quantityUnit}`. `entryId` and quantity do not participate. Duplicate identities reject atomically and are never merged. Snapshot expiry is exactly `updatedAt + 2592000000 ms`.

The future intake must form one complete TASK-025 request and call the delivered server-only mixed consumer exactly once. It accepts only an ordered, fully bound response. Count, order, `entryId`, line kind, quantity unit/value, configured path, complete selection and packaging, resolution and every Article Number location must match the immutable TASK-025 consumer rules. The authoritative model and every authoritative field are copied from the bound response. Any missing, stale, unpublished, revoked, ambiguous, role/unit/path/configuration mismatch or incomplete response rejects the whole RFQ.

## Authoritative document

The authoritative line union is additive v2:

- configured standard: batch response `resolved_article_number`, current model/path, Article Number, normalized selection/packaging/unit/quantity;
- configured custom: batch response `sales_follow_up`, `articleNumber:null`, normalized values and added literal `followUpReason:"custom_length"`;
- catalog accessory: batch response `resolved_article_number`, current model, `publicPath:null`, Article Number, `piece` and quantity.

No stable Product UUID is invented because the delivered TASK-025 response does not expose one. Standard/accessory Article Numbers and public model/path are copied only from the complete batch response, never around it from browser input. A configured-standard authoritative root `articleNumber` must exactly equal `selection.articleNumber`; a Schema-valid mismatch is a semantic rejection.

The inherited status cells are exactly: `idempotency_reserved/not_started/0`, `resolving_lines/not_started/0`, `delivery_pending/pending/1`, `accepted/accepted/1`, `delivery_indeterminate/indeterminate/1`, and `rejected_before_delivery/rejected/0`. Idempotency expiry is fixed at first durable reservation plus `2592000000 ms`; replay never extends it.

## Receipt and error

Receipts contain only public reference, accepted/processing state, receive time, line count, fixed message key, the six-field Basket 3.0 snapshot and v2 snapshot token. Accepted forbids retry delay; processing requires `1..3600` seconds. Errors inherit the TASK-024 codes, exact `rfq.error.<code>` pairing, retry rule and category-local field-error domains. Receipt/error content never contains contact data, Article Numbers, product identity, raw values, downstream bodies or internal diagnostics.

## Non-implementation boundary

This bundle creates no form, Route Handler, persistence, idempotency store, challenge provider, WordPress/Feishu call, notification, deployment or Basket clearing runtime. Those require later confirmed tasks.
