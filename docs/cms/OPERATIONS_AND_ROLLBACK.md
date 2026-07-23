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
