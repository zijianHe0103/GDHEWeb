# TASK-014 Planner Checkpoint After Adversarial Round 1 Revision

timestamp: `2026-07-30T05:03:54Z`

result: `PASS_FOR_FINAL_ROUND_2`

## Independent correction

Before acknowledging the execution result, Planner found one remaining old namespace in the Schema-only inline positive at `product-card-schema-test.py`. Because that file is part of the 25-file handoff checksum, it was not acceptable to describe the handoff as route-authority clean.

The positive now uses:

```text
/products/curtain-track-systems/synthetic-tracks/
```

The active code/test/Golden/machine-evidence handoff scope contains no `/products/category/` or `/products/series/`.

## ProductCard fresh validation

- Two complete local Fixture lifecycles used different WordPress database IDs.
- Both rounds produced identical hashes for all eight Golden responses.
- Both rounds cleaned exactly 19 posts and three terms.
- Eleven normalized request negatives pass, including:
  - digit-only values above `PHP_INT_MAX`;
  - offset overflow at `page=PHP_INT_MAX` and `per_page=100`.
- Wrong-role references for `primaryCategory`, `series` and `applications` fail closed while valid UUID/path/target identity remains accepted.
- Twelve invalid or unpublished candidates remain excluded.
- Four action cells, 0/1/N, filters, totals, ETag, public cache, error no-store and conditional 304 remain green.

## A3 regression

- 19-file Draft 2020-12 Schema graph.
- 15 valid Golden responses.
- Six boundary negatives.
- Collection totals `3/3/3`; item counts `2/1/0`.
- Cleanup removed 18 posts, one attachment and five terms.

## Cleanup and integrity

- TASK-014/A3 database residue query: `0 0 0 0 0 0`.
- No plugin-test `.pyc` or `__pycache__`.
- 25/25 handoff SHA-256 entries pass.
- All GDHE Site PHP lint, JSON parsing and Python AST parsing pass.
- WordPress Core checksum passes.
- Secure Custom Fields checksum passes.
- GDHE Site `0.5.0` is active.
- All 12 WordPress database tables pass `wp db check`.
- Project, lane registry, controlled messages, strict lane audit and `git diff --check` pass.
- TASK-007 artifacts and `frontend/**` remain byte-diff clean in this checkpoint.

## Environment note

The first Planner database rerun inside the command sandbox could not open local TCP and appeared as a WordPress database connection failure. An attempted start of the unrelated default Homebrew 3306 data directory failed and exited because its legacy data dictionary is incomplete. No 3306 listener remains. The GDHE MySQL instance was already listening on `127.0.0.1:3307`; after using the authorized host connection, database, Fixture and cleanup validation passed.

## Gate

The Round 1 findings are implementation-complete and independently reproducible. This checkpoint authorizes only the configured adversarial final Round 2. It is not user acceptance and does not authorize frontend work, TASK-015, Git delivery or deployment.
