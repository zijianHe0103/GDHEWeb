# TASK-027 Frontend A5 Planner Checkpoint

result: FAIL
severity: P0=0 / P1=1 / P2=0
checked_at: 2026-08-12T06:03:55Z

## Passing scope

- The linked A5 response was validated and ACKed/done.
- Independent Node 24.18.0 reproduction passed the A1-A5 focused inventory at
  `11 files / 68 tests`.
- The local-only configuration gate, disabled/production empty `404`, ordinary
  Origin/media/size/UTF-8/JSON/contract mapping, authentic A4/TASK-025 wiring,
  public serialization and server-only build boundaries are present.
- The lane evidence records full `77/647`, ten verifiers, lint, typecheck,
  production build, real HTTP smoke, protected hashes, cleanup and DPG PASS.

## P1 finding — hostile raw-body read error escapes normalization

An independent current-byte Vite SSR probe supplied a `ReadableStream` whose
reader rejected with a null-prototype Proxy. The Route catch classified the
unknown value with `error instanceof RangeError`. That invoked the attacker's
`getPrototypeOf` trap once; the trap's `PRIVATE_RAW_BODY_DIAGNOSTIC` Error then
escaped `POST` instead of returning the frozen `400 invalid_request` response.

Observed result:

```text
{"returned":false,"leaked":true,"name":"Error","traps":1}
```

This violates the A5 requirement that malformed body/dependency values are
normalized to customer-safe public errors and that raw diagnostics never leave
the Route boundary.

## Controlled recovery

`task_transition.py reopen` was attempted as required and safely refused with
`reopen requires the matching current task in AWAITING_USER` because TASK-027
is already `IN_PROGRESS`. No semantic state mutation occurred. This checkpoint
therefore records the equivalent bounded recovery while the task remains
`IN_PROGRESS / NOT_ACCEPTED / DIRTY`.

Only the raw-body classification boundary, one direct hostile regression, the
already-required real HTTP raw-gate proof and fresh A5 validation are released.
A6, the single complete adversarial review, acceptance, Git and deployment
remain blocked.

## Narrow recheck — PASS_AFTER_NARROW_REVISION

checked_at: 2026-08-12T06:15:32Z
severity: P0=0 / P1=0 / P2=0

The linked revision response was validated and ACKed/done. The original FAIL
above remains historical. Independent reproduction on the current bytes proved:

- direct Route suite `1 file / 5 tests` PASS;
- the same no-file Vite SSR hostile body-reader attack now returns authentic
  `400 invalid_request`, leaks no private diagnostic and leaves `get`,
  `getPrototypeOf`, `ownKeys` and `getOwnPropertyDescriptor` counters at zero;
- the Route classifies only its own closed `ok | invalid | too_large` result,
  so declared/streamed overflow remains `413` without inspecting unknown errors;
- lane current-byte evidence passes A1-A5 `11/70`, TASK-025/Basket v3 `15/35`,
  full `77/649`, all ten verifiers, lint/typecheck/build, extended real HTTP
  smoke, protected hashes, cleanup and DPG gates;
- Planner independently confirmed no `.next`, TypeScript cache, temporary root
  or Node/Next listener, the production `next-env.d.ts` hash and all DPG/diff
  gates.

A5 therefore passes after the one bounded revision. Only A6 documentation and
full consolidation may begin; the single complete independent review remains
blocked until A6 returns and Planner validates it.
