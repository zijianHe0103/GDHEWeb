# TASK-013 Frontend Read-only Audit

- Task: `TASK-013`
- Lane: `frontend`
- Request: `MSG-TASK-013-A2-FRONTEND-READONLY-AUDIT`
- Date: 2026-07-29
- Result: `PASS_WITH_BLOCKING_FOLLOW_UPS`
- Scope: read-only analysis of the current frontend consumer and frozen contracts; no product code, dependency, CMS, Schema, API, database, or authority-document change

## Executive conclusion

The current Next.js foundation is directly usable as the security and transport baseline for a future TASK-014 product-first vertical slice: it has a server-only boundary, canonical public-path validation, one fixed anonymous CMS request, fail-closed Schema validation, and an opaque validated-payload wrapper before DTO adaptation.

It is not yet sufficient to implement an authentic product collection, product card, or `SeoDocument`:

1. the frozen collection response contains only normalized content references (`id`, `type`, `title`, `publicPath`);
2. the frontend snapshot and validator cover Page v3 and Error only, not Collection v3;
3. the current frontend Adapter exposes only a ten-field technical integration DTO;
4. Page v3 has no normalized SEO document;
5. final IA labels/slugs, public CTA routes, TASK-014 candidate records, production content, and public protected media still require their respective confirmation or data gates.

TASK-014 therefore has no frontend-architecture P0, but it must not start product UI implementation until the P1 follow-up contracts below are closed. Fetching each card through `/resolve` is explicitly rejected as a workaround.

## Sources inspected

### Planning and authority

- `TASKS/ACTIVE/TASK-013-english-ia-url-cta-card-seo-contract.md`
- `TASKS/ARCHIVE/TASK-013/OUTPUTS/DESIGN.md`
- `TASKS/ARCHIVE/TASK-013/TASK.md`
- `MEMORY/DECISIONS/ADR-006-product-first-roadmap-and-multilingual-maturity-gate.md`
- `docs/architecture/headless-wordpress-nextjs-contract.md`, section 14
- `TASKS/ARCHIVE/TASK-012/OUTPUTS/REAL_PRODUCT_VALIDATION_GATE.md`

### Current frontend consumer

- `frontend/src/lib/cms/contracts/manifest.json`
- `frontend/src/lib/cms/server/transport.ts`
- `frontend/src/lib/cms/server/validation/registry.ts`
- `frontend/src/lib/cms/server/validation/index.ts`
- `frontend/src/lib/cms/server/adapter/cms-integration-page.ts`
- `frontend/src/lib/cms/server/integration/load.ts`
- `frontend/src/app/integration/cms/page.tsx`

### Frozen contract and deterministic evidence

- `frontend/src/lib/cms/contracts/schemas/page.v3.schema.json`
- `frontend/src/lib/cms/contracts/schemas/content-reference.schema.json`
- `frontend/src/lib/cms/contracts/schemas/media-reference.schema.json`
- `cms/wp-content/plugins/gdhe-site/config/schemas/collection.v3.schema.json`
- `TASKS/ARCHIVE/TASK-007/EVIDENCE/machine/golden-a3/collection-product-page-1.json`
- `TASKS/ARCHIVE/TASK-007/EVIDENCE/machine/golden-a3/collection-product-page-2.json`
- `TASKS/ARCHIVE/TASK-007/EVIDENCE/machine/golden-a3/collection-product-page-3-empty.json`
- `TASKS/ARCHIVE/TASK-007/EVIDENCE/A3_FRONTEND_CONSUMER_REAUDIT_R2.md`
- `TASKS/ARCHIVE/TASK-007/EVIDENCE/machine/HANDOFF_CHECKSUMS.sha256`

## Current facts

### Directly usable frontend boundaries

| Result | Classification | Evidence and TASK-014 use |
| --- | --- | --- |
| English is the only active public locale. | Directly usable | TASK-013 and ADR-006 keep multilingual work outside this task. TASK-014 may build only English templates and must not add WPML, language switching, or `hreflang`. |
| `publicPath` is the frontend-facing canonical identity. | Directly usable | Current Transport accepts only a normalized, trailing-slash public path and constructs the fixed English Schema 3 `/gdhe/v1/resolve` request. |
| CMS access is server-only and anonymous. | Directly usable | Current production modules use the server-only boundary. Transport performs one GET with JSON accept, `no-store`, redirect refusal, a frozen 5000 ms timeout, and zero retry. |
| Contract validation precedes DTO adaptation. | Directly usable | Page/Error Schema roots are compiled locally; validated bodies are caller-isolated, deeply immutable, and opaque until the registered Adapter consumes them. |
| Page v3 already exposes normalized Product detail inputs. | Directly usable | The Product detail supports model, product code, taxonomy context, positioning, features, specifications, article numbers, finishes, installation, control, compatibility, gallery, video, and inquiry CTA. |
| Public media has a normalized DTO boundary. | Directly usable | `MediaReference` provides UUID, HTTPS/public URL, MIME, dimensions, alt/decorative state, and optional caption. It does not expose attachment database IDs or raw media metadata. |
| Collection v3 has deterministic pagination semantics. | Directly usable, baseline only | The frozen page 1/2/3 examples preserve total `3/3/3` with item counts `2/1/0` under the same filter and sort. This proves a collection envelope, not a sufficient product-card projection. |
| Product detail may resolve independently once. | Directly usable | A detail template may perform one server-side `/resolve` call for its canonical product path. This permission does not extend to one call per collection card. |

### Current blockers

| Finding | Severity | Classification | Why it blocks TASK-014 |
| --- | --- | --- | --- |
| Product collection items contain only `id`, `type`, `title`, and `publicPath`. | P1 | Follow-up task required | This cannot render the frozen card contract: model, public protected image, category/series context, short description or key attributes, lifecycle state, and CTA state are absent. |
| Frontend contract closure has no Collection v3 root. | P1 | Follow-up task required | The verifier manifest has 16 Schema files and only Page/Error roots. A collection response cannot pass the same local authority binding and runtime validation gates. |
| Frontend has no product-collection transport or Adapter. | P1 | Follow-up task required | Current orchestration resolves one fixed public path and returns only the technical integration DTO. There is no typed `ProductCardDto[]` consumer boundary. |
| Page v3 and the frontend snapshot have no `SeoDocument`. | P1 | Follow-up task required | TASK-014 cannot implement canonical metadata, robots, Open Graph, breadcrumbs, or allowlisted structured-data inputs from a normalized authority contract. |
| Final IA labels, stable slugs, hierarchy, and public quote/contact routes are not confirmed. | P1 | User confirmation required | Frontend must not invent product/category/series/application URLs or CTA destinations and later treat them as canonical. |
| TASK-014 candidate products are not authorized yet. | P1 | User confirmation required | Current records remain `TEST_CANDIDATE`; they cannot silently become production catalog truth or a confirmed UI baseline. |
| Final product content and public protected media are incomplete. | P1 | Production data gate | The 10–20 product authority gate, taxonomy membership, English content, current downloads, quotation options, and publication rights remain open. |
| Production media HTTPS origin and Next Image allowlist are not frozen. | P2 | Production data gate | Local structural work can proceed after the earlier P1 gates, but production image optimization and deployment acceptance cannot. |

No P0 was found. The P1s are contract/authority gates, not reasons to bypass the frozen API boundary.

## Minimum TASK-014 inputs

### IA and URL

The minimum usable IA decision set is:

- products hub;
- product category;
- series;
- application/market;
- accessories catalog;
- one canonical detail page for each product;
- one confirmed English label, stable slug, canonical route pattern, parent relation, and indexability rule for each entry;
- redirect behavior when a canonical slug changes;
- fail-closed behavior for unpublished or invalid relations;
- preservation of a discontinued product URL while its CTA changes;
- one public quote-request route and one public replacement/contact route.

The following rules are already directly usable:

- a product may belong to multiple category, series, and application discovery paths;
- those paths must not create duplicate product-detail identities;
- `publicPath` is the canonical product identity returned by the API;
- paths use lower-case kebab-case segments, a leading and trailing slash, and the existing bounded canonical-path validator;
- a true unknown public path is a 404 condition, while invalid or unpublished relations do not become links.

The exact public labels, hierarchy, slugs, route patterns, quote/contact routes, and production origin require user confirmation.

### ProductCard collection projection

TASK-014 needs a first-class normalized card projection returned by one collection response. The minimum item shape is:

| Field | Requirement |
| --- | --- |
| `id` | Stable public UUIDv4. |
| `type` | Literal public product type. |
| `publicPath` | Canonical product detail path. |
| `title` | Confirmed English public name. |
| `model` | Public model displayed on the card. |
| `summary` | Bounded English card copy; final content remains a production data gate. |
| `primaryMedia` | Public protected `MediaReference`, including dimensions and meaningful alt/decorative semantics. |
| taxonomy context | Explicit normalized category, series, and application refs/slugs required by the approved card/filters. |
| `keyAttributes` | A bounded ordered label/value/unit list; the approved attributes vary by product category. |
| `lifecycleStatus` | At least `active` or `discontinued`. |
| quote state | Normalized quote eligibility and selection-completeness state. |
| CTA state | A normalized `request_quote`, `contact_replacement`, or `none` result with its approved public target. |
| replacement ref | Optional public replacement reference for a discontinued product; absent or unpublished references fail closed. |

The collection envelope must retain locale, type, sort, filter, page, per-page, total, and items. Stable filter and sort identifiers must be explicit; presentation components must not reinterpret raw CMS query structures.

User confirmation is required for:

- card-direct quote action versus detail-first navigation;
- active products lacking a complete public quoteable specification;
- whether missing public protected media suppresses the card or uses an approved placeholder;
- the visible summary and category-specific key-attribute policy.

Article-number options belong to product detail/quotation selection unless the approved card interaction specifically requires them. The card must not preload full raw option matrices.

### CTA state

The confirmed business states are directly usable:

- active product: `Request a Quote`;
- discontinued product: `Contact Us for Replacement`;
- quotation behavior: add the selected Article Number or valid configuration plus a positive integer quantity to a multi-product request list;
- the site has no cart, checkout, payment, or direct purchase;
- unpublished targets and invalid relations produce no public CTA.

The existing generic Page `inquiryCta` link is not sufficient by itself because it cannot prove lifecycle, quotation eligibility, selection completeness, or replacement availability. Those states require an explicit normalized CMS/API contract before TASK-014 binds behavior.

### SeoDocument

The minimum normalized SEO input is:

- English `title`;
- English `description`;
- `canonicalPath`;
- `robots.index` and `robots.follow`;
- Open Graph title, description, and one public protected image reference;
- ordered breadcrumb items containing public name and `publicPath`;
- page kind/template and stable public product identity;
- allowlisted semantic Product inputs for JSON-LD: public name, model, description, public image, category context, and only confirmed public organization/brand data;
- explicit behavior for unpublished, invalid, and non-indexable content.

The frontend must generate framework metadata and JSON-LD from those normalized fields. It must not accept an arbitrary CMS-authored JSON-LD blob, raw WordPress metadata, or a database identifier. Production origin composition belongs to deployment configuration after the canonical origin is confirmed. `hreflang` and non-English alternates remain out of scope.

## Proof that cards do not require per-card `/resolve`

### Observed baseline

The frozen Collection v3 examples already return a paginated `items` array and a collection-level `total`. The three deterministic pages prove one collection resource can represent zero, one, or multiple items without resolving each item separately.

The current frontend production source has one HTTP primitive, and its orchestration invokes `/resolve` once for one fixed page. It has no existing card loop, collection fetcher, or client-side WordPress call.

### Prohibited failure mode

If TASK-014 first fetches a collection and then maps each reference to `/resolve`, the request count is:

`1 collection request + N product resolve requests`

That is an N+1 design. It also multiplies timeout/failure opportunities, couples card rendering to the full detail payload, and defeats deterministic collection pagination. It is not an acceptable frontend workaround for the thin current item shape.

### Required future boundary

The only acceptable collection path is:

`one collection HTTP request -> validate the complete envelope -> adapt all items to readonly ProductCardDto[] -> render`

For 0, 1, or N items, the request count remains exactly one and the number of per-card `/resolve` calls remains zero. Product-detail navigation may later issue one independent `/resolve` for the selected canonical path.

The follow-up implementation must prove this with a loopback counter test for 0/1/N collection items, a zero-`/resolve` assertion, fixed filter/sort/total behavior, one JSON parse, fail-closed validation, server-only imports, handle cleanup, and no browser request to WordPress.

## Proof against raw WordPress, SCF, and authority leakage

The current layered boundary is sound and must be extended rather than bypassed:

1. WordPress exposes a normalized allowlist contract rather than raw SCF/meta.
2. JSON Schemas use closed object shapes for public references and Page content.
3. The frontend owns a checksum-bound local Schema/sample snapshot.
4. The runtime validator accepts only the frozen Schema root and returns an opaque, immutable validated wrapper.
5. The Adapter is the only consumer of that body and emits a narrower DTO.
6. Client Components never import the server transport, validator, raw contract body, or CMS origin.

The TASK-007 Golden evidence contains no WordPress database IDs, attachment IDs, `postmeta`, raw `meta`, `acf`, `site_settings`, raw SCF containers, purchase price, supplier, cost, margin, or internal notes. Public file/media DTOs carry only explicitly allowed public fields.

The future collection contract must preserve this by:

- defining a closed `ProductCard` Schema rather than an arbitrary `metadata`, `fields`, or `attributes` bag;
- excluding `postId`, `databaseId`, `attachmentId`, `acf`, `meta`, `rawScf`, Feishu internal fields, supplier/cost/margin data, and original asset paths;
- snapshotting and authority-binding the complete Collection v3 `$ref` closure;
- validating before adaptation and discarding the raw body after DTO construction;
- passing only readonly `ProductCardDto` values to presentation code;
- proving public and deep server imports fail in a Client Component build;
- scanning tests, rendered output, logs, and browser traffic for raw payload, CMS origin, credentials, and forbidden keys;
- keeping internal originals outside WordPress, API, Next.js cache, and builds rather than importing and hiding them later.

## Classification matrix

| Decision or deliverable | Classification | Owner / entry gate |
| --- | --- | --- |
| English-only TASK-014 slice | Directly usable | Frontend may rely on the frozen locale boundary. |
| Canonical `publicPath`, UUID, type/template pairing | Directly usable | Reuse the existing normalized identity and validation rules. |
| Product detail structured fields | Directly usable | Reuse after the chosen candidate has user authorization and valid data. |
| Public `MediaReference` shape | Directly usable | Reuse only with public protected assets. |
| Server-only transport, Validator, opaque wrapper, Adapter pattern | Directly usable | Extend vertically; do not weaken or bypass. |
| Collection page/filter/sort/total semantics | Directly usable, baseline only | Keep the envelope while expanding the item projection. |
| Active/discontinued CTA labels and quote-list semantics | Directly usable | Encode through normalized state, not presentation heuristics. |
| Exact IA labels, hierarchy, slugs, and canonical routes | User confirmation required | Confirm before freezing frontend routes or CMS paths. |
| Quote and replacement/contact public routes | User confirmation required | Confirm before binding CTA targets. |
| Card-direct quote versus detail-first behavior | User confirmation required | Select one interaction contract. |
| Missing-media and active-but-not-quoteable behavior | User confirmation required | Define fail-closed public behavior. |
| Category-specific card attributes and final summary policy | User confirmation required | Confirm visible information hierarchy. |
| TASK-014 2–3 candidate records | User confirmation required | Authorize test-only visual baseline use. |
| ProductCard collection Schema/API/Golden/error closure | Follow-up task required | CMS/API follow-up before frontend card work. |
| Frontend Collection snapshot/verifier/Validator/Transport/Adapter | Follow-up task required | Frontend follow-up after the upstream projection freezes. |
| SeoDocument CMS/API/Schema and frontend consumer | Follow-up task required | Contract follow-up before technical SEO implementation. |
| Product UI, Metadata and JSON-LD implementation | Follow-up task required | TASK-014 only after preceding gates pass. |
| 10–20 final product authority set | Production data gate | Feishu/business owner plus CMS publication evidence. |
| Final taxonomy membership and product relationships | Production data gate | Must be verified per real product. |
| English product/card/SEO copy and current downloads | Production data gate | Requires accountable source and owner. |
| Public protected images, rights, alt text, HTTPS origin | Production data gate | Business-prepared public assets and deployment allowlist. |
| Real article numbers, quoteable configurations, and lifecycle state | Production data gate | Must remain traceable to current business authority. |
| Discontinued/replacement production example | Production data gate | Needed before accepting the fallback CTA in production. |

## Suggested TASK-014 test candidates

These are recommendations only and remain `TEST_CANDIDATE` until the user explicitly authorizes them:

1. `FGE X08+pvc` / `GDHEPRD000328`: exercises electric-track detail, custom length, compatible components, packaging, and honest handling of a missing remote-control information module.
2. `SSD-01` / `GDHEPRD000692` and `GDHEPRD000695`: exercises an accessory product with exact allowed combinations and guards against inventing a Cartesian product of variants.
3. `PJ-D16` / `GDHEPRD000640`: exercises progressive disclosure, a link to the electric-track context, and omission rather than fabrication when a module is absent.

This set is useful for UI and contract tests, but it is not evidence of production catalog readiness and must not be bulk-published or represented as the final product system.

## Recommended entry gates

TASK-014 should enter implementation only after:

1. the user confirms the English IA/URL/CTA decisions and the 2–3 test candidates;
2. CMS/API freezes a normalized ProductCard collection projection with Golden success/error evidence and no raw authority leakage;
3. frontend snapshots, authority-binds, validates, transports, and adapts Collection v3 with a one-request/zero-per-card-resolve test;
4. CMS/API and frontend freeze a normalized `SeoDocument`;
5. every selected candidate satisfies the TASK-012 real-product validation gate for the fields rendered in the slice;
6. public protected media and its publication rights are available for the selected candidates.

Production acceptance additionally requires the production data and HTTPS media/deployment gates. Audit completion is not acceptance of TASK-013 or authorization to implement TASK-014.

## Final finding count

- P0: 0
- P1: 7
- P2: 1
- Overall: `PASS_WITH_BLOCKING_FOLLOW_UPS`

The architecture direction is feasible. The blocking findings identify the minimum authority and contract work needed to prevent N+1 requests, raw CMS leakage, invented IA, and premature product/SEO implementation.
