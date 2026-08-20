# TASK-021 Visual QA Report

## Controlled execution

- request: `MSG-TASK-021-VISUAL-QA-R1`
- delivery key: `MSG-TASK-021-VISUAL-QA-R1:019f88d0-0f9c-7940-af93-f9eef03f92c8`
- dispatch: `TASKS/ARTIFACTS/TASK-021/VISUAL_QA_DISPATCH.md`
- target: `http://127.0.0.1:3000/products/fgd-x15-pvc`
- executed at: `2026-08-04T16:14:45Z`
- server: reused Planner-owned runtime; no start, stop or configuration action

## Verdict

`FAIL / severe 1 / obvious 1 / detail 1`

TASK-021 cannot receive a zero-finding visual QA PASS. The default static presentation and five-width reflow are sound, but the real Chrome page does not hydrate the configurator, internal identifiers enter a browser-facing Next payload, and the clean Console contains same-origin resource/runtime errors.

## Passing evidence

- Full-page evidence exists at exact widths 1440, 1024, 768, 390 and 320 CSS px.
- Visible order is `Track Length`, `Color`, Packaging, Quantity, `Add to Quote`.
- The default length truth shows only `6 m` and sibling `Custom Length`; no fabricated `4.3 m` or `7 m` appears.
- Installation is absent from the configurator and form. Separate product specification prose may still describe ceiling/wall mounting capability.
- All five widths satisfy `scrollWidth == clientWidth`; no clipping or horizontal-overflow offender was found.
- Body text is 16 CSS px. The CTA is 44.09375 CSS px high and passes center hit-test at all five widths.
- Native continuous Tab traversal and visible focus reach the expected page controls in natural order.
- No rendered nonzero animation or transition exists; essential use is not motion-dependent.
- All 20 unique browser asset/request URLs inspected were same-origin. No WordPress, `wp-json`, Feishu, ProductCard, external or submission request occurred.

## Findings

### S1 — configurator is not hydrated; core states and submission do not operate

Severity: severe.

Reproduction in a clean Chrome Guest window using system-level native keys:

1. Load the canonical URL with Console and Network recording already active.
2. Tab from the page to the `6 m` radio and press `Space`.
3. Accessibility state changes to selected, but `Color` remains `Choose a track length first`; `Ivory White` never appears.
4. Press `Right Arrow` to select `Custom Length`.
5. Accessibility state moves to Custom, but the custom input never appears and Color remains disabled.
6. Continue by Tab to `Add to Quote` and press native `Enter`.
7. The browser performs a default form GET, changes the URL to `/products/fgd-x15-pvc?`, resets the page and renders no stable inline validation errors.

Impact: valid standard, valid custom replacement, and invalid-submit gates cannot complete; no customer-readable latest-line summary can be produced. Native focus delivery is proven, so this is not an in-app key-injection limitation.

Smallest proposed correction: restore Client Component hydration on this Planner preview so selection state, conditional Custom/Color UI, validation and the submit handler attach before retest. Keep the same visible layout and server-only boundary.

Evidence: `QA/TASK-021/task021-native-standard-no-color.png`, `QA/TASK-021/task021-native-custom-no-input.png`, `QA/TASK-021/task021-native-invalid-navigation.png` and `QA/TASK-021/INTERACTION_BROWSER_LOG.md`.

### O1 — raw Article Number and internal product UUID enter browser-facing document bytes

Severity: obvious.

The visible body text contains neither internal value, but one inline Next/Flight script in `document.documentElement.innerHTML` contains both:

- Article Number: `GDHEPRD000172`
- product UUID: `21000000-0000-4000-8000-000000000001`

This violates the task gate that Article Number and internal values never enter DOM/client bytes.

Smallest proposed correction: do not pass the raw Product Configuration object or internal product identity to the Client Component. Serialize only a public opaque option identity and customer-readable fields; retain Article Number resolution and product UUID server-side.

Evidence: `QA/TASK-021/INTERACTION_BROWSER_LOG.md` records the direct document-byte inspection.

### D1 — clean Console contains unexpected same-origin runtime/resource errors

Severity: detail.

Chrome Console reports repeated webpack HMR WebSocket handshake failures with `net::ERR_INVALID_HTTP_RESPONSE`. The same-origin request `GET /__nextjs_font/geist-latin.woff2` returns `403 Forbidden`. These are present before any external request, and native interaction does not introduce any external request.

Smallest proposed correction: serve the local font successfully and correct the Planner preview's HMR WebSocket response. Then retest in a new clean Guest window with Console/Network recording active before load.

Evidence: `QA/TASK-021/task021-console-errors.png` and `QA/TASK-021/task021-network-boundary.png`.

## Acceptance matrix

| Gate | Result | Evidence |
|---|---|---|
| 1440/1024/768/390/320 full-page | PASS | five exact-width captures |
| order and true default choices | PASS | default captures and measurements |
| standard `6 m -> Ivory White -> summary` | FAIL | S1: state never advances |
| custom `5.8 -> Color -> replacement` | FAIL | S1: input never appears |
| Installation absent | PASS | form inspection and captures |
| invalid inline errors | FAIL | S1: native Enter performs GET to `?` |
| native keyboard/focus delivery | PASS | continuous Tab/Space/Arrow/Enter and AX state |
| reflow, overflow, CTA, density | PASS | exact measurements at five widths |
| reduced motion | PASS | no rendered nonzero animation/transition |
| no browser CMS/external request | PASS | all inspected URLs same-origin |
| zero unexpected Console errors | FAIL | D1 |
| no internal browser-facing values | FAIL | O1 |

## Measurements

| Width | Full-page height | scrollWidth/clientWidth | CTA height | CTA center hit |
|---:|---:|---:|---:|---|
| 1440 | 2858 | 1440/1440 | 44.09375 | true |
| 1024 | 2483 | 1024/1024 | 44.09375 | true |
| 768 | 3201 | 768/768 | 44.09375 | true |
| 390 | 3054 | 390/390 | 44.09375 | true |
| 320 | 3211 | 320/320 | 44.09375 | true |

## Evidence encoding, dimensions and SHA-256

Encoding is based on magic bytes, not filename extensions.

| File | Actual encoding / magic | Dimensions | SHA-256 |
|---|---|---:|---|
| `QA/TASK-021/task021-default-1440.png` | PNG / `89504e470d0a1a0a` | 1440 x 2858 | `410993b4ad9f73cda5829121bf785abe3bb39349a7b7ac78e55d9f0e02aa2abc` |
| `QA/TASK-021/task021-default-1024.png` | PNG / `89504e470d0a1a0a` | 1024 x 2483 | `3575ee9a10bfd66fff1a27de3f0e93cddd7b6ff540729aac8a0fc058dcdc86ca` |
| `QA/TASK-021/task021-default-768.png` | PNG / `89504e470d0a1a0a` | 768 x 3201 | `581ad58516fe607f561236a24ef3b7d17bbb05b43152e61d3187ce265acdcacf` |
| `QA/TASK-021/task021-default-390.png` | PNG / `89504e470d0a1a0a` | 390 x 3054 | `75678fd341165599d7623085ab6de3bda7ed78a9aa2fdb7f95f37c423ea35767` |
| `QA/TASK-021/task021-default-320.png` | PNG / `89504e470d0a1a0a` | 320 x 3211 | `2a1d32db038a31d0da417518ac841ecfdf90ca07937a9f7a10ec763a91298d8b` |
| `QA/TASK-021/task021-console-errors.png` | JPEG/JFIF / `ffd8ffe000104a46` under historical `.png` name | 956 x 768 | `12f8a1d2405918e4f5c6696e1a9f10238a0ae2ff27ad8334d22a3dc41c524f4b` |
| `QA/TASK-021/task021-native-invalid-navigation.png` | JPEG/JFIF / `ffd8ffe000104a46` under historical `.png` name | 956 x 768 | `4a8bef0c826d090adb848e40e099bb66bf91c648120669ed6c7549f48b532200` |
| `QA/TASK-021/task021-native-standard-no-color.png` | JPEG/JFIF / `ffd8ffe000104a46` under historical `.png` name | 956 x 768 | `04183568541098938f2a11e8541f748adf180afe0f078d10ce6373b09dc9d305` |
| `QA/TASK-021/task021-native-custom-no-input.png` | JPEG/JFIF / `ffd8ffe000104a46` under historical `.png` name | 956 x 768 | `6b9ed63924ebb19bc0d650cbbf150154638a8ef075c70280f53b760d9ed55aa3` |
| `QA/TASK-021/task021-network-boundary.png` | JPEG/JFIF / `ffd8ffe000104a46` under historical `.png` name | 956 x 768 | `61c666f3b3ea918d5ce0fdae824435e2bec46f5b000c7db0ca685bb258e916c4` |

Formal full-page images are exact-width, unscaled vertical composites of painted viewport captures. Join points are vertical-only. Repeated scrollbar fragments at joins are capture artifacts, not product overflow. Chrome evidence files retain the browser-control channel's actual JPEG/JFIF bytes under their original `.png` names and were not silently re-encoded.

## Scope and next gate

Only `QA/TASK-021/**`, this canonical report and the visual_qa lane record were written. No frontend, CSS, test, README, CMS, task authority, dependency, Git, deployment, related-product, Basket or Feishu action was performed.

Planner should dispatch the smallest frontend/preview correction for S1, O1 and D1, preserve this Round 1 FAIL history, and request a fresh visual QA retest. Adversarial review must not begin from this FAIL.

---

# Visual QA Round 2

## Controlled execution

- request: `MSG-TASK-021-VISUAL-QA-R2`
- delivery key: `MSG-TASK-021-VISUAL-QA-R2:019f88d0-0f9c-7940-af93-f9eef03f92c8`
- dispatch: `TASKS/ARTIFACTS/TASK-021/VISUAL_QA_R2_DISPATCH.md`
- target: `http://127.0.0.1:3000/products/fgd-x15-pvc`
- executed at: `2026-08-04T16:56:25Z`
- server: reused Planner-owned same-origin runtime; no lifecycle or configuration action

## Round 2 verdict

`PASS / severe 0 / obvious 0 / detail 0`

Round 1 remains preserved above as `FAIL / severe 1 / obvious 1 / detail 1`. Round 2 independently closes S1, O1 and D1 against current shared bytes. This visual PASS is not adversarial review, acceptance, Git or deployment authorization.

## Closure evidence

### S1 closed — hydrated invalid, standard and custom keyboard paths

- Native default Enter kept the canonical URL and produced four stable inline errors for Track Length, Color, Base Packaging and Quantity.
- Native selection revealed Custom input and `Ivory White`; Left/Right Arrow moved between Custom and `6 m` with correct dependent UI.
- Standard `6 m / Ivory White / Standard Packaging / quantity 2` produced one complete latest temporary quote item.
- Custom `5.8 m / Ivory White` then replaced the same draft: latest-item count `1`, `Standard Length` count `0`.
- Focus remained visible, canonical URL did not change, and reload cleared the draft.

### O1 closed — public browser bytes contain no internal identity

Direct document, script/Flight and visible-text inspection returned false on all three surfaces for Article Number `GDHEPRD000172`, product UUID `21000000-0000-4000-8000-000000000001`, `articleNumber`, WordPress, `wp-json`, Feishu, `internal` and `diagnostic`.

### D1 closed — font, HMR and Console clean

- Local font returned HTTP 200.
- HMR WebSocket returned `101 Switching Protocols` and Console reported `[HMR] connected`.
- Console had two informational development messages and zero unexpected warning/error.
- Network count stayed 24 from load through custom submission; submission delta was zero. All page requests were same-origin with no WordPress, Feishu, external, storage or submission request.

## Round 2 responsive matrix

| CSS width | client/scroll | overflow offenders | body font | CTA height | center hit | rendered motion |
|---:|---:|---:|---:|---:|---|---:|
| 1440 | 1440/1440 | 0 | 16px | 44.09375px | true | 0 |
| 1024 | 1024/1024 | 0 | 16px | 44.09375px | true | 0 |
| 768 | 768/768 | 0 | 16px | 44.09375px | true | 0 |
| 390 | 390/390 | 0 | 16px | 44.09375px | true | 0 |
| 320 | 320/320 | 0 | 16px | 44.09375px | true | 0 |

At 320 CSS px, explicit `prefers-reduced-motion: reduce` emulation returned `true`; rendered motion remained zero and reflow remained 320/320.

## Round 2 evidence encoding, dimensions and SHA-256

Every Round 2 screenshot is actual JPEG/JFIF with magic `ffd8ffe000104a46`, dimensions `956 x 768`, retained under its original `.png` filename. The five responsive records show Chrome DevTools' exact CSS width and live measurements; Round 1 full-page PNG evidence remains unchanged.

| File | SHA-256 |
|---|---|
| `QA/TASK-021/task021-r2-client-boundary.png` | `5833da0363e2ef33fe223122de38cc48b8236f08cba4ca36ef10fe23d0db10b0` |
| `QA/TASK-021/task021-r2-console-clean.png` | `a4cac829ca51cef911ebdd589e174913dc254e5f44612051e70e2ca13b036181` |
| `QA/TASK-021/task021-r2-custom-input.png` | `9685157c05cd1f3dc1644e69d80674685c98ee5cf8e7a9bba6e278c85831f208` |
| `QA/TASK-021/task021-r2-custom-replacement.png` | `6ba803ce2d3040e958fafc44c56cc131c7f67548c494bc62b0ab1953d1d5640d` |
| `QA/TASK-021/task021-r2-invalid-native.png` | `e45f2a1a42737c438b6c9bf07aef6b5e45400cd35036777c203407854394ad1a` |
| `QA/TASK-021/task021-r2-network-clean.png` | `f34be2bd81634c8fe38cfa72e1fbf047d73a27f8e950b5005ed4cbe3ee51bcf6` |
| `QA/TASK-021/task021-r2-reduced-motion-320.png` | `ede9633d469884e0c6923f6eaf957632470975a3d671f6cbb1d2f9ca4e249ec9` |
| `QA/TASK-021/task021-r2-responsive-1024.png` | `b8893447f4cbc67f818382c52f77b230c42f10e38172995f07d9936b738edaf8` |
| `QA/TASK-021/task021-r2-responsive-1440.png` | `c57ebf63c996e461818b162897f141476c9da5550a090a6cd57e86eff5f51f55` |
| `QA/TASK-021/task021-r2-responsive-320.png` | `0cb6cbd8f10be61b608c3446fdfaec8187c57205bbf0e239d216c8b5a4bdb30f` |
| `QA/TASK-021/task021-r2-responsive-390.png` | `634e7e784b5fd1e2ae8080c5b5e7ea6bdeef5c04657ae015c887795b95c2e21c` |
| `QA/TASK-021/task021-r2-responsive-768.png` | `be6dc45b540f92797314e04047886e36c2c6c71ff2cbb8b1d10aa23e20e1fee7` |
| `QA/TASK-021/task021-r2-standard-result.png` | `7acca3d0a080e83a9070c0fd66141eaa7cede6d1d96e0befe05c3ff8ce70df73` |

Detailed native keyboard, AX, Network, Console, byte-boundary and measurement evidence is recorded in `QA/TASK-021/ROUND_2_BROWSER_LOG.md`.

## Round 2 scope and next gate

Only Round 2 QA evidence, both visual reports and visual_qa lane records were written. No frontend, CSS, test, README, CMS, task authority, dependency, server lifecycle, review, Git, deployment, related-product, Basket or Feishu action was performed.

Planner owns independent validation and any adversarial-review dispatch. Visual Round 2 itself requires no product correction.
