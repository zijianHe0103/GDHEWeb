# TASK-022 Browser Interaction Log

- Controlled request: `MSG-TASK-022-VISUAL-QA-R1`
- Runtime: Planner-owned `http://127.0.0.1:3000`; no server lifecycle action.
- Browsers: isolated in-app browser for deterministic full-page/state evidence; fresh Chrome Guest for native system-key, AX, Console, Network, localStorage and reduced-motion evidence.

## Real state flow

1. Loaded `/request-a-quote` with clean browser storage: authentic empty state and explicit `Nothing has been submitted.`
2. On `/products/fgd-x15-pvc`, keyboard/mouse-independent browser automation selected `6 m / Ivory White / Standard Packaging / quantity 2`; Add produced `Added to your Quote Basket.` and one line without navigation.
3. Repeated the identical add at quantity 2: one matching line remained and quantity became 4; live text was `Updated the matching Quote Basket item.`
4. Changed only Customer Logo Printing to Yes and added quantity 2: a second distinct line appeared.
5. Reloaded Basket: both lines persisted. A separately opened Basket tab immediately recovered the same stored lines.
6. Changed the first line from 3 to 4 in one Basket tab: the other tab changed to 4 and announced `Quote Basket updated in another tab.` without an external request.
7. Removed the first line: the second tab retained exactly one quantity-2 line and the peer tab synchronized it. Removed the final line: both tabs returned to empty.
8. Forced activation of the disabled `Request a Quote` button kept the canonical URL, produced zero resource-entry delta and retained both negative notices; it was `disabled`, `type=button` and outside any form.

## Native keyboard and AX evidence

- Fresh Chrome Guest, one initial click to open Guest; the page test itself used native Tab, Shift+Tab, Space, Left/Right, Up and Return.
- Continuous product focus order: category link -> Hero CTA -> `6 m` -> packaging -> logo -> protection -> quantity -> Add -> View Quote Basket. Dependent Ivory White became the next focusable control after choosing 6 m.
- Native Right selected Custom Length and native Left restored 6 m; AX exposed the selected radio as `Value: 1` each time.
- Native keyboard selected Ivory White and Standard Packaging, entered quantity 1 and pressed Return on Add. AX exposed `Added to your Quote Basket. 1 quote basket line` while focus stayed on Add.
- Native Tab reached View Quote Basket; Return navigated to the canonical `/request-a-quote` route. Basket focus order exposed the protected-image link, title link, quantity stepper and Remove; the disabled submission button was skipped.
- Native Up changed quantity 1 to 2; native Tab focused Remove and Return restored the empty state.
- Focus screenshots show the Add and Remove focus indicators. Live regions directly announced add, matching merge, quantity update, cross-tab update and removal.

## Responsive, motion and browser boundary

- Basket N-state measurements at 1440/1024/768/390/320 were exact: `innerWidth == clientWidth == scrollWidth`; no overflow offender was found and body text stayed 16 px.
- Product success at 1440 and 390 also had `scrollWidth == clientWidth`; Add CTA was 44.09375 px high and its geometric center hit the button.
- Chrome device mode was exactly 320 CSS px. Keyboard-selected `prefers-reduced-motion: reduce` returned `matchMedia(...).matches=true`, `320/320/320`, and zero rendered non-zero animation/transition durations.
- Protected media remained the same-origin `/test-candidates/fgd-x15-protected.png` through Next image optimization, with exact alt `Protected FGD X15+PVC curtain track cross-section` and natural 800 x 800 evidence.
- Clean Guest Console contained only the React development notice and `[HMR] connected`, with no error. The in-app browser recorded a development-only Next LCP advisory warning, not a console error or product failure.
- Recorded Guest Network rows were same-origin 304 stylesheet revalidations. In-app asset inventories were same-origin. No external, WordPress/wp-content/wp-json, Feishu, media-host, per-item CMS or submission endpoint request was observed.
- `localStorage['gdhe.quote-basket.v1']` was 806 bytes and contained only public Basket data plus expected browser-generated writer/mutation/entry UUIDs. Marker scan returned `bad: []` for Article Number, `GDHEPRD000172`, stable Product/Media UUID, `articleNumber`, WordPress, Feishu, internal/diagnostic, price, PII and secret terms.
- Independent document, Flight/script and visible-DOM scans each returned empty marker lists. Basket media, negative submission wording and disabled button remained public-only.

## Capture disclosure

All 15 screenshots are JPEG/JFIF bytes under `.png` names. `file`, magic bytes, dimensions and SHA-256 were independently checked after capture; no image was renamed, re-encoded or edited.
