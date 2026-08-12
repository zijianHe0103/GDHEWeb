# TASK-027 Frontend A2 TDD RED Evidence

runtime: Node 24.18.0
result: RED_GREEN_COMPLETE

## A2.1 closed runtime contract

The focused test was added before the runtime modules existed.

```text
npm test -- tests/rfq-intake-v2-contract.test.ts
exit 1
Test Files 1 failed
Error: Cannot find module ../src/lib/rfq/server/v2
```

The minimum contract implementation then made the first test GREEN. The final
focused contract suite is `1 file / 6 tests PASS` and covers complete roots,
semantic mutations, caller isolation, wrapper authenticity and hostile input.

## A2.2 canonical crypto

The canonical test was added before any canonical export existed.

```text
npm test -- tests/rfq-intake-v2-canonical.test.ts
exit 1
1 test failed
TypeError: canonicalizeRfqValue is not a function
```

The minimum canonical/HMAC/token implementation made the vector test GREEN.
The final canonical suite is `1 file / 10 tests PASS`, including exact frozen
vectors and reflection, Unicode, JSON-domain and key-material negatives.

## A2.3 server-only boundary

The real temporary Next.js build test was added while the four production
modules intentionally lacked the boundary marker.

```text
npm test -- tests/rfq-intake-v2-server-only.test.ts
exit 1
Test Files 1 failed
Tests 2 failed
public entry guarded build: expected status not to be 0, received 0
deep canonical guarded build: expected status not to be 0, received 0
```

This RED proves the real product defect: both Client Component imports compiled.
Adding only `import "server-only";` to the four production modules made the
marker-stripped positive controls build and both guarded builds fail. The final
result is `1 file / 2 tests PASS`, with all temporary roots removed in `finally`.

## Final focused GREEN

```text
npm test -- tests/rfq-intake-v2-contract.test.ts tests/rfq-intake-v2-canonical.test.ts tests/rfq-intake-v2-server-only.test.ts
exit 0
Test Files 3 passed
Tests 18 passed
```
