# TASK-022 Design

Date: 2026-08-05
Status: FROZEN_FOR_IMPLEMENTATION

## Architecture

```text
server Product Detail DTO
  -> server-owned public Basket product projection
  -> ProductConfigurator Client Component
       -> existing PublicQuoteDraft builder
       -> Quote Basket public conversion
       -> pure Basket mutation
       -> validated browser storage write
       -> local status + View Quote Basket

/request-a-quote/ server gate
  -> local-only Client Basket view
       -> validated browser storage read
       -> Apple-style public rows
       -> quantity/remove mutations
       -> storage-event reconciliation

future submission (not TASK-022)
  -> server re-resolves every untrusted public Basket line
  -> complete QuoteLine
  -> abuse controls
  -> Feishu write
```

No WordPress endpoint or CMS contract changes in TASK-022.

## Contract boundary

Create a new frontend-owned `QuoteBasketDocument 1.0.0`. Do not modify the
frozen `PublicQuoteDraft`, Product Configuration v1/v2 or QuoteLine v1/v2
bytes.

Recommended closed document shape:

```text
QuoteBasketDocument
  schemaVersion: "1.0.0"
  revision: positive safe integer
  writerId: browser-generated UUID
  mutationId: browser-generated UUID
  updatedAt: canonical UTC ISO string
  expiresAt: canonical UTC ISO string
  items: PublicQuoteBasketItem[]

PublicQuoteBasketItem
  entryId: browser-generated UUID
  createdAt: canonical UTC ISO string
  product:
    model, name, publicPath
    image: local protected url, width, height, alt
  selection, packaging, quantityUnit, quantity
```

All objects are closed and deeply immutable after validation. UUIDs above are
technical browser identifiers only; they are not WordPress, Feishu, Product,
Media or Article Number identities.

## Storage adapter

- Fixed key: `gdhe.quote-basket.v1`.
- Fixed TTL: `2_592_000_000` milliseconds (30 days).
- Fixed encoded payload ceiling selected in implementation evidence, no larger
  than 512 KiB. The exact value is exported once and tested.
- Check raw size before `JSON.parse`.
- Parse, validate exact keys/types, canonical dates, URL policy, quantities and
  limits before use.
- Approved image URL policy is local `/test-candidates/` for the current local
  slice. Remote and `wp-content` media fail closed.
- Use dependency-free browser APIs and an injected clock/storage boundary for
  deterministic tests.
- Catch `SecurityError`, quota errors and serialization failures. Public errors
  are stable and sanitized.
- Expired or corrupt stored bytes are removed where possible and surfaced as
  an empty Basket, not partially recovered data.

## Revision and tab reconciliation

Each successful mutation first reads the latest valid persisted document, then
uses `revision + 1`, a tab writer UUID and a mutation UUID. Revision comparison
is lexicographic over revision, updated timestamp, writer ID and mutation ID.
Storage events only adopt a strictly newer valid document. Stale events are
ignored. The design is deterministic last-writer-wins for the latest complete
snapshot; it does not claim distributed transactional merging.

## Pure state operations

Production operations are small and independent:

- `createEmptyQuoteBasket(now, ids)`;
- `addPublicDraft(basket, productProjection, draft, now, ids)`;
- `setQuoteBasketItemQuantity(basket, entryId, quantity, now, ids)`;
- `removeQuoteBasketItem(basket, entryId, now, ids)`;
- `summarizeQuoteBasket(basket)` returning line count only;
- `serializeQuoteBasket` and `parseQuoteBasket`;
- `compareQuoteBasketRevision`.

Duplicate identity comparison uses only the public facts frozen in
REQUIREMENTS. Product image and display-name changes do not split a line; a
successful merge refreshes display fields from the newly added public product
projection while preserving `entryId` and `createdAt`.

## React integration

Avoid a new global state library and avoid changing root layout. A small
`useQuoteBasket` client hook composes the storage adapter and pure operations.
Both the configurator and Basket page use the same hook/adapter. Page
navigation rehydrates from validated storage.

The FGD X15+PVC server page creates a dedicated public Basket product
projection from the already validated Product Detail DTO. It removes Product
and Media IDs before the projection crosses into the Client Component.

On Add to Quote:

1. run the existing PublicQuoteDraft validation/build;
2. if invalid, preserve current field-error behavior and perform no storage
   read/write;
3. if valid, perform one atomic Basket add/merge;
4. announce added/updated or sanitized storage failure;
5. render line count and `View Quote Basket`.

The old `LatestPublicQuoteDraftSummary` is removed from the production path or
retained only as an explicitly historical/test helper if required by frozen
tests. It must not remain as a second source of live state.

## Route and production gate

`/request-a-quote/` reuses the existing local Product Detail mode gate. The
server route calls `notFound()` outside preview/cms and exports noindex metadata.
The Client view renders a hydration-safe loading state before browser storage
is read. Production smoke must prove final 404 and zero CMS/Feishu requests.

## Visual design

Desktop row:

```text
--------------------------------------------------------------
| protected product image | model + product name             |
|                          | compact configuration definition |
|                          | quantity control       Remove    |
--------------------------------------------------------------
```

- white surface, subtle separators and generous whitespace;
- image retains approved square ratio and watermark/background treatment;
- no price column or ecommerce badges;
- parameters use compact `dt/dd` semantics;
- quantity control has an explicit label;
- Remove is a secondary text action with a confirmation announcement;
- 768 and below may stack while preserving the information order;
- focus-visible and reduced-motion follow current GDHE conventions.

## Failure states

- empty: no saved quote items, continue-browsing link;
- invalid configuration: existing field messages, Basket unchanged;
- storage unavailable/full: stable public message, Basket unchanged;
- corrupt/expired storage: clean empty state without raw-data disclosure;
- image policy failure: reject the item before storage/render rather than emit
  a remote request;
- unsupported version: empty state, no guessed migration.

## Documentation

Implementation must update root/frontend README, frontend quote contract,
architecture contract and ADR-006 terminology from “no shopping cart” to
“Quote Basket as a non-payment RFQ collection; no commerce checkout/payment”.
This is a clarification of confirmed business flow, not authorization for final
submission or external integration.
