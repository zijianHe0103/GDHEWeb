# TASK-026 A0 Design

status: PASS candidate; implementation not started

## 1. Smallest contract architecture

```text
validated Quote Basket 3.0
  -> deterministic Public RFQ Submission 2.0 projection
  -> future same-origin Next.js intake
  -> exactly one TASK-025 mixed batch validation
  -> Authoritative RFQ Document 2.0
  -> future controlled persistence and Feishu delivery
```

TASK-026 implements only the contract bundle and its offline verifier. The two future runtime arrows remain descriptions, not executable code.

## 2. Normative bundle

The executor creates only under `TASKS/ARTIFACTS/TASK-026/**`:

- `RFQ_SUBMISSION_V2_CONTRACT.md`
- `BASKET_V3_TO_SUBMISSION_V2_MAPPING.md`
- `SECURITY_AND_IDEMPOTENCY_INHERITANCE.md`
- `schemas/common.v2.schema.json`
- `schemas/public-rfq-submission-draft.v2.schema.json`
- `schemas/authoritative-rfq-document.v2.schema.json`
- `schemas/public-rfq-receipt.v2.schema.json`
- `schemas/public-rfq-error.v2.schema.json`
- `samples/**` and `vectors/**`
- one offline machine verifier and its TDD/validation/execution/diff evidence

All Schema objects are closed. The five-Schema graph uses local file refs only and must run with network resolution disabled. Cross-item uniqueness, merge identity, exact time math, field-error category pairing and authoritative state combinations are semantic verifier gates when JSON Schema cannot express them.

## 3. Projection and batch compatibility

The v2 public line union deliberately matches the frozen TASK-025 mixed request line union. The verifier must prove that every valid projected line can enter the frozen mixed request root without renaming, guessing or a second per-line lookup. It must also prove that a frozen mixed response can produce each authoritative v2 line and that browser Article Number values are not copied around the response.

The public request carries no product display fields. The authoritative document may contain the current public model and path returned by TASK-025, but the public receipt and errors do not expose Article Number or product identity.

## 4. Fixed-vector minimum

Positive evidence covers at least:

- one standard configured product;
- one custom-length configured product;
- one catalog accessory;
- one ordered mixed request;
- the `1` and `50` line boundaries;
- accepted and processing receipts;
- every allowed authoritative status/delivery/attempt cell inherited from TASK-024.

Negative evidence covers at least missing/extra Article Number, a fabricated Article Number on custom length, non-ready Basket states in projection, duplicate entry ID, duplicate merge identity, `0/51` lines, invalid/unsafe quantity, display/internal field leakage, unknown keys, wrong customer/contact combination, cross-domain field errors, invalid authoritative status combinations, bad snapshot token and bad v2 HMAC/comparison token.

## 5. TDD order

1. RED: the v2 root Schema/verifier is absent.
2. GREEN: create the smallest closed public request/common Schema and positive standard/custom/accessory projections.
3. RED/GREEN: add authoritative/receipt/error Schemas and semantic state/error gates.
4. RED/GREEN: add duplicate identity, boundary, leakage and TASK-025 compatibility probes.
5. RED/GREEN: add deterministic RFC 8785, HMAC, comparison-token and Basket-snapshot vectors.
6. Run full offline validation, protected checksums, document checks and DPG gates; stop for Planner checkpoint.

## 6. Documentation ownership

The executor records proposed architecture/ADR deltas in its report but does not edit outside its registered artifact scope. After implementation passes the Planner checkpoint, Planner applies the narrow architecture and decision updates. Root README remains unchanged because no runnable behavior is added.

## 7. Rollback

Delete only `TASKS/ARTIFACTS/TASK-026/**` and the later narrow Planner-owned architecture/decision additions. TASK-024, TASK-025, frontend, CMS, package/lock, real data and external systems remain byte-identical.
