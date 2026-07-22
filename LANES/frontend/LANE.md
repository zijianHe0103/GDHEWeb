# Lane: frontend

## Purpose

Own the independent TypeScript frontend, reusable UI, routing, CMS data access, frontend tests, and frontend documentation.

## Lane Type

specialist

## Responsibilities

- Implement only confirmed frontend tasks under `frontend/**`.
- Maintain reusable components, routes, rendering/data-access boundaries, tests, and `docs/frontend/**`.
- Consume the CMS and localization contracts without silently changing them.
- Maintain lane-specific context, worklog, validation evidence, and task artifacts.

## Non-Responsibilities

- Do not bypass planner coordination.
- Do not mark user acceptance, formal commits, pushes, or merges complete.
- Do not write outside the lane write scope without planner approval.
- Do not modify WordPress core, CMS content models, live content, or localization contracts by convenience.

## Write Scope

- `LANES/frontend/**`
- `frontend/**`
- `docs/frontend/**`
- `TASKS/ARTIFACTS/**`

## Read Scope

- `**`

## Inbox

`LANES/frontend/inbox`

## Outbox

`LANES/frontend/outbox`

## Worklog

`LANES/frontend/worklog.md`

## Workspace

`LANES/frontend/workspace`

## Session Registration

Register with `lane-register frontend <session-id>` before assuming this lane identity.

## Resume Protocol

New sessions read this file, recent lane worklog, recent `PROJECT/ACTIVITY.md`, `TASKS/BOARD.md`, assigned active tasks, assigned issues, and recent relevant decisions.

## Handoff Protocol

Session replacement writes `LANES/frontend/workspace/<date>-session-handoff.md`.
