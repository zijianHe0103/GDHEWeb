# TASK-007 A3 adversarial Round 1 revision

Status: `EXECUTION_COMPLETE_PENDING_PLANNER_VALIDATION`

Message: `MSG-TASK-007-WORDPRESS-FOREST-SCHEMA3-REVIEW-R1-FIX`

Date: `2026-07-24`

## Scope and versions

This revision closes only the Forest-aligned Schema 3 Round 1 P1 and two P2 findings. `gdhe-site` is `0.4.2`; Fixture evidence is `TASK-007-A3-REVIEW-R1`. REST API `1`, Content Schema `3.0.0` and Module Schema `1.0.0` are unchanged.

No frontend, WordPress Core, SCF source, theme, GraphQL, multilingual, real content, deployment, Git delivery, acceptance or task closure work was performed. Production media origin and the future Next Image allowlist remain an explicit deployment gate.

## P1: atomic legacy migration

Schema 3 apply now reads back the exact target post type, Schema version, canonical public path, matching template, all five remapped relation arrays and migration marker. The pre-write post/meta/term-relationship snapshot is immutable for the operation.

Any write/read-back failure restores and verifies the complete snapshot. This removes partial type/schema/path/template/relation/marker/backup state. An early post-update failure also removes the newly written backup meta. Rollback verifies snapshot equality; repeated apply and repeated rollback are no-ops.

The real WordPress runtime suite used six disposable synthetic legacy records and proved:

- non-zero inventory and dry-run zero-write;
- successful apply and repeated-apply idempotence;
- exact rollback and repeated-rollback idempotence;
- ambiguity refusal;
- injected early post-update failure;
- injected public-path, template and relation read-back failures;
- complete snapshot restoration, no marker/backup residue and final zero task residue.

## P2-1: native content positives

The fixture now includes a native Post at `/news/task-007-a3-product-update/` and a non-root native Page at `/company/`. Both use stable UUIDv4 identifiers and the `standard` template, resolve anonymously, appear in the route manifest and remain independent of WordPress database IDs.

The Golden set is now 15 files. Two complete fixture lifecycles used different post, attachment and term database IDs while all 15 hashes matched exactly.

## P2-2: HTTPS video machine contract

Product and Support `videoUrl` now require `https://` in the Draft 2020-12 machine Schema, matching the existing runtime normalizer and CMS documentation. Current Product and Support positives carry valid HTTPS fixture URLs. Explicit Product HTTP and Support non-HTTPS mutations are rejected by Schema validation.

## Validation result

- migration runtime matrix: PASS
- PHP syntax and scoped JSON parse: PASS
- anonymous contract and 15 Golden documents: PASS
- Draft 2020-12 validation: 15/15 positives and 6/6 negative boundaries PASS
- transitive Schema graph: 19/19 individually frozen
- Product collection totals `3/3/3`, items `2/1/0`
- two different-database-ID lifecycles: 15/15 hashes identical
- final fixture cleanup: 18 posts, one attachment and five terms removed
- migration fixtures, posts, marker/backup meta, terms, options and uploads: zero residue
- WordPress Core, official SCF and 12-table database checks: PASS
- handoff checksums, scope, governance, messages and diff checks: PASS

The existing benchmark remains recorded without rerun. Planner's independent p95 `2001.839 ms` continues to trigger only a future separately governed architecture PoC; this revision does not implement or adopt GraphQL.
