# TASK-028 Overflow Bounded Closure Metrics and Focus Record

Controlled request: `MSG-TASK-028-VISUAL-QA-OVERFLOW-CLOSURE`
Runtime: Planner-owned Next PID `64211` at `http://127.0.0.1:3000/request-a-quote`
Seed: frozen `ready-mixed.json`, SHA-256 `0bdcf375459c49dccf65ec383c5d35cc0538f242c698850dc8166b1c65ae38b9`

No submission was made.

## Exact geometry

| CSS width | `innerWidth` | `clientWidth` | `scrollWidth` | form bounds | policy bounds | contained | clipped | overlaps Submit | viewport offenders |
| ---: | ---: | ---: | ---: | --- | --- | --- | --- | --- | --- |
| 390 | 390 | 390 | 390 | left `44.5`, right `345.5`, width `301` | left `44.5`, right `345.5`, width `301` | `true` | `false` | `false` | `[]` |
| 320 | 320 | 320 | 320 | left `41`, right `279`, width `238` | left `41`, right `279`, width `238` | `true` | `false` | `false` | `[]` |

At both widths, `#rfq-privacy-policy` exactly shares the parent form's horizontal bounds. Its text wraps inside the card and the visible card, focus outline and Submit action remain inside the viewport.

## Native keyboard and focus

- From a freshly navigated page document at 320 CSS px, 23 native system-level `Tab` presses reached the visible Privacy Policy link.
- One additional native `Tab` moved to `Submit Request`, proving Privacy-before-Submit order. Within the form's focusable list their indexes were `10` and `11`.
- Native `Shift+Tab` returned to Privacy Policy. Native `Enter` changed only the URL fragment to `#rfq-privacy-policy` and moved the real accessibility focus to the `#rfq-privacy-policy` container.
- The focused target showed the visible focus outline and remained fully contained at 320 CSS px.

## Privacy and browser request boundary

- The policy copy remained: `For this local non-production test, the contact and RFQ details you submit are processed only by the local non-production Stub. They are not sent to Feishu, CRM or email, and they are not stored in durable production storage.`
- After native same-page activation, the browser resource record contained `24` same-origin entries, `external=[]`, `suspicious=[]` for WordPress/Feishu/analytics, and `submissionRequests=[]` for RFQ intent/intake.
- Chrome Console contained React/HMR development information and the already-disclosed protected-image LCP advisory; no application error or external/CMS/Feishu/analytics activity appeared.

## Capture disclosure

All five `.png`-named screenshots are actual JPEG/JFIF bytes with magic prefix `ffd8ffe000104a4649460001`, density `72x72`, and dimensions `956x768`. Exact hashes are recorded in `QA/TASK-028/OVERFLOW_CLOSURE_EVIDENCE_INVENTORY.sha256`.
