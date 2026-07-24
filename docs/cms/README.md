# GDHE WordPress CMS

TASK-007 A3 advances the English content contract to Schema `3.0.0` while retaining the read-only `/gdhe/v1` transport. WordPress remains the editing system; the frontend remains a separate consumer and was not changed in A3.

## Current runtime

- WordPress `7.0.2`
- Secure Custom Fields `6.9.2`
- GDHE-owned `gdhe-site` `0.4.2`
- REST API version `1`
- Content Schema `3.0.0`
- Module Schema `1.0.0`
- Locale `en`

The code-owned sources are `config/content-model.json`, `config/schema.v3.json`, `config/field-groups.v3.json`, `config/schemas/` and the plugin PHP files. The SCF UI is an editor surface, not the authority.

## Documents

- [Content model](CONTENT_MODEL.md)
- [REST contract](REST_CONTRACT.md)
- [Operations and rollback](OPERATIONS_AND_ROLLBACK.md)

The A3 model is aligned to the hierarchy and information responsibilities frozen in `TASKS/ARTIFACTS/TASK-007/FOREST_PRODUCT_MODEL_REVISION.md`. Forest names, models, copy and images are not GDHE content and were not copied. Verification uses removable synthetic GDHE-domain fixtures only.

GraphQL, multilingual, preview, webhooks, cache invalidation, inquiries, real content import, frontend work and deployment remain deferred.
