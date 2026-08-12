# TASK-027 Frontend A6 Dispatch

message_id: MSG-TASK-027-FRONTEND-DOCS-REGRESSION-A6
task_id: TASK-027
lane: frontend
checkpoint: A6
prerequisite: A5_PLANNER_CHECKPOINT.md PASS_AFTER_NARROW_REVISION

## Objective

Consolidate the completed A1-A5 local RFQ intake implementation, update only
truthful frontend-owned documentation, run the final resource-safe regression
matrix and return one complete implementation handoff for the single full
independent review. Do not perform the review itself.

## Exact documentation scope

- Update `frontend/README.md` with the exact local-only TASK-027 runtime:
  required loopback environment variables, one safe local start/test example,
  `/api/rfq/intake/`, accepted/replay/processing/rejected semantics, Stub
  process-local/non-durable limitation, disabled/production final 404, and the
  commands for snapshot verifier, focused tests and real HTTP smoke.
- State explicitly that no customer-visible RFQ form, production persistence,
  rate limiter/challenge, trusted proxy policy, secret provisioning, Feishu,
  email, queue, CMS mutation or deployment exists.
- Do not publish a real secret. Any example HMAC material must be an obvious
  local non-production placeholder matching the exact parser shape.
- Because `README.md` and
  `docs/architecture/headless-wordpress-nextjs-contract.md` are outside the
  frontend lane write scope, write exact minimal Planner-owned proposed deltas
  to `TASKS/ARTIFACTS/TASK-027/FRONTEND_A6_PLANNER_DOC_DELTAS.md`. Do not edit
  either protected document directly.

## Final regression and evidence

Run on Node 24.18.0:

1. A1-A5 focused inventory, including raw-body zero-trap and one-parse proof;
2. TASK-025 mixed consumer and Quote Basket v3 regressions;
3. the complete current frontend test inventory in a resource-safe form;
4. all ten offline contract verifiers;
5. lint, typecheck and production build;
6. extended real HTTP local/production smoke and all existing production smokes;
7. public/deep server-only build negatives;
8. protected hashes, forbidden field/secret/runtime import scans, exact contract
   inventories, package/lock/tsconfig/next-env integrity;
9. generated output, temporary roots and listener cleanup;
10. Markdown/local-link/JSON, `git diff --check`, DPG project/registry/messages
    and strict lane gates.

Consolidate or create the task-level execution, validation and diff reports so
the review request can rely on one current truth. Preserve all A3/A5 FAIL and
recovery history. Set no task state and claim no review, acceptance, Git,
deployment or external integration.

## Explicit exclusions

No product behavior change unless a final regression exposes a direct TASK-027
defect, in which case stop and report it rather than expanding scope. No UI,
customer form, Basket clearing, CMS/database, real persistence, Feishu/email,
dependency/package/lock, production secret or deployment action.

Update only frontend-owned docs/tests/evidence and
`LANES/frontend/worklog.md`. Return one linked `execution_response`, then stop.
