# TASK-021 Frontend Visual Round 1 Narrow Revision Dispatch

## Preserved history

Visual QA Round 1 remains `FAIL / severe=1 / obvious=1 / detail=1`. Preserve all ten evidence files, their names/hashes/encoding disclosure, both visual reports and the browser interaction log.

## Authorized correction

### O1 — remove internal identity from browser-facing bytes

1. Add a server-only projection from the validated internal `ProductConfigurationV2Dto` to a new public configurator view model.
2. The public view model may contain only customer-facing model/path/unit, standard length/color choices, packaging policy and custom-length policy. It must contain no Article Number, product UUID, WordPress/SCF/Feishu identity, raw payload or diagnostic.
3. Pass only this public view model into the Client Component. Do not pass or import the internal Product Configuration DTO from the Client Component.
4. Keep the server-side internal DTO, Product Configuration v2 snapshot/API and QuoteLine v2 authority intact unless an exact type-only separation is needed. Do not weaken unique `length + color` validation.
5. The current in-memory browser result must be a customer-readable quote draft/summary that contains no internal Article Number or UUID. The future submission server will re-resolve the authoritative Article Number; do not implement that submission now.
6. Add a real Next preview response regression that fails if `GDHEPRD000172`, `21000000-0000-4000-8000-000000000001`, `articleNumber` or internal diagnostic markers occur in browser-facing HTML/Flight bytes.

### S1/D1 — same-origin local preview recovery

The server log proves both the font 403 and HMR failures were Next.js dev-origin protection: the server was started as `localhost` while QA used `127.0.0.1`. Do not weaken Next security with `allowedDevOrigins` and do not change dependencies. Update the local documentation to use the exact same-origin command:

`GDHE_PRODUCT_DETAIL_MODE=preview npm run dev -- --hostname 127.0.0.1`

Planner, not frontend, will restart the runtime with this command for the retest. Add only a narrow start-command/documentation assertion if useful; do not claim S1/D1 visually closed from unit tests.

## Required TDD and validation

- Capture a real RED for browser-byte identity leakage before the projection fix.
- Capture the smallest GREEN showing the same page and customer fields without internal values.
- Keep order `Track Length -> Color -> Packaging -> Quantity`, current `6 m / Ivory White`, Custom Length, packaging, quantity and one-latest replacement unchanged.
- Keep Installation absent and do not add related products, Basket, persistence, submission, Feishu or external requests.
- Re-run the TASK-021 focused tests, complete split 39-file suite, five verifiers, lint, typecheck, production build and three production smokes.
- Re-check all v1 hashes, package/lock/protected image, generated-file cleanup, scope, diff and DPG gates.

## Boundaries

Do not edit CMS/WordPress, Product Configuration v1, QuoteLine v1, ProductCard/ProductList, page layout/CSS, visual evidence, active task/project state, root README, dependencies, Git or deployment. Return one linked execution response; Planner owns fresh checkpoint, same-origin server restart and Visual QA Round 2.
