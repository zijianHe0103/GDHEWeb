# TASK-022 Adversarial Review Dispatch

request_id: MSG-TASK-022-ADVERSARIAL-REVIEW-R1
review_round: 1
review_mode: independent_read_only
task_state: UNDER_REVIEW
acceptance_state: NOT_ACCEPTED
git_state: DIRTY

## Required verdict

Return exactly one linked `review_response` with:

- `PASS` only when `P0=0 / P1=0 / P2=0`; or
- `FAIL` with each finding assigned P0/P1/P2, a reproducible probe and the minimum bounded revision.

The reviewer must not repair any finding or modify frontend, CMS, tests, documentation, Planner authority, visual evidence bytes, dependencies, Git, deployment or external systems.

## Independent review scope

1. Verify `QuoteBasketDocument 1.0.0` is a closed public-only contract with exact canonical expiry `updatedAt + 2592000000 ms`, 262144-byte ceiling, fail-closed parsing and no partial recovery.
2. Challenge all domain operations with hostile values, arrays, accessors, symbols, non-enumerable properties, Proxy/reflection traps, unsafe integers and overflow. Errors must remain stable and sanitized.
3. Verify identical complete public configuration merges quantity, any frozen public identity/configuration difference splits lines, quantity is excluded from identity, inputs are immutable and the original Basket survives rejected operations.
4. Verify browser persistence, expiry refresh, corrupt/unknown data cleanup and deterministic same-origin last-writer-wins reconciliation do not silently accept an older valid snapshot over a newer one.
5. Verify browser storage, DOM, Flight/script, markup, URLs and errors contain no Article Number, `GDHEPRD000172`, stable Product/Media UUID, WordPress/SCF/Feishu ID, raw CMS/internal enum, price, PII, secret or diagnostic.
6. Verify product `Add to Quote` writes the validated Basket, same/different configuration behavior is genuine, current line count is truthful, and no per-item CMS, WordPress, Feishu or submission request occurs.
7. Verify local `/request-a-quote/` zero/one/N rendering, protected image, quantity update and Remove consume only public DTO/state, while production preview/cms remains final 404 and local route remains noindex/nofollow.
8. Verify `Request a Quote` is visibly unavailable, disabled, outside a form and cannot navigate, fetch, claim success or write an external system.
9. Independently audit Visual QA R1 PASS 0/0/0, 15/15 hashes, actual JPEG/JFIF-under-png encoding disclosure, dimensions, 1440/1024/768/390/320 reflow, keyboard/focus/AX/live and reduced-motion evidence.
10. Verify root/frontend docs, architecture contract and ADR-006 consistently describe a non-payment Quote Basket, public untrusted browser lines and future server re-resolution; final form/API/Feishu remain deferred.
11. Verify protected TASK-019/020/021 contract/authority bytes, package/lock, CMS and out-of-scope product behavior remain unchanged except the two explicitly authorized product integration source files.
12. Preserve the historical A1/A2 Planner checkpoint `FAIL / P0=0 / P1=2 / P2=0` and its exact 30-day/Proxy recovery. Do not rewrite history merely because current evidence passes.

## Current evidence to reproduce

- A1/A2 current focused 2/28 and full 42/450 after narrow P1 recovery.
- A3-A5 broader focused 14/81 and full 44/459.
- Five contract verifiers, lint, typecheck, production build and four production smokes PASS.
- Visual QA R1 `PASS / 0 / 0 / 0`; 15/15 evidence hashes and exact encoding/dimensions PASS.
- `next-env.d.ts` frozen hash `7b550dda9686c16f36a17bf9051d5dbf31e98555b30d114ac49fc49a1e712651`; no `.next`; no port-3000 listener.
- Project, message, strict-lane and diff gates PASS.

## Required context

- `TASKS/ACTIVE/TASK-022-quote-basket-foundation.md`
- `TASKS/ARTIFACTS/TASK-022/REQUIREMENTS.md`
- `TASKS/ARTIFACTS/TASK-022/DESIGN.md`
- `TASKS/ARTIFACTS/TASK-022/IMPLEMENTATION_PLAN.md`
- `TASKS/ARTIFACTS/TASK-022/PLANNER_A3_A5_CHECKPOINT.md`
- `TASKS/ARTIFACTS/TASK-022/PLANNER_PRE_REVIEW_VALIDATION.md`
- `TASKS/ARTIFACTS/TASK-022/VISUAL_QA_REPORT.md`
- `QA/TASK-022/VISUAL_QA_REPORT.md`
- `QA/TASK-022/BROWSER_INTERACTION_LOG.md`
- `docs/frontend/QUOTE_BASKET_CONTRACT.md`

## Boundary

A reviewer PASS only permits fresh Planner final validation. It is not user acceptance and does not authorize `prepare-awaiting-user`, commit, push, merge, deployment, TASK-023, final RFQ submission or Feishu integration.
