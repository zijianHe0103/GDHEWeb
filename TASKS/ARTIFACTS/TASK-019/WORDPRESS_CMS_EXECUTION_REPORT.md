# TASK-019 WordPress/CMS Execution Report

status: `PASS`
messages: `MSG-TASK-019-WORDPRESS-PRODUCT-CONFIGURATION`,
`MSG-TASK-019-WORDPRESS-PRODUCT-CHOICE-SCOPE-P1-R1`,
`MSG-TASK-019-WORDPRESS-STABLE-IDENTITY-P1-R1-CONTINUATION`

## Outcome

GDHE Site `0.6.0` now exposes the additive anonymous read-only endpoint:

```text
GET /wp-json/gdhe/v1/product-configurations
```

It implements the independent closed
`ProductConfigurationDocument 1.0.0` without changing Content Schema `3.0.0`,
ProductCard `1.0.0` or any existing endpoint/version.

## Authority and public result

- closed query: `locale=en`, `schema=1.0.0`, required canonical `path`;
- private mirror: `_gdhe_product_configuration_v1_source`;
- exact four-file Draft 2020-12 closure;
- complete-candidate validation before any public response;
- stable public UUID/canonical/model identity;
- globally unique Article Number;
- normalized public-choice uniqueness scoped to one stable Product UUID, while
  distinct products may share the same length/color;
- one normalized model/name/publicPath/productKind/quantityUnit identity per
  stable Product UUID, with every conflicting candidate excluded;
- deterministic strong ETag, public max-age 60, UUIDv4 request ID and bodyless
  conditional `304`;
- normalized no-store errors;
- no WordPress ID, raw SCF/meta, Feishu record ID, supplier/cost/inventory/
  pricing/internal/audit/diagnostic field.

The removable FGD X15+PVC candidate exposes exactly:

- `GDHEPRD000172`;
- `6 m`;
- `Ivory White`;
- unit `piece`;
- ceiling and wall without changing the track Article Number;
- no guessed mounting accessory;
- the frozen curtain-track packaging policy;
- unresolved custom length with `sales_follow_up` and no Article Number.

No `4.3 m`, `5.8 m`, `6.7 m` or other standard option is public.

## Fixture and determinism

Fixture `TASK-019-PRODUCT-CONFIGURATION-1` creates 13 marker-owned Product
records: one valid candidate and 12 unpublished/ineligible/malformed/duplicate/
guessed/policy/internal-field negatives. A short-lived cross-source duplicate
probe proves global Article Number fail-closed behavior. Two additional
reversible probes prove distinct UUIDs may share `6 m / Ivory White`, while one
UUID cannot map to conflicting public identities. The existing same-product
duplicate-choice negative remains closed.

Two complete create/contract/Schema/Golden/cleanup lifecycles used different
WordPress IDs and produced identical `1/1` Golden SHA-256:

```text
3dba921d26bbab9e586bd8bb8479ab11be9420fc134bac03de255c08fc910fdf
```

Each lifecycle removed exactly 13 posts, zero terms and zero uploads. Final
TASK-019, A3 and TASK-014 options, marker/source meta, terms, termmeta and
uploads are zero.

## Regression and handoff

- Product Configuration: 1 Golden, 6 request errors, 12 candidate exclusions,
  one global Article Number exclusion, same-product choice exclusion,
  distinct-product shared-choice acceptance, stable-identity conflict
  exclusion and 8 Schema negatives;
- A3 isolated full regression: 19-file graph, 15 Goldens, 6 boundary negatives,
  collection totals `3/3/3`, item counts `2/1/0`;
- ProductCard isolated full regression: 8-file graph, 8 Goldens, 11 request
  negatives, 12 candidate exclusions, totals/pages unchanged;
- handoff: 4 Schema files, 1 Golden and 17 exact checksums, all verified;
- WordPress Core, official SCF, 12-table database, PHP, JSON, Python AST,
  protected baseline, route method, scope and diff gates pass.

The first current Core checksum request had a transient WordPress.org TLS EOF;
the immediate standalone retry passed.

## Boundaries

WordPress contains no QuoteLine CPT, field, write route, session, basket or
inquiry record. No frontend, root README, Planner authority, real WordPress
content, real Feishu, external service, dependency, Git delivery, review,
acceptance or deployment work was performed.

Documentation impact is resolved in `docs/cms/**`. This execution is a CMS/API
contract foundation, not a visible configurator or delivered quotation flow.
