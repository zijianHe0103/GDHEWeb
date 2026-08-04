# TASK-021 Frontend Visual Round 1 Revision Report

Date: 2026-08-05

## Result

`PASS` for the narrow frontend correction dispatched by
`MSG-TASK-021-FRONTEND-VISUAL-R1-REVISION`.

This result does not replace the preserved Visual Round 1 verdict
`FAIL / severe=1 / obvious=1 / detail=1`. It closes only the frontend code
cause of O1. Planner still owns a fresh checkpoint, the exact same-origin
runtime restart and Visual QA Round 2 for S1/D1.

## Preserved visual history

- `VISUAL_QA_REPORT.md`, the mirrored QA report, all ten visual evidence files,
  their names/hashes/encoding disclosure and `INTERACTION_BROWSER_LOG.md` were
  not edited.
- No CSS, layout, visible order, copy, route target or visual evidence changed.
- The existing S1 font/HMR/hydration failure and D1 console history remain
  recorded as Visual Round 1 findings.

## RED

The focused command was run before the public projection existed:

```sh
npm test -- tests/product-configurator-preview-response.test.ts
```

Exit: `1`. The real Next.js preview returned HTTP `200` and rendered
`Configure Your Track`, `6 m` and `Ivory White`, but the assertion failed on
`GDHEPRD000172`. The received HTML showed the internal Product Configuration
object inside `self.__next_f`, including:

- Article Number `GDHEPRD000172`;
- product UUID `21000000-0000-4000-8000-000000000001`;
- the `articleNumber` property name.

This is the direct browser-byte reproduction of Visual Round 1 O1.

## Minimum GREEN

- Added a server-only projection from the validated internal
  `ProductConfigurationV2Dto` to a deeply readonly public configurator view
  model.
- The public view model contains only the allowed customer-facing model,
  public path, quantity unit, standard length/color choices, public packaging
  choices and custom-length policy.
- The projection rechecks the frozen unique `length + color` identity before
  emitting a public option and fails closed on ambiguity.
- The Client Component imports only the public view model and public draft
  types. It no longer imports or receives the internal DTO, Article Number or
  product UUID.
- The in-memory result is now a customer-readable public quote draft. It keeps
  only model/path, standard-or-custom length, color label, customer packaging
  labels, quantity and unit. Future submission must re-resolve authoritative
  Article Number server-side; no submission was added here.
- Packaging control keys are public UI keys rather than the frozen CMS enum
  values. Existing customer labels and QuoteLine v2 authority remain intact.

The focused current-byte GREEN is `5 files / 10 tests PASS`, including the
real Next preview response. That response remains HTTP `200`, still contains
`Configure Your Track`, `6 m` and `Ivory White`, and contains none of:

- `GDHEPRD000172`;
- `21000000-0000-4000-8000-000000000001`;
- `articleNumber`;
- the internal diagnostic marker.

## Preserved behavior and scope

- Visible order remains `Track Length -> Color -> Packaging -> Quantity`.
- Current truth remains `6 m / Ivory White`; Custom Length, all packaging
  labels, Quantity and one-latest replacement remain covered and passing.
- Installation remains absent from the configurator.
- Internal Product Configuration v2 DTO/API/snapshot, the QuoteLine v2
  authority and its unique resolver were not weakened or edited.
- Product Configuration v1 and QuoteLine v1 authority bytes are unchanged.
- No CMS/WordPress, ProductCard/ProductList, CSS, related-products, Basket,
  persistence, submission, Feishu, dependencies, Git or deployment change was
  made.

## Same-origin preview handoff

The frontend README now gives the exact local command:

```sh
GDHE_PRODUCT_DETAIL_MODE=preview npm run dev -- --hostname 127.0.0.1
```

It also requires browsing through the same `127.0.0.1` origin. No
`allowedDevOrigins` or other Next.js security relaxation was added. Planner
must start the fresh runtime with this command before Visual QA Round 2; this
frontend report does not claim S1/D1 visually closed.

## Current-byte validation

- focused configurator/preview: `5 files / 10 tests PASS`;
- full Vitest: `40 files / 420 tests PASS`, exit `0`;
- five contract verifiers PASS: CMS `16/2/2`, ProductCard `8/3/6`, Product
  Configuration v1 `4/1/6`, Product Configuration v2 and QuoteLine v2;
- ESLint PASS;
- TypeScript `tsc --noEmit` PASS;
- final Next.js 16.2.11 production build PASS with the existing route set;
- CMS integration, ProductList and Product Detail production smokes PASS;
- final `next-env.d.ts` tracked diff empty after the last production build;
- no task-owned Next/Vitest process or temporary build root remains;
- package, lockfile and protected candidate image hashes remain unchanged;
- all TASK-021 baseline Product Configuration v1 and QuoteLine v1 hashes remain
  exact.

## Handoff

Planner independently reproduces the code-side closure, starts the preview
with the documented same-origin command, and controls Visual QA Round 2. The
frontend lane does not change the preserved Visual Round 1 verdict.
