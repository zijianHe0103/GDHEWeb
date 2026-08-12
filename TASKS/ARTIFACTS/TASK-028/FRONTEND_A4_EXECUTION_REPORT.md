# TASK-028 Frontend A4 Execution Report

executed_at: `2026-08-12T09:31:05Z`
message_id: `MSG-TASK-028-FRONTEND-ACCEPTED-CLEAR-RECOVERY-A4`
result: `PASS_FOR_PLANNER_CHECKPOINT`

## Outcome

The local RFQ flow now clears the Quote Basket only after an authentic,
Schema-validated accepted receipt proves the exact submitted and current
six-field Basket snapshot and the browser recomputes the frozen v2 snapshot
token. A changed or invalid current Basket is retained in full. Explicit
recovery can reuse one unchanged live in-memory draft/intent/key without a new
intent request.

This is only the A4 frontend checkpoint. A5, Visual QA, the one complete
independent review, user acceptance, Git delivery, deployment and external
integration remain blocked.

## Implemented A4 behavior

- The public receipt DTO is unchanged and contains no snapshot or token. A
  private frozen `WeakMap` binds already validated receipt material to the
  exact parser-produced object; plain or cloned lookalikes fail.
- Browser Web Crypto reproduces the frozen v2 token using the exact prefix and
  closed canonical snapshot order. Unsafe integers, invalid canonical
  timestamps/TTL, non-lowercase UUIDs, accessors, symbols, hostile/transparent
  Proxy values and unsupported input fail closed without diagnostic output.
- `clearAcceptedReceipt` performs no write until receipt, submitted snapshot,
  token and the final raw stored legal Basket all agree across
  `schemaVersion`, `revision`, `writerId`, `mutationId`, `updatedAt` and
  `expiresAt`.
- Exact success removes only `gdhe.quote-basket.v1`, sets hook state to an
  empty Basket view and announces a customer-safe local acceptance. Missing,
  malformed, expired, changed or throwing storage and all mismatches preserve
  the current raw bytes.
- A storage mutation during the pending intake produces
  `accepted_basket_changed`, leaves the complete newer Basket untouched and
  never partially removes lines.
- One live attempt retains only the normalized customer, exact source
  snapshot, validated local intent/key, immutable draft and serialized body in
  its operation closure. It is not stored in local/session storage, cookies,
  URLs, analytics or logs.
- An explicit unchanged retry performs zero new intent requests and one intake
  POST with the byte-identical draft/key. There is no automatic retry, polling
  or background resend.
- Customer or Basket change, exact expiry, invalid-intent/security response,
  idempotency conflict and accepted terminal result invalidate the attempt.
  Processing, rate-limited and temporary/uncertain outcomes may retain the
  still-live attempt.

## Frozen boundaries preserved

- All 47 A0 immutable protected paths are exact. The only two protected-path
  differences are the A0-authorized A4 edits to
  `frontend/src/lib/quote-basket/browser.ts` and
  `frontend/src/lib/quote-basket/use-quote-basket.ts`.
- A1 customer source/test hashes, package, package-lock, pre-existing tsconfig
  byte and production next-env hash are exact.
- Quote Basket v1/v2/v3 and RFQ Submission v2 Schema, sample, vector, verifier
  and server runtime authority bytes are unchanged.
- A2 issuer/intake and A3 field/order/one-operation/public error behavior stay
  green. No CSS, route, server handler, dependency, CMS, CRM or Feishu byte was
  changed by A4.

## Documentation impact

`PENDING_A5`: the frozen plan assigns consolidated frontend/root/architecture
usage documentation to A5. A4 updates only direct execution evidence and does
not claim project documentation complete.

## Unique next step

Planner independently reproduces the exact accepted clear, changed-Basket and
retry/replay gates. Do not release A5 until this linked A4 response is received
and the current shared bytes pass that checkpoint.
