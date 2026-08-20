# TASK-019 Design

status: `DESIGN_CHECKPOINT`

## 1. Outcome and authority split

TASK-019 adds two independent closed contracts:

```text
Feishu future product-master sync
  -> WordPress private read-only mirror source
  -> ProductConfigurationDocument 1.0.0
  -> frontend exact-byte snapshot

ProductConfiguration snapshot
  -> future browser configuration selection
  -> QuoteLine 1.0.0
  -> future Next.js server-side revalidation
```

WordPress owns only Product Configuration read facts. `QuoteLine` belongs to the
Next.js inquiry domain. WordPress does not accept, persist or mutate QuoteLine.

This task ends at contracts and offline verification. It does not create a
runtime frontend consumer, visible controls, basket storage or submission.

## 2. Additive WordPress route

Add one anonymous read-only route:

```text
GET /wp-json/gdhe/v1/product-configurations
```

Closed query:

- `locale=en`, default `en`;
- `schema=1.0.0`, default `1.0.0`;
- `path`, required canonical product path.

Unknown query keys fail with `gdhe_invalid_parameter`. Invalid locale, schema or
path reuse the existing normalized error codes. A valid canonical path without
one complete eligible configuration returns `gdhe_not_found`; the public Product
Detail may still exist and use its separately frozen direct-RFQ fallback in a
future task.

Success behavior:

- HTTP `200`;
- `Content-Type: application/json; charset=UTF-8`;
- `Cache-Control: public, max-age=60`;
- UUIDv4 `X-GDHE-Request-ID`;
- strong deterministic `ETag`;
- matching `If-None-Match` returns bodyless `304`.

Errors use the existing closed error envelope and `Cache-Control: no-store`.

Existing `/schema`, `/resolve`, `/collection/{type}`, `/navigation`,
`/route-manifest` and `/product-cards` remain byte/behavior compatible.

## 3. Product Configuration Schema closure

Root:

```text
product-configuration.v1.schema.json
```

Exact planned closure:

1. `product-configuration.v1.schema.json` — response root and nested policy;
2. `article-number-option.v1.schema.json` — one concrete standard choice;
3. `uuid-v4.schema.json` — unchanged existing authority;
4. `public-path.schema.json` — unchanged existing authority.

All files use Draft 2020-12. The root and every nested object are closed with
`additionalProperties: false`. Non-fragment references remain local, cannot
traverse out of `config/schemas/`, and cannot use a remote URI.

The existing Content Schema 3 recursive 19-file graph and ProductCard 8-file
closure must retain exact bytes. The new root is independently versioned and is
not inserted into either existing recursive closure.

`config/schema.v3.json` may receive only additive
`jsonSchemas.productConfiguration` and `endpoints.productConfigurations` keys.
Every pre-existing key/value and version remains unchanged.

## 4. ProductConfigurationDocument shape

Top-level exact fields:

- `apiVersion: "1"`;
- `schemaVersion: "1.0.0"`;
- `locale: "en"`;
- `type: "product_configuration"`;
- `product`;
- `articleNumberOptions`;
- `configurationPolicy`;
- `modifiedAt`.

`product` exact fields:

- `id`: existing stable public UUID;
- `model`;
- `name`;
- `publicPath`;
- `productKind: "curtain_track"`;
- `quantityUnit: "piece"`.

Each `articleNumberOptions` item exact fields:

- `articleNumber`;
- `lengthMeters`;
- `color` as closed `{code, label}`.

Rules:

- `articleNumber` matches the approved business identifier syntax and is unique
  across every eligible Product Configuration source;
- list length is 1–100 and deterministically sorted by numeric length, then color
  code, then Article Number;
- duplicate Article Number fails closed globally; duplicate normalized public
  choice fails closed within one stable product identity, while an equal
  length/color choice on a different stable product remains eligible;
- no option is computed from an attribute Cartesian product;
- current valid Fixture contains exactly
  `GDHEPRD000172 / 6 / ivory-white / Ivory White`.

`configurationPolicy` exact fields:

- `installationMethods`;
- `packaging`;
- `customLength`.

Installation methods are two closed items:

- `ceiling`;
- `wall`.

Each states `changesTrackArticleNumber: false` and
`optionalAccessory: null` in the current Fixture. The future non-null accessory
shape requires stable public UUID, model, name and real Article Number, but is
not emitted until those facts exist.

Packaging exact policy:

- base options:
  `standard|carton|large_shrink_wrap`, required, single selection;
- `logoPrinting` available as one boolean selection;
- protection options: `single_bag|paired`, optional, single selection;
- category scope fixed to `curtain_track`.

Custom length exact policy:

- `enabled: true`;
- `articleNumberResolution: "sales_follow_up"`;
- `minimumExclusive: 0`;
- `maximum: null`;
- `decimalPlaces: 1`;
- quantity unit remains `piece`.

The response contains no prices, totals, conversion factors, packaging-count
formulas, WordPress IDs, raw meta/SCF, Feishu record IDs, supplier fields,
costs, inventory, internal notes or diagnostics.

## 5. Private source and eligibility

Use one versioned private source document:

```text
_gdhe_product_configuration_v1_source
```

It is not registered through generic WordPress REST, is not a wp-admin second
authority, and is not returned raw. A future Feishu sync may atomically replace
this mirror; TASK-019 Fixture may write it only for deterministic testing.

A source is eligible only when all are true:

- WordPress post type `product`, status `publish`;
- local test candidate in `WP_ENVIRONMENT_TYPE=local`, or future production
  source;
- explicit `websiteEligible: true`;
- source version `1.0.0`;
- stable UUID, exact canonical and public model/name are valid;
- source model/canonical agree with the resolved product;
- source declares `productKind: curtain_track`;
- at least one real standard option exists, or the explicit custom-length policy
  is enabled;
- every Article Number is globally unique and every normalized public choice is
  unique within its stable product identity;
- one stable product UUID maps to exactly one normalized model, name,
  publicPath, productKind and quantityUnit identity; any cross-source conflict
  excludes every candidate using that UUID;
- all installation and packaging policy values equal the closed track policy.

Any failure excludes the complete configuration. No partial option list,
placeholder accessory, generated Article Number or guessed fallback is returned.

## 6. FGD X15+PVC Fixture

The TASK-019 Fixture is isolated from A3 and TASK-014:

- independent version, marker, option and cleanup manifest;
- one valid published local test candidate for FGD X15+PVC;
- one exact valid standard option: `GDHEPRD000172 / 6 m / Ivory White`;
- ceiling/wall with null optional accessories;
- complete track packaging policy;
- custom-length policy enabled;
- request Goldens for `200` and conditional `304`;
- normalized request-error fixtures;
- negative candidates covering unpublished/ineligible, wrong model/path,
  duplicate Article Number, same-product duplicate public choice, guessed extra length,
  invalid packaging, Article Number on custom policy, internal fields and
  malformed source.
- one short-lived positive probe proves that two distinct stable products with
  different Article Numbers may share the same normalized length/color choice;

Run two complete Fixture lifecycles with different WordPress database IDs and
identical public Golden hashes. Cleanup must remove only TASK-019 posts, metadata,
options, terms/uploads if any, and markers; A3/TASK-014 residue remains zero.

## 7. WordPress handoff authority

Generate:

- `PRODUCT_CONFIGURATION_HANDOFF_MANIFEST.json`;
- `PRODUCT_CONFIGURATION_HANDOFF_CHECKSUMS.sha256`;
- `PRODUCT_CONFIGURATION_RUNTIME_VALIDATION.json`;
- `PRODUCT_CONFIGURATION_SCHEMA_VALIDATION.json`;
- `PRODUCT_CONFIGURATION_ERROR_FIXTURES.json`;
- `PRODUCT_CONFIGURATION_DETERMINISM.json`;
- `golden-product-configuration/`.

The handoff manifest freezes:

- handoff identity `TASK-019-PRODUCT-CONFIGURATION-1`;
- REST API `1`;
- Content Schema `3.0.0`;
- Product Configuration Schema `1.0.0`;
- endpoint and closed query;
- exact 4-file closure;
- success/error sources;
- checksum inventory.

## 8. Frontend Product Configuration snapshot

After a Planner WordPress checkpoint, create:

```text
frontend/src/lib/cms/product-configuration-contract/
  manifest.json
  schemas/
  samples/success/
  samples/errors/
```

The manifest hard-binds canonical TASK-019 handoff/checksum paths and hashes.
Every Schema/success sample is an exact-byte copy. Selected errors are rebuilt
deterministically from the authority container. The verifier uses Node built-ins
only for authority binding, inventory, hashes, local-ref closure and frozen
semantic proofs.

Mutation tests fail closed for:

- authority path substitution or source drift;
- missing/extra/tampered snapshot bytes;
- manifest or `$ref` traversal;
- remote/unknown `$ref`;
- incorrect endpoint/version/closure;
- a second standard length, duplicate Article Number/public choice, guessed
  accessory, leaked internal key or invalid packaging policy.

No Next.js runtime code imports `cms/**` or `TASKS/**`.

## 9. Independent QuoteLine 1.0.0

Create a standalone closed Schema:

```text
frontend/src/lib/quote-contract/schemas/quote-line.v1.schema.json
```

Exact common fields:

- `contractVersion: "1.0.0"`;
- `product`: stable public UUID, model and canonical;
- `selection`;
- `configuration`;
- `quantityUnit: "piece"`;
- `quantity`: positive integer.

`selection` is exactly one branch:

1. resolved standard:
   - `type: "article_number"`;
   - real `articleNumber`;
   - normalized `lengthMeters`;
   - normalized color code/label.
2. unresolved custom:
   - `type: "custom_length"`;
   - `articleNumber: null`;
   - positive `lengthMeters` with at most one fractional digit;
   - fixed product color code/label;
   - `resolution: "sales_follow_up"`.

`configuration` exact fields:

- `installationMethod: ceiling|wall`;
- `packaging.basePackaging`;
- `packaging.logoPrinting`;
- `packaging.protectionArrangement`, nullable.

The contract does not contain a client-asserted `lineKey`, trusted validation
flag, price, discount, total, conversion factor, packaging count, internal code
or Feishu/WordPress identifier.

Semantic equality excludes `quantity` and compares all normalized product,
selection and configuration fields:

- same resolved Article Number plus identical full configuration merges quantity;
- any configuration difference remains a separate line;
- custom lines additionally compare exact normalized custom length;
- resolved and custom branches never merge.

TASK-019 proves these rules with valid samples and invalid/mutation tests but
does not implement basket state, persistence or submission.

## 10. Documentation and rollback

Documentation updates:

- `docs/cms/REST_CONTRACT.md`;
- `docs/cms/README.md`;
- `frontend/README.md`;
- root `README.md`.

Rollback:

- remove only TASK-019 new Schema/source/Fixture/tests/handoff files;
- revert additive route/manifest/plugin-version lines;
- remove only the new frontend snapshot/verifier/QuoteLine contract/tests/scripts;
- use exact TASK-019 Fixture cleanup before considering its immutable backup;
- never use broad SQL deletion, `reset --hard`, force push or unrelated cleanup.

## 11. Stop conditions

Return to Planner immediately if:

- an existing Schema/Golden/endpoint must change behavior;
- WordPress must become a writable Article Number authority;
- QuoteLine must be stored in WordPress;
- an unconfirmed standard length/accessory must be invented;
- a live Feishu connection, dependency, runtime frontend consumer or visible UI
  is required;
- deterministic cleanup or exact frontend authority binding cannot be proven.
