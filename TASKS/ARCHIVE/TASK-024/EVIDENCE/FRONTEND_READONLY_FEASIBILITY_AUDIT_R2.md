# TASK-024 Frontend Read-only Feasibility Re-audit R2

status: FOLLOW_UP_REQUIRED
lane: frontend
audit_date: 2026-08-11
request: `MSG-TASK-024-FRONTEND-READONLY-FEASIBILITY-REAUDIT-R2`
scope: current shared bytes after Planner feasibility contract revision; no product, test, dependency, route, CMS, authority, Git or external-system mutation

## 1. Result

The Planner revision closes both first-round contract conflicts without changing the frozen Quote Basket `2.0.0` bytes:

1. the network request now embeds a derived `PublicRfqBasketSubmission 1.0.0`, not the exact browser storage document;
2. image URL/dimensions/Alt, product name and line creation time are omitted, so `/test-candidates/` media does not enter the submission projection;
3. `163840 + 98304 = 262144` creates a separate canonical Basket-projection budget and fixed envelope reserve under the independent complete raw-body ceiling;
4. configured-product identity is canonical path, while catalog-accessory submission is truthfully blocked until an opaque public quote key, additive Basket/submission transition and bounded mixed-line resolver exist;
5. the authority documents continue to say the RFQ runtime is not implemented, and the current code confirms that claim.

Overall status remains `FOLLOW_UP_REQUIRED`, not `FAIL`: the two R1 conflicts are closed, but production mixed-line submission remains intentionally blocked by the accessory identity/version/batch-authority gates. One narrow wording clarification is also required before claiming that *all* display-only fields are omitted: the RFQ contract still includes `model` and explicitly calls it an “untrusted display hint.”

## 2. Re-audit evidence

### Revised authority

- `TASKS/ARTIFACTS/TASK-024/PLANNER_FEASIBILITY_CONTRACT_REVISION.md`
- `TASKS/ARCHIVE/TASK-024/OUTPUTS/REQUIREMENTS.md`
- `TASKS/ARCHIVE/TASK-024/OUTPUTS/RFQ_SUBMISSION_CONTRACT.md`
- `TASKS/ARCHIVE/TASK-024/OUTPUTS/SERVER_SECURITY_BOUNDARY.md`
- `TASKS/ARCHIVE/TASK-024/OUTPUTS/FAILURE_AND_IDEMPOTENCY_MATRIX.md`
- `TASKS/ARCHIVE/TASK-024/OUTPUTS/IMPLEMENTATION_SEQUENCE.md`
- `TASKS/ARCHIVE/TASK-024/OUTPUTS/PLANNER_CONTRACT_VALIDATION.md`
- `docs/architecture/headless-wordpress-nextjs-contract.md` sections 11 and 14
- `MEMORY/DECISIONS/ADR-006-product-first-roadmap-and-multilingual-maturity-gate.md` decisions 41–47

### Current frontend truth

- Quote Basket `2.0.0`: `frontend/src/lib/quote-basket-contract/v2/schemas/quote-basket.v2.schema.json`, `frontend/src/types/quote-basket-v2.ts`
- current local route/UI: `frontend/src/app/request-a-quote/page.tsx`, `frontend/src/components/quote-basket/index.tsx`, `frontend/src/lib/product-detail/config.ts`
- server-only precedent: `frontend/src/lib/cms/server/product-configurations-v2/index.ts`, `frontend/src/lib/cms/server/product-configurations-v2/load.ts`, `frontend/src/lib/cms/server/product-configurations/transport.ts`
- production boundary: `frontend/tests/quote-basket-production-smoke.mjs`
- toolchain: Next.js `16.2.11`, React `19.2.8`

No `route.ts` exists under `frontend/src/app`. No `PublicRfqBasketSubmission`, `PublicRfqSubmissionDraft`, `PublicRfqReceipt`, submission-intent or `basket_too_large_to_submit` production/test symbol exists under current `frontend/src`, `frontend/tests` or `frontend/README.md`.

## 3. Check 1 — Derived submission projection

**Result: PASS.**

The closed top-level `PublicRfqSubmissionDraft 1.0.0` now declares:

```text
basket: PublicRfqBasketSubmission 1.0.0 derived from a validated QuoteBasketDocument 2.0.0
```

The nested projection preserves source Basket `schemaVersion`, `revision`, public browser `writerId`/`mutationId`, `updatedAt`, `expiresAt`, ordered `1..50` items and public entry/snapshot semantics. It is explicitly neither a third browser storage format nor a byte-for-byte Basket copy.

This closes the original structural error of treating browser persistence bytes as the network contract. Frozen Basket `1.0.0/2.0.0` history remains untouched.

## 4. Check 2 — Media and display-only storage fields

### Media conflict

**Result: PASS.**

The projection explicitly omits:

- image URL;
- image width and height;
- image Alt;
- product name;
- line `createdAt`.

The current source Basket still requires `/test-candidates/...` images, but those fields are outside the derived network projection. The RFQ projection therefore neither requires nor accepts the source image path, and the R1 production-media conflict is closed without changing Basket bytes.

### “All display-only fields” wording

**Result: FOLLOW_UP_REQUIRED — narrow authority clarification.**

`RFQ_SUBMISSION_CONTRACT.md` still says every projected line contains `model` “as an untrusted display hint.” The same contract excludes product name/image/creation time and forbids using model as authority. Therefore:

- no internal identity or media conflict remains;
- model is not a resolution identity and must never be trusted by the batch resolver;
- but the literal statement “all display-only storage fields are excluded” is broader than the actual field list.

Before implementation, Planner should choose one exact wording/shape:

1. retain bounded public `model` as customer-meaning/staleness evidence and describe it as an explicit non-authoritative public hint rather than claiming every display hint is omitted; or
2. remove `model` from `PublicRfqBasketLine` if canonical path/opaque key plus customer choices are sufficient.

This is a documentation/closed-shape gate, not a reason to modify the frozen Basket or reopen the media conflict.

## 5. Check 3 — Projection, raw-body and envelope budget

**Result: PASS.**

The revised limits are consistently present in Requirements, RFQ Contract, Security Boundary, architecture section 11, ADR-006 and Planner validation:

| Boundary | Exact limit |
|---|---:|
| Canonical `PublicRfqBasketSubmission` | `163840` UTF-8 bytes |
| Fixed non-Basket envelope reserve | `98304` bytes |
| Complete raw HTTP request | `262144` bytes |

Arithmetic closure: `163840 + 98304 = 262144`.

Explicit high-variance envelope bounds now include:

- `submissionIntent`: `8192` UTF-8 bytes;
- privacy-notice `version`: `128` Unicode code points;
- `challengeToken`: `16384` UTF-8 bytes;
- all customer fields retain their previously frozen code-point limits.

A conservative read-only upper-bound check used four UTF-8 bytes for each non-URL customer code point and twelve serialized ASCII bytes for each possible four-byte code point in the 2048-code-point Website URL. The bounded variable envelope then totals at most `61880` bytes, leaving `36424` bytes of the fixed reserve for JSON syntax, property names, UUID, timestamps and other fixed fields. The exact serialized request must still pass the independent raw gate; the calculation is evidence that the contract reserve is not merely nominal.

The revised failure matrix also distinguishes:

- projection over `163840` while raw body is otherwise legal: stable `422 / basket_too_large_to_submit`, Basket retained;
- complete raw body over `262144`: `413 / payload_too_large`, rejected before JSON/business parsing.

A locally valid larger Basket remains stored and is reduced or split; it is never truncated. The R1 envelope-budget conflict is closed.

## 6. Check 4 — Configured and accessory identity

### Configured products

**Result: PASS.**

The resolution union fixes configured-product identity as:

```text
kind: canonical_path
value: canonical public product path
```

The path remains untrusted input until one unique current published Product, role, RFQ eligibility, unit and exact option policy are resolved server-side. Model, name, image, category or array position cannot override it.

### Catalog accessories

**Result: FOLLOW_UP_REQUIRED — explicit production blocker.**

The contract correctly refuses to treat current `catalogPath`, model/name, image, category or RelatedProductCard relationship order as accessory identity. It requires:

```text
kind: opaque_public_quote_key
value: bounded public purpose-specific identifier
```

The key must not equal or reversibly encode Article Number, Product UUID, WordPress/database ID or Feishu identity. Current Basket `2.0.0` has no such field. Therefore production accessory submission remains blocked until all of the following are separately accepted:

1. opaque public quote-key authority and lifecycle;
2. additive Basket/submission version transition preserving historical v1/v2 bytes;
3. one bounded server-only `1..50` mixed configured/accessory resolver;
4. atomic publication/eligibility/role/unit/Article Number or explicit `sales_follow_up` validation;
5. whole-request failure and zero per-line `/resolve`, Product Configuration or RelatedProductCard N+1.

The revision does not pretend RelatedProductCard is this authority. That boundary is correct.

## 7. Check 5 — Current frontend and Next.js capability is not overstated

**Result: PASS.**

Current capability statements are accurate:

- Next.js `16.2.11` App Router can support a future same-origin Route Handler.
- Existing CMS modules prove the project convention of `server-only` entry/deep modules, fixed server-owned origin/path configuration, `unknown` JSON bodies, closed validation, sanitized errors, no-store reads, fixed timeout and zero implicit retry.
- These are reusable conventions, not an RFQ runtime.
- No RFQ Route Handler, projection/receipt/error runtime Schema, intent issuer, streaming pre-parse limiter, canonical HMAC digest, durable idempotency store, challenge integration, batch resolver consumer or Feishu connector exists.
- `/request-a-quote/` still displays a disabled final action and states that nothing has been submitted.
- `readProductDetailMode` forces disabled mode in production, and the existing production smoke expects final 404, zero CMS requests and zero submission endpoints.
- Authority documents repeatedly state `implementation_status: not implemented`, preserve production/deployment gates and forbid starting implementation under TASK-024.

No current frontend behavior is represented as supporting live RFQ submission.

## 8. Residual gates

### Contract gates before implementation

1. Clarify or remove the retained public `model` field so “display-only exclusion” and the exact closed line shape say the same thing.
2. Freeze exact machine-readable `PublicRfqBasketSubmission`, `PublicRfqSubmissionDraft`, `PublicRfqReceipt` and public error Schemas, including field-level bounds and canonical serialization test vectors.
3. Freeze the opaque accessory public quote key and additive Basket/submission version transition.
4. Freeze and independently review the one-bounded-request mixed-line CMS authority.

### Runtime follow-up gates

5. Implement the same-origin Route Handler, streamed `262144`-byte pre-parse gate and canonical `163840`-byte projection gate.
6. Implement closed hostile-input-safe validators, intent, canonical digest and public receipt/error validation.
7. Implement durable idempotency/recovery, exact submitted-snapshot clearing and atomic stub delivery before any visible form.
8. Keep Article Number, Product UUID, WordPress/Feishu identity, secrets and diagnostics out of browser request/HTML/Flight/receipt/error/log bytes.

### Deployment gates

9. Select the durable multi-instance store/topology, exact HTTPS public origin/trusted-proxy policy, secret store/key rotation and challenge provider.
10. Complete Feishu mapping/connector/reconciliation, sanitized logging/retention, HTTPS Staging, backup/recovery and production security/privacy acceptance.
11. Preserve production 404 until a separately authorized deployment task closes every production gate.

## 9. Final classification

**FOLLOW_UP_REQUIRED**

- R1 `/test-candidates/` media conflict: **CLOSED**.
- R1 Basket/request envelope-budget conflict: **CLOSED**.
- Derived projection and configured canonical-path identity: **PASS**.
- Catalog-accessory opaque identity/additive version/mixed batch authority: **OPEN, explicitly blocked**.
- Current frontend and Next.js capability wording: **PASS, not overstated**.
- Literal “all display-only fields excluded” claim: **requires narrow clarification because `model` remains an untrusted display hint**.

This result authorizes no implementation, adversarial review, acceptance, Git delivery or deployment.

## 10. Validation record

| Gate | Result |
|---|---|
| Exact repository references | PASS — zero missing file references |
| Markdown fence balance | PASS — six fence markers |
| `git diff --check` for R2 artifact/worklog | PASS |
| Protected frontend hashes | PASS — Basket Schema, QuoteLine Schema, request-a-quote page, production smoke, package and lock match the observed protected values |
| Product/CMS scope | PASS — no task diff under frontend source/tests/package/lock or CMS; only R2 artifact and frontend worklog written |
| DPG project validation | PASS — `DPG-LANES-1.0.0` valid |
| DPG controlled-message validation | PASS |
| DPG strict lane audit | PASS — zero issues before response dispatch |

No product test/build/smoke suite was rerun because this is a read-only contract re-audit and no product or test byte changed. Existing test/smoke source was inspected only to verify that current capability was not overstated.

## 11. R3 model-omission read-only confirmation

**Request:** `MSG-TASK-024-FRONTEND-MODEL-OMISSION-READONLY-CONFIRMATION-R3`
**Result:** **PASS**

The current TASK-024 authority now closes the R2 public-model wording finding:

- `PublicRfqBasketSubmission 1.0.0` excludes product model/name, image URL/dimensions/Alt, line creation time and every other display-only Basket storage field. Its closed line surface is limited to public line identity, customer selections/packaging, submitted quantity unit and positive safe-integer quantity.
- A browser-supplied product model is not part of the submission projection and cannot act as identity, authority or a staleness hint.
- `AuthoritativeRfqDocument 1.0.0` may add `model: current public model` only after the Next.js server has successfully resolved one unique current published product through the closed canonical-path or future opaque-key identity and validated its RFQ eligibility.
- The R1 media conflict remains closed: `/test-candidates/` paths and every image/display-only field stay in the unchanged local Basket storage contract and do not cross the RFQ submission boundary.
- The R1 size conflict remains closed: canonical projection `163840` bytes plus fixed envelope reserve `98304` bytes equals the independent complete raw-body ceiling `262144` bytes; the explicit intent, privacy-version and challenge bounds remain unchanged.
- Frozen Quote Basket `2.0.0`, QuoteLine `2.0.0`, request-a-quote product code, production smoke, package and lock bytes remain at the previously observed protected hashes. No frontend product/test/package or CMS byte was changed by this confirmation.
- Catalog-accessory submission remains truthfully blocked on a dedicated opaque public quote key, an additive Basket/submission version and one bounded server-only `1..50` mixed-line authority. None is represented as current capability.

### Exact residual contract wording

One non-blocking editorial inconsistency remains in `RFQ_SUBMISSION_CONTRACT.md`, section 5, rule 3: it says to ignore “submitted name/image” and use them for staleness or public display. The closed public projection no longer submits either field, so the phrase describes impossible input. The authoritative line shape and all controlling omission statements are unambiguous, so this does not reopen the model/media contract conflict; a future Planner-owned documentation cleanup should remove or rephrase that sentence before executable Schemas are frozen.

No other contract issue was found within this narrow R3 scope. The opaque accessory identity/additive version/batch resolver and RFQ runtime/deployment work remain explicit future entry gates, not residual contradictions or implementation authorization.
