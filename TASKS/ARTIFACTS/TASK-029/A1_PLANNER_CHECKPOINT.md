# TASK-029 A1 Planner Checkpoint

validated_at: `2026-08-12T14:44:41Z`
result: `PASS`

## Independently reproduced

- Repository, Stub, migration and server-only focused suite: `4 files / 16 tests PASS`.
- Migration-only suite: `1 file / 2 tests PASS`.
- Ten existing contract verifiers: PASS.
- ESLint and `tsc --noEmit --incremental false`: PASS.
- WordPress `7.0.2` Core checksum, SCF `6.9.2` checksum and all 12 WordPress tables: PASS.
- DPG project/messages/strict-lane and `git diff --check`: PASS.

## Direct MySQL truth

- Server: MySQL `8.4.10` at `127.0.0.1:3307`.
- `GDHE`: `utf8mb4_unicode_ci`, 12 base tables.
- `gdhe_rfq`: `utf8mb4_0900_bin`, exactly two base tables.
- `rfq_intake_records`: zero business rows.
- migration version: `001_rfq_persistent_repository` with exact SQL SHA-256 `8646615929384c57d6677c32d24d3ba07a8ded588d010a53f1527a66e51c03ae`.
- runtime account: `gdhe_rfq_app`@`127.0.0.1`, `caching_sha2_password`, `USAGE` plus only `SELECT, INSERT, UPDATE` on the business table.
- usable runtime credential retained: `false`.

## Protected boundary

A0 baseline is `15 exact + 4 A1-authorized` differences: package manifest,
package lock, Intake common interface seam and Stub implementation. Frozen RFQ
Schemas/vectors, Route/config/Sink, Article Number batch, `next-env.d.ts` and
pre-existing `tsconfig.json` are byte-exact.

## Gate

A1 is accepted only as an internal checkpoint. A2 may implement the MySQL
Repository behind the common interface. Route/UI/persistent mode, restart,
concurrency, review, Git delivery, deployment and external systems remain
blocked.
