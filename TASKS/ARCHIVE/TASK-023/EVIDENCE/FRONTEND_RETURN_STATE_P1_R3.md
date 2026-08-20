# TASK-023 Frontend Return-State P1 R3

Date: 2026-08-08
Lane: `frontend`
Request: `MSG-TASK-023-FRONTEND-RETURN-STATE-P1-R3`
Result: `PASS_FOR_PLANNER_CHECKPOINT`

## Scope and preserved history

The exact revision request was acknowledged before test or product mutation.
This revision closes only the Unified Cards Adversarial Round 3 P1 pre-parse
boundary. Historical Visual and Adversarial reports remain unchanged,
including Unified Cards Round 3 `FAIL / P0=0 / P1=1 / P2=0` and Visual Round 4
`PASS / severe=0 / obvious=0 / detail=0`.

Only these production/test paths changed:

- `frontend/src/components/related-products/index.tsx`;
- `frontend/tests/related-products-presentation.test.ts`.

The remaining writes are this report, its validation log and the frontend lane
worklog. CSS, Basket implementation, CMS, API, Schema, snapshots, verifiers,
contracts, dependency files, README, Planner state, visual evidence, Git,
deployment and external systems were not modified.

## Strict RED

Two direct production-parser regressions were added first. The focused command
then exited `1` with exactly the two new tests failing and all ten prior tests
passing:

```sh
cd frontend
PATH=/Users/arron/.nvm/versions/node/v24.18.0/bin:/usr/bin:/bin:/usr/sbin:/sbin \
  npm test -- tests/related-products-presentation.test.ts
```

Observed failures:

1. a hostile null-prototype Proxy was coerced through its
   `Symbol.toPrimitive` hook and accepted as the legal state instead of
   returning `null` without reads;
2. a legal 257-character JSON state was parsed and accepted instead of being
   rejected before `JSON.parse`.

The first regression tracks `get`, `getPrototypeOf`, `ownKeys`,
`getOwnPropertyDescriptor` and the coercion callback separately. The second
temporarily instruments `JSON.parse`, proves a legal state of exactly 256
characters is parsed once and accepted, then proves the 257-character form is
rejected with zero parse calls.

## Minimum GREEN

`parseRelatedProductsReturnState` now accepts `unknown` at its public runtime
boundary and performs one short-circuit guard before `try` and before
`JSON.parse`:

```ts
if (typeof serialized !== "string" || serialized.length > 256) return null;
```

The primitive `typeof` check rejects null, objects and Proxies without property
access, reflection or coercion. Only a primitive string reaches `.length`; a
string longer than 256 characters returns before parsing. No post-parse
exact-key, descriptor, safe-integer, visible-count clamp or scroll behavior
changed.

The focused GREEN command exited `0` with `1 file / 12 tests`. The hostile value
returns `null` with every counter at zero. The 256-character legal boundary is
accepted and the 257-character legal boundary returns `null` with zero
`JSON.parse` calls.

## Preserved behavior

- exact three-key public state and visible-count clamping;
- scroll position and one-time session entry consumption;
- canonical View Product href without a query parameter;
- sessionStorage-unavailable navigation degradation;
- shared card skeleton and quantity-one accessory Basket add/merge;
- initial `3`, next `3`, final `7`, focus and polite live announcements;
- reduced-motion, one related collection request, zero per-card resolve;
- browser identity isolation, server-only consumer and production/CMS
  fail-closed behavior.

## Outcome

The current frontend-owned revision passes the direct, focused, complete,
contract, build, smoke, protected-hash, historical-visual, cleanup and
governance gates recorded in the companion log. This is an execution checkpoint
only. It is not closure review PASS, user acceptance, Git delivery or
deployment. Planner must independently validate the current bytes before a
narrow closure review may be dispatched.
