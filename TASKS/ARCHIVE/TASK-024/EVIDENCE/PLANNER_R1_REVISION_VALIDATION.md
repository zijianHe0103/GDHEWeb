# TASK-024 Planner Round 1 Revision Validation

validated_at: 2026-08-11 (Asia/Shanghai)
result: HISTORICAL_PASS_FOR_ADVERSARIAL_ROUND_2
acceptance: not granted

This is the historical checkpoint that authorized the already-completed Round 2. Round 2 later returned `FAIL / P0=0 / P1=1 / P2=1`; current repair evidence is recorded separately in `PLANNER_R2_REPAIR_VALIDATION.md`.

## Round 1 closure

- P1-1 closed at the contract layer: five strict Draft 2020-12 Schemas define the public request/line union, authoritative RFQ, public receipt and public error; two fixed request/digest vectors and four representative authoritative/receipt/error samples freeze field names, enums, bounds and response variants.
- P1-2 closed: one explicit order performs bounded same-key lookup after closed request/digest validation but before new-attempt rate/challenge gates; existing unexpired same-key/same-digest returns its stored state, while unseen/expired keys remain subject to hard limits. All pre-reservation failures create no durable business state; every created reservation uses its first successful reservation time as the fixed 30-day anchor.
- P2-1 closed: `PLANNER_CONTRACT_VALIDATION.md` is explicitly historical; the active task, Project state, Board, execution/validation evidence and lane narration identify Round 1 FAIL/recovery and Round 2 as the only next gate.

## Machine-contract validation

- Schema closure: `5/5` strict compile PASS under Ajv Draft 2020-12 with formats.
- Positive samples: `6/6` PASS — two public requests, one authoritative RFQ, accepted receipt, processing receipt and normalized public error.
- Negative samples: `6/6` rejected — public Article Number, accepted receipt with retry, mismatched error message key, non-rate error retry, unsafe quantity and unknown root field.
- Fixed cryptographic vectors: `2/2` canonical business payloads, HMAC-SHA-256 digests, canonical Basket snapshots and SHA-256 clear tokens exactly reproduce `vectors/expected.json`.
- TTL vectors: `2/2` prove `expiresAt - updatedAt = 2592000000 ms`.
- Every JSON file parses and every TASK-024 artifact has a final newline.

The fixed non-production values are:

- vector 1 HMAC `dc2aeeb47e6ab57a2c06b2b9d94305835ffd9c2719e5c18bf2aa35192f81ca44`;
- vector 1 Basket token `4df2cfc5b4fa6b830fc0eba61f14847b3757aa8be2d6623ae5fcaae2b1d1edd3`;
- vector 2 HMAC `cfe9b4758bf85d82ccbdd751785159392afa7400587125808bb6d39468d0076d`;
- vector 2 Basket token `573d6627822a5eca295500873af8cce6693dedecddb1863f869ebd89f0f967ec`.

## Scope and integrity

- TASK-024 artifacts: `33` files, final newline `33/33`, broken local links `0`.
- Protected baseline: `18/20` exact; the only two changes are authorized architecture/ADR updates.
- Architecture contract SHA-256: `910a468b159936a437a6c5cfe51c38c2d7ad3d9402b7a3702061bbd6f0a084ef`.
- ADR-006 SHA-256: `6311d17c94e15ade15439c9fedfb4317c5d9c6557c940a626bf60cdd171bc1f4`.
- TASK-024 diff under `frontend/src`, `frontend/tests`, frontend package/lock and `cms/**`: `0`.
- `git diff --check`: PASS.
- DPG project, lane registry, controlled messages and strict lane audit: PASS; strict issues `[]`.

No product test/build suite was rerun because this narrow revision changed only task/architecture/decision/governance documents and added inert JSON contract evidence. Product runtime hashes remain protected by the zero-diff and baseline checks.

## Boundary

This historical validation authorized the now-completed narrow Adversarial Round 2. It does not represent the current review verdict and does not authorize another review, RFQ runtime, frontend form, CMS/API/Schema changes, Feishu access, user acceptance, commit, push, merge or deployment.
