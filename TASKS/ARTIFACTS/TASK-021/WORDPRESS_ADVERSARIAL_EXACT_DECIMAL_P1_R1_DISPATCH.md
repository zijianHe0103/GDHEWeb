# TASK-021 WordPress Adversarial Exact Decimal P1 Round 1 Dispatch

## Authority

- Adversarial Round 1 remains `FAIL / P0=0 / P1=2 / P2=1`.
- This dispatch closes only the CMS/Python half of P1-1 and preserves the already reproduced P2-1 history.
- User decision A, frontend public-draft naming, frontend Ajv handling and frontend pins are outside this lane request.

## Required RED/GREEN

1. Before production evidence change, reproduce through the real current Product Configuration v2 root Schema validator that legitimate complete documents using standard lengths `4.3`, `5.8` and `6.7` do not all pass under the current float-based evidence path; preserve the exact failure output as RED.
2. Replace only the Python evidence boundary's binary-float precision handling with exact decimal handling. Do not change the four frozen Schema bytes, REST/API/PHP behavior, Fixture business truth or current Golden.
3. Prove through full root documents—not isolated scalar assertions—that `4.3`, `5.8` and `6.7` are valid one-tenth lengths and `6.05` is invalid. Evidence must parse/compare decimal values without a binary-float remainder shortcut.
4. Preserve all existing negative cases, exact four-file closure, current real `6 m / Ivory White / GDHEPRD000172` Golden and normalized runtime behavior.
5. Because the changed Python validator is a handoff source, after all code/evidence bytes are final, run the canonical two-lifecycle determinism proof exactly once, then regenerate the canonical handoff exactly once. Prove literal final `20/20`, exact cleanup and zero residue. Do not retain the intermediate P2 hashes as final authority.
6. Reprove Product Configuration v1 `17/17`, Core/SCF/DB/PHP/JSON/Python, protected scope, diff and DPG gates.

## Allowed Writes

- `cms/wp-content/plugins/gdhe-site/tests/product-configuration-v2-schema-validation.py`;
- the minimum direct TASK-021 WordPress evidence/test file if necessary to preserve the RED/GREEN proof;
- generated TASK-021 v2 Schema-validation, determinism, handoff manifest and checksum evidence after the final canonical runs;
- existing TASK-021 WordPress execution/validation/diff reports and `LANES/wordpress_cms/worklog.md`;
- controlled lane messages/events.

## Forbidden Scope

Do not change Product Configuration v2 Schema/Golden/error/API/runtime/PHP behavior, Product Configuration v1, real product data, Fixture business truth, frontend snapshot/pins/code/UI/tests, public-draft/QuoteLine symbols, visual evidence, Planner authority, dependencies, Feishu, Basket, persistence, submission, related products, review, acceptance, Git or deployment.

## Return

Return one linked execution response containing the exact RED, full-root positive/negative evidence, changed-file list, final determinism/manifest/checksum hashes, literal `20/20`, cleanup totals and protected-boundary results. This is a lane checkpoint, not Round 2 PASS, user acceptance or Git authorization.
