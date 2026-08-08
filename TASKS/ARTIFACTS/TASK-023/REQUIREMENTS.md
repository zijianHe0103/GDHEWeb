# TASK-023 Requirements

## Customer outcome

On the local English FGD X15+PVC detail page, customers can discover model-level related products under `You May Also Need`. Three eligible cards are visible first. `Show More Products` reveals the next three without a page navigation or another CMS request. Every recommendation uses one visual card skeleton. Products needing configuration use `View Product`; eligible simple catalog accessories use `Add to Quote` with initial quantity `1`, and customers edit quantity later in the existing 30-day Quote Basket.

## Authoritative business rules

- Feishu is the only authoring authority for model-level product relationships.
- WordPress is a read-only public mirror of a complete successful relationship set; this task does not build the real Feishu sync.
- WordPress relation order is public order. The frontend never infers compatibility, reorders randomly, or derives relationships from width/type/name.
- Unpublished, ineligible, invalid, self-referential and duplicate targets produce no public card. An empty eligible set produces no module.
- Preview fixtures are explicit local TEST_CANDIDATE data and do not establish production compatibility.
- Public media must be protected media. Internal originals never enter the CMS/API/frontend/browser path.

## Presentation and interaction

- Heading: `You May Also Need`.
- Initial visible count: at most 3.
- Each activation of `Show More Products`: reveal at most the next 3, preserving order and existing DOM/card state.
- Button absent for 0–3 items and hidden when all items are visible. No `Show Less`, auto-advance, infinite scroll or horizontal carousel.
- Layout: 3 columns at 1440; safe 1024 behavior; 2 columns at 768; 1 column at 390 and 320 with no horizontal overflow.
- Card content: protected image, name/model and no more than two customer-readable public attributes. No price, stock, delivery, color swatches or Apple commerce copy.
- Every target uses the same media, information and bottom action regions; action type may change the button label but not the card format or height.
- Detail/configurable target: `View Product` to its published canonical path. Browser Back restores the source recommendation expansion and scroll location without changing canonical URLs.
- Active simple catalog accessory: no card-level quantity input. A deliberate `Add to Quote` activation adds initial quantity `1`; no forced bundle and no automatic add.

## Data and network requirements

- Add a separate, closed `RelatedProductCardCollection 1.0.0`; do not change ProductCard 1.0.0 bytes.
- Proposed anonymous read-only route: `GET /wp-json/gdhe/v1/related-product-cards?locale=en&schema=1.0.0&source_path=/products/fgd-x15-pvc/`.
- One relation collection request returns all eligible targets in stable order. The page performs zero per-card `/resolve` requests and the browser never calls WordPress or Feishu.
- A direct-quote accessory receives a closed public quantity-unit projection from source data; the endpoint/frontend may not guess it.
- Internal WordPress IDs, Article Number, internal/public UUIDs in browser-facing Client data, Feishu IDs, raw payloads, supply-chain fields and diagnostics are excluded.

## Quote Basket compatibility

Quote Basket 1.0 only represents configured track lines and cannot truthfully represent a catalog accessory. TASK-023 therefore adds Quote Basket 2.0 as an additive authority:

- `configured_product`: equivalent public facts to the existing v1 line;
- `catalog_accessory`: public product/model/catalog identity, protected display media, public quantity unit and positive integer quantity, with no fabricated length/color/packaging;
- deterministic v1 -> v2 read migration;
- v1 frozen bytes and tests remain valid;
- configured and accessory identities never merge across line kinds;
- direct accessory add creates a valid quantity-1 line; quantity editing and removal remain centralized in Quote Basket;
- no Article Number or internal ID enters browser storage; final server submission remains deferred.

## Local/production boundary

- Local preview can use controlled protected placeholder candidates to prove 0/1/3/4+ and both action modes.
- CMS mode renders only a valid authoritative response and fails closed on invalid media/data.
- Production continues returning 404 for the local product slice until a separate deployment/publication task.
- Final RFQ form/API, abuse controls, NestJS, Feishu write, mail and deployment remain out of scope.

## Acceptance gate

Execution evidence, five-width Visual QA, adversarial PASS, full regressions, document impact resolution and checked Planner final validation are required before user acceptance.
