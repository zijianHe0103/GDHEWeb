# TASK-029 Requirements

## Outcome

Replace only the process-local RFQ idempotency repository with a persistent
MySQL-backed repository in local `persistent_stub` mode. Keep the existing
isolated Stub Sink, public RFQ 2.0 contract, one bounded mixed-line validation,
and production 404 boundary.

## Frozen business meaning

- Idempotency identifies one submission intent, not a customer, company,
  contact method, Basket, or permanent business identity.
- Same key plus the same canonical business payload is a technical replay and
  returns the stored public state without another mixed-line validation or
  Sink attempt.
- Same key plus a different canonical business payload is
  `idempotency_conflict`; the old row is unchanged and downstream count is
  zero.
- A new key is always a new legal RFQ, including when customer data and Basket
  are byte-equivalent to an older request.
- Cross-key abuse is deferred to a later source-rate/contact-fingerprint/
  challenge task. It must not be implemented as hidden customer deduplication.

## Frozen delivery boundary

- MySQL Schema: `gdhe_rfq`, separate from WordPress `GDHE`.
- Next.js-only server architecture; no NestJS or second long-lived service.
- Local mode: `persistent_stub`; production, unset and disabled remain 404.
- At most one TASK-025 mixed validation and one isolated Stub Sink attempt for
  the first reservation; replay performs neither.
- No Feishu, CRM, email, real connector, deployment, public production route,
  WAF, CAPTCHA, background worker, or automatic reconciliation.

## Review policy

After A1-A5 converge, perform one complete independent adversarial review.
If that review finds defects, repair only the original findings and ask the
same reviewer for a bounded finding closure. Do not run another complete
review.
