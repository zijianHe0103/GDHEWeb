# TASK-019 Frontend Round 1 Revision Planner Checkpoint

status: `PASS`
checked_at: `2026-07-31T12:51:57Z`
historical_review: `Round 1 FAIL / P0=0 / P1=2 / P2=1`
next_gate: `Adversarial Round 2`

## Outcome

Planner independently reproduced the two frontend P1 corrections on the
current shared bytes. Both code causes are closed. The Round 1 verdict remains
historical FAIL until a new independent reviewer returns a current verdict.
This checkpoint authorizes only the narrow Round 2 review; it is not final
validation, user acceptance, Git delivery or deployment authorization.

## P1-1 Canonical authority identity

- One shared authority reader now covers the canonical handoff manifest,
  checksum file, every checksum-listed authority source, all four authority
  Schemas, the success Golden and the error source.
- The reader rejects a symlinked or non-canonical repository root, intermediate
  path segment or final object and requires the final object to be a regular
  file before reading.
- Removable substitution tests cover repository root, both root authorities,
  a checksum-listed source, Schema, success, error and an intermediate
  directory.
- Focused Product Configuration tests pass `25/25`; the direct verifier remains
  `4 schemas / 1 success / 6 errors`.
- All 17 authority checksums pass, and the four Schema plus one success Golden
  remain byte-identical to the frozen WordPress handoff.

## P1-2 QuoteLine safe integer boundary

- QuoteLine `quantity` has the explicit maximum `9007199254740991`.
- Merge rejects non-positive, non-integer or unsafe input quantities and rejects
  an unsafe sum before returning output.
- Exact maximum acceptance, unsafe-input and two-line overflow cases are
  covered without changing QuoteLine identity or ordinary merge/split rules.
- Focused QuoteLine tests pass `23/23`; combined focused validation is `48/48`.

## Regression evidence

- Full Vitest: `26 files / 353 tests` PASS under the frozen Node 24 toolchain.
- Existing CMS verifier: `16 schemas / 2 success / 2 errors` PASS.
- Existing ProductCard verifier: `8 schemas / 3 success / 6 errors` PASS.
- Product Configuration verifier: `4 schemas / 1 success / 6 errors` PASS.
- ESLint, TypeScript and production build PASS; route inventory is unchanged.
- Product Configuration and QuoteLine inventories remain exactly `7` and `10`.
- Package/lock, existing snapshots/verifiers, TASK-016–018 runtime/pages,
  protected media and generated-file baseline remain unchanged.
- The protected image check uses the actual frozen path
  `frontend/public/test-candidates/fgd-x15-protected.png`; an earlier read-only
  check used a stale pathname and was rerun against this correct path.
- JSON, Markdown, `git diff --check`, project, registry, messages and strict
  lane validation pass.

## Preserved boundary

No CMS authority or Product Configuration snapshot byte, endpoint, package,
lockfile, runtime, UI, route, configurator, basket, browser persistence,
submission service, Feishu integration, acceptance, Git history or deployment
was added or changed by this narrow revision.

## Verdict

`PASS_FOR_ADVERSARIAL_ROUND_2`. Planner final validation remains blocked until
the reviewer independently closes both P1s and the narration P2 with a current
`PASS / P0=0 / P1=0 / P2=0` verdict.
