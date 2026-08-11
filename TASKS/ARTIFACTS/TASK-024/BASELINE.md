# TASK-024 A0 Protected Baseline

captured_at: 2026-08-10T02:45:44Z
branch: codex/TASK-024-rfq-submission-contract
base_commit: 89da6ca2b948a881cd3d1ecfc4454d568363aa08
origin_main: 89da6ca2b948a881cd3d1ecfc4454d568363aa08

## Purpose

This baseline protects the already delivered Quote Basket, QuoteLine, Product Configuration, visible request route, WordPress Product Configuration authority, dependencies and current architecture text while TASK-024 freezes a documentation-only RFQ submission contract.

TASK-024 does not authorize modifications to these runtime or contract files. The architecture contract and ADR-006 are protected at A0 so every later documentation change can be disclosed exactly and traced to the confirmed RFQ decision set.

## Protected inventory

`BASELINE_CHECKSUMS.sha256` contains 20 repository-relative regular files:

- three project/architecture documents;
- `package.json` and `package-lock.json`;
- Quote Basket 2.0, QuoteLine 2.0 and Product Configuration 2.0 Schemas;
- Quote Basket public types, domain/storage, route and component seams;
- Product Configuration server loader/Adapter and QuoteLine builder;
- WordPress plugin entry, Product Configuration v2 implementation and authoritative Schemas.

## Existing dirty-worktree exclusions

The following pre-existing or user-owned changes remain outside TASK-024 and must not be normalized, staged, deleted or attributed to this task:

- `.codex/config.toml`;
- `frontend/tsconfig.json`;
- TASK-021, TASK-022 and TASK-023 post-delivery closure edits;
- historical planner and adversarial-reviewer resume packets.

TASK-024 may add or edit only its active task, artifacts, Planner-owned current state/activity/board/worklog/events, and later the explicitly authorized architecture/decision documents.

## Baseline verification

- current branch and both base refs were checked before capture;
- all 20 listed files were present and hashed with SHA-256;
- `git diff --check` passed before and after the READY transition;
- DPG project, lane registry, controlled messages and strict lane validation passed with zero strict-lane issues;
- no frontend/CMS runtime, dependency, database, Feishu or external-system mutation was performed.

## Next gate

Freeze customer-contact fields one decision at a time. No lane execution dispatch or product mutation is allowed until the user-confirmed field and security decisions are recorded.
