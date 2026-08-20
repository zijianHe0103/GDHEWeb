# TASK-025 Requirements

status: frozen by Planner A0
public_locale: en

## 1. Business rule

Article Number is a public, non-sensitive orderable-variant identity. It may appear in GDHE REST responses, Next.js HTML/Flight data, client state, browser storage, network requests and developer tools. It is not a credential, authorization token, privacy field or anti-tamper mechanism.

The customer-facing interface must not deliberately render Article Number in visible copy, accessible names, product/configuration summaries, Quote Basket rows or receipts. This is a presentation rule, not a secrecy guarantee; CSS-hidden customer text is not an acceptable implementation.

Every browser-provided Article Number remains untrusted. WordPress must revalidate current uniqueness, publication and quote eligibility, product role, model/configuration membership and server-owned quantity unit before a line becomes authoritative.

## 2. Identity rules

- Article Number is case-sensitive and matches `^GDHEPRD[0-9]{6}$` for this contract generation.
- A standard configured line carries one Article Number.
- A custom-length configured line carries `articleNumber: null` and `resolution: sales_follow_up`.
- A newly added no-detail catalog accessory carries one Article Number.
- A single Article Number must resolve to exactly one current eligible orderable record across configured products and catalog accessories.
- A client-visible selection that maps to zero or more than one current Article Number is never guessed.
- Product model, name, image, category, catalog path and relationship position are not authoritative substitutes for Article Number.

## 3. Public versions

- Existing Product Configuration `2.0.0` remains the configured-product Article Number authority and is consumed without byte changes.
- RelatedProductCard Collection `1.0.0` remains frozen. Additive `2.0.0` adds Article Number only to an eligible catalog accessory `directQuote` projection.
- Quote Basket `1.0.0` and `2.0.0` remain frozen. Additive Quote Basket `3.0.0` carries Article Number and an explicit migration state.
- TASK-024 RFQ `1.0.0` artifacts remain immutable historical contracts. Their opaque-key and Article-Number-exclusion rules are superseded for future implementation only by TASK-025; TASK-025 does not rewrite those bytes.
- MixedQuoteLineValidation Request/Response `1.0.0` is a new independent contract.

## 4. Mixed batch boundary

The server-only consumer sends one anonymous, read-only `POST /wp-json/gdhe/v1/quote-line-validations` request with:

- exact `Content-Type: application/json`;
- `apiVersion: "1"`, `schemaVersion: "1.0.0"`, `locale: "en"`;
- `1..50` configured-product and catalog-accessory lines;
- no more than `163840` raw UTF-8 request bytes;
- exact closed objects with no display media, price, cost, supplier, inventory, WordPress/database/Feishu identity or secret.

The endpoint preserves input order and returns either one complete authoritative result or one normalized error. It never returns usable partial success. It performs no WordPress or Feishu mutation and does not call public `/resolve`, Product Configuration or RelatedProductCard endpoints per line.

## 5. Configured line rules

A configured line uses canonical Product path plus its complete customer selection and packaging:

- standard ready: one submitted Article Number;
- migrated standard: `articleNumber: null` plus `resolution: refresh_from_selection`; the server may return one Article Number only when the canonical product and complete current selection resolve uniquely;
- custom: `articleNumber: null` plus `resolution: sales_follow_up`; current product policy must explicitly allow the submitted one-decimal positive length;
- base packaging is exactly `standard | carton | large_shrink_wrap`;
- Logo printing is boolean;
- protection arrangement is exactly `single_bag | paired | null`;
- quantity unit is `piece` in this generation and quantity is a positive safe integer.

## 6. Catalog accessory rules

A new catalog-accessory line contains Article Number, `piece` and positive safe-integer quantity. Its authoritative product has `publicPath: null`. An old `2.0.0` accessory without Article Number migrates to `requires_readd`; it is preserved for customer recovery but is not sent to batch validation and is never reconstructed from display fields.

## 7. Quote Basket 3.0 migration

- Storage remains same-origin, no-login and 30-day exact TTL.
- The existing storage key remains the single migration entry point; there is no parallel hidden Basket.
- Existing configured custom lines migrate losslessly to `articleNumber:null / sales_follow_up`.
- Existing configured standard lines migrate losslessly to `requires_validation`; one successful batch response may atomically upgrade them with the returned Article Number.
- Existing catalog accessories migrate to `requires_readd` because their prior model/name/catalog relationship is not an authoritative identity.
- New standard and accessory additions must carry Article Number before persistence.
- Basket serialized size remains at most `262144` UTF-8 bytes.
- Article Number participates in merge identity but quantity and entry ID do not.

## 8. Failure and security rules

- `0`, `51+`, duplicate `entryId`, duplicate complete merge identity, unsafe quantity, unknown keys and malformed JSON reject before domain resolution.
- Unknown, duplicate, unpublished, revoked, role-mismatched, unit-mismatched, path-mismatched, selection-stale, packaging-invalid or index/source-inconsistent data reject the whole batch.
- Public errors never echo Article Numbers, raw bodies, rejected values, source metadata, paths on disk or exception text.
- Successful responses may contain Article Number; normalized errors do not.
- POST success and error responses use `Cache-Control: no-store`; no ETag or `304` behavior is introduced.
- The frontend Transport is server-only, fixed to the one endpoint, uses a frozen 5000 ms timeout and zero automatic retries.

## 9. Minimum representative evidence

- FGD X15+PVC standard: `GDHEPRD000172`, `6 m`, `Ivory White`, `piece`.
- FGD X15+PVC custom one-decimal length: `articleNumber:null`, `sales_follow_up`.
- At least one protected TEST_CANDIDATE catalog accessory with a valid test Article Number and `piece`.
- Real route evidence for `1` and `50` lines, mixed configured/accessory order, whole-batch failure, zero public subrequests and deterministic two-lifecycle cleanup.

## 10. Explicit exclusions

No final RFQ intake, contact form, idempotency reservation, HMAC, challenge, durable sink, Basket clearing, Feishu mapping/write, price, payment, order, checkout, deployment or production enablement is authorized.
