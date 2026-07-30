# TASK-015 TDD RED Evidence

captured_at: 2026-07-30T06:02:29Z

## Runtime

- Node.js: `v24.18.0`
- npm: `11.16.0`
- Vitest: `4.1.10`

The Node 24 binary directory was placed first in `PATH`, so npm and all child
scripts used the required runtime.

## Precondition

Only `frontend/tests/product-card-contract-snapshot.test.ts` had been added.
Both production targets were still absent:

- `frontend/scripts/verify-product-card-contract.mjs`
- `frontend/src/lib/cms/product-card-contract/`

## Command

Run from `frontend/`:

```sh
npm test -- tests/product-card-contract-snapshot.test.ts
```

## Result

- exit code: `1`
- test files: `1 failed`
- tests: `1 failed`
- failure:

```text
Error: Cannot find module '/scripts/verify-product-card-contract.mjs'
```

The failing test was
`accepts the frozen TASK-014 ProductCard contract`. This is the intended RED:
the ProductCard verifier and Snapshot behavior did not exist. It was not a
Node-version, permission, listener, typo, or unrelated baseline failure.

No production verifier, Snapshot file, package script, dependency, lockfile,
README, CMS file, runtime module, or application route had been written before
this RED was observed and recorded.
