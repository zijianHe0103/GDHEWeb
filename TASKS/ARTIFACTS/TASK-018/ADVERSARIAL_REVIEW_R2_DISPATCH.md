# TASK-018 Adversarial Review Round 2 Dispatch

status: `READY_FOR_NARROW_ROUND_2`
source: `MSG-TASK-018-VISUAL-EVIDENCE-ENCODING-P2-R1-RESPONSE`

## Objective

Independently recheck only the Round 1 P2:

- visual evidence actual JPEG/PNG byte encoding is now disclosed accurately;
- all files, names, dimensions, hashes, visual history and product evidence
  remain unchanged.

Preserve Round 1 `FAIL / P0=0 / P1=0 / P2=1` history. Return one current final
verdict:

- `PASS / P0=0 / P1=0 / P2=0`; or
- `FAIL` with exact remaining/new P0/P1/P2.

## Required Reproduction

1. Run `file`, magic-prefix and SHA-256 checks for all 14 visual files.
2. Inspect both canonical visual reports for the exact four-group encoding
   matrix.
3. Confirm no image byte/name/hash/dimension changed.
4. Confirm blocker, Visual R1 FAIL and Visual R2 PASS history remains.
5. Confirm no frontend/test/README/task-authority/CMS/dependency/generated
   mutation occurred in the P2 revision.
6. Run messages, project, strict lane and diff checks.

No full product re-review is required unless current bytes show an unexpected
scope change. Existing Round 1 independently passing findings remain valid.

## Allowed Writes

- append Round 2 to
  `TASKS/ARTIFACTS/TASK-018/ADVERSARIAL_REVIEW_REPORT.md`;
- `LANES/adversarial_reviewer/**`;
- one controlled linked review response.

## Protected Scope

Do not edit frontend, tests, README, task authority, Planner state, visual
reports/images, CMS, dependencies, Git, deployment or external systems. Do not
repair findings in the reviewer lane.

## Stop Boundary

Stop after one linked Round 2 response. PASS is not acceptance or Git
authorization.
