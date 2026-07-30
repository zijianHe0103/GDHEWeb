# TASK-017 Design

status: `FROZEN_FOR_IMPLEMENTATION`

## 1. Minimum vertical slice

TASK-017 adds one English App Router page at `/products/` and one reusable ProductCard presentation family. It is a local visual slice, not the production catalog.

The page has three request-time states:

| `GDHE_PRODUCT_LIST_MODE` | Non-production behavior | Production behavior |
|---|---|---|
| unset or any other value | 404 through `notFound()` | 404 |
| `preview` | Render the controlled local candidate collection | 404 |
| `cms` | Call TASK-016 `loadProductCardCollection()` once | 404 |

One server-only configuration reader owns this closed mode. No second enable flag or browser query can select a mode.

The page exports `dynamic = "force-dynamic"` and fixed `noindex,nofollow` metadata. It is excluded from public route aggregation; TASK-017 does not add Sitemap or manifest behavior.

## 2. Data flow

```text
preview mode -> local candidate ProductCardCollectionDto ----\
                                                              -> ProductListView -> ProductCard UI
cms mode -> loadProductCardCollection -> validated readonly DTO /
```

- Preview mode is explicitly synthetic UI input and is never described as CMS/API E2E.
- CMS mode is the authentic TASK-016 consumer path: fixed English collection request, one request, zero per-card `/resolve`.
- React receives only `ProductCardCollectionDto` and `ProductCardDto`.
- Preview data live in a server-only module and are impossible to select when `NODE_ENV === "production"`.
- No raw payload, WordPress field, Schema diagnostic, CMS origin or internal business field enters React.

## 3. Controlled preview candidate

The minimum preview collection contains one detail product:

- model: `FGD X15+PVC`;
- English working name: `FGD X15+PVC Track`;
- canonical candidate path: `/products/fgd-x15-pvc/`;
- category: Manual Curtain Tracks under the frozen curtain-track directory;
- visible attributes: `28 × 27 mm` cross-section and `6 m` representative length;
- lifecycle/action: active / `View Product`;
- image: repository test copy of the user-provided 800 × 800 GDHE protected image, preserving branding, dimensions and black background.

The source file SHA-256 observed at design time is:

`9a8ed9fe7145ae582450425be493987ad874d052c176e340d28d7d24bf0d4880`

The repository copy must match that hash. No unwatermarked original is used.

The page shows a visible `Local test candidate — not production catalog` notice in preview mode. CMS mode does not show that preview notice.

## 4. Presentation components

Minimum component boundary:

- `ProductListView`: page heading, optional preview notice, collection summary and state routing.
- `ProductCardGrid`: semantic list/grid wrapper.
- `ProductCard`: article, protected media, model, name, category, summary, attributes, lifecycle badge and action.
- `ProductCardMedia`: one public media implementation using the DTO width, height and alt. TASK-017 may use a native responsive image because production Next Image origin/allowlist is still an explicit later gate; the reason must be documented and the component must remain replaceable without changing card semantics.
- `ProductListEmptyState` and `ProductListUnavailableState`: distinct, safe English states.

No generic design system, global navigation or whole-site card abstraction is created.

## 5. Action rules

The UI renders the DTO action verbatim:

- `view_product`: image, title and action share `action.targetPath`, which equals `publicPath`.
- `direct_rfq`: action points to `/request-a-quote/`.
- `replacement_contact`: action points to `/contact/`.

The UI must not infer action from kind/lifecycle or claim that an RFQ line was added. Missing target pages are honest follow-up gaps.

## 6. Error and empty states

- A valid collection with zero items renders `No products are available in this test view.` and is not a product 404.
- Any Transport, protocol, validation, configuration or unexpected load failure in enabled CMS mode renders `Products are temporarily unavailable.`.
- The unavailable state does not include exception messages, error kinds, origin, URL, response body or diagnostics.
- `304` without a cache already becomes a TASK-016 protocol failure and therefore uses the unavailable state.
- Disabled mode alone maps to the framework 404.

## 7. Styling and responsive behavior

The visual slice uses scoped CSS:

- off-white page canvas, black/charcoal text and GDHE yellow accent;
- one constrained content container;
- large English heading and compact explanatory lead;
- three-column card grid at wide desktop, two columns at intermediate widths and one column on mobile;
- stable square/landscape media region without content jump;
- visible hover and `:focus-visible` states;
- action touch target at least 44 CSS px high;
- long English labels wrap without truncating meaning.

Acceptance uses 1440, 1024, 768 and 390 px screenshots and a separate 320 CSS px overflow/reflow check. Those widths are acceptance viewports, not required CSS breakpoint values.

## 8. Test seams

1. **Configuration seam:** invalid/unset/production modes fail closed; only non-production `preview|cms` enable.
2. **Presentation seam:** 0/1/N collections, four frozen action/lifecycle cells, optional content, alt and safe link targets render from DTOs.
3. **Page orchestration seam:** preview makes zero CMS requests; CMS makes one `/product-cards` request and zero `/resolve`; disabled mode calls `notFound`; errors render unavailable without leakage.
4. **Built-runtime seam:** production build/start cannot expose preview or CMS product candidates even if the environment variable is set.

TDD records one valid RED before the minimum GREEN for each seam. Tests use current React server rendering, Node built-ins and existing Vitest only.

## 9. Explicit deferred gates

- Production media HTTPS origin and Next Image allowlist.
- Real CMS product population and 10–20 final-product validation.
- Category/filter/pagination UI.
- Product details and working target routes.
- RFQ workspace and Feishu submission.
- SeoDocument and public technical SEO.
- Header/Footer, full visual system, cache/Preview/Staging and deployment.
