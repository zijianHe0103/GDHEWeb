# GDHE WordPress CMS

The English content contract remains Schema `3.0.0` on the read-only `/gdhe/v1` transport. TASK-014 adds an independent ProductCard collection contract at Schema `1.0.0`; TASK-019 keeps Product Configuration `1.0.0`, TASK-021 adds separate Product Configuration `2.0.0` behavior, and TASK-023 adds an independent RelatedProductCardCollection `1.0.0`. None changes the existing content envelope or ProductCard bytes. WordPress remains the editing system; Quote Basket and frontend consumption are outside this CMS slice.

## Current runtime

- WordPress `7.0.2`
- Secure Custom Fields `6.9.2`
- GDHE-owned `gdhe-site` `0.7.0`
- REST API version `1`
- Content Schema `3.0.0`
- Module Schema `1.0.0`
- ProductCard Schema `1.0.0`
- RelatedProductCardCollection Schema `1.0.0`
- Product Configuration Schemas `1.0.0` and `2.0.0`
- Locale `en`

The code-owned sources are `config/content-model.json`, `config/schema.v3.json`, `config/field-groups.v3.json`, `config/schemas/` and the plugin PHP files. The SCF UI is an editor surface, not the authority.

## Documents

- [Content model](CONTENT_MODEL.md)
- [REST contract](REST_CONTRACT.md)
- [Operations and rollback](OPERATIONS_AND_ROLLBACK.md)

The A3 model is aligned to the hierarchy and information responsibilities frozen in `TASKS/ARTIFACTS/TASK-007/FOREST_PRODUCT_MODEL_REVISION.md`. Forest names, models, copy and images are not GDHE content and were not copied. Verification uses removable synthetic GDHE-domain fixtures only.

ProductCard test candidates use a private versioned source document only in the local, removable Fixture lifecycle. This is not a long-term SCF editing surface and does not authorize production import or infer real GDHE product values.

Product Configuration uses the private mirror key `_gdhe_product_configuration_v1_source` and exposes only a complete validated public projection. The current removable test candidate contains exactly `FGD X15+PVC / GDHEPRD000172 / 6 m / Ivory White / piece`, ceiling and wall installation with no invented accessory Article Number, the frozen curtain-track packaging policy and unresolved custom-length policy. It is contract evidence, not a second editable product-master authority or production publication.

Product Configuration `2.0.0` uses an independent private test/production mirror and the same read-only endpoint with exact `schema=2.0.0`. Its public policy keeps packaging and unresolved custom length but omits installation methods, installation accessories and hidden installation defaults. The removable evidence still exposes only the confirmed `GDHEPRD000172 / 6 m / Ivory White / piece` option. Article Numbers are global, length/color choices are unique per stable Product UUID, and conflicting identity or color-label mappings fail closed. Version `1.0.0` remains byte-frozen.

WordPress exposes no QuoteLine, basket, session, inquiry storage or REST write route. QuoteLine remains a future Next.js inquiry-domain contract and must revalidate untrusted client input server-side when separately implemented.

ProductCard category, series and application references are accepted only when each source UUID equals the stable public UUID of the unique target resolved from its canonical path.

The reference role is also closed: primary category uses only the frozen curtain-track/accessory category families, series uses `/series/`, and applications uses `/applications/`. A valid UUID/path pair under another role fails closed.

The removable TASK-014 Fixture includes a real anonymous one-item ProductCard response and one valid card with non-empty identity-bound series and application references. These are contract evidence only, not production content.

TASK-023 reads the source Product's Schema 3 `relationships.products` mirror in stored order and returns one complete anonymous related-card collection with no pagination or per-card resolve request. It accepts at most 20 stored relations. Self, duplicate, unpublished, revoked, invalid ProductCard, hostile-media and incomplete direct-quote targets are omitted. A detail product carries `directQuote: null`; an active catalog accessory is eligible only when the independent private mirror explicitly supplies the closed `piece` quantity unit. The endpoint never guesses a unit or changes ProductCard `1.0.0`.

GraphQL, multilingual, preview, webhooks, cache invalidation, inquiry writes, real content import, frontend work and deployment remain deferred.
