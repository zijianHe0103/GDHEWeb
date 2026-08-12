# TASK-028 Visual QA Dispatch

Date: `2026-08-12`
From: `planner`
To: `visual_qa`
Task state: `IN_PROGRESS / NOT_ACCEPTED / DIRTY`

## Authority and runtime

- Read the complete active TASK-028 card, `REQUIREMENTS.md`, `A0_DESIGN.md`,
  `A5_PLANNER_CHECKPOINT.md` and the five `FRONTEND_A5_*` artifacts first.
- Planner owns the current accepted-sink preview at
  `http://127.0.0.1:3000/request-a-quote/` and a delayed loopback WordPress
  mixed-validation fixture at port `18080`. Do not stop or restart them.
- The mock returns the frozen TASK-025 response only; it writes no CMS,
  database, CRM, Feishu or external state. Its 1200 ms delay exists only to
  expose the real pending UI.
- Seed the exact current, non-expired Quote Basket fixture from
  `frontend/src/lib/rfq-submission-contract/v2/samples/basket-v3/ready-mixed.json`
  under the existing `gdhe.quote-basket.v1` localStorage key. Do not invent or
  edit product facts.
- For an authentic processing state, finish accepted-sink evidence first and
  send one controlled request to Planner to restart only the same runtime with
  `GDHE_RFQ_STUB_SINK_OUTCOME=indeterminate`; do not create a second concurrent
  Next dev server in this checkout.

## Required real-browser states

1. Clear the one Basket key and capture the empty state: no active form.
2. Seed the exact ready-mixed Basket and capture the visible three-line Basket
   plus the ten-field customer form.
3. Submit empty/invalid fields and verify field errors, error summary, focus
   movement and associations without any intake call.
4. Fill a valid customer submission and capture the real pending state during
   the delayed mixed validation. Repeated activation must not create a second
   attempt.
5. Let the accepted request complete. Verify the authentic customer-safe
   receipt and that the exact unchanged Basket becomes empty.
6. Repeat from the same seed, but change the Basket from a second same-origin
   tab while the first request is pending. The accepted response must retain
   the whole changed Basket; no partial deletion is allowed.
7. After the controlled processing-mode restart, submit once and verify the
   processing receipt retains the Basket and exposes only the explicit retry
   path; there is no polling or automatic retry.
8. Exercise at least one customer-field failure and one Basket-refresh/error
   result. All copy must be stable and customer-safe, with the Basket retained.

## Responsive and accessibility matrix

- Capture authentic evidence at 1440, 1024, 768, 390 and 320 CSS px. Include
  ready form, field-error summary, pending and accepted/processing states as
  useful; 320 must prove reflow without horizontal scrolling at native zoom.
- Classify findings as severe, obvious or detail. Required acceptance: clear
  Basket/form/result hierarchy, readable compact row data, sensible protected
  media proportion, no truncation or overlapping controls, and no ecommerce,
  price, payment or order language.
- Use keyboard only for Basket quantity/Remove, every form field, Privacy
  Policy link, submission and explicit retry. Record focus visibility, field
  error `aria-describedby`, error-summary focus, pending disabled state and
  `aria-live` result announcements.
- Verify reduced-motion behavior and that zoom/reflow does not hide required
  information or actions.
- Inspect Console and Network. New submission must be exactly one same-origin
  intent POST followed by one same-origin intake POST, with zero browser
  WordPress, Feishu, external media, analytics, polling or automatic retry.
- Article Number may exist in Basket/request developer data by confirmed
  policy, but it must not appear in visible text, accessible names, field
  errors, summaries, announcements or receipts. Secret/HMAC, idempotency key,
  submission intent, snapshot/token, internal UUID, WordPress/Feishu ID, raw
  payload and private diagnostic must not be customer-visible.
- Confirm the page clearly discloses local/non-production status and is
  `noindex,nofollow`.

## Evidence and result

- Write only under `QA/TASK-028/**`, TASK-028 visual artifacts and the
  `visual_qa` lane worklog.
- Record exact filenames, actual encodings, dimensions and SHA-256 hashes.
- Preserve failed evidence and history if one narrow revision is needed.
- Return one controlled response with verdict `PASS`, `FAIL` or
  `BLOCKED_NO_VISUAL_EVIDENCE`, severe/obvious/detail counts and exact
  reproduction notes.
- Do not edit frontend/CMS/product code, Planner authority, dependencies, Git
  state or external systems. Do not claim adversarial review, acceptance,
  deployment or production readiness.
