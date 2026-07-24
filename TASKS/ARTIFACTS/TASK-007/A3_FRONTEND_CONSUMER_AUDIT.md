# TASK-007 A3 frontend consumer audit

Audit date: `2026-07-24`

Message: `MSG-TASK-007-FRONTEND-FOREST-SCHEMA3-READAUDIT`

Verdict: `FAIL`

Finding counts: `P0=0`, `P1=2`, `P2=3`

## Executive result

The Forest-aligned Schema 3 handoff proves a substantial normalized REST boundary, but it is not yet sufficient to authorize a future Next.js server-only consumer.

The current evidence passes the machine declaration of seven public types and the positive Product/Market/Reference/Support/Download/Home DTOs, Product taxonomy slugs and structured details, five fixed relation arrays, public file DTO, navigation, route manifest, deterministic Product collection pagination, UUIDv4, safeHtml, stable errors and cache headers, publication fail-closed behavior, two-lifecycle Golden determinism and final cleanup. The 13 current Golden documents contain no WordPress database IDs, raw SCF/meta fields or internal `site_settings`.

Two CMS contract blockers remain:

1. The runtime accepts any known template for every public type, while the Schema requires each of the five structured types to use its matching template. A known but mismatched template can therefore escape `resolve` as a Schema-invalid DTO.
2. The immutable handoff does not directly checksum the complete transitive Schema graph, and its embedded whole-plugin stream digest has no frozen reproduction algorithm or file list. A future consumer cannot independently prove that the exact schemas used to validate the Golden set are the schemas frozen by the handoff.

These are upstream contract defects. A frontend adapter must not add type/template repair logic or substitute its own checksum authority.

## Consumer boundary

The existing Next.js 16 App Router foundation can eventually consume only GDHE normalized DTOs through server-only data access. It must not read WordPress Core REST shapes, SCF field names, postmeta, database tables or numeric WordPress identifiers. This audit does not design or implement that adapter.

The normalized model is structurally capable of supporting:

- Products through `product`, Product taxonomy slug arrays and structured Product details;
- Markets through `market`;
- References through `reference`;
- Support through `support_article`;
- Downloads through `download` and the public file DTO;
- Home, Products/Markets/Support/Downloads hubs, Company and Contact through native `page`;
- News through native `post`.

Actual adapter implementation remains blocked until both P1 findings are fixed and a narrow frontend re-audit passes.

## Contract verification matrix

| Boundary | Result | Evidence |
|---|---|---|
| Versions | PASS | REST API `1`, Content Schema `3.0.0`, Module Schema `1.0.0`, fixture `TASK-007-A3-1.0.0`, plugin `0.4.0` agree across the manifest, checkpoint and runtime evidence. |
| Public and internal types | PASS with P2 coverage note | `schema.v3.json` exposes Product, Market, Reference, Support Article and Download; runtime adds native Page/Post; `site_settings` remains internal. |
| Templates | FAIL, P1 | Schema 3 constrains the five structured types to matching templates, but runtime checks only membership in the global template list. |
| Canonical paths | PASS | Page uses an explicit path; Post, Product, Market, Reference, Support Article and Download use the documented canonical directories. Shared validation rejects malformed paths. |
| Product taxonomy slugs | PASS | Product details expose `categories`, `series` and `installationTypes`; Support and Download expose `topic` and `documentType`; schemas constrain slugs. |
| Structured details | PASS | Current Goldens and Schema cover Product specifications, regional article numbers, finishes, installation/control/compatibility, gallery/video/CTA and the other type-specific details. |
| Relations | PASS | Every current resolve Golden has exactly `products`, `markets`, `references`, `support_articles` and `downloads`; each array is bounded to 20 public references. |
| Public file DTO | PASS | Download exposes only UUIDv4 `id`, URL, filename, MIME type and byte count. No attachment ID or filesystem path appears. |
| Navigation | PASS | Current Golden validates against the bounded navigation schema and contains only public UUID/path data. |
| Route manifest | PASS | Current Golden validates against the route-manifest schema, uses public UUIDs and canonical paths, and contains no duplicate current route. |
| Collection | PASS | Identical `product_category:flow-control` and `title_asc` inputs freeze totals `3/3/3` and item counts `2/1/0` for pages 1, 2 and 3. |
| UUIDv4 | PASS | Envelope, reference, module, route, navigation and file identifiers are governed by the UUIDv4 schema; the negative UUID fixture fails. |
| safeHtml | PASS | Reference and Support rich content uses explicit `safeHtml` fields; malicious script, event attribute and dangerous protocol evidence is rejected. |
| Errors and headers | PASS | Stable 400/404/409/500 codes, `no-store` errors, success ETag and `public, max-age=60`, request IDs, resolve Last-Modified and conditional 304 are frozen. |
| Publication boundary | PASS | Draft, private, pending, trash and nonexistent content return `gdhe_not_found`; invalid contract candidates are excluded from eligible collections. |
| Golden determinism | PASS | Two lifecycles used different WordPress IDs and produced identical 13 of 13 Golden hashes. |
| Cleanup | PASS | Final task posts, postmeta, terms, options and uploads are all zero; database/Core/SCF integrity is PASS. |
| Complete Schema checksum closure | FAIL, P1 | The 32-entry handoff checksum verifies its named files but does not directly freeze most schemas loaded by the validator. |
| Public-data isolation | PASS | Fresh key scan of all 13 Goldens found no `postId`, `attachmentId`, `databaseId`, `postmeta`, `meta`, `acf`, `site_settings`, `siteSettings`, `rawScf` or `rawMeta`. |

## Findings

### P1-1: structured type and template pairing is not runtime fail-closed

`page.v3.schema.json` requires:

- Product with `templateKey: product`;
- Market with `templateKey: market`;
- Reference with `templateKey: reference`;
- Support Article with `templateKey: support_article`;
- Download with `templateKey: download`.

The runtime instead defines one global known-template list in `includes/public-api.php:193-196` and checks only global membership in `includes/public-api.php:283-292`. It does not compare the selected template with the record type before building the response at `includes/public-api.php:296-302`.

A read-only mutation of the Product Alpha Golden from `templateKey: product` to `templateKey: market` was rejected by the Draft 2020-12 Schema with the error `'product' was expected`. The same known value passes the runtime membership condition. The only A3 negative fixture uses `unknown_template`; it does not exercise a known but mismatched template.

Impact: `resolve`, collection eligibility, navigation and route manifest can treat a record as contract-valid even though its emitted DTO is invalid under the frozen page Schema. A future server-only consumer cannot safely discriminate structured DTOs.

Required closure: enforce the Schema 3 type/template pairing in the CMS runtime and add known-mismatch negative fixtures that prove rejection from resolve, collection, navigation and route manifest as applicable. Regenerate affected evidence and checksums.

### P1-2: the complete transitive Schema graph is not reproducibly frozen

`schema.v3.json` registers page, error, content reference, media reference, file reference, UUIDv4, public path, link, safeHtml, collection, navigation, route manifest and the seven module schemas. `tests/a3-schema-validate.py:18-30` loads the complete schema directory and uses navigation and route-manifest schemas for current Golden validation.

`HANDOFF_CHECKSUMS.sha256:24-28` directly freezes only:

- `field-groups.v3.json`;
- `schema.v3.json`;
- `collection.v3.schema.json`;
- `file-reference.schema.json`;
- `page.v3.schema.json`.

The page and collection schemas transitively depend on UUIDv4, public path, media reference, content reference, link, safeHtml and all seven module schemas. Navigation and route-manifest schemas are also validation authorities. None of those files is directly present in the handoff checksum.

The checked manifest contains a single “canonically sorted gdhe-site file stream” digest, but the handoff does not define the command, relative-path normalization, exclusions or exact file list required to reproduce it. Therefore that value cannot replace explicit checksum closure for an independent consumer.

Impact: all 32 named handoff checksums pass, yet a transitive consumer schema could change without an independently reproducible proof that the frozen Golden validation authority is unchanged.

Required closure: freeze every active Schema 3 file used by the validator, or provide a checked manifest with an exact deterministic generation algorithm and complete file list whose fresh digest is reproduced in validation. Then rerun Schema validation and handoff checksum verification.

### P2-1: native Post and non-root Page coverage is not represented by positive Golden DTOs

The machine schema and runtime declare native Page/Post support, and the Home Golden proves the generic Page envelope. The 13-file A3 set has no native Post Golden and no non-root Company/Contact or hub Page Golden.

This is not a separate contract blocker because these records share the same normalized envelope, but a later consumer task should not claim full route/fixture coverage until one `/news/{slug}/` Post and one explicit non-root Page are frozen across resolve, collection or route-manifest behavior as applicable.

### P2-2: HTTPS video policy is stronger in runtime/docs than in machine Schema

`CONTENT_MODEL.md` and the CMS normalizer require HTTPS Product and Support video URLs. `page.v3.schema.json:96` and `page.v3.schema.json:160` accept any URI scheme. Current runtime output remains safe because normalization allows only HTTPS, but the machine contract should encode the same policy when the Schema is next revised.

### P2-3: production media origin remains a deployment gate

Current synthetic media/file URLs use the local HTTP fixture origin. Before deployment, the production media origin must be HTTPS and explicitly included in the Next Image remote allowlist. That deployment decision remains outside TASK-007 and outside this audit.

## A3 checkpoint and checksum reconciliation

The factual checkpoint claims were reproduced as follows:

- all 32 entries in `HANDOFF_CHECKSUMS.sha256` return `OK`;
- all plugin/config and TASK-007 JSON documents parse;
- `A3_SCHEMA_VALIDATION.json` reports 13 valid positive documents and all four negative Schema boundaries behaving as expected;
- `A3_CONTRACT_RUNTIME_SUMMARY.json` reports totals `3/3/3`, item counts `2/1/0` and a UUIDv4 file ID;
- `A3_DETERMINISTIC_GOLDEN.json` reports two lifecycles, changed database IDs, 13 identical hashes per round and no public database-ID use;
- `A3_CLEANUP_EVIDENCE.json` reports zero task residue and passing integrity checks;
- the current Golden type/template/path set and five relation keys match the frozen current fixtures.

The checkpoint’s statement that “handoff checksums PASS” is accurate for the 32 named entries. It does not establish completeness of the transitive Schema checksum set, which is P1-2.

## Benchmark and deferred architecture comparison

The independently repeated warmed benchmark records 1,600 origin requests at concurrency 20, p50 `858.246 ms`, p95 `2001.839 ms` and error rate `0`.

The p95 result exceeds the existing `500 ms` architecture-comparison trigger. It creates only a future, separately governed GraphQL/cache PoC and ADR candidate owned by Planner. TASK-007 does not authorize GraphQL installation, implementation or adoption, and this audit does not select an alternative transport.

## Scope confirmation

- `frontend/**` remained read-only.
- No dependency, environment, CMS, database, product implementation or architecture file was modified.
- No adapter, GraphQL, multilingual, page, component, Header, Mega Menu, Footer, visual, review, Git, acceptance or deployment work was started.
- Only this audit artifact, the frontend lane worklog and controlled message records are in scope for this execution.

## Required next gate

Return P1-1 and P1-2 to the CMS contract owner as one narrow Schema 3 revision. After runtime mismatch negatives, complete Schema checksum closure, regenerated immutable evidence and Planner verification pass, dispatch a frontend read-only re-audit. Do not start the Next.js adapter before that PASS.
