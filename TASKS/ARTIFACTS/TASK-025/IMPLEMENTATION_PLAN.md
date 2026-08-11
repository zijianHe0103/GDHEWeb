# TASK-025 Implementation Plan

## A0 — Planner design and baseline

- Freeze requirements, versions, endpoint, storage migration, TDD seams, protected bytes and sequential lane scopes.
- Verify no product code changed during A0.

## A1 — WordPress foundations

- Add independent Schemas and request/error samples.
- Add private accessory source and public Article Number index normalization.
- Add RelatedProductCard 2.0 version dispatch while preserving 1.0 bytes.
- Checkpoint before mixed batch runtime.

## A2 — WordPress mixed batch runtime

- Add anonymous no-store POST route and exact body boundary.
- Resolve configured standard/refresh/custom and catalog accessory lines atomically.
- Prove 1/50, ordering, conflicts, bounded queries, zero public subrequests, deterministic Fixture lifecycle and rollback.
- Freeze CMS handoff; stop for Planner checkpoint.

## A3 — Frontend contract foundation

- Copy only the final CMS closure and bind an offline verifier/checksum manifest.
- Add server-only Transport, Runtime Validator, Adapter and one-call orchestration.
- Stop for Planner checkpoint.

## A4 — Quote Basket 3.0 and browser flows

- Add independent Schema/domain/storage/migration.
- Carry Article Number from Product Configuration and RelatedProductCard into new lines.
- Keep migrated standard lines recoverable and migrated accessory lines explicitly `requires_readd`.
- Prove Article Number exists in browser data but is absent from visible/accessibility output.
- Stop for Planner checkpoint; no final RFQ submission.

## A5 — Review and closure preparation

- Run full CMS/frontend regressions, documentation/protected-scope checks and independent adversarial review.
- Resolve P0/P1/P2 through the configured maximum two review rounds.
- Planner runs fresh validation and checked `prepare-awaiting-user`; user acceptance remains separate.
