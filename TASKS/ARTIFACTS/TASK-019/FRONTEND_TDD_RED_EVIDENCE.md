# TASK-019 Frontend TDD RED Evidence

status: `RED_GREEN_COMPLETE`
runtime: `Node 24.18.0 / npm 11.16.0`

## Product Configuration snapshot/verifier RED

Command:

```sh
cd frontend
npm test -- tests/product-configuration-contract-snapshot.test.ts
```

Initial result: exit `1`. Vitest could not resolve
`scripts/verify-product-configuration-contract.mjs`; the snapshot/verifier did
not exist. This was the requested missing-capability RED, not a syntax,
environment or authority failure.

The first implementation run remained RED with one focused failure because
the verifier compared the 17-entry checksum object by JSON insertion order,
while the canonical checksum file is lexicographically sorted. The minimum
correction compared sorted key/value entries without weakening path, byte or
hash validation.

Final focused result: `1 file / 17 tests PASS` plus direct verifier output
`4 schemas / 1 success / 6 errors PASS`.

## QuoteLine contract RED

Command:

```sh
cd frontend
npm test -- tests/quote-line-contract.test.ts
```

Initial result: exit `1`. Vitest could not resolve the QuoteLine sample or
contract module because `src/lib/quote-contract/` did not exist. This was the
requested independent missing QuoteLine contract RED.

After the minimum contract existed, the complete behavior matrix exposed two
real issues: object insertion order incorrectly affected line identity, and
Ajv's default floating `multipleOf` precision rejected the mathematically valid
custom length `4.3`. The minimum correction changed identity to explicit field
comparison and configured the test validator with decimal precision; the
Schema remained Draft 2020-12 and retained `multipleOf: 0.1`.

Final focused result: `1 file / 16 tests PASS`.

## Adversarial Round 1 P1 revision RED/GREEN

### P1-1 canonical authority identity

The revision test changed only removable temporary repositories. Before the
production correction, the focused verifier run exited `1`: `1 file`, `25`
tests, `17` passed and the eight new cases failed. The real verifier returned
its success result instead of an `Error` after each byte-identical substitution:

- symlinked repository root;
- handoff manifest;
- checksum authority;
- checksum-listed source;
- representative Schema source;
- success Golden source;
- error authority source;
- intermediate `golden-product-configuration` directory segment.

This was a behavior RED for the reported canonical-identity defect. After one
shared non-symlink regular-file authority reader was applied to every authority
read, the same focused command passed `25/25`; all temporary roots were removed.

### P1-2 QuoteLine safe integers

Before the production correction, the QuoteLine focused run exited `1`: `1`
file, `23` tests, `17` passed and six new assertions failed. The Schema returned
valid for `9007199254740992`; the merge accepted `0`, `-1`, `1.5` and the unsafe
integer, and it did not reject `9007199254740991 + 2`. JavaScript produced
`9007199254740992` although the exact integer sum is `9007199254740993`.

The minimum GREEN added the Schema maximum and runtime input/sum gates. The
same focused command then passed `23/23`, including exact-maximum acceptance,
maximum-plus-one rejection and overflow rejection.
