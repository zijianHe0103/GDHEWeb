# TASK-028 Frontend A2 Dispatch

message_id: MSG-TASK-028-FRONTEND-INTENT-SUBMISSION-A2
scope: local server-owned intent, Basket projection, complete public submission and intake pre-reservation binding only

## Required reads

- `TASKS/ACTIVE/TASK-028-customer-rfq-form.md`
- all TASK-028 A0 artifacts and `A1_PLANNER_CHECKPOINT.md`
- `TASKS/ARTIFACTS/TASK-028/TDD_SEAMS.md`
- current Quote Basket `3.0.0`, RFQ Submission `2.0.0` snapshot/runtime and TASK-027 intake/config/Route tests
- TASK-026 `BASKET_V3_TO_SUBMISSION_V2_MAPPING.md`, `RFQ_SUBMISSION_V2_CONTRACT.md` and `SECURITY_AND_IDEMPOTENCY_INHERITANCE.md`

## A1 bytes to preserve

- `frontend/src/lib/rfq/customer/index.ts` — `49b320c98198351e7ba7caa066adf1c2ee95e3625d39662bae8e6cbd29b152d9`;
- `frontend/tests/rfq-customer-domain.test.ts` — `b6b11cfca4bee41b868a98762a155f7c8cf525d1d54601fbf9d76f9ca35e90db`.

## A2 requirements

Follow the exact frozen seam order. Capture one direct behavior RED immediately before each minimum GREEN; do not pre-build later seams.

### A2.1 — server-owned local intent

1. Add server-only `issueLocalRfqIntent` and `verifyLocalRfqIntent` using only Node built-ins and the already configured local HMAC key/version.
2. Issue a lower-case UUIDv4 idempotency key and an opaque contract-valid token. Bind the signed payload to contract version `2.0.0`, exact configured loopback Origin, idempotency key, exact six-field Quote Basket source snapshot, frozen v2 Basket snapshot token, issued time and expiry.
3. First-use expiry is exactly `issuedAt + 1_800_000 ms`. Invalid clocks, Date-range overflow, malformed/non-canonical token/payload, wrong key/version/origin/key/snapshot/token, expired or future-inconsistent material fail closed with one stable internal error and no secret/diagnostic leakage.
4. Verify signatures with constant-time comparison. Never export, serialize or log the key or a reusable signing bypass.
5. Preserve the existing replay precedence: the current idempotency lookup stays before the pre-reservation intent gate; only a miss reaches verification.

### A2.2 — local intent Route

1. Add `POST /api/rfq/intent/` as a local-only Node Route using the existing RFQ config boundary.
2. Require the exact configured Origin, bare `application/json`, a fixed small raw-body limit below the final intake limit, fatal UTF-8, one JSON parse, a closed exact source-snapshot request and no-store responses.
3. Return only `contractVersion`, opaque `submissionIntent`, lower-case `idempotencyKey`, fixed privacy notice `{ version: "rfq-privacy-en-2026-08", presentedAt }`, and `expiresAt`.
4. Production, unset, disabled or invalid configuration returns final empty `404` and performs zero issuer/runtime work. Wrong origin/media/body returns closed customer-safe statuses without leaking diagnostics.

### A2.3 — Quote Basket 3.0 public projection

1. Add `projectQuoteBasketV3ToPublicRfqBasket` from a freshly cloned/validated Basket `3.0.0`.
2. Permit only `1..50` `ready` lines in original order. Any empty Basket, `requires_validation`, `requires_readd`, duplicate/invalid identity or oversized canonical public Basket fails closed before submission.
3. Standard configured lines project exact canonical path, article-number selection, packaging, piece quantity and the six-field source snapshot. Custom configured lines project `articleNumber: null` and `sales_follow_up`. Ready catalog accessories project Article Number, piece and quantity.
4. Exclude names/models/media/catalog paths, Basket state/createdAt and all WordPress/Feishu/internal fields. Do not make any `/resolve`, Product Configuration, RelatedProductCard or external request.
5. Enforce the frozen `163840`-byte canonical Basket projection ceiling; never truncate or partially project.

### A2.4 — complete public request and intake gate

1. Add `buildPublicRfqSubmission` that accepts only the authentic normalized A1 customer result, authentic A2 Basket projection and validated A2 intent response, then produces exactly the frozen `PublicRfqSubmissionDraft 2.0.0` with privacy notice and `{ honeypot: "" }`.
2. Validate every successful complete draft against the frozen v2 runtime/Schema and enforce the final `262144` UTF-8 raw-request ceiling. Do not add a challenge token or invent production rate/minimum-fill behavior.
3. Bind `verifyLocalRfqIntent` into the existing TASK-027 pre-reservation gate. Existing-key replay remains ahead of this gate; an unseen invalid/expired/mismatched intent returns the existing closed `403 invalid_submission_intent`, creates no reservation and makes zero mixed/sink calls.
4. Prove one valid unseen request reaches the unchanged single mixed batch path; no browser/client module can import the server issuer/verifier or secret-bearing path.

## Required tests and evidence

- strict RED/GREEN history for all four A2 seams;
- exact 30-minute boundary, crypto/context/tamper/hostile-dependency matrix and zero secret/diagnostic output;
- Basket standard/custom/accessory, 1/50, order, blocked states, canonical size and no-network matrix;
- full request Schema/runtime/size proof and authentic A1/A2 provenance boundary;
- real Route tests for local success/error/production 404 plus replay-before-intent and invalid-intent pre-reservation behavior;
- public/deep server-only Client Component build negatives;
- focused A1+A2/TASK-027 regressions, all relevant verifiers, lint and typecheck;
- A0 `49/49` and the two A1 hashes above remain exact; no dependency/package/lock or generated/listener residue;
- produce `FRONTEND_A2_TDD_RED_EVIDENCE.md`, `FRONTEND_A2_EXECUTION_REPORT.md`, `FRONTEND_A2_VALIDATION_LOG.md`, `FRONTEND_A2_DIFF_SUMMARY.md`, update frontend worklog, send one linked response and stop.

## Forbidden in A2

- no customer form/component/presentation/state-machine or browser submission call;
- no receipt/error UI, Basket compare-and-clear, retry UI or Visual QA;
- no production persistence, rate store, challenge vendor, CRM/Feishu/email, CMS/WordPress, dependency, deployment, Git or acceptance action;
- no mutation of frozen TASK-024/025/026/027 authority, Quote Basket `3.0.0` behavior, A1 bytes or protected product contracts;
- no Planner-owned task/state/board/root README/architecture mutation and no cleanup of unrelated shared-worktree edits.

## Stop gate

A2 completion is only a frontend lane checkpoint. A3 remains blocked until the linked response is acknowledged and Planner independently reproduces the current-byte contract, crypto, Route, projection, integration and protection gates.
