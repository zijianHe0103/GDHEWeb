# TASK-021 Frontend TDD RED/GREEN Evidence

Date: 2026-08-04

## RED 1: Product Configuration v2 snapshot

Command: `npm test -- tests/product-configuration-v2-contract-snapshot.test.ts`

Exit `1`. Vitest could not resolve the missing `verify-product-configuration-v2-contract.mjs`; zero tests ran. GREEN added only the independent v2 snapshot and authority-bound verifier. The focused verifier test then passed.

## RED 2: QuoteLine 2.0.0

Command: `npm test -- tests/quote-line-v2-contract.test.ts`

Exit `1`. Vitest could not resolve the missing `quote-contract/v2/samples/resolved.json`. GREEN added the closed QuoteLine 2.0.0 Schema, resolved/custom samples, deterministic invalid samples, readonly type surface and offline verifier. Installation is forbidden by the closed configuration object.

## RED 3: v2 runtime consumer and choices

Command: `npm test -- tests/product-configuration-v2-consumer.test.ts`

Exit `1`. Vitest could not resolve the missing v2 Adapter. GREEN added the exact four-Schema Validator, authentic private wrapper, deep-frozen DTO Adapter, pure length/color projection and 0/1/N resolver.

## RED 4: visible configurator

Command: `npm test -- tests/product-configurator-v2-presentation.test.ts`

Exit `1`. The v2 preview consumer did not exist. After the minimum v2 wiring, a narrow assertion initially expected Ivory White before explicit length selection and failed; the assertion was corrected to the frozen design: no silent length default, Color asks for Track Length first, while the DTO separately proves Ivory White is the sole public color.

## Current GREEN

- v2 focused: 4 files / 11 tests PASS;
- all non-server-only Vitest: 35 files / 407 tests PASS;
- server-only Client-import build negatives: 4 files / 12 tests PASS when run serially;
- effective current-byte total: 39 files / 419 tests PASS.

The combined full Vitest process was terminated by local resource pressure while multiple temporary Next production builds accumulated. The same current bytes passed every non-server-only test together and each of the four server-only files separately. No test was waived.
