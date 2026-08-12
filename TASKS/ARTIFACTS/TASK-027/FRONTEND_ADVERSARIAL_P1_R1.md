# TASK-027 Frontend Adversarial P1 R1 Narrow Revision

- request: `MSG-TASK-027-FRONTEND-ADVERSARIAL-P1-R1`
- finding: canonical Adversarial Round 1 `P1-1` only
- runtime: Node `24.18.0`, npm `11.16.0`
- result: `PASS_FOR_PLANNER_RECHECK`
- review status: historical canonical review remains `FAIL / P0=0 / P1=1 / P2=2`

## Scope

This revision closes only the hostile return-value boundary of the local
`requestReference()` dependency. It does not change the canonical review,
Planner P2 corrections, task/Board/State, Route contract, public Schema or
snapshot bytes, dependencies, UI, CMS, external systems, Git or deployment.

## TDD RED

After adding the direct production-runtime regression, this exact command was
run before the production fix:

```text
cd frontend
PATH=/Users/arron/.nvm/versions/node/v24.18.0/bin:/usr/bin:/bin:/usr/sbin:/sbin npm test -- tests/rfq-intake-v2-stub-runtime.test.ts
```

Result: exit `1`; `1 file`, `9 tests`, prior `8` PASS and the new test FAIL.
The real pre-reservation rejection path passed a hostile null-prototype Proxy
to the current pattern check, invoked its coercion `get` trap and returned raw
`Error: PRIVATE_REQUEST_REFERENCE_GET` instead of the stable intake error.

## Minimum GREEN

`requestReference()` now receives the dependency result as `unknown` inside
one protected block. It checks `typeof value === "string"` before the fixed
`REQ-[A-Z2-9]{12}` pattern and otherwise returns only the existing
`RfqIntakeError { category: "intake", kind: "dependency_failed" }`.

The direct regression uses both a hostile null-prototype Proxy and a revoked
Proxy. `get`, `getOwnPropertyDescriptor`, `getPrototypeOf`, `has` and
`ownKeys` counters remain zero; neither private diagnostic is serialized. The
same test proves the ordinary `REQ-23456789ABCD` dependency result still
produces the existing customer-safe local `409 request_not_allowed` document.
Existing replay and customer-safe rejection assertions remain in the same
focused runtime suite.

## Current-byte validation

| Gate | Result |
|---|---|
| Direct Stub runtime | PASS — `1 file / 9 tests` |
| RFQ A1-A5 focused | PASS — `11 files / 71 tests` |
| TASK-025 mixed plus Quote Basket v3 | PASS — `15 files / 35 tests` |
| Ten offline contract verifiers | PASS |
| ESLint | PASS — zero warnings |
| TypeScript `tsc --noEmit` | PASS |
| A0 protected non-document hashes | PASS — `43/43` |
| Package/lock/tsconfig/next-env hashes | PASS |
| Diagnostic scan | PASS — no request-reference private marker in production |
| Generated output and listeners | PASS — none |
| `git diff --check` | PASS |
| DPG project/messages/strict lane | PASS — valid / valid / zero issues |

The dispatch did not authorize or require a second complete review, full
visual/UI pass, Git delivery or deployment. The next permitted step is Planner
validation followed by the same reviewer's bounded P1 closure.
