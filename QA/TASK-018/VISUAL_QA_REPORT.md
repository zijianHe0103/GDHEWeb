# TASK-018 Visual QA Round 1 Report

status: `BLOCKED_NO_VISUAL_EVIDENCE`
lane: `visual_qa`
request: `MSG-TASK-018-VISUAL-QA-R1`
delivery_key: `MSG-TASK-018-VISUAL-QA-R1:019f88d0-0f9c-7940-af93-f9eef03f92c8`
tested_at: `2026-07-31`

## Result

No Product Detail visual verdict was issued.

The required browser evidence could not be collected because the selected
in-app browser entered its connection-error page while the originally reported
localhost:3001 server was no longer listening. After a verified replacement
server became available, the browser URL safety policy blocked both the stale
error tab and a newly created tab and explicitly prohibited indirect recovery,
raw browser commands or another browser surface.

This is an execution-environment blocker, not a severe, obvious or detail
product finding. Returning `PASS` or `FAIL` would therefore be unsupported.

Current graded counts: `NOT_MEASURED`.

## Runtime Evidence

- The exact dual preview modes were used:
  `GDHE_PRODUCT_LIST_MODE=preview` and
  `GDHE_PRODUCT_DETAIL_MODE=preview`.
- Node: `24.18.0`.
- Next.js: `16.2.11`, webpack development server.
- Actual port: `3001`.
- The verified temporary-copy source matched current shared `frontend/` bytes
  except for generated `next-env.d.ts`.
- Read-only HTTP probes returned:
  - Product Detail `/products/fgd-x15-pvc`: `200`;
  - Product List `/products`: `200`.
- The visual lane's restarted server was stopped after the blocker.
- Existing port `3000` was not stopped or changed.
- Planner's `/tmp/gdhe-task018-qa.0EycaJ` directory was not removed.
- Browser viewport override was reset and the blocked tabs were finalized.

HTTP `200` is not treated as visual, interaction, accessibility or leakage
evidence.

## Evidence Not Collected

- 1440/1024/768/390 full-page screenshots;
- 320 CSS px reflow screenshot and measurements;
- ProductCard click-through observation;
- visual Hero/Overview/five-specification inspection;
- CTA center hit-test;
- keyboard order and focus visibility;
- responsive columns, spacing and overlap;
- browser console warnings/errors;
- rendered-markup and browser-network leakage inspection.

No screenshot files were created.

## Required Recovery

Planner should provide a fresh browser-control session that can open the
already verified local dual-preview server, then redispatch the same Round 1
scope. Do not treat this blocked report as a visual QA failure or pass.

No frontend, CSS, tests, documentation, task authority, CMS, dependencies, Git,
deployment or external system was modified.

---

# TASK-018 Visual QA Round 1 Recovery

status: `FAIL`
lane: `visual_qa`
request: `MSG-TASK-018-VISUAL-QA-R1-RECOVERY`
delivery_key: `MSG-TASK-018-VISUAL-QA-R1-RECOVERY:019f88d0-0f9c-7940-af93-f9eef03f92c8`
tested_at: `2026-07-31`
origin: `http://localhost:3000`

## Recovery Verdict

`FAIL / severe 0 / obvious 2 / detail 0`

The prior `BLOCKED_NO_VISUAL_EVIDENCE` run above remains execution history. This
recovery is the first product verdict supported by fresh browser screenshots,
layout measurements, navigation, keyboard/focus, hit-test, console and observed
browser-asset evidence.

## Passing Gates

- Product List displayed one exact `FGD X15+PVC Track` card. Its image, title
  and `View Product` links each resolved to `/products/fgd-x15-pvc/`.
- Clicking `View Product` navigated to the canonical browser URL
  `http://localhost:3000/products/fgd-x15-pvc`.
- Detail identity was exact: model `FGD X15+PVC`, H1
  `FGD X15+PVC Track`, and no `/products/fgd-x15/` identity appeared in the
  rendered markup.
- The protected local image loaded from
  `/test-candidates/fgd-x15-protected.png`, rendered at natural
  `800 × 800`, used `object-fit: contain`, and had the non-empty Alt
  `Protected FGD X15+PVC curtain track cross-section`. Source SHA-256:
  `9a8ed9fe7145ae582450425be493987ad874d052c176e340d28d7d24bf0d4880`.
- Product Hero, Product Overview and Key Specifications were present. Exactly
  five specification pairs rendered:
  `28 × 27 mm`, `6 m`, `Ceiling or wall mount`, `155–160 g/m`, `115 g/m`.
- The local notice was visible:
  `Local test candidate — details and copy remain replaceable`.
- Category target was exactly
  `/products/curtain-track-systems/manual-curtain-tracks/`; RFQ target was
  exactly `/request-a-quote/`.
- The RFQ CTA measured `44.09375 CSS px` high and its center resolved to that
  same anchor at the tested narrow viewport.
- Natural focus order was category then RFQ; both anchors had `tabIndex 0`.
  Keyboard focus produced a visible `3px solid` outline on each target.
- Browser console warnings/errors: `0`.
- Rendered text/markup checks found no WordPress/CMS origin, `wp-content`,
  Article Number, internal product code, raw payload or diagnostic text.
  The observed browser asset inventory contained `20` same-origin assets
  (`2` stylesheets, `16` scripts, `1` image and `1` font); the only product
  image URL was the protected local path above.

## Responsive Measurements

| CSS viewport | Captured file | Hero columns | `scrollWidth / clientWidth` | Result |
| --- | --- | --- | --- | --- |
| 1440 | `1440 × 1710` | `265.602px 320px` | `1440 / 1440` | No horizontal overflow; wide-layout finding below |
| 1024 | `1024 × 1470` | `290.562px 320px` | `1024 / 1024` | No horizontal overflow |
| 768 | `792 × 2064` | `672px` | `792 / 768` | Horizontal overflow by `24px` |
| 390 | `452 × 1809` | one column | `452 / 390` | Horizontal overflow by `62px` |
| 320 | `397 × 1786` | `298.953px` | `397 / 320` | Horizontal overflow by `77px` |

The full-page JPEG/JFIF byte stream, preserved under its historical `.png`
filename, has a canvas that expands beyond the requested CSS width at
768/390/320 because the document itself overflows. This is supporting evidence,
not a screenshot-width setup error: `innerWidth` and `clientWidth` remained the
requested CSS widths while `scrollWidth` increased.

## Findings

### O1 — Responsive cards overflow and clip at 768/390/320

- grade: `obvious`
- reproduce:
  1. Open `/products/fgd-x15-pvc` at CSS widths `768`, `390` or `320`.
  2. Compare `document.documentElement.scrollWidth` with `clientWidth`.
  3. At `390`, observe `452 / 390`; at `320`, observe `397 / 320`.
- exact evidence:
  - At `390`, Hero/Overview/Specifications each ended at `x=452.5`, outside
    the viewport. The H1, protected image, notice and all five specification
    values ended at `x=411.5`.
  - At `320`, all three cards ended at `x=396.953125`; the same content group
    ended at `x=355.953125`.
  - The 390 focus screenshots show the image and notice text cut at the right
    viewport edge while the horizontal document remains scrollable.
- user impact: mobile and narrow-tablet users initially lose the right side of
  required content and must pan horizontally; the explicit no-overflow and
  no-clipping acceptance gates fail.
- smallest proposed frontend correction: make the Hero, Overview and
  Specifications card boxes width-safe at narrow breakpoints by applying
  `box-sizing: border-box; width: 100%; max-width: 100%` (or the equivalent
  border-box constraint) so their padding and border are included within the
  available inline size. Retest `768`, `390` and `320` for
  `scrollWidth <= clientWidth`.

### O2 — 1440 Hero is under-used and breaks the product model inside `PVC`

- grade: `obvious`
- reproduce:
  1. Open `/products/fgd-x15-pvc` at CSS width `1440`.
  2. Inspect the Hero heading and the unused space to its right.
- exact evidence:
  - The page article provided `1248px` of content width, but the Hero card used
    only `754px`.
  - Its text column was fixed at `320px`.
  - The H1 rendered visually as `FGD` / `X15+PV` / `C Track`, splitting the
    exact model token `X15+PVC` between `V` and `C`.
- user impact: the primary product identity becomes materially harder to scan
  on the largest required viewport, while nearly `494px` of the article row is
  unused.
- smallest proposed frontend correction: let the desktop Hero use the
  available article width (or widen its text column) and remove word-internal
  wrapping from the H1 so line breaks may occur at spaces around
  `X15+PVC`, not inside the model token.

## Evidence Inventory

- `fgd-x15-pvc-1440.png` —
  `67fa01516ee19405d4db83499d59cdd6121a0730b5a69f0150c7b3e40d8603fa`
- `fgd-x15-pvc-1024.png` —
  `b0147a5e6bb9154537121b298411267b4bec7633d9360eea60782730c3c5c597`
- `fgd-x15-pvc-768.png` —
  `b8b9c9a106ea699df52b09d248ed404fab74fa30c910a76c7044149b5b526249`
- `fgd-x15-pvc-390.png` —
  `5542ac37f30fff059f666b50e05ca008ed78dd4f12aba50f85221b448c27eeef`
- `fgd-x15-pvc-320.png` —
  `11b897c12cce6237454bf154d12067b7a9340c151dfc2070b51d1bf7cd70d180`
- `focus-390-category.png` —
  `bcf0cf6b2c5a91715102ae8231e0e4efde5246ce5b36eba2b7ad4d35a72b160c`
- `focus-390-rfq.png` —
  `c2fc1a5e95db26e7685d977d1c53ed474ef103e094fd57b2d22c47fdfa0506cb`

## Boundary

The already-running shared port `3000` process was reused and left running. No
port `3001`, temporary copy or additional server was used. Browser viewport
override was reset and the recovery tab was finalized. No frontend, CSS, tests,
documentation, task authority, CMS, dependency, Git, deployment or external
system was modified.

---

# TASK-018 Visual QA Round 2

status: `PASS`
lane: `visual_qa`
request: `MSG-TASK-018-VISUAL-QA-R2`
delivery_key: `MSG-TASK-018-VISUAL-QA-R2:019f88d0-0f9c-7940-af93-f9eef03f92c8`
tested_at: `2026-07-31`
origin: `http://localhost:3000`

## Round 2 Verdict

`PASS / severe 0 / obvious 0 / detail 0`

The original `BLOCKED_NO_VISUAL_EVIDENCE` history and the evidence-backed
Round 1 `FAIL / severe 0 / obvious 2 / detail 0` above remain unchanged. Round
2 retested the two obvious findings against current shared bytes; both are
closed and no new graded difference was found.

## Responsive Measurements

| CSS viewport | R2 PNG | Article / Hero width | H1 rendered lines | `scrollWidth / clientWidth` | Result |
| --- | --- | --- | --- | --- | --- |
| 1440 | `1440 × 1809` | `1248 / 1248px` | `FGD X15+PVC` / `Track` | `1440 / 1440` | O2 closed |
| 1024 | `1024 × 1470` | `921.609375 / 921.609375px` | `FGD` / `X15+PVC` / `Track` | `1024 / 1024` | Regression pass |
| 768 | `768 × 2030` | `691.203125 / 691.203125px` | `FGD X15+PVC Track` | `768 / 768` | O1 closed |
| 390 | `390 × 1824` | `351 / 351px` | `FGD X15+PVC` / `Track` | `390 / 390` | O1 closed |
| 320 | `320 × 1861` | `298.953125 / 298.953125px` | `FGD` / `X15+PVC` / `Track` | `320 / 320` | O1 closed |

At every viewport:

- Hero, Overview and Specifications right edges remained inside
  `clientWidth`;
- the H1, protected image, notice, all five specification values and CTA had
  no horizontal clipping;
- the `X15+PVC` range produced one rendered client rectangle, proving the model
  token was never split internally;
- exactly five specification values remained present and readable.

## Closed Findings

### O1 — Responsive overflow and clipping: closed

- Round 1: `792/768`, `452/390` and `397/320`.
- Round 2: `768/768`, `390/390` and `320/320`.
- The three card containers and every required child ended within the viewport.
- No horizontal scrollbar, overlap or content clipping was measured.

### O2 — 1440 Hero width and model-token break: closed

- Round 1: Hero `754px` inside a `1248px` article; H1 rendered
  `FGD / X15+PV / C Track`.
- Round 2: Hero `1248px` inside the same `1248px` article; its columns measured
  `566.789px 512.805px`.
- H1 rendered `FGD X15+PVC / Track`; `X15+PVC` occupied one client rectangle.

## Interaction, Focus and Browser-Facing Gates

- RFQ CTA measured `44.09375 CSS px` high at all five widths.
- After bringing the CTA into view, its center hit-test resolved to the same
  `/request-a-quote/` anchor at all five widths.
- Natural link order remained:
  1. `Manual Curtain Tracks` →
     `/products/curtain-track-systems/manual-curtain-tracks/`;
  2. `Request a Quote` → `/request-a-quote/`.
- Both links retained `tabIndex 0`. Keyboard focus at 390 produced a visible
  `3px solid rgb(23, 23, 23)` outline wholly inside the viewport.
- Browser console warnings/errors: `0`.
- Observed browser assets: `19`, all same-origin; suspicious CMS/internal URLs:
  `0`. The only image asset was
  `/test-candidates/fgd-x15-protected.png`.
- Rendered markup checks remained false for WordPress/CMS origin,
  `wp-content`, Article Number, internal product code, raw payload and
  diagnostic text.

## Capture Method

The browser's native `fullPage` compositor retained a stale narrow paint while
the DOM correctly reported the requested viewport. Those provisional files
were not accepted. Each final R2 full-page file was rebuilt from fresh,
unscaled `900px`-high browser viewport captures at the exact CSS width:

- 1440 scroll positions: `0`, `800`, `909`;
- 1024: `0`, `570`;
- 768: `0`, `800`, `1130`;
- 390: `0`, `800`, `924`;
- 320: `0`, `800`, `961`.

Only vertical slices were joined at their measured document positions; no
horizontal resize or product-content alteration was applied. Repeated
scrollbar/thumb fragments at slice boundaries are capture-only artifacts and
are not page overflow.

## Round 2 Evidence Inventory

- `fgd-x15-pvc-r2-1440.png` —
  `e9c8e21a124824ee9e773d1aaf98fdbe36fce65eaffb49d87965c72b7a15f2a0`
- `fgd-x15-pvc-r2-1024.png` —
  `ec7ff5519c63a43d41931dea2807702b36708ffb7bd2a18166099aec06df1810`
- `fgd-x15-pvc-r2-768.png` —
  `96b5f3265388bca77590f8cee29537f69017030bacd8715a344a8c49402f0774`
- `fgd-x15-pvc-r2-390.png` —
  `2699ffae53aa904d2a1058432343e8888d501747d0129e0a3d13482ba1bcb129`
- `fgd-x15-pvc-r2-320.png` —
  `5186dd1b69cae5b58b0808d42eb192924d0ccefb79bf27fe869fa9a038453d6c`
- `focus-r2-390-category.png` —
  `98c75df26dba08fa4ba85ca9083be8cd15ec5e1cae05b9057f3749aca7f4c575`
- `focus-r2-390-rfq.png` —
  `64e91f67de9d909ce64d1fce94fd6089afe8240e88756e7782b45c26bcd109d5`

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

All 14 dimensions and SHA-256 values remain exactly those recorded in the
Round 1 and Round 2 inventories above.

## Boundary

The already-running shared port `3000` process was reused and left running.
Viewport override was reset and all QA tabs were finalized. No server was
started or stopped. No frontend, CSS, tests, documentation, task authority,
CMS, dependency, Git, deployment or external system was modified.
