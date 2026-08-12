# TASK-029 Frontend A4 Dispatch

Date: `2026-08-12T15:56:52Z`

## Objective

Execute only the frozen A4 restart, concurrency and crash-window proof against
the current A3 `persistent_stub` bytes. Use strict RED/GREEN and stop again for
an independent Planner checkpoint.

## Required slices

1. Prove twenty concurrent same-key/same-payload requests across two independent
   Repository instances converge to one reservation, one Public Reference, one
   mixed-batch call and at most one Stub Sink attempt.
2. Prove two controlled local Next.js processes using the same `gdhe_rfq`
   Schema observe the same stored result and do not duplicate downstream work.
3. Stop and restart the controlled Next.js runtime between first response and
   replay; prove the exact stored reference/receipt/status is recovered without
   another mixed-batch or Sink attempt.
4. Cover every frozen crash point from `STATE_MACHINE.md`:
   before/after reservation, before/after resolving CAS, before/after mixed
   success, before/after pending CAS, during/after Sink before persistence,
   after indeterminate persistence, and after accepted persistence before HTTP
   response.
5. Prove pending/indeterminate records, including expired records, are never
   auto-resent, auto-deleted or misreported as accepted.
6. Prove accepted response loss replays the original reference and receipt.
7. Prove ambiguous database outcomes fail closed through the existing
   customer-safe result and do not create a second delivery attempt.

## Safety and cleanup

- Continue using only the isolated Stub Sink and loopback fixtures.
- Use only the independent local `gdhe_rfq` Schema and the existing minimum
  runtime account. Do not touch WordPress `GDHE` tables.
- Any transient password must remain process-local and be rotated to a fresh
  unknown random value in `finally`; do not write `.env*`, secrets or logs.
- Every test-owned row, listener and generated build tree must be removed or
  moved recoverably. Final database truth must be exactly two tables and zero
  business rows.
- Do not add automatic retry, resend, polling, worker or reconciliation logic.
  A4 proves conservative recovery; it does not implement recovery automation.

## Required evidence

- `TASKS/ARTIFACTS/TASK-029/FRONTEND_A4_TDD_RED_EVIDENCE.md`
- `TASKS/ARTIFACTS/TASK-029/FRONTEND_A4_EXECUTION_REPORT.md`
- `TASKS/ARTIFACTS/TASK-029/FRONTEND_A4_VALIDATION_LOG.md`
- `TASKS/ARTIFACTS/TASK-029/FRONTEND_A4_DIFF_SUMMARY.md`

## Explicitly blocked

Do not start A5 documentation/consolidation, the complete adversarial review,
customer UI changes, external integrations, production enablement, Git delivery
or deployment.

## Stop condition

Send one linked A4 execution response and stop for the Planner checkpoint.
