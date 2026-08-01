# TASK-020 Frontend Planner Checkpoint Round 1

## Verdict

`FAIL / P0=0 / P1=2 / P2=0`

The linked frontend execution response is acknowledged and the technical
Transport, Validator, Adapter, loader and QuoteLine builder evidence remains
passing. Planner found two customer-visible contract gaps before visual QA.

## Passing evidence preserved

- The controlled implementation request and linked response are both in
  `LANES/messages/done/`.
- Independent Node 24.18.0 focused execution passed `9 files / 84 tests` after
  permitting the tests to bind their local loopback listener. The first
  sandboxed attempt failed only with `listen EPERM`.
- No finding reopens Product Configuration authority, four-Schema closure,
  Transport, Runtime Validator, DTO Adapter, loader request counts, QuoteLine
  1.0.0 identity, CMS, ProductCard/ProductList, package/lock or protected media.

## P1-1 — Success summary is not the frozen customer summary

The frozen task requires the latest result to display model, standard/custom
length type, length, color, installation, base packaging, Logo yes/no,
protection arrangement/None, quantity and unit.

Current production markup in
`frontend/src/components/product-configurator/index.tsx:266` through `:273`
displays only length, color and quantity. A customer cannot verify the selected
installation or packaging before later Basket work consumes the line.

### Required narrow correction

Render one sanitized, human-readable latest-item summary directly from the
validated `QuoteLine`, including exactly the frozen fields. Use customer labels
such as Standard Length/Custom Length, Ceiling Mount/Wall Mount, Standard
Packaging/Carton Packaging/Large Shrink Wrap, Yes/No and None/Single-piece
Bagging/Paired Interlocking. Do not expose raw JSON or Article Number as the
headline, and do not claim that the quote was saved or sent.

## P1-2 — Error and replacement behavior is incomplete and not directly proven

The empty base-packaging choice is a normal user-reachable invalid state. The
current select sets `aria-invalid` but has no associated inline error or
`aria-describedby`. Custom color and protection arrangement similarly expose
`aria-invalid` without a corresponding inline error if their closed builder
guards reject a value.

The current presentation test only renders initial static markup and scans the
source for `useState`/`setLatestLine`. It does not operate the production form,
prove invalid-field associations, create resolved/custom results, or prove that
a second valid submit replaces the first latest item.

### Required narrow correction

1. Give every builder-returned visible field error a sanitized inline message
   associated with its control or fieldset; at minimum directly reproduce the
   empty installation, empty base packaging, invalid custom length and invalid
   quantity states.
2. Add a real behavioral regression at the production interaction/state seam,
   without adding dependencies, that proves:
   - invalid submission creates no QuoteLine and exposes associated errors;
   - one valid standard submission renders the complete summary;
   - one valid custom submission replaces the prior result rather than appending;
   - no persistence, network submission, raw payload or internal field appears.

## Protected boundary

The revision may change only the TASK-020 configurator presentation/state seam,
its focused tests, TASK-020 evidence, frontend worklog and the already-authorized
frontend documentation if required. It must not change CMS, frozen Schema or
snapshot bytes, QuoteLine contract/equality/merge, Transport, Validator, DTO,
Product Detail facts, ProductCard/ProductList, dependencies, package/lock,
protected image, root README, Planner authority, Basket, persistence,
submission, Feishu, Git or deployment.

## Required validation

- strict RED for both missing behaviors before minimum GREEN;
- focused configurator and existing TASK-020 tests;
- full Vitest, all three verifiers, lint, typecheck and production build;
- Product Detail and Product List production smokes;
- protected hashes/inventories, generated-file cleanliness, diff and DPG gates;
- one linked `execution_response` for a fresh independent Planner checkpoint.

Visual QA and adversarial review remain blocked.
