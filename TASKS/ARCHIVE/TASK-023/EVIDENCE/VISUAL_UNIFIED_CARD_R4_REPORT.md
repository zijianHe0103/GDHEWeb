# TASK-023 Unified Card Visual QA Round 4

Date: 2026-08-08
Lane: `visual_qa`
Request: `MSG-TASK-023-VISUAL-QA-UNIFIED-CARDS-R4`
Delivery key: `MSG-TASK-023-VISUAL-QA-UNIFIED-CARDS-R4:019f88d0-0f9c-7940-af93-f9eef03f92c8`

## Result

- Verdict: `PASS`
- Severe: `0`
- Obvious: `0`
- Detail: `0`
- Tested preview: Planner-owned `http://127.0.0.1:3000/products/fgd-x15-pvc`
- Preserved history: Visual Round 1 `FAIL / 0 / 1 / 0`, Round 2 `FAIL / 0 / 1 / 0`, Round 3 `PASS / 0 / 0 / 0`; the canonical prior manifest remained `50/50` valid before this revision.

## Unified card geometry and reflow

Both truthful actions now use the same visible card format: `article > figure + information body + footer action`. The media regions are equal within each row, the information regions absorb copy length, and `View Product` links and `Add to Quote` buttons are bottom-aligned, full-width controls with a measured 44 CSS px height. The recommendation section has zero quantity label, input or inline quantity error at every inspected width.

| CSS px | Columns | `inner/client/scroll` | Row card delta | Media delta | Action-bottom delta | Clipping/offender |
| ---: | ---: | --- | ---: | ---: | ---: | ---: |
| 1440 | 3 | `1440/1440/1440` | `0` | `0` | `0` | `0` |
| 1024 | 2 | `1024/1024/1024` | `0` | `0` | `0` | `0` |
| 768 | 2 | `768/768/768` | `0` | `0` | `0` | `0` |
| 390 | 1 | `390/390/390` | `0` | `0` | `0` | `0` |
| 320 | 1 | `320/320/320` | `0` | `0` | `0` | `0` |

Initial load displayed three cards. The first reveal displayed six and retained focus on `Show More Products`, with live text `3 more products shown.` The second reveal displayed seven, removed the button, moved focus to candidate 7 `View Product`, and exposed live text `1 more products shown.` Order and URL stayed stable. The settled browser-visible asset inventory remained `23 -> 23`; no CMS, related-collection endpoint or per-card resolve request was added by either reveal.

## Accessory and Basket flow

One deliberate Wall Bracket `Add to Quote` action announced `Wall Bracket added to your Quote Basket.` The recommendation card contained no quantity UI. Quote Basket opened with exactly one protected `Catalog accessory` line and quantity `1`; the Basket-owned input accepted `3`, then Remove returned the Basket to empty and announced `Item removed from your Quote Basket.` No price, payment, checkout, form submission or external request appeared, and `Request a Quote` remained disabled.

## Return behavior

At 390 CSS px, six cards were revealed and the source state was recorded at `scrollY=5244`, with Glider Set at viewport top `296.484375`. A real coordinate pointer activation at the center of the canonical candidate-5 action navigated to `http://127.0.0.1:3000/products/test-candidate-5`. Neither the href nor final URL contained a return query parameter. Browser Back restored six visible cards, `scrollY=5244` and the same recommendation position; measured scroll, section and card-position deltas were all exactly `0`.

The files named `return-source/restored-390` and `return-source/restored-visible-390` are retained diagnostic automation captures. Their locator-assisted activation auto-scrolled the element and therefore is not the acceptance proof. The authoritative pair is `return-source-pointer-390` and `return-restored-pointer-390`, created through the true coordinate pointer path and byte-identical at the restored source position.

## Input, accessibility and browser boundaries

- Fresh Chrome Guest native Tab order reached configuration Add, View Quote Basket, candidate 1 View Product, Wall Bracket Add to Quote, candidate 3 View Product and Show More without a mouse after window focus. Visible focus was present on the mixed card action and Show More.
- Native Return preserved Show More focus after the first reveal and moved focus to candidate 7 after the final reveal. Polite live-region text matched the two reveal counts exactly.
- Explicit `prefers-reduced-motion: reduce` at 320 CSS px returned `reduced=true`, `clientWidth=scrollWidth=320` and zero moving elements; emulation was restored afterward.
- Fresh Guest Console showed two informational development messages (React DevTools and HMR connected), with zero error. Repeated in-app preview reloads retained the already known Next development-only LCP advisory for the protected placeholder; it is not a new product difference and is not graded.
- Page Network rows were same-origin only. A `chrome-devtools-frontend.appspot.com` URL belonged to the DevTools UI container, not the inspected page, and was excluded from page traffic. No WordPress, `wp-json`, Feishu/Lark, CMS, per-card resolve, submission or external page request occurred.
- Document, inline Flight/script content and visible DOM scans found no Article Number, `articleNumber`, UUID, GDHEPRD identity, WordPress/Feishu marker, raw diagnostic/request id/stack, price, payment, checkout or `/resolve` leakage.
- Browser evidence directly proves one rendered related collection and zero browser-facing collection/per-card request during reveal. The server-only one-collection call remains corroborated by the current Planner checkpoint rather than claimed as a browser-observable network fact.

## Evidence and encoding

Thirty-one new files are isolated under `QA/TASK-023/unified-card-r4/`. All have actual JPEG/JFIF bytes under `.png` names with magic prefix `ffd8ffe000104a4649460001`. In-app-browser captures use density `1x1`; native Chrome Guest captures are `956x768` at density `72x72`. Full-page dimensions are:

| State | 1440 | 1024 | 768 | 390 | 320 |
| --- | --- | --- | --- | --- | --- |
| Initial 3 | `1440x3955` | `1024x4275` | `768x4732` | `390x5144` | `320x5321` |
| Final 7 | `1440x5272` | `1024x5616` | `768x5838` | `390x7355` | `320x7602` |

The six-card 1440 capture is `1440x4648`; the quantity-1 Basket capture is `390x1195`; remaining in-app viewport captures are their named CSS width by `1000`. Exact SHA-256 values are in `QA/TASK-023/unified-card-r4/EVIDENCE_INVENTORY.sha256` and `VISUAL_UNIFIED_CARD_R4_MANIFEST.sha256`. No historical QA image, report section or canonical manifest entry was changed.

## Boundary and checkpoint

No frontend, CSS, test, contract, CMS, Planner authority, dependency, Git, deployment or external-system mutation was performed. The Planner-owned server was not started, stopped or reconfigured. This PASS is the independent unified-card Visual QA checkpoint only; it is not adversarial review, user acceptance, Git delivery or deployment authorization.
