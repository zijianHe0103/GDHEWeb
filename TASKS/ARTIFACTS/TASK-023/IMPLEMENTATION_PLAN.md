# TASK-023 Implementation Plan

## A0 — Planner design and baseline

1. Freeze requirements, design, task boundaries and protected hashes.
2. Reproduce current frontend 44/463, five verifiers, lint, typecheck and production build.
3. Reproduce WordPress/Core/plugin/database, ProductCard Schema and zero-fixture-residue checks.
4. Checkpoint before any implementation dispatch.

## A1 — WordPress RED/GREEN: contract root and route

1. RED: missing RelatedProductCard root Schema and route.
2. GREEN: add only the independent 1.0.0 Schema closure and anonymous GET registration.
3. Prove existing ProductCard 1.0.0 Schema/API/handoff bytes unchanged.

## A2 — WordPress RED/GREEN: relation truth and eligibility

1. RED/GREEN closed request, source path resolution, max-20 complete relation list and stable stored order.
2. RED/GREEN self, duplicate, unpublished, revoked eligibility, invalid card/media, action mismatch and missing explicit quantity unit.
3. RED/GREEN one complete collection request, ETag/304 and normalized no-store errors.
4. Two different-ID fixture lifecycles, identical public hashes, exact cleanup and existing CMS regressions.
5. Freeze handoff and stop for independent Planner checkpoint.

## A3 — Frontend contract snapshot and runtime consumer

1. RED/GREEN exact local closure, authority-bound verifier and mutation matrix.
2. RED/GREEN server-only Transport, static runtime Validator, semantic gates, DTO Adapter and sanitized orchestration.
3. Prove exactly one related collection request and zero per-card `/resolve`.
4. Prove hostile media/internal fields fail closed before React and detail/configurator remain available.

## A4 — Quote Basket 2.0

1. RED/GREEN closed configured/accessory line union and invalid samples.
2. RED/GREEN canonical v1 -> v2 migration, TTL, ceiling, cross-tab and hostile-input boundaries.
3. RED/GREEN accessory add/merge/split/remove/quantity and configured-product regression.
4. Preserve v1 authority bytes and every TASK-022 regression.

## A5 — Visible progressive module

1. RED/GREEN 0/1/3/4+/7 states and stable initial-three/next-three behavior.
2. RED/GREEN one shared card skeleton and bottom action geometry for both action kinds; remove the accessory-only quantity form.
3. RED/GREEN accessory `Add to Quote` with initial quantity `1`, followed by existing Quote Basket quantity editing/removal and deterministic repeat-add behavior.
4. RED/GREEN canonical `View Product` navigation plus browser-Back restoration of source expansion and scroll location using public session UI state only.
5. RED/GREEN public Client projection, no UUID/internal/raw payload, protected local media and sanitized status.
6. Responsive CSS and keyboard/focus/live-region/reduced-motion behavior.
7. Full frontend regression, verifiers, lint, typecheck, build and production smokes.
8. Update task-owned docs and stop for independent Planner checkpoint.

## A6 — Visual QA and review

1. Planner starts a same-origin local preview only after A5 checkpoint.
2. Visual QA checks 1440/1024/768/390/320, 0/3/4+/7, add/view actions, focus, touch, reduced motion and console/network leakage.
3. Frontend performs only bounded visual corrections if needed; Visual QA rechecks.
4. Adversarial reviewer independently challenges data truth, relation ordering, media/identity isolation, Basket migration and evidence.

## A7 — Final validation and acceptance gate

1. Planner reruns all focused/full/CMS/verifier/build/smoke/visual/protected/governance gates.
2. Resolve README/document impact.
3. Use checked `prepare-awaiting-user`; do not hand-write AWAITING_USER.
4. Wait for exact user acceptance. No Git delivery or deployment before that phrase.
