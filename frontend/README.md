# GDHE frontend foundation

Minimal Next.js App Router and TypeScript foundation for GDHE. The root page is a runtime placeholder, not the production homepage or global site shell.

## Toolchain

- Node.js 24.18.0 (`.nvmrc`; supported Node.js 24 LTS line)
- npm 11.16.0 from the official Node.js 24.18.0 distribution
- `package-lock.json` as the only package manager lockfile
- Next.js 16.2.11, React 19.2.8, and TypeScript 5.9.3

The versions were checked on 2026-07-22 against the [Next.js installation guide](https://nextjs.org/docs/app/getting-started/installation), [Next.js 16 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16), [Next.js 16.2 release notes](https://nextjs.org/blog/next-16-2), [Node.js release status](https://nodejs.org/en/about/previous-releases), and npm registry metadata for the selected packages.

The machine's default NVM runtime, Node.js 20.20.2, now has EOL status even though it satisfies Next.js 16's declared minimum. The project requires Node.js 24.x and was validated with the official Node.js 24.18.0 macOS arm64 distribution. The validation runtime stayed outside the repository and was not installed globally.

## Local setup

```sh
nvm install 24.18.0
nvm use
node --version
npm --version
npm ci
cp .env.example .env.local
npm run dev
```

The two version commands must print `v24.18.0` and `11.16.0`. A normal fresh NVM installation of Node.js 24.18.0 uses the npm bundled by that official Node.js release. If either value differs, stop and repair the local runtime selection before installing dependencies; `packageManager` records the required npm version but a bare npm command does not switch versions automatically.

Open `http://localhost:3000`. The example values are deliberately non-production placeholders. Replace them locally only when a later task introduces CMS data access. Never commit a real CMS URL, credential, token, or preview secret.

## Environment contract

- `NEXT_PUBLIC_SITE_URL`: public canonical site origin. Only this variable is exposed to browser code.
- `WORDPRESS_API_URL`: server-only WordPress REST API base consumed by the CMS Transport. Use a REST base ending exactly in `/wp-json`, such as `http://127.0.0.1:8080/wp-json` locally or `https://cms.example.com/wp-json` in production.
- `GDHE_ENABLE_CMS_INTEGRATION_PAGE`: server-only technical-route gate. Only the exact value `1` enables `/integration/cms`; every other value keeps it unavailable.
- `GDHE_CMS_INTEGRATION_PATH`: server-only canonical English public path consumed by the technical route. It is ignored while the route is disabled and cannot be overridden by browser input.

Cleartext HTTP is accepted only for `localhost`, `127.0.0.1`, and IPv6 loopback with an explicit port, such as `:8080`. Non-loopback CMS origins require HTTPS. Credentials, query strings, fragments, non-HTTP protocols, and non-REST base paths fail closed before a request is sent.

## Validation

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run test:image-optimizer
npm audit --audit-level=high
```

`test:image-optimizer` requires a completed production build. It creates a temporary 64x64 PNG outside the production UI, starts `next start`, calls `/_next/image`, and requires HTTP 200 plus a transformed 32x32 image response. It removes the source fixture and its Next Image cache before exiting.

## Temporary Sharp override

Next.js 16.2.11 declares optional Sharp range `^0.34.5`, while this project temporarily overrides Sharp to 0.35.3 because registry advisories affect versions below 0.35.0. Sharp 0.35 introduced breaking changes, so ordinary build and root-page checks are insufficient. Sources checked on 2026-07-22: [Next.js registry metadata](https://registry.npmjs.org/next/16.2.11) and the [Sharp 0.35.0 changelog](https://sharp.pixelplumbing.com/changelog/v0.35.0/).

Current runtime matrix:

| Platform | Architecture | Runtime | Next / Sharp | Image optimizer result |
|---|---|---|---|---|
| macOS | arm64 | Node.js 24.18.0, npm 11.16.0 | 16.2.11 / 0.35.3 | PASS: HTTP 200, WebP, 32x32, cache MISS |
| macOS | x64 | not tested | 16.2.11 / 0.35.3 | deployment blocked until fixture passes |
| Linux glibc | x64 or arm64 | not tested | 16.2.11 / 0.35.3 | deployment blocked until fixture passes |
| Linux musl | x64 or arm64 | not tested | 16.2.11 / 0.35.3 | deployment blocked until fixture passes |
| Windows | x64 or arm64 | not tested | 16.2.11 / 0.35.3 | deployment blocked until fixture passes |

No deployment platform is selected in this foundation task. Before selecting one, run the full validation suite and `test:image-optimizer` on that exact platform and architecture.

Recheck the upstream range on every Next.js upgrade and before deployment:

```sh
GDHE_NEXT_VERSION=$(node -p "require('./package.json').dependencies.next")
npm view "next@$GDHE_NEXT_VERSION" optionalDependencies.sharp
npm ls next sharp
npm audit --audit-level=high
```

Remove the Sharp override only when the selected Next.js release declares a range containing an advisory-free Sharp version. Delete the override, regenerate the lockfile with the pinned Node/npm pair, then require fresh `npm ci`, lint, typecheck, tests, build, audit, root HTTP smoke, and image optimizer fixture on every intended deployment platform. Until that gate passes, the override remains temporary and untested platforms remain blocked.

## CMS contract snapshot

TASK-008 freezes the smallest frontend-owned copy of the TASK-007 `/resolve` contract under `src/lib/cms/contracts/`. The CMS Schema files, TASK-007 Golden files, and TASK-007 error fixtures remain authoritative; `manifest.json` records their repository-relative paths and SHA-256 values.

Run the offline parity check with the pinned Node.js runtime:

```sh
npm run verify:cms-contract
```

The verifier uses only Node.js built-ins. It fails closed for missing, extra or tampered snapshot files, unsafe paths, unknown or remote Schema references, incomplete local `$ref` closure, source drift, and error-bundle reconstruction drift.

This snapshot does not connect to WordPress, read environment variables, add a runtime Schema validator or DTO adapter, or create a visible page. Future runtime code must consume the local normalized contract without importing `cms/` or `TASKS/`.

## ProductCard contract snapshot

TASK-015 freezes an independent frontend-owned copy of the TASK-014 ProductCard
collection contract under `src/lib/cms/product-card-contract/`. It contains the
exact eight-file ProductCard Schema closure, three authoritative success
samples covering 0/1/N items, all four action cells and non-empty relations,
plus six deterministically selected normalized errors.

Run its offline authority and parity check with the pinned Node.js runtime:

```sh
npm run verify:product-card-contract
```

The Node-built verifier uses only built-in modules. It binds the Snapshot to
the canonical TASK-014 handoff manifest and checksum file, verifies exact
source/snapshot bytes and inventory, follows only the frozen local `$ref`
closure, and fails closed for missing, extra, tampered, traversing, remote,
unknown, substituted or drifted inputs. Mutation tests operate only on
temporary repository copies.

This directory is deliberately separate from the TASK-008 `/resolve` Snapshot
and does not change `verify:cms-contract`. It is not a ProductCard Transport,
runtime Validator, DTO Adapter, React component, route, visible page, cache,
SEO implementation or WordPress connection. Runtime modules must consume only
frontend-owned normalized data and must never import `cms/` or `TASKS/`.

## Product Configuration and QuoteLine contracts

TASK-019 freezes an independent frontend-owned snapshot of the WordPress
`ProductConfigurationDocument 1.0.0` authority under
`src/lib/cms/product-configuration-contract/`. The snapshot contains the exact
four-file Schema closure, the single confirmed FGD X15+PVC success Golden and
six deterministically selected normalized errors. Its Node-built verifier
binds the canonical TASK-019 handoff and all 17 authority checksums, then fails
closed on symlinked or non-canonical authority objects as well as inventory,
byte, path, `$ref`, version, endpoint, query or sample drift:

```sh
node scripts/verify-product-configuration-contract.mjs
npm test -- tests/product-configuration-contract-snapshot.test.ts
```

`src/lib/quote-contract/` is a separate website inquiry-domain contract. Its
closed `QuoteLine 1.0.0` Schema and readonly TypeScript surface cover resolved
`GDHEPRD000172 / 6 m / Ivory White` lines and unresolved custom-length lines.
Identity excludes quantity and includes the complete product, selection,
installation and track-packaging configuration; merge returns new deterministic
serializable lines without mutating caller input. Quantity is a positive
JavaScript safe integer through `9007199254740991`; invalid inputs and sums
above that technical representation boundary fail closed. Run its focused gate
with:

```sh
npm test -- tests/quote-line-contract.test.ts
```

These are offline contracts only. They do not change the CMS Transport,
runtime Validator, Adapter, Product Detail or ProductList, and they do not add
a configurator, Add to Quote control, basket, browser persistence, submission
endpoint, WordPress write model, Feishu integration or deployment behavior.

TASK-021 adds an independent Product Configuration `2.0.0` authority and
retains QuoteLine `2.0.0` as a future server-side conversion contract without
changing any v1 byte. The v2 CMS snapshot is bound to the
frozen TASK-021 handoff and contains exactly four Schemas, the one confirmed
`6 m / Ivory White` success document, and six normalized errors. QuoteLine v2
removes Installation completely; its configuration contains Packaging only.
The visible Add to Quote action does not create that QuoteLine contract.

```sh
node scripts/verify-product-configuration-v2-contract.mjs
node scripts/verify-quote-line-v2-contract.mjs
npm test -- tests/product-configuration-v2-contract-snapshot.test.ts tests/quote-line-v2-contract.test.ts
```

## Server-only ProductCard runtime consumer

`src/lib/cms/server/product-cards/` is the independent runtime consumer for the
frozen ProductCard collection contract. Its public
`loadProductCardCollection(query?, callerSignal?)` entry accepts only the
closed pagination, sort, and `product_category:<slug>` filter query. It reads
the existing server-owned `WORDPRESS_API_URL`, then performs exactly one
anonymous request to the fixed English ProductCard `1.0.0` endpoint with a
5000 ms timeout, no retry, redirect refusal, and `no-store`.

A `200` body remains unknown until the exact local eight-Schema ProductCard
closure and the detail action/path equality rule pass. The authentic,
caller-isolated wrapper can then be copied into a deeply frozen
frontend-owned DTO. Normalized HTTP errors are validated against the existing
common error Schema and sanitized before they leave orchestration. A bodyless
`304` is recognized by the Transport but fails closed because this task owns
no matching validated last-success cache.

The consumer never calls `/resolve` per card and never exposes the CMS origin,
Transport metadata, raw JSON, WordPress/SCF fields, database IDs, or internal
commercial data to future UI. It remains server-only and creates no component,
route, visible page, cache, Preview, SEO, RFQ, or deployment behavior.

Run its focused gates with Node.js 24.18.0:

```sh
npm test -- tests/product-card-transport.test.ts tests/product-card-runtime-validator.test.ts tests/product-card-adapter.test.ts tests/product-card-consumer.test.ts tests/product-card-server-only.test.ts
npm run verify:product-card-contract
npm run verify:cms-contract
```

## RelatedProductCard and Quote Basket 2.0

TASK-023 adds an independent frontend-local snapshot of the final 26-file
RelatedProductCard handoff under `src/lib/cms/related-product-card-contract/`.
Its Node-built-in verifier is hard-bound to the frozen WordPress manifest and
checksum stream and fails closed on inventory, checksum, authority-path,
source-byte, traversal and unknown-reference drift:

```sh
node scripts/verify-related-product-card-contract.mjs
```

The server-only consumer validates the exact nine-Schema closure and performs
one fixed English `related-product-cards` collection request for the Product
Detail source path. It never resolves cards individually. Invalid responses
and normalized errors are sanitized; an unavailable related collection omits
only the recommendation module. Until an approved production media origin and
Next Image allowlist exist, remote CMS media is rejected before React. Preview
receives only public local `TEST_CANDIDATE` projections without Product, Media
or taxonomy UUIDs, raw action enums or CMS diagnostics.

Quote Basket `2.0.0` is an additive closed public union of
`configured_product` and `catalog_accessory` lines. Canonical `1.0.0` browser
data remains readable and is mapped losslessly in memory; it is written as
canonical `2.0.0` only on the next valid mutation. The existing storage key,
256 KiB ceiling, exact 30-day TTL and same-origin last-writer-wins behavior are
preserved. Catalog accessories require a complete public descriptor, catalog
path, explicit quantity unit and positive safe-integer quantity, and never
fabricate track length, color, installation or packaging. Its local contract
gate is:

```sh
node scripts/verify-quote-basket-v2-contract.mjs
```

## Local-only ProductCard list slice

`/products/` is a controlled English ProductCard presentation slice. It is
not the production catalog. The route is disabled by default, always exports
`noindex,nofollow`, and cannot be enabled when `NODE_ENV=production`.

Use exactly one server-only local mode:

```sh
GDHE_PRODUCT_LIST_MODE=preview npm run dev
```

Preview mode renders the frozen FGD X15 protected test candidate from
`public/test-candidates/` and performs no CMS request. The visible notice
states that the content is a local test candidate, not a production catalog.

To exercise the authentic TASK-016 consumer against a controlled local CMS:

```sh
WORDPRESS_API_URL=http://127.0.0.1:8080/wp-json \
GDHE_PRODUCT_LIST_MODE=cms \
npm run dev
```

CMS mode performs one fixed English ProductCard collection request with
`page=1`, `perPage=12`, and `sort=modified_desc`; it performs no per-card
`/resolve` requests. Valid empty collections and sanitized unavailable states
remain distinct. Before React renders a non-empty CMS collection, every media
URL must be a safe root-relative same-frontend-origin path. Absolute,
protocol-relative, malformed or backslash-confused media makes the whole
collection use the sanitized unavailable state; no CMS media origin or policy
diagnostic enters markup. This remains fail closed until a separate task
authorizes the production public-media origin and Next Image allowlist.
Unknown or unset modes return the framework 404.

The slice uses a reusable native responsive image for the repository-local
protected candidate. Production HTTPS media origin selection and the Next
Image allowlist remain deferred deployment gates; no remote-image fallback is
configured here. Product details, working RFQ/contact targets, real production
products, public SEO, filtering, pagination, visual QA and deployment are also
outside this slice.

## Local-only FGD X15+PVC Product Detail slice

`/products/fgd-x15-pvc/` is a controlled English Product Detail slice for the
same local FGD X15+PVC candidate shown by the ProductCard preview. It is
disabled by default, always `noindex,nofollow`, and cannot be enabled when
`NODE_ENV=production`.

Render the frozen frontend-owned DTO with zero network access:

```sh
GDHE_PRODUCT_DETAIL_MODE=preview npm run dev -- --hostname 127.0.0.1
```

Open the preview through the same `127.0.0.1` origin. Do not start it as
`localhost` and then browse it through `127.0.0.1`; Next.js development-origin
protection intentionally rejects that mismatch.

Exercise the authentic Schema 3 `/resolve` boundary against a controlled local
CMS:

```sh
WORDPRESS_API_URL=http://127.0.0.1:8080/wp-json \
GDHE_PRODUCT_DETAIL_MODE=cms \
npm run dev
```

CMS mode performs exactly one fixed English `/resolve` request for
`/products/fgd-x15-pvc/`, validates it with the existing 16-Schema runtime
Validator, and adapts only the exact confirmed product identity and five
display specifications. After a ready detail, it performs exactly one fixed
Product Configuration `schema=2.0.0` request and one complete
RelatedProductCard `schema=1.0.0` collection request; it performs no ProductCard
collection request, per-card `/resolve`, per-option request or retry. Only a
validated `gdhe_not_found` HTTP 404 from
the detail boundary becomes a page 404. A configuration failure keeps the
detail visible and replaces the form with a sanitized navigation-only fallback.

Both modes render the repository-local protected image and exclude CMS media,
Article Number, internal product codes, raw modules, relations and diagnostics.
Both ready states also display an explicit local test-candidate notice; CMS
mode identifies itself as a non-production CMS test candidate rather than
implying that validated data is publicly published.
When configuration is ready, the Hero action navigates to the local
`Configure Your Track` section. The form asks for Track Length first, then
Color, Packaging and Quantity. Standard lengths and colors come only from the
validated v2 DTO; Custom Length is a sibling length choice. Installation is
not a configurator field or QuoteLine value, while the separate Product Detail
fact may still describe ceiling and wall mounting support. The form creates a
public quote draft, then adds or merges it into the browser-local Quote Basket
retained for 30 days. The Basket contains no Article Number, internal Product
UUID or internal resolution enum and is not a QuoteLine 2.0.0. The complete
QuoteLine remains a future server-side conversion at final Request a Quote
submission. The `You May Also Need` module appears after the configurator.
Preview starts with three protected local candidates and reveals at most three
more per button activation without another request. Detail products use `View
Product`; catalog accessories use the same card skeleton and `Add to Quote`
button geometry, add an initial quantity of `1`, stay on the page and expose
`View Quote Basket`. Quantity editing and removal remain in the Basket. A
canonical `View Product` navigation stores only session-scoped public
`visibleCount` and scroll position so browser Back restores the source
recommendation state without URL parameters or product/CMS identity.
In preview mode only, the declared detail candidates at
`/products/test-candidate-1/`, `-3/`, `-5/` and `-7/` resolve to closed,
`noindex,nofollow` navigation landings using the same protected local media.
They remain explicit non-production `TEST_CANDIDATE` pages with no network or
commerce action. Other candidate paths, catalog-accessory paths, unset/disabled
mode, CMS mode and every production build remain final 404.
CMS mode with no safely renderable eligible media omits the module entirely.
The local `/request-a-quote/` page shows protected public rows,
supports quantity and Remove, and remains `noindex,nofollow` plus production
404. Its disabled final action makes clear that no RFQ is submitted and no
external system is contacted. When configuration is unavailable, `Request a
Quote` remains ordinary navigation to that local Basket workspace. This slice
is not a production product page, formal SEO implementation, final copy, visual
acceptance, CMS import or deployment authorization.

Run the TASK-021 frontend focused gates with Node.js 24.18.0:

```sh
npm test -- tests/product-configuration-v2-contract-snapshot.test.ts tests/product-configuration-v2-consumer.test.ts tests/quote-line-v2-contract.test.ts tests/product-configurator-v2-presentation.test.ts tests/product-configurator-interaction.test.ts tests/product-detail-loader.test.ts tests/product-detail-route.test.ts
node scripts/verify-product-configuration-v2-contract.mjs
node scripts/verify-quote-line-v2-contract.mjs
```

## Server-only CMS Transport

`src/lib/cms/server/` provides the server-only network boundary for the fixed English Schema 3 `/gdhe/v1/resolve` endpoint. Its public entry accepts only a canonical public path and an optional caller `AbortSignal`; origin, endpoint, locale and schema cannot be overridden.

Each call performs one anonymous `GET` with `Accept: application/json`, `no-store`, redirect refusal, a 5000 ms timeout and no retry. JSON is parsed once and remains `unknown`. Only status, content type, request ID, ETag, Last-Modified and Retry-After metadata cross the boundary.

Configuration, timeout, caller abort, network, protocol and HTTP status failures use typed errors without exposing the CMS origin or raw response body through messages or serialization. A 404 is classified as `not_found`, but this layer does not call Next.js `notFound()`.

This Transport is not a runtime Schema Validator, DTO Adapter, cache, Preview path, visible CMS page or live WordPress E2E. Run its isolated loopback test and the normal gates with:

```sh
npm test -- tests/cms-transport.test.ts
npm run verify:cms-contract
npm run lint
npm run typecheck
npm test
npm run build
```

## Offline CMS integration vertical slice

`src/lib/cms/server/adapter/` and `src/lib/cms/server/integration/` connect the existing Transport and Runtime Validator to one frontend-owned immutable DTO. The no-argument orchestration entry reads only server-owned configuration, performs one `/resolve` request, validates the unknown success or error body, and adapts only validated success data. Only an agreed Transport 404 plus validated error status `404` and code `gdhe_not_found` becomes the route's not-found result; every other failure remains non-404.

`/integration/cms` is a local technical Server Component, not a public page template or the production homepage. It is disabled unless `GDHE_ENABLE_CMS_INTEGRATION_PAGE=1`, uses only `GDHE_CMS_INTEGRATION_PATH`, renders a small plain-text DTO summary, and exports `noindex, nofollow`. It does not accept browser path or CMS-origin input, render `safeHtml` or media, fetch from a Client Component, or expose raw JSON and Transport metadata.

The offline A1 checks use canonical snapshots and loopback HTTP only. They do not create a WordPress Fixture or run the separately gated live E2E phase:

```sh
npm test -- tests/cms-integration-adapter.test.ts tests/cms-integration-orchestration.test.ts tests/cms-integration-route.test.ts tests/cms-integration-server-only.test.ts
npm run verify:cms-contract
npm run lint
npm run typecheck
npm test
npm run build
```

## Server-only CMS Runtime Validator

`src/lib/cms/server/validation/` is the runtime contract gate between unknown network JSON and a future DTO Adapter. It statically imports the TASK-008 16-Schema snapshot closure and compiles the Page Schema 3 success root plus the common error root once with Draft 2020-12 strict validation. `ajv@8.20.0` and `ajv-formats@3.0.1` are exact production dependencies; date, date-time and URI formats are enabled.

Server code must explicitly choose `validateCmsSuccessPayload(input)` or `validateCmsErrorPayload(input)`. A successful call creates a caller-isolated, deeply immutable payload snapshot and returns it in an opaque, frozen `ValidatedCmsPayload` wrapper. The wrapper has no mutable shared prototype: its fixed kind remains enumerable, its private body getter cannot be replaced, and its fixed kind-only JSON serialization cannot be overridden through prototype pollution. The body is omitted from enumeration, object spread and JSON serialization. Unsupported versions, invalid bodies and inputs that cannot form a safe snapshot throw `CmsContractError` with stable `category` and `kind` fields; raw payloads, clone exceptions and Ajv diagnostics are not exposed.

The Validator consumes only the local contract snapshot. It does not read WordPress, the filesystem, environment variables or remote Schema references, and it does not call the Transport. It is not a DTO Adapter, React prop, route, visible page, cache, Preview path or live WordPress E2E.

Run its focused and normal gates with:

```sh
npm test -- tests/cms-runtime-validator.test.ts
npm run verify:cms-contract
npm run lint
npm run typecheck
npm test
npm run build
```
