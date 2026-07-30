# TASK-016 Baseline Validation

status: `PASS`
captured_at: `2026-07-30T13:18:28Z`
task: `TASK-016`

## Toolchain

- Project Node: `v24.18.0`
- Project npm: `11.16.0`
- Next.js: `16.2.11`
- TypeScript: `5.9.3`
- Vitest: `4.1.10`
- Ajv: `8.20.0`
- ajv-formats: `3.0.1`

The interactive shell initially resolved Node `v20.20.2`. Starting npm with a Node 24 executable was insufficient because npm child scripts still inherited the shell PATH and selected Node 20. Vitest then stopped during startup because Node 20 did not export `node:util.styleText`.

All authoritative baseline commands were rerun with the local Node `v24.18.0` binary directory first in PATH. The Node 20 startup error is an invocation error, not a project test failure.

## Green baseline

| Gate | Result |
|---|---|
| `npm run verify:product-card-contract` | PASS — 8 Schemas, 3 success samples, 6 error samples |
| `npm run verify:cms-contract` | PASS — 16 Schemas, 2 success samples, 2 error samples |
| `npm test` | PASS — 10 files, 171 tests |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS — `/`, `/_not-found`, `/integration/cms` |

An initial parallel lint run observed `.tmp-integration-server-only-*` while the full test suite was building a deliberate temporary Next.js project and therefore linted generated `.next/types`. The full test completed and removed the temporary directory; the sequential lint rerun passed. This is a command-concurrency artifact, not a source defect. Future final gates run full tests before lint or otherwise exclude concurrent temporary-project creation.

## Protected hashes

| File | SHA-256 |
|---|---|
| `frontend/package.json` | `958e8c8937ef092c75295e8a09de6062059df431e3419a70b5b661706ac02bce` |
| `frontend/package-lock.json` | `dda25a9069e1c1b41c4f94393a54d3e9eb3dcfea158fc2b6bbdf06cc1cb852a7` |
| ProductCard Snapshot manifest | `0b87390c354bbccabbee86473db206015f9a9b8187d3451f7287211c748fd254` |
| ProductCard offline verifier | `02daf7a37a0c5625f9f71d4854546eb9a7142baacf134ed98c4eb8aa4e2e993e` |
| `/resolve` Snapshot manifest | `3d3a137998a6b28ba1818cc2fafecacf85adc5e1dd6caff4dfc433c4748e55c7` |
| `/resolve` offline verifier | `5c9edf3c1a3acdd6c876cd300c14f2b1115f3e788a536cca8bb8d435ac31c528` |
| TASK-014 handoff manifest | `aa7cd391c78ffb7038d8ef233101ceb3ee75e619b1246d1da280cc8c4ba42ccb` |
| TASK-014 handoff checksums | `c363f293c44ffee6b9c3cebbb03ac0e2dab73e9a7910f18b0975a65404962883` |

Inventory:

- TASK-015 ProductCard Snapshot: exactly 13 files.
- TASK-008 `/resolve` Snapshot: exactly 20 files.

## Product/runtime baseline

- No file exists under `frontend/src/lib/cms/server/product-cards/**`.
- No `frontend/src/types/product-card.ts` exists.
- The only existing production CMS HTTP request remains TASK-009 `/resolve`.
- No frontend, CMS, root README or architecture file was changed during design/baseline work.
- Existing unrelated `.codex/config.toml` and resume-packet files remain excluded.

## Governance baseline

- Active task: `TASK-016`.
- State: `READY / NOT_ACCEPTED / DIRTY`.
- Branch: `codex/TASK-016-product-card-runtime-consumer`.
- Base commit, local/remote `main`: `54917bdedcdb710830021c6397adc217252a8423`.
- DPG project validation, message validation, strict lane audit, JSONL parse and `git diff --check` passed at intake; the only project-audit notices were expected dirty state and the existing WordPress Core filename heuristic.
