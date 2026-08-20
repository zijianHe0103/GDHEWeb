# TASK-022 Adversarial Review Report

Verdict: PASS

review_round: `Round 2 final (2_of_2)`
reviewed_at: `2026-08-04T22:11:06Z`
reviewer_lane: `adversarial_reviewer`
request: `MSG-TASK-022-ADVERSARIAL-REVIEW-R2`
verdict: `PASS`
P0: `0`
P1: `0`
P2: `0`
planner_final_validation_allowed: `YES_AFTER_LINKED_RESPONSE_ACK`
historical_planner_a1_a2_checkpoint: `FAIL / P0=0 / P1=2 / P2=0`
historical_planner_a1_a2_recovery: `PASS_AFTER_R1`
current_visual_round_1: `PASS / severe=0 / obvious=0 / detail=0`
historical_adversarial_round_1: `FAIL / P0=0 / P1=2 / P2=2`

## Current Outcome

`PASS / P0=0 / P1=0 / P2=0`.

The final narrow Round 2 independently reproduced closure of both stable-error
P1s and both behavioral P2s against current shared bytes. Hostile secondary
Proxy errors, an unrepresentable exact-TTL date, hostile quota lookalikes,
the expiry-boundary Add classification and final-line Remove live announcement
now satisfy the frozen boundaries without regressions.

Planner final validation is allowed only after the linked Round 2 response is
acknowledged and governed review recovery is recorded. This PASS is not user
acceptance or authorization for Git, deployment, TASK-023, final RFQ
submission or Feishu integration.

# Round 1 Audit Trail — Preserved

## Preserved History

- The initial A1/A2 Planner checkpoint remains historical
  `FAIL / P0=0 / P1=2 / P2=0`: non-exact far-future expiry was accepted and an
  items-array Proxy leaked its `map` diagnostic.
- Its narrow recovery remains `PASS_AFTER_R1`: exact
  `updatedAt + 2_592_000_000 ms` and the original items-array attacks pass.
- Visual QA Round 1 remains current
  `PASS / severe=0 / obvious=0 / detail=0`; all fifteen evidence bytes and the
  genuine empty/add/merge/split/reload/cross-tab/quantity/remove history remain
  preserved. This adversarial FAIL does not rewrite that visual result.

## Findings

### P1-1 — Domain error normalization remains vulnerable to secondary reflection and TTL date overflow

The repaired array path normalizes an ordinary thrown `Error`, but the common
domain catch blocks still classify the caught value with
`error instanceof QuoteBasketDomainError`. An attacker-controlled thrown Proxy
can make that classification execute a second `getPrototypeOf` trap and leak
its raw diagnostic. Separately, a valid `Date` close enough to the JavaScript
maximum passes `canonicalNow`, but adding the fixed TTL produces an invalid
date and the subsequent `toISOString()` exposes a raw `RangeError`.

Relevant current bytes are
`frontend/src/lib/quote-basket/domain.ts:22`,
`frontend/src/lib/quote-basket/domain.ts:35`,
`frontend/src/lib/quote-basket/domain.ts:215`,
`frontend/src/lib/quote-basket/domain.ts:395`,
`frontend/src/lib/quote-basket/domain.ts:421` and
`frontend/src/lib/quote-basket/domain.ts:427`.

An independent reviewer-scope Vite SSR probe imported the exact current
production module and executed:

1. an outer Basket Proxy whose `getPrototypeOf` throws a second Proxy, whose
   own `getPrototypeOf` throws
   `Error("TASK022_PRIVATE_SECONDARY_DIAGNOSTIC")`;
2. `createEmptyQuoteBasket(new Date(8640000000000000 - 1000), validIds)`.

Current output was:

```json
{
  "domainReflection": {
    "isStable": false,
    "name": "Error",
    "string": "Error: TASK022_PRIVATE_SECONDARY_DIAGNOSTIC"
  },
  "date": {
    "isStable": false,
    "name": "RangeError",
    "string": "RangeError: Invalid time value"
  }
}
```

This violates the dispatch requirement that hostile values, Proxy/reflection
traps and all domain failures remain stable and sanitized. The earlier array
P1 is closed, but the same public invariant is not closed across the whole
domain surface.

Smallest bounded revision:

1. normalize every public domain reflection/copy failure without applying
   attacker-observable `instanceof` or property access to an untrusted thrown
   value;
2. check that `now + QUOTE_BASKET_TTL_MS` remains a finite representable
   canonical timestamp before calling `toISOString`, returning only
   `QuoteBasketDomainError` otherwise;
3. add direct regressions for the secondary thrown-Proxy attack, the maximum
   valid timestamp edge and the same paths through create/add/set/remove;
4. preserve exact 30-day acceptance, the original A1/A2 Proxy closure and all
   current immutable/atomic behavior.

### P1-2 — Storage error classification can leak a hostile thrown value

`persistQuoteBasket` catches the storage backend's thrown value, then
`isQuotaError` evaluates `error instanceof DOMException`. A thrown Proxy can
trap that prototype lookup and throw a second raw diagnostic outside the
stable storage boundary.

Relevant current bytes are
`frontend/src/lib/quote-basket/storage.ts:73`,
`frontend/src/lib/quote-basket/storage.ts:80` and
`frontend/src/lib/quote-basket/storage.ts:216`.

The independent probe supplied an otherwise legal current Basket and a
storage adapter whose `setItem` throws a Proxy with a `getPrototypeOf` trap.
The trap ran once and the current API returned:

```json
{
  "storage": {
    "isStable": false,
    "name": "Error",
    "string": "Error: TASK022_PRIVATE_STORAGE_DIAGNOSTIC",
    "prototypeTraps": 1
  }
}
```

This violates the frozen storage rule that quota/security/write failures use
stable sanitized public errors and never expose diagnostics. The normal native
`DOMException` quota test passes, but it does not cover hostile exception
classification.

Smallest bounded revision:

1. make quota classification trap-proof; any unsafe or unclassifiable thrown
   value must fall back to the fixed `storage_unavailable` error without raw
   text;
2. add direct tests for a hostile thrown Proxy, a Proxy-wrapped DOMException or
   unsafe `name` access, and the existing ordinary quota/security cases;
3. preserve the existing legal Basket bytes and in-memory snapshot on every
   rejected write.

### P2-1 — Add/merge status is inferred from two different snapshots

`createBrowserQuoteBasketAdapter.add` loads `previous` with one `now()` call,
then `addStoredPublicDraft` reloads storage with a second `now()` call. It
classifies the result only by comparing the two line counts. If expiry occurs
between the reads, the second read removes the expired Basket and creates a
fresh one, yet equal line counts report `merged`.

Relevant current bytes are
`frontend/src/lib/quote-basket/browser.ts:31`,
`frontend/src/lib/quote-basket/browser.ts:36`,
`frontend/src/lib/quote-basket/browser.ts:37`,
`frontend/src/lib/quote-basket/browser.ts:42` and
`frontend/src/lib/quote-basket/browser.ts:49`.

The independent probe seeded one quantity-2 line on 2026-08-05, then made the
adapter's first clock read return 2026-09-03 and its mutation clock read return
2026-09-05. The old line expires on 2026-09-04. Current output was:

```json
{
  "reportedMutation": "merged",
  "resultingLineCount": 1,
  "resultingQuantity": 2
}
```

A genuine merge would have produced quantity 4; the result was a fresh add.
The persisted document is legal, so this is a truthful-announcement P2 rather
than data-integrity P1.

Smallest bounded revision: sample the operation time once and derive
`added`/`merged` from the exact validated base and matching identity used by
the mutation, not from line-count equality across a separate read. Add the
expiry-boundary regression and preserve ordinary equal-identity merge,
different-identity split and cross-tab newer-snapshot behavior.

### P2-2 — Final-line Remove drops the live announcement surface

`useQuoteBasket.remove` sets both the empty Basket and
`"Item removed from your Quote Basket."`. However, `QuoteBasketView` returns
the empty-state section before rendering the only `aria-live` element. React
batches those state updates, so after the final line is removed the resulting
component tree contains no live node with the removal text.

Relevant current bytes are
`frontend/src/lib/quote-basket/use-quote-basket.ts:113`,
`frontend/src/lib/quote-basket/use-quote-basket.ts:122`,
`frontend/src/components/quote-basket/index.tsx:81` and
`frontend/src/components/quote-basket/index.tsx:99`.

This is narrower than the preserved Visual Round 1 PASS: its evidence proves
the final empty state and records removal announcements, but it does not
provide a current resulting-DOM assertion that the final-line removal text
remains in a live region. The source branch proves that it does not.

Smallest bounded revision: keep one persistent sanitized live region across
loading, error, empty and one/N states, then add a client-level regression that
removes the final line and asserts both the empty state and the exact live
removal announcement. Do not change the passed layout or visual evidence
bytes.

## Independently Reproduced Passing Boundaries

### Contract, state and integration

- The current document is closed `1.0.0`, enforces canonical
  `updatedAt + 2_592_000_000 ms`, uses the exact `262_144`-byte UTF-8 ceiling,
  rejects partial/corrupt/unknown/expired documents and deeply freezes legal
  snapshots.
- Ordinary zero/one/N, all nine identity split dimensions, quantity-excluded
  merge, display refresh, safe-integer maximum, overflow rejection,
  set/remove atomicity and stale/newer lexicographic reconciliation pass.
- The FGD X15+PVC projection crosses the server-only boundary with only public
  model/name/path and the approved local protected image. Valid Add writes the
  Basket; invalid form input performs no write; no per-item CMS, WordPress,
  Feishu or submission request exists.
- The local Basket route remains `noindex,nofollow`, renders zero/one/N public
  state, quantity and Remove, and production preview/cms both return final 404
  with zero CMS and zero submission requests. The final action remains a
  disabled `type=button` outside a form with truthful negative copy.

### Browser, visual and leakage evidence

- Exact hash expansion passes `15/15`; every file begins with
  `ffd8ffe000104a4649460001`, and `file` confirms the disclosed JPEG/JFIF bytes
  and all 1440/1024/768/390/320 or 956x768 dimensions.
- Direct inspection of the 1440 two-line, 390 two-line, 320 final-empty and
  native Remove-focus evidence agrees with the current Visual Round 1 layout
  verdict. Protected media, line count, configuration facts, disabled final
  action and responsive information hierarchy are visible and coherent.
- Current normal-path storage/HTML/Flight/DOM evidence contains no Article
  Number, `GDHEPRD000172`, stable Product/Media identity, WordPress/SCF/Feishu
  field, raw server enum, price, PII, secret or diagnostic. The runtime Basket
  modules contain no CMS/TASKS import or network seam.

### Tests, build, protected scope and cleanup

- Frozen Node `24.18.0`: the four direct Basket files pass `36/36`; the full
  current suite passes `44 files / 459 tests`.
- CMS `16/2/2`, ProductCard `8/3/6`, Product Configuration v1 `4/1/6`, Product
  Configuration v2 and QuoteLine v2 verifiers pass. ESLint, TypeScript and the
  Next `16.2.11` production build pass with dynamic `/request-a-quote`.
- CMS integration, ProductList, Product Detail and Quote Basket production
  smokes all pass; every spawned listener exits.
- Thirteen immutable baseline hashes are exact. The only two changed baseline
  paths are the explicitly authorized ProductConfigurator and Product Detail
  page seams. Package, lock, PublicQuoteDraft, Product Configuration v2,
  QuoteLine v1/v2, protected media, both protected CSS files and CMS remain
  unchanged.
- The final production build restored `next-env.d.ts` to
  `7b550dda9686c16f36a17bf9051d5dbf31e98555b30d114ac49fc49a1e712651`.
  Reviewer probes and the generated `.next` tree were removed; port 3000 has
  no listener. `git diff --check`, project validation, message validation and
  strict lane audit pass with zero issues.

## Documentation and scope

Root/frontend README, the Quote Basket contract, architecture contract and
ADR-006 consistently state that this is a browser-local non-payment RFQ
collection whose lines are untrusted public input. Final server re-resolution,
contact submission, Feishu and external writes remain deferred. No TASK-023,
final API, CMS/database, dependency, deployment or external-system work was
found.

The reviewer changed no product source, test, README, task/Planner authority,
visual evidence, CMS, dependency or external state. It wrote only this
canonical report, reviewer lane records and the controlled linked response.

## Review Boundary and Next Gate

Planner must acknowledge the linked FAIL response and record governed
recovery. Only the two stable-error P1s, the two narrow P2s and direct
regressions belong in a possible Round 2. Fresh Planner validation must precede
that review. No final validation, acceptance, Git delivery, deployment,
TASK-023, final RFQ submission or Feishu work is permitted by this report.

# Round 2 Final Closure Review

## Final Verdict

`PASS / P0=0 / P1=0 / P2=0`.

All four Round 1 findings are closed on current shared bytes. No remaining or
new finding was reproduced within the explicitly narrow Round 2 scope.

## Closure Evidence

### P1-1 closed — stable domain boundary and exact TTL range

- Every exported domain operation now enters a common catch boundary that
  ignores the caught value and emits a new fixed `QuoteBasketDomainError`.
  The nested record and array reflection paths likewise do not classify or
  inspect attacker-thrown values.
- A reviewer-scope Vite SSR probe exercised `cloneAndValidateQuoteBasket`,
  `addPublicDraft`, `setQuoteBasketItemQuantity`,
  `removeQuoteBasketItem` and `summarizeQuoteBasket` with an outer Proxy whose
  reflection trap threw a second hostile Proxy. All five operations returned
  `QuoteBasketDomainError:invalid_basket`; the second Proxy's prototype trap
  was invoked zero times and its private marker appeared nowhere in the
  public error.
- The same probe passed a valid Date exactly 1000 ms below the JavaScript
  maximum into `createEmptyQuoteBasket`. The fixed 30-day addition failed as
  `QuoteBasketDomainError:invalid_basket`, with no raw `RangeError` or
  `Invalid time value`. Normal exact 30-day validation remains covered by the
  direct and full suites.

### P1-2 closed — trap-proof quota classification

- Quota classification now invokes the captured native DOMException `name`
  getter directly. A real native `QuotaExceededError` retains
  `storage_full`; values without the native internal brand fail closed to
  `storage_unavailable`.
- The independent probe supplied a hostile thrown Proxy, a Proxy-wrapped
  native quota exception and an object with an unsafe own `name` getter. All
  three returned only `QuoteBasketStorageError:storage_unavailable`; the
  hostile prototype trap and unsafe getter were each invoked zero times.
- A trusted native quota exception still returned `storage_full`. For every
  rejected write the previously serialized Basket bytes were byte-identical.

### P2-1 closed — one Add snapshot and truthful mutation result

- `createBrowserQuoteBasketAdapter.add` samples `operationTime` once, loads or
  creates one exact mutation base, applies the mutation to that same base and
  derives `added` versus `merged` from the resulting line count against that
  base. There is no second storage or time snapshot in the operation.
- The independent probe reproduced both sides of the boundary. At
  `2026-09-03T23:59:59.999Z`, the retained line merged from quantity 2 to 4
  and reported `merged`; at the exact expiry
  `2026-09-04T00:00:00.000Z`, it created a fresh quantity-2 line and reported
  `added`. Each Add called the supplied clock exactly once.
- A different color still split into two lines and reported `added`; a newer
  valid cross-tab snapshot was still adopted by deterministic revision order.
  The ordinary Add/merge integration regression remains green.

### P2-2 closed — persistent final-remove live region

- `QuoteBasketContent` now chooses loading, error, empty or populated content
  first and renders one `aria-live="polite"` node after that content for every
  state. The live node therefore remains in the same resulting empty tree
  after the final line disappears.
- The direct current-byte route test performs a real adapter Add and final
  Remove, renders the resulting empty Basket state and independently asserts
  all three facts together: the empty-state copy, `aria-live="polite"`, and
  the exact sanitized text `Item removed from your Quote Basket.`
- Quote Basket CSS hash remains
  `a10f02f43d683d2ffbc678193dff5aec931ca9b48faed4caabb066a80999823b`;
  the closure required no layout change.

## Direct Regressions and Protected Scope

- Frozen Node `24.18.0` and npm `11.16.0`: the four direct Basket files pass
  `40/40`; the full current suite passes `44 files / 463 tests`.
- The CMS `16/2/2`, ProductCard `8/3/6`, Product Configuration v1 `4/1/6`,
  Product Configuration v2 and QuoteLine v2 verifiers pass. ESLint, TypeScript
  and the Next `16.2.11` production build pass; `/request-a-quote` remains
  dynamic.
- CMS integration, ProductList, Product Detail and Quote Basket production
  smokes pass. Basket preview and cms modes remain final 404 with zero CMS
  requests and zero submission requests; no task listener remains.
- All fifteen Visual Round 1 files reproduce their exact SHA-256 hashes,
  disclosed JPEG/JFIF magic prefix and recorded dimensions. Visual Round 1
  remains historical/current `PASS / severe=0 / obvious=0 / detail=0`; this
  narrow adversarial review performed no additional visual round and changed
  no evidence byte.
- Thirteen immutable baseline hashes are exact. Package, lock,
  PublicQuoteDraft, Product Configuration v2, QuoteLine v1/v2, protected
  media, both protected CSS files, CMS authority and production `next-env.d.ts`
  remain frozen. The only baseline exceptions remain the already-authorized
  ProductConfigurator and Product Detail page seams.
- Runtime source retains no CMS or TASKS import, network/submission seam,
  Article Number, stable Product/Media identity, WordPress/SCF/Feishu field,
  price/payment/checkout, PII, secret or diagnostic payload. Final submission,
  server re-resolution, Feishu, TASK-023 and deployment remain deferred.
- The full suite/typecheck/build generated only reproducible `.next` and
  TypeScript cache output. Both were precisely removed after validation;
  `next-env.d.ts` is restored to
  `7b550dda9686c16f36a17bf9051d5dbf31e98555b30d114ac49fc49a1e712651`.
  The independent reviewer probe was also removed. Port 3000 is clear.
- A1/A2 Planner `FAIL / 0/2/0` and `PASS_AFTER_R1`, Visual Round 1 PASS and
  Adversarial Round 1 `FAIL / 0/2/2` remain distinct and unmodified above.
  Current task, project and board views remain
  `UNDER_REVIEW / NOT_ACCEPTED / DIRTY` while this response is pending.

## Final Boundary

Planner may enter fresh final validation only after acknowledging the linked
Round 2 PASS response and recording governed review recovery. This review did
not modify product source, tests, documentation, task or Planner authority,
CMS/database, visual evidence, dependency, Git, deployment or any external
system. PASS is not acceptance, Git authorization, deployment authorization,
TASK-023 authorization, final RFQ submission authorization or Feishu
authorization.
