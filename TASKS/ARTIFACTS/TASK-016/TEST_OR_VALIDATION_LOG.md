# TASK-016 Test and Validation Log

Date: 2026-07-30
Runtime: Node.js `v24.18.0`, npm `11.16.0`

## Current-byte gates

| Gate | Result |
|---|---|
| `npm run verify:product-card-contract` | PASS — 8 Schemas, 3 success samples, 6 error samples |
| `npm run verify:cms-contract` | PASS — 16 Schemas, 2 success samples, 2 error samples |
| ProductCard Transport + orchestration, unrestricted | PASS — 2 files, 39 tests |
| ProductCard Validator focused | PASS — 1 file, 18 tests |
| Validator + Adapter + server-only negatives | PASS — 3 files, 21 tests before six error-sample additions |
| Full `npm test`, unrestricted current bytes | PASS — 15 files, 237 tests |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS — `/`, `/_not-found`, `/integration/cms` |
| `git diff --check` | PASS |

The lane sandbox cannot bind loopback listeners and returned
`listen EPERM: operation not permitted 127.0.0.1`. Planner ran every loopback
RED/GREEN and both final full suites against the same shared bytes in the
unrestricted main environment. No privilege workaround or product edit was
used.

## Server-only proof

Four temporary real Next.js Client Component builds attempted to import:

1. the public ProductCard entry;
2. the deep Transport;
3. the deep Validator;
4. the deep Adapter.

All four builds failed with the expected `server-only`/Client Component
boundary. Temporary projects were removed; final residue scan found zero
`.tmp-*` roots.

## Protected authority

All hashes equal the TASK-016 baseline:

| Protected file | SHA-256 |
|---|---|
| `frontend/package.json` | `958e8c8937ef092c75295e8a09de6062059df431e3419a70b5b661706ac02bce` |
| `frontend/package-lock.json` | `dda25a9069e1c1b41c4f94393a54d3e9eb3dcfea158fc2b6bbdf06cc1cb852a7` |
| ProductCard manifest | `0b87390c354bbccabbee86473db206015f9a9b8187d3451f7287211c748fd254` |
| ProductCard verifier | `02daf7a37a0c5625f9f71d4854546eb9a7142baacf134ed98c4eb8aa4e2e993e` |
| `/resolve` manifest | `3d3a137998a6b28ba1818cc2fafecacf85adc5e1dd6caff4dfc433c4748e55c7` |
| `/resolve` verifier | `5c9edf3c1a3acdd6c876cd300c14f2b1115f3e788a536cca8bb8d435ac31c528` |
| TASK-014 handoff manifest | `aa7cd391c78ffb7038d8ef233101ceb3ee75e619b1246d1da280cc8c4ba42ccb` |
| TASK-014 handoff checksums | `c363f293c44ffee6b9c3cebbb03ac0e2dab73e9a7910f18b0975a65404962883` |

Inventory remains exactly 13 ProductCard Snapshot files and 20 `/resolve`
Snapshot files.

## Scope and leakage

- Production ProductCard source imports no `cms/**`, `TASKS/**`, filesystem,
  remote Schema loader, React or client module.
- The only environment access is server-owned `WORDPRESS_API_URL`.
- The only network call is the single ProductCard Transport `fetch`.
- No package, lockfile, dependency, environment, existing `/resolve`,
  Snapshot/verifier, `src/app`, CMS or root README change exists.
- Raw bodies, CMS origin, credentials, authorization, cookie, nonce,
  WordPress/database IDs, SCF/meta, Feishu, Article Number, supplier, cost,
  price and inventory do not cross the DTO boundary.
- Final temporary-project scan and `git diff --check` pass.

## Round 1 P1 revision validation

Current Node.js `v24.18.0` evidence:

| Gate | Result |
|---|---|
| No-listener query/URL focused | PASS — 20 tests, 22 listener tests skipped |
| Full ProductCard Transport, Planner unrestricted | PASS — 1 file, 42 tests |
| Copied-project CMS integration server-only controls | PASS — 1 file, 2 tests |
| Full `npm test`, Planner unrestricted | PASS — 15 files, 244 tests |
| ProductCard verifier | PASS — 8 Schemas, 3 success, 6 errors |
| Existing CMS verifier | PASS — 16 Schemas, 2 success, 2 errors |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `git diff --check` | PASS |

The first two unrestricted full-suite attempts correctly remained RED because
the temporary copied Next project did not preserve compound-control-flow
narrowing for `filter`. Final explicit runtime-predicate control flow closed
that copied-project regression; the existing positive-control builds now pass.

Protected hashes remain byte-identical:

- package `958e8c89...02bce`;
- lockfile `dda25a90...852a7`;
- ProductCard manifest/verifier `0b87390...d254` /
  `02daf7a3...993e`;
- resolve manifest/verifier `3d3a1379...55c7` /
  `5c9edf3c...c528`.

Inventories remain exactly 13 ProductCard Snapshot files and 20 resolve
Snapshot files. Final scan found no temporary project residue.
