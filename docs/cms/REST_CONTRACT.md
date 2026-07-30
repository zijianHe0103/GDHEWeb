# GDHE REST contract

The transport remains `/wp-json/gdhe/v1`; every current response advertises Content Schema `3.0.0`.

## Endpoints

- `GET /schema`
- `GET /resolve?locale=en&path=/canonical/path/&schema=3.0.0`
- `GET /collection/{type}?locale=en&page=1&per_page=10&sort=modified_desc&filter=taxonomy:slug`
- `GET /navigation?locale=en`
- `GET /route-manifest?locale=en`
- `GET /product-cards?locale=en&schema=1.0.0&page=1&per_page=10&sort=modified_desc&filter=product_category:slug`

Collections allow `post`, `product`, `market`, `reference`, `support_article` and `download`. Filters are allowlisted as `product_category` for products, `support_topic` for support articles and `document_type` for downloads. Sort is `modified_desc` or `title_asc`, with slug as the deterministic tie-break.

All candidates pass the same complete envelope and unique canonical-route checks as `resolve` before pagination. `items` and `total` therefore use one eligible set. The A3 P1 revision freezes page sizes `2/1/0` and invariant totals `3/3/3` while excluding published unknown-template, known-but-mismatched-template, invalid-module and invalid-path candidates. The known Product/Market-template mismatch is also excluded from navigation and the route manifest.

## ProductCard collection

`/product-cards` is an additive anonymous read-only contract with independent Schema `1.0.0`. It returns complete normalized cards in one collection request; a consumer must make zero per-card `/resolve` requests. The closed envelope contains `apiVersion`, `schemaVersion`, `locale`, `type`, `sort`, `filter`, `page`, `perPage`, `total`, `totalPages` and `items`.

Each item contains only stable public UUIDs and the frozen card fields: kind, model, name, nullable canonical path, protected HTTPS media, primary category, approved series/applications, optional summary, at most three approved attributes, lifecycle, server-derived action and modified timestamp. WordPress IDs, raw meta/ACF/SCF, Article Number internals, Feishu fields, supplier/cost data and internal media paths are excluded.

Public taxonomy references are identity-bound. For primary category, series and applications, the source `id` must exactly match the stable public UUID of the unique target resolved from `publicPath`; independently valid but mismatched UUID/path pairs fail closed.

They are also role-bound. `primaryCategory` accepts only `/products/curtain-track-systems/` or `/products/accessories/` and at most one category segment below either hub. `series` accepts `/series/` or one series segment. `applications` accepts `/applications/` or one application segment. A complete public target under another role is rejected.

The frozen runtime evidence includes `per_page=1&page=1`: anonymous HTTP `200`, exactly one complete item, total `4`, total pages `4`, the standard success headers and zero per-card `/resolve` requests. A valid Fixture card also carries one non-empty identity-bound series and application reference.

Eligibility is applied before filtering, `total` and pagination. Only published Product records with a valid private source document, local-only test-candidate or production source class, explicit website eligibility, protected image, valid public category, valid model/UUID, allowed attributes and a consistent kind/lifecycle/path matrix enter the result. The four actions are derived by the server: detail products always use `view_product`; active catalog accessories use `direct_rfq`; discontinued catalog accessories use `replacement_contact`.

The endpoint accepts only English, ProductCard Schema `1.0.0`, integer pagination, `modified_desc|title_asc`, and an optional `product_category:<slug>` filter. Page values must fit the native integer and produce an integer-safe offset; overflow is rejected before query/slicing through normalized `gdhe_invalid_pagination` HTTP `400` with `no-store`. Other parameters fail closed. Content Schema `3.0.0`, `/resolve`, `/collection/{type}`, navigation and route manifest are unchanged.

## Page envelope

The normalized envelope contains:

- `apiVersion`, `schemaVersion`, UUIDv4 `id`
- `type`, closed `templateKey`, `locale`, canonical `publicPath`
- title, optional excerpt, published/modified timestamps
- optional public media
- controlled modules
- the five fixed relationship arrays
- type-specific `details`

Product `details` expose structured features, specifications, article numbers, finishes, installation/control/compatibility, gallery, HTTPS-only video and inquiry CTA. Support video is also HTTPS-only. Reference and support rich text is exposed only through `solutionSafeHtml` or `instructionsSafeHtml`.

Download `details.file` is `{id, url, filename, mimeType, bytes}`. Its `id` is UUIDv4. WordPress attachment IDs and internal filesystem paths never appear.

## Canonical paths

- page: explicitly stored path
- post: `/news/{slug}/`
- product: `/products/{slug}/`
- market: `/markets/{slug}/`
- reference: `/references/{slug}/`
- support article: `/support/{support-topic}/{slug}/`, with exactly one topic
- download: `/downloads/{slug}/`

Root `/` and lowercase slash-terminated ASCII slug paths are valid. Double slashes, dot segments, uppercase, encoded separators, query strings, fragments, missing trailing slash and paths longer than 500 bytes are invalid.

## Headers and errors

Successful responses use `ETag`, `Cache-Control: public, max-age=60`, JSON Content-Type and UUIDv4 `X-GDHE-Request-ID`; resolve also uses `Last-Modified`. A matching `If-None-Match` returns `304`. Errors use `Cache-Control: no-store`.

Stable application codes remain:

| HTTP | Code |
|---:|---|
| 400 | `gdhe_invalid_locale` |
| 400 | `gdhe_invalid_path` |
| 400 | `gdhe_invalid_schema` |
| 400 | `gdhe_invalid_collection_type` |
| 400 | `gdhe_invalid_filter` |
| 400 | `gdhe_invalid_sort` |
| 400 | `gdhe_invalid_pagination` |
| 400 | `gdhe_invalid_parameter` |
| 404 | `gdhe_not_found` |
| 409 | `gdhe_route_conflict` |
| 500 | `gdhe_contract_invariant` |

Transport/auth/proxy statuses such as 401, 403, 429, 502 and 503 are not remapped to application errors.

## Frozen boundaries

- REST API `1`
- Content Schema `3.0.0`
- Module Schema `1.0.0`
- Fixture `TASK-007-A3-REVIEW-R1`
- ProductCard Schema `1.0.0`
- ProductCard Fixture `TASK-014-PRODUCT-CARD-1`
- 15 Golden files under `TASKS/ARTIFACTS/TASK-007/golden-a3/`, including native Post and non-root Page resolve positives

The Draft 2020-12 schemas are registered by `config/schema.v3.json`. Two complete fixture lifecycles with different WordPress database IDs produced identical 15/15 Golden hashes. GraphQL is not installed, implemented or adopted.
