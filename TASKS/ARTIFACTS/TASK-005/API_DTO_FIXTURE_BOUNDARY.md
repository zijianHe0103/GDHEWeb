# TASK-005 WordPress/API DTO/Fixture boundary

Date: 2026-07-23
Lane: `wordpress_cms`
Scope: future English-only API/DTO/Fixture implementation task
Result: boundary definition only; no WordPress, database, plugin, content, frontend, or external-state change

## 1. Decision

Create one future implementation task, referred to here as **Task A**, owned by the WordPress/GDHE plugin side. Task A must turn the accepted TASK-004 English CMS foundation into a stable, versioned, public read contract and prove that contract with disposable fixtures and automated tests.

Task A is not a frontend task. It must finish and pass independent review before the future Next.js integration task, **Task B**, formally consumes the DTO.

The dependency is one-way:

`WordPress and SCF raw values` → `gdhe-site normalization and visibility policy` → `versioned public DTO` → `Task B server-only adapter`

WordPress Core, SCF field arrays, Core REST response shapes, post meta, and database layout must not become frontend contracts.

## 2. Verified starting state versus future work

### 2.1 Verified TASK-004 state

The following are completed TASK-004 facts and are inputs to Task A:

- WordPress 7.0.2, SCF 6.9.2, and GDHE Site 0.1.1 were independently verified.
- Schema 1.0.0 enables only locale `en`.
- Six public GDHE CPTs and four public taxonomies are registered; internal `site_settings` has no public Core REST route.
- Seven controlled module layout names are frozen: `hero`, `rich_text`, `card_grid`, `split_media`, `accordion`, `data_table`, and `cta_banner`.
- `GET /wp-json/gdhe/v1/schema` is implemented as anonymous read-only schema discovery.
- The six public CPT Core REST item responses have a six-key `gdhe` allowlist. Generic `acf` and `meta` containers are removed.
- Anonymous and `view` responses fail closed for unpublished or non-public relationship/media references; authorized `edit` context can retain editorial references.
- TASK-004 temporary fixtures, revisions, attachments, and postmeta were cleaned to zero residue.
- TASK-004 final independent review passed with P0/P1/P2 all zero.

These facts do **not** mean that a page DTO, route resolver, collection API, navigation API, module ID/version, structured table, or frontend contract already exists.

### 2.2 Work that remains for Task A

Task A must implement and verify:

- the final English public page DTO and its machine-readable schema;
- stable module instance IDs and per-module schema versions;
- structured `data_table` authoring, migration, normalization, and validation;
- the minimum route resolution, collection, navigation, and route-manifest read endpoints;
- four representative disposable page fixtures;
- positive and negative publication/reference cases;
- REST contract tests, compatibility rules, migration/rollback evidence, benchmark evidence, and fixture cleanup proof.

Preview, webhook, cache invalidation, multilingual behavior, SEO output, inquiry/upload, deployment, and frontend rendering remain outside Task A.

## 3. Ownership and source-of-truth boundary

### 3.1 WordPress/GDHE plugin owns

- Mapping WordPress post types, Core fields, taxonomies, SCF fields, modules, relationships, and media to public DTOs.
- Public route resolution and canonical English paths.
- Publication visibility and reference filtering.
- DTO JSON Schemas, endpoint schemas, version negotiation, compatibility, and error envelopes.
- Stable module instance identity and module schema versions.
- Structured table storage and migration from the TASK-004 textarea placeholder.
- Fixture creation scripts, contract tests, cleanup scripts, and zero-residue verification.

Versioned configuration and code in `gdhe-site` remain the implementation source. The SCF UI may display generated fields but must not become an unreviewed database-only source.

### 3.2 Task B owns later

- A server-only HTTP client and adapter that consume Task A outputs.
- TypeScript discriminated unions derived from or checked against the frozen DTO schemas.
- Runtime validation at the CMS boundary.
- Next.js routing, rendering, `notFound`, error, timeout, request deduplication, and cache behavior.

Task B must not re-normalize raw SCF/Core REST fields or infer module identity, routes, visibility, or table structure.

## 4. DTO and version model

### 4.1 Public envelope

Task A must freeze a JSON Schema for an English `ContentEnvelope`. At minimum it must define:

- `apiVersion`: the public API contract major, initially `1`;
- `schemaVersion`: the complete page DTO schema version;
- `id`: WordPress object ID, retained as an origin reference rather than a route identity;
- `type`: a closed enum for the currently supported public content types;
- `templateKey`;
- `locale`: exactly `en` in this task;
- `publicPath`: the unique canonical English path;
- `title`, optional excerpt, publication timestamp, and modification timestamp;
- normalized media references;
- `modules`: an ordered list of versioned module instances;
- normalized public relationships;
- optional translations/SEO fields only if their Task A shapes are deliberately nullable or omitted; no invented multilingual or SEO implementation;
- response metadata needed for `ETag`/`Last-Modified` and request tracing.

The architecture document's existing TypeScript block is illustrative, not an implemented or automatically accepted schema. Task A must resolve any gap between that example and the English-only implementation before publishing its final schema.

### 4.2 Compatibility policy

- `/gdhe/v1` must remain backward-compatible.
- Additive optional fields, new enum members that existing consumers are explicitly required to reject safely, and clarified validation may use a compatible `schemaVersion` increment.
- Removing or renaming a field, changing its type/meaning, changing a required field, or changing route/error semantics is breaking and requires `/gdhe/v2` or an equivalent separately confirmed major-version plan.
- Each schema change must include a compatibility classification, migration steps, rollback steps, affected fixture updates, and consumer handoff notes.
- The endpoint implementation and every golden fixture must declare the same supported `apiVersion` and compatible `schemaVersion`.
- Unknown required page or module schema versions must fail closed with a typed contract error; they must not be silently coerced.

## 5. Stable module identity and per-module version

Every normalized module must expose:

```json
{
  "id": "immutable-instance-identifier",
  "type": "rich_text",
  "schemaVersion": "1.0.0",
  "data": {}
}
```

Task A must satisfy all of these gates:

- `id` is generated once, persisted in WordPress, and remains stable when modules are reordered or unrelated modules are inserted/deleted.
- Identity is not an array index, rendered position, content hash, title, or slug.
- Copying/duplicating a module must create a new ID; editing an existing module must preserve its ID.
- The identifier format is documented and validated. UUID v4 is the default candidate, but the implementation task may choose another opaque collision-resistant format if it records the rationale and tests uniqueness.
- `schemaVersion` belongs to the module instance shape, not only the page envelope.
- `type` is one of the seven frozen TASK-004 module names.
- Each module type has an explicit JSON Schema for `data`, including required fields, maximum sizes, normalized links/media, and additional-property policy.
- Duplicate/missing/malformed IDs, unknown types, and unsupported versions fail validation before publication to the public DTO.
- Schema migration and rollback prove that existing module order and IDs survive round trips.

Frontend code must key rendered modules by `id`, discriminate on `type`, and reject unsupported `schemaVersion`; it must never manufacture these values.

## 6. Structured `data_table` gate

TASK-004 currently stores `data_table.table_data` as one textarea using line and vertical-bar delimiters. This is an editing placeholder, not a consumable public table contract.

Before any Task B consumption, Task A must replace it with structured authoring and normalization. The public DTO should contain, at minimum:

```json
{
  "caption": "Material tolerances",
  "columns": [
    {"key": "grade", "label": "Grade"},
    {"key": "tolerance", "label": "Tolerance"}
  ],
  "rows": [
    {"id": "row-opaque-id", "cells": {"grade": "6061", "tolerance": "±0.05 mm"}}
  ]
}
```

The final implementation may refine this shape, but must freeze and test:

- at least one and a bounded maximum number of columns;
- stable, unique column keys independent of display labels;
- non-empty human-readable labels;
- each row containing exactly the declared column keys;
- stable row identity if rows will be reordered or referenced;
- scalar cell values only unless a specific richer cell union is explicitly designed;
- bounded row count and cell length;
- no executable HTML, script, arbitrary CSS/class names, shortcodes, or component paths;
- accessible caption semantics and deterministic column order;
- rejection of duplicate keys, missing/extra cells, empty required values, oversized input, malformed legacy delimiters, and unsupported nested values.

Migration requirements:

1. Back up the database and plugin/config state under a separately authorized future task scope.
2. Parse existing textarea values only when they unambiguously satisfy the documented legacy delimiter grammar.
3. Produce a dry-run report listing every convertible, empty, and ambiguous record without changing content.
4. Require explicit handling for ambiguous rows; do not guess around embedded vertical bars or uneven column counts.
5. Persist the structured field shape and an upgraded module schema version.
6. Prove idempotent migration, rollback, and stable module IDs.
7. Verify no public DTO exposes the legacy free-text value after the compatibility window.

The four representative fixtures must include at least one valid structured table and the negative table cases.

## 7. Minimum endpoint set

Task A must prefer a small resource-oriented REST surface. It must not add template-specific endpoints for speculative frontend convenience.

| Endpoint | Task A purpose | Minimum public behavior |
|---|---|---|
| `GET /wp-json/gdhe/v1/schema` | Existing discovery endpoint, extended only as needed | Advertise supported API/page/module schema versions and endpoint capabilities without secrets |
| `GET /wp-json/gdhe/v1/resolve?locale=en&path=...` | Resolve one canonical English public path | Return one normalized `ContentEnvelope`; return real 404 for missing/unpublished content |
| `GET /wp-json/gdhe/v1/collection/{type}?locale=en&page=...&per_page=...&filters=...` | Stable listings for confirmed public types | Allowlisted type/filter/sort values, deterministic order, bounded pagination, normalized summaries/references |
| `GET /wp-json/gdhe/v1/navigation?locale=en` | Header/Mega Menu/Footer input | Published, public, normalized navigation only; no internal settings record or raw SCF shape |
| `GET /wp-json/gdhe/v1/route-manifest?locale=en` | Build/sitemap and route completeness input | Canonical published paths with type, origin ID, and modified time; no drafts/private paths |

Rules:

- `locale` accepts only `en` in Task A. Any other locale is a validation error, not a silent English fallback.
- `path` must be normalized and bounded; duplicate or conflicting canonical routes fail closed.
- Collection types, filters, sort fields, page sizes, and embedded references are explicit allowlists.
- Navigation may read internal settings through privileged server-side plugin logic, but its anonymous response exposes only the normalized public projection.
- Core REST may remain available for WordPress administration and simple verified resources. Task B's page rendering contract is the GDHE normalized API, not raw Core REST.
- Preview endpoints are excluded. No Task A anonymous endpoint may return draft, private, revision, internal setting, user, credential, or plugin configuration data.
- No GraphQL endpoint or plugin is added unless the quantitative PoC gate in section 13 is triggered and a new task/ADR authorizes it.

## 8. Four representative fixtures

Task A must create disposable, deterministic, English-only fixtures:

1. **Home page**: native `page`, canonical `/`, navigation participation, multiple module types, at least one valid `data_table`, media, CTA, and a public relationship.
2. **Service detail**: `service`, canonical `/services/{slug}/`, service taxonomy terms, relationships, media, and representative modules.
3. **Case Study detail**: `case_study`, canonical `/case-studies/{slug}/`, relationships to at least Service and Material, media, and editorial modules.
4. **Material detail**: `material`, canonical `/materials/{slug}/`, taxonomy/filter coverage and the structured specification table.

Fixture rules:

- Use a unique task marker in title, slug, and fixture manifest.
- Declare exact expected IDs/paths after creation; tests must not select arbitrary existing business content.
- Do not reuse or mutate real business content.
- Include only licensed/synthetic temporary media and remove its files during cleanup.
- Record initial counts, created object IDs, revisions, postmeta, taxonomy relationships, attachments, and final zero-residue queries.
- Tests must run against a disposable database/site or a separately backed-up local environment authorized by the future task.

## 9. Positive and negative contract matrix

At minimum, automated tests must cover:

### 9.1 Positive cases

- Anonymous published resolve for all four fixtures returns 200 and validates against the frozen envelope and module schemas.
- Published collection results include only eligible fixture records with stable pagination/order.
- Navigation and route manifest contain expected canonical published paths only.
- Public relationships/media are normalized and remain valid after module reorder.
- Authorized edit behavior remains available through the appropriate editorial/Core boundary without weakening anonymous output.
- Conditional requests prove `ETag` or `Last-Modified` behavior where implemented.

### 9.2 Publication and route negatives

- Draft, private, pending/withdrawn, trashed/deleted, and nonexistent content are absent from anonymous resolve, collections, navigation, and route manifest.
- An anonymous request for an unpublished path returns a real 404, not 200, redirect-to-home, or an empty success envelope.
- Duplicate canonical paths or conflicting route ownership fail closed and generate a traceable governance/error record.
- Invalid locale, malformed/oversized path, disallowed collection type/filter/sort, invalid pagination, and unsupported schema version produce stable 400-class errors.

### 9.3 Reference and schema negatives

- Draft/private/non-public/deleted relationships are omitted or reject publication according to the frozen field rule; behavior is consistent across every endpoint.
- Missing, non-image, unattached, or non-public-parent media fail closed.
- Missing/duplicate module IDs, unknown module types, unsupported module versions, and invalid required module data fail contract validation.
- Invalid `data_table` column keys, duplicate columns, uneven rows, missing/extra cells, oversized values, and ambiguous legacy values fail migration/publication validation.
- Generic `acf`, `meta`, internal settings, users, credentials, plugin configuration, and editorial notes never appear in anonymous responses.

## 10. Error contract

Every GDHE error response must use one documented envelope with:

- stable machine-readable `code`;
- safe human-readable `message`;
- HTTP `status`;
- request ID;
- optional field/parameter details that contain no secret or raw database/plugin data.

The minimum status mapping is:

| HTTP | Task A meaning |
|---:|---|
| 400 | Invalid locale, path, pagination, filter, sort, schema, or fixture input |
| 401 | Reserved for a future authenticated preview identity boundary; not used to expose preview in Task A |
| 403 | Authenticated identity lacks the required editorial capability |
| 404 | Route/content absent or not publicly published |
| 409 | Canonical-route conflict or controlled migration/relationship conflict |
| 429 | Explicitly configured rate limit exceeded |
| 500 | Internal normalization/schema invariant failed; public details remain sanitized |
| 502/503 | CMS/downstream temporary failure where applicable |

Unknown modules or incompatible schemas must produce a controlled contract failure, not partial misleading content.

## 11. Contract-test and cleanup deliverables

Task A is complete only when it delivers:

- versioned JSON Schemas for the page envelope, references, errors, collections, navigation, route manifest, and all seven module variants;
- endpoint registration/argument schemas and a machine-readable endpoint contract;
- golden JSON responses for the four representative pages and relevant collections/navigation/manifest;
- automated schema validation for every golden response;
- the complete positive/negative matrix in section 9;
- stable snapshot or semantic comparison that ignores only explicitly nondeterministic fields;
- compatibility tests proving existing v1 fixtures remain valid after additive changes;
- migration dry-run/apply/idempotence/rollback evidence for module IDs/versions and `data_table`;
- security checks for anonymous visibility, forbidden containers, secret patterns, and capability separation;
- benchmark output described in section 13;
- fixture manifest and automated cleanup;
- final database/file checks proving zero fixture posts, revisions, postmeta, term relationships, attachments, uploads, temporary users, and temporary server processes;
- PHP lint, JSON parse/schema checks, WordPress/SCF checksums, database check, governance validation, scope diff, and `git diff --check`.

Tests may create CMS data only inside the separately confirmed Task A execution and backup scope. A successful API assertion without cleanup proof is not completion.

## 12. Compatibility and migration gates

Before Task A can hand off:

1. Freeze the v1 schemas and endpoint semantics.
2. Produce a migration inventory and dry run for all existing English content.
3. Back up and verify the database/plugin state.
4. Apply versioned migrations with an idempotence marker.
5. Validate every migrated public record and all four fixtures.
6. Prove rollback in an isolated/disposable environment, or explicitly block release if no safe restore environment exists.
7. Retain compatibility for the agreed window or publish a separately reviewed major-version cutover.
8. Publish the exact consumer bundle described in section 14.
9. Obtain independent review PASS before Task B formal consumption.

Database backups, plugin updates, content mutations, and migrations require explicit future authorization; TASK-005 does not authorize them.

## 13. REST-first benchmark and GraphQL PoC trigger

REST remains the selected protocol. Task A must benchmark the same Home, Service, Case Study, and Material fixtures from the CMS deployment region, with normal WordPress object cache, Next.js data cache bypassed, one warm-up per fixture, then 200 requests at concurrency 20.

Task A records request graph, serialized CMS origin request count, payload bytes after `_fields`/normalization, p50/p95, and upstream error rate.

Any one of these architecture gates forces a separately authorized WPGraphQL PoC and new ADR; it does not authorize direct production adoption:

- at least two of four fixtures still require more than two serial CMS origin requests after aggregation;
- any fixture has CMS fetch p95 above 500 ms or upstream error rate above 1%;
- at least two of four normalized page payloads remain above 250 KB;
- GDHE read-only aggregates grow beyond five endpoints, or at least three template-specific query graphs appear.

GraphQL may replace REST-first only if the same fixtures materially improve and the full SCF, multilingual, SEO, preview, permission, and license chain also passes a future PoC.

## 14. Exact frontend handoff

Task A must hand Task B one immutable, reviewable bundle containing:

- endpoint base paths, methods, query parameters, allowlists, authentication/publication rules, timeout guidance, and error matrix;
- versioned JSON Schemas and their checksums;
- four golden page fixture responses plus collection, navigation, route-manifest, and error examples;
- fixture manifest with canonical paths and expected publication states;
- supported `apiVersion`, page `schemaVersion`, and per-module version matrix;
- compatibility/migration/rollback report;
- REST benchmark report and GraphQL-trigger result;
- cleanup and zero-residue proof;
- final review verdict and exact implementation commit/branch reference when that future task is formally accepted.

Task B may begin preparatory interface review earlier, but may not formally implement consumption until:

- stable module IDs/versions pass;
- structured `data_table` passes;
- all public DTO schemas and fixtures pass;
- publication/reference negatives pass;
- cleanup passes;
- independent Task A review passes.

After handoff, Task B consumes only the normalized DTO through a server-only adapter. Any raw WordPress/SCF shape change stays behind the Task A adapter and must not force page-component changes unless the public DTO itself is deliberately versioned.

## 15. Explicit non-goals for Task A

- No Next.js route, page, component, visual module, Header, Mega Menu rendering, Footer rendering, or homepage implementation.
- No browser-side WordPress client or exposure of CMS credentials/cookies/secrets.
- No Preview/Draft Mode bridge, signed preview endpoint, publish webhook, or production cache invalidation.
- No multilingual plugin, non-English content/route, translation relationship, hreflang, or RTL work.
- No Yoast/SEO metadata output, sitemap implementation, inquiry/upload, email/CRM, deployment, DNS, or production configuration.
- No WPGraphQL installation or mixed REST/GraphQL production path without the quantitative gate, PoC, and new ADR.
- No speculative endpoints, new module types, page-builder behavior, arbitrary HTML/scripts/classes, or unrelated CMS refactor.
- No mutation of real business content for fixture convenience.

## 16. Definition of done for the future Task A

Task A is done only when the implementation, schemas, migrations, four fixtures, complete positive/negative contract matrix, benchmark, cleanup, compatibility evidence, rollback evidence, and frontend handoff all pass independent review. A working happy-path endpoint, schema document alone, or manually inspected fixture is insufficient.

TASK-005 only defines this boundary. It does not implement or accept Task A.

## 17. Evidence map

- `TASKS/ACTIVE/TASK-005-roadmap-api-integration-boundaries.md`, sections “后续任务 A”, “交接门”, “验收标准”, and “非目标”: planning-only scope, required Task A contents, Task A → Task B dependency, REST-first, English-only, and prohibited runtime changes.
- `docs/architecture/headless-wordpress-nextjs-contract.md`, sections 3.1–3.3: canonical route/not-found, rendering, server-only, and normalized-DTO boundaries.
- Same architecture contract, sections 4.1–4.5: GDHE plugin ownership, content types, TASK-004 fields, seven modules, stable module identity/version requirement, SCF source-of-truth and allowlisted projection.
- Same architecture contract, sections 5.1–5.4: REST-first decision, exact benchmark/GraphQL triggers, implemented versus deferred endpoints, illustrative DTO, errors, and versioning.
- Same architecture contract, section 6: current English-only runtime and future multilingual deferral.
- Same architecture contract, section 14: API/Fixture contract must precede frontend page work.
- `MEMORY/DECISIONS/ADR-004-headless-wordpress-nextjs-contract.md`: accepted Headless WordPress + Next.js, REST-first, security, and adapter boundaries as amended by ADR-005.
- `MEMORY/DECISIONS/ADR-005-english-first-scf-wpml-deferral.md`: SCF/GDHE versioned source, seven modules, English-only operation, and explicit deferral of full DTO/routes/preview/webhook/cache/multilingual work.
- `TASKS/ARTIFACTS/TASK-004/ADVERSARIAL_REVIEW_REPORT.md`, “Round 2 Final Verdict” and “Final Deferred Boundary Decision”: TASK-004 PASS, publication/reference remediation, and mandatory deferral of module ID/version plus structured `data_table` to TASK-005 or before frontend consumption.
- `TASKS/ARTIFACTS/TASK-004/PLANNER_VALIDATION_SUMMARY.md`, “Final validation after Round 2 PASS”: independently verified versions, registrations, Schema 1.0.0, locale `en`, module list, cleanup, and deferred gates.
- `docs/cms/CONTENT_MODEL.md`: current CPT/taxonomy/field/module source, publication rules, and fixture cleanup rule.
- `docs/cms/REST_CONTRACT.md`: current `/schema`, six-key `gdhe` projection, fail-closed reference visibility, and explicitly deferred full DTO/routes/collection/navigation/preview.
- `cms/wp-content/plugins/gdhe-site/config/schema.v1.json`: current `en` locale, public/internal types, seven module names, read-only/published-only flags, and full-page/route/preview deferrals.
- `cms/wp-content/plugins/gdhe-site/config/field-groups.v1.json`, `modules` and `data_table` layouts: current Flexible Content ordering and the textarea table placeholder that Task A must replace.
- `cms/wp-content/plugins/gdhe-site/includes/rest.php`: current implementation is limited to `/schema`, a six-field Core REST projection, public-reference filtering, sanitization, and generic-container removal.
