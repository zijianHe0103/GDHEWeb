# TASK-028 Frontend A4 Dispatch

message_id: MSG-TASK-028-FRONTEND-ACCEPTED-CLEAR-RECOVERY-A4
scope: exact accepted snapshot clear and one in-memory retry/replay seam only

## Required reads

- `TASKS/ACTIVE/TASK-028-customer-rfq-form.md`
- all TASK-028 A0 artifacts and `A1_PLANNER_CHECKPOINT.md` through
  `A3_PLANNER_CHECKPOINT.md`
- current A1-A3 RFQ customer/submission/form code and tests
- `frontend/src/lib/quote-basket/browser.ts`, `storage.ts`,
  `use-quote-basket.ts` and Quote Basket v3 domain/types
- frozen RFQ Submission v2 receipt Schema, canonical snapshot-token vectors and
  TASK-026 exact full-snapshot clear rule

## Bytes and behavior to preserve

- A0 `49/49`, A1 hashes and all A2 server-owned intent/intake behavior;
- A3 fields, UI order, one-operation request boundary, public error matrix,
  server-only and production 404 behavior;
- frozen Quote Basket v1/v2/v3 and RFQ Submission v2 contract bytes,
  package/lock/tsconfig/next-env and all prior protected authorities.

## A4 requirements

Use strict seam-by-seam RED/GREEN. Do not start A5 or visual work.

### A4.1 — private validated receipt material

1. Preserve the current customer-safe UI DTO. Add only a module-private or
   otherwise authenticity-bound internal receipt result that retains the
   already Schema-validated `submittedBasketSnapshot` and
   `submittedBasketToken` required by the clear gate.
2. Neither field may enter visible text, accessible names, logs, thrown
   diagnostics, public Client props, HTML/Flight or the exported customer-safe
   result. Do not trust a plain caller-created receipt object.
3. Preserve exact receipt/error HTTP and semantic binding and all hostile-body
   fail-closed behavior.

### A4.2 — exact browser snapshot-token proof

1. Reproduce the frozen v2 basket snapshot token in browser-compatible code
   without importing server-only/node crypto into a Client Component.
2. Bind the implementation to the delivered canonicalization prefix and
   vectors. Reject invalid Unicode, unsupported/non-data/hostile values and any
   precision-changing input without reflecting attacker data.
3. Do not change the frozen canonical, Schema or vector bytes and do not add a
   dependency.

### A4.3 — atomic full-snapshot compare-and-clear

1. Add one Quote Basket adapter/hook operation that may clear only after an
   authentic validated `accepted` receipt.
2. The submitted snapshot, receipt snapshot and the storage snapshot read
   immediately before removal must be exactly equal across all six fields:
   `schemaVersion`, `revision`, `writerId`, `mutationId`, `updatedAt`,
   `expiresAt`.
3. The receipt token must equal the browser recomputation for that exact
   submitted snapshot. Storage must still contain a legal exact Basket at the
   comparison point.
4. Only then remove the one Quote Basket storage key and set the UI Basket to
   empty. Missing, changed, expired, malformed, hostile or throwing storage,
   token mismatch, processing or any error changes no storage byte.
5. If the Basket changes during the request, retain the entire current Basket
   and render a stable `accepted_basket_changed` result. Never partially remove
   submitted or matching rows.

### A4.4 — explicit retry/replay with one live in-memory attempt

1. After an uncertain network/malformed/temporary result or a validated
   processing receipt, retain only the current in-memory draft/intent/key and
   its normalized customer plus source snapshot until its exact expiry.
2. A later explicit submit with the unchanged normalized customer and exact
   Basket snapshot reuses that same live draft: zero new intent request and
   exactly one intake POST. There is no automatic retry, polling or background
   resend.
3. Any customer or Basket change, expiry, validated invalid-intent/security
   invalidation, idempotency conflict or accepted terminal result invalidates
   the retained attempt. The next explicit submit starts with a new intent.
   Rate-limited/temporary/processing may retain the still-live attempt but must
   show only bounded customer-safe guidance.
4. Pending duplicate suppression remains exact. Intent/key/customer data stays
   in memory only and is lost on navigation/reload; no local/session storage,
   cookie, URL, analytics or log persistence is allowed.

## Required tests and evidence

- direct RED/GREEN for the private receipt material, browser token vector,
  compare-and-clear, changed-Basket retention and retry/replay reuse;
- exact accepted clear and negative matrix for all six snapshot fields, token,
  current raw storage, processing/error and storage exceptions;
- mutation-during-flight proof retains the entire current Basket with no
  partial deletion;
- unchanged explicit retry: first uncertain request `1 intent + 1 intake`, next
  explicit retry `0 intent + 1 intake` using byte-identical intent/key/draft;
- customer/Basket/expiry/invalid-intent/conflict/accepted invalidation and
  pending duplicate tests;
- HTML/Flight/accessible/output/leakage checks for token/key/snapshot/internal
  receipt data and zero external/WordPress/Feishu calls;
- focused A1-A4/TASK-027/Quote Basket regressions, relevant verifiers, lint,
  typecheck and changed-route smoke; A0 `49/49`, A1 hashes, protected bytes,
  generated/listener cleanup, diff and DPG gates;
- produce `FRONTEND_A4_TDD_RED_EVIDENCE.md`,
  `FRONTEND_A4_EXECUTION_REPORT.md`, `FRONTEND_A4_VALIDATION_LOG.md`,
  `FRONTEND_A4_DIFF_SUMMARY.md`, update frontend worklog, send one linked
  response and stop.

## Forbidden in A4

- no partial Basket clear, automatic retry, polling, persistence of intent/key
  or customer data, production durability, CMS/WordPress, CRM/Feishu, email,
  queue, dependency, deployment or external system;
- no A5 full HTTP/visual/docs consolidation, Visual QA, complete review,
  acceptance or Git action;
- no mutation of frozen contracts/authorities or unrelated shared-worktree
  files.

## Stop gate

A4 completion is only a frontend lane checkpoint. A5 remains blocked until the
linked A4 response is acknowledged and Planner independently reproduces the
exact clear, changed-Basket and retry/replay gates.
