# TASK-013 English IA and Page Type Map

status: `FROZEN_FOR_ENGLISH_CONTRACT`
locale: `en`

## 1. Authority and boundary

This map freezes the English information architecture confirmed in TASK-013. Forest is only a product-directory organization reference and RapidDirect is only a layout/conversion reference. GDHE product facts, confirmed business rules and the WordPress/Feishu authority split remain controlling.

This document does not import products, implement navigation, publish pages, enable another locale or prove the final production catalog.

## 2. Primary navigation

| Order | Label | Role | Target |
|---:|---|---|---|
| 1 | Products | Product discovery and canonical product entry | `/products/` |
| 2 | Applications | Application-led discovery without duplicating product identity | `/applications/` |
| 3 | Resources | Downloads, articles and support resources | `/resources/` |
| 4 | About GDHE | Company information and trust content | `/about/` |
| 5 | Contact | General and replacement contact | `/contact/` |
| CTA | Request a Quote | Global B2B multi-product RFQ workspace | `/request-a-quote/` |

`Request a Quote` is a separate primary button, not a normal menu item. English is the only public locale, so the current shell does not render a language switcher.

## 3. Products Mega Menu

### Curtain Track Systems

- Manual Curtain Tracks
- Motorized Curtain Tracks
- Medical Curtain Tracks
- S-Fold / Ripplefold Systems
- Roman Rods & Special Systems

### Accessories

- Mounting Brackets
- End Caps
- Runners
- Curtain Tapes
- Bead Chains
- Motors & Controls

The menu is curated. It must not automatically expose every WordPress taxonomy record.

## 4. Page types and hierarchy

| Page type | Parent/discovery role | Canonical path shape | Product identity rule | Primary CTA |
|---|---|---|---|---|
| Home | Root | `/` | None | Request a Quote |
| Products hub | Primary product directory | `/products/` | Lists normalized cards only | Browse products |
| Product group | Curtain systems or accessories | `/products/{group-slug}/` | Discovery only | Browse products |
| Product subcategory | Category-level listing | `/products/{group-slug}/{subcategory-slug}/` | Discovery only | View Product / direct small-accessory RFQ |
| Product detail | One public model identity | `/products/{product-slug}/` | Exactly one canonical detail identity | Request a Quote |
| Series hub/page | Cross-category discovery | `/series/`, `/series/{series-slug}/` | Links to the existing product canonical | View Product |
| Applications hub/page | Use-case discovery | `/applications/`, `/applications/{application-slug}/` | Links to the existing product canonical | View Product / Request a Quote |
| Resources hub | Resource discovery | `/resources/` | None | Context-specific |
| Download/resource | Current public document or support content | Frozen by its future page contract | Does not duplicate product identity | Download / Contact |
| About GDHE | Company content | `/about/` | None | Contact / Request a Quote |
| Contact | General and replacement enquiry | `/contact/` | Carries product context outside the canonical URL | Submit contact request |
| RFQ workspace | Multi-product B2B quotation request | `/request-a-quote/` | Contains RFQ lines, not orders | Submit quotation request |
| Blog list/detail | Editorial discovery and detail | Route wording remains a later page-template contract | None | Context-specific |
| Legal page | Privacy/terms/cookie content | Exact labels and paths require legal content | None | None |
| 404 | Unknown or unpublished public route | Non-canonical error response | Never substitutes Home | Navigate to valid hub |

## 5. Product identity and discovery

- A product may belong to multiple series and applications.
- A product has one stable public identity and one canonical detail path.
- Category, series, application and related-product cards always link to that canonical path.
- Article Numbers represent real quoteable rows/configurations but do not create product detail pages or public URLs.
- Curtain tapes, bead chains, motors/controls and other complex-spec products use a canonical detail page.
- Mounting brackets, end caps, runners and other small accessories may be directory items without independent SEO detail pages. They can be directly added to an RFQ only after their required public selections and quantity are valid.

## 6. Stable Breadcrumb ownership

Product details always use:

`Home > Products > Primary Product Group > Primary Subcategory > Product Model`

Each public product stores exactly one primary category that is also one of its real public category relationships. The frontend must not derive it from the current entry page, sort order or first relation.

Series and application pages use:

- `Home > Series > Series Name`
- `Home > Applications > Application Name`

## 7. Footer minimum IA

The first English footer mirrors already-confirmed public destinations:

- Products: Products hub, Curtain Track Systems, Accessories.
- Discover: Applications, Series.
- Resources: Resources hub and later confirmed editorial/download pages.
- Company: About GDHE, Contact.
- Conversion: Request a Quote.
- Legal: only pages for which approved legal content and paths exist.

Exact legal labels and unconfirmed resource/blog route words remain content/template gaps; the footer must not invent them.

## 8. Responsive and accessibility contract

- Desktop Mega Menu becomes a controlled mobile disclosure/navigation tree.
- Navigation hierarchy and destinations remain identical across viewports.
- Keyboard, focus management, Escape behavior and screen-reader labels are required when implemented.
- Acceptance viewports are 1440, 1024, 768 and 390 px, with an additional 320 CSS px reflow check.

## 9. Deferred

- Final production catalog membership and the 10–20 production-product gate.
- Exact blog, download, legal and other later-template route words.
- Non-English navigation, language switcher, hreflang and RTL.
- Navigation API implementation and parent/child emission.
