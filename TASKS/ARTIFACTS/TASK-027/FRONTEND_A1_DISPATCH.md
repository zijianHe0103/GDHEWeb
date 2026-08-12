# TASK-027 Frontend A1 Dispatch

message_id: MSG-TASK-027-FRONTEND-CONTRACT-SNAPSHOT-A1
scope: contract snapshot and offline verifier only

## Required reads

- `TASKS/ACTIVE/TASK-027-local-rfq-intake-stub-sink.md`
- `TASKS/ARTIFACTS/TASK-027/REQUIREMENTS.md`
- `TASKS/ARTIFACTS/TASK-027/A0_DESIGN.md`
- `TASKS/ARTIFACTS/TASK-027/TDD_SEAMS.md`
- `TASKS/ARTIFACTS/TASK-027/A0_PROTECTED_BASELINE.md`
- `TASKS/ARTIFACTS/TASK-027/A0_PROTECTED_CHECKSUMS.sha256`
- TASK-026 normative JSON bundle and verifier

## A1 requirements

1. Observe strict TDD. First capture a real RED showing the frontend-local RFQ Submission v2 snapshot/verifier is absent.
2. Copy exactly all 20 JSON files from TASK-026 `schemas/`, `samples/` and `vectors/` into `frontend/src/lib/rfq-submission-contract/v2/` without modifying the source bytes.
3. Add one closed frontend-local manifest that inventories every snapshot file and hash.
4. Add `frontend/scripts/verify-rfq-submission-v2-contract.mjs` using Node built-ins only. It must:
   - bind to the exact TASK-026 canonical source paths and the A0 hashes;
   - require regular, non-symlink, canonical repository-root/source/snapshot objects;
   - prove exact byte/hash parity, exact inventory and closed local Schema refs;
   - validate the five positive sample roots and named negative/crypto evidence at the same truth boundary as TASK-026;
   - fail closed on missing, extra, tampered, symlinked, non-canonical, traversal, remote-ref and authority-substitution inputs;
   - avoid runtime imports from `TASKS/**`.
5. Add focused removable mutation tests. Do not weaken or modify TASK-026 or TASK-025 authority.
6. Update only frontend-local documentation needed to describe the verifier command. Do not update root README or architecture yet.
7. Validate with Node 24.18.0: focused tests, new verifier, all existing verifiers relevant to the closure, lint and typecheck. Do not run a production build unless a focused test requires it.
8. Restore `frontend/next-env.d.ts` to its protected production hash and leave no `.next`, TypeScript cache, temporary build root or listener.
9. Produce linked A1 execution, RED, validation and diff artifacts plus frontend worklog entry. Stop after A1 and send one controlled execution response to Planner.

## Forbidden in A1

- no runtime Validator, canonical/HMAC code, mixed orchestration, Repository/Sink or Route Handler;
- no customer UI, Basket clearing, CMS/WordPress, package/lock/dependency, Feishu/email, external write, deployment, Git or acceptance action;
- no Planner-owned task/state/board/README/architecture mutation;
- do not revert or clean pre-existing shared-worktree changes.

## Expected evidence

- exact snapshot inventory and hashes;
- direct verifier output and mutation matrix;
- proof of no runtime or protected-source drift;
- focused test/verifier/lint/typecheck results;
- generated-output and listener cleanup evidence.
