# TASK-007 A1 validation log

Validation date: 2026-07-23

## Backup and environment

| Check | Result |
| --- | --- |
| Exact absolute TASK-007 backup exists | PASS |
| SQL bytes 145,805 | PASS |
| SQL SHA-256 `ceacdee32b0210d6ff52fc61f2ff9fb5ffec3a238df13414721c02254871b05c` | PASS |
| 12 table definitions, 9 insert groups, completion marker | PASS |
| Pre-A1 GDHE plugin copy readable | PASS |
| Backup Git ignored | PASS |
| TASK-004 backup unchanged | PASS |
| Branch `codex/TASK-007-english-api-dto-fixture` | PASS |
| WordPress 7.0.2 | PASS |
| PHP 8.3.32 | PASS |
| MySQL Server 8.4.10 | PASS |
| SCF 6.9.2 active and official checksum | PASS |
| WordPress Core checksum | PASS |
| Database check, 12 tables | PASS |
| GDHE Site 0.2.0 active after A1 | PASS |

## Static validation

| Check | Result |
| --- | --- |
| PHP lint, 9 GDHE plugin PHP files | PASS |
| JSON parse, 22 GDHE config JSON files | PASS |
| Draft 2020-12 meta-schema check, 14 schema files | PASS |
| Field group v2 contains 7 expected layouts | PASS |
| Content schema 2.0.0, API 1, module schema 1.0.0 | PASS |

## Migration inventory

Read-only live inventory:

| Post ID | Type | Status | Classification | Would write |
| ---: | --- | --- | --- | --- |
| 1 | post | publish | `no_modules` | false |
| 2 | page | publish | `no_modules` | false |
| 3 | page | draft | `no_modules` | false |

No existing object was applied or modified.

## Runtime matrix

Command:

`wp --path=cms eval-file /Users/arron/Storage/Personal/ObsidianWorkSpace/茂洋/独立站/cms/wp-content/plugins/gdhe-site/tests/a1-runtime-test.php`

Final output:

```json
{
  "schemaFiles": 14,
  "pureAssertions": 36,
  "fixtureId": 34,
  "cleanup": true
}
```

| Behavior | Result |
| --- | --- |
| UUID v4 module IDs generated | PASS |
| Per-module version persisted | PASS |
| UUID v4 structured-table row ID generated | PASS |
| Strict valid collection accepted | PASS |
| Reorder preserves both module IDs | PASS |
| Copy receives a new module ID | PASS |
| Unknown module type fails closed | PASS |
| Unknown module version fails closed | PASS |
| Duplicate table column key fails closed | PASS |
| Unambiguous legacy table converts | PASS |
| Duplicate normalized header fails closed | PASS |
| Uneven legacy row fails closed | PASS |
| Synthetic dry-run makes no raw-meta change | PASS |
| First apply writes valid schema v2 | PASS |
| First apply persists content schema field 2.0.0 | PASS |
| Repeated apply is idempotent | PASS |
| Persisted reorder preserves IDs | PASS |
| Persisted copy receives new ID | PASS |
| Rollback restores exact raw meta bytes | PASS |
| Repeated rollback is idempotent | PASS |
| Ambiguous apply makes no write | PASS |
| Schema discovery reports content 2.0.0 and module 1.0.0 | PASS |
| A1 schema route present and deferred A2 resolve route absent | PASS |

## Cleanup and residue

- task-marked Service objects: 0
- A1 migration backup/version meta rows: 0
- no real business content was created or modified
- no attachment, upload, taxonomy relationship, revision, temporary user or process was created by this A1 fixture
- database check passed after cleanup

## Scope and governance

Final scope validation includes only GDHE plugin, CMS docs, TASK-007 artifacts, lane worklog, exact TASK-007 backup and controlled lane messages from this lane. `git diff --check`, message validation, strict lane audit and project validation passed. The forbidden frontend/Core/SCF/theme diff query was empty. A2 and frontend remain blocked. No commit, push, merge, acceptance or closure was performed.
