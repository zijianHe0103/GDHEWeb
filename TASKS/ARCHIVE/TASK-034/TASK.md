# Task: Freeze the First Public Product Vertical-Flow Contract

task_id: TASK-034
status: CLOSED
risk_level: MEDIUM
assigned_lanes: ["planner"]
acceptance_state: ACCEPTED
blocker_ref: NONE
next_action: Define and confirm TASK-035 before any physical design or implementation.
contract_refs: ["project_contract", "architecture_contract", "product_master_logical_model", "public_product_flow_contract"]
delivery_state: NOT_REQUESTED
closed_at: 2026-08-25T09:05:41Z

## Original Request

Formally save the already confirmed TASK-034 business boundaries for the first GDHE public product vertical flow: Catalog to WordPress, Core Publication to Next.js, and Next.js to RFQ. Record system responsibilities and public/internal data boundaries without implementing APIs, databases, plugins, pages, RFQ code, migrations, authentication, or deployment.

## Confirmed Understanding

The first phase serves the current GDHE website. A WordPress product page binds one Primary Core Product ID; WordPress owns marketing presentation and publication, while Catalog owns product facts. Core Application combines a published page version with current public Catalog facts into a versioned public page view consumed by Next.js. Public RFQ records the customer's original Product, color, length, quantity, and commercial requirements without weight, Product Spec, or Article Number resolution. Server validation and trusted snapshots belong to Core Application; later sales-confirmed specifications remain separate from the original RFQ.

## Goal and Non-Goals

Goal: create one durable, Manifest-routed domain authority for the three system boundaries, add only concise long-term rules to the Project Contract, and remove the conflicting legacy Headless WordPress document from current architecture authority without deleting it.

Non-goals: no final API paths or field names, OpenAPI, PostgreSQL design, ORM, migration, WordPress plugin or Gutenberg Schema, Next.js component, RFQ contract/code/database change, authentication, deployment, CRM, ERP, Feishu, or deletion of existing behavior.

## Authorized Scope

- `PROJECT/MANIFEST.md`
- `PROJECT/CONTRACT.md`
- `PROJECT/STATE.md`
- `PROJECT/events.jsonl`
- `docs/architecture/PUBLIC_PRODUCT_FLOW_CONTRACT.md`
- authority-status notice in the historical Headless WordPress architecture document
- TASK-034/TASK-035 governance records

All business code, dependencies, databases, runtime configuration, WordPress data flow, RFQ contracts, and unrelated dirty changes are forbidden.

## Acceptance Criteria

1. `PROJECT/CONTRACT.md` contains concise boundaries for stable Product binding, Catalog/WordPress responsibilities, Core publication composition, Next.js Core Public API access, raw RFQ semantics, server validation, and separate sales-confirmed data.
2. `docs/architecture/PUBLIC_PRODUCT_FLOW_CONTRACT.md` records the complete Catalog → WordPress, Core Publication → Next.js, and Next.js → RFQ logical contracts while labeling physical design as pending.
3. Manifest adds semantic `public_product_flow_contract` routing and retains the semantic `product_master_logical_model` route; no task-number route is added.
4. `architecture_contract` no longer points at the conflicting historical Headless WordPress contract. The old document is retained and clearly marked historical/superseded.
5. TASK-034 is recorded as documentation-only and, after the user's stated acceptance, archived `CLOSED / ACCEPTED`; TASK-035 is only a `DRAFT` next-task placeholder for later physical-design discussion.
6. Manifest JSON parsing, DPG full validation, required-content assertions, changed-path scope, and `git diff --check` pass.
7. No code, dependency, database, runtime configuration, WordPress data flow, RFQ contract, migration, deployment, or unrelated user change is modified.

## Accepted Contract Summary

- WordPress pages bind one stable Primary Core Product ID and consume a controlled Catalog CMS projection.
- Catalog owns Product facts, public configurations, legal relations, and baseline technical assets; WordPress owns marketing content, presentation, SEO, media composition, drafts, revisions, and publication.
- Core Application combines a published page version with current public Catalog facts into the Published Product Page View.
- Production Next.js reads only the Core Public API and does not consume WordPress or internal database structures directly.
- Public RFQ preserves Product, color, length, quantity, Commercial Requirements, and server-generated snapshots without weight, Product Spec, or Article Number.
- Original RFQ and later sales-confirmed Product Spec, Article Number, and quotation data are separate records.
- Existing Product Detail, Product Configuration, Quote Basket, RFQ, WordPress, and Article Number code remain migration assets until a later replacement is designed and accepted.

## Validation and Acceptance Evidence

- Manifest JSON parsed successfully and all three semantic architecture routes resolve to existing authorities.
- DPG full validation passed with zero findings after removing the conflicting legacy architecture route.
- The old Headless WordPress contract is retained and marked `SUPERSEDED / HISTORICAL`.
- Required three-flow content assertions and `git diff --check` passed.
- The user stated TASK-034 was already confirmed complete and explicitly required local `CLOSED / ACCEPTED` documentation capture.
- No Git delivery, implementation, database, dependency, deployment, or external-system action is claimed.
