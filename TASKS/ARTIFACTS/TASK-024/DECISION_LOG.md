# TASK-024 Decision Log

## Confirmed before TASK-024

- The public flow is `Add to Quote -> Quote Basket -> Request a Quote`; it is not checkout, ordering or payment.
- Quote Basket is retained in the same browser for 30 days without login.
- Every submitted product/accessory line has a positive integer quantity.
- The public Basket contains no Article Number, internal UUID, WordPress ID or Feishu ID; the server must re-resolve every line.
- The browser never connects directly to Feishu and never receives Feishu credentials.
- Company Website is optional.
- WhatsApp and WeChat are prioritized in the public contact form.

## Pending decisions

None. All current TASK-024 user decision gates are confirmed. Technical contract drafting and independent read-only feasibility checks remain; implementation choices that require a vendor, production topology or live Feishu identifiers stay deferred.

Each item must be confirmed explicitly. No common B2B convention is treated as an accepted decision.

## Confirmed during TASK-024

### Decision 1 — Minimum identity and company fields

- Confirmed at: `2026-08-10T02:58:21Z`
- User choice: `A`
- `Full Name`: required.
- `Company Name`: required.
- `Company Website`: optional, preserving the pre-TASK-024 decision.
- This decision does not yet determine which contact channels are required or how they are validated.

### Decision 2 — Minimum contact-channel combination

- Confirmed at: `2026-08-10T03:07:01Z`
- User choice: `A`
- `Business Email`, `WhatsApp`, `WeChat` and `Phone` are individually optional.
- At least one of those four channels must be supplied and pass its channel-specific validation before submission can be accepted.
- Public display order is `WhatsApp -> WeChat -> Business Email -> Phone`.
- More than one channel may be supplied; no channel is mutually exclusive with another.
- Exact WhatsApp and WeChat input/normalization rules remain a separate pending decision.

### Decision 3 — WhatsApp and WeChat input rules

- Confirmed at: `2026-08-10T03:10:22Z`
- User choice: `B`
- `WhatsApp` and `WeChat` are independent free-text contact fields.
- A supplied value is trimmed and must remain non-empty; it is subject to a bounded maximum length that will be frozen with the later field-limit decision.
- The public and server contracts do not enforce an international-number, E.164, WeChat-ID or bound-mobile pattern and do not rewrite the customer's identifier.
- Both fields may be supplied at the same time.
- No OTP, account ownership or real-account verification is performed by this website flow.

### Decision 4 — Country/Region and City requirements

- Confirmed at: `2026-08-10T03:19:53Z`
- User choice: `B`
- `Country/Region`: required.
- `City`: required.
- Both supplied values must remain non-empty after normalization and pass the later frozen field limits.
- This decision freezes requiredness only; input controls, canonical country values and exact length limits remain contract details to be finalized without guessing production identifiers.

### Decision 5 — Message / Additional Requirements

- Confirmed at: `2026-08-10T16:14:31Z`
- User choice: `A`; the duplicate identical reply is treated as one decision and is not carried into Decision 6.
- `Message` / `Additional Requirements` / `Project Details`: optional.
- A customer may submit a valid Quote Basket and the required customer/contact fields without entering a message.
- If supplied, the value is trimmed and subject to the later frozen field-length and payload limits.
- The field is intended only for additional project context; it does not override structured product configuration or quantity.

### Decision 6 — Privacy notice and marketing boundary

- Confirmed at: `2026-08-10T16:26:31Z`
- User choice: `A`
- The RFQ submit area displays a clear privacy-purpose notice and a link to the applicable Privacy Policy.
- Submission does not require a separate checkbox and the technical record must not label the action as consent.
- The server records the presented privacy-notice version and submission timestamp for auditability; it does not infer that the customer opted into marketing.
- Customer data from this flow is used only to receive, validate, route and respond to the RFQ under the production lawful basis and policy approved for the applicable jurisdictions.
- No marketing subscription or marketing-consent field is collected in this scope.
- Final legal wording and lawful-basis selection require jurisdiction-appropriate legal review before production publication.

### Decision 7 — Server implementation shape

- Confirmed at: `2026-08-10T16:34:53Z`
- User confirmation: `B: Next.js-only`.
- The browser submits only to a same-origin Next.js server Route Handler/intake endpoint; it never calls Feishu or a WordPress write endpoint directly.
- WordPress remains the CMS and public structured-content read authority. It does not become the RFQ receiving database or hold the Feishu write credentials.
- The Next.js server owns the RFQ trust boundary: Origin/Content-Type checks, payload validation, authoritative line re-resolution, idempotency, rate/anti-bot enforcement, secret isolation and controlled Feishu delivery.
- Feishu credentials and raw downstream responses remain server-only and must never enter browser bundles, HTML, Flight data, logs or public receipts.
- No NestJS service, second backend deployment or NestJS dependency is introduced by the current implementation sequence.
- A future NestJS extraction requires a separately authorized task and architecture decision supported by measured need, such as multiple clients, complex durable background workflows, multiple integrations or independent scaling/ownership.
- Choosing Next.js-only does not remove the need for a durable idempotency/recovery mechanism; its exact implementation is deferred to the server endpoint task after this contract is accepted.

### Decision 8 — Maximum Quote Basket lines per RFQ

- Confirmed at: `2026-08-10T16:43:15Z`
- User choice: `B`
- A single `Request a Quote` submission may contain at most `50` distinct Quote Basket lines.
- Line count is based on the final distinct configured-product/catalog-accessory lines, not on each line's quantity.
- The server enforces the limit again after closed-schema parsing and before authoritative line re-resolution or downstream delivery; client-side UI checks are advisory only.
- A request with `51` or more lines is rejected as one whole request. It is never truncated and no subset is accepted or sent downstream.
- The browser retains the complete Basket and shows a stable instruction to reduce or split the RFQ; no successful receipt is produced.

### Decision 9 — Public RFQ request-body limit

- Confirmed at: `2026-08-10T16:44:48Z`
- User choice: `A`
- The maximum raw HTTP request-body size for one public RFQ submission is exactly `256 KiB` (`262144` bytes).
- The limit includes the complete serialized JSON document: public Basket lines, customer fields, privacy-notice record and idempotency intent.
- File uploads, base64 media and binary attachments are not permitted in this endpoint or counted as an excuse to raise the limit.
- The Next.js intake rejects a body above the limit before JSON/business parsing and before any WordPress/Feishu/downstream call. A declared Content-Length above the limit is rejected immediately; streamed bytes also enforce the same hard ceiling.
- Oversized input is rejected as one whole request with a stable non-leaking public error. The Basket is retained and no successful receipt or partial downstream record is produced.

### Decision 10 — Customer-field length limits

- Confirmed at: `2026-08-10T16:47:41Z`
- User choice: `A`
- Limits are maximum Unicode code points after the field's approved trimming rule, not JavaScript UTF-16 code units and not raw bytes.
- `Full Name`: `120`.
- `Company Name`: `160`.
- `Business Email`: `254`, plus email-format validation.
- `WhatsApp`: `128`; `WeChat`: `128`; both remain free text under Decision 3.
- `Phone`: `64`.
- `Country/Region`: `100`; `City`: `100`.
- `Company Website`: `2048`, plus absolute HTTP/HTTPS URL validation and the later frozen URL-safety policy.
- `Message` / `Additional Requirements`: `2000`.
- A value over its field limit rejects the whole submission with a stable field error. No client or server layer silently truncates, rewrites or partially accepts the value.
- Empty optional values are omitted from the normalized submission rather than stored as empty strings; required values and the at-least-one contact-channel rule remain governed by Decisions 1–5.

### Decision 11 — Adaptive anti-bot challenge

- Confirmed at: `2026-08-10T16:50:26Z`
- User choice: `A`.
- Every submission path always applies the server-owned honeypot, minimum-fill-time and numerical rate-limit gates; these controls do not depend on a visible challenge.
- A managed human challenge is required only when server-side risk indicators or the later confirmed soft frequency threshold are triggered. The ordinary valid-customer path should normally have no visible challenge.
- When a challenge is required, its token is verified only by the Next.js server, is short-lived and single-use, and is bound to the intended submission context to the extent supported by the later selected provider and implementation.
- A missing, invalid, expired or replayed challenge when one is required causes a stable atomic rejection before authoritative line resolution or downstream delivery. The Quote Basket is retained and no success receipt is produced.
- The challenge is defense in depth only. It never replaces closed-schema validation, Origin/CSRF controls, rate limiting, idempotency, authoritative product re-resolution or downstream isolation.
- TASK-024 does not choose, buy or integrate a challenge provider. Provider selection, privacy review, Content Security Policy impact and production credentials require a separately authorized implementation task.

### Decision 12 — Numerical RFQ submission rate limits

- Confirmed at: `2026-08-10T16:52:55Z`
- User choice: `A` (balanced).
- For one server-derived source bucket, unseen/expired-key business attempts 1–3 in a rolling 10-minute window do not trigger a challenge solely because of frequency; attempts 4 and 5 require the adaptive challenge; attempt 6 and later are rejected with HTTP `429` even if a challenge was completed.
- For the same source bucket, unseen/expired-key business attempt 21 and later in a rolling 24-hour window is rejected with HTTP `429`.
- One normalized contact fingerprint may create at most 10 new RFQ business intents in a rolling 24-hour window; attempt 11 and later is rejected before downstream delivery.
- Every POST reaching the RFQ intake counts toward source-traffic telemetry regardless of validation or business outcome. After raw/closed-contract validation and digest construction, an unexpired same-key/same-payload record returns its stored state before the hard limit for a new attempt; it still counts as traffic but does not create or count as a new contact-level RFQ intent and never calls CMS/Feishu.
- Source attribution is derived only by the server from trusted deployment/proxy information and represented in rate-limit state and ordinary application logs by a rotating or versioned keyed privacy-preserving fingerprint. Browser-provided forwarding headers are not trusted, and full raw IP/contact values are not written to ordinary application logs.
- Challenge completion does not reset or bypass a hard limit for an unseen/expired key. That hard-limit response includes a bounded `Retry-After`, retains the Quote Basket, produces no success receipt and performs no WordPress/Feishu/downstream call.
- Exact distributed-store technology, fingerprint-key rotation and retention are implementation and retention decisions; TASK-024 freezes the behavior without selecting a vendor.

### Decision 13 — Idempotency, replay and timeout limits

- Confirmed at: `2026-08-10T16:56:37Z`
- User choice: `A` (balanced).
- A server-issued RFQ submission intent is valid for first use for 30 minutes and is bound to the intended idempotency key and submission context. An unseen expired, invalid or replayed intent is rejected before authoritative resolution or downstream delivery.
- Method/Origin/media/body/Schema/customer/line/intent/honeypot/rate/challenge failures occur before reservation and create no durable RFQ/idempotency business state. The first successful durable reservation fixes `createdAt`; every reserved, rejected, accepted or delivery-indeterminate idempotency record expires exactly 30 days later, and replay never extends the window.
- The same idempotency key with the same canonical normalized-payload digest returns the same durable accepted, processing or deterministic pre-delivery rejected state and never creates a second downstream business record. This remains true during the 30-day window even after the initial intent expires or the source is now above the new-attempt hard limit.
- The same idempotency key with a different payload digest is rejected with a stable conflict response and creates no downstream record.
- One Feishu delivery attempt has a hard 10-second timeout. The complete public intake request has a hard 15-second budget, reserving time to persist a final or indeterminate state and return a bounded public response.
- A downstream timeout or otherwise indeterminate outcome is never reported as successful and is not blindly resent. If an indeterminate state was durably recorded, the public response is a stable processing/temporarily-unavailable state and an exact idempotent retry returns that state or a later reconciled result; the Quote Basket remains available until confirmed acceptance.
- If the durable idempotency/state write itself cannot be established, the request fails closed with a stable service-unavailable response. No success receipt is fabricated.
- At idempotency expiry the old key is no longer replayable. A new attempt requires a fresh intent/key and is a new explicit customer action; expiry never schedules or authorizes an automatic downstream resend.
- Exact durable-store technology, Feishu reconciliation mechanism and any controlled recovery worker remain follow-up implementation choices; this decision does not introduce NestJS or authorize Feishu access.

### Decision 14 — Accepted RFQ business-data retention

- Confirmed at: `2026-08-10T17:00:04Z`
- User choice: `A`.
- An accepted RFQ's customer identity, contact details and message are retained in the future Feishu business system for 24 months from the last meaningful business interaction.
- A meaningful business interaction is a human business event such as a customer reply, quotation, negotiation, sample follow-up or other documented sales progression. Page views, automated synchronization, status polling, system maintenance and idempotent retries do not reset the retention clock.
- At expiry, in-scope identity/contact/message data is deleted or irreversibly anonymized. Non-identifying aggregate product/configuration statistics may remain only when they cannot be used to reconstruct or relink the customer.
- If the RFQ becomes a formal customer, contract, order or accounting record, the resulting record moves to the separately approved CRM/contract/accounting retention policy and is not silently governed by this lead-stage RFQ timer.
- A documented legal hold, dispute or mandatory statutory retention obligation may pause deletion only for the affected records and duration. Final production policy and jurisdiction-specific legal basis remain subject to legal review.
- This decision freezes the business rule only; it does not create a Feishu field, workflow, scheduled deletion job or backup-deletion mechanism.

### Decision 15 — No public self-service deletion option

- Confirmed at: `2026-08-10T17:23:26Z`
- User direction: the website and RFQ form do not provide a dedicated customer-facing deletion checkbox, button, form, account page or automated self-service deletion workflow.
- No deletion option is added to the customer-information form, Quote Basket, public receipt or normal RFQ success/failure path.
- This decision removes the proposed public deletion-request feature and its product-specific completion-time choice from TASK-024; no public deletion API or Feishu deletion automation is designed or implemented here.
- The absence of a self-service UI does not waive a data subject's rights or the company's obligations under applicable law. The published Privacy Policy may identify an ordinary privacy contact route, and any legally valid request received through that route is handled manually under the applicable approved policy and legal timetable.
- TASK-024 does not claim a universal statutory deadline, does not add a new customer-facing field and does not authorize deletion of any current data.

### Decision 16 — Technical logs and security-observability retention

- Confirmed at: `2026-08-10T17:27:00Z`
- User choice: `A` (balanced).
- Sanitized application and error logs are retained for 30 days.
- Security-event metadata is retained for 90 days.
- Server-derived keyed rate-limit/contact fingerprints are retained for 48 hours, sufficient for the frozen rolling 24-hour limits without retaining them as long-term customer profiles.
- Non-identifying aggregate operational metrics are retained for 13 months for year-over-year reliability and abuse-trend comparison. They must not permit reconstruction or relinking of a customer, contact channel, RFQ line set or source address.
- No technical log or trace may contain a complete RFQ/request body, full name, full email/phone/WhatsApp/WeChat value, raw IP address, Article Number list, idempotency key, challenge token, secret, Feishu credential or raw downstream response/error.
- Correlation uses bounded random public request references and/or server-keyed digests, not raw customer identifiers. Access is least-privilege and retention expiry is enforced by the selected server-side storage/observability system.
- A specifically documented security incident or legal hold may isolate only the necessary event evidence beyond the normal period under restricted access; it must not silently extend all routine logs.
- These records are server-side technical records, not browser Quote Basket data and not the Feishu business RFQ record. TASK-024 selects no logging, monitoring or security vendor.
