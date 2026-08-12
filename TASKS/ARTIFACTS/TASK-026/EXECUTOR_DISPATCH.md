# TASK-026 Executor Dispatch

message_id: MSG-TASK-026-RFQ-SUBMISSION-V2-CONTRACT-IMPLEMENTATION
type: execution_request
from_lane: planner
to_lane: executor
task_id: TASK-026
priority: P1

## Required reading

Before mutation, ACK the controlled request and read:

- `TASKS/ACTIVE/TASK-026-rfq-submission-v2-contract.md`
- `TASKS/ARTIFACTS/TASK-026/REQUIREMENTS.md`
- `TASKS/ARTIFACTS/TASK-026/A0_DESIGN.md`
- `TASKS/ARTIFACTS/TASK-026/A0_PROTECTED_BASELINE.md`
- `TASKS/ARTIFACTS/TASK-026/A0_PROTECTED_CHECKSUMS.sha256`
- TASK-024 `MACHINE_CONTRACT.md` and its frozen v1 bundle
- TASK-025 `REQUIREMENTS.md`, `DESIGN.md`, final WordPress handoff and frozen frontend mixed-batch/Basket 3.0 contracts

## Authorized implementation

Implement only the additive RFQ Submission `2.0.0` artifact bundle under `TASKS/ARTIFACTS/TASK-026/**` using strict vertical TDD. Record a real failing test/check before the missing v2 root/verifier and before each material semantic seam.

Deliver:

1. the three required contract/mapping/inheritance Markdown documents;
2. exactly five closed Draft 2020-12 v2 Schemas with local refs only;
3. deterministic positive and negative samples covering the A0 matrix;
4. new v2 RFC 8785 canonical bytes, version-selected HMAC, comparison token and Basket 3.0 snapshot-token vectors using non-production test material;
5. an offline verifier that compiles strict, disables network resolution, enforces semantic uniqueness/state/error/time rules and proves compatibility with the frozen TASK-025 mixed request/response contract without modifying it;
6. `EXECUTION_REPORT.md`, `TEST_OR_VALIDATION_LOG.md`, `DIFF_OR_OUTPUT_SUMMARY.md` and TDD RED evidence;
7. proposed exact Planner-owned architecture/ADR deltas in the report only.

The public projection accepts only ready Basket 3.0 lines. Standard configured products and catalog accessories require Article Number; custom length requires `articleNumber:null / sales_follow_up`. Article Number is public but untrusted. Authoritative standard/accessory values must come only from the single complete TASK-025 mixed batch response; receipts/errors must not expose them.

## Prohibited

Do not modify frontend, CMS, package/lock, TASK-024/025 bytes, active task/Project/Board, architecture/ADR/README, real data, database, Feishu, external services, Git or deployment. Do not implement a form, Route Handler, persistence, challenge provider or delivery connector.

## Validation and stop point

Reproduce all 67 protected hashes; validate Schema/ref closure, samples, semantic matrix, crypto/snapshot vectors, TASK-025 compatibility, Markdown/JSON, no forbidden diff, `git diff --check` and DPG project/registry/messages/strict-lane gates. Return one linked `execution_response` with exact counts and stop for the independent Planner checkpoint. Do not request or perform review yourself.
