# TASK-019 Protected Baseline

status: `FROZEN_AT_A1`
baseline_commit: `4a92c0770388d4a198a123a8b667753f39431015`

Aggregate hashes below are SHA-256 over the lexicographically sorted
`shasum -a 256` output, including repository-relative paths.

## Existing CMS contract closures

### Content Schema 3

- count: `19`
- aggregate:
  `471a5dc9e25b5306bdbb6634f462b9ce8634877a4f9da8caee055afec45ab598`
- files:
  - `collection.v3.schema.json`
  - `content-reference.schema.json`
  - `error.schema.json`
  - `file-reference.schema.json`
  - `link.schema.json`
  - `media-reference.schema.json`
  - `modules/accordion.schema.json`
  - `modules/card-grid.schema.json`
  - `modules/cta-banner.schema.json`
  - `modules/data-table.schema.json`
  - `modules/hero.schema.json`
  - `modules/rich-text.schema.json`
  - `modules/split-media.schema.json`
  - `navigation.schema.json`
  - `page.v3.schema.json`
  - `public-path.schema.json`
  - `route-manifest.schema.json`
  - `safe-html.schema.json`
  - `uuid-v4.schema.json`

### ProductCard

- count: `8`
- aggregate:
  `66e118ecb93b7e87766beef3c8dcda0a214ab1ec4af5b15e0c57127e3d770d1a`
- files:
  - `card-action.v1.schema.json`
  - `card-attribute.v1.schema.json`
  - `product-card-collection.v1.schema.json`
  - `product-card.v1.schema.json`
  - `public-path.schema.json`
  - `public-protected-media.v1.schema.json`
  - `public-taxonomy-ref.v1.schema.json`
  - `uuid-v4.schema.json`

TASK-014 authority:

- `PRODUCT_CARD_HANDOFF_MANIFEST.json`:
  `aa7cd391c78ffb7038d8ef233101ceb3ee75e619b1246d1da280cc8c4ba42ccb`
- `PRODUCT_CARD_HANDOFF_CHECKSUMS.sha256`:
  `c363f293c44ffee6b9c3cebbb03ac0e2dab73e9a7910f18b0975a65404962883`

## Existing frontend snapshots and verifiers

- CMS snapshot: `20` files, aggregate
  `aa0a9ef3f8e01576df49bf1895dc58d47835a575d26949c5492ec664d78c5646`
- ProductCard snapshot: `13` files, aggregate
  `f324a64824385e14ab2c359e8d5c0a21af12a79e6a2e63a78c6aa72e156b17b5`
- CMS verifier:
  `5c9edf3c1a3acdd6c876cd300c14f2b1115f3e788a536cca8bb8d435ac31c528`
- ProductCard verifier:
  `02daf7a37a0c5625f9f71d4854546eb9a7142baacf134ed98c4eb8aa4e2e993e`

## Package and runtime/page boundary

- `frontend/package.json`:
  `958e8c8937ef092c75295e8a09de6062059df431e3419a70b5b661706ac02bce`
- `frontend/package-lock.json`:
  `dda25a9069e1c1b41c4f94393a54d3e9eb3dcfea158fc2b6bbdf06cc1cb852a7`
- TASK-016～018 protected runtime/page roots: `27` files, aggregate
  `f50df0cd4f2ba07f0431ae71a20904c55233fd785d0ca02b64958fadd2c1b507`
- protected test image:
  `9a8ed9fe7145ae582450425be493987ad874d052c176e340d28d7d24bf0d4880`
- `frontend/next-env.d.ts`:
  `7b550dda9686c16f36a17bf9051d5dbf31e98555b30d114ac49fc49a1e712651`

The protected runtime/page aggregate covers:

- `frontend/src/lib/cms/server/product-cards/**`
- `frontend/src/lib/cms/server/product-detail/**`
- `frontend/src/lib/product-list/**`
- `frontend/src/lib/product-detail/**`
- `frontend/src/components/product-card/**`
- `frontend/src/components/product-detail/**`
- `frontend/src/app/products/**`
- `frontend/src/types/**`

## Planned additive exceptions

TASK-019 may add its independent Product Configuration files and may make only
the explicitly designed additive registration/version changes to:

- `cms/wp-content/plugins/gdhe-site/gdhe-site.php`
- `cms/wp-content/plugins/gdhe-site/config/schema.v3.json`
- `cms/wp-content/plugins/gdhe-site/includes/public-api.php`

Their A1 hashes are:

- `gdhe-site.php`:
  `bbe78454d5375c999322a6ab42954dafec67d33916ce0f6deab31a9e8a3eb0eb`
- `schema.v3.json`:
  `92c45a16dec70bd43bb47c4c665d6cf49c4c1ab0f17f6f8f27af9036bad4443e`
- `public-api.php`:
  `6313dcc6189433d019d1a3bf8a40de8a7c29cbc76bb8301ac643c2b5c88c9fd8`

Every other baseline path remains protected unless a controlled review finding
authorizes a narrower revision.
