# TASK-029 Frontend A4 Diff Summary

## Added in A4

- `frontend/tests/rfq-persistent-stub-a4.test.ts` — real-MySQL twenty-request,
  two-Repository, crash-window, expiry and exact replay proof.
- `frontend/tests/rfq-persistent-stub-a4-http-smoke.mjs` — two controlled Next
  processes, both-process replay and stop/restart HTTP proof with exact cleanup.
- `TASKS/ARTIFACTS/TASK-029/FRONTEND_A4_TDD_RED_EVIDENCE.md`.
- `TASKS/ARTIFACTS/TASK-029/FRONTEND_A4_EXECUTION_REPORT.md`.
- `TASKS/ARTIFACTS/TASK-029/FRONTEND_A4_VALIDATION_LOG.md`.
- `TASKS/ARTIFACTS/TASK-029/FRONTEND_A4_DIFF_SUMMARY.md`.

## Updated in A4

- `LANES/frontend/worklog.md` — bounded A4 execution and recovery facts only.

## Production bytes unchanged in A4

- RFQ Route/config/Intake/common Repository/MySQL Repository/Stub/Sink;
- package, lockfile, migration SQL/tool and tsconfig;
- RFQ Submission 2.0 Schemas/samples/vectors;
- TASK-025 mixed validation, TASK-027/028 behavior, UI and all CMS/product code;
- production `next-env.d.ts` after restoring the build-generated import.

## Explicitly absent

No retry, resend, polling, worker, reconciliation, production enablement, real
Sink, CMS/WordPress/database authority change, customer UI change, README or
architecture consolidation, review, acceptance, Git operation, deployment or
A5 work was added.
