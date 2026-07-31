# TASK-018 Visual Evidence Encoding P2 Revision Dispatch

status: `READY_FOR_VISUAL_QA_EVIDENCE_REVISION`
source: `MSG-TASK-018-ADVERSARIAL-REVIEW-R1-RESPONSE`

## Purpose

Close only Adversarial Round 1 P2: the canonical visual reports are not exact
about the byte encoding of preserved files whose names end in `.png`.

This is an evidence-description revision. It does not authorize recapture,
rename, re-encode, delete, product/CSS/test changes or a visual verdict change.

## Authoritative Encoding Matrix

Verify again before editing, then disclose:

- Visual Round 1 full-page files:
  - filenames end in `.png`;
  - actual bytes are JPEG/JFIF;
  - keep all five names, dimensions and SHA-256 values unchanged.
- Visual Round 1 focus files:
  - filenames end in `.png`;
  - actual bytes are JPEG/JFIF;
  - keep both names, dimensions and SHA-256 values unchanged.
- Visual Round 2 full-page composites:
  - actual bytes are PNG;
  - keep all five names, dimensions and SHA-256 values unchanged.
- Visual Round 2 focus files:
  - filenames end in `.png`;
  - actual bytes are JPEG/JFIF;
  - keep both names, dimensions and SHA-256 values unchanged.

Expected magic prefixes:

- JPEG/JFIF: `ff d8 ff e0`;
- PNG: `89 50 4e 47 0d 0a 1a 0a`.

## Required Report Correction

Update both:

- `QA/TASK-018/VISUAL_QA_REPORT.md`;
- `TASKS/ARTIFACTS/TASK-018/VISUAL_QA_REPORT.md`.

Required changes:

1. Replace or qualify statements that call every Round 1 full-page file a PNG.
2. Add an explicit actual-encoding disclosure for all four groups above.
3. Keep the `.png` filename wording and explain that the filename extension is
   historical and does not represent actual JPEG encoding for those groups.
4. Preserve verbatim:
   - initial `BLOCKED_NO_VISUAL_EVIDENCE`;
   - Round 1 `FAIL / severe 0 / obvious 2 / detail 0`;
   - Round 2 `PASS / severe 0 / obvious 0 / detail 0`;
   - every screenshot/focus filename;
   - dimensions, measurements and existing SHA-256 values;
   - capture-method disclosure and product findings.

## Validation

- `file` for all 14 evidence images;
- magic-byte prefixes for all 14;
- SHA-256 parity against the current reports;
- Markdown/local-link and whitespace checks;
- project, registry, messages and strict lane checks;
- confirm zero diff in image bytes, frontend, tests, README, task authority,
  CMS, dependencies and generated files.

## Allowed Writes

- `QA/TASK-018/VISUAL_QA_REPORT.md`;
- `TASKS/ARTIFACTS/TASK-018/VISUAL_QA_REPORT.md`;
- `LANES/visual_qa/**`;
- one controlled linked execution response.

## Protected Scope

Do not edit/rename/re-encode/delete any image. Do not edit frontend, CSS,
tests, README, task authority, Planner state, reviewer report, CMS,
dependencies, Git, deployment or external systems.

## Stop Boundary

Stop after one linked `execution_response`. Planner owns fresh validation and
the narrow adversarial Round 2 request.
