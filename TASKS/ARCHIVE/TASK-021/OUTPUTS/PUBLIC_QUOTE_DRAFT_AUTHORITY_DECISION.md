# TASK-021 Public Quote Draft Authority Decision

Date: 2026-08-04

## User decision

The user selected option A after Adversarial Round 1:

> Keep the browser-side Add to Quote result as a public quote draft. Do not create or expose a complete QuoteLine 2.0.0 at this stage.

## Current authority

- Add to Quote replaces one latest browser-memory `PublicQuoteDraft`.
- The draft contains only customer-readable configuration facts needed for display and later re-resolution. It contains no Article Number, stable internal Product UUID, WordPress/Feishu identifier, raw enum, secret or diagnostic.
- Refresh clears the draft. TASK-021 adds no Basket, 30-day persistence, submission request, server session or external write.
- QuoteLine 2.0.0 remains a closed future server-side conversion contract. At final Request a Quote submission in a separately authorized task, the server will re-resolve eligible product/configuration identity, create the complete QuoteLine and apply `articleNumber` or `articleNumber:null + resolution:sales_follow_up` without exposing internal identity to browser storage or Flight bytes.
- The visible button text remains `Add to Quote`; this describes adding a temporary public quote draft, not completing a server-side quotation or order.

## Required revision boundary

Update current requirements, design, acceptance criteria, README, production symbols and UI tests so they truthfully name a public quote draft. Preserve the isolated QuoteLine 2.0.0 Schema/samples/verifier as future server authority. Do not add a network request, persistence, Basket, submission API, Feishu integration or browser-facing internal identity.
