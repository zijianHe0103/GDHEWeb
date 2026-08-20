# TASK-028 Requirements

status: CONFIRMED
confirmed_at: 2026-08-12T07:46:24Z

## Outcome

Complete the smallest customer-visible, local-only RFQ loop on `/request-a-quote/`: review Quote Basket 3.0, enter the contract-first customer fields, submit one RFQ Submission 2.0 request through the delivered TASK-027 local intake, show a safe receipt or recovery state, and clear the Basket only under the exact TASK-026 accepted-snapshot rule.

This is a local acceptance slice. It does not turn the process-local Stub into production infrastructure and does not write to Feishu.

## Customer fields

1. Required: `Full Name`, `Company Name`, `Country/Region`, `City`.
2. Optional individually, but at least one required collectively: `WhatsApp`, `WeChat`, `Business Email`, `Phone`.
3. Optional: `Company Website`, `Additional Requirements`.
4. Empty optional values are omitted after approved trimming; values are never silently truncated.
5. `Company Website` is data only and must be an absolute HTTP(S) URL. It is never fetched.
6. The customer cannot enter source, first-contact time, preliminary customer grade, owner, market assignment, lead status, duplicate/conversion state, internal IDs or internal notes.
7. Future CRM `初步客户等级` remains empty until a salesperson assigns it manually.

## Runtime behavior

1. Only a non-empty submit-ready Quote Basket 3.0 may show an active form.
2. Any `requires_validation` or `requires_readd` line blocks submission and shows a recovery action.
3. A server-only local intent issuer returns a 30-minute HMAC-bound intent and lower-case idempotency key for the exact Basket source snapshot and configured loopback Origin.
4. The browser may carry the opaque intent and idempotency key but never receives the secret, HMAC key, comparison token or authoritative document.
5. A new submit action performs exactly one POST to the existing local `/api/rfq/intake/`; repeated clicks while pending are suppressed. A retry of an uncertain request reuses the same still-live intent/key and follows the existing replay contract.
6. Public receipt/error bytes are accepted only after the delivered RFQ Submission 2.0 runtime has validated them. UI copy maps only stable public codes and never renders raw diagnostics.
7. `accepted` is the only state eligible to clear. Clearing requires the exact six-field current Basket source snapshot and recomputed v2 snapshot token to match the validated receipt.
8. If the Basket changes while a request is in flight, the entire current Basket is retained. TASK-028 does not partially delete submitted lines because TASK-026 freezes full-snapshot equality as the clear gate.
9. `processing`, errors, cancellation, conflict, invalid intent, network interruption and unknown responses retain the Basket.

## Local security boundary

- The issuer and verifier are `server-only`; tokens are signed with the already configured local test key.
- Intent first use expires after 30 minutes and is bound to the idempotency key, Basket source snapshot, contract version and configured exact loopback Origin.
- Existing-key replay lookup remains before the unseen-key intent gate, preserving TASK-024/026/027 replay precedence.
- Honeypot remains an exact empty public field.
- TASK-024 did not freeze a numeric minimum-fill duration or a local rate-store implementation. TASK-028 therefore does not claim production minimum-fill, distributed rate limiting, challenge verification or trusted-proxy attribution.

## Non-goals

- no production persistence, durable idempotency, rate-limit store, challenge vendor or production secret management;
- no Feishu/CRM writes, field creation, source option creation, email, queue, worker or deployment;
- no WordPress/CMS, product, Article Number authority or frozen contract mutation;
- no price, payment, checkout or order semantics;
- no partial Basket clearing.

## Review policy

Frontend work stops at each A1-A5 checkpoint for Planner validation. Visual QA runs only after the visible slice is complete. The consolidated implementation receives exactly one complete independent adversarial review; a failure permits only bounded repair and same-reviewer finding closure.
