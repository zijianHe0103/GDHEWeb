# TASK-024 WordPress/CMS Read-only Feasibility Audit

Audit date: 2026-08-11 (Asia/Shanghai)
Lane: `wordpress_cms`
Controlled request: `MSG-TASK-024-WORDPRESS-CMS-READONLY-FEASIBILITY-AUDIT`
Mode: current shared bytes plus non-mutating local WordPress checks only

## Executive finding

The current CMS has useful fail-closed identity components, but it does **not** have the authoritative mixed-line batch resolver required by TASK-024. No existing endpoint can accept and atomically re-resolve `1..50` ordered `configured_product` and `catalog_accessory` Basket lines in one bounded server-only operation.

The minimum safe continuation is a separate additive CMS/API/Schema slice. It must compose current path, Product Configuration and ProductCard eligibility rules behind one server-only batch boundary while preserving every frozen public contract. A loop of up to 50 public `/resolve`, Product Configuration or RelatedProductCard requests is not an acceptable substitute.

## Classification summary

| Question | Classification | Current fact |
|---|---|---|
| One bounded server-only mixed-line batch for `1..50` lines | `FOLLOW_UP_REQUIRED` | No batch route or batch Schema exists. All observed GDHE routes are anonymous `GET` routes with one path/source or a public collection shape. |
| Public path to one unique current stable Product identity | `DIRECTLY_USABLE` for canonical published Product path/UUID; `FOLLOW_UP_REQUIRED` for RFQ role/unit closure | `/resolve` rejects missing content, canonical-path conflicts and incomplete envelopes. Product Configuration `2.0.0` additionally binds path, UUID, model, name, kind and unit for its eligible configured Product. There is no single current authority covering both Basket roles. |
| Standard selection to one Article Number | `DIRECTLY_USABLE` for an eligible Product Configuration `2.0.0` document | A normalized `(stable Product UUID, lengthMeters, color.code)` choice must occur exactly once; Article Number uniqueness is global. Current frozen truth contains only `GDHEPRD000172 / 6 m / Ivory White / piece`. |
| Custom/manual `sales_follow_up` | `DIRECTLY_USABLE` only for the current explicit custom-length policy; `FOLLOW_UP_REQUIRED` for any broader manual policy | Product Configuration `2.0.0` explicitly declares `customLength.articleNumberResolution=sales_follow_up`, with no Article Number. No general published-product manual-follow-up eligibility/policy is represented. |
| Catalog accessory independent resolution | `CONTRACT_CONFLICT` if RelatedProductCard is reused as RFQ authority; `FOLLOW_UP_REQUIRED` for a separate resolver | RelatedProductCard can prove an explicit `catalog_accessory / piece` projection only while traversing one source Product's ordered `relationships.products`. The card has `publicPath=null`; arbitrary Basket accessories cannot be restored independently of relation position/source context. |
| Exact conflict, unpublished, stale and ambiguous handling | `DIRECTLY_USABLE` as lower-level fail-closed rules; `FOLLOW_UP_REQUIRED` for atomic RFQ error mapping | Current contracts reject or omit invalid candidates, but Product Configuration collapses conflicts to `404` and RelatedProductCard silently omits invalid targets. TASK-024 requires whole-request deterministic `409` semantics without partial acceptance. |
| Existing endpoint meets 15-second atomic intake without N+1 | `FOLLOW_UP_REQUIRED`; production latency is a later `DEPLOYMENT_GATE` | No current endpoint performs the required operation. The 15-second budget cannot be established until the separate batch contract exists and is benchmarked with production-like `1` and `50` line inputs. |

No current CMS fact creates a conflict with TASK-024's frozen public Basket, QuoteLine, Product Configuration, ProductCard or RelatedProductCard bytes. The conflict above is specifically the proposed misuse of a recommendation contract as an arbitrary accessory resolution authority.

## Current authority inventory

### Schema 3 `/resolve`

`GET /wp-json/gdhe/v1/resolve?locale=en&schema=3.0.0&path=...` resolves one canonical English public path. It scans published public posts, requires exactly one path match, then requires a complete Schema 3 envelope: UUIDv4 public identity, matching type/template, valid canonical path, valid modules/details and published status.

Observed behavior from current code and frozen runtime evidence:

- invalid locale/path/schema: normalized `400`;
- no published match, including draft/private/pending/trash/nonexistent: `404 gdhe_not_found`;
- two published owners of one canonical path: `409 gdhe_route_conflict`;
- one match whose public contract is incomplete or template-mismatched: `500 gdhe_contract_invariant`;
- success exposes stable public UUID, type, template and canonical path, but no RFQ role, quantity unit or Article Number.

This is a valid lower-level path identity gate. It is not a batch resolver and must not be called once per Basket line as the production design.

### Product Configuration `2.0.0`

`GET /wp-json/gdhe/v1/product-configurations?locale=en&schema=2.0.0&path=...` resolves one eligible configured Product by canonical path. The current implementation:

- requires a published Product and exact private source shape;
- binds its stable UUID to one normalized `model/name/publicPath/productKind/quantityUnit` identity;
- requires source identity to match the Product's public UUID, title, stored path and model;
- keeps Article Number globally unique;
- keeps normalized `(Product UUID, length, color code)` choice unique inside the stable Product;
- allows distinct Product UUIDs to share the same public length/color choice;
- excludes every candidate for a conflicting stable UUID or duplicate Article Number/choice;
- returns one document only when exactly one eligible document has the requested path; otherwise returns `404 gdhe_not_found`.

The document is sufficient to restore the one current standard truth without guessing. Its explicit custom-length policy also represents `sales_follow_up` with no Article Number. It does not represent catalog accessories, a general manual-follow-up policy, a mixed batch, per-line failure reasons or whole-request atomicity.

### ProductCard `1.0.0`

ProductCard supplies stable public UUID, `detail_product|catalog_accessory` role, derived action and complete public presentation eligibility. A detail Product has a unique public path; a catalog accessory is required to have `publicPath=null`. Article Number and internal source fields are intentionally absent.

This makes ProductCard useful as a public eligibility/role projection, but a catalog accessory card alone cannot be keyed by public path or converted into an authoritative RFQ line.

### RelatedProductCard `1.0.0`

`GET /wp-json/gdhe/v1/related-product-cards?locale=en&schema=1.0.0&source_path=...` resolves one unique published Schema 3 source Product, then traverses its stored `relationships.products` array in order, capped at 20. Eligible targets retain ProductCard order. Active accessories require an independent explicit `{kind: catalog_accessory, quantityUnit: piece}` mirror; the runtime does not infer unit from title, category or position.

Exact current behavior:

- invalid parameter/locale/schema/path: `400`;
- source not found/unpublished: `404`;
- non-unique source path: `409`;
- ineligible source, malformed relation list or more than 20 relations: `500`;
- repeated identical target post: later duplicate omitted;
- two distinct eligible posts claiming one UUID: all cards/actions for that UUID omitted;
- self, unpublished, invalid ProductCard, hostile-media, missing-unit and incompatible-action targets: omitted while unrelated stored order survives.

Silent omission is correct for a recommendation collection. It is not correct RFQ intake behavior: a submitted stale or ambiguous line must reject the complete RFQ with the frozen public error mapping, not disappear from a result.

## Answers to the seven feasibility questions

### 1. Can one bounded server-only batch resolve `1..50` mixed lines now?

`FOLLOW_UP_REQUIRED`.

No. `/resolve` and Product Configuration each accept one path. RelatedProductCard accepts one source path and at most 20 stored recommendations, not 50 submitted Basket lines. ProductCard is a paginated public catalogue collection, not a line resolver. None accepts an ordered mixed input, returns one all-or-nothing result, or enforces the TASK-024 line count and atomic failure rules.

### 2. Does public path map to one stable Product identity, role and unit?

Mixed result:

- `DIRECTLY_USABLE`: Schema 3 `/resolve` proves one current published Product path and stable UUID or fails closed. Product Configuration `2.0.0` strengthens this for configured curtain-track Products by binding UUID, model, name, path, kind and `piece` unit.
- `FOLLOW_UP_REQUIRED`: there is no current combined lookup for both `configured_product` and `catalog_accessory`. Catalog accessories intentionally have no ProductCard public path, so a Basket public-path-only key cannot identify them under the frozen contract.

The follow-up must define an accepted stable public accessory key without exposing WordPress IDs or relying on names/categories. If the frozen Basket lacks such a key, the separate follow-up must stop as a contract-shape decision rather than guess.

### 3. Does a standard selection restore one Article Number, and how is manual follow-up represented?

Mixed result:

- `DIRECTLY_USABLE`: for an eligible Product Configuration `2.0.0` document, an exact normalized length/color choice has one Article Number or the whole document is excluded. Global Article Number collisions and same-Product choice collisions fail closed.
- `DIRECTLY_USABLE`: current custom length is explicitly policy-bound to `sales_follow_up` and has no Article Number.
- `FOLLOW_UP_REQUIRED`: current CMS does not represent a general manual sales-follow-up policy for other Product/accessory configurations. Absence, stale selection or ambiguity must never fall back to `sales_follow_up`.

### 4. Can a catalog accessory resolve independently of relation position without guessing?

`FOLLOW_UP_REQUIRED`, with a `CONTRACT_CONFLICT` against reusing RelatedProductCard directly.

The explicit unit mirror prevents guessing, but discovery remains source-relationship-bound. A returned accessory has a stable public UUID in its ProductCard and explicit `piece`, yet its `publicPath` is null and its Article Number is absent. The current route cannot accept that accessory identity directly and prove it is still uniquely published/eligible outside its source relationship. A new independent accessory authority is required.

### 5. What are the exact conflict/unpublished/stale/ambiguous behaviors?

Current lower-level behavior is fail closed:

| Condition | Current CMS behavior | TASK-024 batch requirement |
|---|---|---|
| Invalid canonical path/query/version | normalized `400`, `no-store` | reject request before delivery |
| Missing or unpublished public path | `/resolve` `404`; Product Configuration `404`; Related source `404` | atomic `409 product_unavailable` or `basket_refresh_required`, without internal detail |
| Duplicate canonical path | `/resolve`/Related source `409` | atomic `409 product_unavailable` |
| Incomplete Schema/ProductCard source | `/resolve`/Related source `500`; collection candidates may be omitted | atomic deterministic line rejection; never partial success |
| Stable Product UUID maps to conflicting identities | every conflicting Product Configuration candidate excluded; path query becomes `404` | atomic `409 product_unavailable` |
| Duplicate Article Number or same-Product public choice | every affected Product Configuration document excluded; query becomes `404` | atomic `409 configuration_changed` |
| Standard option removed/changed/ambiguous | no unique eligible option/document | atomic `409 configuration_changed`; no custom fallback |
| Related target unpublished/ineligible/hostile | omitted from recommendation result | submitted Basket line must reject the entire RFQ |
| Distinct eligible related targets share one UUID | all affected recommendation cards/actions omitted | submitted Basket line must reject the entire RFQ |
| Explicit valid custom length | policy says `sales_follow_up`, Article Number absent | normal authoritative line with controlled internal follow-up reason |

The follow-up must retain the normalized public TASK-024 errors while preserving more precise internal diagnostics for tests/operations only.

### 6. Can an existing endpoint meet 15 seconds atomically without N+1?

`FOLLOW_UP_REQUIRED`; subsequent production proof is a `DEPLOYMENT_GATE`.

No existing endpoint has the needed request or response shape. Calling one public endpoint per line creates up to 50 origin requests before Feishu and violates the frozen design. RelatedProductCard's one-request property covers one recommendation source and at most 20 relations, not an arbitrary Basket. Product Configuration performs a whole eligible-document scan for one requested path; it is not a declared 50-line snapshot API.

The new batch operation must be measured at `1` and `50` mixed lines with bounded database/query counts, origin request count, p50/p95, error rate and total server budget. Only after that evidence exists can the 15-second production gate be classified as passed.

### 7. What is the minimum separate CMS/API/Schema follow-up?

`FOLLOW_UP_REQUIRED`.

Add one isolated, server-only, read-only batch authority without changing the bytes or semantics of Schema 3 `/resolve`, Product Configuration `1.0.0/2.0.0`, ProductCard `1.0.0`, RelatedProductCard `1.0.0`, public Basket `2.0.0` or QuoteLine `2.0.0`.

Minimum responsibilities:

1. Accept a closed ordered array of `1..50` submitted public line identities and choices through one server-to-CMS operation. Do not expose the operation to browser trust or accept WordPress/database IDs.
2. Load a bounded current snapshot once, then resolve every line against the same snapshot. Enforce unique canonical path/stable identity, published and complete eligibility, role/unit consistency, and no cross-line ambiguity.
3. For `configured_product`, restore a standard Article Number only from one exact normalized eligible choice, or emit `sales_follow_up` only from an explicit current policy.
4. For `catalog_accessory`, resolve an independently addressable stable accessory identity and explicit quantity unit/Article Number or explicit follow-up policy. Never use relationship array position, title, category or default values.
5. Return one ordered authoritative result only if every line passes; otherwise return one controlled conflict/unavailable result and no partial line set.
6. Keep Article Number, stable internal identity and diagnostics server-side; the Next.js public receipt must not forward them.
7. Add a new closed Schema/version and deterministic tests for 1/50 mixed positives, duplicate semantic identities, path/UUID/Article Number/choice conflicts, unpublished/stale candidates, accessories removed from relationships, ambiguous identity, custom policy, bounded request/query graph and exact error normalization.

Authentication/authorization for the server-only surface, production CMS reachability, secrets, TLS, rate/timeout budgets, a representative real-product dataset and the measured 15-second limit are `DEPLOYMENT_GATE` items. Feishu mapping/writes remain outside this CMS follow-up.

## Current runtime observation

Non-mutating checks on 2026-08-11 found:

- WordPress `7.0.2`;
- GDHE Site active at `0.7.0`;
- Secure Custom Fields active at `6.9.2`;
- WordPress Core checksum PASS, official SCF checksum PASS, database check PASS;
- `/gdhe/v1/resolve`, `/product-cards`, `/product-configurations` and `/related-product-cards` registered as `GET` only;
- current relevant content: one published Page, one published Post, no Product/Market/Reference/Support Article/Download records;
- no Product Configuration v1/v2, ProductCard or RelatedProductCard source meta; only one general public UUID meta;
- read-only requests for the historical FGD Fixture path returned normalized `404/no-store` on `/resolve`, Product Configuration `2.0.0` and RelatedProductCard `1.0.0`.

Therefore the local runtime proves route registration and zero Fixture residue, not real-catalog readiness. Real `10..20` Product pressure data, current Article Numbers/accessories/policies and production-like latency are `DEPLOYMENT_GATE` evidence.

## Evidence caveat

The current TASK-023 RelatedProductCard checksum stream verifies `26/26`. The older TASK-021 Product Configuration v2 stream verifies `19/20`: only `config/schema.v3.json` differs because the later additive TASK-023 contract registered RelatedProductCard in that shared registry. The four-file Product Configuration v2 Schema closure, runtime code/tests and Golden remain present. This historical whole-stream mismatch is not evidence of a Product Configuration behavior regression, but the old `20/20` claim must not be presented as a current whole-tree verification.

## Evidence paths

- `TASKS/ACTIVE/TASK-024-rfq-submission-contract.md`
- `TASKS/ARTIFACTS/TASK-024/REQUIREMENTS.md`
- `TASKS/ARTIFACTS/TASK-024/RFQ_SUBMISSION_CONTRACT.md`
- `TASKS/ARTIFACTS/TASK-024/SERVER_SECURITY_BOUNDARY.md`
- `TASKS/ARTIFACTS/TASK-024/FAILURE_AND_IDEMPOTENCY_MATRIX.md`
- `TASKS/ARTIFACTS/TASK-024/IMPLEMENTATION_SEQUENCE.md`
- `docs/architecture/headless-wordpress-nextjs-contract.md` sections 11 and 14
- `MEMORY/DECISIONS/ADR-006-product-first-roadmap-and-multilingual-maturity-gate.md` decisions 41–47
- `cms/wp-content/plugins/gdhe-site/includes/public-api.php`
- `cms/wp-content/plugins/gdhe-site/includes/product-configurations-v2.php`
- `cms/wp-content/plugins/gdhe-site/includes/product-cards.php`
- `cms/wp-content/plugins/gdhe-site/includes/related-product-cards.php`
- `cms/wp-content/plugins/gdhe-site/config/schema.v3.json`
- `TASKS/ARTIFACTS/TASK-007/A3_CONTRACT_RUNTIME_SUMMARY.json`
- `TASKS/ARTIFACTS/TASK-014/PRODUCT_CARD_HANDOFF.md`
- `TASKS/ARTIFACTS/TASK-014/PRODUCT_CARD_RUNTIME_VALIDATION.json`
- `TASKS/ARTIFACTS/TASK-021/PRODUCT_CONFIGURATION_V2_HANDOFF.md`
- `TASKS/ARTIFACTS/TASK-021/PRODUCT_CONFIGURATION_V2_HANDOFF_MANIFEST.json`
- `TASKS/ARTIFACTS/TASK-021/PRODUCT_CONFIGURATION_V2_RUNTIME_VALIDATION.json`
- `TASKS/ARTIFACTS/TASK-023/RELATED_PRODUCT_CARD_HANDOFF.md`
- `TASKS/ARTIFACTS/TASK-023/RELATED_PRODUCT_CARD_HANDOFF_MANIFEST.json`
- `TASKS/ARTIFACTS/TASK-023/RELATED_PRODUCT_RUNTIME_VALIDATION.json`

## Scope statement

This audit changed no CMS/plugin/Schema/API/test/runtime/database/content/Fixture, frontend, authority contract, Planner document, Feishu/external system or Git state. It is feasibility evidence only; it is not implementation, review, acceptance or deployment.
