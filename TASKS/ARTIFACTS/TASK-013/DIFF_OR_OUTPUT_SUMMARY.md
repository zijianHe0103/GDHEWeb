# TASK-013 Diff and Output Summary

generated_at: `2026-07-29T15:11:49Z`

## 1. Primary outputs

| Output | Purpose |
|---|---|
| `IA_AND_PAGE_TYPE_MAP.md` | English navigation, Mega Menu, page types, hierarchy and identity |
| `URL_AND_CANONICAL_CONTRACT.md` | Route map, slug/canonical, redirects and origin gap |
| `CTA_CONTRACT.md` | Active/discontinued CTA, RFQ lines and unresolved Article behavior |
| `PRODUCT_CARD_PROJECTION.md` | Target closed normalized card projection and one-request invariant |
| `SEO_MINIMUM_CONTRACT.md` | English SeoDocument, robots/status/Breadcrumb/OG/JSON-LD boundary |
| `VERTICAL_SLICE_CANDIDATES.md` | Three user-confirmed local test candidates and gaps |
| `GAP_REPORT.md` | Machine-contract, content, data, deployment and multilingual gaps |

## 2. Supporting evidence

- Three specialist read-only audits and six controlled done messages.
- A2 and A3 checkpoints.
- Nine decision records.
- Execution report and validation log.
- Architecture contract TASK-013 freeze summary.

## 3. Governance/task changes

- TASK-012 moved from active to archive as part of TASK-013 intake.
- TASK-013 registered on its own task branch.
- State/Board/Activity/Lane worklogs track A1, A2, user-decision pauses and A3.
- No task acceptance or Git delivery has occurred.

## 4. Product/runtime diff

Zero TASK-013 implementation changes to frontend, CMS, database, dependency, environment, external system or deployed site.

## 5. Important final correction

The A2 audit’s provisional `PUBLIC_NO_QUOTABLE_VARIANT` question is resolved by the user:

- an active product successfully synchronized and publicly published in WordPress remains Request-a-Quote capable;
- complete public specs or a unique Article Number are not preconditions;
- unresolved details are completed by business staff in Feishu;
- frontend/API cannot guess.

## 6. Round 1 review correction

- ProductCard discontinued behavior is now deterministic.
- Detail-capable products always enter their retained canonical detail, independent of lifecycle.
- A discontinued detail page presents replacement contact as its primary CTA.
- A discontinued no-detail catalog accessory goes directly to replacement contact and never receives a fabricated detail URL.
- Active-task validation and review-state text now reflects Round 1 and the recovery validation.

This correction changes documentation only.
