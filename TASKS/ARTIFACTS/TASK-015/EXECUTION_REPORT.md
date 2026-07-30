# TASK-015 Execution Report

status: `EXECUTION_COMPLETE_AWAITING_PLANNER_VALIDATION`
executed_at: 2026-07-30T09:29:23Z
lane: `frontend`
request: `MSG-TASK-015-FRONTEND-IMPLEMENTATION`

## Outcome

Implemented the confirmed TASK-015 frontend ProductCard contract Snapshot and
offline verifier only. The result is independent from the accepted TASK-008
`/resolve` Snapshot and does not create a ProductCard Transport, runtime
Validator, DTO Adapter, UI, route, cache, SEO implementation or CMS connection.

## TDD

The execution request was read and acknowledged before edits. The first and
only initial edit was
`frontend/tests/product-card-contract-snapshot.test.ts`.

With Node.js `v24.18.0` and npm `11.16.0`, the focused run failed with exit
code `1`, one failed test and:

```text
Error: Cannot find module '/scripts/verify-product-card-contract.mjs'
```

At that point the verifier and ProductCard Snapshot tree did not exist. The
exact RED is recorded in `TDD_RED_EVIDENCE.md`.

The first GREEN run exposed one implementation defect: the checksum file and
handoff manifest contain the same map in different insertion order. The
verifier initially compared raw object serialization and correctly failed.
The minimum correction compares sorted key/value entries. The canonical test
then passed, and the complete focused matrix reached 13/13.

## Implementation

### Independent Snapshot

Created `frontend/src/lib/cms/product-card-contract/` with an exact 13-file
inventory:

- one closed `manifest.json`;
- the exact eight-file TASK-014 ProductCard Schema closure;
- three exact-byte success samples:
  - `all.json` for N items and four action cells;
  - `filtered-empty.json` for zero items;
  - `one-item.json` for one item, frozen totals and non-empty legal
    `series`/`applications`;
- one deterministic six-selector error Snapshot rebuilt from the frozen
  TASK-014 error container.

The manifest records TASK-014, handoff `TASK-014-PRODUCT-CARD-1`, REST API
`1`, Content Schema `3.0.0`, ProductCard Schema `1.0.0`, endpoint
`/wp-json/gdhe/v1/product-cards`, canonical source/Snapshot paths and SHA-256
values.

### Offline verifier

Added `frontend/scripts/verify-product-card-contract.mjs`. It uses only Node.js
built-ins and:

1. validates a closed manifest and fixed version identities;
2. hard-binds both TASK-014 authority paths and their frozen hashes;
3. verifies the 25-entry handoff checksum file against the handoff manifest;
4. rejects non-canonical source/Snapshot authority mappings;
5. checks the exact 13-file Snapshot inventory;
6. follows only the exact local eight-file `$ref` closure;
7. verifies source/Snapshot exact-byte parity and SHA-256;
8. proves the three success identities, 0/1/N, four actions and non-empty
   relations;
9. deterministically rebuilds and verifies the six selected error samples;
10. returns stable count-only success and sanitized failure messages.

The verifier does not access network, WordPress, a database, environment
variables or an absolute repository path.

### Tests and command

The focused test uses temporary repository copies only. It covers:

- canonical PASS;
- Schema authority path substitution;
- handoff manifest and checksum authority path substitution;
- handoff manifest source drift;
- missing, extra and byte-tampered Snapshot files;
- manifest traversal;
- traversing, remote and unknown local `$ref`;
- direct canonical source drift.

Added only this package script:

```json
"verify:product-card-contract": "node scripts/verify-product-card-contract.mjs"
```

No dependency or lockfile change was made.

## Documentation

`frontend/README.md` now documents the independent ProductCard Snapshot,
verification command, authority and mutation boundary, isolation from
TASK-008, and explicit non-goals.

The root `README.md` is Planner-owned for this dispatch and was not edited.
`DIFF_OR_OUTPUT_SUMMARY.md` contains the exact minimal root README delta for
Planner to apply through its own governed scope.

Document impact for frontend-owned documentation is resolved. Root README
impact remains pending Planner synchronization.

## Preserved Boundaries

No change was made to:

- `frontend/package-lock.json` or dependencies;
- `frontend/src/lib/cms/contracts/**`;
- `frontend/scripts/verify-cms-contract.mjs`;
- `frontend/src/app/**`;
- existing Transport, runtime Validator, Adapter or integration route;
- `cms/**`, TASK-014 authority, WordPress or database state;
- root README, Planner state, external systems or deployment;
- Git refs, commit, push, merge, review, acceptance or another task.

## Handoff

The implementation is ready for independent Planner validation. This execution
report is not adversarial review, user acceptance, Git delivery or deployment.
