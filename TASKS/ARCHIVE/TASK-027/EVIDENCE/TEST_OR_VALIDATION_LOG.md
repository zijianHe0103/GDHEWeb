# TASK-027 Consolidated Test and Validation Log

result: PASS_RESOURCE_SAFE_COMPLETE
runtime: Node 24.18.0

## Focused and complete tests

| Gate | Current result |
|---|---|
| RFQ A1-A5 focused | PASS — `11 files / 70 tests` |
| TASK-025 mixed + Quote Basket v3 | PASS — `15 files / 35 tests` |
| Resource-safe group 1 | PASS — `20 files / 224 tests` |
| Resource-safe group 2 | PASS — `20 files / 185 tests` |
| Resource-safe group 3 | PASS — `20 files / 114 tests` |
| Resource-safe group 4 | PASS — `17 files / 126 tests` |
| Complete union | PASS — `77 distinct files / 649 tests` |
| Server-only public/deep/Route controls | PASS — included in focused/group union |

One initial all-at-once run finished `76 files / 648 tests` with one listener
timing failure in `article-number-batch-transport`: expected three calls but
observed two. The same file immediately passed `1/4`, then passed again inside
resource-safe group 1 `20/224`. No source or test byte changed to obtain these
results. The authoritative complete result is the four disjoint resource-safe
groups required by the A6 dispatch, not a claim that the first monolithic run
passed.

## Static, contract and HTTP gates

- all ten contract verifiers PASS: CMS `16/2/2`, ProductCard `8/3/6`, Product
  Configuration v1 `4/1/6`, Product Configuration v2, QuoteLine v2, Quote Basket
  v2 `1/1/3`, Quote Basket v3 `1/1/6`, RelatedProductCard `9/4/9`, Article Number
  batch `11/5/5`, RFQ Submission v2 `20 JSON / 5 Schema / 63 refs / 94/94`;
- lint and `tsc --noEmit` PASS;
- production build PASS with dynamic `/api/rfq/intake`;
- all five production smokes PASS: CMS integration, Product list, Product
  detail, Quote Basket and extended RFQ intake;
- RFQ HTTP smoke proves raw Origin/media/declared/stream/fatal-UTF-8 gates,
  accepted/indeterminate/rejected replay, safe mixed/transport failure, one
  mixed POST per new intent, zero legacy and disabled/production 404.

## Integrity and cleanup

- A0 protected non-document hashes `43/43` PASS. The three current authorized
  protected documentation differences are `frontend/README.md` from the
  frontend lane plus root `README.md` and
  `docs/architecture/headless-wordpress-nextjs-contract.md` applied later by
  Planner during the A6 checkpoint;
- package, lock, pre-existing `tsconfig.json` and production `next-env.d.ts`
  hashes are exact;
- local RFQ inventory is exactly 21 JSON files including its manifest; all nine
  runtime modules start with `import "server-only";`;
- runtime import, embedded secret, forbidden diagnostic/CORS and external-system
  scans return no match;
- `.next`, `tsconfig.tsbuildinfo`, temporary build roots and Next listeners are
  absent after recoverable cleanup;
- final Markdown/link/JSON, diff and DPG gate results are recorded after the A6
  artifacts are written.

## Final documentation and governance gates

- Markdown fence and trailing-whitespace scans: PASS;
- local proposed README link target: PASS;
- all RFQ snapshot and TASK-027 artifact JSON parse with `jq`: PASS;
- `git diff --check`: PASS;
- DPG project validation: `valid: true`;
- DPG message validation: `valid: true`;
- DPG strict lane audit: zero issues.
