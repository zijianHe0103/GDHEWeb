# TASK-007 Forest-aligned Product Model Revision

Frozen on: `2026-07-24`

## 1. Reference authority

- RapidDirect remains the reference for frontend engineering, responsive behavior, component composition, visual quality, interaction patterns, SEO rendering and inquiry conversion.
- Forest Group UK becomes the primary reference for product hierarchy, directory structure, product-detail information, markets, support and downloads.
- GDHE remains the authority for brand, real product taxonomy, model numbers, specifications, media, files, contacts and final copy.
- Reference sources:
  - `https://www.forestgroup.co.uk/uk`
  - `https://www.forestgroup.co.uk/uk/products/all-systems`
  - `https://www.forestgroup.co.uk/uk/products/motorised`
  - `https://www.forestgroup.co.uk/uk/products/forest-shuttle-curtain-motor`
  - `https://forestgroup.co.uk/uk/products/forest-motorised-track-system`

Forest names are information-architecture examples, not content to copy. GDHE terminology must replace them before real content entry.

## 2. Target public directory

```text
/
├── products/
│   ├── manual-systems/
│   ├── corded-systems/
│   ├── rods/
│   ├── roman-blind-systems/
│   ├── roller-blind-systems/
│   ├── motorised-systems/
│   ├── recessed-systems/
│   └── accessories/
├── markets/
│   ├── hospitality/
│   ├── residential/
│   ├── office/
│   ├── healthcare/
│   ├── interior-design/
│   └── marine/
├── support/
│   ├── technical-support/
│   ├── installation/
│   ├── training/
│   ├── videos/
│   └── faq/
├── downloads/
│   ├── brochures/
│   ├── technical-documents/
│   ├── installation-manuals/
│   ├── certificates/
│   ├── order-forms/
│   └── safety-data/
├── references/
├── company/
└── contact/
```

Final category labels and slugs remain replaceable by real GDHE product inventory. The frozen contract is the hierarchy and content responsibility, not Forest branding.

## 3. WordPress content model v3

Content Schema must advance from `2.0.0` to `3.0.0`. REST transport may remain `/gdhe/v1` because endpoint mechanics remain stable; every public response must advertise content Schema `3.0.0`.

### Public content types

| Type | Purpose | Canonical path |
|---|---|---|
| Native `page` | Home, products/markets/support/downloads hubs, company, contact and curated category landing pages | explicitly stored canonical path |
| Native `post` | News, company releases and editorial articles | `/news/{slug}/` |
| `product` | Product and system detail | `/products/{slug}/` |
| `market` | Market/application solution | `/markets/{slug}/` |
| `reference` | Project/reference story | `/references/{slug}/` |
| `support_article` | Technical support, installation, training, video and FAQ content | `/support/{topic}/{slug}/` |
| `download` | Public document metadata and file relationship | `/downloads/{slug}/` |

`site_settings` remains internal and non-public.

### Taxonomies

| Taxonomy | Applies to | Purpose |
|---|---|---|
| `product_category` | `product` | Manual, corded, rods, Roman blind, roller blind, motorised, recessed and accessories hierarchy |
| `product_series` | `product` | GDHE product family or series |
| `installation_type` | `product` | Ceiling, wall, recessed and other installation grouping |
| `support_topic` | `support_article` | Technical support, installation, training, video and FAQ |
| `document_type` | `download` | Brochure, technical document, installation manual, certificate, order form and safety data |

Markets are editorial landing pages and remain a public content type rather than a product taxonomy.

### Legacy mapping

| Schema 2 type | Schema 3 disposition |
|---|---|
| `service` | migrate to `product` only when explicitly classified |
| `industry` | migrate to `market` |
| `case_study` | migrate to `reference` |
| `material` | move into product specifications/attributes or retain for manual review; never auto-convert to a public page |
| `surface_finish` | move into product finish/options data or retain for manual review; never auto-convert to a public page |
| `testimonial` | manual review; may become a reference quote or reusable module |

Before any write, inventory all legacy posts, terms, relationships and routes. Zero real legacy records permits a no-content migration. Non-zero records require a dry-run mapping, ambiguity report, immutable snapshot, idempotent apply and exact rollback. Unmapped records must fail closed and remain recoverable.

## 4. Product authoring contract

The existing common fields and seven reusable modules remain. Product-specific authoring must add structured fields for:

- product/model code;
- product series and category;
- short positioning statement;
- key features;
- ordered technical specifications with label, value and optional unit;
- article/order numbers with label and market/region qualifier;
- available colours and finishes;
- installation options;
- operating and control options;
- compatible motors, controls, accessories and related products;
- applicable markets;
- related references;
- related downloads;
- product gallery and video;
- inquiry CTA.

Arbitrary product specification blobs are not allowed. Technical specifications and article numbers must have bounded, machine-readable structures.

## 5. Other authoring contracts

- `market`: summary, benefits, relevant requirements, related products, references, downloads and CTA.
- `reference`: market, location, challenge, solution, related products, gallery, results and CTA.
- `support_article`: support topic, problem/goal, ordered instructions or safe content modules, video, related products and downloads.
- `download`: title, document type, version, issue date, locale, public file, related products/markets and optional description.
- Navigation remains separately curated. Product types and taxonomies are content sources, not automatic menu truth.

## 6. Public DTO and relationship contract

Preserve the verified REST-first, UUIDv4, safeHtml, canonical-path, stable-error, cache-header and fail-closed boundaries.

Schema 3 relationship keys are:

- `products`
- `markets`
- `references`
- `support_articles`
- `downloads`

Collections, navigation and route manifest must use only Schema 3 eligible published content. Items and `total` must continue to derive from the same complete-envelope and unique-canonical-route eligible set.

## 7. Fixture and validation revision

Replace manufacturing fixtures with deterministic synthetic GDHE-domain fixtures:

- Home
- three Products under one product category for sort/pagination
- one Market
- one Reference
- one Support Article
- one Download with a temporary attachment
- unpublished Product states and the existing full invalid-contract matrix

Required checks:

- representative resolve, collection, navigation and route-manifest Golden responses;
- product category filtering and stable cross-page totals;
- relationships among product, market, reference, support and download;
- structured specifications, article numbers and file DTO validation;
- unknown template/module, invalid canonical path, invalid relation/file and publication-state failures;
- two complete lifecycle runs with different database IDs and identical public Golden hashes;
- refreshed benchmark against Schema 3 representative routes;
- cleanup of posts, revisions, meta, terms, relationships, attachments/uploads, options, users, processes and listeners;
- Core, SCF, database, scope, documentation and governance validation.

## 8. Explicit non-goals

- No Next.js adapter or product page implementation in this revision.
- No Header, Mega Menu, Footer, homepage, visual styling or RapidDirect comparison screenshots.
- No real GDHE product content import.
- No multilingual output, WPML/ACFML, hreflang or RTL.
- No GraphQL, preview, webhook, production cache invalidation, inquiry, deployment or external-state work.
- No commit, push, merge or acceptance until the revised task passes independent review and the user gives the exact delivery instruction.
