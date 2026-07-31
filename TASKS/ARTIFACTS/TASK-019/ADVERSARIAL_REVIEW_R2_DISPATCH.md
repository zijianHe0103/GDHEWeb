# TASK-019 Adversarial Review Round 2 Dispatch

status: `READY_FOR_NARROW_INDEPENDENT_REVIEW`
owner: `adversarial_reviewer`

## Objective

Independently review only the two Round 1 frontend P1 corrections and the
Round 1 narration P2 recovery. Preserve the complete Round 1 FAIL history and
return one current final verdict:

- `PASS / P0=0 / P1=0 / P2=0`; or
- `FAIL` with exact remaining finding, reproduction, impact and the smallest
  bounded revision.

## Required review

1. Canonical authority identity:
   - independently attack the real Product Configuration verifier with
     symlink substitution at the repository root, both root authority files,
     checksum-listed input, Schema, success, error and an intermediate path;
   - verify one shared reader covers every canonical authority read;
   - verify symlinked/non-canonical objects fail closed while the regular
     frozen authority tree still returns `4 / 1 / 6`;
   - verify all 17 authority checksums and exact Schema/Golden byte parity.
2. QuoteLine numeric safety:
   - verify Schema accepts the exact safe maximum and rejects values above it;
   - verify merge rejects non-positive, non-integer and unsafe inputs plus any
     unsafe sum before return;
   - independently reproduce the prior maximum-plus-two attack;
   - verify QuoteLine identity and ordinary merge/split behavior are unchanged.
3. Governance and scope:
   - verify the revision request and response are ACKed/done and the current
     task/project/board narration is no longer waiting for that response;
   - preserve Round 1 `FAIL / P0=0 / P1=2 / P2=1` under review history;
   - verify frozen authority/snapshot bytes, package/lock, runtime/UI/routes,
     CMS, external systems and deferred features remain unchanged;
   - reproduce the focused regressions and a sufficient current full/protected
     validation set to support the final verdict.

## Allowed writes

- update `TASKS/ARTIFACTS/TASK-019/ADVERSARIAL_REVIEW_REPORT.md` while
  preserving the complete Round 1 history;
- `LANES/adversarial_reviewer/**` lane records;
- one controlled linked review response message.

## Protected scope

Do not edit CMS or frontend product source, tests, docs, README, task authority,
Planner state, database, dependencies, Git, deployment or external systems. Do
not repair a finding in the reviewer lane.

## Stop boundary

Stop after one linked Round 2 verdict. PASS permits only fresh Planner final
validation. It is not acceptance and does not authorize Git delivery,
deployment, visible configurator, Quote Basket, submission or Feishu work.
