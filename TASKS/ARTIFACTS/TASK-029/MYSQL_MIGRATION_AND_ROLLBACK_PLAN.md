# TASK-029 MySQL Migration and Rollback Plan

## A1 migration shape

- Directory: a dedicated versioned location under `frontend/`, outside request
  handlers and module import side effects.
- First migration: `001_rfq_persistent_repository.sql` plus an exact checksum.
- Explicit commands only: `plan`, `up`, `verify`, and `down-if-empty`.
- `up` creates lowercase `gdhe_rfq`, migration metadata, the v1 intake table,
  constraints/indexes and the loopback runtime account/grants.
- Password enters through a process environment value or secure prompt and is
  never echoed, logged or written to a repository file.
- Application startup performs only configuration/health checks; it cannot
  create/alter/drop/grant.

## Idempotency and drift

- Reapplying the exact migration is a no-op only when the stored version and
  checksum match and every expected table/column/index/check/grant matches.
- Same version with a different checksum or any unexpected object is a hard
  drift failure.
- Migration failure occurs inside the narrowest available transactional DDL
  boundary and is followed by structural verification. MySQL implicit DDL
  commits are not described as fully transactional.

## Rollback

- `down-if-empty` first reads exact schema/table/user targets and verifies that
  the business table has zero rows.
- It may revoke/drop only the exact local TASK-029 runtime account and exact
  lowercase `gdhe_rfq` objects.
- If any business row exists, rollback stops and reports blocked; it does not
  delete data to make rollback succeed.
- No wildcard database target, shell glob, unresolved variable, WordPress
  database, Core table or shared user is allowed.
- Normal test cleanup deletes only exact test fingerprints recorded by the
  current run. The migrated schema may remain as a controlled local artifact
  with zero business rows.

## Permission proof

Run `SHOW GRANTS` through a sanitized verifier and prove:

- runtime: SELECT/INSERT/UPDATE on only
  `gdhe_rfq.rfq_intake_records`;
- runtime cannot CREATE, ALTER, DROP, GRANT, access `GDHE`, or read migration
  metadata;
- migration authority is not used by the Next.js process;
- test cleanup authority is invoked only by explicit test/migration commands.
