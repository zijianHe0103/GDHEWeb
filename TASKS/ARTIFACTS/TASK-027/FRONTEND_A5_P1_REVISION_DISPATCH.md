# TASK-027 Frontend A5 P1 Revision Dispatch

message_id: MSG-TASK-027-FRONTEND-RAW-BODY-P1-R1
task_id: TASK-027
lane: frontend
checkpoint: A5 narrow recovery
prerequisite: A5_PLANNER_CHECKPOINT.md FAIL / P1=1

## Objective

Close only the A5 raw-body unknown-error classification defect under strict
RED/GREEN, complete the raw-gate proof already required by the original A5
dispatch, then stop for a fresh Planner recheck. This is an implementation
checkpoint revision, not a complete adversarial review.

## Required RED

Use the real exported `POST` Route Handler with an enabled local configuration
and a request body reader that rejects with a hostile null-prototype Proxy.
Prove the current behavior before repair:

- `POST` rejects/throws instead of returning a public response;
- the attacker's `getPrototypeOf` trap is invoked;
- a private diagnostic can escape the Route boundary.

## Minimum GREEN

- Never use `instanceof`, prototype inspection, string coercion, message/cause
  access or other reflection on an unknown body-reader rejection.
- Classify only internal, non-attacker-controlled sentinels/results created by
  the Route's own size/length checks.
- A hostile body-reader rejection must return only authentic
  `400 invalid_request`, `Cache-Control: no-store`, no CORS opt-in, zero attacker
  reflection/coercion traps and no private diagnostic.
- Preserve declared/stream overflow as authentic `413 payload_too_large` and
  preserve every existing A5 response/runtime behavior.
- Add direct regressions for the hostile body-reader value and internal
  size/length classification.

## Complete the frozen A5 proof

Extend the existing short-lived real HTTP smoke only as needed to exercise the
original dispatch's network-level Origin, exact media, declared-size,
stream-size and fatal-UTF-8 boundaries. Prove one raw JSON parse on the direct
Route seam without adding a product hook. Keep all listeners loopback-only and
recoverably clean every listener/build/cache artifact.

## Validation and boundaries

Re-run A1-A5 focused tests, TASK-025/Quote Basket v3 regressions, complete
resource-safe Vitest inventory, ten verifiers, lint, typecheck, production
build, real HTTP smoke, server-only negatives, protected hashes, leakage,
cleanup, diff and DPG gates. Refresh only the four existing A5 evidence files
and `LANES/frontend/worklog.md`.

Do not change A1-A4 behavior, frozen contracts, package/lock, UI, CMS, external
systems or Planner-owned authority. Do not start A6, the complete review, Git
or deployment. Return one linked `execution_response` and stop.
