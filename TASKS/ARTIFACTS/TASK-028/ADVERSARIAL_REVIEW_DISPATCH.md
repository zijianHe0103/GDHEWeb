# TASK-028 Unique Complete Adversarial Review Dispatch

message_id: `MSG-TASK-028-ADVERSARIAL-REVIEW-R1`

## Review authority

Perform the one and only complete independent read-only adversarial review for confirmed TASK-028. Read the active task, requirements/design/TDD artifacts, A1-A5 Planner checkpoints, current product/tests/docs, `PRE_REVIEW_VALIDATION.md`, canonical `VISUAL_QA_REPORT.md`, overflow closure dispatch/evidence and current Git diff.

The user explicitly requires only one complete review. If this review returns FAIL, no second complete review is authorized: after bounded repairs, the same reviewer may inspect only the original findings in one bounded closure.

## Required review coverage

1. Frozen customer fields, optionality, required/contact rules, Unicode/length/email/HTTP(S) website validation and closed unknown-field behavior.
2. Quote Basket 3.0 ready/non-ready gating, Article Number browser boundary, exact Basket snapshot token/clear behavior and whole-Basket retain-on-change semantics.
3. Local 30-minute intent authenticity and ordering, one intent plus one intake, replay precedence, pending duplicate suppression, processing/no-auto-retry and explicit retry behavior.
4. Closed public response/error semantics, sanitized diagnostics and no secret/HMAC/key/token/UUID/internal field leakage in browser, visible/accessible text, receipt/error or logs.
5. Local-only mode gate and production/unset/disabled final 404; no production persistence, CMS/CRM/Feishu/email/external-security/deployment overclaim.
6. Server-only boundaries and hostile unknown/Proxy safety across the new customer, intent, submission, Route and accepted-clear seams.
7. Form semantics, labels, autocomplete/inputmode, complete five-error repair set, focus transfer, keyboard order, aria associations/live regions, pending disabled state and explicit retry.
8. Responsive/visual evidence at 1440/1024/768/390/320, including the preserved Round 1/Round 2 FAIL history and bounded overflow PASS without rewriting history.
9. Contracts/verifiers/tests/docs/protected hashes/generated cleanup/scope/governance evidence and any mismatch between claims and current bytes.
10. Review for concrete P0/P1/P2 findings only; do not request speculative production features that are explicitly out of TASK-028 scope.

## Output and restrictions

- Write only the canonical `TASKS/ARTIFACTS/TASK-028/ADVERSARIAL_REVIEW_REPORT.md` and adversarial reviewer lane records/messages.
- Return exactly one linked verdict `PASS` or `FAIL` with P0/P1/P2 counts and precise reproducible evidence.
- Do not edit frontend, tests, docs, task/Planner authority, visual evidence, CMS/database, dependencies, Git, deployment or external systems.
- `PASS` is not acceptance or Git/deployment authorization.
