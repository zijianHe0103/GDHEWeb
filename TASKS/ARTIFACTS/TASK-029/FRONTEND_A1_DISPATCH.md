# TASK-029 Frontend A1 Dispatch

## Authority

Execute only A1 of confirmed TASK-029. Read the active task and every A0 file
under `TASKS/ARTIFACTS/TASK-029/` before mutation. A0 is the binding design;
if current code or MySQL makes it impossible, stop and report the exact
conflict instead of silently widening the design.

## Ownership and collaboration

You own only the registered frontend lane scope: `frontend/**`,
`docs/frontend/**`, assigned `TASKS/ARTIFACTS/TASK-029/**`, and
`LANES/frontend/**`. You are not alone in the shared worktree. Preserve and do
not revert `.codex/config.toml`, pre-existing `frontend/tsconfig.json`,
TASK-021–028 closure edits, Planner governance changes, historical resume
packets, or changes made by other lanes.

## A1 scope

Using strict TDD with captured real RED before minimum GREEN:

1. Introduce the smallest server-only common RFQ Repository contract and
   authentic closed result boundary needed by both Stub and future MySQL
   implementations. Preserve current RFQ 2.0 semantics and Stub tests.
2. Add only the minimal Node 24-compatible MySQL driver needed for A1. An ORM,
   migration framework, NestJS or second service is forbidden.
3. Add explicit, versioned and auditable MySQL migration tooling under
   `frontend/`; no import/start/request path may perform DDL or GRANT.
4. On the verified local MySQL 8.4.10 instance at loopback port 3307, create
   exact lowercase Schema `gdhe_rfq`, `rfq_schema_migrations`,
   `rfq_intake_records`, checks/indexes and the `gdhe_rfq_app` loopback runtime
   account according to A0.
5. Runtime grants are only SELECT/INSERT/UPDATE on
   `gdhe_rfq.rfq_intake_records`; prove DML allowed and DDL, GRANT, DELETE,
   migration-table read and WordPress `GDHE` access rejected.
6. Keep credentials out of Git, patches, terminal reports, artifacts, ordinary
   logs and browser code. Use only transient environment/local secure material.
   If durable local secret storage would require an out-of-scope path or user
   authority, stop after the migration/permission design and report the exact
   blocker; do not create a passwordless or overprivileged fallback.
7. Prove empty-Schema migration, exact repeat no-op, checksum/object drift
   rejection, explicit verify, and `down-if-empty` blocking when a business row
   exists. Cleanup may address only exact TASK-029 test fingerprints or exact
   verified empty `gdhe_rfq` objects.
8. Reprove WordPress 12-table/Core/SCF/DB protection and the A0 19-path
   baseline. No WordPress or `cms/**` mutation is allowed.

## Explicit A1 non-goals

- Do not implement MySQL `lookup/reserve/transition`; that is A2.
- Do not wire `persistent_stub`, Route configuration or customer UI; that is
  A3.
- Do not run two-process, restart, twenty-request or crash-window tests; that
  is A4.
- Do not update root README/architecture or claim document impact resolved;
  A5 owns consolidated docs.
- Do not connect Feishu/CRM/email, implement rate limiting/challenge, enable
  production, deploy, review, accept, commit, push or merge.

## Required RED/GREEN evidence

- Missing common Repository/authentic result seam.
- Missing migration/verify command from empty target.
- Reapply and checksum/object drift cases.
- Runtime permission positive and negative matrix.
- Stub regression behind the common contract.
- Migration failure/cleanup safety, including business-row rollback refusal.

## Required validation

- Supported Node `24.18.0`, npm `11.16.0`.
- New focused tests and migration/permission integration tests.
- Existing RFQ Intake/Stub tests affected by the common interface.
- All ten existing contract verifiers.
- Lint, non-incremental typecheck and any build gate needed to prove server-only
  dependency safety.
- A0 protected `19/19`, WordPress Core/SCF/12-table DB, secret/leakage scan,
  generated/listener/database residue, `git diff --check`, DPG project,
  messages and strict lane audit.

## Required artifacts and stop condition

Create at least:

- `FRONTEND_A1_TDD_RED_EVIDENCE.md`
- `FRONTEND_A1_EXECUTION_REPORT.md`
- `FRONTEND_A1_VALIDATION_LOG.md`
- `FRONTEND_A1_DIFF_SUMMARY.md`

Update `LANES/frontend/worklog.md`, return one controlled execution response,
then stop. Report actual remaining `gdhe_rfq` Schema/account/test-row state and
whether any local secret was retained, without exposing the secret. A2 remains
blocked until an independent Planner checkpoint.
