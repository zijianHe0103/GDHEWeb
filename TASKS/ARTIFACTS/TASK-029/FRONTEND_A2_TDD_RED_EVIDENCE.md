# TASK-029 Frontend A2 TDD RED Evidence

Date: `2026-08-12`

Runtime for every captured cycle: Node.js `24.18.0`, npm `11.16.0`.

## RED 1 — missing MySQL Repository

Command:

```sh
npm test -- tests/rfq-mysql-repository.test.ts
```

Result: exit `1`; Vitest collected zero tests because
`src/lib/rfq/server/v2/mysql-repository` did not exist. The first test already
specified two Repository instances, a primary-key miss, one reservation and an
exact stored `202` replay. No production file existed when this RED was
captured.

## GREEN 1 — reservation and replay

The minimum server-only Repository, injected connection factory, validated
processing receipt, atomic insert and duplicate-key re-read were added.
Focused result: `1 file / 1 test PASS`.

## RED 2 — missing CAS transition

The next test drove the real Repository from `idempotency_reserved` through
`resolving_lines`, `delivery_pending` and `accepted`, with exact expected state
and `row_version`. The existing placeholder rejected the first transition as
`MySqlRfqRepositoryError(kind="invalid_input")`; prior reservation/replay
remained green.

## GREEN 2 — state cells and CAS

The common contract gained the minimum expected-state/version transition
input and closed transition result. The MySQL implementation validates the
public and authoritative RFQ `2.0.0` documents, uses one guarded update and
increments the row version once. Focused result: `1 file / 2 tests PASS`.

## RED 3 — hostile driver value escaped

A connection factory threw a revoked-behavior Proxy whose reflection traps
emit `PRIVATE_DATABASE_DIAGNOSTIC`. The focused test failed because an
`instanceof` check invoked the hostile `getPrototypeOf` trap and the private
error escaped instead of the stable `unavailable` result.

## GREEN 3 — trap-safe failure normalization

Repository-owned errors are now recognized by private identity, and unknown
driver values are inspected only through the Node proxy detector plus a safe
own data descriptor for the closed driver code. Focused result:
`1 file / 3 tests PASS`; trap counts remained zero.

## RED 4 — target identity was not bound

The target-boundary test first proved that a `root` connection configuration
was accepted. This violated the frozen `gdhe_rfq_app@127.0.0.1`, MySQL
`8.4.10`, port `3307`, database `gdhe_rfq` authority.

## GREEN 4 — target identity binding

Configuration now accepts only the runtime account and loopback target. Every
acquired connection sets UTC, `READ COMMITTED` and strict SQL mode, then checks
the exact server/database/account tuple before any Repository SQL. Focused
result: `1 file / 4 tests PASS`.

## RED 5 — unauthenticated transition result

The common-contract test failed with
`TypeError: createRfqRepositoryTransitionResult is not a function`. A caller
could not distinguish an authentic closed CAS result from an object-shaped
forgery.

## GREEN 5 — authentic result boundary

Reservation and transition outcomes now have private authenticity readers;
the Stub, MySQL Repository and Intake orchestration share that boundary.
Affected focused result: `4 files / 19 tests PASS`.

## RED 6 — failed target check leaked the connection handle

The wrong-target regression expected one `end()` call and observed `0` after
configuration rejection. This was a real acquired-handle cleanup defect.

## GREEN 6 — acquired-handle cleanup

Connection configuration and Repository operations now share one finalizer;
every acquired connection is ended even when target verification fails.
Final focused MySQL result: `1 file / 8 tests PASS`.

No A3 runtime configuration, Route Handler wiring, restart matrix, UI or
external delivery work was used to obtain these GREEN results.
