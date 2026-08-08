# TASK-023 Frontend UUID Handoff Authority Rebind R1

## Result

`BLOCKED_AT_DIRECT_GATE` after the only authorized authority-pin update. The
final WordPress handoff identities are present in both the frontend manifest
and verifier, but the direct verifier fails before the requested broader gates:

```text
RelatedProductCard contract snapshot FAIL: samples.errors authority checksum mismatch
```

This report does not claim Planner checkpoint PASS, review PASS, acceptance,
Git delivery or deployment.

## Authorized rebind applied

Only the two frozen authority identities were updated, in both places that
must agree:

- manifest SHA-256:
  `9d9b0895503ed6823b92c7823983ba5425a944ab2690fa06b00d537f9a9527ff`;
- checksum-stream SHA-256:
  `3409b2960773ddb6740b3d1cd0268152e6bbe24f44e2eb7c596c310938d7c01f`.

Files changed for the rebind:

- `frontend/src/lib/cms/related-product-card-contract/manifest.json`;
- `frontend/scripts/verify-related-product-card-contract.mjs`.

No Schema or sample bytes were copied. No verifier rule was weakened.

## RED and blocker evidence

Before mutation, the direct Node verifier failed at the expected stale pin:

```text
RelatedProductCard contract snapshot FAIL: TASK-023 authority manifest SHA-256 mismatch
```

After the two pin updates, the direct Node verifier exits `1` at the next
authority check:

```text
RelatedProductCard contract snapshot FAIL: samples.errors authority checksum mismatch
```

The focused mutation suite reports `3 passed / 1 failed`; its missing/extra,
tamper, traversal, unknown/remote-ref, authority-substitution and source-drift
tests remain passing. The sole failure is the positive 9/4/9 authority proof at
`tests/related-product-card-contract-snapshot.test.ts:95`.

Exact byte comparison proves:

- all 9 local Schema snapshots equal their final CMS sources;
- all 4 local success samples equal the final Golden sources;
- local error snapshot SHA-256 is
  `eaca3ca80d85ac34ebb15c9773b932504bcfc899db878f29e5c4f95fc1a9b78f`;
- final authority error fixture SHA-256 is
  `015ef39e239a974bd0c533d90d9369fb9a6822545db5427ba5ca1e47d39736bc`;
- the error objects are structurally identical after removing `requestId`;
  the byte drift is the nine changed request IDs.

The final checksum stream correctly binds the changed authority error fixture,
while the local manifest still binds its older exact error snapshot. The
verifier intentionally requires the authority checksum, source bytes, manifest
entry and snapshot bytes all to equal one SHA-256, so a pin-only rebind cannot
produce 9/4/9 PASS.

## Preserved boundaries

- The prior trap-safe RelatedProductCard Transport P2 fix is unchanged; current
  Transport SHA-256 is
  `de0a4645c942671bbc0974d8b6c730be3a24ca1c9be46e9f0f10162296d882d1`.
- UI, CSS, routes, Basket, runtime Validator/Adapter, ProductCard authority,
  visual evidence and CMS were not modified.
- `git diff --check` passes.
- Stale `frontend/.next` was moved recoverably to Trash; `.next`,
  `tsconfig.tsbuildinfo` and Next listeners are absent.
- No full Vitest, seven-verifier aggregate, lint, typecheck, build or smoke PASS
  is claimed after the direct authority gate failed.

## Required Planner decision

The current request permits only the two pin updates and forbids copying a
sample or changing verifier semantics. Closing the direct gate therefore needs
new explicit authority for exactly one of these materially different actions:

1. replace the local error snapshot and its manifest hash with the final error
   fixture bytes; or
2. define and authorize a deterministic error-sample projection that excludes
   volatile request IDs, with corresponding verifier and test changes.

Until that decision is dispatched, the safe status is `BLOCKED_AT_DIRECT_GATE`.
