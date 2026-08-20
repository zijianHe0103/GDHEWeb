# TASK-025 WordPress TDD RED Evidence

status: RED/GREEN complete

Production code had not been changed when these tests were introduced.

## RED 1 — missing Schema roots

Command:

```text
python3 cms/wp-content/plugins/gdhe-site/tests/task025-schema-test.py
```

Observed exit: `1`.

Observed failure:

```text
RuntimeError: Missing TASK-025 Schema roots: related-product-card-collection.v2.schema.json, mixed-quote-line-validation-request.v1.schema.json, mixed-quote-line-validation-response.v1.schema.json
```

## RED 2 — missing private source/index and route seams

Command:

```text
wp --path=cms eval-file cms/wp-content/plugins/gdhe-site/tests/task025-route-test.php
```

Observed exit: `1`.

Observed first failure:

```text
RuntimeException: TASK-025 private accessory source/index seam is missing.
```

## RED 3 — mixed refresh exceeded the bounded-query invariant

After the initial route/source GREEN, the behavior test combined one
`refresh_from_selection` configured line with one catalog accessory in one real
REST request. The pre-query counter observed three product-domain candidate
queries and exited `1` with:

```text
RuntimeException: Product-domain resolver exceeded two bounded candidate queries.
```

This RED was captured before changing the resolver query sequence.

## RED 4 — malformed JSON bypassed the stable error envelope

The first expanded determinism lifecycle sent the raw body `{` through the
registered POST route. WordPress Core rejected it before the callback with
`rest_invalid_json`, while the test required
`gdhe_invalid_quote_line_request`. The lifecycle exited `1`; this proved the
route still needed a narrow raw-body pre-dispatch boundary.

## RED 5 — inconsistent duplicate source escaped global uniqueness

A second eligible accessory claimed `GDHEPRD000901` in its private source but
had its public lookup index removed. The initial resolver ignored that invalid
candidate and returned `200`, while the contract test required atomic `409`.
This proved source claims and index validation had to participate in the same
global uniqueness decision.

## RED 6 — conflicting canonical path candidate was ignored

A second published Product was assigned `/products/fgd-x15-pvc/` without a
valid Product Configuration authority. The custom-line request initially
returned `200`; the test required atomic `409`. This proved every candidate on
the requested canonical path must participate in the same eligibility and
uniqueness decision.

## RED 7 — unexpected resolver failure escaped publicly

A test-only product-query hook threw a marker exception during candidate
resolution. The exception escaped the REST seam instead of returning the
sanitized `gdhe_quote_line_validation_unavailable` envelope, and the contract
test exited `1`. The production seam was then wrapped without reflecting the
exception message.

## RED 8 — unknown POST query parameter was accepted

The contract test added `?debug=1` to an otherwise valid POST. The route
returned success instead of the closed `gdhe_invalid_quote_line_request`
envelope, so the test exited `1`. Query parameters are now required to be
empty for this body-owned endpoint.

## RED 9 — runtime accepted an uppercase UUID outside its Schema

The next request used `ABCDEFAB-CDEF-4ABC-8ABC-ABCDEFABCDEF`. Runtime
lowercased and accepted it while the Draft 2020-12 request Schema requires the
canonical lowercase UUIDv4 representation. The contract test exited `1` before
runtime was changed to reject non-canonical casing.

## RED 10 — response Schema allowed an impossible custom state

The Draft 2020-12 test changed a valid custom response to
`resolved_article_number` while retaining null Article Number/custom selection,
and separately uppercased its entry ID. The response root accepted both and the
test exited `1`. The minimum Schema revision binds resolution to the legal
selection/Article Number state and requires canonical lowercase UUIDv4.

## RED 11 — mixed roots used validator-sensitive fragment-only references

The cross-validator/static regression enumerated every fragment-only internal
reference in both mixed roots before the Schema correction. Both Anaconda
`jsonschema 4.17.3` and the installed system `jsonschema 4.21.1` exited `1`;
the regression reported eight ambiguous Request references and nine ambiguous
Response references. This directly guards the root-scope defect that the newer
validator exposed as `Unresolvable JSON pointer: '$defs/articleNumber'` after
following the external public-path reference.

The minimum GREEN binds each of those 17 references to its exact mixed-root
`$id` plus fragment. Complete positive and negative roots now pass under both
installed validators with HTTP(S) resolution handlers set to fail immediately,
so the proof is offline and cannot silently fetch a Schema.

## RED 12 — post-create test failure skipped Fixture cleanup

`TASK025_INJECT_POST_CREATE_FAILURE=1` raised the exact sanitized marker
`Injected TASK-025 post-create failure.` immediately after Fixture creation.
Before the cleanup correction, the command exited `1` and a direct database
count found `4` marked posts, `1` manifest option, `3` TASK-025 terms and `3`
private-meta rows. The controlled Fixture cleanup restored `0/0/0/0` before
the GREEN edit.

The minimum GREEN places all post-create contract, Schema and hashing work in a
`try` whose `finally` always runs the exact Fixture cleanup and residue check.
The same injected failure is re-raised only after cleanup; the regression now
exits `1` with the original marker while the immediate residue count is
`0/0/0/0`.
