# TASK-025 WordPress A1/A2 Execution Report

status: Round 1 P1/P2 revision complete; awaiting Planner Round 2 checkpoint

## Planner Round 1 narrow revision

- Both mixed roots now bind every internal `$defs` reference to the exact root
  `$id` plus fragment. Full positive and negative roots pass offline under the
  installed `jsonschema 4.17.3` and `4.21.1`; network resolution is rejected.
- The deterministic lifecycle now guarantees exact Fixture cleanup for every
  failure after creation. The injected failure is re-raised unchanged only
  after cleanup, with an immediate `0/0/0/0` residue proof.
- The original ten RED histories remain intact; RED 11 and RED 12 record the
  two Planner findings before their minimum GREEN.

## Delivered

- RelatedProductCardCollection `2.0.0` on the existing anonymous GET route;
  eligible active catalog accessories expose exact Article Number direct-quote
  data while `1.0.0` remains behavior-compatible.
- A closed private catalog-accessory quote source and repeatable
  `_gdhe_public_article_number_v1` lookup index. Source, index, global ownership,
  role, unit, path and configuration conflicts fail closed.
- Independent Draft 2020-12 MixedQuoteLineValidation Request/Response `1.0.0`
  roots and anonymous read-only `POST /wp-json/gdhe/v1/quote-line-validations`.
- Atomic ordered standard-ready, migrated-standard refresh, controlled custom
  sales-follow-up and catalog-accessory validation for `1..50` lines.
- A removable TASK-025 Fixture, seven success Goldens, sanitized error evidence,
  real loopback HTTP evidence, two-lifecycle determinism and exact cleanup.

## Runtime invariants

- exact `application/json`; raw body maximum `163840` bytes;
- no query parameters, unknown keys, duplicate entry IDs or duplicate complete
  merge identities;
- at most one bounded path query plus one bounded Article Number query, using a
  hard 101-candidate overflow sentinel;
- zero per-line public `/resolve`, Product Configuration or RelatedProductCard
  calls;
- one complete success or one normalized error; every response is `no-store`
  and the POST never emits ETag/304;
- errors contain no submitted Article Number, canonical path, raw body, source
  meta, filesystem path, SQL or exception text.

## Boundaries preserved

Product Configuration `2.0.0`, both frozen RelatedProductCard `1.0.0` Schema
files, Quote Basket/QuoteLine bytes, frontend, TASK-024 authority, WordPress
Core, SCF, real content, Feishu, dependencies and deployment were not changed.
The declared additive `related-product-cards.php` dispatcher seam changed, and
its existing regression uses `9.9.9` rather than the now-supported `2.0.0` as
the unsupported-version negative.

No commit, push, merge, review, acceptance or deployment was performed.
