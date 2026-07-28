# Project Coordination

schema_version: DPG-LANES-1.0.0

## Multi-Session Agent Lanes

This project uses `DPG-LANES-1.0.0`.

Default message flow:

用户 -> planner -> executor or dynamic lane -> adversarial_reviewer -> planner -> 用户验收

## Default Lanes

- `planner`: planning, clarification, task decomposition, dispatch, final reporting.
- `executor`: assigned execution, execution reports, validation evidence.
- `adversarial_reviewer`: business-deliverable read-only review; may write only its review report, its own lane records, and messages through `lane_message.py`.

## Protocols

- `TASKS/` remains the task fact layer.
- `PROJECT/` remains the project fact layer.
- `MEMORY/` remains long-term decision and lesson memory.
- `LANES/` stores session registration, lane worklogs, messages, resume packets, and handoffs.
- `PROJECT/AGENT_LANES.md` is a rendered view; `LANES/registry/lanes.json` is the source of truth.
- `PROJECT/ACTIVITY.md` is a human-readable event view; `LANES/registry/events.jsonl` is append-only event evidence.

## Acceptance

Automation, dispatch, and lanes must not bypass `task-accept`. A task can reach `AWAITING_USER` only after execution evidence, adversarial review PASS, validation evidence, and document impact resolution.

Use `task_transition.py prepare-awaiting-user` for the checked transition into `AWAITING_USER`. Use `task_transition.py reopen` to move an unaccepted task to `NEEDS_REVISION` with a recorded recovery entry.
