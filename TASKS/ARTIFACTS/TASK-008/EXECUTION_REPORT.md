# TASK-008 Frontend Execution Report

status: COMPLETE
task_id: TASK-008
lane: frontend
message: MSG-TASK-008-FRONTEND-CONTRACT-SNAPSHOT
completed_at: 2026-07-25T01:11:27+08:00
document_impact: RESOLVED
readme_impact: UPDATED

## Outcome

Implemented the smallest frontend-owned, offline-verifiable snapshot of the frozen TASK-007 `/resolve` success/error contract. The result contains exactly the two frozen roots, their 16-file local `$ref` closure, two byte-identical success samples, a deterministic two-error bundle, a sorted manifest, and a Node-built-in fail-closed verifier.

## Test-driven sequence

1. Created the focused Vitest file before the verifier or snapshot existed.
2. Ran `npm test -- tests/cms-contract-snapshot.test.ts` with Node.js 24.18.0/npm 11.16.0.
3. Captured the meaningful RED: Vitest exited 1 because `../scripts/verify-cms-contract.mjs` did not exist; the test did not fail for syntax.
4. Added only the frozen snapshot and deterministic verifier.
5. Expanded the focused test to six isolated temporary-repository cases and reached GREEN: 1 file, 6 tests passed.

## Delivered implementation

- `frontend/src/lib/cms/contracts/manifest.json` freezes TASK-007, API 1, Content Schema 3.0.0, two roots, source/snapshot paths, selectors, expectations and lowercase SHA-256 values.
- `frontend/src/lib/cms/contracts/schemas/**` contains exactly the 16 frozen Schema files copied byte-for-byte from the CMS authority.
- `frontend/src/lib/cms/contracts/samples/success/**` contains byte-identical Page and Product Golden samples.
- `frontend/src/lib/cms/contracts/samples/errors/resolve-errors.json` contains only the sorted `gdhe_invalid_schema` and `gdhe_not_found` selections.
- `frontend/scripts/verify-cms-contract.mjs` uses Node.js built-ins, exports a repository-root-injectable verifier, and provides a nonzero CLI failure path.
- `frontend/tests/cms-contract-snapshot.test.ts` proves PASS plus missing, extra, tampered, traversal and unknown-local-ref FAIL behavior in automatically removed temporary directories.
- `frontend/package.json` adds only `verify:cms-contract`.
- `frontend/README.md` documents ownership, authority, command, fail-closed behavior and explicit non-goals.

## Fail-closed coverage

The verifier validates frozen manifest metadata, path safety, sorting and uniqueness; exact declared/actual file inventory; snapshot and authority SHA-256; direct byte parity; recursive non-fragment local `$ref` closure; rejection of remote, unknown and escaping references; deterministic error reconstruction; and success/error version, type, code and status invariants.

## Scope and boundaries

No dependency or lockfile changed. No `frontend/src/app/**`, environment file, CMS file, WordPress state, database, TASK-007 authority artifact, transport, runtime validator, DTO, adapter or visible page changed. Existing planner and other-lane edits were preserved. No commit, push, merge, review, acceptance, closure or deployment was performed.

## Remaining governed work

Planner must independently validate this response and may then dispatch the adversarial reviewer. TASK-009 and all later runtime consumption work remain outside this execution.

## Authority identity binding revision R1

Planner reproduced one P1: replacing the canonical `error.schema.json` authority path with an identically hashed `.rogue` path still passed. The revision adds one focused regression before production changes; the RED showed the verifier resolving instead of rejecting.

The minimal fix is confined to manifest identity validation:

- every Schema source path must equal `cms/wp-content/plugins/gdhe-site/config/schemas/` plus the path derived from its `schemas/**` snapshot path;
- Page and Product names, types, TASK-007 Golden source paths and snapshot paths must equal the exact frozen ordered pair;
- the error container source path and derived error snapshot path must equal their exact frozen identities.

After the fix, the focused suite passes 7/7 while retaining the previous six cases. An independent temporary-repository mutation matrix rejected all 11 substitutions covering Schema source, Page/Product name, type, source and snapshot, plus error source and snapshot. No manifest data, snapshot byte, dependency, lockfile, application route or backend authority changed.
