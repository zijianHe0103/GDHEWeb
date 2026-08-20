# TASK-013 Gap Report

status: `FROZEN_GAP_CLASSIFICATION`

## 1. What is frozen and directly usable

- English primary navigation and Products Mega Menu labels/hierarchy.
- Product, group/category, series, application, contact and RFQ path shapes.
- One product identity and one canonical detail path.
- Stable primary-category Breadcrumb.
- Active `Request a Quote` and discontinued `Contact Us for Replacement` business behavior.
- `/request-a-quote/` and `/contact/` targets.
- Detail-first complex products and direct-RFQ no-detail small accessories.
- Public-card information policy and three test candidates.
- Target normalized ProductCard and English `SeoDocument` contracts.
- English-only/no-language-switcher boundary.

Existing server-only `/resolve`, Validator, opaque wrapper and Adapter can support one known canonical detail route after its test fixture/data is authorized.

## 2. Blocking machine-contract gaps

### 2.1 ProductCard collection

Current collection items have only `id`, `type`, `title` and `publicPath`. They cannot render the frozen cards.

Required follow-up:

- versioned closed ProductCard collection Schema/API;
- public model/name/protected image/primary category/summary/key attributes/lifecycle/action;
- series/application discovery support only when evidence-backed;
- full-envelope eligibility and canonical uniqueness;
- Golden/error fixtures;
- one request for 0/1/N items and zero per-card `/resolve`.

### 2.2 Frontend collection consumer

Current frontend has no collection snapshot, authority checksum, runtime validator, transport or Adapter.

Required follow-up:

- frozen full collection `$ref` closure;
- server-only transport;
- fail-closed Validator/opaque wrapper/Adapter;
- readonly card DTO;
- loopback request-counter tests;
- client import and browser-network leakage tests.

### 2.3 Typed lifecycle/CTA/RFQ eligibility

Current generic CMS link cannot prove active/discontinued, replacement context, detail-first/direct-RFQ or unresolved Article behavior.

Required follow-up:

- typed lifecycle and card/detail action;
- replacement identity and public-target eligibility;
- active synced/published RFQ eligibility independent of full spec completeness;
- unresolved Article Number RFQ payload;
- no heuristic Article selection.

### 2.4 SeoDocument

Current Schema 3 has useful title/excerpt/path/media inputs but no normalized robots, canonical-origin, Breadcrumb, page state or JSON-LD document.

Required follow-up:

- CMS/API normalized SEO/page-state contract;
- frontend server-only validator and Metadata adapter;
- protected-image/alt rules;
- 200/404/redirect/noindex tests;
- whitelisted WebPage/BreadcrumbList/conditional Product JSON-LD.

## 3. CMS/navigation gaps

- Current navigation Schema allows children, but runtime currently emits flat children.
- Category/series/application landing identities and collection filters are incomplete.
- Small accessories without SEO detail pages lack a normalized quoteable catalog-item contract.
- Former path, redirect target, withdrawal and 410 state are not implemented.
- Feishu website-eligibility, mirror last-success and exception-review fields are not implemented in the current runtime.
- The real WordPress runtime has no production GDHE product/taxonomy content.

## 4. Content and asset gaps

- Final English names, one-sentence card summaries, SEO descriptions and body content require accountable human authorship.
- `SSD-01` and `PJ-D16` need business-prepared protected images before any public use.
- FGD X15 test media is evidence for a local slice, not blanket production media authorization.
- Current downloads, image alt, compatibility relations and final category membership require production evidence.
- Legal pages and exact later resource/blog routes require content decisions.

## 5. Production-data gate

Before bulk production import, product-template business freeze or Schema business freeze:

- validate 10–20 final authorized production products;
- cover the product/category/variant/accessory/compatibility/document/lifecycle range frozen in TASK-012;
- confirm real Base/table/field/relationship mapping and permissions;
- confirm Article Number uniqueness, model grouping and major-change workflow;
- complete at least the required sync/audit transition evidence.

The three TASK-014 candidates do not pass this gate.

## 6. Deployment gaps

- Production canonical origin is unknown: `DEPLOYMENT_GAP`.
- HTTPS Staging, deployment topology, Linux/Sharp, media allowlist, environment/secrets and logging are not frozen.
- Preview/Draft Mode, last-known-good public cache, signed Webhook and multi-instance coordination are not implemented.
- Sitemap, robots, redirect delivery, Search Console and production monitoring are future deployment/SEO work.

## 7. Multilingual gaps

- English is the only public locale.
- No WPML/ACFML procurement or installation is authorized.
- SCF plus ACFML compatibility remains unproven.
- No translated routes, hreflang, language switcher or RTL content may be exposed before the ADR-006 PoC and maturity gates.

## 8. Important non-blocker

Complete public quote specifications are not required for an active synced and published product to accept `Request a Quote`.

When Article Number cannot be uniquely resolved, the RFQ carries stable product/model, known selections, quantity and notes; staff resolve the remaining detail in Feishu. This does not authorize the frontend to invent combinations.

## 9. Next-task boundary

The smallest safe next step must close the machine-contract blocker before authentic card/list UI:

1. normalized ProductCard collection plus typed lifecycle/action/SEO source contract;
2. corresponding frontend collection/SEO consumer closure and one-request proof;
3. only then the user-confirmed local category/card-to-detail vertical slice.

Whether these are one checkpointed task or separate small tasks must be decided at the next task intake. TASK-013 does not create or start them.
