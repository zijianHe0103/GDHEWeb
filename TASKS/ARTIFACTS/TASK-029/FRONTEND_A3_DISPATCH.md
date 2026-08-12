# TASK-029 Frontend A3 Dispatch

## Authority

Execute only A3 of confirmed TASK-029. Read the active task, A0 authority, A1/A2 execution evidence, `A2_PLANNER_CHECKPOINT.md` and current RFQ Route/config/Intake code before mutation. Preserve the shared dirty worktree and do not start A4.

## Scope

Using strict RED/GREEN, implement the smallest explicit local `persistent_stub` runtime wiring:

1. Add one closed server-only local mode/config seam that selects the A2 MySQL Repository only for `persistent_stub`.
2. Keep existing `stub` behavior available for current unit/local regression paths.
3. Wire the existing RFQ Intake orchestration to the common Repository so one accepted first request performs exactly one TASK-025 mixed-batch and at most one isolated Stub Sink attempt.
4. Prove same key/same canonical content returns the stored public state/reference with zero additional mixed-batch or Sink call.
5. Prove same key/different canonical content returns stable customer-safe `409 idempotency_conflict` with zero additional mixed-batch or Sink call.
6. Prove a distinct new key remains a new RFQ even when the canonical content equals an earlier RFQ.
7. Preserve processing, accepted, rejected-before-delivery and delivery-indeterminate public behavior; never automatically resend a stored pending/indeterminate attempt.
8. Keep production, unset and disabled modes final 404 before database, mixed-batch or Sink access.
9. Keep credentials server-only and dependency-injected for tests. Do not add `.env*`, durable secret files, Keychain entries, runtime DDL/GRANT or client-visible database configuration.

## A3 proof boundary

- A3 may use real MySQL and one local Next runtime in one process to prove the explicit mode and HTTP behavior.
- A3 must stop after same-process mode/replay/conflict/new-key/closed-production proof.
- Two controlled Next processes, process restart, twenty simultaneous HTTP requests and crash-window injection belong only to A4.

## Non-goals

- no two-process/restart/twenty-request/crash-window A4 matrix;
- no customer page or visual change;
- no real Feishu/CRM/email/Sink, worker, queue or reconciliation action;
- no WordPress/CMS mutation;
- no production route enablement, deployment, review or Git delivery;
- no root README/architecture consolidation before A5.

## Validation and artifacts

Run focused mode/Route/Intake/MySQL tests, affected TASK-025/Quote Basket/RFQ regressions, all ten verifiers, lint, non-incremental typecheck, production build and the minimum real HTTP smokes. Re-check database residue/grants, WordPress protection, client/server-only leakage, generated/listener residue, protected hashes, diff and DPG gates.

Create at least:

- `FRONTEND_A3_TDD_RED_EVIDENCE.md`
- `FRONTEND_A3_EXECUTION_REPORT.md`
- `FRONTEND_A3_VALIDATION_LOG.md`
- `FRONTEND_A3_DIFF_SUMMARY.md`

Update only the frontend lane worklog, send one linked execution response and stop. A4 remains blocked until an independent Planner checkpoint.
