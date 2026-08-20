# TASK-021 WordPress CMS Validation Log

Date: 2026-08-04

| Gate | Result |
|---|---|
| Strict RED/GREEN | Four controlled REDs followed by minimum GREEN; see `WORDPRESS_CMS_RED_GREEN_EVIDENCE.md` |
| V2 runtime | 1 success, 6 normalized errors, 14 candidate exclusions, ETag/304 and aggregate probes PASS |
| V2 Schema | Draft 2020-12, exact 4-file closure, 1 Golden, 7 machine negatives PASS |
| Determinism | 2 lifecycles, different database IDs, identical 1/1 Golden hash PASS |
| Cleanup | each final round 15 posts / 0 terms / 0 uploads; final related residue all zero |
| V2 handoff | SHA-256 20/20 PASS |
| V1 protected handoff | SHA-256 17/17 PASS |
| V1 behavior | request closure, empty route, temporary positive HTTP 200/Schema 1.0.0/Article Number PASS |
| PHP | all 29 GDHE Site PHP files lint PASS |
| Python | 16 files parsed in memory; no bytecode generation |
| JSON | 45 plugin/TASK-021 JSON files parsed |
| WordPress Core | official checksum PASS |
| Secure Custom Fields | official checksum PASS; active 6.9.2; source untouched |
| GDHE Site | active 0.7.0 |
| Database | all 12 WordPress tables checked OK |
| Write boundary | POST `/gdhe/v1/product-configurations` rejected with 404 |
| Secrets/private fields | focused source/Schema/Golden/evidence scan found no credential or private business value |
| Whitespace | `git diff --check` PASS |
| Governance | project, lane registry, lane messages and strict lane audit PASS |

The final residue query returned `0 0 0 0 0 0` for TASK-021 posts/meta/options, TASK-019 posts, prior task markers and prior task options. TASK-021 upload scan returned zero.

Planner-owned and unrelated dirty files were preserved. A3/ProductCard independent regressions are explicitly assigned to the Planner A3 checkpoint and were not rerun in a way that would rewrite protected TASK-007/TASK-014 artifacts.

## Adversarial handoff P2 Round 1 — 2026-08-05

| Gate | Result |
|---|---|
| Preserved handoff RED | literal 19/20; stale expected `8dbc5368…0380`, pre-revision actual `113dffa3…b876` |
| Canonical determinism | two different-ID lifecycles PASS; identical 1/1 Golden |
| Final determinism digest | `9fc30ade00bed8eb7ad642829c6b856e1864fed765281ec3c30d39f6d23849e9` |
| Cleanup | both rounds 15 posts / 0 terms / 0 uploads; final related residue zero |
| Handoff regeneration | canonical generator executed exactly once after determinism stability |
| Final handoff | direct checksum and independent manifest source parity literal 20/20 |
| V1 | frozen TASK-019 handoff 17/17 |
| Protected v2 bytes | Schema, Golden, error, runtime and Schema-validation hashes unchanged |
| Health | Core, SCF 6.9.2, GDHE Site 0.7.0 and 12-table DB PASS |
| Syntax/data | all GDHE Site PHP lint and 45 JSON parses PASS |
| Governance | diff check, project, registry, messages and strict lane audit PASS |

## Adversarial exact-decimal P1 Round 1 — 2026-08-05

| Gate | Result |
|---|---|
| Full-root RED | `4.3` and `5.8` rejected by float `multipleOf`; `6.7` passed |
| Exact-decimal GREEN | complete roots `4.3/5.8/6.7=true`, `6.05=false` |
| Existing Schema matrix | exact four-file closure, current Golden and all 7 negatives PASS |
| Validator SHA-256 | `ca4877ca83e00f55130d003efbfc7eb31522b0f364d774184e0180d1c07b970b` |
| Schema evidence SHA-256 | `be7bb37dbbdd97ffb597e3295320a715bdb0c2a0a63083803a752d0c47487b31` |
| Canonical determinism | exactly one final run; two different-ID lifecycles; identical 1/1 Golden |
| Final determinism SHA-256 | `c4e88b48d4e02d79bf1e5d5abdb55f2c564d5757305d03f806ad96032b39b7f5` |
| Cleanup | both rounds 15 posts / 0 terms / 0 uploads; final related residue zero |
| Handoff | exactly one final regeneration; direct and independent literal 20/20 |
| Final authority hashes | manifest `11f3db81…ac09`; checksum stream `fe611983…04ca` |
| Protected boundaries | Schema/Golden/error/runtime/API/PHP/Fixture unchanged; v1 17/17 |
| Health/governance | Core, SCF, DB, PHP, JSON, Python, diff and all DPG gates PASS |
