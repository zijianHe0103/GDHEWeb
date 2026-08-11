# TASK-025 Independent Adversarial Review Dispatch

## Authority and role

Perform one complete independent read-only adversarial review of the current TASK-025 shared bytes. ACK the controlled request before substantive review. The reviewer may write only the canonical TASK-025 review report, its own lane records and controlled response/recovery messages; it must not repair product code, tests, CMS, documentation, task authority, Planner state, database, dependencies, Git, deployment or external systems.

Return exactly one current verdict: `PASS / P0=0 / P1=0 / P2=0`, or `FAIL` with exact P0/P1/P2 counts, reproducible evidence and the smallest bounded revision. Preserve the historical WordPress Planner Round 1 `FAIL / P0=0 / P1=2 / P2=1` and all later checkpoint history.

## Required review surfaces

1. **Current business authority**
   - Article Number is public, non-sensitive product/order identity and may exist in API, HTML/Flight, client state, browser storage, network requests and developer tools.
   - It remains untrusted client input and is not a secret, credential, permission or anti-forgery token.
   - It must not be deliberately rendered in ordinary visible UI, accessible names, configuration summaries, recommendation cards, Basket rows, live announcements, recovery copy or customer receipts.
   - No opaque public quote key remains in the current route. TASK-024 v1 artifacts remain immutable history; Decision 49 and the current architecture text must clearly supersede only the conflicting future route.

2. **WordPress Article Number authority and mixed batch contract**
   - RelatedProductCard `1.0.0`, Product Configuration `2.0.0` and other protected versions remain unchanged; RelatedProductCard `2.0.0` is additive.
   - Article Number uniqueness, publication/quote eligibility, product role, product/configuration ownership, path and quantity-unit checks fail closed without guessing.
   - The anonymous no-store POST accepts exact JSON only, `1..50` ordered lines and at most `163840` raw bytes; any invalid line rejects the whole batch without partial success.
   - Configured products and catalog accessories are both covered. Standard lines require exact Article Number; explicit custom length remains null plus `sales_follow_up`.
   - Prove the bounded two-query/101-candidate and zero public `/resolve`, Product Configuration or RelatedProductCard subrequest boundaries, deterministic two-lifecycle evidence, failure-path cleanup, zero residue and final `52/52` handoff.
   - Reproduce the closed eleven-Schema graph under the declared independent validators without network resolution.

3. **Frontend A3 server-only consumer**
   - Verify exact CMS manifest/checksum binding, local closed snapshot, authentic runtime validation and semantic binding, opaque wrapper, deep-frozen DTO and sanitized errors.
   - Browser or Client Components cannot import the Transport/Validator/Adapter/orchestration boundary or call WordPress directly.
   - One-line and fifty-line flows each perform exactly one fixed mixed validation POST and zero legacy per-line calls.

4. **Frontend A4 Quote Basket `3.0.0`**
   - It is an independent additive contract and uses the existing storage key, exact 30-day TTL, `262144` UTF-8 ceiling, positive-safe-integer quantity, deterministic identity/merge and last-writer-wins behavior.
   - v1/v2 migration is exact: old standard becomes `requires_validation`, old custom remains ready/null/sales_follow_up, old accessory becomes `requires_readd`; no name/model/image/category/order inference is permitted.
   - New configured standard and RelatedProductCard `2.0.0` accessory lines carry Article Number; new custom stays null/sales_follow_up.
   - Article Number participates in ready-line identity but is omitted from deliberate visible/accessibility output; recovery copy also excludes UUID, raw enums and diagnostics.
   - Only eligible ordered lines enter the server-only batch projection; `requires_readd` is excluded; incomplete/mismatched/failing responses leave the prior immutable Basket unchanged.
   - No parallel hidden Basket, browser-to-WordPress call, new Route Handler, Server Action, final submission or partial application exists.

5. **Regression, scope and truthfulness**
   - Reproduce the final nine verifiers, focused evidence and a resource-safe complete test inventory or an equivalent independently complete proof; do not treat an incomplete unsplit run as PASS.
   - Check lint, typecheck, production build, current production smokes, protected hashes, generated residue and current database/platform boundaries proportionately.
   - Confirm root README, frontend/CMS docs, architecture contract, ADR-006 and decisions index match current behavior and do not claim final RFQ intake, customer form, Basket clearing, persistence, idempotency/HMAC/challenge, Feishu write, deployment or production readiness.
   - Confirm `document_impact=RESOLVED`, `readme_impact=UPDATED`, current task/board/state/message narration and dirty-scope exclusions are truthful.

## Explicit non-authorizations

Review PASS is not user acceptance and does not authorize final Planner validation before response acknowledgement/recovery, `prepare-awaiting-user`, commit, push, merge, deployment, final RFQ runtime, customer form, Feishu integration or any new task.

## Required output

- `TASKS/ARTIFACTS/TASK-025/ADVERSARIAL_REVIEW_REPORT.md`
- One linked controlled `review_response` to Planner with exact verdict and P0/P1/P2 counts.
