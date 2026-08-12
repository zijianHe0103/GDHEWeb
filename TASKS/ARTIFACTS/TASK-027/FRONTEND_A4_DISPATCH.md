# TASK-027 Frontend A4 Dispatch

message_id: MSG-TASK-027-FRONTEND-STUB-STATE-DELIVERY-A4
task_id: TASK-027
lane: frontend
checkpoint: A4
prerequisite: A3_PLANNER_CHECKPOINT.md PASS_AFTER_NARROW_REVISION

## Objective

Implement only the process-local dependency-injected Stub Idempotency Repository, isolated Stub Sink and complete local runtime state transitions/public result needed to prove replay, conflict, accepted, processing/indeterminate and rejected-before-delivery behavior. Stop for an independent Planner checkpoint. Do not add the Route Handler, HTTP gates or environment configuration.

## Required reading

1. `TASKS/ARTIFACTS/TASK-027/A0_DESIGN.md` sections 5–8
2. `TASKS/ARTIFACTS/TASK-027/TDD_SEAMS.md`
3. `TASKS/ARTIFACTS/TASK-027/A3_PLANNER_CHECKPOINT.md`
4. `frontend/src/lib/rfq/server/v2/{contract,canonical,authority,intake,index,errors}.ts`
5. receipt/error Schemas and positive samples under `frontend/src/lib/rfq-submission-contract/v2/`
6. exact replay tuples in `frontend/src/lib/rfq-submission-contract/v2/vectors/expected.v2.json`

## Exact production scope

- `frontend/src/lib/rfq/server/v2/stub-repository.ts`
- `frontend/src/lib/rfq/server/v2/stub-sink.ts`
- `frontend/src/lib/rfq/server/v2/intake.ts` only to compose A3 resolution, repository and sink into the closed local result
- `frontend/src/lib/rfq/server/v2/index.ts` and `errors.ts` only for the A4 server-only public seam/stable errors
- one minimum internal type module only if smaller than duplicating the closed ports

Focused tests must use `frontend/tests/rfq-intake-v2-*`. No existing TASK-025 or frozen TASK-026/A1 JSON byte may change.

## Frozen local result seam

The completed local runtime returns one immutable internal result containing:

- `httpStatus`: new accepted `201`, accepted replay `200`, processing new/replay `202`, deterministic conflict/rejected/reconciliation `409`;
- `document`: only an authentic validated `public_receipt` or `public_error` wrapper.

This is an internal server-only result for A5 Route serialization. Do not expose a plain DTO or any authoritative/customer/internal value.

## A4.1 StubRfqRepository — strict RED/GREEN

1. Record a real missing-class RED for `StubRfqRepository`.
2. Use a private process-local Map keyed only by SHA-256 idempotency-key fingerprint. Never retain the raw key.
3. A record may contain only digest/comparison evidence, first `createdAt`, exact `expiresAt`, minimum delivery status and the authentic customer-safe receipt/error needed for replay. It must not retain customer/contact data, Authoritative RFQ Document, line array, Article Number, product identity, secret, raw downstream response/error or diagnostic.
4. Lookup/reserve/transition operations must be atomic in one process and must return caller-isolated immutable closed values. Concurrent same-key fresh submissions may create at most one reservation.
5. Exact behavior:
   - absent key -> miss;
   - live same key/same digest -> stored public replay, zero pre-gate/mixed/sink and no expiry extension;
   - live same key/different digest -> deterministic idempotency conflict, record unchanged;
   - pre-reservation rejection -> no record;
   - first reservation -> `expiresAt = createdAt + 2592000000 ms` exactly;
   - expired indeterminate -> controlled-reconciliation `409`, zero mixed/sink and no automatic resend;
   - no operation may observe or stringify unknown thrown inputs.

## A4.2 StubRfqSink — strict RED/GREEN

1. Record a real missing-class RED for `StubRfqSink`.
2. Constructor accepts only the closed test/local outcome: `accepted | indeterminate | rejected_before_delivery`.
3. `deliver` accepts only an authentic `AuthoritativeRfqDocument` in the exact `delivery_pending/pending/1` cell; a plain or resolving document rejects before call-count increment.
4. One reservation invokes the sink at most once. Sink returns only a closed internal outcome, tracks only call count for tests and never retains the document or reads/logs customer/line/Article Number values.
5. Hostile/throwing sink behavior is normalized without reflecting or leaking the thrown value.

## A4.3 Complete process-local intake state

Extend `createRfqIntakeRuntime` minimally while preserving all A3 tests and order.

For a new valid intent:

1. A3 lookup/pre-gate/reserve and exactly one complete mixed resolution run.
2. Convert the authentic resolving document to an authentic `delivery_pending/pending/1` document and call the injected Sink exactly once.
3. Convert outcome and persist only customer-safe replay state:
   - accepted -> authentic accepted receipt, new `201`, replay `200`;
   - indeterminate -> authentic processing receipt with `retryAfterSeconds:30`, new/replay `202`, no resend;
   - rejected_before_delivery -> authentic `service_temporarily_unavailable` error, new/replay `409`;
   - mixed/authority failure after reservation -> authentic `basket_refresh_required` error with only `{field:"basket",code:"changed"}`, stored/replayed `409`, zero Sink calls.
4. Idempotency conflict returns authentic `idempotency_conflict` error `409` without changing the stored record.
5. Pre-gate rejection returns a non-retained authentic `request_not_allowed` error; keep status mapping internal for A5 and prove repository size remains zero.
6. Expired indeterminate returns a non-resend authentic `service_temporarily_unavailable` `409` and preserves the old record/expiry.

`requestReference` is injected through `ids.nextRequestReference()` only when a new public error must be created. Replays reuse the stored exact validated customer-safe document and never mint a new public reference/error reference.

## Required observable proofs

- exact five TASK-026 replay tuples and effect order, including no expiry extension and zero automatic resend;
- new accepted `201`, same exact receipt replay `200`, one mixed call and one Sink call total;
- indeterminate new/replay exact same processing receipt `202`, retry `30`, one Sink call total;
- rejected-before-delivery new/replay exact same safe error `409`, one Sink call total;
- mixed failure after reservation safe stored/replayed `409` with zero Sink calls;
- same key/different digest `409`, stored state unchanged and zero downstream;
- pre-gate reject zero state/downstream; expired indeterminate zero resend;
- concurrent same-key calls produce at most one reservation/mixed/sink attempt;
- repository retained-state inspection proves zero customer/contact/line/Article Number/secret/raw diagnostic data;
- Sink document retention is zero and forged document/dependency Proxy attacks are trap-safe;
- all returned receipt/error wrappers pass the existing strict A2 contract and their serialized DTOs contain no private fields.

## Explicitly forbidden in A4

- no Route Handler, `/api/rfq/intake/`, raw body, Origin/media/UTF-8 gates, environment reader, listener or production smoke;
- no customer form/UI, Basket clear/storage mutation or visible route;
- no WordPress/CMS mutation, dependency/package/lock change, Feishu/email/database/external write;
- no real production persistence, cross-process/multi-instance claim or durable-delivery claim;
- no TASK-024/025/026 or A1 snapshot modification;
- no complete adversarial review, Git delivery or deployment.

## Validation and evidence

Run on Node `24.18.0`:

- direct repository, sink and completed-intake RED/GREEN tests;
- A1–A3 focused suites and exact two P1 regressions;
- TASK-025/Quote Basket focused regressions;
- all ten contract verifiers, lint and typecheck;
- server-only/retention/forbidden-call/secret scans, protected hashes, generated cleanup, `git diff --check` and DPG project/messages/strict-lane gates.

Do not run a broad production build unless a focused server-only test requires it.

Write exactly:

- `TASKS/ARTIFACTS/TASK-027/FRONTEND_A4_EXECUTION_REPORT.md`
- `TASKS/ARTIFACTS/TASK-027/FRONTEND_A4_TDD_RED_EVIDENCE.md`
- `TASKS/ARTIFACTS/TASK-027/FRONTEND_A4_VALIDATION_LOG.md`
- `TASKS/ARTIFACTS/TASK-027/FRONTEND_A4_DIFF_SUMMARY.md`

Update only `LANES/frontend/worklog.md` outside product/test/evidence scope. Return one linked `execution_response`, then stop. A5 remains blocked until Planner independently validates A4.
