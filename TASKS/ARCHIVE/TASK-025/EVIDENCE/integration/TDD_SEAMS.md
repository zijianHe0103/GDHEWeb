# TASK-025 Confirmed TDD Seams

The exact user confirmation of TASK-025 confirms these public seams. Tests must exercise behavior through them rather than private helpers.

| seam | RED proof | GREEN proof |
|---|---|---|
| RelatedProductCard GET with `schema=2.0.0` | version missing/rejected | eligible accessory emits Article Number; v1 unchanged |
| anonymous mixed validation POST | route/root missing | strict 1..50 request and atomic success/error matrix |
| CMS Product/index/source boundary | conflict candidate accepted | index/source/role/path/config/unit mismatch fails closed |
| real REST request | per-line/subrequest or partial behavior | one request, stable ordered result, zero public subrequests |
| CMS Fixture lifecycle | no representative records | standard/custom/accessory, two IDs, equal hashes, exact cleanup |
| frontend authority snapshot/verifier | snapshot/verifier missing | exact CMS closure, checksums and mutation failures |
| server-only Transport/Validator/Adapter | import/consumer missing | one fixed POST, 5000 ms, zero retry, closed DTO |
| Quote Basket 3.0 domain/storage | v3 and migration missing | exact TTL/size/state/merge/migration rules |
| real configurator/related-product add | standard/accessory lacks Article Number | browser draft stores Article Number while UI does not render it |
| mixed consumer orchestration | N+1 or partial handling | exactly one POST for 1 and 50 lines; zero legacy endpoint calls |
| browser presentation | Article Number visible/accessible | markup and accessible tree omit it; developer data may contain it |
| production boundary | unintended RFQ submission enabled | final intake/Feishu remains absent and production route gates unchanged |

Each vertical slice must record the exact failing test, expected failure reason, minimum GREEN and fresh regression result. Production code must not precede its failing test.
