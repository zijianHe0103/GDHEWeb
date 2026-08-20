# TASK-028 Visual QA Round 1

Date: 2026-08-12
Lane: `visual_qa`
Request: `MSG-TASK-028-VISUAL-QA-R1`
Delivery key: `MSG-TASK-028-VISUAL-QA-R1:019f88d0-0f9c-7940-af93-f9eef03f92c8`

## Result

- Verdict: `FAIL`
- Severe: `1`
- Obvious: `2`
- Detail: `0`
- Runtime: Planner-owned accepted-sink preview at `http://127.0.0.1:3000/request-a-quote/`
- Processing switch: not requested because the accepted-sink prerequisite failed before intake

## S1 — browser submission is blocked by the canonical POST redirect

With the exact frozen ready-mixed Basket and valid customer values, native Enter on Submit Request issued one browser fetch to `/api/rfq/intent/`. Chrome Console recorded:

`POST http://127.0.0.1:3000/api/rfq/intent/ net::ERR_FAILED 308 (Permanent Redirect)`

Network contained one failed intent fetch, no intake fetch and no external request. The UI rendered `Local RFQ submission is temporarily unavailable. Your Quote Basket has been kept.` A direct non-following POST reproduced `308` with `location: /api/rfq/intent`; `/api/rfq/intake/` likewise redirects to `/api/rfq/intake`. The client uses the two trailing-slash URLs with `redirect: "error"`, so the intended canonicalization is treated as a hard network failure.

This blocks authentic pending intake, accepted-cleared, accepted-changed, processing and explicit retry evidence. Per the dispatch order, Visual QA did not ask Planner to switch the runtime to processing mode.

Smallest proposed correction: use the canonical slashless same-origin endpoints `/api/rfq/intent` and `/api/rfq/intake` in the client fetches, preserving `redirect: "error"` and every server-side gate. Then rerun the complete accepted-first and processing-second browser state matrix.

## O1 — empty submission omits the four required-field errors

Native Enter on the untouched form correctly moved focus to the error summary, but the summary contained only `Enter at least one contact method.` Full Name, Company Name, Country/Region and City were all empty and visibly marked required, yet none received an error message, `aria-invalid` or `aria-describedby` association.

The customer validator constructs Ajv without `allErrors: true`; the first contact-group `anyOf` error stops collection before the required-field failures. Submission is blocked, but the customer is not told how to repair four mandatory fields.

Smallest proposed correction: collect the complete closed set of schema failures, for example with Ajv `allErrors: true`, then preserve the existing stable deduplication/order and sanitized field/error mapping. Reprove that one empty submit yields all four required errors plus the contact-group error.

## O2 — required Privacy Policy link is absent

The native Tab sequence moves directly from Additional Requirements to Submit Request. The page has no visible or focusable Privacy Policy link, and the browser scan returned `privacyLinks=[]`. This prevents the dispatch-required keyboard proof and gives the customer no reviewable policy target before the server issues its frozen privacy-notice version.

Smallest proposed correction: add one truthful, focusable Privacy Policy link to an actual local customer-safe policy target before Submit Request, without adding an external request or exposing private intent material.

## Passing evidence

- Empty Basket: no active form, clear empty hierarchy and `noindex,nofollow`.
- Ready state: the exact frozen three-line Basket, protected local media and ten customer fields rendered without price, payment, checkout or order semantics.
- Responsive geometry: 1440/1024/768/390/320 each measured `innerWidth == clientWidth == scrollWidth`, zero viewport offender and no clipping or overlapping control.
- Native keyboard: Basket quantity accepted Arrow Up/Down and returned to `2`; Remove, every customer field and Submit Request received visible focus. The missing Privacy Policy link is graded separately.
- Error focus: summary focus and the contact-group association were correct, while the incomplete required-field set is graded separately.
- Reduced motion: explicit 320 CSS px returned `reduced=true`, `clientWidth=scrollWidth=320` and zero moving element; emulation was restored afterward.
- Privacy: visible text and accessible output exposed no Article Number, product UUID, secret/HMAC, idempotency key, submission intent, snapshot/token, WordPress/Feishu identifier or raw diagnostic. HTML private-marker scan was also empty.
- Network: 26 recorded page resources were same-origin; there was zero browser WordPress, Feishu, external media, analytics, polling or automatic retry. The only submission request was the failed intent POST; intake count was zero.
- Console otherwise contained the expected React/HMR development information and the already known protected-image LCP development advisory. The advisory is disclosed but not newly graded.

## State matrix

| State | Outcome |
| --- | --- |
| Empty | PASS |
| Ready at five widths | PASS |
| Field-error summary | FAIL — O1 incomplete required-field set |
| Authentic pending | NOT REACHED — S1 blocks before intake |
| Accepted-cleared | NOT REACHED — S1 |
| Accepted-changed | NOT REACHED — S1 |
| Processing | NOT REQUESTED — accepted-first gate not met |
| Explicit retry | NOT REACHED — S1 |
| Stable temporary error | PASS as the truthful intent-network-failure mapping |

## Evidence and encoding

Twenty visual files are recorded in `QA/TASK-028/EVIDENCE_INVENTORY.sha256`. Every file has actual JPEG/JFIF bytes under a `.png` filename and magic prefix `ffd8ffe000104a4649460001`.

- `task028-empty-1440.png`: `1440x1000`, density `1x1`.
- Chrome page/focus captures: `956x768`, density `72x72`.
- Console/Network/privacy/reduced-motion console captures: `640x640`, density `72x72`.
- `task028-pending-accepted-320.png` is a preserved timing diagnostic, byte-identical to the temporary-error capture; it is not pending proof.

Exact interaction facts are in `QA/TASK-028/BROWSER_INTERACTION_LOG.md`.

## Scope and checkpoint

No frontend, documentation, task authority, CMS, dependency, Git, deployment or external-system byte was modified. Planner-owned Next PID `46538` and fixture PID `46560` remained listening and were not started, stopped or reconfigured. This is Visual QA Round 1 only; it is not complete adversarial review, user acceptance, Git delivery, deployment or production readiness.

# TASK-028 Visual QA Round 2

Date: 2026-08-12
Lane: `visual_qa`
Request: `MSG-TASK-028-VISUAL-QA-R2`
Delivery key: `MSG-TASK-028-VISUAL-QA-R2:019f88d0-0f9c-7940-af93-f9eef03f92c8`

## Round 2 result

- Verdict: `FAIL`
- Severe: `0`
- Obvious: `1`
- Detail: `0`
- Round 1 preservation: unchanged `FAIL / severe 1 / obvious 2 / detail 0`; all twenty Round 1 visual hashes revalidated before this retest
- Accepted runtime: Planner-owned PID `54945`; controlled switch response: `MSG-TASK-028-VISUAL-QA-R2-PROCESSING-SWITCH-RESPONSE`
- Processing runtime: Planner-owned replacement PID `57285`; delayed fixture PID `54901` remained the sole listener on `127.0.0.1:18080`

## New obvious finding — nested Privacy Policy section overflows at 390 and 320

The revision added `#rfq-privacy-policy` as a nested semantic `section`. The global `section` rule contributes `width: min(100%, 42rem)` plus `2.5rem` content-box padding. At narrow widths the nested section therefore exceeds its parent and produces a real horizontal scrollbar and right-edge clipping:

| Device width | `clientWidth` | `scrollWidth` | measured offender |
| --- | ---: | ---: | --- |
| 1440 | 1440 | 1440 | none |
| 1024 | 1024 | 1024 | none |
| 768 | 768 | 768 | none |
| 390 | 390 | 427 | `#rfq-privacy-policy`, right `427.5`, width `383` |
| 320 | 320 | 361 | `#rfq-privacy-policy`, right `361`, width `320` |

The 390 and 320 result captures visibly show the policy card extending past the form column. This fails the frozen `scrollWidth == clientWidth`, no-clipping and 320 reflow gate.

Smallest proposed correction: give only the nested policy section a local border-box override, for example `.panel section { box-sizing: border-box; min-width: 0; }`, without changing its semantic target or copy. Recheck 390 and 320 after the correction.

## S1 and accepted-first matrix — PASS

1. The valid native browser submission issued exactly one slashless same-origin `/api/rfq/intent` fetch followed by one slashless `/api/rfq/intake` fetch. There was no 308, redirect follow, legacy/per-line call, polling, external request or background retry.
2. Authentic delayed validation rendered disabled Basket controls, disabled fields, `Submitting…` and the polite live message. A repeated native Enter during pending created no second attempt.
3. Accepted with the unchanged exact frozen Basket rendered only the customer-safe acceptance result and removed the entire storage key (`basket=null`).
4. In the changed-Basket run, a second same-origin tab changed the first quantity from `2` to `3` while tab one was pending. Tab one then rendered the customer-safe accepted-but-changed receipt, retained all three lines and retained quantity `3`; there was no partial deletion.

## Processing and explicit retry — PASS

After accepted evidence was complete, visual_qa sent exactly one controlled request to Planner. Planner verified old accepted PID `54945` exited and port 3000 was clear before starting only PID `57285` with `GDHE_RFQ_STUB_SINK_OUTCOME=indeterminate`; fixture PID `54901` was untouched.

The first processing attempt recorded `/api/rfq/intent` `200` then `/api/rfq/intake` `202`, retained all three Basket lines and rendered one polite processing receipt. After an additional 2.2 seconds the request list remained one intent plus one intake, proving no automatic retry or polling. Native Tab reached the only Submit Request action and Enter made an explicit unchanged replay: the final list was exactly one intent plus two intake requests (`200, 202, 202`), the second intake completed in 11 ms, the public reference stayed `RFQ-LALDZ7GVVE3T`, and the Basket remained intact. The immediately replayed 202 resolved too quickly for a second authentic pending screenshot; `task028-r2-explicit-retry-pending-320.png` is preserved as a timing diagnostic and is not claimed as pending proof.

## O1 — complete empty-form repair guidance PASS

- Native Enter on the completely empty form focused `Check the highlighted fields`.
- The accessible summary contained exactly, in stable order: `Full Name is required.`, `Company Name is required.`, `Country/Region is required.`, `City is required.`, `Enter at least one contact method.`
- The four required inputs each exposed `aria-invalid=true`, a stable field-specific `aria-describedby` error ID and the matching visible message.
- The contact fieldset retained the original guidance plus the contact error association.

## O2 — local Privacy Policy target PASS

- The native sequence reached Additional Requirements, then the visible Privacy Policy link, then Submit Request.
- Enter on the link changed only the fragment to `#rfq-privacy-policy` and moved focus to the actual policy section.
- The copy remained explicitly local/non-production and said data is not sent to Feishu, CRM or email and is not durably stored. No external policy request, new route, production legal claim, protected identity or private intent material occurred.

## Other regression evidence

- Native Basket quantity Arrow Up/Down changed `2 -> 3 -> 2`; Remove, all ten customer fields, Privacy Policy, Submit Request and the explicit replay action were keyboard reachable with visible focus.
- Explicit reduced-motion emulation returned `reduced=true` and zero running animations. Emulation was restored to `No emulation` before the Guest session was closed. The 320 overflow remained and is the one graded finding.
- Visible text, accessible output and document HTML excluded Article Number, internal UUID, HMAC/secret, intent/key, snapshot token and raw diagnostic material. The truthful phrase “not sent to Feishu” is customer policy copy, not an identifier or integration claim.
- Accepted and processing request scans contained zero WordPress, Feishu, analytics, external media or other cross-origin resource. Protected media stayed same-origin.
- App Console contained only the expected React/HMR development information and the previously disclosed protected-image LCP advisory. Exploratory QA console commands produced syntax errors in two non-authoritative diagnostic captures; those commands did not originate from the app and were cleared before the authoritative processing Console captures.

## Round 2 state matrix

| State | Outcome |
| --- | --- |
| Ready/form at five widths | FAIL only at 390/320 nested-policy overflow |
| Complete empty-field error | PASS |
| Accepted authentic pending | PASS |
| Accepted unchanged clear | PASS |
| Accepted changed retain | PASS |
| Processing retain | PASS |
| No automatic retry/polling | PASS |
| Explicit unchanged replay | PASS |
| Keyboard/focus/live regions | PASS |
| Reduced motion | PASS behavior; overflow finding remains |
| Network/privacy boundary | PASS |

## Round 2 evidence and encoding

`QA/TASK-028/R2_EVIDENCE_INVENTORY.sha256` records all 42 new visual files. Every file has actual JPEG/JFIF bytes under a `.png` filename and magic prefix `ffd8ffe000104a4649460001` with density `72x72`.

- Nine Console/metric captures are `640x640`: `task028-r2-accepted-changed-console.png`, `task028-r2-accepted-network-console.png`, `task028-r2-aria-errors-and-overflow-320.png`, `task028-r2-explicit-retry-console.png`, `task028-r2-metrics-390.png`, all three `task028-r2-processing-before-retry-*.png` Console files, and `task028-r2-reduced-motion-console-320.png`.
- The other 33 page/focus captures are `956x768`.
- Non-authoritative diagnostics are retained, hashed and disclosed rather than deleted: the non-`final` quantity/remove and changed-submit focus captures, `task028-r2-explicit-retry-focus-320.png`, `task028-r2-explicit-retry-pending-320.png`, and the two processing-before-retry Console captures without `attached` in the filename. The `final`, `attached-console`, result and request-count captures are authoritative.

## Round 2 scope and stop gate

No frontend/CSS/test/document/task-authority/CMS/dependency/Git/deployment or external-system byte was modified. visual_qa did not start or stop either Planner runtime; it requested the one frozen accepted-to-processing switch and Planner owned it. Chrome Guest was closed after reduced-motion restoration. Next PID `57285` and fixture PID `54901` remain listening for Planner cleanup. This remains Visual QA only: it is not adversarial review, user acceptance, Git delivery, deployment or production readiness.

# TASK-028 Visual QA Overflow Bounded Closure

Date: 2026-08-12
Lane: `visual_qa`
Request: `MSG-TASK-028-VISUAL-QA-OVERFLOW-CLOSURE`
Delivery key: `MSG-TASK-028-VISUAL-QA-OVERFLOW-CLOSURE:019f88d0-0f9c-7940-af93-f9eef03f92c8`

## Bounded result

- Verdict: `PASS`
- Severe: `0`
- Obvious: `0`
- Detail: `0`
- Historical preservation: Round 1 remains `FAIL / severe 1 / obvious 2 / detail 0`; Round 2 remains `FAIL / severe 0 / obvious 1 / detail 0`
- Runtime: Planner-owned PID `64211`; no server lifecycle or configuration action
- Seed: unchanged frozen ready-mixed Basket, SHA-256 `0bdcf375459c49dccf65ec383c5d35cc0538f242c698850dc8166b1c65ae38b9`
- Submission: none

## Sole Round 2 overflow finding closed

| CSS width | `innerWidth` | `clientWidth` | `scrollWidth` | form bounds | policy bounds | contained | clipped/overlap/offenders |
| ---: | ---: | ---: | ---: | --- | --- | --- | --- |
| 390 | 390 | 390 | 390 | `44.5..345.5`, width `301` | `44.5..345.5`, width `301` | yes | none |
| 320 | 320 | 320 | 320 | `41..279`, width `238` | `41..279`, width `238` | yes | none |

The nested `#rfq-privacy-policy` now exactly shares its form's horizontal bounds at both requested widths. Text wraps naturally; the card, focus outline and Submit action are visible without right-edge overflow, clipping or overlap.

## Adjacent keyboard and privacy regression

- In a fresh Chrome Guest at 320 CSS px, 23 native system-level Tabs reached the visible Privacy Policy link; the next Tab reached `Submit Request`. Their form focusable indexes were respectively `10` and `11`.
- Native Shift+Tab returned to Privacy. Native Enter changed only the same-page fragment to `#rfq-privacy-policy` and moved accessibility focus to the real policy container, with a visible focus outline.
- The local non-production policy copy remained unchanged. Final browser resources were `24` same-origin entries with zero external, WordPress, Feishu or analytics request and zero RFQ intent/intake request. No form submission occurred.

## Bounded evidence and encoding

`QA/TASK-028/OVERFLOW_CLOSURE_EVIDENCE_INVENTORY.sha256` records five new captures under `QA/TASK-028/overflow-closure/**`. Every `.png`-named screenshot has actual JPEG/JFIF bytes, magic prefix `ffd8ffe000104a4649460001`, density `72x72` and dimensions `956x768`. Exact geometry, DOM, focus and request facts are recorded in `QA/TASK-028/overflow-closure/METRICS_AND_FOCUS.md`.

All twenty Round 1 and forty-two Round 2 evidence hashes were revalidated before this bounded capture and were not overwritten. This closure adds evidence only; it does not rewrite either historical verdict.

## Scope and stop gate

No frontend, CSS, test, document, task/Planner authority, CMS, dependency, Git, deployment or external-system byte was modified. Chrome Guest was closed after capture; Planner-owned PID `64211` remained listening. This is the bounded Visual QA closure only, not adversarial review, user acceptance, Git delivery, deployment or production readiness.
