# GDHE WordPress CMS foundation

TASK-004 establishes the English-only CMS foundation. WordPress remains the editing system and the public Next.js site remains a separate consumer.

## Runtime components

- WordPress 7.0.2
- Secure Custom Fields 6.9.2 from the official WordPress.org package
- `gdhe-site` 0.1.1, owned by GDHE
- Schema version `1.0.0`
- Enabled locale: `en` only

SCF supplies the field runtime and editor controls. GDHE content types, taxonomies, capabilities, field groups and public REST projection are defined in version-controlled `gdhe-site` files. Do not recreate these definitions only in the SCF user interface.

## Documents

- [Content model](CONTENT_MODEL.md)
- [REST contract](REST_CONTRACT.md)
- [Operations and rollback](OPERATIONS_AND_ROLLBACK.md)

WPML, ACFML, Polylang, ACF, ACF Pro and WPGraphQL are not part of this foundation. Additional languages, full page DTOs, route resolution, preview bridging, webhooks and cache invalidation remain deferred.
