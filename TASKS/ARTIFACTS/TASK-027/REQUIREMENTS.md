# TASK-027 Requirements

status: CONFIRMED
confirmed_at: 2026-08-12T04:15:15Z

## Outcome

Build the smallest local, non-production Next.js RFQ intake slice that proves the delivered Quote Basket 3.0, TASK-025 mixed-line authority and TASK-026 RFQ Submission 2.0 contract can run together through one server-only request path.

The slice ends at a dependency-injected, process-local Stub Repository and Stub Sink. It is evidence for the server boundary, not a production persistence layer, customer-facing form, Feishu connector or deployed service.

## Required behavior

1. Copy the complete TASK-026 normative JSON bundle into a frontend-local, authority-bound snapshot. Runtime code must not read `TASKS/**`.
2. Implement a server-only RFQ runtime using the five closed v2 Schemas, their semantic gates, RFC 8785/JCS bytes, HMAC-SHA-256 digest, comparison token and Basket snapshot token.
3. Read a complete `1..50` request and call the delivered TASK-025 mixed-line consumer exactly once. No per-line `/resolve`, Product Configuration or RelatedProductCard calls are allowed.
4. Build authoritative lines only from the fully bound TASK-025 response. Browser Article Number remains public but untrusted.
5. Use an injected process-local repository to prove reservation, replay, conflict, exact 30-day expiry and no automatic resend after an indeterminate result.
6. Use an injected Stub Sink that receives only a validated authoritative document. It must retain no customer document and expose no raw diagnostic.
7. Add one local-only same-origin Route Handler at `/api/rfq/intake/`. It is disabled unless the exact local mode is enabled and is always disabled in production.
8. Preserve stable customer-safe receipts/errors and prevent customer, Article Number, product identity, secret, token and internal state leakage.
9. Update documentation to state the local command, local-only loss-on-restart behavior and remaining production gates truthfully.

## Non-goals

- no customer-visible form or Basket-clear UI;
- no production database, durable idempotency or business-record retention;
- no real submission-intent issuer, rate-limit backend, challenge provider or trusted-proxy policy;
- no Feishu, email, queue, worker, reconciliation job or deployment;
- no WordPress/CMS, TASK-024/025/026 contract, dependency or product-page mutation;
- no Visual QA.

## Review policy

Implementation checkpoints receive Planner validation only. After implementation consolidation, run one complete independent adversarial review. If it fails, the same reviewer may verify only the repaired findings; do not repeat the complete review.
