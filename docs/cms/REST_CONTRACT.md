# Minimal REST contract

## Schema discovery

`GET /wp-json/gdhe/v1/schema` is anonymous, read-only and versioned. It returns:

- `schemaVersion: 1.0.0`
- default and enabled locale `en`
- six public post types
- four public taxonomies
- the field and controlled-module allowlists
- explicit markers showing that full page DTOs, route resolution and preview bridging are deferred

The endpoint contains no users, credentials, plugin configuration or internal settings.

## Public content projection

The Core REST item endpoints for the six public GDHE types contain a `gdhe` object with exactly these keys:

- `schema_version`
- `template_key`
- `summary`
- `hero`
- `relationships`
- `modules`

SCF's generic `acf` container and Core's `meta` container are removed from responses for these GDHE types. This prevents `_acf_changed` and unreviewed future meta registrations from bypassing the explicit projection.

Reference visibility fails closed for anonymous and all `view` contexts:

- Relationship IDs remain only when the referenced post is `publish` and its post type is publicly viewable.
- Draft, private, pending/withdrawn, deleted and internal references are removed.
- Image attachment IDs remain only when the attachment is an image with a public URL and is attached to a published, publicly viewable parent.
- Unattached images and images attached to draft/private/non-public parents are returned as `null`.

An authenticated request using `context=edit` retains editorial references only when the current user can edit the parent content item. This is an editing boundary, not an anonymous DTO guarantee.

Draft authorization remains Core REST's responsibility. The fixtures proved an anonymous draft request returns `401 rest_forbidden`, an administrator receives `200`, and an anonymous published request receives `200`. Round 1 additionally proved that a published parent exposed only its published relationship and public media to anonymous/`view` requests while authorized `edit` retained published, draft, private and pending references plus public/non-public editorial media.

## Deferred boundaries

This endpoint is not the final frontend DTO. The following remain separate tasks:

- route resolution and route manifest
- collection endpoints and navigation
- preview bridge and signed preview authentication
- webhook and cache invalidation
- inquiry/upload APIs
- multilingual URLs, switching and hreflang
