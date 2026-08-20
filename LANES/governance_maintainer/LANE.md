# Lane: governance_maintainer

## Purpose

Synchronize project-managed governance templates with the verified active Durable Project Governance plugin while preserving user content and producing TASK-006 delivery evidence.

## Lane Type

specialist

## Responsibilities

- Compare the verified plugin source/cache templates with the project-managed governance surfaces.
- Modify only the managed blocks and template files explicitly assigned by TASK-006.
- Preserve TASK-005 post-push governance records and all user content outside managed blocks.
- Produce reproducible execution, validation, and diff evidence for planner review.

## Non-Responsibilities

- Do not bypass planner coordination.
- Do not mark user acceptance, formal commits, pushes, merges, or GitHub default-branch changes complete.
- Do not write outside the registered lane write scope.
- Do not modify plugin source/cache, product code, WordPress, database, or runtime state.
- Do not rewrite Git history, delete branches, reset changes, or modify external state.

## Write Scope

- `LANES/governance_maintainer/**`
- `TASKS/ARTIFACTS/TASK-006/**`
- `TASKS/ACTIVE/TASK_TEMPLATE.md`
- `AGENTS.md`
- `README.md`
- `.codex/rules/GIT_GOVERNANCE.rules`
- `.codex/config.toml`
- `.codex/agents/**`

## Read Scope

- `**`

## Inbox

`LANES/governance_maintainer/inbox`

## Outbox

`LANES/governance_maintainer/outbox`

## Workspace

`LANES/governance_maintainer/workspace`

## Session Registration

Register with `lane-register governance_maintainer <session-id>` before assuming this lane identity.

## Resume Protocol

Read `PROJECT/STATE.md`, `PROJECT/COORDINATION.md`, `PROJECT/AGENT_LANES.md`, the lane registry and policy, this file, recent lane worklog, `PROJECT/ACTIVITY.md`, `TASKS/BOARD.md`, TASK-006, and its queued message.

## Handoff Protocol

Session replacement writes `LANES/governance_maintainer/workspace/<date>-session-handoff.md`.
