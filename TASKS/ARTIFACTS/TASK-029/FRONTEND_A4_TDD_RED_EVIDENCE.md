# TASK-029 Frontend A4 TDD RED Evidence

Date: `2026-08-13`

Runtime: Node.js `24.18.0`, npm `11.16.0`, MySQL `8.4.10`.

## Frozen seams

The A4 dispatch already fixed the public seams before test work began:

1. twenty concurrent requests through two independent MySQL Repository
   instances;
2. two controlled Next.js processes and a stopped/restarted Next.js process;
3. every durable crash cell in `STATE_MACHINE.md`;
4. expired pending/indeterminate recovery without resend or deletion;
5. accepted response loss replaying the exact stored receipt.

No production fault switch, retry, worker, poller or reconciliation path was
introduced merely to make these seams observable.

## RED 1 — missing focused A4 proof

Command:

```text
npm test -- tests/rfq-persistent-stub-a4.test.ts
```

Result: exit `1`. Vitest reported `No test files found`. The A3 bytes had no
executable A4 concurrency/crash-window proof.

Minimum GREEN added one test-only real-MySQL harness. Its first vertical slice
passed `1 file / 1 test`: twenty same-key requests across two independent
Repository instances converged on one Public Reference, one mixed validation,
one Stub Sink call and one accepted database row.

## RED 2 — durable attempt and Sink-call meanings were not interchangeable

After adding the frozen crash matrix, the focused run exited `1` with `12/13`
passing. The sole failure was the `after_pending` assertion:

```text
expected attempts 0
received attempts 1
state delivery_pending
```

This was a test-model defect, not a production defect. The frozen state machine
requires the durable attempt to be claimed before Sink invocation. The minimum
test correction split `delivery_attempt_count` from observed Sink calls.

GREEN:

```text
Test Files  1 passed (1)
Tests       13 passed (13)
```

The matrix then proved pre/post reservation, pre/post resolving CAS, during
mixed validation, post-mixed/pre-pending, post-pending/pre-Sink, during/after
Sink, post-indeterminate and post-accepted response-loss cells.

## RED 3 — missing controlled HTTP proof

Command:

```text
node tests/rfq-persistent-stub-a4-http-smoke.mjs
```

Result: exit `1`, `MODULE_NOT_FOUND`. A3 had only a one-process smoke.

## RED 4 — Turbopack rejected the isolated test root

The first new two-process run exited `1` before business traffic. Next.js
Turbopack rejected the temporary project root's external `node_modules`
symlink:

```text
Symlink [project]/node_modules is invalid, it points out of the filesystem root
```

The minimum test-only correction selected Next.js `dev --webpack` for the two
isolated temporary roots. No product config, dependency or runtime boundary
changed.

GREEN:

```text
TASK-029 A4 HTTP smoke PASS: two simultaneous Next processes; 20 same-key
requests; one reference/row/mixed batch/attempt; both-process replay; restart
replay; zero legacy calls.
```

Every temporary project, listener, exact test fingerprint and transient
credential was cleaned or rotated in `finally`.
