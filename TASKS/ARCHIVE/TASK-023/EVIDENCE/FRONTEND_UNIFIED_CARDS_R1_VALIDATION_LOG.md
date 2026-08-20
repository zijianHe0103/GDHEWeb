# TASK-023 Frontend Unified Cards R1 Validation Log

Date: 2026-08-08
Runtime: Node `24.18.0`, npm `11.16.0`

## Behavioral gates

| Gate | Current-byte result |
| --- | --- |
| Direct RelatedProducts RED | Expected FAIL: 1 file, 10 tests, 4 failed / 6 prior passed |
| Direct RelatedProducts GREEN | PASS: 1 file / 10 tests |
| TASK-023 focused regression | PASS: 15 files / 141 tests |
| Full Vitest, safe groups | PASS: 51 files / 542 tests (`17/275` + `17/116` + `17/151`) |
| ESLint | PASS |
| TypeScript | PASS |
| Next.js 16.2.11 production build | PASS |

The complete run was intentionally reproduced as three non-overlapping safe
groups after two monolithic invocations returned incomplete process output in
the command bridge. One diagnostic invocation used unsupported
`--reporter=basic` and failed before test collection; it is not counted as a
product failure. The three recorded groups cover the exact sorted inventory of
all 51 `*.test.ts` files once, with 542 passing tests and no failures.

The focused 15-file gate includes RelatedProductCard snapshot/Transport/runtime,
Product Detail loader/route, real browser-facing preview HTML and Flight,
Quote Basket v1/v2 domain/storage/route/product integration, server-only
boundaries, preview candidate routes and the direct presentation/navigation
state tests.

## Contract verifiers

All seven offline gates exited `0`:

- CMS contract: `16 schemas / 2 success / 2 error`;
- ProductCard: `8 / 3 / 6`;
- Product Configuration 1.0: `4 / 1 / 6`;
- Product Configuration 2.0: PASS;
- QuoteLine 2.0: PASS;
- final RelatedProductCard: `9 / 4 / 9`;
- Quote Basket 2.0: `1 / 1 / 3`.

## Production boundaries

The production build compiled, typechecked, collected page data and generated
the unchanged route inventory successfully. Four smoke programs exited `0`:

- CMS integration: disabled 404, enabled 200, root 200, one fixed CMS request;
- Product list: preview/CMS 404, root 200, integration 404, CMS requests 0;
- Product detail: default/preview/CMS detail and candidate paths final 404,
  CMS requests 0;
- Quote Basket: preview/CMS final 404, CMS requests 0, submission endpoints 0.

No preview or persistent server was started. After the final smoke, `.next` and
`tsconfig.tsbuildinfo` were moved recoverably to Trash. No Next/Vitest listener,
`.next`, TypeScript cache or `.vitest` residue remains.

## Public-state and leakage proof

- Direct rendering proves the first three public cards contain protected local
  presentation only, the shared semantic skeleton, distinct truthful actions
  and no quantity input/error UI.
- The real preview-response regression proves browser-facing HTML and Flight
  bytes contain no internal product identity, WordPress media/origin, raw
  payload, Feishu/secret or diagnostic marker.
- The return-state serializer emits exactly
  `{version:1, visibleCount, scrollY}`. Exact-key parsing rejects an added
  `productUuid`; the serialized state contains none of UUID, Article Number,
  WordPress/CMS/Feishu, raw response or diagnostics, and restoration clamps to
  the current item count.
- Direct browser-adapter regression proves the first deliberate accessory add
  writes a valid quantity-1 `catalog_accessory`; a repeat add merges to quantity
  2 using the existing deterministic Basket semantics.

## Protected and historical evidence

Exact baseline hashes remain:

- package: `958e8c8937ef092c75295e8a09de6062059df431e3419a70b5b661706ac02bce`;
- lockfile: `dda25a9069e1c1b41c4f94393a54d3e9eb3dcfea158fc2b6bbdf06cc1cb852a7`;
- production next-env: `7b550dda9686c16f36a17bf9051d5dbf31e98555b30d114ac49fc49a1e712651`;
- protected image: `9a8ed9fe7145ae582450425be493987ad874d052c176e340d28d7d24bf0d4880`.

ProductCard type/manifest/verifier, Quote Basket v1 type, QuoteLine v1/v2,
CMS ProductCard sources/Schemas and TASK-014 authority also match every exact
hash in `PROTECTED_BASELINE.md`. Canonical Visual evidence reproduced `50/50`;
Round 3 reproduced `14/14`. No historical QA or review evidence changed.

## Governance and diff gates

- `git diff --check`: PASS;
- DPG project validation: valid `DPG-LANES-1.0.0`;
- controlled message validation: valid;
- strict lane audit: PASS, zero issues;
- request message: ACKed and present in `LANES/messages/done/`;
- package/lock, contracts, CMS, Planner state, QA evidence and Git delivery:
  untouched by this revision.
