# TASK-020 Frontend Planner Checkpoint Round 2 Narrow Revision

## Current result

The Round 1 P1 implementation causes are independently closed: complete latest
summary, eight-field error mapping and scalar standard-to-custom replacement all
pass. Fresh Planner validation reproduced focused `88/88`, full `403/403`, all
three verifiers, lint, typecheck, build and both production smokes.

Planner found one remaining customer-visible P1 before visual QA.

## P1 — Form choices expose internal enum-style labels

The frozen visible-control contract requires customer labels:

- `Ceiling Mount` and `Wall Mount`;
- `Standard Packaging`, `Carton Packaging`, `Large Shrink Wrap`;
- `Customer Logo Printing`;
- `None`, `Single-piece Bagging`, `Paired Interlocking`.

The current form instead renders `Ceiling`/`Wall`, `standard`/`carton`/
`large shrink wrap`, `Logo printing`, and `single bag`/`paired`. The summary
already owns the correct closed labels, so this is presentation drift rather
than a DTO or QuoteLine problem.

## Required minimum correction

1. Use the same closed customer-label authority for both controls and summary;
   do not duplicate a second mapping.
2. Keep every option `value`, Article Number selection, QuoteLine enum and
   builder behavior byte-for-byte semantically unchanged.
3. Add one direct initial-form markup RED/GREEN proving all required customer
   labels appear and the raw enum-style visible labels do not.

## Protected boundary

Only `frontend/src/components/product-configurator/index.tsx`, the directly
corresponding configurator presentation test, existing TASK-020 evidence and
frontend worklog may change. No CSS, A1-A5, builder, DTO, route, Product Detail
facts, ProductCard/ProductList, contract/snapshot/CMS authority, dependencies,
package/lock, root README, Basket, persistence, submission, Feishu, visual QA,
review, Git or deployment.

Run the focused configurator tests, TASK-020 `11/88`-or-later suite, full suite,
three verifiers, lint, typecheck, build, production smokes, protected hashes,
diff and DPG gates. Return one linked execution response for a final independent
Planner checkpoint.
