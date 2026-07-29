# TASK-013 URL and Canonical Contract

status: `FROZEN_PATH_CONTRACT`
locale: `en`
production_origin: `DEPLOYMENT_GAP`

## 1. Public route map

| Resource | Path |
|---|---|
| Home | `/` |
| Products | `/products/` |
| Product detail | `/products/{product-slug}/` |
| Curtain Track Systems | `/products/curtain-track-systems/` |
| Curtain track subcategory | `/products/curtain-track-systems/{subcategory-slug}/` |
| Accessories | `/products/accessories/` |
| Accessory category | `/products/accessories/{accessory-category-slug}/` |
| Series hub/detail | `/series/`, `/series/{series-slug}/` |
| Applications hub/detail | `/applications/`, `/applications/{application-slug}/` |
| Resources | `/resources/` |
| About GDHE | `/about/` |
| Contact | `/contact/` |
| RFQ workspace | `/request-a-quote/` |

Unconfirmed blog, legal and later-template route words are not silently frozen by this contract.

## 2. Slug rules

- Lowercase ASCII letters, digits and hyphens only.
- `kebab-case`; no spaces, underscores, percent-encoded aliases or dot segments.
- Every public path has a leading and trailing slash.
- Product slugs use the public model as the primary source.
- Internal Article Number, WordPress ID, database ID, Feishu record ID and supplier code are excluded from public URLs.
- `products`, `curtain-track-systems`, `accessories`, `series`, `applications`, `resources`, `about`, `contact` and `request-a-quote` are reserved route words.
- A product slug is unique across public product identities.

Example: public model `FGD X15` becomes `/products/fgd-x15/`.

## 3. Canonical identity

- Each product has exactly one canonical detail path.
- Category, series, application, search, filtering and referral contexts do not create another canonical product URL.
- Product category/series/application relationship changes do not change the product canonical.
- Article Number and option selection do not change the canonical and must not create indexable parameter URLs.
- HTML canonical, Open Graph URL, route manifest, Sitemap and internal absolute links use the same canonical path source.

## 4. Origin composition

Absolute URLs are composed as:

`PUBLIC_SITE_ORIGIN + canonicalPath`

The production value is not yet known. It remains a deployment gate:

- do not hard-code an example or WordPress origin;
- Local, Preview and Staging use their own controlled origins and are `noindex`;
- formal deployment requires one user-confirmed HTTPS origin;
- WordPress admin/REST, Local, Preview and Staging origins are never production canonical origins.

## 5. Lifecycle and status behavior

| State | HTTP behavior | Canonical/index behavior |
|---|---|---|
| Published active | 200 | Self-canonical; indexability depends on environment/public SEO eligibility |
| Published active with incomplete quote specs | 200 | Same self-canonical; RFQ remains allowed |
| Published discontinued | 200 | Keeps original self-canonical; replacement is a visible relation, not redirect |
| Draft/private/unpublished | 404 to anonymous visitor | No product canonical, OG or Sitemap entry |
| Unknown path | 404 | Site-level 404 metadata; never falls back to Home |
| Approved slug move | Single permanent redirect to new path | Only destination is canonical and indexable |
| Contract-invalid payload | Controlled failure or last-known-good behavior in future cache contract | Never render a partial or guessed canonical page |

## 6. Redirect rules

- A published slug change requires an approved old-to-new mapping.
- Redirects are single-hop and permanent.
- An old slug cannot be silently reused for another product identity.
- Discontinued products are not automatically redirected to replacements.
- Query strings and fragments do not define canonical identities.
- Redirect storage, cache invalidation and production migration are follow-up implementation/deployment work.

## 7. Primary Breadcrumb consistency

The product’s stored primary category supplies the stable Breadcrumb. Visiting from another category, series, application or related-product module never rewrites the Breadcrumb or canonical path.

## 8. English-only boundary

- English uses the root paths above without a locale prefix.
- No `/fr/`, `/de/`, `/es/`, `/zh-CN/`, `/ar/`, `/hi/`, `/ja/` or `/pt/` routes are created now.
- No hreflang or alternate URL is emitted until real translations pass the later maturity gates.
