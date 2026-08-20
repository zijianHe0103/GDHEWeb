# TASK-022 Requirements

Date: 2026-08-05
Status: FROZEN_FOR_IMPLEMENTATION

## 1. Product intent

TASK-022 converts the current one-result `Add to Quote` demonstration into a
browser-local multi-line Quote Basket. The interaction resembles a shopping
basket only as a collection mechanism. It is not commerce:

- no price, currency, discount, tax, freight or inventory promise;
- no checkout, payment, order or order status;
- no final inquiry submission or external write in this task.

The customer flow is:

```text
Configure product
  -> Add to Quote
  -> continue browsing and add more configured products
  -> inspect Quote Basket
  -> future Request a Quote step revalidates and submits all lines
```

## 2. Frozen terminology

| Context | Customer label | Meaning |
| --- | --- | --- |
| Product/configurator action | `Add to Quote` | Add or merge a public configured item into the local Basket |
| Collection | `Quote Basket` | Browser-local list of products intended for one future RFQ |
| Collection link | `View Quote Basket` | Navigate to local `/request-a-quote/` list stage |
| Final future action | `Request a Quote` | Server-side revalidation and one external inquiry submission; deferred |

`Cart`, `Checkout`, `Pay`, `Buy`, `Order` and `Add to Bag` are not customer
labels in this task.

## 3. Public-only data boundary

The Basket may store only customer-readable facts:

- public product model, name and canonical public path;
- approved protected local image URL, width, height and alt;
- standard/custom selection, public length and public color;
- base packaging label, logo-printing boolean and protection label/null;
- quantity unit and positive safe-integer quantity;
- browser-generated entry and mutation identifiers;
- contract version, revision and timestamps.

The Basket must not store or serialize:

- Article Number;
- stable internal Product or Media UUID;
- WordPress post/media/term IDs, SCF names or raw metadata;
- Feishu record IDs, supplier fields, costs, prices, stock or margins;
- server resolution enums, raw CMS payloads, secrets or diagnostics;
- customer name, email, phone, WhatsApp, WeChat, company or files.

The complete QuoteLine remains server-owned future authority. A later Request a
Quote task must treat every Basket line as untrusted input, re-resolve the
eligible option, and then create the resolved Article Number or custom
`sales_follow_up` line.

## 4. Basket identity and mutations

The browser merge identity is the complete public configuration:

1. public product path;
2. selection type (`standard` or `custom`);
3. canonical length in metres;
4. public color code and label;
5. base packaging label;
6. logo-printing boolean;
7. protection label or null;
8. public quantity unit.

Product display name, protected image and quantity are excluded from identity.

- Equal identity: preserve the existing entry ID and add quantities.
- Different identity: create a separate line.
- Standard and custom selections never merge.
- Quantity edit sets one existing line to a new positive safe integer.
- Remove deletes exactly one entry ID.
- Every mutation returns a new deeply immutable Basket and does not mutate its
  inputs.
- Any invalid or overflowing mutation fails atomically and keeps the previous
  Basket unchanged.

Line count is shown as the Basket summary. Quantities across `piece`, `roll`,
and other units must not be combined into one misleading grand total.

## 5. Persistence

- Storage is same-origin browser storage with no login.
- Fixed retention is 30 days from the last successful Basket mutation.
- A read does not extend expiry.
- A successful add, merge, quantity edit or remove updates `updatedAt` and
  `expiresAt`.
- Empty Basket state may remove the storage key instead of persisting an empty
  document.
- Refresh, browser restart and navigation restore a valid unexpired Basket.
- Same-origin tabs adopt a newer valid stored revision through the `storage`
  event; a local mutation first reloads the latest valid stored revision.
- Revision ordering must be deterministic. A stale event must not replace a
  newer in-memory snapshot.
- Invalid, unknown-version, expired or oversized stored bytes are never partly
  restored. They are rejected and the public UI falls back to an empty state.
- Invalid external storage events must not inject markup, raw data or errors
  into the current UI.
- Storage quota or write failure rejects the mutation, preserves the previous
  in-memory Basket, and emits one sanitized customer message.
- A technical serialized-size ceiling must be explicit and tested. It is not a
  commercial line limit. Reaching it must not evict existing entries silently.

## 6. Product-page behavior

- Valid `Add to Quote` writes the draft to the Basket instead of replacing one
  refresh-only summary.
- The customer stays on the product page.
- The UI announces whether a line was added or an existing line quantity was
  updated.
- The UI shows Basket line count and a `View Quote Basket` link.
- Failed validation retains the existing Basket and uses current sanitized
  field errors.
- Storage failure retains the current Basket and uses a sanitized non-field
  error.
- The current protected FGD X15+PVC image and public display name are projected
  into the Basket item without passing internal media/product IDs to the Client
  Component.

## 7. Quote Basket page

- Local route: `/request-a-quote/`.
- It is visible only under the existing local preview/cms product-detail gate.
- It remains `noindex,nofollow` and production returns 404.
- Empty state offers a safe continue-browsing route.
- One or more items render as Apple-inspired rows: protected image left,
  compact product/configuration information right, quantity edit and Remove.
- No price column, Save for Later, delivery, checkout or payment UI.
- Final Request a Quote submission is not implemented. The page must not send a
  network request or claim success.
- Keyboard, focus, live announcements and mobile reflow are required.

## 8. Explicitly deferred

- TASK-023 related-product data and `You May Also Need` carousel;
- customer/contact form and attachments;
- final server endpoint, rate limiting, CAPTCHA/human verification and
  idempotency;
- Feishu, email, Webhook and queue integration;
- account sync, cross-device recovery and deployment.

## 9. Acceptance evidence

Required evidence includes closed contract positive/negative cases, immutable
mutation tests, 30-day expiry, reload and storage-event tests, hostile/corrupt
storage tests, real page integration, zero internal-field leakage, production
404/noindex smokes, full regressions, 1440/1024/768/390/320 visual evidence,
keyboard/focus evidence and an independent adversarial PASS.
