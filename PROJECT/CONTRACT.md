# Project Contract

schema_version: DPG-3

## Identity

- Project: GDHE multilingual B2B company website.
- Project type: software and managed-content platform.
- Primary audience: overseas customers evaluating GDHE products and submitting requests for quotation.

## Stable Goal

Deliver a fast, accessible, search-friendly multilingual website in which GDHE can manage approved business content through Headless WordPress while the independent frontend owns the public experience and conversion path.

## Scope

- Public company, product, market, reference, support, download, editorial, contact and request-for-quotation experiences.
- Structured content, publication state, media, SEO data, localization relationships and controlled public APIs managed through WordPress.
- English source content plus independently edited and published French, German, Spanish, Simplified Chinese, Arabic, Hindi, Japanese and Portuguese content.
- Reusable frontend templates and components that consume versioned public contracts.

## Non-Goals

- A second content-management backend, a public WordPress theme frontend, or an Elementor-based public site.
- E-commerce checkout, payment, confirmed orders, automatic commercial quotation, customer accounts, CRM or production-management functions unless separately approved.
- Copying RapidDirect source code, private themes, trademarks, media, fonts or prose.
- Treating machine translation, test data or internal product media as approved public content.
- Production publication or deployment without separate explicit authorization.

## Project Invariants

- The public frontend and Headless WordPress remain separate systems; `wp-admin` is the only final content-management interface.
- GDHE-owned frontend code owns public rendering. GDHE-owned WordPress extensions own the CMS content model and controlled API projection; WordPress Core and third-party extensions are not modified directly.
- RapidDirect is evidence for visible information architecture and experience patterns only; all public identity, content and media remain GDHE-owned or explicitly authorized.
- English is the source locale. Every other locale is edited, reviewed and published independently; unpublished translations produce neither a public page nor hreflang output. Arabic must support RTL semantics and interaction.
- Public consumers receive only validated, versioned and explicitly allowed data. Internal identifiers, credentials, private media, backups and runtime state never become public or enter source control.
- The request-for-quotation flow is an intake process, not an order, checkout, payment or final quotation system.

## Long-Term Quality Baseline

- Public behavior must remain accurate to approved content and stable business contracts.
- Public experiences must remain accessible, responsive, locale-correct, RTL-capable, secure and search-engine coherent.
- Contract changes are versioned or backward-compatible and include risk-matched verification.
- Production-facing or external-system changes require a recoverable path and real read-back evidence.

## Authorization Boundaries

- Real customer data, production content publication, production deployment and external-system writes require separate explicit authorization.
- New paid services, plugins, infrastructure or commercial integrations require separate approval before adoption.
- Test fixtures and local demonstrations cannot be represented as production facts.
