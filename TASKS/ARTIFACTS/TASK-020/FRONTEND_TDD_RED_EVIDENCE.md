# TASK-020 Frontend TDD RED Evidence

status: `COMPLETE`
date: `2026-08-01`
runtime: `Node 24.18.0 / npm 11.16.0`

Every production seam was preceded by a focused missing-behavior failure.

## A1 fixed Transport

- Initial command: `npm test -- tests/product-configuration-transport.test.ts`
- RED: exit `1`; `0 tests`; module
  `cms/server/product-configurations/transport` was missing.
- Expanded protocol matrix RED: `14 tests`, `13 failed`, `1 passed`; current
  behavior lacked 304, content/cache/ETag/status gates, typed HTTP errors,
  redirect, 5000 ms timeout, caller abort and network classification.
- GREEN: `1 file / 14 tests PASS`.

## A2 runtime Validator

- Command: `npm test -- tests/product-configuration-runtime-validator.test.ts`
- RED: exit `1`; `0 tests`; Product Configuration validation module missing.
- The first compile attempt also exposed the frozen Schema's strict AJV
  `properties`/type composition; the registry adds the minimum in-memory type
  annotation without changing snapshot bytes.
- GREEN: `1 file / 12 tests PASS` covering versions, unknown/non-JSON data,
  exact FGD identity, duplicate/order drift, policy drift, isolated deep freeze
  and authentic wrapper rejection.

## A3 DTO Adapter and server-only boundary

- Command: `npm test -- tests/product-configuration-adapter.test.ts`
- RED: exit `1`; `0 tests`; Adapter module missing.
- GREEN: Adapter `1 file / 2 tests PASS`; real Next public/deep client-import
  positive and guarded controls `1 file / 2 tests PASS`.

## A4 loader and page state

- Command: `npm test -- tests/product-detail-loader.test.ts`
- RED: exit `1`; `7 tests`, `2 failed`; preview and CMS ready states lacked
  `configurationState`, and CMS made no fixed configuration request.
- GREEN: `1 file / 8 tests PASS`; detail failure stops first, ready detail makes
  one configuration request, and configuration failure preserves detail with a
  sanitized unavailable state.

## A5 QuoteLine builder

- Command:
  `npm test -- tests/product-configuration-quote-builder.test.ts`
- RED: exit `1`; `0 tests`; pure builder module missing.
- GREEN: `1 file / 11 tests PASS`; resolved/custom successes validate against
  the frozen QuoteLine Schema and the closed invalid matrix returns field-only
  errors.

## A6 visible configurator

- Command:
  `npm test -- tests/product-detail-route.test.ts -t 'renders preview through the real route'`
- RED: exit `1`; the real route lacked the `#configure-product` Hero action,
  section, form, real option and non-persistence notice.
- GREEN: focused route `1 passed`; final presentation gate
  `1 file / 4 tests PASS`; combined TASK-020 gate `9 files / 84 tests PASS`.

No RED was produced by changing protected authority, dependencies or CMS.

## Planner checkpoint Round 1 P1 revision

Historical checkpoint verdict remains `FAIL / P0=0 / P1=2 / P2=0` until
Planner independently reproduces this revision.

### P1-1 complete latest summary

- Command: `npm test -- tests/product-configurator-summary.test.ts`.
- RED: exit `1`; `2/2 failed` because the planned production
  `LatestQuoteLineSummary` was undefined.
- GREEN: `1 file / 2 tests PASS`; standard and custom lines render model,
  customer length type, length, color, installation, base packaging, Logo,
  protection, quantity and unit without Article Number/raw/internal values.

### P1-2 field errors and replacement state

- Command: `npm test -- tests/product-configurator-interaction.test.ts`.
- RED: exit `1`; `2/2 failed` because the production result-state seam did not
  exist.
- GREEN: `1 file / 2 tests PASS`; invalid input creates no line and maps every
  builder-returned visible field to a sanitized inline error ID. Sequential
  standard then custom submissions keep one scalar latest line and replace it
  without fetch, storage, raw/internal markup or append behavior.

The combined presentation/summary/interaction gate is `3 files / 8 tests PASS`.

## Planner checkpoint Round 2 label P1 revision

The Round 1 history remains preserved. This revision addresses only the
customer-visible label drift identified by the Planner checkpoint.

- Command: `npm test -- tests/product-configurator-presentation.test.ts`.
- RED: exit `1`; `1/4 failed`. The direct initial-form markup expected
  `Ceiling Mount` first and received the existing `Ceiling` label; the failure
  output also showed raw `standard`, `carton`, `large shrink wrap`,
  `Logo printing`, `single bag` and `paired` text.
- GREEN: `1 file / 4 tests PASS`. The form controls now consume the same closed
  installation, base-packaging, Logo and protection labels as the latest-line
  summary while retaining their original option values.

## Visual D1 favicon fallback revision

- Command: `npm test -- tests/app-icon.test.ts`.
- RED: exit `1`; `1/1 failed` with `ENOENT` because
  `frontend/src/app/icon.svg` did not exist.
- GREEN: `1 file / 1 test PASS` after adding only the local SVG. The regression
  constrains the file to 1,200 bytes or less, requires the non-production
  replacement notice and rejects script, animation, raster, link, data URL,
  Product/internal and external dependencies.
- Production proof: `npm run build` PASS and the route inventory includes the
  static App Router metadata route `/icon.svg` without layout or metadata code.

## Adversarial Round 1 custom-length P1 revision

The canonical Round 1 verdict remains `FAIL / P0=0 / P1=1 / P2=0` until an
independent checkpoint and controlled re-review reproduce this closure.

- Command:
  `npm test -- tests/product-configuration-quote-builder.test.ts`.
- RED: exit `1`; `13 tests`, prior `11` PASS and the two new direct production
  builder cases FAIL. `9999999999999999.9` returned `ok:true` with rounded
  length `10000000000000000`; the 400-digit `.9` returned `ok:true` with
  `Infinity`.
- GREEN: `1 file / 13 tests PASS`. Accepted canonical text is first converted
  to scaled tenths, which must be a positive safe integer and must divide by
  ten and multiply back without loss. Both attacks now return only the closed
  `customLength/invalid` error.
- The existing ordinary `5.8` path remains `ok:true`, retains
  `articleNumber:null` and `sales_follow_up`, and validates against the
  unchanged frozen QuoteLine Schema.
