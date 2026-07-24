# TASK-007 A3 P1 Planner Checkpoint

Status: `PASS`

Validated on: `2026-07-24`

## P1-1 runtime type/template pairing

Planner independently verified that `gdhe_template_matches_public_type()` requires:

- `page/post -> standard`
- `product -> product`
- `market -> market`
- `reference -> reference`
- `support_article -> support_article`
- `download -> download`

The fresh runtime lifecycle includes a published Product using the known `market` template. It returns `gdhe_contract_invariant` from resolve and is excluded from Product collection, navigation and route manifest. Valid Product collection totals remain `3/3/3` and item counts remain `2/1/0`.

## P1-2 reproducible Schema authority

The Draft 2020-12 validator now records an exact sorted 19-file transitive Schema graph:

- page, collection, error, navigation and route-manifest roots
- UUIDv4, public path, content reference, media reference, file reference, link and safeHtml shared schemas
- all seven module schemas

`A3_SCHEMA_VALIDATION.json`, `CONTRACT_AND_HANDOFF_MANIFEST.md` and `HANDOFF_CHECKSUMS.sha256` agree on every relative path and SHA-256. The handoff manifest defines the roots, recursive local `$ref` traversal, POSIX-relative normalization, lexicographic ordering and verification commands.

## Independent runtime

Planner reran two complete Fixture lifecycles:

| Round | Post IDs | Attachment ID | Golden | Cleanup |
|---|---|---:|---|---|
| 1 | 1057-1072 | 1074 | 13/13 | zero residue |
| 2 | 1075-1090 | 1092 | 13/13 identical | zero residue |

All 13 positive Golden hashes remain identical to the pre-revision A3 baseline. Public DTOs remain independent of WordPress database IDs.

## Integrity

- `gdhe-site`: `0.4.1`
- REST API / Content Schema / Module Schema: `1` / `3.0.0` / `1.0.0`
- fixture: `TASK-007-A3-P1-R1`
- PHP lint and JSON parse: PASS
- WordPress Core checksum: PASS
- official Secure Custom Fields checksum: PASS
- database check: 12/12 tables PASS
- final posts/meta/terms/options/uploads: zero
- handoff checksum verification: PASS after refreezing the Planner determinism evidence hash
- project, message, strict lane and diff validation: PASS

The frozen benchmark remains the Planner independent 1,600-request result with p95 `2001.839 ms` and error rate `0`. The future GraphQL/cache comparison trigger remains recorded and unauthorized.

## Gate

Both frontend audit P1 findings are closed at the Planner checkpoint. This authorizes only a narrow frontend read-only re-audit of those two findings and regression boundaries. It does not authorize product frontend implementation, adversarial review, GraphQL, acceptance or Git delivery.
