# TASK-028 Frontend A1 Execution Report

- request: `MSG-TASK-028-FRONTEND-CUSTOMER-DOMAIN-A1`
- checkpoint: A1 only
- runtime: Node `24.18.0`, npm `11.16.0`
- result: `PASS_FOR_PLANNER_CHECKPOINT`

## Delivered

- Added the client-safe public `normalizeRfqCustomer(input: unknown)` seam.
- Supports only `fullName`, `companyName`, `whatsApp`, `weChat`,
  `businessEmail`, `phone`, `countryRegion`, `city`, `companyWebsite` and
  `message`; structural or unknown input fails closed.
- Uses JavaScript Unicode whitespace trimming, omits empty optional strings,
  preserves internal text/case and never truncates.
- Validates every successful DTO against the frozen frontend-local
  `common.v2.schema.json#/$defs/publicCustomer` using the existing Ajv
  `8.20.0` and `ajv-formats 3.0.1` dependencies.
- Enforces the exact v2 code-point maxima, Unicode scalar strings, email format
  and absolute HTTP(S) website without credentials or any network request.
- Returns only immutable closed field errors using `required`, `invalid`,
  `too_long` and `at_least_one_required`; no Ajv paths, raw values, exceptions
  or diagnostics are returned.
- Rejects accessors, symbols, non-enumerable/unknown properties, arrays,
  non-plain objects and transparent/throwing/revoked Proxies before any field
  getter or coercion read.

## Explicitly not implemented

A2 intent/HMAC/idempotency, Basket projection, intake integration, form/UI,
receipt parsing, Basket clearing, CMS/CRM/Feishu, external systems, dependency
changes, review, Git delivery and deployment were not started.

Documentation impact remains pending for the later visible A5 flow; A1 changes
no customer-facing route or usage documentation.
