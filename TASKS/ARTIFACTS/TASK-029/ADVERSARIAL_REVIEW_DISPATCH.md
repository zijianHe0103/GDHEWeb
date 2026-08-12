# TASK-029 Unique Complete Adversarial Review Dispatch

Date: `2026-08-12T16:40:43Z`

## Review type

One complete independent read-only adversarial review. Return exactly one
verdict with `PASS` or `FAIL` and explicit `P0`, `P1`, `P2` counts. Do not edit
product, tests, docs, Planner state, MySQL/WordPress authority, dependencies,
Git or external systems.

## Required review surface

1. Verify same-key/same-payload replay, same-key/different-payload conflict and
   new-key/new-RFQ semantics from the public request through stored state.
2. Challenge atomic reserve, duplicate re-read, expected-state/row-version CAS,
   two Repository/two Next/twenty-request contention and stop/restart replay.
3. Challenge every frozen crash window, accepted response loss, expiry and the
   rule that pending/indeterminate never auto-retry, resend, delete or claim
   success.
4. Challenge stored public/authoritative document validation and binding,
   malformed rows, ambiguous database/dependency outcomes and customer-safe
   error normalization.
5. Verify migration version/checksum/drift/rollback/failure cleanup, exact
   MySQL 8.4.10 target/session, two-table Schema, three-DML runtime permissions
   and WordPress isolation.
6. Verify server-only, browser/Flight/static leakage, credential handling,
   transient password cleanup, no secret/env persistence and production 404
   before Repository/WordPress/Sink work.
7. Verify A1-A5 tests/evidence are sufficient and truthful on the supported
   Node 24 runtime, including the declared existing npm-audit baseline.
8. Verify README/architecture wording does not overstate production database,
   TLS, backup/restore, HA, managed secrets, security suppliers,
   retry/reconciliation, real Sink, Feishu/CRM/email, deployment or release.
9. Verify no unrelated shared dirty file was reinterpreted or included in the
   TASK-029 deliverable.

## Canonical evidence

- `TASKS/ACTIVE/TASK-029-rfq-mysql-idempotency.md`
- `TASKS/ARTIFACTS/TASK-029/REQUIREMENTS.md`
- `TASKS/ARTIFACTS/TASK-029/STATE_MACHINE.md`
- `TASKS/ARTIFACTS/TASK-029/MYSQL_MIGRATION_AND_ROLLBACK_PLAN.md`
- `TASKS/ARTIFACTS/TASK-029/EXECUTION_REPORT.md`
- `TASKS/ARTIFACTS/TASK-029/TEST_OR_VALIDATION_LOG.md`
- `TASKS/ARTIFACTS/TASK-029/DIFF_OR_OUTPUT_SUMMARY.md`
- `TASKS/ARTIFACTS/TASK-029/A5_PLANNER_CHECKPOINT.md`
- stage A1-A4 execution/checkpoint evidence in the same artifact directory
- current product, migration, tests and documentation bytes

## Output

Write only `TASKS/ARTIFACTS/TASK-029/ADVERSARIAL_REVIEW_REPORT.md` plus the
reviewer lane worklog/message records allowed by DPG. PASS is not user
acceptance or Git/deployment authorization. On FAIL, report the smallest
bounded corrections; do not repair them.
