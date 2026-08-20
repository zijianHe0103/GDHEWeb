# TASK-018 Design

status: `FROZEN_FOR_IMPLEMENTATION`

## 1. Minimum vertical slice

TASK-018 adds one English App Router product-detail page at
`/products/fgd-x15-pvc/`. It closes the current local ProductCard navigation
loop with only three visible modules:

1. Product Hero;
2. Product Overview;
3. Key Specifications.

This is a local test-candidate slice. It is not the final product template,
production publication, full RFQ flow or final SEO page.

The page uses one closed request-time mode:

| `GDHE_PRODUCT_DETAIL_MODE` | Non-production behavior | Production behavior |
|---|---|---|
| unset or any other value | framework 404 | framework 404 |
| `preview` | render the frozen local FGD X15+PVC DTO | framework 404 |
| `cms` | call the existing Schema 3 `/resolve` path once | framework 404 |

The route exports `dynamic = "force-dynamic"` and fixed
`noindex,nofollow` metadata. Browser query, route params and request headers
cannot select or change the mode or CMS path.

## 2. Public identity

- public model: `FGD X15+PVC`;
- English working name: `FGD X15+PVC Track`;
- sole detail path: `/products/fgd-x15-pvc/`;
- primary category: `Manual Curtain Tracks`;
- primary category path:
  `/products/curtain-track-systems/manual-curtain-tracks/`.

No `/products/fgd-x15/` second identity or guessed redirect is introduced.
The existing TASK-017 card and the detail page must retain the same path.

## 3. Product Detail DTO

React receives only a new deeply readonly `ProductDetailDto`:

- stable public `id`;
- `model`, `name` and `publicPath`;
- one public protected `image` with width, height and non-empty Alt;
- one primary-category reference;
- one plain-text `overview`;
- exactly five display-ready specification rows;
- one frozen `request_quote` action.

The DTO excludes Article Number, WordPress/database/SCF fields, raw modules,
raw relations, validated wrappers, CMS origin, response metadata, internal
business fields and diagnostics.

The five visible specifications are:

| key | label | display value |
|---|---|---|
| `cross_section` | Cross-section | `28 × 27 mm` |
| `representative_length` | Representative length | `6 m` |
| `installation` | Installation | `Ceiling or wall mount` |
| `track_weight` | Track weight | `155–160 g/m` |
| `pvc_strip_weight` | PVC strip weight | `115 g/m` |

Width and height remain separately validated source values and are combined
only by the server Adapter into the display row. Track and PVC-strip weights
remain distinct.

## 4. Preview and CMS data flow

```text
preview -> frozen local ProductDetailDto ----------------------\
                                                               -> page state -> DTO-only React
cms -> one /resolve -> existing 16-Schema Validator -> Adapter /
```

Preview and CMS therefore share the same presentation DTO and component tree.
There is no second component data shape.

The CMS Adapter accepts only an authentic
`ValidatedCmsPayload<"success">`. For this single candidate it fails closed
unless the validated page is the exact English product identity:

- `type=product`, `templateKey=product`, `locale=en`;
- `publicPath=/products/fgd-x15-pvc/`;
- `title=FGD X15+PVC Track`;
- `details.model=FGD X15+PVC`;
- category includes `manual-curtain-tracks`;
- required confirmed specification keys and units are present once with the
  frozen values;
- installation types include the confirmed ceiling and wall modes;
- a non-empty plain-text positioning/overview is available.

The Adapter may ignore unused validated fields, but it may not guess or expose
them. Any identity, required-value or unit mismatch becomes a sanitized
unavailable page; it is not rendered partially.

## 5. Media boundary

Both modes use the already approved repository test asset:

`/test-candidates/fgd-x15-protected.png`

Frozen SHA-256:

`9a8ed9fe7145ae582450425be493987ad874d052c176e340d28d7d24bf0d4880`

For TASK-018 the CMS Adapter does not forward `featuredMedia` or gallery URLs
to React. This is intentional because the production HTTPS media origin and
Next Image allowlist remain deferred deployment gates. The rendered page must
contain no WordPress origin, `wp-content` URL, raw CMS media URL or external
image preload.

## 6. CTA

The DTO action is:

- mode: `request_quote`;
- label: `Request a Quote`;
- target: `/request-a-quote/`.

The page renders ordinary navigation only. It does not add a quotation line,
collect options or quantity, call an RFQ API, write to Feishu, save or submit
anything. The target page is an honest follow-up gap and may currently return
404.

## 7. Page states

| State | Page behavior |
|---|---|
| `disabled` | framework 404 |
| `ready` | render the three DTO-only modules |
| `not_found` | framework 404, only for validated `gdhe_not_found` HTTP 404 |
| `unavailable` | render a fixed English status without diagnostic detail |

Transport, protocol, Schema, identity, specification, media or unexpected
failures become `unavailable`. A 404 with mismatched code/status also becomes
`unavailable`; it must not masquerade as an unknown product.

CMS mode performs exactly one `/resolve` request for the frozen canonical and
zero ProductCard collection requests, retries or browser WordPress requests.

## 8. Presentation and responsive behavior

- constrained industrial B2B layout using the existing off-white, charcoal
  and GDHE-yellow visual vocabulary;
- Hero uses a two-column media/content composition at wide widths and stacks
  at narrow widths;
- the protected square image remains contained on a dark media surface;
- one clear H1, model/category hierarchy and visible local test notice;
- Overview uses a readable text measure;
- Specifications use a semantic `dl` or table-like definition layout that
  reflows without horizontal scrolling;
- CTA is at least 44 CSS px high and has visible hover and `:focus-visible`;
- image Alt is non-empty and describes the protected track cross-section.

Acceptance viewports are 1440, 1024, 768 and 390 px, with separate 320 CSS px
reflow proof. These are evidence widths, not mandatory breakpoint values.

## 9. TDD seams

1. **Mode and identity:** only non-production `preview|cms` enables the single
   canonical; production, unknown and unset fail closed.
2. **Adapter:** authentic validated exact FGD X15+PVC input maps to the frozen
   DTO; raw/forged wrappers, wrong identity, missing/duplicate/mismatched specs
   and installation mismatch fail closed without leakage.
3. **Loader/orchestration:** preview uses zero network; CMS uses one fixed
   `/resolve` and zero ProductCard requests; normalized not-found differs from
   every unavailable failure.
4. **Presentation:** Hero, Overview, five specifications, Alt, local notice
   and navigation-only CTA render from DTOs only.
5. **Built runtime:** production build/start keeps the detail route 404 even
   when either local mode is requested and performs zero CMS requests.

Each production slice requires an observed missing-behavior RED before the
minimum GREEN. Existing Transport, Validator and contract snapshots are reused
without modification.

## 10. Deferred gates

- full Article Number/variant/options/quantity and quotation workspace;
- related accessories, installation downloads, gallery, video and later
  detail modules;
- WordPress product creation/import and real CMS page population;
- final product copy and complete 10–20 product validation;
- normalized lifecycle/SeoDocument, canonical/OG/Schema/Sitemap and indexing;
- production media origin/allowlist, Preview, Staging, cache and deployment;
- Header, Footer, multilingual routes and all non-English content.
