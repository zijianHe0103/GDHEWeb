# TASK-021 WordPress CMS Execution Report

Date: 2026-08-04

## Result

TASK-021 A2 is locally implementation-complete within the registered `wordpress_cms` scope. GDHE Site `0.7.0` now serves a separate Product Configuration Document `2.0.0` from the existing anonymous read-only endpoint while the Product Configuration `1.0.0` authority remains byte-frozen and behavior-compatible.

## Implementation

- added a closed four-file Draft 2020-12 v2 graph and registered its root in `schema.v3.json`;
- added exact v2 request validation and version dispatch without changing the v1 implementation file;
- projects stable product identity, confirmed Article Number options, packaging and custom-length policy only;
- rejects installation/accessory/private fields, malformed values, guessed test-candidate options, unpublished/ineligible sources and inconsistent color labels;
- globally enforces Article Number uniqueness, binds one stable UUID to one normalized identity and binds one product length/color choice to one Article Number;
- preserves independence for distinct stable products sharing a length/color choice;
- added a 15-post removable local Fixture and contract/Schema/determinism/handoff tests;
- updated only CMS usage and rollback documentation.

## Runtime evidence

The current success has exactly one option: `GDHEPRD000172 / 6 m / Ivory White / piece`. Runtime evidence contains one success, six errors, fourteen candidate exclusions, ETag/304, leakage checks and four aggregate probes. Two final lifecycles used different database IDs and produced identical Golden SHA-256 `014e242585b6eb15ac563ee8dd3efee72ed4b325ac371f1177542ef7dfbfec53`.

Each final cleanup removed 15 posts, zero terms and zero uploads. Final TASK-021 posts/meta/option, TASK-019 posts/markers/option, TASK-014/A3 markers/options and TASK-021 uploads are all zero.

## V1 protection

The TASK-019 17-file checksum stream passed 17/17 after implementation. A real temporary v1 Fixture returned HTTP 200, Schema `1.0.0` and `GDHEPRD000172`, then cleaned 13 posts/zero terms/zero uploads. No TASK-019 Schema, Golden, evidence, source, fixture, verifier, manifest or checksum byte was changed.

## Backup and rollback boundary

The dispatch authorized only removable synthetic Fixture mutation and did not authorize a new TASK-021 backup location. The existing TASK-019 immutable SQL backup was not modified. Rollback is additive: remove v2 registration/dispatcher/source/Fixture/tests and restore the old v1 callback; no v1 authority needs reconstruction.

## Boundaries preserved

No frontend, QuoteLine, related-products, root README, Planner authority, WordPress Core, SCF source, theme, real content, user, media, database structure, Feishu, external system, review, acceptance, deployment or Git delivery work was performed.

Documentation impact: `RESOLVED` for `docs/cms/**`. Root README remains forbidden for this phase.

## Adversarial handoff P2 Round 1 revision — 2026-08-05

The preserved current-byte RED was literal `19/20`: only `PRODUCT_CONFIGURATION_V2_DETERMINISM.json` failed, with stale expected SHA-256 `8dbc5368889025edbbb99168cfc6e18a0848ef7545041cb7dd23032ade110380` versus actual `113dffa3ce32ee169db2b9753636a5f5547984fc55fec39f0f8d13373e1eb876`.

The canonical final two-lifecycle proof then used post IDs `3098`–`3112` and `3123`–`3137`, retained identical 1/1 Golden hash, cleaned `15/0/0` each round and left zero residue. Its final determinism SHA-256 is `9fc30ade00bed8eb7ad642829c6b856e1864fed765281ec3c30d39f6d23849e9`.

After artifact stability, the canonical handoff generator ran exactly once. Direct checksum verification and independent manifest expansion now return literal `20/20`. No business-contract byte or behavior changed; see `WORDPRESS_ADVERSARIAL_HANDOFF_P2_R1_REPORT.md`.

## Adversarial exact-decimal P1 Round 1 revision — 2026-08-05

The real float-based Draft 2020-12 root validation RED rejected complete `4.3` and `5.8` documents with `is not a multiple of 0.1`; complete `6.7` passed. Only the Python evidence boundary now parses Schema and payload decimals with `Decimal`. Final complete-root evidence is `4.3=true`, `5.8=true`, `6.7=true`, `6.05=false`, while the current one-option Golden and seven existing negatives remain valid.

After byte stability, one canonical two-lifecycle run used IDs `3148`–`3162` and `3173`–`3187`, preserved the 1/1 Golden hash, cleaned `15/0/0` each round and left zero residue. Final determinism SHA-256 is `c4e88b48d4e02d79bf1e5d5abdb55f2c564d5757305d03f806ad96032b39b7f5`.

The handoff generator then ran once. Current authority is literal `20/20`; manifest SHA-256 is `11f3db81c1b962c387f731d9c171d2f370ba60bdc3391cc10ec991247120ac09`, and checksum-stream SHA-256 is `fe611983112944edcf214d88a9aefac6cc4fa4b9258f07670870414a919204ca`. See `WORDPRESS_ADVERSARIAL_EXACT_DECIMAL_P1_R1_REPORT.md`.
