# TASK-027 Adversarial Review Report

- review_request: `MSG-TASK-027-ADVERSARIAL-REVIEW-R1`
- review_mode: one complete independent read-only review
- reviewed_at: `2026-08-12T06:45:34Z`
- verdict: `FAIL`
- P0: `0`
- P1: `1`
- P2: `2`
- Planner final validation allowed: `NO`
- permitted follow-up: same-reviewer bounded finding closure only; do not repeat the complete review
- acceptance_or_git_authorization: `NO`

## Outcome

The frozen RFQ Submission v2 snapshot, closed Schema graph, strict authentic wrappers, RFC 8785 and token vectors, one complete TASK-025 mixed-batch binding, process-local Repository and Sink semantics, Route fail-closed boundaries, production-disable behavior and protected non-document bytes substantially reproduce. The current delivery nevertheless fails the promised hostile-dependency boundary: a hostile value returned by the injected request-reference generator is coerced outside the protected dependency call, allowing its private diagnostic to escape the server-only runtime. Two current governance/evidence narratives are also internally inconsistent. The result is `FAIL / P0=0 / P1=1 / P2=2`.

## Findings

### P1-1 — hostile request-reference return is coerced outside the stable dependency boundary

`frontend/src/lib/rfq/server/v2/intake.ts:206-217` catches only the call to `ids.nextRequestReference()`. It then passes the untrusted returned value to `RegExp.prototype.test` at line 214 outside that `try`. Although TypeScript declares the dependency result as `string`, the runtime boundary is dependency-injected and the task explicitly claims stable handling of hostile dependency values without coercion or diagnostic leakage.

An isolated reviewer-only test supplied a null-prototype Proxy as that return value. Its `Symbol.toPrimitive` trap threw `PRIVATE_REQUEST_REFERENCE_DIAGNOSTIC`. The real `createRfqIntakeRuntime(...).resolve(...)` path invoked the trap and returned that exact native diagnostic instead of an authentic stable `RfqIntakeError { category: "intake", kind: "dependency_failed" }`:

```text
PASS 1 file / 1 test
get/coercion trap count: greater than zero
observed error message: PRIVATE_REQUEST_REFERENCE_DIAGNOSTIC
```

The reproduction used the ordinary pre-reservation rejection path at `intake.ts:321-326`, where a customer-safe `409 request_not_allowed` requires `publicError(...)` and therefore calls `requestReference()`. The production Route's outer catch ultimately reduces the thrown diagnostic to a generic `503`, so this exact probe does not expose the string to a browser response. It still violates the exported server-only runtime's stable dependency contract, observes attacker-controlled coercion, leaks the raw diagnostic to server callers and changes the intended deterministic `409` into an exceptional failure.

Minimum bounded revision:

- keep the request-reference result unknown at runtime;
- inside one protected block, require `typeof value === "string"` before applying the fixed pattern, with no coercion or reflection on non-strings;
- add a focused return-value regression proving a hostile/revoked object produces only the existing stable `dependency_failed` error with all reflection/coercion counters zero;
- regress the ordinary valid reference and customer-safe local rejection/replay paths without changing the public contract.

The reviewer probe was removed after the exact reproduction. It left no product, test, cache, listener or external-system artifact.

### P2-1 — consolidated protected-document evidence contradicts the delivered scoped document changes

The A0 authority permits exactly three protected documentation paths to change: root `README.md`, `frontend/README.md` and `docs/architecture/headless-wordpress-nextjs-contract.md`. `FRONTEND_A6_PLANNER_DOC_DELTAS.md:6-33` and `A6_PLANNER_CHECKPOINT.md:11` correctly state that Planner applied the root README and architecture deltas after the lane checkpoint.

Current consolidated evidence does not tell the same story:

- `TEST_OR_VALIDATION_LOG.md:43-44` says the only permitted protected documentation difference is `frontend/README.md`;
- `DIFF_OR_OUTPUT_SUMMARY.md:21` says root `README.md` and the architecture contract were not edited;
- an independent `sha256sum -c` against the A0 baseline passes all 43 protected non-document paths and reports differences for all three authorized documentation paths.

This does not indicate an out-of-scope product/runtime edit, but the final evidence package is not self-consistent. Minimum correction: update only the consolidated validation/diff narration so it truthfully distinguishes the frontend lane's changes from Planner's later scoped root/architecture documentation changes, preserving the three authorized current diffs and 43/43 non-document result.

### P2-2 — Board classification contradicts the current `UNDER_REVIEW` state

`TASKS/BOARD.md:8`, the active task frontmatter/current-state section and `PROJECT/STATE.md` consistently declare `UNDER_REVIEW / NOT_ACCEPTED / DIRTY`. The same Board places TASK-027 under `## 进行中` at lines 14-16 while `## 审查中` at lines 22-24 says `暂无。`. The row text correctly says the request is ACKed and awaits the linked verdict, but its section classification is stale.

Minimum correction: move the existing TASK-027 review narration to the Board's review section without changing task semantics, acceptance state, Git state or historical A3/A5 FAIL entries.

## Passing boundaries independently reproduced

- Node `24.18.0` and npm `11.16.0` were used. The current offline verifier passed exactly `20 JSON / 5 Schema / 63 local refs / 94/94 authority checks`.
- A focused critical runtime rerun passed `6 files / 53 tests`, covering canonicalization/HMAC, strict contract validation and authenticity, complete mixed authority binding, intake, Stub runtime and Route behavior. The broader eleven-file focused command also exited successfully. The reviewer did not relabel Planner's listener-dependent complete `77 files / 649 tests`, build and production-smoke evidence as an independent rerun.
- The A3 initial clock-overflow and repository-thrown Proxy FAIL history remains preserved, and its narrow fixes still pass. The new P1 is a distinct returned-value coercion path. The A5 raw-body hostile rejection fix also remains intact.
- The exact snapshot/version/endpoint, one mixed POST and zero legacy calls, ordered 1..50 full-field binding, public-but-untrusted standard/accessory Article Number, custom `null / sales_follow_up`, replay/conflict/expiry/concurrency state, accepted/indeterminate/rejected Stub Sink behavior and customer-safe public DTO exclusions remain supported by inspected current code and focused tests.
- All 43 protected non-document checksums pass. Package, lock, `tsconfig.json`, production `next-env.d.ts`, TASK-024/025/026 authorities, existing Product/Quote Basket runtime and CMS remain protected. The only baseline differences in the protected checksum run are the three explicitly authorized documentation files described above.
- Documentation continues to describe a local-only, process-local and non-durable proof slice. No customer form, production persistence/security, Feishu/email connector, CMS/database mutation, dependency change, deployment, acceptance or Git delivery is claimed.

## Decision

`FAIL / P0=0 / P1=1 / P2=2`.

Planner may not enter final validation or checked acceptance preparation on this report. The permitted next reviewer action is only a same-reviewer bounded closure of these findings after narrow owner-lane revision and fresh Planner validation; the unique complete TASK-027 review must not be repeated. This report does not authorize the reviewer to repair product or Planner-owned files and does not authorize user acceptance, commit, push, merge or deployment.

---

## Bounded Finding Closure — 2026-08-12

- closure_request: `MSG-TASK-027-ADVERSARIAL-FINDING-CLOSURE`
- closure_mode: same-reviewer check of complete-review P1-1, P2-1 and P2-2 only; not a second complete review
- reviewed_at: `2026-08-12T07:06:02Z`
- current_closure_verdict: `PASS`
- verdict: PASS
- current_P0: `0`
- current_P1: `0`
- current_P2: `0`
- Planner final validation allowed after linked response ACK: `YES`
- acceptance_or_git_authorization: `NO`

The unique complete-review `FAIL / P0=0 / P1=1 / P2=2` above remains immutable history. This section records only whether those three findings are closed on current bytes.

### P1-1 closure — PASS

The returned-value boundary is now closed at `frontend/src/lib/rfq/server/v2/intake.ts:206-219`:

- `nextRequestReference()` is read into `const value: unknown` inside one `try`;
- `typeof value !== "string"` short-circuits before the fixed `REQ-[A-Z2-9]{12}` pattern, so a non-string object is neither reflected nor coerced;
- invalid, hostile, revoked and dependency-thrown results leave only a newly constructed existing `RfqIntakeError("dependency_failed")`.

An isolated reviewer-only probe entered the real pre-reservation rejection path with a hostile null-prototype Proxy and a revoked Proxy. Both returned only `{ category: "intake", kind: "dependency_failed" }`; `get`, descriptor, prototype, `has` and `ownKeys` counters all remained zero, and serialized output contained no private marker. The same probe confirmed the ordinary primitive `REQ-23456789ABCD` still returns the customer-safe `409 request_not_allowed` document.

Independent direct regression: `3 files / 20 tests` PASS for Stub runtime, intake and Route. It includes accepted `201 -> 200` exact replay, indeterminate/rejected replay without resend, customer-safe conflict and pre-gate `409`, the hostile/revoked reference case and the existing Route boundary. Reviewer probe: `1 file / 2 tests` PASS. The probe was removed after capture and left no product, test, cache, listener or external-system artifact.

### P2-1 closure — PASS

The two consolidated artifacts now describe the same current protected-document history:

- `TEST_OR_VALIDATION_LOG.md:43-47` records `43/43` protected non-document hashes and names all three authorized differences: frontend README from the frontend lane, then root README and the architecture contract applied by Planner during A6;
- `DIFF_OR_OUTPUT_SUMMARY.md:21-25` explicitly distinguishes the frontend lane from those later Planner-applied deltas and calls all three current differences authorized TASK-027 output.

The reviewer independently checked all 43 non-Markdown entries in `A0_PROTECTED_CHECKSUMS.sha256`: `43/43` PASS. The separately protected ADR-006 checksum also remains exact. Current authorized document SHA-256 values are root README `59601c2eaafbe58d2ab7f646222c0d3c4201820f5842c65183b01c3b6cbc7dab`, frontend README `33f1021aa586471affaafb11cf99fe61311ae10031dae69571c272fb0bc297bd`, and architecture contract `00c6927169e4d10dbbcbbc69e8f84b1e482f9ae2d30f5cd74ebd35e97fc9b47f`.

### P2-2 closure — PASS

`TASKS/BOARD.md` now has one TASK-027 current row in `## 审查中`, and zero TASK-027 rows in both `## 进行中` and `## 需要修订`. That row preserves `UNDER_REVIEW / NOT_ACCEPTED / DIRTY`, the historical complete-review FAIL counts and the current bounded-closure gate. Active task and Project State describe the same state.

### Closure decision

`PASS / P0=0 / P1=0 / P2=0` for the bounded finding closure only.

After the linked closure response is acknowledged, Planner may perform fresh final validation and checked acceptance preparation. This closure does not rewrite the unique complete-review FAIL history, re-review previously passing scope, authorize product or Planner repair by the reviewer, constitute user acceptance, or authorize commit, push, merge or deployment.
