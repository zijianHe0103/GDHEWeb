# TASK-028 Frontend Visual Round 1 Narrow Revision Dispatch

message_id: MSG-TASK-028-FRONTEND-VISUAL-R1-REVISION
scope: close only Visual QA Round 1 S1/O1/O2 before one narrow visual retest

## Required reads

- `TASKS/ACTIVE/TASK-028-customer-rfq-form.md`;
- `TASKS/ARTIFACTS/TASK-028/VISUAL_QA_REPORT.md`;
- `QA/TASK-028/VISUAL_QA_REPORT.md` and `QA/TASK-028/BROWSER_INTERACTION_LOG.md`;
- current TASK-028 customer domain, submission client, form presentation and their direct tests.

## Frozen history

- Visual QA Round 1 remains `FAIL / severe 1 / obvious 2 / detail 0`;
- A0-A5 Planner checkpoints remain PASS;
- no complete adversarial review has started;
- the existing customer fields, Basket, RFQ contracts, local-only runtime and production final-404 boundary remain unchanged.

## Exact revision scope

Use strict focused RED/GREEN for exactly these three findings.

### S1 — canonical same-origin POST paths

1. Change the browser submission client to call exactly `/api/rfq/intent` and `/api/rfq/intake`, without trailing slash.
2. Preserve `redirect: "error"`, same-origin behavior, one intent POST then one intake POST, pending duplicate suppression, replay behavior and every server-side gate.
3. Update only directly affected expectations and prove no 308-dependent behavior, no legacy/per-line request and no external request.

### O1 — complete empty-form repair guidance

1. Configure the existing customer Schema validation to collect the full closed error set, including all four required fields and the one contact-group error on an empty submission.
2. Preserve the existing stable sanitized error codes, deterministic field order/deduplication, focus transfer, `aria-invalid`, `aria-describedby` and zero raw Ajv/internal diagnostic exposure.
3. Add direct customer-domain and rendered-form regressions for the exact five customer-facing repair errors.

### O2 — truthful local Privacy Policy target

1. Add one visible, focusable `Privacy Policy` link before `Submit Request`.
2. Its target must be an actual same-page local customer-safe policy section, using a stable fragment such as `#rfq-privacy-policy`; it must not make an external request or claim that a final production legal policy has been approved.
3. The target section must truthfully explain only the current local test boundary: submitted contact and RFQ details are processed by the local non-production Stub for this test, are not sent to Feishu/CRM/email, and are not durable production storage.
4. Preserve the ten-field order and all existing form/layout semantics. Add direct markup, keyboard/focus and leakage checks.

## Required validation

- direct RED/GREEN evidence for S1, O1 and O2;
- focused customer/submission/form/RFQ tests;
- complete resource-safe current test inventory;
- all ten existing verifiers, lint, typecheck and Next production build;
- existing Quote Basket and RFQ production smokes, including unset/disabled/production final 404;
- A0 protected hashes with only the exact authorized TASK-028 differences;
- production `next-env.d.ts`, zero `.next`/TypeScript cache/listener/temp-root residue, `git diff --check` and DPG project/messages/strict-lane gates.

## Required artifacts

- `FRONTEND_VISUAL_R1_REVISION_TDD_RED.md`;
- `FRONTEND_VISUAL_R1_REVISION_REPORT.md`;
- `FRONTEND_VISUAL_R1_REVISION_VALIDATION_LOG.md`;
- `FRONTEND_VISUAL_R1_REVISION_DIFF_SUMMARY.md`;
- updated frontend worklog and one linked `execution_response`.

## Forbidden

- no unrelated visual redesign, CSS cleanup or field/contract change;
- no new production Privacy Policy route or unapproved legal claim;
- no CMS, database, CRM/Feishu/email, dependency, external service or deployment change;
- no Visual QA execution, complete adversarial review, acceptance, commit, push or merge.

## Stop gate

Stop after the linked response for an independent Planner checkpoint. Planner will then restart the accepted-sink runtime and request one narrow Visual QA Round 2 covering the complete accepted-first and processing-second state matrix. The unique complete adversarial review remains blocked until Visual QA PASS.
