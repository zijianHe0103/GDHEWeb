# TASK-022 Visual QA Dispatch

Date: 2026-08-05
From: `planner`
To: `visual_qa`
Task state: `IN_PROGRESS / NOT_ACCEPTED / DIRTY`

## Authority and runtime

- Read the active TASK-022 card, requirements, design, implementation plan,
  A3-A5 execution evidence and `PLANNER_A3_A5_CHECKPOINT.md` first.
- Planner owns a same-origin local preview at `http://127.0.0.1:3000` with
  both Product Detail and ProductList preview modes enabled.
- Product route: `http://127.0.0.1:3000/products/fgd-x15-pvc/`.
- Basket route: `http://127.0.0.1:3000/request-a-quote/`.
- The user-provided Apple Basket screenshot is information-hierarchy reference
  only: `/var/folders/zj/_zr3b5k54jl5r7hz3v1x1vg80000gn/T/codex-clipboard-4844038a-ae53-4992-8de5-d03dd3cd9c7b.png`.
- Do not copy Apple assets, prices, delivery, Save for Later or ecommerce
  language. Judge GDHE's left-image/right-compact-parameters adaptation.

## Required real-browser states

1. Clear only `gdhe.quote-basket.v1`; capture the empty Basket.
2. Configure the real preview `6 m / Ivory White` candidate with valid
   packaging and quantity, then use `Add to Quote`. Verify the product page
   stays visible, announces the result, shows line count and provides `View
   Quote Basket`.
3. Add the identical complete public configuration again and prove one line
   with accumulated quantity.
4. Change one real public choice, such as base packaging or Logo, add again and
   prove a separate line.
5. Refresh and reopen the Basket route and prove recovery from browser storage.
6. Use two same-origin tabs to prove a newer legal add/quantity/Remove event is
   reflected in the other tab without a network request.
7. On the Basket page, edit exactly one positive whole-number quantity, Remove
   exactly one line, then remove the final line and verify the empty state.
8. Confirm the disabled `Request a Quote` control never navigates, fetches,
   claims success or writes externally.

## Visual and accessibility matrix

- Capture authentic 1440, 1024, 768, 390 and 320 CSS-pixel evidence for the
  product success state and Basket one/N/empty states as useful.
- Classify differences as severe, obvious or detail. Required acceptance:
  no horizontal overflow, readable untruncated configuration, sensible image
  proportion, compact information hierarchy and protected local media.
- Verify keyboard-only configuration, Add to Quote, View Basket, quantity and
  Remove; record focus visibility and `aria-live` announcements.
- Verify reduced-motion behavior and native zoom/reflow at 320 CSS px.
- Inspect Console and Network. There must be no unexpected console error, no
  WordPress `wp-content`, Feishu, external media, submission endpoint or
  per-item CMS request.
- Inspect document/Flight/DOM and `localStorage`: no Article Number,
  GDHEPRD000172, stable Product/Media UUID, WordPress/SCF/Feishu ID, raw CMS,
  internal resolution enum, price, PII, secret or diagnostic.

## Evidence and result

- Write only under `QA/TASK-022/**`, TASK-022 visual artifacts and the
  `visual_qa` lane worklog.
- Record exact filenames, actual file encodings, dimensions and SHA-256 hashes.
- Preserve failed evidence and history if a revision is needed.
- Return one controlled response with verdict `PASS`, `FAIL` or
  `BLOCKED_NO_VISUAL_EVIDENCE`, plus severe/obvious/detail counts and exact
  reproduction notes.
- Do not edit frontend/CMS/product code, Planner authority, dependencies, Git
  state or external systems. Do not claim review, acceptance or deployment.
