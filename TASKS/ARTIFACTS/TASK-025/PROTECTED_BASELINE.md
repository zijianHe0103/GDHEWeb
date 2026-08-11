# TASK-025 Protected Baseline

captured_at: 2026-08-11T06:46:18Z
baseline_commit: a048a96b2d5af321234b9e51be9adf991510f85a

The following hashes capture current shared bytes. Rows marked frozen must remain exact. Shared version-dispatch/runtime files may change only when the task explicitly requires a minimal additive seam and must be disclosed separately.

## Frozen bytes

```text
349cfbc1635120bd0f14fd93e6bb01deb5ad8ab74767cfdcf9cf90a114e529f8  TASKS/ARTIFACTS/TASK-024/RFQ_SUBMISSION_CONTRACT.md
90413acdbf02e75b61a497e9a9125cad647ac70f61c9b9059f501c84fc2e51d7  TASKS/ARTIFACTS/TASK-024/IMPLEMENTATION_SEQUENCE.md
958e8c8937ef092c75295e8a09de6062059df431e3419a70b5b661706ac02bce  frontend/package.json
dda25a9069e1c1b41c4f94393a54d3e9eb3dcfea158fc2b6bbdf06cc1cb852a7  frontend/package-lock.json
f3facbcab7c12c4ee775a4ca9ba4f34d906ff79c49d5c02f0c97503e6775ce31  frontend/tsconfig.json
7b550dda9686c16f36a17bf9051d5dbf31e98555b30d114ac49fc49a1e712651  frontend/next-env.d.ts
0fb78fa7f12d479b02a8a347305cf0928dd0987ded4158da7051414a15f07eb3  frontend/src/lib/quote-basket-contract/v2/schemas/quote-basket.v2.schema.json
7b65f339cf3c2a543d28efa2fac40a72497e76fd2400eb41db78d829a910ac20  frontend/src/lib/quote-contract/v2/schemas/quote-line.v2.schema.json
90285bab8483304aa2609f2b31f77ad54ab48732e6979ad8d5616b619e127472  cms/wp-content/plugins/gdhe-site/config/schemas/product-configuration.v2.schema.json
c9da8e10de98c9bc3eb1cb2775afdc81e4b05ef9b397b75b2c1c234a7b91381e  cms/wp-content/plugins/gdhe-site/config/schemas/article-number-option.v1.schema.json
fca2da467f07f385d4b2a7d26beeb7be1b8840edd816141c5d583d6a7085cfa2  cms/wp-content/plugins/gdhe-site/config/schemas/related-product-card-item.v1.schema.json
d7ef6b4d67a8fed2fe6d0751ede3f83d2b17f9e4fddc7e3f4d1584b7cac71d06  cms/wp-content/plugins/gdhe-site/config/schemas/related-product-card-collection.v1.schema.json
```

## Additive shared seams — baseline for declared comparison

```text
b2aec5fa8fe5d4ace7f75d18b206cdb250b440d621fafa130e51c1bcff9ae74d  frontend/src/types/product-configurator.ts
50eb85417282c8424704614a0a629228eb84d11cc8ab2b08100f0d12b5eadfaf  frontend/src/types/product-configuration-v2.ts
48d9ee4d6f40c3143b590e3024426ed78c19d416278d35fe399b55b60fa3eea8  frontend/src/types/quote-basket.ts
0c2b862ba7ddba8ff8ae3aa26a41e07057f5a79d968a572e00ed9d61b96b43f1  frontend/src/types/quote-basket-v2.ts
42de15dcac21247e8d4635565044a7379c4f50f68b14b735a701d1f6e4216c97  frontend/src/lib/product-configuration/v2/build-public-draft.ts
5982287e793e632f1939622eca871cd14f5f9f0c0fccb745dee9fc482e1483bc  frontend/src/lib/product-configuration/v2/public-configurator.ts
01dd97dcbbee997a4ef9f8cd3e7396f224eae430c89d987b58c30d97dd95acf0  frontend/src/lib/quote-basket/v2/index.ts
18e6cf91dbc3c2f3c64f219bfef79ac89764f1355788d2992e597497683096ac  frontend/src/lib/cms/server/product-configurations-v2/adapter.ts
12b42a225297bfe0e8fb490bf61ea8c73b6ad815ba535f60e35e4105aad569b2  frontend/src/lib/related-products/public-view.ts
96ff1b32ef6c9838aa5d48c4ca5271368ad8db57db089107da4f8d309f65a629  frontend/src/types/related-products.ts
404ce03faf17326437e970adea971dda0289684cada94f3d94861d92faa5294e  cms/wp-content/plugins/gdhe-site/gdhe-site.php
739c7584733dbb60a98e1de43c17bc46264c2b7fea9623e8e643ed7dbb37cdea  cms/wp-content/plugins/gdhe-site/includes/public-api.php
4880e2cd388ec6b21fdf6d88ba042246ae595e393f925be42ffb24020032b620  cms/wp-content/plugins/gdhe-site/includes/product-configurations-v2.php
3ce6a1f96f5819bc976cf590fb5cfefc317c4703667610606160f22b492aa599  cms/wp-content/plugins/gdhe-site/includes/related-product-cards.php
```

Historical resume packets, `.codex/config.toml`, TASK-021..024 closure edits and unrelated user-owned work remain outside TASK-025 delivery.
