# TASK-029 Frontend A3 Execution Report

Date: `2026-08-12`

Result: `PASS_FOR_PLANNER_CHECKPOINT`

## Delivered A3 boundary

- Added one explicit, closed, server-only `persistent_stub` configuration
  variant. It reuses the existing loopback origin, RFQ HMAC material and
  isolated Stub Sink outcome, and additionally requires only the transient
  MySQL runtime password. Host, port, account and Schema remain the frozen A2
  constants; no `.env*`, secret file, Keychain entry, DDL or GRANT path was
  added.
- Preserved `stub` as the process-local regression/local test mode.
- Wired the existing Intake Route to `MySqlRfqRepository` only when the mode is
  `persistent_stub`. Every persistent request receives a new server-only
  Repository/runtime instance, making exact replay a database fact rather
  than a module-cache fact.
- Preserved the existing orchestration: one lookup, reservation and resolving
  transition; exactly one complete TASK-025 mixed batch; pending transition
  before at most one isolated Stub Sink attempt; then one accepted,
  indeterminate or rejected-before-delivery result.
- Preserved customer-safe response mapping and the production/unset/disabled
  final empty `404` before Request, Repository, mixed-batch or Sink access.

## Authentic same-process proof

The real-MySQL focused test reconstructs the Route module between first and
replay requests. It proves:

- accepted `201`, stored replay `200` with the same receipt/reference;
- same key plus changed canonical customer content returns stable
  `409 idempotency_conflict` and leaves the row unchanged;
- a new intent/key with the same canonical Basket/customer content creates a
  second row and distinct Public Reference;
- accepted first/new requests produce exactly two mixed-batch calls total and
  zero legacy calls;
- indeterminate `202` and rejected-before-delivery `409` replay their stored
  results after module reconstruction with no additional mixed batch;
- accepted/indeterminate rows retain the one claimed delivery attempt, while
  trusted rejected-before-delivery retains the frozen zero-delivery cell;
- production passes a hostile Request Proxy to the Route and observes zero
  request traps, zero database mutation and zero mixed access.

The real HTTP smoke uses exactly one Next.js development process and one
loopback WordPress fixture. It returns `201 / 200 / 409 / 201`, leaves two
accepted rows with distinct references and delivery attempt `1`, makes two
mixed calls and zero legacy calls, then performs exact fingerprint cleanup.
This is not a two-process or restart proof.

## Safety and retained state

- Runtime credentials existed only in the test/smoke process environment and
  were rotated to a fresh unknown random value during cleanup. No usable
  credential is retained.
- Final `gdhe_rfq` state is exactly two tables and zero business rows; runtime
  grants remain only `SELECT`, `INSERT`, `UPDATE` on
  `gdhe_rfq.rfq_intake_records`.
- Public responses and stored public documents contain no raw Idempotency Key,
  MySQL credential, Article Number, WordPress endpoint or private diagnostic.
- The deep MySQL module, Route and all existing RFQ public/deep modules retain
  real Client Component build negatives.
- WordPress Core `7.0.2`, SCF `6.9.2`, GDHE Site `0.7.0` and twelve-table
  database protection remain PASS.

## Preserved boundaries

No A4 two-Next-process, process-restart, twenty-concurrent-request or injected
crash-window matrix was started. No customer page, visual output, Quote Basket,
RFQ Schema/vector, CMS, WordPress data, external system, package/lock,
deployment, review or Git operation changed.

## Documentation impact

`NOT_APPLICABLE_FOR_A3`: A3 writes only direct execution evidence. The frozen
A5 phase still owns truthful frontend/root/architecture operational
documentation after restart and failure-window proof exists.

## Stop condition

A3 is complete for independent Planner validation only. This report is not A4
authorization, adversarial review, user acceptance, Git delivery or deployment.
