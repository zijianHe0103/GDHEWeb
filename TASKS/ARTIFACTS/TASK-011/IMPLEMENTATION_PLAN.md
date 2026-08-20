# TASK-011 Implementation Plan

## 1. Delivery strategy

Use four bounded phases. Each phase has a clean checkpoint and a single next
step. A later phase cannot begin before the previous checkpoint passes.

## 2. Phase A1 — Frontend offline vertical slice

Owner: `frontend`

### RED

1. Add focused tests for the minimal DTO/Adapter using TASK-008 canonical
   samples only through TASK-010 public validation seams.
2. Add orchestration tests for disabled configuration, one-fetch success,
   validated 404, mismatched/unvalidated 404, non-404 errors and invalid
   success payload.
3. Add route/config tests proving the enable flag is exact, the path is
   server-owned and browser input cannot change it.
4. Add server-only negative build tests for public and deep imports.
5. Record the failing test list before production implementation.

### GREEN

1. Add the minimal readonly DTO.
2. Add a pure Adapter that accepts only the validated success wrapper.
3. Add server-only integration configuration and stable integration error
   semantics.
4. Add the no-argument orchestration function.
5. Add `/integration/cms` and route-local CSS.
6. Update `.env.example`, `frontend/README.md` and root `README.md`.
7. Keep the root page/layout/global CSS, package/lock, contracts, Transport,
   Validator and CMS source unchanged.

### A1 evidence

- `TASKS/ARTIFACTS/TASK-011/A1_EXECUTION_REPORT.md`;
- `TASKS/ARTIFACTS/TASK-011/A1_TEST_OR_VALIDATION_LOG.md`;
- frontend worklog;
- linked execution response to Planner.

### A1 required checks

```bash
npm run verify:cms-contract
npm test -- <TASK-011 focused tests>
npm test
npm run lint
npm run typecheck
npm run build
git diff --check
```

Also prove:

- exact dependency tree unchanged;
- protected product files unchanged;
- no temporary build-test residue;
- no Client Component import path;
- no CMS origin, raw JSON or credential leakage.

## 3. Planner A1 checkpoint

Planner independently reruns the focused and full gates, reviews the source and
diff, and records `A1_PLANNER_CHECKPOINT.md`.

Checkpoint PASS authorizes only the short-lived Fixture window. It does not
authorize live E2E completion, review, acceptance or Git delivery.

## 4. Phase A2 — WordPress Fixture window

Owner: `wordpress_cms`

1. Verify local WordPress, PHP, database, GDHE Site version and public API.
2. Verify zero existing A3 Fixture residue.
3. Run only the existing A3 Fixture create command.
4. Record the manifest and verify anonymous Schema 3 `/resolve` for `/`.
5. Return the exact public path and runtime base to Planner/frontend through a
   controlled execution response.

No CMS source, schema, plugin, database structure, permanent content or user is
modified. Cleanup responsibility remains active until A4 completes.

## 5. Phase A3 — Live Next.js E2E and screenshots

Owner: `frontend`

1. Build the already-passing frontend.
2. Start a real Next.js production server with server-only local E2E values.
3. Request `/integration/cms` and assert the deterministic technical summary.
4. Verify disabled behavior and one authoritative missing-path case without
   permitting browser path injection.
5. Inspect browser network activity for direct WordPress requests and secrets.
6. Capture 1440px and 390px screenshots.
7. Stop all frontend processes and remove generated runtime residue.
8. Return live E2E evidence and a controlled response.

## 6. Phase A4 — Mandatory cleanup

Owner: `wordpress_cms`

Run cleanup even if A3 fails:

1. execute the existing A3 cleanup command;
2. verify zero fixture posts and revisions;
3. verify zero attachments and fixture uploads;
4. verify zero fixture terms;
5. verify zero fixture option and marker meta;
6. recheck WordPress Core/SCF/plugin/database integrity;
7. return cleanup evidence.

The task cannot enter adversarial review until A4 is PASS.

## 7. Planner integration checkpoint

Planner independently verifies:

- A1 source/test boundaries;
- live HTTP proof and HTML;
- 1440px and 390px screenshots;
- browser network isolation and leakage scans;
- stopped processes and no frontend residue;
- WordPress zero residue;
- full parity/lint/typecheck/test/build gates;
- DPG project/message/strict lane validation.

Planner then creates the standard execution report, validation log and
diff/output summary if the lane artifacts need consolidation.

## 8. Independent review

Dispatch `adversarial_reviewer` only after the integration checkpoint passes.
Review focus:

1. no validation bypass before Adapter;
2. wrapper/DTO integrity and minimal projection;
3. validated 404 agreement;
4. enable/path configuration gate;
5. route/server-only and browser leakage;
6. real WordPress/Next.js E2E authenticity;
7. Fixture cleanup and zero residue;
8. protected scope, dependencies and deferred-work boundaries.

Any P0/P1 or unresolved P2 produces `NEEDS_REVISION`. Revisions are limited to
the named finding and direct regression tests.

## 9. Final validation and acceptance gate

After final review PASS, Planner reruns all gates, resolves
`document_impact/readme_impact`, writes `PLANNER_SUMMARY.md`, and uses the
controlled `prepare-awaiting-user` transition.

No lane may commit, push, merge, accept, deploy or begin the formal homepage.
