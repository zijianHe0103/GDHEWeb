# TASK-020 Frontend Adversarial Custom-length P1 Round 1 Dispatch

status: `AUTHORIZED_NARROW_REVISION`
owner: `frontend`
source_review: `MSG-TASK-020-ADVERSARIAL-REVIEW-R1-RESPONSE`

## Objective

Close only the Round 1 P1 in the production custom-length QuoteLine builder:
a syntactically valid one-decimal string must not produce a precision-losing or
non-finite JavaScript number.

## Required TDD Sequence

1. Add direct production-builder regressions before modifying production code:
   - `9999999999999999.9` must return a closed `customLength` error, not a
     rounded success;
   - a 400-digit positive integer followed by `.9` must return the same closed
     error, not `Infinity`;
   - preserve a direct ordinary `5.8` custom success and validate it against the
     unchanged frozen QuoteLine 1.0.0 Schema.
2. Run the focused test and record the real RED caused by current production
   behavior.
3. Make the smallest production change that rejects custom-length conversion
   unless the accepted one-tenth decimal is finite and numerically exact. A
   scaled-tenths representation may be used only if it is itself a positive
   safe integer and converts back to the accepted canonical decimal without
   loss.
4. Rerun the focused tests to GREEN, then the complete TASK-020 and frontend
   regressions.

## Preserved Semantics

- normal `5.8` custom length remains accepted;
- custom length stays positive and at most one decimal place;
- custom output remains `articleNumber: null` and
  `resolution: sales_follow_up`;
- sole resolved option, standard path, color, installation, packaging, Logo,
  protection, quantity and one-latest-result replacement remain unchanged;
- every success branch must validate against the unchanged frozen QuoteLine
  Schema;
- the error remains sanitized `{ field: "customLength", code: "invalid" }`.

## Allowed Writes

- `frontend/src/lib/product-configuration/build-quote-line.ts`;
- `frontend/tests/product-configuration-quote-builder.test.ts`;
- existing TASK-020 frontend execution/validation/diff/TDD artifacts;
- `LANES/frontend/worklog.md`;
- one linked controlled execution response.

## Protected Scope

Do not change Product Configuration or QuoteLine Schema/snapshot/sample bytes,
Transport, Validator, Adapter, loader, DTO, component/UI/CSS, icon, Product
Detail/Card/List, CMS/database, package/lock, README/docs, visual evidence,
Planner task/state, Git, deployment or external systems.

## Required Validation

- direct RED then minimum GREEN for both disclosed attacks;
- focused builder test;
- TASK-020 plus frozen QuoteLine and icon focused suite;
- full Vitest;
- CMS, ProductCard and Product Configuration verifiers;
- lint, typecheck and production build;
- Product Detail, ProductList and CMS integration production smokes;
- protected hashes/diff, `git diff --check`, DPG project/messages and strict
  lane audit;
- no listener or temporary probe residue.

## Stop Boundary

Stop after one linked execution response. Do not run visual QA or adversarial
review, accept the task, use Git, deploy, begin TASK-021 or implement Basket,
persistence, submission or Feishu work.
