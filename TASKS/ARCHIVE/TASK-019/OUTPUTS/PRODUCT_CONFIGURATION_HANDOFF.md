# TASK-019 Product Configuration Handoff

status: `READY_FOR_PLANNER_CHECKPOINT`

## Frozen authority

- handoff: `TASK-019-PRODUCT-CONFIGURATION-1`;
- REST API: `1`;
- Content Schema: `3.0.0`;
- Product Configuration Schema: `1.0.0`;
- Fixture: `TASK-019-PRODUCT-CONFIGURATION-1`;
- endpoint: `/wp-json/gdhe/v1/product-configurations`;
- query: English, Schema 1.0.0, required canonical path, no additional keys.

The exact recursive Schema closure is:

1. `article-number-option.v1.schema.json`;
2. `product-configuration.v1.schema.json`;
3. `public-path.schema.json`;
4. `uuid-v4.schema.json`.

The existing public-path and UUIDv4 files are reused byte-for-byte. Exact
authority paths, success/error sources and all 17 checksums are frozen in
`PRODUCT_CONFIGURATION_HANDOFF_MANIFEST.json` and
`PRODUCT_CONFIGURATION_HANDOFF_CHECKSUMS.sha256`.

Aggregate eligibility keeps Article Numbers globally unique, scopes normalized
length/color uniqueness to one stable Product UUID, allows distinct products
to share a public choice, and binds each stable UUID to one normalized
model/name/publicPath/productKind/quantityUnit identity. Any identity conflict
excludes all candidates for that UUID.

## Consumer boundary

The one valid Golden is
`golden-product-configuration/fgd-x15-pvc.json`. It is the WordPress authority
input for the separately controlled frontend snapshot phase. Frontend must copy
the frozen bytes after Planner checkpoint; it must not read this repository
authority at runtime.

This handoff contains Product Configuration facts only. It does not define,
accept, store or validate a QuoteLine, render a configurator, manage a basket,
persist browser state or submit an inquiry. Those remain separately blocked.

## Reproduction

```sh
python3 cms/wp-content/plugins/gdhe-site/tests/product-configuration-determinism-test.py
python3 cms/wp-content/plugins/gdhe-site/tests/product-configuration-handoff.py
shasum -a 256 -c frontend/src/lib/cms/product-configuration-contract/fixtures/PRODUCT_CONFIGURATION_HANDOFF_CHECKSUMS.sha256
```

The determinism command performs two complete Fixture lifecycles and exact
cleanup. Do not run it against a non-local environment.
