# TASK-021 Adversarial Review Report

Verdict: PASS

review_round: `Round 2 final`
reviewed_at: `2026-08-04T18:20:59Z`
reviewer_lane: `adversarial_reviewer`
request: `MSG-TASK-021-ADVERSARIAL-REVIEW-R2`
verdict: `PASS`
P0: `0`
P1: `0`
P2: `0`
planner_final_validation_allowed: `YES_AFTER_RESPONSE_ACK`
historical_visual_round_1: `FAIL / severe=1 / obvious=1 / detail=1`
historical_frontend_visual_revision_checkpoint: `PASS`
current_visual_round_2: `PASS / severe=0 / obvious=0 / detail=0`
historical_planner_pre_review_checkpoint: `PASS`

## Current Outcome

`PASS / P0=0 / P1=0 / P2=0`.

Round 2 independently closes both Round 1 P1 findings and the one P2 finding
against current bytes. Exact one-tenth validation is consistent through the
CMS/Python and frontend production roots; the user-selected PublicQuoteDraft
authority is truthful from requirements through production and browser bytes;
and the final CMS handoff is an exact literal `20/20` bound to the two frozen
frontend authority hashes.

Round 1 remains preserved below as historical `FAIL / P0=0 / P1=2 / P2=1`.
This PASS permits only fresh Planner final validation after acknowledgement of
the linked response. It is not user acceptance or authorization for repair,
Git delivery, deployment, external writes or deferred features.

# Round 1 History

## Historical Round 1 Outcome

`FAIL / P0=0 / P1=2 / P2=1`.

The current one-option local candidate and all existing automated tests pass,
but two core contract paths do not satisfy the confirmed TASK-021 authority.
First, the Product Configuration v2 runtime validator rejects legitimate
one-decimal standard lengths such as `4.3` and `5.8` even though WordPress and
the Schema contract intend to accept them. Second, the visible Add to Quote
path stores a customer-facing `PublicQuoteDraft`, not a QuoteLine `2.0.0`;
the complete QuoteLine v2 builder is unused by production code. A separate P2
records that the current CMS v2 handoff checksum claim is only `19/20`, not
the reported `20/20`.

Planner final validation is not allowed. The task remains unaccepted and this
review authorizes no product repair, acceptance, Git delivery, deployment or
deferred feature.

## Findings

### P1-1 — Product Configuration v2 rejects legitimate one-decimal standard lengths

The confirmed contract requires standard lengths to be dynamically projected
from complete eligible Article Number records. The authority explicitly uses
`4.3 m` as a future real-data example and requires positive one-decimal-exact
lengths; it does not restrict standard lengths to integers.

The current boundaries disagree:

- the Article Number option Schema declares `lengthMeters` as a positive
  number with `multipleOf: 0.1`;
- WordPress accepts a finite positive value when multiplying by ten is within
  the stated tolerance of an integer;
- the frontend v2 registry constructs Ajv in strict mode without
  `multipleOfPrecision`, so ordinary binary floating-point representations
  are tested with exact remainder arithmetic;
- the Python evidence validator also parses both Schema and payload decimals
  as binary floats.

Relevant current bytes are
`frontend/src/lib/cms/server/product-configurations-v2/validation-registry.ts:10`,
`frontend/src/lib/cms/product-configuration-v2-contract/schemas/article-number-option.v1.schema.json:13`,
and `cms/wp-content/plugins/gdhe-site/includes/product-configurations.php:28`.

An independent Node `24.18.0` probe used the exact four imported Schemas and
the exact Ajv options from production, then changed only the sole Golden
option length. Results were:

```json
{"lengthMeters":4.3,"valid":false,"message":"must be multiple of 0.1"}
{"lengthMeters":5.8,"valid":false,"message":"must be multiple of 0.1"}
{"lengthMeters":6,"valid":true}
{"lengthMeters":6.7,"valid":true}
```

The exact no-write Python Draft 2020-12 reproduction likewise returned false
for `4.3` and `5.8`, true for `6`, and false for the intended negative `6.05`.
This is not a fabricated public option: it proves that once a legitimate real
`4.3` or `5.8` Article Number record is published, the server consumer rejects
the whole configuration and the page falls back to configuration unavailable.
The current integer-only Golden hides the defect.

Smallest bounded revision:

1. configure the v2 Ajv registry with an explicit decimal precision suitable
   for one-tenth contract values;
2. make the Python Schema evidence consume JSON decimals exactly, or apply an
   equivalent explicit exact-tenths validation rather than binary-float
   remainder behavior;
3. add full-root positive payload tests for at least `4.3`, `5.8` and `6.7`,
   plus the existing malformed `6.05` negative, through the real Validator and
   Adapter;
4. preserve every frozen Schema byte and re-run the CMS/frontend handoff,
   current-option, ambiguity and protected-regression gates.

### P1-2 — Add to Quote does not create the confirmed QuoteLine 2.0.0

The confirmed Requirements state that Add to Quote replaces one latest
in-memory QuoteLine and that custom selection has `articleNumber: null` plus
`resolution: sales_follow_up`. The Design states that the builder receives the
selected option through an internal seam and that QuoteLine v2 retains the
resolved Article Number or custom-length variant. The current frontend README
still says the form creates one latest in-memory QuoteLine `2.0.0`.

The production path instead does the following:

- `frontend/src/components/product-configurator/index.tsx:18` declares
  `latestLine` as `PublicQuoteDraft`;
- the actual submit path at line 24 calls
  `buildPublicProductConfiguratorDraft`;
- `frontend/src/lib/product-configuration/v2/build-public-draft.ts:135`
  returns a customer-label draft with no contract version, stable product ID,
  Article Number, `sales_follow_up` resolution or closed QuoteLine
  configuration shape;
- the real QuoteLine v2 builder at
  `frontend/src/lib/product-configuration/v2/build-quote-line.ts:12` is
  referenced only by its own focused tests and has no production caller.

An independent call to the real public builder with the current standard
choice returned `ok: true`, but validation against the exact QuoteLine v2
Schema returned false immediately because `contractVersion` is missing. The
returned shape also uses selection type `standard` rather than
`article_number`, omits the stable product ID, and stores presentation labels
instead of the closed packaging enum values. A custom result similarly uses
type `custom` and omits both the null Article Number and
`sales_follow_up` resolution.

The Visual Round 1 security correction correctly removed Article Number and
product UUID from browser and Flight bytes, but its controlled dispatch also
changed the current result to a public draft and deferred authoritative
resolution to a future submission that is outside TASK-021. That later
Planner-owned implementation decision does not update or supersede the
user-confirmed Requirements, active-task acceptance criteria, Design or
frontend README. The repository therefore simultaneously claims a QuoteLine
v2 result and delivers a non-QuoteLine draft.

Smallest bounded revision requires one explicit authority decision before
code changes:

1. if the intended TASK-021 result is the current browser-only public draft,
   obtain user confirmation and revise the confirmed Requirements, Design,
   active acceptance criteria, README and test names so none claim that Add to
   Quote creates QuoteLine v2 or `sales_follow_up` now; retain QuoteLine v2 as
   a future server-side contract;
2. if the confirmed QuoteLine v2 result remains required, keep Article Number
   and UUID server-only and implement a current server-owned build seam that
   creates the full line while returning only a public receipt. That changes
   the current zero-network boundary and therefore also requires explicit
   scope confirmation.

Restoring the raw internal DTO to the Client Component is not an acceptable
revision because it would reopen the closed Visual Round 1 browser-byte P1.

### P2-1 — CMS v2 handoff checksum evidence is stale after final determinism

The canonical CMS evidence and Planner checkpoint claim `20/20` exact v2
handoff checksums. A direct current-byte check returned exit `1`: nineteen
entries were `OK`, while
`TASKS/ARCHIVE/TASK-021/EVIDENCE/PRODUCT_CONFIGURATION_V2_DETERMINISM.json` failed.

```text
expected  8dbc5368889025edbbb99168cfc6e18a0848ef7545041cb7dd23032ade110380
actual    113dffa3ce32ee169db2b9753636a5f5547984fc55fec39f0f8d13373e1eb876
```

The same stale expected digest appears in the handoff manifest. The frontend
v2 verifier still passes because it pins the bytes of the stale manifest and
checksum-list files and independently rechecks selected Schema, success and
error authorities; it does not expand all twenty checksum entries against
their current sources. Current Schema and Golden parity are intact, so this
is evidence integrity P2 rather than a second source-contract P1.

Smallest bounded revision: after the final two-lifecycle determinism run,
regenerate the handoff manifest and checksum list once, refresh the frontend
authority pins that intentionally bind those files, and require a literal
current `20/20` checksum pass before fresh review. Do not rewrite determinism
history or invent fixed database IDs.

## Independently Reproduced Passing Boundaries

### CMS authority and current public facts

- Product Configuration v2 remains an additive four-Schema contract and the
  current Golden contains exactly
  `GDHEPRD000172 / 6 m / Ivory White / piece`; no `4.3 m`, `7 m`, extra color,
  installation or accessory is fabricated.
- Source inspection confirms published-product, website-eligibility, local
  test-candidate, stable UUID, model/title/path, Article Number uniqueness,
  per-product length/color uniqueness and conflicting-identity gates. Zero or
  multiple route matches return the normalized not-found path.
- Installation and accessory keys are rejected by the closed v2 source and
  Schema. Ceiling and wall mounting remain only a Product Detail capability
  fact.
- No database lifecycle was started by this reviewer. Existing evidence
  records two different database-ID rounds, identical Golden hash, cleanup
  and zero residue; the current handoff checksum P2 is reported separately.

### Frontend consumer, UI and isolation

- Current projection exposes only the single `6 m` standard choice and
  `Ivory White`, then appends sibling Custom Length. Color ordering and exact
  standard choice matching remain deterministic and fail closed.
- The custom parser rejects non-canonical, non-positive, unsafe-tenths and
  precision-losing values. Ordinary `5.8` remains accepted in the public
  draft and internal QuoteLine-focused test. Quantity is a positive safe
  integer; Packaging, Logo and mutually exclusive protection presentation
  remain customer-readable.
- The Product Detail loader performs one fixed resolve request followed by
  one fixed Product Configuration `2.0.0` request. No ProductCard or per-option
  request exists. Preview performs zero network work; CMS configuration
  failure preserves only the sanitized unavailable state.
- The Client Component receives the public projection, not the internal DTO.
  Real preview-response tests and current visual evidence show no Article
  Number, product UUID, raw enum, WordPress/SCF/Feishu ID, secret, origin,
  payload or diagnostic in browser-facing bytes.
- Preview and CMS stay fixed `noindex,nofollow` local modes and production
  remains 404. No Basket, storage, RFQ submission, Feishu, related products,
  deployment or production publication was added.

### Tests, contracts, visual history and protected scope

- Node `24.18.0` and npm `11.16.0`: the selected TASK-021 matrix passes
  `8 files / 31 tests`; the full current suite passes
  `40 files / 420 tests`.
- All five frontend verifiers pass: CMS `16/2/2`, ProductCard `8/3/6`, Product
  Configuration v1 `4/1/6`, Product Configuration v2 `4/1/6`, and QuoteLine
  v2 six-file inventory. These passes do not cover either P1 or the stale
  twentieth CMS handoff entry described above.
- ESLint, TypeScript and a fresh Next `16.2.11` production build pass with the
  same six routes. The build restored the tracked production
  `next-env.d.ts`; the generated `.next` directory was removed through the
  reviewer workspace and no port-3000 listener remains.
- All eight Product Configuration v1 and QuoteLine v1 hashes equal the frozen
  baseline. Package, lockfile and protected product image hashes remain
  `958e8c89...2bce`, `dda25a90...52a7` and `9a8ed9fe...880` respectively.
- `QA/TASK-021/EVIDENCE_INVENTORY.sha256` passes `23/23`. Direct file
  inspection agrees with the disclosure: the five Round 1 full-page files are
  real PNG, the browser-control Round 1 files and all thirteen Round 2 files
  are JPEG/JFIF bytes under their historical `.png` names.
- Visual Round 1 remains historical
  `FAIL / severe=1 / obvious=1 / detail=1`; the narrow frontend correction
  remains PASS; Visual Round 2 remains current
  `PASS / severe=0 / obvious=0 / detail=0`. None is overwritten by this
  adversarial FAIL.
- Package/lock, frozen v1 authorities, ProductCard/ProductList, protected
  media, deferred features and external systems show no TASK-021 scope
  expansion. `git diff --check` passes.

## Review Boundary and Next Gate

The reviewer wrote only this canonical report, its own lane records and the
single controlled response. It did not repair frontend, CMS, tests, README,
task/Planner authority or visual evidence; it did not modify database or an
external system, accept the task, use Git delivery, deploy or start related
products/Basket/Feishu work.

Planner must acknowledge the linked FAIL response, record governed recovery,
and obtain the P1-2 authority decision before authorizing a narrow revision.
Only both P1s, the handoff P2, direct regressions and fresh evidence belong in
any next review round.

# Round 2 Final Review

## Scope and method

The reviewer acknowledged `MSG-TASK-021-ADVERSARIAL-REVIEW-R2` before
substantive work and reviewed only the three Round 1 findings plus direct
regressions. Business deliverables, Planner-owned state, CMS/database content,
visual bytes and external systems remained read-only. No acceptance, Git or
deployment action was performed.

## P1-1 closure — exact one-tenth validation is consistent

The current CMS/Python validator parses both the four-Schema graph and payload
JSON numbers with `Decimal`. A no-write import of that current validator and
the complete current Golden independently produced:

```text
4.3  valid
5.8  valid
6.7  valid
6.05 invalid: not a multiple of 0.1
```

The graph closed over exactly
`article-number-option.v1.schema.json`,
`product-configuration.v2.schema.json`, `public-path.schema.json` and
`uuid-v4.schema.json`. No evidence file or database lifecycle was generated by
the reviewer.

Frontend production Ajv remains strict, non-coercing and non-mutating, with
the narrow `multipleOfPrecision: 12` option. The real production root through
Validator and Adapter passed `4.3`, `5.8` and `6.7`, and returned the stable
`invalid_success_payload` error for `6.05`. An additional exact-option probe
also rejected `4.3000000000001`, `4.300000000001` and
`4.30000000001`, so the correction did not create a reproduced extra-precision
acceptance seam.

All four frontend Schema snapshots are byte-identical to their CMS sources.
The frozen/current hashes remain:

- Article Number option Schema:
  `c9da8e10de98c9bc3eb1cb2775afdc81e4b05ef9b397b75b2c1c234a7b91381e`;
- Product Configuration v2 root Schema:
  `90285bab8483304aa2609f2b31f77ad54ab48732e6979ad8d5616b619e127472`;
- public path Schema:
  `9f4951888329bd7d989251188e23ef475d6975bedfe1c187d5676feab3c823ce`;
- UUID Schema:
  `59dbd4173aa8f63ab09b25239b4b8181b394a87de4fb6cdb462ddbdeedbaa1cb`;
- success Golden:
  `014e242585b6eb15ac563ee8dd3efee72ed4b325ac371f1177542ef7dfbfec53`;
- error and runtime evidence:
  `e5aba50f7560ab89cc3ffcb56458c398ed05fd58026467e4ce20347fa84a2046`
  and
  `12a0aaeb08643e54cc8f2e9b2403bd446e3d4dc416bfa58dc0b6955a31a9c1e9`.

The final handoff expands those sources successfully, including unchanged
Schema, Golden, error, runtime, API/PHP and Fixture business bytes. P1-1 is
closed.

## P1-2 closure — PublicQuoteDraft is the truthful current authority

The explicit user decision now agrees with Requirements, Design, active
acceptance criteria, implementation plan, root/frontend README and the
frontend contract document:

- visible Add to Quote replaces one latest browser-memory
  `PublicQuoteDraft`;
- refresh clears it, and TASK-021 adds no network, storage, persistence,
  submission, Basket or Feishu seam;
- the draft contains customer-readable model, public path, standard/custom
  length, color, packaging labels and quantity, but excludes Article Number,
  stable internal product UUID and internal resolution values;
- QuoteLine `2.0.0` remains only a future server-side conversion authority.

Production result state and rendering use only `latestDraft`,
`PublicQuoteDraft` and `LatestPublicQuoteDraftSummary`. There is no production
`latestLine` or `LatestQuoteLineSummary`. The complete v2 QuoteLine builder has
no caller anywhere else in `frontend/src`; no conversion route was fabricated.
The public-draft builder and component tree contain no browser fetch, XHR,
storage, IndexedDB or beacon seam.

The direct interaction tests independently preserved one-latest replacement
and invalid-submission retention. The real current Next preview response
passed `1/1` and contains the visible configurator while excluding the Article
Number, stable UUID, `articleNumber`, product kind/policy, raw packaging and
`sales_follow_up` enums, WordPress, Feishu, secret and diagnostic markers from
HTML and Flight bytes. The Product Configurator stylesheet is unchanged at
`7d514d5fa4920c08a4e6849f6a7b8b3b2f8b656f65f77305c0f1cb84aee16407`.
P1-2 is closed.

## P2-1 closure — final authority is exact literal 20/20

Independent current-byte SHA-256 checks produced exactly:

```text
11f3db81c1b962c387f731d9c171d2f370ba60bdc3391cc10ec991247120ac09  PRODUCT_CONFIGURATION_V2_HANDOFF_MANIFEST.json
fe611983112944edcf214d88a9aefac6cc4fa4b9258f07670870414a919204ca  PRODUCT_CONFIGURATION_V2_HANDOFF_CHECKSUMS.sha256
c4e88b48d4e02d79bf1e5d5abdb55f2c564d5757305d03f806ad96032b39b7f5  PRODUCT_CONFIGURATION_V2_DETERMINISM.json
```

The checksum stream contains exactly twenty entries. Direct SHA verification
passed all twenty, and a separate manifest expansion proved the manifest and
stream have the same twenty paths and digests and that all twenty current
source bytes match. The frontend snapshot manifest and executable verifier
both pin only the final manifest and checksum-stream hashes above; the four
Schema sources, success Golden and selected error authority also pass exact
source/snapshot parity.

The intermediate handoff and Round 1 stale-digest evidence remains preserved
in its original reports and in the Round 1 history above; it is not presented
as current authority. P2-1 is closed.

## Direct regression, visual and protected-scope results

- Frozen Node `24.18.0` and npm `11.16.0`: direct closure matrix
  `4 files / 14 tests` PASS; real preview response `1/1` PASS; full Vitest
  `40 files / 422 tests` PASS.
- Five contract verifiers PASS: CMS `16/2/2`, ProductCard `8/3/6`, Product
  Configuration v1 `4/1/6`, Product Configuration v2 and QuoteLine v2.
- ESLint, TypeScript, two final Next `16.2.11` production builds and CMS
  integration, ProductList and Product Detail production smokes PASS with the
  same six routes.
- All eight Product Configuration v1 and QuoteLine v1 frozen hashes match the
  TASK-021 baseline. Package, lockfile, production `next-env.d.ts` and protected
  product image remain
  `958e8c89...2bce`, `dda25a90...52a7`, `7b550dda...2651` and
  `9a8ed9fe...4880` respectively.
- Visual Round 1 remains
  `FAIL / severe=1 / obvious=1 / detail=1`; the narrow frontend revision
  checkpoint remains PASS; Visual Round 2 remains
  `PASS / severe=0 / obvious=0 / detail=0`. The visual evidence inventory
  passes all `23/23` current hashes.
- No reviewer probe, Python bytecode, `.next`, task temporary root or port-3000
  listener remains. Project, controlled-message and strict lane validation,
  plus `git diff --check`, pass.

## Final verdict and gate

`PASS / P0=0 / P1=0 / P2=0`.

Planner final validation is allowed only after the single linked Round 2
response is acknowledged. This result is not user acceptance and does not
authorize product/CMS repair, database or external-system mutation, Git,
deployment, Basket, persistence, submission, Feishu or related-product work.
