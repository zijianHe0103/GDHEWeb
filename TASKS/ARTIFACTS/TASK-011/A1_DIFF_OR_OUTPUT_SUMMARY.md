# TASK-011 Phase A1 Diff and Output Summary

## Direct Frontend Changes

| Path | A1 change |
|---|---|
| `frontend/src/types/cms-integration.ts` | minimal readonly technical-page DTO |
| `frontend/src/lib/cms/server/adapter/cms-integration-page.ts` | validated-wrapper-only frozen projection |
| `frontend/src/lib/cms/server/integration/config.ts` | exact server-only enable/path gate |
| `frontend/src/lib/cms/server/integration/errors.ts` | stable A1 configuration/integration errors |
| `frontend/src/lib/cms/server/integration/load.ts` | no-argument Transport/Validator/Adapter orchestration |
| `frontend/src/lib/cms/server/integration/index.ts` | minimal route-facing public seam |
| `frontend/src/app/integration/cms/page.tsx` | dynamic technical Server Component and metadata |
| `frontend/src/app/integration/cms/page.module.css` | isolated readable 1440px/390px technical layout |
| `frontend/tests/cms-integration-adapter.test.ts` | Adapter projection, freeze, brand and source-boundary tests |
| `frontend/tests/cms-integration-orchestration.test.ts` | loopback config/success/404/error/timeout/network matrix |
| `frontend/tests/cms-integration-route.test.ts` | not-found, rendering, input isolation, metadata and dynamic gate |
| `frontend/tests/cms-integration-server-only.test.ts` | real public/deep Client Component build negatives |
| `frontend/tests/cms-integration-production-smoke.mjs` | real `next start` disabled/enabled/root/one-request smoke |
| `frontend/tests/env-contract.test.ts` | exact approved server-only environment allowlist |
| `frontend/.env.example` | default-off route gate and fixed path placeholders |
| `frontend/README.md` | A1 boundary, configuration and validation commands |

## Protected Scope

Unchanged:

- `frontend/package.json` and `frontend/package-lock.json`;
- `frontend/src/app/page.tsx`, root layout and global styles;
- `frontend/src/lib/cms/contracts/**`;
- TASK-009 config, errors, public entry, URL builder and Transport;
- TASK-010 Validator registry, public entry and errors;
- root `README.md`;
- `.env.local`;
- `cms/**`, WordPress runtime and database.

The shared worktree's Planner task/state/queue/archive edits were preserved and not reverted.

## Runtime Output

- `/` remains the static foundation page.
- `/integration/cms` is dynamic and default-off.
- disabled production route: HTTP 404 with zero CMS requests.
- enabled production route: HTTP 200 with one fixed anonymous `/resolve` request.
- browser query input did not alter the configured upstream path.
- route output includes only the controlled technical DTO summary.

## Explicitly Deferred

- WordPress Fixture create/show/cleanup;
- real WordPress live E2E;
- 1440px and 390px screenshots;
- A2/A3/A4;
- review, acceptance, Git and deployment;
- formal homepage, shared shell, media, `safeHtml`, catch-all routing, cache, Preview, SEO and multilingual work.

Root README synchronization remains a Planner-owned documentation follow-up because it is outside the frontend lane write scope.

## Round 1 Runtime Authenticity Diff Addendum

The sole product revision touches:

- `validation/index.ts`: module-private authentic-wrapper `WeakSet`,
  registration in the existing wrapper factory, and a success-body
  identity/kind accessor attached to the existing validator export;
- `adapter/cms-integration-page.ts`: body access now goes only through the
  Validator-owned accessor;
- `cms-integration-adapter.test.ts`: three executable forgery regressions with
  stable-error and non-leakage assertions.

No registry, validation error, wrapper representation, Transport,
orchestration, route, contract, package, lockfile, dependency, README,
environment, CMS, database or Fixture file changed in this revision.
