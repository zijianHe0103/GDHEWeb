# TASK-020 Baseline Validation

status: `PASS`
date: `2026-08-01`
branch: `codex/TASK-020-visible-product-configurator`
baseline_commit: `7c140448cb723acbe2c3debed844fc5ea4ffb267`

## Git and delivery baseline

- local `main`: `7c140448cb723acbe2c3debed844fc5ea4ffb267`;
- remote `main`: same commit, independently verified with `git ls-remote`;
- local/remote TASK-019 branch: same commit;
- TASK-020 branch created from that delivered main;
- no TASK-020 product implementation existed when this baseline ran.

Pre-existing user files remain excluded:

- modified `.codex/config.toml`;
- historical planner/reviewer resume packets.

They were not modified, staged or deleted by TASK-020.

## Runtime versions

- Node: `v24.18.0`;
- npm: `11.16.0`;
- Next.js: `16.2.11`;
- TypeScript: `5.9.3`;
- Vitest: `4.1.10`;
- PHP CLI: `8.3.32`;
- WordPress: `7.0.2`;
- GDHE Site: `0.6.0`;
- Secure Custom Fields: `6.9.2`.

## WordPress and database

- the actual GDHE MySQL process was already listening on `127.0.0.1:3307`;
- `wp db check` passed all 12 WordPress tables;
- WordPress Core checksum verification passed;
- official SCF checksum verification passed;
- Product Configuration handoff checksum verification passed `17/17`.

An attempted generic Homebrew `mysql.server start` addressed the unrelated
default 3306 data directory and exited by itself without producing a PID. It did
not start, stop or modify the already-running GDHE 3307 instance. Subsequent
authorized read-only WP-CLI checks against 3307 all passed.

## Contract verifiers

- CMS `/resolve`: `16 schemas / 2 success / 2 error` PASS;
- ProductCard: `8 schemas / 3 success / 6 error` PASS;
- Product Configuration: `4 schemas / 1 success / 6 error` PASS.

The TASK-019 authority checksum file independently verified all 17 listed
Schema, Golden, evidence, Fixture and implementation sources.

## Focused frontend baseline

Command scope:

- Product Configuration snapshot;
- QuoteLine contract;
- Product Detail config, loader, Adapter, route and server-only tests.

The first sandbox run produced six `listen EPERM` failures only because the
sandbox blocked `127.0.0.1`; its non-listener tests passed. The exact command was
rerun with local-loopback permission and passed:

```text
7 files / 80 tests PASS
```

No product code changed between the sandbox failure and the permitted rerun.

## Complete frontend baseline

- full Vitest: `26 files / 353 tests PASS`;
- ESLint: PASS;
- TypeScript `tsc --noEmit`: PASS;
- production build: PASS.

Build routes remained:

```text
/
/_not-found
/integration/cms
/products
/products/fgd-x15-pvc
```

Production smokes:

- Product Detail preview/cms final 404; CMS requests 0;
- ProductList preview/cms final 404; root 200; integration 404; CMS requests 0.

## Governance baseline

- current task: `TASK-020`;
- task state after user confirmation: `READY`;
- lane: registered `planner`;
- queue/dispatched/failed/blocked messages: `0/0/0/0` before frontend dispatch;
- governance project validation: PASS;
- strict lane audit: zero issues;
- `git diff --check`: PASS.

The full governance audit reports expected intake dirty state and two existing
low-level path heuristics (`class-wp-debug-data.php` and `.next` dev log). Neither
is a TASK-020 product or delivery failure.

## Result

`PASS_FOR_DESIGN_CHECKPOINT`. Existing contracts, runtime, local pages and
production fail-closed behavior are green. Frontend implementation may begin
only through a controlled lane dispatch and strict TDD.
