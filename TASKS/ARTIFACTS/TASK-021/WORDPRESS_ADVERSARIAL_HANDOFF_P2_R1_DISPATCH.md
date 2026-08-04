# TASK-021 WordPress Adversarial Handoff P2 Round 1 Dispatch

## Authority

- Adversarial Round 1: `FAIL / P0=0 / P1=2 / P2=1`.
- This dispatch closes only P2-1: Product Configuration v2 current handoff is `19/20` because the determinism artifact hash is stale in the manifest and checksum list.
- P1 frontend work remains blocked until this CMS authority is refrozen and independently checked.

## Required RED/GREEN

1. Preserve a direct RED showing current `PRODUCT_CONFIGURATION_V2_HANDOFF_CHECKSUMS.sha256` fails exactly the determinism artifact while the other nineteen entries pass.
2. Run the canonical final two-lifecycle determinism/cleanup proof required by the existing TASK-021 CMS evidence. Do not invent database IDs, rewrite history or leave Fixture residue.
3. Only after the final determinism artifact is stable, regenerate once:
   - `PRODUCT_CONFIGURATION_V2_HANDOFF_MANIFEST.json`;
   - `PRODUCT_CONFIGURATION_V2_HANDOFF_CHECKSUMS.sha256`.
4. Prove literal current `20/20` source parity, Schema/Golden/runtime/error closure, v1 frozen authority, exact cleanup, Core/SCF/DB health, diff and DPG gates.
5. Record the earlier stale `8dbc5368...0380` expectation and the final current digest truthfully; do not erase Adversarial Round 1 history.

## Allowed writes

- the two TASK-021 Product Configuration v2 handoff authority files above if required by the canonical generator;
- existing TASK-021 WordPress execution/validation evidence and WordPress lane worklog;
- CMS documentation only if a factual handoff checksum statement requires correction.

## Forbidden scope

Do not change Product Configuration v2 Schema/Golden/error/runtime/API behavior, Fixture business truth, v1 authority, frontend pins, ProductCard/A3, real database content, frontend product/UI/tests, Planner authority, visual evidence, dependencies, Git, deployment, Feishu, Basket, submission or related products.

## Return

Return one linked execution response with the exact final determinism digest, literal `20/20` result, cleanup totals and changed-file list. This checkpoint is not review PASS, acceptance or Git authorization.
