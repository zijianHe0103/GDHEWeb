# TASK-027 Frontend A1 TDD RED Evidence

result: RED_THEN_GREEN
runtime: Node 24.18.0

## Frozen seam

The A0-frozen public seam is the offline command:

```sh
node scripts/verify-rfq-submission-v2-contract.mjs
```

The focused test observes only its exit status and stable success summary. It
does not test private verifier helpers.

## First RED

Only `frontend/tests/rfq-submission-v2-contract-snapshot.test.ts` existed when
the first command ran:

```sh
PATH=/Users/arron/.nvm/versions/node/v24.18.0/bin:/usr/bin:/bin:/usr/sbin:/sbin \
  npm test -- tests/rfq-submission-v2-contract-snapshot.test.ts
```

Result: exit `1`; `1` file failed / `1` test failed. Node reported
`MODULE_NOT_FOUND` for
`frontend/scripts/verify-rfq-submission-v2-contract.mjs`. This is the required
real missing-verifier/snapshot RED.

## Minimum GREEN

After adding only the exact 20 JSON snapshot files, closed manifest and
Node-built verifier, the same command returned exit `0`; `1` file / `1` test
passed.

## Mutation closure

The focused test was then extended with removable temporary-repository cases.
Its first harness run correctly rejected macOS `/var` as a non-canonical root;
the fixture was corrected to pass its `realpath` without weakening verifier
behavior. The final result is exit `0`; `1` file / `5` tests passed, covering:

- missing, extra and tampered snapshot bytes;
- symlinked, non-regular and non-canonical snapshot identities;
- traversal plus remote and unknown Schema references;
- authority substitution, source/verifier drift and symlinked source identity.
