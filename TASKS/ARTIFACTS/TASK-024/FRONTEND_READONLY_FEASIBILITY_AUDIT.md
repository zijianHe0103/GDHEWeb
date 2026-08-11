# TASK-024 Frontend Read-only Feasibility Audit

status: BLOCKED_FOR_IMPLEMENTATION
lane: frontend
audit_date: 2026-08-11
scope: current shared bytes; no product, contract, dependency, runtime, route, CMS, database, Feishu or external-system mutation
request: `MSG-TASK-024-FRONTEND-READONLY-FEASIBILITY-AUDIT`

## 1. Executive result

The frozen Next.js-only RFQ direction is technically feasible on the current App Router foundation, and the current Quote Basket `2.0.0` already provides a useful public, closed, browser-local input document. It does not contain Article Number, stable Product/Media UUID, WordPress/SCF/Feishu identity, price or credentials.

Implementation must not start from the current bytes, however. Two contract conflicts must first be resolved by Planner-owned authority work:

1. **Production media conflict:** the exact frozen Basket Schema accepts only `/test-candidates/...` image paths. An exact production Basket cannot carry a production protected-media path without changing or versioning the Basket contract.
2. **Request-size budget conflict:** a Basket may itself occupy up to `262144` UTF-8 bytes, while TASK-024 applies the same `262144`-byte ceiling to the complete `PublicRfqSubmissionDraft` containing the Basket plus customer, privacy, intent and anti-abuse fields. No envelope reserve or stricter Basket-at-submit budget is frozen, so not every legal current Basket can be embedded in a legal request.

Apart from those conflicts, the remaining missing pieces are correctly future work: a mixed-line batch authority, a same-origin Route Handler, closed RFQ validators, an intent issuer, canonical digest, durable idempotency/recovery store, challenge integration, public form/receipt states, exact-snapshot clearing and deployment configuration.

Classification summary:

| Classification | Count | Meaning |
|---|---:|---|
| `DIRECTLY_USABLE` | 8 | Current behavior or convention can be consumed without changing its semantics. |
| `FOLLOW_UP_REQUIRED` | 14 | New task and implementation evidence are required before the RFQ path exists. |
| `DEPLOYMENT_GATE` | 7 | Production topology, origin, keys, provider or operational proof is required. |
| `CONTRACT_CONFLICT` | 2 | Frozen/current contracts cannot simultaneously satisfy the intended production request and require an authority decision before implementation. |

## 2. Evidence basis

### Frozen authority

- `TASKS/ACTIVE/TASK-024-rfq-submission-contract.md`
- `TASKS/ARTIFACTS/TASK-024/REQUIREMENTS.md`
- `TASKS/ARTIFACTS/TASK-024/RFQ_SUBMISSION_CONTRACT.md`
- `TASKS/ARTIFACTS/TASK-024/CUSTOMER_CONTACT_FIELD_MATRIX.md`
- `TASKS/ARTIFACTS/TASK-024/SERVER_SECURITY_BOUNDARY.md`
- `TASKS/ARTIFACTS/TASK-024/FAILURE_AND_IDEMPOTENCY_MATRIX.md`
- `TASKS/ARTIFACTS/TASK-024/IMPLEMENTATION_SEQUENCE.md`
- `TASKS/ARTIFACTS/TASK-024/DECISION_LOG.md`
- `TASKS/ARTIFACTS/TASK-024/PLANNER_CONTRACT_VALIDATION.md`
- `docs/architecture/headless-wordpress-nextjs-contract.md` sections 11 and 14
- `MEMORY/DECISIONS/ADR-006-product-first-roadmap-and-multilingual-maturity-gate.md` decisions 41–47

### Current frontend bytes

- Quote Basket Schema/type/domain/storage/browser/UI: `frontend/src/lib/quote-basket-contract/v2/schemas/quote-basket.v2.schema.json`, `frontend/src/types/quote-basket-v2.ts`, `frontend/src/lib/quote-basket/v2/index.ts`, `frontend/src/lib/quote-basket/browser.ts`, `frontend/src/lib/quote-basket/storage.ts`, `frontend/src/lib/quote-basket/use-quote-basket.ts`, `frontend/src/components/quote-basket/index.tsx`
- QuoteLine `2.0.0`: `frontend/src/lib/quote-contract/v2/schemas/quote-line.v2.schema.json`, `frontend/src/lib/quote-contract/v2/index.ts`, `frontend/src/lib/product-configuration/v2/build-quote-line.ts`
- Product Configuration v2 server boundary: `frontend/src/lib/cms/server/product-configurations-v2/**`, `frontend/src/lib/cms/server/product-configurations/transport.ts`, `frontend/src/lib/product-configuration/v2/public-configurator.ts`
- Route and production boundary: `frontend/src/app/request-a-quote/page.tsx`, `frontend/src/lib/product-detail/config.ts`, `frontend/tests/quote-basket-route.test.ts`, `frontend/tests/quote-basket-production-smoke.mjs`, `frontend/tests/product-configurator-preview-response.test.ts`
- Toolchain and documented boundary: `frontend/package.json`, `frontend/README.md`

Protected current hashes observed during the audit:

| File | SHA-256 |
|---|---|
| Quote Basket v2 Schema | `0fb78fa7f12d479b02a8a347305cf0928dd0987ded4158da7051414a15f07eb3` |
| QuoteLine v2 Schema | `7b65f339cf3c2a543d28efa2fac40a72497e76fd2400eb41db78d829a910ac20` |
| QuoteLine v2 builder | `b585886cd93701209997b3114cd1773b7375af7061d13361779770d69a389104` |
| `/request-a-quote/` page | `3237ac873eda1eee33c65200abf5ce6ff11266d9a982b8b5ed2c4895ab5cec2a` |
| Quote Basket production smoke | `a34a84236cb0f63a7dd50dfc0e6b887088335d1163aadc8a19442df440ab19c3` |
| `frontend/package.json` | `958e8c8937ef092c75295e8a09de6062059df431e3419a70b5b661706ac02bce` |
| `frontend/package-lock.json` | `dda25a9069e1c1b41c4f94393a54d3e9eb3dcfea158fc2b6bbdf06cc1cb852a7` |

## 3. Question 1 — Can the current public Basket form a PublicRfqSubmissionDraft without internal identity leakage?

### Directly usable

| Result | Classification | Evidence and boundary |
|---|---|---|
| The Basket is a closed `configured_product | catalog_accessory` union. | `DIRECTLY_USABLE` | Schema objects use `additionalProperties: false`; the type preserves the two explicit line kinds. |
| The Basket contains public presentation/configuration data, browser-generated `entryId/writerId/mutationId`, timestamps and quantity. | `DIRECTLY_USABLE` | These UUIDs are public Basket bookkeeping identities, not stable Product/Media or downstream identities. No Article Number, Product UUID, WordPress ID or Feishu ID exists in the document. |
| The Basket clone/validation boundary is fail-closed and returns a deep-frozen snapshot. | `DIRECTLY_USABLE` | `cloneAndValidateQuoteBasketV2` reads exact own data properties, rejects unknown/symbol/accessor shapes through its record/array helpers, validates exact 30-day TTL and deep-freezes the result. |
| Canonical v1 browser data can reach a v2 submission candidate without exposing internal identity. | `DIRECTLY_USABLE` | `loadQuoteBasketV2` migrates v1 to `configured_product` in memory; a later valid mutation persists v2. |
| The public quantity is a positive safe integer. | `DIRECTLY_USABLE` | Both Schema and domain enforce `1..9007199254740991`. |

### Required follow-up

| Result | Classification | Exact gap |
|---|---|---|
| A submission-level validator must enforce `1..50` lines. | `FOLLOW_UP_REQUIRED` | The Basket Schema has no `minItems` or `maxItems`; empty and more-than-50 local Baskets are legal. This is compatible with a stricter RFQ envelope but is not implemented. |
| Submitted `quantityUnit`, names, images and option labels remain untrusted. | `FOLLOW_UP_REQUIRED` | Basket strings are bounded but not authoritative enums. The server batch resolver must confirm current role/unit/options and must not copy these values into the authoritative document without re-resolution. |
| The public RFQ envelope, customer object, privacy record and anti-abuse envelope have no frontend runtime types/Schemas/validators. | `FOLLOW_UP_REQUIRED` | The documents exist only as TASK-024 design artifacts. |

### Contract conflicts

| Result | Classification | Why it blocks implementation |
|---|---|---|
| Basket media is test-only. | `CONTRACT_CONFLICT` | `image.url` is restricted to `^/test-candidates/...$` for both line kinds. TASK-024 says the exact Basket `2.0.0` is the request body member, while a production catalog must not use TEST_CANDIDATE identity. Planner must either version the Basket contract or freeze an approved production-safe public media representation before implementation. |
| Complete request size has no envelope reserve. | `CONTRACT_CONFLICT` | Basket serialization already permits up to `262144` UTF-8 bytes, while TASK-024 caps the entire request at the same value. Customer fields, privacy record, intent, idempotency key and anti-abuse bytes necessarily add size. Freeze either a smaller Basket-at-submit ceiling, a total-size budget that guarantees the supported maximum customer envelope, or another explicit compatibility rule. The server must still enforce the final raw request ceiling before parsing. |

Verdict for question 1: **structurally yes for ordinary current test-candidate Baskets; no as an exact all-valid-input production contract until both conflicts are resolved.**

## 4. Question 2 — Can current Next.js/server-only conventions support the intake boundary?

| Capability | Classification | Audit result |
|---|---|---|
| Same-origin App Router Route Handler | `DIRECTLY_USABLE` | Next.js `16.2.11` App Router is already the project runtime and supports Route Handlers. No RFQ Route Handler currently exists. |
| Server-only module isolation | `DIRECTLY_USABLE` | CMS configuration entry/load/validation/adapter/transport modules import `server-only`; copied-project negative builds already exercise public and deep Client Component imports. Reuse this convention for every secret, intent, digest, durable-state and authority module. |
| Sanitized boundary style | `DIRECTLY_USABLE` | Current CMS loaders validate opaque `unknown`, keep validated bodies behind wrappers and remove normalized error bodies before rethrow. This is a pattern only, not an RFQ implementation. |
| Pre-parse `262144`-byte ceiling | `FOLLOW_UP_REQUIRED` | Implement a Route Handler reader that rejects declared or streamed overflow before `JSON.parse`, reads once, and does not use `request.json()` first. Content-Type/UTF-8/method/Origin gates must precede business validation. |
| Closed customer fields and contact-combination rules | `FOLLOW_UP_REQUIRED` | Add exact runtime Schema/validator and normalization: code-point counts, NFC, whitespace, LF line endings, email-domain normalization and non-fetching HTTP(S) website parsing. Do not reuse `.length`-only Basket text checks for Unicode code-point limits. |
| Submission intent | `FOLLOW_UP_REQUIRED` | No issuer, verifier, 30-minute first-use state or same-origin binding exists. It must be server-issued and bound to key/context without exposing secrets. |
| Canonical payload digest | `FOLLOW_UP_REQUIRED` | No fixed-order full-envelope canonicalizer or versioned HMAC key boundary exists. `JSON.stringify` of the Basket/storage representation is not the TASK-024 canonical business-payload digest. |
| Durable idempotency interface and state machine | `FOLLOW_UP_REQUIRED` | No persistent reservation, same-key digest comparison, monotonic state, crash recovery, replay receipt or indeterminate-delivery implementation exists. Browser storage and process memory are forbidden substitutes. |
| `PublicRfqReceipt` and public error boundary | `FOLLOW_UP_REQUIRED` | No receipt/error Schema, runtime validator, stable message/code mapping, `Idempotency-Replayed` behavior or status matrix implementation exists. Raw CMS/Feishu errors must never be reused as public responses. |
| Production Origin and proxy attribution | `DEPLOYMENT_GATE` | Freeze the exact HTTPS public origin and trusted-proxy/source metadata. Never infer trust from arbitrary forwarded headers. |
| Digest/fingerprint/intent keys | `DEPLOYMENT_GATE` | Select a secret store, key-version rotation and retention overlap for 30-day idempotency and 48-hour fingerprints. |
| Durable state topology | `DEPLOYMENT_GATE` | Select a Next.js-compatible persistent store with atomic compare/reserve/transition semantics, multi-instance coordination, backup/restore and retention cleanup. |
| Adaptive challenge | `DEPLOYMENT_GATE` | Select the provider and close privacy, CSP, accessibility, secret and failure-mode evidence. The contract's policy is frozen; the provider is not. |

Verdict for question 2: **feasible, but only the framework and isolation conventions are reusable; all RFQ-specific capabilities remain future implementation/deployment gates.**

## 5. Question 3 — Direct reuse versus forbidden reuse

| Current code or behavior | Decision | Reason |
|---|---|---|
| `QuoteBasketDocumentV2` exact public union | `DIRECTLY_USABLE` | Embed only after resolving the two contract conflicts and applying submission-level 1–50/expiry validation. |
| `cloneAndValidateQuoteBasketV2` | `DIRECTLY_USABLE` | Suitable as one inner public-Basket validation primitive after the network JSON boundary; it must not replace the closed RFQ envelope validator. |
| Browser Basket snapshot/revision fields | `DIRECTLY_USABLE` | Useful to identify the exact submitted local snapshot and detect later browser mutations. |
| Browser `localStorage`, `createBrowserQuoteBasketAdapter`, React hook | **FORBIDDEN for server state** | They are client-local UX state only and cannot provide durable idempotency, source limits, delivery state, recovery or multi-instance atomicity. |
| `serializeQuoteBasketV2` | **FORBIDDEN as RFQ digest canonicalizer** | It serializes only the Basket and depends on its current object construction order; TASK-024 requires normalized customer/privacy/Basket bytes in an explicit fixed contract order and excludes transport evidence. |
| Product Configuration v2 transport/load | **FORBIDDEN as a 50-line resolver loop** | The URL is fixed to `/products/fgd-x15-pvc/`, makes one product request and has a 5000 ms timeout. Fifty calls violate the frozen bounded-batch and 15-second atomic intake design. |
| Product Configuration v2 Validator/Adapter | `FOLLOW_UP_REQUIRED` as an internal reference | It proves server-only validation and one product's authoritative DTO, but it is FGD X15-specific and cannot resolve mixed configured/accessory lines. Its patterns may inform a new batch consumer; its output is not the batch contract. |
| `buildProductConfigurationV2QuoteLine` | **FORBIDDEN in browser/public draft; conditional server reuse only** | It emits Product UUID and Article Number. The module itself lacks a `server-only` marker and accepts form-value keys, while the Basket stores public labels. A future server-only batch conversion may reuse its validated standard/custom semantics only after exact authoritative matching; it cannot be called directly on untrusted Basket labels. |
| QuoteLine `2.0.0` Schema/type | `FOLLOW_UP_REQUIRED` as configured-line server output | It covers configured FGD track lines with `piece`, including unique Article Number or controlled `sales_follow_up`; it does not cover catalog accessories, `roll`, the full authoritative RFQ line/document or idempotency/delivery state. |
| Existing CMS transport errors/statuses | **FORBIDDEN as public RFQ errors** | Their categories and metadata describe CMS reads, not RFQ intake. Only the sanitize/fail-closed design pattern is reusable. |
| Current `/request-a-quote/` component/page | `FOLLOW_UP_REQUIRED` | Reuse its public row review and quantity/remove UX only in a later UI task. The disabled action, no active fetch and local-only messaging must remain until the form task is authorized. |

## 6. Question 4 — Fifty-line atomic submission without N+1 or browser Article Number

The minimum valid server flow is:

```text
Browser public Basket (1..50, no Article Number)
  -> one same-origin POST
  -> pre-parse/security/closed validation
  -> durable idempotency reservation
  -> one bounded mixed-line authority request or one validated current snapshot
  -> validate all configured_product and catalog_accessory lines
  -> build one AuthoritativeRfqDocument in server memory/durable state
  -> one controlled downstream RFQ delivery
  -> public receipt only
```

Required properties:

- the browser submits canonical public paths and public selections only;
- one server-only batch request accepts all distinct line identities and returns one ordered, identity-bound result for every input line;
- configured lines resolve exact current stable Product identity, role, quantity unit, option identity and unique Article Number or explicit `sales_follow_up`;
- accessory lines resolve exact stable Product identity, role, RFQ eligibility, quantity unit and Article Number/follow-up policy without inferring from relationship order, name, image or category;
- any missing, duplicate, ambiguous, stale, role-mismatched or invalid line rejects the complete RFQ before delivery;
- Article Numbers and Product UUIDs exist only in the server-side authoritative document and controlled downstream connector, never in Client props, HTML, Flight, browser JSON, public receipt, public error or routine logs;
- there is no per-line `/resolve`, Product Configuration request, RelatedProductCard request or Feishu record creation loop exposed as partial success.

Current status: `FOLLOW_UP_REQUIRED`. No mixed-line batch authority exists. The current Product Configuration consumer handles one fixed configured product, and no current frontend server consumer resolves catalog-accessory RFQ identity. This is correctly Step 1 in `IMPLEMENTATION_SEQUENCE.md` and must precede the intake implementation.

## 7. Question 5 — Exact missing boundaries

| Missing boundary | Classification | Required closure evidence |
|---|---|---|
| Mixed 1–50 line authoritative CMS contract | `FOLLOW_UP_REQUIRED` | One bounded request/snapshot; configured/accessory coverage; conflict/stale/disabled/ambiguous failures; no N+1; exact ordered atomic result. |
| Durable idempotency/recovery store | `FOLLOW_UP_REQUIRED` + `DEPLOYMENT_GATE` | Atomic reserve/compare/transition, restart recovery, concurrent same/different digest, 30-day cleanup, indeterminate reconciliation and multi-instance proof. |
| Submission intent issuer/verifier | `FOLLOW_UP_REQUIRED` | 30-minute first-use semantics, key/context binding, replay behavior, minimum-fill time and same-origin isolation. |
| Adaptive challenge implementation | `FOLLOW_UP_REQUIRED` + `DEPLOYMENT_GATE` | Provider selection plus risk/attempt thresholds, replay/expiry, privacy/CSP/accessibility and unavailable-provider behavior. |
| Public contact form | `FOLLOW_UP_REQUIRED` | Exact confirmed field order, closed field validation, accessible field errors, privacy notice/version, no consent fiction, no file upload and no price/order/payment language. |
| Exact Basket snapshot clearing | `FOLLOW_UP_REQUIRED` | Capture a validated immutable submitted snapshot identity/digest; after a validated `accepted` receipt, clear only if current storage still equals that snapshot. A newer same-origin tab mutation must survive. Current adapter exposes per-line remove only and no compare-and-clear operation. |
| Public receipt/error/status semantics | `FOLLOW_UP_REQUIRED` | Closed success/error validators; 201/200/202/400/403/409/413/415/422/429/503 mapping; stable field codes; bounded request reference; `Retry-After`; no raw input/diagnostic/internal identity. |
| Production route exposure | `DEPLOYMENT_GATE` | Current page remains `noindex,nofollow` and production 404. Production smoke proves preview/cms final 404, zero CMS requests and zero submission endpoints. Public exposure requires explicit HTTPS Staging, Origin, security, privacy, durable store, connector/reconciliation and operational acceptance. |
| Logging/retention operations | `DEPLOYMENT_GATE` | Sanitized event schema, forbidden-field leakage tests, 30/90-day and 48-hour/13-month stores/jobs, monitoring and deletion/rotation evidence. |
| Feishu connector and mapping | `DEPLOYMENT_GATE` | Separate read-only mapping task, isolated connector, stable external RFQ identity, one controlled delivery, timeout/indeterminate reconciliation and no browser secret. |

## 8. Question 6 — Wording compatibility with frozen Basket and QuoteLine behavior

### Confirmed compatible

- **Exact v2 request member versus v1 storage:** no contradiction. A legal v1 Basket is migrated to an in-memory v2 document on read; the public submission task can require v2 without rewriting v1 authority bytes.
- **Empty/unbounded local Basket versus 1–50 RFQ lines:** no contradiction. The local collection layer may be empty or exceed 50; the future submission envelope must reject 0 or 51+ atomically and retain it.
- **Browser has no Article Number versus QuoteLine has Article Number:** no contradiction. The current public configurator deliberately produces `PublicQuoteDraft`, not QuoteLine. QuoteLine is a future server conversion after authority resolution.
- **Custom configuration:** aligned. QuoteLine v2 supports `articleNumber=null` only with `resolution=sales_follow_up`; TASK-024 preserves this as an explicit controlled state, not a guessing fallback.
- **Mixed Basket versus QuoteLine v2 configured-only:** not a contradiction if QuoteLine v2 is treated only as one configured-line conversion primitive. The full `AuthoritativeRfqLine` requires a new mixed-line contract.
- **Current production 404 versus future RFQ:** no contradiction. TASK-024 and architecture section 14 explicitly defer form, Route Handler, durable state, Feishu and deployment to separate tasks.
- **Current browser storage versus durable idempotency:** no contradiction. The frozen design explicitly forbids treating local storage as server durability.

### Contract conflicts requiring Planner action

1. The exact Basket v2 Schema's `/test-candidates/` media rule conflicts with a production RFQ carrying the exact Basket document.
2. The Basket's own 256 KiB ceiling and the complete request's identical 256 KiB ceiling lack a compatible envelope budget.

No other contradiction was found between TASK-024 wording and the current frozen Quote Basket/QuoteLine semantics. Arbitrary public labels/units are untrusted-input latitude, not authority; they must be re-resolved or rejected rather than trusted.

## 9. Minimum next frontend task and entry gates

Do not start the Route Handler or public form yet. The next cross-lane prerequisite is the separately confirmed mixed-line batch authority contract identified as Step 1 in `IMPLEMENTATION_SEQUENCE.md`.

Before a frontend intake implementation task can enter:

1. Planner resolves both `CONTRACT_CONFLICT` items and freezes any required Basket contract/version transition without rewriting historical v1/v2 bytes.
2. WordPress/CMS hands off a checksum-bound mixed-line authority that supports 1–50 configured/accessory inputs in one bounded operation and closes Article Number/follow-up/unit/role/conflict semantics.
3. Planner freezes the RFQ Route Handler path, intent endpoint shape, public receipt/error Schemas and canonical serialization test vectors.
4. A durable store topology and atomic interface are selected for the target Next.js deployment; in-memory and browser storage are explicitly rejected.
5. Production origin/trusted-proxy policy, secret storage/key rotation and challenge provider remain declared deployment gates even if a local stub intake task proceeds.
6. The implementation task preserves current production 404 and disabled final action until its own Local/Preview gates pass; production exposure remains later authorization.

## 10. Audit conclusion

Overall result: **BLOCKED_FOR_IMPLEMENTATION**.

- The public/internal identity split is sound for current ordinary test-candidate Baskets.
- The Next.js 16 App Router and established `server-only` patterns are sufficient for a future same-origin intake.
- No existing code provides the batch authority, RFQ envelope validator, canonical digest, durable idempotency, challenge, receipt/error semantics or exact snapshot clearing.
- Current single-product Product Configuration and QuoteLine code must not be stretched into a 50-line loop or exposed to the browser.
- Resolve the two explicit contract conflicts, then follow the frozen Step 1 → Step 2 → Step 3 sequence. This audit does not authorize implementation, review, Git delivery or deployment.

## 11. Validation record

| Gate | Result |
|---|---|
| Artifact UTF-8 size / line count | PASS — `23923` bytes / `213` lines before this validation appendix |
| Referenced repository paths | PASS — zero missing exact file references; glob/directory references excluded from exact-file check |
| Markdown fence balance | PASS |
| `git diff --check` for artifact/worklog | PASS |
| Protected frontend hash sample | PASS — Basket Schema, QuoteLine Schema/builder, request-a-quote page/smoke, package and lock equal the observed protected hashes in section 2 |
| Product-code scope | PASS — no frontend product/test/package/runtime/route file was changed by this audit; pre-existing `frontend/tsconfig.json` drift was preserved and not touched |
| DPG project validation | PASS — `DPG-LANES-1.0.0` valid |
| DPG message validation | PASS — `{"valid": true}` |
| DPG strict lane audit | PASS — zero issues after Planner ACK moved the linked response to done |

This was a read-only feasibility audit. Product unit/full/build/smoke suites were not rerun because no product or test byte was changed; current smoke contracts were inspected as evidence rather than represented as a fresh runtime execution.
