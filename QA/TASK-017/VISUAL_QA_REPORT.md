# TASK-017 Visual QA Report

status: `FAIL`
lane: `visual_qa`
request: `MSG-TASK-017-VISUAL-QA-R1`
delivery_key: `MSG-TASK-017-VISUAL-QA-R1:019f88d0-0f9c-7940-af93-f9eef03f92c8`
tested_at: `2026-07-31`

## Verdict

`FAIL` — 严重差异 `0`，明显差异 `1`，细节差异 `1`。

TASK-017 的网格断点、320 reflow、受保护图片、固定英文内容、语义结构、链接命名和 44 CSS px CTA 尺寸均通过；但 1024 CSS px 初始渲染会把 CTA 几乎完全裁出卡片。根据派发规则，存在一个未解决的明显差异，因此不能 PASS。

## Runtime Evidence

- Command boundary: existing `frontend/` only, Node `24.18.0`, `GDHE_PRODUCT_LIST_MODE=preview`, `npm run dev`.
- Local URL: `http://localhost:3000/products/`.
- Next.js: `16.2.11`.
- Server ready: `394 ms`.
- First `/products` request: HTTP `200`, `1769 ms`; subsequent observed requests: HTTP `200`, approximately `24–134 ms`.
- Browser console warnings/errors: `0`.
- Local server was stopped after capture.
- No frontend, CMS, Planner state, Git, deployment or external-system write was made.

## Responsive Matrix

| CSS viewport | document width | horizontal overflow | computed columns | image box | CTA initial state |
|---|---:|---|---:|---:|---|
| 1440 | 1440 | no | 3 | 395.33 × 395.33 | visible, 44 px |
| 1024 | 1024 | no | 2 | 448.56 × 448.56 | **clipped / not visibly rendered** |
| 768 | 768 | no | 2 | 335.60 × 335.60 | visible, 44 px |
| 390 | 390 | no | 1 | 349 × 349 | visible, 44 px |
| 320 | 320 | no | 1 | 286 × 286 | visible, 44 px |

At 320 CSS px, `window.innerWidth = 320`, `document.documentElement.scrollWidth = 320`, and no horizontal overflow was observed. Long heading, summary, attributes and CTA reflowed without clipping or overlap.

## Semantics And Accessibility

- Structure: one `main`, one `h1`, one semantic list, one list item, one `article`, two `dt` and two `dd`.
- Natural keyboard order is:
  1. `View FGD X15+PVC Track`
  2. `FGD X15+PVC Track`
  3. `View Product`
- All three product links have `tabIndex = 0`, meaningful names and the same safe candidate target `/products/fgd-x15-pvc/`.
- Direct keyboard focus verification produced a `3 px` solid dark focus indicator for media, title and action links.
- The action target is exactly `44 CSS px` high at all acceptance widths.
- The protected image is visible, complete, not distorted or clipped, uses `object-fit: contain`, retains natural `800 × 800` dimensions and has non-empty English Alt:
  `Protected FGD X15 curtain track cross-section showing 28 by 27 millimetre dimensions`.
- Protected image SHA-256:
  `9a8ed9fe7145ae582450425be493987ad874d052c176e340d28d7d24bf0d4880`.
- The visible notice is exactly `Local test candidate — not production catalog`; all inspected content is English.

## Findings

### 明显差异 1 — 1024 px 初始渲染裁掉 CTA

Evidence:

- On a fresh 1024 × 900 load, after scrolling to the card bottom, the action rectangle is `top 840.25 / bottom 884.25 / height 44`.
- The clipping card ends at `840.6875`, leaving only approximately `0.4375 px` of the CTA inside the card.
- The card uses `overflow: hidden`; the CTA is therefore not visibly rendered and is not available as a normal pointer target.
- `products-1024.png` and `products-1024-cta-missing.png` reproduce the missing CTA.
- Direct keyboard focus forces a reflow and moves the same 44 px action inside the card; `focus-1024-action.png` records that state. Focus recovery does not correct the initial visual/pointer failure.

Relevant implementation:

- `product-card.module.css:65-67` — fixed card height plus `overflow: hidden`.
- `product-card.module.css:99-106` — calculated card-body height.
- `product-card.module.css:182-188` — CTA uses `margin-top: auto`.
- `product-card.module.css:224-237` — two-column breakpoint does not switch `.cardBody` to `height: auto`; only the one-column breakpoint does.

Smallest recommended frontend correction:

Move or repeat `.cardBody { height: auto; }` in the `max-width: 64rem` two-column breakpoint, then rerun 1024 and 768 screenshots plus the 44 px/focus checks. Do not change content or component semantics.

### 细节差异 1 — media-link focus ring is clipped on three sides

The media link receives a `3 px` solid focus outline with a `3 px` offset, but the enclosing card clips overflow. At 390 px, only the lower focus edge is clearly visible (`focus-390-media.png`); the top and side edges are clipped. The focus indicator remains detectable, so this is graded as a detail difference rather than an obvious difference.

Smallest recommended frontend correction:

Use an inset/negative-offset focus treatment for the media link, or otherwise keep its focus ring inside the clipping card without changing the card’s visual radius.

## Screenshot Inventory

The Browser full-page exporter incorrectly scaled content when used directly. Each required full-page artifact was therefore captured from the same exact CSS width as overlapping 900 px browser viewports and losslessly stitched under `QA/TASK-017/`. Fixed Next.js development controls and scrollbar segments may repeat at stitch boundaries; they are local capture artifacts, not product findings.

| Artifact | Pixel dimensions | SHA-256 |
|---|---:|---|
| `products-1440.png` | 1440 × 1198 | `557c6eb5fe88e3982949b3be2dd8130d2aea4175fbb06ea3ef3a5f53030be376` |
| `products-1024.png` | 1024 × 1192 | `e4dddc5a3b00657e97383315f8c328f201422739ebcfe2ec297a4b80141140ae` |
| `products-768.png` | 768 × 1021 | `be333c1ac6c56e47acfe8eb91fece3c3250e2b78b0c19dbc9bcf4cc3c2dd4c7c` |
| `products-390.png` | 390 × 1023 | `e2e32e383e2e9746f28213fbe46eed97300265bbe27c7626f2bbe321f25defd7` |
| `products-320-reflow.png` | 320 × 983 | `9a876023ebc28cff3c9e5890e4281db7c8a69f87d3355e605c0fbb9a9a5f9ad9` |
| `products-1024-cta-missing.png` | 1024 × 900 | `6b125f49e1213dee0915e37117fab7a977fbb0e5e2e7a607bda826b1c4f84ab4` |
| `focus-1024-action.png` | 1024 × 900 | `bc4a4aa11eee619741167feadb3428295bcdd31b0cc428238cebc52efe36277f` |
| `focus-390-media.png` | 390 × 900 | `af2c920cc54f8873658acb99b8bf28806559b44ee67be093ffddaf7b9bc91b06` |

## Retest Gate

After the frontend lane applies the narrow responsive-height correction, visual QA should rerun only:

1. 1024 full-page initial render and bottom-card pointer visibility.
2. 768 regression screenshot.
3. Media/title/action keyboard focus and CTA `44 px` measurement.
4. 390 media-link focus indicator if the detail finding is included in the correction.

---

# Round 2 Retest

status: `PASS`
lane: `visual_qa`
request: `MSG-TASK-017-VISUAL-QA-R2`
delivery_key: `MSG-TASK-017-VISUAL-QA-R2:019f88d0-0f9c-7940-af93-f9eef03f92c8`
tested_at: `2026-07-31`

## Round 2 Verdict

`PASS` — 当前严重差异 `0`，明显差异 `0`，细节差异 `0`。

Round 1 的 `FAIL / 严重 0 / 明显 1 / 细节 1` 历史及原始截图保留不变。Round 2 仅复测派发指定的 1024/768/390 CTA 与 focus gates；两个 Round 1 finding 均已关闭，且没有引入新的严重或明显差异。

## Round 2 Runtime

- Existing `frontend/` only; Node `24.18.0`; `GDHE_PRODUCT_LIST_MODE=preview`; `npm run dev`.
- Local URL: `http://localhost:3000/products/`.
- Next.js `16.2.11`, ready in `318 ms`; all recorded Round 2 page requests returned HTTP `200`.
- Browser viewport override was reset, the test tab was closed, and the local server was stopped after capture.
- No frontend product code, CMS, Planner state, README, Git, deployment or external system was changed.

## CTA And Responsive Evidence

| CSS viewport | document width | horizontal overflow | computed columns | CTA height | CTA/card intersection | result |
|---|---:|---|---:|---:|---:|---|
| 1024 | 1024 | no | 2 (`450.562 / 450.570`) | 44 px | 44 px | PASS |
| 768 | 768 | no | 2 (`337.602 / 337.602`) | 44 px | 44 px | PASS |
| 390 | 390 | no | 1 (`351`) | 44 px | 44 px | PASS |

Fresh-load 1024 geometry before focus:

- card: `top 356.40625 / bottom 1133.1875 / height 776.78125`
- CTA: `top 1066.1875 / bottom 1110.1875 / height 44 / width 133.0625`
- visible CTA/card intersection: `44 px`
- computed pointer events: `auto`
- center-point hit test resolved to the `View Product` anchor at `/products/fgd-x15-pvc/`

The fresh 768 and 390 captures likewise show the complete card, content and CTA with no clipping.

## Keyboard And Focus Evidence

The DOM natural order remains:

1. media link `View FGD X15+PVC Track`
2. title link `FGD X15+PVC Track`
3. action link `View Product`

All three links have `tabIndex = 0`. Each was keyboard-focused in that order with the browser's supported locator `press` action, and `document.activeElement` independently confirmed the expected target:

- media: `3 px solid rgb(23, 23, 23)`, `outline-offset: -3px`
- title: `3 px solid rgb(23, 23, 23)`, `outline-offset: 3px`
- action: `3 px solid rgb(23, 23, 23)`, `outline-offset: 3px`; target remains `44 px` high

At 390 px, the focused media link sits one CSS pixel inside the card and uses the `-3 px` inset outline. The computed visible outline gaps inside the card are:

- top `4 px`
- right `4 px`
- bottom `324.6953125 px`
- left `4 px`

The fresh focus screenshot visually confirms all four sides remain inside the clipping card. This closes the Round 1 detail finding.

The in-app browser container's global Tab injection did not advance focus from `body`; it was not used as product evidence. The supported per-target keyboard action, DOM order, `tabIndex`, active element, computed focus style and screenshots provide the controlled focus-gate evidence.

## Round 2 Screenshot Inventory

| Artifact | Pixel dimensions | SHA-256 |
|---|---:|---|
| `products-r2-1024.png` | 1024 × 1300 | `e4152ed2bc28792b7d8ad2a80f6d127c28ae0c969f93ab6fb585ba34c9a17b73` |
| `products-r2-768.png` | 768 × 1300 | `f8cae0aa7c28fcf4f88cdebf3df0fe343cf42819a3d1a70db9a1bdf365a433d9` |
| `products-r2-390.png` | 390 × 1300 | `8e95aa3a540ffec1cd2ed7eeff92ccd4b34dfcf751f8eacdd1a45643bda63ab8` |
| `focus-r2-1024-media.png` | 1024 × 1300 | `cbadb54995bf646bb7579e839385347808b36d267f59d7ba199133d89f651614` |
| `focus-r2-1024-title.png` | 1024 × 1300 | `5b8d51cc816d2c72e761b8e3622908c2835aaa39df3888909fb76b46838d7eaa` |
| `focus-r2-1024-action.png` | 1024 × 1300 | `c46d039558fd562b8563498ff96094f9b9f1363b3b687b7a03636637a96de95d` |
| `focus-r2-390-media.png` | 390 × 1300 | `aa3494d597ba4786f794011ea188130c24724ac11285e6280fbc756aabf9ab24` |

## Round 2 Finding Closure

- Round 1 obvious finding, 1024 fresh-load CTA clipping: **CLOSED**.
- Round 1 detail finding, media focus outline clipped on three sides: **CLOSED**.
- New severe differences: `0`.
- New obvious differences: `0`.
- New detail differences: `0`.
