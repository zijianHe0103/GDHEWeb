# TASK-028 Frontend A1 Dispatch

message_id: MSG-TASK-028-FRONTEND-CUSTOMER-DOMAIN-A1
scope: customer public domain, normalization and closed validation only

## Required reads

- `TASKS/ACTIVE/TASK-028-customer-rfq-form.md`
- `TASKS/ARTIFACTS/TASK-028/REQUIREMENTS.md`
- `TASKS/ARTIFACTS/TASK-028/A0_DESIGN.md`
- `TASKS/ARTIFACTS/TASK-028/TDD_SEAMS.md`
- `TASKS/ARTIFACTS/TASK-028/IMPLEMENTATION_PLAN.md`
- `TASKS/ARTIFACTS/TASK-028/A0_PROTECTED_BASELINE.md`
- `TASKS/ARTIFACTS/TASK-028/A0_PROTECTED_CHECKSUMS.sha256`
- the current frontend-local RFQ Submission `2.0.0` Schema snapshot, verifier and testing conventions

## A1 requirements

1. Observe strict TDD. Capture a real direct RED before adding the production customer-domain implementation.
2. Add the minimum client-safe customer input domain and normalized public customer DTO required by the frozen RFQ Submission `2.0.0` `publicCustomer` contract.
3. Support exactly these customer-entered fields and no others:
   - required: Full Name, Company Name, Country/Region and City;
   - individually optional but collectively at least one required: WhatsApp, WeChat, Business Email and Phone;
   - optional: Company Website and Additional Requirements.
4. Normalize with JavaScript trim semantics; omit permitted empty optional values rather than inventing data. Enforce the exact contract bounds, Unicode scalar/code-point rules, email format and absolute HTTP(S) website rule without performing a website request.
5. Return only a closed, stable, customer-safe field-error model. Do not expose raw Ajv errors, exception text, diagnostics, Article Number, internal UUIDs, CRM fields or raw submitted values.
6. Fail closed before coercion for unknown, accessor, symbol, non-enumerable, sparse/non-data or Proxy/hostile reflective inputs. Prove attacker getters and coercion hooks are not invoked and diagnostics do not escape.
7. Keep the implementation reusable by the later visible form, but do not add speculative abstractions or UI in A1.
8. Add focused tests covering required/optional/contact combinations, normalization, exact boundaries, Unicode, invalid email/website, unknown keys and hostile inputs. Every successful normalized DTO must validate against the frozen frontend-local `publicCustomer` Schema.
9. Run the smallest relevant regressions plus RFQ v2 verifier, lint and typecheck under Node `24.18.0`. Preserve all A0 protected bytes and leave no `.next`, TypeScript cache, temporary root or listener.
10. Produce linked RED, execution, validation and diff evidence, update only the frontend lane worklog, send one controlled response to Planner, and stop after A1.

## Forbidden in A1

- no intent/idempotency issuance, HMAC, Basket projection, intake integration, form component, route UI, receipt, error page or Basket clearing;
- no CMS/WordPress, CRM/Feishu, database, email, external network write, package/lock/dependency, deployment, Git or acceptance action;
- no modification of TASK-026/027 authority, Quote Basket `3.0.0`, Product contracts or protected baseline bytes;
- no Planner-owned task/state/board/root README/architecture mutation;
- do not revert, stash, clean or reformat pre-existing shared-worktree changes.

## Expected evidence

- `TASKS/ARTIFACTS/TASK-028/FRONTEND_A1_TDD_RED_EVIDENCE.md`
- `TASKS/ARTIFACTS/TASK-028/FRONTEND_A1_EXECUTION_REPORT.md`
- `TASKS/ARTIFACTS/TASK-028/FRONTEND_A1_VALIDATION_LOG.md`
- `TASKS/ARTIFACTS/TASK-028/FRONTEND_A1_DIFF_SUMMARY.md`
- exact focused test counts, RFQ verifier output, lint/typecheck results and protected/generated/listener proof

## Stop gate

A1 completion is only a frontend lane checkpoint. A2 remains blocked until Planner receives the linked response, acknowledges it and independently validates the current shared bytes.
