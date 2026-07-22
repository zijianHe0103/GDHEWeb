# Project Coordination

schema_version: DPG-LANES-1.0.0

## Multi-Session Agent Lanes

This project uses `DPG-LANES-1.0.0`.

Default message flow:

用户 -> planner -> executor or dynamic lane -> adversarial_reviewer -> planner -> 用户验收

## Project Lanes

- `planner`: planning, clarification, task decomposition, dispatch, final reporting.
- `executor`: assigned execution, execution reports, validation evidence.
- `frontend`: independent TypeScript frontend, components, routing, data access, tests, and frontend documentation.
- `wordpress_cms`: GDHE-owned WordPress content model, CMS extension, API, permissions, and CMS documentation; never edits WordPress core.
- `localization_seo`: language route/status contract, translation linkage, hreflang, RTL, metadata, Schema, and localization/SEO validation artifacts.
- `visual_qa`: RapidDirect comparison, 1440/1024/768/390 screenshots, accessibility, interaction, performance, and graded difference reports.
- `adversarial_reviewer`: business-deliverable read-only review; may write only its review report, its own lane records, and messages through `lane_message.py`.

## Dispatch Boundaries

- `planner` owns requirements, cross-lane sequencing, user gates, project/task state, and final reporting; it does not silently choose unresolved architecture.
- `executor` handles small cross-cutting tasks only when an active task grants explicit paths. It is not a substitute for specialist lanes with durable context.
- `frontend` owns `frontend/**` and `docs/frontend/**`; it consumes CMS and localization contracts but does not change WordPress data models without a handoff.
- `wordpress_cms` owns GDHE custom CMS code and `docs/cms/**`; live database writes require an assigned task, backup/rollback plan, and verification.
- `localization_seo` owns contracts under `docs/i18n-seo/**` and assigned task artifacts; product-code changes are handed to the owning implementation lane.
- `visual_qa` owns evidence under `QA/**`; it reports differences and does not repair product code unless separately dispatched outside the QA lane.
- `adversarial_reviewer` remains read-only for business deliverables and cannot turn review into implementation.

## Stage Flow

Architecture contract -> frontend/CMS foundation -> global shell -> homepage in 1-3 module batches -> reusable page templates -> multilingual/SEO completion -> full quality acceptance.

Each implementation batch follows:

planner -> task-intake -> owning lane -> execution evidence -> visual/localization QA as applicable -> adversarial review -> planner -> user acceptance.

## Protocols

- `TASKS/` remains the task fact layer.
- `PROJECT/` remains the project fact layer.
- `MEMORY/` remains long-term decision and lesson memory.
- `LANES/` stores session registration, lane worklogs, messages, resume packets, and handoffs.
- `PROJECT/AGENT_LANES.md` is a rendered view; `LANES/registry/lanes.json` is the source of truth.
- `PROJECT/ACTIVITY.md` is a human-readable event view; `LANES/registry/events.jsonl` is append-only event evidence.
- Cross-lane code writes require a planner-approved task scope or an explicit handoff; specialist lanes must not create overlapping ownership by convenience.

## Acceptance

Automation, dispatch, and lanes must not bypass `task-accept`. A task can reach `AWAITING_USER` only after execution evidence, adversarial review PASS, validation evidence, and document impact resolution.

Use `task_transition.py prepare-awaiting-user` for the checked transition into `AWAITING_USER`. Use `task_transition.py reopen` to move an unaccepted task to `NEEDS_REVISION` with a recorded recovery entry.
