# CMS operations and rollback

## Installation source

SCF must be obtained from the official WordPress.org plugin API and download host. TASK-004 installed the already verified package `secure-custom-fields.6.9.2.zip`, SHA-256 `40f72fa0d1829c8be89e5f8902b4d5625a40ede91884e55c4e8c5b72fd1ed799`.

Official sources accessed 2026-07-23:

- https://wordpress.org/plugins/secure-custom-fields/
- https://developer.wordpress.org/secure-custom-fields/
- https://developer.wordpress.org/secure-custom-fields/welcome/installation/
- https://github.com/WordPress/secure-custom-fields
- https://api.wordpress.org/plugins/info/1.2/?action=plugin_information&request%5Bslug%5D=secure-custom-fields
- https://downloads.wordpress.org/plugin/secure-custom-fields.6.9.2.zip

The official API and plugin header report 6.9.2. The package `readme.txt` still contains `Stable tag: 6.9.1`; this upstream metadata mismatch is recorded and must not be silently normalized.

## Backup gate

Before TASK-004 changed WordPress, it created the ignored directory:

`.local/backups/TASK-004/20260723T011300Z/`

It contains the SQL export, pre-change plugin snapshot, WordPress version snapshot, official SCF API metadata, official package and checksum files. The SQL export is 1,034,101 bytes with SHA-256 `7d41c1edcb8df51fd59bd7dba9cde90e70cbe209e62bc2c43665ab837ac47f7b`.

The post-install plugin snapshot contains four plugins and has SHA-256 `0192a5ecf1f73d2815e1c96722147ac1f93ccbd7965b3204f1283b77514b5a9a`.

Round 1 used a separate immutable pre-revision backup at `.local/backups/TASK-004/revision-r1-20260723T020107Z/`. Its SQL is 145,687 bytes with SHA-256 `d8400025263596236553d95830be97395bf8c78a3602a3b6c8444009eb61f821`. The plugin and capability JSON snapshots parsed successfully, checksums verified, SQL structure was complete and `wp db check` passed.

Validation performed before installation:

- `wp db check` passed for all 12 WordPress tables.
- Plugin JSON parsed and contained two inactive plugins.
- SQL structural parsing found 135 statement boundaries, 12 `CREATE TABLE` statements and 9 insert groups.
- ZIP integrity passed and WordPress.org plugin checksums passed after installation.
- Git ignore checks confirmed the backup and third-party runtime are not tracked.

The SQL structural parser validates dump readability and boundaries; it is not a substitute for an isolated restore drill. No destructive restore was run on the healthy database.

## Recovery procedure

Run recovery only after explicit authorization and only for an actual failure. Keep the current backup immutable.

1. Confirm the target site, database identifier and backup checksum.
2. Enable maintenance mode.
3. Deactivate `gdhe-site` and `secure-custom-fields`. Deactivating `gdhe-site` removes exactly its versioned administrator/editor capability matrix.
4. Import the exact saved SQL with `wp db import` using the local CMS path.
5. Remove only the TASK-004-installed runtime directories if a full filesystem rollback is required.
6. Re-run `wp db check`, WordPress Core checksums and the pre-change plugin-list comparison.
7. Disable maintenance mode only after verification.

The database import and plugin removal commands were deliberately not executed during TASK-004 because they are destructive on a healthy environment.

## TASK-007 A3 backup and migration

The immutable pre-A3 snapshot is:

`.local/backups/TASK-007/A3-20260724T092322Z/`

It contains the SQL export, complete pre-A3 `gdhe-site` copy, plugin manifest, initial counts, Schema 2 inventory, rollback plan, manifest and checksums. The SQL is 1,121,762 bytes with SHA-256 `15f779ed70fe4cdd8c2a51eef4850c169d9f84255a315f6621ff05c323ef7101`; it contains 12 table definitions, 10 insert groups and the completion marker. The 41-file plugin snapshot checksum stream is `f87176cac871fb25f3d2916486724f229084d615e9f61aec32b69095c0d60a2a`. Do not modify or overwrite this directory.

The inventory proved a no-content migration: the only legacy row is one empty `service` auto-draft, classified as ephemeral. No real legacy post, term, relationship, route, option or migration marker was written.

Use the Schema 3 migration command in this order:

```sh
wp --path=cms gdhe a3-migrate inventory
wp --path=cms gdhe a3-migrate dry-run --ids=POST_ID
wp --path=cms gdhe a3-migrate apply --ids=POST_ID
wp --path=cms gdhe a3-migrate rollback --ids=POST_ID
```

Apply and rollback require an explicit ID allowlist. `industry` and `case_study` have deterministic target types. `service` requires `_gdhe_a3_target_type=product` and `_gdhe_a3_product_classification=confirmed`. Ambiguous types are refused. Apply captures exact post, raw meta and term relationships, then exactly reads back the Schema 3 type, version, canonical path, matching template, all five remapped relation arrays and marker. Any failed write or read-back restores and verifies the complete snapshot; early post-update failure also removes the newly written backup meta. Repeated apply and repeated rollback are no-ops.

The runtime migration test uses only disposable synthetic legacy records. It covers non-zero inventory, dry-run zero-write, apply, repeated apply, exact rollback, repeated rollback, ambiguity refusal and injected post-update/path/template/relation failures. Every injected failure must restore the byte-equivalent snapshot and leave no migration marker or backup meta.

The synthetic fixture lifecycle is:

```sh
wp --path=cms gdhe a3-fixtures create
wp --path=cms gdhe a3-fixtures show
wp --path=cms eval-file cms/wp-content/plugins/gdhe-site/tests/a3-contract-test.php
python3 cms/wp-content/plugins/gdhe-site/tests/a3-schema-validate.py
python3 cms/wp-content/plugins/gdhe-site/tests/a3-benchmark.py \
  http://127.0.0.1:8080 \
  TASKS/ARTIFACTS/TASK-007/A3_BENCHMARK.json
wp --path=cms gdhe a3-fixtures cleanup
```

`create` refuses an existing manifest. `cleanup` removes only A3-marked posts, revisions/meta/relationships, the temporary attachment/upload, five synthetic terms and its option. Final verification must prove zero A3 posts, marker meta, terms, option and uploads before handoff.

## TASK-007 A1 migration

The immutable pre-A1 backup is:

`.local/backups/TASK-007/20260723T084057Z/`

It contains `database.sql`, `gdhe-site-before/`, `plugins.json`, `BACKUP_MANIFEST.md` and `ROLLBACK_PLAN.md`. The SQL export is 145,805 bytes with SHA-256 `ceacdee32b0210d6ff52fc61f2ff9fb5ffec3a238df13414721c02254871b05c`; it contains 12 table definitions, 9 insert groups and a completion marker. The backup path is ignored by Git. Do not overwrite it or any TASK-004 backup.

Use the A1 command in this order:

```sh
wp --path=cms gdhe a1-migrate inventory
wp --path=cms gdhe a1-migrate dry-run --ids=POST_ID
wp --path=cms gdhe a1-migrate apply --ids=POST_ID
wp --path=cms gdhe a1-migrate rollback --ids=POST_ID
```

`apply` and `rollback` require an explicit ID allowlist. Inventory and dry-run never write. Apply refuses any record classified as ambiguous, snapshots the exact raw module and content-schema meta, writes schema v2 through SCF, strictly reads it back, removes only migrated legacy table fields and records migration version `2.0.0`. Repeated apply is a no-op. Rollback restores the exact captured meta bytes and removes the A1 migration markers; repeated rollback is a no-op.

Before a real apply, keep the full-site backup immutable, review every inventory record, resolve ambiguous records manually, and retain the generated per-post rollback snapshot until the migration is accepted. A1 validation used only a draft post titled `TASK-007 A1 TEMP MIGRATION`, then deleted it and confirmed no task marker or migration meta remained.

## TASK-007 A2 fixtures and rollback

The immutable pre-A2 backup is:

`.local/backups/TASK-007/A2-20260723T145000Z/`

It contains `database.sql`, the complete pre-A2 `gdhe-site-before/` copy, `plugins.json`, `initial-counts.json`, `BACKUP_MANIFEST.md`, `ROLLBACK_PLAN.md` and SHA-256 checksums. Do not overwrite this directory.

The A2 fixture commands are intentionally explicit:

```sh
wp gdhe a2-fixtures create --path=cms
wp gdhe a2-fixtures show --path=cms
wp gdhe a2-fixtures cleanup --path=cms
```

`create` refuses to run when a fixture manifest already exists. It creates only the deterministic `TASK-007-A2-R3` Home, Service, Case Study and Material representatives, two additional published Service collection records, publication-state negatives, synthetic one-pixel media and three TASK-scoped terms. Every public content and media object receives a fixed UUIDv4; WordPress database IDs remain internal cleanup handles. The Home fixture covers all seven module types and deliberately includes malicious authoring HTML that must be removed by the public sanitizer. `cleanup` force-deletes only database IDs in the fixture manifest and performs a marker/file fallback sweep. Always prove zero matching posts, revisions, postmeta, relationships, terms, attachments, uploads, users and temporary processes afterward.

If A2 rollback is required, first clean fixtures, deactivate `gdhe-site`, restore `database.sql`, replace only `gdhe-site` with `gdhe-site-before/`, reactivate it, and repeat database, Core, SCF and plugin-manifest verification. Do not restore on a healthy database merely to demonstrate the procedure.

## TASK-014 ProductCard Fixture

The immutable pre-Fixture SQL backup is:

`.local/backups/TASK-014/20260729T164606Z/database.sql`

It is 179,205 bytes with SHA-256 `1b9f7def6c333284e324719e3fd43e68a8201100a96a7eba47aa48588635cb98` and contains the dump completion marker. Do not modify or overwrite it.

The isolated local lifecycle is:

```sh
wp gdhe task014-fixtures create --path=cms
wp gdhe task014-fixtures show --path=cms
wp eval-file cms/wp-content/plugins/gdhe-site/tests/product-card-contract-test.php --path=cms
python3 cms/wp-content/plugins/gdhe-site/tests/product-card-schema-test.py
wp gdhe task014-fixtures cleanup --path=cms
```

`create` refuses an existing manifest. It creates only synthetic test candidates, one linkable curtain-track category landing, one `/series/` landing, one `/applications/` landing, three task-scoped terms and the fixed positive/negative ProductCard matrix. One valid card proves legal non-empty identity- and role-bound series/application output. The negative set includes source/target UUID mismatch and complete targets under the wrong semantic route role. `cleanup` deletes only manifest/marker-owned records and terms. The current lifecycle removes 19 posts and three terms; final verification must prove TASK-014 and A3 options, posts, postmeta, termmeta, terms and uploads are all zero.

## TASK-019 Product Configuration Fixture

The Planner-created immutable pre-Fixture SQL backup is:

`.local/backups/TASK-019/20260731T090821Z/database.sql`

It is 179,430 bytes with SHA-256 `2cdcecce2e81fdc8c0be6864621a198270f7b25e7c26f1d30129a489036e6df2`, contains the dump completion marker and is ignored by Git. Do not modify or overwrite it.

The isolated local lifecycle is:

```sh
wp gdhe task019-fixtures create --path=cms
wp gdhe task019-fixtures show --path=cms
wp eval-file cms/wp-content/plugins/gdhe-site/tests/product-configuration-contract-test.php --path=cms
python3 cms/wp-content/plugins/gdhe-site/tests/product-configuration-schema-test.py
wp gdhe task019-fixtures cleanup --path=cms
```

`create` refuses an existing manifest. It creates 13 marker-owned Product posts only: one valid FGD X15+PVC test candidate and 12 unpublished, ineligible, malformed, duplicate, guessed-option, invalid-policy or internal-field negatives. It creates no terms, attachments, uploads, users or QuoteLine records. The contract test creates one short-lived marker-owned cross-source duplicate probe and deletes it in `finally`.

`cleanup` force-deletes only manifest/marker-owned TASK-019 Product posts and its option. Each deterministic lifecycle removes exactly 13 posts, zero terms and zero uploads. Final verification must prove TASK-019 posts/source/marker meta/option/terms/termmeta/uploads plus A3 and TASK-014 markers/options are all zero. Restore the immutable SQL only after explicit authorization for a real failure; do not restore a healthy database merely to demonstrate rollback.

## TASK-021 Product Configuration v2 Fixture

TASK-021 adds an isolated removable v2 lifecycle and does not rewrite the TASK-019 v1 authority:

```sh
wp gdhe task021-fixtures create --path=cms
wp gdhe task021-fixtures show --path=cms
wp eval-file cms/wp-content/plugins/gdhe-site/tests/product-configuration-v2-contract-test.php --path=cms
python3 cms/wp-content/plugins/gdhe-site/tests/product-configuration-v2-schema-validation.py
wp gdhe task021-fixtures cleanup --path=cms
```

`create` refuses an existing manifest and creates only marker-owned synthetic Product posts. The single success contains the confirmed `GDHEPRD000172 / 6 m / Ivory White / piece` option; the remaining posts are unpublished, ineligible, malformed, ambiguous or private-field negatives. It creates no terms, media, uploads, users, QuoteLine records or real business content. Contract probes are short-lived and deleted in `finally`. `cleanup` force-deletes only manifest/marker-owned TASK-021 posts and its option. Final verification must prove TASK-021, TASK-019, TASK-014 and A3 fixture markers/options, posts, terms and uploads are zero.

Rollback removes only the v2 route dispatcher, v2 Schema/source/Fixture/tests and its `schema.v3.json` registration, then restores the v1 route callback. Do not reconstruct or rewrite any v1 Schema, Golden, error, verifier, manifest or checksum byte.

## TASK-023 RelatedProductCard Fixture

TASK-023 uses a removable local TEST_CANDIDATE lifecycle and does not write Feishu, real business content, users, attachments or uploads:

```sh
wp gdhe task023-fixtures create --path=cms
wp gdhe task023-fixtures show --path=cms
wp eval-file cms/wp-content/plugins/gdhe-site/tests/related-product-card-contract-test.php --path=cms
python3 cms/wp-content/plugins/gdhe-site/tests/related-product-card-schema-test.py
wp gdhe task023-fixtures cleanup --path=cms
```

`create` refuses an existing manifest. It creates one source Product, four eligible ordered targets, published and unpublished negative targets, one category landing and three task-scoped terms. Self and duplicate relations are stored only to prove exclusion. The contract test temporarily exercises 0/1/3/4+, over-20, source conflict and source-ineligible states and restores the original relationship set in `finally`. `cleanup` force-deletes only manifest/marker-owned posts and terms. Each deterministic lifecycle removes exactly 11 posts and three terms; final checks must prove matching posts, marker/source meta, terms, termmeta, option and uploads are all zero.

Rollback for this additive slice is deletion of only the TASK-023 MU bootstrap, related-product PHP/Schema/Fixture/tests, `schema.v3.json` registrations and TASK-023 artifacts after the fixture cleanup and zero-residue gate. ProductCard `1.0.0`, TASK-014 authority, WordPress Core, SCF, database structure and existing content are not rollback targets.

## Routine verification

Use WP-CLI to verify:

```sh
wp core verify-checksums --path=cms
wp plugin verify-checksums secure-custom-fields --path=cms
wp plugin status secure-custom-fields --path=cms
wp plugin status gdhe-site --path=cms
```

Never edit files below `secure-custom-fields`. Update by repeating the official-source, backup and checksum gates in a new confirmed task.

After recovery or ordinary reactivation, verify `gdhe-site` reapplies the exact configured capability counts. Do not grant or remove unrelated role capabilities manually.
## TASK-025 Article Number batch Fixture

The local-only `gdhe task025-fixtures create|show|cleanup` commands manage the
removable TASK-025 test candidate set. Creation adds one configured FGD X15+PVC
authority candidate, one related-product source, one protected synthetic
catalog accessory and their temporary category/taxonomy records. It does not
touch real content or database structure.

Run cleanup after every test lifecycle. A complete cleanup removes four posts,
three terms and one manifest option. Verify zero
`_gdhe_task025_fixture_marker`, `gdhe_task025_fixture_manifest` and
`task-025-*` term residue, and stop any temporary loopback WordPress server.
Rollback of the implementation removes only the TASK-025 MU bootstrap, new
runtime/Fixture/Schemas and the additive RelatedProductCard version-dispatch
seam; it does not change Product Configuration 2.0 or RelatedProductCard 1.0.
