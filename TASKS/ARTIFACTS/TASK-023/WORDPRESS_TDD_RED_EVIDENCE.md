# TASK-023 WordPress TDD RED Evidence

Captured: 2026-08-06 before RelatedProductCard production bytes existed.

## A1 root Schema RED

Command:

```text
python3 cms/wp-content/plugins/gdhe-site/tests/related-product-card-schema-test.py
```

Observed exit: `1`

Observed failure:

```text
RuntimeError: RelatedProductCardCollection 1.0 root Schema is missing.
```

## A1 route RED

Command:

```text
wp eval-file cms/wp-content/plugins/gdhe-site/tests/related-product-card-runtime-test.php --path=cms
```

Observed exit: `1`

Observed failure:

```text
RuntimeException: RelatedProductCardCollection REST route is missing.
```

Both failures were caused by the requested missing public seams. No production
Schema, route, fixture, content or database mutation existed when RED was
recorded.

## A2 relation projection RED

After A1 GREEN registered the independent route and root Schema, an isolated
TASK-023 fixture lifecycle was created. The focused relation contract command:

```text
wp eval-file cms/wp-content/plugins/gdhe-site/tests/related-product-card-contract-test.php --path=cms
```

observed exit `1` with:

```text
RuntimeException: Related-product valid fixture request did not return 200.
```

The route still returned its A1 `gdhe_not_found` placeholder and had no relation
projection. The failed lifecycle was immediately cleaned: `11` posts and `3`
terms removed.

## Round 1 public-UUID aggregate identity RED

The revision Fixture added a second distinct, otherwise eligible published
Product post with the same public UUID as `detail_alpha`. The runtime relation
set also retained a repeated `detail_alpha` post and unrelated predecessor and
successor cards. Before production correction, this command:

```text
wp eval-file cms/wp-content/plugins/gdhe-site/tests/related-product-card-contract-test.php --path=cms
```

observed exit `1` with:

```text
RuntimeException: Distinct eligible posts sharing one public UUID did not all fail closed.
```

The first-wins implementation emitted one conflicting card. The RED lifecycle
was immediately cleaned: `12` posts and `3` terms removed, followed by exact
`0/0/0` task post/marker/term residue.

## Error-evidence determinism RED

The canonical two-lifecycle validator was extended to hash
`RELATED_PRODUCT_ERROR_FIXTURES.json` after each complete runtime contract.
Before evidence-only normalization, both lifecycles validated all nine real
runtime `requestId` values as UUIDv4 and cleaned exactly 12 posts plus 3 terms,
but exited `1` with:

```text
errorFixtureHashesIdentical: false
round 1: e884e643ffc70adbda3b9a2c76e3a8a7df3b904ab31027a8ea6d06dc3b39d0cb
round 2: 06f583b58f3573b2b6f5f5d2564781cc67cadaeb691eb9ad953f471436fcda1c
valid: false
```

The four positive Golden hashes were already identical and both lifecycle
residue objects were all zero. This isolated the failure to volatile runtime
request IDs being copied into the saved error evidence.
