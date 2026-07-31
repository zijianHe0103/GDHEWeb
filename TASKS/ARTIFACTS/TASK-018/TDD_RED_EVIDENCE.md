# TASK-018 TDD RED Evidence

status: `COMPLETE`
runtime: `Node 24.18.0 / npm 11.16.0`

## Slice 1 — configuration, DTO and preview

Command:

```sh
npm test -- tests/product-detail-config.test.ts
```

Initial result: exit `1`; Vitest could not resolve
`../src/lib/product-detail/config`. No production Product Detail module existed.

Minimum GREEN added the closed non-production mode reader, readonly DTO and
frozen preview candidate. Focused result: `1 file / 7 tests PASS`.

## Slice 2 — authentic Adapter

Command:

```sh
npm test -- tests/product-detail-adapter.test.ts
```

Initial result: exit `1`; Vitest could not resolve
`../src/lib/cms/server/product-detail/adapter`.

Minimum GREEN added only the server-only authentic-wrapper Adapter, exact
identity/category/install/specification guards and sanitized contract error.
The first GREEN attempt exposed two test-fixture issues: the synthetic media
objects lacked fields required by the frozen Schema, and Vitest did not support
the chosen Chai matcher. Those test-only issues were corrected without
weakening the real Validator or Adapter. Final result:
`1 file / 8 tests PASS`.

## Slice 3 — one-resolve loader

Command:

```sh
npm test -- tests/product-detail-loader.test.ts
```

Initial result: exit `1`; Vitest could not resolve
`../src/lib/product-detail/load`.

Minimum GREEN added one server-only state loader. Final loopback result:
`1 file / 7 tests PASS`, including the exact single request:

```text
/wp-json/gdhe/v1/resolve?locale=en&path=%2Fproducts%2Ffgd-x15-pvc%2F&schema=3.0.0
```

The same observation proved zero ProductCard collection requests and zero
retries.

## Slice 4 — presentation and route

Command:

```sh
npm test -- tests/product-detail-route.test.ts
```

Initial result: exit `1`; Vitest could not resolve the new route module
`../src/app/products/fgd-x15-pvc/page`.

Minimum GREEN added only Hero, Overview, Key Specifications, scoped CSS and the
single route. The first render assertion expected an H1 without its required
`id`; it was narrowed to assert the rendered heading content. Final result:
`1 file / 6 tests PASS`.

## Slice 5 — built production fail-closed behavior

Command:

```sh
node tests/product-detail-production-smoke.mjs
```

The first built-runtime run was RED: the test expected an immediate `404`, but
Next.js returned its canonical trailing-slash `308` before route evaluation.
The observer was corrected to follow that same-origin framework redirect and
require the final response to be `404`.

A second run correctly showed that the noindex route's static public title may
remain in framework 404 markup; the leakage check was narrowed to the actual
frozen boundary: CMS origin/configuration and WordPress media must not appear.
No product implementation change was needed. Final result:

```text
Product detail production smoke passed: preview/cms final 404; CMS requests 0.
```

The RED history is retained because it distinguishes framework URL
normalization from actual route exposure and prevents a false production PASS.

## Planner checkpoint R1 — P1-1 and P1-3

Command:

```sh
npm test -- tests/product-detail-route.test.ts
```

The new test sent one Schema-valid product payload with hostile HTTPS
WordPress `featuredMedia` and gallery URLs, internal Product Code and Article
Number, and a raw diagnostic marker through the real CMS-mode page route.

RED: exit `1`; 6 prior tests passed and the sole new failure was the missing
CMS ready notice:

```text
expected markup to contain:
Local CMS test candidate — not a production product page
```

The same failing-render output already showed the protected local image and no
hostile media or internal-field content. The minimum production change made
the existing notice unconditional and selected preview/CMS wording from the
existing `preview` boolean. No DTO, Adapter, loader or request behavior changed.

GREEN: `1 file / 7 tests PASS`. The final test proves one exact `/resolve`,
zero `product-cards`, the protected local image, visible CMS non-production
notice, and no hostile origin/URL, `wp-content`, external preload/image,
Article Number, Product Code, raw marker or diagnostic in rendered markup.

## Planner checkpoint R1 — P1-2

Command:

```sh
npm test -- tests/product-detail-server-only.test.ts
```

This finding was a missing proof rather than missing production behavior, so
the test was added before any server-boundary change and no artificial product
failure was introduced. Both marker-stripped copied-project positive controls
built successfully; the real Product Detail loader and deep Adapter imports
both failed their Client Component builds with the expected `server-only`
diagnostic.

Result: `1 file / 2 tests PASS`. Each temporary repository root was removed in
`finally`, and the test's postcondition found zero matching temporary roots.

## Visual Round 1 CSS revision — O1 and O2

Command:

```sh
npm test -- tests/product-detail-route.test.ts \
  -t "keeps Product Detail cards width-safe and model tokens intact"
```

RED: exit `1`; the new focused test was the sole executed failure and seven
existing route tests were skipped by the name filter. The first assertion
proved that the Product Detail Hero, Overview and Specifications lacked a
local `box-sizing: border-box; width: 100%` contract. The captured stylesheet
also retained the global `section` maximum on Hero and
`overflow-wrap: anywhere` on its H1.

Minimum GREEN changed only Product Detail local CSS:

- Hero, Overview and Specifications now include inherited section padding and
  borders inside their available inline width;
- Hero overrides the global `42rem` section cap with `max-width: 100%`;
- the H1 uses normal word-boundary wrapping so `X15+PVC` is not split inside
  the model token.

GREEN: exit `0`; `1 file / 1 test PASS`, with the seven unrelated tests skipped
by the same focused filter.
