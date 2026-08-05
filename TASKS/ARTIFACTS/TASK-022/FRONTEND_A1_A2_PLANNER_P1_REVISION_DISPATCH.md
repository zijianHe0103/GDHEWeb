# TASK-022 Frontend A1/A2 Planner P1 Revision Dispatch

Date: 2026-08-05
From: `planner`
To: `frontend`
Historical lane result: `PASS_FOR_PLANNER_CHECKPOINT`
Current Planner checkpoint: `FAIL / P0=0 / P1=2 / P2=0`

## Independently reproduced P1 findings

### P1-1 — fixed 30-day authority is not enforced on stored input

`cloneAndValidateQuoteBasket` accepts an otherwise legal document whose
`updatedAt` is `2026-08-05T00:00:00.000Z` but whose `expiresAt` is
`2099-01-01T00:00:00.000Z`. The current check proves only `expiresAt` is later
than `updatedAt`; it does not prove the frozen exact 30-day interval.

Minimum revision:

- add a direct RED proving a far-future and any non-exact interval are rejected;
- require `expiresAt` to equal exactly `updatedAt + 2_592_000_000 ms` after
  canonical timestamp validation;
- preserve exact-boundary acceptance, read-does-not-refresh and successful
  mutation-refreshes-expiry behavior;
- do not change schema version, storage key, ceiling or public fields.

### P1-2 — hostile `items` reflection leaks raw diagnostics

An array Proxy passes `Array.isArray`, then throws `Error("private items trap")`
from its `map` property. `cloneAndValidateQuoteBasket` lets the raw Error escape
instead of returning only `QuoteBasketDomainError`.

Minimum revision:

- add direct removable regressions for the observed throwing `map`/iteration
  boundary and any minimum adjacent array reflection case needed by the same
  implementation seam;
- inspect/copy the array through a fail-closed boundary without invoking
  attacker-controlled accessors or leaking trap text;
- reject sparse arrays, accessor indexes, symbol/non-enumerable extras and
  reflection failures if they are reachable through the same seam;
- preserve legal zero/one/N and duplicate-identity behavior;
- every public domain failure must remain the stable sanitized
  `QuoteBasketDomainError`.

## Exact scope and stop

Modify only the new Quote Basket domain/tests and the existing A1/A2 evidence
needed to record the historical checkpoint and revision. Storage code may be
changed only if required to consume the corrected domain invariant. Do not
touch frozen contracts, package/lock, configurator/product UI, routes, CMS,
README/architecture/ADR, A3-A5, visual QA, review, Git or deployment.

Run focused tests, frozen 6/35 regression, full suite, five verifiers,
lint/typecheck, 15/15 protected hashes, generated cleanup and DPG gates. Return
one linked controlled revision response and stop for independent Planner
re-check.
