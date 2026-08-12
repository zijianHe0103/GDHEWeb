# TASK-028 A2 Planner Checkpoint

validated_at: `2026-08-12T08:39:21Z`
result: PASS
next_release: frontend A3 only

## Independent result

Planner acknowledged the linked
`MSG-TASK-028-FRONTEND-INTENT-SUBMISSION-A2-RESPONSE`, inspected the complete
A2 diff and evidence, and independently reproduced the current contract,
crypto, Route, projection and server-only boundaries.

A2 adds the local-only 30-minute HMAC intent seam, exact Quote Basket `3.0.0`
to RFQ Submission `2.0.0` projection and the intake pre-reservation verifier.
It does not add a visible customer form, browser submission orchestration,
Basket clearing, retry UI, production persistence or Feishu integration.

## Reproduced gates

- intent/Route/projection/builder/intake: `5 files / 18 tests` PASS;
- public/deep server-only copied-project matrix: `1 file / 10 tests` PASS;
- RFQ Submission v2 verifier: `20 JSON / 5 Schema / 63 closed refs / 94/94`
  PASS;
- lint and typecheck with `--incremental false`: PASS;
- A0 protected files: `49/49` exact SHA-256 PASS;
- `frontend/next-env.d.ts`: protected production SHA-256 remains exact;
- `.next`, `tsconfig.tsbuildinfo`, temporary roots and port `3000` listener:
  absent;
- project, registry, messages and strict lane audit: PASS;
- `git diff --check`: PASS.

## Behavior review

- opaque intent binds contract version, exact configured loopback Origin,
  lower-case idempotency key, six-field Basket source snapshot, v2 snapshot
  token and the exact 30-minute first-use window;
- the intent Route is local-only, exact-Origin, bare-JSON, fatal-UTF-8,
  one-parse, `8192`-byte and no-store;
- only ordered `1..50` ready Basket lines project; standard, custom and
  accessory rows retain the frozen public meaning while display/internal data
  is omitted;
- the complete draft requires the normalized customer result, projected
  Basket and validated intent response and passes the frozen v2 runtime and
  byte ceilings;
- repository lookup/replay remains before intent verification; an unseen
  invalid token becomes `403 invalid_submission_intent` before reservation,
  mixed validation or Stub Sink delivery;
- issuer/verifier and secret-bearing paths remain server-only.

## Decision

A2 is `PASS_FOR_NEXT_CHECKPOINT`. Release only A3 visible form, one intent
request, one intake request and customer-safe response presentation. A4 Basket
compare-and-clear/retry behavior, A5 full/visual/docs, independent review,
acceptance, Git delivery and deployment remain blocked.
