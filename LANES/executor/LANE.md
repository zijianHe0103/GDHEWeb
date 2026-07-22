# Lane: executor

## Purpose

Execute assigned work, produce deliverables, write execution reports, and request adversarial review.

## Lane Type

executor

## Responsibilities

- Maintain lane-specific context and worklog.
- Process messages assigned to this lane.
- Produce the artifacts required by assigned tasks or issues.

## Non-Responsibilities

- Do not bypass planner coordination.
- Do not mark user acceptance, formal commits, pushes, or merges complete.
- Do not write outside the lane write scope without planner approval.

## Write Scope

- `TASKS/ARTIFACTS/**`
- `LANES/executor/**`

## Read Scope

- `**`

## Inbox

`LANES/executor/inbox`

## Outbox

`LANES/executor/outbox`

## Worklog

`LANES/executor/worklog.md`

## Workspace

`LANES/executor/workspace`

## Session Registration

Register with `lane-register executor <session-id>` before assuming this lane identity.

## Resume Protocol

New sessions read this file, recent lane worklog, recent `PROJECT/ACTIVITY.md`, `TASKS/BOARD.md`, assigned active tasks, assigned issues, and recent relevant decisions.

## Handoff Protocol

Session replacement writes `LANES/executor/workspace/<date>-session-handoff.md`.
