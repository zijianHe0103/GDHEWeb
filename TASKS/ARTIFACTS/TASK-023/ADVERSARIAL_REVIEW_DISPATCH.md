# TASK-023 Adversarial Review Dispatch

## Review authority

- Review the current shared TASK-023 bytes read-only.
- Preserve Visual QA Round 1 and Round 2 as `FAIL / severe 0 / obvious 1 / detail 0` and Visual QA Round 3 as `PASS / 0 / 0 / 0`.
- Return `PASS / P0=0 / P1=0 / P2=0` or exact reproducible findings with the minimum bounded revision.
- Do not repair findings. Review PASS is not user acceptance and does not authorize Git, deployment, Feishu integration or the final RFQ submission flow.

## Required challenges

1. WordPress truth and eligibility
   - The source relation is the stored model-level `relationships.products` order.
   - Self, duplicate, unpublished, publish-revoked, invalid ProductCard, hostile media, missing public quantity unit and action mismatch targets fail closed.
   - Detail products retain canonical `View Product`; simple catalog accessories require explicit public `piece` and never receive fabricated track configuration.
2. Network, identity and media isolation
   - Product detail performs one related collection request and zero per-card `/resolve` requests.
   - Browser output and requests contain no WordPress/Feishu origin, internal UUID/ID, Article Number, raw payload, secret, diagnostic or unprotected CMS media.
3. Quote Basket 2.0
   - Quote Basket 1.0 bytes stay frozen; v1 data migrates deterministically to `configured_product` only on the next legal mutation.
   - `catalog_accessory` has a separate public identity, explicit positive safe-integer quantity and no invented length, color, packaging or Article Number.
   - Same identity merges and different identities remain separate without price, payment or checkout semantics.
4. Progressive UI and closed routes
   - Valid cardinalities 0/1/3/4+ preserve authority order, initially reveal at most three and append at most three until the control disappears.
   - Preview-only candidates 1/3/5/7 land on protected, noindex TEST_CANDIDATE pages; candidates 2/4/6/8, accessory and unknown paths stay 404.
   - Default, CMS and every production mode remain closed with zero unintended CMS request.
5. Accessibility and visual evidence
   - Mouse, native keyboard, focus, aria-live and reduced-motion behavior remain usable.
   - Desktop/tablet/mobile grids and candidate landings have no horizontal overflow at the accepted widths, including 320 CSS px.
   - Reproduce the canonical 50/50 visual hashes, the actual JPEG/JFIF encoding disclosure under historical `.png` names, and the complete Round 1/2/3 history.
6. Integrity and governance
   - Reproduce the proportionate Node 24.18.0 focused/full tests, seven verifiers, lint, typecheck, production build and four production smokes.
   - Confirm frozen ProductCard, QuoteLine, Quote Basket 1.0, package/lock, protected media and prior-task evidence remain unchanged.
   - Confirm generated runtime cleanup, declared diff, documentation impact, protected scope and DPG project/message/strict-lane gates.

## Primary evidence

- `TASKS/ACTIVE/TASK-023-related-products-progressive-slice.md`
- `TASKS/ARTIFACTS/TASK-023/REQUIREMENTS.md`
- `TASKS/ARTIFACTS/TASK-023/DESIGN.md`
- `TASKS/ARTIFACTS/TASK-023/PLANNER_PRE_REVIEW_VALIDATION.md`
- `TASKS/ARTIFACTS/TASK-023/WORDPRESS_EXECUTION_REPORT.md`
- `TASKS/ARTIFACTS/TASK-023/WORDPRESS_VALIDATION_LOG.md`
- `TASKS/ARTIFACTS/TASK-023/FRONTEND_EXECUTION_REPORT.md`
- `TASKS/ARTIFACTS/TASK-023/FRONTEND_VALIDATION_LOG.md`
- `TASKS/ARTIFACTS/TASK-023/VISUAL_QA_REPORT.md`
- `TASKS/ARTIFACTS/TASK-023/PROTECTED_BASELINE.md`

## Expected output

- `TASKS/ARTIFACTS/TASK-023/ADVERSARIAL_REVIEW_REPORT.md`
