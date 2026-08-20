# TASK-021 WordPress CMS RED/GREEN Evidence

Date: 2026-08-04

## RED 1: missing root Schema

The focused Schema smoke test was added before the root Schema. It exited non-zero with:

```text
RuntimeError: Expected Product Configuration v2 root Schema is missing.
```

Minimum GREEN added the separate closed Draft 2020-12 `product-configuration.v2.schema.json`; the focused smoke and full four-file graph validation then passed.

## RED 2: missing exact route behavior

The WordPress-loaded route test was added before v2 dispatch behavior. It exited non-zero with:

```text
RuntimeException: Product Configuration v2 route behavior is missing.
```

Minimum GREEN added exact `schema=2.0.0` selection on the existing anonymous GET endpoint. With no Fixture, it returns normalized `gdhe_not_found` HTTP 404 with `Cache-Control: no-store`; v1 remains the default/exact `1.0.0` path.

## RED 3: missing eligible projection

After the removable Fixture and success assertion were added, the WordPress-loaded contract test exited non-zero with:

```text
RuntimeException: Eligible Product Configuration v2 did not return 200.
```

Minimum GREEN added the complete-candidate v2 projection, packaging/custom-length policy, deterministic sorting and aggregate uniqueness checks.

## RED 4: inconsistent color identity

A production-class probe using one color code with two labels was added before the consistency check. The old projection exited non-zero with:

```text
RuntimeException: One color code mapped to inconsistent labels.
```

Minimum GREEN binds each normalized color code to one label inside the complete candidate and rejects the entire candidate on conflict.

## Final GREEN

- one anonymous success: `GDHEPRD000172 / 6 m / Ivory White / piece`;
- installation/accessory fields absent;
- six normalized no-store errors and bodyless ETag `304`;
- fourteen invalid/unpublished candidate exclusions;
- global Article Number, per-product choice and stable-identity fail-closed probes;
- distinct products may share the same length/color;
- two different database-ID lifecycles produced the same one Golden hash;
- exact cleanup removed 15 posts, zero terms and zero uploads in each final round.

An early direct-PHP invocation exited at the WordPress guard and a later `wp eval-file` call used the wrong relative path. Neither was counted as RED evidence; both were corrected before the controlled REDs above were recorded.
