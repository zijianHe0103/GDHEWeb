# TASK-027 Frontend A3 Dispatch

message_id: MSG-TASK-027-FRONTEND-AUTHORITATIVE-BATCH-A3
task_id: TASK-027
lane: frontend
checkpoint: A3
prerequisite: A2_PLANNER_CHECKPOINT.md PASS

## Objective

Implement only the server-only projection from one authentic RFQ Submission `2.0.0` document to one complete TASK-025 mixed-line request, bind the one complete ordered response, and construct one authentic Authoritative RFQ Document `2.0.0`. Add only the dependency-injected intake orchestration needed to reach reservation and authoritative resolution, then stop for an independent Planner checkpoint.

## Required reading

1. `TASKS/ACTIVE/TASK-027-local-rfq-intake-stub-sink.md`
2. `TASKS/ARTIFACTS/TASK-027/A0_DESIGN.md`
3. `TASKS/ARTIFACTS/TASK-027/TDD_SEAMS.md`
4. `TASKS/ARTIFACTS/TASK-027/A2_PLANNER_CHECKPOINT.md`
5. `frontend/src/lib/rfq/server/v2/{contract,canonical,index,errors}.ts`
6. `frontend/src/lib/cms/server/article-number-batch/{index,types,load}.ts`
7. `frontend/src/lib/rfq-submission-contract/v2/samples/task025/**`
8. `frontend/src/lib/rfq-submission-contract/v2/samples/positive/{public-mixed,authoritative-mixed}.json`

## Exact production scope

- `frontend/src/lib/rfq/server/v2/authority.ts`
- `frontend/src/lib/rfq/server/v2/intake.ts`
- `frontend/src/lib/rfq/server/v2/index.ts` only for the closed A3 public server seam
- `frontend/src/lib/rfq/server/v2/errors.ts` only for stable A3 error kinds
- the minimum internal type module only if it makes these files smaller and safer

Focused tests must use the prefix `frontend/tests/rfq-intake-v2-`. No existing TASK-025 file or frozen TASK-026/A1 snapshot byte may change.

## Frozen public seams

- `resolveAuthoritativeRfqLines`
- `createRfqIntakeRuntime`

Both are server-only. No exported function may treat a plain public submission, plain mixed response or plain authoritative document as authentic. Tests may inject dependencies, but production authority must flow through the existing authentic validated wrapper and the delivered `validateMixedQuoteLines` consumer.

## Strict vertical TDD order

### A3.1 Public projection

1. Record a real RED for the missing projection seam.
2. Accept only an authentic `public_submission` wrapper from A2.
3. Produce the exact ordered TASK-025 `MixedQuoteLineRequestLine[]` from `basket.items`:
   - standard configured line retains submitted canonical path, complete selection, packaging, quantity unit/value and public Article Number as an untrusted lookup claim;
   - custom configured line retains `articleNumber:null / sales_follow_up` and complete selection/packaging;
   - catalog accessory retains Article Number, unit and quantity;
   - no display-only value, customer field, internal UUID, secret, token or diagnostic enters the mixed request.
4. Preserve `1..50` order and reject duplicate/unsupported/non-ready identity before the mixed dependency is called, even though A2 already validates the root.

### A3.2 One complete mixed request and binding

1. Record a real RED proving the missing one-request orchestration.
2. Invoke the injected delivered `validateMixedQuoteLines` dependency exactly once for the complete array and never per line.
3. Make zero `/resolve`, Product Configuration, RelatedProductCard or other CMS calls.
4. Reject the whole response on any count, order, `entryId`, line kind, unit, quantity, canonical path, selection, packaging, resolution, model or Article Number mismatch.
5. The response exclusively owns the authoritative model and Article Number:
   - standard configured result uses the bound response model/path/selection/packaging/Article Number;
   - custom result remains `articleNumber:null`, `sales_follow_up` and adds only `followUpReason:"custom_length"`;
   - catalog accessory uses the bound response model/Article Number and `publicPath:null`;
   - no partial authoritative result is returned.

### A3.3 Authentic Authoritative RFQ Document

1. Build the complete document from the authenticated public submission, injected IDs/clock/security context/digest context and the bound mixed response.
2. Validate it through `validateAuthoritativeRfqDocument`; return only the authentic wrapper, never a plain authoritative DTO.
3. Reproduce the frozen public/mixed/authoritative sample mapping and reject all TASK-026 binding mutations.
4. Keep the payload digest, first reservation times and security fingerprints dependency-owned; do not derive or expose secret material in this module.

### A3.4 Intake orchestration through reservation/resolution only

1. Record a real RED for the missing `createRfqIntakeRuntime` seam.
2. Use injected clock, IDs, key material, pre-reservation gate, repository port and mixed consumer. Test fakes are allowed; do not add the process-local concrete Repository or Sink yet.
3. Preserve this order for a new valid intent: authentic submission -> canonical digest/tokens -> one bounded lookup -> pre-reservation gate -> one reservation -> one complete mixed validation -> authentic authoritative document.
4. Pre-reservation rejection creates zero repository state and zero mixed calls. Same-key replay/conflict and expired-indeterminate behavior may be represented only through the injected repository port needed by A3; the concrete state machine/storage and public `200/202/409` replay behavior remain A4.
5. A3 stops before delivery: no sink call, receipt/error HTTP mapping, Basket clear decision or retained customer document.

## Required observable proofs

- exact standard/custom/accessory projection and preserved order for `1` and mixed `3` lines;
- one complete mixed consumer call for `1` and `50` lines, with zero legacy requests;
- every TASK-026 response-binding field mismatch rejects atomically and returns no authoritative wrapper;
- browser Article Number is never trusted over the bound response;
- custom length never receives a fabricated Article Number or stable Product UUID;
- generated authoritative document passes the existing strict Schema/semantic gate and matches the frozen sample mapping;
- plain wrapper/response/document forgery, caller mutation, Proxy/reflection input and hostile thrown dependencies fail with stable non-leaking A3 errors;
- pre-reservation rejection has zero reservation/mixed side effects; a new path reserves once and resolves once;
- all A1/A2 and TASK-025 gates remain green.

## Explicitly forbidden in A3

- no concrete `stub-repository.ts` or `stub-sink.ts`, process-global state or retained customer document;
- no sink delivery, accepted/processing/rejected public result, replay receipt or Basket clearing;
- no Route Handler, HTTP listener, raw-body/Origin/media gate, environment reader or production-mode behavior;
- no customer form, visible page, CMS/WordPress mutation, dependency/package/lock change, Feishu/email/database/external write;
- no modification of TASK-024/025/026 authority, A1 snapshot, Quote Basket/ProductCard/Product Configuration/RelatedProductCard behavior;
- no complete adversarial review, Git delivery or deployment.

## Validation and evidence

Run on Node `24.18.0`:

- focused A3 authority/intake tests;
- A1/A2 focused suites and RFQ Submission verifier;
- TASK-025 Article Number batch focused consumer regressions and verifier;
- relevant Quote Basket `3.0.0` projection tests;
- all existing contract verifiers, lint and typecheck;
- protected hashes, exact frozen bytes, server-only/forbidden-call scan, generated-residue cleanup, `git diff --check` and DPG project/messages/strict-lane gates.

Do not run a broad production build unless a focused A3 server-only test requires it.

Write exactly these A3 evidence files:

- `TASKS/ARTIFACTS/TASK-027/FRONTEND_A3_EXECUTION_REPORT.md`
- `TASKS/ARTIFACTS/TASK-027/FRONTEND_A3_TDD_RED_EVIDENCE.md`
- `TASKS/ARTIFACTS/TASK-027/FRONTEND_A3_VALIDATION_LOG.md`
- `TASKS/ARTIFACTS/TASK-027/FRONTEND_A3_DIFF_SUMMARY.md`

Update only `LANES/frontend/worklog.md` outside product/test/evidence scope. Return one linked `execution_response`, then stop. A4 remains blocked until Planner independently validates A3.
