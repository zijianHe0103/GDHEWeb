# TASK-027 Frontend A3 TDD RED Evidence

runtime: Node 24.18.0
result: RED_GREEN_COMPLETE

## A3.1 authentic projection

The first public-seam test was added before `authority.ts` existed.

```text
npm test -- tests/rfq-intake-v2-authority.test.ts
exit 1
TypeError: resolveAuthoritativeRfqLines is not a function
```

Minimum GREEN added authentic-wrapper consumption, exact closed projection and
one dependency call. The first test then passed and observed the exact frozen
three-line TASK-025 request with no customer or internal Basket identity.

## A3.2 complete response binding

The next test returned one incomplete response after one mixed call.

```text
exit 1
expected kind response_mismatch
received kind invalid_authority_context
```

Minimum GREEN added trap-safe root validation and complete ordered field
binding. The final direct matrix rejects all twelve frozen count/order/identity/
unit/quantity/path/selection/packaging/resolution/Article Number mutations.

## A3.3 authentic authoritative document

The frozen public/mixed/authoritative success mapping initially stopped after
binding.

```text
exit 1
RfqAuthorityError kind=invalid_authority_context
```

Minimum GREEN constructed the closed document from bound lines plus injected
context and returned only the existing strict Validator's authentic wrapper.

## A3.4 reservation and resolution runtime

The orchestration test was added before `intake.ts` existed.

```text
npm test -- tests/rfq-intake-v2-intake.test.ts
exit 1
TypeError: createRfqIntakeRuntime is not a function
```

Minimum GREEN produced the observable order `lookup -> pre_gate -> reserve ->
mixed:3`, with exact frozen digest/comparison/snapshot evidence and a valid
`resolving_lines` wrapper.

## Injected identity ordering regression

A direct negative then showed invalid server IDs were reserved and resolved
before final Schema rejection.

```text
exit 1
expected intake/dependency_failed
received authority/invalid_authority_context
```

Minimum GREEN validates injected UUID/public-reference/source-security and
captures the mixed dependency before reservation. The regression now proves
only `lookup, pre_gate`, with zero reserve and zero mixed calls.

## Server-only positive-control regression

The first combined A1–A3 run truthfully failed because the temporary A2 build
fixture did not copy A3's type-only TASK-025 type file. The positive controls
failed with `Cannot find module .../article-number-batch`, not because of the
server-only guard. The fixture now copies that one type file and production uses
the exact deep type-only import. Public, canonical, authority and intake
marker-stripped controls build; all guarded Client Component imports fail.

## Final focused GREEN

```text
RFQ A1-A3: 6 files / 48 tests PASS
Direct A3 authority/intake/server-only: 3 files / 27 tests PASS
```

## Planner P1 narrow revision — 2026-08-12

The revision first changed only the direct intake test and ran the supported
Node `24.18.0` focused command against unchanged production code:

```text
npm test -- tests/rfq-intake-v2-intake.test.ts
exit 1
1 file failed; 6 tests total; prior 4 passed; 2 failed
```

The Date-range regression supplied canonical
`+275760-09-12T00:00:00.000Z`. Production leaked `RangeError: Invalid time
value` instead of `intake/dependency_failed`, after the fixed 30-day expiry
addition exceeded JavaScript Date range.

The repository regression threw a null-prototype Proxy whose
`getPrototypeOf` trap raised `PRIVATE_TASK027_PROXY_DIAGNOSTIC`. Production's
`error instanceof RfqIntakeError` invoked that trap and leaked the private
native error instead of the stable intake error.

Minimum GREEN computes the exact fixed expiry inside the initial protected
dependency boundary and separates the repository await catch from lookup-result
validation without observing the caught value. The same focused command then
passed `1 file / 6 tests`.
