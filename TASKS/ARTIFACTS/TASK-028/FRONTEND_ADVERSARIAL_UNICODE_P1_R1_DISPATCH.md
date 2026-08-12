# TASK-028 Frontend Adversarial Unicode P1 Narrow Revision

message_id: `MSG-TASK-028-FRONTEND-ADVERSARIAL-UNICODE-P1-R1`

## Authority

Close only P1-1 from the unique complete adversarial review. Preserve the historical `FAIL / P0=0 / P1=1 / P2=1` and every other passing boundary.

## Required change

- The frozen customer domain limits are Unicode code-point maxima. Native HTML `maxlength` is enforced in UTF-16 code units and must not reject a contract-valid non-BMP value before the exact normalizer sees it.
- Remove the unsafe native `maxlength` narrowing from all ten visible controls. Continue to use the existing exact customer normalizer as the only authoritative length gate.
- Do not truncate, coerce or silently rewrite user input. Preserve field order, labels, autocomplete/inputmode, required/contact rules, error summary, focus/ARIA, pending behavior and submission semantics.

## Required TDD and evidence

1. Record RED proving current rendered controls contain narrowing `maxlength` and that an exact-limit non-BMP value cannot be represented under that native ceiling.
2. Add direct regression proving the rendered form no longer exposes a narrowing `maxlength` on any customer control.
3. Prove an exact-limit non-BMP value reaches `normalizeRfqCustomer` unchanged and succeeds, while one additional code point returns only the stable `too_long` error.
4. Run the smallest direct tests first, then the relevant RFQ/form suite, lint, non-incremental typecheck, protected hashes, cleanup, diff and DPG gates.

## Forbidden

- Do not change frozen RFQ/Quote Basket/Product/CMS contracts, Article Number behavior, intent/intake, Basket clear/retry, copy, layout/CSS, dependency/package/lock, Planner authority, visual evidence, Git, deployment or external systems.
- Do not create or edit the three Planner-owned consolidated evidence views; Planner closes P2 separately.
- Do not start another complete review or claim bounded closure PASS.

## Expected response

Write a narrow revision report and validation log under `TASKS/ARTIFACTS/TASK-028/`, update the frontend lane worklog and return one linked execution response for independent Planner validation.
