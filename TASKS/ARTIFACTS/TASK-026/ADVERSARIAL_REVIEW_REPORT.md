# TASK-026 Adversarial Review Report

- review_request: `MSG-TASK-026-ADVERSARIAL-REVIEW-R1`
- review_mode: one complete independent read-only review
- reviewed_at: `2026-08-12T03:19:46Z`
- verdict: `FAIL`
- P0: `0`
- P1: `2`
- P2: `0`
- Planner final validation allowed: `NO`
- permitted follow-up: bounded finding closure only; do not repeat the complete review
- acceptance_or_git_authorization: `NO`

## Outcome

The additive version boundary, frozen TASK-024/TASK-025 bytes, five-file local Schema graph, public DTO privacy boundary, receipt/error shapes, six-field Basket-clear comparison, protected scope and non-implementation boundary all reproduce. The machine bundle nevertheless does not yet provide the single closed future authority required by TASK-026. Two independently reproducible P1 findings remain: the Basket/TASK-025-to-authoritative conversion is not semantically bound, and the claimed RFC 8785/HMAC/replay negative evidence does not validate the declared values or full input domain.

## Findings

### P1-1 — Basket eligibility and TASK-025 authoritative conversion are not closed by the normative semantic gates

The requirements make the complete conversion normative: only submit-ready Basket 3.0 lines may project; one complete TASK-025 mixed request must be validated once; the ordered response must be fully bound; authoritative model/path/Article Number must be response-owned. The design additionally requires the verifier to prove that the frozen response can produce each authoritative line without copying browser Article Number around the response.

Current evidence does not prove those properties:

1. `schemas/authoritative-rfq-document.v2.schema.json:106-118` constrains the configured-standard root `articleNumber` and nested `selection.articleNumber` independently but never requires equality.
2. `verify-machine-contract.cjs:108-111` checks only duplicate entry IDs and idempotency TTL for an authoritative document. An independently mutated standard line with root `GDHEPRD000999` and nested `GDHEPRD000172` remains Schema-valid and passes this delivered semantic gate.
3. `verify-machine-contract.cjs:215-222` reduces TASK-025 binding to request/response Schema validity, count/order/entry equality and one rebuilt Article Number comparison. It does not apply the full immutable consumer binding at `frontend/src/lib/cms/server/article-number-batch/load.ts:40-89`, which also binds kind, unit, quantity, public path, packaging, selection, resolution and Article Number.
4. The advertised non-ready negative at `verify-machine-contract.cjs:179,189-191` starts from an already projected public object and only appends forbidden key `state`. It therefore proves `additionalProperties:false`, not rejection of a real Basket 3.0 `requires_validation` or `requires_readd` source before projection.

Reviewer probe result on current bytes:

```json
{
  "authoritativeSchemaAcceptsMismatchedArticleNumbers": true,
  "deliveredAuthoritativeSemanticGateAcceptsMismatchedArticleNumbers": true,
  "nonReadyNegativeOnlyExercisesUnknownPublicField": true
}
```

Impact: a future conforming implementation can derive one authoritative field from the batch response and another from the browser, or strip a non-ready source state before validation, while still satisfying the published machine gates. That contradicts the promised single authoritative conversion and Article Number trust boundary.

Minimum bounded revision:

- add real Quote Basket 3.0 source-projection fixtures that accept each ready cell and reject `requires_validation`/`requires_readd` before projection;
- add one exact response-to-authoritative semantic conversion/binding gate covering count, order, entry ID, line kind, quantity unit/value, path, selection, packaging, resolution, model and every authoritative Article Number location;
- require configured-standard root and nested Article Number equality and add a mismatch negative;
- preserve the frozen TASK-025 consumer and schemas unchanged; do not implement runtime.

### P1-2 — RFC 8785, payload-digest and replay evidence is non-binding and its negative labels are not real rejection tests

The task requires RFC 8785 canonical bytes, a version-selected HMAC, comparison/snapshot tokens, semantic cross-field validation, deterministic negative samples and the exact inherited replay outcomes. The current verifier recomputes the published happy-path values, but it does not bind them to the authoritative sample or validate the claimed rejection paths:

1. `samples/positive/authoritative-mixed.json:57` stores payload digest `aaaa...`, while `vectors/expected.v2.json:14` freezes `0510704e9ab00f2297ee7a4525e37714229f2fb6076457735b79eae2c060c84d`. The sample still passes because the Schema accepts any 64-hex value and `assertAuthoritativeSemantics` never recomputes or compares it. Replacing the digest with another arbitrary 64-hex value also passes.
2. `verify-machine-contract.cjs:254-255` labels two checks as bad-HMAC and bad-comparison-token rejection, but each merely recomputes the correct value and asserts that it is not 64 zeroes. No bad value is submitted to a normative validation seam, so neither check proves rejection.
3. `verify-machine-contract.cjs:241` proves only that the replay vector has five distinct `keyState` labels. Replacing every expected outcome with arbitrary text still satisfies the gate; precedence, zero pre-reservation business state, the first-reservation anchor, no extension and no automatic resend are not machine-checked.
4. `verify-machine-contract.cjs:43-51` is presented as RFC 8785 canonicalization but accepts an isolated UTF-16 surrogate. The public Schema also accepts that string. RFC 8785 requires invalid Unicode data such as lone surrogates to terminate processing, so a Schema-valid request can produce bytes in this verifier that a compliant future implementation must reject. The published canonicalizer is therefore insufficient for the declared input domain.

Reviewer probe result on current bytes:

```json
{
  "authoritativeSampleDigestMatchesFrozenVector": false,
  "authoritativeSchemaAcceptsArbitraryDigest": true,
  "deliveredAuthoritativeSemanticGateAcceptsArbitraryDigest": true,
  "publicSchemaAcceptsLoneSurrogate": true,
  "localCanonicalizerAcceptsLoneSurrogate": true,
  "replayCountOnlyGateAcceptsArbitraryOutcomes": true,
  "independentlyRecomputedHmacMatchesVector": true
}
```

Impact: the published happy-path digest is reproducible, but the normative bundle admits multiple authoritative digests and divergent Unicode behavior, while the named HMAC/comparison/replay negatives can pass without testing their claimed failures. This is not a sufficient unique machine boundary for the future intake.

Minimum bounded revision:

- make the v2 canonicalization gate RFC 8785-compliant for the complete Schema-valid domain, including fail-closed lone-surrogate vectors;
- bind the authoritative positive sample to the frozen version-selected HMAC and add an altered-digest rejection through the actual semantic validator;
- replace the zero-value assertions with real bad HMAC/comparison-token rejection probes;
- validate the exact five replay tuples and their ordered effects, including zero state, the `2592000000 ms` first-reservation anchor, no replay extension and no expiry resend;
- preserve v1 vectors and runtime as frozen/out of scope.

## Passing boundaries independently reproduced

- Bundled Node `24.14.0` reran the TASK-026 verifier: exactly five strict Draft 2020-12 Schemas, 63 closed local references, 29 positive checks, 21 reported negative checks, 50 total checks and zero harness failures. The two findings above concern what those checks prove, not whether the current harness exits successfully.
- The TASK-024 verifier independently passed with five Schemas, 61 local references, 12 positives, 6 negatives and 2 fixed crypto vectors. V1 remains byte-frozen and distinct from v2.
- The TASK-025 Article Number and Quote Basket 3.0 verifiers passed; the immutable handoff passed `52/52` with manifest `9bfb794e6dace0e4a15aef5f2d5a755b333482d297d1a071f74bbbb1277bce5f` and checksum stream `512b27a4b6d42b94cc73f45943b11a4b20ce4d08bd7305382f556e9a0c41e25a`.
- All 67 protected hashes passed; the checksum inventory contains 67 unique paths. Restricted frontend source/test/package/lock and CMS status/diff are empty.
- All 13 TASK-026 JSON files parse; the artifact tree has zero symlinks and zero empty files.
- Standard/accessory Article Number remains public-but-untrusted; custom stays `null / sales_follow_up`; receipts/errors exclude Article Number, customer details, product identity and diagnostics; the six individual Basket snapshot mutations all retain the Basket in the reviewer probe.
- Customer/contact, privacy, same-origin Next.js-only, abuse, atomicity, receipt/error and retention rules remain documentary inheritance only. No form, Route Handler, persistent store, WordPress/Feishu call, runtime clear, dependency change, external action, Git delivery or deployment was added or claimed.
- `frontend/.next` and `frontend/tsconfig.tsbuildinfo` are absent; port 3000 has no listener.
- Project validation, lane registry validation, controlled-message validation, strict lane audit and `git diff --check` all pass.

## Decision

`FAIL / P0=0 / P1=2 / P2=0`.

Planner may not enter final validation or acceptance preparation on this report. The only authorized reviewer follow-up is a narrow closure confirmation for the two findings after bounded artifact-only revision and fresh Planner validation. This report does not authorize repair by the reviewer, runtime implementation, user acceptance, Git delivery or deployment.

---

## Narrow Finding Closure — 2026-08-12

- closure_request: `MSG-TASK-026-ADVERSARIAL-FINDING-CLOSURE`
- closure_mode: same-reviewer check of Round 1 P1-1 and P1-2 only; not a second complete review
- reviewed_at: `2026-08-12T03:43:32Z`
- current_closure_verdict: `PASS`
- verdict: PASS
- current_P0: `0`
- current_P1: `0`
- current_P2: `0`
- Planner final validation allowed after linked response ACK: `YES`
- acceptance_or_git_authorization: `NO`

The complete Round 1 `FAIL / P0=0 / P1=2 / P2=0` above remains immutable history. This section records only whether those two findings are now closed.

### P1-1 closure — PASS

Current executable evidence closes the Basket eligibility and TASK-025 authoritative-binding gap:

- `verify-machine-contract.cjs:181-215` first validates a real frozen Quote Basket 3.0 document, rejects every non-ready line before projection, and maps the ready standard, custom and accessory cells into the exact public v2 Basket.
- The three source fixtures independently validate against the frozen Basket Schema. The ready fixture projects byte-structurally to the existing public Basket; the valid `requires_validation` and `requires_readd` fixtures both throw `basket_line_not_ready` before a public projection exists.
- `verify-machine-contract.cjs:217-252` validates the complete frozen TASK-025 request/response and binds count, array order, entry ID, kind, unit, quantity, configured path, selection, packaging, resolution and every Article Number position. Exact response-to-document comparison additionally binds current model and the complete authoritative line.
- An isolated reviewer probe used the current exported lexical gates and attacked response and authoritative sides separately. It rejected count, order, entry, kind, unit, quantity, path, selection, packaging, resolution, model, standard root/nested Article Number, custom root/nested Article Number and accessory Article Number mutations.
- The configured-standard root/nested mismatch remains Schema-valid, then rejects specifically as `authoritative_article_number_mismatch` through `assertAuthoritativeSemantics` at `verify-machine-contract.cjs:148-160`.

Independent closure probe: `67/67 PASS`, zero failures. The first 43 checks cover real source projection and the full bidirectional field mutation matrix for P1-1.

### P1-2 closure — PASS

Current executable evidence closes the canonicalization, digest and replay gap:

- `verify-machine-contract.cjs:53-92` recursively rejects unpaired high or low UTF-16 surrogates before canonicalization. The reviewer constructed an isolated `0xD800` only in memory, confirmed the unchanged public Schema accepts the document structurally, and confirmed the semantic gate rejects it as `invalid_unicode`.
- Independent Node `crypto` recomputation produced `0510704e9ab00f2297ee7a4525e37714229f2fb6076457735b79eae2c060c84d`. The positive authoritative sample now carries exactly that value and key version.
- A Schema-valid altered authoritative digest rejects as `authoritative_payload_digest_mismatch`. Separately altered HMAC and comparison-token vectors enter `assertCryptoEvidence` at `verify-machine-contract.cjs:254-274` and reject as `hmac_mismatch` and `comparison_token_mismatch`; these are real gate calls, not non-zero label checks.
- `verify-machine-contract.cjs:276-327` evaluates the exact ordered five replay tuples. The reviewer independently matched every effect object, inverted one expected effect in each of the five tuples and observed `replay_effect_mismatch` every time.
- The fresh reservation expires exactly `2592000000 ms` after creation; a one-millisecond bad anchor rejects as `invalid_first_reservation_anchor`. The pre-reservation rejection has no durable state or timestamps, an unexpired replay preserves the original expiry with `replayExtendsExpiry:false`, and expired indeterminate state performs zero downstream dispatches with `automaticResend:false`.

The remaining 24 reviewer checks cover the original Article Number semantic gate, lone-surrogate gate, independent HMAC, authoritative digest, bad HMAC/comparison and all replay effects. All passed.

### Frozen bytes and scope

The five Schema bytes were compared against the exact pre-revision captures from the initial complete-review transcript. Every reconstructed SHA-256 equals the current file:

| Schema | SHA-256 | Match |
|---|---|---|
| `authoritative-rfq-document.v2.schema.json` | `6335baa0bcaf4f7f9dec8692d47d0116b5676f90f8a3afdd40872bc8aced3de3` | yes |
| `common.v2.schema.json` | `5d9804907603bb4ca10bf543374a4992e2899ebdf8f0f7c22ab8d4cc2b19cf82` | yes |
| `public-rfq-error.v2.schema.json` | `bb9fe3ff8fcdd32e67daf4c9f2edfea0c0c945b129917bdc057e9070b9a10f99` | yes |
| `public-rfq-receipt.v2.schema.json` | `c88d563a8c0cc4ee989851b1de1c868b5c20a33ab3a6449a45a22195bd947f34` | yes |
| `public-rfq-submission-draft.v2.schema.json` | `9bed07807c3a6fe8152fed5e144ab746b88a1329d7e228d317ad575d8d6c1e4e` | yes |

- The supported workspace Node reran the normative verifier: five strict Schemas, 63 closed local refs, `47` positive plus `47` negative checks, `94/94 PASS` and zero failures.
- All 67 unique protected paths pass their frozen SHA-256 inventory. Restricted frontend source/tests/package/lock, CMS, TASK-024 and TASK-025 status/diff remain empty.
- All 20 JSON artifacts parse; TASK-026 contains zero symlinks and zero empty files. Frontend build/cache residue is absent and port 3000 has no listener.
- No form, Route Handler, persistence, frontend/CMS runtime, database, Feishu, dependency, external-system, Git or deployment action entered the bounded revision or this review.
- Project, registry, controlled-message, strict-lane and whitespace/diff gates pass.

### Current closure decision

`PASS / P0=0 / P1=0 / P2=0` for the two bounded findings only.

Planner may perform fresh final validation after the linked closure response is acknowledged. This closure does not replace the historical Round 1 FAIL, repeat already-passing review scope, constitute user acceptance, or authorize commit, push, merge, runtime implementation or deployment.
