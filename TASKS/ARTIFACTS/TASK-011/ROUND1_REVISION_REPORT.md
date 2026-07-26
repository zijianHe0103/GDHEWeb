# TASK-011 Round 1 P1 Revision Report

- Message: `MSG-TASK-011-FRONTEND-ADAPTER-AUTHENTICITY-R1`
- Lane: `frontend`
- Executed at: `2026-07-26T08:58:08+08:00`
- Runtime: Node.js `24.18.0`, npm `11.16.0`
- Branch: `codex/TASK-011-minimal-cms-integration-page`
- Baseline: `a89bb4de91e63dce2f9960e31b1cd39cae58f335`
- Result: `COMPLETE_PENDING_PLANNER_CHECKPOINT`

## Finding reproduced

The real production Adapter trusted the TypeScript-branded wrapper
structurally at runtime. A direct executable regression was added before any
production edit.

The RED run produced exactly three failures and four passes:

- raw success payload: native `TypeError`, not the stable contract error;
- ordinary `{ kind: "success", body }`: accepted and adapted;
- authentic error wrapper: native `TypeError`, not the stable contract error.

This reproduced the sole Round 1 P1 without changing the already passing
compile-time negative or genuine success projections.

## Minimal correction

`validation/index.ts` now owns a module-private `WeakSet<object>`:

1. only `createValidatedPayload()` registers wrappers;
2. registration happens before the existing wrapper freeze;
3. a success-body accessor first checks object identity in that set and then
   checks the authentic wrapper kind;
4. every failure throws the existing
   `CmsContractError("invalid_success_payload")`;
5. the Adapter obtains its projection input only through that accessor.

The accessor is attached to the existing exported success-validator function.
This keeps the Validator's existing top-level runtime export surface unchanged
while making the accessor available to the server-only Adapter.

The accessor performs no Schema validation. The normal path remains exactly
one Transport request, one `validateCmsSuccessPayload()` call and one Adapter
call.

## Runtime authenticity result

The production Adapter now rejects all three executable forgeries with:

```text
category=contract
kind=invalid_success_payload
message=CMS payload did not satisfy the supported contract.
```

The error message and JSON serialization contain none of the input title,
forged title, forged diagnostics, `body` or `diagnostics` sentinels.

The canonical Home and Product success wrappers still produce the exact
frozen ten-field DTOs. Compile-time unknown and ordinary-object negatives
remain in place.

## Fresh validation

| Gate | Result |
|---|---|
| Adapter RED | expected FAIL; 3 failed, 4 passed |
| Adapter GREEN | PASS; 7/7 |
| focused Adapter/Validator/orchestration/server-only | PASS; 4 files, 85/85 |
| full Vitest | PASS; 9 files, 158/158 |
| CMS contract parity | PASS; 16 Schemas, 2 success, 2 error |
| ESLint | PASS |
| TypeScript no-emit | PASS |
| production build | PASS; `/integration/cms` remains dynamic |
| dependency inventory | PASS; unchanged |
| production dependency audit | PASS; zero vulnerabilities |
| existing Validator top-level exports | PASS; unchanged |
| protected source/hash checks | PASS |
| server-only and non-leaking error checks | PASS |
| temporary process/build/test residue | PASS; zero after cleanup |
| `git diff --check` | PASS |
| DPG project/message/strict lane validation | PASS; zero issues |

## Protected behavior and scope

Unchanged:

- wrapper null prototype, own body getter, own kind-only `toJSON`, private
  brand, deep-frozen caller-isolated snapshot and frozen instance;
- error-wrapper behavior and TASK-010 error kinds/messages;
- Schema registry and contract snapshot;
- TASK-009 Transport and integration orchestration;
- route, DTO shape and rendered page;
- package, lockfile, dependencies, README and environment files;
- CMS, database, WordPress Fixture and screenshots.

No second Schema validation, new dependency, production injection seam or
caller-controlled input was added.

## Files

Product/test changes:

- `frontend/src/lib/cms/server/validation/index.ts`;
- `frontend/src/lib/cms/server/adapter/cms-integration-page.ts`;
- `frontend/tests/cms-integration-adapter.test.ts`.

Evidence changes are limited to this report, the three existing TASK-011 A1
execution/validation/diff addenda, the frontend worklog and controlled message
records.

## Gate

The frontend revision is ready for the Planner's independent checkpoint. It
does not authorize Round 2 review, acceptance, commit, push, merge, deployment
or a later task.
