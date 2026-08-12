# TASK-028 Frontend A1 TDD RED Evidence

runtime: Node `24.18.0`, npm `11.16.0`
result: REDS_REPRODUCED_THEN_CLOSED

## RED 1 — public seam absent

The focused test was added before any customer-domain production file:

```text
cd frontend
PATH=/Users/arron/.nvm/versions/node/v24.18.0/bin:/usr/bin:/bin:/usr/sbin:/sbin npm test -- tests/rfq-customer-domain.test.ts
```

Exit `1`. Vitest reported `0 test` because
`../src/lib/rfq/customer` did not exist. The failure was the frozen public seam,
not a fixture or environment failure.

Minimum GREEN added only the client-safe customer module, JavaScript trim,
empty optional omission, exact frozen `publicCustomer` Ajv validation and a
frozen success result. The same command then passed `1 file / 1 test`.

## RED 2 — closed customer errors absent

The next focused tests added required/contact, exact code-point maxima, lone
surrogate, email and HTTP(S) website behaviors. The same command exited `1`:
`3 tests`, prior `1` PASS and new `2` FAIL. Both failures showed the current
generic `{ field: contactMethods, code: invalid }` instead of the required
field-specific `required` and `too_long` results.

Minimum GREEN mapped only frozen Ajv keywords/paths into the closed field/code
model, added Unicode scalar checking and rejected website credentials without
fetching the URL. The command then passed `1 file / 3 tests`.

## RED 3 — hostile input was observed

The final A1 boundary test supplied accessor, coercion, symbol,
non-enumerable, unknown, inherited, transparent/throwing/revoked Proxy, array
and primitive inputs. The command exited `1`: prior `3` PASS and the new test
FAIL with raw `Error: PRIVATE_CUSTOMER_ACCESSOR`; the getter was invoked by the
real production seam.

Minimum GREEN snapshots only enumerable own string data descriptors with the
closed key set, rejects non-plain objects, and uses structured clone rejection
to fail closed on transparent Proxy roots before reading field values. Getter
and `Symbol.toPrimitive` counters remain zero; reflective failures are caught
without returning their diagnostics. One intermediate run correctly remained
RED because a present non-string `fullName` was reported as `required`; the
stable precedence was narrowed to `invalid`, then the final command passed
`1 file / 4 tests`.

## Static recovery

The first fresh `tsc --noEmit` after behavior GREEN found only a TypeScript
compile guard: the Ajv validator was possibly undefined. A checked local
validator constructor replaced the module-level narrowing assumption. Fresh
focused, lint and typecheck commands then passed.
