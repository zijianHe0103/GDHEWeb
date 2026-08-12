# TASK-027 Frontend A5 Dispatch

message_id: MSG-TASK-027-FRONTEND-LOCAL-HTTP-A5
task_id: TASK-027
lane: frontend
checkpoint: A5
prerequisite: A4_PLANNER_CHECKPOINT.md PASS

## Objective

Implement only the local-only POST `/api/rfq/intake/` Route Handler, exact raw transport/config gates and real HTTP evidence around the already validated A1-A4 runtime. Stop for an independent Planner checkpoint. Do not begin A6 documentation consolidation or the complete adversarial review.

## Required reading

1. `TASKS/ARTIFACTS/TASK-027/A0_DESIGN.md` sections 1-5 and 8-9
2. `TASKS/ARTIFACTS/TASK-027/TDD_SEAMS.md` rows 8-9
3. `TASKS/ARTIFACTS/TASK-027/A4_PLANNER_CHECKPOINT.md`
4. current `frontend/src/lib/rfq/server/v2/**`
5. current TASK-025 `validateMixedQuoteLines` server-only consumer and configuration rules
6. the five RFQ v2 public submission/receipt/error Schemas

## Exact production scope

- `frontend/src/lib/rfq/server/v2/config.ts`;
- `frontend/src/app/api/rfq/intake/route.ts`;
- only minimum extensions to existing `frontend/src/lib/rfq/server/v2/{index,errors,intake}.ts` when required to serialize authentic results safely;
- focused `frontend/tests/rfq-intake-v2-*` tests and the frozen `frontend/tests/rfq-intake-production-smoke.mjs`;
- no new dependency, package/lock change or alternative backend service.

## A5.1 Exact configuration gate — strict RED/GREEN

The route is enabled only when every condition is true:

- `NODE_ENV !== production`;
- `GDHE_RFQ_INTAKE_MODE=stub` exactly;
- `GDHE_RFQ_INTAKE_ORIGIN` is one exact `http://127.0.0.1:<explicit-port>` or `http://localhost:<explicit-port>` origin with no credentials, path other than `/`, query or fragment;
- `GDHE_RFQ_HMAC_KEY_VERSION` is one bounded non-empty ASCII key selector;
- `GDHE_RFQ_HMAC_KEY_HEX` is exactly 64 lower-case hexadecimal characters and is decoded only into server-side bytes;
- `GDHE_RFQ_STUB_SINK_OUTCOME` is exactly `accepted | indeterminate | rejected_before_delivery`.

Unset, malformed, disabled, CMS/preview values and production always fail closed before reading request body, accessing Repository, calling TASK-025 or invoking Sink. No secret/config value may enter logs, public errors, HTML/Flight or Client bundles.

## A5.2 Raw transport gates — strict RED/GREEN

For enabled local POST, enforce in this order before business/runtime work:

1. exact request `Origin` equality to the configured loopback origin; never trust `Host`, `Forwarded` or `X-Forwarded-*`;
2. exact `Content-Type: application/json` after ASCII trim/case normalization; reject every parameter and `+json` variant;
3. reject malformed/negative or declared `Content-Length > 262144` before reading;
4. stream and count raw bytes with the same hard ceiling, independent of `Content-Length`;
5. fatal UTF-8 decode with no replacement; parse JSON exactly once;
6. validate the authentic public submission and invoke A4 runtime.

Every enabled-route response is `Cache-Control: no-store`, contains no CORS opt-in and serializes only the validated v2 public receipt/error body. Minimum customer-safe mapping:

- Origin/source reject -> `403 request_not_allowed`;
- exact media reject -> `415 unsupported_media_type`;
- raw limit reject -> `413 payload_too_large`;
- malformed length/body/UTF-8/JSON/contract -> `400 invalid_request`;
- A4 authentic result -> its `200/201/202/409` status and body;
- normalized unexpected local dependency failure -> `503 service_temporarily_unavailable`.

Disabled/production POST returns a final empty `404` or equivalent final fail-closed response with `no-store` and zero business calls. Unsupported methods remain framework fail-closed and do not enter runtime.

## A5.3 Runtime wiring

- Use the delivered TASK-025 `validateMixedQuoteLines` exactly once per new valid intent; real local proof must observe one `/quote-line-validations` POST and zero `/resolve`, Product Configuration, ProductCard or RelatedProductCard calls.
- Use one process-local Repository/Sink instance per route module/process so same-key replay is observable.
- Generate only server-side valid RFQ/public/request references. Browser input may not select clock, ids, key material, Repository, mixed consumer or Sink.
- The local pre-reservation gate may only prove pass/reject/zero-state. Do not claim a production intent issuer, challenge, rate limiter or trusted-proxy policy.

## Required real HTTP proof

Run with Node `24.18.0` and short-lived loopback listeners:

- accepted new `201`, same-key replay `200`, different-digest conflict `409`;
- indeterminate new/replay `202` without resend;
- rejected/mixed/transport validation failures with safe bodies and expected call counts;
- exact Origin/media/declared-size/stream-size/fatal-UTF-8/one-JSON-parse gates;
- local valid intent makes one TASK-025 POST and zero legacy calls;
- unset, disabled and production modes return final fail-closed responses with zero mock WordPress/Repository/Sink calls;
- responses expose no Article Number, customer/contact data, product identity, internal UUID/token/secret/raw body/diagnostic or CORS header.

All short-lived listeners and generated `.next`/`tsconfig.tsbuildinfo` must be recoverably cleaned; restore the production `next-env.d.ts` SHA-256 `7b550dda9686c16f36a17bf9051d5dbf31e98555b30d114ac49fc49a1e712651`.

## Explicitly forbidden in A5

- no customer-visible form, Basket clear/storage mutation or existing page change;
- no CMS/WordPress mutation, real database, Feishu/email/queue/external write;
- no production persistence/durability/reconciliation implementation;
- no dependency/package/lock change, production deployment or secret provisioning;
- no A6 root README/architecture consolidation and no complete adversarial review;
- no Git commit, push, merge or deployment.

## Validation and evidence

Run direct config/Route tests, real HTTP local/production smokes, A1-A4 focused regressions, TASK-025/Quote Basket v3 regressions, all ten verifiers, lint/typecheck, route server-only/public/deep Client build negatives, protected hashes, leakage/residue/listener checks, `git diff --check` and DPG project/messages/strict-lane gates.

Write exactly:

- `TASKS/ARTIFACTS/TASK-027/FRONTEND_A5_EXECUTION_REPORT.md`
- `TASKS/ARTIFACTS/TASK-027/FRONTEND_A5_TDD_RED_EVIDENCE.md`
- `TASKS/ARTIFACTS/TASK-027/FRONTEND_A5_VALIDATION_LOG.md`
- `TASKS/ARTIFACTS/TASK-027/FRONTEND_A5_DIFF_SUMMARY.md`

Update only `LANES/frontend/worklog.md` outside product/test/evidence scope. Return one linked `execution_response`, then stop. A6 and review remain blocked until Planner independently validates A5.
