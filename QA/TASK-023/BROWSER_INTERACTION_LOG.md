# TASK-023 Browser Interaction Log

- Controlled request: `MSG-TASK-023-VISUAL-QA-R1`
- Runtime: Planner-owned `http://127.0.0.1:3000`; no server lifecycle action.
- Browsers: isolated in-app browser for exact-width full-page/state evidence; fresh Chrome Guest for native system-key, accessibility, Console, Network, storage and reduced-motion evidence.

## Progressive disclosure and responsive layout

1. Clean loads at 1440/1024/768/390/320 CSS px showed exactly Ceiling Bracket, Wall Bracket and Track Connector in stable order, followed by `Show More Products`.
2. First pointer activation revealed exactly End Stop, Glider Set and Curve Section without navigation, resource-entry delta, refresh or reorder. The control remained and focus stayed on it; the live region announced `3 more products shown.`
3. Second pointer activation revealed exactly Suspension Kit. The control disappeared, focus moved to Suspension Kit's newly revealed `View Product` action, and the live region announced `1 more products shown.`
4. The same 3 -> 6 -> 7 progression and both focus outcomes passed with native Return in clean Chrome Guest.
5. Measured grids were 3 columns at 1440, 2 at 1024 and 768, and 1 at 390 and 320. Every width had `innerWidth == clientWidth == scrollWidth`; no horizontal overflow offender was found and body text stayed 16 px.

## Cards, quantities and Quote Basket

- All seven cards retained stable TEST_CANDIDATE names/models and the explicit notice `Protected TEST_CANDIDATE — not production product data`.
- Every card image resolved through the same-origin protected placeholder, was naturally 800 x 800, and exposed a distinct descriptive alt. No remote or internal-original media was requested.
- Accessory inputs had visible labels in the form `Quantity (piece)`. Values `0`, `-1`, `1.5` and `9007199254740992` kept Add disabled; positive safe integer `2` enabled it.
- Adding Wall Bracket quantity 2 did not navigate or create a network resource. The live region announced `Wall Bracket added to your Quote Basket.` and a related-section `View Quote Basket` action appeared.
- The Basket represented Wall Bracket as `Catalog accessory`, quantity 2, without fabricated length/color/packaging. Quantity changed to 3 and Remove deleted the accessory while announcing `Item removed from your Quote Basket.` Protected media remained local and `Request a Quote` stayed a disabled non-submission button.

## Native keyboard, focus and reduced motion

- After the minimum Guest/window activation click, page testing used native Tab and Return only. Continuous focus order reached the page's existing product controls, Ceiling Bracket View Product, Wall Bracket quantity, Track Connector View Product and Show More; disabled accessory Add was correctly skipped.
- Native Return on the first Show More retained visible focus on the button. Native Return on the final Show More moved visible focus to Suspension Kit View Product.
- After a fresh load, native Tab reached Wall Bracket quantity; typing `2`, Tab and Return reached and activated the newly enabled Add control. The live region and View Quote Basket state updated without a mouse.
- At exact 320 CSS px, explicit `prefers-reduced-motion: reduce` returned true, `clientWidth == scrollWidth == 320`, and zero elements had a non-zero rendered animation or transition duration.

## Browser and data boundaries

- Fresh Guest Network recorded only same-origin page, Next asset, local font, HMR and protected-image traffic. No WordPress, `wp-json`, `wp-content`, Feishu/Lark, external media, per-card resolve or submission request occurred.
- Clean Guest Console had no error. It contained only development information plus one Next development-only LCP advisory for the protected placeholder; the isolated browser reported zero warn/error entries on its final seven-card state.
- Document, Flight/script, visible DOM and localStorage scans found no Article Number, stable product/media UUID, `articleNumber`, WordPress, Feishu, raw CMS, price/payment/checkout, internal diagnostic or secret marker. Storage contained one public `catalog_accessory` line and only expected browser-generated entry/mutation/writer identifiers.

## Reproducible finding

`View Product` is visibly actionable but does not reach a product page. Ceiling Bracket linked to `/products/test-candidate-1/`; activation reached canonical `/products/test-candidate-1` and rendered the Next 404 page. Independent followed-response checks returned HTTP 404 for every displayed View Product target: `test-candidate-1`, `test-candidate-3`, `test-candidate-5` and `test-candidate-7`.

Smallest proposed correction: in this controlled preview, point each visible View Product action at a resolvable same-origin canonical TEST_CANDIDATE detail page, or omit the action/card when no published/resolvable detail route exists. Preserve the TEST_CANDIDATE notice and do not substitute production compatibility claims.

## Capture disclosure

All 19 screenshots have actual JPEG/JFIF bytes with magic prefix `ffd8ffe000104a4649460001` despite their `.png` names. Exact dimensions and SHA-256 values are in `QA/TASK-023/EVIDENCE_INVENTORY.sha256`; no image was renamed, re-encoded or edited.

## Visual QA Round 2 — 2026-08-06

- Controlled request: `MSG-TASK-023-VISUAL-QA-R2`.
- Round 1 `FAIL / severe 0 / obvious 1 / detail 0`, its 19 screenshots, hashes and encoding disclosure were verified before retest and remain unchanged.

### O1 closure

Each declared detail action was activated from the visible related-products module rather than tested only by a guessed direct URL:

1. Initial Ceiling Bracket action reached `/products/test-candidate-1`.
2. Initial Track Connector action reached `/products/test-candidate-3`.
3. After the first Show More, Glider Set reached `/products/test-candidate-5`.
4. After the final Show More, Suspension Kit reached `/products/test-candidate-7`.

All four reached final HTTP 200 on the same origin. Each visibly stated `Protected TEST_CANDIDATE — not production product data` and `This is a navigation preview only, not a published product detail page.`, exposed `robots=noindex, nofollow`, used only the protected local 800 x 800 image, and contained no link, button, form, commerce action, compatibility claim, Article Number, stable internal UUID, WordPress, Feishu or diagnostic marker. Per-page asset inventories contained zero external URL.

Followed-response checks returned final HTTP 404 for `/products/test-candidate-{2,4,6,8}`, `/products/accessories/test-candidates` and `/products/unknown-product`.

### Bounded regression

- Fresh initial-state full-page evidence at 1440/1024/768/390/320 retained Ceiling Bracket, Wall Bracket and Track Connector in exact order. Product-page measurements were respectively 3/2/2/1/1 columns, 16 px body text and `scrollWidth == clientWidth`.
- At 1440, the first activation produced exact 3 -> 6 order, retained focus on Show More, announced `3 more products shown.`, kept the canonical URL and added zero page asset. The second produced exact 6 -> 7, removed Show More, moved focus to Suspension Kit View Product, announced `1 more products shown.` and added zero page asset.
- Native Guest Tab order again reached the two initial View Product actions, skipped disabled accessory Add, and reached Show More. Native Return preserved focus on the first activation and moved it to Suspension Kit View Product on the final activation; both live announcements were exposed in the accessibility tree.
- Exact 320 CSS px reduced-motion emulation returned `{reduced:true,width:320,client:320,scroll:320,moving:0}`.
- Wall Bracket quantity 2 enabled Add, announced the addition, created no new asset/request and remained 320/320. Quote Basket displayed the protected Wall Bracket `Catalog accessory` line at quantity 2, retained zero overflow and kept `Request a Quote` disabled beside both non-submission notices.

### Round 2 finding — candidate landing reflow

The new navigation-preview pages do not reflow below 832 CSS px. Candidate 5 at a 768 px viewport measured `clientWidth=768, scrollWidth=832`; candidates 7 and 1 at 390 and 320 measured `scrollWidth=832`. The 800 px protected image rendered at 800 px plus 32 px page offset, while the heading and paragraphs also retained widths beyond the narrow viewport. Full-page captures consequently produced 832 px-wide evidence for the 768/390/320 cases rather than the requested viewport width.

Smallest proposed correction: constrain the landing `main` to the available viewport and make its protected image responsive (`max-width:100%`, proportional height), while allowing headings and paragraphs to wrap within that container. Do not hide overflow, because that would retain clipping rather than restore reflow.

### Round 2 capture disclosure

All 17 new Round 2 screenshots are JPEG/JFIF bytes under `.png` names with magic prefix `ffd8ffe000104a4649460001`. Exact dimensions and SHA-256 values were appended to the evidence inventory; no Round 1 or Round 2 image was renamed, re-encoded or edited.

## Visual QA Round 3 — 2026-08-06

- Controlled request: `MSG-TASK-023-VISUAL-QA-R3`.
- Preserved baseline: canonical 36/36 prior hashes passed before work; Round 1 and Round 2 FAIL sections and evidence were not edited.

### Candidate action and route matrix

- Visible action activation reached candidates 1/3/5/7 at final same-origin HTTP 200.
- Followed HTTP checks kept candidates 2/4/6/8, `/products/accessories/test-candidates` and `/products/unknown-product` at final 404.
- Each positive page had `robots=noindex, nofollow`, zero links/buttons/forms, visible TEST_CANDIDATE and navigation-preview statements, zero commerce/compatibility/internal marker and zero external asset.

### Direct O2 measurement matrix

| Candidate | Width | inner/client/scroll | Article left..right | Image CSS px | Image ratio | Overflow offenders | Text overflow |
| --- | ---: | --- | --- | ---: | ---: | ---: | ---: |
| 1/3/5/7 | 1440 | 1440/1440/1440 | 320..1120 | 800 | 1.0 | 0 | 0 |
| 1/3/5/7 | 768 | 768/768/768 | 30.719..737.281 | 706.563 | 1.0 | 0 | 0 |
| 1/3/5/7 | 390 | 390/390/390 | 16..374 | 358 | 1.0 | 0 | 0 |
| 1/3/5/7 | 320 | 320/320/320 | 16..304 | 288 | 1.0 | 0 | 0 |

`main` always matched the viewport. The image bounds always matched the article bounds, rendered and natural aspect ratios were `1.0`, and the protected source file remained 800 x 800. At 320, text nodes measured 288/288 client/scroll width with normal whitespace and break-word wrapping; the longer paragraphs occupied multiple lines without clipping.

### Bounded regression

- Clean 320 initial state: exact candidates Ceiling Bracket, Wall Bracket and Track Connector; 320/320 client/scroll.
- Settled 1440 baseline and both Show More activations: exact 3 -> 6 -> 7, stable order/URL, zero added asset, first focus retained on Show More, final focus moved to candidate 7 View Product and both live messages remained exact.
- Wall Bracket quantity 2 enabled Add, created one local `Catalog accessory` Basket line and stayed 320/320. Basket used no external image and `Request a Quote` remained disabled.
- Clean Chrome Guest used native Tab/Return after the one profile-picker click. Tab reached Show More after the existing product/category/configuration/card controls; first Return kept focus on Show More, second Return moved it to candidate 7 View Product. Screenshots preserve both native focus states.

### Round 3 capture disclosure

All 14 new Round 3 screenshots are JPEG/JFIF bytes under `.png` names with magic prefix `ffd8ffe000104a4649460001`. Exact dimensions and SHA-256 were appended without changing the prior 36 entries.
