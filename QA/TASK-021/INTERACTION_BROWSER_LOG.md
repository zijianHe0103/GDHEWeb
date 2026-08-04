# TASK-021 Interaction and Browser Log

- controlled request: `MSG-TASK-021-VISUAL-QA-R1`
- delivery key: `MSG-TASK-021-VISUAL-QA-R1:019f88d0-0f9c-7940-af93-f9eef03f92c8`
- tested URL: `http://127.0.0.1:3000/products/fgd-x15-pvc`
- runtime ownership: Planner-owned; the visual lane did not start, stop or reconfigure it
- browser: clean Google Chrome Guest window, Console and Network recording enabled before navigation
- input rule: one minimum click to enter Guest mode; native system-level keys only afterward

## Native keyboard observations

Continuous `Tab` order from the page:

1. `Manual Curtain Tracks`
2. `Configure & Add to Quote`
3. `6 m`
4. `Base packaging`
5. `Customer Logo Printing`
6. `Protection arrangement`
7. `Quantity`
8. `Add to Quote`
9. Chrome `Tab Search`

Focus was visible on interactive controls. Native `Space` on `6 m` changed its accessibility value to selected, but `Color` remained `Choose a track length first`. Native `Right Arrow` moved selection to `Custom Length`, but no custom-length input appeared and `Color` remained disabled. Native `Enter` on the focused `Add to Quote` button performed the browser's default GET form submission, changed the canonical URL to `/products/fgd-x15-pvc?`, reset the page and produced no inline validation errors.

These observations close the keyboard-channel question: real native key events reached the browser, but the configurator was not hydrated. Standard, custom and invalid-state acceptance gates therefore could not pass.

## Browser boundary observations

- 20 unique inspected asset URLs were all same-origin `127.0.0.1:3000`.
- No browser request targeted WordPress, `wp-json`, Feishu, ProductCard, a submission endpoint or another external origin.
- Chrome Console repeatedly reported the same-origin webpack HMR WebSocket handshake as `net::ERR_INVALID_HTTP_RESPONSE`.
- `GET /__nextjs_font/geist-latin.woff2` returned `403 Forbidden`.
- The inline Next/Flight client payload contained `GDHEPRD000172` and `21000000-0000-4000-8000-000000000001`. Neither value was visible in body text, but both entered browser-facing document bytes.

## Responsive and motion observations

At 1440, 1024, 768, 390 and 320 CSS px, `document.scrollingElement.scrollWidth == clientWidth`; no horizontal-overflow offender was found. Body text measured 16 CSS px. `Add to Quote` measured 44.09375 CSS px high and its center hit-test returned the button at every width. The rendered page had no nonzero animation or transition, so reduced-motion did not hide or block essential behavior.

Formal full-page files are exact-width, unscaled vertical composites made from browser viewport captures after paint waits. Join points are vertical-only; repeated scrollbar fragments at join points are capture artifacts, not page overflow.
