# TASK-007 A3 diff and output summary

## Production contract

- `gdhe-site` `0.4.2`, Content Schema `3.0.0`
- Schema 3 post types and five taxonomies in `config/content-model.json`
- `config/schema.v3.json` and `config/field-groups.v3.json`
- Schema 3 page, collection and file-reference JSON Schemas
- Schema 3 public canonical paths, template/type allowlists, relationships and collection filters
- structured type details and fail-closed public file normalization
- future-safe A3 inventory/dry-run/apply/rollback command

## Verification tooling

- removable A3 synthetic Fixture commands
- A3 contract runner
- A3 non-zero migration/idempotence/exact-rollback/failure-injection runner
- offline Draft 2020-12 validator with a reproducible 19-file transitive Schema graph
- two-lifecycle deterministic Golden runner
- warmed 1,600-request benchmark runner

## Frozen outputs

- `golden-a3/`: 15 JSON responses, including native Post and non-root Page
- `A3_CONTRACT_RUNTIME_SUMMARY.json`
- `A3_HEADER_FIXTURES.json`
- `A3_SCHEMA_VALIDATION.json`
- `A3_DETERMINISTIC_GOLDEN.json`
- `A3_BENCHMARK.json`
- `A3_CLEANUP_EVIDENCE.json`
- `A3_MIGRATION_RUNTIME_VALIDATION.json`
- `A3_REVIEW_R1_REVISION_REPORT.md`
- `A3_EXECUTION_REPORT.md`
- `A3_VALIDATION_LOG.md`
- updated `CONTRACT_AND_HANDOFF_MANIFEST.md`
- `A3_P1_REVISION_REPORT.md`

## Documentation

- `docs/cms/README.md`
- `docs/cms/CONTENT_MODEL.md`
- `docs/cms/REST_CONTRACT.md`
- A3 backup/migration/fixture section in `docs/cms/OPERATIONS_AND_ROLLBACK.md`

## Excluded

No frontend, root README, WordPress Core, SCF source, theme, third-party plugin, real content, GraphQL, multilingual, deployment, review or Git-delivery file is part of this diff.
