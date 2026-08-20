# TASK-029 Frontend A5 Validation Log

Date: `2026-08-13`

Runtime: Node.js `24.18.0`, npm `11.16.0`, Next.js `16.2.11`, MySQL `8.4.10`.

## Current-byte gates

| Gate | Result |
| --- | --- |
| TASK-025–029 focused serial regression | PASS, `47 files / 245 tests`, `108.20s` |
| Complete serial Vitest | PASS, `92 files / 738 tests`, `204.87s` |
| Ten contract verifiers | PASS |
| ESLint | PASS |
| Non-incremental TypeScript | PASS |
| Next.js production build | PASS; route inventory unchanged |
| Five production smokes | PASS |
| A3 one-Next persistent HTTP smoke | PASS, `201/200/409/new 201`, two rows/two mixed, zero legacy |
| A4 two-Next/restart HTTP smoke | PASS, 20 requests, one row/reference/mixed/attempt, exact replay |
| Exact dependency | PASS, `mysql2@3.23.3` |
| Migration plan/verify | PASS, exact two-table plan, `verified=true`, `businessRows=0` |
| Browser static leakage | PASS, 22 files and 10 forbidden server/private tokens absent |
| Client-source server boundary | PASS, 114 TypeScript source files checked |
| Environment/credential file inventory | PASS |
| MySQL target/structure/grants | PASS |
| WordPress Core/SCF/GDHE Site/12 tables | PASS |
| A0 immutable plus A1–A3/protected hashes | PASS |
| Generated/temp/cache/listener/database residue | PASS |
| `git diff --check` | PASS |
| Markdown and DPG project/messages/strict lane | PASS, schema valid and zero lane issues before response |

## Contract verifier output

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

## Production and local HTTP evidence

- CMS integration: disabled 404, enabled 200, root 200, one fixed CMS request.
- Product list: preview/CMS 404, root 200, integration 404, zero CMS requests.
- Product detail: default/preview/CMS detail and all candidate paths 404, zero
  CMS requests.
- Quote Basket: preview/CMS 404, zero CMS and submission calls.
- RFQ Intake: local receipt/error/replay flow passed; unset/disabled/production
  page and Route remain 404; zero legacy calls.
- Persistent A3: accepted first/replay, conflict and new-key acceptance passed
  through one controlled Next process with no public identity or credential
  leakage.
- Persistent A4: twenty same-key requests split across two simultaneous Next
  processes, replayed through both, then replayed after stop/restart with no
  second mixed batch or attempt.

## MySQL and permission proof

Direct read-only inspection returned:

```text
8.4.10 / 3307
rfq_intake_records
rfq_schema_migrations
business rows: 0
gdhe_rfq.rfq_intake_records: INSERT, SELECT, UPDATE
schema privileges: 0
non-USAGE global privileges: 0
WordPress GDHE base tables: 12
```

The migration verifier independently returned
`{"verified":true,"businessRows":0}`. Runtime tests also prove the account
cannot perform DDL, `DELETE`, grant operations, migration-table reads or
WordPress reads. Each real integration rotates its transient password in
cleanup and retains no usable value.

## Leakage and security proof

- Browser static scan covered 22 emitted static files and rejected the MySQL
  password/migration variable names, runtime account/table identity,
  authoritative-document/private token names and `mysql2`.
- Client-source scan covered 114 `.ts`/`.tsx` files and rejected any Client
  Component dependency on RFQ server/MySQL modules or server password names.
- The complete suite retains Client Component build negatives for the public
  and deep RFQ entry points and customer-safe serialization regressions.
- No `.env*` delta, repository credential/key/secret file, raw key, SQL
  diagnostic or private dependency message is retained.

Fresh npm audit truth is recorded without relabeling it PASS:

| Scope | Exit | Findings | Packages |
| --- | ---: | --- | --- |
| all | 1 | `4 high`, `3 moderate` | brace-expansion, fast-uri, js-yaml, nanoid, next, postcss, vite |
| production | 1 | `2 high`, `2 moderate` | fast-uri, nanoid, next, postcss |

`mysql2Finding=false` in both reports. These are the known pre-existing
dependency chains already recorded at A1; no TASK-029 dependency introduced a
new advisory.

## Integrity and cleanup

- Thirteen A0 paths outside the six A1/A3-authorized changes are byte-exact.
- Package, lock, migration, migration tool, MySQL Repository, common
  Repository, Intake, Stub Repository, config and Route hashes match the
  A1–A4 evidence.
- Protected product image hash is exact.
- `next-env.d.ts` was restored after build to the production hash
  `7b550dda9686c16f36a17bf9051d5dbf31e98555b30d114ac49fc49a1e712651`.
- Pre-existing dirty `tsconfig.json` remains
  `f3facbcab7c12c4ee775a4ca9ba4f34d906ff79c49d5c02f0c97503e6775ce31`.
- Generated `.next` was moved recoverably to macOS Trash. No TypeScript cache,
  TASK-029 `/tmp` root, frontend `.tmp-*` root, Node/Next listener, test row or
  usable credential remains. The pre-existing MySQL listener on port 3307 is
  intentionally preserved.
