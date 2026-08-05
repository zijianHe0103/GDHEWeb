# TASK-022 Frontend A1/A2 Controlled Dispatch

Date: 2026-08-05
From: `planner`
To: `frontend`
Task state: `IN_PROGRESS / NOT_ACCEPTED / DIRTY`

## Required reading

Read completely before ACK or mutation:

1. `AGENTS.md`
2. `TASKS/ACTIVE/TASK-022-quote-basket-foundation.md`
3. `TASKS/ARTIFACTS/TASK-022/REQUIREMENTS.md`
4. `TASKS/ARTIFACTS/TASK-022/DESIGN.md`
5. `TASKS/ARTIFACTS/TASK-022/IMPLEMENTATION_PLAN.md`
6. `TASKS/ARTIFACTS/TASK-022/PROTECTED_BASELINE.md`
7. `TASKS/ARTIFACTS/TASK-022/BASELINE_VALIDATION.md`
8. `TASKS/ARTIFACTS/TASK-021/PUBLIC_QUOTE_DRAFT_AUTHORITY_DECISION.md`
9. `docs/frontend/PRODUCT_CONFIGURATION_AND_QUOTE_LINE_CONTRACT.md`

## Exact authorized slice

Implement only A1 and A2 with strict RED before minimum GREEN:

### A1 — public contract and pure domain

- add a new frontend-owned closed `QuoteBasketDocument 1.0.0` authority;
- add public-only basket product/item types without changing existing
  `PublicQuoteDraft`, Product Configuration or QuoteLine authority bytes;
- implement exact validation and deep immutable create/add/merge/set-quantity/
  remove/summary/revision operations;
- prove zero/one/N, complete-public-identity merge, every split field,
  standard/custom separation, safe-integer boundaries, overflow rejection,
  display-field refresh on merge, line-count-only summary and caller
  immutability;
- reject Article Number, internal IDs, raw enums/CMS, price/business fields,
  PII, remote or `wp-content` images and unknown keys.

### A2 — storage and same-origin tab reconciliation

- use fixed storage key `gdhe.quote-basket.v1` and fixed TTL
  `2_592_000_000` ms;
- select and export one encoded payload ceiling no larger than 512 KiB;
- implement dependency-free validated serialization/parsing with injected clock,
  storage and ID boundaries;
- implement fail-closed expired/corrupt/unknown/extra/oversized/quota/security
  handling with stable sanitized public errors;
- prove reads do not extend TTL and every successful mutation does;
- implement deterministic newer-snapshot adoption for storage events and prove
  stale/invalid events do not replace the current legal snapshot;
- document the exact last-writer-wins limitation without claiming transactional
  cross-tab merging.

## Hard stop after A2

Do not implement or modify:

- FGD X15+PVC product-page Add to Quote integration;
- `/request-a-quote/` route, Basket UI, CSS or Apple-style rows;
- related products or TASK-023;
- final Request a Quote form, endpoint, anti-abuse controls or Feishu;
- CMS, WordPress, database, ProductCard/ProductList behavior;
- dependencies, `package.json`, lockfile or production media allowlist;
- root README, architecture contract or ADR-006 in this checkpoint;
- visual QA, review, acceptance, Git or deployment.

The existing configurator, product page, protected image, QuoteLine v1/v2,
Product Configuration v2 manifest, package/lock and `next-env.d.ts` hashes are
protected for A1/A2. New work should be additive under the smallest relevant
`frontend/src/lib/quote-basket/**`, `frontend/src/types/**`, tests and
`docs/frontend/**` paths.

## Required verification

- record the direct missing-contract/domain and missing-persistence REDs;
- run focused A1/A2 tests under Node `24.18.0` and npm `11.16.0`;
- run the current configurator/QuoteLine focused baseline, all existing
  contract verifiers, lint, typecheck and the complete frontend suite;
- run production build only if necessary for the new server-only/public import
  boundary; remove generated output afterward and preserve `next-env.d.ts`;
- verify exact protected hashes, package/lock, CMS zero diff, forbidden-field
  scans, scope, diff and DPG project/messages/strict-lane gates.

## Required response and artifacts

ACK the controlled message before mutation. When A1/A2 is complete, send one
linked `execution_response` to Planner and produce:

- `TASKS/ARTIFACTS/TASK-022/FRONTEND_A1_A2_EXECUTION_REPORT.md`
- `TASKS/ARTIFACTS/TASK-022/FRONTEND_A1_A2_TDD_RED_EVIDENCE.md`
- `TASKS/ARTIFACTS/TASK-022/FRONTEND_A1_A2_VALIDATION_LOG.md`
- `TASKS/ARTIFACTS/TASK-022/FRONTEND_A1_A2_DIFF_SUMMARY.md`
- updated `LANES/frontend/worklog.md`

Report exact file/test counts, chosen size limit, TTL/reconciliation behavior,
protected hashes and residual generated files. Do not infer Planner checkpoint,
review, acceptance or authorization for A3-A5.
