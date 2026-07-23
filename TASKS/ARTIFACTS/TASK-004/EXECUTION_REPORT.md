# TASK-004 execution report

Date: 2026-07-23
Lane: `wordpress_cms`
Result: implementation and lane validation complete; independent adversarial review and planner integration remain pending

## Outcome

- Created a verified, ignored pre-change database backup and plugin-state snapshot before any CMS mutation.
- Installed and activated official Secure Custom Fields 6.9.2 without modifying its source.
- Created and activated GDHE-owned `gdhe-site` 0.1.0.
- Registered seven post types, four taxonomies, role capabilities, two versioned SCF field groups and seven controlled modules.
- Added the anonymous read-only `/wp-json/gdhe/v1/schema` boundary and an allowlisted `gdhe` projection on six public Core REST types.
- Verified draft, authenticated edit access, revision, autosave, preview, publish, anonymous REST and complete fixture cleanup.
- Added operator, content-model and REST documentation under `docs/cms/`.

No frontend, theme, WordPress Core, credentials, users or real business content were changed. No commit, push, merge, acceptance or closure was performed.

## Pre-write backup gate

The governance hook required the hidden backup path to be workspace-absolute. The successful backup root was:

`/Users/arron/Storage/Personal/ObsidianWorkSpace/茂洋/独立站/.local/backups/TASK-004/20260723T011300Z`

Evidence:

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `database.sql` | 1,034,101 | `7d41c1edcb8df51fd59bd7dba9cde90e70cbe209e62bc2c43665ab837ac47f7b` |
| `plugins-before.json` | 223 | `caa14fee0c12af148d235f7fb18821182d2e288c652852f190dc41c6441f7f23` |
| `wordpress-version-before.txt` | 6 | `ee9b5bfa02e262be62fa5d3a1b68d15d452378b99ab7d6c2feabf5163ed1ac6a` |
| `plugins-after.json` | 460 | `0192a5ecf1f73d2815e1c96722147ac1f93ccbd7965b3204f1283b77514b5a9a` |

The plugin snapshot parsed as two inactive plugins: Akismet and Hello Dolly. `wp db check` passed all 12 tables. The SQL structural check found 135 statement boundaries, 12 create-table statements and 9 insert groups. Git ignore checks passed. No restore was run against the healthy database.

## SCF supply chain

Official sources accessed 2026-07-23:

- https://wordpress.org/plugins/secure-custom-fields/
- https://developer.wordpress.org/secure-custom-fields/
- https://developer.wordpress.org/secure-custom-fields/welcome/installation/
- https://github.com/WordPress/secure-custom-fields
- https://api.wordpress.org/plugins/info/1.2/?action=plugin_information&request%5Bslug%5D=secure-custom-fields
- https://downloads.wordpress.org/plugin/secure-custom-fields.6.9.2.zip

The official API reported version 6.9.2, WordPress requirement 6.2, tested WordPress 7.0.2 and PHP requirement 7.4. The downloaded main plugin header also reported 6.9.2 and WordPress.org as author. The package license is GPLv2 or later.

Package SHA-256:

`40f72fa0d1829c8be89e5f8902b4d5625a40ede91884e55c4e8c5b72fd1ed799`

ZIP integrity and official WordPress plugin checksums passed. The package `readme.txt` still says `Stable tag: 6.9.1`; this is an upstream metadata inconsistency because both the official API and executable plugin header say 6.9.2.

ACF, ACF Pro, WPGraphQL, WPML, ACFML and Polylang were absent before installation and remain absent.

## GDHE implementation

The authoritative files are version-controlled under `cms/wp-content/plugins/gdhe-site/`:

- `config/content-model.json` defines post types and taxonomies.
- `config/capabilities.json` defines administrator/editor capability grants.
- `config/field-groups.v1.json` is the rebuildable SCF field source.
- `config/schema.v1.json` defines the public schema discovery payload.
- `includes/rest.php` implements the minimal read-only REST boundary.

Public types: `service`, `industry`, `material`, `surface_finish`, `case_study`, `testimonial`.

Internal type: `site_settings`, with no Core REST route.

Taxonomies: `service_family`, `manufacturing_process`, `material_family`, `finish_family`.

Controlled modules: `hero`, `rich_text`, `card_grid`, `split_media`, `accordion`, `data_table`, `cta_banner`.

The public `gdhe` projection contains only `schema_version`, `template_key`, `summary`, `hero`, `relationships` and `modules`. GDHE response preparation removes the generic SCF `acf` container and Core `meta` container for these types, preventing `_acf_changed` or future unreviewed meta from bypassing the allowlist.

## Fixture lifecycle

The single fixture was post ID 6 with title `TASK-004 TEMPORARY ENGLISH SERVICE FIXTURE`.

- Created as `service` draft.
- Saved schema, template, summary, hero, relationship and two module values through the SCF API.
- Preview link was generated.
- Anonymous draft request returned `401 rest_forbidden`.
- Authenticated administrator draft request returned 200 with the six-key `gdhe` projection.
- Core revision and autosave records were created; the current title and SCF summary remained unchanged.
- Published anonymous REST returned 200.
- Real HTTP tests returned schema 1.0.0, locale `en`, six public types and an allowlisted published Service response.
- Fixture ID 6 was permanently deleted after exact-target verification; its revisions/autosave were removed. Final fixture count is zero.

## Validation summary

Passed:

- PHP lint for all six GDHE PHP files.
- JSON parsing for all six GDHE configuration files.
- WordPress Core checksums.
- Official SCF plugin checksums.
- Database integrity.
- CPT, taxonomy, capability, field-group and module registration.
- Internal and real HTTP REST smoke tests.
- Draft/publish authorization and response allowlists.
- Fixture cleanup.
- Secret-pattern and forbidden-plugin scans.
- Git diff whitespace check and ignored-runtime checks.
- Lane message validation, registry validation, strict lane audit and project governance validation.

See `TEST_OR_VALIDATION_LOG.md` for command-level results and corrected test-harness failures.

## Remaining boundaries

- The SQL structural check is not an isolated restore drill. Destructive restore was intentionally not run.
- Full DTO, route resolution, preview bridge, webhooks, cache invalidation, inquiries and deployment remain deferred.
- Only English is enabled. No alternate-language content, URL, switcher or hreflang was created.
- Planner must create ADR-005 and synchronize the accepted architecture contract from `PLANNER_SYNC_PROPOSAL.md`.
- Independent adversarial review is required before planner can prepare user acceptance.

## Round 1 revision addendum

Adversarial Review Round 1 reported two P1 gaps. The narrow revision upgraded `gdhe-site` to 0.1.1 and changed only the capability lifecycle and public reference projection.

- Deactivation now removes exactly the versioned administrator/editor capability matrix; reactivation reapplies it. Runtime counts proved administrator/editor 28/14 while active, 0/0 after deactivation and 28/14 after reactivation.
- Anonymous and all `view` contexts now remove relationship IDs unless the target is published on a publicly viewable post type. Media IDs require an image attachment with a public URL and a published publicly viewable parent. Authorized `context=edit` retains editorial references when the user can edit the parent.
- The six-key `gdhe` allowlist and generic `acf`/`meta` removal remain unchanged.
- A temporary English Round 1 fixture set covered published, draft, private and pending/withdrawn relations plus public/private-parent media. Internal and real HTTP tests passed; posts, attachments, postmeta and two revisions were deleted with zero residue.

Detailed revision evidence is in `REVISION_ROUND1_REPORT.md` and the Round 1 section of `TEST_OR_VALIDATION_LOG.md`.
