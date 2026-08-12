# TASK-028 Frontend A5 Dispatch

message_id: MSG-TASK-028-FRONTEND-HTTP-DOCS-CONSOLIDATION-A5
scope: real local HTTP, production fail-closed, security/regression and frontend documentation consolidation only

## Required reads

- `TASKS/ACTIVE/TASK-028-customer-rfq-form.md`;
- all TASK-028 A0 artifacts and `A1_PLANNER_CHECKPOINT.md` through `A4_PLANNER_CHECKPOINT.md`;
- current TASK-028 product/tests and TASK-027 local intake smoke conventions;
- current root `README.md`, `frontend/README.md` and `docs/architecture/headless-wordpress-nextjs-contract.md`.

## Preserve

- all A0-A4 customer fields, one intent plus one intake behavior, private receipt material, exact clear and in-memory retry semantics;
- frozen Quote Basket v1/v2/v3, TASK-025, RFQ Submission v2 and TASK-027 runtime/Stub contract bytes;
- package/lock/tsconfig/next-env, CMS/Product authorities, protected image and unrelated shared-worktree changes;
- production/unset/disabled final 404 and zero business calls.

## A5 requirements

Use strict targeted RED/GREEN only for a real uncovered boundary. Do not redesign the form and do not start Visual QA or review.

### A5.1 — real local HTTP and page boundary

1. Extend the existing dependency-free production/local smoke approach to prove the actual current Routes and page under the exact supported local configuration.
2. Prove the visible `/request-a-quote/` local page, noindex/non-production disclosure, local intent issuance and intake outcomes through real HTTP.
3. The real HTTP matrix must include accepted, accepted replay, processing/replay, idempotency conflict, customer-field failure and Basket refresh/configuration failure using the existing closed public response semantics. Do not fabricate a production persistence claim.
4. Prove each new intent uses exactly one intent POST and one intake POST; a replay uses the same key/draft as frozen. No browser or server request may call WordPress, Feishu, `/resolve`, Product Configuration or RelatedProductCard per line.
5. Production, unset and disabled modes must keep `/request-a-quote/`, `/api/rfq/intent/` and `/api/rfq/intake/` final 404 with zero Repository, mixed-validation and Sink calls.

### A5.2 — server-only and leakage consolidation

1. Re-run and, only where missing, add direct public/deep import negatives for intent issuer/verifier, authoritative intake and hidden receipt material.
2. Inspect local HTML/Flight, accessible form output and customer-safe receipts/errors for absence of Article Number, UUIDs, WordPress/Feishu IDs, HMAC/secret, idempotency key, submission intent, source snapshot, snapshot token, raw body and diagnostics.
3. Preserve browser Article Number request-byte authority from TASK-025 without deliberately rendering it.
4. Confirm no customer, intent/key or submission attempt is persisted beyond the existing Quote Basket storage; no session storage, cookie, URL, analytics, console/log or background retry is introduced.

### A5.3 — full regression and documentation

1. Run focused A1-A5/RFQ/Quote Basket, complete resource-safe current inventory, all ten contract verifiers, lint, typecheck, production build and all relevant production smokes.
2. Restore production `next-env.d.ts`, remove only A5 generated output recoverably, verify no listener or temporary copied root and reproduce the A0 protected matrix, A1 hashes, package/lock/tsconfig and diff/DPG gates.
3. Update `frontend/README.md` truthfully with the exact local start/config/test workflow, ten customer fields, accepted clear/change behavior, explicit manual retry and all local-only/non-durable limitations.
4. Do not edit Planner-owned root README or architecture contract. Supply one exact unapplied Planner delta artifact for those files; it must say local process-only Stub, production final 404, no durable storage, no Feishu/CRM/email, no deployment and no production security supplier.

## Required artifacts

- `FRONTEND_A5_TDD_OR_BOUNDARY_EVIDENCE.md`;
- `FRONTEND_A5_EXECUTION_REPORT.md`;
- `FRONTEND_A5_VALIDATION_LOG.md`;
- `FRONTEND_A5_DIFF_SUMMARY.md`;
- `FRONTEND_A5_PLANNER_DOC_DELTAS.md`;
- updated frontend worklog and one linked `execution_response`.

## Forbidden

- no Visual QA, complete adversarial review, acceptance, commit, push, merge or deployment;
- no production database/repository/queue/worker/secret store, WAF/captcha/rate-limit supplier, CRM/Feishu/email or external call;
- no WordPress/CMS/Product changes, dependency changes, contract mutation, price/payment/order behavior or visible Article Number;
- no automatic retry, polling, partial Basket clear or persisted customer/intent/key/attempt.

## Stop gate

A5 stops after the linked response for an independent Planner checkpoint. Visual QA remains a separate controlled lane step. The task receives exactly one complete adversarial review only after A5, Planner documentation application and Visual QA are all complete.
