# TASK-019 Adversarial Review Round 1 Recovery

status: `NEEDS_REVISION`
recorded_at: `2026-07-31T11:23:45Z`
review_verdict: `FAIL / P0=0 / P1=2 / P2=1`

## Controlled transition

Planner first ran the governed `task_transition.py reopen` command. The helper
safely refused with zero mutation because its current implementation accepts
only `AWAITING_USER`, while TASK-019 truthfully remained `UNDER_REVIEW` after a
review FAIL. This record is the controlled equivalent recovery entry required
before revision; it does not pretend that the helper performed a transition it
did not support.

## Technical evaluation

Both P1 findings are valid for this codebase and require narrow correction:

1. The Product Configuration verifier currently uses lexical `path.resolve`
   containment followed by `readFile`. It has no `lstat`, segment symlink gate
   or `realpath` identity comparison. The reviewer independently replaced a
   frozen canonical authority pathname with a byte-identical symlink and the
   real verifier still returned `4 schemas / 1 success / 6 errors`.
2. QuoteLine currently declares `quantity` only as integer `>= 1`, while
   `mergeQuoteLines` performs unchecked JavaScript number addition. Two
   individually Schema-valid values `9007199254740991` and `2` therefore merge
   to the imprecise `9007199254740992`, not mathematical
   `9007199254740993`, and the result remains Schema-valid.

The safe-integer maximum is a technical JSON/JavaScript representation bound,
not a newly invented business MOQ or commercial limit. No narrower business
maximum is introduced.

## Authorized narrow revision

- Add one shared verifier authority reader that rejects symlinks in canonical
  authority path segments/final objects, requires a regular final file and
  verifies canonical path identity before reading.
- Use that reader for the handoff manifest, checksum file, every checksum
  source, each authority Schema, success Golden and error source.
- Add removable substitution tests for both root authorities plus
  representative checksum/Schema/success/error inputs. Frozen authority and
  snapshot bytes remain unchanged.
- Set QuoteLine quantity maximum to JavaScript `Number.MAX_SAFE_INTEGER`; reject
  unsafe input quantities and any merged sum outside the same bound before
  returning output.
- Add maximum-boundary, unsafe-input and overflow tests without changing line
  identity or normal merge/split behavior.
- Synchronize current task/project/board narration. Preserve Round 1 FAIL and
  all prior passing evidence.

## Protected boundary

Do not change WordPress/CMS authority bytes, Product Configuration snapshot
bytes, endpoint/API behavior, existing runtime/UI/routes, packages, lockfile,
Article Number or configuration semantics, deferred basket/submission/Feishu
capabilities, acceptance, Git or deployment.

## Next step

Dispatch only this narrow TDD revision to the registered frontend lane. After
its linked response, Planner must independently reproduce both attacks and all
regressions before a new controlled adversarial review.
