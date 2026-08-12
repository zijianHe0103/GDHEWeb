# TASK-028 Frontend A2 Execution Report

result: PASS_FOR_PLANNER_CHECKPOINT
scope: A2 only

## Outcome

Implemented the frozen A2 local intent and public submission boundary without
starting the customer form, browser submission state, receipt UI, Basket clear,
CRM/Feishu, production persistence or deployment.

## Delivered behavior

1. `issueLocalRfqIntent` and `verifyLocalRfqIntent` are server-only and use only
   Node built-ins plus the existing local RFQ config. The opaque token binds
   contract `2.0.0`, exact configured loopback Origin, lower-case UUIDv4 key,
   six source fields, v2 snapshot token, key version, issue time and exact
   30-minute expiry. Signature comparison is constant-time.
2. `POST /api/rfq/intent/` is Node/local-only. Disabled, unset, invalid or
   production config returns empty no-store `404` before body/issuer work.
   Enabled mode enforces exact Origin, bare JSON, 8192 raw bytes, fatal UTF-8,
   one request parse and a closed six-field source snapshot.
3. `projectQuoteBasketV3ToPublicRfqBasket` revalidates a fresh Basket 3.0 clone,
   projects only ready `1..50` lines in source order, maps standard/custom/
   accessory rows exactly, freezes the public result, validates the frozen v2
   public Basket Schema and enforces the 163840-byte ceiling. Display-only and
   internal fields are omitted; it performs zero network calls.
4. `validateLocalRfqIntentResponse` and `buildPublicRfqSubmission` create only
   the closed v2 request: intent/key, authentic A1 success result revalidated by
   A1, authentic projected Basket, validated intent response, fixed privacy
   notice and `{ honeypot: "" }`. The draft passes the delivered v2 runtime and
   the 262144-byte UTF-8 ceiling.
5. The existing intake Route now binds the verifier at the pre-reservation gate.
   Repository lookup/replay remains earlier in the unchanged runtime. A miss
   with invalid intent returns authentic `403 invalid_submission_intent` before
   reservation, mixed validation or Sink delivery.

## Security and truth boundaries

- Secret bytes remain only in the existing server config and issuer/verifier;
  public output contains no key, signature diagnostics or reusable bypass.
- Hostile document/source/body-reader failures are sanitized without attacker
  getter, reflection or coercion reads at the tested server boundaries.
- Public and deep Client Component import negatives cover the server public
  entry, intent module, intake Route and intent Route, with marker-stripped
  positive controls and complete temporary-root cleanup.
- Article Number remains untrusted request data only. No new UI renders it.
- Existing same-key replay remains valid after the 30-minute first-use intent
  expiry; only unseen keys reach intent verification.

## Checkpoint status

`PASS_FOR_PLANNER_CHECKPOINT`. This is not A3 authorization, complete task
review, user acceptance, Git delivery or deployment.
