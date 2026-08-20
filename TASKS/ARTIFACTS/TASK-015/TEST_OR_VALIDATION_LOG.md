# TASK-015 Test Or Validation Log

validated_at: 2026-07-30T09:29:23Z
runtime: `Node.js v24.18.0 / npm 11.16.0`

## TDD RED

| Command | Exit | Result |
| --- | ---: | --- |
| `npm test -- tests/product-card-contract-snapshot.test.ts` | 1 | Expected RED: 1 test failed because `verify-product-card-contract.mjs` did not exist |

The verifier and Snapshot tree were absent at RED time; the table above is the
retained RED result.

## ProductCard GREEN

| Command | Exit | Result |
| --- | ---: | --- |
| `npm run verify:product-card-contract` | 0 | PASS: 8 schemas, 3 success samples, 6 error samples |
| `npm test -- tests/product-card-contract-snapshot.test.ts` | 0 | PASS: 1 file, 13 tests |

The focused matrix runs canonical and all mutation cases against temporary
repository copies. Temporary roots are removed in `afterEach`; the final
`/tmp/gdhe-product-card-contract-*` scan was empty.

## Existing Frontend Regression

All commands used the Node 24 binary directory first in `PATH`.

| Command | Exit | Result |
| --- | ---: | --- |
| `npm run verify:cms-contract` | 0 | PASS: 16 schemas, 2 success, 2 errors |
| `npm run lint` | 0 | PASS |
| `npm run typecheck` | 0 | PASS |
| `npm run build` | 0 | PASS; `/`, `/_not-found`, `/integration/cms` unchanged |
| sandboxed `npm test` | 1 | Environment-only failure: 41 existing listener tests received `listen EPERM 127.0.0.1`; 130 passed |
| system-approved non-sandbox `npm test` | 0 | PASS: 10 files, 171 tests |

The sandboxed failure reproduced the documented baseline restriction. The
same full command under the approved non-sandbox path had zero product-test
failures.

## Authority And Isolation

- TASK-014 handoff manifest SHA-256:
  `aa7cd391c78ffb7038d8ef233101ceb3ee75e619b1246d1da280cc8c4ba42ccb`.
- TASK-014 handoff checksum file SHA-256:
  `c363f293c44ffee6b9c3cebbb03ac0e2dab73e9a7910f18b0975a65404962883`.
- Full TASK-014 checksum verification: 25/25 `OK`.
- `frontend/package-lock.json`:
  `dda25a9069e1c1b41c4f94393a54d3e9eb3dcfea158fc2b6bbdf06cc1cb852a7`,
  unchanged from baseline.
- Existing TASK-008 manifest:
  `3d3a137998a6b28ba1818cc2fafecacf85adc5e1dd6caff4dfc433c4748e55c7`,
  unchanged from baseline.
- Existing TASK-008 verifier:
  `5c9edf3c1a3acdd6c876cd300c14f2b1115f3e788a536cca8bb8d435ac31c528`,
  unchanged from baseline.
- Git protected-diff check for package lock, old Snapshot/verifier, app, CMS
  and TASK-014 authority: empty.
- ProductCard Snapshot inventory: exactly 13 declared files.
- Dependency inventory: unchanged exact top-level package set.
- Production TypeScript/TSX imports from `cms/` or `TASKS/`: zero.
- Runtime TypeScript/TSX imports of `product-card-contract`: zero.
- Secret, absolute local path and private/internal-field scans: zero.
- `git diff --check`: PASS.

## Governance

- Artifact Markdown/reference/JSON checks: PASS.
- Trailing whitespace and local absolute-path checks: PASS.
- `git diff --check`: PASS.
- Durable Project Governance project validation: PASS.
- Controlled message validation: PASS.
- Strict lane audit: PASS with zero issues before response creation.
- Generated frontend resume packet: removed.

After response creation, message validation and strict lane audit are rerun;
the response must receive a real Codex thread bridge receipt before it is
recorded as dispatched.

Post-response result: the execution response received a real bridge receipt,
was recorded as dispatched and left the queue. Message validation and strict
lane audit were rerun after this record.
