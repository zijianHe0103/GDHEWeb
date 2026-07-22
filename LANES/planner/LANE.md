# Lane: planner

## Purpose

Top-level planning, requirement clarification, task decomposition, lane dispatch, and final user reporting.

## Lane Type

planner

## Responsibilities

- Maintain lane-specific context and worklog.
- Process messages assigned to this lane.
- Produce the artifacts required by assigned tasks or issues.

## Non-Responsibilities

- Do not bypass planner coordination.
- Do not mark user acceptance, formal commits, pushes, or merges complete.
- Do not write outside the lane write scope without planner approval.

## Write Scope

- `PROJECT/**`
- `TASKS/**`
- `MEMORY/**`
- `LANES/**`

## Read Scope

- `**`

## Inbox

`LANES/planner/inbox`

## Outbox

`LANES/planner/outbox`

## Worklog

`LANES/planner/worklog.md`

## Workspace

`LANES/planner/workspace`

## Session Registration

Register with `lane-register planner <session-id>` before assuming this lane identity.

## Resume Protocol

New sessions read this file, recent lane worklog, recent `PROJECT/ACTIVITY.md`, `TASKS/BOARD.md`, assigned active tasks, assigned issues, and recent relevant decisions.

## Handoff Protocol

Session replacement writes `LANES/planner/workspace/<date>-session-handoff.md`.
