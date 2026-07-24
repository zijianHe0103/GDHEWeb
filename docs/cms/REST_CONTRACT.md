# GDHE REST contract

The transport remains `/wp-json/gdhe/v1`; every current response advertises Content Schema `3.0.0`.

## Endpoints

- `GET /schema`
- `GET /resolve?locale=en&path=/canonical/path/&schema=3.0.0`
- `GET /collection/{type}?locale=en&page=1&per_page=10&sort=modified_desc&filter=taxonomy:slug`
- `GET /navigation?locale=en`
- `GET /route-manifest?locale=en`

Collections allow `post`, `product`, `market`, `reference`, `support_article` and `download`. Filters are allowlisted as `product_category` for products, `support_topic` for support articles and `document_type` for downloads. Sort is `modified_desc` or `title_asc`, with slug as the deterministic tie-break.

All candidates pass the same complete envelope and unique canonical-route checks as `resolve` before pagination. `items` and `total` therefore use one eligible set. The A3 P1 revision freezes page sizes `2/1/0` and invariant totals `3/3/3` while excluding published unknown-template, known-but-mismatched-template, invalid-module and invalid-path candidates. The known Product/Market-template mismatch is also excluded from navigation and the route manifest.

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
| 404 | `gdhe_not_found` |
| 409 | `gdhe_route_conflict` |
| 500 | `gdhe_contract_invariant` |

Transport/auth/proxy statuses such as 401, 403, 429, 502 and 503 are not remapped to application errors.

## Frozen boundaries

- REST API `1`
- Content Schema `3.0.0`
- Module Schema `1.0.0`
- Fixture `TASK-007-A3-REVIEW-R1`
- 15 Golden files under `TASKS/ARTIFACTS/TASK-007/golden-a3/`, including native Post and non-root Page resolve positives

The Draft 2020-12 schemas are registered by `config/schema.v3.json`. Two complete fixture lifecycles with different WordPress database IDs produced identical 15/15 Golden hashes. GraphQL is not installed, implemented or adopted.
