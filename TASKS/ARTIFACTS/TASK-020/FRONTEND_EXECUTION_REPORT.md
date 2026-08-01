# TASK-020 Frontend Execution Report

status: `ROUND_1_P1_REVISION_COMPLETE_PENDING_PLANNER_CHECKPOINT`
date: `2026-08-01`
owner: `frontend`

## Result

TASK-020 A1-A6 is implemented within the authorized frontend slice.

- One fixed server-only Product Configuration Transport uses the frozen URL,
  one anonymous GET, no-store, redirect refusal, 5000 ms timeout and zero retry.
- An exact four-Schema AJV registry validates an isolated snapshot, applies the
  frozen FGD semantic binding and returns an authentic opaque wrapper.
- The Adapter copies only the designed public fields into a deeply frozen DTO.
- Preview uses the frozen success sample with zero network. CMS detail-ready
  orchestration performs one `/resolve`, then one `/product-configurations`,
  and zero ProductCard/per-option requests.
- Configuration failure keeps Product Detail visible and exposes only the
  navigation fallback.
- The client-safe builder returns a frozen resolved/custom QuoteLine or closed
  field errors; both success branches validate against the frozen Schema.
- The visible semantic form owns one latest in-memory line only. It uses no
  storage, submission endpoint, external request or global Basket.
- Ready Hero navigation is `Configure & Add to Quote` ->
  `#configure-product`; unavailable configuration retains `Request a Quote`.

## Failure and leakage boundaries

Raw Transport bodies are validated before adaptation. Normalized HTTP error
bodies are status-checked and discarded at server orchestration. React receives
only Product Detail and Product Configuration DTOs; markup contains no CMS
origin, WordPress media, raw JSON, diagnostics or internal product fields.
Every Product Configuration server module imports `server-only`, and real Next
Client Component builds reject both public and deep imports.

## Deliberately not implemented

No Basket, persistence, edit/delete/merge UI, submission, server revalidation,
contact data, Feishu, CMS mutation, visual QA, review, Git delivery or deployment
was started.

## Documentation impact

`RESOLVED` for frontend-owned documentation:

- `frontend/README.md` describes the two-request CMS sequence, local form,
  fallback and focused commands.
- `docs/frontend/PRODUCT_CONFIGURATION_AND_QUOTE_LINE_CONTRACT.md` distinguishes
  immutable contract bytes from the TASK-020 local consumer.

Root `README.md` is Planner-owned and was not edited. Proposed exact semantic
delta for Planner: add one short pointer stating that the local-only FGD detail
route can consume the frozen Product Configuration contract, create one latest
in-memory QuoteLine, remains disabled in production, and does not create a
Basket or submit externally; link to the frontend README TASK-020 commands.

## Handoff

Return control to Planner for an independent implementation checkpoint. This
report is execution evidence, not review, acceptance or Git delivery.

## Planner checkpoint Round 1 P1 revision

The preserved checkpoint verdict is `FAIL / P0=0 / P1=2 / P2=0`. This narrow
revision changes only the ProductConfigurator presentation/state seam and its
direct tests.

- P1-1: `LatestQuoteLineSummary` renders every frozen customer-readable line
  fact through closed labels. Article Number, internal enum spellings, raw JSON
  and saved/sent claims remain absent.
- P1-2: all eight builder-returned visible fields use one closed sanitized
  message map with stable inline IDs and matching `aria-describedby` values.
  The component consumes a directly tested state transition that returns no
  line for an initial invalid submission and replaces one valid standard line
  with one valid custom line.
- The state remains one scalar `QuoteLine | null`; no array, merge, Basket,
  persistence, network or submission seam was added.

No A1-A5 production module, frozen authority, dependency, Product Detail fact,
ProductCard/ProductList source, CMS or Planner-owned state changed.

## Planner checkpoint Round 2 label P1 revision

The only production change reuses the already closed customer-label authority
in the initial form. Installation, base packaging, Customer Logo Printing and
protection choices now render the same labels as `LatestQuoteLineSummary`.
Option values, form state, Product Configuration DTO input and QuoteLine output
semantics are unchanged.

The direct markup test observed a real label-drift RED and then passed after
the minimum mapping reuse. Fresh validation passed the configurator gate,
TASK-020 plus frozen QuoteLine gate, full Vitest, all three verifiers, lint,
typecheck, production build and both production smokes. This remains execution
evidence pending Planner's independent checkpoint; it is not visual QA,
review, acceptance or delivery.

## Visual D1 favicon fallback revision

The only product addition is `frontend/src/app/icon.svg`: a 504-byte,
dependency-free vector GDHE fallback monogram with an in-source notice that it
is non-production and must be replaced by the approved final brand favicon.
It contains no remote reference, script, animation, embedded raster, Product
data or internal field.

The missing-file test produced a direct ENOENT RED before the SVG existed and
then passed. A normal Next.js production build emits `/icon.svg` as a static
metadata route while preserving every prior page route and production 404
boundary. No layout, page metadata, configurator, Product Detail, Product
Configuration, QuoteLine, ProductCard/ProductList, CMS, dependency, Next
configuration or protected byte was changed.

Visual Round 1 and keyboard-recovery history are left untouched. Planner and
visual_qa own the fresh Chrome console retest; this report does not claim visual
PASS.

## Adversarial Round 1 custom-length P1 revision

The production custom-length parser now preserves the accepted decimal at a
scaled-tenths boundary before creating a JavaScript number. A value is accepted
only when its scaled tenths are a positive safe integer and the resulting
number converts back to those tenths without loss. The error contract remains
the existing sanitized `{ field: "customLength", code: "invalid" }`.

This is the only production behavior change. The two disclosed precision and
non-finite attacks now fail closed; `5.8`, the standard path, color,
installation, packaging, Logo, protection, quantity and one-latest-result
semantics remain unchanged. Product Configuration and QuoteLine authority
bytes, UI/CSS, CMS, documentation, visual evidence, dependencies and external
systems were not modified.

Round 1 remains historical FAIL until Planner and the independent reviewer
reproduce these bytes. This report does not run or claim review, acceptance,
Git delivery or deployment.
