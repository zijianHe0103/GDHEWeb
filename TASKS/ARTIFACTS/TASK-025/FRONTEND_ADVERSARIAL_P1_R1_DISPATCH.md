# TASK-025 Frontend Adversarial Round 1 P1 Revision Dispatch

## Authority

ACK the linked controlled request before product mutation. Implement only the two independently reproduced P1 closures from `ADVERSARIAL_REVIEW_REPORT.md`, one RED/GREEN seam at a time. Preserve every passing WordPress, A3, A4, Article Number non-display, storage, N+1, documentation and non-implementation boundary. Stop for an independent Planner checkpoint; do not start Round 2 yourself.

## P1-1 — Authentic complete response application boundary

Current defect: exported `applyQuoteBasketV3Validation` accepts a plain structural DTO and can upgrade a migrated standard line even when the response omits required root metadata and authoritative `model`.

Minimum closure:

1. The production Basket upgrade path must consume only a response that has just passed the authentic A3 Schema/semantic/wrapper/DTO boundary.
2. Prefer the smallest current-code solution: make the raw apply helper private to `validateQuoteBasketV3` if it has no legitimate production caller outside that orchestration. Do not create a second Validator or duplicate the eleven-Schema closure unless the current call graph proves privacy insufficient.
3. The exported production surface must not accept a plain `MixedQuoteLineValidationDto` application call that bypasses A3.
4. Through the real public orchestration, add direct regressions for:
   - missing root `apiVersion/schemaVersion/locale/type` metadata;
   - missing authoritative line `model`;
   - extra/invalid root or line keys;
   - semantically similar but Schema-invalid response.
5. Every negative must reject with the existing stable sanitized boundary and leave the original Basket byte-for-byte unchanged. Normal complete 1-line/50-line success, request/response semantic matching and one POST/zero legacy calls must remain.
6. Do not add a Route Handler, Server Action, browser WordPress request, final RFQ or Feishu seam.

## P1-2 — Canonical UUID compatibility across stored Basket and mixed request

Current defect: frozen Basket v2/v3 accept uppercase UUID hexadecimal and the runtime preserves it, while the mixed request snapshot/frontend/CMS require lowercase. A contract-valid legacy standard line therefore cannot reach its only batch upgrade.

Minimum closure:

1. Do not modify frozen Basket v2/v3 Schema bytes, the mixed request authority or WordPress lowercase contract.
2. Canonicalize accepted Basket UUID identity deterministically to lowercase at the smallest runtime ingress/migration boundary that covers every valid Basket line eligible for mixed validation. UUID semantic identity must remain the same; customer selection, quantity, dates, product data, state and Article Number rules must not change.
3. Detect case-fold collisions before returning a v3 Basket. Two otherwise legal IDs that differ only by hexadecimal case must fail closed; no first-wins or silent merge.
4. Add an end-to-end regression using a frozen v2 contract-valid uppercase standard `entryId`: parse/migrate, project, make exactly one mixed POST, accept the matching lowercase canonical response and upgrade to `ready`.
5. Add uppercase v1/v2/v3 coverage proportionate to the actual ingress chosen, plus collision/duplicate negatives and ordinary lowercase regressions.
6. Preserve the same storage key, exact TTL/size/LWW behavior, merge semantics, `requires_readd` exclusion, custom null/sales_follow_up and no-guessing rules.

## Required validation

- Strict RED evidence for both current defects before production changes, followed by minimum GREEN.
- Focused P1 tests plus all TASK-025 A3/A4 and Basket/Configurator/Related regressions.
- All nine verifiers; frozen authority bytes and final CMS handoff pins remain exact.
- Node `24.18.0` / npm `11.16.0` complete resource-safe inventory, lint, typecheck, production build and four production smokes.
- Package/lock, protected image, TASK-024, Product Configuration 2.0, RelatedProductCard 1.0, Quote Basket v2, QuoteLine v2, `tsconfig.json` and production `next-env.d.ts` hashes unchanged.
- Clean `.next`, `tsconfig.tsbuildinfo`, temporary roots and listeners after evidence.

## Allowed changes

- The minimum directly affected Quote Basket v3 batch/domain runtime and direct frontend tests.
- Direct TASK-025 frontend revision evidence and frontend lane worklog.
- `frontend/README.md` only if needed to state UUID canonicalization truth; do not broaden other documentation.

## Explicit exclusions

No CMS/Schema/handoff authority change, dependency/package/lock change, TASK-024 mutation, UI redesign, customer form, final RFQ intake, Basket clearing, persistence/idempotency/HMAC/challenge, Feishu, deployment, Git delivery, acceptance, Planner authority edit or unrelated cleanup.

## Required output

- `TASKS/ARTIFACTS/TASK-025/FRONTEND_ADVERSARIAL_P1_R1_REPORT.md`
- `TASKS/ARTIFACTS/TASK-025/FRONTEND_ADVERSARIAL_P1_R1_VALIDATION.md`
- One linked `execution_response` to Planner.
