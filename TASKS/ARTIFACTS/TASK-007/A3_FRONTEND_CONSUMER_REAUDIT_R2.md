# TASK-007 A3 frontend consumer re-audit Round 2

Audit date: `2026-07-24`

Message: `MSG-TASK-007-FRONTEND-SCHEMA3-P1-READAUDIT-R2`

Verdict: `PASS`

Current blocking findings: `P0=0`, `P1=0`

Deferred findings retained from Round 1: `P2=3`

## Scope

This is a narrow read-only re-audit of the two Round 1 P1 findings and their direct regression boundaries. It does not reopen the three deferred P2 findings and does not authorize a frontend adapter, page, GraphQL, multilingual work, review, Git delivery, acceptance or deployment.

`frontend/**` remained read-only.

## P1-1 closure: runtime type and template pairing

Result: `PASS`

The current runtime defines one exact pairing function in `cms/wp-content/plugins/gdhe-site/includes/public-api.php:198-208`:

- native Page and Post use `standard`;
- Product uses `product`;
- Market uses `market`;
- Reference uses `reference`;
- Support Article uses `support_article`;
- Download uses `download`.

`gdhe_build_content_envelope()` applies that function before emitting a DTO at `includes/public-api.php:296-306`. A fresh isolated PHP invocation accepted all seven valid pairs and rejected all 35 known mismatches.

The known Product with Market-template fixture is published, otherwise contract-valid, carries the Product filter taxonomy and is marked for navigation. The contract runner proves:

- its direct envelope is an error;
- anonymous resolve returns HTTP 500 with `gdhe_contract_invariant`;
- it is absent from all three Product collection pages;
- it is absent from navigation;
- it is absent from route manifest.

These assertions are at `tests/a3-contract-test.php:130-168`. The frozen runtime summary records `negativeMatrix.known-template-mismatch` as `gdhe_contract_invariant`.

Direct regression results:

- collection totals: `3/3/3`;
- collection item counts: `2/1/0`;
- mismatch path occurrences across all 13 positive Golden documents: zero;
- all 13 positive Golden hashes remain unchanged from the Round 1 baseline.

Collection, navigation and route manifest all consume `gdhe_build_content_envelope()` before exposing a record, so the shared pairing failure is not bypassed by another producer.

## P1-2 closure: reproducible transitive Schema authority

Result: `PASS`

`a3-schema-validate.py:12-18` defines exactly five roots:

1. `page.v3.schema.json`
2. `collection.v3.schema.json`
3. `navigation.schema.json`
4. `route-manifest.schema.json`
5. `error.schema.json`

The implementation recursively follows every non-fragment local `$ref`, resolves it relative to the referring file, normalizes paths relative to `config/schemas/`, sorts POSIX paths lexicographically and hashes the actual bytes.

An independent read-only Node.js implementation reproduced that algorithm without importing or writing through the validator. Results:

| Check | Result |
|---|---:|
| roots equal `A3_SCHEMA_VALIDATION.json` | PASS |
| independently traversed graph size | `19` |
| sorted graph paths equal validation JSON | PASS |
| actual file hashes equal validation JSON | PASS |
| actual file hashes equal manifest table | PASS |
| actual file hashes equal handoff entries | PASS |
| manifest Schema rows | `19` |
| handoff Schema entries | `19` |

The manifest now freezes the roots, traversal behavior, relative-path normalization, ordering and verification commands at `CONTRACT_AND_HANDOFF_MANIFEST.md:51-83`. The whole-plugin stream digest is no longer used as the Schema completeness authority.

Fresh `shasum -a 256 -c TASKS/ARTIFACTS/TASK-007/HANDOFF_CHECKSUMS.sha256` completed successfully for all 55 entries, including every file in the 19-file graph.

`A3_SCHEMA_VALIDATION.json` remains internally consistent:

- fixture `TASK-007-A3-P1-R1`;
- 19 graph files and 19 hashes;
- 13 positive documents valid;
- UUIDv4, relation limit, required Product code and database-ID additional-property negatives all invalid as expected;
- overall `valid: true`.

## Direct regression and version checks

| Boundary | Result |
|---|---|
| live plugin | active `gdhe-site` `0.4.1` |
| code constants | REST API `1`, Content Schema `3.0.0`, Module Schema `1.0.0` |
| fixture evidence | `TASK-007-A3-P1-R1` |
| positive Golden baseline | 13 of 13 unchanged |
| determinism | two rounds, 13 of 13 identical |
| WordPress database IDs | changed between rounds |
| public database-ID dependency | false |
| final marker postmeta | zero |
| final fixture option | zero |
| final five fixture terms | zero |
| frozen posts/meta/terms/options/uploads residue | all zero |
| temporary users/processes/listeners | all zero |
| changed PHP syntax | PASS |
| scoped JSON parsing | PASS |

Round 1 and Round 2 internal post, attachment and term IDs differ, while both rounds and the current files match the same 13 public Golden hashes. This preserves the normalized DTO boundary.

The audit did not create a new fixture lifecycle because this lane is read-only for CMS/database state. It independently checked current code, frozen runtime results, actual files/hashes and live zero-residue/plugin state; the Planner checkpoint supplies the separately executed two-lifecycle HTTP/runtime evidence.

## Deferred P2 findings

The following Round 1 P2 findings remain deferred and non-blocking for this narrow re-audit:

1. no positive native Post or non-root Page Golden;
2. Product and Support video machine Schema permits generic URI while runtime/documentation require HTTPS;
3. production media HTTPS origin and Next Image remote allowlist remain a deployment gate.

The P1 revision introduces no new regression that changes their severity or scope.

## Benchmark boundary

The frozen independent benchmark remains p95 `2001.839 ms`, above the `500 ms` architecture-comparison trigger. It continues to create only a future separately governed GraphQL/cache PoC and ADR candidate. No GraphQL work or authorization is part of this re-audit.

## Final gate

Both Round 1 P1 findings are closed for frontend consumer-readiness review. Planner may consume this narrow `PASS` and decide the next governed gate. This result is not adversarial review, user acceptance or authorization to implement the Next.js adapter.
