# TASK-007 A2 Collection Eligibility R4 Diff and Output Summary

## CMS contract

- `gdhe-site` `0.3.4`.
- Collection loads the allowlisted query set, applies the complete public envelope plus unique canonical-route contract, then derives both pagination items and total from the eligible set.
- Published unknown-template, invalid-module and invalid-canonical-path candidates are excluded from both `items` and `total`.
- Contract assertions freeze totals `[3, 3, 3]` and item lengths `[2, 1, 0]` across pages 1, 2 and 3, and verify every item resolves anonymously with the same public UUID.
- CMS-sanitized `safeHtml` on rich text, split media and accordion paths.
- Strict link/CTA, template enum, canonical public path and lowercase UUIDv4 schemas.
- Bounded page modules, relations, navigation depth/count, route manifest and collections.
- Complete 200/304/error header policy and typed transport-status boundary.
- Deterministic three-item Service collection fixtures and request-context echo.

## Evidence

- 18 JSON Schemas.
- 13 successful Golden DTOs.
- 10 canonical error bodies.
- 8 module positive/negative machine fixtures.
- Canonical path, collection determinism and header fixtures.
- Two final 13/13-identical Golden lifecycles.
- Unchanged R3 benchmark evidence and fresh zero-residue evidence.
- Re-frozen manifest and checksum file.

## Documentation

Updated `docs/cms/README.md`, `CONTENT_MODEL.md`, `REST_CONTRACT.md` and `OPERATIONS_AND_ROLLBACK.md`. Root README remained untouched.

## Excluded

No frontend, WordPress Core, SCF source, theme, third-party plugin, real content, GraphQL implementation, review or Git delivery work.
