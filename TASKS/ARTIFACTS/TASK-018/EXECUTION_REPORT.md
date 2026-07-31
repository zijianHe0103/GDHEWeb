# TASK-018 Frontend Execution Report

status: `IMPLEMENTATION_COMPLETE_AWAITING_PLANNER_CHECKPOINT`
message: `MSG-TASK-018-FRONTEND-PRODUCT-DETAIL-IMPLEMENTATION`
owner: `frontend`

## Outcome

Implemented the frozen local-only Product Detail vertical slice at
`/products/fgd-x15-pvc/`. The route is disabled by default and in production,
exports fixed `noindex,nofollow`, and exposes only the three authorized
modules: Product Hero, Product Overview and Key Specifications.

## Delivered behavior

- Added the closed server-only `GDHE_PRODUCT_DETAIL_MODE=preview|cms` reader.
- Added a deeply readonly frontend-owned Product Detail DTO and frozen local
  preview DTO using the existing protected 800 × 800 image.
- Added a server-only Adapter that accepts only an authentic
  `ValidatedCmsPayload<"success">` produced by the existing runtime Validator.
- Bound the Adapter to the exact product/template/locale/path/title/model,
  Manual Curtain Tracks category, ceiling and wall installation modes, and the
  five frozen source specifications.
- Combined separately validated width and height only at the Adapter boundary.
- Excluded Article Number, internal product code, CMS media, raw modules,
  relations, wrappers, metadata and diagnostics from the DTO.
- Added one loader with `disabled|ready|not_found|unavailable` states.
- Preview performs zero network access.
- CMS performs one fixed Schema 3 `/resolve` request, zero ProductCard requests
  and zero retries.
- Only a validated `gdhe_not_found` HTTP 404 becomes `not_found`; all other
  failures become a fixed sanitized unavailable state.
- Added DTO-only responsive presentation, semantic five-row `dl`, non-empty
  protected image Alt and a 44 CSS px navigation-only Request a Quote link to
  `/request-a-quote/`.
- Added built-runtime production smoke for both local modes.

## Boundary decisions

- The CMS Adapter always substitutes the approved repository-local protected
  image. `featuredMedia` and gallery URLs never cross into React.
- The overview is explicitly replaceable test copy. No final marketing copy,
  formal SEO, canonical/OG/Schema/Sitemap work or production publication is
  claimed.
- The Request a Quote control is navigation only. It does not collect options,
  quantities or contact data and does not write to Feishu.
- No later product-detail modules, RFQ behavior, visual QA or external-system
  mutation were started.

## Documentation impact

`frontend/README.md` now documents the exact preview and CMS commands,
production hard-disable, one-resolve boundary, sanitized states, protected
media and navigation-only CTA.

Root README is Planner-owned and was not edited. Proposed exact Planner delta:

> A local-only, noindex FGD X15+PVC Product Detail slice is available at
> `/products/fgd-x15-pvc/` through the server-only
> `GDHE_PRODUCT_DETAIL_MODE=preview|cms` gate. Preview uses the protected local
> candidate with zero network access; CMS performs one validated Schema 3
> `/resolve` request. The route is disabled in production and its Request a
> Quote control is navigation only.

## Protected scope

No frontend dependency, package/lock file, existing `/resolve` Transport or URL
builder, runtime Validator, contract Snapshot, ProductCard runtime/snapshot,
ProductList implementation, CMS file, database, Planner state, root README or
external system was modified by the frontend implementation.

## Stop boundary

Implementation and frontend evidence are complete. Planner owns independent
validation and any later visual/review dispatch. No review, acceptance, Git
delivery, deployment or later task has been started.

## Planner checkpoint R1 closure

The frontend lane closed only P1-1 through P1-3 from
`PLANNER_IMPLEMENTATION_CHECKPOINT.md`:

- P1-1: added one real CMS-mode route render through the existing Transport,
  Validator and Adapter. A Schema-valid hostile-media/internal-field payload
  produces one exact `/resolve`, zero ProductCard requests, the protected local
  image and no browser-facing hostile/internal/raw content.
- P1-2: added copied-project Client Component build negatives for the Product
  Detail loader and deep Adapter, with marker-stripped positive controls and
  complete temporary-root cleanup.
- P1-3: both preview and CMS ready markup now display an explicit local
  test-candidate notice. CMS wording states that it is not a production
  product page.

Only the Product Detail notice presentation, TASK-018 tests, frontend README,
TASK-018 execution evidence and frontend worklog changed. DTO/Adapter mapping,
loader, Transport, Validator, ProductCard, ProductList, CMS, dependencies,
root README and Planner state were not changed by this revision.

## Visual Round 1 CSS revision

Closed only the two dispatched visual findings without running visual QA:

- O1: Hero, Overview and Specifications now have a local border-box `100%`
  inline-size contract, preventing global content-box section padding and
  borders from extending the cards beyond narrow viewports.
- O2: Hero now consumes the Product Detail article width instead of inheriting
  the global `42rem` section cap, and its H1 wraps only at normal word
  boundaries so the `X15+PVC` token remains intact.

The production delta is limited to
`frontend/src/components/product-detail/product-detail.module.css`. The direct
CSS contract regression is in `frontend/tests/product-detail-route.test.ts`.
No global CSS, component DOM, DTO, Adapter, loader, Transport, Validator, data,
wording, route, link target, dependency or unrelated product path changed.

The earlier `BLOCKED_NO_VISUAL_EVIDENCE` history and the current independent
visual verdict `FAIL / severe 0 / obvious 2 / detail 0` remain unchanged.
Planner and `visual_qa` own the fresh browser retest.
