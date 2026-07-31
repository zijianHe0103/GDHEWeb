# TASK-019 Adversarial Review Dispatch

status: `READY_FOR_INDEPENDENT_REVIEW`
owner: `adversarial_reviewer`

## Objective

Independently challenge the complete TASK-019 Product Configuration and
QuoteLine contract delivery. Do not rely on implementation-lane or Planner PASS
statements without reproducing relevant current-byte evidence.

Return one current verdict:

- `PASS / P0=0 / P1=0 / P2=0`; or
- `FAIL` with exact P0/P1/P2 findings, reproduction, impact and the smallest
  bounded revision.

## Review Scope

1. WordPress Product Configuration authority:
   - additive anonymous GET-only `/wp-json/gdhe/v1/product-configurations`;
   - closed `en / 1.0.0 / canonical path` query and normalized error/cache
     semantics;
   - exact four-file Draft 2020-12 closure and unchanged Content Schema 3 plus
     ProductCard contracts;
   - current FGD X15+PVC output contains only
     `GDHEPRD000172 / 6 m / Ivory White / piece`;
   - custom length remains unresolved and no installation accessory is guessed.
2. Eligibility, identity and business policy:
   - Article Number is globally unique;
   - normalized public choice is unique per stable product UUID, while distinct
     products may share length/color;
   - one UUID cannot map to conflicting public identities;
   - ceiling/wall keep the same track Article Number;
   - track base packaging and protection mutual exclusion are closed;
   - internal, price, supplier, inventory, WordPress ID and Feishu fields never
     enter the public contract.
3. Determinism and cleanup:
   - two different WordPress internal-ID lifecycles produce identical public
     Golden/hash;
   - exact Fixture cleanup and final TASK-019/A3/TASK-014 zero residue;
   - WordPress Round 1 `FAIL / P1=2` history remains preserved and both findings
     are actually closed by Round 2 bytes.
4. Frontend Product Configuration snapshot:
   - exact seven-file inventory, four Schema plus one Golden byte parity and
     all 17 authority checksums;
   - manifest hard-binds the canonical TASK-019 handoff/checksum identities;
   - verifier fails closed for authority/inventory/byte/path/ref/version/query
     drift and forbidden business mutations;
   - no runtime import from `cms/**` or `TASKS/**`.
5. QuoteLine 1.0.0:
   - independent closed website inquiry-domain Schema, not WordPress content;
   - mutually exclusive resolved Article Number and unresolved custom-length
     branches;
   - positive integer quantity, one-decimal positive custom length and exact
     installation/track-packaging fields;
   - quantity excluded from identity; identical full identities merge quantity;
     every relevant configuration difference stays separate; resolved/custom
     never merge; inputs are not mutated;
   - no client-trusted key/status, price, totals, conversion values or internal
     identifiers.
6. Regression, documentation and scope:
   - current focused/full tests, three verifiers, lint, typecheck and build;
   - package/lock, existing snapshots/verifiers, runtime consumers, app routes,
     components and protected media remain unchanged;
   - root, CMS and frontend documentation accurately state commands and deferred
     capabilities;
   - no configurator, Add to Quote, Quote Basket, 30-day storage, submission,
     Feishu integration, deployment, acceptance or Git delivery was added.

## Required Read-only Reproduction

Inspect the current diff and independently run the most relevant WordPress and
frontend checks needed to challenge the boundaries above. Verify protected
scope, handoff/checksum identity, task evidence, DPG messages and diff hygiene.
Do not treat the prior checkpoint as authority.

## Allowed Writes

- `TASKS/ARTIFACTS/TASK-019/ADVERSARIAL_REVIEW_REPORT.md`;
- `LANES/adversarial_reviewer/**`;
- one controlled linked review response message.

## Protected Scope

Do not edit WordPress/CMS source, frontend source/tests/docs, README, task
authority, Planner state, database, dependencies, Git, deployment or external
systems. Do not repair findings in the reviewer lane.

## Stop Boundary

Stop after one controlled review response. A PASS is not user acceptance and
does not authorize commit, push, merge, deployment or the next product task.
