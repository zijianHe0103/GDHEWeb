# TASK-008 Test and Validation Log

validated_at: 2026-07-25T01:11:27+08:00
runtime: Node.js 24.18.0
package_manager: npm 11.16.0
result: PASS

## TDD RED

Command:

```sh
npm test -- tests/cms-contract-snapshot.test.ts
```

Result before implementation: expected FAIL, exit 1. Vitest reported `Cannot find module '../scripts/verify-cms-contract.mjs'`; 1 suite failed and no test ran. This is the intended missing-verifier RED, not a test syntax failure.

## Focused GREEN

```text
npm test -- tests/cms-contract-snapshot.test.ts
Test Files  1 passed (1)
Tests       6 passed (6)

node scripts/verify-cms-contract.mjs
CMS contract snapshot PASS: 16 schemas, 2 success samples, 2 error samples
```

The six cases are happy parity, missing declared file, undeclared extra file, single-byte tamper, manifest traversal and unknown local `$ref`. Every mutation occurs under a temporary repository root and cleanup runs after each test.

## Full frontend validation

All commands used the verified external Node.js 24.18.0 distribution at `/tmp/gdhe-node-24.18.0.CMUEIu/node-v24.18.0-darwin-arm64/bin`; no runtime was installed or copied into the repository.

```text
npm run verify:cms-contract  PASS (16 schemas, 2 success, 2 errors)
npm run lint                 PASS
npm run typecheck            PASS
npm test                     PASS (3 files, 8 tests)
npm run build                PASS
```

The production build compiled, typechecked and generated only the pre-existing static routes `/` and `/_not-found`.

## Parity and inventory

- Contract inventory: 20 files total = manifest + 16 schemas + 2 success samples + 1 error bundle.
- Manifest assertions: TASK-007, API 1, Schema 3.0.0, exact roots, 16 schema entries, 2 success entries and 2 error selectors: PASS.
- Page and Product `cmp -s` byte parity with TASK-007 Golden sources: PASS.
- All copied Schema source/snapshot bytes and hashes: PASS through the verifier.
- Error source container SHA-256: `d7f35521b9378bce5f3ee370cf3da279d9c1725c376072a3ed4998fb939cfd58`.
- Derived error snapshot SHA-256: `c13c4fd0187a08251d3fad44f5c8cfa8421c44a0be627a7bf891fcac97b29de3`.
- Sorted declared snapshot-path inventory digest: `fd58ce7e1a939fba666bc2c5362b4bbd5b6b7f54a3d0a420f74fae76bcbc055a`.

## Scope validation

- Pre/post `frontend/package-lock.json` SHA-256 remained `fa5938d44418ccd8ba750edd8e78baa579a0417a661d404df6d129092ed526a0`.
- `git diff -- frontend/package-lock.json frontend/src/app cms frontend/.env.example frontend/.gitignore frontend/next.config.ts frontend/tsconfig.json`: empty.
- Sensitive/internal-field scan found no absolute user path, credential, database ID, post ID, term ID or WordPress ID field in the delivered snapshot, verifier or test.
- The only `cms/` and `TASKS/` strings in the snapshot are repository-relative authority paths required by the manifest; there is no runtime import from either directory.
- `git diff --check`: PASS.
- The lane-generated resume packet was removed; it is not a delivered file.

## Governance and rerun checks

- Project validation: PASS (`DPG-LANES-1.0.0`).
- Controlled-message validation: PASS.
- Strict lane audit: PASS with zero issues.
- JSON parse, trailing-whitespace and `git diff --check`: PASS.
- One verification command was initially invoked from the repository root and returned npm `ENOENT` because the package lives under `frontend/`; the same parity and focused-test commands were immediately re-run from `frontend/` and passed. This was a command-directory correction, not a product failure.

## Authority binding revision R1 validation

Revision request: `MSG-TASK-008-FRONTEND-AUTHORITY-BINDING-R1`.

TDD RED:

```text
npm test -- tests/cms-contract-snapshot.test.ts
Test Files  1 failed (1)
Tests       1 failed | 6 passed (7)
AssertionError: promise resolved instead of rejecting
```

The failing case copied the canonical Schema authority to an identically hashed `.rogue` path and substituted only `manifest.schemas[].sourcePath`. This exactly reproduced the Planner P1.

Fresh GREEN and full matrix:

```text
npm test -- tests/cms-contract-snapshot.test.ts  PASS (1 file, 7 tests)
npm run verify:cms-contract                     PASS (16 schemas, 2 success, 2 errors)
npm run lint                                    PASS
npm run typecheck                               PASS
npm test                                        PASS (3 files, 9 tests)
npm run build                                   PASS
```

A separate Node-built temporary-repository matrix rejected 11/11 authority identity substitutions: Schema source; Page name, type, source and snapshot; Product name, type, source and snapshot; error source and snapshot. Every temporary root was removed.

Revision scope checks:

- `frontend/package-lock.json` SHA-256 remains `fa5938d44418ccd8ba750edd8e78baa579a0417a661d404df6d129092ed526a0`.
- Forbidden diff for `frontend/package-lock.json`, `frontend/src/app/**`, `cms/**`, environment/config files and TypeScript configuration: empty.
- `git diff --check`: PASS.
- Production build still exposes only the pre-existing `/` and `/_not-found` routes.
