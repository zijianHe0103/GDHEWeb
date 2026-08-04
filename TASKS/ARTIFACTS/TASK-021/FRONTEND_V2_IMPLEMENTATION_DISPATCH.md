# TASK-021 Frontend V2 Implementation Dispatch

## Authority and gate

The user confirmed TASK-021. WordPress Product Configuration 2.0.0 and Planner CMS checkpoint are PASS. This dispatch authorizes only TASK-021 frontend A4-A6.

Read completely:

1. `AGENTS.md`;
2. `TASKS/ACTIVE/TASK-021-track-length-color-configuration.md`;
3. `TASKS/ARTIFACTS/TASK-021/REQUIREMENTS.md`;
4. `TASKS/ARTIFACTS/TASK-021/DESIGN.md`;
5. `TASKS/ARTIFACTS/TASK-021/IMPLEMENTATION_PLAN.md`;
6. `TASKS/ARTIFACTS/TASK-021/PRODUCT_CONFIGURATION_V2_HANDOFF.md` plus manifest/checksums;
7. `TASKS/ARTIFACTS/TASK-021/PLANNER_CMS_CHECKPOINT.md`;
8. current TASK-019 v1 frontend snapshot/QuoteLine and TASK-020 configurator implementation/tests.

## Required TDD implementation

### A4 Product Configuration v2 consumer

1. Capture a valid RED for the missing independent v2 snapshot/verifier, then copy the exact four-Schema closure, one Golden and declared errors from the frozen CMS handoff without reading CMS/TASKS at runtime.
2. Build a Node-built-in fail-closed verifier bound to the v2 handoff and source hashes. Preserve all v1 snapshot/verifier bytes and behavior.
3. Add fixed server-only v2 Transport (`locale=en`, `schema=2.0.0`, canonical path), exact four-Schema Validator, semantic validation, authentic wrapper, deeply readonly public DTO Adapter and real public/deep Client Component build negatives.
4. Keep one `/resolve`, one `/product-configurations`, zero `/product-cards`, zero per-option and zero browser-to-WordPress requests.

### A4 QuoteLine 2.0.0

1. Capture REDs proving v1 requires `installationMethod` and cannot express the confirmed track line.
2. Add a separate closed QuoteLine 2.0.0 schema, resolved/custom success samples and deterministic invalid samples. Do not edit any v1 Schema/sample/equality/merge byte.
3. V2 configuration contains only packaging. No hidden/default/null installation field is allowed.
4. Preserve positive safe integer quantity and exact safe one-decimal custom-length bounds.

### A5 pure choices and visible UI

1. Purely project unique Track Length choices from the complete DTO options; numeric ascending order; append sibling `Custom Length`; do not hardcode 4.3/6/7.
2. Standard Color choices are filtered by the selected length. Custom Color choices are the model option union. Stable order is customer label then code.
3. Resolve standard selection only when exact length/color finds one Article Number; 0 or multiple matches fail closed. Article Number remains internal to the builder and absent from the visible summary.
4. Replace the current Standard/Custom mode and Installation UI with:
   - Track Length fieldset containing real standard lengths plus Custom Length;
   - conditional custom-length input;
   - following Color fieldset;
   - unchanged Packaging and Quantity fields;
   - unchanged `Add to Quote` one-latest-in-memory behavior.
5. Remove Installation from the form, errors, visible summary and QuoteLine v2. Keep the product fact that ceiling and wall mounting are supported outside the configurator.
6. Current preview data must still contain only 6 m and Ivory White. Do not invent 4.3 m, 7 m or another Article Number/color.

## Failure and accessibility

- Empty/invalid/ambiguous choice set: sanitized unavailable state and no QuoteLine.
- A changed length clears a color no longer available.
- Field labels, fieldset/legend, stable inline error IDs, aria-invalid/describedby/live, keyboard order, focus and touch targets remain valid.
- Preview/CMS remain noindex/nofollow, non-production; production and disabled modes remain 404.

## Allowed writes

- TASK-021 allowed `frontend/**` and `docs/frontend/**` paths;
- TASK-021 frontend artifacts and `LANES/frontend/**`.

## Forbidden writes/actions

- no CMS/WordPress/database/Feishu mutation;
- no v1 Product Configuration or QuoteLine byte modification;
- no ProductCard/ProductList or unrelated Product Detail change;
- no related-products carousel, Basket, persistence, submission API, root README, package/lock/dependency, deployment or Git;
- no review or acceptance;
- do not start/stop a Planner-owned preview server without a follow-up request.

`frontend/next-env.d.ts` currently contains the previous Planner dev-server generated import. A successful production build must restore the tracked production baseline; do not treat it as a business source change.

## Validation and response

- Record direct RED before each production seam and minimum GREEN.
- Run focused v2 tests, all v1 regressions, all four contract verifiers, full Vitest, lint, typecheck, production build and all existing production smokes.
- Verify protected hashes/inventories, no internal leakage, no listener/temp/generated residue, scope and DPG gates.
- Update frontend contract documentation, but not root README (Planner-owned final synchronization).
- Produce frontend execution/validation/diff/TDD artifacts and worklog, then send one linked controlled execution_response. Visual QA and review remain Planner-gated.
