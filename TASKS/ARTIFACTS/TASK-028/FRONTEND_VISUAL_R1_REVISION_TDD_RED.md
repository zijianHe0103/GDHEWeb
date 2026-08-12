# TASK-028 Frontend Visual R1 Revision TDD RED

Date: 2026-08-12

Runtime: Node.js `24.18.0`, npm `11.16.0`

Request: `MSG-TASK-028-FRONTEND-VISUAL-R1-REVISION`

## S1 — canonical same-origin POST paths

Before production mutation, the existing authentic submission test was changed
to require `/api/rfq/intent` followed by `/api/rfq/intake`.

```text
npm test -- tests/rfq-submission-client.test.ts -t "uses one intent then one intake request and clears only through the accepted callback"
exit 1
1 file failed; 1 failed / 16 skipped
expected: /api/rfq/intent, /api/rfq/intake
received: /api/rfq/intent/, /api/rfq/intake/
```

This is a behavior RED against the actual browser client URL constants. The
minimum GREEN changed only those two URLs and retained `redirect: "error"`.
The complete client test then passed `1 file / 17 tests`.

## O1 — complete empty-form repair guidance

The customer-domain test first required the deterministic five-error set for
one empty ten-field form.

```text
npm test -- tests/rfq-customer-domain.test.ts -t "returns all four required fields and the contact group for one empty form"
exit 1
1 file failed; 1 failed / 4 skipped
expected: fullName, companyName, countryRegion, city, contactMethods
received: contactMethods only
```

A second direct test passed that real normalizer output into the production
presentation and required all five customer-facing messages and stable
accessible targets.

```text
npm test -- tests/rfq-form-presentation.test.ts -t "renders all five empty-form repair errors with stable accessible targets"
exit 1
1 file failed; 1 failed / 5 skipped
first required message was absent because only contactMethods was returned
```

The minimum GREEN added only `allErrors: true` to the existing closed Ajv
configuration. Customer plus presentation then passed `2 files / 11 tests`.

## O2 — truthful local Privacy Policy target

Before presentation mutation, a direct markup regression required one
same-page link and focusable target before the submit button, truthful local
Stub copy, no external href and no protected identity.

```text
npm test -- tests/rfq-form-presentation.test.ts -t "places one focusable local Privacy Policy target before submit without an external request"
exit 1
1 file failed; 1 failed / 6 skipped
missing: <a href="#rfq-privacy-policy">Privacy Policy</a>
```

The minimum GREEN added only the link and its local focusable policy section.
The same focused test passed `1 file / 1 test` with six unrelated tests skipped.

## Combined GREEN

```text
npm test -- tests/rfq-customer-domain.test.ts tests/rfq-submission-client.test.ts tests/rfq-form-presentation.test.ts
exit 0
3 files / 29 tests PASS
```

No RED was caused by a syntax, import, fixture or environment failure.
