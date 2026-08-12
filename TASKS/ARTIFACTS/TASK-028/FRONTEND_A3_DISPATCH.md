# TASK-028 Frontend A3 Dispatch

message_id: MSG-TASK-028-FRONTEND-VISIBLE-FORM-SUBMISSION-A3
scope: visible customer form, one intent request, one intake request and closed public result only

## Required reads

- `TASKS/ACTIVE/TASK-028-customer-rfq-form.md`
- all TASK-028 A0 artifacts, `A1_PLANNER_CHECKPOINT.md` and
  `A2_PLANNER_CHECKPOINT.md`
- current `frontend/src/components/quote-basket/**`,
  `frontend/src/lib/quote-basket/use-quote-basket.ts`, A1 customer domain and
  A2 submission modules
- RFQ Submission `2.0.0` public receipt/error Schemas and samples

## A1/A2 bytes to preserve

- A1 customer source and test at their recorded checkpoint hashes;
- A2 server-owned intent, Route, Basket projection, builder and intake
  verifier behavior;
- A0 `49/49` protected baseline, package/lock/tsconfig and production
  `next-env.d.ts` bytes.

## A3 requirements

Follow strict seam-by-seam RED/GREEN. Do not pre-build A4 clearing or retry.

### A3.1 — visible accessible customer form

1. Replace only the current disabled final-submission placeholder below the
   Basket rows with an English RFQ form when the hydrated Basket is non-empty
   and every line is `ready`.
2. Render exactly the frozen fields and order: Full Name, Company Name,
   Country/Region, City; WhatsApp, WeChat, Business Email, Phone; Company
   Website; Additional Requirements.
3. Mark the first four required and explain that at least one of WhatsApp,
   WeChat, Business Email or Phone is required. Use the frozen autocomplete
   semantics, stable IDs, native labels and accessible required indicators.
4. Empty, storage-error, `requires_validation` and `requires_readd` states do
   not expose an active submit control; retain the existing recovery truth.
5. Keep the local non-production Stub notice explicit. Do not render Article
   Number, internal identity, token or diagnostics.

### A3.2 — client submission state machine

1. On one explicit valid submit, clone the current Basket, normalize customer
   data through A1, project through A2, make exactly one same-origin
   `POST /api/rfq/intent/`, validate its closed response, build the A2 public
   draft, then make exactly one same-origin `POST /api/rfq/intake/`.
2. Use bare `application/json`; no CORS option, external request, WordPress,
   Feishu, retry, polling or duplicate intake request. Repeated clicks while
   pending are suppressed and mutable controls are disabled.
3. A3 may keep only the minimum one-operation in-memory state. It must not
   persist intent/key/customer data and must not implement uncertain-request
   retry or replay reuse; those remain A4.
4. Every A3 result retains the entire Basket. Even an accepted local Stub
   response must truthfully say the Basket has not yet been cleared in this
   checkpoint.

### A3.3 — public response boundary and presentation

1. Add a client-safe closed parser for only RFQ Submission `2.0.0` public
   receipt/error documents. Require exact Schema and semantic cells; return an
   authentic immutable DTO or a stable sanitized failure. Raw JSON, unknown
   keys/codes, diagnostics, hostile values and malformed HTTP/body fail closed.
2. Present only stable customer-facing states: field errors, pending,
   accepted-local, processing, Basket refresh/configuration change, conflict,
   security/rate, temporary unavailable. Do not print raw server messages,
   request bodies, tokens, Article Number or stack/Schema paths.
3. Field errors use stable IDs plus `aria-describedby`; an invalid-submit
   summary links to fields and receives focus. Result status uses one
   `aria-live` region without duplicate announcements.
4. No new automatic focus behavior beyond the invalid-field summary, no
   animation requirement and no Visual QA claim in A3.

## Required tests and evidence

- direct RED/GREEN for form presentation, one-operation state machine and
  response boundary;
- all exact fields/order/required/contact/autocomplete/error-link tests;
- ready/non-ready/empty/storage-error gating;
- one intent plus one intake request, zero duplicate while pending, exact
  same-origin paths/media, malformed/network/status/public-error matrix and
  zero external/WordPress/Feishu calls;
- accepted and every failure retain the Basket and do not call any clear/remove
  seam;
- browser HTML/Flight/output leakage checks for token, idempotency key, Article
  Number, internal IDs and diagnostics;
- focused A1-A3/TASK-027 regressions, all relevant verifiers, lint, typecheck
  and production build/smoke needed by the changed route/page;
- A0 `49/49`, A1 hashes and A2 behavior remain exact; no package/lock,
  dependency or generated/listener residue;
- produce `FRONTEND_A3_TDD_RED_EVIDENCE.md`,
  `FRONTEND_A3_EXECUTION_REPORT.md`, `FRONTEND_A3_VALIDATION_LOG.md`,
  `FRONTEND_A3_DIFF_SUMMARY.md`, update frontend worklog, send one linked
  response and stop.

## Forbidden in A3

- no accepted-snapshot compare-and-clear, storage removal, partial deletion,
  retry/replay retention or in-memory intent reuse after an uncertain result;
- no Visual QA, A4/A5, root README/architecture, CMS/WordPress, CRM/Feishu,
  production persistence, rate/challenge vendor, dependency, deployment, Git
  or acceptance action;
- no mutation of frozen TASK-024/025/026/027 authority, Quote Basket behavior,
  A1/A2 protected behavior or unrelated shared-worktree files.

## Stop gate

A3 completion is only a frontend lane checkpoint. A4 remains blocked until the
linked response is acknowledged and Planner independently reproduces the
visible form, one-request and public-result gates.
