# TASK-016 Frontend Execution Dispatch

message_id: `MSG-TASK-016-FRONTEND-RUNTIME-CONSUMER-IMPLEMENTATION`
lane: `frontend`
mode: `TDD_IMPLEMENTATION`

## Required reads

1. `TASKS/ACTIVE/TASK-016-product-card-runtime-consumer.md`
2. `TASKS/ARTIFACTS/TASK-016/DESIGN.md`
3. `TASKS/ARTIFACTS/TASK-016/IMPLEMENTATION_PLAN.md`
4. `TASKS/ARTIFACTS/TASK-016/BASELINE_VALIDATION.md`
5. `TASKS/ARTIFACTS/TASK-014/FRONTEND_HANDOFF_READONLY_AUDIT.md`
6. `TASKS/ARTIFACTS/TASK-013/PRODUCT_CARD_PROJECTION.md`
7. current TASK-015 ProductCard Snapshot/verifier and TASK-009～011 `/resolve` consumer source/tests

## Assignment

Implement only the ProductCard runtime consumer frozen in DESIGN:

- independent server-only ProductCard query and Transport;
- fixed endpoint/version/query allowlist, one request, zero retry and typed `200 | 304 | error`;
- exact TASK-015 8-Schema runtime Validator plus detail action/path semantic equality;
- authentic, caller-isolated validated wrapper;
- deeply readonly frontend ProductCard collection DTO and Adapter;
- orchestration proving one collection request and zero per-card `/resolve`;
- focused tests and frontend README;
- standard TASK-016 execution artifacts and frontend worklog.

## TDD protocol

- ACK this exact message before mutation.
- Work in the DESIGN vertical slices, one behavior-level RED then minimum GREEN at a time.
- Tests observe the four confirmed public seams: Transport, Validator, Adapter and orchestration.
- Mock only the external WordPress HTTP boundary with an isolated loopback server.
- Record each valid RED and its matching GREEN in `TDD_RED_EVIDENCE.md`.
- Do not write all tests horizontally before implementation and do not refactor unrelated code.

## Runtime and validation

- Use Node `24.18.0` and npm `11.16.0`; ensure child scripts inherit Node 24.
- Do not run lint concurrently with tests that create `.tmp-*-server-only-*` projects.
- Preserve TASK-014 authority, TASK-015 exact 13-file Snapshot, old `/resolve` exact 20-file Snapshot/verifier, dependencies and lockfile.
- Use static local Schema imports only; no filesystem, network or remote Schema loading.
- The frontend lane may update `frontend/README.md`; root `README.md` is outside registered frontend scope, so record the exact required delta for Planner instead of editing it.

## Write boundary

Allowed:

- `frontend/src/lib/cms/server/product-cards/**`
- `frontend/src/types/product-card.ts`
- confirmed TASK-016 focused tests and only their minimum helpers
- `frontend/vitest.config.ts` only if the existing server-only test alias cannot cover the new modules
- `frontend/README.md`
- `TASKS/ARTIFACTS/TASK-016/**`
- `LANES/frontend/**`
- controlled response message through `lane_message.py`

Forbidden:

- existing `/resolve` production modules and Snapshot/verifier
- TASK-014/TASK-015 authority files
- `frontend/src/app/**`
- package/package-lock/dependencies/environment files
- root README, Planner-owned active task/Project/Board
- CMS/database/Fixture, real products, RFQ/Feishu, SEO, UI, cache, Preview, deployment or Git delivery

## Stop conditions

Stop and return a controlled BLOCKED response if the task requires a forbidden path, dependency change, existing `/resolve` behavior change, cache design, UI/route, CMS mutation, external system or guessed product/SEO/RFQ data.

## Expected evidence

- `TDD_RED_EVIDENCE.md`
- `EXECUTION_REPORT.md`
- `TEST_OR_VALIDATION_LOG.md`
- `DIFF_OR_OUTPUT_SUMMARY.md`
- exact root README delta for Planner
- updated frontend worklog
- one `execution_response` linked to the original message

The frontend lane does not dispatch adversarial review, accept the task, commit, push, merge or start the visible UI task.
