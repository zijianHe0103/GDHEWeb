# TASK-008 Frontend CMS Contract Snapshot Implementation Plan

> **For Codex frontend lane:** REQUIRED SUB-SKILL: Use test-driven-development and execute this plan one task at a time. Do not commit, push, merge, deploy, or begin TASK-009.

**Goal:** Freeze the smallest `/resolve` success/error contract inside `frontend/` and make source/snapshot drift fail closed with a deterministic offline verifier.

**Architecture:** `manifest.json` is the machine-readable inventory. The verifier resolves repository-relative authority files, computes the two-root local `$ref` closure, validates exact file-set and SHA-256 parity, and reconstructs the two selected error examples. Tests operate only on temporary copies.

**Tech Stack:** Node.js 24 built-ins, TypeScript project, Vitest 4, existing Next.js 16 repository.

---

## Task 1: Write the failing contract-snapshot tests

**Files:**

- Create: `frontend/tests/cms-contract-snapshot.test.ts`
- Read only: `TASKS/ARTIFACTS/TASK-008/DESIGN.md`

**Steps:**

1. Write a helper that creates an isolated temporary repository fixture and removes it after each test.
2. Add a happy-path test that invokes the exported verifier.
3. Add independent negative tests for missing file, extra file, single-byte tamper, path traversal and unknown local `$ref`.
4. Run only this test file and record the expected initial failure caused by the missing verifier/snapshot.

**Verify:**

```sh
cd frontend
npm test -- tests/cms-contract-snapshot.test.ts
```

Expected before implementation: FAIL for a missing verifier or contract snapshot, not for a syntax error in the test itself.

## Task 2: Implement the deterministic verifier

**Files:**

- Create: `frontend/scripts/verify-cms-contract.mjs`
- Modify: `frontend/tests/cms-contract-snapshot.test.ts`

**Steps:**

1. Implement repository-root resolution without embedding an absolute path.
2. Implement safe POSIX repository-relative path validation.
3. Implement SHA-256, deterministic JSON serialization and exact directory inventory helpers.
4. Implement recursive non-fragment local `$ref` discovery with cycle protection.
5. Implement manifest, source, snapshot, closure and selected-error parity checks.
6. Export the verifier for Vitest and add a CLI entry that returns nonzero on failure.
7. Run the narrow test and make only verifier-behavior tests pass; snapshot-dependent happy path may remain red until Task 3.

**Verify:**

```sh
cd frontend
npm test -- tests/cms-contract-snapshot.test.ts
```

## Task 3: Create the frozen Schema and sample snapshot

**Files:**

- Create: `frontend/src/lib/cms/contracts/manifest.json`
- Create: `frontend/src/lib/cms/contracts/schemas/**`
- Create: `frontend/src/lib/cms/contracts/samples/success/**`
- Create: `frontend/src/lib/cms/contracts/samples/errors/**`

**Steps:**

1. Copy exactly the 16 files listed in `DESIGN.md`, preserving their relative Schema paths and bytes.
2. Copy `resolve-product-alpha.json` and `resolve-home.json` byte-for-byte into clearly named success sample paths.
3. Deterministically select only `gdhe_not_found` and `gdhe_invalid_schema` from the TASK-007 error fixture into one error bundle.
4. Generate the sorted manifest with API `1`, Schema `3.0.0`, TASK-007 authority paths and current SHA-256 values.
5. Run the narrow test until the happy path and all mutation negatives pass.

**Verify:**

```sh
cd frontend
npm test -- tests/cms-contract-snapshot.test.ts
node scripts/verify-cms-contract.mjs
```

## Task 4: Add the package command and developer documentation

**Files:**

- Modify: `frontend/package.json`
- Modify: `frontend/README.md`

**Steps:**

1. Add only `verify:cms-contract`; do not modify dependencies or `package-lock.json`.
2. Document the snapshot ownership, authority sources, verification command and fail-closed behavior.
3. State that TASK-008 adds no WordPress connection, runtime validator, DTO adapter or visible page.
4. Confirm the lockfile checksum is unchanged from pre-execution state.

**Verify:**

```sh
cd frontend
npm run verify:cms-contract
git diff -- package-lock.json
```

Expected: parity PASS and empty lockfile diff.

## Task 5: Run the complete validation matrix

**Files:**

- Modify if required by an in-scope defect only: TASK-008 frontend files
- Create/update: `TASKS/ARTIFACTS/TASK-008/EXECUTION_REPORT.md`
- Create/update: `TASKS/ARTIFACTS/TASK-008/TEST_OR_VALIDATION_LOG.md`
- Create/update: `TASKS/ARTIFACTS/TASK-008/DIFF_OR_OUTPUT_SUMMARY.md`
- Update: `LANES/frontend/worklog.md`

**Steps:**

1. Run parity and the targeted mutation tests.
2. Run lint, typecheck, all Vitest tests and production build.
3. Prove `frontend/src/app/**`, `cms/**`, `.env*`, dependencies and lockfile are unchanged.
4. Scan the snapshot for absolute paths, credentials, numeric WordPress IDs and forbidden runtime imports.
5. Record commands, results, changed files, remaining risks and exact non-goals in the required artifacts.
6. Send a controlled `execution_response` to planner; do not request acceptance or perform Git delivery.

**Verify:**

```sh
cd frontend
npm run verify:cms-contract
npm run lint
npm run typecheck
npm test
npm run build
cd ..
git diff --check
```

Expected: all commands PASS; only TASK-008 allowed paths are changed.
