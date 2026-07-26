# TASK-011 Phase A1 Test and Validation Log

date: 2026-07-26
runtime: Node.js 24.18.0 / npm 11.16.0
branch: codex/TASK-011-minimal-cms-integration-page
baseline_commit: a89bb4de91e63dce2f9960e31b1cd39cae58f335

## Baseline

Before A1 product edits:

| Gate | Result |
|---|---|
| `npm run verify:cms-contract` | PASS; 16 Schemas, 2 success, 2 error |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm test` | PASS; 5 files, 117 tests |
| `npm run build` | PASS; static `/` and `/_not-found` only |

## RED / GREEN Record

| Slice | RED | GREEN |
|---|---|---|
| DTO/Adapter | missing Adapter module | 4/4 |
| configuration/orchestration | missing integration public module | 28/28 |
| technical route | missing route module | 3/3 |
| server-only public/deep guard | deep guarded build unexpectedly succeeded after deliberate marker removal; 1 failed, 1 passed | 2/2 |
| environment allowlist | new approved variables produced 1 failed, 153 passed | environment 1/1; full suite GREEN |
| request-time route gate | `dynamic` was undefined; 1 failed, 3 passed | route 4/4 |

Two test-harness corrections were not product failures:

- the first guard RED used Vitest's 5000 ms default while running two real builds; timeout was raised to 30000 ms, then the expected missing-guard assertion RED was captured;
- the first production-smoke invocation used an encoded URL pathname for `spawn`, then asserted that the browser's own query string could not appear in framework output. It was corrected to `fileURLToPath` and to the actual contract: browser input cannot change the upstream CMS request.

The interrupted guard test left one 3.3 MB temporary build directory. Its exact path was verified with no live process, moved to the macOS Trash, and is recoverable there. The final test uses a 30000 ms timeout and all fresh runs prove zero residue.

## Fresh A1 Validation

| Command or check | Result |
|---|---|
| focused four-file Vitest command | PASS; 4 files, 38 tests |
| `npm run verify:cms-contract` | PASS; 16/2/2 |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm test` | PASS; 9 files, 155 tests |
| `npm run build` | PASS; `/integration/cms` is dynamic |
| `node tests/cms-integration-production-smoke.mjs` | PASS; disabled 404, enabled 200, root 200, one fixed request |
| public/deep real Client Component builds | PASS; marker-stripped positive controls build, guarded imports fail |
| `npm ls --depth=0` | PASS; exact dependency inventory unchanged |
| `npm audit --omit=dev --audit-level=high` | PASS; 0 vulnerabilities |
| protected tracked diff | PASS; package/lock, root app, contracts, TASK-009/010 modules and CMS unchanged |
| server-only markers | PASS for Adapter and four integration modules |
| client/input/fetch source scan | PASS |
| client static-chunk environment scan | PASS |
| configured CMS origin and sentinel leakage scan | PASS |
| temporary build-test/process residue | PASS; none |
| `git diff --check` | PASS |
| DPG project/message validation | PASS |
| DPG strict lane audit | non-zero only for expected medium `QUEUE_MESSAGES_PENDING`; A2 is intentionally queued and blocked |

## Protected Hashes

The following equal the A1 baseline:

- `frontend/package.json`: `c97170388756910fc13ba8642a5044ffd2d30a307cb603449f465d8b79d2dab9`
- `frontend/package-lock.json`: `dda25a9069e1c1b41c4f94393a54d3e9eb3dcfea158fc2b6bbdf06cc1cb852a7`
- root page: `b86ff25de7c5f3fba7afa47eb86413fd5476f2a731be76b84ca2b52354aa3f5a`
- root layout: `3a930277adca815a7cd35f61f426c347b766c420e69a7919a546148691456e3b`
- global CSS: `3faa680fbf1eb1f394ee6aede07c33fd68267f612149322ad3a4a8ce282d6f85`
- TASK-009 config: `1958d000413b3eb1101376e3e47356002adb600e82185b1aca733a38ecc81c97`
- TASK-009 errors: `47402e4300cecf846e4c29b6a32517b8ddb4004680037ad7b65d5274a7964c2b`
- TASK-009 public entry: `c8e0180cc57cf9c9d2eb72aa7eac831ff9d153a4505399a63186cd62d39b2c99`
- TASK-009 URL builder: `0daddea05c38b64500e1d918c0309a7bab8dcf1de9048b30862e54709956b93a`
- TASK-009 Transport: `1fcbf1b41db5422bcf24141034430b34ba7c5d55c6906aeb97cea48976550de3`
- TASK-010 validation errors: `03b258c925129ffa19d3a729c98e239811d650c7170f43b1221ca1562256cb72`
- TASK-010 validation public entry: `e54a5479ceb5f3af98fa7e3b3a0f9f8029e53a6864233eee6d1528d69ce953ba`
- TASK-010 registry: `8c44250c20da16f19b98132f7b798769625dd97211175e0304d748273de149ce`
- contract manifest: `3d3a137998a6b28ba1818cc2fafecacf85adc5e1dd6caff4dfc433c4748e55c7`
- `.env.local`: `61ae67a762df4e4947ea3e8934aabcf6c5307805edef0b10d0f91cac91f6c4ca`

## Phase Gate

This log proves offline A1 only. It does not prove WordPress Fixture lifecycle, live WordPress-to-Next.js E2E, screenshots or cleanup. Those remain blocked behind the Planner A1 checkpoint.

## Round 1 Runtime Authenticity Addendum

| Gate | Result |
|---|---|
| executable Adapter RED | expected FAIL; 3 failed, 4 passed |
| Adapter GREEN | PASS; 7/7 |
| focused Adapter/Validator/orchestration/server-only | PASS; 4 files, 85/85 |
| `npm run verify:cms-contract` | PASS; 16/2/2 |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm test` | PASS; 9 files, 158/158 |
| `npm run build` | PASS; `/integration/cms` remains dynamic |
| `npm ls --depth=0` | PASS; exact dependency inventory unchanged |
| `npm audit --omit=dev --audit-level=high` | PASS; zero vulnerabilities |
| protected hashes/server-only/leakage | PASS |
| build/test/process residue after cleanup | PASS; zero |

The three RED cases were raw success payload, ordinary structural success
object and authentic error wrapper. All now throw the same existing
`CmsContractError` with kind `invalid_success_payload`, while canonical Home
and Product wrappers retain exact frozen DTO output.
