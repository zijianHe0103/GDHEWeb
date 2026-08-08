# TASK-023 Visual QA Report

## Result

- Verdict: `FAIL`
- Severe: `0`
- Obvious: `1`
- Detail: `0`
- Controlled request: `MSG-TASK-023-VISUAL-QA-R1`
- Delivery key: `MSG-TASK-023-VISUAL-QA-R1:019f88d0-0f9c-7940-af93-f9eef03f92c8`
- Tested bytes: current shared checkout through Planner-owned `http://127.0.0.1:3000`

## Finding

### O1 — all visible View Product actions resolve to 404

The four detail-style cards expose normal `View Product` links, but none reaches a product detail page. Browser activation of Ceiling Bracket followed `/products/test-candidate-1/` to canonical `/products/test-candidate-1` and displayed Next's `404: This page could not be found.` Followed HTTP checks confirmed the same final 404 for candidates 1, 3, 5 and 7.

This fails the requirement that a detail/configurable target's action navigate to its published canonical path. It also turns a prominent customer action into a dead end even though the card itself correctly declares TEST_CANDIDATE status.

Smallest proposed correction: make the preview actions resolve to same-origin canonical TEST_CANDIDATE detail routes, or omit actions/cards without a resolvable route. Do not replace the notice with a production-product or compatibility claim.

## Passing evidence

- Initial 3, first reveal to 6 and final reveal to 7 preserved exact stable order, URL and loaded resources. The first focus stayed on Show More; the final focus moved to Suspension Kit View Product. Pointer and native Return paths both passed, with exact live announcements.
- Exact 1440/1024/768/390/320 evidence produced 3/2/2/1/1 columns, 16 px body text and `scrollWidth == clientWidth` at every width.
- Seven cards used only protected same-origin 800 x 800 media, distinct alts and explicit `Protected TEST_CANDIDATE — not production product data` truth.
- Labelled `Quantity (piece)` inputs rejected zero, negative, fractional and unsafe integers. Quantity 2 enabled Add, produced an accessory Basket line, allowed quantity 3 and Remove, and never fabricated track configuration.
- Native focus order and visible focus passed. Exact 320 reduced-motion emulation returned true with zero rendered motion and zero overflow.
- Network, Console, document, Flight, visible DOM and storage boundaries found no external/CMS/WordPress/Feishu/submission traffic and no internal product identity, price, payment or checkout leakage. The sole Console warning was a development-only Next LCP advisory, not a product error.

## Evidence matrix

| Gate | Evidence | Result |
| --- | --- | --- |
| Initial five widths | `QA/TASK-023/task023-initial-1440.png`, `QA/TASK-023/task023-initial-1024.png`, `QA/TASK-023/task023-initial-768.png`, `QA/TASK-023/task023-initial-390.png`, `QA/TASK-023/task023-initial-320.png` | PASS |
| Pointer 3 -> 6 -> 7 | `QA/TASK-023/task023-expanded-six-1440.png`, `QA/TASK-023/task023-expanded-six-320.png`, `QA/TASK-023/task023-final-seven-1440.png`, `QA/TASK-023/task023-final-seven-320.png` | PASS |
| Quantity/Add/Basket | `QA/TASK-023/task023-accessory-added-320.png`, `QA/TASK-023/task023-basket-accessory-320.png` | PASS |
| Native focus progression | `QA/TASK-023/task023-native-focus-show-more.png`, `QA/TASK-023/task023-native-six-focus.png`, `QA/TASK-023/task023-native-seven-focus.png` | PASS |
| Native accessory Add | `QA/TASK-023/task023-native-focus-accessory-add.png`, `QA/TASK-023/task023-native-accessory-added.png` | PASS |
| Reduced motion | `QA/TASK-023/task023-native-reduced-320.png` | PASS |
| Network/Console | `QA/TASK-023/task023-native-network-320.png`, `QA/TASK-023/task023-native-console-warning.png` | PASS with disclosed development advisory |
| View Product navigation | Browser 404 plus final HTTP 404 for candidates 1/3/5/7 | **FAIL — O1** |
| Exact execution details | `QA/TASK-023/BROWSER_INTERACTION_LOG.md` | recorded |
| Encoding/dimensions/hashes | `QA/TASK-023/EVIDENCE_INVENTORY.sha256`, `TASKS/ARTIFACTS/TASK-023/VISUAL_EVIDENCE_MANIFEST.sha256` | verified |

## Encoding disclosure

All 19 visual files have actual JPEG/JFIF bytes under `.png` names. Each has magic prefix `ffd8ffe000104a4649460001`; exact dimensions and SHA-256 are preserved in the inventory. No evidence image was renamed, re-encoded, deleted or edited.

## Scope and boundary

No frontend/CSS/test/documentation product code, CMS, task authority, dependency, Git, deployment or external-system mutation was performed. The Planner-owned server was neither started, stopped nor reconfigured. This FAIL is the independent Visual QA Round 1 checkpoint only; it is not adversarial review, user acceptance or Git/deployment approval.

## Visual QA Round 2

### Result

- Verdict: `FAIL`
- Severe: `0`
- Obvious: `1`
- Detail: `0`
- Controlled request: `MSG-TASK-023-VISUAL-QA-R2`
- Delivery key: `MSG-TASK-023-VISUAL-QA-R2:019f88d0-0f9c-7940-af93-f9eef03f92c8`
- Round 1 history: preserved unchanged as `FAIL / severe 0 / obvious 1 / detail 0`

### O1 closure — PASS

The visible View Product actions for candidates 1/3/5/7 each reached a final same-origin HTTP 200 page. Every page visibly declared TEST_CANDIDATE/non-production navigation-preview truth, exposed `noindex, nofollow`, used only the protected local 800 x 800 image, had no interactive/commerce action, external asset, compatibility claim or internal identity marker. Candidates 2/4/6/8, `/products/accessories/test-candidates` and an unknown product path remained final HTTP 404.

### O2 — candidate landing pages overflow at 768/390/320

The newly added navigation-preview landing is fixed to an effective 832 px content width. Candidate 5 at viewport 768 measured `clientWidth=768, scrollWidth=832`; candidates 7 and 1 at viewports 390 and 320 also measured `scrollWidth=832`. The protected image itself rendered at 800 px from a 32 px left offset, and headings/paragraphs exceeded the viewport. Captures at all three affected widths therefore became 832 px wide and visibly require horizontal scrolling.

Smallest correction: constrain the landing container to the available viewport, set the protected image to responsive width with proportional height, and let headings/paragraphs wrap inside the container. Do not mask the issue with overflow clipping.

### Passing Round 2 regression

- Main product at 1440/1024/768/390/320: exact initial order, 3/2/2/1/1 columns, 16 px body text and zero horizontal overflow.
- Show More at 1440: exact 3 -> 6 -> 7, stable order/URL, zero new asset, first focus retained, final focus moved correctly and exact live announcements.
- Native keyboard: continuous Tab order, disabled Add skipped, Return activation and both focus outcomes passed.
- Reduced motion: exact 320 CSS px returned reduced=true, 320/320 reflow and moving=0.
- Accessory/Basket: quantity 2 enabled Add, created a protected `Catalog accessory` line with quantity 2, zero overflow and disabled final submission.
- Browser boundary: all candidate assets same-origin, no external/CMS/WordPress/Feishu/submission request, no internal identity or commerce leakage. The unchanged development-only Next LCP advisory remains disclosed and is not counted as a new defect.

### Round 2 evidence

Seventeen fresh files use the `task023-r2-*` prefix. All are actual JPEG/JFIF bytes under `.png` names, with exact magic, dimensions and SHA-256 appended to `QA/TASK-023/EVIDENCE_INVENTORY.sha256` and the canonical `VISUAL_EVIDENCE_MANIFEST.sha256`; the distinct Round 2-only stream is `VISUAL_EVIDENCE_R2_MANIFEST.sha256`. Round 1 evidence remains byte-identical.

Round 2 is a Visual QA checkpoint only. No frontend/CSS/tests/docs/CMS/task authority/dependency/Git/deployment/external-system mutation occurred, and the Planner-owned server was not started, stopped or reconfigured.

## Visual QA Round 3

### Result

- Verdict: `PASS`
- Severe: `0`
- Obvious: `0`
- Detail: `0`
- Controlled request: `MSG-TASK-023-VISUAL-QA-R3`
- Delivery key: `MSG-TASK-023-VISUAL-QA-R3:019f88d0-0f9c-7940-af93-f9eef03f92c8`
- Preserved history: Round 1 `FAIL / 0 / 1 / 0`; Round 2 `FAIL / 0 / 1 / 0`; all 36 prior canonical files remain byte-identical.

### O2 closure — PASS

The four visible `View Product` actions were independently activated from the related-products module: candidates 1 and 3 from the initial three cards, candidate 5 after the first reveal, and candidate 7 after the final reveal. Each reached its final same-origin candidate route and returned HTTP 200.

At every combination of candidate 1/3/5/7 and viewport 1440/768/390/320, `innerWidth == document.clientWidth == document.scrollWidth`. No measured body descendant, `main`, `article`, heading, paragraph or image crossed the viewport boundary. Article bounds were `320..1120` at 1440, `30.719..737.281` at 768, `16..374` at 390 and `16..304` at 320. The protected square image rendered respectively at 800, 706.563, 358 and 288 CSS px; rendered aspect ratio and decoded natural aspect ratio were both exactly `1.0`, with no clipping. At 320, all headings and paragraphs had `white-space: normal`, `overflow-wrap: break-word`, and `scrollWidth == clientWidth == 288`; multi-line copy wrapped inside the article.

Every landing retained visible TEST_CANDIDATE/non-production navigation-preview truth, `noindex, nofollow`, zero link/button/form/commerce action, zero internal-identity or compatibility marker and only the same-origin optimized form of the protected `800 x 800` source image. The inspected asset set contained zero external URL. Candidates 2/4/6/8, `/products/accessories/test-candidates` and `/products/unknown-product` remained final HTTP 404.

### Bounded regression — PASS

- Main product initial state at 320 retained exactly candidates 1/2/3 and `320 == clientWidth == scrollWidth`. Fresh 1440 sampling retained exact 3 -> 6 -> 7 order, first focus on Show More, final focus on candidate 7 View Product, exact live announcements and no new asset after the fully settled baseline.
- Clean local Basket sampling proved Wall Bracket quantity 2 changed Add from disabled to enabled, added one `Catalog accessory` line without navigation or overflow, used only protected local media and kept final quote submission disabled.
- Fresh Chrome Guest native Tab/Return sampling reached Show More in the natural order. First Return retained visible focus and announced `3 more products shown.`; final Return moved focus to candidate 7 View Product and announced `1 more products shown.`
- Prior reduced-motion and complete five-width main-product evidence remain applicable by preserved hashes; this narrow retest did not overwrite or duplicate them.

### Round 3 evidence and encoding

Fourteen distinct `task023-r3-*` files were added. All are actual JPEG/JFIF bytes under `.png` names with magic prefix `ffd8ffe000104a4649460001`; exact dimensions and SHA-256 appear in `QA/TASK-023/EVIDENCE_INVENTORY.sha256`, `VISUAL_EVIDENCE_R3_MANIFEST.sha256` and the appended canonical manifest. No prior image or report section was overwritten.

Round 3 is the independent O2 closure Visual QA checkpoint only. It is not adversarial review, user acceptance, Git delivery or deployment authorization. No frontend/CSS/tests/docs/CMS/task authority/dependency/Git/deployment/external-system mutation occurred, and Planner-owned server PID 9095 was neither started, stopped nor reconfigured.
