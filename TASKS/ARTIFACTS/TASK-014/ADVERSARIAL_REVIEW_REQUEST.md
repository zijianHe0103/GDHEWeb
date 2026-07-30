# TASK-014 Adversarial Review Request

mode: `INDEPENDENT_READ_ONLY_REVIEW`
task_state: `UNDER_REVIEW`

## Required authority

1. active TASK-014 card, DESIGN and IMPLEMENTATION_PLAN;
2. `EXECUTION_REPORT.md`, WordPress execution report and validation log;
3. Planner CMS/P1 checkpoints and frontend handoff audit with both rounds;
4. ProductCard Schema/source/tests, 8 Goldens, machine evidence and 25-entry handoff;
5. root README, CMS docs and architecture contract.

## Independent review

Return `PASS`, `FAIL` or `BLOCKED` with P0/P1/P2. TASK-014 requires a final `PASS / P0=0 / P1=0 / P2=0`; a later gate is non-blocking only when demonstrably outside this task.

Challenge:

1. additive compatibility with Schema 3 and old endpoints;
2. closed DTO and leakage exclusions;
3. real 0/1/N in one collection request and zero per-card `/resolve`;
4. eligibility-before-filter/total/pagination and deterministic sorting;
5. four action cells and detail/accessory path invariants;
6. UUID identity binding and valid/dead-link relation behavior;
7. protected-media and local-only Fixture boundaries;
8. request/error/ETag/cache/304 semantics;
9. two-round determinism, A3 regressions, exact cleanup and 25 checksums;
10. Round 1 failure history and Round 2 closure authenticity;
11. documentation truth, protected scope and absence of unauthorized implementation/Git/deployment.

## Write boundary

Allowed only:

- `TASKS/ARTIFACTS/TASK-014/ADVERSARIAL_REVIEW_REPORT.md`
- `LANES/adversarial_reviewer/**`
- controlled response message

Reviewer reports findings and does not repair product, CMS, frontend, authority, task state or external systems.
