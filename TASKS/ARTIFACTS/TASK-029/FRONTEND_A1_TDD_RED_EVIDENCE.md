# TASK-029 Frontend A1 TDD RED Evidence

Date: `2026-08-12`

Runtime: Node `24.18.0`, npm `11.16.0`.

## RED 1 — common Repository authority

Command:

```sh
cd frontend && npm test -- tests/rfq-repository-contract.test.ts
```

The first run exited `1` before collecting tests because
`src/lib/rfq/server/v2/repository.ts` did not exist. This proved that the Stub
had no common server-only Repository contract or shared authentic-result seam.

After the minimum contract existed, a second direct RED exited `1` because
`createRfqRepositoryLookupResult` accepted a `miss` carrying the extra
`privateDiagnostic` property. The same regression covers invalid replay
documents and hostile Proxy input without reflection or diagnostic leakage.

Minimum GREEN: a closed result constructor now accepts only exact plain data
objects, rejects Proxies/symbols/accessors/extra keys, verifies authentic
receipt/error wrappers for replay, creates a new frozen result and registers it
in the private authenticity set. The Stub implements this common contract.

## RED 2 — explicit migration plan

Command:

```sh
cd frontend && npm test -- tests/rfq-mysql-migration.test.ts
```

The initial run exited `1`: the explicit migration script/package command was
missing. Minimum GREEN added the versioned SQL file, Node-built-in control flow
plus the exact `mysql2@3.23.3` driver, and an offline `plan` command that does
not connect or read credentials.

## RED 3 — real MySQL migration and permissions

Focused command:

```sh
cd frontend && npm test -- tests/rfq-mysql-migration.test.ts -t "migrates, rejects drift"
```

The run exited `1` with `Unknown RFQ MySQL migration command`, proving that no
real integration operation existed. Minimum GREEN implemented explicit
`up`, `verify`, `down-if-empty` and test-only integration orchestration against
the fixed MySQL `8.4.10` loopback target.

The first integration GREEN attempt safely failed closed on an index-order
expectation mismatch while the database objects themselves were intact. The
expected canonical index ordering was corrected; no production contract was
weakened.

## RED 4 — exact structure and session contract

After adding direct expectations for column/index drift and the runtime session
contract, the focused migration test exited `1` because these fields were
absent from the integration result. Minimum GREEN added exact table-definition,
column-shape and index-shape verification, active mutation proofs for column and
index drift, and UTC / `READ-COMMITTED` / strict SQL-mode runtime assertions.

Final direct result: `tests/rfq-mysql-migration.test.ts` passes `2/2`; common
Repository and affected Stub/Intake files pass `6 files / 21 tests`.
