# TASK-023 Frontend A3-A6 Execution Report

Date: 2026-08-06
Lane: `frontend`
Controlled request: `MSG-TASK-023-FRONTEND-RELATED-PRODUCTS-A3-A6`
Outcome: `PASS_FOR_PLANNER_CHECKPOINT`

## A3 — frontend-local RelatedProductCard contract

- Added the exact nine-Schema local closure, four success Goldens and nine normalized error samples copied from the final 26-file WordPress handoff.
- Added a Node-built-in-only offline verifier hard-bound to:
  - handoff manifest SHA-256 `aa466ac6020deb0769d2d63c63bd5927702f99a4e0f26aa72feb42c7e1771284`;
  - checksum stream SHA-256 `b6c5a94e4bbe12f6f2ffa1cd207aee5d6e8ca7d2570b5534dff5cf9cf83e6124`;
  - exact source/snapshot identities and bytes.
- The verifier rejects missing, extra, tampered, traversing, unknown/remote-ref, authority-substituted and source-drift inputs. Existing ProductCard 1.0 bytes and verifier remain unchanged.

## A4 — server-only consumer and Product Detail orchestration

- Added one fixed anonymous English `GET /gdhe/v1/related-product-cards` Transport with canonical `source_path`, `schema=1.0.0`, `no-store`, redirect refusal, 5000 ms timeout, caller-abort distinction, zero retry, one JSON parse, allowlisted metadata, ETag/cache rules and bodyless 304 handling.
- Added the exact static nine-Schema Ajv registry, authentic opaque wrapper, caller-isolated deep-frozen payload snapshot, semantic detail-target/duplicate-identity gates and stable sanitized errors.
- Added a deeply frozen server DTO Adapter.
- Product Detail CMS mode now performs one detail `/resolve`, one Product Configuration request and exactly one complete related-products collection request. It performs zero per-card `/resolve` and zero ProductCard collection requests.
- Related contract/Transport/media failure leaves Product Detail and the configurator available and omits only the recommendation module.
- Public and deep RelatedProductCard server modules fail real Client Component Next builds.

## A5 — Quote Basket 2.0

- Added an independent closed `2.0.0` Schema, mixed success sample, three invalid samples and an offline verifier without changing any Quote Basket 1.0 authority/sample byte.
- Added the immutable `configured_product | catalog_accessory` domain.
- Canonical v1 data is accepted and losslessly mapped to `configured_product` in memory; storage bytes remain v1 until the next valid mutation, which writes canonical v2.
- Preserved the existing storage key, 256 KiB ceiling, exact 30-day TTL and deterministic same-origin last-writer-wins comparison.
- Accessory identity includes the complete public product descriptor, catalog path and quantity unit. Equal identity merges with safe-integer overflow protection; different identity splits; quantity and remove are immutable.
- Accessory lines cannot contain fabricated selection, packaging, length, color or installation data.
- Existing configured-product add/merge and every v1 domain/storage regression remain green.

## A6 — You May Also Need

- Added a server-only public projection that removes Product/Media/taxonomy UUIDs, timestamps, raw CMS actions and diagnostics before Client Component props.
- Unapproved remote CMS media is rejected per target before React. The current final CMS handoff therefore truthfully renders no recommendation module until a production media origin/Next Image allowlist is approved.
- Preview uses seven visibly marked protected local `TEST_CANDIDATE` cards only.
- The module is after the configurator, renders 3/2/1 columns, and is width-safe at 320 CSS px.
- Initial display is at most three. `Show More Products` reveals the next at most three from the already loaded array, with no request, reorder, duplicate or refresh, and disappears when complete.
- Detail cards use `View Product`. Accessories require a labelled positive safe-integer quantity before `Add to Quote`, remain on the page, announce the result and expose `View Quote Basket`.
- The module includes semantic list/article markup, keyboard focus transfer for the disappearing final reveal control, visible focus styles, `aria-live`, reduced-motion handling and sanitized basket failure text.
- No price, payment, checkout, forced bundle, submission or external write was added.

## Documentation impact

`frontend/README.md` is updated. Root README, architecture contract and ADR edits are outside this lane and are specified exactly in `PLANNER_OWNED_DOCUMENT_DELTAS.md`; none was edited.

## Boundaries preserved

- No CMS/database/Feishu/external-system mutation.
- No dependencies, package.json, package-lock, environment file or protected image change.
- No ProductCard 1.0, QuoteLine v1/v2, Quote Basket v1 authority or TASK-014 authority change.
- No visual QA, adversarial review, acceptance, Git delivery or deployment.
- Pre-existing `.codex/config.toml`, `frontend/tsconfig.json`, Planner/WordPress lane and governance changes were preserved.

## Next gate

Planner independently validates current shared bytes and controls the A5 checkpoint. Visual QA and adversarial review have not started.
