# TASK-027 Frontend A3 Planner P1 Narrow Revision Dispatch

message_id: MSG-TASK-027-FRONTEND-A3-HOSTILE-DEPENDENCY-P1-R1
task_id: TASK-027
lane: frontend
scope: two exact Planner A3 findings only

## Required reading

1. `TASKS/ARTIFACTS/TASK-027/A3_PLANNER_CHECKPOINT.md`
2. `TASKS/ARTIFACTS/TASK-027/FRONTEND_A3_DISPATCH.md`
3. `frontend/src/lib/rfq/server/v2/intake.ts`
4. `frontend/tests/rfq-intake-v2-intake.test.ts`

## Finding 1 — Date-range expiry leak

Strict RED must reproduce this current production behavior:

- `clock.now()` returns exact canonical ISO `+275760-09-12T00:00:00.000Z`;
- the fixed 30-day addition exceeds the JavaScript Date range;
- current runtime leaks raw `RangeError: Invalid time value`.

Minimum GREEN:

- validate the base instant and the exact `createdAt + 2592000000 ms` expiry inside a protected server-dependency boundary before repository/pre-gate/reservation/mixed business side effects;
- reject any non-finite/out-of-range/non-canonical result with only stable `RfqIntakeError { category:"intake", kind:"dependency_failed" }`;
- prove zero lookup, pre-gate, reservation and mixed calls for this failure;
- preserve the ordinary exact `2026-08-12T03:02:00.000Z -> 2026-09-11T03:02:00.000Z` path.

Do not introduce an arbitrary business date limit; enforce only the actual JavaScript/contract representability needed for the exact expiry.

## Finding 2 — hostile thrown Proxy reflection

Strict RED must reproduce this current production behavior:

- `repository.lookup` throws a null-prototype Proxy;
- its `getPrototypeOf` trap throws `PRIVATE_TASK027_PROXY_DIAGNOSTIC`;
- current `instanceof` handling invokes the trap and leaks the private error.

Minimum GREEN:

- do not use `instanceof`, prototype inspection, property reads, string conversion or any reflection on unknown dependency-thrown values;
- distinguish internal validation from awaited dependency failure by control flow, not by inspecting the caught value;
- return only stable `dependency_failed` with `get`, `getPrototypeOf`, `ownKeys`, descriptor and coercion counters all zero;
- preserve the existing sanitized lookup-result validation and all ordinary orchestration behavior.

## Scope and validation

Modify only:

- `frontend/src/lib/rfq/server/v2/intake.ts`;
- `frontend/tests/rfq-intake-v2-intake.test.ts`;
- the four existing A3 evidence files and `LANES/frontend/worklog.md`.

Run direct intake RED/GREEN, A1–A3 focused suites, TASK-025/Quote Basket regressions, ten verifiers, lint, typecheck, protected hashes, generated cleanup, diff and DPG gates. Preserve every already passing A3 line-binding/authenticity/server-only boundary.

Do not add a concrete Repository/Sink, Route Handler/HTTP, UI, CMS, dependency, external integration, review, Git or deployment. Return one linked `execution_response`, then stop for Planner recheck; A4 remains blocked.
