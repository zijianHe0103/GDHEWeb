# RFQ Implementation Sequence After TASK-024

status: proposed follow-up sequence; no task is created or authorized by this document

## Sequencing principle

Each follow-up closes one independently testable risk. No task silently expands into a full backend, live Feishu integration and final UI at once.

## Step 1 — Public line identity and authoritative mixed-line re-resolution contract

Proposed next task: first freeze the additive public line identity needed for no-detail catalog accessories, then, if separately authorized, implement the minimum server-only CMS contract that resolves up to 50 mixed `configured_product | catalog_accessory` public lines in one bounded request/snapshot.

Must prove:

- stable Product identity and role;
- configured-product `canonical_path` and catalog-accessory `opaque_public_quote_key` without exposing internal UUID/Article Number/WordPress ID;
- a lossless additive Basket/submission version transition for current `2.0.0` accessories; historical Basket `1.0.0/2.0.0` bytes remain frozen;
- exact current standard Article Number or explicit `sales_follow_up` policy;
- custom-length policy;
- authoritative quantity unit;
- catalog accessory identity independent of relationship position;
- whole-batch conflict/ambiguity fail-closed behavior;
- no per-line `/resolve` or Product Configuration N+1;
- no change to public Basket/QuoteLine contracts unless separately accepted.

Stop after contract/runtime evidence and independent review. Do not build the public form or connect Feishu. A current Basket `2.0.0` accessory without the new public key must not be guessed from model, name, catalog path or relation order.

## Step 2 — Next.js server intake with durable stub sink

Implement the same-origin server Route Handler, submission-intent issuer, closed runtime validator, canonical digest, durable idempotency state, rate-limit interface and authoritative batch resolver consumer. Use an isolated deterministic stub sink, not live Feishu.

TASK-024's `schemas/*.json`, `vectors/*.json` and `MACHINE_CONTRACT.md` are the frozen input to this step. The implementation must copy or mechanically generate an equivalent runtime-owned contract and reproduce every fixed request, authoritative-document, receipt, error, HMAC and Basket-snapshot vector before adding the Route Handler. It may choose libraries and durable-store topology, but it may not rename fields, change enum values, reorder precedence, replace RFC 8785/HMAC, move the 30-day anchor or invent another Basket-clear comparison.

Must prove raw-byte limits, 50-line atomicity, same/different-payload concurrency, crash/restart recovery, timeout/indeterminate states, stable public envelopes, secret/server-only isolation and zero browser Article Number leakage.

Stop before public form, challenge procurement and live Feishu.

## Step 3 — Visible English customer form and receipt states

Add the confirmed customer fields to `/request-a-quote/`, request a server intent and submit to the Step 2 intake in Local/Preview only. Implement accessible field errors, challenge placeholder/state, `accepted|processing|error` presentations and exact Basket-clearing rules.

Verify 1440/1024/768/390 plus 320 CSS px reflow, keyboard/focus, screen-reader announcements, reduced motion and no internal data in HTML/Flight/browser storage. Stop for user visual/business-flow acceptance.

## Step 4 — Live Feishu mapping audit

Read the real Feishu Base/table/field/relationship/permission definitions without writing records. Freeze the mapping for customer, lines, stable external RFQ reference, idempotency, delivery/reconciliation state, last meaningful interaction and 24-month retention handling.

Do not guess IDs from screenshots or prose. Stop with a mapping/gap report; no production write.

## Step 5 — Controlled Feishu connector and reconciliation

Implement server-only credentials, one controlled write path, external identity, durable delivery states and ambiguity reconciliation against an isolated/test Feishu scope. Prove exactly-once business behavior across timeout, retry, concurrent requests and multi-instance execution.

No browser credentials, WordPress write, partial success or reverse product-master mutation. Stop before production enablement.

## Step 6 — Staging security and operational acceptance

On production-like HTTPS Staging, close:

- public origin and trusted-proxy/source configuration;
- durable store topology, backup/restore and retention jobs;
- selected adaptive-challenge provider and privacy/CSP review;
- secret rotation and least privilege;
- logging/metric redaction and 30d/90d/48h/13mo retention;
- Feishu 10-second and intake 15-second drills;
- malicious payload, 256 KiB, 51-line, replay, SSRF and abuse tests;
- alerting, reconciliation, rollback and incident runbooks;
- final Privacy Policy/legal review.

Only a separate user-approved deployment task may enable the public production route.

## Dependency map

```text
TASK-024 contract
  -> Step 1 public line identity + batch re-resolution
      -> Step 2 server intake + durable stub
          -> Step 3 visible form
          -> Step 4 live Feishu read-only mapping
              -> Step 5 connector + reconciliation
                  -> Step 6 Staging/security/deployment gate
```

Step 3 and Step 4 may proceed in parallel only after Step 2 interfaces are frozen; neither authorizes Step 5.

## Deferred choices

The following remain explicit implementation gates rather than hidden defaults:

- durable store/vendor and multi-instance coordination;
- challenge provider;
- production origin/proxy topology;
- exact Feishu Base/table/field IDs and write permissions;
- whether recovery requires a scheduled worker within Next.js deployment capabilities;
- observability vendor and retention enforcement;
- jurisdiction-specific legal wording and lawful basis.

NestJS is not a deferred default. It may be reconsidered only in a new ADR if measured complexity proves the Next.js-only boundary insufficient.
