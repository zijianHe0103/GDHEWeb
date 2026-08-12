# TASK-027 Frontend A2 Dispatch

message_id: MSG-TASK-027-FRONTEND-RUNTIME-CONTRACT-CRYPTO-A2
task_id: TASK-027
lane: frontend
checkpoint: A2
prerequisite: A1_PLANNER_CHECKPOINT.md PASS

## Objective

Implement only the closed server-only RFQ Submission `2.0.0` runtime contract and canonical cryptographic functions. Stop after A2 for an independent Planner checkpoint.

## Required reading

1. `TASKS/ACTIVE/TASK-027-local-rfq-intake-stub-sink.md`
2. `TASKS/ARTIFACTS/TASK-027/A0_DESIGN.md`
3. `TASKS/ARTIFACTS/TASK-027/TDD_SEAMS.md`
4. `TASKS/ARTIFACTS/TASK-027/A1_PLANNER_CHECKPOINT.md`
5. `frontend/src/lib/rfq-submission-contract/v2/**`
6. existing server-only Validator/build-negative patterns under `frontend/src/lib/cms/server/**` and `frontend/tests/*server-only*.test.ts`

## Exact production scope

- `frontend/src/lib/rfq/server/v2/contract.ts`
- `frontend/src/lib/rfq/server/v2/canonical.ts`
- `frontend/src/lib/rfq/server/v2/errors.ts` only when needed for stable A2 errors
- `frontend/src/lib/rfq/server/v2/index.ts` only as the sole server-only A2 public entry

Internal files may be combined when smaller, but the frozen public seams must remain:

- `validatePublicRfqSubmission`
- an authentic, immutable validated value that cannot be constructed from an unchecked plain DTO
- `canonicalizeRfqValue`
- versioned business-payload digest, comparison-token and Basket-snapshot-token functions

Tests must use the prefix `frontend/tests/rfq-intake-v2-` and may add only focused A2 test files.

## Strict vertical TDD order

### A2.1 Closed runtime contract

1. Add one focused test against the missing `validatePublicRfqSubmission` public seam and record the real RED.
2. Add the minimum strict Ajv Draft 2020-12 registry for the exact five local v2 Schemas. Use the existing dependency only; do not change package or lock files.
3. Validate the complete root, closed unknown-field behavior, exact semantic cross-field matrix, ready/non-ready Basket boundary, duplicate identity, Article Number placement and field-error category pairing already frozen by TASK-026.
4. Reject lone surrogates and unsafe/reflection-bearing inputs with stable sanitized errors before returning an authentic value. Do not expose raw Ajv details, input values, diagnostics or internal identity.
5. Deep-freeze the caller-isolated validated value. No exported helper may accept a plain DTO as if it were authentic.

### A2.2 Canonical and cryptographic functions

1. Add one focused test against the missing canonical/digest/token seam and record the real RED.
2. Implement only JSON-domain RFC 8785/JCS behavior required by the frozen v2 contract. Fail closed on lone surrogates, non-finite numbers, unsupported values, accessors, symbols, Proxies or reflective traps; do not coerce attacker-controlled values.
3. Reproduce the exact frozen canonical business payload, HMAC-SHA-256 digest, comparison SHA-256 token and submitted-Basket SHA-256 token from `vectors/expected.v2.json`.
4. Reproduce the frozen invalid Unicode, bad HMAC, bad comparison and effect-mutation negatives without changing any snapshot byte.
5. HMAC key material is accepted only through a server-owned explicit dependency/value for the local test. It must not be embedded in production source, public exports, Client Components, HTML/Flight, logs or errors.

### A2.3 Server-only boundary

- Every production module in `frontend/src/lib/rfq/server/v2/` starts with `import "server-only";`.
- Add real Next build negatives for both the public entry and at least one deep module, with matching marker-stripped controls that build.
- Runtime modules may read only the frontend-local snapshot; they must not read or import `TASKS/**`, CMS runtime state, environment configuration, Repository/Sink or Route Handler code.

## Required observable proofs

- valid complete public submission returns one authentic deep-frozen value isolated from caller mutation;
- all five current Schema roots compile strictly and all recursive refs are local/closed;
- representative Schema-valid but semantically invalid roots reject before later effects;
- hostile/reflection-bearing inputs produce stable sanitized A2 errors with zero secret/raw diagnostic leakage;
- exact TASK-026 canonical/HMAC/comparison/snapshot vectors reproduce byte-for-byte;
- public and deep Client Component imports fail in real Next builds while marker-stripped controls pass;
- A1 verifier remains `20 / 5 / 63 / 94` and all frozen authority hashes remain exact.

## Explicitly forbidden in A2

- no mixed-batch call or `resolveAuthoritativeRfqLines`;
- no `createRfqIntakeRuntime`, idempotency lookup/reservation or replay state machine;
- no Stub Repository, Stub Sink or retained process state;
- no Route Handler, HTTP listener, environment-mode reader, customer form or Basket clearing;
- no CMS/WordPress, dependency, package/lock, TASK-024/025/026 authority, external system, Git or deployment change;
- no complete adversarial review.

## Validation and evidence

Run on Node `24.18.0`:

- focused A2 contract/canonical/server-only tests;
- A1 RFQ Submission verifier and focused snapshot suite;
- all existing frontend contract verifiers;
- relevant pre-existing Validator/server-only regressions;
- lint and typecheck;
- protected hashes, exact snapshot bytes, generated-residue cleanup, `git diff --check` and DPG project/messages/strict-lane gates.

Do not run a production build beyond the scoped real server-only build tests unless another focused A2 test requires it.

Write exactly these A2 evidence files:

- `TASKS/ARTIFACTS/TASK-027/FRONTEND_A2_EXECUTION_REPORT.md`
- `TASKS/ARTIFACTS/TASK-027/FRONTEND_A2_TDD_RED_EVIDENCE.md`
- `TASKS/ARTIFACTS/TASK-027/FRONTEND_A2_VALIDATION_LOG.md`
- `TASKS/ARTIFACTS/TASK-027/FRONTEND_A2_DIFF_SUMMARY.md`

Update only `LANES/frontend/worklog.md` outside the product/test/evidence scope. Return one linked `execution_response`, then stop. A3 remains blocked until Planner independently validates A2.
