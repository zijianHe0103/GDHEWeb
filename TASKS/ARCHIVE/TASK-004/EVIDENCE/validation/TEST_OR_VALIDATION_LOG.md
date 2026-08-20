# TASK-004 test and validation log

Date: 2026-07-23

## Environment and preflight

| Check | Result |
| --- | --- |
| Branch | `codex/TASK-004-english-cms-scf-foundation` |
| WordPress | 7.0.2 |
| PHP | 8.3.32 |
| MySQL | 8.4.10 |
| Core checksums before write | PASS |
| Database check before write | PASS |
| ACF / ACF Pro / SCF before write | absent |

## Backup commands

The successful commands used the exact workspace-absolute backup directory required by the continuation message.

```sh
mkdir -p '/Users/arron/Storage/Personal/ObsidianWorkSpace/茂洋/独立站/.local/backups/TASK-004/20260723T011300Z'
wp db export '/Users/arron/Storage/Personal/ObsidianWorkSpace/茂洋/独立站/.local/backups/TASK-004/20260723T011300Z/database.sql' --path='/Users/arron/Storage/Personal/ObsidianWorkSpace/茂洋/独立站/cms'
wp plugin list --path='/Users/arron/Storage/Personal/ObsidianWorkSpace/茂洋/独立站/cms' --format=json
```

Results: directory creation PASS; SQL export PASS; plugin JSON parse PASS; SHA-256 and byte-size capture PASS; SQL structure PASS; database check PASS; Git ignore PASS.

The initial optional Python parser command failed because `sqlparse` was not installed. No dependency was installed. A read-only PHP structure check replaced it and reported 135 statement boundaries, 12 create-table statements, 9 insert groups and `structure=complete`.

## Supply-chain and installation

```text
Official API version: 6.9.2
Package main header: 6.9.2
Package readme stable tag: 6.9.1
Requires WordPress: 6.2
Tested WordPress: 7.0.2
Requires PHP: 7.4
Package bytes: 5,841,770
Package SHA-256: 40f72fa0d1829c8be89e5f8902b4d5625a40ede91884e55c4e8c5b72fd1ed799
ZIP integrity: PASS
SCF official checksums after install: PASS
```

The verified local ZIP was installed with `wp plugin install` and activated. SCF status is active at 6.9.2. No source file was edited.

## Registration smoke

All expected post types registered. The six public types report public and REST enabled; `site_settings` reports public disabled and REST disabled.

All expected taxonomies registered as public and REST enabled.

Capability results:

```text
administrator publish GDHE content: yes
administrator edit site settings: yes
editor publish GDHE content: yes
editor edit site settings: no
```

SCF local groups:

```text
group_gdhe_content_schema_v1 fields: 6
group_gdhe_site_settings_v1 fields: 3
```

Module names matched exactly: `hero`, `rich_text`, `card_grid`, `split_media`, `accordion`, `data_table`, `cta_banner`.

An initial field-group inspection incorrectly expected the local-group array to embed `fields`, causing that WP-CLI eval command to fail. The corrected SCF API call used `acf_get_fields` and passed. This was a test-harness error, not an application failure.

## REST and fixture smoke

Fixture ID: 6; exact title: `TASK-004 TEMPORARY ENGLISH SERVICE FIXTURE`.

| Test | Result |
| --- | --- |
| SCF field readback | PASS; schema, template, summary, hero and two modules |
| Preview URL generation | PASS |
| Anonymous draft | 401 `rest_forbidden` |
| Authenticated draft | 200; six `gdhe` keys |
| Revision | PASS |
| Autosave | PASS; field value and current title preserved |
| Publish | PASS |
| Anonymous published internal dispatch | 200 |
| Anonymous published real HTTP | 200 |
| Schema real HTTP | 200; schema 1.0.0, locale `en`, six public types |
| Anonymous site settings route | 404 |
| `acf` container present | no |
| `meta` container present | no |
| Secret-like response key | no |
| Fixture and revision cleanup | PASS; zero remaining |

The first authenticated draft test command incorrectly passed a REST request object to `set_url_scheme` and failed. The corrected request used the REST request parameter method and returned 200.

The first autosave call omitted `post_type`, emitted a WordPress warning and still created the autosave. The corrected call included `service`, returned the same autosave ID without warning and preserved field data. Cleanup removed it.

## Final integrity and governance

| Command/check | Result |
| --- | --- |
| PHP lint | PASS |
| JSON parse | PASS |
| `wp core verify-checksums` | PASS |
| `wp plugin verify-checksums secure-custom-fields` | PASS |
| `wp db check` | PASS |
| Forbidden plugin grep | no matches; grep exit 1 is expected |
| Fixture count | 0 |
| Git-tracked `.local` or SCF vendor files | none |
| Secret-pattern scan | no matches; ripgrep exit 1 is expected |
| Non-English/plugin scope scan in GDHE code | no matches |
| `git diff --check` | PASS |
| `lane_message.py validate` | valid |
| `lane_registry.py validate` | valid |
| strict `lane_audit.py` | zero issues |
| `governance_project.py validate` | valid, DPG-LANES-1.0.0 |

The first governance-project command used an unsupported `--root` option and exited 2. The corrected positional-target invocation passed.

The first final plugin-status command supplied two plugin names to a command that accepts one and exited 1. Separate status commands for `secure-custom-fields` and `gdhe-site` both passed and reported active versions 6.9.2 and 0.1.0 respectively.

## Round 1 P1 revision

### Fresh backup gate

Backup root: `.local/backups/TASK-004/revision-r1-20260723T020107Z/`.

| Evidence | Result |
| --- | --- |
| SQL bytes | 145,687 |
| SQL SHA-256 | `d8400025263596236553d95830be97395bf8c78a3602a3b6c8444009eb61f821` |
| Pre plugin JSON | 4 plugins; parsed |
| Pre capability JSON | 2 roles; parsed |
| SQL structure | 135 boundaries, 12 create tables, 9 insert groups |
| `wp db check` | PASS |
| Git ignore | PASS |

The first capability preflight incorrectly counted only names beginning with `gdhe_`; actual capability names include prefixes such as `edit_gdhe_`. The corrected check iterated the exact configured matrix and reported administrator/editor 28/14.

The first byte-size command ran in parallel with checksum generation and read the checksum file before it was created. A serial rerun found the file, verified all four SHA-256 entries and passed. No backup was regenerated or overwritten.

### Capability lifecycle

| State | Administrator matrix | Editor matrix | Plugin status |
| --- | ---: | ---: | --- |
| Before deactivation | 28/28 | 14/14 | active 0.1.1 |
| After deactivation | 0/28 | 0/14 | inactive 0.1.1 |
| After reactivation | 28/28 | 14/14 | active 0.1.1 |

The lifecycle test used only the capabilities defined in `config/capabilities.json`. No user was created or edited.

### Reference visibility fixture

Exact temporary objects:

- parent service 9, draft then publish
- relationship services 10 publish, 11 draft, 12 private, 13 pending/withdrawn
- attachment 15 on parent 9 and attachment 16 on private parent 12
- revisions 17 for parent 9 and 14 for withdrawn relation 13

The CPT did not support moving ID 13 to trash. That command made no change; the fixture was instead set to `pending` as the explicit withdrawn/non-public state.

| Request | Relationships | Media | Result |
| --- | --- | --- | --- |
| Anonymous parent draft, internal | none | none | 401 `rest_forbidden` |
| Anonymous parent draft, real HTTP | none | none | 401 `rest_forbidden` |
| Authorized draft, `context=edit` | 10, 11, 12, 13 | 15, 16 | 200 |
| Anonymous published, internal | 10 only | 15 retained, 16 null | 200 |
| Authenticated published, `context=view` | 10 only | 15 retained, 16 null | 200 |
| Authorized published, `context=edit` | 10, 11, 12, 13 | 15, 16 | 200 |
| Anonymous published, real HTTP | 10 only | 15 retained, 16 null | 200 |

All public responses retained the same six `gdhe` keys and omitted generic `acf` and `meta` containers.

Cleanup queries returned zero rows for exact fixture IDs, titles, parent revisions and postmeta. Service count was zero, no fixture upload file existed, database check passed and the temporary HTTP server was stopped.
