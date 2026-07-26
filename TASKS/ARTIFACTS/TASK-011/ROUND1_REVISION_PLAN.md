# TASK-011 Round 1 P1 Revision Plan

- Authorized by user: `确认 TASK-011 Round 1 P1 修订并开始执行`
- Authorization recorded at controlled dispatch preparation:
  `2026-07-26T00:53:03Z`
- Scope: one runtime authenticity P1 only

## Design

The Validator module remains the sole owner of wrapper authenticity.

1. Maintain a module-private `WeakSet` containing only wrappers created by
   `createValidatedPayload()`.
2. Export one server-only success-body accessor that accepts `unknown`.
3. The accessor must reject values not present in the private identity set and
   reject authentic error wrappers. Rejection uses the existing stable
   `CmsContractError("invalid_success_payload")` without including input,
   payload fields or diagnostics.
4. The Adapter must obtain the body only through this accessor before field
   projection.
5. Keep the existing `ValidatedCmsPayload<"success">` compile-time signature,
   opaque wrapper behavior, immutable snapshot, `kind`-only serialization and
   server-only markers.

The identity check is not a second Schema validation. The normal success path
remains exactly one Transport request, one success Schema validation and one
Adapter call.

## TDD

First add executable RED cases against the real production Adapter:

- raw success payload passed directly;
- ordinary `{ kind: "success", body }` object;
- authentic error wrapper;
- proxy or equivalent structural imitation if needed to prove identity.

Each must fail with the same stable, non-leaking contract error. A genuine
success wrapper must continue producing the exact frozen DTO.

## Allowed revision files

- `frontend/src/lib/cms/server/validation/index.ts`
- `frontend/src/lib/cms/server/adapter/cms-integration-page.ts`
- `frontend/tests/cms-integration-adapter.test.ts`
- directly affected TASK-011 evidence and `LANES/frontend/worklog.md`

No other TASK-010 source file is authorized.

## Fresh gates

- focused Adapter/Validator/orchestration/server-only tests;
- full Vitest;
- CMS contract parity;
- lint, typecheck and production build;
- dependency, protected-scope, server-only, leakage and residue checks;
- DPG project/message/strict-lane/diff validation.

After Planner checkpoint PASS, only a narrow Round 2 review of the Round 1 P1
and its direct regressions is allowed.
