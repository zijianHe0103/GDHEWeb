# TASK-021 Frontend Adversarial P1 Round 1 Report

Date: 2026-08-05

## Result

`PASS` for the two narrow frontend P1 corrections dispatched by
`MSG-TASK-021-FRONTEND-ADVERSARIAL-P1-R1`.

This is a frontend lane checkpoint only. Adversarial Round 1 remains preserved
as `FAIL / P0=0 / P1=2 / P2=1` until Planner independently validates these
bytes and controls any later review round. It is not user acceptance, Git
delivery or deployment.

## Final CMS authority binding

Frontend now binds only to the final Planner-validated Product Configuration
v2 handoff:

- manifest SHA-256:
  `11f3db81c1b962c387f731d9c171d2f370ba60bdc3391cc10ec991247120ac09`;
- checksum-stream SHA-256:
  `fe611983112944edcf214d88a9aefac6cc4fa4b9258f07670870414a919204ca`.

The literal handoff verification is `20/20 PASS`. The four Schema files, one
success Golden and selected error snapshot retain their existing exact hashes;
no Schema, Golden or error byte changed. The frontend snapshot verifier still
fails closed on missing, extra, tampered, traversal, unknown-ref and authority
substitution cases.

## P1-1 — exact one-tenth runtime validation

### RED

Command:

```sh
npm test -- tests/product-configuration-v2-consumer.test.ts
```

Exit `1`: `4 tests`, prior `3 PASS`, new full-root test `1 FAIL`. The production
validator threw `ProductConfigurationV2ContractError` for the first legitimate
one-decimal candidate instead of accepting every full-root `4.3`, `5.8` and
`6.7` document.

The existing snapshot verifier independently showed the stale authority pin:
`5 tests`, `3 PASS / 2 FAIL`, with the direct failure
`v2 handoff manifest SHA-256 mismatch`.

### Minimum GREEN

The Product Configuration v2 Ajv registry now uses the repository's existing
closed-contract convention `multipleOfPrecision: 12`. Frozen Schema bytes are
unchanged. The production full-root validator now proves:

- `4.3`: PASS;
- `5.8`: PASS;
- `6.7`: PASS;
- `6.05`: rejected as `invalid_success_payload`.

The frontend manifest and Node-built-in verifier pins were updated to the two
final handoff hashes above; no hash was guessed and no snapshot content was
rewritten.

## P1-2 — truthful PublicQuoteDraft production semantics

### RED

Command:

```sh
npm test -- tests/product-configurator-summary.test.ts
```

Exit `1`: `3 tests`, prior `2 PASS`, new naming test `1 FAIL`. The required
`LatestPublicQuoteDraftSummary` export was absent, while production still used
`latestLine` and `LatestQuoteLineSummary`.

### Minimum GREEN

- production result state now contains `latestDraft: PublicQuoteDraft | null`;
- the summary export is `LatestPublicQuoteDraftSummary` and accepts `draft`;
- Add to Quote replaces exactly one browser-memory public draft;
- invalid submissions retain the previous public draft and expose only the
  existing sanitized field errors;
- visible customer copy, control order, CSS/layout, current `6 m / Ivory
  White`, Custom Length, Packaging, Quantity and refresh-clears behavior remain
  unchanged;
- network, storage, persistence and submission seams remain absent.

Production source contains no `latestLine` or `LatestQuoteLineSummary` symbol.
The old names remain only as negative test assertions. QuoteLine 2.0.0 remains
an isolated future server-side conversion Schema/samples/verifier/builder;
there is no production caller and no conversion route was added.

## Browser-byte and security proof

The real same-origin Next preview response remains HTTP `200` and keeps the
visible configurator. HTML/Flight bytes contain none of the following:

- Article Number or stable internal product UUID;
- `articleNumber`, `productKind` or `configurationPolicy`;
- raw `large_shrink_wrap`, `single_bag` or `sales_follow_up` values;
- `wp-content`, `WORDPRESS_API_URL`, Feishu, secret or diagnostic markers.

No `allowedDevOrigins`, browser fetch, Web Storage, IndexedDB, XHR or beacon
seam was introduced.

## Validation

- direct GREEN: `4 files / 14 tests PASS`;
- complete TASK-021 focused group: `9 files / 32 tests PASS`;
- final real preview response: `1 file / 1 test PASS`;
- full Vitest: `40 files / 422 tests PASS`, exit `0`;
- CMS verifier: `16 schemas / 2 success / 2 errors PASS`;
- ProductCard verifier: `8 schemas / 3 success / 6 errors PASS`;
- Product Configuration v1 verifier: `4 schemas / 1 success / 6 errors PASS`;
- Product Configuration v2 verifier PASS;
- QuoteLine v2 verifier PASS;
- ESLint PASS;
- TypeScript `tsc --noEmit` PASS;
- final Next.js 16.2.11 production build PASS;
- CMS integration, ProductList and Product Detail production smokes PASS.

## Protected boundaries

- final CMS handoff checksum stream: literal `20/20 PASS`;
- Product Configuration v1 and QuoteLine v1 baseline hashes remain exact;
- package, lockfile and protected image hashes remain exact;
- all 23 Visual Round 1/Round 2 evidence files match their inventory;
- Product Configurator CSS and tracked `next-env.d.ts` have zero diff;
- no task-owned Next/Vitest process, `.next` or temporary build root remains;
- CMS/WordPress/database, ProductCard/ProductList, Product Detail facts,
  QuoteLine v1/v2 authority, dependencies, Basket, Feishu, related products,
  Planner authority, Git and deployment were not modified by this revision.

## Changed-file inventory

Production and authority-pin files:

- `frontend/src/lib/cms/server/product-configurations-v2/validation-registry.ts`;
- `frontend/src/lib/cms/product-configuration-v2-contract/manifest.json`;
- `frontend/scripts/verify-product-configuration-v2-contract.mjs`;
- `frontend/src/components/product-configurator/index.tsx`.

Direct tests:

- `frontend/tests/product-configuration-v2-consumer.test.ts`;
- `frontend/tests/product-configurator-interaction.test.ts`;
- `frontend/tests/product-configurator-summary.test.ts`;
- `frontend/tests/product-configurator-preview-response.test.ts`.

Evidence and lane record:

- `TASKS/ARTIFACTS/TASK-021/FRONTEND_ADVERSARIAL_P1_R1_REPORT.md`;
- `LANES/frontend/worklog.md`.

Frontend README and the frontend contract document already stated the selected
PublicQuoteDraft authority and future QuoteLine conversion truthfully, so no
documentation edit was required.

## Handoff

Planner independently reproduces the exact-decimal, final pin, public-draft,
browser-byte and protected-scope gates. Frontend does not start adversarial
Round 2, acceptance, Git delivery or deployment.
