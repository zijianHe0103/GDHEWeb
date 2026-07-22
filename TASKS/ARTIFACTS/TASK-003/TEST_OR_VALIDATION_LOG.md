# TASK-003 test and validation log

status: round-1-revision-fresh-validation-passed
date: 2026-07-22
validator: frontend lane
runtime: official Node.js 24.18.0 distribution and its bundled npm 11.16.0 from the planner-verified read-only `/tmp` path

Node.js 24 is an officially supported LTS line and satisfies Next.js 16's engine floor. No runtime was installed or copied into the repository.

## TDD evidence

1. Wrote `tests/env-contract.test.ts` before creating `.env.example`.
2. First `npm test` failed with one expected failure: `ENOENT` for `.env.example`.
3. Added the two-variable, non-secret example contract.
4. Fresh `npm test` passed one test in one test file.

This test checks exact safe placeholder values and rejects password, secret, token, or private-key variable names.

## Runtime checks

| Check | Result | Fresh evidence |
|---|---|---|
| `node --version` with official runtime bin first | PASS | `v24.18.0` |
| `npm --version` from the same official runtime | PASS | `11.16.0` |
| `npm ci` from no-`.next` condition | PASS | 379 packages installed from lockfile; 0 vulnerabilities |
| package and lock engine parity | PASS | root `engines.node` is `24.x` in both `package.json` and `package-lock.json` |
| Node.js type contract | PASS | `@types/node` 24.13.3 matches the selected Node.js 24 runtime line |
| `npm run lint` | PASS | ESLint exited 0 with no findings |
| `npm run typecheck` | PASS | TypeScript `tsc --noEmit` exited 0 |
| `npm test` | PASS | Vitest 4.1.10: 2 files, 2 tests passed |
| `npm run build` | PASS | Next.js 16.2.11 compiled, typechecked, and prerendered `/` |
| `npm audit --audit-level=high` | PASS | `found 0 vulnerabilities` |
| `npm ls next react react-dom typescript eslint vitest postcss sharp --depth=1` | PASS | selected direct versions present; postcss 8.5.22 and sharp 0.35.3 shown as overrides |
| real Next Image optimizer fixture | PASS | macOS arm64; HTTP 200; WebP; 32x32; cache MISS; Next 16.2.11 / Sharp 0.35.3 |
| fixture cleanup | PASS | temporary public PNG and `.next/cache/images` absent after exit |
| production server HTTP smoke | PASS | Node.js 24.18.0 `next start` ready on 127.0.0.1:3103; root returned HTTP 200 |
| response-content smoke | PASS | response contained `Frontend foundation is running` and `not the production homepage` |

The production server was stopped normally after the request. The shell reports exit 130 because it received the expected interactive interrupt.

## Supply-chain decision evidence

The initial dependency graph contained a moderate `postcss` advisory below 8.5.10 and a high `sharp` advisory below 0.35.0. Registry lookups returned current versions 8.5.22 and 0.35.3. Exact root overrides were installed without force, after which audit returned zero vulnerabilities and the full runtime checks passed. No audit-suggested framework downgrade was applied.

Next.js 16.2.11 still declares Sharp `^0.34.5`, so the 0.35.3 override is outside the upstream range. Round 1 correctly rejected ordinary build evidence. The revision fixture executes the real `/_next/image` path and verifies a transformed response rather than merely importing Sharp. README records the actual platform matrix, untested deployment blocks, upstream range, temporary rationale, and removal gate.

The npm 11.16.0 clean install emitted `allow-scripts` notices for `fsevents` and `unrs-resolver`; no approval or global configuration was applied. Install, resolver-dependent lint/typecheck/build, optimizer fixture, and audit all completed successfully. The notices are retained here and are not presented as vulnerabilities.

## Repository and boundary checks

- Exactly one package-manager lockfile exists under `frontend/`: `package-lock.json`.
- `.env.example` is the only top-level `.env*` file; real local variants are ignored.
- `node_modules/`, `.next/`, coverage, output, logs, and TypeScript build info are ignored and absent from the intended change set.
- High-confidence credential scan found no credential assignments or private-key material in frontend source files.
- Git status showed planner governance and TASK-002 archival work already present; the frontend lane did not revert or edit those files.
- No `cms/**`, `.local/**`, database, WordPress, root dependency, deployment, or external-service files were changed by this lane.
- `git diff --check` and governance/message validation are rerun after artifact and message finalization.

## Final governance snapshot

- Project governance validation: PASS, schema `DPG-LANES-1.0.0`.
- Lane registry validation: PASS.
- Lane message validation: PASS.
- `git diff --check`: PASS.
- Lane audit: one expected medium `QUEUE_MESSAGES_PENDING` notice because the completed execution response is waiting in planner's queue; no structural validation failure was reported.
- Source boundary scan: one npm lockfile, no Pages Router, no JavaScript source under `src/`, no high-confidence secret assignment, no trailing whitespace in lane-owned text, and no Git changes under `cms/**`, `.local/**`, or root package-manager files.
- Ignore verification: `node_modules/`, `.next/`, and `tsconfig.tsbuildinfo` resolve to explicit frontend ignore rules; `.env.example` remains visible in Git status.

One final governance command group was accidentally launched from `frontend/` and reported missing root governance files. That invocation used the wrong root and is not counted as evidence. The immediate rerun from the repository root passed project, lane-registry, and lane-message validation; `git diff --check`, scope, whitespace, and single-lockfile checks also passed.

## Environment discrepancy record

One tool subprocess launched with `frontend/` as its working directory resolved `/usr/local/bin/node` 20.11.1 and npm 10.2.4. Planner independently observed Node.js 20.20.2 and npm 10.8.2 in login shells at both locations. Those Node.js 20 observations are retained as environment history but are not the selected project baseline or final validation runtime.

Official Node.js lifecycle verification showed that v20 is EOL while v24 is the current LTS line. The hook denied an attempted temporary Node.js 24 download before any file was created. Planner then supplied the existing read-only bundled Node.js 24.14.0 path. Final `npm ci`, lint, typecheck, test, build, audit, dependency-tree, and HTTP smoke checks used that Node.js binary by placing its bin directory first in PATH.

## Round 1 revision evidence

This section supersedes the earlier Node.js 24.14.0 and npm 10.8.2 validation baseline while preserving it as review history.

- TDD RED: `tests/toolchain-contract.test.ts` first failed because `.nvmrc` returned 24.14.0 instead of required 24.18.0.
- TDD GREEN: after `.nvmrc`, `packageManager`, script contract, and lockfile updates, the targeted test passed; the full suite then passed two tests in two files.
- Clean condition: previous `.next` was removed with an exact scoped generated-output deletion; absence was asserted before `npm ci`, lint, typecheck, tests, and build.
- Runtime: PATH first entry was `/tmp/gdhe-node-24.18.0.CMUEIu/node-v24.18.0-darwin-arm64/bin`; `node --version` returned v24.18.0 and `npm --version` returned 11.16.0.
- Runtime integrity: the official `SHASUMS256.txt` entry verified `node-v24.18.0-darwin-arm64.tar.gz: OK`; no runtime file was copied into the repository.
- Lock parity: `.nvmrc` is 24.18.0; package and lock root engines are `24.x`; packageManager is npm 11.16.0; `@types/node` is 24.13.3 in package and lock.
- Optimizer fixture refinement: the first 1x1 source returned untransformed PNG; 16px was not an allowed Next width; a repeated fixed URL then exposed stale Next Image cache. None were counted as passes. The final fixture generates 64x64 input, clears image cache, requests allowed width 32, receives HTTP 200 WebP at 32x32 with cache MISS, and cleans both source and cache output.
- Platform: only `darwin arm64` is validated. Other operating-system and architecture rows are explicitly untested and deployment-blocked in README.
- Root smoke: production `/` returned HTTP 200 and both foundation-only markers, then the server received the expected interactive interrupt.
- Audit and tree: zero vulnerabilities; Next 16.2.11 resolves overridden postcss 8.5.22 and Sharp 0.35.3; `@types/node` 24.13.3 is deduplicated.
- Governance and scope: project, lane registry, and Lane message validation passed; lane audit reported only the expected pending revision request; `git diff --check`, secret, whitespace, one-lockfile, ignored-output, CMS, `.local`, root dependency, and fixture-cleanup checks passed.

## Planner fresh verification

At `2026-07-22T10:48:12Z`, planner independently reran the delivery from the current worktree rather than relying on the Lane report.

- The first planner command correctly selected Node.js 24.14.0 but exposed a PATH discrepancy: bare `npm` resolved to `/usr/local/bin/npm` 10.2.4. Its checks passed, but that run is not the final package-manager evidence.
- Planner then used the explicit existing npm 10.8.2 executable with the bundled Node.js 24 bin first in PATH and reran `npm ci`, lint, typecheck, Vitest, production build, audit and the dependency tree. Every command exited 0; one test passed; the build prerendered `/`; audit reported zero vulnerabilities.
- Package and lockfile `engines.node` both equal `24.x`, and `packageManager` equals `npm@10.8.2`.
- A production server started on `127.0.0.1:3103`; `/` returned HTTP 200 and contained both expected foundation-only markers. It was then stopped with the expected interactive interrupt.
- Governance, registry and message validation passed; `git diff --check` passed; no CMS or `.local` changes exist; exactly one frontend lockfile and no root lockfile exist; only `.env.example` is present and the high-confidence credential scan returned zero files.

## Planner Round 1 revision fresh verification

At `2026-07-22T13:10:08Z`, planner acknowledged `MSG-TASK-003-FRONTEND-REVISION-R1-RESPONSE` and independently tested a clean temporary copy of `frontend/`. The copy explicitly excluded the workspace's `node_modules` and `.next`, so the following results do not depend on Lane-generated dependency or build output.

- Runtime: official checksum-verified Node.js `v24.18.0` distribution with its bundled npm `11.16.0`; both versions were printed before install.
- Clean install: `npm ci` installed 379 packages from `package-lock.json` and reported 0 vulnerabilities. npm's two `allow-scripts` notices for `fsevents` and `unrs-resolver` were observed and remain disclosed; no global or project approval setting was changed.
- Quality gates: lint PASS; clean pre-build typecheck PASS; Vitest PASS with 2 files and 2 tests; Next.js 16.2.11 production build PASS and prerendered `/`.
- Real image path: `npm run test:image-optimizer` PASS on `darwin arm64` with Node `v24.18.0`, Next `16.2.11`, Sharp `0.35.3`, HTTP 200, `image/webp`, 32x32, cache `MISS`, 76-byte transformed body.
- Supply chain: `npm audit --audit-level=high` returned 0 vulnerabilities. `npm ls` showed Next 16.2.11 with overridden postcss 8.5.22 and Sharp 0.35.3; live installed Next metadata still declares Sharp `^0.34.5`.
- Runtime smoke: `next start` became ready on `127.0.0.1:3105`; `/` returned HTTP 200 and contained both `Frontend foundation is running` and `not the production homepage`; the server was then stopped normally.
- Reproducibility: package `packageManager` is `npm@11.16.0`; package and lock root engines both equal `24.x`; lockfile version is 3.
- Cleanup and scope: optimizer source fixture and `.next/cache/images` were absent after the run; workspace CMS, `.local`, and root package-manager paths had no changes; frontend has exactly one lockfile, no JavaScript source in `src/`, and only `.env.example` at its top level.
- Security and governance: high-confidence private-key/token scan had no matches; project governance, Lane registry, Lane messages, lane audit, and `git diff --check` all passed.

The temporary validation copy and captured response are disposable planner-only outputs outside the repository. Round 2 adversarial review remains the authority for whether the temporary cross-range Sharp override is acceptable.

## Final pre-acceptance validation

At `2026-07-22T13:22:42Z`, after planner acknowledged the Round 2 final `PASS` response and reviewer recovery message, planner removed only ignored `.next` output and reran the complete delivery gate in the workspace with official Node.js `v24.18.0` and bundled npm `11.16.0`.

- `npm ci`: PASS; 379 packages installed from the committed lockfile; 0 vulnerabilities. The same disclosed `fsevents` and `unrs-resolver` allow-scripts notices appeared; no approval or configuration was changed.
- `npm run lint`: PASS.
- clean pre-build `npm run typecheck`: PASS.
- `npm test`: PASS; 2 test files and 2 tests.
- `npm run build`: PASS; Next.js 16.2.11 production build prerendered `/` and `/_not-found`.
- `npm run test:image-optimizer`: PASS; darwin arm64, Node 24.18.0, Next 16.2.11, Sharp 0.35.3, HTTP 200, WebP, 32x32, cache MISS, 76 bytes.
- `npm audit --audit-level=high`: PASS; 0 vulnerabilities.
- dependency tree: PASS; PostCSS 8.5.22 and Sharp 0.35.3 are the exact overrides under Next 16.2.11.
- production root smoke: PASS; `next start` on `127.0.0.1:3106`, HTTP 200, both foundation-only markers present, then normal interrupt.
- review: Round 2 canonical verdict PASS with P0=0, P1=0, P2=0; Round 1 findings all closed.
- lifecycle and scope: queue empty; project, registry and message validation PASS; lane audit has no issues; `git diff --check` PASS; staging area empty; no CMS, `.local`, root package-manager, secret, optimizer-fixture, or image-cache delivery changes.
- Git boundary: branch remains `codex/TASK-003-nextjs-foundation`; HEAD remains accepted TASK-002 commit `1cf97ce837e9f4621a63fad736c84a9bdb028a5a`; no TASK-003 commit, upstream, push, merge, or acceptance exists.

Final validation result: PASS. This evidence authorizes only the checked transition to `AWAITING_USER`; it does not authorize acceptance or any Git delivery action.

## Acceptance-transition validation

- `task_transition.py prepare-awaiting-user` first run: PASS at `2026-07-22T13:24:23Z`; required execution, explicit review PASS, validation evidence, `document_impact: RESOLVED`, matching task/project state, and absence of blocked/failed messages were accepted.
- The `AWAITING_USER` write guard then correctly blocked a Board synchronization patch before it changed any file.
- Controlled `task_transition.py reopen`: PASS at `2026-07-22T13:24:43Z`; reason and unique next step were recorded, with no frontend or review change.
- Planner synchronized only the Board, human-readable task/project handoff, planner worklog/activity, and final evidence. The same checked prepare transition is the final write; its structured task/project state and registry event are the authoritative final result.
