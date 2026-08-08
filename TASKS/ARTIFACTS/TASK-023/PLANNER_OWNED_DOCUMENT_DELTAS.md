# TASK-023 Planner-owned Documentation Deltas

The frontend lane did not edit these out-of-scope files. Planner should apply the following deltas only after independently validating the checkpoint.

## Root README

Add a short TASK-023 capability note:

> The local FGD X15+PVC Product Detail slice now consumes one complete RelatedProductCard collection and presents a protected `You May Also Need` preview after the configurator. Detail candidates navigate with `View Product`; explicitly eligible catalog accessories can be added to the browser-local Quote Basket with a positive whole-number quantity. Quote Basket 2.0 reads canonical v1 data and writes the configured/accessory union on the next valid mutation. This remains local, noindex and production-404; it is not deployment, final RFQ submission, Feishu sync, price, payment or checkout.

## Architecture contract

Add or amend the frontend consumer section with these exact implemented boundaries:

- fixed anonymous `GET /gdhe/v1/related-product-cards?locale=en&schema=1.0.0&source_path=<canonical path>`;
- one complete collection request and zero per-card `/resolve`;
- exact nine-Schema runtime validation, authentic opaque wrapper and deep-frozen server DTO;
- public Client projection removes all Product/Media/taxonomy UUIDs, timestamps, raw action enums and diagnostics;
- unapproved remote media is rejected before React; production media origin and Next Image allowlist remain a deployment gate;
- related failure omits only the module and cannot remove a ready Product Detail/configurator;
- Quote Basket 2.0 is the closed `configured_product | catalog_accessory` public union, retains the v1 storage key/30-day TTL/256 KiB ceiling/newer-wins rule and writes migrated v1 only on the next valid mutation.

## ADR-006

Append a TASK-023 implementation note:

- WordPress `relationships.products` remains the read-only related-product order authority for this slice; real Feishu-to-WordPress synchronization is still not implemented.
- `You May Also Need` is progressive disclosure over the one already-loaded collection; Show More performs no new request.
- Catalog accessory Add to Quote is collection-only and must not fabricate track configuration, price, payment, checkout or final RFQ submission.
- Production publication remains blocked on approved relation data, approved HTTPS media origin/Next Image allowlist, visual QA, adversarial review and deployment validation.

## Documentation status

Frontend README impact: `RESOLVED`.
Planner-owned root/architecture/ADR impact: `PENDING_PLANNER_APPLICATION`.
