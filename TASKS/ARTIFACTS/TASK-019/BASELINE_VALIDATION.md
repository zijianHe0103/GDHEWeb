# TASK-019 Baseline Validation

status: `PASS`
validated_at: `2026-07-31`
baseline_commit: `4a92c0770388d4a198a123a8b667753f39431015`
branch: `codex/TASK-019-product-configuration-contract`

## Environment

| Component | Result |
|---|---|
| WordPress | `7.0.2` |
| PHP | `8.3.32` |
| Secure Custom Fields | `6.9.2`, active |
| GDHE Site | `0.5.0`, active |
| Node.js | `v24.18.0` |
| npm | `11.16.0` |

## Database boundary

- The project WordPress configuration points to the dedicated GDHE MySQL
  instance at `127.0.0.1:3307`.
- An initial command-sandbox connection attempt looked like a stopped database.
  Read-only host inspection proved that `mysqld` was already listening on
  `127.0.0.1:3307`.
- The unrelated Homebrew default instance on `3306` uses a legacy data
  directory and was not started, repaired, initialized, upgraded or modified.
- `wp db check` passed for all 12 WordPress tables.
- A3 and TASK-014 fixture options, fixture/migration postmeta and TASK-014
  termmeta all returned zero.
- The immutable pre-Fixture SQL backup is
  `.local/backups/TASK-019/20260731T090821Z/database.sql`: `179430` bytes,
  SHA-256
  `2cdcecce2e81fdc8c0be6864621a198270f7b25e7c26f1d30129a489036e6df2`.
  Its dump-completion marker is present and the path is Git ignored.

## WordPress and CMS checks

| Gate | Result |
|---|---|
| WordPress Core checksum | PASS |
| SCF official checksum | PASS |
| GDHE Site PHP syntax | PASS for every PHP file |
| GDHE Site JSON parse | PASS for every JSON file |
| Content Schema 3 recursive graph | PASS, exact 19 files |
| Existing Content Schema Goldens | PASS, 15/15 |
| Existing Content Schema boundary negatives | PASS, 6/6 rejected |
| ProductCard recursive graph | PASS, exact 8 files |
| ProductCard inline positive | PASS, 1/1 |
| ProductCard boundary negatives | PASS, 6/6 rejected |
| ProductCard runtime Goldens | PASS, 8/8 |
| ProductCard handoff | PASS, 25 checksums |

The Schema/Golden scripts were run against an isolated copy under
`/private/tmp`; they did not rewrite TASK-007 or TASK-014 authority artifacts in
the working tree.

## Frontend checks

| Gate | Result |
|---|---|
| CMS contract verifier | PASS, 16 schemas / 2 success / 2 error samples |
| ProductCard contract verifier | PASS, 8 schemas / 3 success / 6 error samples |
| ESLint | PASS |
| TypeScript | PASS |
| Vitest | PASS, 24 files / 305 tests |
| Next.js production build | PASS |

The production build retained these routes:

- `/`
- `/_not-found`
- `/integration/cms`
- `/products`
- `/products/fgd-x15-pvc`

No TASK-019 runtime route, UI, configurator or Quote Basket exists at baseline.

## Scope and Git

- `main`, `origin/main` and the TASK-019 branch baseline all resolve to
  `4a92c0770388d4a198a123a8b667753f39431015`.
- CMS, API, Schema, frontend product code, package files and lockfile had no
  TASK-019 product diff at the end of baseline validation.
- The pre-existing user-owned `.codex/config.toml` modification and historical
  untracked resume packets remain excluded from TASK-019.
- No commit, push, merge, deployment, live Feishu access or real product
  mutation occurred.

## Result

`PASS`. The A1 exit gate is satisfied. TASK-019 may move from `READY` to
`IN_PROGRESS` and dispatch only the WordPress Product Configuration authority
slice. Frontend implementation remains blocked pending an independent
WordPress checkpoint.
