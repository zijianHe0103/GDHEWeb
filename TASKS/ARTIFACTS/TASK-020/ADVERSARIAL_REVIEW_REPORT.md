# TASK-020 Adversarial Review Report

Verdict: PASS

review_round: `Round 2 final`
reviewed_at: `2026-08-01T12:35:30Z`
reviewer_lane: `adversarial_reviewer`
request: `MSG-TASK-020-ADVERSARIAL-REVIEW-R2`
verdict: `PASS`
P0: `0`
P1: `0`
P2: `0`
planner_final_validation_allowed: `YES_AFTER_RESPONSE_ACK`
historical_round_1: `FAIL / P0=0 / P1=1 / P2=0`
historical_planner_checkpoint: `FAIL / P0=0 / P1=2 / P2=0`
historical_visual_round_1: `BLOCKED_NO_KEYBOARD_EXECUTION_EVIDENCE / severe=0 / obvious=0 / detail=0`
historical_keyboard_recovery: `FAIL / severe=0 / obvious=0 / detail=1`
current_visual_round_2: `PASS / severe=0 / obvious=0 / detail=0`

## Current Outcome

`PASS / P0=0 / P1=0 / P2=0`.

The sole Round 1 custom-length P1 is closed. Both original production-builder
attacks now fail closed with only the sanitized `customLength` invalid error.
The positive safe scaled-tenths boundary, ordinary `5.8`, JSON round-trip,
standard selection, frozen QuoteLine Schema and all direct protected
regressions independently pass. Planner may proceed only to fresh final
validation after acknowledging the linked response. PASS is not acceptance,
Git authorization, deployment or permission to start deferred work.

## Round 1 Outcome (Historical)

`FAIL / P0=0 / P1=1 / P2=0`.

The fixed Product Configuration consumer, server-only and DTO boundaries,
page request cardinality, current public facts, normal standard/custom paths,
one latest in-memory result, favicon correction, visual history, full
regression and protected scope all reproduce. Planner final validation is not
allowed because the production QuoteLine builder accepts an unbounded but
syntactically valid one-decimal custom length, converts it to a non-finite
JavaScript number and returns `ok: true`. The resulting line fails the frozen
QuoteLine 1.0.0 Schema and serializes the selected length as `null`.

This review preserves the prior Planner FAIL, Visual BLOCKED and Keyboard
Recovery FAIL as historical outcomes. Current Visual Round 2 remains PASS; it
is not rewritten as evidence that the newly discovered numeric boundary
passes.

## Round 1 Finding (Historical)

### P1-1 — Custom length can return a non-finite, Schema-invalid QuoteLine

The active task requires every valid custom QuoteLine to satisfy the frozen
QuoteLine 1.0.0 contract and requires invalid input to fail closed. Production
currently performs only a decimal-string regular-expression check and then
uses `Number(values.customLength)`:

- `frontend/src/lib/product-configuration/build-quote-line.ts:61-65` accepts
  any positive digit sequence with at most one fractional digit;
- `frontend/src/lib/product-configuration/build-quote-line.ts:102-135` returns
  that numeric conversion in an `ok: true` QuoteLine without a finite or
  precision-safety gate;
- `frontend/src/lib/quote-contract/schemas/quote-line.v1.schema.json:123-131`
  requires custom `lengthMeters` to be a JSON number greater than zero and a
  multiple of one tenth.

An independent no-write probe called the real production builder under the
frozen Node `24.18.0`. All other inputs used the current FGD X15+PVC DTO facts.
Two boundaries reproduced:

```json
{"input":"9999999999999999.9","ok":true,"outputLength":"10000000000000000","finite":true,"schemaValid":true}
{"input":"<400 digits>.9","ok":true,"outputLength":"Infinity","finite":false,"schemaValid":false}
```

The first input silently loses the customer's decimal value. The second is
reported as success, renders `Infinity m` in the current summary and becomes
`"lengthMeters":null` under `JSON.stringify`. Ajv rejects that line against
the exact frozen Schema. The existing builder matrix covers ordinary format
errors and unsafe quantity but not finite or precision-losing custom-length
conversion.

Impact: the task's core “customer choice to legal QuoteLine” boundary can
produce a false success and a contract-invalid line. The route is local-only
and does not submit externally, so this is P1 rather than P0.

Smallest bounded revision:

1. reject a custom length unless its decimal conversion is finite and preserves
   the accepted one-tenth value without unsafe numeric rounding;
2. add direct production-builder regressions for a finite precision-losing
   decimal and an overflow-to-Infinity decimal, requiring a closed
   `customLength` error;
3. prove every success branch still validates against the unchanged frozen
   QuoteLine Schema, while the normal `5.8` custom path and all standard,
   installation, packaging, quantity and one-result semantics remain intact.

Do not alter the frozen Product Configuration or QuoteLine authorities to
close this implementation finding.

## Round 1 Independently Reproduced Passing Evidence (Historical)

### Product Configuration consumer and isolation

- The Transport exposes only `requestProductConfiguration(callerSignal?)`,
  constructs the fixed anonymous English GET for the canonical FGD path, uses
  one private 5000 ms timeout, refuses redirects, performs no retry and applies
  the declared JSON, ETag and cache gates.
- The runtime registry statically imports exactly four local Product
  Configuration Schemas. Current snapshot verification passes
  `4 schemas / 1 success / 6 errors`.
- The success payload is isolated and frozen behind a null-prototype,
  WeakSet-authenticated wrapper. The Adapter accepts only that wrapper, copies
  only the public DTO fields and deeply freezes the result.
- Every Product Configuration server module carries the `server-only` marker.
  The full test run includes real public and deep Client Component build
  negatives and their marker-stripped positive controls.
- Preview performs zero network work. CMS ready sequencing remains exactly one
  resolve request followed by one Product Configuration request, with zero
  ProductCard or per-option requests. Detail failure stops first;
  configuration failure preserves the detail and exposes only the sanitized
  navigation fallback.
- Current React markup contains the protected local media and public DTO facts
  only. No raw body, CMS origin, request ID, WordPress media, SCF or Feishu
  field, supplier, cost, price, inventory, profit, diagnostic or internal
  product code was found.

### Public facts, ordinary QuoteLine paths and presentation

- The sole current option remains
  `GDHEPRD000172 / 6 m / Ivory White / piece`; the canonical model, name and
  path are unchanged. No unconfirmed length, color, Article Number or
  accessory appears.
- Ordinary resolved and `5.8 m` custom paths reproduce the frozen selection,
  installation, packaging, Logo, protection and positive safe-integer quantity
  rules. The finding above is the additional unbounded numeric case.
- The visible form uses customer labels, associated inline errors, native
  controls and one polite live result. A valid custom result replaces the
  prior standard scalar result; there is no array, merge, persistence, fetch,
  submission, server mutation or Feishu action.
- The complete summary contains model, length type, length, color,
  installation, base packaging, Logo, protection, quantity and unit without
  Article Number as a headline, raw JSON, internal enum text or saved/sent
  claims.

### Visual, media and favicon evidence

- The canonical report preserves Visual Round 1
  `BLOCKED_NO_KEYBOARD_EXECUTION_EVIDENCE`, Keyboard Recovery
  `FAIL / 0 / 0 / 1` and current Favicon Round 2 `PASS / 0 / 0 / 0` as distinct
  outcomes.
- All 20 entries in `QA/TASK-020/EVIDENCE_INVENTORY.sha256` verify. File type,
  magic and dimensions match the disclosure: 11 original files are real PNG;
  six keyboard-recovery and three favicon-Round-2 files are 956 by 768
  JPEG/JFIF bytes under historical `.png` names.
- Direct image inspection reproduced the five-width responsive layout,
  invalid errors, standard summary, custom replacement and clean favicon
  Network evidence. The disclosed native full-page paint artifact remains
  preserved separately.
- The local 504-byte SVG hash is
  `a915c01d166d693ace0e3ecb6cb5f28bbb0b53a05a073d9dd004beffba59cc05`.
  It is self-contained, explicitly temporary and contains no script,
  animation, external reference, embedded product data or internal field.

### Regression, documentation and protected scope

- Frozen Node `24.18.0` and npm `11.16.0`: full Vitest
  `35 files / 404 tests`, ESLint, TypeScript and Next `16.2.11` production
  build PASS.
- Build routes remain `/`, `/_not-found`, `/icon.svg`, `/integration/cms`,
  `/products` and `/products/fgd-x15-pvc`. CMS integration, ProductList and
  Product Detail production smokes PASS; the latter two remain final 404 with
  zero CMS requests.
- CMS and ProductCard verifiers pass `16/2/2` and `8/3/6` respectively.
- Product Configuration snapshot, QuoteLine tree and CMS plugin reproduce
  exact `7`, `10` and `76` file inventories and aggregates
  `df7391c6...1499f`, `5bb1382d...bf6f` and `ded3f93e...e098`.
- ProductCard/ProductList reproduces the exact 16-file aggregate
  `4c97f6d...60f2` and has zero baseline diff. Package, lockfile, next-env and
  protected image hashes reproduce exactly; the protected Git diff is empty.
- Root/frontend README and the frontend contract truthfully describe the
  local-only current slice, production 404 and deferred Basket, 30-day
  persistence, submission and Feishu boundaries.
- `git diff --check`, project validation, message validation and strict lane
  audit PASS with zero issues. No temporary server-only build root, Python
  bytecode or reviewer probe file remains.

## Round 1 Review Boundary (Historical)

Only this canonical report, the adversarial reviewer worklog and one linked
controlled response are reviewer writes. No product, test, README, task
authority, Planner state, CMS, database, dependency, visual-evidence byte,
Git state, deployment or external system was repaired or modified by the
reviewer. Planner final validation is blocked until the P1 receives a narrow
revision, fresh validation and a new controlled independent review.

## Round 2 Final Review

### Verdict and historical preservation

`PASS / P0=0 / P1=0 / P2=0`.

- Round 1 remains historical `FAIL / P0=0 / P1=1 / P2=0`, including its exact
  two numeric reproductions, impact and bounded revision.
- The historical Planner implementation checkpoint remains
  `FAIL / P0=0 / P1=2 / P2=0`; Visual Round 1 remains
  `BLOCKED_NO_KEYBOARD_EXECUTION_EVIDENCE`; Keyboard Recovery remains
  `FAIL / severe=0 / obvious=0 / detail=1`; current Visual Round 2 remains
  `PASS / severe=0 / obvious=0 / detail=0`.
- No Round 1 or visual result is rewritten as a current product or acceptance
  claim.

### P1 closure and independent attack matrix

The production builder now accepts only canonical positive digit strings with
zero or one decimal digit, converts that syntax to integer tenths, requires a
positive safe integer, divides by ten and then requires multiplication by ten
to reproduce the same scaled value. It does not use an unchecked production
assertion or alter either frozen authority.

An independent direct probe of the real production builder under Node
`24.18.0` reproduced:

- `9999999999999999.9` returns exactly the frozen failure shape with one
  `customLength` invalid error; it no longer rounds to a successful line;
- a 400-digit positive integer followed by `.9` returns the same closed error;
  it no longer returns `Infinity`;
- both result objects, their error arrays and their individual errors are
  frozen, and no payload, Schema, CMS or endpoint detail is exposed;
- non-canonical whitespace, newline, sign, leading-zero, zero, trailing-dot,
  missing-whole and two-decimal probes are rejected without conversion to a
  success.

The exact scaled boundary also passes the requested challenge:

- `900719925474099.1` maps to scaled tenths `9007199254740991`, remains finite,
  passes the unchanged QuoteLine Schema, and has the identical value and
  scaled tenths after JSON serialization and parsing;
- `900719925474099.2` is rejected because its scaled representation is not a
  safe integer;
- `0.1`, `0.9`, `1`, `5.7`, `5.8`, `99999999999999.9` and the largest accepted
  integer form all retain the input tenths, remain finite, pass Schema before
  and after JSON round-trip and preserve frozen output objects.

There is therefore no remaining false success for the two prior attacks or
the challenged safe/exact boundary.

### Ordinary success and direct semantics

- Focused builder execution passes `1 file / 13 tests`.
- Ordinary custom `5.8` remains exactly `5.8`, with `articleNumber: null`,
  `resolution: sales_follow_up`, the real Ivory White DTO color and a deeply
  frozen Schema-valid QuoteLine.
- Standard success remains the real `GDHEPRD000172 / 6 m / Ivory White`
  selection and passes the unchanged QuoteLine Schema.
- The full `35 files / 406 tests` run preserves product identity, installation,
  base packaging, Logo, protection, safe quantity, presentation and one latest
  in-memory replacement semantics.

### Protected scope and current-byte regressions

- All three current verifiers independently pass `16/2/2`, `8/3/6` and
  `4/1/6`; ESLint, TypeScript and the Next `16.2.11` production build pass.
- Build routes remain the same static root, not-found and icon plus the three
  existing dynamic integration, list and detail routes. CMS integration,
  ProductList and Product Detail production smokes pass with their existing
  request-count and production fail-closed behavior.
- Product Configuration, QuoteLine and CMS inventories reproduce exactly
  `7`, `10` and `76` files with aggregates `df7391c6...1499f`,
  `5bb1382d...bf6f` and `ded3f93e...e098`. ProductCard and ProductList reproduce
  `16` files and `4c97f6d...60f2`; their baseline diff is empty.
- Package, lockfile, production `next-env.d.ts`, protected product image and
  local icon reproduce their frozen hashes. The protected baseline diff is
  empty.
- The visual checksum inventory passes all `20/20` existing files without
  changing their names, bytes or historical outcomes.
- The controlled frontend response and diff summary limit the revision to the
  production builder, its direct builder test and lane evidence. Independent
  full regression, protected hashes and baseline diff show no Transport,
  Validator, Adapter, loader, DTO, UI, CSS, Product Detail, ProductCard,
  ProductList, CMS, dependency, README, documentation or visual regression.
- `git diff --check`, project validation, message validation and strict lane
  audit pass with zero issues. No Python bytecode, reviewer probe or port 3000
  listener remains.

### Round 2 boundary

This Round 2 wrote only this canonical report, the adversarial reviewer lane
record and one linked controlled response. It did not repair product or test
code, update documentation or Planner authority, touch CMS, database, visual
bytes, dependencies, Git, deployment or an external system. The final PASS
permits only fresh Planner final validation after response acknowledgement.
