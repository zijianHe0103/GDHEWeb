# TASK-007 A3 contract and handoff manifest

Status: `EXECUTION_COMPLETE_PENDING_INDEPENDENT_REVIEW`

Frozen on: `2026-07-24`

## Fixed versions

| Boundary | Version |
|---|---|
| GDHE REST API | `1` |
| Content Schema | `3.0.0` |
| Module Schema | `1.0.0` |
| Fixture | `TASK-007-A3-REVIEW-R1` |
| Benchmark | `TASK-007-A3-BENCHMARK-1` |
| `gdhe-site` | `0.4.2` |

The frontend may consume only the normalized DTOs covered by this manifest. WordPress post, attachment and term IDs, Core REST shapes, SCF field names, postmeta and database tables are not public contracts.

## Public model

Public types are native `page`, native `post`, `product`, `market`, `reference`, `support_article` and `download`. `site_settings` is internal.

Taxonomies are `product_category`, `product_series`, `installation_type`, `support_topic` and `document_type`.

Relationship keys are exactly:

- `products`
- `markets`
- `references`
- `support_articles`
- `downloads`

Canonical paths are `/news/{slug}/`, `/products/{slug}/`, `/markets/{slug}/`, `/references/{slug}/`, `/support/{topic}/{slug}/` and `/downloads/{slug}/`; pages use an explicit canonical path.

Product details freeze model/product code, positioning, features, specifications, regional article numbers, finishes, installation/control/compatibility, gallery/HTTPS video and inquiry CTA. Support video is also HTTPS-only. Market, Reference, Support Article and Download use the structured fields in `docs/cms/CONTENT_MODEL.md`.

## Endpoint and error matrix

The anonymous read-only endpoints remain:

- `/wp-json/gdhe/v1/resolve`
- `/wp-json/gdhe/v1/collection/{type}`
- `/wp-json/gdhe/v1/navigation`
- `/wp-json/gdhe/v1/route-manifest`

Success uses ETag, `public, max-age=60`, JSON Content-Type and UUIDv4 request ID; resolve also uses Last-Modified. Conditional ETag requests return 304. Application errors use `no-store` and the stable codes `gdhe_invalid_locale`, `gdhe_invalid_path`, `gdhe_invalid_schema`, `gdhe_invalid_collection_type`, `gdhe_invalid_filter`, `gdhe_invalid_sort`, `gdhe_invalid_pagination`, `gdhe_not_found`, `gdhe_route_conflict` and `gdhe_contract_invariant`.

CMS-sanitized rich content is exposed only as `safeHtml`. Links, CTAs, templates, modules, UUIDs, media, files and canonical paths are closed allowlists and fail closed. Runtime template pairing is `page/post → standard`, `product → product`, `market → market`, `reference → reference`, `support_article → support_article`, and `download → download`.

## Schema SHA-256

The current Golden authority is the exact 19-file transitive graph below. `a3-schema-validate.py` starts from `page.v3.schema.json`, `collection.v3.schema.json`, `navigation.schema.json`, `route-manifest.schema.json` and `error.schema.json`; it recursively follows every non-fragment local `$ref`, normalizes paths relative to `config/schemas/`, sorts POSIX paths lexicographically, loads only that graph into the validator store and emits the same path/hash map in `A3_SCHEMA_VALIDATION.json`.

Reproduction from the repository root:

1. Run `python3 cms/wp-content/plugins/gdhe-site/tests/a3-schema-validate.py`.
2. Compare `schemaGraphFiles` and `schemaGraphSha256` in `TASKS/ARCHIVE/TASK-007/EVIDENCE/A3_SCHEMA_VALIDATION.json` to this exact list.
3. Run `shasum -a 256` on each repository-relative file below, or run `shasum -a 256 -c TASKS/ARCHIVE/TASK-007/EVIDENCE/machine/HANDOFF_CHECKSUMS.sha256`.

| Relative to `cms/wp-content/plugins/gdhe-site/config/schemas/` | SHA-256 |
|---|---|
| `collection.v3.schema.json` | `5d40aee06755c3709193861e077f6261c007c89dc7b2c7255c1ab364213d0691` |
| `content-reference.schema.json` | `fcdb3996a0dd0ea6c51bcd0cf66b848200316f9ee3669aec4e7fa064e983fe6b` |
| `error.schema.json` | `96063d71f1ce5922dfbaa4573a6d313184ac76b22c7e11826d2963400c538272` |
| `file-reference.schema.json` | `a45bc23d20d23aad4d4c0ebd1fcbc8e799ab7c83c76074c27d4564d443c455cd` |
| `link.schema.json` | `0bb0691103f845c0477caaf862f07b90c3d102fdbd18afba95fd6c1b4c4772a0` |
| `media-reference.schema.json` | `a707e83f5fb0b484c78ae8437fc2aef89881828072c18fd1fc0a3310774e9ab2` |
| `modules/accordion.schema.json` | `d12eb7342b9186838c2199717d3da81cc8ced56619119a45c5db6a0f05165703` |
| `modules/card-grid.schema.json` | `b8939aa67a86b90e612bbd488b414582f78099bd2fb0ee0fed2c67a95d1343cf` |
| `modules/cta-banner.schema.json` | `051f8793d39a4cb9f746e42d4e26d9ffc31a9945e698362befa724368445f57a` |
| `modules/data-table.schema.json` | `e2ab2f0135da7dfad1f7fd267a31534f73f022aff6bbf4eac87982bb7e89bfe7` |
| `modules/hero.schema.json` | `e36aad90041a3a58745c4b75c4bd6f3723e7a1e08915930d551ff3e3d4c4e4ab` |
| `modules/rich-text.schema.json` | `0efad56e9601e74ff810c59feb201a4f292da84b01e5e37fc23c3400a1e11e1f` |
| `modules/split-media.schema.json` | `4f2ab970e8f56c7e8c951c9f1eefec3a922f51732cf4f5e9125c566d59edfd68` |
| `navigation.schema.json` | `d9ad3898180eb9d92850d12620ddf48f2ae9789e174ca709b8a0c2ecad1bac82` |
| `page.v3.schema.json` | `b1e4c3f41be6ccfed36aa8108157f43cce66a98b96916892b92e1053956b8791` |
| `public-path.schema.json` | `9f4951888329bd7d989251188e23ef475d6975bedfe1c187d5676feab3c823ce` |
| `route-manifest.schema.json` | `2d6035972448469814da1143903482ce391c1b9c17b677a47e589dac197815b4` |
| `safe-html.schema.json` | `a611c3830c90f17d3edd4fab57a5127e738f3b7b5ee5f8d02bedbe5d67a61ea0` |
| `uuid-v4.schema.json` | `59dbd4173aa8f63ab09b25239b4b8181b394a87de4fb6cdb462ddbdeedbaa1cb` |

The registry and field configuration are separately frozen as `config/schema.v3.json` (`e958c8c6352d9b8a4382453091e5632a71957b52b98afb6030be7230a6217be9`) and `config/field-groups.v3.json` (`775bd2547b95550dc6fa1adbb65d2cc2e11523beb32dc0920f17d8ddd0c00c0d`).

## Golden SHA-256

| File | SHA-256 |
|---|---|
| `collection-product-page-1.json` | `083f8216dddac96f3ae88336aed78ec60074348be6ec40d5c426aadc04b245e3` |
| `collection-product-page-2.json` | `f8186825adecde878a25a483b0aa664d0ac4ecf3b69d8b3f5c4bef18f2168ea6` |
| `collection-product-page-3-empty.json` | `0d233019bc0f88d3640813d740f3f9b7ee27cbad9ec46f616a3bd25f500ddc59` |
| `navigation.json` | `bb8ecb48a0d1d6d2ed2db2d9c0c885303be3b925c5fc54518fdbfef1bf585ee5` |
| `resolve-company.json` | `4f7900e79c946e2314570a845a5bb5a0dca926632ce8486e3b2acb24d30eac24` |
| `resolve-download.json` | `2ba3ac351467cddfe2729d0fbac1909b21266949a65d0c7a2c2743e67af3a7ae` |
| `resolve-home.json` | `380c48ae413eadc948c7cecb238d71cef42ab44b8bd67feebafe13dc780e4df0` |
| `resolve-market.json` | `1ad9816169ab91ae0d5f289b5d88d0ced17406a9dfc33acce5f3d312e68cef06` |
| `resolve-news.json` | `cbf7450847bd958fae6342e7f069fb399149fbc048f07a2b12b0b564ceca86d3` |
| `resolve-product-alpha.json` | `d304c7690e5a565504a861af5cd858fe93c835f93313602148ee6c809fba375f` |
| `resolve-product-beta.json` | `cdaaab08e50cb66325549fec87f2a856299ccdf5a81a66ac38edaa446be4a551` |
| `resolve-product-gamma.json` | `caf5156c2c669eee01d2d8874e3294ca5da3c58724d080e426f216ca7a338aa5` |
| `resolve-reference.json` | `e95241363cdeb5573252501dfbc6901b011c43c9af3ce8a7608cd1bb4ad73d28` |
| `resolve-support.json` | `c6ffd641c51098089fe78e1f0d5b115ccaa7f6fc80544b075f6e6173eba03ee8` |
| `route-manifest.json` | `884e46c63bb67511158245aef870bae566be0a778c6d4ef6bd651f3e5d54110b` |

Two complete lifecycles used different WordPress IDs and matched all 15 hashes. The set includes native Post and non-root Page resolve positives. Product collection totals remained `3/3/3` and item counts `2/1/0`.

## Evidence SHA-256

| Evidence | SHA-256 |
|---|---|
| `A3_CONTRACT_RUNTIME_SUMMARY.json` | `60ce9de7c08a814aa6c469ea7d51be07f12b41dba599b1190f6315f692189475` |
| `A3_SCHEMA_VALIDATION.json` | `67268d1cf9d9ef52ea69e3897574be79bb50ae0ffc5e970ee1f12be32239e3dd` |
| `A3_DETERMINISTIC_GOLDEN.json` | `85320adebe4c7abe43d92b532ac1f91b691ce43cf27366642df47bdd3bd4d499` |
| `A3_BENCHMARK.json` | `392b519bf7e8787d07d9c1034e8db6921e20b00718836f8423fe89bf2eb06e6b` |
| `A3_CLEANUP_EVIDENCE.json` | `c69b2ecbd75faec64c726551ed9b59ddd2dd7613c8e1b851eb876ce7ad02971f` |
| `A3_HEADER_FIXTURES.json` | `374c4ebe1071840eb4424a2804294013f143c370be4cf93c3627a0adeb5feaa1` |
| `A3_P1_REVISION_REPORT.md` | `5315f28e0b7267d901e310b724ccb55abcda3438679e28d555b329c2836160d5` |
| `A3_MIGRATION_RUNTIME_VALIDATION.json` | `e4f9c0c1f21b991bc6c0f4842e5203d0cfe3c94fcf602e387d8ba56003521737` |
| `A3_REVIEW_R1_REVISION_REPORT.md` | `c3917a74f622707599b9bb79ba35d265543fee012a7ebc2cc8eae83334f0f96f` |

## Benchmark and cleanup

The execution-lane warmed benchmark used eight warmups plus 200 measured requests per fixture at concurrency 20: 1,600 origin requests, p50 `991.973 ms`, p95 `1093.255 ms`, error rate `0`, payload 1,559–2,168 bytes.

The Planner independent checkpoint repeated the same 1,600-request workload against a fresh synthetic lifecycle. The frozen `A3_BENCHMARK.json` now records p50 `858.246 ms`, p95 `2001.839 ms` and error rate `0`. Both runs cross the existing 500 ms architecture comparison trigger; this records a future separately governed GraphQL/cache PoC candidate and does not authorize adoption in TASK-007.

Final fixture cleanup removed 18 posts, one attachment and five terms. The disposable migration runtime suite also proved apply/idempotence/exact rollback and four injected failures with complete snapshot recovery. A3 post, migration/fixture marker-meta, term, option and upload residue are all zero. Core, official SCF and all 12 database-table checks passed.

The immutable pre-A3 backup remains `/Users/arron/Storage/Personal/ObsidianWorkSpace/茂洋/独立站/.local/backups/TASK-007/A3-20260724T092322Z`.

## Scope

No frontend, root README, WordPress Core, SCF source, theme, third-party plugin, real business content, multilingual/SEO, GraphQL, preview, webhook, cache invalidation, inquiry, deployment, review, Git delivery, acceptance or task closure work was performed.
