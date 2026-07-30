# TASK-016 Implementation Plan

status: `READY_FOR_DISPATCH`
task: `TASK-016`
owner: `planner`

## A0 — Baseline and protected scope

1. Record Node/npm/toolchain versions and hashes for package files, both contract verifiers, both Snapshot manifests and TASK-014 authority.
2. Run ProductCard and `/resolve` offline verifiers, lint, typecheck, full Vitest and production build.
3. Record current production file inventory and prove no ProductCard runtime consumer exists.
4. Freeze the allowed and forbidden paths from the active task.

Gate: baseline is reproducibly green under Node `24.18.0`; any existing failure must be resolved as environment or baseline evidence before product mutation.

## A1 — ProductCard query and Transport

Public seam: ProductCard Transport called with a closed query.

TDD slices:

1. RED for missing fixed ProductCard URL/query builder.
2. GREEN for defaults and allowlisted runtime query validation.
3. RED/GREEN for exactly one anonymous fixed GET, no retry and sanitized `200`.
4. RED/GREEN for `304` bodyless typed outcome.
5. RED/GREEN for redirect, unexpected 2xx, JSON protocol, timeout, abort, network and HTTP status semantics.
6. RED/GREEN for success/error cache headers and non-leaking errors.

Evidence:

- loopback request observation;
- fixed URL and headers;
- request count exactly one;
- zero conditional header;
- handle cleanup after every test.

## A2 — ProductCard Runtime Validator

Public seam: unknown payload to authentic validated wrapper.

TDD slices:

1. RED for missing ProductCard Validator.
2. GREEN for TASK-015 success samples and exact 8-Schema static closure.
3. RED/GREEN for unsupported version, additional fields and invalid media/relation/action shapes.
4. RED/GREEN for detail `action.targetPath !== publicPath`.
5. RED/GREEN for deep immutability, caller isolation, wrapper authenticity and serialization boundary.
6. Reuse the existing common error Validator; prove all six TASK-015 error samples validate without changing either Snapshot.

Evidence:

- strict Ajv compilation;
- no filesystem/network/remote Schema path;
- no diagnostics or payload leakage;
- public and deep Client Component import negatives.

## A3 — DTO Adapter and orchestration

Public seams:

- authentic wrapper to readonly DTO;
- one orchestration call to DTO or sanitized error.

TDD slices:

1. RED/GREEN for exact empty collection DTO.
2. RED/GREEN for one and N collections, four frozen kind/lifecycle/action cells and non-empty series/applications.
3. RED/GREEN for deep readonly copying and raw/forged/error-wrapper rejection.
4. RED/GREEN for one Transport call, one validation, one adaptation and zero `/resolve`.
5. RED/GREEN for validated normalized error/status agreement.
6. RED/GREEN for invalid error/status mismatch and `304` without cache failing closed.

Evidence:

- public DTO key allowlist;
- forbidden internal-field scan;
- 0/1/N;
- one request regardless of item count;
- no browser WordPress request.

## A4 — Documentation and full validation

1. Update `frontend/README.md` with the ProductCard runtime consumer, commands and explicit no-UI/no-cache boundary.
2. Record the exact root README change required; Planner applies it after independent checkpoint.
3. Run:
   - `verify:product-card-contract`;
   - `verify:cms-contract`;
   - all new focused tests;
   - all existing CMS tests;
   - lint;
   - typecheck;
   - full Vitest;
   - production build.
4. Recheck hashes/inventory for TASK-014, TASK-015, old `/resolve`, package-lock and forbidden paths.
5. Run secret/internal-field/absolute-path/cross-import scans, `git diff --check` and DPG project/registry/messages/strict lane validation.
6. Produce TDD RED evidence, execution report, validation log and diff summary; update the frontend worklog.
7. Send one controlled execution response to Planner.

## A5 — Planner checkpoint and independent review

1. Planner acknowledges the response and independently inspects current bytes.
2. Planner reruns focused/full/product/DPG gates and applies only the recorded root README delta.
3. If the checkpoint passes, transition to `UNDER_REVIEW` and dispatch one independent adversarial review.
4. Reviewer challenges query injection, Transport semantics, Validator bypass, wrapper forgery, mutability, action/path mismatch, error/status mismatch, `304` misuse, N+1 `/resolve`, client exposure, regressions and scope.
5. FAIL/BLOCKED follows controlled recovery; PASS allows Planner final validation only.

## Rollback

Before formal delivery, rollback is deletion of only:

- `frontend/src/lib/cms/server/product-cards/**`;
- `frontend/src/types/product-card.ts`;
- the four TASK-016 focused test files or their agreed minimal subset;
- TASK-016 additions in frontend/root README;
- TASK-016 artifacts and governance records.

Existing TASK-014/TASK-015 authority, `/resolve` consumer, dependencies, CMS and database are never rollback targets.

## Stop conditions

Stop and return to Planner if implementation requires:

- changing TASK-014 or TASK-015 authority;
- changing existing `/resolve` runtime behavior;
- adding or upgrading a dependency;
- modifying `frontend/src/app/**`;
- defining cache/ISR/Preview behavior;
- inventing ProductCard, SEO, RFQ or product data;
- changing CMS/database/external systems;
- widening registered lane scope beyond the confirmed paths.
