# TASK-019 WordPress Product Choice Scope P1 Revision Dispatch

message_id: `MSG-TASK-019-WORDPRESS-PRODUCT-CHOICE-SCOPE-P1-R1`
lane: `wordpress_cms`
status: `QUEUED`

## Finding to close

Planner Round 1 checkpoint proved that `gdhe_product_configuration_documents()` uses only `lengthMeters|color.code` for the aggregate public-choice key. Two different stable products with different Article Numbers but the same `6 m / Ivory White` selection are individually valid and then both excluded (`0` instead of `2`).

## Frozen correction

- Article Number remains globally unique across eligible candidates.
- Normalized public-choice uniqueness is scoped to the stable product identity.
- The same stable product may not map one normalized public choice to multiple Article Numbers.
- Two different stable products may share a length/color choice.
- One stable product UUID may map to only one normalized model/name/canonical/
  productKind/quantityUnit identity; conflicting identities fail closed.

## Authorized edits

- Minimum production correction in `includes/product-configurations.php`.
- Direct TASK-019 Fixture/test/handoff/evidence/docs changes required to prove the corrected boundary.
- `wordpress_cms` lane worklog and one linked execution response.

## Required TDD evidence

1. Preserve Planner's failing case as a focused RED or equivalent direct test before production correction.
2. GREEN must prove two distinct stable products, different Article Numbers, equal `6 m / Ivory White`, both remain eligible and each path resolves.
3. Preserve global duplicate Article Number fail-closed.
4. Preserve same-product duplicate public choice fail-closed.
5. Add a focused RED/GREEN for the same stable UUID mapped to conflicting public product identities; every conflicting candidate must be excluded.
6. Re-run two TASK-019 Fixture lifecycles, exact cleanup, 4-file Schema and handoff/checksums.
7. Re-run A3 and ProductCard regressions in an isolated file copy so historical artifacts are not rewritten.
8. Re-run Core/SCF/DB/PHP/JSON/protected scope/diff/DPG gates.

## Forbidden

No frontend, QuoteLine, UI, package/lock, real product/Feishu, WordPress write API, existing Content Schema/ProductCard authority mutation, Git, review, acceptance or deployment.

Return one linked `execution_response`. Planner will independently run Round 2 checkpoint before any frontend dispatch.
