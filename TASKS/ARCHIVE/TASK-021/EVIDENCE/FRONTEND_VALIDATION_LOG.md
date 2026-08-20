# TASK-021 Frontend Validation Log

Date: 2026-08-04

## Runtime

- Node.js: `v24.18.0`;
- npm: `11.16.0`;
- dependency changes: none.

## Tests and contracts

- focused v2: 4 files / 11 tests PASS;
- non-server-only current suite: 35 files / 407 tests PASS;
- `product-detail-server-only`: 2/2 PASS;
- `product-configuration-server-only`: 4/4 PASS, including v2 public and deep Adapter negatives;
- `product-card-server-only`: 4/4 PASS;
- `cms-integration-server-only`: 2/2 PASS;
- effective current-byte total: 39 files / 419 tests PASS;
- Product Configuration v2 verifier: 4 Schema / 1 success / 6 errors PASS;
- QuoteLine v2 verifier: 6 files PASS;
- Product Configuration v1 verifier: 4 Schema / 1 success / 6 errors PASS;
- CMS verifier: 16 Schema / 2 success / 2 errors PASS;
- ProductCard verifier: 8 Schema / 3 success / 6 errors PASS.

## Static and production

- ESLint PASS;
- TypeScript `tsc --noEmit` PASS;
- Next.js 16.2.11 production build PASS; routes unchanged except existing `/icon.svg` metadata route;
- Product Detail production smoke PASS: preview/cms final 404, CMS requests 0;
- ProductList production smoke PASS: preview/cms 404, root 200, integration 404, CMS requests 0;
- CMS integration production smoke PASS: disabled 404, enabled 200, root 200, one fixed CMS request.

## Notes

An invalid exploratory `--reporter=basic` command produced a Vitest startup error and is not counted as product evidence. A parallel lint briefly observed generated `.tmp-*` output while build-negative tests were running; the tests cleaned it and the subsequent serial lint passed. The all-at-once Vitest process was resource-terminated; complete coverage passed as one 407-test non-server group plus four individually executed server-only build-negative files.

## Visual Round 1 narrow revision — 2026-08-05

### TDD

- real preview RED: `tests/product-configurator-preview-response.test.ts`
  returned exit `1`; HTTP was `200`, but inline Next/Flight bytes contained
  `GDHEPRD000172`, the frozen product UUID and `articleNumber`;
- focused GREEN: `5 files / 10 tests PASS`; the same HTTP `200` preview keeps
  the customer fields and excludes all four forbidden browser markers.

### Fresh current-byte gates

- full Vitest: `40 files / 420 tests PASS`, exit `0`;
- CMS contract verifier: `16 schemas / 2 success / 2 error PASS`;
- ProductCard verifier: `8 schemas / 3 success / 6 error PASS`;
- Product Configuration v1 verifier: `4 schemas / 1 success / 6 error PASS`;
- Product Configuration v2 verifier PASS;
- QuoteLine v2 verifier PASS;
- ESLint PASS;
- TypeScript `tsc --noEmit` PASS;
- final Next.js 16.2.11 production build PASS; routes are `/`,
  `/_not-found`, `/icon.svg`, `/integration/cms`, `/products` and
  `/products/fgd-x15-pvc`;
- CMS integration production smoke PASS: disabled `404`, enabled `200`, root
  `200`, one fixed CMS request;
- ProductList production smoke PASS: preview/cms final `404`, root `200`,
  integration `404`, CMS requests `0`;
- Product Detail production smoke PASS: preview/cms final `404`, CMS requests
  `0`.

### Integrity and cleanup

- Node.js `v24.18.0`; npm `11.16.0`; no dependency change;
- package hash `958e8c8937ef092c75295e8a09de6062059df431e3419a70b5b661706ac02bce`;
- lockfile hash `dda25a9069e1c1b41c4f94393a54d3e9eb3dcfea158fc2b6bbdf06cc1cb852a7`;
- protected image hash `9a8ed9fe7145ae582450425be493987ad874d052c176e340d28d7d24bf0d4880`;
- all Product Configuration v1 and QuoteLine v1 hashes match `BASELINE.md`;
- final production build restored tracked `next-env.d.ts` to zero diff;
- task-owned Next/Vitest processes and temporary build roots: zero;
- exact README command exists and `allowedDevOrigins` is absent.

Visual Round 1 remains `FAIL / severe=1 / obvious=1 / detail=1`; Planner owns
the fresh same-origin runtime and Visual QA Round 2.
