# TASK-019 WordPress/CMS Execution Dispatch

message_id: `MSG-TASK-019-WORDPRESS-PRODUCT-CONFIGURATION`
lane: `wordpress_cms`
mode: `SERIAL_TDD_AUTHORITY_IMPLEMENTATION`

## Required reads

1. `TASKS/ACTIVE/TASK-019-product-configuration-quote-line-contract.md`
2. `TASKS/ARTIFACTS/TASK-019/REQUIREMENTS.md`
3. `TASKS/ARTIFACTS/TASK-019/DESIGN.md`
4. `TASKS/ARTIFACTS/TASK-019/IMPLEMENTATION_PLAN.md`
5. `TASKS/ARTIFACTS/TASK-019/BASELINE_VALIDATION.md`
6. `TASKS/ARTIFACTS/TASK-019/PROTECTED_BASELINE.md`
7. `MEMORY/DECISIONS/ADR-006-product-first-roadmap-and-multilingual-maturity-gate.md`
8. current GDHE Site ProductCard/A3 implementation, tests and `docs/cms/**`

Read and ACK the exact controlled message before any implementation edit.

## Assignment

Implement only the additive WordPress-owned
`ProductConfigurationDocument 1.0.0` authority frozen in DESIGN:

- anonymous read-only
  `GET /wp-json/gdhe/v1/product-configurations`;
- exact closed query: `locale=en`, `schema=1.0.0`, required canonical `path`;
- independent exact four-file Draft 2020-12 closure;
- private `_gdhe_product_configuration_v1_source` mirror input;
- strict complete-candidate eligibility and public-field allowlist;
- deterministic `200`, strong ETag, public max-age 60 and bodyless `304`;
- normalized closed no-store error responses;
- isolated TASK-019 local Fixture, Goldens, negatives, two-lifecycle
  determinism, exact cleanup and authority handoff;
- CMS documentation and lane-owned TASK-019 execution evidence.

Bump only the GDHE-owned plugin release needed for this additive contract
(`0.6.0`). Keep Content Schema `3.0.0`, ProductCard Schema `1.0.0` and every
existing endpoint/version unchanged. `schema.v3.json` may receive only the
designed additive Product Configuration registration keys.

## FGD X15+PVC truth set

The sole valid standard option is:

- product model `FGD X15+PVC`;
- English name `FGD X15+PVC Track`;
- canonical `/products/fgd-x15-pvc/`;
- Article Number `GDHEPRD000172`;
- `6 m`;
- `Ivory White`;
- unit `piece`.

Do not emit 4.3 m, 5.8 m, 6.7 m or any other unconfirmed standard length.
Ceiling and wall installation do not change the track Article Number. Both
optional accessory references are currently null; never create a placeholder
bracket Article Number.

Track packaging is exactly:

- one required base option from
  `standard|carton|large_shrink_wrap`;
- independent `logoPrinting`;
- nullable protection arrangement from `single_bag|paired`, never both;
- scope `curtain_track`.

Custom length is enabled, positive, at most one decimal place and explicitly
resolved by sales follow-up without an Article Number.

## TDD gate

Before production implementation:

1. add only focused tests for the absent root Schema and absent route;
2. run them against the healthy WordPress runtime on `127.0.0.1:3307`;
3. record a valid capability RED caused only by the missing TASK-019 contract;
4. add the minimum production implementation only after that RED.

A command-sandbox local-TCP denial is an environment limitation, not a valid
RED and not proof that MySQL is stopped. Do not start the unrelated default
3306 instance.

Add focused negatives before their corresponding GREEN behavior:

- unknown query keys, invalid locale/schema/path and missing path;
- duplicate Article Number or duplicate normalized public choice;
- guessed extra standard length or accessory;
- source/product identity mismatch;
- unpublished, ineligible or malformed sources;
- illegal installation/packaging/custom-length policy;
- internal/raw field leakage.

## Fixture and rollback safety

The Planner-created immutable pre-Fixture backup is:

```text
.local/backups/TASK-019/20260731T090821Z/database.sql
```

- bytes: `179430`
- SHA-256:
  `2cdcecce2e81fdc8c0be6864621a198270f7b25e7c26f1d30129a489036e6df2`
- completion marker: present
- Git ignored: yes

Read and verify it; do not modify or overwrite it. Before Fixture creation,
prove A3, TASK-014 and TASK-019 markers are zero. After every lifecycle, delete
only manifest/marker-owned TASK-019 records and prove posts, postmeta, options,
terms, termmeta, uploads and migration markers are zero.

Two full lifecycles must use different WordPress internal IDs and produce
identical public Golden hashes.

## Public and internal boundary

The response must not contain WordPress IDs, Core REST records, raw SCF/meta,
Feishu record IDs, supplier information, cost, purchase price, internal sales
floor, profit, stock, customer pricing, internal notes, audit records,
credentials or diagnostics.

WordPress must not accept, store or mutate QuoteLine. Do not add a QuoteLine
CPT, SCF field group, REST write route, session, basket or inquiry record.

## Write boundary

Allowed:

- `cms/wp-content/plugins/gdhe-site/**` for this independent contract only;
- `docs/cms/**`;
- `TASKS/ARTIFACTS/TASK-019/**`;
- `LANES/wordpress_cms/**`;
- controlled response messages through `lane_message.py`.

Forbidden:

- `frontend/**` and root `README.md`;
- existing Content Schema 3 files except the explicit additive
  `schema.v3.json` registration;
- existing ProductCard contract, Fixture, Golden, handoff or behavior;
- Planner-owned active task, Project State, Board, lane registry or policy;
- WordPress Core, SCF source, themes, `wp-config.php`, dependencies and
  lockfiles;
- real WordPress product content, users, media or production data;
- real Feishu, external services, RFQ submission, Preview, Webhook/cache,
  multilingual, deployment and Git delivery.

You are not alone in the shared worktree. Preserve Planner changes,
user-owned `.codex/config.toml`, historical resume packets and other lanes'
work. Do not revert or reformat adjacent files.

## Required evidence

- `TDD_RED_EVIDENCE.md`
- `WORDPRESS_CMS_EXECUTION_REPORT.md`
- `TEST_OR_VALIDATION_LOG.md`
- `DIFF_OR_OUTPUT_SUMMARY.md`
- `PRODUCT_CONFIGURATION_HANDOFF.md`
- exact handoff manifest/checksums;
- runtime, Schema, error, exclusion and determinism JSON evidence;
- `golden-product-configuration/**`;
- updated `LANES/wordpress_cms/worklog.md`.

Validation must include focused TASK-019 tests, two Fixture lifecycles, empty
post-cleanup route, A3 and ProductCard regressions, PHP/JSON, Core/SCF/database,
protected hashes, scope, `git diff --check` and DPG gates.

## Stop conditions

Stop with a controlled blocked response instead of guessing if the work
requires:

- another Article Number, length, color or mounting accessory fact;
- changing the frozen authority split or packaging/custom-length rule;
- changing an existing public contract or frontend code;
- SCF editor fields, production content, real Feishu or a broad DB restore;
- writing outside the lane scope.

## Completion protocol

After exact cleanup and complete validation, send one controlled
`execution_response` linked to
`MSG-TASK-019-WORDPRESS-PRODUCT-CONFIGURATION`. Do not start the frontend
snapshot/QuoteLine phase, review, acceptance, Git delivery or deployment.
