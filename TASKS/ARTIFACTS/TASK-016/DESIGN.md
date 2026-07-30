# TASK-016 Design

status: `FROZEN_FOR_IMPLEMENTATION`
task: `TASK-016`
owner: `planner`

## 1. Outcome

TASK-016 adds one independent, server-only ProductCard runtime consumer:

```text
ProductCard query
  -> fixed ProductCard Transport
  -> unknown JSON
  -> ProductCard Schema + semantic Validator
  -> authentic validated wrapper
  -> readonly frontend ProductCard DTO
```

The future UI may consume only the final DTO. This task does not create a React component or route.

## 2. Confirmed test seams

The task card confirmed by the user freezes four public behavioral seams:

1. **Transport seam** — a typed ProductCard query produces one fixed anonymous HTTP request and a typed `200 | 304 | error` outcome.
2. **Validator seam** — unknown JSON becomes an authentic immutable validated wrapper only after ProductCard Schema `1.0.0` and cross-field semantics pass.
3. **Adapter seam** — only an authentic success wrapper becomes a deeply readonly frontend DTO.
4. **Orchestration seam** — one call performs one collection request, zero per-card `/resolve` calls, then validates and adapts.

Tests must observe these public seams. They may substitute only the WordPress HTTP boundary with a loopback server; they must not mock internal modules or private functions.

## 3. Ownership and isolation

- New production code lives only under `frontend/src/lib/cms/server/product-cards/**`.
- The frontend DTO lives in `frontend/src/types/product-card.ts`.
- TASK-009 `/resolve` modules are imported only where a stable existing boundary is reusable; they are not edited, re-exported more broadly or generalized.
- ProductCard runtime validation statically imports only the TASK-015 frontend Snapshot.
- Production runtime code never reads `cms/**`, `TASKS/**`, the filesystem or remote Schema references.
- Existing `/resolve` Snapshot, Transport, Validator, Adapter and `/integration/cms` remain byte-stable.

## 4. Public API

The public ProductCard server entry exposes one SDK-style orchestration function and its safe types:

```ts
loadProductCardCollection(
  query?: ProductCardCollectionQuery,
  callerSignal?: AbortSignal,
): Promise<ProductCardCollectionDto>
```

The query is closed:

```ts
type ProductCardCollectionQuery = Readonly<{
  page?: number;
  perPage?: number;
  sort?: "modified_desc" | "title_asc";
  filter?: `product_category:${string}`;
}>;
```

Defaults:

- `page = 1`
- `perPage = 10`
- `sort = "modified_desc"`
- filter omitted

Runtime validation rejects non-plain inputs, unknown keys, non-safe integers, out-of-range pagination, invalid sort and invalid filter. Extra properties passed through casts or JavaScript callers are not ignored.

The Transport may have a separate server-only testable seam within the new directory, but the normal application entry must remain the orchestration function. It accepts no caller-provided origin, endpoint, locale, schema, timeout, headers, fetch implementation or retry policy.

## 5. URL and request contract

The URL is deterministically built from the existing validated `WORDPRESS_API_URL` REST base:

```text
/gdhe/v1/product-cards
  ?locale=en
  &schema=1.0.0
  &page=<page>
  &per_page=<perPage>
  &sort=<sort>
  [&filter=product_category:<slug>]
```

Request invariants:

- one anonymous `GET`;
- `Accept: application/json`;
- redirect mode `error`;
- `cache: no-store`;
- 5000 ms timeout;
- optional caller abort remains distinguishable from timeout;
- no retry;
- no Cookie, Authorization, nonce, Application Password or conditional request.

No call path may invoke `/resolve` for a card.

## 6. Transport outcomes

The Transport parses a body at most once and returns only:

- `ok`: HTTP `200`, unknown body and sanitized metadata;
- `not_modified`: HTTP `304`, no body and sanitized metadata.

All other statuses throw typed errors. Sanitized metadata is limited to:

- status;
- `X-GDHE-Request-ID`;
- `ETag`;
- `Cache-Control`;
- `Retry-After`;
- Content-Type.

Protocol rules:

- `200` requires a JSON media type, non-empty valid JSON, a non-empty ETag and `Cache-Control: public, max-age=60`;
- `304` is bodyless and typed, but this task never sends `If-None-Match`;
- a `304` cannot become a DTO because this task owns no matching validated cache entry;
- normalized JSON HTTP errors require `Cache-Control: no-store`;
- redirects, unexpected 2xx, non-JSON, empty/invalid JSON, network, timeout and caller abort have stable non-leaking categories;
- raw response bodies and the CMS origin never appear in enumerable errors or error messages.

## 7. Runtime Validator

The ProductCard Validator:

- statically imports the exact TASK-015 8-file Schema closure;
- uses existing exact dependencies `ajv@8.20.0` and `ajv-formats@3.0.1`;
- compiles Draft 2020-12 with strict validation and no remote loading;
- snapshots unknown input before validation;
- checks `apiVersion === "1"` and `schemaVersion === "1.0.0"`;
- validates the collection root;
- additionally requires every `detail_product` action target to equal that item’s `publicPath`;
- preserves the frozen detail/accessory, lifecycle, action and path matrix;
- deep-freezes a caller-isolated snapshot;
- returns an authentic wrapper protected by a module-private brand and `WeakSet`;
- exposes the validated body only to the Adapter through a non-replaceable internal getter.

The wrapper must not serialize or spread its body. An ordinary structural object, copied wrapper, authentic error wrapper or prototype-forged value is rejected.

Normalized HTTP errors use the existing frontend-owned common error Schema through the existing server-only error Validator. Orchestration additionally checks HTTP status equals body `status`. Invalid error payloads fail closed and are never exposed as raw data.

## 8. DTO Adapter

`ProductCardCollectionDto` is a frontend-owned recursive readonly type containing:

- collection identity: API version, ProductCard Schema version, locale and type;
- request result: sort, filter, page, per-page, total and total pages;
- all complete public card fields from ProductCard Schema `1.0.0`;
- readonly image, category, relation, key-attribute and action records.

The Adapter copies validated data into an independent deeply frozen DTO. It does not:

- recompute or override action;
- infer Article Number;
- invent product options;
- remove cards based on incomplete quotation detail;
- include Transport metadata or the validated wrapper;
- include raw WordPress/SCF/meta, database IDs, Feishu fields, supplier, cost, price, inventory, internal notes or internal media paths.

## 9. Orchestration and errors

The orchestration sequence is fixed:

1. validate the closed query;
2. make one ProductCard Transport call;
3. for `200`, validate the unknown body and adapt it;
4. for `304`, throw a sanitized `not_modified_without_cache` protocol error;
5. for HTTP error, validate the common error envelope and status equality, then throw a sanitized ProductCard HTTP error without the raw body;
6. do not recover invalid or unavailable data as an empty list, 404 or stale value.

The application-facing error surface contains only stable category/kind/status and allowlisted request metadata. It never contains CMS URLs, credentials, raw JSON, Ajv diagnostics or internal field values.

## 10. TDD slices

Implementation proceeds vertically:

1. query + one fixed Transport request;
2. `200`, `304`, protocol and HTTP outcomes;
3. Schema success validation + authentic wrapper;
4. semantic action/path rejection;
5. Adapter for 0/1/N and complete public fields;
6. orchestration for success and validated errors;
7. one-request/zero-resolve and Client Component import negatives.

Each slice records a real behavior-level RED before the minimum GREEN. No bulk horizontal test suite is written ahead of all implementation.

## 11. Cache boundary

TASK-016 deliberately uses `no-store` and owns no last-known-good cache. `304` support stops at a bodyless typed Transport outcome and a fail-closed orchestration error.

A later cache task must bind a conditional request to a matching, previously validated and adapted DTO entry before it can reuse `304`. Invalid responses must never replace known-good data.

## 12. Documentation and next boundary

Implementation updates `frontend/README.md`; the frontend lane records the exact root README delta for the Planner because root README is outside that lane’s registered scope.

After TASK-016 is validated, independently reviewed, accepted and delivered, the next task may create the first local visible ProductCard/category-to-detail slice. TASK-016 itself remains non-visual.
