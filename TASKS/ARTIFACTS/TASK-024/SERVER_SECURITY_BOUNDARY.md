# RFQ Server Security Boundary

status: frozen design; implementation deferred
server_shape: Next.js-only

## 1. Topology

```text
Browser
  -> same-origin Next.js RFQ intake
      -> durable idempotency/recovery state
      -> server-only WordPress/GDHE read authority
      -> controlled Feishu write connector

Browser -X-> Feishu
Browser -X-> WordPress write API
WordPress -X-> RFQ receiving database
```

Next.js-only means one application deployment boundary, not client-side integration. Every credential and privileged operation remains in server-only modules. A future separate service requires a new task and architecture decision based on measured operational need.

## 2. Ordered intake gates

The future endpoint applies these gates in order:

1. Accept only the fixed same-origin POST route and allowed method.
2. Derive source attribution only from trusted deployment/proxy metadata.
3. Require exact configured production `Origin`; do not trust browser forwarding headers or permissive CORS.
4. Require `application/json` with approved UTF-8 handling.
5. Increment source traffic telemetry for every POST that reaches intake.
6. Reject declared or streamed body size above `262144` bytes before JSON/business parsing.
7. Parse JSON once and validate the closed `PublicRfqSubmissionDraft 1.0.0` Schema.
8. Enforce semantic UTF-8/code-point/time limits, the Basket projection's `163840`-byte JCS budget, 1–50 lines and the fixed-vector canonical digest rules.
9. Perform one bounded durable lookup by idempotency-key fingerprint. An unexpired same-key/same-digest record returns its stored state without CMS/Feishu; same-key/different-digest returns `409`.
10. For an unseen/expired key only, validate server-issued intent, minimum-fill-time and honeypot.
11. For an unseen/expired key only, apply source/contact limits and verify a challenge when required. Hard source limits reject a new business attempt with `429`.
12. After every pre-reservation gate passes, create one durable reservation bound to the canonical digest.
13. Batch re-resolve every public Basket line against current server-side CMS authority.
14. Persist the authoritative RFQ and delivery state before starting an irreversible downstream write.
15. Perform at most the controlled Feishu delivery attempt allowed by the current state.
16. Return only a validated public receipt or stable public error.

Method/origin/content-type/raw-body/closed-contract gates always precede idempotency lookup. The lookup intentionally precedes new-attempt intent/rate/challenge gates so an existing durable result stays recoverable without a duplicate delivery. No other later gate may bypass an earlier applicable gate.

## 3. Origin, CSRF and request isolation

- Production accepts only the configured public origin; Local/Preview/Staging origins require separately scoped environment policy and never become production defaults.
- The server-issued 30-minute intent is bound to the idempotency key and intended RFQ context and is validated in addition to Origin.
- There is no public credentialed CORS API.
- Cookies, if later used for intent delivery, must be narrowly scoped, secure in production and SameSite-protected; the contract does not require login.
- `GET`, `HEAD` and cross-origin requests cannot create RFQs.
- Security headers, challenge responses and downstream diagnostics are not reflected into HTML or public JSON.

## 4. Closed input and hostile-value boundary

- Validate raw bytes before parsing and use a parser that cannot invoke user-defined JavaScript coercion/Proxy behavior on network JSON.
- Reject unknown object keys, sparse/invalid arrays, duplicate semantic Basket identities and unsafe numbers.
- Count Unicode code points explicitly; do not rely on JavaScript `.length` for limits.
- Never call `toString`, inspect `cause/message`, spread or reflect an untrusted thrown value in public error handling.
- Normalized errors contain only stable internal classifications and a bounded public request reference.
- Website URLs are data only and are never fetched.

## 5. Authoritative product re-resolution

The browser's path/opaque quote key and selections do not prove that a product is current or quotable. Images and product model/name are omitted from the submission projection. The server must use a closed, server-only batch resolver or validated equivalent that can handle the complete 50-line request within the 15-second budget.

The resolver must prove:

- one unique current published stable Product identity per configured-product canonical path or catalog-accessory opaque public quote key;
- the correct configured-product or catalog-accessory role;
- current RFQ eligibility and current quantity unit;
- exact standard option uniqueness where an Article Number is expected;
- explicit custom/manual-follow-up policy where Article Number may remain null;
- no first-wins behavior for UUID, path or Article Number conflicts;
- no identity derivation from names, catalog path, category labels, relationship order or physical width;
- one atomic result for all lines, with no per-line public request or partial output.

Existing Product Configuration and RelatedProductCard contracts are inputs to the feasibility audit, not automatic proof that this batch resolver already exists.

## 6. Idempotency and downstream isolation

- Durable state is required; in-memory process state and browser storage are insufficient.
- The idempotency key is UUIDv4, but uniqueness alone is not trusted; it is paired with the versioned keyed payload digest.
- Same key/same digest returns the same stored `200`, `202` or deterministic pre-delivery `409` state even when the current source bucket would reject a new attempt. Same key/different digest is `409`.
- Pre-reservation method, Origin, media, body, Schema, customer, line, intent, honeypot, rate or challenge failures create no durable RFQ/idempotency business state.
- The first successful durable reservation fixes `createdAt`; `expiresAt` is exactly 30 days later for reserved, rejected, accepted and delivery-indeterminate records. Replays never extend it.
- A product/configuration failure after reservation is retained as deterministic `rejected_before_delivery` until expiry so an exact replay cannot produce a different outcome.
- At expiry the key is no longer replayable; any later customer attempt requires a fresh intent/key and is not an automatic resend.
- The 30-day idempotency record stores only the minimum needed to return/reconcile the public state; it must not be used as an alternate unbounded customer database.
- A Feishu write includes a stable external RFQ reference/idempotency identity so later reconciliation can distinguish an existing record from a missing record.
- Downstream timeout or connection loss after dispatch becomes a durable indeterminate state. Automatic blind resend is prohibited.
- If one logical RFQ later requires multiple Feishu records, public success still requires a durable, reconciled all-or-nothing business outcome; the browser never receives partial success.

## 7. Rate and adaptive challenge policy

| Scope | Window | Behavior |
|---|---|---|
| Server-derived source | rolling 10 minutes | attempts 1–3 normal; 4–5 require challenge; 6+ return `429` |
| Server-derived source | rolling 24 hours | attempt 21+ returns `429` |
| Normalized contact fingerprint | rolling 24 hours | at most 10 new RFQ business intents |

An idempotent retry counts as source traffic telemetry but not as a new contact-level business intent. An unexpired same-key/same-digest state is returned before the hard limit for a new attempt and never triggers CMS/Feishu. Challenge success never bypasses a hard limit for an unseen/expired key. Fingerprints are versioned server-keyed values retained for 48 hours; raw IP/contact data is not written to normal logs.

## 8. Timeouts and availability

- Public request budget: 15 seconds.
- One Feishu attempt: 10 seconds.
- Remaining time is reserved for durable state transition and bounded response generation.
- There is no implicit application retry inside the first public request.
- Durable store unavailable: fail closed with `503` before claiming success.
- CMS resolver unavailable or invalid: fail closed without Feishu delivery.
- Feishu unavailable before dispatch: durable non-success state and `503`/`202` as defined by known delivery certainty.
- Unknown post-dispatch result: durable `processing`; never `accepted` until reconciled.

## 9. Secret and dependency boundary

Secrets belong in the deployment secret store and are accessed only from server-only modules. They never appear in public environment variables, browser bundles, HTML, Flight data, source maps, fixtures, Markdown, logs or public receipts.

Separate credentials/keys are required for:

- WordPress privileged read if the final resolver needs it;
- Feishu application access;
- idempotency/digest and privacy fingerprints;
- challenge verification;
- observability backends.

Key rotation must be versioned so active 30-day idempotency records and 48-hour fingerprints remain interpretable only for their required window.

## 10. Logging and retention

Allowed routine event examples:

- timestamp, deployment environment, stable outcome code;
- bounded public request reference;
- line count and request byte count;
- latency bucket and downstream phase;
- versioned keyed source/contact fingerprints;
- idempotent replay boolean without the raw key.

Forbidden:

- complete request/form/Basket body;
- full name, email, phone, WhatsApp or WeChat;
- raw IP address;
- Article Number list;
- idempotency key or challenge token;
- credentials/secrets;
- raw WordPress/Feishu response or exception.

Retention is 30 days for sanitized application/error logs, 90 days for security-event metadata, 48 hours for keyed fingerprints and 13 months for non-identifying aggregate metrics. These stores are not the Feishu RFQ business record.

## 11. Browser security outcome

The browser receives only a stable receipt or stable error. It never receives Article Numbers resolved on the server, internal UUIDs, Feishu IDs, source/contact fingerprints, rate-limit keys, challenge verification details, raw exception text or downstream payloads. Basket clearing is permitted only after a validated `accepted` receipt for the exact submitted snapshot.
