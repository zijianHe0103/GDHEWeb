# TASK-021 WordPress Adversarial Exact Decimal P1 Round 1 Report

Date: 2026-08-05

## Result

The CMS/Python half of Adversarial Round 1 P1-1 is locally closed within the exact dispatch. This is a lane checkpoint, not Round 2 PASS, user acceptance or Git authorization.

## Full-root RED

Before changing decimal parsing, the real current Product Configuration v2 root validator received complete copies of the valid runtime Golden with only `lengthMeters` changed. It exited non-zero with the exact failure:

```text
RuntimeError: Exact one-tenth full-root positives failed: [{"lengthMeters":"4.3","message":"4.3 is not a multiple of 0.1"},{"lengthMeters":"5.8","message":"5.8 is not a multiple of 0.1"}]
```

`6.7` passed through the same float-based path. This preserves the observed binary-float inconsistency rather than inferring a scalar-only result.

## Minimum GREEN

Only `product-configuration-v2-schema-validation.py` changed. JSON numbers in the four-file Schema graph and runtime Golden are now parsed with Python `Decimal`; the full-root cases use exact decimal literals. The validator still uses the real Draft 2020-12 root graph and does not implement a separate scalar remainder shortcut.

Final full-root evidence is:

```json
{
  "4.3": true,
  "5.8": true,
  "6.7": true,
  "6.05": false
}
```

The current `6 m` Golden remains valid. All seven existing negative cases remain rejected, including installation, accessory, internal field, malformed length/color, database ID and wrong Schema version. The exact four-file closure remains unchanged.

Final evidence hashes:

- Python validator: `ca4877ca83e00f55130d003efbfc7eb31522b0f364d774184e0180d1c07b970b`;
- Schema validation JSON: `be7bb37dbbdd97ffb597e3295320a715bdb0c2a0a63083803a752d0c47487b31`.

## Canonical determinism and cleanup

After validator/evidence byte stability, the canonical determinism script ran exactly once. It completed two full create/runtime/Schema/Golden/cleanup lifecycles:

| Round | WordPress post IDs | Golden SHA-256 | Cleanup |
|---|---|---|---|
| 1 | `3148`–`3162` | `014e242585b6eb15ac563ee8dd3efee72ed4b325ac371f1177542ef7dfbfec53` | 15 posts / 0 terms / 0 uploads |
| 2 | `3173`–`3187` | `014e242585b6eb15ac563ee8dd3efee72ed4b325ac371f1177542ef7dfbfec53` | 15 posts / 0 terms / 0 uploads |

Database IDs changed, Golden hashes were identical and public output used no database ID. Final TASK-021/TASK-019/TASK-014/A3 Fixture residue and TASK-021 uploads are zero.

Final determinism SHA-256:

```text
c4e88b48d4e02d79bf1e5d5abdb55f2c564d5757305d03f806ad96032b39b7f5
```

## Final handoff

After determinism stability, the canonical handoff generator ran exactly once. Direct checksum verification contains exactly 20 `OK` entries, and an independent manifest expansion also returns literal `20/20`.

- manifest SHA-256: `11f3db81c1b962c387f731d9c171d2f370ba60bdc3391cc10ec991247120ac09`;
- checksum-stream SHA-256: `fe611983112944edcf214d88a9aefac6cc4fa4b9258f07670870414a919204ca`.

These hashes supersede the intermediate P2 checkpoint hashes as current CMS handoff authority; the historical P2 report remains unchanged.

## Protected boundary

Frozen/current business hashes remained:

- Article Number Schema: `c9da8e10de98c9bc3eb1cb2775afdc81e4b05ef9b397b75b2c1c234a7b91381e`;
- v2 root Schema: `90285bab8483304aa2609f2b31f77ad54ab48732e6979ad8d5616b619e127472`;
- public path Schema: `9f4951888329bd7d989251188e23ef475d6975bedfe1c187d5676feab3c823ce`;
- UUID Schema: `59dbd4173aa8f63ab09b25239b4b8181b394a87de4fb6cdb462ddbdeedbaa1cb`;
- Golden: `014e242585b6eb15ac563ee8dd3efee72ed4b325ac371f1177542ef7dfbfec53`;
- error fixtures: `e5aba50f7560ab89cc3ffcb56458c398ed05fd58026467e4ce20347fa84a2046`;
- runtime validation: `12a0aaeb08643e54cc8f2e9b2403bd446e3d4dc416bfa58dc0b6955a31a9c1e9`.

Product Configuration v1 passed `17/17`. All GDHE Site PHP lint, 16 Python AST parses, 45 JSON parses, WordPress Core, official SCF `6.9.2`, active GDHE Site `0.7.0`, all 12 database tables, diff and DPG project/registry/messages/strict-lane gates passed.

## Changed-file evidence

Byte changes attributable to this revision are limited to:

- `cms/wp-content/plugins/gdhe-site/tests/product-configuration-v2-schema-validation.py`;
- `TASKS/ARTIFACTS/TASK-021/PRODUCT_CONFIGURATION_V2_SCHEMA_VALIDATION.json`;
- `TASKS/ARTIFACTS/TASK-021/PRODUCT_CONFIGURATION_V2_DETERMINISM.json`;
- `TASKS/ARTIFACTS/TASK-021/PRODUCT_CONFIGURATION_V2_HANDOFF_MANIFEST.json`;
- `TASKS/ARTIFACTS/TASK-021/PRODUCT_CONFIGURATION_V2_HANDOFF_CHECKSUMS.sha256`;
- this report and the existing WordPress execution/validation/diff reports;
- `LANES/wordpress_cms/worklog.md`;
- controlled lane message/event files produced by `lane_message.py`.

No frontend, public-draft/QuoteLine symbol, visual evidence, Planner authority, dependency, Schema, Golden, API/PHP/runtime behavior, Fixture business truth, v1 authority, real content, external system, Git or deferred feature changed.
