# TASK-017 Visual QA Result

status: `FAIL`
lane: `visual_qa`
request: `MSG-TASK-017-VISUAL-QA-R1`
delivery_key: `MSG-TASK-017-VISUAL-QA-R1:019f88d0-0f9c-7940-af93-f9eef03f92c8`

## Result

`FAIL` — 严重差异 `0`，明显差异 `1`，细节差异 `1`。

Canonical evidence and the complete screenshot inventory are in:

- `QA/TASK-017/VISUAL_QA_REPORT.md`
- `QA/TASK-017/products-1440.png`
- `QA/TASK-017/products-1024.png`
- `QA/TASK-017/products-768.png`
- `QA/TASK-017/products-390.png`
- `QA/TASK-017/products-320-reflow.png`
- `QA/TASK-017/products-1024-cta-missing.png`
- `QA/TASK-017/focus-1024-action.png`
- `QA/TASK-017/focus-390-media.png`

## Blocking Finding

At a fresh 1024 CSS px render, the `View Product` action is 44 px high in the DOM but only approximately `0.4375 px` intersects the clipping card. The card's `overflow: hidden` makes the CTA visually absent. Keyboard focus forces it to reflow inside the card, but that does not repair the initial pointer-visible state.

Smallest recommended correction: apply `.cardBody { height: auto; }` at the existing `max-width: 64rem` two-column breakpoint, then rerun the 1024/768 and focus/target-size gates.

## Other Results

- Grid: `3 / 2 / 2 / 1 / 1` columns at `1440 / 1024 / 768 / 390 / 320`.
- 320 reflow: `innerWidth 320`, `scrollWidth 320`, no horizontal overflow.
- Protected image: visible, unclipped, `object-fit: contain`, natural `800 × 800`, meaningful English Alt, frozen SHA-256 preserved.
- Semantics: one main/h1/list/list-item/article, two term-definition pairs.
- Links: meaningful names, natural media → title → action order, `tabIndex 0`.
- Focus: 3 px solid indicator on all links; media-link outline is clipped on three sides and recorded as one detail difference.
- Action target: 44 CSS px at all widths.
- Notice and content: visible local-test notice, fixed English content.
- Console warnings/errors: zero.
- Local server stopped after capture.

---

# Round 2 Retest Result

status: `PASS`
lane: `visual_qa`
request: `MSG-TASK-017-VISUAL-QA-R2`
delivery_key: `MSG-TASK-017-VISUAL-QA-R2:019f88d0-0f9c-7940-af93-f9eef03f92c8`

## Result

`PASS` — 当前严重差异 `0`，明显差异 `0`，细节差异 `0`。

Round 1 的 `FAIL / 严重 0 / 明显 1 / 细节 1` 及全部原始证据保留不变。Round 2 只复测 1024/768/390 CTA 与 focus gates；两个 Round 1 finding 均已关闭，没有引入新的严重或明显差异。

## Controlled Evidence

- 1024 fresh load: card `bottom 1133.1875`; CTA `top 1066.1875 / bottom 1110.1875 / height 44`; CTA/card intersection `44 px`; `pointer-events: auto`; CTA center hit-test resolves to the `View Product` anchor.
- 768 fresh load: CTA height/intersection `44 / 44 px`; complete card and content remain unclipped.
- 390 fresh load: CTA height/intersection `44 / 44 px`; complete card and content remain unclipped.
- Horizontal overflow: none at `1024 / 768 / 390`.
- Computed grid columns: `2 / 2 / 1`.
- Natural focus order remains media → title → action; all three links have `tabIndex = 0` and were independently keyboard-focused in order with visible 3 px solid indicators.
- 390 media focus: `outline-offset: -3px`; computed top/right/left gaps are `4 px`, with the bottom edge also inside the card. All four sides are visible in `focus-r2-390-media.png`.
- Browser viewport was reset, test tab closed and Node preview server stopped after capture.

The browser container's global Tab injection did not advance from `body`, so it was excluded from product evidence. The supported per-target keyboard action, DOM order, active-element checks, computed focus styles and screenshots are recorded in the canonical report.

## Round 2 Artifacts

- `QA/TASK-017/products-r2-1024.png`
- `QA/TASK-017/products-r2-768.png`
- `QA/TASK-017/products-r2-390.png`
- `QA/TASK-017/focus-r2-1024-media.png`
- `QA/TASK-017/focus-r2-1024-title.png`
- `QA/TASK-017/focus-r2-1024-action.png`
- `QA/TASK-017/focus-r2-390-media.png`
- `QA/TASK-017/VISUAL_QA_REPORT.md`

## Closure

- Round 1 obvious finding: **CLOSED**.
- Round 1 detail finding: **CLOSED**.
- Current counts: `severe 0 / obvious 0 / detail 0`.
