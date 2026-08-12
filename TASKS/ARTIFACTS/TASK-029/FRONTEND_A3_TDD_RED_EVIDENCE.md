# TASK-029 Frontend A3 TDD RED Evidence

Date: `2026-08-12`

Runtime: Node.js `24.18.0`, npm `11.16.0`.

## RED 1 — closed `persistent_stub` configuration

Test-first change: extended only
`frontend/tests/rfq-intake-v2-config.test.ts` with the explicit mode and
server-only credential boundary.

Command:

```sh
npm test -- tests/rfq-intake-v2-config.test.ts
```

Result: exit `1`; `1 file`, `2 tests`, `2 failed`.

- the existing enabled Stub result lacked the new explicit `mode: "stub"`;
- a complete `persistent_stub` environment returned `{ enabled: false }`
  instead of the required closed persistent configuration.

Minimum GREEN: `config.ts` now accepts only `stub` or `persistent_stub`, keeps
production closed, and requires a non-empty at-most-255-character server-only
MySQL password only for the persistent mode. The same command then passed
`1 file / 2 tests`.

## RED 2 — real persistent Route wiring

Test-first change: added
`frontend/tests/rfq-persistent-stub-runtime.test.ts`, using the real MySQL
`8.4.10` target, the real Route and one loopback TASK-025 mixed-batch fixture.

Command:

```sh
npm test -- tests/rfq-persistent-stub-runtime.test.ts
```

Result: exit `1`; `1 file`, `4 tests`, `4 failed`.

The meaningful missing-production failures were:

- first accepted request returned `201`, but the exact key fingerprint had
  `0` persistent rows instead of `1`;
- after module/runtime reconstruction, indeterminate replay created a new
  Public Reference and timestamp;
- after reconstruction, rejected-before-delivery replay created a new request
  reference instead of returning the stored result.

These failures proved the Route still selected the process-local Stub. The
fourth failure was a test-harness-only assertion: constructing a
`ReadableStream` may pull once independently of Route body reading. It was
replaced with a hostile Request Proxy, which directly proves zero request
property/reflection access when production is closed.

Minimum GREEN: the Route now constructs the A2 MySQL Repository only for
`persistent_stub`, while `stub` retains the cached process-local runtime. The
persistent path deliberately reconstructs its Repository/runtime per request,
so replay depends on MySQL rather than module state. Direct A3 tests passed
`2 files / 6 tests`.

## Regression REDs closed during GREEN

Non-incremental typecheck first failed because the discriminated config return
still exposed `mysqlPassword?: string`. The implementation was narrowed with
a real control-flow branch that returns the persistent variant only after the
primitive string length check; no unchecked runtime bypass was added.

The affected RFQ regression first finished `45/46 files` and `230/231 tests`:
the marker-stripped Client Component positive control now reached `mysql2`
Node built-ins through the real Route. The temporary-build-only positive
control was updated to substitute a same-shape, non-executing MySQL module;
the real guarded source remained unchanged. A deep MySQL Client Component
negative was added. The final matrix passed `12/12`.

## TDD boundary

No A4 two-process, restart, twenty-request or crash-window test was created or
run. No customer UI, CMS, external Sink, dependency or frozen contract byte
was changed.
