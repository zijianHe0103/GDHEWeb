# TASK-029 Frontend A2 Validation Log

Date: `2026-08-12`

Runtime: Node.js `24.18.0`, npm `11.16.0`.

## Automated gates

| Gate | Result |
| --- | --- |
| Focused real MySQL Repository | PASS, `1 file / 8 tests` |
| Common Repository + affected Stub/Intake | PASS, `4 files / 19 tests` |
| Full serial Vitest | PASS, `90 files / 719 tests`, `208.13s` |
| Ten existing contract verifiers | PASS |
| ESLint | PASS |
| Non-incremental TypeScript | PASS |
| Next.js production build | PASS; existing route inventory unchanged |
| `npm ls mysql2 --depth=0` | PASS, exact `mysql2@3.23.3` |
| Migration verify | PASS, `verified=true`, `businessRows=0` |
| A0/A1 protected hashes | PASS |
| Secret/client/SQL diagnostic scan | PASS |
| Generated/listener residue | PASS |
| `git diff --check` | PASS |
| DPG project/messages/strict lane | PASS, zero issues before response |

The full suite used `--maxWorkers=1` so the A1 migration integration and A2
transient runtime-account rotation could not race each other.

## Verifier output

- Article Number batch: `11 schemas / 5 success / 5 error`.
- CMS: `16 / 2 / 2`.
- ProductCard: `8 / 3 / 6`.
- Product Configuration v1: PASS.
- Product Configuration v2: PASS.
- Quote Basket v2: `1 / 1 / 3`.
- Quote Basket v3: `1 / 1 / 6`.
- QuoteLine v2: PASS.
- RelatedProductCard: `9 / 4 / 9`.
- RFQ Submission v2: `20 JSON / 5 schemas / 63 closed refs / 94 authority checks`.

## Direct database truth

- MySQL: `8.4.10`, port `3307`.
- `GDHE`: `utf8mb4_unicode_ci`, exactly 12 base tables.
- `gdhe_rfq`: `utf8mb4_0900_bin`, exactly two base tables.
- `rfq_intake_records`: zero rows after exact test cleanup.
- runtime account: `gdhe_rfq_app@127.0.0.1`, `caching_sha2_password`.
- grants: `USAGE` plus only `SELECT, INSERT, UPDATE` on
  `gdhe_rfq.rfq_intake_records`.
- runtime password: rotated to a fresh unknown random value after each focused
  run; no usable value retained.

WordPress read-only protection checks also pass: Core `7.0.2` checksum, SCF
`6.9.2` checksum, GDHE Site `0.7.0`, and 12 base tables. The initial combined
WordPress command used an unsupported `wp db tables --format=count` option;
that command exited `1` only after the three preceding checksum/version checks
had passed. The table count was immediately rerun through a read-only SQL
count and returned `12`.

## Protected hashes and residue

The 15 non-A1-authorized A0 baseline paths all verify byte-exact, including
the Route, config, Sink, RFQ contract/canonical/authority, all five RFQ
Schemas, vectors, Article Number batch, production `next-env.d.ts` and the
pre-existing `tsconfig.json`.

- package lock remains the A1 hash
  `3e528c8bc0f348c80680c31c3a54dc9d1917e58f0528baa927902a9b517657a8`;
- migration SQL remains
  `8646615929384c57d6677c32d24d3ba07a8ded588d010a53f1527a66e51c03ae`;
- migration tool remains
  `adad1152d7e71f42ff858f0a869cc98a142f3b4ebdbca933062d81cfe1933c7f`;
- `next-env.d.ts` is the production hash
  `7b550dda9686c16f36a17bf9051d5dbf31e98555b30d114ac49fc49a1e712651`;
- `tsconfig.json` remains
  `f3facbcab7c12c4ee775a4ca9ba4f34d906ff79c49d5c02f0c97503e6775ce31`.

Generated `.next` and `tsconfig.tsbuildinfo` were moved recoverably to Trash
after the final production build. No task-owned listener, temporary build root
or secret file remains.
