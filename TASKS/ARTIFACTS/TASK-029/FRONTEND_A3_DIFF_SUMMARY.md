# TASK-029 Frontend A3 Diff Summary

## Added in A3

- `frontend/tests/rfq-persistent-stub-runtime.test.ts`
- `frontend/tests/rfq-persistent-stub-http-smoke.mjs`
- `TASKS/ARTIFACTS/TASK-029/FRONTEND_A3_TDD_RED_EVIDENCE.md`
- `TASKS/ARTIFACTS/TASK-029/FRONTEND_A3_EXECUTION_REPORT.md`
- `TASKS/ARTIFACTS/TASK-029/FRONTEND_A3_VALIDATION_LOG.md`
- `TASKS/ARTIFACTS/TASK-029/FRONTEND_A3_DIFF_SUMMARY.md`

## Updated in A3

- `frontend/src/lib/rfq/server/v2/config.ts` — closed explicit mode and
  persistent credential variant.
- `frontend/src/app/api/rfq/intake/route.ts` — select the A2 MySQL Repository
  only for `persistent_stub`; retain cached process-local `stub` behavior.
- `frontend/tests/rfq-intake-v2-config.test.ts` — direct closed-mode tests.
- `frontend/tests/rfq-intake-v2-server-only.test.ts` — temporary positive
  control for the Node-only dependency plus a real deep-MySQL negative.
- `LANES/frontend/worklog.md` — A3 execution and recovery facts.

## Preserved shared bytes

- exact `mysql2@3.23.3` package and lock closure;
- A1 migration SQL/tool and A2 common/MySQL Repository, Intake and Stub
  implementation bytes;
- RFQ Submission `2.0.0` Schemas, samples, vectors, canonical/authority and
  public response contracts;
- TASK-025 Article Number mixed validation, Quote Basket, customer form/UI,
  Product/CMS/WordPress and all external-system boundaries;
- protected product media, production `next-env.d.ts`, pre-existing dirty
  `tsconfig.json`, Planner authority and unrelated shared worktree edits.

## Explicitly absent

No A4 two-process/restart/twenty-request/crash-window proof, A5 documentation
consolidation, customer/visual change, dependency update, `.env*`, secret file,
Keychain entry, runtime DDL/GRANT, CMS/database authority change, real Sink,
review, acceptance, Git operation or deployment was added.
