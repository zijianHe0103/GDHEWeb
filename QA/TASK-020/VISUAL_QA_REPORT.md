# TASK-020 Visual QA Report

- message: `MSG-TASK-020-VISUAL-QA-R1`
- delivery key: `MSG-TASK-020-VISUAL-QA-R1:019f88d0-0f9c-7940-af93-f9eef03f92c8`
- executed: `2026-08-01T08:03:19Z`
- target: `http://127.0.0.1:3000/products/fgd-x15-pvc`
- runtime ownership: Planner; this lane did not start, stop or reconfigure it
- verdict: `BLOCKED_NO_KEYBOARD_EXECUTION_EVIDENCE`
- severe differences: `0`
- obvious differences: `0`
- detail differences: `0`

## Decision

The measured TASK-020 local component slice has no severe, obvious or detail
visual difference. It is not reported as PASS because the required native
keyboard-only traversal, control operation and submit could not be executed by
the available browser-control channel. That channel did not deliver `Tab`,
`ArrowRight` or `Enter` even when the target was focused, and `Tab` did not move
focus from the page body or first link. Mouse interaction, DOM order, per-target
keyboard focus and focus rendering were independently verified, so this is an
evidence blocker rather than a product keyboard finding.

Smallest recovery: rerun only the keyboard-only traversal, native radio/select
operation and keyboard submit gates in a browser-control channel that delivers
real key events. Preserve this report and all current evidence. No frontend
correction is proposed from this round.

## Required states

### Default

- Exactly one published option: `6 m — Ivory White`.
- Standard length selected; custom length not selected.
- Ceiling and Wall both unselected.
- Base packaging empty; quantity empty.
- Customer Logo Printing off; Protection arrangement `None`.
- No latest temporary quote item.
- Frozen customer labels match the dispatch wording.

### Invalid submit

- Clicking `Add to Quote` without installation, base packaging or quantity
  produced no latest line.
- Visible messages were exactly:
  - `Choose an installation method.`
  - `Choose a base packaging option.`
  - `Enter a positive whole-number quantity.`
- Installation fieldset, base packaging select and quantity input had
  `aria-invalid=true` and matching `aria-describedby` error IDs.
- The focused submit button retained a visible 3px solid outline.

### Valid standard

- `6 m — Ivory White`, Ceiling Mount, Standard Packaging, Customer Logo
  Printing No, Protection Arrangement None, quantity `2 piece`.
- The live summary contained Model, Length Type, Length, Color, Installation,
  Base Packaging, Customer Logo Printing, Protection Arrangement and Quantity.
- No Article Number, raw enum, JSON, CMS/internal term or sent/saved claim was
  present in the summary.

### Valid custom replacement

- Custom Length `5.8 m`, Ivory White, Wall Mount, Carton Packaging, Customer
  Logo Printing Yes, Single-piece Bagging, quantity `1 piece`.
- Exactly one `Latest temporary quote item` remained.
- The prior Standard Length, Ceiling Mount and Standard Packaging result was
  absent; this was replacement, not append.

## Responsive measurements

| CSS width | DPR at screenshot capture | client/scroll width | page height | configurator layout | CTA size |
| ---: | ---: | ---: | ---: | --- | ---: |
| 1440 | 2 | 1440 / 1440 | 2950 | 434.40 + 651.60 px two-column | 585.60 x 44.09 px |
| 1024 | 1 | 1024 / 1024 | 2575 | 311.27 + 466.91 px two-column | 400.91 x 44.09 px |
| 768 | 1 | 768 / 768 | 3293 | stacked, 609.20 px content | 545.77 x 44.09 px |
| 390 | 1 | 390 / 390 | 3146 | stacked, 269 px card | 235 x 44.09 px |
| 320 | 1 | 320 / 320 | 3278 | stacked, 216.95 px card | 182.95 x 44.09 px |

- No visible main-content element crossed the viewport at any measured width.
- At 320, page overflow was `0px`, configurator descendants with internal
  overflow were `0`, and clipped visible descendants were `0`.
- CTA center hit-tests at 390 and 320 returned the `Add to Quote` button itself.
- Body and button text were 16px at phone widths.

## Accessibility and keyboard evidence

- Natural focusable DOM order was category link, Hero CTA, Standard length,
  Custom length, Published option, Ceiling Mount, Wall Mount, Base packaging,
  Customer Logo Printing, Protection arrangement, Quantity, Add to Quote.
- All 12 elements had `tabIndex=0` and each could be individually focused via a
  keyboard-targeted browser action; every target rendered a 3px solid outline.
- Track length and Installation use fieldsets with legends.
- The result container uses `aria-live="polite"`.
- Selects, text input, logo checkbox hit area and CTAs measured at least 44px
  high. Radio labels were readable and separated, with the label as the click
  target.
- Blocked gate: continuous native `Tab` traversal, radio operation by arrow key
  and submit by `Enter` could not be independently executed because the browser
  channel did not deliver those key events. The same failure occurred at the
  body and first link, so no product defect is inferred.

## Reduced motion, browser and leakage boundary

- Current environment reported `prefers-reduced-motion: reduce = false`.
- All rendered elements reported `animation-name: none` and zero transition
  duration. The slice has no essential motion to lose under reduced motion.
- Browser asset inventory: 20 assets total — 1 image, 2 stylesheets and 17
  scripts; every URL was same-origin `127.0.0.1:3000`.
- The only image was `/test-candidates/fgd-x15-protected.png` with Alt
  `Protected FGD X15+PVC curtain track cross-section`.
- No WordPress, external media, ProductCard, Feishu or submission request was
  observed. Form interactions did not navigate and the URL remained canonical.
- Console warnings/errors: `0`.
- `robots`: `noindex, nofollow`.
- Browser-facing visible leak terms: `0`.
- Local notice remained visible: `Temporary quote item only — it has not been
  sent or saved. Refreshing clears it.`

## Screenshot encoding and capture disclosure

The browser screenshot endpoint returned JPEG/JFIF bytes (`ff d8 ff e0 ...`).
Every retained `.png` file was explicitly decoded and encoded as PNG. Independent
checks with `file`, first-eight-byte inspection and image metadata confirmed all
11 retained visual files are real PNG with magic `89 50 4e 47 0d 0a 1a 0a`.

The native 1440 full-page compositor produced a stale repeated-paint artifact.
That real-PNG artifact is preserved as
`task020-default-1440-native-fullpage-artifact.png`. Formal full-page evidence
uses exact-width 900px viewport tiles, waits for paint after measured scrolling,
and joins tiles only vertically with no horizontal resize. Repeated scrollbar
thumb and local Next dev-tool button fragments at tile boundaries are capture
artifacts, not page duplicates.

| File | Pixels | SHA-256 |
| --- | ---: | --- |
| `task020-default-1440.png` | 1440 x 2950 | `231441b16625c0ffb3beff79d1d348a7a603bf38571f4851b203b6d30b063e7f` |
| `task020-default-1024.png` | 1024 x 2575 | `f6c7273b01b60413f22f74f4dc0bffc3b9191261672adb20d87d6914f3745695` |
| `task020-default-768.png` | 768 x 3293 | `06056ec0e04f6c5b57dfb4599e2bdb5e7f9e9f90eab6023f88de798728b8515e` |
| `task020-default-390.png` | 390 x 3146 | `91f395375d2f3697cc217a045273e540948f9d8c55fccc5d360ed25b8e0f4ec6` |
| `task020-default-320.png` | 320 x 3278 | `1481e2a1f3774f8c2f1342b936b677ccf50fa57dd90df5484a446a61acd83e06` |
| `task020-invalid-390.png` | 390 x 900 | `ff4bedd01c59b13fd31fa64cec1bfca81ae9fab15a1097be2972bd0fc8742849` |
| `task020-standard-valid-390.png` | 390 x 900 | `6f55f9eac629fa2d8356ad99dc03be0034e33679f38200333646bdaac317ce25` |
| `task020-custom-replacement-390.png` | 390 x 900 | `0c35bae48c84880b21c1126aa0f1f8dbca55cad0848c4de58b4e2c39e17e7419` |
| `task020-focus-category-390.png` | 390 x 900 | `1160665d7ee2f7f73806e00b9f711cdf3a82157c2d76355f7f0285105fa36a1f` |
| `task020-focus-cta-390.png` | 390 x 900 | `720bb453451f7897b31e3dbafe6088f0fad91d22c98c020c065db27c6ba543e8` |
| `task020-default-1440-native-fullpage-artifact.png` | 1440 x 2950 | `a7843ac2540673654542c67380ae062c4e559d38e915f5641158ae418e80c997` |

The authoritative hash list is `QA/TASK-020/EVIDENCE_INVENTORY.sha256`.

## Scope protection

No server lifecycle action, frontend/CSS/test/doc/task-authority/CMS/dependency
change, finding repair, review, Git, deployment or external-system action was
performed.

## Keyboard Recovery — 2026-08-01

- recovery message: `MSG-TASK-020-VISUAL-QA-KEYBOARD-RECOVERY`
- Round 1 history preserved: `BLOCKED_NO_KEYBOARD_EXECUTION_EVIDENCE / severe 0 / obvious 0 / detail 0`
- recovery verdict: `FAIL / severe 0 / obvious 0 / detail 1`

### Closed keyboard blocker

The recovery used a real Google Chrome Guest window and system-level native key
events through the plugin-owned computer-use sky wrapper. The only mouse action
was the initial click that opened/focused Guest mode. Every page interaction
after that point used native keyboard events.

- Continuous Tab AX focus advanced from the page to category link, Hero CTA,
  selected Standard length radio, Published option, Ceiling Mount radio, Base
  packaging, Customer Logo Printing, Protection arrangement, Quantity and Add
  to Quote in natural order.
- Native radio groups expose one Tab stop per group. Custom length and Wall
  Mount are reached by arrow keys rather than separate Tab stops; this is native
  browser behavior, not an accessibility defect.
- `Right` changed Standard `1` / Custom `0` to Standard `0` / Custom `1` and
  moved AX focus to Custom. `Left` restored Standard and its AX focus.
- Native keys produced the required standard configuration: `6 m — Ivory
  White`, Ceiling Mount, Standard Packaging, Logo No, Protection None and
  quantity 2.
- With AX focus on Add to Quote, native `Return` produced one complete latest
  summary and did not navigate, append a second line, expose internal fields or
  claim sent/saved persistence.
- Chrome Network was recording during a second native Return. Its request table
  remained empty, proving the keyboard action introduced no external,
  WordPress, ProductCard, submission or Feishu request.

The Round 1 keyboard evidence blocker is closed.

### Detail finding D1 — local favicon 404

Chrome Console showed one error from the same-origin page-load request:

`http://127.0.0.1:3000/favicon.ico` → `404 Not Found`

This request was not caused by the keyboard chain, and the keyboard/network
gates themselves passed. It nevertheless fails the recovery dispatch's absolute
no-console-warning/error requirement, so PASS is withheld.

Reproduction: open the authorized page in a clean Chrome Guest window, open
DevTools Console, and observe `:3000/favicon.ico:1 Failed to load resource: the
server responded with a status of 404 (Not Found)`.

Smallest proposed correction: provide the declared local favicon at
`/favicon.ico`, or change/remove the favicon declaration so the browser does not
request a missing resource. No correction was applied by this lane.

### Recovery evidence encoding

The six computer-use screenshots are JPEG/JFIF bytes under historical `.png`
names. Independent checks confirmed magic `ff d8 ff e0 00 10 4a 46`, dimensions
`956 x 768`, and these SHA-256 values:

| File | Evidence | SHA-256 |
| --- | --- | --- |
| `task020-keyboard-recovery-category-focus.png` | native link focus | `cab445d6455718f1524321b0d4ba4c8fa18d01af6b188055324190fc78052733` |
| `task020-keyboard-recovery-arrow-custom.png` | arrow-selected Custom radio | `f5d83f11dc5ebc686b29a15b4961f636fb2a5e0f1b66d60b9f2957c66b44b2bc` |
| `task020-keyboard-recovery-submit-focus.png` | configured submit focus | `c004df0d05f0dc6bf3862f11196bec9145f7a64aa1aeaf935419db2d7c05707d` |
| `task020-keyboard-recovery-enter-result.png` | native Enter result | `4a784c68ba0b437d61e55c267eb632b2a40a87e48d27c2eae89beca4f9755230` |
| `task020-keyboard-recovery-network-empty.png` | empty Network after Enter | `3302db831e8acc268f9ebe982b150e202a7f63b95223bbfd90e37906250e8dcf` |
| `task020-keyboard-recovery-console-favicon-404.png` | Console detail finding | `a3a294ff9f6e3a2db2e713ba61b193a0e62224a1a8d88e4d81f8405317719085` |

Detailed AX evidence is preserved in
`QA/TASK-020/KEYBOARD_RECOVERY_AX_LOG.md`. All Round 1 files and hashes remain
unchanged; the six recovery hashes were appended to the authoritative
`EVIDENCE_INVENTORY.sha256`.

### Recovery scope protection

The Planner-owned server was neither started, stopped nor reconfigured. No
frontend/CSS/tests/README/task-authority/CMS/dependency/review/Git/deployment or
external-system change was made. The temporary Chrome Guest window was closed
with a native keyboard shortcut after evidence capture.

## Favicon Round 2 — 2026-08-01

- message: `MSG-TASK-020-VISUAL-QA-FAVICON-R2`
- delivery key: `MSG-TASK-020-VISUAL-QA-FAVICON-R2:019f88d0-0f9c-7940-af93-f9eef03f92c8`
- verdict: `PASS / severe 0 / obvious 0 / detail 0`
- preserved Visual Round 1: `BLOCKED_NO_KEYBOARD_EXECUTION_EVIDENCE / severe 0 / obvious 0 / detail 0`
- preserved Keyboard Recovery: `FAIL / severe 0 / obvious 0 / detail 1`

### D1 closure in a clean context

A new Google Chrome Guest context was opened. DevTools Console and Network
recording were active before the canonical target loaded, so no prior negative
favicon cache or pre-recording request was reused.

- The document declared a local Next icon link whose resolved URL was
  `http://127.0.0.1:3000/icon.svg?icon.3pigvvo6ltwt4.svg`, type
  `image/svg+xml`, rel `icon`.
- Chrome Network recorded that URL as `200 OK`, type `svg+xml`, 0.8 kB
  transferred and 0.5 kB resource size.
- `favicon.ico` request count was `0`; no favicon 404 occurred.
- Console reported `0 messages in console` after target load and again after
  native Enter. No warning or error AX row was present.

The prior D1 favicon finding is therefore closed.

### Minimum native keyboard and boundary regression

After the one click required to open Guest mode, no mouse was used. Native Tab
reached Standard length and native keys selected `6 m — Ivory White`, Ceiling
Mount, Standard Packaging, Logo No, Protection None and quantity 2. Native
Return on the AX-focused Add to Quote button produced exactly one latest item:
FGD X15+PVC, Standard Length, 6 m, Ivory White, Ceiling Mount, Standard
Packaging, No, None and 2 piece.

The canonical URL stayed unchanged. AX focus remained on Add to Quote. The
already-passing layout showed no visual regression, so the dispatch-authorized
five-viewport recapture exception was not triggered.

Network contained 24 unique inspected-page URLs before native Enter and 24
afterward; the after-minus-before set was empty. Every HTTP/WebSocket request
was same-origin `127.0.0.1:3000`. No external, WordPress, ProductCard,
submission or Feishu request and no new Console issue appeared.

### Round 2 evidence encoding

The three minimum computer-use screenshots are JPEG/JFIF bytes under `.png`
names. Fresh `file`, magic-byte and metadata checks confirmed magic
`ff d8 ff e0 00 10 4a 46`, dimensions `956 x 768`, and these SHA-256 values:

| File | Evidence | SHA-256 |
| --- | --- | --- |
| `task020-favicon-r2-network-icon-clean.png` | icon 200, type and clean request boundary | `9fa395d225c3d2911641de63b4dd21d1097ff6a2d5363994498a4b97e75b40a3` |
| `task020-favicon-r2-console-clean.png` | post-Enter Console with zero messages | `f8feca656f00543ad298cdd265d2c0d7804ea5b224c0787ebea8a273b5b96075` |
| `task020-favicon-r2-keyboard-enter-summary.png` | native Enter one-item result | `c48479a43eda4ccf51dbd53cf488be90742b00ca17d1e3f94e6d6802b17c7333` |

Exact AX observations are preserved in `QA/TASK-020/FAVICON_R2_AX_LOG.md`.
All prior screenshots, encodings, hashes, measurements and verdict history are
unchanged; the three Round 2 hashes were appended to the authoritative
`EVIDENCE_INVENTORY.sha256`.

### Round 2 scope protection

The Planner-owned server was neither started, stopped nor reconfigured. The
temporary Guest window was closed by native keyboard shortcut. No product
code, CSS, tests, README, CMS, task authority, dependency, review, Git,
deployment or external-system action was performed.
