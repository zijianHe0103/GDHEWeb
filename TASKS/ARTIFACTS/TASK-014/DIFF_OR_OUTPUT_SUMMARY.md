# TASK-014 Diff and Output Summary

status: `SCOPED`

## Production contract

- GDHE Site version `0.4.2` to `0.5.0`.
- Added `includes/product-cards.php`.
- Registered `GET /gdhe/v1/product-cards`.
- Added ProductCard endpoint/Schema keys to `config/schema.v3.json`; retained its top-level Content Schema version `3.0.0`.
- Added six ProductCard-owned Schema files and reused the existing UUID/public-path files.

## Test support

- Added isolated TASK-014 Fixture create/show/cleanup commands.
- Added route RED/smoke, runtime contract, Schema, two-round determinism and reproducible handoff checksum tests.
- Added eight Golden responses and machine runtime/error/Schema/determinism evidence; `one-item.json` is a real anonymous endpoint response.
- Public-reference P1 revision binds every source reference UUID to its resolved target stable UUID, aligns the legal category Fixture and adds the `mismatched_reference_id` negative without changing public route/version/field/action contracts.
- Frontend-handoff P1 revision adds two manifest-owned public relation landings and binds one valid card to non-empty legal series/applications; exact cleanup increases from 17 to 19 posts while the three terms and all public contracts remain unchanged.
- Adversarial R1 revision makes the shared public-reference helper role-aware, aligns synthetic category/series paths to TASK-013 authority, and adds three wrong-role negatives.
- Pagination parsing now rejects native-integer and offset overflow before slicing; the normalized error contract is unchanged and request negatives increase from 9 to 11.
- Exactly two reviewer-created `.pyc` files were removed after hash verification; their empty cache directory was removed.

## Documentation

- Updated only `docs/cms/README.md`, `docs/cms/REST_CONTRACT.md` and `docs/cms/OPERATIONS_AND_ROLLBACK.md`.
- Root README and architecture authority documents were not modified.

## Scope exclusions

No changes were made to:

- `frontend/**`;
- WordPress Core, `wp-config.php`, themes or Secure Custom Fields source;
- root `README.md` or `docs/architecture/**`;
- dependencies, lockfiles or environment files;
- Planner-owned Active Task, Project State, Board or lane registry;
- production products, media, users, configuration or external systems.

Pre-existing Planner/reviewer changes in the dirty worktree were preserved and not reverted.

No commit, push, merge, acceptance, review dispatch or deployment was performed.
