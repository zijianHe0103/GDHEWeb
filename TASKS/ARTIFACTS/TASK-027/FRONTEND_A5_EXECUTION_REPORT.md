# TASK-027 Frontend A5 Execution Report

result: PASS_FOR_PLANNER_CHECKPOINT
runtime: Node 24.18.0
message: MSG-TASK-027-FRONTEND-LOCAL-HTTP-A5

## Delivered scope

- Added a server-only, fail-closed configuration reader. The local route is
  enabled only for non-production `stub` mode, an exact loopback HTTP origin
  with explicit port, a bounded key selector, exactly 32 bytes of lowercase
  hexadecimal HMAC material and one closed Stub Sink outcome.
- Added the Node Route Handler for `POST /api/rfq/intake/`. Disabled and
  production configurations return an empty final `404` with `no-store` before
  body or business access.
- Enforced the ordered raw boundary: exact Origin, exact JSON media type,
  declared and streamed 262144-byte ceilings, fatal UTF-8, one JSON parse,
  authentic public-submission validation, then the A4 runtime.
- Wired the existing TASK-025 mixed consumer only. One new valid intent makes
  one `/gdhe/v1/quote-line-validations` POST and zero legacy `/resolve`, Product
  Configuration, ProductCard or RelatedProductCard requests.
- Serialized only bodies obtained from authentic validated wrappers. Public
  responses are closed to `200/201/202/409` A4 outcomes and sanitized
  `400/403/413/415/503` errors, always `no-store` and without CORS opt-in.
- Added public, deep config and Route Handler Client Component build negatives
  with marker-stripped positive controls and complete temporary-root cleanup.

## Real HTTP result

The short-lived loopback smoke ran real Next dev and production servers plus a
mock WordPress listener. It reproduced accepted new/replay/conflict,
indeterminate replay, rejected-before-delivery replay, mixed-validation and
transport failures, exactly one mixed POST per new intent, zero legacy calls,
and unset/disabled/production final `404` with zero additional WordPress calls.
Response scans found no customer/contact data, Article Number, CMS origin,
server RFQ identity, source/contact fingerprint, key material, diagnostic or
CORS header.

The input spelling `/api/rfq/intake/` first receives Next's canonical 308; the
real smoke follows that method-preserving redirect and validates the final
Route Handler response. No Next routing configuration was widened.

## Boundaries preserved

A1-A4 contract, crypto, authority, Repository and Sink behavior remains
unchanged. No dependency, package/lock, `tsconfig.json`, UI, existing route,
CMS, database, external system, A6 documentation, review, Git or deployment
work was performed. Generated build output was moved recoverably to Trash and
`next-env.d.ts` was restored to its production hash.

## Raw-body P1 narrow revision R1

revision_message: MSG-TASK-027-FRONTEND-RAW-BODY-P1-R1
revision_result: PASS_FOR_PLANNER_RECHECK

The Route no longer classifies an unknown body-reader rejection with
`instanceof` or any other observation. `readRawBody` now returns only an
internal closed result: `ok`, `invalid` or `too_large`. Declared/streamed limits
create the internal `too_large` result and retain authentic `413`; an unknown
reader rejection is ignored by a binding-free catch and becomes authentic
`400 invalid_request`.

The direct regression uses a hostile null-prototype Proxy and proves zero
`get`, `getPrototypeOf`, `getOwnPropertyDescriptor`, `has`, `ownKeys` and `set`
traps, no private diagnostic, `no-store` and no CORS. A direct JSON spy proves
one raw parse before contract rejection without adding a production hook.

The real HTTP smoke now additionally covers wrong Origin, parameterized media,
declared oversize, no-Content-Length streamed oversize and fatal UTF-8. Every
raw gate returns the frozen status/code and makes zero WordPress calls. A6,
complete review, acceptance, Git and deployment remain blocked.
