# TASK-019 Adversarial Review Report

Verdict: PASS

review_round: `Round 2 final`
reviewed_at: `2026-07-31T12:59:34Z`
reviewer_lane: `adversarial_reviewer`
request: `MSG-TASK-019-ADVERSARIAL-REVIEW-R2`
verdict: `PASS`
P0: `0`
P1: `0`
P2: `0`
planner_final_validation_allowed: `YES_AFTER_RESPONSE_ACK`
historical_round_1: `FAIL / P0=0 / P1=2 / P2=1`

## Round 1 Outcome — Historical

`FAIL / P0=0 / P1=2 / P2=1`.

The WordPress Round 1 stable-identity findings are closed, the current
Product Configuration output and Fixture lifecycle are reproducible, and the
declared protected regressions pass. TASK-019 cannot proceed to Planner final
validation because the frontend authority verifier accepts a byte-identical
symlink substitution at a frozen authority path, and QuoteLine can silently
lose integer quantity precision while both inputs and the result remain
Schema-valid. Current governance narration also still says that this already
ACKed review is waiting for ACK or has not started.

This verdict is not acceptance or Git authorization. The reviewer did not
repair product, test, documentation, task authority or Planner-owned state.

## Findings

### P1-1 — A frozen authority path can be redirected through a symlink

The dispatch requires the snapshot verifier to hard-bind the canonical
TASK-019 authority identities and fail closed on authority substitution. The
current verifier performs lexical containment with `path.resolve` and reads
the resulting pathname directly:

- `frontend/scripts/verify-product-configuration-contract.mjs:91-103` checks
  only lexical relative-path containment before `readFile`;
- `frontend/scripts/verify-product-configuration-contract.mjs:301-341` reads
  the authority manifest, checksum file, checksum sources, Schemas and samples
  without `lstat`, segment inspection or canonical `realpath` equality;
- the existing substitution test at
  `frontend/tests/product-configuration-contract-snapshot.test.ts:162-173`
  changes the path string in the frontend manifest. It does not replace the
  expected canonical authority pathname itself with a symlink.

Independent reproduction used the real exported verifier against a removable
copy under the reviewer workspace:

1. copy the current seven-file frontend snapshot and the exact current
   authority inputs;
2. copy the canonical handoff manifest bytes to a different regular file;
3. replace the expected canonical handoff-manifest pathname in the copy with a
   symlink to that byte-identical file;
4. call `verifyProductConfigurationContract` with the copied repository root.

The verifier returned success:

```json
{"symlinkSubstitutionAccepted":true,"result":{"errorSamples":6,"schemas":4,"successSamples":1}}
```

The live authority inputs are currently regular files, so this is a verifier
fail-closed defect rather than evidence that the current source is already
redirected. It nevertheless defeats the promised pathname identity boundary:
the frozen lexical path can resolve to a different filesystem object while
all hashes and byte comparisons pass.

Smallest bounded revision:

1. centralize authority-file opening so every authority path segment and final
   object must be a regular non-symlink object;
2. compare the resolved canonical identity with the expected repository-owned
   pathname before accepting bytes;
3. apply the gate to the handoff manifest, checksum file, every checksum
   source, each Schema, the success Golden and the error source;
4. add removable mutation tests for symlink substitution at least through the
   generic authority reader, including the two root authorities and
   representative Schema, success and error inputs.

Do not change the frozen authority or snapshot bytes merely to close this
finding.

### P1-2 — QuoteLine merge silently loses integer quantity precision

The closed QuoteLine Schema accepts any integer greater than or equal to one:

- `frontend/src/lib/quote-contract/schemas/quote-line.v1.schema.json:38-41`
  has `type: integer` and `minimum: 1`, with no safe upper bound;
- `frontend/src/lib/quote-contract/index.ts:86-103` adds quantities as
  JavaScript numbers without validating the inputs or the sum as safe
  integers.

The current test matrix covers zero and fractional quantities but not the
JavaScript safe-integer boundary. The following independent probe used the
frozen Node `24.18.0`, the real Ajv Schema and the real `mergeQuoteLines`:

```json
{"leftValid":true,"rightValid":true,"outputValid":true,"leftQuantity":9007199254740991,"rightQuantity":2,"mergedQuantity":9007199254740992,"mathematicalQuantity":"9007199254740993","isSafeInteger":false}
```

Both caller lines are valid; the returned merged line is also Schema-valid,
but its quantity is one lower than the mathematical sum and is no longer a
safe integer. A future basket or submission consumer could therefore send an
incorrect requested quantity without any contract error.

Smallest bounded revision:

1. add an explicit maximum to the Schema, using the JavaScript safe-integer
   maximum unless the user confirms a narrower business limit;
2. make merge reject an input outside that bound and reject any sum that is
   not a safe integer or exceeds the same bound before returning output;
3. add exact boundary tests for the maximum accepted value and a two-line
   overflow attempt, while preserving quantity-excluded identity and all
   existing split/merge semantics.

### P2-1 — Current review narration is stale after the recorded ACK

The task frontmatter, Project State and Board correctly show
`UNDER_REVIEW / NOT_ACCEPTED / DIRTY`, and the request is already in
`LANES/messages/done`. However, current human-readable authority still says:

- the active task Current State and Next Step wait for the review ACK;
- the active task Adversarial Review section says the review has not started;
- Project State focus and `unique_next` wait for pre-review ACK.

This does not affect the product bytes, but it makes the current recovery fact
contradict the controlled message state and the ongoing review. After the
linked FAIL response is acknowledged, Planner should preserve all execution
and review history, record this verdict, synchronize the task/project/board to
the governed revision state and make the two P1 revisions plus fresh validation
and a new controlled review the unique next step.

## Independently Reproduced Passing Evidence

### WordPress authority and repaired stable identity

- Route registration is additive, anonymous and GET-only at
  `/gdhe/v1/product-configurations`; the read-only POST probe returned
  `404 / rest_no_route`.
- The request gate retained only `locale`, `schema` and `path`; the five closed
  request negatives and six normalized error fixtures passed.
- The four-file Draft 2020-12 closure and the sole current FGD X15+PVC Golden
  validate. The public option remains exactly
  `GDHEPRD000172 / 6 m / Ivory White / piece`; ceiling and wall retain the
  same track Article Number, accessory references remain null, and custom
  length remains `sales_follow_up`.
- `gdhe_product_configuration_documents()` now keys public-choice uniqueness
  by stable product UUID plus length/color and rejects every candidate for a
  UUID whose normalized model/name/path/kind/unit identity conflicts. Global
  Article Number uniqueness remains separate.
- The preserved WordPress Round 1 history remains
  `FAIL / P0=0 / P1=2 / P2=0`. Round 2 evidence records two different
  WordPress-ID lifecycles with the same Golden SHA-256
  `3dba921d26bbab9e586bd8bb8479ab11be9420fc134bac03de255c08fc910fdf`;
  each removed exactly 13 posts, zero terms and zero uploads.
- Independent read-only database queries returned zero TASK-019 posts, source
  meta, marker meta, options, terms, termmeta and uploads, and zero A3/TASK-014
  residue. No database mutation was performed by this reviewer.
- PHP lint, Product Configuration runtime/request/Schema checks, the existing
  CMS verifier `16 schemas / 2 success / 2 errors`, ProductCard verifier
  `8 schemas / 3 success / 6 errors`, Core/SCF and database checks passed.

### Snapshot, handoff and QuoteLine boundaries

- The current frontend snapshot inventory is exactly seven files and the
  QuoteLine inventory exactly ten files.
- All 17 canonical handoff checksums pass; the four Schema files and success
  Golden are byte-identical between the current authority and snapshot.
- The direct verifier passes the current regular-file tree as
  `4 schemas / 1 success / 6 errors`; the P1 above is the additional symlink
  substitution case missing from that matrix.
- Focused Product Configuration and QuoteLine tests pass
  `2 files / 33 tests`. Existing equality covers product, selection,
  installation and all packaging fields; resolved/custom branches do not
  merge, configuration differences split, equal normal quantities merge and
  inputs remain unmodified. The P1 above is the uncovered numeric boundary.
- Public Golden, error and QuoteLine samples contain no WordPress database ID,
  Feishu record ID, price, supplier, cost, inventory, trusted status, raw meta
  or diagnostic field.

### Full regression, scope and governance

- Frozen Node `24.18.0` and npm `11.16.0`: full Vitest
  `26 files / 338 tests`, ESLint, TypeScript and production build pass.
- Build routes remain exactly `/`, `/_not-found`, `/integration/cms`,
  `/products` and `/products/fgd-x15-pvc`; TASK-019 adds no route.
- `frontend/package.json` remains
  `958e8c8937ef092c75295e8a09de6062059df431e3419a70b5b661706ac02bce`
  and the lockfile remains
  `dda25a9069e1c1b41c4f94393a54d3e9eb3dcfea158fc2b6bbdf06cc1cb852a7`.
  Existing contract snapshots/verifiers, server consumers, app routes,
  components and protected media have no baseline diff.
- No runtime import of the Product Configuration snapshot or QuoteLine contract
  was found. Repository `cms` and `TASKS` paths occur only in the offline
  snapshot manifest and verifier-time authority boundary.
- No configurator, Add to Quote control, Quote Basket, persistence, submission,
  Feishu integration, deployment, acceptance or Git delivery was added.
- Project, registry, message and strict-lane validation passed with zero strict
  lane issues; `git diff --check` passed.
- The reviewer symlink probe and all temporary roots were removed. The only
  discovered `.DS_Store` is the ignored root file dated before TASK-019; it is
  not review residue.

## Review Boundary

Only this canonical report, the adversarial reviewer worklog and the linked
controlled response are reviewer writes. No business deliverable, test,
README, task authority, Planner state, database, dependency, Git state,
deployment or external system was modified. Planner final validation is not
allowed until the findings are revised, freshly validated and independently
reviewed through a new controlled request.

## Round 2 Final Review — PASS

`PASS / P0=0 / P1=0 / P2=0`.

Round 1 remains historical `FAIL / P0=0 / P1=2 / P2=1`; none of its text or
evidence is reclassified as a prior PASS. This Round 2 reviewed only both P1
closures, the narration P2 closure and direct regressions defined by
`ADVERSARIAL_REVIEW_R2_DISPATCH.md`.

### P1-1 closure — canonical authority identity

The revised verifier has one shared `authorityBytes` reader at
`frontend/scripts/verify-product-configuration-contract.mjs:107-145`. It:

- requires the repository root itself to be a canonical, non-symlink
  directory;
- walks every relative path segment with `lstat` and `realpath`;
- requires intermediate objects to be canonical directories and the final
  object to be a canonical regular file;
- emits stable labels without absolute repository paths.

Every canonical authority read uses that reader: the handoff manifest and
checksum authority at lines 341-342, all 17 checksum-listed sources at line
356, all Schema sources at line 362, the success Golden at line 372 and the
error source at line 379. No direct authority `readFile` bypass remains.

An independent reviewer-owned removable repository probe exercised the real
exported verifier rather than calling implementation-lane test helpers. The
regular copied authority returned:

```json
{"errorSamples":6,"schemas":4,"successSamples":1}
```

Eight byte-identical substitutions were then tested separately. All rejected
with sanitized canonical-identity errors:

| Attack | Result |
|---|---|
| symlinked repository root | rejected |
| handoff manifest final file | rejected |
| checksum authority final file | rejected |
| checksum-listed source | rejected |
| Schema source | rejected |
| success Golden source | rejected |
| error authority source | rejected |
| intermediate Golden directory | rejected |

The probe and all temporary roots were removed. The live authority tree has no
symlink under the reviewed TASK-019 and GDHE Site authority roots. All 17
checksum entries pass. All four authority Schemas and the success Golden are
byte-identical to the seven-file frontend snapshot. The two frozen root hashes
remain:

- handoff manifest:
  `b219e7178104769cf410a430fbfb00cbbf351a8f58365490ad0bd0dbddfa06af`;
- checksum authority:
  `641dfaaa193bca490243fcadbd8b94e4c8fbbc90ecb59dab6ab476ba7c63dae8`.

Round 1 P1-1 is closed.

### P1-2 closure — QuoteLine safe-integer quantity

The QuoteLine Schema now has the exact technical range
`1..9007199254740991` at
`frontend/src/lib/quote-contract/schemas/quote-line.v1.schema.json:38-42`.
`mergeQuoteLines` checks every input with `Number.isSafeInteger` before cloning
or identity work and checks a merged sum before returning it at
`frontend/src/lib/quote-contract/index.ts:86-115`.

The independent frozen-Node probe produced the following current behavior:

- Schema: exact maximum accepted; maximum plus one, zero and fractional values
  rejected;
- runtime: `0`, `-1`, `1.5`, maximum plus one, `NaN` and `Infinity` all rejected
  with the stable positive-safe-integer `RangeError`;
- the prior `9007199254740991 + 2` attack rejected with
  `Merged QuoteLine quantity exceeds the safe integer maximum`, and caller
  inputs remained unchanged;
- a single exact-maximum line remained accepted;
- normal equal-line merge returned quantity `3`;
- installation difference and resolved/custom difference each retained two
  lines;
- quantities `1` and `9` remained identity-equal, preserving the rule that
  quantity is not part of line identity.

Round 1 P1-2 is closed without changing the established identity, merge or
split semantics.

### P2 closure — current governance narration

- `MSG-TASK-019-FRONTEND-ADVERSARIAL-P1-R1` and its linked response are both
  ACKed and in done.
- The active task, Project State and Board consistently show
  `UNDER_REVIEW / NOT_ACCEPTED / DIRTY` and identify the controlled Round 2 as
  the current gate.
- The prior stale statement that adversarial review had not started is gone.
  The current review section says Round 2 was dispatched and has no final
  conclusion yet.
- Round 1 `FAIL / P0=0 / P1=2 / P2=1` and its recovery remain explicit in the
  active task, Project State and this canonical report.
- Final validation, acceptance, Git and deployment remain prohibited until the
  linked Round 2 response is acknowledged and Planner performs its own fresh
  validation.

Round 1 P2 is closed.

### Independent direct regressions

- Product Configuration plus QuoteLine focused tests:
  `2 files / 48 tests` PASS under Node `24.18.0`.
- Full Vitest: `26 files / 353 tests` PASS.
- Direct Product Configuration verifier: `4 schemas / 1 success / 6 errors`
  PASS.
- Existing CMS verifier: `16 schemas / 2 success / 2 errors` PASS.
- Existing ProductCard verifier: `8 schemas / 3 success / 6 errors` PASS.
- ESLint, TypeScript and Next.js `16.2.11` production build PASS. Routes remain
  `/`, `/_not-found`, `/integration/cms`, `/products` and
  `/products/fgd-x15-pvc`.
- Product Configuration and QuoteLine inventories remain exactly seven and ten
  files.
- Package, lockfile, both existing verifiers, protected image and
  `next-env.d.ts` match the frozen hashes. Protected runtime, page, component,
  snapshot and CMS paths have no baseline diff.
- No runtime import of the Product Configuration snapshot or QuoteLine
  contract exists. No configurator, Add to Quote, basket, persistence,
  submission, Feishu, CMS/database mutation, deployment or Git delivery was
  introduced.
- Project, registry and message validation pass; strict lane audit reports zero
  issues; `git diff --check` passes.

### Round 2 boundary

The reviewer-authored durable writes are limited to this canonical report, its
own lane records and the linked controlled response. The independent probe
used only removable reviewer-owned and system-temporary copies; all were
cleaned. The production validation regenerated the existing ignored Next.js
build output; no tracked/source delta resulted and `next-env.d.ts` retained its
frozen hash. No product source, test, documentation, README, task authority,
Planner state, database, dependency, Git state, deployment or external system
was modified.

Planner may proceed only to fresh final validation after acknowledging the
linked Round 2 PASS response. This PASS is not user acceptance and does not
authorize commit, push, merge, deployment or any deferred product capability.
