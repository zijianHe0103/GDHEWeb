# TASK-005 planner summary

Date: 2026-07-23
Lane: `planner`

## Outcome

TASK-005 updated the single authoritative implementation roadmap and froze two separate future implementation boundaries without implementing product code:

1. Task A: English API/DTO/Fixture work owned by the WordPress/GDHE normalization side.
2. Task B: Next.js English CMS consumption owned by a server-only frontend adapter.

Task A is delivered in two controlled batches: A1 for Schema and migration foundation, then A2 for public API, fixtures and immutable handoff. A1 does not authorize frontend consumption. Task B remains blocked until A2 final independent review passes and planner identifies the exact contract version, fixture revision and checksums.

## Requirement coverage

- Canonical roadmap section 14 records TASK-001 through TASK-004 completion and the remaining English-site, SEO, inquiry, Preview/Webhook/cache, multilingual and release stages.
- API boundary covers versioned DTOs, stable module IDs and versions, structured `data_table`, minimum endpoints, Home/Service/Case Study/Material fixtures, publication and reference negatives, compatibility, migration, rollback, benchmark and cleanup.
- Frontend boundary covers server-only transport, runtime validation, adapters/types, authoritative 404 separation, secret/browser isolation, dedup/cache interfaces and a technical live E2E.
- REST-first remains unchanged; WPGraphQL still requires the accepted quantitative PoC trigger and a new ADR.
- English SEO remains separate from the nine-language rollout. WPML/ACFML remains deferred until the production English site has been stable for three monitored months.

## Review

- Round 1: `FAIL`, P0=0, P1=0, P2=1; technical design passed, current-state metadata required correction.
- Round 2: final `FAIL`, P0=0, P1=0, P2=1; two stale current-state lines remained.
- User-authorized closure review: canonical `PASS`, P0=0, P1=0, P2=0; Round 1 and Round 2 history is preserved.

The closure reviewer independently reproduced the expanded stale scan, confirmed current task/project/board consistency, verified accepted decisions were not changed, preserved the A1/A2 gate and found no product/runtime scope change.

## Scope and document impact

- `frontend/**`: unchanged.
- `cms/**`: unchanged.
- `.local/**` and WordPress/database/plugin/content/user runtime: unchanged.
- No API, DTO, Fixture, CMS integration, page, SEO, multilingual, Preview, Webhook, inquiry or deployment implementation occurred.
- Documentation impact is `RESOLVED`: architecture, ADR status metadata, project/task state, execution/validation/diff evidence and review history are synchronized.

## Git and acceptance boundary

- Branch: `codex/TASK-005-roadmap-api-integration-boundaries`.
- Git remains `DIRTY`; no TASK-005 commit, push, merge, PR, deployment, acceptance or closure has occurred.
- Closure PASS and planner validation do not equal user acceptance.
- After checked `prepare-awaiting-user`, the only formal acceptance instruction is `确认 TASK-005 完成并生成正式提交`.
