# TASK-029 Adversarial Review Report

- review_request: `MSG-TASK-029-ADVERSARIAL-REVIEW-R1`
- delivery_key: `MSG-TASK-029-ADVERSARIAL-REVIEW-R1:019f88d0-018d-75e2-8e28-54a904a6bf8c`
- review_mode: unique complete independent read-only review
- reviewed_at: `2026-08-12T16:55:24Z`
- verdict: `FAIL`
- P0: `0`
- P1: `2`
- P2: `2`
- Planner final validation allowed: `NO`
- permitted follow-up: same-reviewer bounded finding closure only; do not repeat the complete review
- acceptance_or_git_authorization: `NO`

## Outcome

The current bytes substantially reproduce the intended local-only durable RFQ
slice: exact MySQL target and isolation, minimal runtime grants, same-key replay
and conflict precedence, atomic reservation, row-version CAS, one mixed
validation and at most one Stub Sink attempt, conservative crash/restart
behavior, closed RFQ documents, production 404, server-only boundaries and
protected contract bytes all remain supported. The review nevertheless found
two acceptance-blocking persistence defects. First, the stored-row reader and
database constraint accept state and `row_version` combinations that the frozen
state machine can never produce, so a damaged or cross-version row is replayed
instead of failing closed. Second, the non-transactional rollback/cleanup order
can strand an intact Schema after the runtime account has been removed, and all
three supported stateful commands then fail before they can repair or complete
that partial state. Two current evidence/governance narratives are also stale.
The result is `FAIL / P0=0 / P1=2 / P2=2`.

## Findings

### P1-1 — impossible state and `row_version` pairs are accepted as authentic stored state

The frozen authority says `row_version` starts at `1` and increments exactly
once on every successful CAS (`A0_DESIGN.md:69,116-121`). With the acyclic
transition table in `STATE_MACHINE.md:14-28`, the only valid pairs are:

- `idempotency_reserved / 1`;
- `resolving_lines / 2`;
- `delivery_pending / 3`;
- `accepted / 4` and `delivery_indeterminate / 4`;
- `rejected_before_delivery / 3` when rejected from resolving, or `/ 4` when
  rejected from pending.

The current SQL enforces only `row_version >= 1` and independently validates the
state cell (`frontend/rfq-mysql/migrations/001_rfq_persistent_repository.sql:45-53`).
The reader likewise accepts any positive safe integer at
`frontend/src/lib/rfq/server/v2/mysql-repository.ts:438-470`; it never binds the
version to the state before `classifyRow` returns a stored replay. The existing
malformed-row matrix uses the otherwise-valid reserved fixture at
`frontend/tests/rfq-mysql-repository.test.ts:471-496`, but its only version
mutation is the unsafe integer `9007199254740992` at line 509.

Exact current-byte reproduction: change only that fixture's `rowVersion` from
`"1"` to `"2"`. Every current parser predicate still passes, the reserved
state cell remains valid, and a matching lookup is classified as the stored
processing replay. No legal insertion/CAS path can create that pair. The same
gap accepts arbitrarily large safe versions and other impossible state/version
pairs. This contradicts acceptance criterion 4 in the active task, which
requires illegal, unknown, damaged and cross-version records to fail closed.

Minimum bounded revision:

- add one explicit state/version invariant to both the migration constraint and
  stored-row parser, including the two legal rejected versions;
- add focused malformed-row negatives for every impossible pairing and at least
  one real-MySQL constraint negative;
- preserve the current valid `1 -> 2 -> 3 -> 4` CAS path, public replay bytes and
  all six delivery cells.

### P1-2 — interrupted rollback or initialization cleanup can enter a state no supported command recovers

The active task requires migration failure to be deterministically rolled back
or recoverable (`TASKS/ACTIVE/TASK-029-rfq-mysql-idempotency.md:102-105`), and
the migration plan correctly acknowledges that MySQL DDL implicitly commits
(`MYSQL_MIGRATION_AND_ROLLBACK_PLAN.md:18-24`). The implementation therefore
must handle interruption between DDL statements rather than treating the two
statements as atomic.

Current `downIfEmpty` verifies the full installation, then executes `DROP USER`
before `DROP DATABASE` (`frontend/scripts/rfq-mysql-migrate.mjs:332-337`). A
process crash, connection loss or second-statement failure after the first DDL
leaves the exact two-table `gdhe_rfq` Schema intact but removes
`gdhe_rfq_app`. That half-state is not recoverable through the supported tool:

- `up` sees an existing Schema and calls `verifyStructure` before
  `createRuntimeAccountIfMissing` (`rfq-mysql-migrate.mjs:314-319`);
- `verifyStructure` requires the account at line 264, so the repair call is
  unreachable;
- `verify` fails the same check, and `down-if-empty` begins by calling the same
  full verifier, so it cannot finish the interrupted rollback either.

The failed-initialization catch uses the same account-before-Schema cleanup order
at lines 307-312. The claimed `failureCleanupSafe` evidence does not inject this
window: `simulateFailureCleanup` only creates and removes a probe table/database
(`rfq-mysql-migrate.mjs:360-378`), while the integration test exercises a
successful `downIfEmpty` and a business-row refusal. Thus neither the frozen
failure/recovery contract nor its TDD seam is proven for the actual
non-transactional boundary.

Minimum bounded revision:

- define a recoverable operator state machine for exact absent/present Schema
  and account combinations, so rerunning an explicit supported command can
  safely complete or repair each partial state;
- order cleanup and/or split structural verification so an orphan account or
  missing account cannot make recovery actions unreachable;
- add deterministic injected failures after each destructive DDL in initial
  cleanup and `down-if-empty`, followed by a supported-command recovery proof;
- retain exact-target, zero-business-row and WordPress-isolation checks before
  any destructive step.

### P2-1 — consolidated evidence still describes Planner documentation deltas as unapplied

`EXECUTION_REPORT.md:36-38,65-69` says the root README and architecture updates
are exact unapplied deltas and that document-impact closure remains pending.
`DIFF_OR_OUTPUT_SUMMARY.md:20-26` says those two Planner-owned files remain
unmodified. In contrast, `A5_PLANNER_CHECKPOINT.md:9-13,36-44`, the active task
current evidence at lines 227 and 287, and the actual current diffs all show that
Planner applied both deltas and resolved document impact. This is attribution
drift rather than an out-of-scope product change, but the canonical evidence
package does not describe one current truth.

Minimum bounded correction: update only the consolidated current narration to
distinguish the frontend lane's original unapplied handoff from Planner's later
authorized application. Preserve the frontend A5 historical artifacts and the
actual README/architecture bytes.

### P2-2 — the active task's review section says the already-ACKed review has not started

The active task frontmatter/current state is correctly `UNDER_REVIEW`, its
message list records this request `ACK/done` at line 214, and its current-state
paragraph says the unique review is active at line 184. The dedicated
`Adversarial Review` section nevertheless says `未开始` at line 277. The Board
and Project State correctly show the current review gate, so this is a narrow
current-narration defect rather than a state-machine blocker.

Minimum bounded correction: make only that current review paragraph describe
the completed unique-review FAIL and its exact P0/P1/P2 counts after the linked
response is acknowledged. Preserve the one-complete-review policy and all
historical A1-A5 entries.

## Passing boundaries independently reproduced

- Supported Node `24.18.0` and npm `11.16.0` were used for a safe focused rerun:
  `5 files / 26 tests PASS` for the common Repository, config, public/deep
  server-only negatives, Stub Repository and Stub runtime. ESLint and
  non-incremental TypeScript passed.
- All ten contract verifiers passed on current bytes: Article Number batch
  `11/5/5`, CMS `16/2/2`, ProductCard `8/3/6`, Product Configuration v1/v2,
  Quote Basket v2/v3, QuoteLine v2, RelatedProductCard `9/4/9` and RFQ
  Submission v2 `20 JSON / 5 Schema / 63 closed refs / 94/94`.
- Node 24 migration `plan` and read-only `verify` passed with the exact one
  migration/two-table target and `businessRows=0`. Independent read-only MySQL
  inspection returned `8.4.10 / 3307`, exactly the two RFQ tables, zero business
  rows, runtime privileges `INSERT/SELECT/UPDATE`, and twelve WordPress tables.
  The reviewer did not run account-rotating or row-mutating integration/smoke
  commands; Planner's A1-A5 real-MySQL `92 files / 738 tests`, A3/A4 HTTP and
  concurrency evidence was inspected as cross-lane evidence and is not
  relabeled as a reviewer rerun.
- Same-key/same-payload lookup precedes pre-reservation work and returns the
  stored closed result; digest/comparison mismatch returns conflict; a miss
  alone reserves and proceeds. Duplicate insert rereads the primary key, and
  transition SQL compares exact fingerprint/state/version and increments once.
  No retry loop or request-driven pending/indeterminate resume was found.
- Stored public receipts/errors and authoritative documents are revalidated and
  bound to RFQ ID, public reference, digest, key fingerprint, timestamps,
  delivery cell and Basket token. Driver errors normalize to closed repository
  kinds without raw diagnostic serialization. These passing checks do not cure
  the P1-1 state/version gap.
- `persistent_stub` creates only a server-side MySQL Repository and retains the
  process-local Stub Sink. Production/unset/malformed configuration returns the
  final empty 404 before Request, Repository, WordPress or Sink work. The public
  and deep Client Component build negatives passed in the focused suite.
- Current audit truth independently matches the declared baseline: all
  dependencies have `4 high / 3 moderate / 7 total`, production has
  `2 high / 2 moderate / 4 total`, and neither report contains a `mysql2`
  finding. `mysql2@3.23.3` and its lock integrity are exact.
- All thirteen A0 paths outside the six authorized package/lock/Intake/Stub/
  config/Route changes are byte-exact. Selected package, lock, migration,
  migration tool, Repository, Intake, config and Route hashes match the A5
  evidence. No `.env` delta, generated `.next`, TypeScript cache, temporary
  frontend root, Python bytecode or port-3000 listener remains; `git diff
  --check` passed.
- README and architecture wording accurately limits TASK-029 to local
  `persistent_stub` proof and explicitly leaves production database/TLS,
  backup/restore, HA, managed secrets, security suppliers, reconciliation,
  real Sink, Feishu/CRM/email, deployment and public release unimplemented.
  Unrelated shared dirty files remain identifiable and were not reinterpreted
  as TASK-029 delivery.

## Decision

`FAIL / P0=0 / P1=2 / P2=2`.

Planner may not enter final validation or checked acceptance preparation on this
report. After narrow owner-lane correction of P1-1, P1-2, P2-1 and P2-2 plus
fresh Planner validation, the only permitted reviewer follow-up is a
same-reviewer bounded closure of these four original findings; a second complete
TASK-029 review is not authorized. This report is not user acceptance and does
not authorize product repair by the reviewer, database mutation, commit, push,
merge, deployment, CMS/CRM/Feishu action or any external-system change.

## Same-Reviewer Bounded Finding Closure

verdict: PASS

- closure_request: `MSG-TASK-029-ADVERSARIAL-FINDING-CLOSURE`
- delivery_key: `MSG-TASK-029-ADVERSARIAL-FINDING-CLOSURE:019f88d0-018d-75e2-8e28-54a904a6bf8c`
- reviewed_at: `2026-08-12T17:27:29Z`
- closure_mode: same-reviewer bounded closure of the four original findings only
- historical_complete_review: `FAIL / P0=0 / P1=2 / P2=2`, preserved above as immutable history
- current_closure_verdict: `PASS`
- P0: `0`
- P1: `0`
- P2: `0`
- Planner final validation allowed: `YES`, only after the linked closure response is acknowledged
- acceptance_or_git_authorization: `NO`

### P1-1 closed — stored state and row version are bound at both gates

- The installed migration CHECK now expresses the exact closed matrix: reserved
  version 1, resolving version 2, pending version 3, accepted and indeterminate
  version 4, and rejected version 3 or 4. The parser uses the same mapping before
  timestamp, state-cell or document classification
  (`001_rfq_persistent_repository.sql:45-52` and
  `mysql-repository.ts:379-385,464-468`).
- A reviewer-only fake-connection probe exercised seven representative impossible
  classes covering every state, including rejected below and above its two legal
  versions. All `7/7` returned the existing stable `malformed_record`; the probe
  was removed immediately afterward.
- Independent read-only MySQL inspection at `8.4.10 / 3307` found the same
  installed `ck_rfq_row_version` clause. A real-server expression matrix returned
  allowed for exactly reserved 1, resolving 2, pending 3, accepted 4,
  indeterminate 4 and rejected 3/4, and rejected each paired impossible value.
  The target remains exactly two tables with zero business rows.
- The legal transition tests still cover reservation, resolving, pending,
  accepted, indeterminate and both rejected paths. Planner's fresh current-byte
  Repository `9/9` and migration `3/3` results were inspected as cross-lane
  regression evidence rather than relabeled as this reviewer's execution.

### P1-2 closed — supported commands converge from all partial DDL states

- Current `up` first verifies an existing Schema without requiring the runtime
  account, recreates the account when absent, resets the exact grants and then
  performs full verification (`rfq-mysql-migrate.mjs:333-362`).
- Failed-initialization cleanup and `down-if-empty` both perform database-first,
  account-second removal. Before any destructive rollback, `down-if-empty`
  verifies exact structure, requires zero business rows and checks the twelve-table
  WordPress baseline (`rfq-mysql-migrate.mjs:320-330,374-395`).
- The current recovery proof explicitly reaches all four Schema/account
  present/absent cells and injects interruption after database and account removal
  in both failed initialization and `down-if-empty`, then reruns only a supported
  command to converge (`rfq-mysql-migrate.mjs:424-489`). An independent
  current-source order/state gate returned all nine checks true.
- The matching real-MySQL integration test asserts every state-matrix and
  destructive-boundary result (`rfq-mysql-migration.test.ts:79-112`). Its fresh
  frontend and Planner `3/3` passes were checked as cross-lane mutation evidence.
  Consistent with this closure's read-only stop boundary, the reviewer did not
  repeat the account-rotating/destructive integration. The reviewer did rerun the
  read-only supported `verify`, which returned `verified=true`, `businessRows=0`;
  current MySQL inspection again found two RFQ tables and twelve WordPress tables.
- The runtime grant verifier remains exact `INSERT/SELECT/UPDATE`, and recovery
  does not broaden target, privilege or WordPress scope.

### P2-1 closed — consolidated documentation attribution is truthful

`EXECUTION_REPORT.md:47-53,80-86` and
`DIFF_OR_OUTPUT_SUMMARY.md:23-34` now distinguish the frontend lane's original
unapplied root README and architecture handoff from Planner's later authorized A5
application. They preserve the historical lane handoff, the current applied
document bytes and the bounded-revision attribution without claiming reviewer or
acceptance completion.

### P2-2 closed — current governance narration is consistent

- The active task frontmatter/current-state/review sections, Project State and
  Board all show `UNDER_REVIEW / NOT_ACCEPTED / DIRTY`, preserve the complete
  `FAIL / P0=0 / P1=2 / P2=2`, record owner correction plus Planner fresh recheck,
  and identify this bounded closure as the sole current gate.
- The unique complete review request/response, owner revision request/response
  and this closure request are all ACKed/done. No stale current statement says the
  complete review or closure dispatch has not started.

### Proportionate independent gates and residue

- Node `24.18.0`: reviewer state/version probe `1 file / 7 tests PASS`; affected
  ESLint PASS; non-incremental TypeScript PASS; migration read-only verify PASS.
- DPG project validation, message validation, strict lane audit and
  `git diff --check` PASS. The failed first strict-audit invocation used an
  unsupported optional argument only; the canonical strict command then passed
  with zero issues.
- The reviewer probe, `.next` and `tsconfig.tsbuildinfo` are absent. No product,
  test, documentation, task authority, database business row, account, CMS,
  dependency, Git, deployment or external-system state was changed by this
  closure.

### Closure decision

`PASS / P0=0 / P1=0 / P2=0` for the four original findings. The unique complete
review remains the historical FAIL recorded at the top of this file; this bounded
closure is not a second complete review. Planner may proceed only to fresh final
validation and checked acceptance preparation after acknowledging the linked
response. It is not user acceptance and does not authorize commit, push, merge,
deployment, production enablement, real Sink or any external integration.
