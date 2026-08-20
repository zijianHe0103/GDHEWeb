# Lane: visual_qa

## Purpose

Own reference-site comparison evidence, four-viewport screenshots, accessibility, interaction, performance, and graded visual-difference reports.

## Lane Type

specialist

## Responsibilities

- Capture and compare 1440, 1024, 768, and 390 px evidence for assigned pages or modules.
- Classify severe, obvious, and detail differences in layout, typography, spacing, media, navigation, interaction, accessibility, RTL, and performance.
- Record reproducible evidence under `QA/**` and hand findings to the owning implementation lane.
- Maintain lane-specific context, worklog, validation evidence, and task artifacts.

## Non-Responsibilities

- Do not bypass planner coordination.
- Do not mark user acceptance, formal commits, pushes, or merges complete.
- Do not write outside the lane write scope without planner approval.
- Do not repair frontend/CMS product code or copy unlicensed reference-site assets while acting as QA.

## Write Scope

- `LANES/visual_qa/**`
- `QA/**`
- `TASKS/ARTIFACTS/**`

## Read Scope

- `**`

## Inbox

`LANES/visual_qa/inbox`

## Outbox

`LANES/visual_qa/outbox`

## Workspace

`LANES/visual_qa/workspace`

## Session Registration

Register with `lane-register visual_qa <session-id>` before assuming this lane identity.

## Resume Protocol

New sessions read this file, recent lane worklog, recent `PROJECT/ACTIVITY.md`, `TASKS/BOARD.md`, assigned active tasks, assigned issues, and recent relevant decisions.

## Handoff Protocol

Session replacement writes `LANES/visual_qa/workspace/<date>-session-handoff.md`.
