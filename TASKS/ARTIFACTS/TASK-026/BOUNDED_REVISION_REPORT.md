# TASK-026 Bounded Revision Report

message_id: MSG-TASK-026-ADVERSARIAL-P1-R1-REVISION
delivery_key: MSG-TASK-026-ADVERSARIAL-P1-R1-REVISION:019f88cf-fd7d-7dc1-95f5-98684d793dfb
scope: only Round 1 P1-1 and P1-2
result: executor PASS; pending Planner checkpoint and same-reviewer narrow closure

## P1-1 closure implementation

- Added three real Quote Basket 3.0 source fixtures. The frozen Basket Schema accepts ready standard, ready custom and ready accessory cells, which project exactly to the existing v2 public Basket. Separate valid `requires_validation` and `requires_readd` documents throw `basket_line_not_ready` before projection.
- Added an independent full TASK-025 mixed request/response fixture pair.
- Replaced count/entry-only evidence with the immutable consumer-equivalent binding: count, order, entry ID, kind, unit, quantity, configured path, selection, packaging, resolution and every Article Number location are checked. Exact authoritative output comparison binds current model and all response-owned fields.
- Added a Schema-valid `authoritative_article_number_mismatch` mutation. The authoritative semantic gate now requires configured-standard root/nested Article Number equality and rejects that vector.

## P1-2 closure implementation

- Replaced the permissive canonicalizer boundary with recursive Unicode-scalar validation plus finite-number handling before RFC 8785 serialization. A Schema-valid lone `0xD800` public message now rejects as `invalid_unicode`; the JSON fixture remains interoperable by storing UTF-16 code units and constructing the invalid string only in memory.
- Bound the positive authoritative `payloadDigest` key/version/value to the recomputed fixed v2 HMAC. A Schema-valid altered digest rejects through `assertAuthoritativeSemantics`.
- Added real vector mutations for bad HMAC and bad comparison token; both enter `assertCryptoEvidence` and reject by the declared error. The old “correct value is not zero” label checks were removed.
- Replaced five replay labels with full input/expected-effect tuples and a deterministic evaluator. All five exact decisions/effect orders, first-reservation 30-day anchor, zero pre-reservation state, no extension and no expired indeterminate resend are machine-checked. Mutating an expected replay effect rejects.

## Preserved boundaries

The five v2 Schema files and their public fields were not changed in this revision. TASK-024/025 and all 67 protected paths remain frozen. No architecture/ADR/README, runtime/UI/CMS, dependency, real data, external system or Git action occurred. The original adversarial FAIL report remains historical and unmodified.

## TDD result

Pre-revision probes exited non-zero because mismatched Article Numbers, lone surrogates, arbitrary authoritative digest and replay-label mutations were accepted. After the bounded implementation the same public verifier passes `94/94` checks: `47` positive, `47` negative, zero failures.
