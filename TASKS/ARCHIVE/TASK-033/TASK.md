# Task: Freeze the Product Master Logical Business Model

task_id: TASK-033
status: CLOSED
risk_level: LOW
assigned_lanes: ["planner"]
acceptance_state: ACCEPTED
blocker_ref: NONE
next_action: Define and confirm TASK-034 before any implementation.
contract_refs: ["project_contract", "product_master_logical_model"]
delivery_state: NOT_REQUESTED
closed_at: 2026-08-25T05:31:42Z

## Original Request

Formally save the already confirmed TASK-033 product master conclusions in project authorities. Freeze only the logical business model and long-term boundaries; do not implement a database, API, ERP, migration, or business code.

## Confirmed Understanding

GDHE's public site, future ERP, CRM, and other systems will share one product master domain. The logical model distinguishes `Product`, `Product Spec`, shared dictionaries and allowed configurations, and category-specific engineering specifications. `Article Number` belongs to `Product Spec`. Raw customer RFQ data remains separate from sales-confirmed quotation specifications.

## Goal and Non-Goals

Goal: make the accepted logical model durable and discoverable through the project Manifest, the long-term Contract, and a dedicated architecture authority.

Non-goals: no PostgreSQL physical design, final table/column/type design, migration, ORM choice, API, NestJS or Next.js code, WordPress flow change, RFQ contract change, ERP implementation, or removal of existing behavior.

## Authorized Scope

- `PROJECT/MANIFEST.md`
- `PROJECT/CONTRACT.md`
- `PROJECT/STATE.md`
- `docs/architecture/PRODUCT_MASTER_LOGICAL_MODEL.md`
- TASK-030 pause narration and TASK-033/TASK-034 governance records required to keep the current pointer truthful

## Acceptance Criteria

1. The Contract contains only concise, durable product-master boundaries.
2. The dedicated logical-model authority records Product, Product Spec, shared dictionaries/allowed configurations, category-specific structures, track and tape rules, RFQ/sales/ERP boundaries, WordPress/ERP boundaries, migration-asset treatment, and explicit open physical-design questions.
3. The Manifest routes future sessions to the dedicated authority.
4. TASK-033 is locally recorded as `CLOSED / ACCEPTED`; no Git delivery is claimed or requested.
5. TASK-034 is identified only as the next task number with scope pending confirmation.
6. No business code, dependency, database, API, RFQ contract, or WordPress data flow changes.

## Accepted Logical Decisions

- Unified product master does not mean one universal table.
- `Product` owns the public product/model identity shared across systems.
- `Product Spec` owns the concrete finished-goods identity and `Article Number` without duplicating all Product public fields.
- Allowed configurations and actual Article Number specifications are separate concepts; theoretical combinations are not pre-generated.
- Tracks and tape use distinct category-specific engineering specification structures.
- Track public RFQ exposes color and length; weight is confirmed later by sales, so the raw RFQ does not require Product Spec or Article Number resolution.
- Raw customer RFQ and later sales-confirmed quotation specification are preserved separately.
- WordPress binds Product and owns content presentation; ERP uses Product Spec and Article Number. Neither system is built on the other's tables.
- Existing Product Configuration V2 and RFQ implementation are migration/reference assets, not the new long-term product model, and remain in place until a future replacement is verified.

## Validation and Acceptance Evidence

- User explicitly stated that TASK-033 is confirmed complete and instructed the project to save it as `CLOSED / ACCEPTED`.
- Documentation-only scope was inspected through `git diff`; no runtime or database test is required for a logical-model-only change.
- Manifest JSON, required document sections, Markdown whitespace, scoped changed paths, and absence of business-code changes are the focused acceptance checks.
- No commit, push, merge, deployment, dependency installation, database write, or external-system action is part of this acceptance.

## Next Task

`TASK-034` is the next task identifier. Its business goal, scope, risk, acceptance criteria, physical design decisions, and implementation authorization remain unconfirmed.
