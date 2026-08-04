# TASK-021 Visual QA Dispatch

## Scope

Review only the local non-production preview at `http://127.0.0.1:3000/products/fgd-x15-pvc` against TASK-021 requirements and the existing TASK-020 accepted component style. Do not compare this isolated slice as a final whole-site design.

## Required evidence

1. Capture full-page evidence at 1440, 1024, 768, 390 and 320 CSS px. Record actual image encoding, dimensions and SHA-256; do not infer encoding from filenames.
2. Verify visible order: `Track Length`, `Color`, Packaging, Quantity, Add to Quote.
3. Verify current standard truth shows only `6 m` plus sibling `Custom Length`; it must not show fabricated `4.3 m` or `7 m`.
4. Verify standard `6 m` exposes only `Ivory White`, produces a complete customer-readable latest-line summary and never exposes Article Number or internal values.
5. Verify selecting `Custom Length` reveals its input, accepts a normal one-decimal value such as `5.8`, and replaces the same latest result rather than appending.
6. Verify Installation is absent from form, errors and result summary. The separate product capability prose may still say ceiling/wall mounting is supported.
7. Exercise invalid submit and confirm stable inline errors, focus visibility and no raw diagnostics.
8. Exercise native keyboard traversal, radio/choice operation and Enter submission; record any channel limitation as evidence rather than inferring a product defect.
9. Verify reflow, horizontal overflow, touch targets, readable density and reduced-motion behavior at all acceptance widths.
10. Verify preview network behavior: no WordPress/Feishu/browser-side CMS request and no unexpected console error.

## Verdict rule

Return `PASS` only when severe, obvious and detail findings are all zero. Otherwise return `FAIL` or `BLOCKED` with reproducible evidence and the smallest proposed correction. Preserve every round of evidence.

## Boundaries

- Write only `QA/TASK-021/**`, `TASKS/ARTIFACTS/TASK-021/VISUAL_QA_REPORT.md` and visual_qa lane records.
- Do not start, stop or reconfigure the Planner-owned server.
- Do not edit frontend, CMS, active task, project state, README, contracts or tests.
- Do not implement related products, Basket, persistence, submission, Feishu, Git or deployment.
