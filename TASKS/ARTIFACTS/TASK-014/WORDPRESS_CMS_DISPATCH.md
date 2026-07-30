# TASK-014 WordPress/CMS Execution Dispatch

message_id: `MSG-TASK-014-WORDPRESS-CMS-IMPLEMENTATION`
lane: `wordpress_cms`
mode: `TDD_IMPLEMENTATION`

## Required reads

1. `TASKS/ACTIVE/TASK-014-product-card-collection-contract.md`
2. `TASKS/ARTIFACTS/TASK-014/DESIGN.md`
3. `TASKS/ARTIFACTS/TASK-014/IMPLEMENTATION_PLAN.md`
4. `TASKS/ARTIFACTS/TASK-013/PRODUCT_CARD_PROJECTION.md`
5. `TASKS/ARTIFACTS/TASK-013/GAP_REPORT.md`
6. current `gdhe-site` source, Schema manifest, A3 tests/Fixture and CMS documentation

## Assignment

Implement only the additive ProductCard collection CMS/API/Schema foundation frozen in `DESIGN.md`.

Required behavior:

- add `GET /wp-json/gdhe/v1/product-cards`;
- add the closed ProductCard Schema 1.0.0 closure;
- preserve Content Schema 3.0.0 and all existing route/Schema behavior;
- use the private versioned source document defined in DESIGN; do not add long-term SCF editor fields;
- derive the four action modes server-side;
- validate eligibility before filtering total/pagination;
- prove 0/1/N, stable sort/filter/total, invalid exclusion and no internal-field leakage;
- create an isolated TASK-014 Fixture lifecycle with exact cleanup;
- update only CMS-owned docs and TASK-014 artifacts within lane scope;
- generate the immutable frontend handoff closure file list and SHA-256.

## TDD gate

Write and run the new tests before production implementation. Record an expected RED caused by the absent route/Schema/implementation. A syntax failure, database outage, false assertion or unrelated legacy failure is not an acceptable RED. Only after valid RED may the minimum implementation be added.

After GREEN, rerun all existing A3 Schema/Golden/runtime checks without modifying their expected behavior.

## Runtime safety

The Planner has already created the immutable pre-Fixture database backup:

```text
.local/backups/TASK-014/20260729T164606Z/database.sql
```

- bytes: `179205`
- SHA-256: `1b9f7def6c333284e324719e3fd43e68a8201100a96a7eba47aa48588635cb98`
- Git ignored: yes
- SQL completion marker: present

Do not modify or overwrite this backup. Before Fixture creation, independently verify its checksum and confirm A3/TASK-014 markers are zero. After all tests, perform exact TASK-014 cleanup and prove A3/TASK-014 options, postmeta, termmeta, temporary posts/terms/media/uploads and migration markers are zero.

## Write boundary

Allowed:

- `cms/wp-content/plugins/gdhe-site/**`
- `docs/cms/**`
- `TASKS/ARTIFACTS/TASK-014/**`
- `LANES/wordpress_cms/**`
- controlled response message files through `lane_message.py`

Forbidden:

- `frontend/**`
- root `README.md`
- `docs/architecture/**`
- Planner-owned Active Task, Project State, Board or registry
- WordPress Core, SCF source, `wp-config.php`, `.env*`, dependencies and lockfiles
- production content/media, Feishu, RFQ, deployment, Git commit/push/merge and acceptance

The backup path is read-only to this lane.

## Stop conditions

Stop and send a blocked response if implementation requires:

- long-term SCF editing fields;
- changed real product/model/Article Number identity;
- breaking changes to Schema 3 or existing routes;
- production data, frontend code, external services or guessed public values;
- a broad database restore or non-exact cleanup.

## Expected artifacts

- `TASKS/ARTIFACTS/TASK-014/TDD_RED_EVIDENCE.md`
- `TASKS/ARTIFACTS/TASK-014/WORDPRESS_CMS_EXECUTION_REPORT.md`
- `TASKS/ARTIFACTS/TASK-014/TEST_OR_VALIDATION_LOG.md`
- `TASKS/ARTIFACTS/TASK-014/DIFF_OR_OUTPUT_SUMMARY.md`
- `TASKS/ARTIFACTS/TASK-014/PRODUCT_CARD_HANDOFF.md`
- Schema graph/checksum and Golden/negative machine evidence
- updated `LANES/wordpress_cms/worklog.md`

## Completion protocol

Run lane-scope and governance validation, then send one controlled `execution_response` linked to `MSG-TASK-014-WORDPRESS-CMS-IMPLEMENTATION`. Do not start frontend audit or adversarial review.
