# TASK-029 Frontend Adversarial Findings R1 Validation Log

Date: `2026-08-13`

Runtime: Node.js `24.18.0`, npm `11.16.0`, Next.js `16.2.11`, MySQL `8.4.10`.

## Strict TDD evidence

| Gate | Result |
| --- | --- |
| P1-1 stored-row RED | exit `1`; `1 failed / 8 skipped`; impossible reserved/version-2 resolved as replay |
| P1-1 MySQL RED | exit `1`; expected `stateRowVersionConstraintRejected` was absent |
| P1-1 stored-row GREEN | exit `0`; `1 passed / 8 skipped` |
| P1-1 MySQL GREEN | exit `0`; `1 passed / 1 skipped` at that point |
| P1-2 recovery RED | exit `1`; the complete `recovery` result was absent |
| P1-2 recovery GREEN | exit `0`; `1 passed / 2 skipped` |

The P1-1 parser matrix includes reserved, resolving, pending, accepted,
indeterminate, rejected-below-range and rejected-above-range impossible pairs.
The real constraint negative uses the live local MySQL table, not a SQL-string
assertion.

P1-2 injects `injected_ddl_interruption` after database and account removal in
both initialization cleanup and `down-if-empty`. Every half-state is inspected
before a supported command reruns. The final integration result reports all four
state-matrix booleans plus all four destructive-boundary booleans and WordPress
isolation as `true`.

## Current-byte regression

| Command or gate | Result |
| --- | --- |
| migration test file | PASS, `1 file / 3 tests` |
| Repository/common/persistent runtime safe-order group | PASS, `4 files / 27 tests` |
| complete serial Vitest with `--no-file-parallelism` | PASS, `92 files / 740 tests`, `193.54s` |
| ESLint | PASS |
| `tsc --noEmit --incremental false` | PASS |
| production build | PASS; route inventory unchanged |
| ten offline contract verifiers | PASS |
| five production smokes | PASS |
| one-process persistent HTTP smoke | PASS: `201/200/409/new 201`, two rows/two mixed calls, zero legacy |
| two-process/restart persistent HTTP smoke | PASS: twenty requests, one row/reference/mixed/attempt, exact replay |

One deliberately unsafe combined run allowed the destructive migration file to
execute concurrently with Repository/runtime files and failed because the test
account and Schema were removed mid-use. No product assertion identified a code
defect. Rerunning the migration alone and all affected consumers with file
parallelism disabled produced the PASS results above; the complete inventory was
therefore also run serially.

## Contract verifier output

- Article Number batch: `11 schemas / 5 success / 5 error`;
- CMS: `16 / 2 / 2`;
- ProductCard: `8 / 3 / 6`;
- Product Configuration v1: `4 / 1 / 6`;
- Product Configuration v2: PASS;
- Quote Basket v2: `1 / 1 / 3`;
- Quote Basket v3: `1 / 1 / 6`;
- QuoteLine v2: PASS;
- RelatedProductCard: `9 / 4 / 9`;
- RFQ Submission v2: `20 JSON / 5 schemas / 63 closed refs / 94/94`.

## Database and protected boundaries

- migration verify: `verified=true`, `businessRows=0`;
- direct target: MySQL `8.4.10`, port `3307`, exact
  `rfq_intake_records` and `rfq_schema_migrations`;
- runtime account grants: only `INSERT`, `SELECT`, `UPDATE` on the RFQ business
  table; zero Schema and non-USAGE global privileges;
- WordPress `GDHE`: twelve base tables; Core `7.0.2` checksum PASS; SCF `6.9.2`
  checksum PASS; GDHE Site `0.7.0` unchanged;
- emitted static inventory: 22 files with no RFQ MySQL password variable,
  migration password variable, runtime account, RFQ Schema/table,
  authoritative-document, payload-key/digest/comparison or `mysql2` identity;
- Client Components contain no RFQ server/MySQL import or credential identity;
- thirteen immutable A0 paths, package, lock, common Repository, Intake, Stub,
  config, Route, production `next-env.d.ts`, pre-existing `tsconfig.json` and the
  protected product image remain byte-exact;
- build-generated `frontend/.next` was removed after the final smoke and
  `next-env.d.ts` was restored to production hash
  `7b550dda9686c16f36a17bf9051d5dbf31e98555b30d114ac49fc49a1e712651`.

The first SCF checksum invocation used the obsolete slug
`simple-custom-fields` and exited `1` without mutation. The corrected installed
slug `secure-custom-fields` exited `0` and verified `1 of 1` plugins.

## Governance

Pre-response Markdown whitespace, `git diff --check`, project validation,
message-registry validation and strict lane audit all PASS with zero lane issues.
The linked response was received and ACKed/done by Planner; its queue path is
absent. Post-response message-registry validation, strict lane audit and
`git diff --check` also PASS. No review, acceptance, Git delivery, deployment or
external integration was performed.
