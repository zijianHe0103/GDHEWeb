# TASK-027 Frontend A4 Execution Report

result: PASS_FOR_PLANNER_CHECKPOINT
runtime: Node 24.18.0
message_id: MSG-TASK-027-FRONTEND-STUB-STATE-DELIVERY-A4

## Scope completed

- `StubRfqRepository` uses one private process-local Map keyed only by the
  SHA-256 idempotency-key fingerprint. It retains only digest/comparison
  evidence, the first exact `createdAt/expiresAt`, minimum state and the
  authentic customer-safe public receipt/error needed for replay.
- Repository lookup covers the exact five frozen decisions: unseen miss, live
  same-digest replay, live different-digest conflict, pre-reservation rejection
  with no record, and expired indeterminate controlled reconciliation. Replay
  never extends the exact 30-day anchor or automatically resends.
- Reservation is atomic within one process. Concurrent same-key fresh calls
  create at most one reservation, one complete mixed attempt and one Sink call.
- `StubRfqSink` accepts only an authentic `delivery_pending/pending/1`
  Authoritative document. Plain/resolving documents fail before call-count
  increment. The Sink stores only its selected closed local outcome and call
  count; it does not retain or inspect the customer document.
- The completed local `createRfqIntakeRuntime` overload returns only a frozen
  `{httpStatus, document}` whose document is an authentic validated
  `public_receipt` or `public_error` wrapper.

## Exact local outcomes

- accepted: new `201`, exact stored receipt replay `200`, total one mixed call
  and one Sink call;
- indeterminate: new/replay `202`, exact same processing receipt and fixed
  `retryAfterSeconds:30`, total one Sink call and no resend;
- rejected before delivery: new/replay exact same
  `service_temporarily_unavailable` error `409`, total one Sink call;
- mixed/authority failure after reservation: exact stored/replayed
  `basket_refresh_required` error with only `basket/changed`, `409`, zero Sink;
- same-key different digest: authentic `idempotency_conflict` `409`, record
  unchanged and zero additional downstream work;
- pre-gate rejection: non-retained authentic `request_not_allowed`, repository
  size zero and no mixed/Sink work;
- expired indeterminate: authentic reconciliation-safe service error `409`, old
  record/expiry unchanged and zero resend.

## Safety and authenticity

Public receipt/error bodies pass the existing A2 strict runtime contract.
Wrapper JSON exposes only its kind. Direct scans prove no customer/contact,
Article Number, model, RFQ internal UUID, digest/comparison token, HMAC secret or
private diagnostic in public results or repository inspection. Repository and
Sink thrown hostile values are normalized without reflection or coercion.

## Explicitly preserved

A1-A3 behavior remains covered, including both A3 P1 regressions. A4 adds no
Route Handler, `/api/rfq/intake/`, raw HTTP/body/origin/media/config gate,
listener, UI, Basket mutation, CMS/WordPress change, dependency, external
system, production durability claim, review, Git delivery or deployment. A5
remains blocked pending independent Planner validation.
