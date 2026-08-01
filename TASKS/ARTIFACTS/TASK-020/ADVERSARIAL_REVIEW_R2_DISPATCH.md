# TASK-020 Adversarial Review Round 2 Dispatch

status: `READY_FOR_NARROW_FINAL_REVIEW`
owner: `adversarial_reviewer`
source_review: `MSG-TASK-020-ADVERSARIAL-REVIEW-R1-RESPONSE`

## Objective

Independently decide whether the sole Round 1 P1 is closed without regression.
Preserve the entire Round 1 `FAIL / P0=0 / P1=1 / P2=0` report and all earlier
Planner/visual history.

Return one final current verdict:

- `PASS / P0=0 / P1=0 / P2=0`; or
- `FAIL` with exact remaining P0/P1/P2 findings and minimum bounded revision.

## Narrow Review Scope

1. Reproduce the real production builder against both prior attacks:
   - `9999999999999999.9` must fail closed rather than round;
   - a 400-digit positive integer plus `.9` must fail closed rather than return
     Infinity;
   - each must expose only a sanitized `customLength` invalid error.
2. Challenge the minimum scaled-tenths implementation:
   - only canonical positive strings with at most one decimal are considered;
   - scaled tenths must be a positive safe integer;
   - number conversion must remain finite and reproduce the same scaled value;
   - no false success may violate or change under JSON serialization.
3. Reprove success semantics:
   - ordinary `5.8` custom remains exact, `articleNumber: null`,
     `sales_follow_up` and frozen QuoteLine Schema-valid;
   - the standard success remains Schema-valid;
   - product identity, color, installation, packaging, Logo, protection,
     quantity and one-latest-result semantics are unchanged.
4. Reprove protected scope:
   - frozen Product Configuration and QuoteLine authorities are byte-identical;
   - Transport/Validator/Adapter/loader/DTO/UI/CSS/icon/Product Detail/Card/List,
     CMS, package/lock, README/docs and visual evidence were not changed by the
     revision;
   - current focused/full tests, three verifiers, lint, typecheck, production
     build, three smokes, visual hashes, diff and governance gates pass.

## Allowed Writes

- update `TASKS/ARTIFACTS/TASK-020/ADVERSARIAL_REVIEW_REPORT.md` while
  preserving Round 1 history;
- `LANES/adversarial_reviewer/**`;
- one linked controlled review response.

## Protected Scope

Do not repair findings or edit product source/tests/docs, Planner authority,
CMS/database, visual evidence, dependencies, Git, deployment or external
systems.

## Stop Boundary

Stop after one linked final response. PASS only permits fresh Planner final
validation; it is not acceptance and does not authorize Git, deployment,
TASK-021, Basket, persistence, submission or Feishu work.
