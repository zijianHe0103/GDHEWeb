# TASK-005 frontend CMS integration boundary

- Task: `TASK-005`
- Lane: `frontend`
- Message: `MSG-TASK-005-FRONTEND-CMS-INTEGRATION-BOUNDARY`
- Evidence date: 2026-07-23
- Scope: English Next.js read-only CMS consumption boundary
- Status: planning evidence only; no frontend or CMS implementation was performed

## 1. Outcome

The future frontend integration must be a server-only, versioned adapter boundary between Next.js and the public WordPress REST contract. React components and route files consume validated frontend DTOs, never Core REST, SCF, plugin configuration, or arbitrary WordPress JSON directly.

Formal consumption is blocked until the preceding API/DTO/Fixture task freezes and reviews the exact public envelope, route behavior, module discriminants, error body, cache metadata, and reproducible published-English fixtures listed in section 5. TASK-005 must not silently treat the current TASK-004 `gdhe` projection as that final DTO.

The smallest valid follow-up implementation proves one published English fixture through a real server-side Next.js request and a deliberately technical output. It does not build the production homepage, global shell, visual system, preview workflow, Webhook receiver, or production cache-invalidation path.

## 2. Evidence baseline

### 2.1 Verified current facts

| Area | Verified state |
| --- | --- |
| Frontend | Next.js `16.2.11`, React `19.2.8`, TypeScript `5.9.3`, App Router under `src/app`, Node.js `24.18.0`, npm `11.16.0` |
| Current routes | Only the minimal foundation root page and layout exist; no CMS-backed route, catch-all route, route resolver, or technical integration proof exists |
| Current data layer | No CMS client, adapter, runtime schema, normalized content DTO, cache-tag builder, preview client, or Webhook handler exists |
| Environment contract | `WORDPRESS_API_URL` is documented as a future server-side value and is not consumed; only the example placeholder is committed |
| CMS locale | English `en` only; public URL prefix is `/` |
| CMS model | Six public custom post types, four public taxonomies, internal-only `site_settings`, and seven module layout names |
| Current public projection | Core REST item responses expose a constrained `gdhe` object with `schema_version`, `template_key`, `summary`, `hero`, `relationships`, and `modules`; generic `acf` and `meta` are removed |
| Current discovery endpoint | Anonymous read-only `GET /wp-json/gdhe/v1/schema` exposes allowlisted schema metadata and explicit deferred markers |
| Current publication rules | Anonymous reads are published-only; relation and image references fail closed when they are not publicly viewable |
| Current validation | TASK-004 Round 2 adversarial review passed with P0, P1, and P2 counts all zero |

The current frontend foundation is therefore verified and usable as an implementation base, while the CMS consumption layer described below is future work.

### 2.2 Explicitly deferred facts

The following are not implemented contracts today:

- public route resolution and route manifest;
- final normalized frontend content envelope;
- stable module instance IDs and per-module schema versions;
- a structured `data_table` public representation;
- collection, navigation, and settings DTOs;
- preview bridge and authenticated draft client;
- signed Webhook receiver and cache-tag invalidation;
- production ISR policy, revalidation durations, stale-retention mechanism, and retry policy;
- multilingual paths, translations, and hreflang.

These items must not be inferred from illustrative architecture examples or from raw plugin configuration.

## 3. Future frontend boundary

### 3.1 Layer responsibilities

The implementation should preserve four narrow layers:

| Layer | Responsibility | Must not do |
| --- | --- | --- |
| Server-only transport client | Build allowlisted public REST URLs, issue read-only requests, apply timeout and response metadata handling | Import into Client Components, expose CMS origin, use editorial credentials, or normalize content |
| Runtime contract validator | Validate versioned response and error envelopes at the untrusted network boundary | Render UI or tolerate incompatible required fields |
| Adapter | Convert validated API DTOs into frontend-owned route and content DTOs | Pass raw WordPress, Core REST, SCF, or plugin objects to routes/components |
| Route consumer | Resolve an English path, map authoritative absence to `notFound()`, and render a technical proof or later page composition | Perform ad hoc CMS fetches, reinterpret contract errors as 404, or fall back to the homepage |

A suitable future location remains `src/lib/cms/` for transport, validation, adapter, errors, and cache-tag helpers, with frontend-owned types under `src/types/`. This is a planning boundary, not authorization to create those files in TASK-005.

### 3.2 Server-only client

The public client must:

- import the framework's server-only guard so a Client Component import fails at build time;
- read `WORDPRESS_API_URL` only on the server and reject a missing, invalid, credential-bearing, or unexpected-scheme value before issuing a request;
- keep the CMS origin and any future secrets out of `NEXT_PUBLIC_*`, serialized props, browser logs, error messages, and client bundles;
- allow only the reviewed REST base and explicitly supported endpoint paths;
- use anonymous `GET` requests for published public data;
- send `Accept: application/json`;
- use `AbortController` or the supported runtime equivalent for a bounded timeout;
- retain the upstream request ID, `ETag`, `Last-Modified`, status, and `Retry-After` when present;
- parse the response once and pass unknown JSON only to the runtime validator;
- avoid an implicit retry loop. Timeout duration, retry count, backoff, and idempotency behavior must be frozen in the implementation task after the hosting environment is known.

Authenticated preview access must use a separate future server-only client and endpoint. Application Passwords, cookies, nonces, or HMAC secrets do not belong in the public client.

### 3.3 DTO and runtime validation

TypeScript types alone do not validate network data. The follow-up implementation must select a runtime validation mechanism and test it at the transport boundary.

The validator and adapter must:

- discriminate the top-level schema version before reading content fields;
- use exact enums or discriminated unions for content type, template, and module type;
- require stable module ordering, stable module instance ID, and a per-module schema version;
- validate structured table rows and cells rather than accept a textarea-shaped blob;
- validate URLs, timestamps, numeric dimensions, nullability, and field omission rules;
- normalize media and public relationships into frontend DTOs rather than expose WordPress attachment or post internals;
- reject an incompatible top-level schema version, missing required field, unknown required module, invalid module payload, or malformed error body as a controlled contract error;
- permit only compatibility behavior explicitly declared by the frozen contract, such as ignoring an unknown additive optional field;
- keep raw response objects out of route and component props.

The runtime-schema library and whether types are generated or maintained alongside a machine-readable schema are implementation-task decisions. TASK-005 adds no dependency.

### 3.4 Route consumption

The future English route flow is:

1. A fixed application route wins before the CMS catch-all.
2. The CMS path is normalized according to the frozen English-root rules.
3. A server-side resolver request returns a validated route/content DTO.
4. An authoritative public `404` or unpublished result calls Next.js `notFound()`.
5. Valid content is adapted and rendered by a Server Component.
6. Timeout, rate limiting, upstream failure, malformed JSON, and schema incompatibility reach a controlled error boundary or service-unavailable response, never `notFound()`.

There must be no homepage fallback for an unknown path. Search and draft traffic remain outside this public route boundary. The architecture contract's eventual `[[...segments]]/page.tsx` shape may be implemented only after the resolver contract is frozen; TASK-005 does not create it.

### 3.5 Timeout and error semantics

| Condition | Frontend meaning | Required behavior |
| --- | --- | --- |
| Missing or unsafe CMS configuration | Deployment/configuration defect | Fail closed on the server; do not make a request or expose the value |
| Timeout, DNS, or connection failure | Upstream unavailable | Emit a typed transport error; do not return 404; production stale behavior waits for the cache task |
| `400` | Frontend request or contract defect | Typed integration error; no retry and no 404 |
| `401` or `403` on public endpoint | Misconfiguration or contract breach | Typed integration error; never ask the browser for credentials |
| `404` from the frozen public resolver/item rule | Authoritative absence or unpublished content | Invoke `notFound()` |
| `409` | Contract-defined conflict | Typed integration error using the frozen error body |
| `429` | Rate limited | Preserve `Retry-After`; controlled unavailable state; no 404 |
| `500`, `502`, or `503` | CMS/upstream failure | Controlled unavailable state; use last successful data only after the cache task implements and proves that behavior |
| Non-JSON or malformed JSON | Protocol failure | Typed parse error; no partial rendering |
| Unsupported schema or invalid required field | Contract incompatibility | Typed validation error; stop rendering rather than silently produce incorrect content |
| Unknown optional additive field | Compatible extension only if frozen as such | Ignore at the validator boundary and retain telemetry |

The technical proof should not claim production stale retention if it uses `no-store` or has no previous validated cache entry.

### 3.6 Request deduplication and cache interfaces

The first implementation should separate fetch identity from cache policy:

- one canonical request key from endpoint, locale, normalized path, and contract version;
- per-render request deduplication so repeated Server Component consumers do not multiply identical CMS requests;
- a client option or policy object that expresses `published`, `preview`, or `technical-proof` intent without letting components construct framework cache options;
- deterministic tag builders for the already planned namespaces:
  - `content:{type}:{id}`
  - `route:{locale}:{pathHash}`
  - `collection:{type}:{locale}`
  - `nav:{locale}`
  - `settings:{locale}`
  - `sitemap`
- unit tests proving identical calls deduplicate and materially different locale/path/version calls do not;
- a technical proof that may deliberately use `no-store` until the production cache policy is confirmed.

Exact Next.js cache APIs, revalidation durations, stale-retention mechanics, and hosting behavior must be reverified against the locked framework version during implementation. No Webhook endpoint or tag invalidation is part of this boundary.

### 3.7 Preview and Webhook deferral gates

Preview work may begin only after published public DTO consumption passes its contract and live fixture tests, and after a separate task freezes:

- authenticated preview endpoint and authorization method;
- HMAC or equivalent validation, expiry, replay prevention, and draft authorization;
- Draft Mode cookie lifecycle, `no-store`, and `noindex`;
- logging and secret rotation behavior.

Webhook/cache-invalidation work may begin only after a separate task freezes:

- signed payload schema and secret ownership;
- replay window, event ID, timestamp, and idempotency;
- content-to-tag mapping and cascade rules;
- failure retries, observability, and operational recovery.

The public client must not contain placeholder secrets or a permissive preview/Webhook shortcut.

## 4. Minimal technical end-to-end proof

The first consuming task should demonstrate the integration boundary without becoming a homepage task.

### 4.1 Required fixture

The preceding API/DTO/Fixture task owns creation and cleanup of a temporary, published, English fixture carrying an explicit task marker. The fixture manifest must provide:

- stable fixture key and cleanup instruction;
- public canonical path;
- content type and record ID;
- expected top-level schema version;
- at least one validated media value or an explicit no-media case;
- at least one validated module with stable instance ID and module schema version;
- expected public relationship behavior;
- expected `404` path;
- expected checksum or canonical JSON snapshot for the fixture response.

The frontend task must not create or edit WordPress content to manufacture this fixture.

### 4.2 Proof path

The follow-up implementation should:

1. start the real Next.js production server with a test-only environment value;
2. request a deliberately technical, server-rendered integration path;
3. make a real HTTP request from Next.js to the reviewed public CMS endpoint;
4. validate and adapt the response on the server;
5. render only a small deterministic set such as fixture key, public type, title, schema version, and module count;
6. return a real `404` for the frozen missing path;
7. demonstrate a controlled non-404 failure for an invalid-schema fixture or mock;
8. verify browser-visible HTML and browser network activity do not expose a CMS credential or make a direct browser-to-WordPress data request;
9. remove any generated frontend cache/output after the test and let the CMS fixture owner perform CMS cleanup.

The proof may be an explicitly technical route or an automated fixture harness. It must not introduce the formal homepage, global header/footer, visual design, final SEO metadata, or production navigation.

## 5. Mandatory freeze before frontend consumption

The API/DTO/Fixture task must freeze all items in this section in an accepted or independently reviewed contract artifact before frontend consumption starts.

### 5.1 API surface

- exact HTTP method and versioned URL for public schema discovery;
- exact HTTP method and URL for public route resolution or, if the proof temporarily uses a Core REST item endpoint, the exact supported item lookup rule;
- locale and path query names, encoding, slash normalization, case handling, and English-root semantics;
- fixed-route collision policy and canonical path returned by the CMS;
- published-only and unpublished-as-404 behavior;
- allowed request headers and response content type;
- timeout/retry expectations that the server is designed to tolerate;
- status-code semantics for `400`, `401`, `403`, `404`, `409`, `429`, `500`, `502`, and `503`;
- versioned JSON error body, including machine code, safe message, request ID, and retry metadata;
- `ETag`, `Last-Modified`, `updatedAt`, request ID, and conditional-request behavior;
- rate-limit behavior and `Retry-After` units;
- compatibility and breaking-change rule, including when `/v2` is required.

### 5.2 Public content DTO

- exact top-level schema-version format; the current implemented schema uses `1.0.0`, while architecture examples are illustrative and must not override it;
- exact envelope fields, field names, types, nullability, omission rules, defaults, and date/time format;
- stable content identity, content type enum, template enum, status/publication semantics, locale, canonical path, and title/summary representation;
- whether rendered HTML is permitted, which fields may contain it, and the required sanitization authority;
- normalized media object, including URL, width, height, MIME type, alt/decorative semantics, focal point if supported, and missing-media behavior;
- normalized link/CTA shape and allowed URL schemes;
- normalized public relationship shape and ordering, with no leakage of private or draft records;
- module discriminant enum, stable instance ID, per-module schema version, ordering rule, required/optional fields, and unknown-module policy;
- exact structured `data_table` row/cell/header/accessibility shape;
- maximum payload, list, text, module, and nesting limits where the client must defend itself;
- additive compatibility rules and the top-level/module version migration policy.

Stable module instance IDs, per-module versions, and structured `data_table` are hard gates called out by the TASK-004 final review; frontend consumption must not begin without them.

### 5.3 Machine-readable contract and samples

- OpenAPI, JSON Schema, or equivalent machine-readable source for success and error envelopes;
- ownership of generated versus hand-maintained TypeScript types;
- canonical valid response samples for every DTO used by the technical proof;
- canonical invalid samples for missing required fields, wrong types, unsupported top-level version, unknown required module, invalid module version, malformed media, and malformed table data;
- sample checksum or another drift-detection method;
- contract-test command and a passing result against the same artifact frontend will consume.

### 5.4 Fixture pack

- one published English happy-path fixture for the proof;
- one known absent/unpublished path that resolves to public `404`;
- media with public attachment visibility and a negative private/draft reference case;
- relationship with published visibility and a negative private/draft reference case;
- at least one module instance containing stable ID and per-module version;
- a structured `data_table` fixture;
- a controlled invalid-version or invalid-module payload usable without corrupting production CMS data;
- explicit marker, creation procedure, expected snapshot/checksum, teardown procedure, and revision cleanup;
- statement of whether fixtures are live CMS records, static contract JSON, or both; live E2E and isolated negative contract tests must not be conflated.

### 5.5 Review gate

Before the frontend implementation message is dispatched:

- the API/DTO/Fixture artifact must have independent review with no open P0 or P1;
- any P2 that changes a consumed field, status, fixture, or error behavior must be closed;
- the frozen contract and fixtures must be reachable from the frontend task card by exact file and section;
- the planner must explicitly identify the contract version and fixture revision to consume;
- CMS and frontend owners must agree that the contract is public, published-only, and free of editorial secrets.

## 6. Follow-up frontend test matrix

| Test level | Required evidence |
| --- | --- |
| Validator unit tests | Valid envelope passes; every required invalid sample fails with the expected typed error |
| Adapter unit tests | Raw validated DTO maps to stable frontend DTO; private/plugin-only fields cannot appear |
| Transport tests | URL allowlist, timeout, malformed JSON, status mapping, request metadata, and unsafe configuration |
| Deduplication tests | Identical request key causes one upstream call; differing path/locale/version remains distinct |
| Route tests | Authoritative 404 calls `notFound()`; contract/upstream failures do not |
| Server-only isolation | Client Component import/build guard fails as expected; committed browser output contains no CMS secret or credential |
| Contract tests | Frozen canonical samples validate under the same runtime schema used by production code |
| Live technical E2E | Real Next.js production server consumes the reviewed published English fixture through real HTTP |
| Regression suite | Existing lint, typecheck, Vitest, production build, audit, root smoke, and image-optimizer fixture remain green |

Mocks alone do not satisfy the live technical E2E requirement. A live happy path alone does not replace negative contract and error tests.

## 7. Explicit non-goals

This boundary does not authorize:

- formal homepage, global shell, header, footer, navigation design, or production content composition;
- visual parity, responsive UI, design tokens, or accessibility sign-off for production pages;
- direct CMS, SCF, plugin, WordPress content, taxonomy, user, or database changes;
- use of raw Core REST, `acf`, `meta`, or plugin configuration in React components;
- GraphQL or WPGraphQL adoption;
- collection, navigation, sitemap, search, inquiry, upload, or form features;
- preview route, Draft Mode, editorial credentials, or secret provisioning;
- Webhook receiver, revalidation endpoint, or production cache invalidation;
- multilingual routing, translation groups, locale switcher, or hreflang;
- production deployment, hosting configuration, monitoring rollout, or SEO completion;
- commit, push, merge, task acceptance, or task closure.

## 8. Risks and decisions for the implementation intake

The next frontend task must explicitly decide and verify:

- runtime-schema library and dependency impact;
- exact timeout, retry, and backoff policy;
- exact technical proof path and how it is excluded from production surface;
- cache mode for the proof and the supported Next.js cache/deduplication API;
- hosting runtime and network reachability to the CMS origin;
- safe observability fields and request-ID propagation;
- generated-versus-handwritten type ownership;
- CMS fixture environment, teardown owner, and drift detection.

None of these decisions should be hidden inside the first adapter implementation.

## 9. Evidence map

| Evidence | Used conclusion |
| --- | --- |
| `TASKS/ACTIVE/TASK-005-roadmap-api-integration-boundaries.md`, sections “结构化理解”, “必须冻结的边界”, “交接门” and “验收标准” | TASK-005 is planning-only; API/DTO/Fixture must precede frontend consumption; technical E2E and formal homepage are distinct |
| `docs/architecture/headless-wordpress-nextjs-contract.md`, sections 2, 3, 5, 8, 9 and 14 | WordPress/Next boundary, App Router route semantics, REST-first DTO direction, errors, cache tags, preview/Webhook separation, and roadmap context |
| `MEMORY/DECISIONS/ADR-004-headless-wordpress-nextjs-contract.md`, sections “决策”, “后果”, “明确不做”, “状态门” and “实施状态更新（2026-07-23）” | App Router, TypeScript, REST-first versioned DTO, server-only secrets, preview/Webhook boundary |
| `MEMORY/DECISIONS/ADR-005-english-first-scf-wpml-deferral.md`, sections “决策”, “实施证据”, “对 ADR-004 的影响”, “后果与限制” and “状态门” | SCF and `gdhe-site` ownership, English-only publication, deferred full DTO/module ID/version/table/route/preview/Webhook work |
| `docs/cms/REST_CONTRACT.md`, sections “Discovery endpoint”, “Public Core REST projection”, “Publication boundary”, “What is intentionally deferred” | Current anonymous projection and discovery behavior are verified, while final DTO and route systems remain deferred |
| `docs/cms/CONTENT_MODEL.md`, sections “Post types”, “Taxonomies”, “Versioned fields” and “Publication rules” | Current public types, module names, schema `1.0.0`, English publication, and fixture cleanup rule |
| `TASKS/ARTIFACTS/TASK-004/ADVERSARIAL_REVIEW_REPORT.md`, Round 2 verdict and residual-risk sections | TASK-004 passed; stable module instance ID, per-module version, and structured table remain pre-consumption hard gates |
| `TASKS/ARTIFACTS/TASK-004/PLANNER_VALIDATION_SUMMARY.md`, final validation and deferred-boundary sections | Current CMS runtime and REST behavior were independently validated; full route/DTO/preview/Webhook remain deferred |
| `frontend/README.md`, sections “Current scope”, “Environment contract”, “Architecture contract” and “What is not implemented” | Current frontend is a minimal verified foundation; CMS access is reserved and server-only but absent |
| `frontend/.env.example` | Only a placeholder `WORDPRESS_API_URL` contract is committed; no real credentials belong in repository evidence |
| `frontend/src/app/page.tsx`, `frontend/src/app/layout.tsx`, `frontend/tests/*` | Current implementation is the foundation placeholder with toolchain/environment/image tests, not CMS integration |
| `TASKS/ARCHIVE/TASK-003-nextjs-typescript-frontend-foundation.md`, sections “验收标准”, “Validation Evidence” and “Planner Final Summary”; `TASKS/ARCHIVE/TASK-004-english-wordpress-cms-scf-rest-foundation.md`, sections “验收标准”, “Adversarial Review”, “Validation Evidence” and “Planner Final Summary” | TASK-003 and TASK-004 are accepted foundations; TASK-005 consumes their verified boundaries without reopening them |

## 10. Planner handoff

Planner should use this artifact to:

1. define the API/DTO/Fixture task with every freeze item in section 5;
2. prevent frontend implementation dispatch until that contract passes review;
3. create a later narrow frontend implementation task scoped to sections 3, 4, and 6;
4. keep preview, Webhook/cache invalidation, and formal homepage/global shell in separate tasks;
5. reconcile roadmap/status wording in planner-owned files without asking the frontend lane to edit them.
