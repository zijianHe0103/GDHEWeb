# TASK-028 Frontend A5 TDD and Boundary Evidence

validated_at: `2026-08-12T09:56:33Z`
result: `PASS`

## Controlled scope

- ACKed `MSG-TASK-028-FRONTEND-HTTP-DOCS-CONSOLIDATION-A5` before mutation.
- Read the complete active task, A0 authority, A1-A4 Planner checkpoints, A5 dispatch, current frontend implementation/tests and current documentation.
- Used a production RED only for the one uncovered A5 behavior. Already-covered A0-A4 behavior was re-run without manufacturing new failures.
- Visual QA, complete review, Git delivery, deployment and external integration were not started.

## Valid RED: local page without RFQ runtime

The existing page checked only Product Detail mode. With
`GDHE_PRODUCT_DETAIL_MODE=preview` and RFQ intake unset or `off`, it returned a
rendered page containing `submissionEnabled={false}` instead of the frozen
final 404.

Command:

```sh
PATH=/Users/arron/.nvm/versions/node/v24.18.0/bin:/usr/bin:/bin:/usr/sbin:/sbin \
npm test -- tests/quote-basket-route.test.ts
```

Observed RED:

- exit `1`;
- `1 file`, `6 tests`, `5 passed / 1 failed`;
- failure: `fails the page closed when local product preview is on but RFQ intake is unset or disabled`;
- exact cause: `QuoteBasketPage()` resolved to the page with
  `submissionEnabled={false}` instead of rejecting through Next.js 404.

## Minimum GREEN

`/request-a-quote/` now requires both an allowed local Product Detail mode and
the complete enabled local RFQ config. It passes literal enabled state to the
existing Client boundary. No customer, Transport, receipt, clearing or retry
semantics changed.

Focused GREEN:

- exit `0`;
- `1 file / 6 tests PASS`.

## Regression reconciliation

The first complete run after the new fail-closed page gate produced one stale
TASK-023 assertion:

- `86/87 files`, `701/702 tests` passed;
- `product-configurator-preview-response.test.ts` still started Product Detail
  preview without RFQ config and expected `/request-a-quote/` `200`, receiving
  the newly required `404`.

Only that test process received the complete local Stub environment. It kept
its original HTML/Flight identity-leakage assertions. The current preview
response check then passed `2 files / 18 tests`, and the complete current-byte
suite passed `87 files / 702 tests`.

## Covered boundaries re-proved

- The real HTTP smoke now proves the configured visible page, noindex and
  non-production disclosure; accepted/replay, processing/replay, conflict,
  customer-field and Basket refresh failures; one intent plus one intake for a
  new attempt; byte-identical replay; zero legacy CMS endpoint calls; and
  unset/disabled/production page+Route 404.
- The existing copied-project server-only matrix re-proved the public server
  entry, deep authoritative intake, deep intent issuer/verifier and both Route
  Handlers. Together with route/public-response checks it passed `3 files / 21
  tests`.
- A direct deep-module export-surface assertion proves that private validated
  receipt material has no runtime accessor or exported WeakMap. The visible
  DTO remains the only customer-safe response surface.
- Source and live HTTP output checks found no new storage, cookie, URL,
  analytics, console, polling or automatic retry seam.

## TDD conclusion

The only uncovered production boundary received an observed RED and minimum
GREEN. All other A5 work is validation, smoke extension, documentation and
evidence consolidation; no speculative product seam was added.
