# TASK-011 Phase A1 Frontend Execution Report

status: A1_COMPLETE_PENDING_PLANNER_CHECKPOINT
task_id: TASK-011
phase: A1 frontend offline vertical slice
lane: frontend
message: MSG-TASK-011-FRONTEND-OFFLINE-VERTICAL-SLICE-A1
executed_at: 2026-07-26

## Outcome

Phase A1 now provides the smallest offline `Transport -> Validator -> Adapter -> DTO -> Server Component` vertical slice:

- one frontend-owned immutable `CmsIntegrationPageDto`;
- one pure, server-only Adapter that accepts only TASK-010's branded success wrapper;
- exact server-only enable/path configuration;
- one no-argument orchestration entry with one Transport request, success/error validation and validated 404 agreement;
- one dynamic `/integration/cms` technical Server Component with route-local CSS and `noindex, nofollow`;
- loopback unit/integration tests, real Client Component build negatives and a real `next start` production smoke.

This is not live WordPress E2E. No Fixture, CMS write, screenshot or Phase A2 work occurred.

## Implementation

### DTO and Adapter

`CmsIntegrationPageDto` contains only:

- id, API/Schema versions, public type/template/locale/path;
- title, nullable excerpt and module count.

The Adapter accepts `ValidatedCmsPayload<"success">`, reads only the already validated snapshot, allocates a new DTO and freezes it. Raw modules, relations, details, `safeHtml`, media, Transport metadata and CMS origin are excluded.

### Configuration and orchestration

- Only exact `GDHE_ENABLE_CMS_INTEGRATION_PAGE=1` enables the slice.
- Disabled values return a frozen `disabled` result before reading `WORDPRESS_API_URL` or requesting the CMS.
- Enabled mode requires `GDHE_CMS_INTEGRATION_PATH` and reuses the frozen TASK-009 canonical path validator.
- `loadCmsIntegrationPage()` accepts no path, URL, timeout or Transport option.
- Success performs one `resolveCmsPath`, one success validation and one Adapter call.
- HTTP bodies pass error validation before any field read.
- Only Transport `not_found`, HTTP status 404, validated body status 404 and code `gdhe_not_found` together return `not_found`.
- Valid non-404 errors and 404 mismatches become stable non-leaking integration errors; protocol, network, timeout and contract errors remain non-404.

### Route

The route is `force-dynamic`, so the server-only gate is read at request time rather than frozen during build. It accepts no props or browser input, maps `disabled` and validated `not_found` to Next.js `notFound()`, and renders only the DTO's technical summary.

## TDD Evidence

Observed REDs before the corresponding production behavior:

1. Adapter suite failed because the Adapter module did not exist.
2. Orchestration suite failed because the integration public module did not exist.
3. Route suite failed because `/integration/cms/page.tsx` did not exist.
4. A marker-removal server-only regression produced 1 failure and 1 pass because the deep Client Component import built successfully.
5. Existing environment contract produced 1 failure and 153 passes after the two approved server-only variables were added.
6. Dynamic route regression produced 1 failure and 3 passes because the runtime gate export was absent.

Final A1 focused result: 38/38 PASS.

## Validation

- CMS contract parity: 16 Schemas, 2 success and 2 error samples PASS.
- Full Vitest: 9 files, 155/155 PASS.
- lint, typecheck and production build PASS.
- production route inventory: static `/`, dynamic `/integration/cms`.
- real `next start` loopback smoke: disabled route 404; enabled route 200; root 200 in both modes; one fixed CMS request.
- public and deep Client Component imports fail guarded builds after marker-stripped positive controls pass.
- direct dependency tree unchanged; production audit reports zero vulnerabilities.
- package, lockfile, root page/layout/global CSS, contract snapshot, TASK-009 modules, TASK-010 Validator, CMS and `.env.local` remain protected.
- browser static chunks contain no server environment variable names; build output contains no configured CMS origin or test secret sentinel.
- no temporary server, socket or build-test directory remains.
- project and message validation PASS; strict lane audit reports only the expected medium pending-queue notice for Planner's blocked A2 message.

## Documentation

Updated:

- `frontend/.env.example`;
- `frontend/README.md`;
- the directly related environment contract test.

Root `README.md` is outside the registered frontend lane write scope and remains unchanged. Planner must add the minimal TASK-011 pointer before resolving the task-level README impact.

## Boundaries

No package/lockfile, existing Transport/Validator, contract, root page/layout/global CSS, root README, `.env.local`, CMS, WordPress runtime, database, Fixture, screenshot, live E2E, review, Git, deployment or Phase A2 change was made.

Planner must independently validate this A1 result. Only a Planner checkpoint PASS may authorize dispatch of the already queued, currently blocked A2 Fixture window.

## Round 1 Runtime Authenticity Addendum

After Adversarial Round 1 found that the exported Adapter accepted an
ordinary structural object at runtime, the user authorized one narrow P1
revision. The Validator now registers only wrappers it actually creates in a
module-private `WeakSet`, and the Adapter obtains the success body through the
Validator-owned identity-and-kind accessor.

The accessor does not run Schema validation. The successful orchestration path
still performs one Transport request, one success validation and one Adapter
call. Raw payloads, ordinary structural objects and authentic error wrappers
now converge on the existing stable, non-leaking
`invalid_success_payload` contract error.

The full revision record is
`TASKS/ARTIFACTS/TASK-011/ROUND1_REVISION_REPORT.md`. Planner checkpoint and a
narrow Round 2 review remain required.
