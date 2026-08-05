# TASK-022 Implementation Plan

Date: 2026-08-05
Status: FROZEN_FOR_IMPLEMENTATION

Every production seam uses strict RED before minimum GREEN. Work is dispatched
to the registered frontend lane in two bounded checkpoints.

## A1 — Contract and pure Basket domain

1. Add tests proving no Quote Basket contract/domain exists.
2. Freeze `QuoteBasketDocument 1.0.0` exact keys and public-only field closure.
3. Implement deep validation/freezing and immutable create/add/merge/edit/remove.
4. Prove zero/one/N, equal merge, every split dimension, standard/custom split,
   safe integer boundary, overflow rejection and caller immutability.
5. Prove Article Number/internal IDs/price/PII/remote media are rejected.

Checkpoint: focused domain tests, frozen old contract hashes, typecheck and
scope diff. Do not start UI if A1 fails.

## A2 — Persistence and cross-tab adapter

1. RED for missing 30-day persistence and invalid-storage handling.
2. Implement fixed storage key, encoded size ceiling, injected clock/storage,
   serializer/parser, 30-day expiry and sanitized failure types.
3. Implement storage-event reconciliation and deterministic revision ordering.
4. Prove reload/reopen, read-does-not-refresh, mutation-refreshes-expiry,
   expired/corrupt/unknown/extra/oversized/quota cases and stale/newer events.

Planner checkpoint after A1+A2. Required evidence: focused counts, no product UI
change, no package/lock/CMS/protected-byte drift and one execution response.

## A3 — Product-page Add to Quote integration

1. RED: existing submit still only replaces `latestDraft` and refresh clears it.
2. Add server-owned public Basket product projection without Product/Media IDs.
3. Connect valid submit to Basket add/merge; invalid form performs zero writes.
4. Render sanitized added/updated/failure live state, line count and View Basket.
5. Prove one configured product, duplicate merge, different config split,
   storage failure preservation and no internal bytes in rendered response.

## A4 — Local Quote Basket page and Apple-style rows

1. RED for absent `/request-a-quote/` local Basket route and row UI.
2. Add preview/cms-only server gate and noindex metadata.
3. Add hydration-safe Client view, empty state and one/N Apple-style rows.
4. Add absolute quantity edit and Remove with accessible announcements.
5. Prove protected local media only, no price/payment/submission/network action,
   and production 404 with zero CMS/Feishu requests.

## A5 — Regression, docs and handoff

1. Run all new focused tests and old configurator/QuoteLine/Product Detail tests.
2. Run all five existing verifiers, full Vitest, lint, typecheck, production
   build and all production smokes plus the new Basket smoke.
3. Check protected hashes, package/lock, CMS zero diff, server-only/internal
   leakage, generated-file cleanup, scope, whitespace and DPG gates.
4. Update root/frontend README, frontend quote contract, architecture contract
   and ADR-006 exact terminology.
5. Produce execution, validation, diff and TDD evidence.

Planner checkpoint after A3-A5. If PASS, start a Planner-owned local preview and
dispatch visual QA only. Visual QA must cover 1440/1024/768/390/320, empty/one/N,
quantity/Remove, refresh recovery, keyboard/focus and reduced motion.

After visual PASS, dispatch one independent read-only adversarial review.
Review PASS then permits fresh Planner final validation and checked
`prepare-awaiting-user`; it does not equal user acceptance or authorize Git.

## Explicit stop boundaries

- No CMS/database/Feishu write at any step.
- No package/lock/dependency change.
- No related-products/TASK-023 work.
- No contact form or final Request a Quote submission.
- No commit, push, merge, deployment or acceptance before the exact governed
  user command.
