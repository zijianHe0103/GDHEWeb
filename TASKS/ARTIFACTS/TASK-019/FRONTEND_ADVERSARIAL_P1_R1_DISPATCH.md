# TASK-019 Frontend Adversarial Round 1 Narrow Revision Dispatch

status: `READY_FOR_FRONTEND_REVISION`
owner: `frontend`
source_review: `FAIL / P0=0 / P1=2 / P2=1`

## Objective

Close only the two independently reproduced frontend P1 findings from
TASK-019 adversarial Round 1. Preserve every frozen authority/snapshot byte,
all business identity semantics and the deferred-capability boundary.

## P1-1 — Canonical authority paths must not follow symlinks

### Required RED

Extend the removable temporary-repository mutation matrix so the current
verifier is proven to accept a byte-identical symlink substitution at each
required class before production correction:

- authority handoff manifest;
- authority checksum file;
- a checksum-listed source;
- a representative Schema source;
- the success Golden source;
- the error source.

At least one case must exercise a symlinked intermediate path segment as well
as final-file substitutions. Tests must clean their own temporary roots and
must not replace live repository files.

### Minimum GREEN

- Add one shared authority-file reader in
  `frontend/scripts/verify-product-configuration-contract.mjs`.
- Validate lexical containment as today, then require the repository root,
  every repository-relative path segment and final authority object to be
  canonical non-symlink filesystem objects.
- Require intermediate segments to be directories and the final object to be a
  regular file; compare canonical `realpath` identity with the expected
  repository-owned pathname before reading bytes.
- Route the handoff manifest, checksum file, every checksum source, every
  authority Schema, success Golden and error authority source through the same
  reader.
- Keep snapshot reads and every frozen authority/snapshot byte unchanged.
- Failure must remain deterministic and must not expose absolute local paths.

Do not introduce a dependency or expand this into a general filesystem
security library.

## P1-2 — QuoteLine quantities must remain exact JavaScript integers

### Required RED

Add direct tests proving the current code incorrectly accepts or returns:

- a quantity above `Number.MAX_SAFE_INTEGER`;
- a non-positive or non-integer quantity passed through the TypeScript seam;
- two individually valid equal-identity lines whose sum exceeds
  `Number.MAX_SAFE_INTEGER`.

The overflow case must demonstrate the current wrong arithmetic result before
the production correction.

### Minimum GREEN

- Add Schema `maximum: 9007199254740991` while retaining integer minimum 1.
- Before cloning or merging, reject any line quantity that is not a positive
  safe integer.
- Before returning a merged line, reject a sum that is not a safe integer or
  exceeds the same maximum.
- Use a stable non-leaking error contract appropriate to this small offline
  helper; do not add basket or submission policy.
- Add exact maximum-accepted and maximum-plus-one/overflow regressions.
- Preserve quantity-excluded identity and all existing equality, order,
  immutability and split/merge behavior.

The safe-integer maximum is a technical representation bound, not a business
MOQ or commercial maximum.

## P2 narration

Planner has already synchronized current task/project/board recovery state.
Frontend may update only direct TASK-019 frontend execution/validation evidence
and its worklog to preserve Round 1 FAIL and record the narrow revision. Do not
edit Planner-owned authority.

## Allowed Product Writes

- `frontend/scripts/verify-product-configuration-contract.mjs`;
- `frontend/tests/product-configuration-contract-snapshot.test.ts`;
- `frontend/src/lib/quote-contract/schemas/quote-line.v1.schema.json`;
- `frontend/src/lib/quote-contract/index.ts`;
- `frontend/tests/quote-line-contract.test.ts`;
- direct TASK-019 frontend docs only if the technical safe bound or verifier
  behavior needs truthful documentation;
- TASK-019 frontend execution artifacts and `LANES/frontend/**`.

## Protected Scope

Do not change CMS/WordPress source, database, handoff authority/checksum bytes,
Product Configuration snapshot bytes or manifest, resolved/custom identity,
Article Number/configuration policy, package/lock/dependencies, runtime
Transport/Validator/Adapter/consumer, app routes/components/UI, root README,
Planner state, external systems, Git or deployment.

## Validation Required Before Response

- new RED evidence and focused GREEN tests;
- direct verifier 4/1/6 against current regular-file authority;
- all new symlink substitution cases fail closed and leave zero residue;
- QuoteLine Schema/sample and equality/merge tests, including safe boundaries;
- existing CMS and ProductCard verifiers;
- full Vitest, lint, typecheck and production build;
- protected hashes/inventories, generated-file cleanup, JSON, diff and DPG
  gates.

Return one linked execution response to Planner. Do not claim review, user
acceptance, Git delivery or deployment.
