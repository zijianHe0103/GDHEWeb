# TASK-025 WordPress Planner Checkpoint Round 1

status: FAIL

verdict: `FAIL / P0=0 / P1=2 / P2=1`

## Passing evidence preserved

- The linked WordPress execution response was validated and acknowledged.
- The immutable handoff verifies `52/52`; manifest SHA-256 is
  `0dbdf81c44fccfb04db744587c48886cfda38c0ebc6de4edbf993bc2769e8d0d`
  and checksum-stream SHA-256 is
  `8417b63fc9752959cbe307e49e693606e2a3d82326d74b4cbdd831f37d71222e`.
- An independent temporary-copy lifecycle reproduced different WordPress IDs,
  `10/10` equal evidence hashes and final `0/0/0/0` TASK-025 residue when the
  normal validation path completed.
- Independent Product Configuration `2.0.0` and RelatedProductCard `1.0.0`
  two-lifecycle regressions passed with exact cleanup.
- WordPress Core, SCF and database checks passed. DPG project, messages,
  strict-lane and `git diff --check` gates passed.
- No TASK-025 frontend implementation or TASK-024 artifact mutation occurred.

## P1-1 — mixed Schema roots are not validator-portable

The current `task025-schema-test.py` and both mixed Request/Response roots pass
with the default Anaconda `jsonschema 4.17.3`, but the same full-root validation
fails with the installed system `jsonschema 4.21.1`. The failure is
`_RefResolutionError: Unresolvable JSON pointer: '$defs/articleNumber'` after an
external public-path reference changes the deprecated resolver scope. An
in-memory proof showed that replacing fragment-only internal references with
the exact root `$id` plus fragment makes both Request and Response roots pass
under `4.21.1` without changing their business shape.

Required narrow closure:

1. make all internal mixed-root references explicit and root-identity-bound;
2. add a direct regression that rejects fragment-only ambiguous references and
   validates full positive/negative roots under the available older and newer
   validators without network resolution;
3. refreeze Schema, Golden, determinism and handoff evidence.

## P1-2 — determinism failure path leaves Fixture residue

The independent temporary-copy run intentionally failed after Fixture creation
when its Schema interpreter lacked `jsonschema`. `task025-determinism-test.py`
raised before calling cleanup and left exactly four marked posts, one manifest
option, three `task-025-*` terms and three private-meta rows in the shared test
database. Planner then ran the exact controlled Fixture cleanup and verified
`0/0/0/0` residue before continuing. The normal two-lifecycle path still passes,
but this does not satisfy the frozen exact-rollback boundary for a failed gate.

Required narrow closure:

1. guarantee cleanup through `finally` or an equivalent fail-safe around every
   lifecycle after Fixture creation;
2. add an injected post-create failure regression that proves the original
   failure is re-raised only after exact cleanup and final `0/0/0/0` residue;
3. keep the successful two-lifecycle determinism proof and all runtime bytes.

## P2-1 — current evidence narration is stale

`WORDPRESS_TDD_RED_EVIDENCE.md` still declares
`status: RED captured; GREEN pending` although ten RED/GREEN closures and the
execution response are complete. The active-task, board and project-state
current narration also still waits for the WordPress response.

Required narrow closure: preserve the ten RED histories, update only their
current status, and synchronize Planner-owned checkpoint narration after the
revised response.

## Gate

Frontend remains blocked. Perform only the two bounded WordPress fixes, direct
regressions, fresh validation, exact cleanup and a refrozen handoff, then stop
for Planner Round 2 checkpoint. Do not start frontend, review, Git delivery,
deployment, real-data or external-system work.
