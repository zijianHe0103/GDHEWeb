# TASK-024 Planner Feasibility Contract Revision

revised_at: 2026-08-11
status: pending narrow frontend and WordPress read-only re-audit
runtime_implementation: not authorized

## 1. Trigger

The first frontend and WordPress read-only feasibility audits found two contract-shape conflicts and one missing authority seam:

1. Quote Basket `2.0.0` stores protected display media restricted to local `/test-candidates/` paths, so the exact storage document is not a production network-submission contract.
2. The Basket storage ceiling and the original complete RFQ request ceiling were both `262144` bytes, leaving no deterministic room for customer, privacy-notice, intent, idempotency and anti-abuse fields.
3. Existing WordPress routes cannot atomically re-resolve `1..50` mixed configured-product and no-detail catalog-accessory lines, and the current Basket has no independently addressable public identity for an arbitrary accessory.

## 2. Narrow contract correction

- The browser continues to store the frozen Quote Basket `2.0.0`; its bytes and runtime are not changed by TASK-024.
- The network draft contains a derived closed `PublicRfqBasketSubmission 1.0.0`, not the storage document itself.
- The projection preserves the exact source Basket snapshot identity, entry IDs, public resolution identity, submitted choices, packaging, unit and quantity.
- It excludes product model/name, image URL/dimensions/Alt, line creation time and other display-only storage data. The authoritative document may add the current public model only after successful server resolution. Therefore no `/test-candidates/` media path is required or accepted by the RFQ submission projection.
- Configured products use their canonical public product path as their resolution identity.
- A no-detail catalog accessory requires a dedicated opaque public quote key. The key is public and non-secret but must neither equal nor reversibly encode an Article Number, stable Product UUID, WordPress/database ID or Feishu identity.
- Product model/name, category, catalog path, relationship order and image are never accepted as accessory identity.
- Current Basket `2.0.0` cannot supply that accessory key. A later additive Basket/submission version and a separate additive server-only CMS batch-resolution contract are mandatory implementation prerequisites; TASK-024 does not claim either exists today.

## 3. Exact size budget

- `PublicRfqBasketSubmission` canonical UTF-8 ceiling: `163840` bytes (`160 KiB`).
- Complete raw HTTP request ceiling: `262144` bytes (`256 KiB`).
- Fixed envelope reserve: `98304` bytes (`96 KiB`).
- `submissionIntent`: maximum `8192` UTF-8 bytes.
- privacy-notice `version`: maximum `128` Unicode code points.
- `challengeToken`: maximum `16384` UTF-8 bytes.
- The exact final serialized request must still pass the raw-body ceiling. The reserve is not permission to exceed it.
- A locally valid Basket that cannot fit the submission projection remains stored and must be reduced or split; it is never truncated.

## 4. WordPress authority consequence

The future first implementation task must establish, in this order:

1. an opaque public quote key for no-detail catalog accessories and the required additive Basket/submission version transition;
2. one bounded server-only batch request that resolves `1..50` mixed configured-product/accessory identities atomically;
3. exact standard/custom policy, Article Number uniqueness, current publication/eligibility and quantity-unit validation;
4. whole-request failure without per-line public `/resolve`, Product Configuration or RelatedProductCard N+1 loops.

RelatedProductCard remains a source-product recommendation collection and is not reclassified as an arbitrary Basket-line authority.

## 5. Governance and non-authorization

- Both first-round audit request/response pairs are ACKed and in `done`.
- A checked `task_transition.py reopen` was attempted only as a safety check and correctly refused because TASK-024 was already `IN_PROGRESS`, not `AWAITING_USER`; it made no state change.
- No frontend product code, test, dependency, route, CMS/API/Schema, WordPress/database record, Feishu object, secret or deployment setting was modified.
- This correction authorizes only fresh Planner validation and narrow read-only re-audits. It does not authorize implementation, adversarial review, acceptance, Git delivery or deployment.
