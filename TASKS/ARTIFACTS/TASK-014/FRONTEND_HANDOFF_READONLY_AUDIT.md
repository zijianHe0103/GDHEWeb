# TASK-014 Frontend ProductCard Handoff Read-only Audit

- Task: `TASK-014`
- Lane: `frontend`
- Current request: `MSG-TASK-014-FRONTEND-HANDOFF-READONLY-AUDIT-R2`
- Mode: `READ_ONLY_CONSUMER_AUDIT`
- Date: 2026-07-30
- Current verdict: `PASS`
- Current findings: `P0=0 / P1=0 / P2=1`
- Round 1 request: `MSG-TASK-014-FRONTEND-HANDOFF-READONLY-AUDIT`
- Round 1 historical verdict: `FAIL / P0=0 / P1=2 / P2=1`
- Implementation: forbidden and not performed

## Round 2 current verdict

`PASS / P0=0 / P1=0 / P2=1`.

Both Round 1 P1 findings are closed:

1. `golden-product-card/one-item.json` is the captured result of one anonymous
   `GET /gdhe/v1/product-cards?per_page=1&page=1` route request. It has status
   `200`, exactly one complete item, `total=4`, `totalPages=4`, the existing
   server-derived `view_product` action, `ETag`,
   `Cache-Control: public, max-age=60`, and `X-GDHE-Request-ID`. The test makes
   one `rest_do_request` for this case. ProductCard production code contains no
   `/resolve`, `gdhe_rest_resolve`, HTTP client, curl, or fetch call, so the
   captured request graph is one collection request and zero per-card resolve
   requests.
2. The same real one-item response contains one non-empty `series` reference
   and one non-empty `applications` reference. Each source UUID equals the
   stable public UUID of the unique published Page resolved from its canonical
   path, and each target must successfully produce a public content envelope
   before the reference can be emitted. Direct mismatch checks for
   `primaryCategory`, `series`, and `applications`, plus the
   `mismatched_reference_id` candidate exclusion, still fail closed.

Independent Round 2 verification reproduced:

- the exact eight-file transitive ProductCard Schema closure;
- all 25 lexicographically sorted handoff checksums and exact manifest parity;
- eight ProductCard success Goldens and nine normalized error fixtures against
  their frozen roots;
- runtime counts `4/0/4/1/2/2/0/4` in manifest order, including the one-item
  `1 item / total 4 / totalPages 4` case;
- four action/lifecycle cells, `2/2/0` pagination, eligibility-before-total,
  normalized error/cache semantics, conditional `304`, closed DTO keys, and no
  WordPress, SCF, Feishu, Article Number, supplier, price, or database-ID
  leakage;
- two deterministic Fixture lifecycles with different WordPress database IDs,
  identical `8/8` Golden hashes, exact `19 posts / 3 terms` cleanup, and zero
  TASK-014/A3 residue.

The first local Schema verification attempt did not register every canonical
relative `$ref` alias and failed closed before validation; it made no runtime
or file change. Its attempted remote lookup was blocked and returned no data.
The corrected local-only resolver registered the frozen aliases and passed all
eight success and nine error fixtures.

Round 1 passing boundaries remain unchanged: the endpoint, API `1`, ProductCard
Schema `1.0.0`, content Schema `3.0.0`, closed fields, four actions,
filter/sort/pagination rules, error/header/cache behavior, checksum authority,
and future server-only consumer boundary all remain intact. No ProductCard
frontend consumer exists yet, and this audit did not create one.

Round 1 P2 remains explicitly deferred: the production media HTTPS origin and
Next Image allowlist are still open. This does not block the next
frontend-local contract snapshot, but it continues to block visible production
image rendering and deployment acceptance.

The minimum next frontend task remains a separately governed frontend-local
ProductCard contract snapshot and offline authority-bound verifier. It must not
be combined with Transport, Validator, Adapter, UI, SEO, cache, RFQ, real
product publication, or deployment work.

---

## Round 1 historical report

The following Round 1 report is preserved as the audit history that identified
the two now-closed P1 findings.

## Executive conclusion

The ProductCard CMS contract is additive, closed, checksum-bound, and technically suitable as the basis of a future frontend-local contract snapshot. The audit independently reproduced the exact 8-file transitive Schema closure, all 24 handoff checksums, seven success Schema validations, nine normalized error Schema validations, the four action cells, forbidden-key exclusion, shared frontend/CMS `public-path`, UUID, and error Schema byte parity, and the absence of any `/resolve` call from the ProductCard endpoint implementation.

The handoff is not yet sufficient to close the TASK-014 frontend consumer gate:

1. no captured runtime HTTP response contains exactly one ProductCard; and
2. every runtime Golden and the inline Schema positive use empty `series` and `applications`, so the handoff has no positive example of a non-empty identity-bound relation.

Both are explicit contract paths that the next frontend snapshot and later Adapter tests need. They cannot be inferred from implementation code or replaced by frontend-constructed samples while the CMS evidence remains incomplete.

No frontend, CMS, dependency, runtime, external system, task state, Git delivery, acceptance, or deployment change was made by this audit.

## Evidence read

### Task and design authority

- `TASKS/ACTIVE/TASK-014-product-card-collection-contract.md`
- `TASKS/ARTIFACTS/TASK-014/DESIGN.md`
- `TASKS/ARCHIVE/TASK-014-product-card-collection-contract.md`
- `TASKS/ARTIFACTS/TASK-013/PRODUCT_CARD_PROJECTION.md`
- `TASKS/ARTIFACTS/TASK-013/GAP_REPORT.md`

### Frozen handoff

- `TASKS/ARTIFACTS/TASK-014/PRODUCT_CARD_HANDOFF.md`
- `TASKS/ARTIFACTS/TASK-014/PRODUCT_CARD_HANDOFF_MANIFEST.json`
- `TASKS/ARTIFACTS/TASK-014/PRODUCT_CARD_HANDOFF_CHECKSUMS.sha256`
- `TASKS/ARTIFACTS/TASK-014/PRODUCT_CARD_SCHEMA_VALIDATION.json`
- `TASKS/ARTIFACTS/TASK-014/PRODUCT_CARD_RUNTIME_VALIDATION.json`
- `TASKS/ARTIFACTS/TASK-014/PRODUCT_CARD_DETERMINISM.json`
- `TASKS/ARTIFACTS/TASK-014/PRODUCT_CARD_ERROR_FIXTURES.json`
- `TASKS/ARTIFACTS/TASK-014/TEST_OR_VALIDATION_LOG.md`
- seven files under `TASKS/ARTIFACTS/TASK-014/golden-product-card/`

### Production and test boundaries

- the exact ProductCard 8-file Schema closure under `cms/wp-content/plugins/gdhe-site/config/schemas/`
- `cms/wp-content/plugins/gdhe-site/includes/product-cards.php`
- `cms/wp-content/plugins/gdhe-site/includes/public-api.php`
- `cms/wp-content/plugins/gdhe-site/tests/product-card-contract-test.php`
- `cms/wp-content/plugins/gdhe-site/tests/product-card-runtime-test.php`
- `cms/wp-content/plugins/gdhe-site/tests/product-card-schema-test.py`
- `docs/cms/REST_CONTRACT.md`
- `docs/architecture/headless-wordpress-nextjs-contract.md`

### Current frontend consumer

- `frontend/src/lib/cms/contracts/manifest.json`
- `frontend/src/lib/cms/server/config.ts`
- `frontend/src/lib/cms/server/resolve-url.ts`
- `frontend/src/lib/cms/server/transport.ts`
- `frontend/src/lib/cms/server/validation/registry.ts`
- `frontend/src/lib/cms/server/validation/index.ts`
- `frontend/src/lib/cms/server/adapter/cms-integration-page.ts`
- `frontend/src/lib/cms/server/integration/load.ts`
- `frontend/README.md`

## Independent verification results

### Exact Schema and checksum closure

`shasum -a 256 -c TASKS/ARTIFACTS/TASK-014/PRODUCT_CARD_HANDOFF_CHECKSUMS.sha256` returned `OK` for all 24 entries.

An independent local traversal started at `product-card-collection.v1.schema.json`, followed every non-fragment local `$ref`, rejected traversal or remote references, and produced exactly:

1. `card-action.v1.schema.json`
2. `card-attribute.v1.schema.json`
3. `product-card-collection.v1.schema.json`
4. `product-card.v1.schema.json`
5. `public-path.schema.json`
6. `public-protected-media.v1.schema.json`
7. `public-taxonomy-ref.v1.schema.json`
8. `uuid-v4.schema.json`

The audit also confirmed:

- the checksum file has exactly 24 lexicographically sorted repository-relative paths;
- its path/hash map exactly equals `PRODUCT_CARD_HANDOFF_MANIFEST.json.checksums`;
- all eight Schema paths and all seven Golden paths in the manifest exist;
- the CMS and current frontend copies of `public-path.schema.json`, `uuid-v4.schema.json`, and `error.schema.json` are byte-identical;
- all seven Golden responses validate against the ProductCard root;
- all nine ProductCard error fixtures validate against the existing normalized error root.

The first independent Schema validation attempt used an incomplete local URI store and safely failed while trying to resolve the reused UUID `$ref`; no file changed. The corrected local-only resolver registered both canonical `$id` and ProductCard-relative aliases and then passed seven success plus nine error validations without network access.

Result: `PASS` for closure integrity and current-byte reproducibility.

### Closed DTO and leakage boundary

The collection root, ProductCard item, media, taxonomy reference, attribute, and each action variant use closed object shapes. The public item has exactly:

`id`, `kind`, `model`, `name`, `publicPath`, `image`, `primaryCategory`, `series`, `applications`, `summary`, `keyAttributes`, `lifecycle`, `action`, and `modifiedAt`.

The audit recursively scanned every current Golden key and found no:

- WordPress/database/attachment ID;
- raw `postmeta`, `meta`, `acf`, or SCF container;
- Feishu record identity;
- internal Article Number result;
- supplier, cost, purchase price, margin, inventory, or internal note;
- original media path.

The endpoint constructs the normalized item itself and does not expose the private source document or WordPress origin. The current frontend production source contains no ProductCard consumer and therefore has no accidental raw CMS import or client exposure.

Result: `PASS` for the closed public DTO and forbidden-field boundary.

### Action and path boundary

All four runtime cells are present:

| Kind | Lifecycle | Mode | Target |
| --- | --- | --- | --- |
| `detail_product` | `active` | `view_product` | its canonical product path |
| `detail_product` | `discontinued` | `view_product` | its retained canonical product path |
| `catalog_accessory` | `active` | `direct_rfq` | `/request-a-quote/` |
| `catalog_accessory` | `discontinued` | `replacement_contact` | `/contact/` |

The audit independently checked every Golden item:

- a detail Product always has a non-null canonical `publicPath`;
- its `view_product.targetPath` equals that same path;
- a catalog accessory always has `publicPath: null`;
- its action and target match lifecycle exactly.

The source cannot override `action`, and the runtime negative matrix excludes `source_action`, missing detail path, and accessory-with-path candidates.

The future runtime Validator must preserve the Schema checks and add the cross-field semantic assertion that a detail action target equals the item `publicPath`; the current CMS derives that equality, but JSON Schema does not express equality between two arbitrary properties.

Result: `PASS` for the current action/path handoff, with an explicit future semantic-validator gate.

### Request, error, and cache boundary

The public request contract is explicit:

- fixed endpoint `/wp-json/gdhe/v1/product-cards`;
- locale `en` and ProductCard Schema `1.0.0`;
- integer `page >= 1`;
- integer `per_page` from 1 through 100;
- sort `modified_desc` or `title_asc`;
- optional `product_category:<slug>` filter;
- unknown parameters and invalid values fail closed.

The current evidence proves:

- success status `200`;
- JSON content type from the shared response helper;
- `ETag`;
- `Cache-Control: public, max-age=60`;
- UUID request ID header;
- matching `If-None-Match` returns `304`;
- normalized 400 error envelope;
- errors use `Cache-Control: no-store`;
- existing transport/proxy statuses remain distinct from normalized application errors.

This is sufficient for a later independent ProductCard Transport task, provided it does not alter or generalize TASK-009 `resolveCmsPath`. A future conditional request must treat `304` as a bodyless typed outcome and may use it only when a matching previously validated and adapted DTO cache entry exists. Invalid responses and error bodies must never replace last-known-good data.

Result: `PASS` for API error/header/cache semantics; frontend cache ownership and implementation remain a later task.

### Server-only feasibility

The current frontend already proves the reusable controls:

- `WORDPRESS_API_URL` is read only in server code;
- cleartext origin is limited to explicit-port loopback, while non-loopback requires HTTPS;
- credentials, query, fragment, non-HTTP protocols, and non-REST base paths fail closed;
- production CMS modules import `server-only`;
- Client Component build negatives cover public and deep server imports;
- the existing `/resolve` Transport accepts only a canonical public path plus optional abort signal and keeps base URL and timeout non-overridable.

The ProductCard consumer can remain server-only by creating an independent ProductCard entry rather than widening `resolveCmsPath`. A Client Component may receive only a frontend-owned readonly card DTO, never the Transport response, validated wrapper, raw payload, WordPress origin, ETag cache record, or credentials.

Result: `PASS` for feasibility; no ProductCard frontend module exists yet.

## Findings

### P1-1 — Runtime handoff does not prove the one-card HTTP case

Required contract:

`one collection HTTP request -> 0, 1, or N complete cards -> zero per-card /resolve`

Observed runtime Golden item counts, in manifest order:

`4, 0, 4, 2, 2, 0, 4`

The runtime validation summary records `2/2/0` pagination and eligible total `4`. The empty pre-Fixture route test proves zero, and the runtime collection cases prove N. No captured runtime request proves exactly one item.

`product-card-schema-test.py` contains an inline one-item instance, but that proves only JSON Schema acceptance. It does not prove the real route, request normalization, headers, total/totalPages, action derivation, eligibility, or one HTTP request for the one-item case.

Why this blocks the frontend handoff:

- TASK-013 and the TASK-014 audit request explicitly require runtime 0/1/N evidence;
- the next frontend snapshot must not invent a one-item authoritative success sample;
- code inspection that `per_page=1` appears supported is not execution evidence.

Required closure:

1. add one real anonymous ProductCard request with `per_page=1` and a deterministic page;
2. assert status `200`, exactly one item, total `4`, totalPages `4`, the frozen cache/request headers, and one route request;
3. retain zero ProductCard-internal and frontend per-card `/resolve` calls;
4. include the response or exact machine evidence in both determinism lifecycles;
5. regenerate affected runtime/Schema/determinism/manifest/checksum evidence and reverify all entries.

### P1-2 — No positive runtime evidence for non-empty series/application references

All items in all seven runtime Golden files have:

```json
"series": [],
"applications": []
```

The inline Schema positive also uses empty arrays. The P1 revision correctly proves that a mismatched UUID/path is rejected through the helper shared by `primaryCategory`, `series`, and `applications`, but only `primaryCategory` has a positive emitted identity-bound reference.

Why this blocks the frontend handoff:

- the next snapshot and Adapter need one authoritative positive shape for each non-empty relation array;
- a negative helper assertion does not prove the runtime emits a legitimate reference with the resolved target's stable UUID, public label, and canonical path;
- frontend-created relation samples would make frontend—not CMS evidence—the authority.

Required closure:

1. make at least one legal runtime card emit one non-empty series and one non-empty application reference;
2. bind each source UUID to the unique resolved target's stable public UUID;
3. assert the targets are public and linkable, their paths are canonical, and no dead link is emitted;
4. preserve the mismatch negative for all three reference positions;
5. capture the positive response in Golden/runtime evidence for both determinism lifecycles and refreeze the handoff.

### P2-1 — Production media origin and Next Image allowlist remain open

The public media Schema correctly requires HTTPS, dimensions, stable UUID, and non-empty alt. Current evidence uses synthetic `https://media.gdhe.example/...` URLs. The final production HTTPS media origin and Next Image allowlist are not frozen.

This does not block the next frontend-local snapshot, verifier, runtime Validator, or loopback Transport work. It blocks visible production image rendering, exact-platform image optimization acceptance, and deployment. Internal/original media remains forbidden regardless of origin choice.

## One-request and zero-resolve proof

The positive boundary that already passes is:

- `/product-cards` returns complete card fields in its `items` array;
- eligibility is applied before filter, total, and pagination;
- the ProductCard implementation performs one WordPress collection query and one projection pass;
- `includes/product-cards.php` contains no `/resolve`, `gdhe_rest_resolve`, HTTP client, curl, or fetch call;
- the current frontend contains no ProductCard consumer or ProductCard request;
- the only existing frontend production `fetch()` remains TASK-009 `/resolve`.

Therefore no existing ProductCard path performs per-card `/resolve`.

The future frontend proof must still use a loopback HTTP counter and assert, for runtime responses containing 0, 1, and N items:

- exactly one `/gdhe/v1/product-cards` request;
- exactly zero `/gdhe/v1/resolve` requests;
- one JSON parse for a `200` body;
- one full-envelope validation;
- one adaptation pass;
- zero browser requests to WordPress;
- all loopback handles close.

P1-1 prevents claiming the complete 0/1/N proof today.

## Minimum next frontend task

After both P1 findings are closed, the minimum next frontend task should be:

### Frontend-local ProductCard contract snapshot and verifier

Scope:

- copy exactly the frozen ProductCard 8-file closure into a separate frontend-owned snapshot tree;
- freeze exact source/snapshot path authority, API/Schema/endpoint identifiers, checksums, representative 0/1/N success samples, all four actions, non-empty positive relation refs, and selected normalized error samples in a sorted machine-readable manifest;
- reuse the byte-identical existing error root without duplicating or weakening its authority;
- add a Node-built-in offline verifier that fails closed for missing, extra, tampered, traversal, remote/unknown `$ref`, unsafe path, authority substitution, and source drift;
- add focused verifier tests and one package script;
- update only direct frontend documentation and standard execution evidence.

Explicit exclusions:

- no network Transport;
- no Ajv runtime registration;
- no validated wrapper or Adapter;
- no React component, card UI, route, visible page, Metadata, `SeoDocument`, RFQ, cache implementation, Preview, production data, or deployment;
- no modification of the existing `/resolve` snapshot or TASK-009 Transport semantics.

This is smaller and safer than combining snapshot, Validator, Transport, Adapter, and UI. It mirrors the proven TASK-008 authority-first sequence.

## Entry gates

Before starting the minimum next frontend task:

1. close P1-1 with real one-item route evidence;
2. close P1-2 with positive non-empty series/application runtime evidence;
3. rerun both database-ID determinism lifecycles, Schema/error validation, invalid exclusions, A3 regressions, zero-residue checks, and the complete handoff checksum verification;
4. obtain a fresh frontend read-only re-audit with `PASS / P0=0 / P1=0`; the production media P2 may remain an explicit later gate;
5. complete TASK-014 independent adversarial review and Planner validation;
6. follow the project lifecycle for user acceptance and Git delivery before starting a separate frontend task, unless the user explicitly authorizes a different governed sequence.

Later frontend runtime tasks must separately prove:

- a strict ProductCard runtime Validator and opaque immutable wrapper;
- a new server-only ProductCard Transport with fixed endpoint/version/query allowlist, one request, zero retry, redirect refusal, timeout/abort distinction, one parse, typed 200/304/error outcomes, and sanitized metadata;
- a readonly Adapter that enforces cross-field action/path semantics and never receives raw WordPress/SCF fields;
- one-request/zero-resolve loopback tests and public/deep Client Component build negatives;
- validated-last-known-good cache ownership before conditional `304` is used.

Visible UI additionally remains blocked by public protected production media/origin, real-product data, `SeoDocument`, and later page-state/accessibility/visual acceptance gates.

## Explicit non-delivery

This audit does not provide or authorize:

- a ProductCard frontend snapshot, Validator, Transport, Adapter, or page;
- a visible product collection;
- real GDHE product import or production publication;
- `SeoDocument`, Metadata, canonical origin, JSON-LD, Sitemap, or robots;
- RFQ submission, Feishu integration, cache implementation, Preview, Webhook, GraphQL, multilingual work, or deployment;
- review, task acceptance, commit, push, merge, or release.

## Final verdict

- P0: 0
- P1: 2
- P2: 1
- Verdict: `FAIL`

The closed Schema/checksum/action/error/server-only foundation is usable, but the handoff must add the missing one-item runtime request and positive non-empty series/application reference evidence before the next frontend contract snapshot can treat it as complete authority.

## Round 2 final verdict

- P0: 0
- P1: 0
- P2: 1
- Verdict: `PASS`

Both Round 1 P1 findings are closed. The production media origin and Next Image
allowlist remain the preserved P2 visible-page/deployment gate. The next
frontend work, if separately authorized after the remaining governance gates,
is only the frontend-local ProductCard contract snapshot and offline verifier.
