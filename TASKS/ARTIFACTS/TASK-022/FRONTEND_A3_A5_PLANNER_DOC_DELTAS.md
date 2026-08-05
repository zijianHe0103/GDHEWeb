# TASK-022 Planner-owned Documentation Deltas

The frontend registry write scope excludes each file below. Planner should
apply only these terminology corrections during its checkpoint.

## Root README

In the Product Configuration/Product Detail sections, replace statements that
Quote Basket, 30-day storage and local `/request-a-quote/` are absent. State
that TASK-022 now provides a public-only, non-payment RFQ collection retained
in the browser for 30 days, while final submission and Feishu remain absent.

## Architecture contract section 11

Name the collection `Quote Basket` and clarify two layers:

- browser identity uses only complete public configuration and contains no
  Article Number or internal Product/Media/WordPress identity;
- a future server Request a Quote flow treats every line as untrusted,
  re-resolves Article Number plus complete configuration, then submits once.

Keep the existing no checkout/payment/order rule and do not imply TASK-022 has
implemented final contact intake or Feishu.

## ADR-006 decisions 33-34

Apply the same two-layer clarification. TASK-022 implements only the 30-day
browser-local public Quote Basket and local production-404 page. Article Number
identity, server revalidation, contact data, external submission and Feishu
remain future controlled work.
