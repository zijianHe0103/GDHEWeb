# TASK-025 Frontend A4 Controlled Dispatch

## Authority

Read the active TASK-025, all Planner A0 artifacts, `FRONTEND_A3_PLANNER_CHECKPOINT.md`, the A3 frontend evidence, the current Quote Basket 1.0/2.0 contracts/domain/storage/presentation, Product Configuration 2.0 public projection/configurator, RelatedProductCard 1.0 runtime/presentation and the new A3 Article Number batch snapshot/consumer.

ACK the linked controlled request before product mutation. Execute only frontend A4 with strict vertical TDD: each new production seam begins with a direct failing test, then minimum GREEN, then fresh regression. Stop for an independent Planner checkpoint.

## Required A4 deliverables

1. Add an independent closed Quote Basket `3.0.0` Schema, types, domain and storage runtime. Do not widen or rewrite Quote Basket 1.0/2.0 bytes or samples.
2. Keep the existing same-origin storage key as the only migration entry point, exact 30-day TTL and `262144` UTF-8 byte ceiling. Do not create a parallel hidden Basket.
3. Freeze only legal v3 line/state combinations:
   - new standard configured product: `ready`, exact Article Number, complete selection/packaging and `piece`;
   - new custom configured product: `ready`, `articleNumber:null`, `sales_follow_up`;
   - new catalog accessory: `ready`, exact Article Number and `piece`;
   - migrated v1/v2 custom: lossless ready custom with null Article Number;
   - migrated v1/v2 standard: `requires_validation`, null Article Number and complete recoverable customer selection;
   - migrated v2 catalog accessory: `requires_readd`, no guessed Article Number and excluded from batch projection.
4. Preserve entry identity and customer-visible data during migration. Article Number participates in ready-line merge identity; quantity and entryId do not. Keep positive safe-integer quantity, deterministic merge/split/remove and last-writer-wins cross-tab behavior.
5. Add a pure, server-owned batch projection/application seam over the A3 DTO: only eligible `ready` or `requires_validation` lines enter one ordered projection; `requires_readd` is excluded. One complete successful response may atomically upgrade migrated standard lines. Any mismatch/failure leaves the prior Basket unchanged. Do not add a same-origin Route Handler, Server Action or browser-to-WordPress call in A4.
6. Carry Article Number into newly added browser data:
   - Product Configuration 2.0 standard option -> public configurator draft -> Basket v3 ready line;
   - custom length remains null plus `sales_follow_up`;
   - RelatedProductCard 2.0 eligible catalog accessory -> direct Basket v3 ready line with quantity one.
   Preserve RelatedProductCard 1.0 behavior and frozen contract bytes.
7. Article Number may be present in HTML/Flight, client state, storage, network/devtools and test data. It must not be deliberately rendered in visible text, accessible names, configurator summaries, recommendation cards, Basket rows, live announcements or customer-facing status copy. Do not use CSS hiding to satisfy this rule.
8. Provide customer-readable recovery states for `requires_validation` and `requires_readd` without exposing raw Article Number, internal UUID, WordPress/database/Feishu identity, raw enum or diagnostic.
9. Preserve the existing B2B flow and current UI geometry unless the migration/recovery state needs the minimum accessible presentation change. No prices, payment, order or Checkout semantics.

## Required proofs

- Strict RED/GREEN evidence for v3 contract/verifier, domain/storage/migration, configured standard/custom add, related accessory add, atomic batch projection/application and non-display presentation.
- Migration matrices for v1 and v2 standard/custom/accessory, exact expiry, oversize, corrupt/unknown fields, duplicate identity and hostile reflective input fail-closed behavior.
- Browser/markup/accessibility proof that Article Number exists in data/storage where expected but is absent from customer-visible and accessible output.
- One A3 batch consumer call for an eligible 1/50 projection and zero `/resolve`, Product Configuration or RelatedProductCard per-line calls; no browser direct WordPress request.
- Preserve package/lock, protected image, TASK-024 artifacts, Product Configuration 2.0 and RelatedProductCard 1.0 contract bytes, `frontend/tsconfig.json` and production `next-env.d.ts` hashes.
- Run all eight verifiers, focused and complete resource-safe Vitest inventory, lint, typecheck, production build and all current production smokes; clean generated residue.

## Explicit exclusions

Do not implement final RFQ intake, customer contact form, submit result, Basket clearing, persistence beyond existing browser Basket, idempotency/HMAC/challenge/rate limits, Feishu, CMS/database changes, deployment, root README/architecture/ADR Planner documents, visual QA, adversarial review, acceptance or Git delivery.

## Evidence and stop gate

Write:

- `FRONTEND_A4_EXECUTION_REPORT.md`
- `FRONTEND_A4_TDD_RED_EVIDENCE.md`
- `FRONTEND_A4_VALIDATION_LOG.md`
- `FRONTEND_A4_DIFF_SUMMARY.md`

Update only directly affected frontend documentation and the frontend worklog. Return one linked `execution_response` and stop at `PASS_FOR_PLANNER_CHECKPOINT` or a precise blocker.
