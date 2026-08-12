# TASK-028 Frontend Visual R1 Revision Diff Summary

## Product files

- `frontend/src/lib/rfq/submission/client.ts`
  - removed the trailing slash from the two fixed browser POST paths only.
- `frontend/src/lib/rfq/customer/index.ts`
  - enabled full Ajv error collection only.
- `frontend/src/components/rfq-form/presentation.tsx`
  - added one same-page Privacy Policy link and truthful focusable local policy
    section before the existing submit button.

## Direct tests

- `frontend/tests/rfq-submission-client.test.ts`
  - requires the exact two slashless same-origin paths across new submission,
    retry and invalidation scenarios.
- `frontend/tests/rfq-customer-domain.test.ts`
  - requires the exact ordered five-error empty-form result.
- `frontend/tests/rfq-form-presentation.test.ts`
  - proves the five-error accessible mapping and local Privacy Policy
    link/target/focus/leakage boundary.

## Evidence and lane record

- four `FRONTEND_VISUAL_R1_REVISION_*` artifacts in this directory;
- one appended TASK-028 entry in `LANES/frontend/worklog.md`.

## Explicit non-diff

No CSS, form field order, component state/orchestration, Basket, contract
snapshot, Route Handler, server config, package, lockfile, dependency,
environment file, CMS, root documentation, Planner state, Visual evidence or
external system was changed. The production build temporarily regenerated
`.next` and the dev next-env import; `.next` was cleaned and next-env was
restored byte-for-byte to the frozen production baseline.

The shared worktree remains intentionally dirty from Planner, Visual QA and
earlier accepted task work. Those unrelated bytes were preserved and were not
reverted or reformatted.
