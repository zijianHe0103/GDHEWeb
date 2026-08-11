# TASK-025 Frontend Adversarial Round 1 P1 Revision Report

timestamp: `2026-08-11T13:22:03Z`
request: `MSG-TASK-025-FRONTEND-ADVERSARIAL-P1-R1`
outcome: `PASS_FOR_PLANNER_CHECKPOINT`
scope: only P1-1 and P1-2 from the canonical Round 1 report

The historical Adversarial Round 1 result remains `FAIL / P0=0 / P1=2 / P2=0`. This revision does not rewrite that report or authorize Round 2.

## P1-1 closed — authentic complete response application

- `applyQuoteBasketV3Validation` is now private to `frontend/src/lib/quote-basket/v3/batch.ts` and is reachable only after `validateMixedQuoteLines` has completed the authentic A3 request, Transport, eleven-Schema Runtime Validator, opaque wrapper, Adapter and request/response semantic boundary.
- The production batch module no longer exports any callable surface that accepts a plain `MixedQuoteLineValidationDto` and upgrades Basket state.
- The existing direct helper test was replaced with public `validateQuoteBasketV3` orchestration proof.
- Public loopback regressions reject missing root metadata, missing authoritative line `model`, extra root key, extra line key and an invalid locale. Errors remain stable sanitized A3 contract errors and the original Basket remains byte-for-byte unchanged.
- Complete one-line and fifty-line success, request/response matching, one POST and zero legacy per-line calls remain passing.

## P1-2 closed — canonical UUID compatibility

- The v3 validation ingress now validates and canonicalizes document `writerId`, `mutationId` and every item `entryId` to lowercase before duplicate-entry and merge-identity checks.
- The same ingress covers parsed v1, v2 and v3 storage bytes as well as new v3 mutations. Existing set/remove operations canonicalize an accepted UUID argument before matching.
- UUID semantic identity, customer selection, product data, quantity, dates, state, Article Number and storage rules are unchanged.
- Because item IDs are canonicalized before uniqueness checks, two otherwise legal entries differing only by hexadecimal case fail closed rather than first-winning or silently merging.
- A frozen v2 contract-valid uppercase standard line is migrated to lowercase, projected into the lowercase mixed request, sent in exactly one POST, matched to the canonical response and upgraded to `ready / GDHEPRD000172`.
- Uppercase v1 and v3 ingress plus ordinary lowercase regressions pass. Frozen Basket Schema, mixed request authority and WordPress bytes were not modified.

## Scope result

Only the v3 domain/batch runtime, directly corresponding tests, one narrow frontend README clarification, this evidence and the frontend worklog changed. No CMS, Schema/handoff authority, dependency, package/lock, UI redesign, Planner state, final RFQ, Feishu, Git or deployment work was performed.

The current lane result is `PASS_FOR_PLANNER_CHECKPOINT`, not review PASS, acceptance or final validation authorization.
