# TASK-013 Planner Baseline Traceability

## Confirmed inputs

| contract area | confirmed fact | evidence status | source |
|---|---|---|---|
| Public locale | English is the only current public locale; no language switch or synthetic locale URLs | `CONFIRMED_RULE` | ADR-006; architecture contract sections 6 and 14 |
| Product identity | One product has one canonical detail identity even when it belongs to multiple series and applications | `CONFIRMED_RULE` | TASK-012 real-product validation gate |
| Product source | Feishu owns structured product master data; WordPress owns marketing copy, SEO, protected public media and modules | `CONFIRMED_RULE` | TASK-012 real-product validation gate |
| Public read path | Feishu → controlled sync → WordPress read-only mirror → GDHE REST API → Next.js | `CONFIRMED_RULE` | TASK-012 real-product validation gate |
| Normal CTA | `Request a Quote`; add configured item to a multi-product quotation request, not checkout/payment | `CONFIRMED_RULE` | architecture contract section 9 and TASK-012 |
| Discontinued CTA | Preserve the product URL and use `Contact Us for Replacement` | `CONFIRMED_RULE` | architecture contract sections 9 and 14 |
| Accessory identity | Small accessories can appear in an accessory directory and RFQ without individual SEO detail pages; complex tape/bead products can have detail pages | `CONFIRMED_RULE` | TASK-012 real-product validation gate |
| Quantity | Every RFQ line requires quantity greater than zero; public units are piece/roll/item by category | `CONFIRMED_RULE` | TASK-012 real-product validation gate |
| Media | Public pages only receive business-prepared protected images; internal originals never enter the website chain | `CONFIRMED_RULE` | TASK-012 real-product validation gate |
| Product cards | Collection cards must be returned as a batch projection; per-card `/resolve` and raw WordPress/SCF consumption are forbidden | `CONFIRMED_RULE` | ADR-006; architecture contract section 14 |
| SEO | Technical SEO enters the definition of done with the first formal template; content SEO remains iterative | `CONFIRMED_RULE` | ADR-006; architecture contract sections 7 and 14 |
| Test products | Existing sample records validate contracts only and are not the final production catalog | `CONFIRMED_RULE` | TASK-012 real-product validation gate |
| Production gate | 10–20 final traceable production products are mandatory before batch import, product-template business freeze or Schema business freeze | `PRODUCTION_DATA_GATE` | ADR-006; architecture contract section 14 |

## Technical baseline

| technical fact | evidence status | consequence for TASK-013 |
|---|---|---|
| CMS transitive contract graph is 19 files; frontend `/resolve` closure is 16 files | `CURRENT_TECHNICAL_FACT` | Preserve scope distinction; do not label three CMS-only contracts as missing frontend files |
| TASK-011 proves one fixed English `/resolve` path through Transport → Validator → Adapter → local visible integration page | `CURRENT_TECHNICAL_FACT` | It proves connectivity, not product card collections, IA or formal page templates |
| Collection, navigation and route-manifest exist on the CMS side | `CURRENT_TECHNICAL_FACT` | Specialist audits must determine whether their current fields are sufficient; Planner must not assume sufficiency |
| Current Transport is server-only, no-store, 5000 ms and zero retry | `CURRENT_TECHNICAL_FACT` | TASK-013 does not reopen Transport or design production cache behavior |

## Questions that may require user confirmation

These are not decided by this baseline:

1. Exact English top-level navigation labels and their public order.
2. Exact product directory labels and whether a product-category landing page differs from a product-series landing page in the first visible release.
3. Exact route words and slug policy, including whether the public root is `/products/` and how category/series/application contexts are represented.
4. Which classification supplies the visible breadcrumb when a product belongs to multiple series/applications.
5. Which 2–3 existing samples may be shown in TASK-014 local-only pages as `TEST_CANDIDATE`.
6. Public canonical origin/domain.
7. Ownership and readiness of English short descriptions, SEO titles/descriptions and image Alt text.

## Planner rule

Specialist technical findings can close technical questions. Any answer that changes public product identity, taxonomy meaning, route naming, CTA behavior or business-owned English content remains `USER_CONFIRMATION_REQUIRED`.
