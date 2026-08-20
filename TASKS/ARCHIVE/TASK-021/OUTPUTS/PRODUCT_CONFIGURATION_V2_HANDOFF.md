# Product Configuration 2.0.0 CMS Handoff

This is a closed WordPress authority handoff for Planner validation. It does not authorize frontend work.

## Contract

- endpoint: `GET /wp-json/gdhe/v1/product-configurations`;
- exact query: `locale=en&schema=2.0.0&path=/canonical/product/path/`;
- public root Schema: `2.0.0`; REST transport: `1`; Content Schema remains `3.0.0`;
- success: one complete Product identity, complete Article Number options, packaging, custom-length policy and `modifiedAt`;
- excluded: installation methods, installation accessory references, hidden installation defaults, database IDs and private source fields;
- errors: normalized application envelope with `Cache-Control: no-store`;
- success caching: strong ETag, public 60-second cache, request UUID and bodyless `304`.

The removable current success is exactly `GDHEPRD000172 / 6 m / Ivory White / piece`. No 4.3 m, 7 m or accessory is authoritative.

## Machine authority

- manifest: `frontend/src/lib/cms/product-configuration-v2-contract/fixtures/PRODUCT_CONFIGURATION_V2_HANDOFF_MANIFEST.json`;
- checksums: `frontend/src/lib/cms/product-configuration-v2-contract/fixtures/PRODUCT_CONFIGURATION_V2_HANDOFF_CHECKSUMS.sha256`;
- Golden: `frontend/src/lib/cms/product-configuration-v2-contract/fixtures/golden-product-configuration-v2/fgd-x15-pvc.json`;
- error fixtures: `frontend/src/lib/cms/product-configuration-v2-contract/fixtures/PRODUCT_CONFIGURATION_V2_ERROR_FIXTURES.json`;
- runtime, Schema and determinism evidence: the three `PRODUCT_CONFIGURATION_V2_*VALIDATION.json` / `*DETERMINISM.json` files;
- full source/test inventory and exact repository-relative paths are frozen in the manifest.

The checksum stream contains 20 files and verifies 20/20. The Schema graph contains exactly four files. The TASK-019 v1 stream separately verifies 17/17 and was not regenerated or rewritten.

## Consumer boundary

Planner must independently validate this handoff before dispatching frontend work. QuoteLine `2.0.0`, UI projection, Transport/Adapter changes, real Feishu, related products and deployment are not present here.
