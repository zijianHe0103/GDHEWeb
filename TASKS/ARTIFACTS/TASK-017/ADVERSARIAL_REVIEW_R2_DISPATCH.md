# TASK-017 Adversarial Review Round 2 Dispatch

status: `READY_FOR_READ_ONLY_REVIEW`
source_response: `MSG-TASK-017-FRONTEND-ADVERSARIAL-P1-R1-RESPONSE`

## Purpose

Perform the final configured independent read-only review of only the
adversarial Round 1 findings and their direct regression surface. Preserve
Round 1 as `FAIL / P0=0 / P1=1 / P2=2`; do not rewrite it as a passing round.

## Required checks

1. Reproduce the real ProductList CMS page path with a Schema-valid HTTPS
   WordPress-shaped media URL.
2. Prove the result performs exactly one fixed ProductCard collection request,
   zero per-card `/resolve`, and becomes the sanitized unavailable state before
   React receives card media.
3. Inspect rendered markup, not only source text, and prove it contains no
   hostile media URL or origin, external image preload, external `img`, raw
   payload or policy diagnostic.
4. Verify valid empty CMS remains the distinct empty state and local preview
   retains the exact protected candidate.
5. Challenge the media policy with absolute, protocol-relative,
   backslash-confused, credential-bearing and malformed inputs. Confirm the
   policy is server-only, uses a fixed synthetic origin, exposes no caller
   override, and fails the whole non-empty collection closed.
6. Confirm the frozen Validator, Adapter, DTO, Transport, ProductCard
   contracts, CMS, component DOM/CSS/actions and package/lock files are
   unchanged.
7. Confirm the final production build leaves
   `frontend/next-env.d.ts` byte-identical to baseline with
   `./.next/types/routes.d.ts`.
8. Confirm the active task and project narration record the frontend request
   and response as ACKed/done rather than pending.
9. Reproduce the focused ProductList/TASK-016 tests, full Vitest, both
   verifiers, lint, typecheck, production build, production smoke, protected
   hashes/scope, diff and DPG gates as needed for an independent verdict.

## Preserved passing scope

- visual Round 1 `FAIL / 0 / 1 / 1` and visual Round 2
  `PASS / 0 / 0 / 0` remain historical facts;
- local mode, production 404/noindex, DTO/action/state boundaries and
  protected FGD X15 preview remain protected;
- production public-media origin and Next Image allowlist remain deferred;
- Schema-valid non-empty CMS collections with only non-authorized remote media
  are intentionally unavailable in TASK-017.

## Output

Update the canonical
`TASKS/ARTIFACTS/TASK-017/ADVERSARIAL_REVIEW_REPORT.md` by appending a clearly
separated Round 2 section while preserving Round 1 evidence. Return exactly
one controlled `review_response` with:

- `PASS`, `FAIL` or `BLOCKED`;
- exact `P0`, `P1` and `P2` counts;
- whether Planner final validation is allowed.

## Exclusions

Read-only product scope. Do not repair files, modify Planner-owned state,
accept the task, commit, push, merge, deploy, alter CMS/database/external
systems or start any later task.
