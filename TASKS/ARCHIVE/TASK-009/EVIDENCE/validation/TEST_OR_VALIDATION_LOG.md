# TASK-009 Test and Validation Log

validated_at: 2026-07-26T00:08:44+08:00
runtime: Node.js 24.18.0
package_manager: npm 11.16.0
result: PASS

## TDD evidence

All commands used the external official runtime at `/tmp/gdhe-node-24.18.0.CMUEIu/node-v24.18.0-darwin-arm64/bin`.

```text
Configuration/path RED       FAIL: missing ../src/lib/cms/server/config
Configuration/path GREEN     PASS: 1 file, 30 tests
HTTP transport RED           FAIL: missing ../src/lib/cms/server/transport
HTTP protocol GREEN          PASS: 1 file, 37 tests
Typed-error RED              FAIL: 14 failed, 37 passed
Typed-error GREEN            PASS: 1 file, 51 tests
Public-entry RED             FAIL: missing ../src/lib/cms/server
Public-entry GREEN           PASS: 1 file, 52 tests
Client-import RED            FAIL assertion because Next build exited 0 without markers
Client-import GREEN          PASS: test build rejected the Client Component import
Slow-body timeout RED        FAIL: promise resolved after headers despite 20 ms timeout
Final focused GREEN          PASS: 1 file, 55 tests
```

The first Client-import fixture used a `node_modules` symlink outside the temporary project and produced a Turbopack filesystem-root error. That result was rejected as invalid evidence. The corrected fixture uses a random directory under `frontend/`, resolves dependencies through its parent, and removes the directory in `finally`.

## Final frontend validation

```text
npm run verify:cms-contract  PASS: 16 schemas, 2 success samples, 2 error samples
npm run lint                 PASS
npm run typecheck            PASS
npm test                     PASS: 4 files, 64 tests
npm run build                PASS
```

The production build compiled and typechecked successfully and generated only the existing static routes `/` and `/_not-found`.

## Transport matrix

- Configuration: missing, relative, non-HTTP(S), credentials, query, fragment, wrong REST base, non-loopback HTTP and localhost subdomain rejection; HTTPS, localhost, IPv4 loopback and IPv6 loopback acceptance.
- Paths: root and canonical multi-segment acceptance; case, trailing slash, double slash, dot segment, query, fragment, backslash, encoded separator, segment length and total length rejection.
- Request: exactly one GET, fixed endpoint/query, `Accept: application/json`, no Authorization, Cookie or nonce.
- Success: one JSON parse to `unknown`; exact metadata allowlist.
- Protocol: 204, 206, 304, invalid content type, empty JSON, malformed JSON and redirect refusal.
- HTTP: 400, 401, 403, 404, 409, 429, 500, 502, 503 and 418 mapping; `Retry-After` retention.
- Transport: delayed headers timeout, delayed body timeout, caller abort and closed-port network failure.
- Leakage: CMS origin and raw private response detail absent from error messages and JSON serialization.
- Framework boundary: real Next.js Client Component production build rejects imports of the guarded Transport.

Every loopback server binds a random `127.0.0.1` port and is closed in `finally`; delayed timers are unreferenced. The temporary Next.js project is deleted in `finally`. Final residue scan found no `.tmp-server-only-negative-*` directory.

## Scope and integrity checks

- `frontend/package.json` SHA-256: `cd35b063005e729e0f5dc226224a172ab62381fce72d41780fe96e75aab2eb10`.
- `frontend/package-lock.json` SHA-256: `fa5938d44418ccd8ba750edd8e78baa579a0417a661d404df6d129092ed526a0`.
- Baseline diff for package/lock, `frontend/src/app/**`, contract snapshot, `cms/**`, `.env.example` and root README: empty.
- Every production module under `frontend/src/lib/cms/server/*.ts` begins with `import "server-only";`.
- Production sensitive-origin/credential/raw-detail scan: zero matches.
- `git diff --check`: PASS.
- DPG project validation: PASS.
- Controlled-message validation: PASS.
- Strict lane audit: PASS with zero issues.

## Documentation scope

`frontend/README.md` is updated. A minimal root README pointer is required by the project documentation rule but is outside the frontend lane write scope; the denied patch left root README byte-unchanged. Planner owns this final documentation sync.

## Explicit loopback port revision R2

Request: `MSG-TASK-009-FRONTEND-EXPLICIT-LOOPBACK-PORT-R2`.

TDD RED:

```text
npm test -- tests/cms-transport.test.ts
Test Files  1 failed (1)
Tests       3 failed | 55 passed (58)
```

Only the three missing-port values failed, each because `parseWordPressApiUrl` did not throw. After requiring a non-empty `url.port` on the existing HTTP-loopback branch:

```text
npm test -- tests/cms-transport.test.ts  PASS: 1 file, 58 tests
npm run verify:cms-contract             PASS: 16 schemas, 2 success, 2 errors
npm run lint                            PASS
npm run typecheck                       PASS
npm test                                PASS: 4 files, 67 tests
npm run build                           PASS
```

Revision integrity:

- package SHA-256 remains `cd35b063005e729e0f5dc226224a172ab62381fce72d41780fe96e75aab2eb10`;
- lockfile SHA-256 remains `fa5938d44418ccd8ba750edd8e78baa579a0417a661d404df6d129092ed526a0`;
- protected baseline diff remains empty for package/lock, `src/app`, contracts, CMS, `.env.example` and root README;
- no temporary Next.js fixture residue;
- production leakage scan returned zero matches;
- `git diff --check`, project validation, message validation and strict lane audit passed.

Only `config.ts`, the focused test and frontend README changed in product scope for R2. Transport/status/timeout/server-only behavior was not edited.

## Deep-import production surface revision R3

Request: `MSG-TASK-009-FRONTEND-DEEP-IMPORT-SURFACE-R3`.

TDD RED:

```text
npm test -- tests/cms-transport.test.ts
Test Files  1 failed (1)
Tests       1 failed | 58 passed (59)
Received    requestResolvedPath function on the deep transport module
```

After removing the injection export, the first migration run exposed three test-harness issues: one leakage assertion had dropped its loopback base variable, and the two real 5000 ms timeout tests still used Vitest's default 5000 ms test limit. No production change was made for these harness failures; the base parameter was restored and only those two test limits were set to 7000 ms.

Fresh final evidence:

```text
npm test -- tests/cms-transport.test.ts  PASS: 1 file, 60 tests
npm run verify:cms-contract             PASS: 16 schemas, 2 success, 2 errors
npm run lint                            PASS
npm run typecheck                       PASS
npm test                                PASS: 4 files, 69 tests
npm run build                           PASS
```

Non-overridability evidence:

- runtime `Object.keys(transportModule)` equals only `["resolveCmsPath"]`;
- the public and deep imports resolve to the same function;
- compile-time signature is `(publicPath: string, callerSignal?: AbortSignal) => Promise<CmsTransportResponse>`;
- production search finds no `requestResolvedPath`, `baseUrl`, `timeoutMs` or `InternalTransportOptions`;
- production timeout remains private `DEFAULT_TIMEOUT_MS = 5000`;
- every loopback HTTP test controls only `WORDPRESS_API_URL` and calls `resolveCmsPath`;
- real Client Component production builds reject both public-index and deep-transport imports.

Revision integrity:

- package and lockfile SHA-256 remain `cd35b063005e729e0f5dc226224a172ab62381fce72d41780fe96e75aab2eb10` and `fa5938d44418ccd8ba750edd8e78baa579a0417a661d404df6d129092ed526a0`;
- package/lock, `src/app`, contracts, CMS and `.env.example` protected diff is empty;
- root README contains Planner's pre-existing P2 synchronization and was not edited in R3;
- no temporary Next.js fixture residue and no production leakage match;
- `git diff --check`, project validation, message validation and strict lane audit passed.
