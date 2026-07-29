# TASK-013 CTA and RFQ Contract

status: `FROZEN_BUSINESS_CONTRACT`

## 1. Primary conversion

The site is B2B quotation-request software. It does not sell, take payment or create an online order.

- Normal primary label: `Request a Quote`.
- Discontinued product label: `Contact Us for Replacement`.
- Global RFQ workspace: `/request-a-quote/`.
- General/replacement contact: `/contact/`.
- Prohibited routes/semantics: cart, checkout, buy now, payment and instant order confirmation.

## 2. State matrix

| Public state | Primary action | Target/behavior |
|---|---|---|
| Active, synced, published, complete public options | Request a Quote | Validate chosen real options and quantity, add RFQ line, open `/request-a-quote/` |
| Active, synced, published, incomplete quote specification | Request a Quote | Submit stable product/model plus known choices, quantity and notes; Article Number may remain unresolved |
| Discontinued with confirmed replacement | Contact Us for Replacement | Open `/contact/` with original product context and visible replacement link |
| Discontinued without confirmed replacement | Contact Us for Replacement | Open `/contact/`; do not guess or redirect |
| Draft/private/unpublished | No public CTA | Anonymous page and RFQ are unavailable |
| Related target not public/eligible | No target card or CTA | Hide public relationship, retain source relationship authority |
| Contract-invalid response | No guessed CTA | Controlled error/last-known-good behavior belongs to later runtime work |

Incomplete specification is not a reason to remove RFQ from an active, synced and published product.

## 3. Product-detail behavior

- Products with canonical details are detail-first.
- The visitor reviews available information, selects any known public options and supplies quantity.
- If the selected combination maps uniquely to an Article Number, the RFQ line may include it.
- If it does not map uniquely, the RFQ line remains valid without an Article Number.
- Frontend/API must never manufacture a combination or choose an internal row by heuristic.
- Business staff complete unresolved selection and pricing in Feishu.

## 4. Small-accessory behavior

Small accessories intentionally lacking SEO detail pages can be added from the accessory catalog or related-accessory module:

- satisfy any real required public option;
- enter a positive integer quantity;
- add the stable accessory identity and known selection to the RFQ list;
- leave Article Number unresolved when the public choice does not uniquely determine it.

Curtain tapes, bead chains, motors/controls and other complex-detail products remain detail-first.

## 5. Quantity

- Quantity is required before adding a line.
- Track uses the customer-facing unit already confirmed for its product context; tape/bead products use roll, and small accessories use piece where applicable.
- Existing confirmed quantity precision remains category-specific. The RFQ payload preserves the user-entered public unit; Feishu performs internal metre and package conversion.
- Conversion, pricing and feasibility are not performed by the website.

## 6. Minimum RFQ line

The future normalized RFQ line must carry:

- stable public product/accessory identity;
- public model;
- public product name;
- selected known option IDs/labels, if any;
- quantity and public unit;
- Article Number when uniquely resolved, otherwise `null`;
- optional customer note;
- source canonical path or accessory collection context.

It must not expose purchase price, supplier, cost, margin, internal sales floor, inventory, customer-specific price or internal review notes.

## 7. Multi-product workspace

- Header `Request a Quote` can open an empty workspace.
- Visitors can add multiple product/accessory lines and continue browsing.
- Contact details are submitted once for the whole request.
- Duplicate-line merge/edit behavior and persistence duration remain implementation details for a later RFQ task.
- Submission to Feishu, idempotency, failure recovery, spam protection, privacy and notifications are not implemented by TASK-013.

## 8. Replacement context

`Contact Us for Replacement` uses `/contact/`. The original stable product identity and public model travel as structured form context, not as an indexable canonical URL and not as an internal Article Number query parameter.
