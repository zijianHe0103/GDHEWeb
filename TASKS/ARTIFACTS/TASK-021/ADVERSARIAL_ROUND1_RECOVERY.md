# TASK-021 Adversarial Round 1 Recovery

Date: 2026-08-04

## Controlled result

- Review: `FAIL / P0=0 / P1=2 / P2=1`.
- Response: `MSG-TASK-021-ADVERSARIAL-REVIEW-R1-RESPONSE` validated, ACKed and moved to done.
- Checked `task_transition.py reopen` ran before recovery. The helper safely refused because TASK-021 was truthfully `UNDER_REVIEW`, while the current helper only reopens `AWAITING_USER`; it changed no file.
- Planner therefore records the equivalent current recovery as `NEEDS_REVISION / NOT_ACCEPTED / DIRTY` without fabricating an `AWAITING_USER` transition.

## Required narrow revisions

1. Frontend Product Configuration v2 decimal validation must accept legitimate exact one-tenth standard lengths such as `4.3`, `5.8` and `6.7`, keep `6.05` invalid, preserve Schema bytes and align Python evidence with exact-decimal semantics.
2. The Add to Quote authority boundary requires an explicit user decision before code changes:
   - retain the current browser-only public quote draft and truthfully revise requirements, design, acceptance criteria, README and test naming so QuoteLine v2 is a future server-side conversion contract; or
   - authorize a current server-owned QuoteLine v2 build seam that keeps Article Number and UUID outside browser/Flight bytes and returns only a public receipt, accepting the additional same-origin request boundary.
3. Regenerate the Product Configuration v2 handoff manifest/checksum after final determinism, refresh frontend authority pins, and prove literal current `20/20` parity.

## Preserved passing history

- Visual Round 1 `FAIL / severe=1 / obvious=1 / detail=1`.
- Frontend narrow revision checkpoint PASS.
- Visual Round 2 `PASS / severe=0 / obvious=0 / detail=0`.
- Existing `40 files / 420 tests`, five verifier, lint/typecheck/build, visual `23/23`, frozen v1 and protected-scope results remain historical evidence; they do not close the new findings.

## Unique next step

Obtain the user's Add to Quote authority decision. Then dispatch only the three bounded revisions above, run fresh Planner validation and request one narrow adversarial Round 2. Do not start final validation, acceptance, Git delivery, deployment, related products, Basket persistence, final submission or Feishu integration.
