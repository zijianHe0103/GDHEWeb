# TASK-019 Implementation Plan

status: `PLANNED_SERIAL_TDD_EXECUTION`

## Success criteria

1. Product Configuration is a new additive, closed, versioned WordPress read
   contract with one real FGD X15+PVC standard option.
2. No standard option, Article Number or installation accessory is guessed.
3. WordPress exposes no QuoteLine write/storage model.
4. Frontend Product Configuration snapshot is exact-byte authority-bound.
5. QuoteLine is an independent closed Next.js inquiry-domain contract with
   deterministic equality/merge semantics.
6. Existing Content Schema 3, ProductCard, runtime consumers and visible pages
   remain regression-safe.
7. Fixture is deterministic and leaves zero residue.

## A1 — Planner design and baseline

1. Freeze `REQUIREMENTS.md`, `DESIGN.md` and this plan.
2. Record WordPress, PHP, SCF, GDHE Site, Node and npm versions.
3. Record protected inventories and hashes for:
   - existing 19-file Content Schema closure;
   - ProductCard 8-file closure and TASK-014 authority;
   - frontend CMS and ProductCard snapshot/verifiers;
   - package/lock and TASK-016～018 protected runtime/page files.
4. Run existing CMS Schema/Golden and frontend verifier/test/build baselines.
5. Verify database availability and zero A3/TASK-014/TASK-019 residue.
6. Validate DPG project/registry/messages/strict lane and diff.

Exit:

- task is `READY`;
- design artifacts exist and have no open business blocker;
- CMS/frontend product code has no TASK-019 diff;
- baseline passes;
- only then move to `IN_PROGRESS` and dispatch WordPress.

## A2 — WordPress TDD RED

The `wordpress_cms` lane must ACK before mutation, then:

1. add focused tests that expect the missing Product Configuration root and
   missing route;
2. run them and record a valid missing-capability RED;
3. add negative tests for duplicate Article Number/public choice, guessed extra
   length/accessory, malformed packaging/custom policy, internal leakage and
   request closure;
4. keep production implementation absent until RED is evidenced.

Syntax, environment, database or incorrect-test failures are not valid RED.

## A3 — WordPress minimum GREEN

1. add the exact 4-file Product Configuration closure;
2. add private source projection and strict whole-candidate validation;
3. register closed anonymous GET `/gdhe/v1/product-configurations`;
4. add deterministic ETag/304 and normalized no-store errors;
5. add isolated TASK-019 Fixture/create/cleanup commands;
6. add Goldens, request negatives, source exclusions and leakage scans;
7. generate handoff manifest/checksums and validation JSON;
8. update CMS docs only after behavior is proven.

No SCF editor field, QuoteLine storage, live product or Feishu mutation is
allowed.

Exit:

- focused Product Configuration tests GREEN;
- two Fixture lifecycles have different internal IDs and identical public hashes;
- exact cleanup and all legacy CMS regressions pass;
- authority handoff is complete.

## A4 — Planner WordPress checkpoint

Planner independently reproduces:

- exact route/query/header/error behavior;
- one valid FGD response and no invented standard length;
- duplicate/invalid candidates fail closed;
- 4-file closure and checksum inventory;
- two-round determinism and zero residue;
- Core/SCF/database/PHP/JSON;
- A3 and ProductCard regressions;
- protected scope, docs and DPG gates.

If PASS, dispatch frontend. If not, send one narrow revision and repeat this
checkpoint. Frontend does not start early.

## A5 — Frontend TDD RED

The `frontend` lane must ACK before mutation, then:

1. add a focused Product Configuration snapshot test that fails because the
   verifier/snapshot is missing;
2. add focused QuoteLine schema/semantic tests that fail because the contract is
   missing;
3. record exact valid RED evidence;
4. keep Transport, runtime Validator, Adapter, UI and persistence untouched.

## A6 — Frontend minimum GREEN

1. create the exact Product Configuration snapshot and manifest;
2. create a built-in-only authority verifier and mutation matrix;
3. create independent QuoteLine Schema, resolved/custom samples and semantic
   equality/merge tests;
4. add only the required package scripts, without dependency or lockfile change;
5. update frontend/root README after commands are real.

Exit:

- authority verifier and focused tests pass;
- both existing verifiers pass;
- lint, typecheck, full tests and production build pass;
- protected runtime/page hashes and package lock remain unchanged;
- no runtime import from CMS/TASKS and no internal-field leakage.

## A7 — Planner final checkpoint and independent review

Planner independently validates current shared bytes:

- WordPress and frontend focused/full gates;
- exact authority/snapshot parity;
- QuoteLine valid/invalid and merge matrix;
- no CMS QuoteLine storage/write route;
- existing ProductCard/CMS runtime and visible pages unchanged;
- docs, protected scope, residue and DPG gates.

Then dispatch one independent adversarial review. Reviewer challenges business
identity, no-guessing, authority split, request/Schema closure, deterministic
Fixture, snapshot binding, QuoteLine equality, leakage, regression and scope.

Only final `PASS / P0=0 / P1=0 / P2=0`, complete execution/validation evidence
and resolved documentation allow checked `prepare-awaiting-user`.

## Rollback

1. run exact TASK-019 Fixture cleanup;
2. verify A3/TASK-014/TASK-019 markers and created records are zero;
3. revert only TASK-019 source additions and additive registration/version lines;
4. remove only TASK-019 frontend snapshot/QuoteLine files and scripts;
5. rerun all protected regressions.

No `reset --hard`, force push, broad SQL deletion, task-branch delivery or
deployment is authorized.
