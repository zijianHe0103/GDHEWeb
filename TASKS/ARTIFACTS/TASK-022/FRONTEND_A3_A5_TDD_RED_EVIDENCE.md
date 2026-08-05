# TASK-022 Frontend A3-A5 TDD RED Evidence

Date: 2026-08-05
Runtime: Node `24.18.0`, npm `11.16.0`

## A3 RED 1 — missing public product and browser Basket seams

The focused test was added before either production module existed:

```sh
npm test -- tests/quote-basket-product-integration.test.ts
```

Exit `1`. Vitest collected zero tests because
`../src/lib/quote-basket/browser` did not exist. The same test required the
server-owned public product projection and builder-gated Basket write seam.

Minimum GREEN added the public projection, dependency-free adapter and one
builder-first submission seam. After correcting a test-double return value,
the focused result was 1 file / 3 tests PASS. The correction changed only the
test harness; it did not conceal a production failure.

## A3 RED 2 — production still exposed one temporary result

The focused presentation test was changed before the live component:

```sh
npm test -- tests/product-configurator-presentation.test.ts
```

Exit `1`; 2 prior tests passed and 2 new expectations failed. The rendered
markup still said refreshing cleared the item, and the source did not contain
`useQuoteBasket`. Minimum GREEN connected the valid public draft to the Basket,
rendered the 30-day notice, line count and `View Quote Basket`, and removed the
latest-draft summary from the production rendering path.

## A4 RED — missing local Basket route and rows

The route/presentation test was added before route or component files:

```sh
npm test -- tests/quote-basket-route.test.ts
```

Exit `1`; zero tests collected because
`../src/app/request-a-quote/page` did not exist. The test already required the
local gate, noindex metadata, hydration loading state, protected row,
quantity/Remove controls and disabled final action.

Minimum GREEN added only the local route, client view, row component and local
CSS. Two initial GREEN assertions were then corrected to match truthful output:
the page removed the prohibited customer word `checkout`, while the test
recognized Next Image's encoded local URL. Final result: 1 file / 4 tests PASS.

## A4 RED — storage-event ordering bypass

A focused source-boundary regression was added after the route GREEN. Result:
exit `1`; 3 prior tests passed and the new test failed because the hook parsed
and adopted incoming storage bytes directly instead of composing the frozen
`reconcileQuoteBasketStorageEvent` ordering seam.

Minimum GREEN routes valid incoming documents through the A1/A2 newer-snapshot
comparison and ignores missing/invalid external bytes. Final product/Basket
integration result: 2 files / 8 tests PASS.

## Final GREEN

- complete Product Detail/configurator/Basket focus: 13 files / 73 tests PASS;
- real Next preview response: 1 file / 2 tests PASS, including local Basket
  HTTP 200 and zero protected markers;
- complete frontend: 44 files / 459 tests PASS.
