# TASK-017 Adversarial Review Dispatch

status: `READY_FOR_INDEPENDENT_REVIEW`
round: `1`

## Scope

Perform a read-only adversarial review of the complete TASK-017 delivery.
Challenge the implementation, tests, visual evidence, documentation and
Planner validation. Do not treat any prior PASS as proof by assertion.

Required authority and evidence:

- `TASKS/ACTIVE/TASK-017-product-card-visible-list-slice.md`
- `TASKS/ARTIFACTS/TASK-017/DESIGN.md`
- `TASKS/ARTIFACTS/TASK-017/IMPLEMENTATION_PLAN.md`
- `TASKS/ARTIFACTS/TASK-017/EXECUTION_REPORT.md`
- `TASKS/ARTIFACTS/TASK-017/TEST_OR_VALIDATION_LOG.md`
- `TASKS/ARTIFACTS/TASK-017/DIFF_OR_OUTPUT_SUMMARY.md`
- `TASKS/ARTIFACTS/TASK-017/TDD_RED_EVIDENCE.md`
- `QA/TASK-017/VISUAL_QA_REPORT.md`
- `TASKS/ARTIFACTS/TASK-017/VISUAL_QA_REPORT.md`
- `README.md`
- `frontend/README.md`
- all TASK-017 product source/tests and required screenshots.

## Mandatory challenges

1. Prove the one server-only `GDHE_PRODUCT_LIST_MODE` gate accepts only exact
   non-production `preview|cms`; unset/unknown and all production modes end in
   framework 404. Verify production smoke contacts the CMS zero times.
2. Verify fixed `noindex,nofollow`, force-dynamic behavior and no public
   Sitemap/route-manifest/production test-candidate aggregation.
3. Verify preview makes zero network requests and CMS mode makes exactly one
   fixed `/product-cards` request with zero per-card `/resolve`.
4. Verify React consumes only readonly ProductCard DTOs and cannot access CMS
   origin, environment, raw HTTP/Schema data, WordPress/SCF/database/internal
   commercial fields or browser-fetch WordPress.
5. Challenge all four frozen action/lifecycle cells, detail link identity,
   accessory RFQ/contact targets and the rule that UI does not derive CTA.
6. Verify 0/1/N, empty versus unavailable, sanitized failure and
   304-without-cache behavior are truthfully covered.
7. Verify the preview candidate uses only the exact protected GDHE image and
   the TASK-013 canonical category path, with meaningful Alt and no absolute
   local path or unprotected fallback.
8. Reproduce or directly inspect responsive and accessibility evidence:
   Round 1 FAIL must remain preserved; Round 2 must close the 1024 CTA and
   media focus findings without hiding history. Validate 1440/1024/768/390,
   320 reflow, 44 px target, link order/focus, semantics and screenshot
   identity.
9. Verify dependencies, lockfile, Next config, CMS, TASK-014～016 contracts,
   snapshots, runtime consumer and `/integration/cms` remain protected.
10. Verify README claims are local-only and do not misstate this as a formal
    product catalog, completed RFQ, deployment, production SEO or accepted
    delivery.

## Current Planner evidence to reproduce

- ProductList: `3 files / 21 tests` PASS.
- TASK-016 focused: `5 files / 73 tests` PASS.
- Full Vitest: `18 files / 265 tests` PASS.
- ProductCard verifier `8/3/6`; CMS verifier `16/2/2`.
- lint, typecheck, build and production smoke PASS.
- production preview/cms final 404; root 200; integration 404; CMS requests 0.
- visual Round 1: `FAIL / severe 0 / obvious 1 / detail 1`.
- visual Round 2: `PASS / severe 0 / obvious 0 / detail 0`.
- protected hashes/scope, 13/20 inventories, diff and DPG gates PASS.

## Verdict contract

Return exactly one of `PASS`, `FAIL` or `BLOCKED`, with exact `P0`, `P1` and
`P2` counts and evidence for every finding. Any P0/P1 or unmet acceptance gate
must produce `FAIL` and prohibit Planner final validation.

Write only:

- `TASKS/ARTIFACTS/TASK-017/ADVERSARIAL_REVIEW_REPORT.md`
- adversarial reviewer lane records;
- one controlled review response linked to the Planner request.

Do not repair product code or evidence, modify Planner state, accept/close the
task, perform Git delivery, deploy, mutate CMS/database/external systems or
start another task.
