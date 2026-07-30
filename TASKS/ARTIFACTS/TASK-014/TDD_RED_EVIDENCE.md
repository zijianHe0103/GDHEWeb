# TASK-014 TDD RED Evidence

status: `VALID_RED_OBSERVED`

## Gate

- Branch: `codex/TASK-014-product-card-collection-contract`
- WordPress: `7.0.2`
- GDHE Site before implementation: `0.4.2`
- Content Schema: `3.0.0`
- Test order: the two TASK-014 tests were added and executed before any production implementation or Schema file was added.

## Schema RED

Command:

```text
python3 cms/wp-content/plugins/gdhe-site/tests/product-card-schema-test.py
```

Observed exit: `1`

Expected failure:

```text
FileNotFoundError: .../config/schemas/product-card-collection.v1.schema.json
```

Interpretation: the test reached the frozen Schema closure load and failed because the new root Schema did not yet exist. Python and `jsonschema` loaded successfully; this was not a syntax or environment failure.

## Runtime RED

Command:

```text
wp eval-file cms/wp-content/plugins/gdhe-site/tests/product-card-runtime-test.php --path=cms
```

Observed exit: `1`

Expected failure:

```text
RuntimeException: Expected ProductCard route is not registered.
```

Interpretation: WordPress booted against the local database, REST routes were enumerated, and the test failed exactly because `/gdhe/v1/product-cards` had not been implemented. This was not a database outage, PHP syntax failure or unrelated legacy assertion.

## Authorization to continue

The two independent tests prove the absent Schema and absent route. Minimum GREEN implementation may now begin without weakening either assertion.

## Public-reference identity P1 RED

Revision message:

```text
MSG-TASK-014-WORDPRESS-PUBLIC-REFERENCE-P1-R1
```

The regression was added before changing `gdhe_product_card_public_reference()`. It passed a unique, publicly resolvable category path together with a different valid UUIDv4 and required the shared helper to reject it.

Command:

```text
wp eval-file cms/wp-content/plugins/gdhe-site/tests/product-card-contract-test.php --path=cms
```

Observed exit: `1`

Expected failure:

```text
RuntimeException: Public reference accepted a UUID that differs from its resolved target.
```

Interpretation: WordPress, the TASK-014 Fixture, REST registration and public-path resolution all loaded successfully. The failure occurred only because the helper accepted an independently valid source UUID without binding it to the resolved target `_gdhe_public_id`. This is the Planner checkpoint defect, not a syntax, database, Fixture or unrelated assertion failure.

## Frontend handoff P1 one-item RED

Revision message:

```text
MSG-TASK-014-WORDPRESS-FRONTEND-HANDOFF-P1-R1
```

The regression assertion was added before adding the `per_page=1&page=1` runtime case.

Command:

```text
wp eval-file cms/wp-content/plugins/gdhe-site/tests/product-card-contract-test.php --path=cms
```

Observed exit: `1`

Expected failure:

```text
RuntimeException: Real anonymous one-item ProductCard response is missing.
```

Interpretation: WordPress, the existing 17-post Fixture, all seven prior successful requests and route headers loaded successfully. The failure occurred only because the authoritative runtime suite did not yet contain a real anonymous one-item response.

## Frontend handoff P1 positive-relation RED

After adding the one-item request and its status/header/pagination assertions, the suite was rerun before changing the Fixture.

Observed exit: `1`

Expected failure:

```text
RuntimeException: Valid identity-bound series/applications references are missing.
```

Interpretation: the real one-item request now succeeded, while the unchanged valid Fixture card still emitted empty `series` and `applications`. The failure precisely proved the missing legal non-empty relationship evidence; mismatch rejection remained independently covered.

## Adversarial R1 route-role RED

Continuation message:

```text
MSG-TASK-014-WORDPRESS-ADVERSARIAL-P1-R1-CONTINUATION
```

Before changing the public-reference helper or Fixture paths, the regression constructed references from the existing published Fixture targets. UUID, unique path, complete public envelope and UUID/path identity were all valid; only the semantic role was wrong.

Command:

```text
wp eval-file cms/wp-content/plugins/gdhe-site/tests/product-card-contract-test.php --path=cms
```

Observed exit: `1`

Expected failure:

```text
RuntimeException: Public reference accepted a valid target under the wrong route role for primaryCategory.
```

Interpretation: the helper accepted an application target as a primary category because it had no role-aware route check. This was not a missing target, invalid UUID, path syntax, database or envelope failure.

## Adversarial R1 pagination-overflow RED

After role-aware validation and corrected Fixture paths were GREEN, two anonymous request negatives were added before changing pagination parsing:

- a 100-digit `page`, which cannot be represented as a native integer;
- `page=PHP_INT_MAX&per_page=100`, whose offset cannot be represented as a native integer.

Observed exit: `1`

Expected failure:

```text
TypeError: array_slice(): Argument #2 ($offset) must be of type int, float given
```

Interpretation: the request reached the real anonymous route and reproduced the reviewer finding. The old parser saturated the decimal text and the unchecked offset became a float instead of returning the documented normalized pagination error.
