# TASK-017 Test Or Validation Log

status: `PASS`
runtime: `Node 24.18.0 / npm 11.16.0`

## TDD and focused results

| Gate | Result |
|---|---|
| Config RED | exit 1; missing `src/lib/product-list/config` |
| Config GREEN plus env regression | PASS, 8 tests |
| Presentation RED | exit 1; missing `src/components/product-card` |
| Presentation/config GREEN | PASS, 11 tests |
| Route RED | exit 1; missing `src/app/products/page` |
| Sandbox route attempt | 16 PASS; two loopback cases stopped by `listen EPERM` |
| First unrestricted route attempt | two valid unavailable failures because test success responses lacked required ETag |
| Planner unrestricted focused suite | PASS, 3 files / 19 tests before final server-only source assertion |
| IA canonical path RED | expected frozen path, received `/products/curtain-tracks/manual/` |
| IA canonical path GREEN | PASS, 1 test |
| Current no-listener focused subset | PASS, 3 files / 18 tests, 2 listener tests skipped |
| Final ProductList cases in full suite | PASS, 20 tests |
| Production smoke initial run | RED, final route not reached because manual request observed Next internal 308 |
| Production smoke corrected run | PASS, preview/cms 404; root 200; integration 404; CMS requests 0 |

## Current local gates

| Command | Result |
|---|---|
| `npm run verify:product-card-contract` | PASS — 8 / 3 / 6 |
| `npm run verify:cms-contract` | PASS — 16 / 2 / 2 |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| TASK-016 focused regressions | PASS — 5 files / 73 tests |
| Full `npm test` | PASS — 18 files / 264 tests |

Build route inventory:

```text
○ /
○ /_not-found
ƒ /integration/cms
ƒ /products
```

The internal route exists so request-time local modes can operate, while the
production smoke proves both possible configured modes still finish at 404.

## Protected integrity

| Target | SHA-256 / count |
|---|---|
| `frontend/package.json` | `958e8c8937ef092c75295e8a09de6062059df431e3419a70b5b661706ac02bce` |
| `frontend/package-lock.json` | `dda25a9069e1c1b41c4f94393a54d3e9eb3dcfea158fc2b6bbdf06cc1cb852a7` |
| ProductCard manifest | `0b87390c354bbccabbee86473db206015f9a9b8187d3451f7287211c748fd254` |
| ProductCard verifier | `02daf7a37a0c5625f9f71d4854546eb9a7142baacf134ed98c4eb8aa4e2e993e` |
| Existing CMS manifest | `3d3a137998a6b28ba1818cc2fafecacf85adc5e1dd6caff4dfc433c4748e55c7` |
| Existing CMS verifier | `5c9edf3c1a3acdd6c876cd300c14f2b1115f3e788a536cca8bb8d435ac31c528` |
| Protected preview PNG | `9a8ed9fe7145ae582450425be493987ad874d052c176e340d28d7d24bf0d4880` |
| ProductCard snapshot inventory | 13 files |
| Existing CMS snapshot inventory | 20 files |

Package, lockfile, Next config, both snapshot/verifier trees and TASK-016
runtime paths remain outside the task diff.

## Final unrestricted evidence

Planner ran the listener-containing commands against the same shared current
bytes without product edits:

- TASK-016 ProductCard gate: exit `0`, `5 files / 73 tests` PASS, `10.45s`.
- Full Vitest: exit `0`, `18 files / 264 tests` PASS, `23.06s`.
- Production smoke: exit `0`; preview/cms final 404, root 200,
  integration 404, CMS requests 0.

Final leak/scope/residue/diff and DPG results are recorded in the lane worklog.

## Visual Round 1 revision validation

| Gate | Result |
|---|---|
| Focused style RED | exit 1; 64rem block lacked `.cardBody { height: auto }` |
| Focused style GREEN | PASS — 1/1 |
| ES2017 test compatibility correction | targeted test PASS; typecheck PASS |
| ProductList current bytes | PASS — 3 files / 21 tests, 514ms |
| TASK-016 focused current bytes | PASS — 5 files / 73 tests, 10.27s |
| Full Vitest current bytes | PASS — 18 files / 265 tests, 22.20s |
| ProductCard verifier | PASS — 8 / 3 / 6 |
| Existing CMS verifier | PASS — 16 / 2 / 2 |
| Lint | PASS |
| Typecheck | PASS |
| Production build | PASS; route inventory unchanged |
| Production fail-closed smoke | PASS — preview/cms 404; root 200; integration 404; CMS requests 0 |

Listener-dependent commands were run by Planner unrestricted against the same
shared current bytes without edits. Frontend did not run visual QA.

## Adversarial Round 1 P1/P2 revision validation

| Gate | Result |
|---|---|
| Rendered hostile-media RED | exit 1; exact external URL present in React preload and `img` |
| Missing media-policy seam RED | exit 1; module did not exist |
| Media-policy matrix GREEN | PASS — 7/7 |
| Rendered hostile-media GREEN | PASS — 1/1; sanitized unavailable, no hostile URL/preload/`img` |
| ProductList no-listener subset | PASS — route 8 with 2 listener skips; presentation/config/policy 19/19 |
| ProductList unrestricted current bytes | PASS — 4 files / 29 tests |
| TASK-016 focused current bytes | PASS — 5 files / 73 tests |
| Full Vitest current bytes | PASS — 19 files / 273 tests |
| ProductCard verifier | PASS — 8 / 3 / 6 |
| Existing CMS verifier | PASS — 16 / 2 / 2 |
| Lint | PASS |
| Typecheck | PASS |
| Production build | PASS; route inventory unchanged |
| Production fail-closed smoke | PASS — preview/cms 404; root 200; integration 404; CMS requests 0 |
| `next-env.d.ts` baseline | PASS — no Git diff after production build |

The frozen Schema-valid listener sample remains absolute. Its non-empty
response deterministically becomes unavailable after one collection request
and zero `/resolve`. Root-relative acceptance is tested only at the
server-owned policy seam; valid empty CMS remains empty. The unrestricted
listener/full/smoke results were run by Planner against the shared current
bytes without product edits after the lane sandbox returned `listen EPERM`.
