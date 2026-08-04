# TASK-021 WordPress CMS A2 Dispatch

## Authority

User confirmed TASK-021 with exact phrase. This dispatch authorizes only the WordPress/CMS Product Configuration 2.0.0 authority and handoff phase defined below.

Read in order:

1. `AGENTS.md`;
2. `TASKS/ACTIVE/TASK-021-track-length-color-configuration.md`;
3. `TASKS/ARTIFACTS/TASK-021/REQUIREMENTS.md`;
4. `TASKS/ARTIFACTS/TASK-021/DESIGN.md`;
5. `TASKS/ARTIFACTS/TASK-021/IMPLEMENTATION_PLAN.md`;
6. `TASKS/ARTIFACTS/TASK-021/BASELINE.md`;
7. TASK-019 WordPress Product Configuration implementation and frozen handoff;
8. current `cms/wp-content/plugins/gdhe-site/**` and `docs/cms/**`.

## Required implementation

Use strict TDD. Record the exact RED before production code and the minimum GREEN.

1. Add Product Configuration Document 2.0.0 as a separate closed Draft 2020-12 authority. Do not modify any v1 Schema, Golden, error sample, checksum or handoff byte.
2. Keep the existing anonymous read-only `/wp-json/gdhe/v1/product-configurations` endpoint. Add exact `schema=2.0.0` behavior; exact v1 behavior must remain available and unchanged.
3. V2 root keeps product identity, Article Number options, packaging and custom-length policy. It excludes `installationMethods`, installation accessory references and every hidden installation default.
4. Preserve global Article Number uniqueness and stable product aggregate identity. Add fail-closed same-product uniqueness for normalized `(lengthMeters, color.code)` -> exactly one Article Number. Distinct stable products may share the same length/color.
5. Current removable FGD X15+PVC success must remain exactly one real option: `GDHEPRD000172 / 6 m / Ivory White / piece`. Do not add 4.3 m, 7 m or any guessed accessory.
6. Prove normalized errors, no-store failures, ETag/304, deterministic ordering, two different WordPress database-ID lifecycles, exact cleanup and zero TASK-021/TASK-019/TASK-014/A3 residue.
7. Produce a closed versioned frontend handoff with Schema, one success, required errors, manifest/checksums and machine-verifiable source paths. Do not copy it into frontend; Planner must checkpoint first.
8. Update only required CMS documentation and TASK-021 WordPress execution evidence.

## Required negative evidence

- missing v2 root Schema/route RED;
- installation field or accessory in v2 rejected;
- same product, same length/color, different Article Numbers excludes the whole document;
- same stable UUID with conflicting product identity excludes the whole document;
- duplicate/global Article Number, guessed length, malformed color/length, internal/private field and unpublished/ineligible candidates fail closed;
- unknown or unsupported schema query is normalized and no-store;
- v1 exact bytes and behavior remain unchanged.

## Allowed writes

- `cms/wp-content/plugins/gdhe-site/**`;
- `docs/cms/**`;
- `TASKS/ARTIFACTS/TASK-021/**` for WordPress deliverables;
- `LANES/wordpress_cms/**`.

## Forbidden writes and actions

- no WordPress Core or SCF mutation;
- no frontend, package/lock, root README, Planner state/task/board or other task artifacts;
- no real Feishu, production product import, permanent business-content mutation or deployment;
- no QuoteLine 2.0.0 implementation (frontend phase owns it);
- no review, acceptance, commit, push or merge;
- do not start frontend or related-products carousel work.

## Required response

Write WordPress RED/GREEN evidence, `WORDPRESS_CMS_EXECUTION_REPORT.md`, validation log, diff/output summary and handoff inventory/checksums. Update wordpress_cms worklog. Then send one controlled `execution_response` linked to the original message. Planner will independently validate before frontend is authorized.
