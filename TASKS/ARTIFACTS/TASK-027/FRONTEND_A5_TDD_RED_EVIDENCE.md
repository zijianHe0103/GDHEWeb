# TASK-027 Frontend A5 TDD RED Evidence

result: RED_GREEN_COMPLETE
runtime: Node 24.18.0

## A5.1 configuration

The first focused test imported the required public configuration seam before
production code existed. Vitest exited `1` because
`src/lib/rfq/server/v2/config` could not be resolved. The minimum GREEN added
only the closed environment parser; the focused config result is `1/1 PASS`.

## A5.2 Route Handler

The first Route test imported `src/app/api/rfq/intake/route` before it existed
and exited `1` on the missing module. After the smallest handler skeleton and
ordered gates were added, the malformed-contract case exposed the next product
RED: `{}` returned `503` instead of the required `400 invalid_request` because
contract validation and runtime failures shared one catch. Separating the
validation boundary produced the required GREEN without changing A1-A4.

The current direct Route matrix proves disabled body-not-read, exact Origin and
media rejection, declared/stream byte limits, fatal UTF-8, malformed JSON,
contract rejection and one real accepted/replay TASK-025 request. Final result:
`1 file / 3 tests PASS`.

## A5.3 server-only and real HTTP controls

The first expanded copied-project build failed because the test fixture had not
copied the existing CMS error dependency and stripped markers only from the RFQ
subtree. This was a test-harness RED, not a production escape. Copying the exact
dependency closure and stripping all temporary `src/lib` markers produced
`1 file / 8 tests PASS`: guarded public, config-deep and Route imports fail,
while the corresponding marker-stripped controls build.

The first HTTP smoke used `redirect: manual` and tried to parse Next's canonical
308 body as JSON. Following the method-preserving redirect closed that test-only
RED. A second assertion RED treated all public Basket UUIDs as internal even
though the frozen receipt intentionally returns `submittedBasketSnapshot`;
the assertion was narrowed to actual server RFQ identity, fingerprints and
secret/CMS values. The final real HTTP smoke is PASS.

## Raw-body P1 revision R1

The exact exported `POST` seam received a `ReadableStream` whose reader rejected
with a hostile null-prototype Proxy. Before the fix, the focused command exited
`1`: prior `3` tests passed, the new test failed, `getPrototypeOf` ran once and
the thrown `PRIVATE_RAW_BODY_DIAGNOSTIC` escaped from
`route.ts` at the `error instanceof RangeError` expression.

Minimum GREEN removed the thrown-TypeError/RangeError classification entirely.
The reader returns a closed internal discriminant; its catch never binds or
observes the unknown rejection. The focused Route suite then passed `1 file / 4
tests`, with zero traps and authentic `400 invalid_request`, while existing
declared/streamed overflow cases remained authentic `413 payload_too_large`.

A separate direct proof added after the behavior closure spies only on the
standard `JSON.parse` seam: one `{}` request reaches exactly one raw parse and
then fails contract validation. Final Route result is `1 file / 5 tests PASS`.

The extended HTTP smoke first found two test-transport REDs. A manual
`http.request` chunked shape returned 400 rather than proving the intended
no-Content-Length stream, so the proof was corrected to real `fetch` plus
`ReadableStream`. A declared length with an empty body caused an unstable
connection close, so the proof sends matching bytes while the Route still
rejects from the declaration before business work. Final network proof PASSes
all five raw gates with zero WordPress calls.
