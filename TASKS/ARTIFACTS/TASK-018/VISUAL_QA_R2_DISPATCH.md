# TASK-018 Visual QA Round 2 Dispatch

status: `READY_FOR_VISUAL_QA_R2`
source: `MSG-TASK-018-FRONTEND-VISUAL-R1-REVISION-RESPONSE`

## Purpose

Independently retest only the two Round 1 obvious findings after the CSS-only
revision, while preserving:

- the original `BLOCKED_NO_VISUAL_EVIDENCE` history;
- the first evidence-backed `FAIL / severe 0 / obvious 2 / detail 0`;
- all original screenshots and measurements.

Planner independently reproduced the focused and full code/test gates. This
dispatch does not assume the visual findings are closed.

## Runtime

Use the already-running current shared checkout at
`http://localhost:3000`, with ProductList and Product Detail preview modes
enabled. Do not start or stop a server, use port `3001`, or create a temporary
copy.

## Required Round 2 Evidence

1. At 1440:
   - capture a fresh full-page `r2` screenshot;
   - measure article width and Hero width;
   - verify Hero uses the intended available article row rather than the old
     `754px` cap;
   - verify `X15+PVC` is never split internally; normal line breaks may occur
     only at spaces.
2. At 1024:
   - capture a fresh regression screenshot;
   - confirm no horizontal overflow, clipping or Hero regression.
3. At 768, 390 and 320:
   - capture fresh full-page `r2` screenshots;
   - record `scrollWidth / clientWidth`;
   - require `scrollWidth <= clientWidth`;
   - confirm Hero, Overview and Specifications right edges stay inside the
     viewport;
   - confirm heading, protected image, notice, all five values and CTA are not
     clipped.
4. Recheck:
   - CTA is at least 44 CSS px and its center hit-test returns the CTA;
   - category then RFQ keyboard order and visible focus;
   - console errors/warnings;
   - no WordPress/CMS/internal browser-facing leakage.

## Evidence Naming

Keep every Round 1 file. Write Round 2 screenshots with `r2` in the filename,
for example `fgd-x15-pvc-r2-1440.png`. Append a clearly separated Round 2
section to both visual reports; do not rewrite prior history.

## Verdict

Return:

- `PASS / severe 0 / obvious 0 / detail 0` only if O1 and O2 are closed and no
  new difference is introduced; or
- `FAIL` with exact current counts, viewport, measurement, impact and smallest
  proposed correction.

## Allowed Writes

- `QA/TASK-018/**`;
- `TASKS/ARTIFACTS/TASK-018/VISUAL_QA_REPORT.md`;
- `LANES/visual_qa/**`.

## Protected Scope

Do not edit frontend/CSS/tests/docs, task authority, CMS, dependencies, Git,
deployment or external systems. Planner owns the shared server and
`next-env.d.ts` cleanup.

## Stop Boundary

Stop after one linked `execution_response`. Do not perform product fixes,
adversarial review, acceptance, commit, push, merge or deployment.
