# TASK-005 Roadmap and boundary synthesis

Date: 2026-07-23

## Decision

The accepted architecture contract remains the single implementation-roadmap authority. TASK-005 updates its section 14 instead of creating a second competing roadmap.

The next product work is split into two independently confirmed and reviewed tasks:

1. **Task A — English API/DTO/Fixture implementation**
2. **Task B — Next.js English CMS integration**

Task B may review interfaces early, but it cannot formally implement consumption until Task A passes its handoff gate.

## Verified progress

| Foundation | State | What it proves | What it does not prove |
| --- | --- | --- | --- |
| TASK-001 | accepted and pushed | Repository and remote governance baseline | Product implementation |
| TASK-002 | accepted and pushed | Headless WordPress + Next.js, REST-first and responsibility contract | Runtime implementation |
| TASK-003 | accepted and pushed | Minimal Next.js App Router/TypeScript foundation | CMS consumption or public pages |
| TASK-004 | accepted and pushed | English CMS/SCF content foundation, controlled REST projection and Schema 1.0.0 | Final DTO, route resolution or frontend integration |
| TASK-005 | Round 1 narrow revision | Roadmap and two future-task boundaries | API or frontend product code |

## Dependency

```text
WordPress Core + SCF
        ↓
Task A: GDHE normalization, visibility and versioned public DTO
        ↓ reviewed schema + fixtures + checksums + cleanup proof
Task B: server-only Next.js validation and adapter
        ↓
technical server-rendered integration proof
        ↓
global shell → homepage batches → page templates
```

Raw WordPress, Core REST, SCF, post meta and plugin configuration are not frontend contracts.

## Task A freeze

Task A owns:

- versioned page, error, collection, navigation, route-manifest and module schemas;
- stable module instance IDs and per-module schema versions;
- structured `data_table` migration and validation;
- the minimum reviewed `resolve`, `collection`, `navigation` and `route-manifest` endpoints;
- Home, Service, Case Study and Material fixtures;
- published/unpublished, route, relationship, media, module, table and error negative tests;
- compatibility, migration, rollback, benchmark and zero-residue evidence;
- an immutable frontend handoff bundle with schema checksums and fixture revision.

Task A does not own Next.js pages, components, visual design, Preview, Webhook, multilingual, SEO, inquiry or deployment.

Task A should be executed as two controlled batches without weakening its single final handoff gate:

1. **A1 — Schema and migration foundation:** freeze page/error/module schemas, persistent module IDs and versions, structured `data_table`, dry-run, idempotence, ambiguity handling and isolated rollback.
2. **A2 — Public API, fixtures and handoff:** implement minimum endpoints, four fixtures, contract/error matrices, benchmark, cleanup and the immutable consumer bundle.

A1 is only an intermediate checkpoint. Task B remains blocked until A2 passes final independent review and planner identifies the exact contract version, fixture revision and checksums.

## Task B freeze

Task B owns:

- a server-only REST transport with allowlisted origin/path and bounded timeout;
- runtime validation and frontend-owned adapters/types;
- distinct authoritative 404, transport, protocol, rate-limit and contract-incompatibility behavior;
- browser/secret isolation;
- request deduplication and deterministic cache-tag interfaces;
- a deliberately technical production-server E2E using the reviewed fixture;
- validator, adapter, transport, route, isolation, contract and live E2E tests.

Task B does not own WordPress data mutation, raw SCF normalization, formal homepage/global shell, Preview, Webhook/cache invalidation, multilingual, SEO or deployment.

## Task A to Task B handoff gate

Formal frontend consumption is blocked until all of the following pass:

- public DTO and error schemas are frozen and machine-readable;
- stable module IDs and per-module versions are persisted and validated;
- structured `data_table` is migrated and validated;
- four representative fixtures and canonical samples are versioned;
- publish/draft/private/404/reference/error negatives pass;
- compatibility, migration, rollback, benchmark and cleanup evidence exists;
- independent Task A review passes with no consumed-field ambiguity;
- planner identifies the exact contract version, fixture revision and checksums for Task B.

Unknown required versions and invalid required fields fail closed. Neither side may silently coerce them.

## Deferred gates

- Preview/Draft Mode requires a separate authentication, expiry, replay and secret-rotation task.
- Webhook/cache invalidation requires a separate signed-event, idempotency, tag-cascade, retry and recovery task.
- English SEO is separate from multilingual rollout.
- WPML/ACFML remains deferred until the production English site has been stable for three monitored months.
- WPGraphQL remains excluded unless the accepted quantitative REST benchmark trigger requires a PoC and new ADR.

## Evidence

- `TASKS/ARTIFACTS/TASK-005/API_DTO_FIXTURE_BOUNDARY.md`
- `TASKS/ARTIFACTS/TASK-005/FRONTEND_INTEGRATION_BOUNDARY.md`
- `docs/architecture/headless-wordpress-nextjs-contract.md`, section 14
- `TASKS/ARTIFACTS/TASK-004/ADVERSARIAL_REVIEW_REPORT.md`
- `TASKS/ARTIFACTS/TASK-004/PLANNER_VALIDATION_SUMMARY.md`
- `MEMORY/DECISIONS/ADR-004-headless-wordpress-nextjs-contract.md`
- `MEMORY/DECISIONS/ADR-005-english-first-scf-wpml-deferral.md`
