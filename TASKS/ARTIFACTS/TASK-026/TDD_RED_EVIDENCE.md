# TASK-026 TDD RED Evidence

## Public root and verifier seam

Command:

```text
node TASKS/ARTIFACTS/TASK-026/verify-machine-contract.cjs
```

Observed before implementation: Node exited `1` with `MODULE_NOT_FOUND` for `TASKS/ARTIFACTS/TASK-026/verify-machine-contract.cjs`. No v2 root or executable seam existed.

## Material semantic seams

Before adding v2 artifacts, a file-existence probe reported and exited non-zero:

```text
RED missing schemas/public-rfq-submission-draft.v2.schema.json
RED missing schemas/authoritative-rfq-document.v2.schema.json
RED missing samples/matrix.json
RED missing vectors/expected.v2.json
```

These freeze the vertical seams for public/common Schema, authoritative/receipt/error semantics, boundary/negative/TASK-025 compatibility probes, and deterministic crypto/snapshot vectors.

## Crypto/snapshot RED after structural GREEN

After five Schemas, samples and semantic/compatibility gates were implemented, the verifier executed 50 checks. All structural, state, negative and TASK-025 compatibility checks passed, while exactly five vector-dependent checks failed:

```text
FAIL RFC 8785 canonical business bytes
FAIL version-selected HMAC vector
FAIL comparison-token vector
FAIL Basket snapshot-token vector
FAIL accepted exact snapshot clears
{"schemas":5,"localReferences":63,"positiveChecks":29,"negativeChecks":21,"checks":50,"failures":5}
```

The non-production v2 values were then independently computed with Node `crypto`, frozen in `vectors/expected.v2.json`, and copied only where the receipt requires the exact token. The next full run was `50/50`, `failures:0`.

## Round 1 P1-1 RED

A fresh pre-revision probe mutated configured-standard root Article Number while leaving the nested selection value unchanged. The frozen Schema accepted it and the process deliberately exited `1`:

```json
{"red":"P1-1","mismatchedRootNestedArticleNumberAccepted":true}
```

Minimum GREEN added source fixtures, exact projection, response binding and the semantic equality gate. The preserved `authoritative_article_number_mismatch` mutation is Schema-valid and now rejects through the real authoritative semantic validator.

## Round 1 P1-2 RED

A second fresh pre-revision probe exercised the existing Schema/canonicalizer/sample/replay-count gate and deliberately exited `1`:

```json
{"red":"P1-2","schemaAcceptsLoneSurrogate":true,"canonicalizerAcceptsLoneSurrogate":true,"authoritativeDigestMismatch":true,"replayCountGateAcceptsArbitrary":true}
```

Minimum GREEN introduced recursive Unicode-scalar validation, positive authoritative HMAC binding, real invalid HMAC/comparison mutations and five executable replay tuples. The resulting verifier run is:

```json
{"schemas":5,"localReferences":63,"positiveChecks":47,"negativeChecks":47,"checks":94,"failures":0}
```
