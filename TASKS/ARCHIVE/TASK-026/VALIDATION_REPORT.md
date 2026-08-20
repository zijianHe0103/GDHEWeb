# TASK-026 Test and Validation Log

validated_at: 2026-08-12
lane: executor
result: PASS

## Offline machine contract

Command: `node frontend/src/lib/rfq-submission-contract/v2/fixtures/verify-machine-contract.cjs`

Result:

```json
{"schemas":5,"localReferences":63,"positiveChecks":47,"negativeChecks":47,"checks":94,"failures":0}
```

Coverage includes:

- strict Draft 2020-12 compilation for exactly five v2 Schemas;
- 63 relative local/fragment refs, closed against the five-file graph; network resolver disabled;
- real Basket 3.0 ready standard/custom/accessory projection, pre-projection `requires_validation`/`requires_readd` rejection, and generated 1- and 50-line boundaries;
- all six authoritative status/delivery/attempt cells; accepted and processing receipts;
- 47 negative checks spanning Article Number rules, source eligibility, leakage/unknown fields, `0/51`, unsafe quantity, duplicate IDs/merge identities, contact combination, cross-domain errors, full response/authoritative binding mutations, invalid Unicode/digest/crypto/replay and snapshot clearing;
- frozen TASK-025 request/response validation and exact binding of count, order, entry, kind, unit, quantity, path, complete selection/packaging, resolution, model and every Article Number location;
- RFC 8785 Unicode fail-closed behavior, version-selected HMAC-SHA-256 and authoritative digest binding, comparison token, Basket 3.0 snapshot token, v1 inequality, exact 30-day math and five executable replay tuples/effect orders.

The v2 graph is compiled with Ajv strict mode. TASK-025 compatibility is validated against its immutable Schemas with their original non-strictTypes annotations; they are loaded byte-for-byte and never modified or normalized.

The lone-surrogate negative keeps its artifact JSON interoperable: the vector stores UTF-16 code unit `55296`, the verifier constructs the isolated surrogate only in memory, confirms the public Schema still accepts the resulting document, then requires the semantic RFC 8785 gate to reject it as `invalid_unicode`.

## Artifact integrity

- all `20` JSON files parsed with `jq empty`;
- current TASK-026 artifact files: `37`; Schemas: `5`; symlinks: `0`;
- protected baseline: `67/67` SHA-256 entries PASS after implementation;
- `git diff --check`: PASS;
- DPG project validate: PASS;
- lane registry validate: PASS;
- lane messages validate: PASS;
- strict lane audit: PASS, zero issues.

One attempted validation composition was rejected by the lane hook because it redirected diagnostic output to `/tmp`; it created no file. The same checks were rerun using stdout-only pipelines and passed.

## Non-claims

No UI, Route Handler, persistent idempotency state, WordPress/Feishu call, real business submission, Basket-clear runtime, deployment or security control was tested or implemented.
