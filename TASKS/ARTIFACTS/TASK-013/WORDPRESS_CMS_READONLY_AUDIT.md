# TASK-013 WordPress/CMS read-only audit

audit_status: `PASS_WITH_REQUIRED_FOLLOW_UP_CONTRACTS`
task: `TASK-013`
lane: `wordpress_cms`
message: `MSG-TASK-013-A2-WORDPRESS-CMS-READONLY-AUDIT`
audited_at: `2026-07-29T07:49:56Z`
mutation_status: `NONE`

## 1. Conclusion

The current WordPress/CMS foundation can directly express an English published detail-page vertical slice through `/gdhe/v1/resolve`: stable UUIDv4 identity, one canonical public path, closed type/template pairing, product taxonomy slugs, structured product details, controlled modules, public media, relations and current download metadata are already present.

It cannot directly satisfy all TASK-013 public contracts:

- the product collection item is only `{id, type, title, publicPath}` and is not a normalized product-card projection;
- product CTA is an optional generic link, not a typed quotation/discontinued/replacement state;
- no dedicated `SeoDocument` fields exist;
- series/application/accessory discovery is not fully represented by current collection filters or routes;
- navigation Schema allows hierarchy, but current runtime emits only top-level items with empty children;
- route lifecycle has no redirect, former path, withdrawal, `410`, discontinued or replacement semantics;
- Feishu publication eligibility, Article Number uniqueness, current/superseded document lifecycle and internal/public ownership are confirmed business rules but are not implemented CMS/API fields or enforcement.

Therefore:

1. TASK-013 can freeze the IA, URL, CTA, product-card and SEO target contracts as documentation.
2. A TASK-014 product detail resolved from a known canonical path is technically feasible with the existing `/resolve` envelope.
3. A live list/category/series/application experience must not use per-card `/resolve`; it requires a separately authorized collection projection revision first.
4. No current test record or empty runtime proves the 10–20 final production-product gate.

## 2. Authority and evidence reviewed

- `TASKS/ACTIVE/TASK-013-english-ia-url-cta-card-seo-contract.md`
- `TASKS/ARTIFACTS/TASK-013/DESIGN.md`
- `TASKS/ARCHIVE/TASK-013-english-ia-url-cta-card-seo-contract.md`
- `MEMORY/DECISIONS/ADR-006-product-first-roadmap-and-multilingual-maturity-gate.md`
- `docs/architecture/headless-wordpress-nextjs-contract.md`, section 14
- `TASKS/ARTIFACTS/TASK-012/REAL_PRODUCT_VALIDATION_GATE.md`
- `docs/cms/CONTENT_MODEL.md`
- `docs/cms/REST_CONTRACT.md`
- `cms/wp-content/plugins/gdhe-site/config/content-model.json`
- `cms/wp-content/plugins/gdhe-site/config/schema.v3.json`
- `cms/wp-content/plugins/gdhe-site/config/field-groups.v3.json`
- `cms/wp-content/plugins/gdhe-site/config/schemas/**`
- `cms/wp-content/plugins/gdhe-site/includes/public-api.php`
- `cms/wp-content/plugins/gdhe-site/includes/public-details.php`
- `cms/wp-content/plugins/gdhe-site/includes/rest.php`
- current local WordPress runtime through WP-CLI read-only commands

## 3. Current runtime facts

| Check | Current fact |
|---|---|
| WordPress | `7.0.2` |
| SCF | `6.9.2`, active |
| GDHE Site | `0.4.2`, active |
| REST API | `1` |
| Content Schema | `3.0.0` |
| Module Schema | `1.0.0` |
| Database | 12 tables checked `OK` |
| Business content | product/market/reference/support/download/site_settings all `0` |
| Product taxonomies | product_category/product_series/installation_type all `0` |
| Other contract taxonomies | support_topic/document_type both `0` |
| Existing native content | one published default Post, one published default Page, one draft Page; none has Schema/template/public UUID/path meta and none is GDHE-contract eligible |
| A3 Fixture manifest | option absent |
| Runtime product collection | `total: 0`, `items: []` |
| Runtime navigation | `items: []` |
| Runtime route manifest | `routes: []` |

The empty runtime is a clean technical baseline, not product-data validation or publication authorization.

## 4. Direct expressibility matrix

| TASK-013 concern | Directly expressible now | Current authority/evidence | Boundary |
|---|---|---|---|
| Native landing/company/contact pages | Yes | native `page`, explicit `_gdhe_public_path`, `standard` template | No dedicated semantic page subtype |
| News/editorial | Yes | native `post`, `/news/{slug}/` | Not part of collection card specialization |
| Product detail | Yes | `product`, `/products/{slug}/`, `product` template | Requires complete Schema 3 envelope |
| Market/application editorial page | Yes | `market`, `/markets/{slug}/`, relations to products | Product collection cannot filter by market relation |
| Reference/case page | Yes | `reference`, `/references/{slug}/` | Current relation is a basic content reference |
| Support article | Yes | `/support/{one-topic}/{slug}/` | Exactly one `support_topic` required |
| Download detail/file | Yes | `/downloads/{slug}/`, document type/version/date/locale/file | No explicit current/superseded/replacement state |
| Product category membership | Yes | `product_category` slugs in product details; collection filter supported | No category landing identity or taxonomy route DTO |
| Product series membership | Partly | `product_series` slugs in product details | No collection filter or series landing route DTO |
| Installation type | Partly | `installation_type` slugs in product details | No collection filter or dedicated landing route |
| Multiple application/market entries to one product | Partly | product↔market relations preserve one product UUID/path | No product-by-market collection query |
| Stable product route identity | Yes | UUIDv4 `id`, type, validated `publicPath`; duplicate path fails closed | No historical path/redirect/withdrawal state |
| Structured product detail | Yes | model, product code, features, specifications, Article Numbers, finishes, installation, control, compatibility, gallery, HTTPS video, CTA | Current Article Number row is only `number + region`; no configuration identity or quoteability |
| Controlled modular authoring | Yes | seven module types, at most 20 modules | Not a free page builder |
| Product-card projection | No | collection item is `content-reference` only | Requires a follow-up Schema/API contract |
| CTA state | Partly | generic public link and optional `inquiryCta` | No typed state or label/target enforcement |
| Publication eligibility | Partly | WordPress `publish` + Schema/UUID/path/template/module/details checks | Feishu allow-publish, unique Article Number, availability and last-success mirror are absent |
| Media/Alt | Partly | media UUID, URL, MIME, dimensions, Alt, caption, decorative; gallery/featured media | No protected-media provenance flag; collection cards receive no media |
| Minimum SEO input | Partly | title, optional excerpt, publicPath, type/template, timestamps, featured-media Alt | No `SeoDocument`, robots, canonical-origin/override, OG policy, Breadcrumb labels or JSON-LD policy fields |

## 5. Existing route and IA contract

### 5.1 Stable identity and canonical path

The current public type set is native `page`/`post` plus `product`, `market`, `reference`, `support_article` and `download`. `site_settings` stays internal (`config/schema.v3.json:5-12`; `includes/public-api.php:123-135`).

Current route shapes are machine-derived as follows (`includes/public-api.php:137-190`):

- Page: explicit path if stored, otherwise `/{slug}/`;
- Post: `/news/{slug}/`;
- Product: `/products/{slug}/`;
- Market: `/markets/{slug}/`;
- Reference: `/references/{slug}/`;
- Support: `/support/{support-topic}/{slug}/`, exactly one topic;
- Download: `/downloads/{slug}/`.

Paths are lowercase ASCII slug segments, slash-terminated, at most 500 bytes; double slashes, dot segments and percent-encoded paths fail closed. `/resolve` detects duplicate paths and returns `gdhe_route_conflict`. The route manifest contains only stable UUID, type, public path and modified time (`route-manifest.schema.json:6-27`).

This is sufficient to freeze “one product identity, one canonical detail path”. Taxonomy or market discovery can link to that path without duplicating the product UUID or Article Number.

### 5.2 Missing discovery identities

The current contract does not define:

- product-category landing DTO/path;
- product-series landing DTO/path;
- installation/application filtered collection route;
- accessory catalogue item that is independently quotable but intentionally has no SEO detail page;
- former path, redirect target, withdrawal state or `410` lifecycle.

A curated native Page can represent a hub, but it does not create a typed taxonomy/series/application collection contract by itself.

### 5.3 Navigation

`navigation.schema.json` permits up to three levels (`navigation.schema.json:13-42`). Runtime selection is curated through `_gdhe_navigation_item`, but every emitted item currently receives `children: []` (`includes/public-api.php:511-549`). Thus flat curated navigation is directly expressible; real parent/child IA is not yet emitted even though the Schema can validate it.

## 6. Product card and collection boundary

The collection endpoint correctly uses one full eligible set before pagination and invariant `total` calculation (`includes/public-api.php:404-429`, `432-508`). Product collection filtering currently supports only `product_category`; `product_series`, `installation_type` and product↔market relations are not allowed filters (`includes/public-api.php:395-401`).

The machine collection Schema fixes each item to `content-reference.schema.json` (`collection.v3.schema.json:6-19`). That reference contains only:

- UUIDv4 `id`;
- `type`;
- `title`;
- `publicPath`.

It explicitly rejects extra fields (`content-reference.schema.json:6-13`).

The TASK-013 normalized product card needs at least model, English name, public protected image, category/series context, short description or selected attributes, availability/CTA state and target URL. These cannot be added by the current collection response. Fetching `/resolve` once per card would violate the frozen no-N+1 boundary.

Required follow-up:

- introduce a versioned product-card projection Schema;
- make product collection items use that projection;
- preserve existing full-envelope eligibility, canonical-route uniqueness, deterministic sort, invariant totals and pagination;
- add only evidence-approved filters such as series/application when their business route contract is frozen;
- keep WordPress IDs, raw SCF, internal fields and non-whitelisted source fields absent.

## 7. CTA and product-state boundary

Current authoring provides generic link fields for Hero, module CTA and `product_details.inquiry_cta` (`field-groups.v3.json:45-57`, `75-109`). The machine link contract only validates `title`, URL and target. It does not enforce business semantics.

Directly expressible today:

- a public internal or external link;
- an optional product inquiry link;
- a visible label such as `Request a Quote`, if an editor enters it.

Not directly expressible or enforced:

- normalized states such as `AVAILABLE`, `DISCONTINUED_WITH_REPLACEMENT`, `DISCONTINUED_NO_REPLACEMENT`, `NO_PUBLIC_QUOTABLE_CONFIGURATION`, `UNPUBLISHED_TARGET`;
- fixed `Request a Quote` versus `Contact Us for Replacement` selection;
- replacement product identity;
- quote-list action versus direct form submission;
- selected Article Number/configuration/quantity payload;
- relation-target publication eligibility.

These are follow-up product-state/API fields, not values to infer from a generic link title.

## 8. Publication eligibility and fail-closed behavior

The full envelope currently requires:

- WordPress status `publish`;
- allowed public type;
- SCF available;
- Schema `3.0.0`;
- UUIDv4 public ID;
- valid canonical public path;
- exact type/template pairing;
- valid controlled modules;
- type-specific details (`includes/public-api.php:274-334`).

Collection candidates reuse this complete envelope and require unique canonical paths before becoming items or contributing to `total` (`includes/public-api.php:404-429`). Navigation and route manifest also exclude envelopes that fail the contract (`includes/public-api.php:511-590`).

Two exact limitations remain:

1. TASK-012 publication rules are not implemented: no Feishu `allow publish`, Article Number global-uniqueness proof, last-success mirror state, major-change review, discontinued state or replacement eligibility exists in the current CMS/API.
2. Relation normalization uses published/viewable status, UUID and public path, but does not call the target’s full envelope or route-uniqueness check (`includes/public-api.php:234-271`). A follow-up must align relation-target eligibility with resolve/collection eligibility before relations drive public product/accessory cards.

No current runtime content exercises these gaps; the audit does not infer a pass from an empty dataset.

## 9. Media and document inputs

Current media reference fields are UUIDv4, URL, image MIME type, width, height, Alt, optional caption and `decorative` (`media-reference.schema.json:6-18`). Product details support featured media, gallery and HTTPS-only video. This can directly express:

- a business-prepared public protected image;
- accessible Alt or explicitly decorative media;
- stable media identity without WordPress attachment IDs;
- product gallery and video;
- current public download file metadata.

It cannot enforce that an image is a `公开保护图`, record its publication authorization/provenance, or prove that an internal original never entered Media Library. That boundary remains an ingestion/editorial allowlist gate unless a later task explicitly authorizes machine metadata.

The collection item does not include media, so card media is unavailable without the product-card projection revision.

Download details can express type, version, date, English locale, file and description, but do not encode `current`, `superseded`, replacement file or withdrawal state. The current business rule can be maintained operationally by publishing only the current Download, but machine lifecycle enforcement requires a separate contract.

## 10. SEO input boundary

Currently available inputs are:

- title;
- optional excerpt;
- canonical public path;
- type/template;
- published/modified timestamps;
- featured media with Alt/caption;
- product categories/series/installations;
- structured product details and public relations.

These are useful source inputs, but there is no dedicated CMS `SeoDocument`. In particular, the current Schema/API has no:

- SEO title or meta description authority distinct from page title/excerpt;
- canonical path override or production canonical origin;
- robots index/follow policy;
- Open Graph title/description/image selection;
- Breadcrumb labels/parents;
- allowed JSON-LD type and field policy;
- discontinued/no-quote/noindex state;
- redirect/404/410 SEO lifecycle.

TASK-013 should freeze ownership and fallback behavior without pretending these fields already exist. A later separately authorized contract may either:

1. add a normalized `SeoDocument` to the GDHE API; or
2. explicitly freeze which existing fields the frontend derives into SEO output, with no hidden WordPress/SCF reads.

The production origin is still unknown and must not be stored as a guessed canonical URL.

## 11. Public-field whitelist

The custom GDHE envelope is closed by `additionalProperties: false`. Its top-level public surface is:

- API/schema version;
- UUIDv4 identity;
- type/template/locale/public path;
- title and optional excerpt;
- published/modified timestamps;
- optional featured media;
- controlled modules;
- five relation groups;
- type-specific details.

Product details are limited to model, product code, taxonomy slugs, positioning, features, specifications, Article Numbers, finishes, installation/control/compatibility, gallery, HTTPS video and inquiry CTA (`page.v3.schema.json:80-130`). No WordPress post/attachment/term database ID is allowed.

The standard WordPress REST `gdhe` field also uses an explicit code allowlist for Schema, template, summary, Hero, relationships, modules and type-specific details (`includes/rest.php:28-64`), and removes raw `acf` and `meta` from public responses.

TASK-012’s business whitelist remains narrower in authority and broader in future data meaning: only approved product name/model/Article Number/real options/specifications/dimensions/colors/finishes/technical parameters/installation/compatibility/status/public images/current documents may become public after all record gates pass. Costs, purchase price, margin, supplier, inventory, customer pricing, internal notes and business review records must never enter WordPress, the GDHE API, Next.js, cache or logs.

This audit does not authorize adding future Feishu fields to the technical allowlist.

## 12. Preserved 19/16 scope distinction

Fresh recursive local `$ref` traversal produced:

- CMS authority graph: **19 files**, rooted at page, collection, navigation, route-manifest and error;
- frontend `/resolve` closure: **16 files**, rooted at page and error;
- CMS-only: exactly `collection.v3.schema.json`, `navigation.schema.json`, `route-manifest.schema.json`;
- frontend-only: none.

The current frontend contract verifier independently returned:

```text
CMS contract snapshot PASS: 16 schemas, 2 success samples, 2 error samples
```

The difference is intentional consumer scope. It does not authorize silently copying collection/navigation/route-manifest into the frontend `/resolve` validator. Any product-card collection consumer requires an explicit follow-up snapshot/validator/adapter task.

## 13. Exact follow-up gates

### Can enter TASK-014 without CMS mutation

- one or more known English product canonical paths;
- server-only `/resolve`;
- full Schema 3 product envelope;
- controlled product modules and type details;
- stable UUID/path with no WordPress database identifiers;
- media Alt and HTTPS video;
- test candidates explicitly marked non-production.

This supports a narrow product-detail vertical slice only. It does not solve live product discovery or production data readiness.

### Requires user/Planner contract confirmation

- final public IA labels and category/series/application route names;
- whether category/series/application landings are native Pages or dedicated typed route projections;
- exact product-card field/fallback order;
- SEO fallback ownership and canonical origin;
- which TASK-012 test candidates may appear in a local TASK-014 slice;
- final production product records and publication authorization.

### Requires a separate Schema/API task

1. normalized product-card collection projection, without N+1;
2. series/application filters and any typed landing projection;
3. typed product availability/quoteability/discontinued/replacement state;
4. Article Number + full public configuration identity for quotation selection;
5. relation-target complete eligibility and canonical uniqueness;
6. normalized SEO document or an explicitly frozen derivation contract;
7. redirect/former-path/withdrawal/`410` lifecycle if owned by CMS;
8. current/superseded download lifecycle if machine enforcement is required;
9. hierarchical navigation production if the current flat runtime is insufficient.

### Must wait for the final production-data gate

- bulk import or publication;
- business freeze of product templates or Schema;
- claims that real product IA and filters are validated;
- Article Number uniqueness and real configuration coverage;
- final product media, documents, discontinued/replacement examples and source authorization.

## 14. Scope and mutation proof

This audit:

- did not modify `cms/**`, WordPress, SCF, Schema, API, database, content, plugins or configuration;
- did not modify `frontend/**`, authority documents, active task or Planner files;
- did not connect to Feishu or external systems;
- did not import, publish, review, accept, commit, push, merge or deploy.

Only this artifact and `LANES/wordpress_cms/worklog.md` are intended write outputs.
