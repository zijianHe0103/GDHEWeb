# TASK-010 Adversarial Round 2 Revision Report

status: REVISION_COMPLETE_PENDING_PLANNER_CHECKPOINT
task_id: TASK-010
lane: frontend
message: MSG-TASK-010-FRONTEND-PROTOTYPE-INTEGRITY-R3
review_finding: Round 2 P1 prototype/getter/serialization integrity
revised_at: 2026-07-26

## Finding Reproduced

The frozen wrapper still inherited its `body` getter from a mutable shared class prototype. A caller holding a real wrapper could redefine that getter or add a prototype `toJSON`, changing the wrapper's public body or serializing the complete validated payload.

The public-seam RED added success and error cases for both attack paths:

- focused result: 4 failed and 44 passed;
- prototype `body` replacement made both wrappers return the attacker object;
- prototype `toJSON` made both wrappers serialize the body and an attack sentinel;
- every test restored the original prototype descriptor in `finally`.

## Minimal Fix

Only the wrapper construction in `frontend/src/lib/cms/server/validation/index.ts` changed:

1. Build each validated wrapper with a null prototype, so it does not inherit mutable shared behavior.
2. Keep the payload snapshot private in a closure-backed, non-enumerable and non-configurable own `body` getter.
3. Define a non-enumerable and non-configurable own `toJSON` that returns only `{ kind }`.
4. Preserve fixed own `kind` and module-private brand properties, then freeze the instance.

The public validators, exported types, deep-frozen caller-isolated snapshot, stable error kinds and server-only marker remain unchanged. No factory, override seam, dependency or later Adapter behavior was added.

## Regression Coverage

Both success and error public seams prove:

- shared-prototype `body` getter poisoning cannot change the wrapper body;
- shared-prototype `toJSON` poisoning cannot expose body or an attack sentinel;
- own `body` and `toJSON` cannot be redefined;
- the instance prototype cannot be replaced and remains null;
- the original body reference remains available and revalidates through the same public validator;
- keys, spread and JSON remain exactly kind-only;
- test mutations are restored even when an assertion fails.

Focused GREEN: 48/48.

## Fresh Validation

- focused Validator: 48/48 PASS;
- full suite: 117/117 PASS;
- contract parity: 16 Schemas, 2 success samples, 2 error samples PASS;
- lint, typecheck and production build PASS;
- exact Ajv dependency tree and production audit PASS with zero vulnerabilities;
- package, lockfile, registry, error module, contract manifest and TASK-009 Transport protected hashes unchanged;
- all three Validator production modules retain `server-only`;
- runtime-loader/network, production leakage, temporary residue, whitespace/diff and DPG gates PASS.

One initial combined validation attempt overlapped the full Validator test with lint. ESLint observed a temporary Client-build fixture between its creation and cleanup and exited with `ENOENT`. No product assertion failed and no residue remained. All gates above were then rerun serially and passed fresh.

## Boundaries

No registry, stable error class, contract snapshot, Transport, `src/app`, dependency/lockfile, root README, Planner state, CMS or environment edit was made. No review, acceptance, Git action, deployment, Adapter, page or TASK-011 work was performed.

This frontend revision closes only the Round 2 prototype-integrity P1. Planner checkpoint and any independently authorized closure review remain separate gates.
