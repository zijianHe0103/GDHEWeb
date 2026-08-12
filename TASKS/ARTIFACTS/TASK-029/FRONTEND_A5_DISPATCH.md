# TASK-029 Frontend A5 Dispatch

Date: `2026-08-12T16:21:05Z`

## Authority

Execute only TASK-029 A5 consolidation after A0-A4 Planner checkpoints passed.
Do not add a new RFQ feature or reinterpret the frozen Repository/state
machine. If validation exposes a product defect, stop and report the exact
bounded finding rather than expanding scope silently.

## Required work

1. Run the current complete resource-safe frontend regression and the focused
   TASK-025 through TASK-029 RFQ/Quote Basket/Repository/HTTP sets under Node
   `24.18.0`.
2. Re-run all ten contract verifiers, lint, non-incremental typecheck, Next
   production build and the applicable production/local smokes.
3. Re-prove server-only and browser leakage boundaries: no database password,
   HMAC key, migration authority, raw authoritative RFQ document, private
   dependency diagnostic or MySQL object identity reaches public modules,
   browser markup, Flight payload or customer-safe output.
4. Re-prove MySQL `8.4.10` target/session, exact two-table migration,
   checksum/structure, zero business residue and the runtime account's exact
   `SELECT`/`INSERT`/`UPDATE` grant set. Preserve WordPress Core, SCF, GDHE Site
   and all twelve WordPress tables.
5. Prove cleanup of transient credentials, test fingerprints, temporary Next
   roots, generated `.next`, TypeScript cache and task-owned listeners. Leave
   the pre-existing MySQL listener on port `3307` intact.
6. Update `frontend/README.md` truthfully for local `persistent_stub`: explicit
   migration/verify workflow, local startup and restart proof, process-local
   isolated Stub Sink, durable MySQL Repository behavior and exact limits.
   Do not record any usable credential or secret.
7. Because root `README.md` and
   `docs/architecture/headless-wordpress-nextjs-contract.md` are Planner-owned,
   provide exact unapplied deltas for those two files. The deltas must say that
   production remains fail-closed and that TLS, backup/restore, HA, managed
   secrets, rate limit/challenge, reconciliation, real Sink, Feishu/CRM/email,
   deployment and public release are still absent.
8. Consolidate the complete task evidence while preserving A1-A4 stage
   history and cross-lane attribution.

## Required artifacts

- `TASKS/ARTIFACTS/TASK-029/FRONTEND_A5_EXECUTION_REPORT.md`
- `TASKS/ARTIFACTS/TASK-029/FRONTEND_A5_VALIDATION_LOG.md`
- `TASKS/ARTIFACTS/TASK-029/FRONTEND_A5_DIFF_SUMMARY.md`
- `TASKS/ARTIFACTS/TASK-029/FRONTEND_A5_PLANNER_DOC_DELTAS.md`
- `TASKS/ARTIFACTS/TASK-029/EXECUTION_REPORT.md`
- `TASKS/ARTIFACTS/TASK-029/TEST_OR_VALIDATION_LOG.md`
- `TASKS/ARTIFACTS/TASK-029/DIFF_OR_OUTPUT_SUMMARY.md`

## Stop boundary

Send one linked controlled execution response and stop for the final Planner
checkpoint. Do not start Visual QA, the unique complete adversarial review,
user acceptance, Git, deployment or any external-system operation.
