# TASK-029 Frontend Adversarial Findings R1 Repair

Date: `2026-08-13`

Request: `MSG-TASK-029-FRONTEND-ADVERSARIAL-FINDINGS-R1`

Result: `PASS_FOR_PLANNER_RECHECK`

The unique complete review remains historical `FAIL / P0=0 / P1=2 / P2=2`.
This report records only the bounded owner-lane repair; it is not review closure,
acceptance, Git delivery or deployment.

## Scope

Changed implementation and direct tests:

- `frontend/rfq-mysql/migrations/001_rfq_persistent_repository.sql`;
- `frontend/scripts/rfq-mysql-migrate.mjs`;
- `frontend/src/lib/rfq/server/v2/mysql-repository.ts`;
- `frontend/tests/rfq-mysql-migration.test.ts`;
- `frontend/tests/rfq-mysql-repository.test.ts`.

Only the required TASK-029 current evidence and frontend worklog are additionally
updated. Planner state, the canonical review report, CMS, WordPress data,
dependencies, public contracts, UI, external systems and Git are unchanged.

## P1-1 exact state and row-version binding

The focused RED returned an impossible `idempotency_reserved / 2` stored row as
an authentic `202` replay. The real migration integration also lacked evidence
that MySQL rejected the same impossible pair.

The minimum GREEN expresses the same closed mapping in the migration CHECK and
stored-row parser:

| State | Legal row version |
| --- | ---: |
| `idempotency_reserved` | `1` |
| `resolving_lines` | `2` |
| `delivery_pending` | `3` |
| `accepted` | `4` |
| `delivery_indeterminate` | `4` |
| `rejected_before_delivery` | `3` or `4` |

The parser regression covers every state category, including both sides of the
two-version rejection state. The migration integration performs an actual
invalid reserved/version-2 insert and proves MySQL rejects it. Existing legal
reservation, both rejection edges, pending, accepted, indeterminate and the
`1 -> 2 -> 3 -> 4` CAS path remain green with unchanged public replay bytes.

## P1-2 recoverable non-transactional DDL

The focused RED showed that the migration integration exposed no evidence for
the four exact Schema/account combinations or interruption after destructive
DDL.

The minimum GREEN separates structural verification from runtime-account
verification only for the recovery action that must recreate or remove that
account. The existing supported commands now converge as follows:

| Schema | Runtime account | Supported recovery |
| --- | --- | --- |
| absent | absent | `up` installs; `down-if-empty` is an idempotent no-op |
| absent | present | `up` installs and resets exact grants, or `down-if-empty` removes the orphan account |
| present | absent | `up` verifies structure then recreates the account; `down-if-empty` verifies zero rows then removes the Schema |
| present | present | `up` verifies/no-ops; `down-if-empty` verifies then removes both |

Destructive cleanup is ordered database first, account second. Integration
faults interrupt after each database/account drop in both failed-initialization
cleanup and `down-if-empty`, inspect the exact half-state, then rerun only `up`
or `down-if-empty` to converge. Before destructive work the tool remains bound
to MySQL `8.4.10` on `127.0.0.1:3307`, checks the twelve-table WordPress baseline,
and refuses a non-empty RFQ business table. Final verification retains exactly
three runtime DML grants and no usable credential.

## P2 current narration

`EXECUTION_REPORT.md` and `DIFF_OR_OUTPUT_SUMMARY.md` now distinguish two facts:
the frontend lane originally handed off unapplied root README and architecture
deltas, and Planner later applied them at the A5 checkpoint. Historical A5 lane
artifacts and the actual Planner-owned documents are unchanged.

Planner had already corrected TASK/Project/Board recovery narration. This Lane
did not edit or overwrite those files.

## Verification summary

- direct RED/GREEN evidence: recorded in
  `FRONTEND_ADVERSARIAL_FINDINGS_R1_VALIDATION_LOG.md`;
- affected safe-order regression: `1/3` migration plus `4/27` Repository/runtime
  PASS;
- complete serial Vitest: `92 files / 740 tests PASS`;
- ten offline contract verifiers, lint, non-incremental typecheck and production
  build: PASS;
- five production smokes and two persistent HTTP smokes: PASS;
- MySQL exact two tables/zero rows/minimal grants and WordPress Core/SCF/GDHE
  Site/twelve-table protection: PASS;
- protected hashes, server-only leakage scan, generated frontend cleanup and
  `git diff --check`: PASS before controlled response.

The only next step is fresh Planner validation, followed—only if Planner
dispatches it—by same-reviewer bounded closure of these original findings.
