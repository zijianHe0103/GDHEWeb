# TASK-010 Adversarial Round 1 Revision Report

status: REVISION_COMPLETE_PENDING_PLANNER_CHECKPOINT
task_id: TASK-010
lane: frontend
message: MSG-TASK-010-FRONTEND-WRAPPER-INTEGRITY-R2
review_finding: Round 1 P1 wrapper integrity
revised_at: 2026-07-26

## Finding Reproduced

The original wrapper stored the validated caller object by reference, exposed a writable/configurable `kind`, and remained extensible. A caller could mutate the original input or wrapper after validation and detach the token from the fact it represented.

Public-seam RED:

- 44 focused tests ran with 8 failures and 34 passes.
- Canonical success/error wrappers retained input identity.
- Caller mutations changed nested wrapper body values.
- Success/error wrappers were not frozen.
- Proxy inputs that passed Schema validation did not converge to a clone failure.

A second narrow RED used revoked success/error Proxies. It produced 2 failures and 42 passes because the pre-snapshot version check leaked native `TypeError` before stable error mapping.

## Minimal Fix

Only `frontend/src/lib/cms/server/validation/index.ts` changed:

1. Create a `structuredClone` snapshot before version or Schema inspection.
2. Reject non-JSON exotic objects and recursively freeze the snapshot.
3. Validate the isolated snapshot, then store only that snapshot.
4. Freeze the wrapper after assigning its private body, public kind and private brand.
5. Map snapshot failures to the existing `invalid_success_payload` or `invalid_error_payload` `CmsContractError`.

No new public export, dependency, error kind, Adapter seam or Transport integration was added.

## Regression Coverage

Both success and error public seams prove:

- wrapper body is equal to but not identical with caller input;
- post-validation caller mutations cannot change body;
- nested body objects reject writes;
- wrapper kind rejects writes;
- wrapper rejects extensions and is frozen;
- kind and brand descriptors are non-writable and non-configurable;
- revalidation of wrapper body still succeeds;
- keys/spread/JSON retain the prior kind-only surface and omit body;
- ordinary and revoked Proxy clone failures map to the existing stable contract error without raw payload, DOMException, native clone error or Ajv diagnostics.

## Fresh Validation

- focused Validator: 44/44 PASS;
- full suite: 113/113 PASS;
- contract parity: 16 Schemas, 2 success samples, 2 error samples PASS;
- lint, typecheck and production build PASS;
- exact Ajv dependency tree and production audit PASS;
- registry, error module, package/lock, contract snapshot, Transport, `src/app`, CMS and environment boundaries unchanged;
- payload leakage, temporary residue, whitespace, diff and DPG gates PASS.

## Boundaries

No registry, stable error class, contract snapshot, Transport, `src/app`, dependency/lockfile, root README, Planner state, CMS or environment edit was made. No review, acceptance, commit, push, merge, deployment or TASK-011 work was performed.

This revision closes only the Round 1 P1 at the frontend execution level. Planner checkpoint and independent Round 2 review remain required.
