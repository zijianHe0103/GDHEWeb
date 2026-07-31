# TASK-018 Planner Implementation Checkpoint

status: `PASS_AFTER_NARROW_REVISION`
captured_at: `2026-07-31T02:33:57Z`
closed_at: `2026-07-31T02:44:05Z`

## Reproduced passing evidence

- Product Detail: `4 files / 28 tests` PASS.
- TASK-017 ProductList: `4 files / 29 tests` PASS.
- Full Vitest: `23 files / 301 tests` PASS.
- ProductCard verifier: `8 schemas / 3 success / 6 errors` PASS.
- CMS verifier: `16 schemas / 2 success / 2 errors` PASS.
- ESLint, typecheck and production build PASS.
- Product Detail production preview/cms: final 404 and CMS requests 0.
- ProductList and CMS integration production smokes PASS.
- package, lockfile, existing Transport, Validator, CMS manifest and protected
  image hashes match the frozen baseline.
- protected existing CMS/ProductCard/ProductList paths have zero diff.

## Required narrow closures

### P1-1 — real CMS-to-rendered-markup media proof

Current tests prove these pieces separately:

- the Adapter serialization excludes remote `featuredMedia` and gallery URLs;
- the loader makes one exact `/resolve`;
- preview route markup is clean.

No current test runs one Schema-valid payload containing an HTTPS WordPress
media URL through the real CMS page path and then inspects the resulting React
markup. TASK-018 and the dispatch require browser-facing zero-WordPress proof,
and TASK-017 already established that source-level or separated evidence can
miss React preload/image requests.

Closure:

- add one real CMS-mode route render using the existing Validator and Adapter;
- prove one `/resolve`, zero `product-cards`;
- prove the protected local image is rendered;
- prove the remote origin/URL, `wp-content`, external preload/image, Article
  Number, product code, raw payload and diagnostic are absent.

### P1-2 — direct Product Detail server-only negative

The new config, preview, loader and Adapter contain `import "server-only"`, but
no TASK-018 test proves a Client Component import fails while a marker-stripped
positive control builds.

Closure:

- add a TASK-018-only client-import build negative for the new Product Detail
  server boundary, covering at least the loader and deep Adapter;
- retain a marker-stripped positive control;
- remove every temporary test root.

### P1-3 — CMS local-candidate notice

The Hero notice is conditional on `preview=true`; CMS mode passes
`preview=false`, so the same local-only/noindex test page omits the required
local test-candidate disclosure.

Closure:

- preserve a visible local-candidate/non-production notice in both preview and
  CMS ready markup;
- wording may distinguish preview from CMS but must not imply production
  publication.

## Controlled transition note

The required DPG `task_transition.py reopen` check was run first. It safely
returned `ok: false` because the truthful current state is `IN_PROGRESS`, not
`AWAITING_USER`; no state was mutated. TASK-018 therefore remains
`IN_PROGRESS` for this implementation checkpoint revision.

## Boundary

Only TASK-018 tests, Product Detail presentation notice, direct frontend
documentation/evidence and frontend lane records may change. Do not change the
DTO, Adapter mapping, Transport, Validator, ProductCard/ProductList, CMS,
dependencies, root README, task state, visual QA, review, Git or deployment.

## Narrow revision closure

Planner acknowledged
`MSG-TASK-018-FRONTEND-PLANNER-CHECKPOINT-P1-R1-RESPONSE` and independently
reproduced the current bytes:

- Product Detail: `5 files / 31 tests` PASS.
- ProductList: `4 files / 29 tests` PASS.
- CMS `/resolve`: `7 files / 156 tests` PASS.
- ProductCard: `6 files / 86 tests` PASS.
- Full Vitest: `24 files / 304 tests` PASS.
- CMS verifier: `16 schemas / 2 success / 2 errors` PASS.
- ProductCard verifier: `8 schemas / 3 success / 6 errors` PASS.
- ESLint, typecheck and production build PASS.
- Product Detail, ProductList and CMS integration production smokes PASS.
- Protected package, lockfile, Transport, Validator, CMS manifest and image
  hashes remain byte-identical; protected path diff and temporary test roots
  are empty.

P1-1 is closed by one real Schema-valid hostile CMS payload flowing through
the existing route, Transport, Validator, Adapter and React render. It makes
one `/resolve`, zero ProductCard requests, renders the protected local image
and emits no hostile URL/origin, `wp-content`, external preload/image,
Article Number, Product Code, raw marker or diagnostic.

P1-2 is closed by two Client Component build negatives for the Product Detail
loader and deep Adapter, with two marker-stripped positive controls and zero
temporary-root residue.

P1-3 is closed because both preview and CMS ready markup now contain an
explicit local non-production test-candidate notice.

Implementation checkpoint verdict: `PASS`. This authorizes only the configured
visual QA gate; it is not review, user acceptance, Git delivery or deployment.
