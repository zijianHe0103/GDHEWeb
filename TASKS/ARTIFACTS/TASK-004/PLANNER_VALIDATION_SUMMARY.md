# TASK-004 planner validation summary

Date: 2026-07-23
Lane: `planner`
Result: initial execution and Round 1 narrow revision independently reproduced at the TASK-004 boundary; Round 2 adversarial review required

## Independent runtime checks

Planner reran the following after acknowledging the `wordpress_cms` execution response:

- PHP lint for every GDHE plugin PHP file: PASS.
- JSON parsing for all six versioned configuration files: PASS.
- `wp core verify-checksums`: PASS.
- `wp plugin verify-checksums secure-custom-fields`: PASS.
- `wp db check`: PASS for all 12 tables.
- Plugin state: SCF 6.9.2 active; `gdhe-site` 0.1.1 active; ACF, ACF Pro, WPML, ACFML, Polylang and WPGraphQL absent.
- Runtime registrations: six public CPTs and one internal CPT registered; four taxonomies registered; public/internal REST flags match the task.
- Capability matrix: administrators can publish GDHE content and edit settings; editors can publish GDHE content but cannot edit settings.
- `/gdhe/v1/schema`: status 200, Schema 1.0.0, enabled locale exactly `en`, seven module names match the versioned configuration.
- Fixture cleanup: exact temporary Service count is zero.

## Round 1 revision independent checks

Planner acknowledged `MSG-TASK-004-WORDPRESS-CMS-REVISION-R1-RESPONSE`, inspected the changed PHP and revision artifacts, then reran post-state checks without creating new CMS fixtures or changing plugin state:

- Capability code: deactivation now calls the same versioned matrix applicator with `remove_cap`; activation uses `add_cap`. Current post-reactivation state exactly matches administrator `28/28` and editor `14/14`, with `gdhe-site` active at 0.1.1.
- REST code: anonymous and every `view` context filter relationship IDs by `publish` plus public post type, and filter image attachment IDs by attachment status, public parent and URL; only an authenticated `edit` request with permission to edit the parent can retain editorial references.
- Revision fixture evidence: anonymous/view kept published relationship ID 10 and public media ID 15, filtered draft 11, private 12, pending/withdrawn 13 and private-parent media 16; authorized edit retained the full fixture set. Parent draft denial, published-parent HTTP 200, six-key projection and `acf`/`meta` removal were recorded for internal dispatch and real HTTP.
- Cleanup: database queries independently returned zero post or postmeta rows for exact fixture IDs 9 through 17 and the `TASK-004 R1 TEMP` title prefix; Service count is zero and the temporary HTTP server is stopped.
- Revision backup: SQL is 145,687 bytes with SHA-256 `d8400025263596236553d95830be97395bf8c78a3602a3b6c8444009eb61f821`; both before/after checksum manifests verify, all JSON snapshots parse, and the backup remains Git ignored.
- Regression: all six GDHE PHP files lint, all configuration JSON parses, Core checksum, SCF checksum, 12-table database check, six public CPTs, four taxonomies, internal type flags, Schema 1.0.0 and the sole enabled locale `en` pass. No `.local` or SCF runtime file is tracked and `git diff --check` passes.

Planner's first combined runtime probe used non-existent `publicTaxonomies` and `defaultLocale` keys and produced one warning. It did not modify state. The corrected probe used `taxonomies` and `locale.default`, then passed `6/6` public types, `4/4` public taxonomies, non-public/non-REST `site_settings`, Schema 1.0.0 and enabled locale exactly `en`.

## Backup and supply-chain checks

- Database dump: 1,034,101 bytes; SHA-256 `7d41c1edcb8df51fd59bd7dba9cde90e70cbe209e62bc2c43665ab837ac47f7b`.
- Pre/post plugin snapshots parse as JSON arrays of length two and four.
- SCF package: 5,841,770 bytes; SHA-256 `40f72fa0d1829c8be89e5f8902b4d5625a40ede91884e55c4e8c5b72fd1ed799`.
- WordPress.org plugin page independently confirmed SCF 6.9.2 changelog/release on the execution date and identifies WordPress.org as the publisher.
- `.local/backups/TASK-004/**` and `cms/wp-content/plugins/secure-custom-fields/**` are ignored; neither contains tracked Git files.
- No destructive restore was run. The verified SQL structure and documented restore procedure are not equivalent to an isolated restore drill.

## Scope and security checks

- `git diff --check`: PASS.
- No secret-pattern match in GDHE plugin, CMS docs, task artifacts or governance records.
- No multilingual plugin, non-English route or hreflang token in the GDHE plugin.
- No file under `frontend/**` was modified during the TASK-004 execution window.
- Generic SCF `acf` and Core `meta` response containers were removed from the six GDHE public CPT responses by GDHE-owned code; the execution fixture proved the allowlist over real HTTP.

## Planner document integration

- Added proposed ADR-005 for the English-first SCF decision and three-month WPML/ACFML deferral.
- Marked ADR-004 as amended in part without changing its accepted Headless/REST/security boundaries.
- Updated the architecture contract to distinguish implemented TASK-004 foundation behavior from deferred DTO, preview, webhook, multilingual, SEO, inquiry and deployment work.

## Explicit review targets

The adversarial reviewer should challenge at least:

- whether removal of generic `acf`/`meta` containers is sufficient for all Core REST contexts;
- whether capability grants and rollback documentation are complete and least privilege;
- whether JSON-defined field groups are fully rebuildable on a clean site;
- whether top-level Schema 1.0.0 plus layout names is sufficient at this task boundary, given stable module instance ID/version remains deferred;
- whether `data_table` authoring requires a structured field migration before the frontend consumes it;
- whether backup verification is adequate without an isolated restore drill;
- whether the SCF 6.9.2 API/header versus 6.9.1 readme mismatch is safely documented.

No commit, push, merge, task acceptance or closure was performed.

## Final validation after Round 2 PASS

At 2026-07-23T02:35:03Z, after acknowledging the final `PASS` response and reviewer recovery handoff, planner reran the complete post-review validation set:

- Six GDHE PHP files linted and all six versioned JSON files parsed.
- WordPress Core checksum, official SCF checksum and all 12 database tables passed.
- Runtime plugins: SCF 6.9.2 active; GDHE Site 0.1.1 active; Akismet and Hello Dolly inactive.
- Exact role comparison: administrator actual/configured `28/28`, editor `14/14`, with zero extra and zero missing GDHE capabilities.
- Runtime contract: six of six public CPTs, four of four public taxonomies, non-public/non-REST `site_settings`, schema HTTP status 200, Schema 1.0.0, only locale `en`, and seven controlled modules.
- Exact fixture IDs 9 through 17, title prefix, postmeta and Service collection all remained at zero residue.
- Every before/after revision-backup checksum entry verified.
- No pending, failed or blocked lane message remained. Project, registry, message and strict lane audit validation all passed.
- `git diff --check` passed; `.local` and SCF runtime had no tracked files; no TASK-004 diff appeared under frontend, Core, themes or `wp-config.php`.
- Current branch remained `codex/TASK-004-english-cms-scf-foundation`; no TASK-004 commit, push, merge, acceptance or closure was performed.

Canonical adversarial review is final `PASS`, with P0=0, P1=0 and P2=0. Stable module instance ID/version and structured `data_table` remain mandatory gates for TASK-005 before any frontend consumption; they are not silently treated as completed here.
