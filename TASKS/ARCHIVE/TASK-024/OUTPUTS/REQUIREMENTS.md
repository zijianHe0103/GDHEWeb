# TASK-024 RFQ Submission Requirements

status: confirmed contract input
contract_language: English public UI; English technical identifiers
implementation_status: not implemented

## 1. Outcome

The GDHE website collects multiple configured products and catalog accessories in a `Quote Basket`, then sends one B2B `Request a Quote`. It does not sell online, confirm an order, reserve inventory, calculate price or take payment.

TASK-024 freezes the submission contract only. The browser form, Next.js Route Handler, durable state, challenge provider and Feishu connector remain separate future implementation tasks.

## 2. Confirmed customer journey

1. A visitor adds one or more products or accessories to the local Quote Basket.
2. The Basket remains in the same browser for up to 30 days without login.
3. The visitor opens `/request-a-quote/`, reviews quantities and supplies customer information.
4. The browser requests a short-lived submission intent from the same-origin Next.js server and submits one minimal public projection of the validated Basket once. The network projection excludes images and browser-only storage metadata that are not required to identify the submitted snapshot.
5. The Next.js server treats every browser field and Basket line as untrusted, validates the whole request and re-resolves every line against current server-side CMS authority.
6. Only after all lines are valid and a durable idempotency state exists may the server deliver one RFQ to Feishu.
7. The Basket is cleared only after the server returns a confirmed `accepted` receipt. `processing`, rejection, timeout and unavailable responses retain it.

## 3. Customer information

Required:

- `Full Name`;
- `Company Name`;
- `Country/Region`;
- `City`;
- at least one valid contact channel from `WhatsApp`, `WeChat`, `Business Email` or `Phone`.

Optional:

- each individual contact channel, provided at least one valid channel remains;
- `Company Website`;
- `Message / Additional Requirements`.

Public contact-channel order is `WhatsApp -> WeChat -> Business Email -> Phone`. WhatsApp and WeChat are independent free-text fields and may both be supplied. The website does not perform OTP or account-ownership verification.

## 4. Field limits and normalization

Limits are measured after approved trimming as Unicode code points, not UTF-16 code units or bytes:

| Field | Maximum |
|---|---:|
| Full Name | 120 |
| Company Name | 160 |
| Business Email | 254 |
| WhatsApp | 128 |
| WeChat | 128 |
| Phone | 64 |
| Country/Region | 100 |
| City | 100 |
| Company Website | 2048 |
| Message / Additional Requirements | 2000 |

Values are never silently truncated. Optional values that become empty after trimming are omitted. Single-line fields reject line breaks and control characters. Message may contain normalized line breaks but rejects NUL and other non-text control characters.

Business Email requires syntactic email validation without DNS or mailbox verification. Company Website requires an absolute `http` or `https` URL, rejects credentials and control characters, and is never fetched or DNS-resolved by the intake path. Phone, WhatsApp and WeChat are not rewritten into guessed canonical account formats.

## 5. Basket and line requirements

- The local source is a validated Quote Basket `2.0.0`. The network request does not embed that storage document byte-for-byte; it contains a closed `PublicRfqBasketSubmission 1.0.0` projection.
- A request contains `1..50` distinct lines; `51+` rejects the whole request. Every public `entryId` is unique, and the complete public Basket merge identity defined by TASK-022 is also unique after excluding `entryId` and quantity. A duplicate ID or duplicate merge identity rejects the whole request before digest lookup or reservation; quantities are never double-counted or silently merged by the intake.
- Each quantity is a positive safe integer.
- The browser Basket contains no Article Number, internal Product/Media UUID, WordPress ID, Feishu ID, price, cost, stock, supplier or credential.
- Supported public line roles remain `configured_product` and `catalog_accessory`.
- The projection preserves exact Basket snapshot identity, line entry IDs, public line identity, customer selections, packaging, submitted unit and quantity. It excludes image URL/dimensions/Alt, public product name, item creation time and other display-only data.
- Configured products use their canonical public path as the public resolution identity. A no-detail catalog accessory requires a dedicated opaque public quote key that is not a WordPress ID, Product UUID or Article Number. Current Basket `2.0.0` has no such key; production accessory submission therefore remains blocked until a separately accepted additive Basket/submission contract supplies it.
- The public resolution identity, submitted unit and option labels remain untrusted until server re-resolution. The browser submission projection does not carry a product model; the authoritative document may add the current public model only after successful server resolution.
- The server never derives a product, unit or Article Number from title, category, array order, image, track width or another heuristic.

## 6. Server shape and trust boundary

- The public browser calls a same-origin Next.js Route Handler only.
- No NestJS service or second backend is introduced.
- WordPress remains the marketing/content and structured public-product read authority; it is not an RFQ receiving database.
- Feishu remains the future business RFQ destination and quotation workspace.
- Feishu credentials, WordPress privileged credentials and raw downstream responses remain server-only.
- A trusted server must batch re-resolve the entire Basket into authoritative line identities before delivery. A per-line public `/resolve` or Product Configuration loop is not an acceptable 50-line production design.

## 7. Atomic acceptance

All lines pass or the RFQ is rejected as a whole. No partial Feishu record, partial success receipt or automatic Basket truncation is allowed.

A standard public option must still identify exactly one current valid Article Number. An intentionally supported custom configuration, or another current published product explicitly allowed for sales follow-up, may produce a server-only `sales_follow_up` line with no Article Number. A stale, removed, ambiguous or tampered selection never falls back to guessing.

## 8. Public request limits and abuse controls

- The serialized `PublicRfqBasketSubmission` projection is at most `163840` UTF-8 bytes (`160 KiB`). A larger locally valid Basket remains stored but cannot be submitted as one RFQ; the customer is asked to reduce or split it.
- The complete raw request body is at most `262144` bytes (`256 KiB`), leaving a fixed `98304`-byte (`96 KiB`) envelope budget for customer, notice, intent, idempotency and anti-abuse fields. The final raw limit is enforced before JSON/business parsing and downstream calls.
- Files, binary data and base64 media are forbidden.
- Exact production Origin, same-origin intent, closed JSON shape and `application/json` are required.
- Honeypot, minimum-fill-time and rate limits always apply.
- Frequency alone does not require a visible challenge for unseen/expired-key business attempts 1–3 in 10 minutes; attempts 4–5 require the configured challenge; attempt 6+ returns `429`.
- An unseen/expired-key source attempt 21+ in a rolling 24 hours returns `429`.
- One normalized contact fingerprint may create at most 10 new RFQ intents in 24 hours.
- An unexpired same-key/same-payload retry is looked up after raw/closed-contract validation but before the hard limit for a new attempt. It still counts as source traffic, returns the stored state, is not a new business RFQ and performs no CMS/Feishu delivery.
- No challenge provider is selected by TASK-024.

## 9. Idempotency and time budgets

- The server-issued intent is valid for first use for 30 minutes.
- Pre-reservation validation/security failures create no durable RFQ/idempotency business state. The first durable reservation fixes `createdAt`; reserved, rejected, accepted and delivery-indeterminate idempotency records expire exactly 30 days later, with no retry extension.
- Same key and same canonical payload returns the same durable receipt or current state.
- Same key and different canonical payload returns a conflict and creates no second RFQ.
- One Feishu delivery attempt has a 10-second limit; the public intake budget is 15 seconds.
- An unknown downstream outcome is never reported as success and is never blindly resent.
- If durable idempotency/state cannot be established, the request fails closed.
- Expiry never triggers automatic delivery. A later business attempt requires a fresh intent/key and an explicit new customer submission.

## 10. Privacy and retention

- The submit area presents a privacy-purpose notice and Privacy Policy link.
- No mandatory checkbox or marketing opt-in is collected.
- The record stores notice version and presentation/submission timestamps, but does not label submission as consent.
- Accepted RFQ identity, contact details and message are retained for 24 months from the last meaningful human business interaction, subject to later approved legal policy.
- The website provides no dedicated self-service deletion UI or API. Legally valid requests may still be handled manually through the ordinary Privacy Policy contact route.
- Sanitized application/error logs: 30 days.
- Security-event metadata: 90 days.
- Keyed rate/contact fingerprints: 48 hours.
- Non-identifying aggregate metrics: 13 months.

## 11. Explicit non-goals

- no Route Handler, form, database, queue, worker or Feishu write in TASK-024;
- no WordPress inquiry post type or WordPress write endpoint;
- no file upload, email notification, checkout, payment, price or order;
- no live Feishu Base/table/field mapping and no guessed IDs;
- no provider procurement, production secret, deployment or public route;
- no modification of frozen Quote Basket, QuoteLine, Product Configuration, ProductCard or RelatedProductCard contracts.

## 12. Remaining implementation gates

The following are not user decisions to guess in this task and must be closed by evidence in later tasks:

- a batch authoritative CMS re-resolution contract for up to 50 mixed lines, including a public non-internal identity for no-detail catalog accessories;
- an additive Basket/submission-contract transition that supplies that public accessory quote key without rewriting Quote Basket `1.0.0/2.0.0` history;
- a durable Next.js-compatible idempotency/recovery store and deployment topology;
- production public origin, trusted proxy/source attribution and challenge provider;
- the real Feishu Base/table/field/relationship/permission/idempotency mapping;
- jurisdiction-specific Privacy Policy wording, lawful basis and retention implementation;
- production monitoring, secret store, alerting, reconciliation and recovery procedures.
