# TASK-023 Frontend Adversarial Transport P2-1 Revision

Date: 2026-08-06
Controlled request: `MSG-TASK-023-FRONTEND-ADVERSARIAL-TRANSPORT-P2-R1`
Result: `PASS_FOR_PLANNER_CHECKPOINT`

## Historical review preserved

Adversarial Round 1 remains the canonical `FAIL / P0=0 / P1=1 / P2=2`. This revision closes only frontend P2-1. It does not address the WordPress public-UUID P1, rewrite Planner narration, declare review PASS, or authorize acceptance, Git delivery or deployment.

## Strict RED

Before production mutation, the public RelatedProductCard Transport test added four one-request hostile throws:

- a null-prototype Proxy whose `getPrototypeOf` trap throws a private diagnostic;
- a revoked Proxy;
- a TypeError whose `cause` accessor throws a private diagnostic;
- a TypeError with an Error cause whose `message` accessor throws a private diagnostic.

Command:

```sh
cd frontend
PATH=/Users/arron/.nvm/versions/node/v24.18.0/bin:/usr/bin:/bin:/usr/sbin:/sbin \
npm test -- tests/related-product-card-transport.test.ts
```

RED was exact: 4 new tests failed and the prior 5 passed. Current production leaked `PRIVATE_PROXY_DIAGNOSTIC_023`, the revoked-Proxy TypeError, `PRIVATE_CAUSE_DIAGNOSTIC_023` and `PRIVATE_MESSAGE_DIAGNOSTIC_023` instead of the fixed `RelatedProductCardTransportError("network")`.

## Minimum GREEN

Only `frontend/src/lib/cms/server/related-product-cards/transport.ts` changed:

- Node's server-only `util.types.isProxy` rejects every ordinary or revoked Proxy before prototype reflection.
- Trusted `RelatedProductCardHttpError`, `RelatedProductCardProtocolError` and `RelatedProductCardTransportError` instances are preserved through one guarded classifier.
- Redirect classification accepts only a non-Proxy TypeError with own data-descriptor `cause`, a non-Proxy Error cause and own string data-descriptor `message` containing `redirect`.
- Accessors, failed reflection and unclassifiable thrown values return false and fall through to the existing fixed sanitized network error.
- Caller-aborted and frozen-timeout checks remain driven by the trusted AbortSignals; fetch remains one call with zero retry.

No attacker-controlled `cause`, `message`, prototype or diagnostic is read or rethrown.

## Preserved behavior

- Direct Transport GREEN: 1 file / 9 tests.
- RelatedProductCard contract/Transport/runtime and Product Detail loader/route: 5 files / 45 tests.
- Ordinary HTTP errors, 304, redirect, caller abort, 5000 ms timeout, single request and no retry remain passing.
- Product Detail continues to catch an unavailable related module and render no recommendation module without diagnostics.
- UI/CSS/routes, RelatedProductCard/CMS/Quote Basket contracts, DTOs, candidate data, visual evidence, package/lock and protected assets are unchanged.

## Complete current-byte validation

- Full Vitest: 51 files / 540 tests PASS.
- Seven contract verifiers PASS.
- ESLint and TypeScript PASS.
- Next.js 16.2.11 production build PASS with unchanged route inventory.
- CMS integration, ProductList, Product Detail/candidates and Quote Basket production smokes PASS.
- Package, lock, next-env, protected image, ProductCard and QuoteLine hashes match the frozen baseline.
- Canonical visual evidence 50/50 and Round 3 evidence 14/14 PASS; detailed QA inventory matches the canonical stream.
- Production diagnostic scan and `git diff --check` PASS.
- `.next` and `tsconfig.tsbuildinfo` were moved recoverably to Trash; no Next listener remains.
- DPG project, message and strict-lane gates PASS.

## Scope

Files changed for P2-1:

- `frontend/src/lib/cms/server/related-product-cards/transport.ts`
- `frontend/tests/related-product-card-transport.test.ts`
- this artifact and `LANES/frontend/worklog.md`

No CMS, database, external system, visual evidence, Planner authority, Git or deployment work was performed. Planner owns the independent checkpoint and later Round 2 review dispatch.
