# TASK-023 Design

## 1. Vertical slice

```text
Feishu model relation authority (not implemented here)
  -> WordPress relationships.products read-only mirror
  -> RelatedProductCardCollection 1.0.0
  -> Next server-only Transport / Validator / Adapter
  -> public related-card view model
  -> You May Also Need progressive UI
  -> View Product OR Quote Basket 2.0 Add to Quote
```

## 2. CMS contract

Create an independent additive contract rather than widening the frozen ProductCard collection query.

### Request

`GET /gdhe/v1/related-product-cards`

Closed query keys:

- `locale=en`
- `schema=1.0.0`
- `source_path=/products/fgd-x15-pvc/` (generic public-path validation; fixture proves the current path)

No pagination is exposed. A validated source may have at most 20 public relations, matching the public Schema 3 relation limit. The response returns the complete eligible set so UI expansion has no additional request.

### Response

Closed root:

- `apiVersion: "1"`
- `schemaVersion: "1.0.0"`
- `locale: "en"`
- `type: "related_product_card"`
- `sourcePath`
- `items`

Each item is a closed wrapper:

- `card`: exact ProductCard 1.0.0 object;
- `directQuote`: `null` for `view_product`, otherwise `{ kind: "catalog_accessory", quantityUnit }` for an active `catalog_accessory` whose source mirror explicitly permits direct quote.

The wrapper does not alter ProductCard action bytes. Frontend presentation maps `direct_rfq` plus valid `directQuote` to customer label `Add to Quote`.

### Source and eligibility

- Resolve `source_path` uniquely to one published Schema 3 Product.
- Read `relationships.products` in stored order.
- Reject a malformed/non-array or over-20 source relationship set as a normalized no-store error.
- Skip self target, duplicate target after first occurrence, unpublished/ineligible target, invalid ProductCard, invalid protected media, or invalid direct-quote source.
- For active `catalog_accessory`, absence or invalidity of explicit public quantity unit makes that target ineligible. Do not guess.
- Detail products must retain `view_product` and a unique canonical path.
- ETag and anonymous conditional 304 follow current GDHE response helpers; errors are normalized and `no-store`.

### Fixture

Use an isolated TASK-023 fixture with one source plus at least six ordered targets:

- three visible initial valid cards;
- at least one additional valid card to prove Show More;
- one valid detail product and one valid simple catalog accessory;
- self, duplicate, unpublished, ineligible, malformed media and missing-unit negatives.

All are TEST_CANDIDATE and cleaned exactly. They do not write real Feishu or production product data.

## 3. Frontend contract and server boundary

- Copy the exact RelatedProductCard closure and samples into a new authority-bound local snapshot/verifier.
- Add a fixed server-only Transport to the new route, closed primitive query, timeout/abort/error/304 semantics consistent with existing consumers.
- Runtime Validator uses the exact static closure and semantic gates; Adapter deep-freezes a server DTO.
- Product detail loader performs existing detail/configuration work plus exactly one related collection call in CMS mode. Related failure degrades only the recommendation module; it never removes the product detail/configurator.
- Before React Client data, project a public view that removes ProductCard UUIDs, taxonomy UUIDs, modified timestamps, raw actions and source diagnostics.
- Remote WordPress media is rejected before React until the production media origin is approved. Preview uses local protected TEST_CANDIDATE assets.

## 4. Quote Basket 2.0

Add a new closed public Basket schema and keep all 1.0 authority bytes untouched.

### Line union

- `configured_product`: current TASK-022 product, selection, packaging, unit and quantity plus `lineKind`.
- `catalog_accessory`: `lineKind`, public product descriptor, `catalogPath`, public quantity unit and positive safe-integer quantity. It has no selection or packaging properties.

### Migration and storage

- Browser reader accepts canonical v2 or canonical v1.
- A valid v1 document migrates every item to `configured_product`, preserves visible facts/entry timestamps and writes canonical v2 only on the next valid mutation.
- Invalid/ambiguous data fails closed as today. TTL remains exactly 30 days and storage ceiling/cross-tab last-writer-wins semantics remain.
- Identity includes `lineKind`. Catalog accessories merge only when their complete public product/catalog identity and quantity unit match.
- Existing configured product behavior and v1 regression fixtures remain green.

## 5. UI

`RelatedProducts` receives only the public view and starts with `visibleCount = min(3, items.length)` unless a valid session-scoped public UI-state snapshot restores a previously expanded count for the same source page.

- `Show More Products` sets `visibleCount = min(visibleCount + 3, items.length)`.
- The control is a real button with stable accessible name, visible focus and an `aria-live=polite` addition announcement.
- Newly displayed content follows the button in DOM order; focus stays on the button unless the button disappears, in which case focus moves to the first newly revealed card heading/action through a bounded explicit rule.
- Cards use one semantic list/article skeleton with equal media, information and bottom action regions. Images keep intrinsic dimensions and protected-media policy; `View Product` and `Add to Quote` have the same visual geometry and alignment.
- Simple accessory cards contain no quantity field. `Add to Quote` creates a valid catalog-accessory draft with quantity `1`; successful repeat activation follows the existing deterministic Basket merge rule.
- Recommendation expansion state is session-scoped public UI state only. A normal canonical `View Product` navigation does not add SEO query parameters; browser Back restores the source section expansion and scroll location. The state contains no product UUID, Article Number, CMS/Feishu identity or raw payload.
- Successful add stays on the page, announces the result and provides `View Quote Basket`; no automatic navigation.

## 6. Failure states

- 0 eligible: render nothing for the entire section.
- related unavailable/invalid: render nothing and no diagnostic to the browser.
- invalid media/action/direct quote: omit only that target; no external image/preload/link.
- Basket error: preserve prior basket and show one sanitized inline status.
- Production local slice: final 404 and zero CMS requests, unchanged.

## 7. Documentation and deferred work

Update root/frontend README, CMS REST/content-model/operations docs, frontend contract docs, architecture contract and ADR-006 with the implemented behavior. Do not claim Feishu sync, real relation publication, final RFQ submission or deployment.
