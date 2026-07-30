# TASK-017 Visual QA Dispatch

status: `READY_FOR_VISUAL_QA`
lane: `visual_qa`

## Authority

Validate the current shared TASK-017 bytes only. Read:

- `TASKS/ACTIVE/TASK-017-product-card-visible-list-slice.md`
- `TASKS/ARTIFACTS/TASK-017/DESIGN.md`
- `TASKS/ARTIFACTS/TASK-017/IMPLEMENTATION_PLAN.md`
- `TASKS/ARTIFACTS/TASK-017/EXECUTION_REPORT.md`
- `TASKS/ARTIFACTS/TASK-017/TEST_OR_VALIDATION_LOG.md`

The Planner checkpoint independently reproduced ProductList `20/20`, full
Vitest `264/264`, both contract verifiers, lint, typecheck, production build,
production fail-closed smoke, protected hashes, scope and DPG gates.

## Local page

Use Node `24.18.0` and start the existing frontend in non-production preview
mode:

```sh
cd frontend
PATH=/Users/arron/.nvm/versions/node/v24.18.0/bin:/usr/bin:/bin:/usr/sbin:/sbin \
GDHE_PRODUCT_LIST_MODE=preview \
npm run dev
```

Inspect the final browser page at `/products/`. Do not treat the preview
candidate as production content. Stop the local process after evidence is
captured.

## Required evidence

Write only under `QA/TASK-017/**`, `TASKS/ARTIFACTS/TASK-017/**` and the
visual QA lane records.

1. Capture full-page screenshots at exact CSS viewport widths:
   - 1440 px
   - 1024 px
   - 768 px
   - 390 px
2. At 320 CSS px, record viewport width, document scroll width and whether
   horizontal overflow occurs. Include a screenshot if it improves the proof.
3. Record computed grid column count at every acceptance viewport. Expected
   pattern is three columns at 1440, two at 1024 and 768, one at 390 and 320;
   the current single preview item may occupy only the first grid cell.
4. Verify the protected GDHE image is visible, not distorted, not clipped,
   preserves its branding/dimensions, and has non-empty English Alt.
5. Verify heading/list/article semantics, meaningful link names, keyboard tab
   order, visible focus on every interactive element and action target height
   of at least 44 CSS px.
6. Verify long text, attributes and CTA reflow without clipping or overlap.
7. Confirm the visible local-test notice and fixed English content.
8. Classify every issue as `严重差异`, `明显差异` or `细节差异`. A PASS requires
   zero unresolved severe or obvious differences; detail differences must be
   listed explicitly.

## Boundaries

- This is local visual and accessibility QA, not reference-site content
  copying, production acceptance, deployment or user acceptance.
- Do not edit frontend product code, CSS, tests, CMS, database, task state,
  root README, Git or external systems.
- Do not add product details, Header/Footer, filter/pagination UI, RFQ,
  multilingual, SeoDocument or production media configuration.
- If a severe or obvious difference exists, return `FAIL` with exact evidence
  and the smallest recommended frontend correction. Do not repair it in this
  lane.

## Required response

Create:

- `QA/TASK-017/VISUAL_QA_REPORT.md`
- the required screenshots under `QA/TASK-017/`
- `TASKS/ARTIFACTS/TASK-017/VISUAL_QA_REPORT.md`

Return one controlled `execution_response` linked to the Planner request with
`PASS`, `FAIL` or `BLOCKED`, exact counts of severe/obvious/detail findings,
the local server evidence, screenshot inventory and accessibility/reflow
results.
