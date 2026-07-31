# TASK-018 Visual QA Round 1 Result

status: `BLOCKED_NO_VISUAL_EVIDENCE`
lane: `visual_qa`
request: `MSG-TASK-018-VISUAL-QA-R1`
delivery_key: `MSG-TASK-018-VISUAL-QA-R1:019f88d0-0f9c-7940-af93-f9eef03f92c8`

## Result

No PASS/FAIL product verdict was issued and graded counts remain
`NOT_MEASURED`.

The selected in-app browser entered a connection-error page during localhost
server drift. Once the exact dual-preview server was verified on port `3001`,
the browser URL safety policy blocked the stale tab and a fresh tab and
explicitly prohibited indirect recovery or use of another browser surface.

The local HTTP endpoints themselves returned `200`, but that is not visual,
interaction, accessibility, console or browser-facing leakage evidence.

Canonical blocker details:

- `QA/TASK-018/VISUAL_QA_REPORT.md`

No required screenshot was created. The visual lane stopped its restarted
server, reset the viewport and finalized blocked tabs. Port `3000` and the
Planner-provided temporary directory were left untouched.

Recovery requires a fresh browser-control session followed by a new controlled
visual QA dispatch. This report must not be interpreted as visual PASS or
product FAIL.

---

# TASK-018 Visual QA Round 1 Recovery Result

status: `FAIL`
lane: `visual_qa`
request: `MSG-TASK-018-VISUAL-QA-R1-RECOVERY`
delivery_key: `MSG-TASK-018-VISUAL-QA-R1-RECOVERY:019f88d0-0f9c-7940-af93-f9eef03f92c8`

## Verdict

`FAIL / severe 0 / obvious 2 / detail 0`

The prior `BLOCKED_NO_VISUAL_EVIDENCE` result above remains unchanged as
history. The fresh recovery run successfully captured and inspected all
required browser evidence against the already-running current shared checkout
at `http://localhost:3000`.

Passing gates included canonical list-to-detail navigation, exact
`FGD X15+PVC` identity, protected local image and Alt, Hero/Overview/exactly
five specifications, visible local notice, exact category and RFQ targets,
`44.09375px` CTA with a successful center hit-test, category-then-RFQ keyboard
order, visible `3px` focus outlines, zero browser console warnings/errors and no
observed browser-facing CMS/internal leakage.

Two obvious differences prevent PASS:

1. At CSS widths `768/390/320`, measured
   `scrollWidth / clientWidth` was respectively
   `792/768`, `452/390` and `397/320`. Required cards and content extend beyond
   the viewport and are clipped. Smallest correction: make the three card
   containers border-box and constrain their used inline width to `100%`,
   including padding and border.
2. At `1440`, the Hero uses only `754px` of an available `1248px`, fixes its
   text column to `320px`, and renders the H1 as
   `FGD / X15+PV / C Track`. Smallest correction: widen the desktop Hero/text
   column and disallow word-internal wrapping so `X15+PVC` stays intact.

Canonical measurements, reproduction steps, impact, screenshot dimensions and
SHA-256 inventory:

- `QA/TASK-018/VISUAL_QA_REPORT.md`

The shared port `3000` server was not stopped or changed. No port `3001`,
temporary copy, frontend/CSS/test/doc/task-authority/CMS/dependency/Git/
deployment/external-system mutation occurred.

---

# TASK-018 Visual QA Round 2 Result

status: `PASS`
lane: `visual_qa`
request: `MSG-TASK-018-VISUAL-QA-R2`
delivery_key: `MSG-TASK-018-VISUAL-QA-R2:019f88d0-0f9c-7940-af93-f9eef03f92c8`

## Verdict

`PASS / severe 0 / obvious 0 / detail 0`

The original blocker and Round 1
`FAIL / severe 0 / obvious 2 / detail 0` remain preserved above. Fresh R2
evidence closed both obvious findings without introducing a new difference:

1. At 1440, Article and Hero now both measure `1248px`; the H1 renders
   `FGD X15+PVC / Track`, and the `X15+PVC` token occupies one client
   rectangle.
2. At 768/390/320, `scrollWidth / clientWidth` is now respectively
   `768/768`, `390/390` and `320/320`. Hero, Overview, Specifications and all
   required children remain inside the viewport.

The 1024 regression check also measured `1024/1024` with Article and Hero both
`921.609375px` and no clipping. Across all five widths the CTA remained
`44.09375px`, its center hit the RFQ anchor, keyboard order remained category
then RFQ, visible `3px` focus indicators remained inside the 390 viewport,
console warnings/errors were zero and browser-facing CMS/internal leakage
checks were clear.

Canonical measurements, capture-method disclosure, screenshots and SHA-256
inventory:

- `QA/TASK-018/VISUAL_QA_REPORT.md`

## Actual Encoding Disclosure

Fresh `file`, magic-byte and SHA-256 checks confirmed the following byte
encodings. The `.png` extension on the JPEG/JFIF groups is historical and does
not describe their actual encoding; no evidence file was renamed, re-encoded
or modified.

| Evidence group | Preserved filenames | Actual bytes | Magic prefix |
| --- | --- | --- | --- |
| Round 1 full-page | `fgd-x15-pvc-1440.png`, `fgd-x15-pvc-1024.png`, `fgd-x15-pvc-768.png`, `fgd-x15-pvc-390.png`, `fgd-x15-pvc-320.png` | JPEG/JFIF | `ff d8 ff e0` |
| Round 1 focus | `focus-390-category.png`, `focus-390-rfq.png` | JPEG/JFIF | `ff d8 ff e0` |
| Round 2 full-page composites | `fgd-x15-pvc-r2-1440.png`, `fgd-x15-pvc-r2-1024.png`, `fgd-x15-pvc-r2-768.png`, `fgd-x15-pvc-r2-390.png`, `fgd-x15-pvc-r2-320.png` | PNG | `89 50 4e 47 0d 0a 1a 0a` |
| Round 2 focus | `focus-r2-390-category.png`, `focus-r2-390-rfq.png` | JPEG/JFIF | `ff d8 ff e0` |

All 14 filenames, dimensions, SHA-256 values, measurements, capture
disclosures and verdict history remain unchanged.

The shared port `3000` server was left running. Viewport override was reset and
QA tabs were finalized. No frontend/CSS/tests/docs/task authority/CMS/
dependencies/Git/deployment/external-system mutation occurred.
