# TASK-020 Protected Baseline

status: `FROZEN_AT_A1`
date: `2026-08-01`
baseline_commit: `7c140448cb723acbe2c3debed844fc5ea4ffb267`

All aggregate values are SHA-256 over lexicographically sorted per-file
`shasum -a 256` output, including repository-relative paths. They describe the
current delivered bytes before TASK-020 frontend production implementation.

## Frozen Product Configuration authority

The frontend Product Configuration snapshot is immutable in TASK-020:

- root: `frontend/src/lib/cms/product-configuration-contract/**`;
- count: `7`;
- aggregate:
  `df7391c60fd16c3db00daa8f81f0e1d7410198ebc2930d4322734e64fe01499f`.

The corresponding TASK-019 WordPress handoff remains authoritative:

- `TASKS/ARTIFACTS/TASK-019/PRODUCT_CONFIGURATION_HANDOFF_MANIFEST.json`:
  `b219e7178104769cf410a430fbfb00cbbf351a8f58365490ad0bd0dbddfa06af`;
- `TASKS/ARTIFACTS/TASK-019/PRODUCT_CONFIGURATION_HANDOFF_CHECKSUMS.sha256`:
  `641dfaaa193bca490243fcadbd8b94e4c8fbbc90ecb59dab6ab476ba7c63dae8`;
- checksum entries: `17/17` PASS at A1.

TASK-020 may statically import and validate against the four local Schema files,
but must not change any snapshot or handoff byte.

## Frozen QuoteLine authority

The complete frontend QuoteLine contract tree is immutable except for a
separate controlled review finding:

- root: `frontend/src/lib/quote-contract/**`;
- count: `10`;
- aggregate:
  `5bb1382d71316690c5b65754ad006343d04b22c34c3ad282bd97112cbd14bf6f`.

The Schema and sample authority subset is independently frozen:

- roots: `frontend/src/lib/quote-contract/schemas/**` and
  `frontend/src/lib/quote-contract/samples/**`;
- count: `9`;
- aggregate:
  `c074468f8791a026a9370da16c853f59218a58b17d057b219a522f1e1bf0f7db`.

TASK-020 may add a client-safe builder only if a directly observed RED proves
that the public construction seam is absent. It must not alter Schema, samples,
safe-integer maximum, identity equality or merge/split semantics.

## Frozen CMS and database boundary

No WordPress or database write is authorized:

- root: `cms/wp-content/plugins/gdhe-site/**`;
- count: `76`;
- aggregate:
  `ded3f93e3d89b903f8e3fba0e687547f7c22d234b87bfc80e2563f73348de098`.

The A1 checks passed WordPress Core, SCF, the 12-table database and all three
contract verifiers. TASK-020 must not change `cms/**`, WordPress content,
Fixture data, uploads, options, terms, posts or migration markers.

## Existing Product Detail slice

The delivered TASK-018 product-detail slice is the controlled modification
surface for this task:

- count: `15`;
- aggregate before TASK-020:
  `15bee2223534b16319fd0a9603966743c39474441d4ffab6a14d4bece3fe0ea2`;
- roots:
  - `frontend/src/app/products/fgd-x15-pvc/**`;
  - `frontend/src/components/product-detail/**`;
  - `frontend/src/lib/cms/server/product-detail/**`;
  - `frontend/src/lib/product-detail/**`;
  - `frontend/src/types/product-detail.ts`;
  - the six existing `frontend/tests/product-detail-*` files.

Only the minimum TASK-020 wiring, page-state extension, Hero action and direct
regressions may change inside this surface. Existing identity, route, protected
media, noindex and production-fail-closed behavior remain mandatory.

## ProductCard and ProductList runtime

The list/card consumer remains protected:

- count: `16`;
- aggregate:
  `4c97f6d696cbaacc48cde312bb454e0a3048c7fba72e0dd80eea2729c04560f2`;
- roots:
  - `frontend/src/app/products/page.tsx`;
  - `frontend/src/components/product-card/**`;
  - `frontend/src/lib/cms/server/product-cards/**`;
  - `frontend/src/lib/product-list/**`;
  - `frontend/src/types/product-card.ts`.

TASK-020 must make zero ProductCard requests from the detail/configuration page
and must not modify these bytes.

Planner evidence correction on `2026-08-01`: final independent validation
found that the A1 document had recorded the wrong aggregate text for this exact
16-file list. `git diff --exit-code` against baseline commit
`7c140448cb723acbe2c3debed844fc5ea4ffb267` proves every protected source byte
is unchanged. Recomputing the declared lexicographically path-sorted per-file
SHA-256 stream produces the corrected aggregate above. This corrects evidence
only; it does not refreeze changed product bytes.

## Package, generated boundary and protected media

- `frontend/package.json`:
  `958e8c8937ef092c75295e8a09de6062059df431e3419a70b5b661706ac02bce`;
- `frontend/package-lock.json`:
  `dda25a9069e1c1b41c4f94393a54d3e9eb3dcfea158fc2b6bbdf06cc1cb852a7`;
- `frontend/next-env.d.ts`:
  `7b550dda9686c16f36a17bf9051d5dbf31e98555b30d114ac49fc49a1e712651`;
- `frontend/public/test-candidates/fgd-x15-protected.png`:
  `9a8ed9fe7145ae582450425be493987ad874d052c176e340d28d7d24bf0d4880`.

No dependency, lockfile, Next configuration, production media allowlist or
protected image byte may change. Any generated `next-env.d.ts` drift must be
restored to this production-build baseline before handoff.

## Explicit TASK-020 additive exceptions

The frontend Lane may add only the implementation and direct evidence described
by `DESIGN.md` and `IMPLEMENTATION_PLAN.md` under the active task's allowed
paths:

- independent Product Configuration server-only consumer files;
- public Product Configuration DTO and preview projection;
- pure QuoteLine builder when its missing seam has a valid RED;
- one `product-configurator` component and local CSS;
- minimum FGD detail-page and Hero wiring;
- TASK-020 tests, validation scripts, docs, README and execution artifacts.

Everything else in the repository remains protected. User-owned
`.codex/config.toml` and historical resume packets are pre-existing unrelated
files and must remain untouched, unstaged and outside TASK-020 inventories.
