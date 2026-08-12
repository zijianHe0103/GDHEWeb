# TASK-029 Frontend A2 Dispatch

## Authority

Execute only A2 of confirmed TASK-029. Read the active task, all A0 authority,
all A1 artifacts and current A1 code before mutation. Preserve the shared dirty
worktree and do not start A3.

## Scope

Using strict RED/GREEN, implement the smallest server-only MySQL Repository
behind the A1 common contract:

1. Create an explicit dependency-injected runtime connection/config seam for
   `gdhe_rfq`; no global credential, `.env*`, runtime DDL or GRANT.
2. Implement a bounded primary-key `lookup` returning only authentic
   `miss | replay | conflict | recovery_required` results.
3. Implement one atomic reservation insert. Duplicate-key races must re-read
   and classify; they must not surface raw MySQL errors or create a second RFQ.
4. Extend the common transition input only as required to express the frozen
   expected-state plus `row_version` CAS and all allowed A0 transitions.
5. Validate every incoming/stored public or authoritative RFQ document through
   the existing RFQ Submission `2.0.0` authority before persistence or return.
6. Preserve exact UTC millisecond timestamps, the fixed 2592000000 ms expiry
   anchor and monotonic last-transition time. Lookup/replay/transition must not
   extend expiry.
7. Fail closed on malformed/unknown state, version, UUID/reference, binary
   length, JSON, timestamp or state-cell combinations.
8. Normalize connection failure, timeout, deadlock, stale CAS and ambiguous
   commit without leaking SQL, table/schema names, credentials or diagnostics.
   Do not blindly retry a transition.

## Required real MySQL proofs

- miss, first reservation and exact same-payload replay;
- same key/different payload conflict with zero mutation;
- new key/same payload produces a distinct RFQ;
- every frozen state cell and only allowed CAS transitions;
- duplicate-key race re-read and stale `row_version` rejection;
- exact 30-day anchor and no replay extension;
- malformed-row and injected connection/timeout/deadlock/ambiguous-outcome
  fail-closed behavior;
- two Repository instances in one Node process share the same database truth.

A2 test setup may use the existing migration authority to rotate
`gdhe_rfq_app` to one transient in-memory password, inject that password only
into the test process, clean only exact TASK-029 test fingerprints, and rotate
the account to a fresh unknown random password before exit. No usable
credential may remain in files, artifacts, Keychain, environment reports or
logs.

## Non-goals

- no `persistent_stub` config or Route/runtime wiring;
- no customer page/UI/Quote Basket change;
- no two Next processes, restart, twenty-request or crash-window matrix;
- no migration redesign unless a proven A1 defect blocks A2;
- no WordPress/CMS, Feishu/CRM/email, production, deployment, review or Git;
- no root README/architecture consolidation.

## Validation and artifacts

Run focused Repository tests, affected Stub/Intake tests, all ten existing
verifiers, lint, non-incremental typecheck and the minimum build/server-only
gate required by changed imports. Re-check WordPress Core/SCF/12-table DB,
`gdhe_rfq` exact schema/permissions/residue, A1 protected hashes, secret/client
leakage, generated/listener residue, diff and DPG gates.

Create at least:

- `FRONTEND_A2_TDD_RED_EVIDENCE.md`
- `FRONTEND_A2_EXECUTION_REPORT.md`
- `FRONTEND_A2_VALIDATION_LOG.md`
- `FRONTEND_A2_DIFF_SUMMARY.md`

Update only the frontend lane worklog, send one linked execution response and
stop. A3 remains blocked until an independent Planner checkpoint.
