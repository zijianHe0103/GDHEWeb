# TASK-025 WordPress CMS Handoff

## Frozen authority

- REST API: `gdhe/v1`
- RelatedProductCardCollection: exact `1.0.0`, additive `2.0.0`
- MixedQuoteLineValidation Request/Response: `1.0.0`
- GET: `/wp-json/gdhe/v1/related-product-cards`
- POST: `/wp-json/gdhe/v1/quote-line-validations`
- POST body: exact JSON, at most `163840` raw bytes, `1..50` ordered lines
- Product candidate graph: at most two bounded queries, 101-candidate overflow
  sentinel, zero public endpoint subrequests
- Fixture: `TASK-025-ARTICLE-NUMBER-BATCH-1`

The immutable machine authority is `WORDPRESS_HANDOFF_MANIFEST.json`. It lists
52 exact source, Schema, documentation, test and evidence paths. Verify it with:

```text
shasum -a 256 -c frontend/src/lib/cms/article-number-batch-contract/fixtures/WORDPRESS_HANDOFF_CHECKSUMS.sha256
```

Manifest SHA-256:
`9bfb794e6dace0e4a15aef5f2d5a755b333482d297d1a071f74bbbb1277bce5f`.

Checksum-stream SHA-256:
`512b27a4b6d42b94cc73f45943b11a4b20ce4d08bd7305382f556e9a0c41e25a`.

Both mixed roots use exact root `$id` plus fragment for every internal
reference and validate offline under the installed `jsonschema 4.17.3` and
`4.21.1`. The lifecycle runner guarantees exact cleanup after every
post-create failure before re-raising the original sanitized failure.

## Consumer boundary

Article Number is public order identity and must still be treated as untrusted
browser input. A consumer may use only the versioned public DTOs; it must not
read private source/index meta, stable Product UUIDs, WordPress IDs or Feishu
identity. One complete mixed batch either resolves in original order or fails
without usable partial results. Frontend and Quote Basket work remains blocked
until Planner independently verifies this checkpoint and dispatches A3.

## Cleanup and non-delivery

The final Fixture residue is zero for posts, options, terms and TASK-025 private
meta, and no loopback 8080 listener remains. This handoff is not review,
acceptance, Git delivery or deployment.
