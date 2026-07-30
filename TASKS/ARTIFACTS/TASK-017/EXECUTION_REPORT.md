# TASK-017 Frontend Execution Report

status: `IMPLEMENTATION_AND_VALIDATION_COMPLETE`
lane: `frontend`
request: `MSG-TASK-017-FRONTEND-VISIBLE-LIST-IMPLEMENTATION`

## Outcome

Implemented the frozen local-only English ProductCard list slice without
changing TASK-014～016 contracts or runtime behavior.

## Implementation

- Added one server-only `GDHE_PRODUCT_LIST_MODE` reader. Exact non-production
  `preview` and `cms` are enabled; every production process and all other
  values are disabled.
- Added dynamic `/products/` metadata with fixed `noindex,nofollow`. Disabled
  mode calls the framework `notFound()`.
- Added a closed server-only page-state loader:
  - preview returns one frozen local `ProductCardCollectionDto` and performs
    zero network requests;
  - CMS calls `loadProductCardCollection({ page: 1, perPage: 12,
    sort: "modified_desc" })` exactly once;
  - valid zero items remain empty, while every enabled load failure becomes
    a detail-free unavailable state.
- Added DTO-only ProductList/ProductCard/Grid/Media/Empty/Unavailable
  presentation. React imports no CMS contract, Transport, Validator or raw
  payload type.
- Rendered the DTO's only action verbatim. Detail-product image, title and
  action share its frozen target; accessory actions use their frozen RFQ or
  contact target without business-rule derivation.
- Added scoped responsive CSS for semantic list/articles, stable square media,
  three/two/one columns, visible `:focus-visible` and a 44 CSS px action
  target.
- Added the exact 800 × 800 protected FGD X15 PNG test copy. SHA-256 is
  `9a8ed9fe7145ae582450425be493987ad874d052c176e340d28d7d24bf0d4880`.
- Corrected the preview primary category to TASK-013's frozen canonical IA:
  `/products/curtain-track-systems/manual-curtain-tracks/`.
- Added a Node-built-in production smoke proving local modes cannot expose the
  route in production and cannot contact the CMS.

## Documentation

`frontend/README.md` now records the exact preview/CMS commands, local-only and
noindex boundary, fixed CMS request, production hard-disable, native protected
media rationale and deferred production/media/detail/RFQ/deployment gates.

Root `README.md` is Planner-owned by the dispatch. The exact required Planner
delta is:

> TASK-017 adds a local-only, noindex English ProductCard list slice at
> `/products/`, enabled only by non-production
> `GDHE_PRODUCT_LIST_MODE=preview|cms`. Preview uses one protected local test
> candidate; CMS mode reuses the server-only one-request/zero-resolve
> ProductCard consumer. Production remains fail-closed, and real products,
> details, RFQ completion, public SEO, visual acceptance and deployment remain
> unimplemented.

## Scope

No dependency, package, lockfile, Next config, global CSS, TASK-014～016
contract/runtime, existing `/resolve` or `/integration/cms`, CMS, database,
external system or Planner-owned state was modified by frontend.

No visual QA, adversarial review, acceptance, Git delivery, deployment,
product-detail or RFQ work was performed.

## Validation

- ProductCard verifier: `8 schemas / 3 success / 6 errors` PASS.
- Existing CMS verifier: `16 schemas / 2 success / 2 errors` PASS.
- Current focused ProductList suite: included in the full suite; all `20/20`
  ProductList Vitest cases PASS.
- Production smoke: PASS — preview/cms final 404, root 200, integration 404,
  CMS requests 0.
- Lint, typecheck and production build: PASS.
- TASK-016 focused: `5 files / 73 tests` PASS.
- Full Vitest: `18 files / 264 tests` PASS.

## Visual Round 1 narrow CSS revision

Source: `MSG-TASK-017-FRONTEND-VISUAL-R1-REVISION`.

Closed only the two canonical visual findings:

- at the existing 64rem breakpoint, `.cardBody` now uses `height: auto`, so
  the two-column card sizes from content instead of retaining the desktop
  calculated body height that clipped the CTA at 1024 CSS px;
- `.mediaLink:focus-visible` now overrides the shared outline offset with
  `-0.2rem`, keeping the existing `0.2rem` indicator fully inside the
  card's clipping boundary.

No breakpoint, component markup, action, DTO, content, data, card radius,
global CSS or runtime behavior changed. Round 1 FAIL evidence remains intact
for visual QA Round 2.

Fresh revision validation:

- focused ProductList: `3 files / 21 tests` PASS;
- TASK-016 focused: `5 files / 73 tests` PASS;
- full Vitest: `18 files / 265 tests` PASS;
- ProductCard verifier `8/3/6` and CMS verifier `16/2/2` PASS;
- lint, typecheck and production build PASS;
- production smoke PASS — preview/cms 404, root 200, integration 404,
  CMS requests 0.

Frontend did not run visual QA. Planner owns the narrow 1024/768/390 and focus
retest dispatch.

## Adversarial Round 1 P1/P2 narrow revision

Source: `MSG-TASK-017-FRONTEND-ADVERSARIAL-P1-R1`.

The deferred production-media decision is now enforced at the TASK-017
server-only page boundary:

- `media-policy.ts` uses a fixed synthetic frontend origin and accepts only
  safe root-relative same-origin paths whose original form begins with exactly
  one `/`;
- absolute, protocol-relative, backslash-confused, credential-bearing and
  malformed values fail closed;
- CMS configuration, a browser origin and a policy override are not read;
- after the authentic collection DTO returns, any unsafe image in a non-empty
  collection produces the existing detail-free unavailable state before
  React;
- no card is partially hidden, replaced, proxied or redirected to a guessed
  origin;
- valid empty CMS remains empty, and preview still uses the exact protected
  repository-local PNG.

The behavior regression passes through the real ProductList page,
TASK-016 Transport, Validator and Adapter. It proves exactly one fixed
collection request, zero `/resolve`, no hostile origin/URL, no external image
preload or `img`, and only the sanitized unavailable markup. The real listener
fixture deliberately retains the frozen Schema-valid absolute media response
and expects the same unavailable outcome.

`frontend/next-env.d.ts` was not manually edited. The final production build
regenerated its production reference to `./.next/types/routes.d.ts`; its diff
against baseline is empty.

`frontend/README.md` now states the authentic CMS request and deterministic
non-empty remote-media unavailable boundary. The exact additional root README
delta for Planner is:

> TASK-017 keeps the local-only, noindex `/products/` slice production
> disabled. Preview uses the protected repository-local candidate. CMS mode
> performs exactly one ProductCard collection request and zero per-card
> `/resolve`, but every Schema-valid non-empty collection with non-authorized
> remote media fails closed to the sanitized unavailable state before React.
> Production media origin/Next Image allowlist, real products, details, RFQ
> completion and deployment remain deferred.

Fresh current-byte revision validation:

- ProductList: `4 files / 29 tests` PASS;
- TASK-016 focused: `5 files / 73 tests` PASS;
- full Vitest: `19 files / 273 tests` PASS;
- ProductCard verifier `8/3/6` and CMS verifier `16/2/2` PASS;
- lint, typecheck and production build PASS;
- production smoke PASS — preview/cms 404, root 200, integration 404,
  CMS requests 0;
- `next-env.d.ts` baseline diff empty.

No protected Validator, Adapter, DTO, Transport, contract, CMS, visual output,
Planner state, dependency, lockfile, Next config, external system, Git or
deployment boundary changed.
