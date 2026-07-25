# TASK-010 Frontend Execution Report

status: EXECUTION_COMPLETE_PENDING_PLANNER_CHECKPOINT
task_id: TASK-010
lane: frontend
message: MSG-TASK-010-FRONTEND-RUNTIME-VALIDATOR-R1
executed_at: 2026-07-26

## Outcome

Implemented the server-only CMS Runtime Schema Validator between unknown Transport JSON and the future Adapter. The public seam explicitly validates either the Page Schema 3 success root or the common error root and returns an opaque validated wrapper. No Transport wiring, Adapter, route or visible page was added.

## Implementation

- Added exact production dependencies `ajv@8.20.0` and `ajv-formats@3.0.1`; package scripts are unchanged.
- Added a static 16-Schema registry under `frontend/src/lib/cms/server/validation/`.
- Rebased cloned Schema `$id` values to the fixed in-memory `https://contracts.gdhe.local/schemas/` namespace while leaving the snapshot and relative `$ref` graph unchanged.
- Added two redundant in-memory type annotations required by Ajv `strictTypes`; they preserve constraints already inherited from the parent Schema and do not modify the frozen snapshot.
- Frozen Ajv to Draft 2020-12, `strict: true`, real format validation, no coercion, defaults, removal, remote loader or runtime filesystem access.
- Compiled and reused the success/error roots at module initialization.
- Exposed only `validateCmsSuccessPayload`, `validateCmsErrorPayload`, `CmsContractError` and the two frozen public types.
- Added the module-private brand/private-body wrapper and stable error kinds `unsupported_schema`, `invalid_success_payload` and `invalid_error_payload`.
- Added server-only guards to the public entry, error module and deepest registry module.
- Updated `frontend/README.md` with ownership, call boundary, exact dependencies, commands and explicit non-goals.

## TDD Evidence

- Initial public-seam RED: focused Vitest exited 1 because `validation` did not exist.
- Error-root RED: 2 failed / 2 passed because `validateCmsErrorPayload` was absent; GREEN reached 4/4.
- Version-gate RED: 3 failed / 4 passed because `CmsContractError` was absent; GREEN reached 7/7.
- Leakage RED: 1 failed / 24 passed because enumerable `name` appeared in JSON; the minimal fix made `name` non-enumerable and reached 25/25.
- Server-only RED: the temporary public Client Component built successfully after all temporary markers were removed, so the negative assertion failed exactly as intended. Final tests retain that successful unguarded build as a positive control and require guarded public/deep imports to fail.
- Final focused result: 38/38.

The frozen Page root compiled in the first vertical success slice, so the second canonical Product sample and the Schema-driven mutation cases were regression coverage against the same compiled root rather than separate production branches.

## Boundary Result

- Contract snapshot: unchanged.
- TASK-009 Transport/config/errors/public entry: unchanged.
- `frontend/src/app/**`: unchanged.
- CMS, database and environment files: unchanged.
- Root README and Planner-owned task/project state: unchanged by this lane.
- No Adapter, DTO, React prop, page, cache, Preview, live WordPress E2E or TASK-011 work.
- No review, acceptance, commit, push, merge or deployment.

## Document Impact

Frontend developer documentation is resolved in `frontend/README.md`. The dispatch explicitly prohibited root README and Planner-owned task metadata edits, so any project-level document-state synchronization remains Planner-owned.

## Result

Frontend execution is ready for the Planner checkpoint. This is not independent review, user acceptance or Git delivery.

## Round 1 P1 Revision

Adversarial Round 1 found that the validated wrapper retained caller input identity and left its kind/instance mutable. `MSG-TASK-010-FRONTEND-WRAPPER-INTEGRITY-R2` was read and acknowledged before revision work.

The public validators now clone before version/Schema inspection, deeply freeze the JSON snapshot, validate that isolated snapshot and return it in a frozen wrapper with fixed kind and brand descriptors. Clone failures, including ordinary and revoked Proxies, map to the existing stable success/error contract kinds. No registry, error class, dependency or public surface was changed.

R2 RED/GREEN and fresh validation are recorded in `REVISION_ROUND1_REPORT.md` and `TEST_OR_VALIDATION_LOG.md`. The lane result is revision-complete pending Planner checkpoint and independent Round 2 review; it is not acceptance or Git delivery.
