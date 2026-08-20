# TASK-020 Visual QA Report

This is the canonical TASK-020 visual QA report. The detailed evidence copy is
`QA/TASK-020/VISUAL_QA_REPORT.md`.

- message: `MSG-TASK-020-VISUAL-QA-R1`
- delivery key: `MSG-TASK-020-VISUAL-QA-R1:019f88d0-0f9c-7940-af93-f9eef03f92c8`
- executed: `2026-08-01T08:03:19Z`
- verdict: `BLOCKED_NO_KEYBOARD_EXECUTION_EVIDENCE`
- severe differences: `0`
- obvious differences: `0`
- detail differences: `0`

## Controlled result

All default, invalid, valid standard, valid custom replacement, responsive,
focus rendering, semantics, reduced-motion/no-motion, browser-network, console,
leakage and screenshot-encoding gates passed with no graded visual findings.

PASS is withheld because the available browser-control channel did not deliver
native `Tab`, `ArrowRight` or `Enter` events. It could not advance focus from
the body or first link, and `Enter` on the focused submit button did not submit;
the same valid standard state submitted immediately by mouse click. Natural DOM
order and visible 3px focus on all 12 interactive targets were independently
verified, so this is an evidence blocker rather than a product defect.

Smallest recovery: preserve all current evidence and rerun only native
keyboard-only traversal, radio/select operation and keyboard submit in a
browser-control channel that delivers real key events. No frontend correction
is proposed from this round.

## Verified summary

- Exact full-page evidence: 1440, 1024, 768, 390 and 320 CSS px.
- `scrollWidth == clientWidth` at every viewport; no 320 component overflow.
- Default state matches the frozen configuration.
- Invalid submit: no latest line; three sanitized, associated inline errors.
- Standard result: all frozen customer fields; no internal leakage.
- Custom result: one latest item; standard result fully replaced.
- CTA: 44.09px high; center hit true at 390 and 320.
- Semantics: labels, two fieldset/legend groups, associated errors and polite
  live result.
- Reduced motion: no rendered animation or transition and no essential motion.
- Browser assets: 20, all same-origin; console warnings/errors 0; no external,
  WordPress, ProductCard, submission or Feishu request.
- Local notice and `noindex, nofollow` retained.

## Encoding and evidence

All 11 visual files are real PNG. Independent `file`, magic-byte and metadata
checks confirmed magic `89 50 4e 47 0d 0a 1a 0a`. The browser endpoint supplied
JPEG/JFIF screenshot bytes, which were decoded and explicitly re-encoded as PNG.

The preserved native full-page artifact demonstrates stale repeated paint.
Formal full-page files are exact-width, unscaled vertical composites captured
after paint synchronization. Scrollbar/dev-tool fragments at tile boundaries
are capture artifacts.

Full measurements, state evidence, file dimensions and SHA-256 values are in
`QA/TASK-020/VISUAL_QA_REPORT.md`; the authoritative inventory is
`QA/TASK-020/EVIDENCE_INVENTORY.sha256`.

## Scope protection

No server lifecycle action, frontend/CSS/test/doc/task-authority/CMS/dependency
change, finding repair, review, Git, deployment or external-system action was
performed.

## Keyboard Recovery — 2026-08-01

- recovery message: `MSG-TASK-020-VISUAL-QA-KEYBOARD-RECOVERY`
- preserved Round 1: `BLOCKED_NO_KEYBOARD_EXECUTION_EVIDENCE / severe 0 / obvious 0 / detail 0`
- recovery verdict: `FAIL / severe 0 / obvious 0 / detail 1`

### Keyboard execution result

System-level native keys in a real Google Chrome Guest window closed the Round
1 keyboard blocker:

- continuous Tab focus advanced in native order through the category link,
  Hero CTA, one Tab stop per radio group, selects, checkbox, quantity and Add to
  Quote; AX focus was read after each action;
- native Right selected Custom and moved AX focus; native Left restored
  Standard;
- the entire required standard configuration was completed without mouse;
- native Return on the AX-focused Add to Quote button produced exactly one
  complete latest summary, kept the canonical URL and exposed no internal or
  persistence claim;
- a second native Return while Chrome Network recorded left the request table
  empty, with no external, WordPress, ProductCard, submission or Feishu request.

Unchecked radios are not separate native Tab stops; they are reached with arrow
keys inside the group. The observed behavior matches native browser semantics.

### D1 — Console favicon error

Chrome Console contained one same-origin page-load error:

`http://127.0.0.1:3000/favicon.ico` → `404 Not Found`

It was not introduced by the keyboard chain, but the dispatch requires zero
console warnings/errors. Recovery therefore cannot return PASS.

Smallest proposed correction: provide `/favicon.ico`, or remove/change the
favicon declaration so the browser does not request a missing resource. No fix
was applied.

### Evidence

Six minimum recovery screenshots were added. They are JPEG/JFIF bytes under
`.png` names, `956 x 768`, with magic `ff d8 ff e0 00 10 4a 46`; hashes are
appended to `QA/TASK-020/EVIDENCE_INVENTORY.sha256`. Exact AX focus/state,
network and console observations are in
`QA/TASK-020/KEYBOARD_RECOVERY_AX_LOG.md`. Round 1 evidence and hashes remain
unchanged.

No server lifecycle, product-code, task-authority, CMS, dependency, review,
Git, deployment or external-system action was performed.

## Favicon Round 2 — 2026-08-01

- message: `MSG-TASK-020-VISUAL-QA-FAVICON-R2`
- delivery key: `MSG-TASK-020-VISUAL-QA-FAVICON-R2:019f88d0-0f9c-7940-af93-f9eef03f92c8`
- preserved Visual Round 1: `BLOCKED_NO_KEYBOARD_EXECUTION_EVIDENCE / severe 0 / obvious 0 / detail 0`
- preserved Keyboard Recovery: `FAIL / severe 0 / obvious 0 / detail 1`
- Round 2 verdict: `PASS / severe 0 / obvious 0 / detail 0`

In a new Chrome Guest context, Console and Network recording were started
before the canonical page loaded. The document declared the resolved local
Next icon URL `/icon.svg?icon.3pigvvo6ltwt4.svg` as `image/svg+xml`; Chrome
loaded it with `200 OK` and Network type `svg+xml`. There was no `favicon.ico`
request or 404. Console reported zero messages after load and after native
Enter, with no warning or error row. The prior favicon D1 is closed.

The minimum native-key chain produced one complete standard FGD X15+PVC latest
item (`6 m`, Ivory White, Ceiling Mount, Standard Packaging, Logo No,
Protection None, quantity 2). Focus remained on Add to Quote and the canonical
URL and already-passing layout remained unchanged. Network had the same 24
unique inspected-page URLs before and after Enter, all same-origin, with an
empty after-minus-before set and no external, WordPress, ProductCard,
submission or Feishu request.

Three minimum screenshots were added. They are JPEG/JFIF bytes under `.png`
names, `956 x 768`, with magic `ff d8 ff e0 00 10 4a 46`; exact hashes were
appended to `QA/TASK-020/EVIDENCE_INVENTORY.sha256`. Detailed browser/AX
observations are in `QA/TASK-020/FAVICON_R2_AX_LOG.md`. Every prior screenshot,
encoding disclosure, hash, measurement and verdict remains unchanged.

The Planner-owned server was untouched and the Guest window was closed by
native keyboard shortcut. No product code, CSS, tests, README, CMS, task
authority, dependency, review, Git, deployment or external-system action was
performed.
