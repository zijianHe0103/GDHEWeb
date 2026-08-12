# TASK-029 Frontend A2 Execution Report

Date: `2026-08-12`

Result: `PASS_FOR_PLANNER_CHECKPOINT`

## Delivered A2 scope

- Added one private, server-only MySQL `8.4.10` Repository implementation for
  `gdhe_rfq.rfq_intake_records` behind the A1 common contract.
- Added an explicit dependency-injected loopback connection factory. No
  environment reader, global connection, durable credential, DDL or GRANT was
  added.
- Bound every acquired connection to `gdhe_rfq_app@127.0.0.1`, port `3307`,
  database `gdhe_rfq` and MySQL `8.4.10`; set UTC, `READ COMMITTED` and the
  frozen strict SQL mode before Repository SQL.
- Implemented a bounded primary-key lookup with closed authentic
  `miss | replay | conflict | recovery_required` outcomes. Conflict precedes
  expiry, accepted/rejected terminal rows replay after expiry, and other
  expired rows require recovery without mutation.
- Implemented one atomic reservation insert. Duplicate-key contenders re-read
  the primary key and converge on the stored public result; unrelated unique
  identity collisions become the stable `reservation_conflict` error.
- Extended the common transition input only for expected state,
  `row_version`, timestamp, validated authoritative document and frozen public
  result. One CAS update enforces every A0 transition and increments the row
  version exactly once.
- Revalidated all incoming and stored public/authoritative JSON through the
  existing RFQ Submission `2.0.0` validators and cross-bound RFQ UUID, Public
  Reference, digest version/value, fingerprint, timestamps, state/delivery
  cell and Basket snapshot token.
- Adapted the existing Stub and local Intake to the same durable state-machine
  contract: processing receipt at reservation, resolving CAS before mixed
  validation, pending CAS before Sink, and one terminal CAS after outcome.
- Normalized invalid input, malformed rows, target/configuration failure,
  connection failure, timeout, deadlock, stale CAS, reservation conflict and
  ambiguous mutation without SQL, schema/table, credential, raw payload or
  driver diagnostic leakage. There is no retry loop.

## Direct real-MySQL proof

The focused integration suite proves:

- two Repository instances share the same database truth;
- miss, first reservation, exact replay and an actual duplicate-key race;
- same key/different payload conflict with zero mutation;
- new key/same payload keeps distinct RFQ UUID and Public Reference;
- all six cells, every allowed edge used by the frozen flow, forbidden edge
  rejection and stale `row_version` rejection;
- exact millisecond timestamps, fixed `2592000000` ms expiry and no replay
  extension;
- accepted replay maps stored initial `201` to `200`;
- resolving and pending rejection, accepted and indeterminate behavior;
- malformed contract/version/UUID/reference/binary/JSON/timestamp/state-cell
  representations fail closed;
- hostile/revoked driver values invoke zero traps and expose no diagnostics;
- injected timeout, deadlock and ambiguous mutation outcomes are stable;
- rejected target connections are closed and perform zero Repository SQL.

Test teardown deletes only fingerprints created by this file through migration
authority, then rotates `gdhe_rfq_app` to a fresh unknown random password.
Direct post-run verification reports zero business rows and no usable
credential retained in repository files, artifacts, environment reports or
Keychain.

## Boundaries preserved

- No `persistent_stub` or Route/runtime wiring was added; the existing Route
  continues to use the process-local Stub only.
- No two-process/restart/20-request/crash-window A4 work was started.
- No customer page, Quote Basket, CMS, WordPress, Feishu, external system,
  production, deployment, review or Git delivery was changed.
- Package/lock, A1 migration SQL/tool, Route/config/Sink, RFQ Schemas/vectors,
  Article Number batch, `next-env.d.ts`, pre-existing `tsconfig.json` and all
  Planner-owned files remain at their expected protected bytes.

## Documentation impact

`NOT_APPLICABLE` for customer-facing usage in A2: the MySQL Repository is not
wired to a Route or runtime mode. A5 remains responsible for consolidated
frontend/root architecture documentation after A3/A4 prove the runtime and
restart boundaries.

## Checkpoint

A2 is complete only for independent Planner review. A3 and later phases remain
blocked; this report is not task acceptance, Git delivery or deployment.
