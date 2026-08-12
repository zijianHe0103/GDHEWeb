# TASK-027 A0 Design

status: PASS_CANDIDATE
product_code_changed: false

## 1. Smallest architecture

```text
same-origin local POST /api/rfq/intake/
  -> local/production mode gate
  -> exact Origin/media/raw-byte/UTF-8/JSON gates
  -> RFQ Submission 2.0 Schema and semantic validation
  -> RFC 8785 business bytes + HMAC/comparison/snapshot tokens
  -> one process-local idempotency lookup
  -> new-intent local pre-reservation gate
  -> one process-local reservation
  -> exactly one TASK-025 mixed-line batch call
  -> fully bound AuthoritativeRfqDocument 2.0
  -> one isolated Stub Sink call
  -> validated public 201/200/202/409/4xx/503 response
```

Production, disabled, Preview and CMS modes do not enter this graph. They return a final fail-closed response before request parsing, repository access, WordPress or Stub Sink calls.

## 2. Exact runtime paths

Frontend owns only these new product paths:

- `frontend/src/lib/rfq-submission-contract/v2/**`
  - exact copy of all `20` TASK-026 JSON artifacts;
  - one closed local `manifest.json`;
  - no runtime or test import from `TASKS/**`.
- `frontend/scripts/verify-rfq-submission-v2-contract.mjs`
  - Node-built-in authority reader and offline verifier;
  - hard-binds the delivered TASK-026 source paths and A0 hashes;
  - rejects symlink, non-regular, non-canonical, missing, extra and changed authority bytes.
- `frontend/src/lib/rfq/server/v2/config.ts`
  - reads the exact local mode and local origin; production is always disabled.
- `frontend/src/lib/rfq/server/v2/errors.ts`
  - stable internal errors and customer-safe mapping only.
- `frontend/src/lib/rfq/server/v2/contract.ts`
  - Ajv Draft 2020-12 registry, authentic wrappers, semantic validation and deep-frozen DTOs.
- `frontend/src/lib/rfq/server/v2/canonical.ts`
  - strict Unicode-scalar check, RFC 8785/JCS serialization and SHA-256/HMAC/token functions.
- `frontend/src/lib/rfq/server/v2/authority.ts`
  - public-to-TASK-025 projection and exact response-to-authoritative binding.
- `frontend/src/lib/rfq/server/v2/stub-repository.ts`
  - process-local injected idempotency state only.
- `frontend/src/lib/rfq/server/v2/stub-sink.ts`
  - isolated deterministic sink result; no customer-document retention.
- `frontend/src/lib/rfq/server/v2/intake.ts`
  - ordered orchestration and replay state machine.
- `frontend/src/lib/rfq/server/v2/index.ts`
  - the sole server-only public entry.
- `frontend/src/app/api/rfq/intake/route.ts`
  - fixed POST Route Handler and raw transport gates.

Test files use the prefix `frontend/tests/rfq-intake-v2-*.test.ts` plus one `frontend/tests/rfq-intake-production-smoke.mjs`. No existing route or customer-visible page is modified.

The implementation may combine a listed internal file only when that makes the result smaller without changing these public seams. It may not add a new dependency.

## 3. Local mode contract

The only enabled configuration is:

```text
NODE_ENV != production
GDHE_RFQ_INTAKE_MODE=stub
GDHE_RFQ_INTAKE_ORIGIN=<one exact configured http loopback origin>
GDHE_RFQ_HMAC_KEY_VERSION=<closed server key selector>
GDHE_RFQ_HMAC_KEY_HEX=<64 lower-case hexadecimal bytes for local test only>
GDHE_RFQ_STUB_SINK_OUTCOME=accepted|indeterminate|rejected_before_delivery
```

`GDHE_RFQ_INTAKE_ORIGIN` must be an exact `http://127.0.0.1:<port>` or `http://localhost:<port>` origin with no credentials, path, query or fragment. The Route Handler compares the request `Origin` to that configured value and never derives trust from `Host`, `Forwarded` or `X-Forwarded-*` request headers.

The key is injected as server-only bytes. The published TASK-026 key is permitted only in test/local evidence and must be labelled non-production. Missing, malformed or production configuration fails closed.

## 4. Transport gates

The Route Handler exposes only POST. Before JSON/business work it performs, in order:

1. local mode and exact configured loopback origin availability;
2. exact request `Origin` equality;
3. exact `Content-Type: application/json` after ASCII trim/case normalization, with parameters rejected;
4. declared `Content-Length` early rejection above `262144` bytes;
5. streamed-body accumulation with the same hard ceiling;
6. fatal UTF-8 decoding, no replacement characters and one `JSON.parse`;
7. runtime validation and orchestration.

All responses use `Cache-Control: no-store`, omit CORS opt-in and contain only a validated v2 receipt or error. Unsupported methods remain Next's fail-closed method response and never reach the runtime.

## 5. Dependency-injection seams

`createRfqIntakeRuntime` receives explicit dependencies:

- `clock.now()`;
- `ids.nextRfqId()`, `ids.nextPublicReference()`, `ids.nextRequestReference()`;
- `keyMaterial` with one version and secret bytes;
- the delivered `validateMixedQuoteLines` function;
- `repository` implementing one bounded lookup/reserve/transition API;
- `preReservationGate` for local intent/honeypot/challenge simulation;
- `sink.deliver(authoritativeDocument)`.

Tests replace only these seams. Production code never exports a helper that can apply a plain, unvalidated TASK-025 response or plain authoritative document. Authentic wrappers are module-private or WeakMap-backed.

The local pre-reservation gate proves pass/reject and zero-state semantics; it is not a real 30-minute intent issuer, source limiter or challenge verifier. Those remain explicit production gates.

## 6. Stub repository state

The repository key is only a SHA-256 fingerprint of the public idempotency key. A record stores the digest, first `createdAt`, exact `expiresAt`, a minimum internal status and the already validated public response needed for replay. It does not store raw idempotency key, complete customer/contact fields, authoritative lines, Article Numbers, secret or raw error.

Rules:

- exact lookup once after closed validation/digest;
- same live key fingerprint plus same digest returns the stored public `200`, `202` or deterministic `409`, with zero mixed calls and zero sink calls;
- same live key fingerprint plus another digest returns `409 idempotency_conflict`, preserving the record;
- unseen/expired state proceeds through the pre-reservation gate;
- pre-reservation rejection creates no record;
- first reservation fixes `createdAt` and `expiresAt = createdAt + 2592000000 ms`;
- indeterminate state is replay-only and never automatically calls the sink again;
- process restart loses all state; this is intentionally not production durability.

## 7. Stub Sink outcomes

The sink receives one authentic, Schema/semantic-valid `AuthoritativeRfqDocument 2.0.0` and returns one closed internal outcome:

- `accepted`: new request returns `201`, replay returns the same receipt as `200`;
- `indeterminate`: new request and replay return the same `202 processing` receipt with fixed retry `30` and never claim acceptance;
- `rejected_before_delivery`: synthetic local deterministic pre-delivery rejection returns and replays one customer-safe `409`; no raw sink diagnostic is present.

The sink records only call count and selected outcome for tests. It does not retain the passed document. This local synthetic mapping is not a Feishu delivery policy.

Mixed-batch product/configuration rejection after reservation also becomes a deterministic `rejected_before_delivery` public `409`, with zero Stub Sink calls. Any partial response is rejected atomically.

## 8. Customer-safe boundary

The public receipt/error is validated before serialization. It never exposes:

- customer/contact fields;
- Article Number, model, path, selection or packaging;
- RFQ internal UUID, idempotency key/fingerprint, digest, comparison token or secret;
- WordPress/Feishu/database identity;
- Stub state, raw exception, stack, request body or downstream response.

Only accepted plus an exact validated Basket snapshot/token may authorize a later UI clear. TASK-027 does not implement that client action.

## 9. HTTP proof and production boundary

The integration harness starts:

1. a loopback mock for the WordPress TASK-025 endpoint returning the frozen valid or error response;
2. a Next server using the local stub mode and exact loopback Origin;
3. real HTTP POST requests covering accepted, replay, conflict, indeterminate and rejected paths.

The harness asserts one mixed POST and zero legacy calls for a new valid intent. It also starts unset, disabled and production configurations and asserts final fail-closed responses plus zero mixed/repository/sink calls.

## 10. Rollback

Rollback deletes only the new TASK-027 frontend files and reverts the narrow README/architecture truth updates. TASK-024/025/026, WordPress/CMS, existing Quote Basket/Product code, package/lock and external systems remain unchanged.
