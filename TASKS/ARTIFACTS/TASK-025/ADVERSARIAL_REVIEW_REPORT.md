# TASK-025 Adversarial Review Report

review_round: Finding Closure
reviewed_at: 2026-08-11T13:41:09Z
request: MSG-TASK-025-ADVERSARIAL-FINDING-CLOSURE
verdict: PASS
P0: 0
P1: 0
P2: 0
planner_final_validation_allowed: true_after_linked_response_ack
acceptance_or_git_authorization: false
round_1_history: FAIL / P0=0 / P1=2 / P2=0
wordpress_planner_round_1_history: FAIL / P0=0 / P1=2 / P2=1
wordpress_planner_round_2_history: PASS / P0=0 / P1=0 / P2=0
frontend_a3_checkpoint_history: PASS / P0=0 / P1=0 / P2=0
frontend_a4_checkpoint_history: PASS / P0=0 / P1=0 / P2=0

## Round 1 Outcome — Preserved History

TASK-025 is **FAIL / P0=0 / P1=2 / P2=0**. The WordPress mixed-batch
authority, the frontend A3 server-only consumer, Article Number
non-deliberate-display boundary, most Quote Basket 3.0 behavior, documentation
and protected bytes pass the proportionate independent checks below. Two
cross-boundary Basket defects nevertheless prevent Planner final validation:

1. the exported production application seam accepts a structurally incomplete
   response that never passed the A3 runtime validator and upgrades a migrated
   Basket line;
2. a legal uppercase UUID from the frozen Quote Basket 2.0 contract migrates
   losslessly into a valid Quote Basket 3.0 document but cannot enter the
   lowercase-only mixed validation request.

No product, test, CMS, documentation, task authority, Planner-owned state,
database fixture, dependency, Git state, deployment, Feishu object or external
system was repaired or modified by this review.

## Findings

### P1-1 — The exported Basket application seam accepts an incomplete, unauthenticated batch response

#### Independent reproduction

The current production function
`frontend/src/lib/quote-basket/v3/batch.ts:65-109` is exported and accepts a
plain `MixedQuoteLineValidationDto`. At runtime it:

- clones and validates only the input Basket;
- reads `response.lines`;
- converts each line to a plain record;
- checks a subset of request/response semantic fields;
- upgrades a `requires_validation` configured product to `ready`.

It does not invoke the A3 response Schema validator, require an authentic opaque
validated wrapper, or verify the response root fields. It also never checks the
required authoritative `model` field. The normative response Schema requires
the closed root
`apiVersion/schemaVersion/locale/type/lines` and requires `model` in both
line variants
(`mixed-quote-line-validation-response.v1.schema.json:5-13,21-29,36-43`).

The reviewer-only probe
`TASKS/ARCHIVE/TASK-025/EVIDENCE/task025-incomplete-response-probe.test.ts:15-59`
passed an object containing only `lines`; its configured line omitted
`model`. The object is invalid against the frozen response Schema, yet
`applyQuoteBasketV3Validation` returned a new valid Basket whose migrated
standard line was `ready` with `GDHEPRD000172`. The exact isolated probe
returned `1 file / 2 tests PASS`; the first test records this acceptance.

This contradicts the A4 authority that only one complete successful A3 response
may atomically upgrade migrated lines and that an incomplete or mismatched
response leaves the prior Basket unchanged
(`FRONTEND_A4_DISPATCH.md:21`). A TypeScript annotation does not establish a
runtime trust boundary, and `server-only` prevents browser import but does not
make an exported deep server module authentic.

#### Impact

Any present or future server caller that imports the exported application seam
can bypass the frozen A3 Schema, wrapper and DTO boundary. It can upgrade
customer Basket state from bytes that the authoritative contract rejects. This
is P1 because it breaks the claimed atomic authority boundary immediately
before final RFQ work.

#### Minimum bounded revision

- Make the raw application helper private to an orchestration that has just
  obtained an authentic A3 result, or require an unforgeable validated result
  rather than a plain structural DTO.
- Alternatively, perform the complete A3 runtime validation and adaptation
  inside the exported application boundary before reading any response line.
- Add exact negative tests for missing root metadata, missing `model`,
  extra/invalid keys and a response that is semantically similar but
  Schema-invalid; each must preserve the original Basket byte-for-byte.
- Do not add a Route Handler, Server Action, final RFQ submission or Feishu
  behavior in this correction.

### P1-2 — Frozen legacy UUID casing makes a valid migration impossible to validate

#### Independent reproduction

The frozen Quote Basket 2.0 Schema accepts uppercase hexadecimal UUID
characters
(`frontend/src/lib/quote-basket-contract/v2/schemas/quote-basket.v2.schema.json:25-29`).
Quote Basket 3.0 intentionally retains the same case-insensitive UUID shape
(`frontend/src/lib/quote-basket-contract/v3/schemas/quote-basket.v3.schema.json:28-32`),
and the production UUID assertion is case-insensitive
(`frontend/src/lib/quote-basket/v3/index.ts:649-651`).

`migrateQuoteBasketV2ToV3` spreads the legacy line unchanged before applying
the new state
(`frontend/src/lib/quote-basket/v3/index.ts:233-249,345-375`), so a legal
uppercase `entryId` is preserved. The new mixed request Schema instead accepts
only lowercase hexadecimal UUID characters
(`mixed-quote-line-validation-request.v1.schema.json:19-21`), and WordPress
also rejects any value that is not already lowercase
(`cms/wp-content/plugins/gdhe-site/includes/quote-line-validations.php:297-305`).

The reviewer probe replaced one valid frozen v2 sample entry ID with
`ABCDEFAB-CDEF-4ABC-8ABC-ABCDEFABCDEF`. `parseQuoteBasketV3` accepted the
legacy document and preserved that exact identity. Projection succeeded, but
`buildMixedQuoteLineValidationRequest` rejected the projected line with the
stable A3 `configuration/invalid_request` error before any POST
(`task025-incomplete-response-probe.test.ts:61-77`).

This conflicts with the frozen requirement that existing configured standard
lines migrate losslessly to `requires_validation` and that one successful
batch may upgrade them
(`REQUIREMENTS.md:65`). The current contracts allow a valid old Basket to
become a valid new Basket that the only upgrade path can never submit.

#### Impact

A customer with a contract-valid legacy Basket identity can be permanently
stuck in recovery despite having an otherwise valid configured line. This is a
cross-version storage/transport incompatibility, not an Article Number
authority failure, and is P1 because the task's primary purpose includes exact
v1/v2 migration into the authoritative mixed batch.

#### Minimum bounded revision

- Harmonize the UUID identity contract across stored Basket, frontend request
  snapshot and WordPress runtime.
- The smallest route is likely deterministic lowercase normalization during
  v1/v2-to-v3 migration, with an explicit collision/duplicate proof and
  documentation that this canonicalization preserves UUID identity. If exact
  byte preservation is required instead, the mixed Schema, frozen frontend
  snapshot and WordPress runtime must be revised consistently.
- Add an end-to-end uppercase-legacy migration test that reaches the successful
  one-batch upgrade, plus a collision/duplicate negative.
- Preserve the same storage key, quantity, public line identity, no-guessing
  rules and all non-implementation boundaries.

## Independently Confirmed Passing Boundaries

### Article Number and visible-output policy

- Current architecture, root README, frontend README, CMS README and Decision
  49 consistently treat Article Number as public, non-sensitive and untrusted.
  It may be carried through the API, server/browser DTO and the existing Basket
  storage, but it is not a credential or permission.
- Static inspection found Article Number propagation in the server/browser data
  seams and recommendation add-to-Basket action, but no deliberate Article
  Number render in the configurator, recommendation card, Basket rows,
  accessible names, live messages or recovery copy.
- TASK-024 v1 machine artifacts remain byte-frozen. The current architecture
  explicitly supersedes only the historical no-Article-Number/opaque-accessory
  route and keeps a future additive RFQ submission contract as a mandatory gate.

### WordPress mixed-batch authority

- The anonymous route accepts exact JSON only, enforces `1..50`, the
  `163840` raw-byte ceiling, lowercase UUIDv4, positive safe-integer
  quantities, `piece`, closed line shapes and duplicate entry/merge identity
  rejection before domain resolution.
- Static inspection confirms at most one canonical-path candidate query and one
  Article Number candidate query, each with the 101 overflow sentinel. Domain
  code performs no public `/resolve`, Product Configuration or
  RelatedProductCard subrequest per line, accumulates the complete response in
  memory and fails the whole request on any authority conflict.
- Product role, publication/quote eligibility, path, Article Number,
  configuration ownership, packaging, selection, quantity unit and global
  source/index consistency fail closed. Explicit custom length remains
  `articleNumber:null / sales_follow_up`.
- Independent checks passed the two declared Schema validators, the final
  `52/52` handoff, PHP syntax for the route/Fixture/MU bootstrap, the
  read-only route/source seam, and database residue `0/0/0/0`.
- The preserved historical WordPress Planner Round 1 remains
  `FAIL / P0=0 / P1=2 / P2=1`. Its Round 2 remains
  `PASS / P0=0 / P1=0 / P2=0`: recorded different-ID lifecycles retain equal
  `10/10` hashes, injected failure cleanup is zero-residue, HTTP 1/50 evidence
  records two bounded queries and zero subrequests, and Core/SCF/database gates
  pass. The reviewer did not rerun the mutating Fixture lifecycle because this
  review is explicitly read-only.

### Frontend A3 and Quote Basket 3.0 regressions

- A3 production modules are `server-only`; configuration comes only from
  `process.env.WORDPRESS_API_URL`; the endpoint, en/1.0.0 query, one POST,
  no-store, redirect refusal, zero retry and private 5000 ms timeout are fixed.
- The 11-Schema snapshot is bound to the current CMS manifest/checksum, closes
  local references, compiles in strict mode and validates normalized HTTP
  success/error payloads. The public orchestration performs one request and
  returns a caller-isolated deeply frozen DTO with stable sanitized errors.
  Client/public and deep-import build negatives remain in the focused suite.
- Quote Basket 3.0 remains an additive contract using the existing storage key,
  exact 30-day TTL, `262144` UTF-8 ceiling, positive safe-integer quantities,
  deterministic merge identity and last-writer-wins behavior. Legacy custom and
  accessory migration behavior, new configured/accessory propagation,
  `requires_readd` exclusion, no hidden parallel Basket and no browser
  WordPress call pass, subject to the two P1 boundaries above.
- No final submission route, customer form, Basket clear-on-receipt,
  persistence/idempotency/HMAC/challenge runtime, Feishu write, price, payment,
  Checkout or deployment behavior was added or claimed.

## Independent Validation Evidence

- WordPress Schema closure: PASS, two validators; 11 closed Schemas, seven
  runtime Goldens, six request negatives, two response negatives, no network
  reference.
- WordPress immutable handoff: PASS `52/52`; manifest
  `9bfb794e6dace0e4a15aef5f2d5a755b333482d297d1a071f74bbbb1277bce5f`;
  checksum stream
  `512b27a4b6d42b94cc73f45943b11a4b20ce4d08bd7305382f556e9a0c41e25a`.
- Frontend focused current-task suite: PASS `14 files / 31 tests`.
- Reviewer attack probe: PASS `1 file / 2 tests`; both P1 reproductions above
  are current-byte behavior.
- Nine frontend contract verifiers: PASS. Current counts include Article Number
  `11/5/5`, Quote Basket 3.0 `1/1/6`, CMS `16/2/2`,
  ProductCard `8/3/6`, Product Configuration `4/1/6`,
  RelatedProductCard `9/4/9`, and the three version-specific verifiers.
- ESLint: PASS. TypeScript `--noEmit`: PASS.
- The review host provides bundled Node `24.14.0`, not the project's exact
  frozen Node `24.18.0` plus npm `11.16.0`. One unsplit full-inventory run
  under the bundled version passed `63/65 files` and `573/575 tests`; two
  pre-existing timeout-body tests resolved instead of reaching their 5000 ms
  timer. This run is disclosed and is not counted as a full-suite PASS.
  Planner's fresh supported-runtime, four-group evidence after the final A4
  bytes records exactly `65 files / 575 tests PASS`, nine verifiers,
  lint/typecheck, Next 16.2.11 production build and four production smokes.
  The current FAIL does not depend on treating that cross-lane evidence as an
  independent PASS.
- All 12 frozen rows in `PROTECTED_BASELINE.md` reproduce exactly after
  controlled generated-output cleanup, including package, lockfile,
  TypeScript config, production `next-env.d.ts`, TASK-024 artifacts, Quote
  Basket 2.0, QuoteLine 2.0, Product Configuration 2.0, Article Number option
  1.0 and RelatedProductCard 1.0.
- Reviewer validation generated only `frontend/.next` and
  `frontend/tsconfig.tsbuildinfo` and temporarily changed generated
  `next-env.d.ts`. Reviewer scope did not permit direct cleanup. Controlled
  recovery request
  `MSG-TASK-025-ADVERSARIAL-R1-GENERATED-CLEANUP` is ACKed/done; Planner
  recoverably moved only the two generated paths and restored production
  `next-env.d.ts`. Independent recheck finds both paths absent, production
  hash
  `7b550dda9686c16f36a17bf9051d5dbf31e98555b30d114ac49fc49a1e712651`,
  port 3000 clear, no checkout listener and no Python bytecode residue.
- `git diff --check`: PASS. Project, lane-registry and controlled-message
  validators: PASS. Strict reviewer lane audit: `issues=[]`.
- Active task, Project State and Board remain
  `UNDER_REVIEW / NOT_ACCEPTED / DIRTY`. The review request and cleanup
  request are ACKed/done. `document_impact=RESOLVED` and
  `readme_impact=UPDATED` match the current documentation changes.

## Round 1 Scope and Handoff — Preserved History

The current result is **FAIL / P0=0 / P1=2 / P2=0**. Planner final validation
is **not allowed**. Planner owns governed recovery, the two minimum bounded
revisions, fresh supported-runtime validation and any separately dispatched
independent Round 2. This report does not authorize acceptance, Git delivery,
deployment, final RFQ/customer-form work, CMS mutation or Feishu integration.

## Finding Closure Outcome — Current

TASK-025's authorized two-finding closure is **PASS / P0=0 / P1=0 / P2=0**.
This was not a second full TASK-025 review. The complete Round 1
`FAIL / P0=0 / P1=2 / P2=0` evidence above remains immutable history; this
section records only closure of those two P1 findings and proportionate direct
regressions.

### P1-1 closure — private authentic response application boundary

- `applyQuoteBasketV3Validation` is now module-private
  (`frontend/src/lib/quote-basket/v3/batch.ts:65-70`). The module's production
  exports are limited to `QuoteBasketV3BatchError`,
  `projectQuoteBasketV3ForValidation` and `validateQuoteBasketV3`; repository
  search found no re-export or external production reference to the private
  helper.
- The only production call is inside `validateQuoteBasketV3`, after the public
  Basket is cloned and projected and after `validateMixedQuoteLines` returns
  (`batch.ts:111-121`). That A3 orchestration builds the fixed request, obtains
  the fixed Transport result, validates it against the closed 11-Schema
  authority, adapts the authentic opaque wrapper to a caller-isolated DTO and
  verifies request-response binding before returning
  (`frontend/src/lib/cms/server/article-number-batch/load.ts:121-134`).
- The focused closure test drives the real public orchestration and rejects
  missing root metadata, missing `model`, an extra root key, an extra line key
  and invalid locale with existing stable contract errors. The original Basket
  serialization remains byte-identical after every rejection
  (`frontend/tests/quote-basket-v3-adversarial-r1.test.ts:59-133`).
- Existing direct regression coverage still proves one-line and fifty-line
  success each use one fixed POST and zero legacy resolve, Product
  Configuration or RelatedProductCard calls.

The former plain-DTO bypass is therefore no longer reachable through a public
or deep-import production surface, while the complete A3 authenticity and
semantic-binding path remains mandatory.

### P1-2 closure — lowercase UUID ingress and case-fold safety

- Every Quote Basket 3.0 document now canonicalizes `writerId` and `mutationId`
  before construction (`frontend/src/lib/quote-basket/v3/index.ts:253-287`).
  Configured and accessory `entryId` values are likewise canonicalized before
  the duplicate and merge-identity gates (`index.ts:274-277,414-420,452-458`).
  `canonicalUuid` first accepts only the existing case-insensitive UUIDv4
  grammar and then returns lowercase (`index.ts:649-655`).
- Because v1, v2 and v3 ingestion all pass through that closed clone/validate
  boundary, contract-valid uppercase legacy IDs upgrade deterministically.
  The focused test confirms uppercase v2 writer, mutation and entry identities
  become lowercase, the exact lowercase entry bytes are sent in one POST, and
  the standard line becomes `ready` with Article Number `GDHEPRD000172`
  (`frontend/tests/quote-basket-v3-adversarial-r1.test.ts:135-185`). It also
  covers uppercase v1 and rejects two v3 items that collide only after
  case-folding (`adversarial-r1.test.ts:187-215`).
- The reviewer-only probe additionally confirmed uppercase v3 document and
  item identities canonicalize without changing any non-identity item field;
  a case-fold collision between otherwise distinct item semantics rejects; and
  a frozen uppercase v2 input projects a lowercase request without mutating
  the caller's legacy object.
- The frozen Quote Basket 2.0 Schema and WordPress Article Number authority
  remain byte-identical under the protected baseline. Lowercasing is confined
  to Quote Basket 3.0 ingress and is not a relaxation of the lowercase mixed
  request contract.

### Proportionate independent evidence

- Current focused production regression: PASS, `2 files / 6 tests`
  (`quote-basket-v3-adversarial-r1.test.ts` and
  `quote-basket-v3-batch.test.ts`).
- Reviewer closure probe: PASS, `1 file / 4 tests` at
  `frontend/tests/quote-basket-v3-adversarial-r1.test.ts`.
- Article Number contract verifier: PASS, `11` Schemas, `5` success and `5`
  error samples. Quote Basket 3.0 verifier: PASS, `1` Schema, `1` success and
  `6` invalid samples. Immutable TASK-025 handoff: PASS `52/52`, manifest
  `9bfb794e6dace0e4a15aef5f2d5a755b333482d297d1a071f74bbbb1277bce5f`,
  checksum stream
  `512b27a4b6d42b94cc73f45943b11a4b20ce4d08bd7305382f556e9a0c41e25a`.
- All 12 frozen baseline hashes reproduce, including the Quote Basket 2.0
  authority and current production `next-env.d.ts` hash
  `7b550dda9686c16f36a17bf9051d5dbf31e98555b30d114ac49fc49a1e712651`.
  Changed-file ESLint and `git diff --check` pass. `.next`,
  `tsconfig.tsbuildinfo` and `.vitest` are absent; port 3000 is clear and no
  checkout listener remains.
- Planner's fresh supported-runtime checkpoint records Node `24.18.0`, npm
  `11.16.0`, `66 files / 579 tests`, nine verifiers, lint, typecheck, build and
  four production smokes PASS after the two bounded revisions. This cross-lane
  full-suite evidence was inspected but not relabeled as an independent full
  rerun; the closure verdict rests on the independently reproduced focused
  boundary evidence above.
- Project, lane registry, controlled messages and strict reviewer lane audit
  pass with `issues=[]`. At review conclusion the active task, Project State
  and Board were `UNDER_REVIEW / NOT_ACCEPTED / DIRTY`. The exact closure
  request and single linked response are now ACKed/done; dispatch dry-run
  resolved exactly to registered Planner session
  `019f857b-3e04-73d2-9335-edcff61b30ed`, and dispatch-once records that real
  Codex bridge receipt.

### Current handoff

Both historical P1 findings are closed and no P0, P1 or P2 remains in this
authorized closure scope. Planner has acknowledged the linked response and may
now perform fresh final validation. This PASS is not user acceptance, Git
authorization, deployment authorization, final RFQ implementation or Feishu
integration authorization. The reviewer modified no product, test,
documentation, task authority, Planner-owned state, CMS, database, dependency,
Git, deployment or external system.
