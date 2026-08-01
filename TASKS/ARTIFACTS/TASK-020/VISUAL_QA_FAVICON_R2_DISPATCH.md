# TASK-020 Visual QA Favicon Round 2 Dispatch

status: `AUTHORIZED_NARROW_RETEST`

## Preserved history

Preserve verbatim:

- Visual Round 1
  `BLOCKED_NO_KEYBOARD_EXECUTION_EVIDENCE / severe 0 / obvious 0 / detail 0`;
- keyboard recovery
  `FAIL / severe 0 / obvious 0 / detail 1`;
- all existing screenshots, AX log, measurements, network evidence, actual
  encoding disclosures and SHA-256 inventory.

The system-level keyboard blocker is closed. The only current finding is the
fresh-Chrome same-origin `/favicon.ico` 404 Console error.

## Retest target

Use a new clean Google Chrome Guest/incognito context against the already
running Planner-owned URL:

`http://127.0.0.1:3000/products/fgd-x15-pvc`

Do not start, stop or reconfigure the server. Do not reuse a context with the
prior favicon 404 or negative favicon cache.

## Exact retest

1. Start Console and Network recording before loading the target.
2. Load the canonical product-detail page in the clean context.
3. Verify the document declares the local Next icon route and the browser loads
   `/icon.svg` successfully as `image/svg+xml`.
4. Verify there is no `/favicon.ico` request or 404 and zero Console warnings or
   errors.
5. Reuse system-level keyboard keys to navigate to a valid standard state and
   press native Enter, or reproduce the prior valid standard state with the
   smallest native-key chain. Verify no external, WordPress, ProductCard,
   submission or Feishu request and no new Console warning/error.
6. Confirm one latest summary, canonical URL and the already-passing visual
   layout remain unchanged. No new five-viewport recapture is required unless
   a regression is observed.
7. Save only the minimum new Console/Network/icon evidence. Verify actual image
   type, magic bytes, dimensions and SHA-256, and append a clearly separated R2
   section to both reports.

Return `PASS / severe 0 / obvious 0 / detail 0` only if the favicon D1 is closed
and no regression appears. Otherwise return the exact current finding or
blocker. Do not repair findings in visual_qa.

## Allowed writes

- `QA/TASK-020/**`;
- `TASKS/ARTIFACTS/TASK-020/VISUAL_QA_REPORT.md`;
- `LANES/visual_qa/**`;
- one controlled response linked to `MSG-TASK-020-VISUAL-QA-FAVICON-R2`.

## Forbidden

- frontend/CSS/tests/README/task-authority edits;
- CMS/database/dependency/server-lifecycle actions;
- review, acceptance, Git, deployment, Basket, persistence, submission, Feishu
  or external-system work.
