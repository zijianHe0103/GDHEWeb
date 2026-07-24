# TASK-008 Root README Sync Report

result: PASS
task_id: TASK-008
executed_by: governance_maintainer
recorded_by: planner
completed_at: 2026-07-24T17:31:41Z

## Change

The root `README.md` now contains one narrow “前端离线合同快照” subsection:

- identifies the frontend-owned offline TASK-007 `/resolve` snapshot;
- documents `cd frontend && npm run verify:cms-contract`;
- states that the snapshot is not a WordPress connection, DTO adapter or visible page;
- links to the detailed frontend README section.

## Validation

- Managed governance block SHA-256 before and after: `9cc49048641154677989f8bf264f12c905ea8c043e72008a4444832de9eb0be8`.
- Exact README diff, required wording, local link and fenced Markdown structure: PASS.
- Project validation, controlled-message validation, strict lane audit and `git diff --check -- README.md`: PASS.
- No frontend, CMS, dependency, task state, other documentation, Git, acceptance, deployment or TASK-009 change was made by the documentation lane.

## Scope note

The governance maintainer correctly declined to write this report because its machine registry only authorizes TASK-006 artifact paths. Planner owns `TASKS/**` and recorded the already completed README result here without extending the lane registry.
