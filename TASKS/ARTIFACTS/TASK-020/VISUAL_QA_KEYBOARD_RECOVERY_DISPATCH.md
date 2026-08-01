# TASK-020 Visual QA Keyboard Evidence Recovery Dispatch

status: `AUTHORIZED_NARROW_RECOVERY`
source_verdict: `BLOCKED_NO_KEYBOARD_EXECUTION_EVIDENCE / severe 0 / obvious 0 / detail 0`

## Purpose

Close only the missing native keyboard-execution evidence from TASK-020 Visual
QA Round 1. This is an evidence-channel recovery, not a frontend defect or a
product-code revision.

Preserve without rewriting or deleting:

- every Round 1 screenshot and `EVIDENCE_INVENTORY.sha256`;
- both Round 1 visual reports and their blocker explanation;
- all passing responsive, state, focus-rendering, semantics, motion, network,
  console, leakage and encoding evidence;
- the exact `severe 0 / obvious 0 / detail 0` grading.

## Required execution channel

Use the `computer-use:computer-use` skill and its plugin-owned `node_repl` /
`sky` wrapper to send system-level key events to a real local browser app. Do
not rely on the previously failing in-app browser `Tab`/`ArrowRight`/`Enter`
injector as the recovery evidence source.

Reuse the Planner-owned page:

`http://127.0.0.1:3000/products/fgd-x15-pvc`

The visual lane must not start, stop or reconfigure the server. Opening a clean
browser tab/window and navigating to this localhost URL is allowed. No login,
credential, upload, external transmission or consequential action is in scope.

## Keyboard-only evidence

After the page has loaded, use only system-level keyboard events for the tested
interaction chain, except the minimum click needed to give the browser window
initial application focus.

1. Starting from the page rather than a programmatically focused target, press
   native `Tab` repeatedly and record that actual focus advances in DOM order:
   category link, Hero CTA, Standard length, Custom length, Published option,
   Ceiling Mount, Wall Mount, Base packaging, Customer Logo Printing,
   Protection arrangement, Quantity, Add to Quote.
2. Record visible focus at representative link, radio/select/input and submit
   controls. Cross-check the current focused AX element after each key action;
   do not infer focus only from source order.
3. On the length-mode radio group, use native arrow keys and prove the checked
   state changes, then return to Standard length for the submission proof.
4. Complete a valid standard configuration using keyboard navigation and
   native control keys only: published `6 m — Ivory White`, Ceiling Mount,
   Standard Packaging, Logo No, Protection None, quantity `2`.
5. With actual focus on `Add to Quote`, press native `Enter`. Prove one latest
   temporary quote summary appears with all frozen customer fields and that the
   page does not navigate, submit externally, append a second line, expose an
   Article Number/internal enum or claim sent/saved persistence.
6. Verify no external, WordPress, ProductCard, submission or Feishu request was
   introduced by the keyboard chain and no console warning/error appeared.

If the system-level channel still cannot deliver native key events, return a
fresh `BLOCKED_NO_KEYBOARD_EXECUTION_EVIDENCE` with the exact failed action and
do not infer a product defect. Do not synthesize a PASS from direct-focus or
mouse evidence.

## Evidence and verdict

- Append a clearly separated keyboard-recovery section to both canonical
  reports; preserve Round 1 verbatim as history.
- Save only the minimum new screenshots/log evidence under `QA/TASK-020/**`.
- Verify actual image type, magic bytes, dimensions and SHA-256 for new images.
- Return `PASS / severe 0 / obvious 0 / detail 0` only if every keyboard gate
  above is directly observed. Otherwise return the truthful blocker/finding.

## Write scope

Allowed:

- `QA/TASK-020/**`;
- `TASKS/ARTIFACTS/TASK-020/VISUAL_QA_REPORT.md`;
- `LANES/visual_qa/**`;
- one controlled response linked to
  `MSG-TASK-020-VISUAL-QA-KEYBOARD-RECOVERY`.

Forbidden:

- frontend, CSS, tests, README or task authority edits;
- CMS, WordPress, database, dependency or package changes;
- server lifecycle actions;
- adversarial review, acceptance, Git, deployment, Basket, persistence,
  submission, Feishu or external-system work.
