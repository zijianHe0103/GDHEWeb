# TASK-029 Frontend A1 Validation Log

Date: `2026-08-12`

All commands used Node `24.18.0` and npm `11.16.0` unless noted.

| Gate | Result |
| --- | --- |
| Common Repository + affected Stub/Intake | PASS, `6 files / 21 tests` |
| Real migration integration | PASS, `1 file / 2 tests` |
| RFQ server-only Client Component matrix | PASS, `1 file / 11 tests`, including deep common Repository |
| Direct migration integration command | PASS, all migration/permission booleans `true` |
| Direct migration verify | PASS, `businessRows=0` |
| Ten existing contract verifiers | PASS |
| ESLint | PASS |
| `tsc --noEmit --incremental false` | PASS |
| Next.js production build | PASS |
| `npm ls mysql2 --depth=0` | PASS, exact `mysql2@3.23.3` |
| WordPress Core checksum | PASS, WordPress `7.0.2` |
| SCF checksum | PASS, SCF `6.9.2` |
| GDHE Site version | PASS, `0.7.0` |
| WordPress database | PASS, 12/12 tables |
| A0 protected baseline | PASS: 15 paths byte-exact; four A1-authorized paths differ |
| Secret/browser-driver scan | PASS |
| Generated/listener residue | PASS; no `.next`, TypeScript cache, temporary build root or port 3000 listener |
| `git diff --check` | PASS |
| DPG project/messages/strict lane | PASS, zero lane issues |

## Verifier output

- CMS: `16 schemas / 2 success / 2 error`.
- ProductCard: `8 / 3 / 6`.
- Product Configuration v1: PASS.
- Product Configuration v2: PASS.
- QuoteLine v2: PASS.
- Quote Basket v2: `1 / 1 / 3`.
- Quote Basket v3: `1 / 1 / 6`.
- RelatedProductCard: `9 / 4 / 9`.
- Article Number batch: `11 / 5 / 5`.
- RFQ Submission v2: `20 JSON / 5 schemas / 63 closed refs / 94 authority checks`.

## Protected baseline detail

The four expected A1-authorized differences are:

1. `frontend/package.json` — exact driver and explicit command.
2. `frontend/package-lock.json` — lock closure for exact driver.
3. `frontend/src/lib/rfq/server/v2/intake.ts` — common interface/result seam.
4. `frontend/src/lib/rfq/server/v2/stub-repository.ts` — common interface implementation.

The other 15 A0 paths are byte-exact, including all five RFQ Schemas, vectors,
contract/canonical/authority, Route/config/Sink, Article Number batch,
`next-env.d.ts` and the pre-existing dirty `tsconfig.json`. The latter remains
at frozen hash
`f3facbcab7c12c4ee775a4ca9ba4f34d906ff79c49d5c02f0c97503e6775ce31`.

## Dependency audit truth

`npm audit` remains non-zero for existing dependency chains: seven total
findings (`4 high`, `3 moderate`), and production-only reports four (`2 high`,
`2 moderate`). `npm explain` binds them to existing Ajv/Next/PostCSS/Vite and
lint tooling; none is introduced through `mysql2`. A1 did not change unrelated
dependencies or apply an out-of-scope upgrade.

## Current database truth

Direct read-only inspection confirms:

- `GDHE`: 12 base tables, unchanged collation;
- `gdhe_rfq`: 2 base tables, 0 business rows;
- runtime account: `caching_sha2_password`;
- grants: exactly `INSERT`, `SELECT`, `UPDATE` on the business table;
- no usable application credential retained.
