# TASK-010 Test and Validation Log

date: 2026-07-26
runtime: Node.js 24.18.0 / npm 11.16.0
branch: codex/TASK-010-cms-runtime-schema-validator
baseline_commit: dd07662698744b90a0c810a0d1f9342109eb1a22

## Pre-implementation Baseline

| Gate | Result |
|---|---|
| `npm run verify:cms-contract` | PASS; 16 Schemas, 2 success samples, 2 error samples |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm test` | PASS; 4 files, 69 tests |
| `npm run build` | PASS; only `/` and `/_not-found` |

Baseline SHA-256:

- `frontend/package.json`: `cd35b063005e729e0f5dc226224a172ab62381fce72d41780fe96e75aab2eb10`
- `frontend/package-lock.json`: `fa5938d44418ccd8ba750edd8e78baa579a0417a661d404df6d129092ed526a0`
- contract manifest: `3d3a137998a6b28ba1818cc2fafecacf85adc5e1dd6caff4dfc433c4748e55c7`
- TASK-009 Transport: `1fcbf1b41db5422bcf24141034430b34ba7c5d55c6906aeb97cea48976550de3`

## RED / GREEN Record

| Slice | RED | GREEN |
|---|---|---|
| Public success seam | exit 1; missing `validation` module | 1/1 |
| Error root | 2 failed, 2 passed; missing error validator | 4/4 |
| Version gate | 3 failed, 4 passed; missing stable contract error | 7/7 |
| Mutation/wrapper/leakage | 1 failed, 24 passed; enumerable error `name` exceeded the frozen JSON surface | 25/25 |
| Client boundary | 1 failed, 25 passed; marker-stripped public fixture built with status 0 | positive-control build succeeds; guarded public/deep builds fail; 27/27 |
| Final matrix | success/error roots, missing/wrong versions, root/type-template/module/UUID/format/dimension/table/relation/additional/error mutations, wrapper and leakage | 38/38 |

## Fresh Final Validation

Executed after a successful fresh `npm ci`:

| Command or check | Result |
|---|---|
| `npm test -- tests/cms-runtime-validator.test.ts` | PASS; 1 file, 38 tests |
| `npm run verify:cms-contract` | PASS; 16 Schemas, 2 success samples, 2 error samples |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm test` | PASS; 5 files, 107 tests |
| `npm run build` | PASS; only `/` and `/_not-found` |
| `npm ls ajv ajv-formats` | PASS; direct 8.20.0 / 3.0.1, peer deduped |
| exact registry integrity check | PASS for both approved packages |
| `npm audit --omit=dev --audit-level=high` | PASS; 0 production vulnerabilities |
| package script comparison to baseline | PASS; no script change |
| contract/Transport/`src/app` checksums and protected diff | PASS; unchanged |
| 16 static Schema imports; no `loadSchema`, `node:fs` or production `fetch` | PASS |
| all validation production modules start with `import "server-only"` | PASS |
| production leakage scan | PASS; no canonical sample or credential sentinel in `.next` |
| temporary fixture residue | PASS; none |
| `git diff --check` | PASS |
| DPG project validation | PASS |
| DPG message validation | PASS |
| DPG strict lane audit | PASS; no issues |

## Dependency Notice

`npm ci` reported nine high-severity development-tool findings in the existing ESLint/minimatch chain and suggested major-version fixes. The production-only audit is clean. No audit fix, force fix, override or unrelated dependency change was made because TASK-010 permits only the two exact Validator dependencies.

## Final File Hashes

- `frontend/package.json`: `c97170388756910fc13ba8642a5044ffd2d30a307cb603449f465d8b79d2dab9`
- `frontend/package-lock.json`: `dda25a9069e1c1b41c4f94393a54d3e9eb3dcfea158fc2b6bbdf06cc1cb852a7`
- `validation/errors.ts`: `03b258c925129ffa19d3a729c98e239811d650c7170f43b1221ca1562256cb72`
- `validation/index.ts`: `2d6613dd24086887214a0ade85225a88a70e285856e18bb7f3a8ad067dd2f7fe`
- `validation/registry.ts`: `8c44250c20da16f19b98132f7b798769625dd97211175e0304d748273de149ce`
- focused test: `ff607e52aa1e9c040c8870511ae45a6e43b124073b21129d8207e86f7d4e3cd7`
- `frontend/README.md`: `3265b9665ddec88eef5cea37002876003dfe1c4bf8261492fac7aa997ca8f2ec`

## Round 1 P1 Revision

### RED / GREEN

| Slice | RED | GREEN |
|---|---|---|
| caller isolation, nested immutability, wrapper kind/instance and ordinary Proxy clone failure | 8 failed, 34 passed | 42/42 |
| revoked Proxy native-error containment | 2 failed, 42 passed; native `TypeError` escaped before snapshot | 44/44 |

### Fresh R2 Validation

| Command or check | Result |
|---|---|
| `npm test -- tests/cms-runtime-validator.test.ts` | PASS; 1 file, 44 tests |
| `npm test` | PASS; 5 files, 113 tests |
| `npm run verify:cms-contract` | PASS; 16 Schemas, 2 success samples, 2 error samples |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS; only `/` and `/_not-found` |
| `npm ls ajv ajv-formats` | PASS; approved versions unchanged |
| `npm audit --omit=dev --audit-level=high` | PASS; 0 production vulnerabilities |
| R1 protected hashes | PASS; package, lock, registry and error module unchanged |
| product protected scope | PASS; contracts, TASK-009 server modules, `src/app`, CMS and environment unchanged |
| payload leakage and temporary residue | PASS |
| `git diff --check` and whitespace | PASS |
| DPG project/message/strict lane validation | PASS; no issues |

R2 final hashes:

- `validation/index.ts`: `c47bc9714b95d9daee3719454cda44d4f31105335996b4d545ef64bd87ad6f98`
- focused test: `2b2ded042f17685262f703befe5882ad2ebb700c5e1d50f6a1e7192c982ebb24`
- `frontend/README.md`: `b179124342b004eb7703665280318571e168b651caad6c86302e66b818293d25`

## Round 2 P1 Revision

### RED / GREEN

| Slice | RED | GREEN |
|---|---|---|
| success/error prototype body getter integrity | 2 failed, 46 passed; both wrappers returned the attacker object | 48/48 |
| success/error prototype `toJSON` integrity | 2 failed, 46 passed; both wrappers serialized body and sentinel | 48/48 |

The four cases ran together for the captured RED: 4 failed and 44 existing tests passed. Each prototype descriptor was restored in `finally`.

### Fresh R3 Validation

| Command or check | Result |
|---|---|
| `npm test -- tests/cms-runtime-validator.test.ts` | PASS; 1 file, 48 tests |
| `npm test` | PASS; 5 files, 117 tests |
| `npm run verify:cms-contract` | PASS; 16 Schemas, 2 success samples, 2 error samples |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS; only `/` and `/_not-found` |
| `npm ls ajv ajv-formats` | PASS; approved versions unchanged |
| `npm audit --omit=dev --audit-level=high` | PASS; 0 vulnerabilities |
| R1 protected hashes | PASS; package, lock, registry and error module unchanged |
| product protected scope | PASS; contract manifest and TASK-009 Transport unchanged; no edit to `src/app`, CMS or environment |
| server-only, runtime-loader/network and leakage scans | PASS |
| temporary fixture residue | PASS; none |
| `git diff --check` | PASS |
| DPG project/message/strict lane validation | PASS; no issues |

An initial combined validation command overlapped lint with the focused test's temporary Client-build fixture cleanup. ESLint exited with `ENOENT` for the just-removed fixture directory. After all processes completed with zero residue, lint and every gate were rerun serially to the PASS results above.

R3 final hashes:

- `validation/index.ts`: `e54a5479ceb5f3af98fa7e3b3a0f9f8029e53a6864233eee6d1528d69ce953ba`
- focused test: `65a3aee6c39149add02b149e0cfc902e6a2b3ac2d8692911d7a9238fcd1d6b6b`
- `frontend/README.md`: `d603642281bdcfdb175b5f95a6d233c5678bfeb454d709310352ec3ae8153de0`
