# TASK-029 Frontend A3 Validation Log

Date: `2026-08-12`

Runtime: Node.js `24.18.0`, npm `11.16.0`, Next.js `16.2.11`, MySQL `8.4.10`.

## Automated gates

| Gate | Current-byte result |
| --- | --- |
| Config plus real persistent runtime | PASS, `2 files / 6 tests` |
| Focused config/Route/Stub/MySQL/persistent set | PASS, `5 files / 28 tests` |
| RFQ server-only public/deep matrix | PASS, `1 file / 12 tests`, including deep MySQL and Route |
| Complete serial Vitest | PASS, `91 files / 725 tests`, `209.51s` |
| `persistent_stub` real HTTP | PASS, one Next process, `201/200/409/201`, two rows/two mixed, zero legacy |
| Existing RFQ production smoke | PASS, local outcomes plus unset/disabled/production final `404` |
| Quote Basket production smoke | PASS, preview/CMS final `404`, zero CMS/submission calls |
| Ten existing contract verifiers | PASS |
| ESLint | PASS |
| `tsc --noEmit --incremental false` | PASS |
| Next.js production build | PASS; existing route inventory retained |
| `npm ls mysql2 --depth=0` | PASS, exact `mysql2@3.23.3` |
| Migration `verify` | PASS, `verified=true`, `businessRows=0` |
| WordPress Core / SCF / GDHE Site / DB | PASS, `7.0.2` / `6.9.2` / `0.7.0` / 12 tables |
| A0/A1/A2 protected hashes | PASS |
| Secret/client/diagnostic scan | PASS |
| Generated/listener residue | PASS |
| `git diff --check` | PASS |

## Verifier output

- Article Number batch: `11 schemas / 5 success / 5 error`.
- CMS: `16 / 2 / 2`.
- ProductCard: `8 / 3 / 6`.
- Product Configuration v1: `4 / 1 / 6`.
- Product Configuration v2: PASS.
- Quote Basket v2: `1 / 1 / 3`.
- Quote Basket v3: `1 / 1 / 6`.
- QuoteLine v2: PASS.
- RelatedProductCard: `9 / 4 / 9`.
- RFQ Submission v2: `20 JSON / 5 schemas / 63 closed refs / 94 authority checks`.

## Database and permission truth

- MySQL target: `8.4.10`, loopback port `3307`.
- `gdhe_rfq`: exactly two tables; `rfq_intake_records=0` after exact
  fingerprint cleanup.
- Runtime grants: `USAGE` plus only `SELECT`, `INSERT`, `UPDATE` on the business
  table.
- Every focused/HTTP integration rotates the account to a new unknown random
  password in cleanup; usable credential retained: `false`.
- No WordPress `GDHE` query or mutation is part of the persistent Repository.

## Protected hashes

- Thirteen still-immutable A0 paths verify byte-exact after excluding the four
  A1-authorized and two A3-authorized paths.
- A1 package/lock remain
  `ac853a216d8c71cfc9caba5a745800729a7c9fd461f772d378475c35c2060ddf`
  and
  `3e528c8bc0f348c80680c31c3a54dc9d1917e58f0528baa927902a9b517657a8`.
- A1 migration/tool remain
  `8646615929384c57d6677c32d24d3ba07a8ded588d010a53f1527a66e51c03ae`
  and
  `adad1152d7e71f42ff858f0a869cc98a142f3b4ebdbca933062d81cfe1933c7f`.
- A2 Repository/common/Intake/Stub hashes remain exact at
  `85f96b5c485ef630051897b5ccc83ee6780c99fc48c80808e440039be79f2beb`,
  `2ea82f973b3481eaff00fb1407a66b26564dbea2517731e6cd39d4a5c6d3e7b9`,
  `84a6b02c3ecc34f5039896ef5ea40353906d3834a446c610fcf79900abc6ac85`
  and
  `981fdcc8297c0e25d21a143fcb6fcbde9f53217cc59acece221b04c48de56d2a`.
- `next-env.d.ts` was restored after dev/build to production hash
  `7b550dda9686c16f36a17bf9051d5dbf31e98555b30d114ac49fc49a1e712651`.
- Pre-existing dirty `tsconfig.json` remains
  `f3facbcab7c12c4ee775a4ca9ba4f34d906ff79c49d5c02f0c97503e6775ce31`.

## Cleanup

Build-generated `frontend/.next` was moved to macOS Trash after validation.
No `tsconfig.tsbuildinfo`, TASK-029 temporary build root, port `3000` listener,
test RFQ row, usable runtime password or test-owned WordPress listener remains.
The local MySQL server on its pre-existing port `3307` remains running.
