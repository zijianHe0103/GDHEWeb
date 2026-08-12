# TASK-029 Frontend Bounded Adversarial Findings R1 Dispatch

Date: `2026-08-12T16:58:06Z`

## Authority

The unique complete adversarial review is final historical evidence:
`FAIL / P0=0 / P1=2 / P2=2`. This dispatch authorizes only the four original
findings. Do not repeat or widen the complete review, add features, alter the
frozen business state machine, or reinterpret earlier PASS evidence.

## P1-1 — exact state and row-version binding

1. Record a real RED proving an otherwise valid stored row fails to reject an
   impossible state/`row_version` pair, including
   `idempotency_reserved / 2`.
2. Add one shared explicit invariant to the migration constraint and the
   stored-row parser. Legal pairs are exactly:
   - `idempotency_reserved / 1`;
   - `resolving_lines / 2`;
   - `delivery_pending / 3`;
   - `accepted / 4`;
   - `delivery_indeterminate / 4`;
   - `rejected_before_delivery / 3` or `/ 4`.
3. Add focused malformed-row negatives for every impossible pair category and
   at least one real-MySQL constraint negative.
4. Preserve the legal `1 -> 2 -> 3 -> 4` CAS path, all six state cells, public
   replay bytes, fixed expiry and zero retry/resend behavior.

## P1-2 — non-transactional DDL half-state recovery

1. Record real RED evidence for interruption after each destructive DDL in
   both initialization cleanup and `down-if-empty`.
2. Define and implement a bounded, explicit operator recovery state machine for
   the exact Schema/account present/absent combinations. At least one supported
   rerunnable command must safely repair or complete each partial state.
3. Do not require the runtime account to exist before the recovery action that
   can recreate or finish removing it. Preserve exact target checks, zero
   business-row refusal and WordPress isolation before destructive work.
4. Prove deterministic recovery after injected failure at every destructive
   boundary, migration idempotency, least privileges and exact final cleanup.
5. Do not create application-startup DDL, store a usable credential, or broaden
   migration/runtime privileges.

## P2-1 — consolidated current evidence

Update only `EXECUTION_REPORT.md` and `DIFF_OR_OUTPUT_SUMMARY.md` current
narration so it states that frontend originally handed off unapplied Planner
deltas and Planner later applied the root README and architecture changes at
the A5 checkpoint. Preserve the historical A5 lane artifacts and actual docs.

## P2-2 — task narration boundary

Planner has already corrected the active task, Project State and Board to
preserve the complete review FAIL and current `NEEDS_REVISION` recovery.
Frontend must not edit Planner-owned state or overwrite that correction.

## Validation

- Run direct RED/GREEN tests for both P1s, including real MySQL recovery and
  constraint proof.
- Run the affected Repository/migration/persistent runtime/restart regression,
  all ten verifiers, lint and non-incremental typecheck.
- Run the full resource-safe inventory if the affected product or migration
  bytes can impact it; report exact counts and any split grouping truthfully.
- Re-prove MySQL two-table/zero-business-row/minimal-grant state, WordPress 12
  tables/Core/SCF/GDHE Site protection, secret/leakage boundary, generated
  cleanup and `git diff --check`.
- Preserve shared dirty edits and do not run Git, deployment, production
  enablement, real Sink or any external integration.

## Required artifacts

- `TASKS/ARTIFACTS/TASK-029/FRONTEND_ADVERSARIAL_FINDINGS_R1.md`
- `TASKS/ARTIFACTS/TASK-029/FRONTEND_ADVERSARIAL_FINDINGS_R1_VALIDATION_LOG.md`
- refreshed `TASKS/ARTIFACTS/TASK-029/EXECUTION_REPORT.md`
- refreshed `TASKS/ARTIFACTS/TASK-029/TEST_OR_VALIDATION_LOG.md`
- refreshed `TASKS/ARTIFACTS/TASK-029/DIFF_OR_OUTPUT_SUMMARY.md`

## Stop boundary

Send one linked controlled execution response and stop for fresh Planner
validation. Do not request or perform a second complete review. Only Planner
may later dispatch the same reviewer for bounded finding closure.
