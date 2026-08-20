# TASK-020 Design

status: `DESIGN_CHECKPOINT`
date: `2026-08-01`

## 1. Minimum vertical flow

```text
WordPress ProductConfigurationDocument 1.0.0
  -> fixed server-only Transport
  -> exact four-Schema runtime Validator
  -> authentic validated wrapper
  -> deep readonly ProductConfigurationDto Adapter
  -> FGD X15+PVC page state
  -> Client ProductConfigurator
  -> pure QuoteLine builder
  -> latest in-memory QuoteLine summary
```

The existing product-detail `/resolve` chain remains independent. The page
combines the two already-normalized DTOs; neither consumer reads the other's raw
response.

## 2. Planned file seams

```text
frontend/src/lib/cms/server/product-configurations/
  errors.ts
  transport.ts
  validation-registry.ts
  validation.ts
  adapter.ts
  load.ts
  index.ts

frontend/src/types/product-configuration.ts
frontend/src/lib/product-configuration/
  preview.ts
  build-quote-line.ts

frontend/src/components/product-configurator/
  index.tsx
  product-configurator.module.css
```

The existing FGD page, Product Detail component and local page CSS receive only
the minimum wiring and Hero action change. No generic site-wide configurator
framework is introduced.

## 3. Fixed Transport

The public function accepts no query object:

```ts
requestProductConfiguration(callerSignal?: AbortSignal)
```

The request URL is built only from validated server configuration plus constants:

```text
/gdhe/v1/product-configurations
  ?locale=en
  &schema=1.0.0
  &path=/products/fgd-x15-pvc/
```

Protocol behavior:

- method `GET`;
- `Accept: application/json`;
- redirect mode `error`;
- cache mode `no-store` for the current page consumer;
- one fixed 5000 ms timeout and optional caller abort;
- no retry;
- HTTP 200 requires JSON content type, non-empty JSON body, ETag and exact
  `Cache-Control: public, max-age=60`;
- 304 is represented by Transport but rejected by the no-cache loader as
  `not_modified_without_cache`;
- non-2xx errors require `Cache-Control: no-store`, JSON, and later validation
  against the frozen common error Schema;
- redirects, wrong content type, empty/invalid JSON, wrong cache headers,
  request timeout, caller abort and network failure map to closed error kinds.

The absence of caller-controlled query input is the simplest closed-query
boundary and removes coercion, Proxy and unknown-key ambiguity.

## 4. Runtime validation

`validation-registry.ts` statically imports the exact seven-file frontend
Product Configuration snapshot inventory and compiles only its four local
Schemas with existing AJV dependencies.

The success Validator performs:

1. structured clone and deep freeze of JSON-compatible input;
2. version precheck: API `1`, Schema `1.0.0`, locale `en`, type
   `product_configuration`;
3. exact Product Configuration root Schema validation;
4. page-specific semantic binding:
   - product model `FGD X15+PVC`;
   - path `/products/fgd-x15-pvc/`;
   - kind `curtain_track` and unit `piece`;
   - at least one option;
   - every Article Number unique;
   - every length positive and tenth-metre normalized;
   - colors normalized and option ordering deterministic;
   - installation and packaging policies equal the closed response policy;
5. creation of an authentic WeakSet-backed wrapper whose `toJSON()` exposes no
   body.

The Adapter accepts only that authentic wrapper. Forged plain objects, copied
wrappers or direct raw payloads fail.

Common HTTP errors are validated through the existing frozen CMS error
Validator, status must equal the Transport status, then the private error body
is discarded before propagation.

## 5. Public DTO

The DTO contains only fields the configurator consumes:

```ts
ProductConfigurationDto {
  product: { id, model, name, publicPath, productKind, quantityUnit }
  options: [{ articleNumber, lengthMeters, color: { code, label } }]
  installationMethods: [{ method, changesTrackArticleNumber }]
  packaging: {
    baseOptions
    logoPrintingAvailable
    protectionOptions
  }
  customLength: {
    enabled
    minimumExclusive
    maximum
    decimalPlaces
    resolution
  }
}
```

It excludes response metadata, modified time not used by UI, optional accessory
objects until real identifiers exist, raw policy containers and all internal
fields. Every nested object and array is copied then frozen on the server.

## 6. Page orchestration

The existing detail loader remains authoritative for product existence.

```text
disabled -> disabled
preview  -> local detail + local configuration
cms      -> load detail
              not_found/unavailable -> existing state, stop
              ready -> load configuration once
                         ready -> ready with configuration
                         not_found/unavailable -> ready with configuration fallback
```

The ready page therefore carries:

```ts
{ kind: "ready", detail, configurationState, preview }
```

`configurationState` is a closed union of `ready` and `unavailable`; it never
contains an Error, raw body, status, endpoint or diagnostic. The page renders a
configuration fallback without reclassifying the product itself as missing.

## 7. QuoteLine builder

The pure builder is client-safe and has no CMS import. It receives the public
DTO and primitive form values.

Standard branch:

1. exact-match selected Article Number in `options`;
2. copy length and color from that option, ignoring duplicated client claims;
3. emit `selection.type = article_number`.

Custom branch:

1. parse a canonical decimal string;
2. require `> 0` and at most one fractional digit;
3. exact-match selected color code against distinct DTO option colors;
4. emit `articleNumber: null` and `resolution: sales_follow_up`.

Common branch:

1. exact-match installation against DTO policy;
2. exact-match one base packaging value;
3. require logo boolean and nullable one-of protection;
4. parse quantity from digit-only text and require a positive safe integer;
5. build `QuoteLine 1.0.0` with product identity copied from DTO;
6. deep-copy/freeze the result.

The builder returns a closed success/error result. It does not throw raw values,
generate a line key, merge, persist or submit.

Tests validate each success output against the frozen QuoteLine Schema. The
production client does not bundle AJV merely to repeat server-side authority;
the future submission endpoint must perform independent runtime validation.

## 8. Client state and UI

The single Client Component owns only:

- selection branch;
- selected option/color;
- installation;
- packaging choices;
- quantity/custom-length text;
- field errors;
- latest valid QuoteLine.

Initial state:

- standard branch;
- sole current standard option selected;
- no installation;
- no base packaging;
- logo false;
- protection null;
- quantity empty;
- no result.

Submit validates all fields, focuses or associates the first invalid field,
then replaces `latestLine` on success. The result is summarized from the
QuoteLine and never written to storage. A visible non-production notice states
that the complete quote basket comes later.

Semantic HTML uses `form`, `fieldset`, `legend`, associated labels, inline
`aria-describedby` errors, `aria-invalid`, a real submit button and polite
`aria-live` result. Native controls are preferred over custom widgets.

## 9. Layout

The new section is one additional detail-page module:

- desktop: explanatory column plus form card, within the existing content width;
- tablet/mobile: one column with full-width controls and action;
- result summary follows the form in document order;
- no fixed-position drawer, sticky basket or global header modification;
- existing spacing, radius, color and typography tokens are reused;
- 320 CSS px reflows without horizontal scrolling.

## 10. Failure and fallback behavior

- Product Detail failure preserves TASK-018 semantics.
- Product Configuration failure never shows partial or locally guessed options.
- A configuration fallback explains that online configuration is temporarily
  unavailable and preserves the existing navigation-only RFQ action.
- No error exposes endpoint, status, request ID, payload, Article Number list or
  internal diagnostic.
- No `Add to Quote` control appears in fallback state.

## 11. Production and SEO boundary

The page keeps `dynamic = force-dynamic`, local mode gating and
`noindex,nofollow`. Production build may include the route definition but every
preview/CMS request must resolve to final 404 with zero CMS requests. No
canonical, Product JSON-LD, Sitemap entry or public deployment is added.

## 12. Deliberately deferred work

TASK-021 will own multi-line Basket state, identity merge, edit/delete and
30-day browser retention. Later tasks own contact data, server revalidation,
abuse controls and Feishu writeback. TASK-020 creates no hidden compatibility
layer for those features beyond consuming the frozen QuoteLine type.
