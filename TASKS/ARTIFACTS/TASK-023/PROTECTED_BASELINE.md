# TASK-023 Protected Baseline

Captured: 2026-08-06 before TASK-023 product implementation
Branch: `codex/TASK-023-related-products-progressive`
HEAD/main/origin-main: `6c5b7644c8bbabf8771223eb7baadb2964498e6b`

## Exact hashes

| path | SHA-256 |
| --- | --- |
| `frontend/package.json` | `958e8c8937ef092c75295e8a09de6062059df431e3419a70b5b661706ac02bce` |
| `frontend/package-lock.json` | `dda25a9069e1c1b41c4f94393a54d3e9eb3dcfea158fc2b6bbdf06cc1cb852a7` |
| `frontend/next-env.d.ts` | `7b550dda9686c16f36a17bf9051d5dbf31e98555b30d114ac49fc49a1e712651` |
| `frontend/public/test-candidates/fgd-x15-protected.png` | `9a8ed9fe7145ae582450425be493987ad874d052c176e340d28d7d24bf0d4880` |
| `frontend/src/app/products/fgd-x15-pvc/page.tsx` | `ada3359d4c29fd3c234106fd254367995bea6a60621dee95883ed8084f43105b` |
| `frontend/src/lib/product-detail/load.ts` | `4313cb3dc80f6ab5103ef3777212aa75ea69413d2381bb7790c477152b08a3ca` |
| `frontend/src/types/product-card.ts` | `137318f4f862c63acbef468738f28068fb9dc6776f8d1d5fc3c290fb29324f26` |
| `frontend/src/types/quote-basket.ts` | `48d9ee4d6f40c3143b590e3024426ed78c19d416278d35fe399b55b60fa3eea8` |
| `frontend/src/lib/quote-contract/schemas/quote-line.v1.schema.json` | `1d5a68c6eed68110b055e3fb7fc29668acd4fd7be8b7c030cb93b1179a482d53` |
| `frontend/src/lib/quote-contract/v2/schemas/quote-line.v2.schema.json` | `7b65f339cf3c2a543d28efa2fac40a72497e76fd2400eb41db78d829a910ac20` |
| `frontend/src/lib/cms/product-card-contract/manifest.json` | `0b87390c354bbccabbee86473db206015f9a9b8187d3451f7287211c748fd254` |
| `frontend/scripts/verify-product-card-contract.mjs` | `02daf7a37a0c5625f9f71d4854546eb9a7142baacf134ed98c4eb8aa4e2e993e` |
| `cms/wp-content/plugins/gdhe-site/gdhe-site.php` | `404ce03faf17326437e970adea971dda0289684cada94f3d94861d92faa5294e` |
| `cms/wp-content/plugins/gdhe-site/includes/public-api.php` | `739c7584733dbb60a98e1de43c17bc46264c2b7fea9623e8e643ed7dbb37cdea` |
| `cms/wp-content/plugins/gdhe-site/includes/product-cards.php` | `7f40419c825d4f3cb5ff395179966f9c49b5369fdca70c50051306e4715dfa95` |
| `cms/wp-content/plugins/gdhe-site/config/field-groups.v3.json` | `775bd2547b95550dc6fa1adbb65d2cc2e11523beb32dc0920f17d8ddd0c00c0d` |
| `cms/wp-content/plugins/gdhe-site/config/schemas/product-card-collection.v1.schema.json` | `c842e7c899446b4ddaa37f33128144f8d8f9eb7bd9e9704926e3a5131e12847a` |
| `cms/wp-content/plugins/gdhe-site/config/schemas/product-card.v1.schema.json` | `615e6dd00c33e3b1b366a1640ccc5300b93d5733413be63b24e7853f5d1dec7a` |
| `TASKS/ARTIFACTS/TASK-014/PRODUCT_CARD_HANDOFF_MANIFEST.json` | `aa7cd391c78ffb7038d8ef233101ceb3ee75e619b1246d1da280cc8c4ba42ccb` |
| `TASKS/ARTIFACTS/TASK-014/PRODUCT_CARD_HANDOFF_CHECKSUMS.sha256` | `c363f293c44ffee6b9c3cebbb03ac0e2dab73e9a7910f18b0975a65404962883` |
| `frontend/src/lib/quote-basket/browser.ts` | `8c34aeafcf28cc36d0df498f938b4cacb38b6aaab9b5fdf2f557f2ccc8dca481` |
| `frontend/src/lib/quote-basket/domain.ts` | `f12ab94025100b0d1c048eaaad0cd71a77b3fdc6c44a4b74be1fe6ce9efa6af4` |
| `frontend/src/lib/quote-basket/index.ts` | `45c0e23a38e778c4f8a5885b1b8615d4856e06ce879514b3ea9701e22a8a2e32` |
| `frontend/src/lib/quote-basket/storage.ts` | `80d2df486474c8d5bc6769bc16927fbc744417425e990a306391b809b7525da8` |
| `frontend/src/lib/quote-basket/use-quote-basket.ts` | `403f36a1bb4c584994b34baf18a112cd83c9db8e65564072625d6f1a8c08a376` |
| `frontend/src/components/quote-basket/index.tsx` | `ae3c18d85caa357f3ffc2fb2c37154c254523d72dfa46ebde0907caca24dce96` |
| `frontend/src/app/request-a-quote/page.tsx` | `3237ac873eda1eee33c65200abf5ce6ff11266d9a982b8b5ed2c4895ab5cec2a` |

## Authorized future changes

TASK-023 may add the separate related-product contract/API/frontend consumer and a new Quote Basket 2.0 contract. Existing ProductCard 1.0, QuoteLine v1/v2, TASK-014 authority, protected FGD image, package/lock and Quote Basket v1 authority samples remain byte-protected. Existing quote-basket implementation files above are before-state evidence and may change only as needed to support additive v2/migration while preserving all v1 regressions.

## Existing exclusions

- `.codex/config.toml` and `frontend/tsconfig.json` had pre-existing user/local changes and remain excluded.
- TASK-021/TASK-022 post-delivery governance edits and historical resume packets remain preserved and excluded.
