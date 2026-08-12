# TASK-028 Frontend A2 TDD RED Evidence

result: PASS
runtime: Node 24.18.0 / npm 11.16.0

## A2.1 server-owned local intent RED

Command:

```text
cd frontend && PATH=/Users/arron/.nvm/versions/node/v24.18.0/bin:/usr/bin:/bin:/usr/sbin:/sbin npm test -- tests/rfq-intent-v2.test.ts
```

Observed before production implementation: exit `1`; Vitest could not resolve
`../src/lib/rfq/server/v2/intent`, so no tests ran. The failure was the missing
issuer/verifier seam, not environment or listener failure.

Minimum GREEN added only the server-owned HMAC issuer/verifier. The direct
suite then passed `1 file / 3 tests`, including exact 30 minutes, origin/key/
snapshot binding, constant-time signature comparison, tamper/malformed token,
expiry/future/Date-range failure and zero hostile-value reflection.

## A2.2 local intent Route RED

Command:

```text
cd frontend && PATH=/Users/arron/.nvm/versions/node/v24.18.0/bin:/usr/bin:/bin:/usr/sbin:/sbin npm test -- tests/rfq-intent-v2-route.test.ts
```

Observed before Route implementation: exit `1`; Vitest could not resolve
`../src/app/api/rfq/intent/route`. Minimum GREEN added the local-only POST
Route with exact config, Origin, media, 8192-byte raw, fatal UTF-8, one-request
JSON parse and no-store gates. A first GREEN check exposed only an over-broad
test spy count because internal config parsing also uses `JSON.parse`; the test
was narrowed to the exact request string without changing product behavior.
Current direct Route coverage passes `1 file / 4 tests`.

## A2.3 Basket 3.0 projection RED

Command:

```text
cd frontend && PATH=/Users/arron/.nvm/versions/node/v24.18.0/bin:/usr/bin:/bin:/usr/sbin:/sbin npm test -- tests/rfq-submission-v2-projection.test.ts
```

Observed before projection implementation: exit `1`; Vitest could not resolve
`../src/lib/rfq/submission`. Minimum GREEN added the independent public
projection with freshly validated Basket 3.0 input, ready-only `1..50` ordered
items, exact standard/custom/accessory mapping, frozen output, 163840-byte gate
and no external calls. Current direct projection coverage passes `1 file / 3
tests`.

## A2.4 complete builder and intake binding RED

Command:

```text
cd frontend && PATH=/Users/arron/.nvm/versions/node/v24.18.0/bin:/usr/bin:/bin:/usr/sbin:/sbin npm test -- tests/rfq-submission-v2-builder.test.ts tests/rfq-intent-v2.test.ts tests/rfq-intent-v2-route.test.ts tests/rfq-submission-v2-projection.test.ts
```

Observed before the fourth GREEN: exit `1`; three new tests failed while the
prior nine tests stayed green. The exact failure was
`TypeError: validateLocalRfqIntentResponse is not a function` at the three new
call sites. Minimum GREEN added the closed intent-response parser, provenance-
checked complete v2 draft builder, frozen honeypot-only anti-abuse object,
262144-byte final gate and the intake pre-reservation verifier binding.

The listener-backed integration then proved accepted unseen `201`, expired
same-key replay `200` without a second mixed call, unseen tamper `403
invalid_submission_intent` with no reservation/mixed call, and a corrected new
intent reaching the unchanged mixed path once.

## Preserved secondary failures

- Typecheck first found one test-only object-literal annotation that excluded
  `WORDPRESS_API_URL`; the annotation was widened to `Record<string,string>`.
- The first extended server-only positive controls copied the new client-safe
  `submission` directory into an intentionally server-only fixture without its
  unrelated Basket types. Copy scope was corrected to the existing server tree;
  all ten positive/negative Next builds then passed.
- No product behavior was claimed green while either failure existed.
