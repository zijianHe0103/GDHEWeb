# TASK-024 WordPress/CMS Read-only Feasibility Re-audit R2

Audit date: 2026-08-11 (Asia/Shanghai)
Lane: `wordpress_cms`
Controlled request: `MSG-TASK-024-WORDPRESS-CMS-READONLY-FEASIBILITY-REAUDIT-R2`
Result: **PASS**

## Scope and meaning of PASS

The revised TASK-024 authority now states the current WordPress, Product Configuration, ProductCard, RelatedProductCard and Quote Basket capabilities truthfully. The two identity/contract-shape conflicts identified in Round 1 are closed at the documentation-contract level:

- configured products use canonical public path;
- no-detail catalog accessories require a future dedicated opaque public quote key;
- current Basket `2.0.0` and existing CMS routes are explicitly insufficient for production accessory submission;
- the additive Basket/submission transition and bounded mixed-line batch resolver are explicitly future implementation gates;
- RelatedProductCard remains a recommendation collection and is not presented as an arbitrary Basket-line authority.

This PASS is not implementation readiness, runtime completion, adversarial review, acceptance or deployment. The residual gates listed below remain mandatory.

## Independent confirmations

### 1. Configured products use canonical public path — PASS

The revised `PublicRfqBasketSubmission 1.0.0` defines the configured-product resolution identity as:

```text
kind: canonical_path
value: canonical public product path
```

This aligns with current shared bytes:

- Quote Basket `2.0.0` configured-product lines contain `product.publicPath` and validate it with the closed public-path pattern.
- Product Configuration `2.0.0` accepts one required canonical `path`, binds it to the stored Product path and returns exactly one eligible document or `404`.
- Schema 3 `/resolve` validates a canonical English path and requires one unique current published owner before returning the public Product envelope.

Model, name, image, submitted quantity unit and labels remain untrusted hints; none replaces canonical path authority.

### 2. No-detail catalog accessories require an opaque public quote key — PASS

The revised contract requires a purpose-specific, bounded, public, non-secret opaque key for a catalog accessory without an independent detail path. It explicitly forbids the key from equalling or reversibly encoding:

- Article Number;
- stable Product UUID;
- WordPress/database ID;
- Feishu identity.

It also rejects model, name, category, catalog path, relationship order and image as substitute identity.

This correction is necessary and matches current bytes. ProductCard `1.0.0` deliberately emits `publicPath: null` for `catalog_accessory`. RelatedProductCard may emit an explicit `catalog_accessory / piece` direct-quote projection, but it discovers the accessory only while traversing one source Product's `relationships.products`. No current CMS field, Schema or route supplies the required independent opaque key.

### 3. Current Basket `2.0.0` and routes are marked insufficient — PASS

The frozen Basket remains a browser storage contract, not a production network-submission authority:

- configured-product storage has a canonical `product.publicPath`;
- catalog-accessory storage has `catalogPath`, model, name, local test-candidate image, submitted quantity unit and quantity;
- it has no opaque public accessory quote key;
- current accessory equality uses model/name/image/catalogPath/unit, which is suitable only for the frozen local draft behavior and is not an authoritative product identity;
- its image contract is restricted to `/test-candidates/` display media and is intentionally excluded from the future network projection.

The revised authority explicitly says Basket `2.0.0` cannot produce the accessory key and that production accessory submission remains blocked until a separately accepted additive Basket/submission contract supplies it.

Current WordPress runtime route enumeration confirms only anonymous read-only `GET` surfaces:

- `/gdhe/v1/resolve`;
- `/gdhe/v1/collection/{type}`;
- `/gdhe/v1/navigation`;
- `/gdhe/v1/route-manifest`;
- `/gdhe/v1/product-cards`;
- `/gdhe/v1/product-configurations`;
- `/gdhe/v1/related-product-cards`;
- `/gdhe/v1/schema`.

There is no opaque-key lookup or mixed Basket batch route. A source scan likewise finds no `opaque_public_quote_key`, accessory quote-key or batch implementation in GDHE-owned CMS runtime files.

### 4. First future implementation gate is additive identity/version plus bounded batch — PASS

The revised authority consistently places the first future gate before Next.js intake, form work or Feishu integration:

1. freeze and issue the dedicated opaque public quote key for no-detail accessories;
2. add a lossless Basket/submission version transition while preserving historical Basket `1.0.0/2.0.0` bytes;
3. add one server-only operation or equivalently bounded snapshot that resolves an ordered `1..50` mixed `configured_product | catalog_accessory` set;
4. enforce unique current published Product identity, line role, RFQ eligibility, quantity unit, exact standard Article Number or explicit custom/manual `sales_follow_up` policy;
5. fail the entire batch on any stale, unpublished, revoked, conflicting, ambiguous or mismatched line;
6. return no partial authoritative result and perform no per-line public `/resolve`, Product Configuration or RelatedProductCard N+1 loop.

The implementation sequence stops this first slice after contract/runtime evidence and independent review. It does not silently authorize the public form, Feishu, deployment or downstream tasks.

### 5. RelatedProductCard and current CMS capabilities are not overstated — PASS

The revised contract correctly describes RelatedProductCard as a source-product recommendation collection:

- input is one unique published source Product canonical path;
- ordering authority is that source's stored `relationships.products` array;
- the relation set is capped at 20;
- invalid/unpublished/conflicting targets may be omitted from the recommendation result;
- an accessory is projected only with explicit `catalog_accessory / piece` direct-quote metadata;
- no arbitrary accessory identity lookup is provided.

These semantics cannot satisfy atomic RFQ intake. Recommendation omission is valid progressive-display behavior, whereas a submitted Basket line must cause deterministic whole-request failure when it cannot be resolved. The revised authority preserves this distinction and explicitly states that existing Product Configuration and RelatedProductCard contracts are audit inputs, not proof that a batch resolver exists.

No present CMS capability is overstated. Current components remain accurately bounded as follows:

| Current component | What it proves | What it does not prove |
|---|---|---|
| Schema 3 `/resolve` | one canonical path, one unique published public envelope | mixed batch, accessory opaque key, Article Number |
| Product Configuration `2.0.0` | one configured Product path/identity, exact standard option uniqueness and explicit custom-length policy | catalog accessories, `1..50` atomic batch |
| ProductCard `1.0.0` | complete public card role/eligibility projection | Article Number or independently addressable no-detail accessory identity |
| RelatedProductCard `1.0.0` | one source's ordered eligible recommendations and explicit accessory unit | arbitrary Basket-line lookup, 50-line input or atomic RFQ errors |
| Quote Basket `2.0.0` | local mixed-line storage and customer-visible draft behavior | production accessory identity or authoritative submission |

## Residual implementation gates

The contract re-audit passes, but implementation remains `FOLLOW_UP_REQUIRED` behind all of these gates:

1. **Opaque-key authority:** define format, maximum length, issuance/source ownership, uniqueness, revocation, collision behavior and non-reversibility evidence for no-detail accessory public quote keys.
2. **Additive Basket/submission version:** introduce the key without rewriting or pretending to upgrade historical Basket `1.0.0/2.0.0` bytes; define migration/blocked-state behavior for already stored accessories.
3. **Server-only batch Schema/API:** add a closed versioned `1..50` mixed-line request/result contract with no browser internal identity exposure.
4. **Atomic fail-closed runtime:** prove no first-wins path/UUID/key/Article Number behavior, no partial output and exact whole-request mapping for stale, missing, unpublished, revoked, role/unit mismatch and ambiguity.
5. **No-N+1 evidence:** prove one bounded CMS request/snapshot and bounded database/query graph at 1 and 50 mixed lines; public endpoint loops are forbidden.
6. **Performance/deployment gate:** benchmark the complete resolver inside the frozen 15-second intake budget using production-like data, then validate server-only authentication, TLS, availability and operational failure behavior.
7. **Real-data gate:** validate representative current Products, Article Numbers, accessory keys, RFQ eligibility and explicit manual-follow-up policies; current local WordPress has no Product/configuration/accessory truth records.
8. **Independent review gate:** complete task-scoped contract/runtime evidence and adversarial review before any Next.js intake, form, Feishu connector, Git delivery or deployment work.

## Evidence paths

- `TASKS/ARTIFACTS/TASK-024/PLANNER_FEASIBILITY_CONTRACT_REVISION.md`
- `TASKS/ARCHIVE/TASK-024/OUTPUTS/REQUIREMENTS.md`
- `TASKS/ARCHIVE/TASK-024/OUTPUTS/RFQ_SUBMISSION_CONTRACT.md`
- `TASKS/ARCHIVE/TASK-024/OUTPUTS/SERVER_SECURITY_BOUNDARY.md`
- `TASKS/ARCHIVE/TASK-024/OUTPUTS/IMPLEMENTATION_SEQUENCE.md`
- `TASKS/ARCHIVE/TASK-024/OUTPUTS/PLANNER_CONTRACT_VALIDATION.md`
- `docs/architecture/headless-wordpress-nextjs-contract.md` sections 11 and 14
- `MEMORY/DECISIONS/ADR-006-product-first-roadmap-and-multilingual-maturity-gate.md` decisions 42 and 47
- `frontend/src/lib/quote-basket-contract/v2/schemas/quote-basket.v2.schema.json`
- `frontend/src/lib/quote-basket/v2/index.ts`
- `frontend/src/types/quote-basket-v2.ts`
- `frontend/src/lib/related-products/public-view.ts`
- `cms/wp-content/plugins/gdhe-site/includes/public-api.php`
- `cms/wp-content/plugins/gdhe-site/includes/product-configurations-v2.php`
- `cms/wp-content/plugins/gdhe-site/includes/product-cards.php`
- `cms/wp-content/plugins/gdhe-site/includes/related-product-cards.php`

## Scope statement

This re-audit changed no CMS/API/Schema/test/runtime/database/content/Fixture, frontend, task/architecture/ADR authority, Planner file, Feishu/external system or Git state. It is a narrow read-only contract verification only.
