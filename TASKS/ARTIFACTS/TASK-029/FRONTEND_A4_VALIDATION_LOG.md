# TASK-029 Frontend A4 Validation Log

Date: `2026-08-13`

Runtime: Node.js `24.18.0`, npm `11.16.0`, Next.js `16.2.11`, MySQL `8.4.10`.

## Current-byte gates

| Gate | Result |
| --- | --- |
| Direct A4 real-MySQL matrix | PASS, `1 file / 13 tests` |
| Focused Repository/Runtime/server-only set | PASS, `5 files / 46 tests` |
| Complete serial Vitest | PASS, `92 files / 738 tests`, `215.05s` |
| Two-Next/restart A4 HTTP smoke | PASS, 20 concurrent requests, one reference/row/mixed/attempt |
| Ten contract verifiers | PASS |
| ESLint | PASS |
| Non-incremental TypeScript | PASS |
| Next.js production build | PASS; route inventory unchanged |
| Existing five production smokes | PASS |
| Exact `mysql2@3.23.3` | PASS |
| Migration verify | PASS, `verified=true`, `businessRows=0` |
| MySQL target/grants | PASS |
| WordPress Core/SCF/GDHE Site/12 tables | PASS |
| A0/A1/A2/A3 protected hashes | PASS |
| Generated/listener/database residue | PASS |
| `git diff --check` | PASS |
| DPG project/messages/strict lane | PASS, zero issues |

## Verifier results

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

## Production smokes

- CMS integration: disabled 404, enabled 200, root 200, one fixed CMS request.
- Product list: preview/CMS 404, root 200, integration 404, zero CMS requests.
- Product detail: default/preview/CMS detail and candidate paths 404, zero CMS
  requests.
- Quote Basket: preview/CMS 404, zero CMS and submission calls.
- RFQ Intake: local receipt/error/replay path PASS; unset/disabled/production
  page and Route remain 404; zero legacy calls.

## Database and protected truth

- MySQL reports `8.4.10` on loopback port `3307`.
- `gdhe_rfq` contains exactly `rfq_schema_migrations` and
  `rfq_intake_records`; business rows: `0`.
- Runtime grants remain global `USAGE` plus only `SELECT`, `INSERT`, `UPDATE` on
  `gdhe_rfq.rfq_intake_records`.
- WordPress `GDHE` still contains exactly 12 tables; Core checksum PASS, SCF
  `6.9.2`, GDHE Site `0.7.0`.
- Thirteen still-immutable A0 paths are byte-exact.
- A1 package/lock/migration/tool hashes remain exact.
- A2 MySQL Repository/common Repository/Intake/Stub hashes remain exact.
- A3 config and Route hashes remain exact.
- Production `next-env.d.ts` is restored to
  `7b550dda9686c16f36a17bf9051d5dbf31e98555b30d114ac49fc49a1e712651`.
- Pre-existing dirty `tsconfig.json` remains
  `f3facbcab7c12c4ee775a4ca9ba4f34d906ff79c49d5c02f0c97503e6775ce31`.

## Cleanup

The workspace `.next` build was moved recoverably to macOS Trash. No
`tsconfig.tsbuildinfo`, A4 temporary project root, Node/Next listener, test RFQ
row or usable runtime password remains. The pre-existing MySQL listener on port
`3307` remains running.
