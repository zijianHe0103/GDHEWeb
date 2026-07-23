# CMS content model

Schema version: `1.0.0`

## Post types

| Type | Public | Core REST | Purpose |
| --- | --- | --- | --- |
| `service` | yes | `services` | Manufacturing service pages |
| `industry` | yes | `industries` | Industry pages |
| `material` | yes | `materials` | Material pages |
| `surface_finish` | yes | `surface-finishes` | Surface-finish pages |
| `case_study` | yes | `case-studies` | Case studies |
| `testimonial` | yes | `testimonials` | Testimonials |
| `site_settings` | no | disabled | Internal settings records |

Native `post` and `page` remain available. All GDHE types support revisions and custom fields. The six public types share the `gdhe_content` capability family. Administrators and editors can manage public GDHE content; only administrators receive the internal `gdhe_setting` capabilities.

The capability matrix is also the lifecycle boundary. Plugin activation applies exactly the administrator/editor capabilities in `config/capabilities.json`; plugin deactivation removes exactly that matrix. Round 1 validation proved counts of 28/14 while active, 0/0 after deactivation and 28/14 after reactivation. No user record is changed.

## Taxonomies

- `service_family` applies to services.
- `manufacturing_process` applies to services, materials, surface finishes and case studies.
- `material_family` applies to materials.
- `finish_family` applies to surface finishes.

All four taxonomies are hierarchical, public and enabled in Core REST.

## Versioned fields

`config/field-groups.v1.json` is the rebuildable source for SCF local field groups. The main content group defines:

- `schema_version`
- `template_key`
- `summary`
- `hero`, including primary/secondary CTAs and a media reference
- `relationships`
- `modules`

The only module layout names in schema v1 are:

- `hero`
- `rich_text`
- `card_grid`
- `split_media`
- `accordion`
- `data_table`
- `cta_banner`

Changing a field name, field key, module name or public shape after consumption requires a new schema version plus migration and rollback instructions. The SCF UI may be used to inspect the generated groups, but it is not the authoritative definition.

## Publication rules

- English (`en`) is the only enabled locale.
- Drafts remain visible only to authorized editors.
- Anonymous Core REST requests can read published public types only.
- `site_settings` has no public route.
- Temporary fixtures must carry an explicit TASK marker and be deleted with their revisions after validation.
