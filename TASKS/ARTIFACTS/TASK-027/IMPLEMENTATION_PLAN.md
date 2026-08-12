# TASK-027 Implementation Plan

## A0 — Planner design and protected baseline

- Freeze exact paths, local mode, Route Handler, dependency seams, Stub state and TDD order.
- Hash the 47 protected authority/runtime/dependency/document paths.
- Verify no product code changed and all DPG gates pass.

## A1 — Contract snapshot and offline verifier

- Add the exact frontend-local 20-JSON TASK-026 snapshot and closed manifest.
- Add the authority-bound Node verifier and removable mutation tests.
- Stop for Planner validation. Do not start runtime early.

## A2 — Closed runtime contract and canonical crypto

- Add strict Schema registry, authentic wrappers and semantic gates.
- Add JCS/HMAC/comparison/snapshot functions and reproduce all TASK-026 vectors.
- Add server-only build negatives.
- Stop for Planner validation.

## A3 — Runtime orchestration and authoritative batch binding

- Project one complete request into the TASK-025 line array.
- Call the existing mixed consumer exactly once and bind the whole ordered response.
- Add the dependency-injected intake state machine up through reservation/resolution.
- Stop for Planner validation.

## A4 — Process-local Stub Repository and Stub Sink

- Add replay/conflict/expiry/no-resend state and zero-retention sink outcomes.
- Prove `200/202/409`, exact 30-day anchor and pre-reservation zero state.
- Stop for Planner validation.

## A5 — Local Route Handler and real HTTP proof

- Add `/api/rfq/intake/` with local mode, exact Origin/media/stream/UTF-8 gates.
- Add real HTTP success/replay/conflict/failure and production/unset/disabled smoke.
- Prove one TASK-025 POST, zero legacy calls and no public leakage.
- Stop for Planner validation.

## A6 — Regression and documentation

- Update root/frontend README and architecture contract with local-only truth.
- Run focused tests, resource-safe complete inventory, all verifiers, lint, typecheck, build, smokes, protected hashes, cleanup and DPG gates.
- Consolidate execution/validation/diff reports.

## Final gate

Run one complete independent adversarial review only after A1–A6 pass. A review failure permits a bounded repair and same-reviewer finding closure, not a second full review. User acceptance, Git delivery and deployment remain separate.
