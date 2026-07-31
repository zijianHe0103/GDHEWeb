# TASK-018 Planner Visual Round 1 Revision Checkpoint

status: `PASS_FOR_INDEPENDENT_VISUAL_RETEST`
checked_at: `2026-07-31T06:45:51Z`
source: `MSG-TASK-018-FRONTEND-VISUAL-R1-REVISION-RESPONSE`

## Scope

Planner independently checked the CSS-only O1/O2 revision before any visual
retest. This checkpoint does not change the current visual verdict
`FAIL / severe 0 / obvious 2 / detail 0`.

## Diff Boundary

The production revision is limited to the local Product Detail stylesheet:

- Hero, Overview and Specifications now use `box-sizing: border-box` and
  `width: 100%`;
- Hero locally overrides the global section maximum with `max-width: 100%`;
- Product Detail H1 uses `overflow-wrap: normal`.

The only corresponding test addition asserts those local rules. No global
style, component markup, DTO, Adapter, loader, Transport, Validator, data,
wording, route, link, dependency, CMS or external-system change was observed.

## Independent Current-byte Validation

- Product Detail: `5 files / 32 tests PASS`;
- ProductList: `4 files / 29 tests PASS`;
- CMS `/resolve`: `7 files / 156 tests PASS`;
- ProductCard: `6 files / 86 tests PASS`;
- full Vitest: `24 files / 305 tests PASS`;
- ProductCard verifier: `8 schemas / 3 success / 6 error PASS`;
- CMS verifier: `16 schemas / 2 success / 2 error PASS`;
- lint: `PASS`;
- typecheck: `PASS`;
- production build: `PASS`;
- Product Detail production smoke: `PASS`, preview/cms final 404 and zero CMS
  requests;
- ProductList production smoke: `PASS`, preview/cms final 404;
- CMS integration production smoke: `PASS`, disabled 404 and enabled one
  request;
- `git diff --check`: `PASS`;
- DPG project, registry, messages and strict lane checks: `PASS`.

The local shared server was stopped before the clean production build and
restarted afterward on `localhost:3000` with both preview modes. Read-only HTTP
verification returned `200` for `/products/` and
`/products/fgd-x15-pvc/`.

`frontend/next-env.d.ts` matched the production baseline after build. The
currently running Next development server subsequently and expectedly points
that generated file at `.next/dev/types/routes.d.ts`; Planner owns stopping
the server and rerunning production build after visual retest so the final
declared diff returns to baseline.

## Result

`PASS_FOR_INDEPENDENT_VISUAL_RETEST`

This is not a visual PASS. Visual QA must independently reproduce:

- 1440 Hero width use and intact `X15+PVC`;
- 1024 regression;
- `scrollWidth <= clientWidth` at 768, 390 and 320;
- no clipping, overlap, focus or CTA regression.

No adversarial review, acceptance, Git delivery or deployment is authorized.
