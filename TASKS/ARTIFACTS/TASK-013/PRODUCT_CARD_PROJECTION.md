# TASK-013 Normalized Product Card Projection

status: `TARGET_CONTRACT_FROZEN_IMPLEMENTATION_PENDING`

## 1. Purpose

Product lists must consume one versioned, closed, normalized collection projection. They must not consume raw WordPress/SCF fields and must not fetch `/resolve` once per card.

Current Collection v3 items contain only `id`, `type`, `title` and `publicPath`; therefore this target contract requires a separately authorized CMS/API/Schema task before authentic list/card UI.

## 2. Target domain shape

```ts
type ProductCardProjection = {
  id: StablePublicUuid;
  kind: "detail_product" | "catalog_accessory";
  model: string;
  name: string;
  publicPath: CanonicalPublicPath | null;
  image: PublicProtectedMedia;
  primaryCategory: PublicTaxonomyRef;
  series: readonly PublicTaxonomyRef[];
  applications: readonly PublicTaxonomyRef[];
  summary: string | null;
  keyAttributes: readonly CardAttribute[]; // 0..3
  lifecycle: "active" | "discontinued";
  action: CardAction;
  modifiedAt: IsoTimestamp;
};

type PublicProtectedMedia = {
  id: StablePublicUuid;
  url: HttpsUrl;
  width: number;
  height: number;
  alt: string;
};

type PublicTaxonomyRef = {
  id: StablePublicUuid;
  label: string;
  publicPath: CanonicalPublicPath;
};

type CardAttribute = {
  key: string;
  label: string;
  value: string;
  unit: string | null;
};

type CardAction =
  | { mode: "view_product"; label: "View Product"; targetPath: CanonicalPublicPath }
  | { mode: "direct_rfq"; label: "Request a Quote"; targetPath: "/request-a-quote/" }
  | { mode: "replacement_contact"; label: "Contact Us for Replacement"; targetPath: "/contact/" };
```

The notation defines the domain contract, not implementation code or a chosen Schema filename.

## 3. Field contract

| Field | Required | Authority/source | Missing/invalid behavior |
|---|---:|---|---|
| `id` | Yes | Stable public UUID from normalized CMS contract | Exclude item; never fall back to WordPress ID |
| `kind` | Yes | Approved page/catalog policy | Exclude unknown value |
| `model` | Yes | Feishu product master, mirrored read-only in WordPress | Exclude public item |
| `name` | Yes | Confirmed English public name | Exclude public item |
| `publicPath` | Conditional | Canonical route contract | Required for `detail_product`; must be `null` for no-detail accessory |
| `image` | Yes for public card | Business-prepared public protected image managed in WordPress | Exclude public item; no placeholder/internal image |
| `primaryCategory` | Yes | Explicit stored public primary category | Exclude item; frontend must not guess |
| `series` | Yes, may be empty | Normalized approved relations | Invalid target is omitted; never emit dead link |
| `applications` | Yes, may be empty | Normalized approved relations | Invalid target is omitted |
| `summary` | No | Human-authored English summary in `wp-admin` | Emit `null`; frontend omits the block |
| `keyAttributes` | Yes, 0–3 | Category-specific normalized public projection | Reject more than 3 or unknown/unapproved attribute keys |
| `lifecycle` | Yes | Normalized public lifecycle | Exclude unknown state |
| `action` | Yes | Confirmed kind/lifecycle policy | Exclude card if action contradicts kind/state |
| `modifiedAt` | Yes | Normalized public modification timestamp | Contract failure |

## 4. Card content policy

Common visible fields:

- public protected image;
- public model;
- English name;
- optional one-sentence human summary;
- at most three category-specific attributes;
- lifecycle badge when needed;
- one confirmed action.

Category attribute allowlists:

| Category | Candidate keys |
|---|---|
| Track | system type, cross-section `W × H`, standard/custom length |
| Curtain tape | staple material, available widths, spacing/roll-length summary |
| Bead chain | bead type, spacing, roll length |
| Motor/control | confirmed motor type, control method/protocol, compatible system |
| Small accessory | accessory category, material/color, compatible-track summary |

Too many real values can be summarized as `Multiple options`; the full option matrix remains on the detail/RFQ selector. The projection never manufactures a range or Cartesian product.

## 5. Action invariants

- `detail_product` + active -> `view_product`.
- `detail_product` + discontinued -> `view_product` to the retained canonical detail; that detail page uses `Contact Us for Replacement` as its primary CTA to `/contact/`.
- `catalog_accessory` + active -> `direct_rfq`.
- `catalog_accessory` + discontinued -> `replacement_contact` to `/contact/`.
- `catalog_accessory.publicPath` is `null`; it must not link to a fabricated detail.
- Every `detail_product`, regardless of lifecycle, requires a non-null canonical `publicPath`; its image, title and `View Product` action all enter that detail page.
- A published active product remains RFQ-capable even if Article Number is unresolved; card action still routes through the confirmed detail-first or direct-accessory policy.

## 6. Collection transport invariant

For 0, 1 or N cards:

`one collection request -> one envelope validation -> one adaptation pass -> ProductCardProjection[]`

Required proof:

- exactly one collection HTTP request;
- exactly zero per-card `/resolve` requests;
- stable filters, sort, pagination and `total`;
- one JSON parse and fail-closed validation;
- server-only CMS origin and credentials;
- no browser request to WordPress.

## 7. Public eligibility

Only items that satisfy all applicable gates enter the collection:

- source record allowed for website synchronization;
- successful WordPress mirror identity;
- WordPress public status;
- valid normalized card contract;
- public protected image and alt;
- valid primary category;
- canonical route eligibility for detail products;
- valid relation targets.

Incomplete detailed quote specification does not remove an otherwise active public card or RFQ eligibility.

## 8. Explicitly forbidden fields

The projection and frontend DTO exclude:

- WordPress/database/attachment IDs;
- raw `meta`, `acf`, SCF containers or arbitrary attribute bags;
- Feishu record IDs and internal workflow fields;
- supplier, purchase price, cost, margin, internal floor price and inventory;
- customer-specific prices and internal notes/reviews;
- original/internal media paths;
- internal Article Number resolution results not intended for the public card.

## 9. Follow-up implementation boundary

Required later work:

1. versioned CMS/API collection projection and Golden/error fixtures;
2. frontend collection Schema snapshot, authority checksum and runtime validator;
3. server-only collection transport and Adapter;
4. one-request/zero-resolve tests;
5. responsive, accessible card UI.

TASK-013 performs none of those changes.
