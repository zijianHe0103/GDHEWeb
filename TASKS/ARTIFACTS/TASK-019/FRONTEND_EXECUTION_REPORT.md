# TASK-019 Frontend Contract Execution Report

status: `REVISION_R1_COMPLETE_AWAITING_PLANNER_CHECKPOINT`
message: `MSG-TASK-019-FRONTEND-CONTRACT-IMPLEMENTATION`
owner: `frontend`

## Outcome

Delivered two separate offline contract foundations without adding runtime or
visible product behavior:

1. an exact-byte, authority-bound frontend snapshot of WordPress
   `ProductConfigurationDocument 1.0.0`;
2. an independent closed `QuoteLine 1.0.0` inquiry-domain contract with
   deterministic equality and merge semantics.

## Product Configuration snapshot

- Exact four-file Draft 2020-12 closure copied byte-for-byte from the frozen
  WordPress authority.
- Exact FGD X15+PVC Golden copied byte-for-byte; it contains only
  `GDHEPRD000172 / 6 m / Ivory White / piece`.
- Six errors rebuilt from the fixed authority selectors.
- Closed manifest hard-binds the canonical TASK-019 handoff/checksum paths and
  current SHA-256 values.
- Node-built-in-only verifier checks 17 authority checksums, exact inventory
  and byte parity, local `$ref` closure, version/endpoint/query identity and
  frozen success/error semantics.
- Temporary-copy mutation tests fail closed on authority substitution/drift,
  missing/extra/tampered files, traversal, remote/unknown refs, endpoint,
  version, query, second length, duplicate Article Number/public choice,
  guessed accessory, internal field and invalid packaging.

## QuoteLine 1.0.0

- Closed Draft 2020-12 root with mutually exclusive resolved Article Number
  and unresolved custom-length branches.
- Readonly TypeScript types expose only stable public product identity,
  selection, complete track configuration, `piece` and positive integer
  quantity.
- Legal samples cover resolved `GDHEPRD000172 / 6 m / Ivory White` and custom
  `4.3 m / sales_follow_up` with no Article Number.
- Six invalid samples cover zero/fractional quantity, custom fake Article
  Number, excessive custom precision, leaked price and illegal packaging.
- Equality ignores quantity but compares every normalized product, selection,
  installation and packaging field independent of object key order.
- Merge accumulates only identical lines, preserves resolved/custom separation,
  returns deterministic serializable output and does not mutate caller input.

## Documentation impact

`frontend/README.md` and
`docs/frontend/PRODUCT_CONFIGURATION_AND_QUOTE_LINE_CONTRACT.md` document the
offline commands, authority split and deferred UI/storage/submission boundary.

Root README is Planner-owned and was not edited. Proposed exact Planner delta:

> TASK-019 adds an offline Product Configuration 1.0.0 snapshot verifier and
> an independent QuoteLine 1.0.0 contract. Run
> `cd frontend && node scripts/verify-product-configuration-contract.mjs`,
> then `npm test -- tests/product-configuration-contract-snapshot.test.ts tests/quote-line-contract.test.ts`.
> These contracts do not implement a configurator, Quote Basket, persistence,
> inquiry submission, Feishu integration or deployment.

## Preserved boundary

No CMS file/database/content, package/lock, existing snapshot/verifier,
Transport, runtime Validator, Adapter, DTO, app route, component, visible UI,
root README or Planner authority was changed by frontend. No configurator,
basket, persistence, submission, Feishu, review, acceptance, Git or deployment
work was performed.

## Adversarial Round 1 P1 narrow revision

Round 1 remains historically `FAIL / P0=0 / P1=2 / P2=1`; this revision closes
only its two frontend P1 code causes for independent Planner reproduction.

### P1-1 canonical authority reader

`verify-product-configuration-contract.mjs` now routes the handoff manifest,
checksum authority, all 17 checksum-listed sources, every authority Schema,
the success Golden and error source through one reader. The reader requires a
canonical non-symlink repository root, canonical directory intermediates and a
canonical regular final file before bytes are read. Its failures use stable
labels and do not expose absolute paths. Frozen authority, snapshot and manifest
bytes were not changed.

The removable mutation matrix covers repository-root substitution, both root
authorities, a generic checksum source, Schema, success, error and an
intermediate path segment. All eight attacks now fail closed and clean up.

### P1-2 QuoteLine safe-integer quantity

The closed QuoteLine Schema now retains `minimum: 1` and adds
`maximum: 9007199254740991`. `mergeQuoteLines` rejects any caller quantity that
is not a positive safe integer before cloning or identity processing, and
rejects an unsafe merged sum before returning output. Stable `RangeError`
messages disclose no line data. Identity continues to exclude quantity;
ordinary equality, immutability, merge and split semantics are unchanged.

No CMS, authority/snapshot byte, package/lock, existing runtime/UI/route, root
README, Planner state, external system, Git or deployment boundary changed.
