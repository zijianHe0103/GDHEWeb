# TASK-009 Diff and Output Summary

result: PASS_WITH_PLANNER_DOC_SYNC
task_id: TASK-009
lane: frontend

## Product changes

- Added five guarded modules under `frontend/src/lib/cms/server/`: configuration, errors/metadata, fixed resolve URL, Transport and public entry.
- Added `frontend/tests/cms-transport.test.ts` with 55 focused tests using real loopback HTTP and a real temporary Next.js build.
- Added the dependency-free exact `server-only` Vitest alias and empty test stub.
- Updated `frontend/README.md` for the active runtime contract and validation workflow.

## Evidence changes

- Added this summary, `EXECUTION_REPORT.md` and `TEST_OR_VALIDATION_LOG.md` under `TASKS/ARTIFACTS/TASK-009`.
- Updated only the frontend lane worklog.
- Acknowledged `MSG-TASK-009-FRONTEND-RESOLVE-TRANSPORT-R1`; controlled message/event records are governance-generated.

## Explicitly unchanged

- `frontend/package.json`, `frontend/package-lock.json` and all dependencies/scripts.
- `frontend/src/app/**`, routes, components and production UI.
- `frontend/src/lib/cms/contracts/**` and TASK-008 parity data.
- `frontend/.env*` and real environment values.
- `cms/**`, WordPress, database and TASK-007 authority artifacts.
- Validator, DTO Adapter, visible page, cache, retry, Preview, multilingual and later-task scope.
- Root README; Planner owns the required minimal pointer because it is outside the frontend lane write scope.

## Validation output

Focused Vitest: 55/55 PASS. Full Vitest: 64/64 PASS. Contract parity, lint, typecheck, production build, protected-scope diff, lockfile checksum, temporary-residue scan, sensitive-production scan, `git diff --check`, DPG project/message validation and strict lane audit all PASS.

No adversarial review, Git delivery, acceptance, closure or deployment was performed.

## Explicit loopback port revision R2

- Added exactly three missing-port rejection inputs to `frontend/tests/cms-transport.test.ts`.
- Added only `url.port !== ""` to the cleartext loopback predicate in `frontend/src/lib/cms/server/config.ts`.
- Clarified the explicit-port requirement in `frontend/README.md`.
- Updated the three standard artifacts and frontend worklog.
- Acknowledged the controlled R2 request and created only its governed response/event records.

Focused Vitest is 58/58 and full Vitest is 67/67. Contract parity, lint, typecheck, build, protected-scope/checksum/residue/leakage checks and DPG validations pass.

No Transport, status, timeout, server-only, dependency, package/lock, `src/app`, contract, CMS, database, environment, root README, review, Git or later-task change was made.

## Deep-import production surface revision R3

- Removed the exported `requestResolvedPath` and its `baseUrl`/`timeoutMs` options from `frontend/src/lib/cms/server/transport.ts`.
- Made `resolveCmsPath(path, signal?)` the only callable deep or public production export; `index.ts` only re-exports it.
- Reworked the real loopback matrix to set/restore `WORDPRESS_API_URL` and use the frozen 5000 ms timeout without a production injection seam.
- Added runtime and compile-time export-surface assertions.
- Extended the real Next.js Client Component negative to both public and deep imports.
- Updated the three standard artifacts and frontend worklog.

Focused Vitest is 60/60 and full Vitest is 69/69. Contract parity, lint, typecheck, production build, export/non-overridability checks, protected scope, checksum, residue, leakage and DPG validations pass.

No errors/status semantics, endpoint/path behavior, dependencies, package/lock, `src/app`, contracts, CMS, database, environment, root README, review report, Git or later-task change was made. Planner's prior root README synchronization was preserved.
