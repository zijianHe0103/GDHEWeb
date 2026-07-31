# TASK-018 Frontend Visual Round 1 Revision Dispatch

status: `READY_FOR_FRONTEND_REVISION`
source: `MSG-TASK-018-VISUAL-QA-R1-RECOVERY-RESPONSE`

## Purpose

Close only the two independently reproduced visual findings from the first
evidence-backed TASK-018 Product Detail visual verdict:

- `O1`: horizontal overflow and content clipping at `768`, `390` and `320`;
- `O2`: under-used 1440 Hero width and a word-internal break inside
  `X15+PVC`.

The prior `BLOCKED_NO_VISUAL_EVIDENCE` history and current
`FAIL / severe 0 / obvious 2 / detail 0` report must remain unchanged.

## Required TDD

1. Add the smallest focused regression that fails on current bytes because:
   - Product Detail Hero, Overview and Specifications cards are not
     border-box width-safe against the global `section` rule;
   - the Product Detail H1 still allows a word-internal model break.
2. Record the real RED before changing production CSS.
3. Make the minimum CSS-only GREEN change.
4. Re-run the focused Product Detail tests and all declared regressions.

No component, DOM, DTO, Adapter, Transport, Validator, data, wording, route,
link target, breakpoint count or dependency change is authorized.

## Minimum Revision Boundary

The expected smallest correction is:

- locally override the global content-box `section` behavior so the Product
  Detail Hero, Overview and Specifications include padding/border within the
  available inline width;
- let the desktop Hero consume the intended Product Detail article width
  instead of the global `42rem` section cap;
- prevent the H1 from breaking inside the model token `X15+PVC`, while still
  allowing normal wrapping at spaces.

Do not change global styles for unrelated pages. Keep the correction inside
`frontend/src/components/product-detail/product-detail.module.css`.

## Required Validation

- focused Product Detail tests;
- ProductList regression;
- CMS `/resolve` regression;
- ProductCard regression;
- full Vitest;
- both contract verifiers;
- lint;
- typecheck;
- production build;
- all existing production smokes;
- protected hash/scope and DPG gates;
- no generated `next-env.d.ts` drift in the declared final diff.

Frontend may use local non-browser measurements only as supporting evidence.
Planner/visual_qa owns the independent 1440/1024/768/390/320 browser retest.

## Allowed Writes

- `frontend/src/components/product-detail/product-detail.module.css`;
- directly corresponding focused TASK-018 test only;
- `TASKS/ARTIFACTS/TASK-018/**`;
- `LANES/frontend/**`.

## Protected Scope

Do not edit Product Detail component markup or data; page/route config; DTO;
Adapter; loader; Transport; Validator; ProductCard/ProductList; globals.css;
README; task authority; CMS; dependencies; Git; deployment or external
systems.

## Stop Boundary

Return one controlled `execution_response` linked to the frontend revision
request after current-byte validation. Do not perform visual QA, adversarial
review, acceptance, commit, push, merge or deployment.
