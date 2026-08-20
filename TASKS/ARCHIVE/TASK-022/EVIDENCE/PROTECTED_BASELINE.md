# TASK-022 Protected Baseline

Captured: 2026-08-05 before TASK-022 product implementation
Branch: `codex/TASK-022-quote-basket-foundation`
HEAD: `8ebaba40ddb47de0f55594591e628d7a8a3a0253`

## Exact protected hashes

| path | SHA-256 |
| --- | --- |
| `frontend/package.json` | `958e8c8937ef092c75295e8a09de6062059df431e3419a70b5b661706ac02bce` |
| `frontend/package-lock.json` | `dda25a9069e1c1b41c4f94393a54d3e9eb3dcfea158fc2b6bbdf06cc1cb852a7` |
| `frontend/src/types/product-configurator.ts` | `b2aec5fa8fe5d4ace7f75d18b206cdb250b440d621fafa130e51c1bcff9ae74d` |
| `frontend/src/lib/product-configuration/v2/build-public-draft.ts` | `42de15dcac21247e8d4635565044a7379c4f50f68b14b735a701d1f6e4216c97` |
| `frontend/src/components/product-configurator/index.tsx` | `7f9ef40381f0c8e41d2eccb3012af280c0325f8f24e2bcf5e83adb22ceeed8c3` |
| `frontend/src/components/product-configurator/product-configurator.module.css` | `7d514d5fa4920c08a4e6849f6a7b8b3b2f8b656f65f77305c0f1cb84aee16407` |
| `frontend/src/app/products/fgd-x15-pvc/page.tsx` | `0a4b9fb026fd7d2039095da112cc0169cb3417c98dacdfe48e6ed73c912887d5` |
| `frontend/src/app/products/fgd-x15-pvc/page.module.css` | `464aa7719c3066d5ea8f50c236cc6df46dd32451c25a77519ee7deed57a72d12` |
| `frontend/public/test-candidates/fgd-x15-protected.png` | `9a8ed9fe7145ae582450425be493987ad874d052c176e340d28d7d24bf0d4880` |
| `frontend/src/lib/quote-contract/schemas/quote-line.v1.schema.json` | `1d5a68c6eed68110b055e3fb7fc29668acd4fd7be8b7c030cb93b1179a482d53` |
| `frontend/src/lib/quote-contract/v2/schemas/quote-line.v2.schema.json` | `7b65f339cf3c2a543d28efa2fac40a72497e76fd2400eb41db78d829a910ac20` |
| `frontend/src/lib/quote-contract/index.ts` | `1dc3554c26e564bcd09f86360479659391edda8611587da5d96465bcf65de922` |
| `frontend/src/lib/quote-contract/v2/index.ts` | `d68912b6b3b0576c47febc3d1a27a527bf242a601352d487a6cc81b28e831bc3` |
| `frontend/src/lib/cms/product-configuration-v2-contract/manifest.json` | `eb3b18b89830d7c7679e3f4e474edb4d565c7104c47b4c489881470e7fda3ff9` |
| `frontend/next-env.d.ts` | `7b550dda9686c16f36a17bf9051d5dbf31e98555b30d114ac49fc49a1e712651` |

TASK-022 is authorized to make the minimum direct changes to the current
configurator and product-page files. Their hashes above are before-state
evidence, not a prohibition on authorized changes. Package/lock, QuoteLine
v1/v2, Product Configuration v2 authority, protected image and next-env remain
exactly protected.

## Protected behavior

- Product Configuration v2 public field order and FGD X15+PVC current truth;
- PublicQuoteDraft contains no Article Number/internal UUID;
- QuoteLine v1/v2 bytes and server-future authority;
- Product Detail one resolve plus one configuration request and production 404;
- ProductCard/ProductList existing contracts and routes;
- protected local product image;
- no CMS/database/Feishu mutation;
- no dependency change.

## Existing user-owned exclusions

- `.codex/config.toml` pre-existed as a user modification and remains excluded;
- historical resume packets remain untracked and excluded;
- TASK-021 post-delivery governance closure records remain preserved.
