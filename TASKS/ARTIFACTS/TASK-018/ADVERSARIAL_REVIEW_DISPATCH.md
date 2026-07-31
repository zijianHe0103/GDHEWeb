# TASK-018 Adversarial Review Dispatch

status: `READY_FOR_INDEPENDENT_REVIEW`
owner: `adversarial_reviewer`

## Objective

Independently challenge the complete TASK-018 FGD X15+PVC local Product Detail
slice. Do not rely on implementation, Planner or visual-lane PASS statements
without reproducing the relevant evidence.

Return one current verdict:

- `PASS / P0=0 / P1=0 / P2=0`; or
- `FAIL` with exact P0/P1/P2 findings, reproduction, impact and the smallest
  bounded revision.

## Review Scope

1. Public identity and route:
   - `FGD X15+PVC`;
   - `FGD X15+PVC Track`;
   - only `/products/fgd-x15-pvc/`;
   - no second `/products/fgd-x15/` identity.
2. Local/publication gates:
   - `preview|cms` are explicit local modes;
   - default, unknown and production fail closed;
   - `noindex,nofollow`;
   - no sitemap/public-route claim.
3. CMS/data boundary:
   - one `/resolve` and zero ProductCard requests for CMS detail;
   - React consumes Product Detail DTO only;
   - no raw CMS/WordPress/SCF/internal Article Number or Product Code;
   - hostile remote media fails closed to the protected local asset before
     React/browser output;
   - not-found and unavailable remain distinct.
4. Content and CTA:
   - Hero, Overview and exactly five confirmed specifications;
   - units and track/PVC weights remain distinct;
   - local test-candidate notice remains visible;
   - category and RFQ targets are exact;
   - CTA is navigation only and does not claim saved/submitted RFQ.
5. Responsive/accessibility:
   - preserve blocked and Round 1 FAIL history;
   - independently inspect Round 2 1440/1024/768/390/320 measurements,
     screenshots and capture-method disclosure;
   - challenge overflow, clipping, token wrapping, CTA hit area, keyboard order,
     focus, Alt, console and browser leakage evidence.
6. Regression and scope:
   - current full test/verifier/build/smoke evidence;
   - CSS revision is local and minimal;
   - package/lock, protected runtime/contracts, CMS/database and external
     systems remain unchanged;
   - README/document impact and task artifacts are current;
   - generated `next-env.d.ts` is back at production baseline.

## Required Read-only Reproduction

At minimum inspect current diff, run the most relevant focused tests, verify
the visual evidence hashes/inventory and execute DPG message/scope/diff checks.
Run additional read-only tests where needed to challenge a boundary.

## Allowed Writes

- `TASKS/ARTIFACTS/TASK-018/ADVERSARIAL_REVIEW_REPORT.md`;
- `LANES/adversarial_reviewer/**`;
- one controlled linked review response message.

## Protected Scope

Do not edit frontend, tests, README, task authority, Planner state, visual
evidence, CMS, database, dependencies, Git, deployment or external systems.
Do not repair findings in the reviewer lane.

## Stop Boundary

Stop after one controlled review response. A PASS is not user acceptance,
commit, push, merge or deployment authorization.
