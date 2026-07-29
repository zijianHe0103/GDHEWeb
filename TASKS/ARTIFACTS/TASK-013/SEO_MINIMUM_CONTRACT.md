# TASK-013 Minimum English SEO Contract

status: `TARGET_CONTRACT_FROZEN_IMPLEMENTATION_PENDING`
locale: `en`
production_origin: `DEPLOYMENT_GAP`

## 1. Output authority

Next.js is the only public HTML SEO-output authority. WordPress supplies normalized content inputs; it does not emit a second public canonical, robots, Open Graph or JSON-LD authority.

`SeoDocument` is a server-only validated domain object. It is not raw WordPress/SCF JSON and does not accept arbitrary CMS-authored JSON-LD.

## 2. Minimum domain shape

```ts
type EnglishSeoDocument = {
  locale: "en";
  pageState: "active" | "discontinued";
  canonicalPath: CanonicalPublicPath;
  title: string;
  description: string;
  robots: "index,follow" | "noindex,nofollow";
  openGraph: {
    title: string;
    description: string;
    urlPath: CanonicalPublicPath;
    type: "website";
    image: PublicSeoImage | null;
  };
  breadcrumbs: readonly BreadcrumbItem[];
  jsonLd: {
    webPage: AllowedWebPageInput;
    breadcrumbList: AllowedBreadcrumbInput;
    product: AllowedProductInput | null;
  };
};
```

## 3. Required fields and failure behavior

| Input | Rule | Missing/invalid behavior |
|---|---|---|
| `locale` | Exactly `en` | Contract failure |
| `pageState` | Known normalized public lifecycle | Contract failure |
| `canonicalPath` | Decision 2 path contract | No indexable page |
| `title` | Non-empty English, template length checks later | No indexable page |
| `description` | Human-approved English summary/SEO description | No indexable page |
| `robots` | Derived from environment and publication/index policy | Fail to `noindex,nofollow` |
| OG title/description | Normalized English values | No indexable formal template |
| OG URL path | Exactly canonical path | Contract failure |
| OG image | Public protected image only | Omit OG image if optional; product publication media gate remains separate |
| Breadcrumbs | Stable Decision 3 trail; final item equals current page | No indexable formal template |
| JSON-LD | Allowlisted typed inputs only | Omit invalid optional Product block; never inject arbitrary JSON |

## 4. Origin

Absolute canonical and `og:url` are composed from `PUBLIC_SITE_ORIGIN + canonicalPath`.

- Production origin is not yet confirmed.
- Local/Preview/Staging use their own controlled origins and are always `noindex`.
- WordPress/CMS origin is never used in public canonical output.
- Production deployment is blocked until one HTTPS origin is confirmed.

## 5. Page-state matrix

| State/environment | HTTP | Robots | Canonical/aggregation |
|---|---:|---|---|
| Production public active | 200 | `index,follow` when content/SEO eligibility passes | Self-canonical; may enter route manifest/Sitemap |
| Production public active with incomplete quote specs | 200 | Same as other active pages | Self-canonical; RFQ remains available |
| Production public discontinued | 200 | `index,follow` when retained content remains valid | Keeps original canonical; replacement is a link, not redirect |
| WordPress draft/private/unpublished | 404 anonymous | No page robots/canonical | Excluded |
| Unknown route | 404 | Site-level error policy | Excluded |
| Approved moved route | Permanent redirect | Target controls robots/canonical | Only target aggregated |
| Local/TEST_CANDIDATE | 200 test page | `noindex,nofollow` | Excluded from public aggregation |
| Preview/Staging | 200 authorized/test | `noindex,nofollow` plus private/no-store where applicable | Excluded |
| Invalid normalized contract | Controlled unavailable/last-known-good future behavior | Never becomes indexable partial page | Excluded |

Quote-spec completeness does not determine indexability. Publication, environment, content value and the SEO contract do.

## 6. Breadcrumb

Product detail:

`Home > Products > Primary Product Group > Primary Subcategory > Product Model`

- first item is Home `/`;
- last item is current title/canonical path;
- middle items are real canonical hubs;
- visible Breadcrumb and `BreadcrumbList` use one data source;
- entry from series/application does not rewrite the trail.

## 7. Open Graph and media

- Only business-prepared public protected images can enter OG.
- Internal originals never enter WordPress, API, Next.js, cache or build output.
- Non-decorative images require meaningful English `alt`.
- Decorative images require `alt=""` and an explicit decorative state.
- Filename, global attachment text or model name is not an automatic alt fallback.

## 8. JSON-LD allowlist

Required/allowed first-template types:

- `WebPage`;
- `BreadcrumbList`;
- conditional `Product` on a canonical product detail.

Product inputs can include confirmed public:

- name;
- model;
- description;
- protected image;
- category;
- GDHE organization/brand only after its public organization contract is confirmed.

Do not output:

- price, `Offer`, inventory or availability claims;
- ratings/reviews;
- fabricated SKU/Article Number;
- supplier/manufacturer facts not confirmed for public use;
- arbitrary CMS JSON.

B2B RFQ is not an online offer. Variant/Product rich-result mapping remains a later production-data validation item.

## 9. Canonical and redirect invariants

- Self-canonical only.
- Product filters, series/application entry, options and RFQ context do not create canonical variants.
- Approved slug changes use one permanent redirect.
- Discontinued products retain their canonical.
- 404 never falls back to Home.

## 10. English-only boundary

- `<html lang="en">`.
- No non-English routes, alternates, hreflang or `x-default`.
- No placeholder locale map.
- Future languages require real published sibling mapping and ADR-006 maturity gates.

## 11. Technical SEO definition of done for the first formal template

- validated server-only `SeoDocument`;
- correct HTTP/page-state behavior;
- rendered title, description, absolute self-canonical, robots and OG;
- visible Breadcrumb and matching `BreadcrumbList`;
- allowlisted, injection-safe JSON-LD;
- protected media/alt behavior;
- Local/Preview/Staging/test-candidate noindex proof;
- no non-English alternates;
- rendered-output automated tests.

Content SEO—final keywords, production copy, internal-link strategy, editorial schedule and ranking—is iterative and not claimed complete.
