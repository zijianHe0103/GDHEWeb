# TASK-017 Frontend Adversarial Round 1 Narrow Revision

status: `READY_FOR_FRONTEND_REVISION`
source: `MSG-TASK-017-ADVERSARIAL-REVIEW-R1-RESPONSE`

## Required decisions

The production public-media origin and Next Image allowlist remain deferred.
TASK-017 therefore must not guess or silently approve any remote media origin.

Until a later authorized media task closes that gate, the local ProductList
route shall fail closed before React for every non-empty CMS collection whose
card media URL is not a safe root-relative same-frontend-origin path. A valid
empty CMS collection remains the distinct empty state. Preview continues to
use only the exact repository-relative protected candidate.

Failing the whole non-empty collection to the existing sanitized unavailable
state is intentional. Do not partially hide individual cards, replace remote
media with a fabricated image, proxy arbitrary URLs or select a CDN.

## P1 revision

Use strict TDD:

1. Build one Schema-valid ProductCard response whose image URL is a real HTTPS
   WordPress-shaped value such as
   `https://cms.example.com/wp-content/uploads/protected.webp`.
2. Render the real `/products/` CMS orchestration path. Record RED proving the
   current markup contains that exact external URL in preload and/or `img`.
3. Add one server-only media-policy gate between the authenticated
   `loadProductCardCollection()` DTO result and React.
4. GREEN requires:
   - exactly one fixed `/product-cards` request and zero `/resolve`;
   - the page renders only the sanitized unavailable state;
   - rendered markup contains neither the hostile origin/URL nor external
     image preload/`img`;
   - no CMS origin, raw payload or policy diagnostic enters React;
   - preview remains visible with the exact local protected image;
   - valid empty CMS remains empty rather than unavailable.
5. Replace or supplement the existing source-only no-`fetch()` claim with
   this rendered-markup behavior regression. Do not claim that source text
   alone proves browser-network isolation.

The gate may accept only URL values that parse as same-origin when resolved
against a fixed synthetic frontend origin and whose original form begins
with exactly one `/`. It must reject absolute URLs, protocol-relative URLs,
backslash origin confusion, credentials and malformed values. Do not read a
browser-supplied origin or expose a configuration override.

## P2 corrections

1. Finish validation with a production build and leave tracked
   `frontend/next-env.d.ts` byte-identical to baseline, referencing
   `./.next/types/routes.d.ts`. Prove the baseline diff is empty. Do not
   manually retain the dev route-types reference.
2. Preserve the Planner-owned recovery that records the Round 1 request as
   ACKed/done and verdict `FAIL / P0=0 / P1=1 / P2=2`.
3. Update `frontend/README.md` truthfully: CMS mode performs the authentic
   collection request but a non-empty remote-media collection is unavailable
   until the separately authorized public-media gate exists. Record the exact
   root README delta for Planner rather than editing the root file.

## Protected behavior and validation

Do not modify the ProductCard Schema, Snapshot, Validator, Adapter, DTO,
Transport, CMS, API or database. The policy belongs only to the TASK-017 page
orchestration boundary.

Re-run:

- ProductList focused tests;
- TASK-016 five-file focused tests;
- full Vitest;
- both contract verifiers;
- lint, typecheck and production build;
- production fail-closed smoke;
- package/lock, protected Snapshot/runtime, protected image and
  `next-env.d.ts` baseline checks;
- leakage, residue, diff and DPG gates.

Update the four TASK-017 implementation artifacts and frontend worklog while
preserving all visual Round 1/Round 2 and adversarial Round 1 history.
Return one controlled revision response linked to the Planner request.

## Exclusions

- No visual redesign or visual QA rerun is required; preview DOM/CSS/media are
  unchanged.
- No remote image proxy, production origin, allowlist, CDN, Next config,
  dependency or lockfile change.
- No component action/DTO/business-rule change.
- No CMS/database/external mutation, product detail, RFQ, SEO, multilingual,
  deployment, Git, acceptance, Planner-state change or later task.
