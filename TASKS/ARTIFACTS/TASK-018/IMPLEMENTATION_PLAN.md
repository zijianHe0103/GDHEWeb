# TASK-018 Implementation Plan

status: `READY_FOR_FRONTEND_TDD`

## Baseline

- Git baseline: `238b316003e97194bbed1b41f6b604c48b383587`.
- Branch: `codex/TASK-018-fgd-x15-product-detail-slice`.
- Node/npm: `24.18.0` / `11.16.0`.
- ProductCard verifier: `8 schemas / 3 success / 6 errors` PASS.
- CMS verifier: `16 schemas / 2 success / 2 errors` PASS.
- Full Vitest: `19 files / 273 tests` PASS.
- ESLint, TypeScript and Next production build PASS.
- Baseline build routes: `/`, `/_not-found`, `/integration/cms`, `/products`.
- No TASK-018 diff exists under `frontend/**` or `cms/**`.

## Slice 1 — closed local configuration and DTO

1. Add focused tests for unset/unknown, `preview`, `cms` and production
   hard-disable.
2. Capture the missing-module RED.
3. Add the server-only closed mode reader and the minimum readonly Product
   Detail DTO.
4. Add the frozen preview DTO using the existing protected asset.
5. Verify the DTO contains only the fields frozen in DESIGN.

## Slice 2 — authentic Product Detail Adapter

1. Add tests that build a Schema-valid FGD X15+PVC product payload, pass it
   through the real existing Validator and then call the new Adapter.
2. Capture the missing-Adapter RED.
3. Implement the minimum authentic-wrapper Adapter and fixed identity/value
   guards.
4. Add negative tests for raw/forged input, wrong route/model/name/category,
   missing/duplicate/value/unit specification mismatches and incomplete
   installation modes.
5. Prove the DTO is deeply readonly and serialization excludes product code,
   Article Number, relations, modules, CMS media and diagnostics.

## Slice 3 — one-resolve loader and closed states

1. Add loopback tests for preview zero network and CMS one exact
   `/gdhe/v1/resolve` request for `/products/fgd-x15-pvc/`.
2. Capture the missing-loader RED.
3. Implement one server-only loader that returns
   `disabled|ready|not_found|unavailable`.
4. Prove zero ProductCard collection requests, zero retries and no browser
   inputs.
5. Map only validated `gdhe_not_found` 404 to `not_found`; map all other
   failures to sanitized `unavailable`.

## Slice 4 — three-module visible route

1. Add server-render presentation and route tests for Hero, Overview, exactly
   five specifications, protected Alt, preview notice, fixed CTA, 404 and
   unavailable states.
2. Capture the missing-route/component RED.
3. Add only the single App Router route, Product Detail component family and
   scoped CSS needed for the three modules.
4. Prove React imports only Product Detail DTO types and contains no fetch,
   validated wrapper, CMS contract, environment or raw-field logic.
5. Prove rendered markup contains no WordPress origin, CMS media URL,
   `wp-content`, Article Number, internal product code or error diagnostic.

## Slice 5 — production fail-closed smoke

1. Add a built-server smoke test that requests the detail page in production
   with both `preview` and `cms`.
2. Capture exposure RED if the route is reachable.
3. Apply only the minimum correction necessary for final 404 and zero CMS
   requests.
4. Keep root, `/integration/cms` and `/products` production behavior intact.

## Documentation and visual checkpoint

1. Update `frontend/README.md` with exact
   `GDHE_PRODUCT_DETAIL_MODE=preview|cms` local commands and the local-only,
   noindex, production-disabled and navigation-only CTA boundaries.
2. Record the exact root README delta in the execution report; Planner owns
   the root README edit after independent validation.
3. Produce TASK-018 TDD RED, execution, validation and diff artifacts.
4. After Planner checkpoint, dispatch visual_qa for 1440/1024/768/390,
   320 reflow, keyboard/focus, Alt and difference classification.

## Final validation

- TASK-018 configuration, Adapter, loader, presentation, route/server-only and
  production-smoke focused tests.
- TASK-017 ProductList focused regressions.
- TASK-008–011 CMS `/resolve` regressions.
- TASK-014–016 ProductCard contract/runtime regressions.
- `npm run verify:product-card-contract`.
- `npm run verify:cms-contract`.
- full `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`.
- protected image and protected runtime/contract/package hashes.
- production smoke, forbidden-import/internal-field/absolute-path/secret and
  browser-WordPress-output scans.
- CMS zero diff, `git diff --check` and DPG project/registry/messages/strict
  lane gates.

## Rollback

Remove only TASK-018-created detail route, Product Detail DTO/component/config/
preview/Adapter/loader files, focused tests, TASK-018 documentation/QA/artifacts
and the corresponding README sections. Retain the protected image, TASK-017
list, existing `/resolve` Transport/Validator, ProductCard contracts/runtime,
package/lockfile and all CMS files.
