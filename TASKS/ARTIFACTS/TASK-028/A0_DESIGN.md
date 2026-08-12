# TASK-028 A0 Design

status: PASS_CANDIDATE
product_code_changed: false

## 1. Smallest visible flow

```text
/request-a-quote/
  -> load and validate Quote Basket 3.0 from localStorage
  -> render Basket rows
  -> render contract-first customer form only for submit-ready lines
  -> local validation and accessible error summary
  -> POST /api/rfq/intent/ for exact source Basket snapshot
  -> build PublicRfqSubmissionDraft 2.0 in browser memory
  -> exactly one POST /api/rfq/intake/
  -> existing server-only validation, mixed-line authority and Stub Sink
  -> closed customer-safe receipt/error
  -> accepted plus exact snapshot/token match: clear Basket
  -> otherwise retain Basket and show a recovery state
```

The intent request is not the business intake. The "one POST" invariant applies to `/api/rfq/intake/` for one new intent.

## 2. Exact new seams

- `frontend/src/lib/rfq/customer/**`: client-safe customer normalization, exact field authority and sanitized field errors.
- `frontend/src/lib/rfq/submission/**`: Quote Basket 3.0 public projection, intent DTO, closed public receipt/error parser and submit orchestration. It contains no secret or authority code.
- `frontend/src/lib/rfq/server/v2/intent.ts`: local-only HMAC intent issuer/verifier; imported only through server-only entries.
- `frontend/src/app/api/rfq/intent/route.ts`: local-only exact-Origin JSON issuer route.
- `frontend/src/app/api/rfq/intake/route.ts`: narrow integration of the verifier into the existing pre-reservation gate and exact `invalid_submission_intent` mapping.
- `frontend/src/components/rfq-form/**`: one client form/state machine integrated below the existing Basket rows.
- `frontend/src/lib/quote-basket/browser.ts` and `use-quote-basket.ts`: one exact compare-and-clear operation; no partial deletion.
- tests use `rfq-customer-*`, `rfq-intent-*`, `rfq-form-*`, `rfq-submission-*` and the existing production-smoke conventions.

The lane may combine a single-use internal file when that reduces code without changing the public seams. No dependency is added.

## 3. Customer normalization

The public customer object has exactly these keys when present: `fullName`, `companyName`, `whatsApp`, `weChat`, `businessEmail`, `phone`, `countryRegion`, `city`, `companyWebsite`, `message`.

- Apply JavaScript Unicode whitespace trim at both ends; preserve internal text and case.
- Omit empty optional fields.
- Count Unicode code points, reject lone surrogates and use the exact v2 maxima: 120/160/128/128/254/64/100/100/2048/2000.
- Validate the exact `publicCustomer` Draft 2020-12 subschema with the existing Ajv/format dependency; do not maintain a looser handwritten email rule.
- `companyWebsite` must use `http:` or `https:`, have no credentials and is never fetched.
- Unknown, accessor, symbol, sparse or non-data input fails closed before attacker-controlled coercion.
- Convert validation output only to a closed stable field/code pair. Ajv paths, raw values and diagnostics do not reach the UI.

## 4. Intent material

`POST /api/rfq/intent/` accepts only a closed JSON object containing the exact six-field Basket 3.0 source snapshot. It applies the same local mode, exact configured Origin, media, body, UTF-8 and no-store boundaries as the intake at a smaller bounded body size.

The response is exactly:

```text
contractVersion = 2.0.0
submissionIntent = opaque base64url payload plus HMAC signature
idempotencyKey = lower-case UUIDv4
privacyNotice = { version: rfq-privacy-en-2026-08, presentedAt }
expiresAt = issuedAt + 30 minutes (UI hint only; token remains authority)
```

The signed payload binds version, configured exact Origin, idempotency key, issued time, expiry and the v2 Basket snapshot token. The verifier uses constant-time signature comparison, validates all fields and matches the submitted key/source snapshot. It never logs or serializes key material.

No database is created for intent issuance. An unseen expired or invalid token fails before reservation. Once a reservation exists, the delivered idempotency lookup/replay behavior remains authoritative and does not require the expired intent again.

## 5. Public Basket projection

The browser starts from a newly cloned and validated Quote Basket 3.0 snapshot. Only `ready` rows project:

- standard configured line -> `article_number / standard_ready`;
- custom configured line -> `custom_length / null / sales_follow_up`;
- ready accessory -> Article Number and `piece`.

Display-only model/name/media/catalog path, Basket state/createdAt and all internal IDs are omitted. Article Number may exist in the request bytes but is never deliberately rendered.

The exact source snapshot and ordered item projection must validate as the delivered RFQ Submission 2.0 public Basket. One to fifty lines are allowed; the 163840-byte canonical Basket budget and 262144-byte final raw request ceiling remain unchanged.

## 6. Client state machine

Closed visible states:

- `editing`;
- `invalid_fields`;
- `issuing_intent`;
- `submitting`;
- `accepted_cleared`;
- `accepted_basket_changed`;
- `processing`;
- `basket_refresh_required`;
- `conflict`;
- `rate_or_security`;
- `temporary_unavailable`.

Only one operation can be pending. The active intent/key remains in memory for an exact retry after an uncertain network result; it is replaced only when the Basket snapshot or normalized customer payload changes, the token expires, or the server explicitly reports invalid intent/conflict.

## 7. Exact clear gate

The client retains the immutable submitted source snapshot. A validated receipt clears only when all conditions hold:

1. `status === accepted`;
2. receipt source snapshot equals the submitted snapshot and current stored Basket snapshot across schemaVersion, revision, writerId, mutationId, updatedAt and expiresAt;
3. `submittedBasketToken` equals a browser recomputation of the frozen v2 snapshot-token algorithm;
4. storage still contains that exact Basket immediately before removal.

The adapter removes the storage key atomically at that comparison point and returns an empty UI state. If any check fails, it changes no storage byte.

## 8. Accessibility and layout

- Native labels and required indicators; contact group explains "at least one".
- `autocomplete`: name, organization, country-name, address-level2, email, tel and url as applicable; WeChat stays text without a misleading browser token.
- Field errors use stable IDs and `aria-describedby`; the summary links to fields and receives focus after invalid submit.
- Pending disables mutable form and submit controls; result uses `aria-live` without duplicating announcements.
- Basket remains first, customer form second, result/recovery third. At 768 and below the layout is one column; at 320 CSS px all inputs and actions reflow without horizontal clipping.
- Motion is optional and disabled under `prefers-reduced-motion`.

## 9. Modes and production boundary

- `preview` and `cms` may render the local noindex form only when the existing product-detail mode allows the page and local RFQ stub config is enabled.
- production, unset and disabled retain final 404 for both `/request-a-quote/`, `/api/rfq/intent/` and `/api/rfq/intake/`, with zero Repository, mixed validation or Sink calls.
- The UI states clearly that the local Stub is non-production and loses server state on restart.

## 10. Error mapping

- Field errors remain attached to the customer fields.
- `invalid_submission_intent`, `request_not_allowed`, `challenge_required_or_invalid` -> refresh security material and keep Basket.
- `rate_limited` -> keep Basket and show bounded retry guidance.
- `basket_refresh_required`, `product_unavailable`, `configuration_changed` -> keep Basket and direct the user to refresh/remove the affected configuration.
- `idempotency_conflict` -> keep Basket and require a new explicit submission attempt.
- `processing` -> keep Basket and preserve the public reference.
- malformed, network, 413, 503 or unknown -> keep Basket and show a stable temporary message.

Raw bodies, thrown values, stack traces and private diagnostics are never reflected.

## 11. Documentation and external mapping

Root README, frontend README and architecture contract must describe the local form, exact fields, local-only Stub behavior and absent production/Feishu capabilities. The future Feishu mapping records `来源渠道=官网询盘`, server time and blank customer grade only after a separate integration task; TASK-028 performs zero Feishu writes.

## 12. Rollback

Rollback removes only TASK-028 new modules/tests and reverts the narrow page/Basket/intake/documentation changes. Quote Basket 3.0, TASK-025 mixed validation, TASK-026 contract bytes, TASK-027 runtime core, WordPress/CMS, package/lock and external systems remain unchanged.
