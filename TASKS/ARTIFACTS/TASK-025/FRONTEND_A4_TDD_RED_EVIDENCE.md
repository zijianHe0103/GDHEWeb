# TASK-025 Frontend A4 TDD RED Evidence

runtime: Node.js `24.18.0`, npm `11.16.0`

Each A4 production seam began with a focused test against the then-current shared bytes.

| Vertical seam | Meaningful RED before implementation | Minimum GREEN |
| --- | --- | --- |
| Quote Basket 3.0 contract | `quote-basket-v3-contract.test.ts` failed with `MODULE_NOT_FOUND` for the missing offline verifier. | Independent closed Schema/samples/manifest/verifier; direct verifier PASS `1/1/6`. |
| Domain and migration | `quote-basket-v3.test.ts` failed because `../src/lib/quote-basket/v3` did not exist. | Exact v1/v2 standard/custom/accessory migration states and legal v3 merge/split semantics PASS. |
| Storage | The storage test initially had no v3 runtime to load the existing key. | Same key, read-without-rewrite, exact 30-day expiry, 262144-byte ceiling and newer-snapshot reconciliation PASS. |
| Configured product | The direct browser-flow test failed because `buildPublicProductConfiguratorDraftV3` was absent. | Standard carries the exact selected Article Number; custom remains null plus `sales_follow_up`; visible markup omits the Article Number. |
| Related accessory | The direct flow test failed because `projectPublicRelatedProductsV2` was absent. | An eligible RelatedProductCard 2.0 direct quote carries its exact Article Number and quantity one into Basket data without visible rendering. |
| Atomic batch | The batch test first failed on the missing `v3/batch` module, then on missing `validateQuoteBasketV3`. | Pure ordered projection/application plus one real A3 POST for 1 and 50 eligible lines, zero legacy per-line calls. |
| Browser v3 integration | The direct adapter test failed because the v2 adapter rejected the v3 ready draft. | Browser adapter, hook, configurator and recommendation actions now use the validated v3 domain/storage seam. |
| Recovery presentation | The focused rendered-markup test failed because quantity `id`/`for` values embedded Basket entry UUIDs. | Index-local control IDs preserve accessible association while recovery markup excludes UUID, Article Number, raw state/resolution and diagnostics. |

Fresh integration also exposed two expected compatibility REDs and they were not hidden:

- `tsc --noEmit` rejected legacy tests that passed v1/v2 drafts to the now-v3 browser adapter; directly corresponding tests were updated to the frozen migration truth (`requires_validation` plus a separate new ready line).
- The real preview response test rejected `GDHEPRD000172` in Flight bytes under the superseded TASK-021 rule. TASK-025 explicitly permits Article Number in HTML/Flight data while forbidding deliberate customer rendering, so the regression now proves the Article Number is present in Flight data and absent from the pre-script visible markup.

One attempted validation command used the unsupported Vitest reporter name `basic` and exited at startup. It made no product edit and is not counted as a test result. Subsequent supported full-suite runs passed.
