# TASK-007 A1 execution report

## Scope executed

Processed `MSG-TASK-007-WORDPRESS-A1-SCHEMA-MIGRATION` as the registered `wordpress_cms` lane. The original request was acknowledged before execution. Work remained inside:

- `cms/wp-content/plugins/gdhe-site/**`
- `docs/cms/**`
- `TASKS/ARTIFACTS/TASK-007/**`
- `LANES/wordpress_cms/**`
- `.local/backups/TASK-007/**`

## Backup and runtime baseline

The required new pre-mutation backup was created and verified at the exact absolute TASK-007 path before any plugin, database, content or fixture write:

`/Users/arron/Storage/Personal/ObsidianWorkSpace/茂洋/独立站/.local/backups/TASK-007/20260723T084057Z`

Baseline:

- WordPress 7.0.2
- PHP 8.3.32
- MySQL Server 8.4.10
- Secure Custom Fields 6.9.2 active
- GDHE Site 0.1.1 active before A1
- WordPress Core checksum passed
- SCF official checksum passed
- database check passed for 12 tables
- GDHE public CPT object count 0
- existing posts/pages/navigation, user and unrelated meta were excluded from mutation

The backup contains the complete SQL export, a pre-A1 GDHE plugin copy, plugin manifest, backup manifest and rollback plan. SQL checksum and structural details are recorded in `A1_CHECKPOINT.md`.

## Implementation

GDHE Site is now version `0.2.0`, content schema `2.0.0`, module schema `1.0.0`.

Implemented:

- `config/schema.v2.json` as the current schema registry while retaining v1 as migration baseline
- 14 Draft 2020-12 JSON Schema files covering page, error, references, collection, navigation, route manifest and seven module types
- SCF field-group v2 with `module_id`, `module_schema_version` and structured table fields
- pre-SCF-save identity preparation so IDs are stored as actual subfields
- strict module and table validation
- normalized public module wrappers and fail-closed invalid public module collections
- `wp gdhe a1-migrate` inventory, dry-run, allowlisted apply and allowlisted rollback
- per-record raw module/content-schema meta snapshot using slash-safe JSON storage
- content schema field migration to `2.0.0` and exact raw-meta rollback without double serialization
- SCF cache invalidation after rollback
- task-local runtime validation script with guaranteed fixture cleanup

## Migration behavior

Inventory classifications are `no_modules`, `current`, `ambiguous`, `convertible` or `compatible`.

- Inventory and dry-run do not write.
- Apply and rollback require explicit IDs.
- Ambiguous records are refused before writes.
- Apply snapshots raw module meta, writes through SCF, reads back and strictly validates before finalizing.
- Repeated apply reports `current` without changing meta.
- Rollback restores the exact captured raw meta and removes A1 markers.
- Repeated rollback reports `no_backup` without changing meta.

The live pre-existing inventory contained post 1 and pages 2 and 3 only; all were `no_modules` with `wouldWrite: false`. No existing content was migrated.

## Synthetic validation and cleanup

The runtime test created one draft `service` titled `TASK-007 A1 TEMP MIGRATION`, seeded a legacy two-module shape, exercised the full migration and rollback path, then deleted the object in a `finally` cleanup.

Final proof:

- 14 schema files checked
- 36 pure schema/behavior/route-boundary assertions passed
- apply, repeated apply, reorder, copy, rollback, repeated rollback and ambiguous refusal passed
- remaining task-marked Service count: 0
- remaining `_gdhe_a1_modules_backup` and `_gdhe_a1_schema_version` meta count: 0
- database check passed

## Corrected execution history

- A batched backup command was blocked before execution because the governance hook parsed shell redirection and hidden-path text conservatively. The backup was then created with the exact authorized absolute path; no pre-gate mutation occurred.
- Initial runtime execution exposed `strict_types` incompatibility with WP-CLI `eval-file`; the test wrapper declaration was removed before any fixture was created.
- SCF returns `false` when flexible-content parent layout order is unchanged even if subfields were written. Migration success is now determined by read-back, module count and strict validation.
- The identity callback initially ran after SCF flexible-content row decomposition. It now runs on the flexible-content type hook before decomposition and is guarded to the GDHE modules field.
- Rollback testing exposed WordPress JSON slashing and double-serialization behavior. Snapshot storage now uses slash-safe JSON and rollback inserts captured raw meta bytes directly, then flushes WordPress and SCF caches.

Each failed synthetic test attempt ran cleanup; no task fixture or migration marker remained.

## Deferred and prohibited work

A2 endpoints, four fixtures, benchmark and frontend handoff remain unimplemented. No frontend, WordPress Core, SCF source, theme, third-party plugin, user, credential, real business content, planner state, commit, push, merge, acceptance or task closure change was made by this execution.
