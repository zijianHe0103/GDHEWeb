# TASK-021 Visual QA Round 2 Browser Log

- controlled request: `MSG-TASK-021-VISUAL-QA-R2`
- delivery key: `MSG-TASK-021-VISUAL-QA-R2:019f88d0-0f9c-7940-af93-f9eef03f92c8`
- tested URL: `http://127.0.0.1:3000/products/fgd-x15-pvc`
- executed at: `2026-08-04T16:56:25Z`
- runtime: Planner-owned; visual_qa did not start, stop or reconfigure it
- browser context: new Google Chrome Guest window; Console and Network recording were active before canonical navigation
- input: one click to enter Guest mode, then native system-level keyboard for the complete invalid, standard and custom configuration chain

## Hydration and native keyboard

Continuous initial Tab order was:

1. `Manual Curtain Tracks`
2. `Configure & Add to Quote`
3. `6 m`
4. `Base packaging`
5. `Customer Logo Printing`
6. `Protection arrangement`
7. `Quantity`
8. `Add to Quote`

Native Enter on the default state kept the canonical URL unchanged and exposed four stable inline errors: choose Track Length, choose an available Color, choose Base Packaging, and enter a positive whole-number Quantity. Focus remained visibly on Add to Quote.

Native radio operation proved hydration:

- Selecting `Custom Length` exposed the Custom length input and `Ivory White`.
- Left Arrow selected `6 m`, removed the Custom input, and retained `Ivory White` as the only available Color.
- Standard keyboard configuration selected `6 m`, `Ivory White`, `Standard Packaging`, quantity `2`; native Enter produced one complete latest temporary quote item.
- Right Arrow switched to `Custom Length`; native Tab reached its input, `5.8` was typed, and native Enter produced one latest item with `Custom Length / 5.8 m / Ivory White`.
- After custom submission, `Latest temporary quote item` count was `1` and `Standard Length` count was `0`, proving replacement rather than append.
- Canonical URL stayed unchanged throughout. A fresh reload returned latest-item count `0` and Custom value count `0`, proving the draft was not persisted.

## Browser boundary and Console

- Initial load and final custom state each showed `24 requests`; keyboard submissions added zero requests.
- Every page request was same-origin `127.0.0.1:3000`; no WordPress, `wp-json`, Feishu, external, storage or submission request appeared.
- A fresh reload showed 22 current requests because cached resources were omitted. All current rows were same-origin and successful: document/assets/font HTTP 200 and HMR WebSocket `101 Switching Protocols`.
- `/__nextjs_font/geist-latin.woff2` returned HTTP 200.
- Console contained two informational development messages only: the React DevTools suggestion and `[HMR] connected`. There were zero unexpected warnings or errors.

Direct top-context inspection of `document.documentElement.innerHTML`, all script text/Flight bytes, and `document.body.innerText` returned `false` in all three surfaces for:

- `GDHEPRD000172`
- `21000000-0000-4000-8000-000000000001`
- `articleNumber`
- `wordpress`
- `wp-json`
- `feishu`
- `internal`
- `diagnostic`

## Responsive and reduced-motion measurements

Chrome DevTools Responsive mode was set to each exact CSS width. Each evidence screenshot visibly records the emulated width and the corresponding top-context measurement.

| CSS width | clientWidth | scrollWidth | overflow offenders | body font | CTA height | center hit | rendered motion |
|---:|---:|---:|---:|---:|---:|---|---:|
| 1440 | 1440 | 1440 | 0 | 16px | 44.09375px | true | 0 |
| 1024 | 1024 | 1024 | 0 | 16px | 44.09375px | true | 0 |
| 768 | 768 | 768 | 0 | 16px | 44.09375px | true | 0 |
| 390 | 390 | 390 | 0 | 16px | 44.09375px | true | 0 |
| 320 | 320 | 320 | 0 | 16px | 44.09375px | true | 0 |

At 320 CSS px, DevTools explicitly emulated `prefers-reduced-motion: reduce`; `matchMedia` returned `true`, rendered nonzero animation/transition count remained `0`, and `scrollWidth/clientWidth` remained `320/320`.

## Capture disclosure

All 13 Round 2 screenshots are the browser-control channel's actual JPEG/JFIF bytes, `956 x 768`, magic `ffd8ffe000104a46`, retained under their original `.png` filenames. No file was renamed or silently re-encoded. The five responsive screenshots are Chrome DevTools device-emulation records, not replacements for the preserved Round 1 exact-width full-page PNG composites.
