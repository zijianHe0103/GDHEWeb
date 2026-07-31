# TASK-019 WordPress TDD RED Evidence

status: `VALID_RED_OBSERVED`

## Gate

The controlled assignment was ACKed before implementation edits. The immutable
pre-Fixture backup was verified at 179,430 bytes with SHA-256
`2cdcecce2e81fdc8c0be6864621a198270f7b25e7c26f1d30129a489036e6df2`;
its dump completion marker was present. A3, TASK-014 and TASK-019 options,
markers and source meta were zero.

## RED 1 — missing root Schema

Command:

```sh
python3 cms/wp-content/plugins/gdhe-site/tests/product-configuration-schema-test.py
```

Observed before adding the authority Schema:

```text
RuntimeError: Expected Product Configuration root Schema is missing.
```

The process exited `1`. Python started successfully; the failure was the exact
missing TASK-019 capability.

## RED 2 — missing REST route

Command:

```sh
wp eval-file cms/wp-content/plugins/gdhe-site/tests/product-configuration-runtime-test.php --path=cms --allow-root
```

Observed against the healthy WordPress/MySQL 3307 runtime before route
registration:

```text
RuntimeException: Expected Product Configuration route is not registered.
```

The process exited `1` after WordPress REST bootstrap. It was not a database,
syntax or sandbox failure.

## Focused negative RED

After the route registration skeleton but before request validation:

```text
RuntimeException: Product Configuration request closure is missing for unknown.
```

After the isolated Fixture existed but before private-source projection:

```text
RuntimeException: Eligible Product Configuration did not return 200.
```

Each RED preceded its minimum production behavior. No QuoteLine, frontend,
real-product or external-system behavior was introduced.

## Round 1 P1 RED — public-choice scope

After adding the focused reversible probe and before changing the aggregate
choice key, two individually valid products with different stable UUIDs,
paths and Article Numbers but the same `6 m / Ivory White` choice failed with:

```text
RuntimeException: Distinct products sharing 6 m / Ivory White were not both eligible.
```

The process exited `1`. The probe was deleted in `finally`; Fixture cleanup
removed 13 posts / 0 terms / 0 uploads and the TASK-019 residue query returned
`0/0/0`.

## Round 1 continuation RED — stable identity conflict

After product-scoping the choice key but before adding the stable-identity
aggregate gate, a second individually valid source reused the FGD UUID with a
different model, name, public path, Article Number and length. The focused test
failed with:

```text
RuntimeException: One stable product UUID mapped to conflicting public identities.
```

The process exited `1`. The conflicting probe was deleted in `finally`; the
same exact Fixture cleanup and `0/0/0` residue proof passed before GREEN.
